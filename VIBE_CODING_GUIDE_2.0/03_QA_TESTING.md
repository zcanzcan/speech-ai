# 03. 검증 & 테스트

**AI 협업 개발 가이드 - Part 3**

[← 이전: 02. 개발](./02_DEVELOPMENT.md) | [목차](./README.md) | [다음: 04. 배포 →](./04_DEPLOYMENT.md)

---

## 📋 목차

1. [로컬 테스트](#1-로컬-테스트)
2. [성능 최적화](#2-성능-최적화)
3. [크로스 브라우저 테스트](#3-크로스-브라우저-테스트)
4. [보안 검증](#4-보안-검증)
5. [테스트 자동화](#5-테스트-자동화)
6. [접근성 검사](#6-접근성-검사)
7. [체크리스트](#7-체크리스트)

---

## 1. 로컬 테스트

### 1.1 개발 서버 테스트

#### A. 기본 동작 확인

```bash
# 개발 서버 실행
npm run dev

# 체크리스트
[ ] 서버 정상 시작
[ ] 포트 충돌 없음
[ ] 콘솔 에러 없음
[ ] Hot Reload 동작
[ ] 환경 변수 로드
```

#### B. 주요 페이지 확인

```
[ ] 홈페이지 (/)
[ ] 로그인 (/login)
[ ] 회원가입 (/signup)
[ ] 대시보드 (/dashboard)
[ ] 404 페이지
[ ] 500 에러 페이지
```

---

### 1.2 프로덕션 빌드 테스트

**중요: 로컬 개발과 프로덕션은 다르게 동작할 수 있음**

```bash
# 프로덕션 빌드
npm run build

# 체크리스트
[ ] 빌드 성공
[ ] 타입 에러 없음
[ ] 린트 통과
[ ] 번들 크기 확인
[ ] 불필요한 의존성 없음

# 프로덕션 모드 실행
npm run start

# 테스트
[ ] 모든 페이지 정상 작동
[ ] API 연동 정상
[ ] 환경 변수 인식
[ ] 이미지 최적화 적용
[ ] CSS 적용
```

---

### 1.3 핵심 기능 시나리오 테스트

#### 시나리오 작성 예시

**기능: 사용자 로그인**

```
## 정상 시나리오
1. /login 페이지 접속
2. 이메일 입력: user@example.com
3. 비밀번호 입력: Passw0rd!
4. "로그인" 버튼 클릭
5. 예상 결과:
   - /dashboard로 리다이렉트
   - "환영합니다, [이름]" 메시지 표시
   - 로그아웃 버튼 표시

## 에러 시나리오 1: 잘못된 비밀번호
1. /login 페이지 접속
2. 이메일 입력: user@example.com
3. 비밀번호 입력: wrong123
4. "로그인" 버튼 클릭
5. 예상 결과:
   - "이메일 또는 비밀번호가 올바르지 않습니다" 메시지
   - 페이지 유지

## 에러 시나리오 2: 네트워크 오류
1. 개발자 도구 → Network → Offline 모드
2. 로그인 시도
3. 예상 결과:
   - "네트워크 오류. 인터넷 연결을 확인해주세요" 메시지
   - 재시도 버튼 표시

## 에러 시나리오 3: 빈 입력
1. 아무것도 입력하지 않고 "로그인" 클릭
2. 예상 결과:
   - 이메일 필드에 "이메일을 입력해주세요" 에러
   - 비밀번호 필드에 "비밀번호를 입력해주세요" 에러
```

---

### 1.4 엣지 케이스 테스트

**필수 엣지 케이스 10개**

```
1. 빈 입력 (공백, null, undefined)
2. 매우 긴 입력 (1000자 이상)
3. 특수 문자 ('<script>', SQL injection)
4. 이모지 / 한글 초성
5. 동시 요청 (중복 클릭)
6. 느린 네트워크 (Throttling)
7. 권한 없는 접근
8. 만료된 토큰
9. 큰 파일 업로드 (>10MB)
10. 오래된 브라우저 (IE11)
```

---

## 2. 성능 최적화

### 2.1 Lighthouse 측정

#### 설정
```bash
# Chrome DevTools
F12 → Lighthouse 탭

# 또는 CLI
npm install -g lighthouse
lighthouse https://your-site.com --view
```

#### 목표 점수
```
Performance:   90+
Accessibility: 90+
Best Practices: 90+
SEO:           90+
```

---

#### Lighthouse CI 자동화

**설치:**
```bash
npm install -g @lhci/cli
npm install --save-dev @lhci/cli
```

**lighthouserc.js 설정:**
```javascript
module.exports = {
  ci: {
    collect: {
      // 테스트할 URL
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/about',
        'http://localhost:3000/products',
      ],
      // 각 URL 3회 측정
      numberOfRuns: 3,
      // 서버 시작 명령
      startServerCommand: 'npm run start',
      startServerReadyPattern: 'ready on',
    },
    assert: {
      // 임계값 설정
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        
        // Core Web Vitals
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
      },
    },
    upload: {
      // Lighthouse CI Server (선택)
      target: 'temporary-public-storage',
    },
  },
};
```

**GitHub Actions:**
```yaml
name: Lighthouse CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
      
      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: lighthouse-results
          path: .lighthouseci
```

**실행:**
```bash
# 로컬 테스트
lhci autorun

# CI에서 자동 실행
# GitHub Actions가 매 PR마다 자동 실행
```

**PR에서 자동 코멘트:**
```
📊 Lighthouse CI Results

Performance: 92 ✅
Accessibility: 95 ✅
Best Practices: 88 ⚠️ (목표: 90)
SEO: 100 ✅

⚠️ Regressions detected:
- Total Blocking Time increased by 150ms
```

---

#### Lighthouse CI Server (선택)

**Docker로 실행:**
```bash
docker run -p 9001:9001 patrickhulce/lhci-server
```

**설정:**
```javascript
// lighthouserc.js
module.exports = {
  ci: {
    upload: {
      target: 'lhci',
      serverBaseUrl: 'http://localhost:9001',
      token: 'your-build-token',
    },
  },
};
```

**이점:**
- 성능 추이 그래프
- PR별 비교
- 히스토리 저장
- 팀 대시보드

---

### 2.2 성능 개선 체크리스트

#### A. 이미지 최적화

```typescript
// Next.js Image 컴포넌트 사용
import Image from 'next/image'

export function ProductImage({ src, alt }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={600}
      quality={85}
      priority={false}  // 첫 화면 아니면 false
      placeholder="blur"
      blurDataURL="data:image/..."
    />
  )
}
```

**체크리스트:**
```
[ ] WebP 또는 AVIF 포맷 사용
[ ] 적절한 크기 (2x 해상도 고려)
[ ] Lazy loading 적용
[ ] CDN 사용 (Cloudflare, Vercel)
[ ] 압축 (TinyPNG, Squoosh)
```

---

#### B. 번들 크기 최적화

```bash
# 번들 분석
npm run build
ANALYZE=true npm run build

# 또는
npm install -D @next/bundle-analyzer
```

**최적화 방법:**
```typescript
// 1. 동적 import
const HeavyComponent = dynamic(() => import('./HeavyComponent'))

// 2. Tree shaking (lodash)
// ❌ import _ from 'lodash'
// ✅ import debounce from 'lodash/debounce'

// 3. 조건부 import
if (process.env.NODE_ENV === 'development') {
  import('why-did-you-render').then(whyDidYouRender => {
    whyDidYouRender(React)
  })
}
```

**목표:**
```
First Load JS: < 200 KB
Total JS:      < 1 MB
```

---

#### C. 캐싱 전략

```typescript
// Next.js App Router
export const revalidate = 3600  // 1시간

// API Route 캐싱
export async function GET() {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  })
}
```

---

#### D. 데이터베이스 쿼리 최적화

```typescript
// ❌ N+1 문제
const users = await prisma.user.findMany()
for (const user of users) {
  const posts = await prisma.post.findMany({ where: { userId: user.id } })
}

// ✅ include로 한 번에
const users = await prisma.user.findMany({
  include: { posts: true }
})

// ✅ 필요한 필드만 select
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true
  }
})
```

---

### 2.3 Core Web Vitals 최적화

#### LCP (Largest Contentful Paint) < 2.5s

```typescript
// 1. 우선순위 높은 이미지
<Image src="/hero.jpg" priority />

// 2. 폰트 최적화
import { Inter } from 'next/font/google'
const inter = Inter({
  subsets: ['latin'],
  display: 'swap'
})

// 3. 서버 컴포넌트 활용 (Next.js 14+)
export default async function Page() {
  const data = await fetchData()  // 서버에서 실행
  return <ClientComponent data={data} />
}
```

---

#### CLS (Cumulative Layout Shift) < 0.1

```css
/* 이미지/동영상 공간 예약 */
.image-container {
  aspect-ratio: 16 / 9;
  width: 100%;
}

/* 폰트 로딩 최적화 */
@font-face {
  font-family: 'Custom';
  font-display: swap;  /* FOUT 방지 */
}
```

---

#### FID (First Input Delay) < 100ms

```typescript
// 1. 코드 분할
const Analytics = dynamic(() => import('./Analytics'), {
  ssr: false
})

// 2. 긴 작업 분할
async function processItems(items) {
  for (const item of items) {
    await processItem(item)
    await new Promise(resolve => setTimeout(resolve, 0))  // Yield
  }
}
```

---

## 3. 크로스 브라우저 테스트

### 3.1 필수 테스트 브라우저

```
## Desktop
[ ] Chrome (최신)
[ ] Firefox (최신)
[ ] Safari (최신)
[ ] Edge (최신)

## Mobile
[ ] iOS Safari
[ ] Android Chrome
[ ] Samsung Internet

## 선택 (사용자 비율 > 5%)
[ ] Opera
[ ] Brave
```

---

### 3.2 브라우저별 이슈 해결

#### A. Safari 관련

```css
/* Flexbox gap 이슈 (Safari 14.0 이하) */
.flex-container {
  display: flex;
  gap: 1rem;
}

/* Fallback */
@supports not (gap: 1rem) {
  .flex-container > * + * {
    margin-left: 1rem;
  }
}
```

```javascript
// Date 파싱 이슈
// ❌ new Date('2025-01-29')  // Safari에서 Invalid Date
// ✅ new Date('2025/01/29')
// ✅ new Date('2025-01-29T00:00:00')
```

---

#### B. iOS Safari

```css
/* 100vh 이슈 */
.full-height {
  height: 100vh;
  height: 100dvh;  /* Dynamic viewport height */
}

/* 버튼 스타일 초기화 */
button {
  -webkit-appearance: none;
  appearance: none;
}
```

```javascript
// 스크롤 이슈
document.body.style.overflow = 'hidden'  // iOS에서 동작 안 함
// ✅ position: fixed 사용
```

---

### 3.3 모바일 테스트 전략

#### A. 실제 디바이스 테스트

**필수 테스트 디바이스:**
```
iOS:
[ ] iPhone 14/15 (최신)
[ ] iPhone SE (소형)
[ ] iPad (태블릿)

Android:
[ ] Samsung Galaxy S23 (최신)
[ ] Pixel 7 (순정)
[ ] 저사양 폰 (Android 10 이하)
```

**BrowserStack / LambdaTest 활용:**
```bash
# 무료 플랜으로 시작
# https://www.browserstack.com
# https://www.lambdatest.com

# 실제 디바이스 원격 접속
# iOS 16, 17 테스트
# Android 11, 12, 13, 14 테스트
```

---

#### B. iOS Safari 특수 이슈

**1. 터치 이벤트**
```typescript
// ❌ 클릭 지연 (300ms delay)
<button onClick={handleClick}>클릭</button>

// ✅ 터치 이벤트 사용
<button 
  onTouchStart={handleClick}
  onClick={handleClick}  // 폴백
>
  클릭
</button>

// ✅ CSS로 해결 (권장)
button {
  touch-action: manipulation;  // 300ms 지연 제거
}
```

**2. 100vh 문제**
```css
/* ❌ 주소창 때문에 잘림 */
.full-screen {
  height: 100vh;
}

/* ✅ 동적 뷰포트 (iOS 15+) */
.full-screen {
  height: 100vh;
  height: 100dvh;  /* Dynamic viewport height */
}

/* ✅ JavaScript 대안 */
.full-screen {
  height: calc(var(--vh, 1vh) * 100);
}
```

```typescript
// JavaScript로 실제 높이 계산
function setVH() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

window.addEventListener('resize', setVH);
setVH();
```

**3. 스크롤 고정 이슈**
```css
/* ❌ iOS에서 동작 안 함 */
body {
  overflow: hidden;
}

/* ✅ position: fixed 사용 */
body.modal-open {
  position: fixed;
  width: 100%;
  overflow-y: scroll;
}
```

**4. 입력 포커스 시 확대 방지**
```html
<!-- ❌ 자동 확대됨 (font-size < 16px) -->
<input style="font-size: 14px" />

<!-- ✅ 확대 방지 -->
<input style="font-size: 16px" />

<!-- 또는 뷰포트 설정 -->
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
```

**5. Date 파싱 이슈**
```javascript
// ❌ Safari에서 Invalid Date
new Date('2025-01-29')

// ✅ ISO 포맷 또는 슬래시
new Date('2025-01-29T00:00:00')
new Date('2025/01/29')
```

---

#### C. Android Chrome 특수 이슈

**1. 뒤로가기 버튼 처리**
```typescript
// Android 뒤로가기 버튼 감지
useEffect(() => {
  const handlePopState = () => {
    if (isModalOpen) {
      closeModal();
      window.history.pushState(null, '', window.location.href);
    }
  };
  
  window.addEventListener('popstate', handlePopState);
  return () => window.removeEventListener('popstate', handlePopState);
}, [isModalOpen]);
```

**2. Pull-to-Refresh 비활성화**
```css
/* 특정 영역에서 Pull-to-Refresh 방지 */
.scrollable-content {
  overscroll-behavior-y: contain;
}

body {
  overscroll-behavior: none;
}
```

**3. 주소창 색상**
```html
<!-- Android Chrome 테마 색상 -->
<meta name="theme-color" content="#3b82f6">
```

---

#### D. 터치 제스처 테스트

```
필수 제스처:
[ ] 탭 (Tap)
[ ] 더블 탭 (Double Tap)
[ ] 길게 누르기 (Long Press)
[ ] 스와이프 (Swipe)
[ ] 핀치 줌 (Pinch Zoom)
[ ] 스크롤 (Scroll)
[ ] 드래그 (Drag)

확인 사항:
[ ] 제스처 간 충돌 없음
[ ] 반응 속도 적절
[ ] 시각적 피드백 (리플 효과 등)
```

**터치 영역 크기:**
```css
/* 최소 터치 영역: 44x44px (Apple HIG) */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  
  /* 시각적으로 작아도 클릭 영역 확보 */
  padding: 12px;
}
```

---

#### E. 모바일 성능 테스트

**1. 3G/4G 환경 시뮬레이션**
```bash
# Chrome DevTools
F12 → Network → Throttling → Fast 3G / Slow 3G

# Lighthouse
lighthouse https://your-site.com --throttling-method=devtools
```

**2. 모바일 CPU 제한**
```bash
# Chrome DevTools
F12 → Performance → CPU → 4x slowdown
```

**3. 배터리 소모 테스트**
```typescript
// 과도한 애니메이션 방지
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

---

#### F. 실제 디바이스 디버깅

**iOS Safari 디버깅:**
```bash
# Mac에서 iPhone 연결
1. iPhone → 설정 → Safari → 고급 → 웹 속성 활성화
2. Mac → Safari → 개발 → [iPhone 이름]
3. 웹 인스펙터 사용
```

**Android Chrome 디버깅:**
```bash
# USB 디버깅 활성화
1. 설정 → 휴대전화 정보 → 빌드 번호 7번 탭
2. 개발자 옵션 → USB 디버깅 활성화
3. chrome://inspect 접속
4. 디바이스 선택 후 inspect
```

---

### 3.4 반응형 테스트

#### 테스트 해상도

```
## Mobile
[ ] 320px (iPhone SE)
[ ] 375px (iPhone 12/13)
[ ] 390px (iPhone 14)
[ ] 414px (iPhone 14 Plus)

## Tablet
[ ] 768px (iPad)
[ ] 820px (iPad Air)
[ ] 1024px (iPad Pro)

## Desktop
[ ] 1280px (Laptop)
[ ] 1920px (Desktop)
[ ] 2560px (4K)
```

#### 체크리스트

```
[ ] 텍스트 크기 읽기 가능
[ ] 터치 타겟 최소 44x44px
[ ] 가로 스크롤 없음
[ ] 이미지 비율 유지
[ ] 네비게이션 접근 가능
[ ] 폼 입력 편리
[ ] CTA 버튼 명확
```

---

## 4. 보안 검증

### 4.1 OWASP Top 10 체크리스트

#### 1. Broken Access Control

```typescript
// ❌ 권한 검증 없음
export async function DELETE(request: Request) {
  const { id } = await request.json()
  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ success: true })
}

// ✅ 권한 검증
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { id } = await request.json()
  
  // 본인 또는 관리자만 삭제 가능
  if (session.user.id !== id && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
```

---

#### 2. Cryptographic Failures

```typescript
// ✅ 비밀번호 해싱
import bcrypt from 'bcryptjs'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)  // 최소 10 이상
}

// ✅ HTTPS 강제
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          }
        ]
      }
    ]
  }
}
```

---

#### 3. Injection (SQL, XSS)

```typescript
// ✅ SQL Injection 방지 (ORM 사용)
const users = await prisma.user.findMany({
  where: { email: userInput }  // 자동 이스케이핑
})

// ✅ XSS 방지 (React는 기본적으로 이스케이프)
<div>{userInput}</div>  // 안전

// ⚠️ dangerouslySetInnerHTML 사용 시 Sanitize
import DOMPurify from 'isomorphic-dompurify'

<div dangerouslySetInnerHTML={{
  __html: DOMPurify.sanitize(userHtml)
}} />
```

---

#### 4. CSRF 방지

```typescript
// NextAuth.js는 자동으로 CSRF 토큰 처리

// 커스텀 API의 경우
import { getCsrfToken } from 'next-auth/react'

export async function submitForm(data: FormData) {
  const csrfToken = await getCsrfToken()
  
  return fetch('/api/form', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken
    },
    body: JSON.stringify(data)
  })
}
```

---

#### 5. Rate Limiting

```typescript
// API Route에 Rate Limiting 적용
import rateLimit from 'express-rate-limit'
import slowDown from 'express-slow-down'

// 1분에 10 요청
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many requests'
})

// 또는 Vercel Edge Config 사용
import { kv } from '@vercel/kv'

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')
  const key = `rate-limit:${ip}`
  
  const count = await kv.incr(key)
  await kv.expire(key, 60)
  
  if (count > 10) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  }
  
  // 처리 로직
}
```

---

### 4.2 보안 헤더 설정

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ]
  }
}
```

---

### 4.3 npm audit

```bash
# 취약점 검사
npm audit

# 심각도별 확인
npm audit --production  # 프로덕션 의존성만

# 자동 수정
npm audit fix

# 강제 수정 (주의)
npm audit fix --force

# 상세 보고서
npm audit --json > audit-report.json
```

**심각도 기준:**
```
Critical: 즉시 수정 필요
High:     24시간 내 수정
Medium:   1주일 내 수정
Low:      다음 배포 시 수정
```

---

### 4.4 보안 스캔 자동화

#### A. Snyk (의존성 취약점)

**설치 & 설정:**
```bash
# CLI 설치
npm install -g snyk

# 인증
snyk auth

# 프로젝트 스캔
snyk test

# 자동 수정
snyk wizard
```

**GitHub Actions 통합:**
```yaml
name: Security Scan

on:
  push:
    branches: [main, develop]
  pull_request:
  schedule:
    - cron: '0 0 * * *'  # 매일 자정

jobs:
  snyk:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Snyk to check for vulnerabilities
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
```

---

#### B. SonarQube (코드 품질)

**docker-compose.yml:**
```yaml
services:
  sonarqube:
    image: sonarqube:community
    ports:
      - "9000:9000"
    environment:
      - SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true
```

**sonar-project.properties:**
```properties
sonar.projectKey=my-project
sonar.projectName=My Project
sonar.projectVersion=1.0

sonar.sources=src
sonar.tests=tests
sonar.test.inclusions=**/*.test.ts,**/*.test.tsx

sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.testExecutionReportPaths=test-report.xml

sonar.exclusions=**/node_modules/**,**/*.test.ts
```

**실행:**
```bash
# 스캔 실행
npx sonar-scanner \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=<your-token>
```

**GitHub Actions:**
```yaml
- name: SonarQube Scan
  uses: sonarsource/sonarqube-scan-action@master
  env:
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
    SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
```

---

#### C. Semgrep (정적 분석)

**설치:**
```bash
pip install semgrep
```

**기본 스캔:**
```bash
# 보안 취약점 스캔
semgrep --config=p/security-audit

# XSS, SQL Injection 등
semgrep --config=p/owasp-top-ten

# 언어별 룰셋
semgrep --config=p/javascript
semgrep --config=p/typescript
```

**.semgrep.yml (커스텀 룰):**
```yaml
rules:
  - id: hardcoded-secret
    pattern: |
      const $VAR = "$SECRET"
    message: Possible hardcoded secret
    severity: ERROR
    languages: [typescript]
    
  - id: sql-injection
    pattern: |
      db.query(`SELECT * FROM users WHERE id = ${$ID}`)
    message: Possible SQL injection
    severity: ERROR
    languages: [typescript]
    
  - id: dangerous-eval
    pattern: eval($CODE)
    message: Dangerous use of eval()
    severity: WARNING
    languages: [javascript, typescript]
```

**GitHub Actions:**
```yaml
- name: Semgrep Scan
  uses: returntocorp/semgrep-action@v1
  with:
    config: p/security-audit
```

---

#### D. OWASP ZAP (동적 분석)

**Docker로 실행:**
```bash
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://your-site.com \
  -r zap-report.html
```

**GitHub Actions (Staging 배포 후):**
```yaml
- name: OWASP ZAP Baseline Scan
  uses: zaproxy/action-baseline@v0.7.0
  with:
    target: 'https://staging.your-site.com'
    rules_file_name: '.zap/rules.tsv'
    cmd_options: '-a'
```

**.zap/rules.tsv (무시할 경고):**
```
10021	IGNORE	(X-Content-Type-Options header missing)
10202	IGNORE	(Absence of Anti-CSRF Tokens)
```

---

#### E. GitHub Security Features

**1. Dependabot 활성화:**
```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    reviewers:
      - "security-team"
    labels:
      - "dependencies"
      - "security"
```

**2. Secret Scanning 활성화:**
```
Settings → Security → Code security and analysis
✅ Secret scanning
✅ Push protection (실수로 시크릿 커밋 방지)
```

**3. Code Scanning (CodeQL):**
```yaml
# .github/workflows/codeql.yml
name: CodeQL

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0'  # 매주 일요일

jobs:
  analyze:
    runs-on: ubuntu-latest
    
    permissions:
      security-events: write
    
    strategy:
      matrix:
        language: ['javascript', 'typescript']
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Initialize CodeQL
        uses: github/codeql-action/init@v2
        with:
          languages: ${{ matrix.language }}
      
      - name: Autobuild
        uses: github/codeql-action/autobuild@v2
      
      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v2
```

---

#### F. 종합 보안 워크플로우

**.github/workflows/security.yml:**
```yaml
name: Security Checks

on:
  push:
    branches: [main, develop]
  pull_request:
  schedule:
    - cron: '0 2 * * *'  # 매일 새벽 2시

jobs:
  dependency-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      # npm audit
      - name: npm audit
        run: |
          npm audit --audit-level=high
      
      # Snyk
      - name: Snyk scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
  
  code-analysis:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      # Semgrep
      - name: Semgrep scan
        uses: returntocorp/semgrep-action@v1
        with:
          config: p/security-audit
      
      # SonarQube
      - name: SonarQube scan
        uses: sonarsource/sonarqube-scan-action@master
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
  
  secret-detection:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      # TruffleHog (시크릿 감지)
      - name: TruffleHog scan
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: main
          head: HEAD
```

---

#### G. 보안 스캔 체크리스트

```
의존성:
[ ] npm audit (매일)
[ ] Snyk (매일)
[ ] Dependabot PR 리뷰

코드 품질:
[ ] SonarQube (매 PR)
[ ] Semgrep (매 PR)
[ ] CodeQL (주 1회)

동적 분석:
[ ] OWASP ZAP (Staging 배포 후)
[ ] Burp Suite (수동, 월 1회)

시크릿 감지:
[ ] TruffleHog (매 커밋)
[ ] GitHub Secret Scanning
[ ] git-secrets (로컬)

컨테이너:
[ ] Trivy (Docker 이미지 스캔)
[ ] Clair (컨테이너 취약점)

인프라:
[ ] Checkov (IaC 스캔)
[ ] Terraform security scan
```

---

## 5. 테스트 자동화

### 5.1 단위 테스트 (Jest)

```typescript
// src/utils/validation.test.ts
import { validateEmail, validatePassword } from './validation'

describe('validateEmail', () => {
  it('유효한 이메일 허용', () => {
    expect(validateEmail('user@example.com')).toBe(true)
  })
  
  it('잘못된 형식 거부', () => {
    expect(validateEmail('invalid-email')).toBe(false)
    expect(validateEmail('@example.com')).toBe(false)
    expect(validateEmail('user@')).toBe(false)
  })
  
  it('빈 문자열 거부', () => {
    expect(validateEmail('')).toBe(false)
  })
})

describe('validatePassword', () => {
  it('강한 비밀번호 허용', () => {
    expect(validatePassword('Passw0rd!')).toBe(true)
  })
  
  it('약한 비밀번호 거부', () => {
    expect(validatePassword('12345678')).toBe(false)
    expect(validatePassword('password')).toBe(false)
    expect(validatePassword('Pass1')).toBe(false)  // 너무 짧음
  })
})
```

---

### 5.2 통합 테스트 (React Testing Library)

```typescript
// src/components/LoginForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LoginForm } from './LoginForm'

describe('LoginForm', () => {
  it('폼 렌더링', () => {
    render(<LoginForm />)
    expect(screen.getByLabelText('이메일')).toBeInTheDocument()
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument()
  })
  
  it('입력 값 변경', () => {
    render(<LoginForm />)
    const emailInput = screen.getByLabelText('이메일')
    fireEvent.change(emailInput, { target: { value: 'user@example.com' } })
    expect(emailInput).toHaveValue('user@example.com')
  })
  
  it('빈 입력 시 에러 메시지', async () => {
    render(<LoginForm />)
    const submitButton = screen.getByRole('button', { name: '로그인' })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('이메일을 입력해주세요')).toBeInTheDocument()
    })
  })
  
  it('로그인 성공 시 리다이렉트', async () => {
    const mockRouter = jest.fn()
    render(<LoginForm onSuccess={mockRouter} />)
    
    // 입력
    fireEvent.change(screen.getByLabelText('이메일'), {
      target: { value: 'user@example.com' }
    })
    fireEvent.change(screen.getByLabelText('비밀번호'), {
      target: { value: 'Passw0rd!' }
    })
    
    // 제출
    fireEvent.click(screen.getByRole('button', { name: '로그인' }))
    
    await waitFor(() => {
      expect(mockRouter).toHaveBeenCalledWith('/dashboard')
    })
  })
})
```

---

### 5.3 E2E 테스트 (Playwright)

```typescript
// tests/e2e/login.spec.ts
import { test, expect } from '@playwright/test'

test.describe('로그인 플로우', () => {
  test('정상 로그인', async ({ page }) => {
    // 로그인 페이지 이동
    await page.goto('/login')
    
    // 폼 작성
    await page.fill('input[name="email"]', 'user@example.com')
    await page.fill('input[name="password"]', 'Passw0rd!')
    
    // 제출
    await page.click('button[type="submit"]')
    
    // 리다이렉트 확인
    await expect(page).toHaveURL('/dashboard')
    
    // 환영 메시지 확인
    await expect(page.locator('text=환영합니다')).toBeVisible()
  })
  
  test('잘못된 비밀번호', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'user@example.com')
    await page.fill('input[name="password"]', 'wrong123')
    await page.click('button[type="submit"]')
    
    // 에러 메시지 확인
    await expect(page.locator('text=이메일 또는 비밀번호가 올바르지 않습니다')).toBeVisible()
    
    // URL 변경 없음
    await expect(page).toHaveURL('/login')
  })
})
```

---

### 5.4 테스트 커버리지

```bash
# Jest 커버리지
npm run test -- --coverage

# 목표
Statements:   80%+
Branches:     75%+
Functions:    80%+
Lines:        80%+
```

---

### 5.5 CI/CD 자동 테스트 설정

#### A. GitHub Actions 워크플로우

**.github/workflows/test.yml:**
```yaml
name: Test & Quality Checks

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check
        run: npm run type-check
      
      - name: Lint
        run: npm run lint
      
      - name: Unit tests
        run: npm test -- --coverage
      
      - name: Build
        run: npm run build
        env:
          SKIP_ENV_VALIDATION: true
      
      # 커버리지 업로드
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./coverage/lcov.info

  e2e:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

#### B. 테스트 실패 시 머지 차단

**브랜치 보호 규칙 설정:**
```
GitHub Settings → Branches → Add rule

Branch name pattern: main

✅ Require status checks to pass before merging
  ✅ test (테스트 통과 필수)
  ✅ e2e (E2E 테스트 통과 필수)

✅ Require branches to be up to date before merging

✅ Require linear history (선택)
```

---

#### C. 자동 코드 리뷰 (선택)

**Danger.js 설정:**
```typescript
// dangerfile.ts
import { danger, warn, fail } from 'danger'

// PR 크기 체크
const bigPRThreshold = 500
if (danger.github.pr.additions + danger.github.pr.deletions > bigPRThreshold) {
  warn('⚠️ PR이 너무 큽니다. 작게 나눠주세요.')
}

// 테스트 파일 체크
const hasAppChanges = danger.git.modified_files.some(f => f.includes('src/'))
const hasTestChanges = danger.git.modified_files.some(f => f.includes('.test.'))

if (hasAppChanges && !hasTestChanges) {
  warn('⚠️ 테스트 파일이 수정되지 않았습니다.')
}

// package.json 변경 시 경고
const packageChanged = danger.git.modified_files.includes('package.json')
const lockfileChanged = danger.git.modified_files.includes('package-lock.json')

if (packageChanged && !lockfileChanged) {
  fail('❌ package.json 변경 시 package-lock.json도 커밋해야 합니다.')
}
```

---

#### D. 자동 배포 (Vercel)

**.github/workflows/deploy.yml:**
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    # 테스트 통과 후에만 배포
    needs: [test, e2e]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Install Vercel CLI
        run: npm install --global vercel@latest
      
      - name: Pull Vercel Environment
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Build Project
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Deploy to Vercel
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

#### E. Preview 배포 자동 테스트

**모든 PR에 자동 Preview 생성:**
```yaml
# Vercel 자동 설정 (vercel.json 불필요)
# PR 생성 시 자동으로 Preview URL 생성

# Preview 환경에서 E2E 테스트 실행
name: Test Preview Deployment

on:
  pull_request:

jobs:
  test-preview:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      # Vercel deployment URL 대기
      - name: Wait for Vercel Preview
        uses: UnlyEd/github-action-await-vercel@v1
        with:
          deployment-url: ${{ steps.vercel.outputs.url }}
          timeout: 300
      
      # Preview URL에서 E2E 테스트
      - name: Run E2E on Preview
        run: |
          export BASE_URL=${{ steps.vercel.outputs.url }}
          npm run test:e2e
```

---

### 5.6 API 테스트 전략

#### A. REST API 테스트 (Supertest)

```typescript
// tests/api/user.test.ts
import request from 'supertest'
import { app } from '@/app'

describe('User API', () => {
  describe('POST /api/users', () => {
    it('사용자 생성 성공', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          email: 'test@example.com',
          password: 'Passw0rd!',
          name: 'Test User'
        })
        .expect(201)
      
      expect(response.body).toHaveProperty('id')
      expect(response.body.email).toBe('test@example.com')
      expect(response.body).not.toHaveProperty('password')
    })
    
    it('중복 이메일 거부', async () => {
      await request(app)
        .post('/api/users')
        .send({
          email: 'duplicate@example.com',
          password: 'Passw0rd!',
          name: 'User 1'
        })
      
      const response = await request(app)
        .post('/api/users')
        .send({
          email: 'duplicate@example.com',
          password: 'Passw0rd!',
          name: 'User 2'
        })
        .expect(400)
      
      expect(response.body.error).toBe('Email already exists')
    })
    
    it('유효성 검증 실패', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          email: 'invalid-email',
          password: '123',
          name: ''
        })
        .expect(400)
      
      expect(response.body.errors).toContain('Invalid email')
      expect(response.body.errors).toContain('Password too short')
      expect(response.body.errors).toContain('Name is required')
    })
  })
  
  describe('GET /api/users/:id', () => {
    it('사용자 조회 성공', async () => {
      const response = await request(app)
        .get('/api/users/123')
        .set('Authorization', 'Bearer valid-token')
        .expect(200)
      
      expect(response.body).toHaveProperty('id', '123')
      expect(response.body).toHaveProperty('email')
    })
    
    it('인증 없이 접근 거부', async () => {
      await request(app)
        .get('/api/users/123')
        .expect(401)
    })
    
    it('존재하지 않는 사용자', async () => {
      await request(app)
        .get('/api/users/999999')
        .set('Authorization', 'Bearer valid-token')
        .expect(404)
    })
  })
})
```

---

#### B. API 응답 시간 측정

```typescript
// tests/api/performance.test.ts
describe('API Performance', () => {
  it('GET /api/users 응답 시간 < 200ms', async () => {
    const start = Date.now()
    
    await request(app)
      .get('/api/users')
      .expect(200)
    
    const duration = Date.now() - start
    expect(duration).toBeLessThan(200)
  })
  
  it('GET /api/products 페이지네이션 < 500ms', async () => {
    const start = Date.now()
    
    await request(app)
      .get('/api/products?page=1&limit=50')
      .expect(200)
    
    const duration = Date.now() - start
    expect(duration).toBeLessThan(500)
  })
})
```

---

#### C. Rate Limiting 테스트

```typescript
describe('Rate Limiting', () => {
  it('분당 10회 요청 제한', async () => {
    const requests = []
    
    // 10회 요청 (성공)
    for (let i = 0; i < 10; i++) {
      requests.push(
        request(app)
          .get('/api/data')
          .expect(200)
      )
    }
    await Promise.all(requests)
    
    // 11번째 요청 (실패)
    await request(app)
      .get('/api/data')
      .expect(429)  // Too Many Requests
  })
})
```

---

#### D. 에러 응답 검증

```typescript
describe('Error Responses', () => {
  it('400 Bad Request 형식', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ invalid: 'data' })
      .expect(400)
    
    expect(response.body).toEqual({
      error: 'Validation failed',
      details: expect.any(Array)
    })
  })
  
  it('500 Internal Server Error 형식', async () => {
    // DB 연결 끊기 시뮬레이션
    jest.spyOn(prisma, 'user').mockRejectedValue(new Error('DB Error'))
    
    const response = await request(app)
      .get('/api/users')
      .expect(500)
    
    expect(response.body).toEqual({
      error: 'Internal server error',
      message: expect.any(String)
    })
    
    // 프로덕션에서는 상세 에러 노출 금지
    expect(response.body.message).not.toContain('DB Error')
  })
})
```

---

#### E. Postman/Thunder Client 컬렉션

**컬렉션 생성:**
```json
// postman_collection.json
{
  "info": {
    "name": "My API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Users",
      "item": [
        {
          "name": "Create User",
          "request": {
            "method": "POST",
            "url": "{{base_url}}/api/users",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"Passw0rd!\"\n}"
            }
          }
        },
        {
          "name": "Get User",
          "request": {
            "method": "GET",
            "url": "{{base_url}}/api/users/{{user_id}}",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{access_token}}"
              }
            ]
          }
        }
      ]
    }
  ]
}
```

**환경 변수:**
```json
// postman_environment.json
{
  "name": "Development",
  "values": [
    {
      "key": "base_url",
      "value": "http://localhost:3000",
      "enabled": true
    },
    {
      "key": "access_token",
      "value": "",
      "enabled": true
    }
  ]
}
```

---

#### F. API 문서 자동 생성 & 테스트

**Swagger/OpenAPI:**
```typescript
// src/lib/swagger.ts
import { createSwaggerSpec } from 'next-swagger-doc'

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: 'src/app/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'My API',
        version: '1.0.0',
      },
    },
  })
  return spec
}
```

**API Route 문서화:**
```typescript
/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Invalid input
 */
export async function POST(request: Request) {
  // ...
}
```

---

### 5.7 시각적 회귀 테스트

#### A. Playwright Screenshots

```typescript
// tests/visual/homepage.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Visual Regression', () => {
  test('Homepage desktop', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // 전체 페이지 스크린샷
    await expect(page).toHaveScreenshot('homepage-desktop.png', {
      fullPage: true,
      maxDiffPixels: 100  // 100px까지 차이 허용
    })
  })
  
  test('Homepage mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      fullPage: true
    })
  })
  
  test('Button hover state', async ({ page }) => {
    await page.goto('/components')
    const button = page.getByRole('button', { name: 'Primary' })
    
    // 기본 상태
    await expect(button).toHaveScreenshot('button-default.png')
    
    // Hover 상태
    await button.hover()
    await expect(button).toHaveScreenshot('button-hover.png')
    
    // Focus 상태
    await button.focus()
    await expect(button).toHaveScreenshot('button-focus.png')
  })
  
  test('Dark mode', async ({ page }) => {
    await page.goto('/')
    
    // 다크모드 토글
    await page.getByRole('button', { name: 'Toggle dark mode' }).click()
    await page.waitForTimeout(500)  // 애니메이션 대기
    
    await expect(page).toHaveScreenshot('homepage-dark.png', {
      fullPage: true
    })
  })
})
```

**playwright.config.ts 설정:**
```typescript
import { defineConfig } from '@playwright/test'

export default defineConfig({
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100,  // 픽셀 차이 허용치
      threshold: 0.2,      // 20% 차이 허용
    },
  },
  
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'mobile',
      use: { 
        ...devices['iPhone 13'],
      },
    },
  ],
})
```

---

#### B. Percy (Visual Testing Platform)

**설치:**
```bash
npm install --save-dev @percy/cli @percy/playwright
```

**사용:**
```typescript
// tests/visual/percy.spec.ts
import { test } from '@playwright/test'
import percySnapshot from '@percy/playwright'

test('Visual regression with Percy', async ({ page }) => {
  await page.goto('/')
  
  // Percy에 스냅샷 전송
  await percySnapshot(page, 'Homepage')
  
  // 반응형 테스트 (자동)
  // Percy가 모바일/태블릿/데스크톱 자동 캡처
})

test('Component library', async ({ page }) => {
  await page.goto('/components')
  
  await percySnapshot(page, 'All Components')
})
```

**percy.yml 설정:**
```yaml
version: 2
snapshot:
  widths:
    - 375   # Mobile
    - 768   # Tablet
    - 1280  # Desktop
  min-height: 1024
  
  # 동적 요소 무시
  percy-css: |
    .timestamp { display: none !important; }
    .random-content { display: none !important; }
```

**GitHub Actions 통합:**
```yaml
- name: Percy visual tests
  run: npx percy exec -- npm run test:visual
  env:
    PERCY_TOKEN: ${{ secrets.PERCY_TOKEN }}
```

---

#### C. Chromatic (Storybook 시각적 테스트)

**Storybook 설정:**
```typescript
// src/components/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
}

export default meta
type Story = StoryObj<typeof Button>

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Click me',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Click me',
  },
}

export const Loading: Story = {
  args: {
    loading: true,
    children: 'Loading...',
  },
}

// 다크모드 테스트
export const DarkMode: Story = {
  args: {
    variant: 'primary',
    children: 'Dark mode',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
}
```

**Chromatic 실행:**
```bash
# 설치
npm install --save-dev chromatic

# 빌드 & 배포
npx chromatic --project-token=<your-token>
```

**GitHub Actions:**
```yaml
- name: Publish to Chromatic
  uses: chromaui/action@v1
  with:
    projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
    exitZeroOnChanges: true  # 변경사항 있어도 실패 안 함
```

---

#### D. 시각적 회귀 테스트 워크플로우

```mermaid
1. 코드 수정 (CSS, 컴포넌트)
   ↓
2. PR 생성
   ↓
3. CI에서 자동 스크린샷 생성
   ↓
4. Baseline과 비교
   ↓
5-a. 차이 없음 → 자동 승인
5-b. 차이 있음 → 리뷰 필요
   ↓
6. 의도된 변경? 
   Yes → Baseline 업데이트
   No → 코드 수정
```

---

#### E. 시각적 테스트 체크리스트

```
[ ] 전체 페이지 스크린샷
[ ] 주요 컴포넌트별 스크린샷
[ ] 반응형 (모바일/태블릿/데스크톱)
[ ] 다크모드
[ ] Hover/Focus/Active 상태
[ ] 로딩 상태
[ ] 에러 상태
[ ] 빈 상태 (Empty state)
[ ] 폼 검증 에러
[ ] 모달/팝업
[ ] 드롭다운 메뉴
[ ] 툴팁
```

---

#### F. 동적 콘텐츠 처리

```typescript
// 타임스탬프, 랜덤 값 등 무시
test('Ignore dynamic content', async ({ page }) => {
  await page.goto('/dashboard')
  
  // CSS로 동적 요소 숨기기
  await page.addStyleTag({
    content: `
      .timestamp { visibility: hidden !important; }
      .live-data { visibility: hidden !important; }
    `
  })
  
  await expect(page).toHaveScreenshot('dashboard.png')
})

// 또는 특정 영역만 캡처
test('Capture specific area', async ({ page }) => {
  await page.goto('/')
  
  const header = page.locator('header')
  await expect(header).toHaveScreenshot('header.png')
})
```

---

### 5.8 데이터베이스 테스트

#### A. Migration 테스트

```typescript
// tests/db/migration.test.ts
import { execSync } from 'child_process'
import { PrismaClient } from '@prisma/client'

describe('Database Migrations', () => {
  let prisma: PrismaClient
  
  beforeAll(() => {
    // 테스트 DB 초기화
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db'
    prisma = new PrismaClient()
  })
  
  afterAll(async () => {
    await prisma.$disconnect()
  })
  
  it('Migration 실행 성공', async () => {
    // DB 리셋
    execSync('npx prisma migrate reset --force --skip-seed')
    
    // Migration 실행
    execSync('npx prisma migrate deploy')
    
    // 테이블 존재 확인
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    
    expect(tables).toContainEqual({ table_name: 'User' })
    expect(tables).toContainEqual({ table_name: 'Post' })
  })
  
  it('Rollback 테스트', async () => {
    // 최신 migration 이름 가져오기
    const migrations = execSync('npx prisma migrate status')
      .toString()
      .split('\n')
    
    // 마지막 migration 롤백
    // (Prisma는 자동 rollback 없음, 수동 down migration 필요)
  })
})
```

---

#### B. Seed 데이터 검증

```typescript
// tests/db/seed.test.ts
import { PrismaClient } from '@prisma/client'

describe('Database Seeding', () => {
  let prisma: PrismaClient
  
  beforeAll(async () => {
    prisma = new PrismaClient()
    
    // DB 리셋 & Seed
    execSync('npx prisma migrate reset --force')
  })
  
  it('기본 사용자 생성 확인', async () => {
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    })
    
    expect(adminUser).toBeDefined()
    expect(adminUser?.role).toBe('ADMIN')
  })
  
  it('테스트 데이터 개수 확인', async () => {
    const userCount = await prisma.user.count()
    const postCount = await prisma.post.count()
    
    expect(userCount).toBeGreaterThanOrEqual(5)
    expect(postCount).toBeGreaterThanOrEqual(20)
  })
})
```

---

#### C. 제약 조건 테스트

```typescript
// tests/db/constraints.test.ts
describe('Database Constraints', () => {
  it('Unique 제약 조건 - 이메일 중복', async () => {
    await prisma.user.create({
      data: {
        email: 'unique@example.com',
        password: 'hashed',
        name: 'User 1'
      }
    })
    
    // 중복 이메일 시도
    await expect(
      prisma.user.create({
        data: {
          email: 'unique@example.com',
          password: 'hashed',
          name: 'User 2'
        }
      })
    ).rejects.toThrow('Unique constraint failed')
  })
  
  it('Foreign Key 제약 - 존재하지 않는 userId', async () => {
    await expect(
      prisma.post.create({
        data: {
          title: 'Test Post',
          content: 'Content',
          userId: 99999  // 존재하지 않는 ID
        }
      })
    ).rejects.toThrow('Foreign key constraint failed')
  })
  
  it('NOT NULL 제약', async () => {
    await expect(
      prisma.user.create({
        data: {
          email: 'test@example.com',
          // password 누락 (NOT NULL)
          name: 'Test'
        } as any
      })
    ).rejects.toThrow()
  })
  
  it('Check 제약 - 이메일 형식', async () => {
    await expect(
      prisma.user.create({
        data: {
          email: 'invalid-email',
          password: 'hashed',
          name: 'Test'
        }
      })
    ).rejects.toThrow()
  })
})
```

---

#### D. 트랜잭션 테스트

```typescript
// tests/db/transaction.test.ts
describe('Database Transactions', () => {
  it('트랜잭션 성공 - 모두 커밋', async () => {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: 'transaction@example.com',
          password: 'hashed',
          name: 'User'
        }
      })
      
      await tx.post.create({
        data: {
          title: 'Post',
          content: 'Content',
          userId: user.id
        }
      })
    })
    
    // 데이터 확인
    const user = await prisma.user.findUnique({
      where: { email: 'transaction@example.com' }
    })
    expect(user).toBeDefined()
    
    const post = await prisma.post.findFirst({
      where: { userId: user!.id }
    })
    expect(post).toBeDefined()
  })
  
  it('트랜잭션 실패 - 모두 롤백', async () => {
    try {
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: 'rollback@example.com',
            password: 'hashed',
            name: 'User'
          }
        })
        
        // 의도적 에러
        await tx.post.create({
          data: {
            title: 'Post',
            content: 'Content',
            userId: 99999  // 존재하지 않는 ID
          }
        })
      })
    } catch (error) {
      // 에러 예상됨
    }
    
    // 사용자도 생성되지 않았어야 함 (롤백)
    const user = await prisma.user.findUnique({
      where: { email: 'rollback@example.com' }
    })
    expect(user).toBeNull()
  })
  
  it('낙관적 락 (Optimistic Locking)', async () => {
    // version 필드 있는 모델
    const product = await prisma.product.create({
      data: {
        name: 'Product',
        stock: 10,
        version: 1
      }
    })
    
    // 동시에 2개 트랜잭션 시도
    const update1 = prisma.product.update({
      where: { 
        id: product.id,
        version: product.version  // 현재 버전 확인
      },
      data: {
        stock: 9,
        version: { increment: 1 }
      }
    })
    
    const update2 = prisma.product.update({
      where: { 
        id: product.id,
        version: product.version  // 같은 버전
      },
      data: {
        stock: 8,
        version: { increment: 1 }
      }
    })
    
    // 하나는 성공, 하나는 실패
    const results = await Promise.allSettled([update1, update2])
    
    const fulfilled = results.filter(r => r.status === 'fulfilled')
    const rejected = results.filter(r => r.status === 'rejected')
    
    expect(fulfilled).toHaveLength(1)
    expect(rejected).toHaveLength(1)
  })
})
```

---

#### E. 쿼리 성능 테스트

```typescript
// tests/db/performance.test.ts
describe('Database Performance', () => {
  it('N+1 쿼리 문제 감지', async () => {
    // 쿼리 로깅 활성화
    const queries: string[] = []
    const originalQuery = prisma.$use
    
    prisma.$use(async (params, next) => {
      queries.push(params.model + '.' + params.action)
      return next(params)
    })
    
    // N+1 발생 가능한 코드
    const users = await prisma.user.findMany({ take: 10 })
    
    for (const user of users) {
      await prisma.post.findMany({
        where: { userId: user.id }
      })
    }
    
    // 11개 쿼리 (1 + 10) 발생
    expect(queries.length).toBe(11)
    
    // 개선: include 사용
    queries.length = 0
    
    const usersWithPosts = await prisma.user.findMany({
      take: 10,
      include: { posts: true }
    })
    
    // 1개 쿼리로 해결
    expect(queries.length).toBe(1)
  })
  
  it('인덱스 활용 확인', async () => {
    // EXPLAIN 쿼리로 실행 계획 확인
    const plan = await prisma.$queryRaw`
      EXPLAIN ANALYZE
      SELECT * FROM "User" WHERE email = 'test@example.com'
    `
    
    // Index Scan 사용 확인
    const planText = JSON.stringify(plan)
    expect(planText).toContain('Index Scan')
    expect(planText).not.toContain('Seq Scan')  // Full table scan 없어야 함
  })
  
  it('대량 데이터 처리 속도', async () => {
    const start = Date.now()
    
    // 1000개 데이터 삽입
    await prisma.user.createMany({
      data: Array.from({ length: 1000 }, (_, i) => ({
        email: `bulk${i}@example.com`,
        password: 'hashed',
        name: `User ${i}`
      }))
    })
    
    const duration = Date.now() - start
    
    // 5초 이내 완료
    expect(duration).toBeLessThan(5000)
  })
})
```

---

#### F. 테스트 DB 설정

**docker-compose.test.yml:**
```yaml
version: '3.8'

services:
  test-db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
      POSTGRES_DB: test_db
    ports:
      - "5433:5432"  # 다른 포트 사용
    tmpfs:
      - /var/lib/postgresql/data  # 메모리에서 실행 (빠름)
```

**package.json:**
```json
{
  "scripts": {
    "test:db:start": "docker-compose -f docker-compose.test.yml up -d",
    "test:db:stop": "docker-compose -f docker-compose.test.yml down",
    "test:db": "npm run test:db:start && npm run test -- tests/db && npm run test:db:stop"
  }
}
```

---

### 5.9 부하 테스트 & 스트레스 테스트

#### A. k6 부하 테스트

**설치:**
```bash
# Mac
brew install k6

# Ubuntu
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

**기본 시나리오:**
```javascript
// tests/load/basic.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },   // 0→20 사용자 증가
    { duration: '1m', target: 20 },    // 20명 유지
    { duration: '30s', target: 100 },  // 20→100 급증
    { duration: '2m', target: 100 },   // 100명 유지
    { duration: '30s', target: 0 },    // 종료
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'],  // 95% 요청 500ms 이하
    'http_req_failed': ['rate<0.01'],    // 에러율 1% 이하
  },
};

export default function() {
  // 홈페이지
  let res = http.get('https://your-site.com');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'page load < 500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
  
  // API 호출
  res = http.get('https://your-site.com/api/products');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
  
  sleep(2);
}
```

**실행:**
```bash
k6 run tests/load/basic.js

# 결과 출력 예시:
# ✓ status is 200
# ✓ page load < 500ms
# 
# http_req_duration..........: avg=245ms min=120ms max=890ms p(95)=450ms
# http_req_failed............: 0.12%
# iterations.................: 5000
```

---

#### B. 스파이크 테스트 (급증 대응)

```javascript
// tests/load/spike.js
export const options = {
  stages: [
    { duration: '10s', target: 10 },    // 정상 트래픽
    { duration: '10s', target: 1000 },  // 급증 (블랙 프라이데이)
    { duration: '1m', target: 1000 },   // 유지
    { duration: '10s', target: 10 },    // 복구
  ],
};

export default function() {
  const res = http.get('https://your-site.com');
  check(res, {
    'status is not 503': (r) => r.status !== 503,  // 서버 다운 방지
    'response time < 2s': (r) => r.timings.duration < 2000,
  });
  sleep(1);
}
```

---

#### C. 스트레스 테스트 (한계 확인)

```javascript
// tests/load/stress.js
export const options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '5m', target: 200 },
    { duration: '2m', target: 300 },   // 계속 증가
    { duration: '5m', target: 300 },
    { duration: '2m', target: 400 },
    { duration: '5m', target: 400 },
    { duration: '10m', target: 0 },
  ],
};

// 어느 시점에서 에러율이 급증하는지 확인
```

---

#### D. 내구성 테스트 (Soak Test)

```javascript
// tests/load/soak.js
export const options = {
  stages: [
    { duration: '2m', target: 50 },
    { duration: '3h', target: 50 },  // 3시간 유지
    { duration: '2m', target: 0 },
  ],
};

// 메모리 누수, 리소스 고갈 확인
```

---

#### E. API별 부하 테스트

```javascript
// tests/load/api-endpoints.js
import http from 'k6/http';
import { check, group } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '3m', target: 50 },
    { duration: '1m', target: 0 },
  ],
};

export default function() {
  group('User API', () => {
    const res = http.get('https://your-site.com/api/users');
    check(res, {
      'GET /api/users - status 200': (r) => r.status === 200,
      'GET /api/users - duration < 300ms': (r) => r.timings.duration < 300,
    });
  });
  
  group('Product API', () => {
    const res = http.get('https://your-site.com/api/products?page=1');
    check(res, {
      'GET /api/products - status 200': (r) => r.status === 200,
      'GET /api/products - duration < 500ms': (r) => r.timings.duration < 500,
    });
  });
  
  group('Search API', () => {
    const res = http.get('https://your-site.com/api/search?q=test');
    check(res, {
      'GET /api/search - status 200': (r) => r.status === 200,
      'GET /api/search - duration < 1s': (r) => r.timings.duration < 1000,
    });
  });
}
```

---

#### F. 인증된 요청 테스트

```javascript
// tests/load/authenticated.js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '1m', target: 0 },
  ],
};

export function setup() {
  // 로그인 토큰 발급
  const loginRes = http.post('https://your-site.com/api/auth/login', {
    email: 'load-test@example.com',
    password: 'LoadTest123!',
  });
  
  return { token: loginRes.json('accessToken') };
}

export default function(data) {
  const headers = {
    'Authorization': `Bearer ${data.token}`,
    'Content-Type': 'application/json',
  };
  
  // 인증 필요한 API
  const res = http.get('https://your-site.com/api/profile', { headers });
  
  check(res, {
    'authenticated request success': (r) => r.status === 200,
  });
}
```

---

#### G. 데이터베이스 부하 모니터링

```javascript
// tests/load/db-monitoring.js
import http from 'k6/http';
import { Counter, Trend } from 'k6/metrics';

const dbQueryTime = new Trend('db_query_time');
const dbErrors = new Counter('db_errors');

export default function() {
  const res = http.get('https://your-site.com/api/products');
  
  // Response header에서 DB 쿼리 시간 읽기
  const queryTime = res.headers['X-Query-Time'];
  if (queryTime) {
    dbQueryTime.add(parseFloat(queryTime));
  }
  
  if (res.status >= 500) {
    dbErrors.add(1);
  }
}
```

**서버에서 헤더 추가:**
```typescript
// src/app/api/products/route.ts
export async function GET() {
  const start = Date.now();
  
  const products = await prisma.product.findMany();
  
  const queryTime = Date.now() - start;
  
  return NextResponse.json(products, {
    headers: {
      'X-Query-Time': queryTime.toString(),
    },
  });
}
```

---

#### H. CI/CD에서 부하 테스트

**GitHub Actions:**
```yaml
name: Load Test

on:
  schedule:
    - cron: '0 2 * * *'  # 매일 새벽 2시
  workflow_dispatch:      # 수동 실행

jobs:
  load-test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Install k6
        run: |
          sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update
          sudo apt-get install k6
      
      - name: Run load test
        run: k6 run tests/load/basic.js --out json=results.json
      
      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: load-test-results
          path: results.json
      
      - name: Check thresholds
        run: |
          if grep -q "threshold.*failed" results.json; then
            echo "Load test failed!"
            exit 1
          fi
```

---

#### I. 부하 테스트 체크리스트

```
준비:
[ ] 테스트 계정 생성
[ ] Rate limiting 확인 (테스트 IP 허용)
[ ] 모니터링 대시보드 준비
[ ] 알림 설정 (에러 임계값)

시나리오:
[ ] 정상 트래픽 (Baseline)
[ ] 점진적 증가 (Ramp-up)
[ ] 급증 (Spike)
[ ] 스트레스 (최대 용량)
[ ] 내구성 (장시간)

모니터링:
[ ] CPU 사용률
[ ] 메모리 사용률
[ ] 네트워크 대역폭
[ ] DB 커넥션 수
[ ] 응답 시간
[ ] 에러율

분석:
[ ] 병목 지점 식별
[ ] 에러 패턴 분석
[ ] 리소스 사용량 추이
[ ] 확장 계획 수립
```

---

## 6. 접근성 검사

### 6.1 WCAG 2.1 Level AA 준수

#### A. 키보드 네비게이션

```tsx
// ✅ 키보드로 모든 기능 접근 가능
<button
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick()
    }
  }}
>
  클릭
</button>

// ✅ Tab 순서 명시 (필요 시)
<input tabIndex={1} />
<input tabIndex={2} />
<input tabIndex={3} />

// ✅ Skip to main content
<a href="#main-content" className="sr-only">
  본문으로 바로가기
</a>
<main id="main-content">
  ...
</main>
```

---

#### B. ARIA 라벨

```tsx
// ✅ 의미 있는 라벨
<button aria-label="검색">
  <SearchIcon />
</button>

// ✅ 상태 표시
<button aria-pressed={isActive}>
  {isActive ? '활성' : '비활성'}
</button>

// ✅ 로딩 상태
<button aria-busy={isLoading} disabled={isLoading}>
  {isLoading ? '로딩 중...' : '제출'}
</button>

// ✅ 에러 메시지 연결
<input
  id="email"
  aria-invalid={hasError}
  aria-describedby={hasError ? 'email-error' : undefined}
/>
{hasError && (
  <p id="email-error" role="alert">
    올바른 이메일을 입력해주세요
  </p>
)}
```

---

#### C. 색상 대비

```css
/* WCAG AA: 최소 4.5:1 (일반 텍스트) */
.text-primary {
  color: #1a1a1a;  /* 검은색 */
  background: #ffffff;  /* 흰색 */
  /* 대비율: 21:1 ✅ */
}

/* WCAG AAA: 최소 7:1 (권장) */
.text-heading {
  color: #000000;
  background: #ffffff;
  /* 대비율: 21:1 ✅ */
}

/* 대비율 확인 도구: */
/* https://webaim.org/resources/contrastchecker/ */
```

---

### 6.2 접근성 테스트 도구

#### A. Axe DevTools

```bash
# Chrome 확장 프로그램 설치
# https://www.deque.com/axe/devtools/

# 또는 자동화
npm install -D @axe-core/playwright

# tests/a11y.spec.ts
import { test, expect } from '@playwright/test'
import { injectAxe, checkA11y } from 'axe-playwright'

test('접근성 검사', async ({ page }) => {
  await page.goto('/')
  await injectAxe(page)
  await checkA11y(page)
})
```

---

#### B. Lighthouse Accessibility

```bash
lighthouse https://your-site.com --only-categories=accessibility

# 목표: 90+ 점수
```

---

## 7. 체크리스트

### ✅ 로컬 테스트

```
[ ] 개발 서버 정상 실행
[ ] 프로덕션 빌드 성공
[ ] 타입 에러 없음
[ ] 린트 통과
[ ] 모든 페이지 접근 가능
[ ] 핵심 기능 5개 시나리오 테스트
[ ] 엣지 케이스 10개 테스트
[ ] 콘솔 에러 없음
```

---

### ✅ 성능

```
[ ] Lighthouse Performance 90+
[ ] First Load JS < 200 KB
[ ] 이미지 최적화 (WebP/AVIF)
[ ] 폰트 최적화
[ ] LCP < 2.5s
[ ] FID < 100ms
[ ] CLS < 0.1
[ ] 번들 분석 완료
```

---

### ✅ 크로스 브라우저

```
[ ] Chrome (최신)
[ ] Firefox (최신)
[ ] Safari (최신)
[ ] Edge (최신)
[ ] iOS Safari
[ ] Android Chrome
[ ] 320px (Mobile)
[ ] 768px (Tablet)
[ ] 1920px (Desktop)
```

---

### ✅ 보안

```
[ ] npm audit 통과 (Critical/High 없음)
[ ] HTTPS 강제
[ ] 비밀번호 해싱
[ ] SQL Injection 방지
[ ] XSS 방지
[ ] CSRF 토큰
[ ] Rate Limiting
[ ] 보안 헤더 설정
[ ] 권한 검증 (모든 API)
[ ] 민감 데이터 암호화
```

---

### ✅ 테스트

```
[ ] 단위 테스트 80%+ 커버리지
[ ] 통합 테스트 핵심 기능
[ ] E2E 테스트 5+ 시나리오
[ ] 모든 테스트 통과
```

---

### ✅ 접근성

```
[ ] Lighthouse Accessibility 90+
[ ] 키보드 네비게이션 가능
[ ] ARIA 라벨 적용
[ ] 색상 대비 4.5:1 이상
[ ] 스크린 리더 테스트
[ ] Alt 텍스트 (모든 이미지)
```

---

### 🎯 다음 단계

모든 검증이 완료되었다면, 이제 배포할 준비가 되었습니다.

**다음으로 이동:** [04. 배포 →](./04_DEPLOYMENT.md)

---

[← 이전: 02. 개발](./02_DEVELOPMENT.md) | [목차](./README.md) | [다음: 04. 배포 →](./04_DEPLOYMENT.md)
