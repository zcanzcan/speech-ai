/**
 * @file ui-admin.js
 * @description 강사 대시보드 전용 UI 핸들러 (상세 리포트 모달 기능 포함)
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log("Admin Dashboard Controller Initializing...");
    let growthChart = null;
    let currentCohort = 'ALL';
    let isEditing = false;

    if (window.lucide) lucide.createIcons();

    // 모달 엘리먼트
    const modal = document.getElementById('report-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const btnModalOk = document.getElementById('btn-modal-ok');

    // 과제 관리 폼 엘리먼트
    const scnForm = document.getElementById('scenario-mgmt-form');
    const btnCloseScenario = document.getElementById('btn-close-scenario');
    const btnCancelEdit = document.getElementById('btn-cancel-edit');

    const openReportModal = (log) => {
        if (!log) return;
        document.getElementById('modal-student-id').innerText = log.studentId;
        document.getElementById('modal-scenario-title').innerText = log.questionTitle || '일반 연습';
        document.getElementById('modal-score').innerText = log.score;
        document.getElementById('modal-metric-pron').innerText = (log.metrics?.pronunciation || 0) + '%';
        document.getElementById('modal-metric-speed').innerText = (log.metrics?.speed || 0) + '점';
        document.getElementById('modal-metric-attitude').innerText = (log.metrics?.attitude || 0) + '점';
        document.getElementById('modal-feedback').innerText = `"${log.feedback || '진단 정보가 없습니다.'}"`;

        // 썸네일/미리보기 영역 추가
        const previewArea = document.getElementById('modal-video-preview');
        if (previewArea) {
            if (log.thumbnail) {
                previewArea.innerHTML = `<img src="${log.thumbnail}" class="w-full h-full object-cover rounded-2xl" alt="분석 영상 썸네일">`;
            } else {
                previewArea.innerHTML = `<div class="w-full h-full bg-slate-100 flex items-center justify-center rounded-2xl text-slate-300"><i data-lucide="video-off" class="w-12 h-12"></i></div>`;
            }
        }

        const mistakeList = document.getElementById('modal-mistake-list');
        mistakeList.innerHTML = '';
        if (log.mistakes && log.mistakes.length > 0) {
            log.mistakes.forEach(m => {
                const item = document.createElement('div');
                item.className = 'flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm';
                item.innerHTML = `
                    <span class="text-blue-600 font-mono text-[10px] bg-blue-50 px-2 py-1 rounded-md font-bold border border-blue-100">${m.timestamp}s</span>
                    <span class="text-slate-600 text-[11px]"><strong class="text-slate-800">[${m.type}]</strong> ${m.detail}</span>
                `;
                mistakeList.appendChild(item);
            });
        } else {
            mistakeList.innerHTML = '<p class="text-slate-400 text-[11px] italic p-4 text-center">감지된 특이 사항이 없습니다.</p>';
        }

        modal.classList.remove('hidden');
        if (window.lucide) lucide.createIcons();
    };

    const closeModal = () => modal.classList.add('hidden');
    btnCloseModal?.addEventListener('click', closeModal);
    btnModalOk?.addEventListener('click', closeModal);
    modal?.addEventListener('click', (e) => { if(e.target === modal) closeModal(); });

    function refreshScenarioList() {
        const scenarioList = document.getElementById('current-scenario-list');
        if (!scenarioList || !window.SpeechStore) return;
        const scenarios = window.SpeechStore.getScenarios();
        scenarioList.innerHTML = scenarios.map(s => `
            <div class="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-lg group">
                <div class="flex-1"><div class="text-xs font-bold text-slate-700">${s.title}</div><div class="text-[9px] text-slate-400 truncate max-w-[200px]">${s.script}</div></div>
                <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button onclick="window.editScenario('${s.id}')" class="text-slate-400 hover:text-blue-500"><i data-lucide="edit-2" class="w-3.5 h-3.5"></i></button>
                    <button onclick="window.deleteScenario('${s.id}')" class="text-slate-400 hover:text-red-500"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
                </div>
            </div>
        `).join('');
        if (window.lucide) lucide.createIcons();
    }

    window.editScenario = (id) => {
        const scenarios = window.SpeechStore.getScenarios();
        const scn = scenarios.find(s => s.id === id);
        if (!scn) return;
        document.getElementById('edit-scn-id').value = scn.id;
        document.getElementById('new-scn-title').value = scn.title;
        document.getElementById('new-scn-script').value = scn.script;
        document.getElementById('scn-form-title').innerText = "과제 내용 수정";
        document.getElementById('btn-add-scenario').innerText = "수정 내용 저장";
        document.getElementById('btn-cancel-edit').classList.remove('hidden');
        isEditing = true;
        document.getElementById('new-scn-title').focus();
    };

    window.deleteScenario = (id) => {
        if (confirm('이 과제를 삭제할까요?')) {
            window.SpeechStore.deleteScenario(id);
            refreshScenarioList();
        }
    };

    async function refreshDashboard() {
        try {
            if (!window.SpeechStore) return;
            const stats = await window.SpeechStore.getGlobalStats();
            document.getElementById('stat-avg-score').innerText = stats.avgScore || 0;
            document.getElementById('stat-total-count').innerText = stats.totalCount || 0;
            updateCohortStats(stats.logs || []);
            updateRiskPatternsUI(stats.riskPatterns || []);
            updateRecentLogsTable(stats.logs || []);
            
            const targetId = stats.logs?.[0]?.studentId || 'STUDENT_001';
            const growthData = await window.SpeechStore.getStudentGrowth(targetId);
            updateChart(growthData || []);
        } catch (err) { console.error(err); }
    }

    function updateCohortStats(logs) {
        let filteredLogs = logs;
        if (currentCohort !== 'ALL') filteredLogs = logs.filter(log => log.cohort === currentCohort);
        const avgEl = document.getElementById('cohort-avg-score');
        const countEl = document.getElementById('cohort-student-count');
        if (filteredLogs.length > 0) {
            const sum = filteredLogs.reduce((acc, curr) => acc + (Number(curr.score) || 0), 0);
            avgEl.innerText = (sum / filteredLogs.length).toFixed(1);
            countEl.innerText = new Set(filteredLogs.map(l => l.studentId)).size;
        } else { avgEl.innerText = '0'; countEl.innerText = '0'; }
    }

    function updateRiskPatternsUI(patterns) {
        const riskList = document.getElementById('risk-patterns-list');
        if (!riskList) return;
        riskList.innerHTML = '';
        const validPatterns = patterns.filter(p => p && p.mainType !== "undefined");
        if (validPatterns.length > 0) {
            validPatterns.forEach(p => {
                const item = document.createElement('div');
                item.className = 'flex flex-col gap-2 p-4 bg-red-50 rounded-2xl border border-red-100 animate-fade-in';
                item.innerHTML = `
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <div class="text-xs font-black text-red-600 mb-1 flex items-center gap-1"><i data-lucide="alert-circle" class="w-3 h-3"></i> ${p.time}초 구간 밀집 오류</div>
                            <div class="flex items-center gap-2 mb-1"><div class="text-sm font-bold text-slate-800">${p.mainType} 불일치</div>${p.keyword ? `<span class="bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">키워드: "${p.keyword}"</span>` : ''}</div>
                        </div>
                        <div class="text-xl font-black text-red-600">${p.ratio}%</div>
                    </div>
                    <div class="bg-white/60 p-2 rounded-lg text-[10px] text-red-700/70 italic border border-red-100/50">"${p.sampleDetail}"</div>
                `;
                riskList.appendChild(item);
            });
        } else { riskList.innerHTML = '<p class="text-sm text-slate-400 italic p-4 text-center">취약 구간 없음</p>'; }
        if (window.lucide) lucide.createIcons();
    }

    function updateRecentLogsTable(logs) {
        const tableBody = document.getElementById('recent-logs-table');
        if (!tableBody) return;
        tableBody.innerHTML = '';
        const sortedLogs = [...(logs || [])].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        if (sortedLogs.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" class="px-6 py-10 text-center text-slate-400">내역 없음</td></tr>';
            return;
        }
        sortedLogs.slice(0, 15).forEach((log, index) => {
            const row = document.createElement('tr');
            row.className = 'border-b hover:bg-slate-50 transition-all text-xs group cursor-pointer';
            row.innerHTML = `
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-8 bg-slate-100 rounded overflow-hidden flex-shrink-0 border border-slate-200">
                            ${log.thumbnail ? `<img src="${log.thumbnail}" class="w-full h-full object-cover">` : `<div class="w-full h-full flex items-center justify-center text-slate-300"><i data-lucide="video" class="w-3 h-3"></i></div>`}
                        </div>
                        <div>
                            <div class="font-bold text-slate-700">${log.studentId}</div>
                            <div class="text-[9px] text-blue-500 font-semibold">${log.cohort}기 수강생</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-slate-600 font-medium">${log.questionTitle || '일반 연습'}</div>
                    <div class="text-[9px] text-slate-400">${new Date(log.timestamp).toLocaleTimeString()}</div>
                </td>
                <td class="px-6 py-4"><span class="px-2 py-1 rounded-md bg-blue-50 text-blue-600 font-black border border-blue-100">${log.score}</span></td>
                <td class="px-6 py-4 text-right">
                    <button id="view-report-${index}" class="bg-slate-800 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-blue-600 transition-colors">상세보기</button>
                </td>
            `;
            tableBody.appendChild(row);
            document.getElementById(`view-report-${index}`).addEventListener('click', (e) => {
                e.stopPropagation();
                openReportModal(log);
            });
            row.addEventListener('click', () => openReportModal(log));
        });
        if (window.lucide) lucide.createIcons();
    }

    function updateChart(data) {
        const canvas = document.getElementById('growthChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!data || data.length === 0) {
            if (growthChart) growthChart.destroy();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }
        const labels = data.map(d => new Date(d.timestamp).toLocaleTimeString());
        const scores = data.map(d => d.score);
        if (growthChart) {
            growthChart.data.labels = labels;
            growthChart.data.datasets[0].data = scores;
            growthChart.update();
        } else {
            growthChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: '분석 점수',
                        data: scores,
                        borderColor: '#2563eb',
                        backgroundColor: 'rgba(37, 99, 235, 0.05)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 3,
                        pointRadius: 4
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, scales: { y: { min: 0, max: 100 } }, plugins: { legend: { display: false } } }
            });
        }
    }

    // 초기화 및 이벤트 바인딩
    document.getElementById('cohort-selector')?.addEventListener('change', (e) => { currentCohort = e.target.value; refreshDashboard(); });
    document.getElementById('btn-toggle-scenario-form')?.addEventListener('click', () => { 
        scnForm.classList.toggle('hidden'); 
        refreshScenarioList(); 
    });
    
    btnCloseScenario?.addEventListener('click', () => {
        scnForm.classList.add('hidden');
    });

    btnCancelEdit?.addEventListener('click', () => {
        document.getElementById('new-scn-title').value = "";
        document.getElementById('new-scn-script').value = "";
        document.getElementById('edit-scn-id').value = "";
        document.getElementById('scn-form-title').innerText = "신규 과제 등록";
        document.getElementById('btn-add-scenario').innerText = "과제 라이브러리에 저장";
        btnCancelEdit.classList.add('hidden');
        isEditing = false;
    });

    document.getElementById('btn-add-scenario')?.addEventListener('click', () => {
        const id = document.getElementById('edit-scn-id').value;
        const title = document.getElementById('new-scn-title').value;
        const script = document.getElementById('new-scn-script').value;
        if (!title || !script) return alert('제목과 내용을 모두 입력하세요.');
        if (isEditing) window.SpeechStore.updateScenario(id, title, script);
        else window.SpeechStore.addScenario(title, script);
        document.getElementById('new-scn-title').value = ""; document.getElementById('new-scn-script').value = "";
        document.getElementById('edit-scn-id').value = ""; document.getElementById('scn-form-title').innerText = "신규 과제 등록";
        document.getElementById('btn-add-scenario').innerText = "과제 라이브러리에 저장";
        document.getElementById('btn-cancel-edit').classList.add('hidden'); isEditing = false;
        refreshScenarioList(); alert('완료되었습니다.');
    });

    document.getElementById('btn-generate-sample')?.addEventListener('click', async () => {
        const scenarios = window.SpeechStore.getScenarios();
        if (!confirm('샘플 데이터 15건을 생성할까요?')) return;
        
        // 시연용 더미 썸네일 (AI 분석 중 이미지)
        const dummyThumb = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNjAiIGhlaWdodD0iOTAiIHZpZXdCb3g9IjAgMCAxNjAgOTAiPjxyZWN0IHdpZHRoPSIxNjAiIGhlaWdodD0iOTAiIGZpbGw9IiNmOGZhZmMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZmlsbD0iIzY0NzQ4YiIgZm9udC1zaXplPSIxMiIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5BSSBBbmFseXppbmcuLi48L3RleHQ+PC9zdmc+";

        const mocks = [];
        const baseTime = Date.now() - 5000000;
        for(let i=0; i<5; i++) {
            mocks.push({
                studentId: 'STUDENT_001', cohort: '1', questionId: scenarios[0].id, questionTitle: scenarios[0].title,
                score: 70 + (i * 5), metrics: { pronunciation: 75+i, speed: 80, attitude: 80+i },
                feedback: `[성장추적] ${i+1}회차 연습 결과입니다.`, 
                timestamp: new Date(baseTime + (i * 1000000)).toISOString(),
                thumbnail: dummyThumb,
                mistakes: [{ timestamp: 3, type: '발음', detail: '발음 연습 필요' }]
            });
        }
        for(let i=0; i<10; i++) {
            const scn = scenarios[Math.floor(Math.random() * scenarios.length)];
            const words = scn.script.split(' ');
            const randomWord = words[Math.floor(Math.random() * words.length)].replace(/[".]/g, '') || "핵심";
            mocks.push({
                studentId: `STUDENT_${Math.floor(Math.random()*100).toString().padStart(3, '0')}`,
                cohort: (Math.random() > 0.5 ? '1' : '2'),
                questionId: scn.id, questionTitle: scn.title,
                score: Math.floor(Math.random() * 20) + 75,
                metrics: { pronunciation: 85, speed: 80, attitude: 90 },
                feedback: `[샘플] ${scn.title} 분석 결과입니다.`, 
                timestamp: new Date().toISOString(),
                thumbnail: dummyThumb,
                mistakes: [{ timestamp: 3, type: '발음', detail: `키워드 "${randomWord}" 발음 시 조음 불명확` }]
            });
        }
        for (const m of mocks) await window.SpeechStore.saveLog(m);
        refreshDashboard();
    });

    document.getElementById('btn-clear-logs')?.addEventListener('click', () => { if (confirm('데이터를 초기화할까요?')) { localStorage.clear(); location.reload(); } });
    window.addEventListener('speech_data_updated', refreshDashboard);
    window.addEventListener('storage', (e) => { if (e.key === 'speech_ai_logs' || e.key === 'last_update') refreshDashboard(); });

    refreshDashboard(); refreshScenarioList();
});
