/**
 * @file app.js
 * @description 녹화 로직, 분석 시뮬레이션 및 데이터 연결 로직
 * @vibe_coding 1:1 Mapping Principle 준수
 */

const App = {
    mediaRecorder: null,
    recordedChunks: [],
    stream: null,
    
    /**
     * 웹캠 미리보기 시작
     */
    startPreview: async (videoElement) => {
        console.log("Starting webcam preview...");
        try {
            App.stream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: 1280, height: 720 }, 
                audio: true 
            });
            videoElement.srcObject = App.stream;
            videoElement.play();
            console.log("Webcam stream active.");
        } catch (err) {
            console.error("Camera access error:", err);
            alert("카메라 및 마이크 권한을 허용해주세요. (HTTPS 환경 필요)");
        }
    },

    /**
     * 녹화 시작
     */
    startRecording: () => {
        if (!App.stream) return;
        console.log("Recording started...");
        App.recordedChunks = [];
        App.mediaRecorder = new MediaRecorder(App.stream);
        App.mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) App.recordedChunks.push(e.data);
        };
        App.mediaRecorder.start();
    },

    /**
     * 녹화 중지 및 데이터 반환
     */
    stopRecording: () => {
        return new Promise((resolve) => {
            if (!App.mediaRecorder) return resolve(null);
            console.log("Recording stopped.");
            App.mediaRecorder.onstop = () => {
                const blob = new Blob(App.recordedChunks, { type: 'video/webm' });
                resolve(blob);
            };
            App.mediaRecorder.stop();
        });
    },

    /**
     * AI 정밀 분석 시뮬레이션 (기획안의 Multimodal 분석 로직 반영)
     */
    runAIAnalysis: async (data, onProgress) => {
        console.log("Running AI Multimodal Analysis...");
        const steps = [
            { msg: "비디오 모션 캡처 및 시선 추적 분석 중...", p: 15 },
            { msg: "음성 파형 데이터(Pitch/Volume) 추출 중...", p: 35 },
            { msg: "표준 발음 스펙트럼 및 키워드 대조 중...", p: 55 },
            { msg: "문장 간 호흡 및 휴지(Pause) 분석 중...", p: 75 },
            { msg: "태도 및 비언어적 요소 종합 진단 중...", p: 90 },
            { msg: "최종 AI 리포트 생성 중...", p: 100 }
        ];

        const duration = await App.getMediaDuration(data);
        const scriptCharCount = 100; // 샘플 스크립트 글자수

        for (const step of steps) {
            onProgress(step.msg, step.p);
            await new Promise(r => setTimeout(r, 600)); // 시뮬레이션 속도
        }

        // [정밀 분석 로직 시뮬레이션]
        
        // 1. 속도 분석 (CPS)
        const cps = scriptCharCount / duration;
        let speedScore = 100 - Math.abs(cps - 3.8) * 25;
        speedScore = Math.max(60, Math.min(100, Math.floor(speedScore)));

        // 2. 태도 및 모션 분석 (시뮬레이션)
        const attitudeScore = Math.floor(Math.random() * 20) + 75;
        const motionStability = Math.floor(Math.random() * 20) + 70; // 자세 안정성

        // 3. 발음 분석
        const pronScore = Math.floor(Math.random() * 20) + 70;

        const totalScore = Math.floor((speedScore + attitudeScore + pronScore) / 3);

        // 상세 진단 멘트 생성
        const detailedFeedback = App.generateDetailedFeedback(speedScore, attitudeScore, pronScore, motionStability);

        return {
            score: totalScore,
            duration: duration.toFixed(1),
            mistakes: [
                { 
                    timestamp: (duration * 0.25).toFixed(1), 
                    type: '발음', 
                    detail: '이런 발음은 좋지 못해요. "변화와" 구간에서 조음이 뭉개지니 개선해야 합니다.' 
                },
                { 
                    timestamp: (duration * 0.65).toFixed(1), 
                    type: '태도', 
                    detail: '시선이 아래로 향하며 자신감이 떨어져 보입니다. 정면을 응시하는 모션이 필요합니다.' 
                }
            ],
            metrics: { 
                pronunciation: pronScore, 
                speed: speedScore, 
                attitude: attitudeScore,
                motion: motionStability
            },
            feedback: detailedFeedback
        };
    },

    /**
     * 상세 피드백 생성 (가이드 준수)
     */
    generateDetailedFeedback: (speed, attitude, pron, motion) => {
        let text = "";
        
        // 발음 피드백
        if (pron < 80) text += "발음의 명확도가 다소 낮습니다. 특히 종결 어미에서의 발음을 개선해야 합니다. ";
        else text += "발음이 매우 명확하여 전달력이 좋습니다. ";

        // 속도 피드백
        if (speed < 80) text += "말하기 속도가 불규칙합니다. 긴장감을 줄이고 호흡을 조절해 보세요. ";
        else text += "안정적인 속도로 신뢰감을 줍니다. ";

        // 태도 및 모션 피드백
        if (attitude < 85 || motion < 80) text += "발표 시 어깨의 움직임이나 시선 처리가 다소 불안정합니다. 더 당당한 포즈를 유지하세요.";
        else text += "제스처와 시선 처리가 자연스러워 전문성이 느껴집니다.";

        return text;
    },

    /**
     * 미디어 길이 측정
     */
    getMediaDuration: (file) => {
        return new Promise((resolve) => {
            if (!(file instanceof Blob)) return resolve(10);
            
            const video = document.createElement('video');
            video.preload = 'metadata';
            const timeout = setTimeout(() => resolve(10), 3000);

            video.onloadedmetadata = () => {
                clearTimeout(timeout);
                window.URL.revokeObjectURL(video.src);
                resolve(video.duration || 10);
            };
            video.onerror = () => {
                clearTimeout(timeout);
                resolve(10);
            };
            video.src = URL.createObjectURL(file);
        });
    },

    /**
     * 분석 결과 커밋
     */
    commitResult: async (studentId, questionId, result) => {
        if (!window.SpeechStore) {
            console.error("SpeechStore not found!");
            return;
        }
        console.log("Committing analysis data to store...");
        return await window.SpeechStore.saveLog({ studentId, questionId, ...result });
    }
};

window.SpeechApp = App;
console.log("SpeechApp Logic Initialized.");
