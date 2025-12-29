# 05. 배포 후 관리

**AI 협업 개발 가이드 - Part 5**

[← 이전: 04. 배포](./04_DEPLOYMENT.md) | [목차](./README.md)

---

## 📋 목차

1. [1시간 집중 모니터링](#1-1시간-집중-모니터링)
2. [에러 추적](#2-에러-추적)
3. [성능 모니터링](#3-성능-모니터링)
4. [알림 설정](#4-알림-설정)
5. [롤백 전략](#5-롤백-전략)
6. [인시던트 대응](#6-인시던트-대응)
7. [사용자 피드백](#7-사용자-피드백)
8. [확장성 모니터링](#8-확장성-모니터링)
9. [비용 최적화](#9-비용-최적화)
10. [APM & 보안](#10-apm--보안)
11. [사용자 행동 분석](#11-사용자-행동-분석)
12. [SLA 관리](#12-sla-관리)
13. [유지보수](#13-유지보수)

---

## 1. 1시간 집중 모니터링

### 1.1 체크리스트

**배포 후 첫 1시간은 화면을 떠나지 마세요!**

```
## 0~15분: 즉시 확인
[ ] 배포 성공 알림 확인
[ ] 프로덕션 URL 접속
[ ] 홈페이지 로딩
[ ] 로그인/로그아웃 테스트
[ ] 핵심 기능 1회 실행
[ ] Vercel/Netlify 대시보드 확인

## 15~30분: 상세 확인
[ ] 모든 페이지 1회 방문
[ ] API 응답 시간 확인
[ ] 데이터베이스 연결 상태
[ ] 에러 로그 확인 (Sentry/Vercel)
[ ] 성능 메트릭 (Vercel Analytics)
[ ] 콘솔 에러 없음

## 30~60분: 사용자 시뮬레이션
[ ] 신규 사용자 가입 테스트
[ ] 결제 플로우 테스트 (해당 시)
[ ] 이메일 발송 테스트
[ ] 파일 업로드 테스트
[ ] 모바일 브라우저 테스트
[ ] 다양한 시나리오 10개
```

---

### 1.2 실시간 로그 모니터링

#### Vercel

```bash
# CLI로 실시간 로그 확인
vercel logs --follow

# 프로덕션만
vercel logs --prod --follow

# 특정 프로젝트
vercel logs my-project --prod --follow
```

#### Netlify

```bash
netlify logs:stream
```

#### Docker (Render/Railway)

```bash
# Render
render logs -f

# Railway
railway logs

# Fly.io
fly logs
```

---

### 1.3 핵심 메트릭 확인

```
## ✅ 정상 범위
- 응답 시간: < 500ms (p95)
- 에러율: < 1%
- 데이터베이스 연결: 100%
- 메모리 사용: < 80%
- CPU 사용: < 70%

## ⚠️ 주의 필요
- 응답 시간: 500ms ~ 1s
- 에러율: 1% ~ 5%
- 메모리 사용: 80% ~ 90%

## 🚨 즉시 조치 필요
- 응답 시간: > 1s
- 에러율: > 5%
- 메모리 사용: > 90%
- 서비스 다운
```

---

## 2. 에러 추적

### 2.1 Sentry 설정 (권장)

#### 설치

```bash
npm install --save @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

#### 설정

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // 환경
  environment: process.env.NODE_ENV,
  
  // 샘플링 (프로덕션에서는 낮게)
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // 세션 리플레이
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // 민감한 데이터 제외
  beforeSend(event, hint) {
    // 비밀번호 등 민감한 정보 제거
    if (event.request) {
      delete event.request.cookies
      if (event.request.data) {
        delete event.request.data.password
        delete event.request.data.token
      }
    }
    return event
  }
})
```

---

#### 수동 에러 캡처

```typescript
import * as Sentry from '@sentry/nextjs'

export async function fetchData(id: string) {
  try {
    const response = await fetch(`/api/data/${id}`)
    if (!response.ok) throw new Error('Fetch failed')
    return response.json()
  } catch (error) {
    // Sentry에 에러 전송
    Sentry.captureException(error, {
      tags: {
        section: 'data-fetch',
        id: id
      },
      extra: {
        responseStatus: error.status
      }
    })
    throw error
  }
}
```

---

### 2.2 Vercel 로그

#### 대시보드에서 확인

```
Vercel 대시보드 → 프로젝트 → Logs

필터 옵션:
- Level: Error, Warning, Info
- Time Range: Last 1h, 24h, 7d
- Search: 키워드 검색
```

---

#### CLI로 확인

```bash
# 에러만 필터링
vercel logs --prod | grep ERROR

# 특정 시간대
vercel logs --prod --since 1h

# JSON 형식
vercel logs --prod --output json
```

---

### 2.3 에러 알림 설정

#### Sentry 알림 규칙

```
Sentry → Settings → Alerts

규칙:
1. New Issue: 즉시 알림
2. High Priority: 즉시
3. Spike in Errors: 5분에 10개 이상
4. Regression: 해결된 버그 재발생

알림 채널:
- Slack
- Email
- PagerDuty (긴급)
```

---

## 3. 성능 모니터링

### 3.1 Vercel Analytics

#### 설치

```bash
npm install @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

---

#### 대시보드 메트릭

```
## 실시간 메트릭
- 현재 방문자 수
- 페이지뷰
- 고유 방문자

## 성능 메트릭
- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)
- TTFB (Time to First Byte)

## 목표
- LCP: < 2.5s (Good)
- FID: < 100ms (Good)
- CLS: < 0.1 (Good)
- TTFB: < 800ms (Good)
```

---

### 3.2 Google Analytics 4

```typescript
// lib/gtag.ts
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID

export const pageview = (url: string) => {
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  })
}

export const event = ({ action, category, label, value }) => {
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  })
}
```

---

### 3.3 Lighthouse CI

```bash
# 설치
npm install -g @lhci/cli

# 실행
lhci autorun
```

---

## 4. 알림 설정

### 4.1 Slack 통합

#### Incoming Webhook

```bash
# Slack → Apps → Incoming Webhooks
# Webhook URL 복사

# 환경 변수 설정
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx
```

```typescript
// lib/slack.ts
export async function sendSlackNotification(message: string) {
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: message,
      username: 'Production Bot',
      icon_emoji: ':rocket:'
    })
  })
}
```

---

### 4.2 Discord Webhook

```typescript
export async function sendDiscordNotification(message: string) {
  await fetch(process.env.DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: message,
      username: 'Production Bot'
    })
  })
}
```

---

### 4.3 이메일 알림

```typescript
// lib/email.ts
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
})

export async function sendErrorEmail(error: Error) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: 'team@company.com',
    subject: '🚨 Production Error Alert',
    html: `
      <h2>Error Detected</h2>
      <p><strong>Message:</strong> ${error.message}</p>
      <p><strong>Stack:</strong></p>
      <pre>${error.stack}</pre>
    `
  })
}
```

---

## 5. 롤백 전략

### 5.1 Vercel 롤백

#### 대시보드

```
1. Vercel 대시보드 → 프로젝트 → Deployments
2. 이전 안정 버전 선택
3. ⋯ 메뉴 → "Promote to Production"
```

---

#### CLI

```bash
# 배포 목록 확인
vercel ls

# 특정 배포로 롤백
vercel promote [deployment-url] --prod

# 예시
vercel promote my-app-abc123.vercel.app --prod
```

---

### 5.2 Git 기반 롤백

```bash
# 이전 커밋으로 되돌리기
git log --oneline  # 커밋 히스토리 확인

# 방법 1: Revert (권장)
git revert HEAD
git push origin main
→ 자동 재배포

# 방법 2: Reset (신중)
git reset --hard abc1234
git push --force origin main
→ 자동 재배포
```

---

### 5.3 데이터베이스 롤백

```sql
-- 백업 복원 (PostgreSQL)
-- 1. 현재 상태 백업
pg_dump mydb > backup_before_rollback.sql

-- 2. 이전 백업 복원
psql mydb < backup_stable.sql

-- 3. 검증
SELECT COUNT(*) FROM users;
```

---

### 5.4 롤백 테스트

**정기적으로 롤백 절차 연습**

```
## 월 1회 롤백 훈련

1. 프로덕션 배포 (오후 3시)
2. 의도적 버그 포함
3. 모니터링 (5분)
4. 알림 확인
5. 롤백 실행 (목표: 2분 이내)
6. 검증
7. 소요 시간 기록
8. 개선점 도출
```

---

## 6. 인시던트 대응

### 6.1 인시던트 레벨 정의

#### P0 - Critical (치명적)

```
영향: 전체 서비스 다운
예시: 
- 사이트 접속 불가
- 데이터베이스 완전 다운
- 결제 시스템 장애
- 보안 침해

대응:
- 즉시 대응 (24/7)
- 전체 팀 소집
- 고객 공지 즉시
- 경영진 보고
- 목표: 15분 이내 초기 대응
```

---

#### P1 - High (높음)

```
영향: 핵심 기능 장애
예시:
- 로그인 불가
- 회원가입 실패
- API 응답 시간 > 5초
- 에러율 > 10%

대응:
- 1시간 이내 대응
- 담당 팀 소집
- 고객 공지 (필요 시)
- 목표: 4시간 이내 복구
```

---

#### P2 - Medium (중간)

```
영향: 일부 기능 저하
예시:
- 특정 페이지 느림
- 이미지 업로드 간헐적 실패
- 검색 결과 부정확
- 에러율 > 5%

대응:
- 업무 시간 내 대응
- 담당자 확인
- 목표: 24시간 이내 복구
```

---

#### P3 - Low (낮음)

```
영향: 사소한 버그
예시:
- UI 깨짐
- 오타
- 로그 에러 (기능 영향 없음)

대응:
- 다음 배포에 포함
- 백로그 등록
```

---

### 6.2 에스컬레이션 체계

```
On-Call 로테이션:
주간 담당자 (월요일 - 일요일)
├─ Primary: 개발자 A
├─ Secondary: 개발자 B
└─ Manager: 팀장

연락 순서:
1. Primary (즉시)
2. Secondary (15분 후 응답 없으면)
3. Manager (30분 후 응답 없으면)
4. CTO (P0이고 1시간 후에도 미해결)

연락 방법:
1순위: Slack (긴급 채널)
2순위: 전화
3순위: SMS

PagerDuty 사용 시:
- 자동 에스컬레이션
- 교대 관리
- 알림 히스토리
```

---

### 6.3 인시던트 대응 플레이북

#### Step 1: 감지 & 확인 (0-5분)

```bash
# 1. 알림 확인
- Sentry / Vercel / Uptime Robot
- Slack 긴급 채널

# 2. 영향 범위 확인
curl https://your-app.com/api/health
vercel logs --prod --follow

# 3. 인시던트 레벨 판단
P0? P1? P2?

# 4. 인시던트 채널 생성
Slack: #incident-2025-01-29-db-down

# 5. 초기 상태 공지
"🚨 인시던트 감지: DB 연결 실패
영향: 전체 서비스
대응: 조사 중
담당: @개발자A"
```

---

#### Step 2: 커뮤니케이션 (5-15분)

```
내부 공지:
→ Slack #general
→ 경영진 이메일 (P0/P1)

외부 공지 (필요 시):
→ 상태 페이지 업데이트
→ 이메일 / 푸시 알림
→ SNS 공지

공지 템플릿:
"안녕하세요. 
현재 [시간]부터 [기능]에 일시적인 장애가 발생했습니다.
원인을 파악하고 있으며, 복구 중입니다.
불편을 드려 죄송합니다.
[예상 복구 시간]"
```

---

#### Step 3: 조사 & 임시 조치 (15-60분)

```bash
# 1. 로그 수집
vercel logs --prod --since 30m > incident.log
docker logs container-id > app.log

# 2. 메트릭 확인
- CPU, 메모리, 디스크
- DB 커넥션 수
- API 응답 시간

# 3. 최근 변경 사항
git log --since="2 hours ago"
vercel deployments --prod | head -5

# 4. 임시 조치
- Feature Flag로 문제 기능 비활성화
- 트래픽 제한
- 캐시 비우기
- 이전 버전 롤백

# 5. 효과 확인
- 에러율 감소?
- 응답 시간 정상?
- 사용자 접속 가능?
```

---

#### Step 4: 근본 원인 해결 (1-4시간)

```
1. 원인 파악
   - 코드 버그
   - DB 문제
   - 외부 API 장애
   - 인프라 이슈

2. 해결 방안 수립
   - 긴급 패치
   - 설정 변경
   - 리소스 증설

3. 테스트
   - Staging 환경
   - 최소 범위 프로덕션

4. 배포
   - 점진적 롤아웃
   - 모니터링 강화

5. 검증
   - 핵심 기능 테스트
   - 30분 모니터링
```

---

#### Step 5: 복구 선언 & 사후 처리

```
1. 복구 확인
   ✅ 에러율 < 1%
   ✅ 응답 시간 정상
   ✅ 사용자 피드백 정상

2. 복구 공지
   "복구 완료되었습니다.
   발생 시간: [시작] - [종료]
   원인: [간단 설명]
   재발 방지: [계획]
   불편을 드려 죄송합니다."

3. 인시던트 종료
   - Slack 채널 정리
   - 타임라인 정리
   - 관련 티켓 업데이트
```

---

### 6.4 포스트모템 템플릿

```
# 인시던트 포스트모템 - [날짜]

## 요약
- **발생 일시**: 2025-01-29 14:32 UTC
- **복구 일시**: 2025-01-29 15:47 UTC
- **영향 시간**: 1시간 15분
- **영향 범위**: 전체 사용자 (약 5,000명)
- **인시던트 레벨**: P0

## 타임라인
| 시간 | 이벤트 |
|------|--------|
| 14:32 | Sentry 알림 - DB 연결 실패 |
| 14:35 | 인시던트 채널 생성, 조사 시작 |
| 14:40 | 고객 공지 발송 |
| 14:50 | 원인 파악 - DB 커넥션 풀 고갈 |
| 15:00 | 임시 조치 - 앱 재시작 |
| 15:10 | 근본 해결 - max_connections 증가 |
| 15:30 | 배포 완료 |
| 15:47 | 복구 확인, 인시던트 종료 |

## 근본 원인
트래픽 급증 (평소 대비 3배) → DB 커넥션 풀 고갈 (max: 10) 
→ 신규 요청 대기 → 타임아웃 → 서비스 다운

## 즉시 조치
- DB max_connections: 10 → 50
- Connection pool timeout: 5s → 30s
- 앱 재시작으로 커넥션 정리

## 재발 방지
1. **단기 (1주)**
   - [ ] Connection pool 모니터링 추가
   - [ ] DB 커넥션 알림 설정 (80% 사용 시)
   - [ ] 트래픽 스파이크 알림

2. **중기 (1개월)**
   - [ ] DB 리드 레플리카 추가
   - [ ] 커넥션 풀 오토 스케일링
   - [ ] 부하 테스트 정기 실행

3. **장기 (3개월)**
   - [ ] 마이크로서비스 분리 고려
   - [ ] DB 샤딩 검토

## 배운 점
✅ 잘한 점:
- 15분 내 초기 대응
- 명확한 커뮤니케이션
- 빠른 임시 조치

❌ 개선할 점:
- DB 커넥션 모니터링 부족
- 부하 테스트 미실시
- 경보 임계값 설정 부족

## 액션 아이템
| 항목 | 담당자 | 마감일 | 상태 |
|------|--------|--------|------|
| Connection pool 모니터링 | 개발자A | 02-05 | 진행중 |
| DB 리드 레플리카 | 인프라팀 | 02-15 | 대기 |
| 부하 테스트 자동화 | QA팀 | 02-28 | 계획 |
```

---

### 6.5 상태 페이지 운영

#### 도구: Statuspage.io / UptimeRobot

```
https://status.yourapp.com

컴포넌트:
├─ API
├─ 웹사이트
├─ 데이터베이스
├─ 결제 시스템
└─ 이메일 발송

상태:
✅ 정상 운영
⚠️ 성능 저하
🚨  일부 장애
💀 서비스 중단
🔧 예정된 유지보수
```

---

#### 자동 업데이트

```typescript
// 헬스체크 실패 시 자동 업데이트
if (healthCheckFailed) {
  await fetch('https://api.statuspage.io/v1/incidents', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STATUSPAGE_API_KEY}`,
    },
    body: JSON.stringify({
      incident: {
        name: 'Database Connection Issues',
        status: 'investigating',
        impact: 'major',
        body: 'We are investigating database connection issues.',
      },
    }),
  })
}
```

---

## 7. 사용자 피드백

### 7.1 세션 리플레이 (Hotjar / FullStory)

#### Hotjar 설치

```typescript
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(h,o,t,j,a,r){
                h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                h._hjSettings={hjid:${process.env.NEXT_PUBLIC_HOTJAR_ID},hjsv:6};
                a=o.getElementsByTagName('head')[0];
                r=o.createElement('script');r.async=1;
                r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                a.appendChild(r);
              })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

---

#### 활용 방법

```
1. 히트맵 분석
   - 어디를 클릭하는가?
   - 스크롤 깊이는?
   - 마우스 움직임 패턴

2. 세션 녹화
   - 실제 사용자 행동 관찰
   - 버그 재현 가능
   - UX 문제 식별

3. 피드백 위젯
   - 사용자 직접 피드백
   - 스크린샷 포함
   - 감정 점수

4. 설문조사
   - Exit Intent 설문
   - NPS 측정
   - 기능 만족도
```

---

### 7.2 NPS (Net Promoter Score)

```typescript
// components/NPSSurvey.tsx
'use client'

import { useState } from 'react'

export function NPSSurvey() {
  const [score, setScore] = useState<number | null>(null)
  const [feedback, setFeedback] = useState('')

  const handleSubmit = async () => {
    await fetch('/api/feedback/nps', {
      method: 'POST',
      body: JSON.stringify({ score, feedback }),
    })
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white p-6 shadow-lg rounded-lg">
      <h3>이 서비스를 친구에게 추천하시겠습니까?</h3>
      
      <div className="flex gap-2 my-4">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <button
            key={n}
            onClick={() => setScore(n)}
            className={score === n ? 'bg-blue-500 text-white' : 'bg-gray-200'}
          >
            {n}
          </button>
        ))}
      </div>
      
      <textarea
        placeholder="이유를 알려주세요 (선택)"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        className="w-full border p-2"
      />
      
      <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2">
        제출
      </button>
    </div>
  )
}
```

---

#### NPS 계산 & 분석

```typescript
// lib/nps.ts
export function calculateNPS(scores: number[]) {
  const promoters = scores.filter(s => s >= 9).length
  const detractors = scores.filter(s => s <= 6).length
  const total = scores.length
  
  const nps = ((promoters - detractors) / total) * 100
  
  return {
    nps: Math.round(nps),
    promoters: (promoters / total) * 100,
    passives: ((total - promoters - detractors) / total) * 100,
    detractors: (detractors / total) * 100,
  }
}

// 목표
// NPS > 50: 우수
// NPS 30-50: 양호
// NPS < 30: 개선 필요
```

---

### 7.3 기능 사용률 분석

```typescript
// lib/analytics.ts
export async function trackFeatureUsage(feature: string, userId: string) {
  await prisma.featureUsage.create({
    data: {
      feature,
      userId,
      timestamp: new Date(),
    },
  })
}

// 사용
trackFeatureUsage('export-pdf', user.id)
trackFeatureUsage('dark-mode', user.id)
trackFeatureUsage('ai-assistant', user.id)
```

---

#### 사용률 대시보드

```typescript
// app/admin/analytics/route.ts
export async function GET() {
  const usage = await prisma.featureUsage.groupBy({
    by: ['feature'],
    _count: true,
    where: {
      timestamp: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 최근 30일
      }
    },
    orderBy: {
      _count: {
        feature: 'desc'
      }
    }
  })
  
  return Response.json(usage)
}
```

---

### 7.4 이탈률 모니터링

```typescript
// lib/churn.ts
export async function analyzeChurn() {
  // 최근 30일간 활동하지 않은 사용자
  const inactiveUsers = await prisma.user.findMany({
    where: {
      lastLoginAt: {
        lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    }
  })
  
  // 이탈 위험 사용자 (활동 감소)
  const atRiskUsers = await prisma.user.findMany({
    where: {
      // 로그인 빈도가 50% 이상 감소
    }
  })
  
  return {
    churned: inactiveUsers.length,
    atRisk: atRiskUsers.length,
    churnRate: (inactiveUsers.length / totalUsers) * 100
  }
}
```

---

## 8. 확장성 모니터링

### 8.1 트래픽 증가 추세

```typescript
// scripts/analyze-traffic.ts
import { prisma } from '@/lib/prisma'

async function analyzeTrafficTrend() {
  const last7Days = await prisma.pageView.groupBy({
    by: ['date'],
    _count: true,
    where: {
      date: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    },
    orderBy: { date: 'asc' }
  })
  
  // 성장률 계산
  const first = last7Days[0]._count
  const last = last7Days[last7Days.length - 1]._count
  const growthRate = ((last - first) / first) * 100
  
  // 예측
  const avgDailyGrowth = growthRate / 7
  const projectedIn30Days = last * Math.pow(1 + avgDailyGrowth / 100, 30)
  
  return {
    current: last,
    growthRate: `${growthRate.toFixed(2)}%`,
    projected30Days: Math.round(projectedIn30Days),
    recommendation: projectedIn30Days > 10000 ? 'Scale up soon' : 'Sufficient capacity'
  }
}
```

---

### 8.2 DB 용량 증가율

```sql
-- PostgreSQL 데이터베이스 크기 추적
CREATE TABLE db_size_history (
  id SERIAL PRIMARY KEY,
  measured_at TIMESTAMP DEFAULT NOW(),
  size_bytes BIGINT,
  table_sizes JSONB
);

-- 매일 자동 기록
INSERT INTO db_size_history (size_bytes, table_sizes)
SELECT 
  pg_database_size(current_database()),
  jsonb_object_agg(
    schemaname || '.' || tablename,
    pg_total_relation_size(schemaname || '.' || tablename)
  )
FROM pg_tables
WHERE schemaname = 'public';
```

---

#### 용량 증가 분석

```typescript
// scripts/analyze-db-growth.ts
async function analyzeDBGrowth() {
  const history = await prisma.$queryRaw`
    SELECT 
      measured_at,
      size_bytes,
      size_bytes - LAG(size_bytes) OVER (ORDER BY measured_at) as daily_growth
    FROM db_size_history
    WHERE measured_at >= NOW() - INTERVAL '30 days'
    ORDER BY measured_at
  `
  
  const avgDailyGrowth = history.reduce((sum, row) => sum + row.daily_growth, 0) / history.length
  const currentSize = history[history.length - 1].size_bytes
  
  // 현재 용량 기준 남은 시간 계산 (예: 100GB 제한)
  const limitBytes = 100 * 1024 * 1024 * 1024
  const remainingBytes = limitBytes - currentSize
  const daysUntilFull = remainingBytes / avgDailyGrowth
  
  return {
    currentSize: `${(currentSize / 1024 / 1024 / 1024).toFixed(2)} GB`,
    avgDailyGrowth: `${(avgDailyGrowth / 1024 / 1024).toFixed(2)} MB`,
    daysUntilFull: Math.round(daysUntilFull),
    action: daysUntilFull < 30 ? 'Upgrade plan now' : 'Monitor'
  }
}
```

---

### 8.3 API Rate Limit 모니터링

```typescript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true, // 사용량 추적
})

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1'
  const { success, limit, remaining, reset } = await ratelimit.limit(ip)
  
  // 모니터링: 80% 이상 사용 시 알림
  if (remaining / limit < 0.2) {
    await sendAlert(`High API usage: ${ip} - ${remaining}/${limit} remaining`)
  }
  
  if (!success) {
    return new Response('Too Many Requests', {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString(),
      },
    })
  }
  
  return NextResponse.next()
}
```

---

### 8.4 확장 시점 예측

```typescript
// lib/scaling-predictor.ts
export async function predictScalingNeeds() {
  const metrics = {
    currentUsers: await getCurrentActiveUsers(),
    currentRPS: await getCurrentRequestsPerSecond(),
    currentDBConnections: await getCurrentDBConnections(),
    avgResponseTime: await getAvgResponseTime(),
  }
  
  const limits = {
    maxUsers: 10000,
    maxRPS: 100,
    maxDBConnections: 50,
    targetResponseTime: 500, // ms
  }
  
  const utilizationRate = {
    users: (metrics.currentUsers / limits.maxUsers) * 100,
    rps: (metrics.currentRPS / limits.maxRPS) * 100,
    dbConnections: (metrics.currentDBConnections / limits.maxDBConnections) * 100,
    responseTime: (metrics.avgResponseTime / limits.targetResponseTime) * 100,
  }
  
  // 80% 이상 사용 시 스케일업 권장
  const needsScaling = Object.values(utilizationRate).some(rate => rate > 80)
  
  return {
    metrics,
    utilizationRate,
    needsScaling,
    recommendations: needsScaling ? [
      utilizationRate.users > 80 && 'Upgrade user plan',
      utilizationRate.rps > 80 && 'Add CDN or load balancer',
      utilizationRate.dbConnections > 80 && 'Add DB read replicas',
      utilizationRate.responseTime > 80 && 'Optimize queries or add caching',
    ].filter(Boolean) : []
  }
}
```

---

### 8.5 오토 스케일링 설정

#### Vercel Auto-scaling (자동)

```
Vercel은 자동으로 스케일링:
- 트래픽 증가 시 자동으로 인스턴스 증가
- 동시 요청 수에 따라 조정
- 설정 불필요

제한:
- Hobby: 1 concurrent execution
- Pro: 무제한 (fair use)
```

---

#### AWS ECS Auto-scaling

```yaml
# ecs-autoscaling.yml
Resources:
  ScalingTarget:
    Type: AWS::ApplicationAutoScaling::ScalableTarget
    Properties:
      ServiceNamespace: ecs
      ScalableDimension: ecs:service:DesiredCount
      ResourceId: !Sub service/${ECSCluster}/${ECSService}
      MinCapacity: 2
      MaxCapacity: 10
  
  ScalingPolicy:
    Type: AWS::ApplicationAutoScaling::ScalingPolicy
    Properties:
      PolicyType: TargetTrackingScaling
      ScalingTargetId: !Ref ScalingTarget
      TargetTrackingScalingPolicyConfiguration:
        PredefinedMetricSpecification:
          PredefinedMetricType: ECSServiceAverageCPUUtilization
        TargetValue: 70.0
```

---

## 9. 비용 최적화

### 9.1 Vercel 비용 구조

```
## Hobby (무료)
- 대역폭: 100GB/월
- 빌드 시간: 6000분/월
- 함수 실행: 100GB-시간/월
- 이미지 최적화: 1000개/월

## Pro ($20/월)
- 대역폭: 1TB/월
- 빌드 시간: 무제한
- 함수 실행: 1000GB-시간/월
- 이미지 최적화: 5000개/월

## Enterprise (문의)
- 커스텀 제한
- SLA 보장
- 전담 지원
```

---

### 9.2 비용 절감 팁

#### 1. 이미지 최적화

```typescript
// next.config.js
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1년
    
    // 외부 이미지 캐싱
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.example.com',
      },
    ],
  },
}
```

---

#### 2. 함수 실행 시간 단축

```typescript
// ❌ 느림 (100ms)
export async function GET() {
  const allData = await prisma.post.findMany() // 10000개
  return Response.json(allData)
}

// ✅ 빠름 (10ms)
export async function GET() {
  const recentData = await prisma.post.findMany({
    take: 10,
    select: { id: true, title: true } // 필요한 필드만
  })
  return Response.json(recentData)
}
```

---

#### 3. 정적 페이지 최대 활용

```typescript
// ISR로 서버 부하 감소
export const revalidate = 3600 // 1시간마다 재생성

export async function generateStaticParams() {
  const posts = await prisma.post.findMany()
  return posts.map(post => ({ slug: post.slug }))
}
```

---

#### 4. 대역폭 절감

```typescript
// API 응답 압축
import { NextResponse } from 'next/server'
import pako from 'pako'

export async function GET() {
  const data = await getLargeData()
  const compressed = pako.gzip(JSON.stringify(data))
  
  return new NextResponse(compressed, {
    headers: {
      'Content-Encoding': 'gzip',
      'Content-Type': 'application/json',
    },
  })
}
```

---

### 9.3 비용 예측 & 모니터링

#### 월별 비용 추이

```typescript
// lib/cost-tracking.ts
interface MonthlyCost {
  month: string
  bandwidth: number // GB
  buildMinutes: number
  functionGB: number
  imageOptimizations: number
  estimatedCost: number
}

export async function trackMonthlyCost(): Promise<MonthlyCost> {
  // Vercel API로 사용량 조회
  const usage = await fetch('https://api.vercel.com/v1/teams/team_id/usage', {
    headers: { Authorization: `Bearer ${VERCEL_TOKEN}` }
  }).then(r => r.json())
  
  // 비용 계산 (Pro 플랜 기준)
  const baseCost = 20 // $20/월
  const extraBandwidth = Math.max(0, usage.bandwidth - 1000) * 0.15 // $0.15/GB
  const extraFunctions = Math.max(0, usage.functionGB - 1000) * 2 // $2/GB-hour
  
  return {
    month: new Date().toISOString().slice(0, 7),
    bandwidth: usage.bandwidth,
    buildMinutes: usage.buildMinutes,
    functionGB: usage.functionGB,
    imageOptimizations: usage.imageOptimizations,
    estimatedCost: baseCost + extraBandwidth + extraFunctions
  }
}
```

---

#### 예산 초과 경고

```typescript
// scripts/cost-alert.ts
async function checkBudget() {
  const currentCost = await trackMonthlyCost()
  const budget = 100 // $100 예산
  
  if (currentCost.estimatedCost > budget * 0.8) {
    await sendSlackNotification(
      `⚠️ 비용 경고: $${currentCost.estimatedCost.toFixed(2)} / $${budget}
      
예상 초과 항목:
- 대역폭: ${currentCost.bandwidth} GB
- 함수 실행: ${currentCost.functionGB} GB-시간

조치 필요!`
    )
  }
}

// 매일 실행
// Vercel Cron: cron('0 9 * * *')
```

---

#### 기능별 비용 분석

```typescript
// lib/feature-costs.ts
export async function analyzeFeatureCosts() {
  const features = [
    {
      name: 'API Endpoints',
      requests: await countAPIRequests(),
      avgDuration: await getAvgAPIDuration(),
      cost: calculateFunctionCost(requests, avgDuration)
    },
    {
      name: 'Image Optimization',
      count: await countImageOptimizations(),
      cost: count * 0.005 // $0.005 per optimization
    },
    {
      name: 'Static Pages',
      cost: 0 // 무료
    }
  ]
  
  return features.sort((a, b) => b.cost - a.cost)
}
```

---

### 9.4 비용 최적화 체크리스트

```
월별 리뷰:
[ ] 사용량 확인 (Vercel Dashboard)
[ ] 예산 대비 실제 비용
[ ] 비정상적 스파이크 조사
[ ] 불필요한 함수 실행 확인
[ ] 이미지 최적화 개수
[ ] 대역폭 사용량

최적화 기회:
[ ] 사용하지 않는 API 제거
[ ] 캐싱 전략 개선
[ ] 이미지 CDN 활용
[ ] DB 쿼리 최적화
[ ] Static Generation 확대

플랜 검토:
[ ] Hobby → Pro 업그레이드 필요?
[ ] Pro → Enterprise 필요?
[ ] 대안 플랫폼 검토 (비용 vs 기능)
```

---

## 10. APM & 보안

### 10.1 Application Performance Monitoring

#### New Relic

```bash
# 설치
npm install newrelic

# newrelic.js 생성
cp node_modules/newrelic/newrelic.js .
```

```javascript
// newrelic.js
exports.config = {
  app_name: ['My Application'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  distributed_tracing: {
    enabled: true
  },
  logging: {
    level: 'info'
  }
}
```

```typescript
// 앱 시작 시 로드
// instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    require('newrelic')
  }
}
```

---

#### DataDog APM

```bash
npm install dd-trace
```

```typescript
// instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const tracer = require('dd-trace').init({
      service: 'my-app',
      env: process.env.NODE_ENV,
      version: process.env.APP_VERSION,
    })
  }
}
```

---

### 10.2 보안 모니터링

#### 1. DDoS 공격 감지

```typescript
// middleware.ts
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1'
  const key = `requests:${ip}:${Date.now()}`
  
  // 최근 1분간 요청 수
  const count = await redis.incr(key)
  await redis.expire(key, 60)
  
  // 1분에 100회 이상 → DDoS 의심
  if (count > 100) {
    await sendAlert(`Possible DDoS from ${ip}: ${count} requests/min`)
    return new Response('Too Many Requests', { status: 429 })
  }
  
  return NextResponse.next()
}
```

---

#### 2. 로그인 시도 모니터링

```typescript
// app/api/auth/login/route.ts
export async function POST(request: Request) {
  const { email, password } = await request.json()
  const ip = request.headers.get('x-forwarded-for')
  
  // 로그인 시도 기록
  await prisma.loginAttempt.create({
    data: { email, ip, success: false }
  })
  
  // 최근 5분간 5회 이상 실패 → 경고
  const recentFailures = await prisma.loginAttempt.count({
    where: {
      ip,
      success: false,
      createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) }
    }
  })
  
  if (recentFailures >= 5) {
    await sendSecurityAlert(`Brute force attempt from ${ip}`)
    return Response.json({ error: 'Too many attempts' }, { status: 429 })
  }
  
  // 실제 로그인 로직
  const user = await authenticateUser(email, password)
  
  if (user) {
    await prisma.loginAttempt.updateMany({
      where: { ip },
      data: { success: true }
    })
  }
  
  return Response.json({ user })
}
```

---

#### 3. API Abuse 감지

```typescript
// lib/abuse-detection.ts
export async function detectAPIAbuse(userId: string) {
  const hour = 60 * 60 * 1000
  const recentRequests = await prisma.apiRequest.count({
    where: {
      userId,
      createdAt: { gte: new Date(Date.now() - hour) }
    }
  })
  
  // 시간당 1000회 이상 → Abuse
  if (recentRequests > 1000) {
    await sendAlert(`API abuse detected: User ${userId} - ${recentRequests} requests/hour`)
    
    // 일시적 차단
    await redis.set(`blocked:${userId}`, 'true', { ex: 3600 })
    
    return true
  }
  
  return false
}
```

---

#### 4. WAF (Web Application Firewall)

**Cloudflare WAF:**
```
Cloudflare Dashboard → Security → WAF

규칙:
1. OWASP Top 10 차단
2. SQL Injection 차단
3. XSS 차단
4. Known Bot 차단
5. 특정 국가 차단 (선택)

Challenge:
- Bot Score < 30 → CAPTCHA
- Threat Score > 50 → Block
```

---

## 11. 사용자 행동 분석

### 11.1 Mixpanel

```bash
npm install mixpanel-browser
```

```typescript
// lib/mixpanel.ts
import mixpanel from 'mixpanel-browser'

mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN)

export const track = {
  pageView: (page: string) => {
    mixpanel.track('Page View', { page })
  },
  
  signUp: (method: string) => {
    mixpanel.track('Sign Up', { method })
  },
  
  purchase: (product: string, amount: number) => {
    mixpanel.track('Purchase', { product, amount })
    mixpanel.people.track_charge(amount)
  },
  
  featureUsed: (feature: string) => {
    mixpanel.track('Feature Used', { feature })
  }
}

// 사용
track.pageView('/dashboard')
track.signUp('google')
track.purchase('Premium Plan', 29.99)
```

---

### 11.2 퍼널 분석

```typescript
// 구매 퍼널 추적
const purchaseFunnel = [
  'View Products',      // 100%
  'Add to Cart',        // 60%
  'Checkout',           // 40%
  'Payment',            // 35%
  'Purchase Complete'   // 30%
]

// 각 단계 추적
track.viewProducts()
track.addToCart(productId)
track.checkout()
track.payment()
track.purchaseComplete()

// Mixpanel에서 분석
// Funnels → Create Funnel → 단계 추가
```

---

### 11.3 코호트 분석

```typescript
// 신규 가입자 코호트
export async function createUserCohort(signupDate: Date) {
  const cohortUsers = await prisma.user.findMany({
    where: {
      createdAt: {
        gte: signupDate,
        lt: new Date(signupDate.getTime() + 24 * 60 * 60 * 1000)
      }
    }
  })
  
  // 7일 후 활성 사용자
  const day7Active = await prisma.user.count({
    where: {
      id: { in: cohortUsers.map(u => u.id) },
      lastActiveAt: {
        gte: new Date(signupDate.getTime() + 7 * 24 * 60 * 60 * 1000)
      }
    }
  })
  
  return {
    cohortSize: cohortUsers.length,
    day7Retention: (day7Active / cohortUsers.length) * 100
  }
}
```

---

### 11.4 A/B 테스트

```typescript
// lib/ab-test.ts
export function getVariant(userId: string, testName: string): 'A' | 'B' {
  const hash = hashCode(userId + testName)
  return hash % 2 === 0 ? 'A' : 'B'
}

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash = hash & hash
  }
  return Math.abs(hash)
}

// 사용
const variant = getVariant(user.id, 'checkout-button-color')

if (variant === 'A') {
  return <button className="bg-blue-500">Checkout</button>
} else {
  return <button className="bg-green-500">Checkout</button>
}

// 결과 추적
track.abTest('checkout-button-color', variant)
track.conversion('checkout-complete')
```

---

### 11.5 Feature Flag

```typescript
// lib/feature-flags.ts
import { unstable_flag as flag } from '@vercel/flags/next'

export const newCheckoutFlow = flag({
  key: 'new-checkout-flow',
  async decide() {
    // 특정 사용자에게만 활성화
    const user = await getCurrentUser()
    return user?.role === 'beta-tester'
  }
})

// 사용
import { newCheckoutFlow } from '@/lib/feature-flags'

export default async function CheckoutPage() {
  const useNewFlow = await newCheckoutFlow()
  
  if (useNewFlow) {
    return <NewCheckoutFlow />
  }
  
  return <OldCheckoutFlow />
}
```

---

## 12. SLA 관리

### 12.1 SLA (Service Level Agreement) 정의

```
## Uptime SLA
- 목표: 99.9% (월 43분 다운타임 허용)
- 측정: 외부 모니터링 (UptimeRobot)
- 보고: 월별 리포트

## 성능 SLA
- API 응답 시간: p95 < 500ms
- 페이지 로딩: p95 < 2초
- 측정: Vercel Analytics

## 지원 SLA
- P0: 15분 이내 응답
- P1: 1시간 이내 응답
- P2: 4시간 이내 응답
- P3: 24시간 이내 응답
```

---

### 12.2 RTO & RPO

```
## RTO (Recovery Time Objective)
서비스 복구 목표 시간
- P0: 1시간
- P1: 4시간
- P2: 24시간

## RPO (Recovery Point Objective)
데이터 손실 허용 범위
- DB: 최대 5분 (백업 주기)
- 파일: 최대 1시간 (S3 복제 지연)
```

---

### 12.3 SLA 위반 시 대응

```typescript
// scripts/check-sla.ts
async function checkSLACompliance() {
  const last30Days = 30 * 24 * 60 * 60 * 1000
  
  // Uptime 확인
  const incidents = await prisma.incident.findMany({
    where: {
      createdAt: { gte: new Date(Date.now() - last30Days) },
      level: { in: ['P0', 'P1'] }
    }
  })
  
  const totalDowntime = incidents.reduce((sum, i) => {
    return sum + (i.resolvedAt.getTime() - i.createdAt.getTime())
  }, 0)
  
  const downtimeMinutes = totalDowntime / 1000 / 60
  const uptime = ((last30Days - totalDowntime) / last30Days) * 100
  
  // SLA 위반 (99.9% = 43.2분)
  if (uptime < 99.9) {
    await sendAlert(`⚠️ SLA Violation
    
Uptime: ${uptime.toFixed(2)}%
Downtime: ${downtimeMinutes.toFixed(0)} minutes
Target: 99.9% (43.2 minutes)

Actions required:
1. Post-mortem analysis
2. Customer communication
3. SLA credit calculation
4. Prevention plan`)
  }
  
  return {
    uptime,
    downtimeMinutes,
    slaCompliant: uptime >= 99.9
  }
}
```

---

### 12.4 SLA 대시보드

```typescript
// app/admin/sla/route.ts
export async function GET() {
  const last30Days = await checkSLACompliance()
  const currentMonth = await getCurrentMonthMetrics()
  
  return Response.json({
    uptime: {
      last30Days: last30Days.uptime,
      currentMonth: currentMonth.uptime,
      target: 99.9,
      status: last30Days.slaCompliant ? 'COMPLIANT' : 'VIOLATION'
    },
    performance: {
      avgResponseTime: currentMonth.avgResponseTime,
      p95ResponseTime: currentMonth.p95ResponseTime,
      target: 500,
      status: currentMonth.p95ResponseTime < 500 ? 'COMPLIANT' : 'AT_RISK'
    },
    incidents: {
      p0: currentMonth.p0Count,
      p1: currentMonth.p1Count,
      p2: currentMonth.p2Count,
      avgResolutionTime: currentMonth.avgResolutionTime
    }
  })
}
```

---

## 13. 유지보수

### 13.1 정기 점검 (주간)

```
## 매주 월요일 오전

[ ] 에러 로그 리뷰 (Sentry)
[ ] 성능 메트릭 확인 (Vercel Analytics)
[ ] 응답 시간 추세 분석
[ ] 데이터베이스 크기 확인
[ ] 백업 상태 확인
[ ] npm audit (취약점 검사)
[ ] 의존성 업데이트 확인
[ ] 디스크 사용량 확인 (DB 서버)
[ ] SSL 인증서 만료일 확인
[ ] 사용자 피드백 리뷰
```

---

### 13.2 월간 점검

```
## 매월 1일

[ ] Lighthouse 점수 확인
[ ] 크로스 브라우저 테스트
[ ] 모바일 기기 테스트
[ ] 접근성 검사
[ ] 로드 테스트 (예상 트래픽 2배)
[ ] 백업 복원 테스트
[ ] 롤백 절차 연습
[ ] 비용 리뷰
[ ] 사용량 분석
[ ] 문서 업데이트
[ ] CHANGELOG 정리
[ ] 보안 패치 적용
```

---

### 13.3 의존성 업데이트

#### Dependabot PR 처리

```
## PR 확인 절차

1. PR 제목 확인
   - patch: 바로 머지 가능
   - minor: 체인지로그 확인 후 머지
   - major: 신중한 검토 필요

2. 로컬 테스트
   git checkout dependabot/npm_and_yarn/package-name-1.2.3
   npm install
   npm run test
   npm run build
   npm run dev  # 수동 테스트

3. 머지 및 배포
   git checkout main
   git merge dependabot/npm_and_yarn/package-name-1.2.3
   git push

4. 프로덕션 모니터링 (30분)
```

---

### 13.4 보안 패치

```bash
# 1. 취약점 확인
npm audit

# 2. 자동 수정 시도
npm audit fix

# 3. 강제 수정 (주의)
npm audit fix --force

# 4. 수동 업데이트 필요 시
npm update [package-name]

# 5. 테스트
npm run test
npm run build

# 6. 배포
git add package.json package-lock.json
git commit -m "chore: 보안 패치 적용"
git push
```

---

### 13.5 데이터베이스 유지보수

```sql
-- PostgreSQL 유지보수

-- 1. Vacuum (매주)
VACUUM ANALYZE;

-- 2. Reindex (매월)
REINDEX DATABASE mydb;

-- 3. 통계 업데이트
ANALYZE;

-- 4. 오래된 데이터 정리 (매월)
DELETE FROM logs WHERE created_at < NOW() - INTERVAL '90 days';

-- 5. 디스크 공간 확인
SELECT pg_size_pretty(pg_database_size('mydb'));
```

---

### 13.6 백업 전략

#### 자동 백업 스크립트

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="mydb"

# 1. DB 백업
pg_dump $DB_NAME | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# 2. 파일 백업 (S3)
aws s3 sync /app/uploads s3://my-bucket/backups/files_$DATE/

# 3. 설정 파일 백업
tar -czf $BACKUP_DIR/config_$DATE.tar.gz \
  .env.production \
  docker-compose.yml \
  nginx.conf

# 4. 오래된 백업 삭제 (30일 이상)
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

# 5. 백업 검증
if [ $? -eq 0 ]; then
  echo "✅ Backup successful: $DATE"
  # Slack 알림
  curl -X POST $SLACK_WEBHOOK \
    -d "{\"text\":\"✅ Backup completed: $DATE\"}"
else
  echo "❌ Backup failed: $DATE"
  curl -X POST $SLACK_WEBHOOK \
    -d "{\"text\":\"❌ Backup failed: $DATE\"}"
fi
```

---

#### 백업 복원 테스트

```bash
#!/bin/bash
# restore-test.sh

# 1. 테스트 DB 생성
createdb mydb_restore_test

# 2. 최신 백업 복원
LATEST_BACKUP=$(ls -t /backups/db_*.sql.gz | head -1)
gunzip < $LATEST_BACKUP | psql mydb_restore_test

# 3. 데이터 검증
ROW_COUNT=$(psql mydb_restore_test -t -c "SELECT COUNT(*) FROM users")

if [ $ROW_COUNT -gt 0 ]; then
  echo "✅ Restore test successful: $ROW_COUNT rows"
else
  echo "❌ Restore test failed"
fi

# 4. 테스트 DB 삭제
dropdb mydb_restore_test
```

---

## 📊 대시보드 예시

### 추천 모니터링 스택

```
## 1순위 (무료)
- Vercel Analytics (성능)
- Sentry (에러)
- UptimeRobot (가동 시간)
- Google Analytics (사용자)

## 2순위 (유료)
- New Relic / DataDog (APM)
- Hotjar (사용자 행동)
- Mixpanel (분석)
- PagerDuty (On-call)
```

---

## 🎯 최종 체크리스트

### ✅ 배포 후 1시간

```
[ ] 프로덕션 URL 접속 확인
[ ] 핵심 기능 수동 테스트
[ ] 에러 로그 확인
[ ] 성능 메트릭 확인
[ ] 실시간 로그 모니터링
[ ] 알림 정상 작동 확인
```

---

### ✅ 배포 후 1일

```
[ ] 사용자 피드백 확인
[ ] NPS 점수 확인
[ ] 에러 트렌드 분석
[ ] 성능 트렌드 분석
[ ] 비용 사용량 확인
[ ] 인시던트 없음 확인
```

---

### ✅ 배포 후 1주

```
[ ] 주간 모니터링 리포트
[ ] SLA 준수 여부
[ ] 백업 정상 작동
[ ] 의존성 보안 점검
[ ] 확장성 검토
[ ] 팀 회고
```

---

## 📚 참고 자료

### 모니터링 도구
- Sentry: https://sentry.io
- Vercel Analytics: https://vercel.com/analytics
- New Relic: https://newrelic.com
- DataDog: https://datadoghq.com
- UptimeRobot: https://uptimerobot.com

### 알림 통합
- Slack: https://api.slack.com/messaging/webhooks
- PagerDuty: https://pagerduty.com
- Statuspage: https://statuspage.io

---

## 🎓 마무리

### 이 가이드를 마치며

축하합니다! 🎉

이제 여러분은 AI와 함께 프로덕션급 웹 애플리케이션을 개발하고 배포하며 운영할 수 있습니다.

---

### 핵심 원칙 (다시 한 번)

1. **명확한 요구사항** → AI가 정확히 이해
2. **단계별 검증** → 문제 조기 발견
3. **자동화 우선** → 휴먼 에러 방지
4. **모니터링 필수** → 문제 빠른 대응
5. **지속적 학습** → 계속 개선

---

## 14. 트러블슈팅 가이드

### 14.1 빌드 오류 해결

#### 체크리스트

```
[ ] package.json 문법 확인
    → JSON 문법 오류? (쉼표, 따옴표)
    
[ ] node_modules 삭제 후 재설치
    rm -rf node_modules package-lock.json
    npm install
    
[ ] .env 파일 확인
    → 필수 환경 변수 누락?
    → 따옴표 필요 없음
    
[ ] TypeScript 에러 확인
    npm run type-check
    
[ ] npm run build 로컬 테스트
    → 로컬에서 빌드 성공하는지 확인
```

---

#### 일반적 빌드 에러

**1. "Module not found"**
```bash
Error: Cannot find module 'next-auth'

해결:
npm install next-auth
# 또는
npm install  # 전체 재설치
```

**2. "TypeScript error"**
```bash
Type 'string | undefined' is not assignable to type 'string'

해결:
// ❌ 잘못
const name: string = user.name

// ✅ 올바름
const name: string = user.name ?? 'Unknown'
// 또는
const name: string | undefined = user.name
```

**3. "Build exceeded maximum duration"**
```bash
Vercel: Build time > 45분

해결:
1. 불필요한 dependencies 제거
2. node_modules 캐싱 확인
3. 빌드 병렬화
4. Pro 플랜 고려 (시간 제한 완화)
```

---

### 14.2 배포 실패 해결

#### Vercel 배포 체크리스트

```
[ ] 환경 변수 설정 확인
    Vercel Dashboard → Settings → Environment Variables
    → Production 환경에 설정했는지
    
[ ] 빌드 로그 확인
    Vercel → Deployments → 실패한 배포 클릭
    → 정확한 에러 메시지 확인
    
[ ] 도메인 설정 확인
    → DNS 레코드 올바른지
    → SSL 인증서 발급됨
    
[ ] API 엔드포인트 확인
    → 환경 변수의 URL 올바른지
    → NEXT_PUBLIC_ 접두사 필요한지
    
[ ] Framework Preset 확인
    Settings → General → Framework Preset: Next.js
    
[ ] Node.js 버전 확인
    package.json:
    "engines": {
      "node": ">=18.0.0"
    }
```

---

#### 일반적 배포 에러

**1. "Internal Server Error (500)"**
```bash
배포는 성공했지만 500 에러

해결 순서:
1. Vercel 로그 확인
   vercel logs --prod
   
2. 환경 변수 누락 확인
   DATABASE_URL?
   NEXTAUTH_SECRET?
   
3. DB 연결 테스트
   API route로 간단한 쿼리 실행
```

**2. "Function exceeded timeout"**
```bash
Serverless Function 10초 초과

해결:
1. 쿼리 최적화
2. 백그라운드 작업은 별도 서비스
3. Pro 플랜 (60초)
```

**3. "Edge Function error"**
```bash
Edge Runtime에서 에러

해결:
export const runtime = 'nodejs'  // Edge 대신
```

---

### 14.3 런타임 에러 대응

#### 에러 발생 시 순서

```
1단계: 에러 확인
[ ] Sentry 대시보드
[ ] Vercel 로그
[ ] 브라우저 콘솔 (F12)

2단계: 영향 범위 파악
[ ] 모든 사용자?
[ ] 특정 브라우저만?
[ ] 특정 기능만?

3단계: 임시 조치
[ ] 해당 기능 비활성화 (Feature Flag)
[ ] 이전 버전 롤백

4단계: 근본 원인 해결
[ ] 버그 수정
[ ] 테스트
[ ] 배포
```

---

#### 일반적 런타임 에러

**1. "Cannot read property of undefined"**
```typescript
// ❌ 에러 발생
const userName = user.profile.name

// ✅ 해결 1: Optional Chaining
const userName = user?.profile?.name ?? 'Guest'

// ✅ 해결 2: 조건부 렌더링
{user?.profile?.name && <div>{user.profile.name}</div>}
```

**2. "CORS error"**
```typescript
// API route에 헤더 추가
export async function GET() {
  return Response.json(data, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
    }
  })
}
```

**3. "Hydration mismatch"**
```typescript
// ❌ 서버와 클라이언트 결과 다름
<div>{new Date().toLocaleString()}</div>

// ✅ 클라이언트 전용
'use client'

const [time, setTime] = useState('')

useEffect(() => {
  setTime(new Date().toLocaleString())
}, [])

return <div>{time}</div>
```

**4. "Maximum update depth exceeded"**
```typescript
// ❌ 무한 루프
useEffect(() => {
  setCount(count + 1)  // 의존성 배열 없음!
})

// ✅ 의존성 명시
useEffect(() => {
  setCount(count + 1)
}, [])  // 빈 배열 = 한 번만
```

---

### 14.4 성능 문제 진단

#### 느린 페이지 체크리스트

```
[ ] Lighthouse 점수 확인
    Chrome DevTools → Lighthouse
    → 점수 50 미만? 문제 있음
    
[ ] 느린 API 식별
    Chrome DevTools → Network
    → 1초 이상 걸리는 요청?
    
[ ] DB 쿼리 최적화
    → N+1 쿼리 문제?
    → 인덱스 없음?
    
[ ] 이미지 최적화
    → WebP 사용?
    → 리사이징?
    → Lazy loading?
    
[ ] 번들 크기 확인
    npm run build
    → .next/static/chunks 크기
    
[ ] 불필요한 리렌더링
    React DevTools → Profiler
```

---

#### 성능 개선 액션

**1. 이미지 최적화**
```typescript
// ❌ 느림
<img src="/large-image.png" />

// ✅ 빠름
import Image from 'next/image'

<Image 
  src="/large-image.png"
  width={800}
  height={600}
  alt="설명"
  loading="lazy"
/>
```

**2. API 병렬 호출**
```typescript
// ❌ 순차 (3초 + 2초 + 1초 = 6초)
const users = await fetchUsers()
const posts = await fetchPosts()
const comments = await fetchComments()

// ✅ 병렬 (max(3, 2, 1) = 3초)
const [users, posts, comments] = await Promise.all([
  fetchUsers(),
  fetchPosts(),
  fetchComments()
])
```

**3. 코드 스플리팅**
```typescript
// ❌ 모든 페이지에 Chart.js 로드
import Chart from 'chart.js'

// ✅ 필요한 페이지만
const Chart = dynamic(() => import('chart.js'), {
  ssr: false
})
```

**4. DB 쿼리 최적화**
```typescript
// ❌ N+1 문제
const posts = await prisma.post.findMany()
for (const post of posts) {
  post.author = await prisma.user.findUnique({
    where: { id: post.authorId }
  })
}

// ✅ include 사용
const posts = await prisma.post.findMany({
  include: { author: true }
})
```

---

### 14.5 데이터베이스 문제

#### 일반적 DB 에러

**1. "Connection timeout"**
```bash
해결:
1. DB 서버 상태 확인
2. 연결 문자열 확인
3. 방화벽/네트워크 확인
4. 최대 연결 수 확인
```

**2. "Too many connections"**
```typescript
// ❌ 연결 풀 고갈
const prisma = new PrismaClient()  // 매번 새로 생성

// ✅ 싱글톤 패턴
// lib/prisma.ts
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**3. "Unique constraint failed"**
```typescript
// 해결: 먼저 확인 후 생성
const existing = await prisma.user.findUnique({
  where: { email }
})

if (existing) {
  throw new Error('이미 존재하는 이메일')
}

const user = await prisma.user.create({
  data: { email, name }
})
```

---

### 14.6 인증 문제

**1. "Session not found"**
```typescript
// 해결: 쿠키 설정 확인
// [...nextauth]/route.ts
export const authOptions = {
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  }
}
```

**2. "Callback URL mismatch"**
```bash
OAuth 에러

해결:
1. Google Console → Authorized redirect URIs
   추가: https://your-app.com/api/auth/callback/google
   
2. 환경 변수 확인
   NEXTAUTH_URL=https://your-app.com
```

---

### 14.7 일반적 에러 모음

#### Client-Side 에러

```typescript
// "localStorage is not defined"
// → SSR에서 접근
if (typeof window !== 'undefined') {
  localStorage.setItem('key', 'value')
}

// "window is not defined"
// → 'use client' 추가 또는 dynamic import
const Component = dynamic(() => import('./Component'), {
  ssr: false
})

// "React Hook useEffect has missing dependency"
// → 의존성 배열 추가
useEffect(() => {
  fetchData()
}, [fetchData])  // 또는 useCallback으로 감싸기
```

---

#### Server-Side 에러

```typescript
// "Cannot use import statement outside module"
// → package.json에 "type": "module" 확인

// "Module parse failed"
// → .tsx 파일인데 TypeScript 설정 없음

// "Invalid hook call"
// → use client 컴포넌트에서만 hooks 사용
```

---

### 14.8 긴급 상황 대응

#### 서비스 완전 다운

```
즉시 조치:
1. 이전 버전 롤백
   vercel rollback
   
2. 고객 공지
   - 상태 페이지 업데이트
   - 트위터/이메일 공지
   
3. 원인 파악
   - Sentry 로그
   - Vercel 로그
   - DB 상태
   
4. 임시 수정
   - Feature Flag 비활성화
   - 문제 API 제거
   
5. 근본 해결
   - 버그 수정
   - 테스트
   - 재배포
```

---

#### 데이터 손실

```
즉시 조치:
1. 서비스 중단 (추가 손실 방지)

2. 백업 복원
   pg_restore -d mydb backup.sql
   
3. 영향 범위 파악
   - 손실된 데이터 확인
   - 영향받은 사용자 확인
   
4. 고객 공지
   - 투명하게 설명
   - 복구 계획 공유
   
5. 재발 방지
   - 백업 빈도 증가
   - 롤백 절차 개선
```

---

### 14.9 디버깅 도구

#### Chrome DevTools

```
유용한 기능:
- Network: API 응답 시간
- Performance: 렌더링 병목
- Console: 로그 확인
- Application: localStorage, cookies
- Lighthouse: 성능 점수
```

#### VS Code 디버깅

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

---

### 14.10 도움 요청하기

#### 효과적인 질문

**❌ 나쁜 질문:**
```
"안 돼요"
"에러 나요"
"작동 안 해요"
```

**✅ 좋은 질문:**
```
제목: [Next.js 14] 빌드 시 Prisma 에러 발생

환경:
- Next.js: 14.0.4
- Prisma: 5.7.0
- Node: 18.17.0
- OS: macOS 14.0

에러 메시지:
Error: @prisma/client did not initialize yet. 
Please run "prisma generate" and try to import it again.

재현 방법:
1. npm run build
2. 위 에러 발생

시도한 것:
- npx prisma generate 실행
- node_modules 삭제 후 재설치
- .env 파일 확인

관련 코드:
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'
...
```

---

### 14.11 예방 조치

```
배포 전:
[ ] 로컬에서 프로덕션 빌드 테스트
[ ] Lighthouse 점수 확인
[ ] 핵심 기능 수동 테스트
[ ] 에러 바운더리 설정
[ ] 로깅 설정

배포 후:
[ ] 1시간 모니터링
[ ] 에러율 확인
[ ] 성능 메트릭 확인
[ ] 사용자 피드백 확인

정기적:
[ ] 의존성 업데이트
[ ] 보안 패치
[ ] 백업 테스트
[ ] 롤백 연습
```

---

### 지속적 개선

```
매 배포마다:
→ 무엇이 잘 되었나?
→ 무엇을 개선할 수 있나?
→ 다음엔 어떻게 할까?

매 인시던트마다:
→ 포스트모템 작성
→ 재발 방지 계획
→ 프로세스 개선
```

---

### 다음 프로젝트는?

이 가이드의 모든 지식을 활용하여 더 나은 프로젝트를 만들어보세요!

화이팅! 💪
