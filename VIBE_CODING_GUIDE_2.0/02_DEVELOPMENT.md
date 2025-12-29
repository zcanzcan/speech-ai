# 02. AI 협업 개발

**AI 협업 개발 가이드 - Part 2**

[← 이전: 01. 기획](./01_PROJECT_SETUP.md) | [목차](./README.md) | [다음: 03. 검증 →](./03_QA_TESTING.md)

---

## 📋 목차

1. [AI 도구별 활용법](#1-ai-도구별-활용법)
2. [프롬프트 엔지니어링](#2-프롬프트-엔지니어링)
3. [코드 생성 & 수정](#3-코드-생성--수정)
4. [디버깅 전략](#4-디버깅-전략)
5. [협업 워크플로우](#5-협업-워크플로우)
6. [보안 고려사항](#6-보안-고려사항)
7. [체크리스트](#7-체크리스트)

---

## 1. AI 도구별 활용법

### 1.1 도구 조합 전략

**상황별 최적 도구 선택**

| 작업 | 추천 도구 | 상황별 선택 |
|------|-----------|-------------|
| **프로젝트 초기화** | **v0, Lovable, Bolt** <br> 빠른 프로토타입, 즉시 배포 | **Claude Code, Cursor** <br> 커스텀 설정, 팀 표준 준수 <br> **CLI (create-next-app 등)** <br> 완전한 제어, 표준 구조 |
| **핵심 로직 개발** | **Cursor Composer** <br> 여러 파일 동시 편집, 컨텍스트 유지 | **Claude Code** <br> 대규모 리팩토링, 반복 패턴 <br> **Claude (웹)** <br> 복잡한 알고리즘, 아키텍처 설계 |
| **기존 코드 수정** | **Cursor Chat/Tab** <br> 빠른 수정, 즉시 적용 | **Claude (웹)** <br> 복잡한 분석, 전체 맥락 필요 |
| **반복 작업** | **Claude Code** <br> 20개+ 파일 일괄 처리 | **Cursor Composer** <br> 10개 이하 파일 <br> **GitHub Copilot** <br> 단순 반복 코드 |
| **디버깅** | **Cursor** <br> 코드 내에서 바로 수정 | **Claude (웹)** <br> 근본 원인 분석, 여러 가능성 검토 |
| **문서 작성** | **Claude (웹)** <br> README, API 문서, 가이드 | **Cursor** <br> 인라인 주석, JSDoc |
| **코드 리뷰** | **Claude (웹)** <br> 전체 맥락 파악, 심층 분석 | **Cursor** <br> 파일별 빠른 리뷰 |

**참고:**
- 한 프로젝트에서 여러 도구를 조합해서 사용하는 것이 일반적
- 도구 간 전환 시 컨텍스트 유지가 중요
- 팀 표준이 있다면 우선 준수

---

### 1.2 Cursor

#### A. Composer 모드

**언제 사용:**
- 여러 파일을 동시에 수정
- 새 기능 추가 (3개 이상 파일 변경)
- 대규모 리팩토링

**사용법:**
```
Cmd/Ctrl + I → Composer 모드 진입

프롬프트 예시:
"사용자 인증 기능 추가:
- src/features/auth/AuthForm.tsx 생성
- src/services/authService.ts 생성
- src/hooks/useAuth.ts 생성
- src/app/api/auth/[...nextauth]/route.ts 수정

Only edit these files."
```

**옵션 활용:**
- ✅ "Only edit these files" - 명시된 파일만 수정
- ✅ "Use existing code" - 기존 코드 스타일 유지
- ⚠️ "Auto-apply" - 자동 적용 (검토 후 사용)

---

#### B. Chat 모드

**언제 사용:**
- 단일 파일 수정
- 코드 설명 요청
- 간단한 디버깅

**사용법:**
```
Cmd/Ctrl + L → Chat 모드 진입

프롬프트 예시:
"이 함수의 시간 복잡도를 O(n²)에서 O(n log n)으로 개선해줘"
"이 컴포넌트에 로딩 상태 추가"
"타입 에러 해결 방법 알려줘"
```

---

#### C. Tab 자동완성

**최적화 팁:**
```typescript
// 주석으로 의도 명확히 표현
// 사용자 인증 함수, JWT 토큰 생성, 만료 시간 24시간
export async function authenticate|  // ← Tab 누르면 자동완성

// 복잡한 로직은 단계별 주석
// 1. 이메일 검증
// 2. 비밀번호 해싱
// 3. 데이터베이스 저장
// 4. JWT 토큰 발급
export async function register|  // ← Tab
```

---

#### D. 파일 보호 (.cursorignore)

```
# .cursorignore

# 절대 수정하지 말 것
src/core/payment.ts
src/utils/encryption.ts
src/config/database.ts

# 외부 라이브러리
node_modules/
.next/

# 환경 설정
.env
.env.local
.env.production

# 빌드 결과물
dist/
build/
out/
```

---

### 1.3 Claude Code (터미널)

#### A. 프로젝트 초기화

```bash
# Next.js 프로젝트 초기화
claude-code "Next.js 14 프로젝트를 다음 설정으로 초기화:
- TypeScript
- Tailwind CSS
- App Router
- Prisma (PostgreSQL)
- NextAuth.js
- 폴더 구조: /src, /components, /lib, /types
- .env.example 생성"
```

```bash
# Python Flask API 초기화
claude-code "Flask REST API 프로젝트 초기화:
- requirements.txt
- SQLAlchemy
- JWT 인증
- CORS 설정
- 폴더: /api, /models, /utils, /tests
- pytest 설정"
```

---

#### B. 대량 작업

```bash
# 20개 컴포넌트 일괄 생성
claude-code "다음 컴포넌트 20개 생성:
Button, Input, Select, Textarea, Checkbox, Radio,
Card, Modal, Drawer, Toast, Alert, Badge,
Avatar, Spinner, Skeleton, Tabs, Accordion,
Tooltip, Dropdown, Pagination

각 컴포넌트는:
- TypeScript
- Tailwind CSS
- Props 타입 정의
- 기본 스타일링
- 반응형
- 다크모드 지원

위치: src/components/ui/"
```

---

#### C. 마이그레이션

```bash
# 코드 스타일 일괄 변경
claude-code "모든 .tsx 파일에서:
1. function 키워드를 arrow function으로 변경
2. CSS Modules을 Tailwind CSS로 변환
3. PropTypes를 TypeScript interface로 변환
4. 변경 전후 diff 저장"
```

---

### 1.4 Claude (웹)

#### A. 아키텍처 설계

```
프롬프트:
"다음 요구사항으로 전자상거래 플랫폼 설계:

기능:
- 사용자 인증 (이메일, 소셜)
- 상품 검색 & 필터링
- 장바구니
- 결제 (Stripe)
- 주문 관리
- 관리자 대시보드

기술 스택:
- Next.js 14 (App Router)
- PostgreSQL + Prisma
- Redis (세션)
- S3 (이미지)

다음 산출물 제공:
1. 폴더 구조
2. 데이터베이스 스키마
3. API 엔드포인트 목록
4. 환경 변수 목록
5. 단계별 개발 계획 (1주차~8주차)"
```

---

#### B. 코드 리뷰

```
프롬프트:
"다음 코드 리뷰:

[코드 붙여넣기]

다음 관점에서 검토:
1. 보안 취약점
2. 성능 이슈
3. 타입 안정성
4. 에러 처리
5. 테스트 가능성
6. 코드 복잡도
7. 1:1 매핑 원칙 준수

개선 제안 시 수정된 코드 전체 제공"
```

---

#### C. 디버깅 도우미

```
프롬프트:
"다음 에러 해결:

에러 메시지:
[에러 로그 전체 붙여넣기]

환경 정보:
# 시스템
OS: macOS 14.2 / Windows 11 / Ubuntu 22.04
IDE: Cursor 0.41.3 / VS Code 1.85.2

# 런타임
Node.js: 18.17.0 (nvm 사용)
npm/pnpm: 10.2.3

# 프로젝트
프레임워크: Next.js 14.0.4 (App Router)
언어: TypeScript 5.3.3 (strict mode)
주요 라이브러리:
  - React 18.2.0
  - Prisma 5.7.0
  - NextAuth 4.24.5

# 브라우저 (프론트엔드 에러 시)
Chrome 120.0 / Safari 17.2

시도한 방법:
1. npm install 재실행
2. .next 폴더 삭제
3. 타입 체크 (통과)
4. 브라우저 캐시 삭제

재현 단계:
1. [구체적인 단계]
2. [에러 발생 시점]

원인 분석 및 해결책 3가지 제시"
```

---

### 1.5 최신 AI 코딩 도구

#### A. Windsurf (Codeium)

**특징:**
- Cursor의 강력한 경쟁자
- 무료 버전 제공
- Cascade 모드 (Composer와 유사)
- 빠른 속도

**언제 사용:**
- Cursor 대안 원할 때
- 무료로 AI 코딩 시작
- 빠른 자동완성 필요

**제한사항:**
- Claude Code보다 컨텍스트 제한적
- 프로젝트 초기화는 약함

---

#### B. GitHub Copilot Workspace

**특징:**
- GitHub 이슈 기반 개발
- 전체 작업 계획 자동 생성
- PR 자동 생성
- GitHub 통합

**언제 사용:**
- GitHub 이슈 관리 팀
- 프로젝트 레벨 작업
- 자동화된 워크플로우

**제한사항:**
- GitHub Pro 필요
- 개별 파일 수정은 Cursor가 나음

---

#### C. Replit Agent

**특징:**
- 브라우저 기반 (설치 불필요)
- 전체 프로젝트 생성 가능
- 즉시 배포
- 무료 체험 가능

**언제 사용:**
- 빠른 프로토타입
- 학습 목적
- 설치 환경 없을 때

**제한사항:**
- 복잡한 프로젝트 한계
- 로컬 환경보다 느림

---

#### D. Codeium (무료 AI 어시스턴트)

**특징:**
- 완전 무료
- 70+ 언어 지원
- VS Code, JetBrains 확장

**언제 사용:**
- 예산 제한
- 자동완성만 필요
- 다양한 언어 사용

**제한사항:**
- Chat 기능 제한적
- Composer 모드 없음

---

#### E. v0.dev (Vercel)

**특징:**
- UI 생성 특화
- 즉시 미리보기
- React/Next.js 코드 생성
- shadcn/ui 기반

**언제 사용:**
- UI 프로토타입
- 디자인 → 코드 변환
- 컴포넌트 빠른 생성

**제한사항:**
- 프론트엔드만
- 백엔드 로직 없음

---

#### F. 도구 비교표

| 도구 | 가격 | 강점 | 약점 | 추천 용도 |
|------|------|------|------|-----------|
| **Cursor** | $20/월 | 전방위 강력함 | 유료 | 프로페셔널 개발 |
| **Claude Code** | Claude 구독 | 프로젝트 초기화 | 터미널 필요 | 대규모 작업 |
| **Windsurf** | 무료 | 빠름, 무료 | 기능 제한 | Cursor 대안 |
| **Copilot** | $10/월 | GitHub 통합 | 컨텍스트 약함 | GitHub 유저 |
| **Replit** | 무료~ | 브라우저 기반 | 성능 제한 | 빠른 프로토타입 |
| **Codeium** | 무료 | 완전 무료 | 기본 기능만 | 학습, 예산 제한 |
| **v0** | 무료~ | UI 특화 | 프론트만 | UI 프로토타입 |

---

### 1.6 도구별 워크플로우 예시

#### 시나리오: 사용자 프로필 기능 추가

**1단계: 설계 (Claude 웹)**
```
"사용자 프로필 기능 설계:
- 프로필 조회/수정
- 아바타 이미지 업로드
- 비밀번호 변경
- 계정 삭제

필요한 파일 목록과 각 파일의 책임 정의"
```

**2단계: 파일 생성 (Claude Code)**
```bash
claude-code "1단계에서 정의한 파일 구조대로 파일 생성:
- src/features/profile/ProfilePage.tsx
- src/features/profile/ProfileForm.tsx
- src/features/profile/AvatarUpload.tsx
- src/services/profileService.ts
- src/types/profile.types.ts
- src/app/api/profile/route.ts"
```

**3단계: 로직 구현 (Cursor)**
```
Composer 모드에서:
"방금 생성된 파일들에 로직 구현:
- 프로필 조회 API 연동
- 폼 검증 (Zod)
- 이미지 업로드 (S3)
- 에러 처리
- 로딩 상태

Only edit these files."
```

**4단계: 디버깅 (Cursor Chat)**
```
"프로필 업데이트 시 409 에러 발생.
/api/profile/route.ts의 PUT 핸들러 확인 필요"
```

**5단계: 코드 리뷰 (Claude 웹)**
```
"구현된 프로필 기능 전체 코드 리뷰:
[모든 파일 붙여넣기]

보안, 성능, 타입 안정성 관점에서 검토"
```

---

## 2. 프롬프트 엔지니어링

### 2.1 기본 구조

```
[작업 유형] + [구체적 요구사항] + [제약사항] + [출력 형식]

예시:
"[컴포넌트 생성] 사용자 인증 폼 생성
[요구사항]
- 이메일, 비밀번호 입력
- 유효성 검증 (Zod)
- 에러 메시지 표시
- 로딩 상태
[제약사항]
- TypeScript strict 모드
- Tailwind CSS만 사용
- 100줄 이하
[출력]
- src/components/AuthForm.tsx
- 테스트 코드 포함"
```

---

### 2.2 상황별 프롬프트 템플릿

#### A. 컴포넌트 생성

```
다음 조건으로 [컴포넌트명] 생성:

파일 위치: src/components/[컴포넌트명].tsx

기능:
- [기능 1]
- [기능 2]
- [기능 3]

요구사항:
- TypeScript strict 모드
- Props 타입 명시
- 기본값 설정
- 에러 바운더리
- 테스트 케이스 3개
- JSDoc 주석
- Tailwind CSS
- 반응형 (모바일/태블릿/데스크톱)
- 다크모드 지원
- ARIA 라벨 (접근성)
- 키보드 네비게이션

참고할 기존 컴포넌트: [파일명]

수정 금지: 다른 모든 파일
```

---

#### B. API 연동

```
[API명] 연동 코드 작성:

1단계: 최신 API 문서 웹 검색
   - 키워드: "[API명] API documentation 2025"
   - 공식 문서 우선

2단계: TypeScript 타입 생성
   - Request 타입
   - Response 타입
   - Error 타입

3단계: 클라이언트 구현
   - 파일 위치: src/services/[api명]/client.ts
   - 환경 변수 사용 (API key)
   - 에러 처리:
     * Rate limit (429)
     * Timeout (408)
     * Network error
     * Unauthorized (401)
   - 재시도 로직 (3회, 지수 백오프)
   - Zod 스키마 검증

4단계: 테스트 케이스
   - 정상 요청
   - 에러 시나리오 3개
   - 파일 위치: src/services/[api명]/client.test.ts

수정 범위: 새 파일만 생성
```

---

#### C. 리팩토링

```
다음 코드 리팩토링:

[코드 전체 붙여넣기]

목표:
- McCabe 복잡도 < 10
- 함수 길이 < 50라인
- 1:1 매핑 원칙 준수
- 타입 안정성 강화
- 에러 처리 추가
- 성능 개선 (O(n²) → O(n log n))

제약:
- 기능 동작 변경 금지
- 기존 API 호환성 유지
- 테스트 통과 필수

출력:
- 수정된 코드 전체
- 변경 사항 요약
- 성능 비교 (Big-O)
```

---

#### D. 버그 수정

```
다음 버그 분석 및 수정:

증상:
[버그 설명]

에러 메시지:
[에러 로그 전체]

재현 단계:
1. [단계 1]
2. [단계 2]
3. [단계 3]

환경 정보:
# 시스템
OS: macOS 14.2
개발 도구: Cursor 0.41.3

# 런타임 & 프레임워크
Node.js: 18.17.0
Framework: Next.js 14.0.4 (App Router)
TypeScript: 5.3.3 (strict mode)

# 관련 라이브러리 버전
[버그와 관련된 패키지 버전 명시]

시도한 방법:
- [시도 1] → 실패 (이유)
- [시도 2] → 실패 (이유)

요청사항:
1. 원인 분석 (근본 원인)
2. 수정 방법 3가지 (장단점 비교)
3. 권장 방법 선택 이유
4. 수정된 코드
5. 테스트 방법
```

---

### 2.3 프롬프트 최적화 팁

#### ✅ DO

```
1. 구체적으로 작성
   ❌ "버튼 만들어줘"
   ✅ "Primary 버튼 컴포넌트 생성:
       - Tailwind CSS
       - TypeScript
       - loading, disabled 상태
       - 3가지 크기 (sm/md/lg)"

2. 제약사항 명시
   ✅ "수정 범위: src/components/Button.tsx만"
   ✅ "다른 파일 절대 수정 금지"

3. 출력 형식 지정
   ✅ "JSON 형식으로 응답"
   ✅ "코드만 출력 (설명 제외)"

4. 컨텍스트 제공
   ✅ "기존 코드 스타일 참고: src/components/Input.tsx"
   ✅ "프로젝트는 Next.js 14 App Router 사용"

5. 검증 요청
   ✅ "작성 후 자가 검토:
       - 타입 에러 없음
       - 린트 통과
       - 테스트 3개 포함"
```

#### ❌ DON'T

```
1. 모호한 표현
   ❌ "좀 더 좋게 만들어줘"
   ❌ "최적화해줘"

2. 범위 미지정
   ❌ "전체 코드 개선" (어디를?)
   ❌ "리팩토링" (무엇을?)

3. 과도한 요구
   ❌ "100개 파일 동시 생성"
   (→ 20개씩 나눠서 요청)

4. 최신성 미확인
   ❌ "React 17 문법으로"
   (→ 현재 버전 확인 후 요청)
```

---

#### 프롬프트 실패 사례 & 개선

**사례 1: 회원가입 기능**

❌ **실패한 프롬프트:**
```
"회원가입 기능 만들어줘"
```

**문제점:**
- 기술 스택 불명확
- 요구사항 없음
- 파일 위치 불명확
- 검증 기준 없음

✅ **개선된 프롬프트:**
```
Next.js 14 + NextAuth로 이메일/비밀번호 회원가입:

파일:
- src/app/api/auth/signup/route.ts (POST 핸들러)
- src/lib/validation.ts (Zod 스키마)

요구사항:
- 이메일 형식 검증 (Zod)
- 비밀번호 8자 이상, 특수문자 포함
- bcrypt로 해싱 (salt rounds: 10)
- Prisma로 User 모델 저장
- 중복 이메일 확인
- 성공 시 201, 실패 시 400 응답

에러 처리:
- 중복 이메일: "Email already exists"
- 검증 실패: Zod 에러 메시지 반환
- DB 에러: 500 응답

테스트 케이스:
- 정상 가입
- 중복 이메일
- 잘못된 형식
```

---

**사례 2: 컴포넌트 수정**

❌ **실패한 프롬프트:**
```
"Button 컴포넌트 수정해줘"
```

**문제점:**
- 무엇을 수정할지 불명확
- 현재 상태 파악 안 됨
- 수정 범위 불명확

✅ **개선된 프롬프트:**
```
src/components/Button.tsx 수정:

현재 상태:
- 기본 버튼만 있음
- 클릭 핸들러 있음

추가 요청:
- loading prop 추가 (boolean)
- loading 시 스피너 표시
- loading 시 disabled 자동 설정
- 버튼 텍스트를 children으로

수정 금지:
- 기존 onClick 동작
- 다른 모든 파일

참고:
- 스피너는 lucide-react의 Loader2 사용
- 애니메이션: animate-spin
```

---

**사례 3: API 연동**

❌ **실패한 프롬프트:**
```
"OpenAI API 연동해줘"
```

**문제점:**
- 어떤 기능인지 불명확
- 에러 처리 없음
- 환경 변수 관리 없음

✅ **개선된 프롬프트:**
```
OpenAI GPT-4 채팅 API 연동:

1단계: 최신 문서 검색
"OpenAI API documentation 2025 chat completions"
공식 문서 확인

2단계: 타입 정의
파일: src/types/openai.ts
- ChatMessage 타입
- ChatResponse 타입
- APIError 타입

3단계: API 클라이언트
파일: src/lib/openai.ts
- 환경 변수: process.env.OPENAI_API_KEY
- fetch 사용 (axios 사용 금지)
- 타임아웃: 30초
- 재시도: 최대 3회 (지수 백오프)

4단계: 에러 처리
- Rate limit → 429 에러
- Invalid key → 401 에러
- Timeout → 408 에러
- 각 에러별 사용자 친화적 메시지

5단계: 테스트
- 정상 응답
- Rate limit
- Invalid key
```

---

### 2.4 프롬프트 체이닝

**복잡한 작업은 단계별로 분할**

```
Step 1: 데이터베이스 스키마 설계
"사용자 프로필 기능을 위한 Prisma 스키마 작성:
- User 모델 확장
- Profile 모델 추가
- Avatar 이미지 URL
- 관계 설정"

Step 2: API 엔드포인트 생성
"1단계에서 정의한 스키마 기반으로:
- GET /api/profile (조회)
- PUT /api/profile (수정)
- POST /api/profile/avatar (이미지 업로드)
각 엔드포인트의 route.ts 파일 생성"

Step 3: 프론트엔드 컴포넌트
"2단계 API를 사용하는 React 컴포넌트:
- ProfilePage.tsx (전체 페이지)
- ProfileForm.tsx (폼)
- AvatarUpload.tsx (이미지 업로드)"

Step 4: 통합 테스트
"1~3단계 코드 전체를 통합 테스트:
- E2E 시나리오 3개
- Playwright 사용"
```

---

### 2.5 AI 한계 & 주의사항

#### AI가 자주 틀리는 분야

**❌ 높은 오류율:**
- **최신 정보** (2025년 이후 출시된 API, 라이브러리)
- **버전별 차이** (deprecated API 사용, breaking changes 무시)
- **복잡한 수학/알고리즘** (최적화 문제, 고급 수학)
- **보안 취약점** (SQL injection, XSS 방어 누락)
- **성능 최적화** (메모리 누수, 비효율적 쿼리)
- **엣지 케이스** (경계값, null/undefined 처리)

**✅ 높은 정확도:**
- **일반적인 패턴** (CRUD, 인증, 폼 검증)
- **문서 생성** (README, 주석, API 문서)
- **코드 리팩토링** (변수명 변경, 구조 개선)
- **테스트 코드** (단위 테스트, 목업 생성)

---

#### 환각(Hallucination) 대응 방법

**증상:**
```typescript
// AI가 존재하지 않는 API를 생성
import { nonExistentFunction } from 'next/magic'; // ❌ 없는 패키지

await client.fetchAllUsers(); // ❌ 없는 메서드
```

**대응 방법:**

**1. 최신 문서 검색 요청**
```
"Next.js 14 App Router 공식 문서를 웹 검색으로 확인한 후,
최신 API 사용법으로 코드 작성해줘"
```

**2. 패키지 버전 명시**
```
"prisma@5.7.0 공식 문서 기준으로
findMany 쿼리 작성해줘"
```

**3. 생성된 코드 검증 요청**
```
"방금 생성한 코드에서:
1. 존재하지 않는 API 사용했는지 확인
2. deprecated 메서드 있는지 확인
3. 최신 베스트 프랙티스 준수했는지 확인"
```

---

#### 복잡한 로직 단계별 확인

**나쁜 예 (한 번에 요청):**
```
"결제 시스템 전체 구현해줘"
→ AI가 놓치는 부분: 재시도 로직, 에러 처리, 로깅, 트랜잭션
```

**좋은 예 (단계별 확인):**
```
Step 1: "Stripe 결제 intent 생성 API 작성"
→ 검증: 환경 변수, 에러 처리, 타입 확인

Step 2: "Webhook 핸들러 작성"
→ 검증: 시그니처 검증, 이벤트 타입 처리

Step 3: "데이터베이스 트랜잭션 추가"
→ 검증: 롤백 처리, 동시성 제어

Step 4: "통합 테스트"
→ 검증: 전체 플로우, 에지 케이스
```

---

#### 컨텍스트 윈도우 관리

**문제:**
긴 대화 시 초반 정보를 AI가 잊어버림

**해결:**

**1. 주기적 요약 요청**
```
"지금까지 논의한 내용 요약:
- 변경된 파일 목록
- 주요 결정 사항
- 남은 작업"
```

**2. 중요 정보 반복 명시**
```
"[다시 상기] 프로젝트 컨텍스트:
- Next.js 14 App Router
- TypeScript strict mode
- Prisma ORM
- 1:1 매핑 원칙 준수

이제 Profile 페이지 생성해줘"
```

**3. 파일 선택적 제공**
```
"다음 파일들만 참고:
- src/types/user.ts
- src/lib/auth.ts

Profile 컴포넌트 생성"
```

**4. 새 대화 시작**
- 토큰 한계 근접 시 (대화 30회+)
- 주제가 완전히 바뀔 때
- AI가 혼란스러워할 때

---

## 3. 코드 생성 & 수정

### 3.1 파일 수정 범위 명시 (CRITICAL)

**문제 상황:**
AI가 의도하지 않은 파일을 수정하여 기존 코드 손상

**해결책:**
```
수정 파일: src/components/Button.tsx만
수정 금지: 다른 모든 파일

또는

Only edit these files:
- src/components/Button.tsx
- src/components/Button.test.tsx
```

**Cursor Composer 옵션:**
- ✅ "Only edit these files" 체크박스 활성화

---

### 3.2 Git Diff로 변경 검증

**모든 AI 수정 후 필수 실행:**

```bash
# 변경된 파일 목록
git status

# 변경 내용 상세 확인
git diff

# 특정 파일만
git diff src/components/Button.tsx

# 스테이징된 변경사항
git add .
git diff --staged
```

**검증 체크리스트:**
```
[ ] 의도한 파일만 변경되었는가?
[ ] .env 파일이 변경되지 않았는가?
[ ] 삭제된 코드가 없는가?
[ ] import 구문이 깨지지 않았는가?
[ ] 타입 정의가 유지되는가?
```

**문제 발견 시:**
```bash
# 특정 파일 변경 취소
git checkout -- src/components/Button.tsx

# 모든 변경 취소 (주의)
git reset --hard HEAD
```

---

### 3.3 API 최신 문서 확인

**문제:**
AI의 학습 데이터가 오래되어 deprecated API 사용

**해결책:**

#### Step 1: 공식 문서 검색
```
프롬프트:
"OpenAI GPT-4 API 2025년 1월 기준 최신 문서 검색:
- 공식 문서 URL
- 최신 버전 번호
- Breaking changes
- 권장 모델 이름"
```

#### Step 2: 코드 생성 시 버전 명시
```
프롬프트:
"Stripe API v2024-12 기준으로 결제 연동:
- PaymentIntent 생성
- Webhook 핸들러
- 에러 처리
공식 문서 참고: https://stripe.com/docs/api"
```

#### Step 3: 생성된 코드 검증
```typescript
// AI 생성 코드에서 확인할 것:

// ✅ 최신 import 경로
import Stripe from 'stripe';  // 최신
// ❌ const stripe = require('stripe');  // 구식

// ✅ 최신 API 버전
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18'  // 최신 버전 명시
});

// ✅ 타입 안정성
const paymentIntent: Stripe.PaymentIntent = await stripe.paymentIntents.create()
```

---

### 3.4 타입 정의 우선

**원칙: 코드 작성 전 타입 먼저 정의**

```typescript
// 1단계: 타입 정의
// src/types/user.types.ts
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
}

export interface UpdateUserInput {
  name?: string;
  avatar?: string;
}

// 2단계: API 응답 타입
export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

// 3단계: 타입 기반 코드 작성
// src/services/userService.ts
import { User, CreateUserInput, ApiResponse } from '@/types/user.types';

export async function createUser(
  input: CreateUserInput
): Promise<ApiResponse<User>> {
  // 구현
}
```

---

### 3.5 에러 처리 템플릿

```typescript
// src/utils/errorHandler.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// 사용 예시
export async function fetchUser(id: string): Promise<User> {
  try {
    const response = await fetch(`/api/users/${id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new AppError(404, '사용자를 찾을 수 없습니다');
      }
      if (response.status === 401) {
        throw new AppError(401, '인증이 필요합니다');
      }
      throw new AppError(response.status, '요청 실패');
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    if (error instanceof TypeError) {
      throw new AppError(500, '네트워크 오류');
    }
    throw new AppError(500, '알 수 없는 오류');
  }
}
```

---

### 3.6 AI 자가 검토 요청

**프롬프트에 포함:**
```
코드 작성 후 다음 항목 자가 검토:

1. 타입 안정성
   [ ] 모든 함수 파라미터 타입 명시
   [ ] 반환 타입 명시
   [ ] any 타입 사용 안 함

2. 에러 처리
   [ ] try-catch 블록
   [ ] 의미 있는 에러 메시지
   [ ] 에러 로깅

3. 코드 품질
   [ ] 함수 길이 < 50라인
   [ ] 복잡도 < 10
   [ ] 1:1 매핑 원칙 준수

4. 테스트
   [ ] 정상 케이스 1개
   [ ] 에러 케이스 2개

5. 문서화
   [ ] JSDoc 주석
   [ ] 복잡한 로직 설명

검토 완료 후 체크리스트 제공
```

---

### 3.7 AI 생성 코드 리뷰 체크리스트

#### 필수 검증 항목

**1. 보안 취약점** 🔴
```
[ ] SQL Injection 방어 (Prepared Statement 사용)
[ ] XSS 방어 (입력 sanitize, 출력 escape)
[ ] CSRF 토큰 확인
[ ] 환경 변수로 시크릿 관리 (하드코딩 금지)
[ ] 사용자 입력 검증 (Zod, Joi 등)
[ ] 인증/인가 체크
[ ] Rate limiting
[ ] HTTPS 사용
```

**예시: 취약한 코드**
```typescript
// ❌ SQL Injection 위험
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ 안전한 방법
const user = await prisma.user.findUnique({ where: { email } });
```

---

**2. 성능 이슈** 🟡
```
[ ] N+1 쿼리 문제 (include, select 사용)
[ ] 무한 루프 가능성
[ ] 메모리 누수 (이벤트 리스너 정리)
[ ] 불필요한 re-render (React.memo, useMemo)
[ ] 큰 파일 업로드 제한
[ ] 페이지네이션 구현
[ ] 인덱스 최적화 (DB)
```

**예시: N+1 문제**
```typescript
// ❌ N+1 쿼리 (users 수만큼 쿼리 발생)
const users = await prisma.user.findMany();
for (const user of users) {
  const posts = await prisma.post.findMany({ where: { userId: user.id } });
}

// ✅ 한 번에 조회
const users = await prisma.user.findMany({
  include: { posts: true }
});
```

---

**3. 에러 처리** 🟠
```
[ ] try-catch 블록 존재
[ ] 의미 있는 에러 메시지
[ ] 에러 타입별 처리
[ ] 사용자 친화적 메시지
[ ] 에러 로깅
[ ] 에러 경계 (Error Boundary)
[ ] Fallback UI
```

---

**4. 타입 안정성** 🔵
```
[ ] any 타입 사용 안 함
[ ] 모든 함수 파라미터 타입 명시
[ ] 반환 타입 명시
[ ] 인터페이스/타입 재사용
[ ] 유니온 타입 적절히 사용
[ ] null/undefined 처리
[ ] 타입 가드 사용
```

---

**5. 코드 품질** 🟢
```
[ ] 함수 길이 < 50라인
[ ] 순환 복잡도 < 10
[ ] 1:1 매핑 원칙 준수
[ ] DRY (Don't Repeat Yourself)
[ ] SOLID 원칙
[ ] 네이밍 명확성
[ ] 주석 적절함 (과하지 않게)
[ ] 린트 규칙 통과
```

---

**6. 테스트 커버리지** ✅
```
[ ] 단위 테스트 존재
[ ] 정상 케이스 테스트
[ ] 에러 케이스 테스트
[ ] 엣지 케이스 테스트
[ ] 모킹 적절함
[ ] 테스트 코드 가독성
```

---

#### AI에게 리뷰 요청하기

```
방금 생성한 코드를 다음 기준으로 리뷰:

1. 보안 취약점 (SQL Injection, XSS 등)
2. 성능 이슈 (N+1 쿼리, 무한 루프 등)
3. 에러 처리 누락
4. any 타입 사용
5. 린트 규칙 위반

각 항목별로:
- 문제점 (있다면)
- 심각도 (Critical/High/Medium/Low)
- 수정 방법

문제 없으면 "✅ 검토 완료, 문제 없음"
```

---

#### 사람이 최종 확인할 것

```
🔴 CRITICAL - 반드시 사람이 확인:
[ ] 실제 API 키가 코드에 없는가?
[ ] 프로덕션 DB URL이 노출되지 않았는가?
[ ] 결제 로직이 정확한가?
[ ] 사용자 데이터 삭제 로직이 안전한가?
[ ] 권한 체크가 우회 가능하지 않은가?

🟡 HIGH - 신중히 확인:
[ ] 비즈니스 로직이 요구사항과 일치하는가?
[ ] 에지 케이스가 모두 처리되는가?
[ ] 트랜잭션이 필요한 곳에 적용되었는가?
[ ] 동시성 문제가 없는가?

🟢 MEDIUM - 가능하면 확인:
[ ] 코드가 팀 컨벤션을 따르는가?
[ ] 성능 최적화 여지가 있는가?
[ ] 리팩토링 가능한 부분이 있는가?
```

---

## 4. 디버깅 전략

### 4.1 에러 메시지 읽기

#### A. 타입 에러
```typescript
// 에러: Type 'string' is not assignable to type 'number'
const age: number = "25";  // ❌

// 해결
const age: number = 25;  // ✅
const age: number = parseInt("25");  // ✅
```

#### B. undefined 에러
```typescript
// 에러: Cannot read property 'name' of undefined
const userName = user.name;  // user가 undefined

// 해결 1: Optional Chaining
const userName = user?.name;  // ✅

// 해결 2: Nullish Coalescing
const userName = user?.name ?? 'Guest';  // ✅

// 해결 3: Early Return
if (!user) return;
const userName = user.name;  // ✅
```

#### C. Promise 에러
```typescript
// 에러: Unhandled Promise Rejection
fetch('/api/data');  // ❌

// 해결
fetch('/api/data')
  .then(res => res.json())
  .catch(err => console.error(err));  // ✅

// 또는
try {
  const res = await fetch('/api/data');
  const data = await res.json();
} catch (err) {
  console.error(err);
}  // ✅
```

---

### 4.2 Cursor 디버깅 워크플로우

#### Step 1: 에러 복사
```bash
# 전체 에러 로그 복사
npm run dev 2>&1 | tee error.log
```

#### Step 2: Chat 모드에서 질문
```
"다음 에러 해결:

[에러 전체 붙여넣기]

파일: src/components/UserProfile.tsx
라인: 42

관련 코드:
[해당 부분 코드 붙여넣기]"
```

#### Step 3: 제안된 수정 검증
```bash
# 수정 전 백업
git stash

# AI 수정 적용
# ...

# 테스트
npm run dev

# 문제 있으면 복구
git stash pop
```

---

### 4.3 Claude (웹) 디버깅

**복잡한 버그는 Claude 웹에서:**

```
프롬프트:
"다음 버그 디버깅:

문제:
사용자 로그인 후 대시보드 리다이렉트 시 무한 루프 발생

환경:
- Next.js 14 App Router
- NextAuth.js 5.0
- Middleware: src/middleware.ts

관련 코드:

// middleware.ts
[코드 붙여넣기]

// app/dashboard/page.tsx
[코드 붙여넣기]

// app/api/auth/[...nextauth]/route.ts
[코드 붙여넣기]

재현:
1. /login 페이지에서 로그인
2. /dashboard로 리다이렉트
3. 무한 리다이렉트 발생

요청:
1. 원인 분석 (단계별)
2. 해결 방법 3가지 (장단점)
3. 권장 방법의 수정 코드 전체"
```

---

### 4.4 디버깅 체크리스트

```
## 기본 확인사항
[ ] 콘솔 에러 메시지 전체 확인
[ ] 브라우저 개발자 도구 Network 탭
[ ] 타입 에러 (npm run type-check)
[ ] 린트 에러 (npm run lint)
[ ] 환경 변수 로드 확인
[ ] 의존성 최신 상태 (npm outdated)

## 재현 단계
[ ] 버그 발생 조건 명확화
[ ] 최소 재현 코드 작성
[ ] 스크린샷/영상 촬영

## 시도 사항
[ ] 서버 재시작
[ ] node_modules 재설치
[ ] .next 폴더 삭제 (Next.js)
[ ] 브라우저 캐시 삭제
[ ] 다른 브라우저 테스트

## AI 활용
[ ] 에러 메시지 전체 복사
[ ] 관련 코드 최소 50줄 제공
[ ] 환경 정보 포함
[ ] 시도한 방법 나열
```

---

## 5. 비용 최적화

### 5.1 API 호출 최소화

#### 프롬프트 품질 향상으로 재시도 줄이기

**나쁜 예 (5회 재시도):**
```
1회: "버튼 만들어줘" → 모호함
2회: "파란색 버튼 만들어줘" → 크기 없음
3회: "큰 파란색 버튼" → 컴포넌트 형태 불명확
4회: "React 컴포넌트로 큰 파란색 버튼" → 타입 없음
5회: "TypeScript로 React 버튼 컴포넌트, 파란색, 큰 크기"
```

**좋은 예 (1회 성공):**
```
"TypeScript React 버튼 컴포넌트:
- 파란색 배경 (bg-blue-600)
- 큰 크기 (px-6 py-3)
- 파일: src/components/Button.tsx
- Props: onClick, children, disabled
- Tailwind CSS"
```

**절약:** 5회 → 1회 (80% 절감)

---

#### 파일 선택적 제공

**나쁜 예:**
```
전체 프로젝트 폴더를 컨텍스트에 포함
→ 불필요한 토큰 소비
```

**좋은 예:**
```
"다음 파일만 참고:
- src/types/user.ts
- src/lib/auth.ts

ProfileForm 컴포넌트 생성"
```

---

#### 캐싱 활용 (Claude API)

```typescript
// 반복 질문은 시스템 프롬프트로
const systemPrompt = `
프로젝트: Next.js 14 App Router
언어: TypeScript strict
스타일: Tailwind CSS
규칙: 1:1 매핑 원칙
`;

// 매번 반복하지 않음
```

---

### 5.2 무료 도구 활용 전략

#### 작업별 도구 선택

| 작업 | 무료 도구 | 유료 대안 | 비용 절감 |
|------|-----------|-----------|-----------|
| 자동완성 | Codeium | GitHub Copilot ($10) | $10/월 |
| UI 프로토타입 | v0 (무료 티어) | Cursor + Prompts | 시간 절약 |
| 코드 리뷰 | Claude (무료) | Cursor Chat | 충분함 |
| 문서 작성 | Claude (무료) | ChatGPT Plus | 충분함 |
| 학습 | Codeium + Claude | Cursor Pro | $20/월 |

**예상 절감:** $30/월 → $0-10/월

---

#### 팀 계정 공유 (비추천 vs 추천)

❌ **비추천: 계정 공유**
- 대부분 서비스 약관 위반
- 계정 정지 위험

✅ **추천: 팀 플랜**
- Cursor Team: 사용자당 할인
- GitHub Copilot: 조직 라이선스
- Claude Team: 5인 이상

---

### 5.3 프롬프트 길이 최적화

#### 불필요한 컨텍스트 제거

**나쁜 예 (500 토큰):**
```
"프로젝트는 Next.js 14를 사용하고 App Router 방식이며
TypeScript strict 모드를 활성화했고 Tailwind CSS를 
스타일링에 사용하며 ESLint와 Prettier를 설정했고
Prisma를 ORM으로 사용하고 PostgreSQL을 데이터베이스로
사용하며... (장황한 설명 계속)

Button 컴포넌트 만들어줘"
```

**좋은 예 (100 토큰):**
```
"Next.js 14 + TypeScript Button 컴포넌트:
- Tailwind CSS
- Props: onClick, children, disabled"
```

**절약:** 400 토큰 (80%)

---

#### 코드만 요청

```
"설명 없이 코드만 출력"
→ 응답 길이 50% 감소
```

---

### 5.4 토큰 사용량 모니터링

#### Claude API 사용 시

```typescript
const response = await anthropic.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 1000,  // 제한 설정
  messages: [...]
});

// 사용량 확인
console.log('Input tokens:', response.usage.input_tokens);
console.log('Output tokens:', response.usage.output_tokens);
```

---

#### 월별 예산 설정

**개인 개발자:**
- Cursor: $20/월 (고정)
- Claude API: $0-50/월 (변동)
- 총: $20-70/월

**팀 (5명):**
- Cursor Team: $15/인 → $75/월
- Claude Team: $30/인 → $150/월
- 총: $225/월 (개별 구독 대비 25% 절감)

---

## 6. 협업 워크플로우

### 5.1 팀 규칙 설정

```
# CONTRIBUTING.md

## 개발 워크플로우

1. 이슈 생성
2. feature/* 브랜치 생성
3. AI 도구로 개발
4. Self Review (체크리스트)
5. PR 생성
6. 코드 리뷰
7. 머지

## AI 사용 규칙

### DO
- ✅ 프롬프트에 "수정 범위" 명시
- ✅ 생성된 코드 git diff 확인
- ✅ 타입 정의 우선
- ✅ 테스트 코드 함께 생성
- ✅ 성공한 프롬프트 저장 (.prompts/)

### DON'T
- ❌ 전체 파일 자동 수정
- ❌ .env 파일 AI에 노출
- ❌ 미검증 코드 바로 커밋
- ❌ 보안 관련 코드 AI에 의존

## 코드 리뷰 기준

- 타입 안정성
- 에러 처리
- 1:1 매핑 준수
- 테스트 커버리지 > 80%
- 보안 체크리스트 통과
```

---

### 5.2 성공한 프롬프트 저장

```
/.prompts
  /components
    - button-creation.md
    - form-validation.md
  /api
    - rest-endpoint.md
    - auth-middleware.md
  /database
    - prisma-schema.md
    - migration.md
```

**예시: .prompts/components/button-creation.md**
```
# Button 컴포넌트 생성 프롬프트

## 사용 상황
- 새 버튼 컴포넌트 필요 시
- 일관된 스타일 적용 필요

## 프롬프트

다음 조건으로 Button 컴포넌트 생성:

파일 위치: src/components/ui/Button.tsx

기능:
- variant: primary, secondary, outline, ghost
- size: sm, md, lg
- loading 상태
- disabled 상태
- 아이콘 지원 (왼쪽/오른쪽)

요구사항:
- TypeScript
- Tailwind CSS
- cva (class-variance-authority)
- React.forwardRef
- 접근성 (ARIA)

## 결과
- ✅ 성공
- 생성 파일: Button.tsx (142줄)
- 추가 수정 필요 없음
```

---

## 7. 보안 고려사항

### 6.1 AI에 노출하면 안 되는 정보

```
## CRITICAL - 절대 AI에 제공 금지

❌ .env 파일 전체
❌ API 키 (OpenAI, Stripe, AWS 등)
❌ 데이터베이스 비밀번호
❌ JWT Secret
❌ 암호화 키
❌ 실제 사용자 데이터
❌ 결제 정보
❌ 개인 식별 정보 (PII)
```

### 6.2 안전한 프롬프트 작성

```
## ✅ 안전한 예시

"Stripe 결제 연동 코드 작성:
- 환경 변수 사용: process.env.STRIPE_SECRET_KEY
- Webhook secret: process.env.STRIPE_WEBHOOK_SECRET
- 테스트 모드 키 사용"

## ❌ 위험한 예시

"Stripe 결제 연동:
- API 키: sk_live_51H...
- Webhook secret: whsec_..."
```

---

### 6.3 .cursorignore 필수 설정

```
# .cursorignore

# 환경 변수
.env
.env.*

# 보안 관련
src/config/secrets.ts
src/utils/encryption.ts
src/middleware/auth.ts

# 결제
src/services/payment/stripe-client.ts

# 데이터베이스
prisma/seed.ts
migrations/
```

---

## 8. 체크리스트

### ✅ AI 협업 개발 체크리스트

```
## 프롬프트 작성
[ ] 작업 유형 명시
[ ] 구체적 요구사항
[ ] 제약사항 포함
[ ] 파일 수정 범위 명시
[ ] 출력 형식 지정

## 코드 생성 전
[ ] Git 상태 확인 (git status)
[ ] 브랜치 확인
[ ] 관련 기존 코드 참고
[ ] API 최신 문서 확인 (필요 시)
[ ] 타입 정의 우선

## 코드 생성 후
[ ] Git diff 확인
[ ] 의도하지 않은 파일 변경 없음
[ ] 타입 에러 없음 (npm run type-check)
[ ] 린트 통과 (npm run lint)
[ ] 로컬 테스트 실행
[ ] 브라우저에서 동작 확인

## 에러 처리
[ ] try-catch 블록
[ ] 의미 있는 에러 메시지
[ ] 에러 로깅
[ ] 사용자 친화적 메시지

## 보안
[ ] .env 파일 AI 노출 안 함
[ ] API 키 하드코딩 안 함
[ ] 사용자 데이터 제공 안 함
[ ] .cursorignore 설정

## 문서화
[ ] JSDoc 주석
[ ] 복잡한 로직 설명
[ ] 성공한 프롬프트 저장
[ ] README 업데이트 (필요 시)
```

---

## 10. 고급 프롬프팅 & 에러 대응

### 10.1 복잡한 기능 요청 패턴

#### A. 큰 기능을 단계로 쪼개기

**❌ 나쁜 예시:**
```
"사용자 인증, 프로필 편집, 알림 시스템, 
친구 추가, 채팅 기능이 있는 SNS 만들어줘"
```
→ AI가 혼란스러워함, 불완전한 코드 생성

**✅ 좋은 예시:**
```
Step 1: "NextAuth로 이메일 로그인 구현해줘"
→ 완성 & 테스트

Step 2: "프로필 편집 페이지 만들어줘. 
       이름, 프로필 사진, 자기소개 수정 가능하게"
→ 완성 & 테스트

Step 3: "알림 시스템 추가해줘. 
       Prisma 스키마에 Notification 모델 만들고
       /api/notifications 엔드포인트 추가"
→ 완성 & 테스트

...
```

---

#### B. Context 명확히 전달

**❌ 나쁜 예시:**
```
"로그인 버튼 추가해줘"
```
→ 어디에? 어떤 스타일? 어떤 동작?

**✅ 좋은 예시:**
```
"app/login/page.tsx 파일에 로그인 버튼 추가해줘.

요구사항:
- Tailwind CSS 사용
- 구글 로그인 버튼 (파란색)
- 클릭 시 signIn('google') 호출
- 로딩 상태 표시
- 에러 처리 포함

참고: NextAuth 이미 설정되어 있음"
```

---

#### C. 예시 코드/스타일 제공

**프롬프트:**
```
"이 디자인과 비슷한 카드 컴포넌트 만들어줘:

[이미지 첨부 또는]

참고 코드:
<div className="rounded-lg shadow-md p-6 hover:shadow-lg transition">
  <h3>타이틀</h3>
  <p>설명</p>
</div>

이런 느낌으로, 하지만 데이터는 props로 받게"
```

---

### 10.2 AI 에러 대응

#### A. 에러 메시지 전체 공유

**❌ 나쁜 예시:**
```
"에러 나는데?"
"안 돼"
"작동 안 함"
```

**✅ 좋은 예시:**
```
"다음 에러가 발생합니다:

Error: Cannot find module 'next-auth'
  at /app/api/auth/[...nextauth]/route.ts:1:1

시도한 것:
- npm install 실행
- 서버 재시작

next-auth 버전: 4.24.0
Node 버전: 18.17.0
OS: macOS 14.0"
```

---

#### B. 구체적인 문제 설명

**❌ 나쁜 예시:**
```
"버튼이 이상해"
```

**✅ 좋은 예시:**
```
"로그인 버튼의 문제:

1. 기대: 클릭 시 로그인 페이지로 이동
2. 실제: 아무 반응 없음
3. 콘솔 에러: 'onClick is not a function'
4. 브라우저: Chrome 120

관련 코드:
<button onClick={handleLogin}>로그인</button>

handleLogin은 정의되어 있습니다."
```

---

#### C. 여러 번 시도해도 안 되면?

**전략 1: 접근 방법 바꾸기**
```
"이 방법으로 안 되니까, 
대신 [다른 라이브러리/방식]으로 해줄래?"

예: "NextAuth 대신 Clerk로 인증 구현해줘"
```

**전략 2: 최소 예제로 시작**
```
"복잡한 건 나중에 하고, 
일단 가장 간단한 버전만 만들어줘"

예: "프로필 편집 기능 중 이름만 수정 가능하게 먼저"
```

**전략 3: 공식 문서 참조 요청**
```
"Next.js 공식 문서 참고해서 
App Router 방식으로 다시 작성해줘"
```

---

### 10.3 코드 품질 개선 요청

#### A. "더 나은 방법" 질문법

```
현재 코드:
[코드 붙여넣기]

질문:
"이 코드의 문제점과 개선 방법을 알려줘.
특히 다음 관점에서:
1. 성능
2. 가독성
3. 유지보수성
4. 보안"
```

---

#### B. 성능 개선 요청

**프롬프트 템플릿:**
```
"이 컴포넌트의 렌더링 성능을 개선해줘:

[코드]

고려사항:
- 불필요한 리렌더링 방지
- 메모이제이션 적용
- useMemo, useCallback 활용
- 큰 리스트는 가상화"
```

**AI 응답 예시:**
```typescript
// Before: 매번 리렌더링
function UserList({ users }) {
  return users.map(user => <UserCard user={user} />)
}

// After: 메모이제이션
const UserList = memo(function UserList({ users }) {
  return users.map(user => <UserCard key={user.id} user={user} />)
})

const UserCard = memo(function UserCard({ user }) {
  // ...
})
```

---

#### C. 보안 강화 요청

**프롬프트:**
```
"이 API 라우트의 보안을 강화해줘:

[코드]

추가할 것:
- 인증 확인
- 입력값 검증
- SQL Injection 방지
- Rate Limiting
- CSRF 토큰"
```

---

#### D. 리팩토링 요청

**프롬프트:**
```
"이 코드를 리팩토링해줘:

[200줄 짜리 컴포넌트]

목표:
- 작은 컴포넌트로 분리
- 커스텀 훅 추출
- 재사용 가능하게
- 타입 안정성 개선"
```

---

### 10.4 Context 유지 전략

#### A. 대화 히스토리 활용

```
"앞에서 만든 User 모델에 
lastLoginAt 필드 추가해줘"
```
→ AI가 이전 대화 참조

---

#### B. 파일 구조 명시

```
"현재 프로젝트 구조:

src/
├─ app/
│  ├─ (auth)/
│  │  └─ login/
│  └─ dashboard/
├─ components/
└─ lib/

이 구조에 맞춰서 
회원가입 페이지 추가해줘"
```

---

#### C. 이전 결정 사항 언급

```
"이전에 인증은 NextAuth로 하기로 했지?
그럼 회원가입도 NextAuth Credentials Provider로 해줘"
```

---

### 10.5 실전 시나리오별 프롬프트

#### Scenario 1: 새 기능 추가

```
"프로젝트에 댓글 기능 추가하려고 해.

현재 상황:
- Post 모델 있음
- User 모델 있음
- Prisma 사용 중

필요한 것:
1. Comment 모델 생성 (Prisma 스키마)
2. POST /api/posts/[id]/comments (댓글 작성)
3. GET /api/posts/[id]/comments (댓글 목록)
4. CommentList 컴포넌트
5. CommentForm 컴포넌트

한 단계씩 진행하자. 먼저 Prisma 스키마부터"
```

---

#### Scenario 2: 버그 수정

```
"버그 발견:

증상: 로그아웃 후에도 세션이 유지됨
재현 방법:
1. 로그인
2. 로그아웃 버튼 클릭
3. 새로고침
4. 여전히 로그인 상태

코드:
// app/api/auth/signout/route.ts
export async function POST() {
  // 현재 코드
}

원인 파악하고 수정해줘"
```

---

#### Scenario 3: 성능 문제

```
"대시보드가 너무 느려.

Lighthouse 점수: 45
문제:
- Initial Load: 8초
- FCP: 4초
- LCP: 6초

추측 원인:
- 이미지 최적화 안 됨 (3MB PNG 여러 개)
- API 호출이 순차적 (3개 API가 10초)
- 불필요한 리렌더링

최적화 방법 알려주고 코드 수정해줘"
```

---

#### Scenario 4: 배포 준비

```
"Vercel에 배포하려고 하는데 체크리스트 알려줘.

현재 상황:
- Next.js 14 App Router
- Prisma + PostgreSQL
- NextAuth 인증
- Vercel Blob (파일 스토리지)

환경 변수, 빌드 설정 등 
놓치기 쉬운 것들 정리해줘"
```

---

## 11. 기술 스택 의사결정 가이드

### 11.1 인증 (Authentication)

#### JWT vs Session vs OAuth

**JWT (JSON Web Token)**
```
✅ 사용 시기:
- 모바일 앱 (React Native, Flutter)
- 마이크로서비스 아키텍처
- Stateless API (서버 확장 쉬움)
- 다른 도메인 간 인증

❌ 피해야 할 때:
- 토큰 무효화 필요 (로그아웃 즉시 반영)
- 민감한 정보 저장 (JWT는 디코딩 가능)

구현:
- jose 라이브러리
- NextAuth (JWT 모드)
```

**Session (Cookie-based)**
```
✅ 사용 시기:
- 웹 앱만 (같은 도메인)
- 서버 사이드 렌더링 (SSR)
- 즉시 로그아웃 필요
- 보안이 최우선

❌ 피해야 할 때:
- 모바일 앱 지원
- 서버 여러 대 (Redis 필요)

구현:
- NextAuth (Session 모드)
- iron-session
```

**OAuth (소셜 로그인)**
```
✅ 사용 시기:
- 사용자 편의성 중요
- 빠른 가입 원함
- 구글, 카카오 등 연동

구현:
- NextAuth (권장)
- Supabase Auth
- Clerk
```

**의사결정 플로우:**
```
모바일 앱 있음? 
  → Yes: JWT
  → No: 계속

즉시 로그아웃 필요?
  → Yes: Session
  → No: JWT도 괜찮음

소셜 로그인?
  → Yes: OAuth + (JWT or Session)
  → No: 이메일 로그인
```

---

### 11.2 데이터베이스

#### SQL (PostgreSQL) vs NoSQL (MongoDB)

**PostgreSQL (SQL)**
```
✅ 사용 시기:
- 관계가 복잡함 (User ↔ Post ↔ Comment)
- 데이터 일관성 중요 (은행, 결제)
- 트랜잭션 필요
- 조인 쿼리 많음
- 정형화된 데이터

예시 프로젝트:
- 전자상거래
- SaaS 대시보드
- 예약 시스템
- 블로그/CMS

구현:
- Prisma (권장)
- Drizzle ORM
- Supabase
- Neon
```

**MongoDB (NoSQL)**
```
✅ 사용 시기:
- 스키마 자주 변경
- 유연한 데이터 구조
- 빠른 프로토타이핑
- 대용량 로그 저장
- 비정형 데이터

예시 프로젝트:
- 소셜 미디어 (복잡한 중첩 구조)
- IoT 데이터 수집
- 로그 분석
- 실시간 채팅

구현:
- Mongoose
- MongoDB Atlas
```

**의사결정 플로우:**
```
관계형 데이터?
  → 복잡함: PostgreSQL
  → 단순함: 어느 쪽이든 OK

스키마 변경 빈도?
  → 자주: MongoDB
  → 거의 없음: PostgreSQL

트랜잭션 필요?
  → Yes: PostgreSQL
  → No: 어느 쪽이든 OK
```

---

### 11.3 호스팅 플랫폼

#### Vercel vs AWS vs Railway vs Render

**Vercel**
```
✅ 사용 시기:
- Next.js 프로젝트
- 빠른 배포 원함
- 프론트엔드 중심
- 소규모 ~ 중규모
- Serverless Functions

💰 비용:
- Hobby: 무료 (개인 프로젝트)
- Pro: $20/월
- 대역폭: 100GB → 1TB

❌ 피해야 할 때:
- 장시간 실행 작업 (10초 제한)
- WebSocket 장시간
- 복잡한 백엔드
```

**Railway**
```
✅ 사용 시기:
- 풀스택 앱
- Docker 컨테이너
- 백엔드 중심
- PostgreSQL/Redis 필요
- WebSocket

💰 비용:
- Hobby: $5/월 (크레딧)
- 실제 사용량 과금

구현:
- Dockerfile 작성
- railway.toml 설정
```

**Render**
```
✅ 사용 시기:
- Railway 대안
- 무료 티어 원함 (느림)
- 간단한 백엔드

💰 비용:
- Free: $0 (느림, 15분 후 sleep)
- Starter: $7/월

❌ 피해야 할 때:
- 빠른 응답 필요
- 항시 가동 필요
```

**AWS (EC2, Lambda, ECS)**
```
✅ 사용 시기:
- 엔터프라이즈급
- 완전한 제어 원함
- 특수한 요구사항
- 예산 충분

❌ 피해야 할 때:
- 빠른 프로토타이핑
- DevOps 경험 없음
- 소규모 프로젝트
```

**의사결정 플로우:**
```
프레임워크?
  → Next.js: Vercel (1순위)
  → 다른 것: 계속

백엔드 복잡도?
  → 간단: Vercel
  → 복잡: Railway

예산?
  → 무료: Vercel/Render (제한적)
  → $5-20: Railway/Vercel Pro
  → $50+: AWS
```

---

### 11.4 결제 시스템

#### Stripe vs 토스페이먼츠 vs 기타

**Stripe**
```
✅ 사용 시기:
- 글로벌 시장 대상
- 해외 고객 많음
- 구독 서비스 (SaaS)
- 복잡한 결제 로직

💰 수수료:
- 국내 카드: 3.6% + ₩50
- 해외 카드: 3.9% + ₩50

장점:
- 훌륭한 문서
- SDK 풍부
- Webhook 안정적
```

**토스페이먼츠**
```
✅ 사용 시기:
- 한국 시장만
- 낮은 수수료
- 간편결제 (카카오페이 등)

💰 수수료:
- 국내 카드: 2.9%
- 간편결제: 2.8%

장점:
- 한국어 지원
- 국내 결제 특화
- 빠른 정산
```

**의사결정:**
```
고객 위치?
  → 한국만: 토스페이먼츠
  → 글로벌: Stripe
  → 둘 다: Stripe (국제 표준)

서비스 타입?
  → 구독: Stripe
  → 일회성: 토스 괜찮음
```

---

### 11.5 파일 스토리지

#### AWS S3 vs Cloudinary vs Vercel Blob

**AWS S3**
```
✅ 사용 시기:
- 대용량 파일 많음
- 완전한 제어 원함
- 저렴한 스토리지

💰 비용:
- 저장: $0.023/GB/월
- 전송: $0.09/GB

구현:
- aws-sdk
- presigned URL
```

**Cloudinary**
```
✅ 사용 시기:
- 이미지/동영상 중심
- 자동 최적화 원함
- 변환/리사이징 필요

💰 비용:
- Free: 25 크레딧/월
- Plus: $99/월

장점:
- 자동 WebP 변환
- 리사이징 자동
- CDN 포함
```

**Vercel Blob**
```
✅ 사용 시기:
- Vercel 사용 중
- 간단한 파일 업로드
- 빠른 구현

💰 비용:
- Hobby: 포함 안 됨
- Pro: $0.03/GB

장점:
- 설정 간단
- Vercel 통합
```

**의사결정:**
```
파일 타입?
  → 이미지/동영상: Cloudinary
  → 일반 파일: S3/Vercel Blob

Vercel 사용?
  → Yes: Vercel Blob (간단함)
  → No: S3 or Cloudinary

예산?
  → 저렴: S3
  → 편의성: Cloudinary
```

---

### 11.6 이메일 발송

#### SendGrid vs Resend vs AWS SES

**Resend (추천)**
```
✅ 사용 시기:
- 개발자 친화적 원함
- React 이메일 템플릿
- 현대적 인터페이스

💰 비용:
- Free: 100/일, 3000/월
- Pro: $20/월 (50k)

구현:
- resend npm package
- @react-email/components
```

**SendGrid**
```
✅ 사용 시기:
- 대용량 발송
- 마케팅 이메일
- 상세한 분석 필요

💰 비용:
- Free: 100/일
- Essentials: $19.95/월 (50k)

구현:
- @sendgrid/mail
```

**의사결정:**
```
발송량?
  → < 3000/월: Resend (무료)
  → > 3000/월: SendGrid

템플릿?
  → React: Resend
  → HTML: SendGrid
```

---

### 11.7 실전 의사결정 예시

#### 예시 1: 간단한 블로그

```
요구사항:
- 개인 블로그
- 글 작성/수정
- 댓글
- 검색

결정:
✅ 프레임워크: Next.js 14
✅ 호스팅: Vercel (무료)
✅ DB: PostgreSQL (Neon 무료)
✅ ORM: Prisma
✅ 인증: NextAuth (소셜 로그인)
✅ 이미지: Cloudinary (무료 25 크레딧)

총 비용: $0/월
```

---

#### 예시 2: SaaS 대시보드

```
요구사항:
- 구독 결제
- 팀 관리
- 대시보드/분석
- API 제공

결정:
✅ 프레임워크: Next.js 14
✅ 호스팅: Vercel Pro ($20)
✅ DB: PostgreSQL (Supabase Pro $25)
✅ ORM: Prisma
✅ 인증: Clerk ($25)
✅ 결제: Stripe
✅ 이메일: Resend Pro ($20)
✅ 모니터링: Sentry ($26)

총 비용: ~$116/월
```

---

#### 예시 3: E-Commerce

```
요구사항:
- 상품 관리
- 장바구니
- 결제
- 주문 관리

결정:
✅ 프레임워크: Next.js 14
✅ 호스팅: Vercel Pro
✅ DB: PostgreSQL (Neon Pro)
✅ ORM: Prisma
✅ 인증: NextAuth
✅ 결제: Stripe (글로벌) or 토스 (국내)
✅ 이미지: Cloudinary
✅ 이메일: SendGrid (주문 알림)

총 비용: ~$100/월 + 결제 수수료
```

---

### 🎯 다음 단계

AI 협업 개발이 완료되었다면, 이제 철저한 검증과 테스트가 필요합니다.

**다음으로 이동:** [03. 검증 & 테스트 →](./03_QA_TESTING.md)

---

[← 이전: 01. 기획](./01_PROJECT_SETUP.md) | [목차](./README.md) | [다음: 03. 검증 →](./03_QA_TESTING.md)
