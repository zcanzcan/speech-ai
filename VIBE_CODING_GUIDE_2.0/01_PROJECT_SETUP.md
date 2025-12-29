# 01. 프로젝트 기획 & 초기 설정

**AI 협업 개발 가이드 - Part 1**

[← 목차로](./README.md) | [다음: 02. 개발 →](./02_DEVELOPMENT.md)

---

## 📋 목차

1. [프로젝트 구조 파악](#1-프로젝트-구조-파악)
2. [Git 저장소 설정](#2-git-저장소-설정)
3. [브랜치 전략](#3-브랜치-전략)
4. [코드 구조 설계](#4-코드-구조-설계)
5. [환경 설정](#5-환경-설정)
6. [한국어 처리](#6-한국어-처리)
7. [체크리스트](#7-체크리스트)

---

## 1. 프로젝트 구조 파악

### 1.1 확장자 기반 구조 분석

**핵심 원칙: 도구 이름이 아닌, 파일 구조로 프로젝트 파악**

#### A. HTML/CSS/JS 기반

```
프로젝트/
├── index.html
├── style.css
├── script.js
└── assets/
    ├── images/
    └── fonts/
```

**다음 단계:**
```bash
git init
git add .
git commit -m "feat: 프로젝트 초기화"
```

---

#### B. React/Next.js 기반

```
프로젝트/
├── package.json
├── package-lock.json
├── /app (또는 /src)
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── /components
│   └── ui/
├── /public
│   └── assets/
├── .env.example
├── next.config.js
└── tsconfig.json
```

**다음 단계:**
```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정
cp .env.example .env.local
# .env.local 파일 편집

# 3. 자동 포트 할당 스크립트 생성
cat > start-dev.sh << 'EOF'
#!/bin/bash

# 사용 가능한 포트 찾기
find_port() {
  local port=3000
  while lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; do
    port=$((port + 1))
  done
  echo $port
}

PORT=$(find_port)
echo "🚀 Starting server on port $PORT"
echo "📍 http://localhost:$PORT"
PORT=$PORT npm run dev
EOF

chmod +x start-dev.sh

# 4. 개발 서버 실행
./start-dev.sh
# 또는 수동으로: npm run dev
```

**package.json에 스크립트 추가 (권장):**
```json
{
  "scripts": {
    "dev": "next dev",
    "dev:auto": "./start-dev.sh"
  }
}
```

---

#### C. Python/Flask/Django

```
프로젝트/
├── requirements.txt
├── app.py (Flask) 또는 manage.py (Django)
├── /templates
│   └── *.html
├── /static
│   ├── css/
│   └── js/
├── .env.example
└── README.md
```

**다음 단계:**
```bash
# 1. 가상환경 생성
python -m venv venv

# 2. 가상환경 활성화
# Mac/Linux
source venv/bin/activate
# Windows
venv\Scripts\activate

# 3. 의존성 설치
pip install -r requirements.txt

# 4. 환경 변수 설정
cp .env.example .env
# .env 파일 편집

# 5. 자동 포트 할당 스크립트 생성
cat > start-dev.sh << 'EOF'
#!/bin/bash

# 사용 가능한 포트 찾기
find_port() {
  local port=5000
  while lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; do
    port=$((port + 1))
  done
  echo $port
}

PORT=$(find_port)
echo "🚀 Starting server on port $PORT"
echo "📍 http://localhost:$PORT"

# Flask
if [ -f "app.py" ]; then
  flask run --port=$PORT
# Django
elif [ -f "manage.py" ]; then
  python manage.py runserver $PORT
fi
EOF

chmod +x start-dev.sh

# 6. 서버 실행
./start-dev.sh
# 또는 수동으로:
# Flask: python app.py
# Django: python manage.py runserver
```

---

#### D. Flutter/React Native

```
Flutter:
프로젝트/
├── pubspec.yaml
├── /lib
│   ├── main.dart
│   ├── /screens
│   └── /widgets
└── /assets

React Native:
프로젝트/
├── package.json
├── /src
│   ├── App.tsx
│   ├── /screens
│   └── /components
├── ios/
└── android/
```

**다음 단계:**
```bash
# Flutter
flutter pub get
flutter run

# React Native
npm install
npx react-native run-android
# 또는
npx react-native run-ios
```

---

#### E. 완전 빈 프로젝트

**상황:** 빈 폴더만 존재

**다음 단계: Claude Code로 초기화**

```bash
# Next.js 프로젝트 초기화 예시
claude-code "Next.js 14 앱을 다음 설정으로 초기화:
- TypeScript
- Tailwind CSS
- App Router
- ESLint + Prettier
- src/ 디렉토리 사용
- /components, /lib, /types 폴더 생성
- .env.example 파일 생성"
```

```bash
# Python Flask API 초기화 예시
claude-code "Flask API 프로젝트를 다음 설정으로 초기화:
- requirements.txt
- .env.example
- /api, /models, /utils 폴더
- JWT 인증 설정
- CORS 설정
- 개발/프로덕션 환경 분리"
```

---

### 1.2 프로젝트 구조 검증

#### 자동 검증 스크립트

```bash
# project-check.sh
#!/bin/bash

echo "🔍 프로젝트 타입 감지 중..."

# Node.js 프로젝트
if [ -f "package.json" ]; then
  echo "✅ Node.js 프로젝트"
  echo "Node 버전: $(node -v)"
  echo "NPM 버전: $(npm -v)"
  
  # 프레임워크 감지
  if grep -q "next" package.json; then
    echo "프레임워크: Next.js"
  elif grep -q "react" package.json; then
    echo "프레임워크: React"
  elif grep -q "vue" package.json; then
    echo "프레임워크: Vue"
  fi

# Python 프로젝트
elif [ -f "requirements.txt" ]; then
  echo "✅ Python 프로젝트"
  echo "Python 버전: $(python --version)"
  
  if [ -f "manage.py" ]; then
    echo "프레임워크: Django"
  elif [ -f "app.py" ]; then
    echo "프레임워크: Flask"
  fi

# Flutter 프로젝트
elif [ -f "pubspec.yaml" ]; then
  echo "✅ Flutter 프로젝트"
  echo "Flutter 버전: $(flutter --version | head -1)"

else
  echo "⚠️  프로젝트 타입을 감지할 수 없습니다"
  echo "package.json, requirements.txt, pubspec.yaml 중 하나가 필요합니다"
fi

echo ""
echo "📂 필수 파일 체크:"
[ -f ".gitignore" ] && echo "✅ .gitignore" || echo "❌ .gitignore"
[ -f ".env.example" ] && echo "✅ .env.example" || echo "⚠️  .env.example"
[ -f "README.md" ] && echo "✅ README.md" || echo "⚠️  README.md"
```

**사용법:**
```bash
chmod +x project-check.sh
./project-check.sh
```

---

#### 체크리스트
```
[ ] package.json 또는 requirements.txt 존재 확인
[ ] 의존성 버전 호환성 확인
[ ] README.md 존재 및 내용 확인
[ ] 라이선스 확인
[ ] .gitignore 존재 확인
[ ] 환경 변수 템플릿 (.env.example) 확인
```

---

#### 프로젝트 타입별 필수 파일

**Next.js 프로젝트**
```
[ ] package.json
[ ] next.config.js
[ ] tsconfig.json
[ ] .env.example
[ ] /app (또는 /pages)
[ ] /public
```

**Python 프로젝트**
```
[ ] requirements.txt
[ ] .env.example
[ ] README.md
[ ] app.py 또는 manage.py
[ ] /templates (Flask/Django)
```

**Flutter 프로젝트**
```
[ ] pubspec.yaml
[ ] lib/main.dart
[ ] /android
[ ] /ios
```

---

#### 파일 구조 출력
```bash
# Mac/Linux
tree -L 2 -I 'node_modules|.git'

# Windows
dir /s /b | findstr /v "node_modules .git"

# 간단한 방법
ls -la
```

---

## 2. Git 저장소 설정

### 2.1 로컬 Git 초기화

```bash
# 프로젝트 폴더로 이동
cd my-project

# Git 초기화
git init

# 현재 상태 확인
git status
```

---

### 2.2 .gitignore 필수 설정

#### 범용 .gitignore
```bash
# .gitignore

# 환경 변수 (CRITICAL - 절대 커밋 금지!)
.env
.env.local
.env.*.local
.env.production

# 의존성
node_modules/
venv/
__pycache__/

# 빌드 결과물
dist/
build/
out/
.next/

# 로그
*.log
npm-debug.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp

# 테스트
coverage/
.pytest_cache/
```

#### 프레임워크별 추가 항목

**Next.js:** `.next/`, `out/`, `.vercel`  
**Python:** `__pycache__/`, `*.pyc`, `venv/`, `*.egg-info/`  
**Flutter:** `.dart_tool/`, `build/`, `.flutter-plugins`  

**참고:** [GitHub .gitignore 템플릿](https://github.com/github/gitignore)

---

### 2.3 첫 커밋

#### ⚠️ 커밋 전 필수 확인

```
[ ] .gitignore 생성 완료
[ ] .env 파일이 .gitignore에 포함됨
[ ] node_modules가 .gitignore에 포함됨
[ ] 민감정보 없음 (API 키, 비밀번호, 토큰 등)
[ ] git status로 추가될 파일 확인
[ ] 불필요한 빌드 파일 제외됨
```

**⚠️ 중요:** 민감정보가 한 번이라도 커밋되면 Git 히스토리에 영구 기록됩니다!

---

#### 첫 커밋 실행

```bash
# 모든 파일 추가 (.gitignore 적용됨)
git add .

# 상태 확인 (반드시!)
git status

# 커밋
git commit -m "feat: 프로젝트 초기화"

# 커밋 로그 확인
git log --oneline
```

---

#### 환경 변수 템플릿 생성

```bash
# .env에서 .env.example 자동 생성
grep -v '^#' .env | sed 's/=.*/=/' > .env.example

# 예시 결과:
# DATABASE_URL=
# API_KEY=
# JWT_SECRET=
```

---

### 2.5 시크릿 관리 & 보안

#### Git-secrets 설치 (AWS 키 유출 방지)

**설치:**
```bash
# Mac
brew install git-secrets

# Ubuntu
git clone https://github.com/awslabs/git-secrets
cd git-secrets
sudo make install

# Windows (Git Bash)
git clone https://github.com/awslabs/git-secrets
cd git-secrets
./install.ps1
```

**프로젝트 설정:**
```bash
# 현재 저장소에 적용
cd your-project
git secrets --install

# AWS 키 패턴 추가
git secrets --register-aws

# 커스텀 패턴 추가
git secrets --add 'sk-[a-zA-Z0-9]{48}'  # OpenAI API Key
git secrets --add 'sk_live_[a-zA-Z0-9]{24}'  # Stripe Secret Key

# 전체 파일 스캔
git secrets --scan
```

**동작 방식:**
```bash
# .env 파일 실수로 커밋 시도
echo "OPENAI_API_KEY=sk-abc123..." >> .env
git add .env
git commit -m "Add config"

# ❌ git-secrets가 차단
# [ERROR] Found forbidden pattern: sk-abc123...
# Commit rejected.
```

---

#### .env 실수로 커밋했을 때 대응

**⚠️ 즉시 조치 필요!**

**1. Git 히스토리에서 완전 제거:**
```bash
# BFG Repo-Cleaner 사용 (권장)
brew install bfg
bfg --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 또는 git filter-branch
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
```

**2. 원격 저장소 강제 푸시:**
```bash
git push origin --force --all
git push origin --force --tags
```

**3. 모든 시크릿 즉시 회전:**
```bash
✅ 해야 할 것:
[ ] 모든 API 키 재생성
[ ] 데이터베이스 비밀번호 변경
[ ] JWT Secret 교체
[ ] 팀원에게 알림
[ ] GitHub Security Advisory 확인
```

**4. GitHub에서 알림 확인:**
- Settings → Security → Secret scanning alerts
- 자동으로 감지된 키가 있는지 확인

---

#### API 키 회전 전략

**정기 회전 스케줄:**
```
| 키 종류 | 회전 주기 | 우선순위 |
|---------|----------|----------|
| 프로덕션 DB | 3개월 | 최고 |
| JWT Secret | 6개월 | 높음 |
| API Keys | 6개월 | 높음 |
| OAuth Secrets | 1년 | 보통 |
```

**회전 절차:**
```bash
# 1. 새 키 생성
NEW_KEY=$(openssl rand -base64 32)

# 2. 환경 변수에 추가 (old + new 동시 지원)
OLD_JWT_SECRET=...
NEW_JWT_SECRET=$NEW_KEY

# 3. 코드 배포

# 4. 모니터링 (1주일)

# 5. OLD 키 제거
```

---

#### 민감정보 체크리스트

**절대 커밋하면 안 되는 것:**
```
❌ 절대 금지:
[ ] .env, .env.local, .env.production
[ ] API Keys (OpenAI, Stripe, AWS, etc.)
[ ] Database credentials
[ ] JWT Secrets
[ ] SSH Private Keys (~/.ssh/id_rsa)
[ ] 인증서 (.pem, .p12, .key)
[ ] 고객 개인정보 (PII)
[ ] 내부 IP, 서버 주소

✅ 커밋해도 괜찮은 것:
[ ] .env.example (값 없는 템플릿)
[ ] Public API Keys (클라이언트용)
[ ] 문서, README
[ ] 설정 파일 템플릿
```

---

### 2.6 라이선스 & README

#### 라이선스 선택 가이드

| 라이선스 | 특징 | 사용 조건 | 추천 대상 |
|----------|------|-----------|-----------|
| **MIT** | 매우 관대함, 가장 인기 | 출처 표시만 필수 | 오픈소스, 개인 프로젝트 |
| **Apache 2.0** | 특허 보호 포함 | 출처 표시 + 변경사항 명시 | 기업, 특허 관련 |
| **GPL v3** | 수정본도 오픈소스 의무 | 소스 공개 필수 | 강력한 오픈소스 |
| **Proprietary** | 완전 비공개 | 제한 없음 | 상용 소프트웨어 |
| **Unlicense** | 퍼블릭 도메인 | 제한 없음 | 완전 자유 배포 |

**생성:**
```bash
# GitHub에서 자동 생성
# 저장소 생성 시 "Add a README" + "Choose a license" 선택

# 또는 수동 생성
touch LICENSE
# https://choosealicense.com 에서 복사
```

---

#### README.md 기본 템플릿

```
# 프로젝트명

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

프로젝트에 대한 한 줄 설명

## 📋 목차
- [소개](#소개)
- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [시작하기](#시작하기)
- [사용법](#사용법)
- [기여하기](#기여하기)
- [라이선스](#라이선스)

## 소개

프로젝트에 대한 상세 설명

### 왜 이 프로젝트를 만들었나요?
문제점과 해결 방법

## 주요 기능

- ✨ 기능 1
- 🚀 기능 2
- 💡 기능 3

## 기술 스택

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS

### Backend
- Node.js
- PostgreSQL
- Prisma

### DevOps
- Vercel
- GitHub Actions

## 시작하기

### 사전 요구사항
- Node.js 18+
- npm 또는 yarn

### 설치

\`\`\`bash
# 저장소 클론
git clone https://github.com/username/project.git
cd project

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일 편집

# 개발 서버 실행
npm run dev
\`\`\`

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 사용법

### 기본 사용법
\`\`\`typescript
import { Component } from './Component';

function App() {
  return <Component prop="value" />;
}
\`\`\`

### 고급 사용법
추가 예제와 설명

## 프로젝트 구조

\`\`\`
프로젝트/
├── src/
│   ├── app/           # Next.js 페이지
│   ├── components/    # React 컴포넌트
│   └── lib/           # 유틸리티
├── public/            # 정적 파일
└── tests/             # 테스트
\`\`\`

## 환경 변수

\`\`\`bash
DATABASE_URL=        # PostgreSQL 연결 문자열
NEXTAUTH_SECRET=     # NextAuth 시크릿
OPENAI_API_KEY=      # OpenAI API 키
\`\`\`

## 스크립트

\`\`\`bash
npm run dev          # 개발 서버
npm run build        # 프로덕션 빌드
npm run start        # 프로덕션 서버
npm run lint         # 린트 검사
npm run test         # 테스트 실행
\`\`\`

## 배포

### Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/username/project)

### 직접 배포
\`\`\`bash
npm run build
npm run start
\`\`\`

## 기여하기

1. Fork the Project
2. Create your Feature Branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your Changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the Branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

## 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일 참조

## 문의

Your Name - [@twitter](https://twitter.com/username) - email@example.com

프로젝트 링크: [https://github.com/username/project](https://github.com/username/project)

## 감사의 말

- [라이브러리명](링크)
- [참고 자료](링크)
\`\`\`

---

#### CONTRIBUTING.md (팀 프로젝트용)

```
# 기여 가이드

## 개발 환경 설정

1. 저장소 Fork
2. 로컬에 클론
3. 의존성 설치: \`npm install\`
4. 브랜치 생성: \`git checkout -b feature/your-feature\`

## 코드 스타일

- ESLint + Prettier 사용
- 커밋 전 자동 포맷팅
- TypeScript strict 모드

## 커밋 컨벤션

\`\`\`
feat: 새 기능
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 리팩토링
test: 테스트 추가
chore: 빌드/설정 변경
\`\`\`

## Pull Request 절차

1. 최신 main 브랜치 rebase
2. 테스트 통과 확인
3. PR 생성 (템플릿 작성)
4. 리뷰어 지정
5. 승인 후 머지

## 리뷰 기준

- [ ] 테스트 통과
- [ ] 코드 스타일 준수
- [ ] 문서 업데이트
- [ ] Breaking changes 없음
\`\`\`

---

### 2.7 원격 저장소 연결

```bash
# 원격 저장소 추가
git remote add origin https://github.com/username/my-project.git

# 메인 브랜치 설정
git branch -M main

# 첫 푸시
git push -u origin main

# 연결 확인
git remote -v
```

**권장:** SSH 키 사용 시 더 안전하고 편리합니다. ([GitHub SSH 설정 가이드](https://docs.github.com/en/authentication/connecting-to-github-with-ssh))

---

### 2.8 CI/CD 기초

#### GitHub Actions 기본 워크플로우

**.github/workflows/ci.yml:**
```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint
        run: npm run lint
      
      - name: Type check
        run: npm run type-check
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
        env:
          SKIP_ENV_VALIDATION: true

  # 보안 검사
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Run security audit
        run: npm audit --audit-level=high
```

---

#### 자동 배포 (Vercel)

**.github/workflows/deploy.yml:**
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
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

**설정:**
1. Vercel에서 토큰 생성
2. GitHub Settings → Secrets → `VERCEL_TOKEN` 추가

---

#### 브랜치 보호 규칙

**GitHub Settings → Branches → Add rule:**

```
✅ 필수 설정:
[ ] Require a pull request before merging
    [ ] Require approvals (1)
    [ ] Dismiss stale reviews
[ ] Require status checks to pass
    [ ] lint-and-test
    [ ] security
[ ] Require branches to be up to date
[ ] Include administrators (선택)
```

**설정 방법:**
1. GitHub 저장소 → Settings
2. Branches → Add branch protection rule
3. Branch name pattern: `main`
4. 위 옵션들 체크
5. Save changes

---

#### 커밋 체크 (Husky + Commitlint)

**설치:**
```bash
npm install --save-dev @commitlint/cli @commitlint/config-conventional
```

**commitlint.config.js:**
```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 새 기능
        'fix',      // 버그 수정
        'docs',     // 문서
        'style',    // 포맷팅
        'refactor', // 리팩토링
        'test',     // 테스트
        'chore',    // 빌드/도구
      ],
    ],
    'subject-case': [0], // 대소문자 자유
  },
};
```

**.husky/commit-msg:**
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx --no -- commitlint --edit "$1"
```

**동작:**
```bash
git commit -m "update code"
# ❌ subject may not be empty [subject-empty]

git commit -m "feat: add user authentication"
# ✅ Commit 성공
```

---

## 3. 브랜치 전략

### 3.1 소규모 프로젝트 (1~2명)

```
main (프로덕션)
  ↓
feature/user-login
feature/dashboard
feature/payment
```

**규칙:**
- `main` 브랜치는 항상 배포 가능한 상태 유지
- 기능별로 `feature/*` 브랜치 생성
- 개발 완료 후 `main`에 머지

**워크플로우:**
```bash
# 새 기능 시작
git checkout -b feature/user-login

# 작업 후 커밋
git add .
git commit -m "feat(auth): 사용자 로그인 구현"

# main에 머지
git checkout main
git merge feature/user-login

# 브랜치 삭제
git branch -d feature/user-login

# 원격에 푸시
git push origin main
```

---

### 3.2 중대규모 프로젝트 (3명 이상)

```
main (프로덕션)
  ↓
develop (개발 통합)
  ↓
feature/* (기능 개발)
hotfix/* (긴급 수정 - main에서 분기)
```

**규칙:**
- `main`: 프로덕션 배포용 (안정 버전만)
- `develop`: 개발 통합 브랜치
- `feature/*`: 기능 개발 (develop에서 분기 → develop에 머지)
- `hotfix/*`: 긴급 수정 (main에서 분기 → main + develop에 머지)

**워크플로우:**
```bash
# 1. 기능 개발
git checkout develop
git checkout -b feature/user-auth
# 작업 & 커밋
git checkout develop
git merge feature/user-auth

# 2. 릴리스
git checkout -b release/v1.0.0
# 테스트 & 버그 수정
git checkout main
git merge release/v1.0.0
git tag v1.0.0
git checkout develop
git merge release/v1.0.0

# 3. 긴급 수정
git checkout main
git checkout -b hotfix/critical-bug
# 수정 & 커밋
git checkout main
git merge hotfix/critical-bug
git tag v1.0.1
git checkout develop
git merge hotfix/critical-bug
```

---

### 3.3 커밋 컨벤션

#### 기본 형식
```
<타입>(<범위>): <제목>

<본문 (선택)>

<푸터 (선택)>
```

#### 타입 종류
```bash
feat:      새 기능 추가
fix:       버그 수정
refactor:  리팩토링 (기능 변경 없음)
docs:      문서 수정
test:      테스트 추가/수정
chore:     빌드, 설정 변경
perf:      성능 개선
style:     코드 포맷팅 (세미콜론 등)
ci:        CI/CD 설정
revert:    이전 커밋 되돌리기
```

#### 예시
```bash
# 좋은 예
git commit -m "feat(auth): 소셜 로그인 추가"
git commit -m "fix(api): 중복 요청 버그 수정"
git commit -m "refactor(ui): 버튼 컴포넌트 재구조화"
git commit -m "docs: README에 설치 가이드 추가"
git commit -m "test(auth): 로그인 테스트 케이스 추가"

# 나쁜 예
git commit -m "update"
git commit -m "fix bug"
git commit -m "코드 수정"
```

#### 상세 커밋 (본문 포함)
```bash
git commit -m "feat(payment): Stripe 결제 연동

- Stripe API 클라이언트 구현
- 결제 웹훅 핸들러 추가
- 테스트 케이스 3개 추가

Resolves: #123"
```

---

### 3.4 Pull Request 워크플로우

#### PR 생성 전 체크리스트
```
[ ] 로컬 테스트 통과
[ ] 코드 린트 통과 (npm run lint)
[ ] 타입 체크 통과 (npm run type-check)
[ ] 커밋 메시지 컨벤션 준수
[ ] .env 파일 커밋 안 됨
[ ] 충돌 해결 완료
```

**PR 템플릿 예시:**
팀의 GitHub/GitLab 설정에서 `.github/pull_request_template.md` 또는 `.gitlab/merge_request_templates/` 사용을 권장합니다.

기본 구조:
```
## 변경 사항
(무엇을 변경했는가)

## 테스트
- [ ] 로컬 테스트 완료
- [ ] 주요 시나리오 확인

## 관련 이슈
Closes #123
```

---

## 4. 코드 구조 설계

### 4.1 구조 방식 선택

#### 구조 비교표

| 구조 방식 | 특징 | 적합한 경우 | 핵심 장점 |
|-----------|------|-------------|-----------|
| **Layer-based** | 역할별 폴더 분리 <br> (controllers, models, views) | • 소규모 (1-2명) <br> • CRUD 앱 <br> • 명확한 계층 구조 | 학습 곡선 낮음 |
| **Feature-based** ⭐ | 기능별 독립 모듈 <br> (auth, dashboard, user) | • 중대형 (3명+) <br> • 지속적 기능 추가 <br> • 팀 협업 | 1:1 매핑 명확, 확장성 |
| **Atomic Design** | 컴포넌트 계층 <br> (atoms → organisms) | • 디자인 시스템 <br> • UI 라이브러리 <br> • 재사용 중심 | 재사용성 극대화 |

---

#### A. Layer-based (전통적 MVC)

```
/src
  /controllers    # 요청 처리
    - userController.ts
    - authController.ts
  /models         # 데이터 모델
    - User.ts
    - Post.ts
  /views          # UI
    - UserView.tsx
    - PostView.tsx
  /services       # 비즈니스 로직
    - userService.ts
    - authService.ts
  /utils          # 유틸리티
    - validation.ts
    - formatter.ts
```

#### B. Feature-based (모듈형) ⭐ **권장**

```
/src
  /features
    /auth
      - AuthButton.tsx
      - AuthForm.tsx
      - authService.ts
      - authUtils.ts
      - auth.types.ts
      - auth.test.ts
    /dashboard
      - DashboardPage.tsx
      - DashboardStats.tsx
      - dashboardApi.ts
      - dashboard.types.ts
      - dashboard.test.ts
    /user
      - UserProfile.tsx
      - UserSettings.tsx
      - userService.ts
      - user.types.ts
  /shared
    /components
      - Button.tsx
      - Input.tsx
      - Modal.tsx
    /utils
      - validation.ts
      - formatter.ts
    /hooks
      - useAuth.ts
      - useDebounce.ts
    /types
      - common.types.ts
```

---

#### C. Atomic Design (컴포넌트 중심)

```
/components
  /atoms          # 기본 요소
    - Button.tsx
    - Input.tsx
    - Label.tsx
    - Icon.tsx
  /molecules      # 조합
    - SearchBar.tsx
    - FormField.tsx
    - Card.tsx
  /organisms      # 복합 컴포넌트
    - Header.tsx
    - Sidebar.tsx
    - Footer.tsx
    - UserCard.tsx
  /templates      # 페이지 레이아웃
    - MainLayout.tsx
    - AuthLayout.tsx
  /pages          # 실제 페이지
    - HomePage.tsx
    - AboutPage.tsx
```

---

### 4.2 1:1 매핑 원칙 (CRITICAL)

**핵심 규칙: 하나의 파일 = 하나의 책임**

#### ✅ 좋은 예

```typescript
// src/components/Button.tsx
export function Button() { ... }  // 버튼만

// src/components/Input.tsx
export function Input() { ... }   // 인풋만

// src/services/userApi.ts
export const userApi = {
  getUser: () => {},
  updateUser: () => {}
}  // 사용자 API만

// src/utils/dateFormatter.ts
export function formatDate() { ... }
export function parseDate() { ... }  // 날짜 관련만
```

#### ❌ 나쁜 예

```typescript
// src/components.tsx (여러 컴포넌트 섞임)
export function Button() { ... }
export function Input() { ... }
export function Card() { ... }
export function Modal() { ... }

// src/utils.ts (관련 없는 함수들)
export function formatDate() { ... }
export function validateEmail() { ... }
export function calculateTotal() { ... }
export function fetchData() { ... }
```

---

#### 코드 볼륨 제한

```
**제한 사항:**
- 단일 파일: 150 라인 이하 (주석 제외)
- 단일 함수: 50 라인 이하
- 함수 복잡도: McCabe Complexity < 10
- import 구문: 10개 이하

**초과 시 → 즉시 분리**
```

#### 복잡도 측정
```bash
# TypeScript/JavaScript
npx ts-complexity [파일명]

# Python
pip install radon
radon cc [파일명] -a
```

---

### 4.3 네이밍 컨벤션

#### 파일명
```
컴포넌트:   PascalCase     Button.tsx, UserProfile.tsx
유틸리티:   camelCase      dateFormatter.ts, validation.ts
상수:       UPPER_CASE     constants.ts
타입:       PascalCase     user.types.ts
테스트:     [name].test.ts Button.test.ts
```

#### 변수명
```typescript
// 컴포넌트
const UserProfile = () => {}

// 함수
function calculateTotal() {}

// 변수
const userName = 'John'
const isActive = true
const itemCount = 5

// 상수
const API_BASE_URL = 'https://api.example.com'
const MAX_RETRY_COUNT = 3

// Private (내부 사용)
const _internalHelper = () => {}
```

---

## 5. 환경 설정

### 5.1 환경별 설정 관리

#### 환경 분리
```bash
# .env.development (개발)
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/mydb_dev
API_URL=http://localhost:3000
DEBUG=true

# .env.staging (스테이징)
NODE_ENV=staging
DATABASE_URL=postgresql://staging.db:5432/mydb
API_URL=https://api-staging.example.com
DEBUG=false

# .env.production (프로덕션)
NODE_ENV=production
DATABASE_URL=postgresql://prod.db:5432/mydb
API_URL=https://api.example.com
DEBUG=false
```

---

#### 환경 변수 템플릿
```bash
# .env.example (Git에 커밋)

# Server
PORT=3000                    # 개발 서버 포트 (자동 포트 찾기 사용 시 무시됨)
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Authentication
JWT_SECRET=your-secret-key-minimum-32-characters
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# External APIs
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**포트 충돌 방지:**
- 자동 포트 찾기 스크립트 사용 권장 (`start-dev.sh`)
- 또는 `.env.local`에서 `PORT` 변수로 포트 지정
- Next.js는 포트 충돌 시 자동으로 다음 포트 제안

---

### 5.2 환경 변수 로드

#### Next.js
```typescript
// .env.local (로컬 개발만)
NEXT_PUBLIC_API_URL=http://localhost:3000
DATABASE_URL=postgresql://localhost:5432/db

// 사용
export default function Page() {
  // 클라이언트에서 접근 (NEXT_PUBLIC_ 필수)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  
  return <div>{apiUrl}</div>
}

// 서버에서 접근
export async function getServerSideProps() {
  const dbUrl = process.env.DATABASE_URL
  return { props: {} }
}
```

#### Node.js (Express)
```javascript
// .env
PORT=3000
DATABASE_URL=postgresql://localhost:5432/db

// 로드
require('dotenv').config()

// 사용
const port = process.env.PORT || 3000
const dbUrl = process.env.DATABASE_URL
```

#### Python (Flask)
```python
# .env
FLASK_APP=app.py
DATABASE_URL=postgresql://localhost:5432/db

# 로드
from dotenv import load_dotenv
import os

load_dotenv()

# 사용
database_url = os.getenv('DATABASE_URL')
```

---

### 5.3 의존성 관리

#### 패키지 매니저 선택 가이드

| 매니저 | 속도 | 디스크 사용 | 모노레포 | 안정성 | 권장 사용 |
|--------|------|-------------|----------|--------|-----------|
| **npm** | 보통 | 많음 | 약함 | ⭐⭐⭐⭐⭐ | 기본, 소규모 |
| **yarn** | 빠름 | 보통 | 좋음 | ⭐⭐⭐⭐ | 팀 협업 |
| **pnpm** | 매우 빠름 | 적음 | 매우 좋음 | ⭐⭐⭐⭐ | 대규모, 모노레포 |
| **bun** | 초고속 | 적음 | 보통 | ⭐⭐ (실험적) | 개인 실험 |

**선택 기준:**
- **npm**: Node.js 기본 제공, 가장 안정적, 문서 풍부
- **yarn**: 빠른 설치, yarn.lock으로 일관성 보장
- **pnpm**: 디스크 공간 절약 (~50%), 심볼릭 링크 활용
- **bun**: 가장 빠르지만 아직 안정화 단계

**명령어 비교:**
```bash
# 의존성 설치
npm install
yarn install
pnpm install
bun install

# 패키지 추가
npm install react
yarn add react
pnpm add react
bun add react

# 스크립트 실행
npm run dev
yarn dev
pnpm dev
bun dev
```

**프로젝트에 명시:**
```json
// package.json
{
  "packageManager": "pnpm@8.15.0",
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  }
}
```

---

#### 버전 관리 전략
```json
// package.json
{
  "dependencies": {
    "next": "^14.0.0",      // ^ = minor/patch 업데이트 허용
    "react": "~18.2.0",     // ~ = patch만 업데이트 허용
    "lodash": "4.17.21"     // 정확한 버전 고정
  },
  "devDependencies": {
    "typescript": "5.3.3",  // 개발 도구는 정확한 버전
    "eslint": "^8.0.0"
  }
}
```

**버전 표기법:**
- `^1.2.3`: 1.x.x (major 고정)
- `~1.2.3`: 1.2.x (minor 고정)
- `1.2.3`: 정확한 버전

---

#### 보안 업데이트
```bash
# 취약점 검사
npm audit

# 자동 수정 (안전한 것만)
npm audit fix

# 강제 수정 (주의)
npm audit fix --force

# 상세 보고서
npm audit --json

# 고급 보안 검사 (Snyk)
npx snyk test
npx snyk wizard
```

---

#### 불필요한 의존성 제거
```bash
# 미사용 패키지 찾기
npx depcheck

# 삭제
npm uninstall [package-name]

# package.json 정리
npm prune
```

---

#### 트러블슈팅: 의존성 설치 실패

**문제 1: npm install 실패**
```bash
# 해결 1: 캐시 삭제
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# 해결 2: Node 버전 확인
node -v  # v18+ 권장
nvm use 18  # nvm 사용 시

# 해결 3: npm 업데이트
npm install -g npm@latest
```

**문제 2: Python 가상환경 충돌**
```bash
# 해결: 가상환경 재생성
rm -rf venv
python -m venv venv
source venv/bin/activate  # Mac/Linux
# 또는 venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

**문제 3: 권한 오류 (EACCES)**
```bash
# Mac/Linux: sudo 사용 금지! 대신:
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH

# 또는 nvm 사용 권장
```

**문제 4: 특정 패키지 설치 실패**
```bash
# 원인 확인
npm install [package-name] --verbose

# 대체 버전 시도
npm install [package-name]@[다른버전]

# peer dependencies 확인
npm install --legacy-peer-deps
```

**문제 5: 포트 충돌 (Port already in use)**
```bash
# 증상
Error: listen EADDRINUSE: address already in use :::3000

# 해결 1: 자동 포트 찾기 (권장)
./start-dev.sh
# 또는
npm run dev:auto

# 해결 2: 포트 사용 중인 프로세스 종료
# Mac/Linux
lsof -ti :3000 | xargs kill -9

# Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# 또는 간편하게
npx kill-port 3000

# 해결 3: 다른 포트 사용
PORT=4000 npm run dev

# 해결 4: .env.local에 포트 지정
echo "PORT=4000" >> .env.local
npm run dev
```

---

### 5.4 IDE별 최적화

#### A. Cursor (권장)

**파일 보호 (.cursorignore)**
```
# 절대 수정하지 말 것
.env
.env.*
src/core/payment.ts
src/utils/encryption.ts
config/production.json
node_modules/
.next/
```

**주요 기능:**
- Composer 모드: 여러 파일 동시 편집
- "Only edit these files" 옵션으로 범위 제한
- Tab 자동완성 활용

---

#### B. VS Code

**필수 확장 프로그램:**
- GitHub Copilot
- ESLint
- Prettier
- Error Lens

**기본 설정:**
```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.autoSave": "onFocusChange"
}
```

---

#### C. 도구 조합 전략

**상황별 최적 도구 선택**

| 작업 | 추천 도구 | 상황별 선택 |
|------|-----------|-------------|
| **프로젝트 초기화** | **v0, Lovable, Bolt** <br> 빠른 프로토타입, 즉시 배포 | **Claude Code, Cursor** <br> 커스텀 설정, 팀 표준 준수 <br> **CLI (create-next-app 등)** <br> 완전한 제어, 표준 구조 |
| **핵심 로직 개발** | **Cursor Composer** <br> 여러 파일 동시 편집, 컨텍스트 유지 | **Claude Code** <br> 대규모 리팩토링, 반복 패턴 <br> **Claude (웹)** <br> 복잡한 알고리즘, 아키텍처 설계 |
| **기존 코드 수정** | **Cursor Chat/Tab** <br> 빠른 수정, 즉시 적용 | **Claude (웹)** <br> 복잡한 분석, 전체 맥락 필요 |
| **반복 작업** | **Claude Code** <br> 20개+ 파일 일괄 처리 | **Cursor Composer** <br> 10개 이하 파일 <br> **GitHub Copilot** <br> 단순 반복 코드 |
| **디버깅** | **Cursor** <br> 코드 내에서 바로 수정 | **Claude (웹)** <br> 근본 원인 분석, 여러 가능성 검토 |
| **문서 작성** | **Claude (웹)** <br> README, API 문서, 가이드 | **Cursor** <br> 인라인 주석, JSDoc |
| **테스트 작성** | **Cursor** <br> 코드와 함께 작성 | **Claude Code** <br> 전체 테스트 스위트 생성 |

**참고:** 
- 한 프로젝트에서 여러 도구를 조합해서 사용하는 것이 일반적
- 도구 간 전환 시 컨텍스트 유지가 중요
- 팀 표준이 있다면 우선 준수

---

### 5.5 코드 품질 도구

#### ESLint 설정

**설치:**
```bash
# Next.js/React
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin

# 자동 초기화
npx eslint --init
```

**기본 설정 (.eslintrc.js):**
```javascript
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'next/core-web-vitals', // Next.js 전용
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react'],
  rules: {
    // 커스텀 규칙
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    'react/react-in-jsx-scope': 'off', // Next.js는 불필요
    'react/prop-types': 'off', // TypeScript 사용 시
  },
  ignorePatterns: ['node_modules/', '.next/', 'dist/'],
};
```

**실행:**
```bash
# 검사
npm run lint

# 자동 수정
npm run lint -- --fix
```

---

#### Prettier 설정

**설치:**
```bash
npm install --save-dev prettier eslint-config-prettier
```

**기본 설정 (.prettierrc):**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

**.prettierignore:**
```
node_modules/
.next/
dist/
build/
coverage/
*.lock
```

**실행:**
```bash
# 검사
npx prettier --check .

# 자동 수정
npx prettier --write .
```

---

#### Husky + lint-staged (커밋 전 자동 검사)

**설치:**
```bash
# Husky (Git hooks)
npm install --save-dev husky
npx husky init

# lint-staged
npm install --save-dev lint-staged
```

**설정 (.husky/pre-commit):**
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

**설정 (package.json):**
```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,yml}": [
      "prettier --write"
    ]
  },
  "scripts": {
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "format": "prettier --write .",
    "prepare": "husky install"
  }
}
```

**동작 방식:**
1. `git commit` 실행
2. Husky가 pre-commit 훅 실행
3. lint-staged가 staged 파일만 검사
4. ESLint + Prettier 자동 실행
5. 문제 없으면 커밋 완료

---

#### EditorConfig (팀 일관성)

**.editorconfig:**
```ini
root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false

[*.{yml,yaml}]
indent_size = 2

[Makefile]
indent_style = tab
```

**지원 IDE:**
- VS Code (확장 프로그램 필요)
- WebStorm (기본 지원)
- Sublime Text (플러그인)

---

### 5.6 TypeScript 설정

#### 기본 tsconfig.json

```json
{
  "compilerOptions": {
    // Type Checking
    "strict": true,                           // 모든 strict 옵션 활성화
    "noUncheckedIndexedAccess": true,         // 배열/객체 접근 시 undefined 체크
    "noImplicitReturns": true,                // 모든 경로에서 return 필수
    "noFallthroughCasesInSwitch": true,       // switch case fallthrough 방지
    
    // Module Resolution
    "moduleResolution": "bundler",            // 최신 번들러 방식
    "resolveJsonModule": true,                // JSON import 허용
    "allowImportingTsExtensions": true,       // .ts 확장자 import 허용
    
    // Emit
    "noEmit": true,                           // Next.js가 컴파일 담당
    "declaration": false,
    
    // JavaScript Support
    "allowJs": true,
    "checkJs": false,
    
    // Interop Constraints
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    
    // Language and Environment
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "preserve",                        // Next.js가 처리
    
    // Path Aliases
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"]
    },
    
    // Completeness
    "skipLibCheck": true                      // node_modules 타입 체크 스킵
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules",
    ".next",
    "dist",
    "build"
  ]
}
```

---

#### Path Alias 설정

**1. tsconfig.json에 path 추가 (위 참고)**

**2. 사용 예시:**
```typescript
// ❌ Before (상대 경로)
import { Button } from '../../../components/ui/Button';
import { formatDate } from '../../../lib/utils';

// ✅ After (절대 경로)
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
```

**3. Next.js에서 자동 인식:**
Next.js는 `tsconfig.json`의 paths를 자동으로 사용합니다.

---

#### 타입 체크 자동화

**package.json에 스크립트 추가:**
```json
{
  "scripts": {
    "type-check": "tsc --noEmit",
    "type-check:watch": "tsc --noEmit --watch",
    "lint": "eslint . && npm run type-check"
  }
}
```

**실행:**
```bash
# 타입 체크만
npm run type-check

# 타입 체크 + 감시 모드
npm run type-check:watch

# 린트 + 타입 체크
npm run lint
```

---

#### Husky에 타입 체크 추가

**.husky/pre-commit:**
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# 타입 체크 추가
npm run type-check
npx lint-staged
```

---

#### 주요 TypeScript 패턴

**타입 안전한 환경 변수:**
```typescript
// env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    NEXTAUTH_SECRET: string;
    NEXTAUTH_URL: string;
    OPENAI_API_KEY: string;
  }
}

// 사용
const dbUrl: string = process.env.DATABASE_URL; // 타입 안전
```

**유틸리티 타입:**
```typescript
// 기존 타입에서 일부만
type UserInput = Pick<User, 'name' | 'email'>;

// 일부 제외
type PublicUser = Omit<User, 'password'>;

// 모두 선택적으로
type PartialUser = Partial<User>;

// 모두 필수로
type RequiredUser = Required<User>;
```

---

### 5.7 Docker 설정 (선택)

#### Dockerfile (Next.js)

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# 의존성 설치
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# 빌드
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 환경 변수 (빌드 타임)
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# 실행
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

**빌드 & 실행:**
```bash
# 이미지 빌드
docker build -t my-app .

# 컨테이너 실행 (기본 포트)
docker run -p 3000:3000 my-app

# 커스텀 포트로 실행
docker run -p 4000:3000 my-app
# → 호스트 4000번 포트로 접근

# 자동 포트 할당
docker run -p 0:3000 my-app
# → Docker가 자동으로 빈 포트 할당
```

---

#### docker-compose.yml (풀스택)

```yaml
version: '3.8'

services:
  # Next.js 앱
  app:
    build: .
    ports:
      - "${APP_PORT:-3000}:3000"  # 환경 변수로 포트 지정 (기본값 3000)
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/mydb
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next

  # PostgreSQL
  db:
    image: postgres:15-alpine
    ports:
      - "${DB_PORT:-5432}:5432"  # 기본값 5432
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: mydb
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # Redis
  redis:
    image: redis:7-alpine
    ports:
      - "${REDIS_PORT:-6379}:6379"  # 기본값 6379
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

**.env 파일로 포트 지정:**
```bash
# .env
APP_PORT=4000
DB_PORT=5433
REDIS_PORT=6380
```

**실행:**
```bash
# 전체 스택 시작 (기본 포트)
docker-compose up -d

# 커스텀 포트로 시작
APP_PORT=4000 docker-compose up -d

# .env 파일 사용
# 1. .env 파일 생성 (APP_PORT, DB_PORT 등)
# 2. docker-compose up -d

# 로그 확인
docker-compose logs -f app

# 현재 포트 확인
docker-compose ps

# 중지
docker-compose down

# 볼륨까지 삭제
docker-compose down -v
```

---

#### .dockerignore

```
node_modules
.next
.git
.env
.env.local
README.md
npm-debug.log
.DS_Store
coverage
.vscode
dist
build
```

---

#### 개발 환경 docker-compose

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/mydb_dev
    volumes:
      - .:/app
      - /app/node_modules
    command: npm run dev

  db:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: mydb_dev
```

**실행:**
```bash
docker-compose -f docker-compose.dev.yml up
```

---

## 6. UTF-8 인코딩 설정 (선택)

한글 프로젝트의 경우 UTF-8 인코딩 설정이 필요합니다.

### 6.1 자동 설정 스크립트

#### Next.js / React
```bash
# package.json에 자동 추가
npm pkg set scripts.dev="NODE_OPTIONS='--experimental-encoding utf8' next dev"
```

#### VS Code 설정 자동 생성
```bash
# .vscode/settings.json 생성
mkdir -p .vscode
cat > .vscode/settings.json << 'EOF'
{
  "files.encoding": "utf8",
  "files.autoGuessEncoding": false
}
EOF
```

#### Git 설정
```bash
# Git에서 한글 파일명 깨짐 방지
git config --global core.quotepath false
```

---

### 6.2 한글 프로젝트 초기화 스크립트 (올인원)

```bash
# utf8-setup.sh
#!/bin/bash

echo "UTF-8 환경 설정 중..."

# 1. package.json 설정 (Node.js 프로젝트)
if [ -f "package.json" ]; then
  npm pkg set scripts.dev="NODE_OPTIONS='--experimental-encoding utf8' next dev"
  echo "✅ package.json 설정 완료"
fi

# 2. VS Code 설정
mkdir -p .vscode
cat > .vscode/settings.json << 'EOF'
{
  "files.encoding": "utf8",
  "files.autoGuessEncoding": false
}
EOF
echo "✅ VS Code 설정 완료"

# 3. Git 설정
git config core.quotepath false
echo "✅ Git 설정 완료"

echo "🎉 UTF-8 설정 완료!"
```

**사용법:**
```bash
chmod +x utf8-setup.sh
./utf8-setup.sh
```

---

## 7. 체크리스트

### ✅ 프로젝트 시작 체크리스트

```
## 1단계: 구조 파악
[ ] 프로젝트 파일 구조 확인 (확장자 기반)
[ ] package.json 또는 requirements.txt 확인
[ ] README.md 읽기
[ ] 라이선스 확인

## 2단계: Git 설정
[ ] .gitignore 생성 (.env 포함 확인)
[ ] Git 초기화 (git init)
[ ] 첫 커밋 완료
[ ] 원격 저장소 연결 (GitHub/GitLab)
[ ] 브랜치 전략 결정

## 3단계: 환경 설정
[ ] .env.example → .env.local 복사
[ ] 환경 변수 설정
[ ] 의존성 설치 (npm install / pip install)
[ ] 개발 서버 실행 확인

## 4단계: IDE 설정
[ ] 에디터 확장 프로그램 설치
[ ] 포맷터 설정 (Prettier/Black)
[ ] 린터 설정 (ESLint/Pylint)
[ ] .editorconfig 설정

## 5단계: 코드 구조 설계
[ ] 구조 방식 선택 (Layer/Feature/Atomic)
[ ] 폴더 구조 생성
[ ] 1:1 매핑 원칙 확인
[ ] 네이밍 컨벤션 정리
```

---

### 🎯 다음 단계

프로젝트 초기 설정이 완료되었다면, 이제 본격적인 개발을 시작할 준비가 되었습니다.

**다음으로 이동:** [02. AI 협업 개발 →](./02_DEVELOPMENT.md)

---

[← 목차로](./README.md) | [다음: 02. 개발 →](./02_DEVELOPMENT.md)
