/**
 * @file ui-student.js
 * @description 수강생 화면(index.html) 전용 UI 핸들러 (과제 선택 및 분석 연동)
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log("UI Student Controller Initializing...");

    // UI Elements
    const videoPreview = document.getElementById('webcam-preview');
    const btnStartRec = document.getElementById('btn-start-rec');
    const btnStopRec = document.getElementById('btn-stop-rec');
    const recStatus = document.getElementById('recording-status');
    const startPrompt = document.getElementById('start-prompt');
    const analysisSection = document.getElementById('analysis-section');
    const analysisProgress = document.getElementById('analysis-progress');
    const analysisStep = document.getElementById('analysis-step');
    const resultPreview = document.getElementById('result-preview');

    // 0. 초기 화면 버튼 주입 (카메라 켜기 / 샘플 테스트)
    function renderStartPrompt() {
        const promptButtons = document.querySelector('#start-prompt .space-y-3');
        if (promptButtons) {
            promptButtons.innerHTML = `
                <button id="btn-start-camera" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl transition-all flex items-center justify-center gap-2">
                    <i data-lucide="camera" class="w-5 h-5"></i> 카메라 켜기
                </button>
                <button id="btn-sample-demo" class="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-3 px-8 rounded-xl transition-all flex items-center justify-center gap-2">
                    <i data-lucide="play-circle" class="w-5 h-5"></i> 샘플 영상으로 테스트 (정밀 분석)
                </button>
            `;
            if (window.lucide) lucide.createIcons();
        }
    }

    renderStartPrompt();

    const tabRecord = document.getElementById('tab-record');
    const tabUpload = document.getElementById('tab-upload');
    const recordContent = document.getElementById('record-content');
    const uploadContent = document.getElementById('upload-content');
    const recordControls = document.getElementById('record-controls');
    const fileInput = document.getElementById('file-input');

    const bigDataAlert = document.getElementById('big-data-alert');
    const scriptText = document.querySelector('#recording-section + section p');
    const scriptTitle = document.querySelector('#recording-section + section h3');

    // --- 커리큘럼 라이브러리 연동 ---
    let selectedScenario = null;
    const scenarios = window.SpeechStore.getScenarios();

    // 1. 과제 선택기 (상단 공통 영역에 삽입)
    function refreshScenarioSelector() {
        const scenarios = window.SpeechStore.getScenarios();
        const selectorContainer = document.getElementById('scenario-selector-container');
        if (selectorContainer) {
            selectorContainer.innerHTML = `
                <div class="flex flex-col gap-2">
                    <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">연습 과제 선택 (강사 등록 예시)</label>
                    <select id="scenario-selector" class="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer">
                        ${scenarios.map(s => `<option value="${s.id}" ${selectedScenario?.id === s.id ? 'selected' : ''}>${s.title}</option>`).join('')}
                    </select>
                </div>
            `;
            
            // 이벤트 다시 바인딩
            document.getElementById('scenario-selector')?.addEventListener('change', (e) => {
                const scenarios = window.SpeechStore.getScenarios();
                selectedScenario = scenarios.find(s => s.id === e.target.value);
                console.log("Selected Scenario:", selectedScenario.title);
                updateScriptUI();
                checkBigDataAlert();
            });
        }
        
        // 데이터가 아예 없을 때를 대비한 기본 선택
        if (!selectedScenario && scenarios.length > 0) {
            selectedScenario = scenarios[0];
            updateScriptUI();
            checkBigDataAlert();
        }
    }

    // 초기 실행
    refreshScenarioSelector();

    function updateScriptUI() {
        if (!selectedScenario) return;
        if (scriptTitle) scriptTitle.innerText = `연습 과제: ${selectedScenario.title}`;
        if (scriptText) scriptText.innerText = `"${selectedScenario.script}"`;
    }

    async function checkBigDataAlert() {
        if (!window.SpeechStore || !selectedScenario) return;
        const patterns = await window.SpeechStore.getRiskPatterns();
        const hasRisk = patterns.some(p => p.questionId === selectedScenario.id);
        if (hasRisk) {
            bigDataAlert?.classList.remove('hidden');
            bigDataAlert?.classList.add('flex');
        } else {
            bigDataAlert?.classList.add('hidden');
            bigDataAlert?.classList.remove('flex');
        }
    }

    // --- 탭 전환 로직 (과제 선택창은 유지됨) ---
    tabRecord?.addEventListener('click', () => {
        tabRecord.className = 'flex-1 py-3 text-sm font-bold bg-slate-700 text-white border-b-2 border-blue-500';
        tabUpload.className = 'flex-1 py-3 text-sm font-bold text-slate-400 hover:text-white transition';
        recordContent.classList.remove('hidden');
        uploadContent.classList.add('hidden');
        recordControls.classList.remove('hidden');
    });

    tabUpload?.addEventListener('click', () => {
        tabUpload.className = 'flex-1 py-3 text-sm font-bold bg-slate-700 text-white border-b-2 border-blue-500';
        tabRecord.className = 'flex-1 py-3 text-sm font-bold text-slate-400 hover:text-white transition';
        recordContent.classList.add('hidden');
        uploadContent.classList.remove('hidden');
        recordControls.classList.add('hidden');
    });

    // --- 카메라/녹화/업로드 이벤트 ---
    document.addEventListener('click', async (e) => {
        const startCamBtn = e.target.closest('#btn-start-camera');
        const sampleDemoBtn = e.target.closest('#btn-sample-demo');

        if (startCamBtn) {
            await window.SpeechApp.startPreview(videoPreview);
            startPrompt.classList.add('hidden');
            btnStartRec.classList.remove('hidden');
            btnStartRec.disabled = false;
        }
        if (sampleDemoBtn) {
            if (confirm(`[${selectedScenario.title}] 과제의 샘플 영상으로 분석을 시작할까요?`)) {
                await startAnalysis(null, true);
            }
        }
    });

    uploadContent?.addEventListener('click', () => fileInput.click());
    fileInput?.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleFileUpload(e.target.files[0]);
    });

    btnStartRec?.addEventListener('click', () => {
        window.SpeechApp.startRecording();
        btnStartRec.classList.add('hidden');
        btnStopRec.classList.remove('hidden');
        recStatus.classList.remove('hidden');
    });

    btnStopRec?.addEventListener('click', async () => {
        recStatus.classList.add('hidden');
        btnStopRec.classList.add('hidden');
        const videoBlob = await window.SpeechApp.stopRecording();
        await startAnalysis(videoBlob);
    });

    async function handleFileUpload(file) {
        await startAnalysis(file);
    }

    async function startAnalysis(dataBlob, isSample = false) {
        analysisSection.classList.remove('hidden');
        try {
            const inputData = isSample ? { duration: 12 } : dataBlob;
            const result = await window.SpeechApp.runAIAnalysis(inputData, (msg, progress) => {
                analysisStep.innerText = msg;
                analysisProgress.style.width = progress + '%';
            });

            await window.SpeechApp.commitResult('STUDENT_001', selectedScenario.id, {
                ...result,
                questionTitle: selectedScenario.title,
                cohort: '1'
            });
            
            localStorage.setItem('last_update', Date.now());
            analysisSection.classList.add('hidden');
            showResult(result);
        } catch (err) {
            console.error("Analysis Error:", err);
            analysisSection.classList.add('hidden');
            alert(err.message || "분석 중 오류가 발생했습니다.");
        }
    }

    function showResult(result) {
        resultPreview.classList.remove('hidden');
        document.getElementById('recording-section').classList.add('hidden');
        document.getElementById('result-score').innerText = result.score;
        document.getElementById('metric-pron').innerText = result.metrics.pronunciation + '%';
        document.getElementById('metric-speed').innerText = result.metrics.speed + '점';
        document.getElementById('metric-attitude').innerText = result.metrics.attitude + '점';
        document.getElementById('feedback-text').innerText = `"${result.feedback}"`;
        
        const mistakeList = document.getElementById('mistake-list');
        mistakeList.innerHTML = '';
        if (result.mistakes && result.mistakes.length > 0) {
            result.mistakes.forEach(m => {
                const item = document.createElement('div');
                item.className = 'flex items-center gap-3 bg-slate-900/30 p-3 rounded-lg border border-slate-700/50';
                item.innerHTML = `
                    <span class="text-blue-500 font-mono text-xs bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">${m.timestamp}s</span>
                    <span class="text-slate-300 text-sm"><strong class="text-white text-xs mr-2">[${m.type}]</strong> ${m.detail}</span>
                `;
                mistakeList.appendChild(item);
            });
        }
        if (window.lucide) lucide.createIcons();
    }

    window.addEventListener('storage', (e) => {
        if (e.key === 'last_scenario_update') {
            console.log("Teacher updated scenarios, refreshing selector...");
            refreshScenarioSelector();
        }
    });

    if (window.lucide) lucide.createIcons();
});
