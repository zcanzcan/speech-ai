/**
 * @file store.js
 * @description 데이터 파이프라인 및 빅데이터 분석 로직 (Extreme Defensive Coding 적용)
 */

const DEFAULT_SCENARIOS = [
    { id: 'SCN_001', title: '아나운서 뉴스 브리핑', script: '안녕하십니까. 오늘 전해드릴 소식은 우리 사회의 변화와 기술의 혁신이 가져올 새로운 미래에 대한 이야기입니다.', type: 'Announcer' },
    { id: 'SCN_002', title: 'IT 컨퍼런스 키노트', script: '우리는 오늘 새로운 시대를 여는 혁신적인 솔루션을 소개하고자 합니다. 이 기술이 가져올 변화는 우리의 상상을 뛰어넘을 것입니다.', type: 'Speech' },
    { id: 'SCN_003', title: 'CEO 스타트업 피칭', script: '우리는 전 세계 사람들이 더 나은 미래를 꿈꿀 수 있도록 가장 혁신적인 플랫폼을 만들고 있습니다. 오늘 그 비전을 공유하고자 합니다.', type: 'Speech' }
];

const STORAGE_KEY = 'speech_ai_logs';
const RISK_PATTERN_KEY = 'high_risk_patterns';
const SCENARIO_KEY = 'speech_practice_scenarios';

const Store = {
    getScenarios: () => {
        try {
            const saved = localStorage.getItem(SCENARIO_KEY);
            if (!saved) {
                localStorage.setItem(SCENARIO_KEY, JSON.stringify(DEFAULT_SCENARIOS));
                return DEFAULT_SCENARIOS;
            }
            return JSON.parse(saved);
        } catch(e) { return DEFAULT_SCENARIOS; }
    },

    addScenario: (title, script) => {
        const scenarios = Store.getScenarios();
        const newScn = { id: 'SCN_' + Date.now(), title: title || "제목 없음", script: script || "내용 없음", type: 'Custom' };
        scenarios.push(newScn);
        localStorage.setItem(SCENARIO_KEY, JSON.stringify(scenarios));
        window.dispatchEvent(new CustomEvent('scenarios_updated'));
        localStorage.setItem('last_scenario_update', Date.now());
        return newScn;
    },

    updateScenario: (id, title, script) => {
        let scenarios = Store.getScenarios();
        const index = scenarios.findIndex(s => s.id === id);
        if (index !== -1) {
            scenarios[index] = { ...scenarios[index], title: title || "제목 없음", script: script || "내용 없음" };
            localStorage.setItem(SCENARIO_KEY, JSON.stringify(scenarios));
            window.dispatchEvent(new CustomEvent('scenarios_updated'));
            localStorage.setItem('last_scenario_update', Date.now());
            return scenarios[index];
        }
        return null;
    },

    deleteScenario: (id) => {
        let scenarios = Store.getScenarios();
        scenarios = scenarios.filter(s => s.id !== id);
        localStorage.setItem(SCENARIO_KEY, JSON.stringify(scenarios));
        window.dispatchEvent(new CustomEvent('scenarios_updated'));
        localStorage.setItem('last_scenario_update', Date.now());
    },

    getLogs: async () => {
        try {
            const logs = localStorage.getItem(STORAGE_KEY);
            return logs ? JSON.parse(logs) : [];
        } catch(e) { return []; }
    },

    saveLog: async (logEntry) => {
        const newEntry = {
            id: 'log_' + Date.now(),
            timestamp: new Date().toISOString(),
            ...logEntry
        };
        const logs = await Store.getLogs();
        logs.push(newEntry);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
        window.dispatchEvent(new CustomEvent('speech_data_updated'));
        localStorage.setItem('last_update', Date.now());
        await Store.updateRiskPatterns();
        return newEntry;
    },

    getStudentGrowth: async (studentId) => {
        const logs = await Store.getLogs();
        return logs
            .filter(log => log.studentId === studentId)
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    },

    /**
     * 빅데이터 분석: 공통 취약 구간 분석 (방어 로직 극대화)
     */
    updateRiskPatterns: async () => {
        const logs = await Store.getLogs();
        if (!logs || logs.length === 0) {
            localStorage.setItem(RISK_PATTERN_KEY, JSON.stringify([]));
            return;
        }

        const patternMap = {};
        const questionUsage = {};

        logs.forEach(log => {
            if (!log) return;
            const qId = log.questionId || 'default_q';
            questionUsage[qId] = (questionUsage[qId] || 0) + 1;

            if (log.mistakes && Array.isArray(log.mistakes)) {
                log.mistakes.forEach(m => {
                    if (!m || m.timestamp === undefined) return;
                    const timeKey = Math.round(Number(m.timestamp)) || 0;
                    const key = `${qId}_${timeKey}`;
                    if (!patternMap[key]) {
                        patternMap[key] = { questionId: qId, time: timeKey, count: 0, types: [], details: [] };
                    }
                    patternMap[key].count++;
                    if (m.type) patternMap[key].types.push(String(m.type));
                    if (m.detail) patternMap[key].details.push(String(m.detail));
                });
            }
        });

        const highRisk = [];
        Object.keys(patternMap).forEach(key => {
            const pattern = patternMap[key];
            const totalAttempts = questionUsage[pattern.questionId] || 1;
            const ratio = pattern.count / totalAttempts;

            if (ratio >= 0.5) {
                // 타입 분석
                const validTypes = pattern.types.filter(t => t && t !== "undefined" && t !== "null");
                let mainType = "데이터 분석 중";
                if (validTypes.length > 0) {
                    const typeCounts = {};
                    validTypes.forEach(t => typeCounts[t] = (typeCounts[t] || 0) + 1);
                    mainType = Object.keys(typeCounts).reduce((a, b) => typeCounts[a] > typeCounts[b] ? a : b);
                }

                // 상세 내용 분석
                const validDetails = pattern.details.filter(d => d && d !== "undefined" && d !== "null");
                const sampleDetail = validDetails.length > 0 ? validDetails[0] : "상세 진단 결과가 준비 중입니다.";

                // 키워드 추출
                const keywordMatch = sampleDetail.match(/"([^"]+)"/);
                const keyword = keywordMatch ? keywordMatch[1] : null;

                highRisk.push({
                    questionId: pattern.questionId,
                    time: pattern.time,
                    ratio: (ratio * 100).toFixed(0),
                    mainType: String(mainType),
                    sampleDetail: String(sampleDetail),
                    keyword: keyword ? String(keyword) : null
                });
            }
        });

        localStorage.setItem(RISK_PATTERN_KEY, JSON.stringify(highRisk));
    },

    getRiskPatterns: () => {
        try {
            const patterns = localStorage.getItem(RISK_PATTERN_KEY);
            return patterns ? JSON.parse(patterns) : [];
        } catch(e) { return []; }
    },

    getGlobalStats: async () => {
        const logs = await Store.getLogs();
        if (!logs || logs.length === 0) return { avgScore: 0, totalCount: 0, logs: [], riskPatterns: [] };
        const totalScore = logs.reduce((sum, log) => sum + (Number(log.score) || 0), 0);
        return {
            avgScore: (totalScore / logs.length).toFixed(1),
            totalCount: logs.length,
            riskPatterns: Store.getRiskPatterns(),
            logs: logs
        };
    }
};

window.SpeechStore = Store;
console.log("SpeechStore Persistence Layer (Anti-Undefined Reinforced) Initialized.");
