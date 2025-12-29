# 04. 배포

**AI 협업 개발 가이드 - Part 4**

[← 이전: 03. 검증](./03_QA_TESTING.md) | [목차](./README.md) | [다음: 05. 배포 후 관리 →](./05_POST_DEPLOYMENT.md)

---

## 📋 목차

1. [플랫폼 선택](#1-플랫폼-선택)
2. [Vercel 배포](#2-vercel-배포)
3. [기타 플랫폼](#3-기타-플랫폼)
4. [환경 변수 관리](#4-환경-변수-관리)
5. [도메인 & SSL](#5-도메인--ssl)
6. [CI/CD 파이프라인](#6-cicd-파이프라인)
7. [체크리스트](#7-체크리스트)

---

## 1. 플랫폼 선택

### 1.1 플랫폼 비교

| 플랫폼      | 적합한 프로젝트           | 무료 플랜           | 장점                      | 단점                  |
| ----------- | ------------------------- | ------------------- | ------------------------- | --------------------- |
| **Vercel**  | Next.js, React, Static    | ✅ (Hobby)          | 최고의 Next.js 지원       | 비싼 Enterprise       |
| **Netlify** | Static, Jamstack          | ✅ (100GB/월)       | 간단한 설정               | 서버리스 제한         |
| **Render**  | Full-stack, Docker        | ✅ (750시간/월)     | 무료 PostgreSQL           | Cold Start            |
| **Railway** | Full-stack, Database      | $5 크레딧/월        | 간단한 DB 설정            | 무료 플랜 제한        |
| **Fly.io**  | Global Edge, Docker       | ✅ (제한적)         | 낮은 레이턴시             | 복잡한 설정           |
| **AWS**     | Enterprise, 대규모        | ✅ (12개월)         | 완전한 제어               | 복잡함, 러닝 커브     |
| **Heroku**  | 간단한 앱                 | ❌ (최소 $5/월)     | 쉬운 배포                 | 비쌈                  |

---

### 1.2 선택 가이드

#### 🎯 Next.js / React → Vercel (1순위)

```bash
# 이유
- Next.js 개발사가 직접 운영
- 최고의 성능 최적화
- Edge Functions 지원
- 무료 플랜 충분함 (개인/소규모)
```

---

#### 🎯 Static Site → Netlify

```bash
# 이유
- HTML/CSS/JS만으로도 배포 가능
- 폼 처리 내장
- Split Testing 지원
```

---

#### 🎯 Full-stack (DB 포함) → Render / Railway

```bash
# 이유
- PostgreSQL/MySQL 무료 제공
- Docker 지원
- 간단한 설정
```

---

#### 🎯 Python Flask/Django → Render / Fly.io

```bash
# 이유
- Python 런타임 지원
- Dockerfile 자동 생성
```

---

## 2. Vercel 배포

### 2.1 GitHub 연동 배포 (권장)

#### Step 1: Vercel 계정 생성

```
https://vercel.com/signup
→ "Continue with GitHub" 클릭
```

---

#### Step 2: 프로젝트 Import

```
1. Vercel 대시보드 → "Add New" → "Project"
2. GitHub 저장소 선택
3. "Import" 클릭
```

---

#### Step 3: 프로젝트 설정

```
Framework Preset: Next.js (자동 감지)
Root Directory: ./
Build Command: npm run build
Output Directory: .next (자동)
Install Command: npm install
```

---

#### Step 4: 환경 변수 설정

```
Environment Variables 섹션에서:

Name: DATABASE_URL
Value: postgresql://...
Environment: Production, Preview, Development

Name: NEXTAUTH_SECRET
Value: your-secret-here
Environment: Production, Preview

Name: NEXTAUTH_URL
Value: https://your-domain.com
Environment: Production

Name: NEXTAUTH_URL
Value: https://your-preview-domain.vercel.app
Environment: Preview
```

---

#### Step 5: 배포

```
"Deploy" 버튼 클릭
→ 자동 빌드 시작
→ 완료 후 URL 제공
```

---

### 2.2 CLI 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 프로젝트 초기화 (최초 1회)
vercel

# 질문 답변
? Set up and deploy "~/my-project"? [Y/n] y
? Which scope do you want to deploy to? [개인계정]
? Link to existing project? [y/N] n
? What's your project's name? my-project
? In which directory is your code located? ./
? Want to override the settings? [y/N] n

# 배포 완료
✅ Preview: https://my-project-xxxxx.vercel.app

# 프로덕션 배포
vercel --prod
```

---

### 2.3 배포 후 확인

```bash
# 배포 목록
vercel ls

# 로그 확인
vercel logs [deployment-url]

# 특정 프로젝트 로그
vercel logs my-project --prod

# 실시간 로그
vercel logs --follow
```

---

### 2.4 자동 배포 설정

#### GitHub Actions (선택)

```yaml
# .github/workflows/vercel.yml
name: Vercel Deployment

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install Vercel CLI
        run: npm install -g vercel
      
      - name: Deploy to Vercel
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
        run: |
          vercel --prod --token=$VERCEL_TOKEN
```

---

## 3. 기타 플랫폼

### 3.1 Netlify

#### 배포 방법

```bash
# CLI 설치
npm install -g netlify-cli

# 로그인
netlify login

# 초기화
netlify init

# 배포
netlify deploy --prod
```

#### netlify.toml 설정

```toml
[build]
  command = "npm run build"
  publish = "out"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
```

---

### 3.2 Render

#### render.yaml 설정

```yaml
services:
  - type: web
    name: my-app
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: my-db
          property: connectionString

databases:
  - name: my-db
    databaseName: myapp
    user: myapp
```

---

### 3.3 Railway

#### 배포 방법

```bash
# CLI 설치
npm i -g @railway/cli

# 로그인
railway login

# 프로젝트 초기화
railway init

# 환경 변수 설정
railway variables set DATABASE_URL=postgresql://...

# 배포
railway up

# 도메인 확인
railway domain
```

---

### 3.4 Fly.io

#### fly.toml 설정

```toml
app = "my-app"
primary_region = "nrt"  # Tokyo

[build]
  builder = "paketobuildpacks/builder:base"

[env]
  PORT = "8080"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 256
```

#### 배포

```bash
# CLI 설치
curl -L https://fly.io/install.sh | sh

# 로그인
fly auth login

# 앱 생성
fly launch

# 배포
fly deploy

# 스케일링
fly scale count 2

# 로그 확인
fly logs
```

---

### 3.5 Docker 컨테이너 배포

#### A. Dockerfile 작성 (Next.js)

**Dockerfile (멀티스테이지 빌드):**
```dockerfile
# Stage 1: Dependencies
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Stage 3: Runner
FROM node:18-alpine AS runner
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

**next.config.js (standalone 모드):**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',  // Docker 최적화
}

module.exports = nextConfig
```

**.dockerignore:**
```
node_modules
.next
.git
.env.local
.env*.local
npm-debug.log*
README.md
.vscode
.idea
```

---

#### B. docker-compose.yml (로컬 개발)

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:password@db:5432/myapp
    depends_on:
      - db
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
  
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: myapp
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

**실행:**
```bash
# 빌드 & 실행
docker-compose up --build

# 백그라운드 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f app

# 중지
docker-compose down
```

---

#### C. 프로덕션 배포

**1. Docker Hub 배포:**
```bash
# 로그인
docker login

# 이미지 빌드
docker build -t username/my-app:latest .

# 푸시
docker push username/my-app:latest

# 서버에서 실행
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL=$DATABASE_URL \
  -e NEXTAUTH_SECRET=$NEXTAUTH_SECRET \
  username/my-app:latest
```

**2. GitHub Container Registry (GHCR):**
```bash
# 로그인
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# 빌드 & 태그
docker build -t ghcr.io/username/my-app:latest .

# 푸시
docker push ghcr.io/username/my-app:latest
```

**GitHub Actions 자동화:**
```yaml
# .github/workflows/docker.yml
name: Docker Build & Push

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    permissions:
      contents: read
      packages: write
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v2
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v4
        with:
          images: ghcr.io/${{ github.repository }}
          tags: |
            type=sha
            type=raw,value=latest
      
      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
```

---

#### D. 컨테이너 최적화

**1. 이미지 크기 최적화:**
```dockerfile
# ❌ 큰 이미지 (1.5GB)
FROM node:18

# ✅ 작은 이미지 (150MB)
FROM node:18-alpine

# ✅ Distroless (보안 향상)
FROM gcr.io/distroless/nodejs18-debian11
```

**2. 빌드 캐싱:**
```dockerfile
# 의존성만 먼저 복사 (캐시 활용)
COPY package.json package-lock.json ./
RUN npm ci

# 소스 코드는 나중에
COPY . .
```

**3. .dockerignore 활용:**
```
# 불필요한 파일 제외 → 빌드 속도 향상
node_modules
.git
*.md
tests/
.github/
```

---

#### E. AWS ECS / GCP Cloud Run 배포

**AWS ECS:**
```bash
# ECR에 푸시
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ECR_URL
docker build -t my-app .
docker tag my-app:latest YOUR_ECR_URL/my-app:latest
docker push YOUR_ECR_URL/my-app:latest

# ECS 서비스 업데이트
aws ecs update-service --cluster my-cluster --service my-service --force-new-deployment
```

**GCP Cloud Run:**
```bash
# 빌드 & 배포 (한 번에)
gcloud run deploy my-app \
  --source . \
  --region us-central1 \
  --allow-unauthenticated

# 또는 Artifact Registry 사용
docker build -t gcr.io/PROJECT_ID/my-app .
docker push gcr.io/PROJECT_ID/my-app
gcloud run deploy my-app --image gcr.io/PROJECT_ID/my-app
```

---

#### F. 헬스체크 & 모니터링

**Dockerfile에 헬스체크 추가:**
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
```

**헬스체크 API:**
```typescript
// src/app/api/health/route.ts
export async function GET() {
  // DB 연결 확인
  try {
    await prisma.$queryRaw`SELECT 1`
    return Response.json({ status: 'healthy' })
  } catch (error) {
    return Response.json({ status: 'unhealthy' }, { status: 503 })
  }
}
```

---

## 4. 환경 변수 관리

### 4.1 환경별 변수 분리

```bash
# .env.development (로컬 개발)
DATABASE_URL=postgresql://localhost:5432/mydb_dev
API_URL=http://localhost:3000
DEBUG=true

# .env.preview (프리뷰 배포)
DATABASE_URL=postgresql://staging.db:5432/mydb
API_URL=https://preview-my-app.vercel.app
DEBUG=false

# .env.production (프로덕션)
DATABASE_URL=postgresql://prod.db:5432/mydb
API_URL=https://my-app.com
DEBUG=false
```

---

### 4.2 민감한 정보 보호

#### ✅ DO

```typescript
// 환경 변수 사용
const apiKey = process.env.OPENAI_API_KEY

// 클라이언트에서 사용 (Next.js)
const publicKey = process.env.NEXT_PUBLIC_STRIPE_KEY
```

#### ❌ DON'T

```typescript
// 하드코딩
const apiKey = 'sk-proj-abc123...'  // ❌ 절대 금지

// Git에 커밋
# .env 파일을 .gitignore에 추가 필수
```

---

### 4.3 환경 변수 검증

```typescript
// src/lib/env.ts
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  OPENAI_API_KEY: z.string().startsWith('sk-'),
})

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
})

// 사용
import { env } from '@/lib/env'
const apiKey = env.OPENAI_API_KEY
```

---

### 4.4 Vercel 환경 변수 CLI

```bash
# 환경 변수 추가
vercel env add DATABASE_URL production

# 목록 확인
vercel env ls

# 삭제
vercel env rm DATABASE_URL production

# 프리뷰 환경에 추가
vercel env add API_KEY preview

# 로컬로 Pull
vercel env pull .env.local
```

---

### 4.5 환경별 설정 파일 관리

#### A. next.config.js 환경별 분리

**next.config.js:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 환경별 설정
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // 프로덕션 최적화
  ...(process.env.NODE_ENV === 'production' && {
    compiler: {
      removeConsole: true,  // console.log 제거
    },
    swcMinify: true,
    compress: true,
  }),
  
  // 이미지 최적화
  images: {
    domains: ['example.com', 'cdn.example.com'],
    formats: ['image/avif', 'image/webp'],
  },
  
  // 헤더 설정
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
        ],
      },
    ]
  },
  
  // 리다이렉트
  async redirects() {
    return [
      {
        source: '/old-page',
        destination: '/new-page',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
```

---

#### B. vercel.json 설정

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  
  "env": {
    "MY_KEY": "value"
  },
  
  "build": {
    "env": {
      "NEXT_PUBLIC_API_URL": "@api-url"
    }
  },
  
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=1, stale-while-revalidate"
        }
      ]
    }
  ],
  
  "redirects": [
    {
      "source": "/old",
      "destination": "/new",
      "permanent": true
    }
  ],
  
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://api.example.com/:path*"
    }
  ],
  
  "crons": [
    {
      "path": "/api/cron/daily",
      "schedule": "0 0 * * *"
    }
  ]
}
```

---

#### C. package.json scripts 최적화

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    
    "build:analyze": "ANALYZE=true next build",
    "build:production": "NODE_ENV=production next build",
    
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate deploy",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio",
    
    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "playwright test",
    
    "format": "prettier --write \"**/*.{js,jsx,ts,tsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{js,jsx,ts,tsx,json,md}\"",
    
    "prepare": "husky install",
    
    "deploy:preview": "vercel",
    "deploy:production": "vercel --prod"
  }
}
```

---

#### D. 환경별 TypeScript 설정

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "incremental": true,
    
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"]
    },
    
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

#### E. ESLint & Prettier 설정

**.eslintrc.json:**
```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

**.prettierrc:**
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80
}
```

---

### 4.6 데이터베이스 마이그레이션 전략

#### A. 프로덕션 마이그레이션 안전 절차

**원칙:**
```
1. 절대 프로덕션 DB에 직접 마이그레이션 실행 금지
2. Staging에서 먼저 테스트
3. 백업 필수
4. 롤백 계획 수립
5. Blue-Green 배포 고려
```

---

#### B. Prisma 마이그레이션 워크플로우

**1. 개발 환경 (로컬):**
```bash
# 스키마 변경
# prisma/schema.prisma 수정

# 마이그레이션 생성
npx prisma migrate dev --name add_user_phone

# 생성된 파일 확인
# prisma/migrations/20250101000000_add_user_phone/migration.sql
```

**2. Staging 배포:**
```bash
# Staging DB에 마이그레이션 적용
DATABASE_URL=$STAGING_DATABASE_URL npx prisma migrate deploy

# 데이터 확인
npx prisma studio
```

**3. 프로덕션 배포:**
```bash
# 1. DB 백업
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. 마이그레이션 실행
npx prisma migrate deploy

# 3. 검증
npx prisma migrate status
```

---

#### C. Zero-Downtime 마이그레이션

**시나리오: 컬럼 추가 (NOT NULL)**

**❌ 잘못된 방법 (다운타임 발생):**
```sql
-- Migration 1: 컬럼 추가 (NOT NULL)
ALTER TABLE "User" ADD COLUMN "phone" VARCHAR(20) NOT NULL;
-- 문제: 기존 레코드 에러 발생!
```

**✅ 올바른 방법 (Zero-Downtime):**

**Step 1: Nullable로 추가**
```sql
-- Migration 1: 
ALTER TABLE "User" ADD COLUMN "phone" VARCHAR(20);
```
```bash
# 배포 1: 앱 v1.1
# - phone 필드 사용하지 않음
# - 기존 기능 유지
```

**Step 2: 기본값 설정**
```sql
-- Migration 2:
UPDATE "User" SET "phone" = '' WHERE "phone" IS NULL;
```

**Step 3: NOT NULL 제약 추가**
```sql
-- Migration 3:
ALTER TABLE "User" ALTER COLUMN "phone" SET NOT NULL;
```
```bash
# 배포 2: 앱 v1.2
# - phone 필드 사용 시작
# - 모든 레코드에 phone 존재
```

---

#### D. 컬럼 이름 변경 (무중단)

**❌ 잘못된 방법:**
```sql
ALTER TABLE "User" RENAME COLUMN "name" TO "full_name";
-- 문제: 구버전 앱이 name 컬럼 찾지 못함!
```

**✅ Expand-Contract 패턴:**

**Step 1: 새 컬럼 추가 (Expand)**
```sql
ALTER TABLE "User" ADD COLUMN "full_name" VARCHAR(255);
UPDATE "User" SET "full_name" = "name";
```
```typescript
// 앱 v1.1: 두 컬럼 모두 지원
await prisma.user.create({
  data: {
    name: data.name,
    full_name: data.name,  // 중복 저장
  }
})
```

**Step 2: 코드 전환**
```typescript
// 앱 v1.2: full_name만 사용
await prisma.user.create({
  data: {
    full_name: data.name,
  }
})
```

**Step 3: 구 컬럼 삭제 (Contract)**
```sql
ALTER TABLE "User" DROP COLUMN "name";
```

---

#### E. 대용량 데이터 마이그레이션

**문제: 100만 레코드 업데이트 → 타임아웃**

**✅ 배치 처리:**
```typescript
// scripts/migrate-data.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const BATCH_SIZE = 1000

async function migrateInBatches() {
  let offset = 0
  let hasMore = true
  
  while (hasMore) {
    const users = await prisma.user.findMany({
      take: BATCH_SIZE,
      skip: offset,
      where: { phone: null }
    })
    
    if (users.length === 0) {
      hasMore = false
      break
    }
    
    // 배치 업데이트
    await prisma.$transaction(
      users.map(user => 
        prisma.user.update({
          where: { id: user.id },
          data: { phone: generatePhone(user) }
        })
      )
    )
    
    console.log(`Migrated ${offset + users.length} users`)
    offset += BATCH_SIZE
    
    // 부하 분산
    await new Promise(resolve => setTimeout(resolve, 100))
  }
}

migrateInBatches()
```

---

#### F. 롤백 전략

**1. Prisma 롤백:**
```bash
# 마지막 마이그레이션 확인
npx prisma migrate status

# 롤백 (수동)
# Prisma는 자동 롤백 없음 → 수동 SQL 실행
psql $DATABASE_URL < rollback.sql
```

**2. 롤백 SQL 준비:**
```sql
-- migrations/20250101000000_add_user_phone/rollback.sql
ALTER TABLE "User" DROP COLUMN "phone";
```

**3. 배포 시 롤백 스크립트 포함:**
```bash
# package.json
{
  "scripts": {
    "migrate:rollback": "psql $DATABASE_URL < prisma/migrations/latest/rollback.sql"
  }
}
```

---

#### G. 배포 자동화 with 마이그레이션

**GitHub Actions:**
```yaml
name: Deploy with Migration

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      # 1. DB 백업
      - name: Backup database
        run: |
          PGPASSWORD=${{ secrets.DB_PASSWORD }} pg_dump \
            -h ${{ secrets.DB_HOST }} \
            -U ${{ secrets.DB_USER }} \
            ${{ secrets.DB_NAME }} \
            > backup_$(date +%Y%m%d_%H%M%S).sql
        
      # 2. 마이그레이션 실행
      - name: Run migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
      
      # 3. 검증
      - name: Verify migration
        run: npx prisma migrate status
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
      
      # 4. 앱 배포
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
      
      # 5. 헬스체크
      - name: Health check
        run: |
          sleep 10
          curl -f https://my-app.com/api/health || exit 1
```

---

#### H. 마이그레이션 체크리스트

```
배포 전:
[ ] Staging에서 마이그레이션 테스트
[ ] 프로덕션 DB 백업
[ ] 롤백 SQL 준비
[ ] 다운타임 영향 평가
[ ] 팀 공지 (유지보수 예정 시)

마이그레이션 실행:
[ ] DB 연결 수 모니터링
[ ] 쿼리 실행 시간 확인
[ ] 에러 로그 모니터링
[ ] 디스크 용량 확인

배포 후:
[ ] 헬스체크 통과 확인
[ ] 로그 에러 없음
[ ] 주요 기능 수동 테스트
[ ] 성능 지표 정상
[ ] 백업 파일 보관 (30일)
```

---

## 5. 도메인 & SSL

### 5.1 Vercel 도메인 연결

#### 방법 1: Vercel에서 도메인 구매

```
1. Vercel 대시보드 → 프로젝트 선택
2. Settings → Domains
3. "Buy a domain" 클릭
4. 도메인 검색 및 구매
→ 자동으로 연결 및 SSL 설정
```

---

#### 방법 2: 외부 도메인 연결

```
1. Vercel 대시보드 → Domains
2. 도메인 입력 (예: example.com)
3. DNS 레코드 추가 안내 확인

DNS 설정 (도메인 제공업체에서):

Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com

4. "Verify" 클릭
→ 자동 SSL 인증서 발급
```

---

### 5.2 커스텀 서브도메인

```
# 서브도메인 설정
api.example.com → API 서버
app.example.com → 프론트엔드
admin.example.com → 관리자 페이지

DNS 레코드:

Type: CNAME
Name: api
Value: cname.vercel-dns.com

Type: CNAME
Name: app
Value: cname.vercel-dns.com
```

---

### 5.3 SSL/TLS 설정

#### Vercel (자동)

```
✅ 자동 SSL 인증서 발급 (Let's Encrypt)
✅ 자동 갱신
✅ HTTPS 강제 리다이렉트
```

---

#### 커스텀 SSL (다른 플랫폼)

```bash
# Certbot 설치 (Let's Encrypt)
sudo apt-get update
sudo apt-get install certbot

# 인증서 발급
sudo certbot certonly --standalone -d example.com

# Nginx 설정
server {
  listen 443 ssl;
  server_name example.com;
  
  ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
  
  # 나머지 설정...
}

# 자동 갱신
sudo certbot renew --dry-run
```

---

### 5.4 배포 모니터링 & 알림 설정

#### A. Sentry 에러 추적

**설치:**
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**sentry.client.config.ts:**
```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // 환경별 설정
  environment: process.env.NODE_ENV,
  
  // 샘플링 (프로덕션 트래픽 관리)
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // 에러 필터링
  beforeSend(event, hint) {
    // 개발 환경 에러 제외
    if (process.env.NODE_ENV === 'development') {
      return null
    }
    
    // 특정 에러 제외
    if (event.exception?.values?.[0]?.value?.includes('ResizeObserver')) {
      return null
    }
    
    return event
  },
  
  // 사용자 정보 포함
  integrations: [
    new Sentry.BrowserTracing(),
  ],
})
```

**sentry.server.config.ts:**
```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
})
```

**수동 에러 캡처:**
```typescript
try {
  await riskyOperation()
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      section: 'payment',
    },
    extra: {
      userId: user.id,
      amount: payment.amount,
    },
  })
  throw error
}
```

---

#### B. Vercel Analytics

**설치:**
```bash
npm install @vercel/analytics
```

**app/layout.tsx:**
```typescript
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

**커스텀 이벤트 추적:**
```typescript
import { track } from '@vercel/analytics'

// 버튼 클릭 추적
<button onClick={() => track('signup_clicked')}>
  Sign Up
</button>

// 매개변수 포함
track('purchase', {
  product: 'Premium Plan',
  amount: 29.99,
})
```

---

#### C. Uptime 모니터링

**1. UptimeRobot (무료):**
```
https://uptimerobot.com

설정:
- Monitor Type: HTTP(s)
- URL: https://your-app.com
- Interval: 5분
- Alert Contacts: 이메일, Slack
```

**2. Better Uptime:**
```bash
# 헬스체크 엔드포인트
# src/app/api/health/route.ts
export async function GET() {
  try {
    // DB 연결 확인
    await prisma.$queryRaw`SELECT 1`
    
    // 외부 API 확인
    await fetch('https://api.external.com/health')
    
    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION,
    })
  } catch (error) {
    return Response.json(
      { status: 'unhealthy', error: error.message },
      { status: 503 }
    )
  }
}
```

---

#### D. Slack 알림 통합

**GitHub Actions → Slack:**
```yaml
# .github/workflows/deploy-notify.yml
name: Deploy Notification

on:
  deployment_status:

jobs:
  notify:
    runs-on: ubuntu-latest
    
    steps:
      - name: Slack Notification
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: |
            Deployment ${{ github.event.deployment_status.state }}
            Environment: ${{ github.event.deployment_status.environment }}
            URL: ${{ github.event.deployment_status.target_url }}
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        if: always()
```

**Vercel → Slack:**
```
Vercel Dashboard → Settings → Notifications

✅ Deployment Started
✅ Deployment Ready
✅ Deployment Failed
✅ Deployment Error

Slack Webhook URL: [입력]
```

**Sentry → Slack:**
```
Sentry → Settings → Integrations → Slack

알림 규칙:
- New Issue: 즉시
- High Priority: 즉시
- Regression: 즉시
- Spike in Errors: 10분마다
```

---

#### E. 배포 성공/실패 모니터링

**배포 후 자동 검증:**
```yaml
# .github/workflows/post-deploy-check.yml
name: Post-Deploy Checks

on:
  deployment_status:

jobs:
  smoke-test:
    if: github.event.deployment_status.state == 'success'
    runs-on: ubuntu-latest
    
    steps:
      - name: Wait for deployment
        run: sleep 30
      
      - name: Health check
        run: |
          response=$(curl -s -o /dev/null -w "%{http_code}" ${{ github.event.deployment_status.target_url }}/api/health)
          if [ $response -ne 200 ]; then
            echo "Health check failed!"
            exit 1
          fi
      
      - name: Critical pages check
        run: |
          urls=(
            "${{ github.event.deployment_status.target_url }}/"
            "${{ github.event.deployment_status.target_url }}/login"
            "${{ github.event.deployment_status.target_url }}/dashboard"
          )
          
          for url in "${urls[@]}"; do
            status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
            if [ $status -ne 200 ]; then
              echo "Failed: $url returned $status"
              exit 1
            fi
            echo "OK: $url"
          done
      
      - name: Notify failure
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: failure
          text: '🚨 Post-deploy checks failed!'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

#### F. 성능 모니터링 대시보드

**Vercel Dashboard 메트릭:**
```
Analytics → Web Vitals

모니터링 항목:
- FCP (First Contentful Paint)
- LCP (Largest Contentful Paint)
- CLS (Cumulative Layout Shift)
- FID (First Input Delay)
- TTFB (Time to First Byte)

목표:
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1
```

**커스텀 메트릭:**
```typescript
// lib/analytics.ts
export function trackMetric(name: string, value: number) {
  if (typeof window !== 'undefined' && 'performance' in window) {
    performance.mark(name)
    
    // Vercel Analytics에 전송
    track(name, { value })
    
    // 콘솔 출력 (개발 환경)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Metric] ${name}: ${value}ms`)
    }
  }
}

// 사용
trackMetric('api_response_time', responseTime)
trackMetric('db_query_time', queryTime)
```

---

#### G. 로그 집계 (선택)

**1. Vercel Log Drains:**
```bash
# Datadog
vercel integration add datadog

# LogDNA
vercel integration add logdna
```

**2. 구조화된 로깅:**
```typescript
// lib/logger.ts
export const logger = {
  info: (message: string, meta?: object) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...meta,
    }))
  },
  
  error: (message: string, error?: Error, meta?: object) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: {
        message: error?.message,
        stack: error?.stack,
      },
      timestamp: new Date().toISOString(),
      ...meta,
    }))
    
    // Sentry에도 전송
    Sentry.captureException(error)
  },
}

// 사용
logger.info('User logged in', { userId: user.id })
logger.error('Payment failed', error, { userId, amount })
```

---

## 6. CI/CD 파이프라인

### 6.1 GitHub Actions (Next.js + Vercel)

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint

  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run type-check

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      
  build:
    runs-on: ubuntu-latest
    needs: [lint, type-check, test]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      
  deploy:
    runs-on: ubuntu-latest
    needs: [build]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

### 6.2 자동 롤백 설정

```yaml
# .github/workflows/rollback.yml
name: Rollback

on:
  workflow_dispatch:
    inputs:
      deployment-id:
        description: 'Deployment ID to rollback to'
        required: true

jobs:
  rollback:
    runs-on: ubuntu-latest
    steps:
      - name: Rollback Vercel Deployment
        run: |
          curl -X POST \
            https://api.vercel.com/v13/deployments/${{ github.event.inputs.deployment-id }}/promote \
            -H "Authorization: Bearer ${{ secrets.VERCEL_TOKEN }}" \
            -H "Content-Type: application/json"
```

---

### 6.3 Dependabot 설정

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
      - "your-username"
    assignees:
      - "your-username"
    commit-message:
      prefix: "chore"
    labels:
      - "dependencies"
```

---

### 6.4 프리뷰 배포 전략

#### A. PR별 자동 Preview URL

**Vercel 자동 설정:**
```
모든 PR → 자동 Preview 생성
예: https://my-app-pr-123.vercel.app

특징:
- PR 생성 시 자동 배포
- 커밋마다 업데이트
- PR 닫으면 자동 삭제
```

**GitHub Actions 통합:**
```yaml
# .github/workflows/preview.yml
name: Preview Deployment

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  preview:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      # Vercel Preview 배포
      - name: Deploy to Vercel Preview
        uses: amondnet/vercel-action@v20
        id: vercel
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          scope: ${{ secrets.VERCEL_ORG_ID }}
      
      # PR에 코멘트 추가
      - name: Comment Preview URL
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `
                ## 🚀 Preview Deployed!
                
                **URL:** ${{ steps.vercel.outputs.preview-url }}
                
                ✅ Build successful
                ⏱️ Built in ${{ steps.vercel.outputs.build-time }}
              `
            })
```

---

#### B. Preview 환경 DB 분리

**문제: Preview가 프로덕션 DB 사용 → 위험!**

**해결책 1: Vercel Postgres (Preview용)**
```bash
# Preview용 DB 생성
vercel postgres create preview-db

# Preview 환경에만 할당
vercel env add DATABASE_URL preview
```

**해결책 2: PlanetScale (브랜치 기능)**
```bash
# main DB
DATABASE_URL=mysql://...@aws.connect.psdb.cloud/mydb

# PR마다 브랜치 생성
pscale branch create mydb pr-123

# Preview 환경 변수
DATABASE_URL=mysql://...@aws.connect.psdb.cloud/mydb-pr-123
```

**해결책 3: Prisma Shadow Database:**
```env
# .env.preview
DATABASE_URL=postgresql://preview.db/myapp_preview
SHADOW_DATABASE_URL=postgresql://preview.db/myapp_shadow
```

---

#### C. 팀원과 Preview 공유

**Vercel 팀 설정:**
```
Vercel → Settings → Team

권한 설정:
- Developer: Preview 확인 가능
- Member: 전체 접근
- Owner: 관리자
```

**슬랙 자동 공유:**
```yaml
- name: Share preview on Slack
  uses: 8398a7/action-slack@v3
  with:
    status: custom
    custom_payload: |
      {
        text: "Preview deployed for PR #${{ github.event.number }}",
        attachments: [{
          color: 'good',
          text: `Preview: ${{ steps.vercel.outputs.preview-url }}\nAuthor: ${{ github.actor }}`
        }]
      }
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

#### D. Preview 삭제 자동화

**Vercel 자동 삭제:**
```
PR 닫힘 → Preview 자동 삭제 (24시간 후)
```

**수동 관리:**
```bash
# 모든 Preview 목록
vercel ls

# 특정 Preview 삭제
vercel rm deployment-url
```

---

### 6.5 성능 최적화 배포 설정

#### A. Edge Functions

**Vercel Edge Functions:**
```typescript
// app/api/edge/route.ts
export const runtime = 'edge'  // Edge Runtime

export async function GET(request: Request) {
  // 가장 가까운 엣지에서 실행
  return Response.json({ message: 'Hello from Edge!' })
}
```

**사용 케이스:**
- A/B 테스트
- 리다이렉트
- 지역화 (IP 기반)
- 간단한 API

---

#### B. ISR (Incremental Static Regeneration)

```typescript
// app/posts/[id]/page.tsx
export const revalidate = 3600  // 1시간마다 재생성

export async function generateStaticParams() {
  const posts = await prisma.post.findMany()
  return posts.map(post => ({ id: post.id }))
}

export default async function PostPage({ params }) {
  const post = await prisma.post.findUnique({
    where: { id: params.id }
  })
  
  return <div>{post.title}</div>
}
```

**On-Demand Revalidation:**
```typescript
// app/api/revalidate/route.ts
import { revalidatePath } from 'next/cache'

export async function POST(request: Request) {
  const { path } = await request.json()
  
  revalidatePath(path)
  
  return Response.json({ revalidated: true })
}
```

---

#### C. 이미지 최적화

**next.config.js:**
```javascript
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    // CDN 도메인 허용
    domains: ['cdn.example.com', 's3.amazonaws.com'],
    
    // Remote Patterns (보안)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
        pathname: '/images/**',
      },
    ],
  },
}
```

---

#### D. 캐싱 전략

**1. Static 페이지:**
```typescript
// app/about/page.tsx
export const dynamic = 'force-static'  // 완전 정적
```

**2. Dynamic 페이지 (ISR):**
```typescript
export const revalidate = 60  // 60초마다 재생성
```

**3. API 캐싱:**
```typescript
// app/api/data/route.ts
export async function GET() {
  const data = await fetchData()
  
  return Response.json(data, {
    headers: {
      'Cache-Control': 's-maxage=60, stale-while-revalidate=120'
    }
  })
}
```

---

### 6.6 배포 체크리스트 자동화

#### A. pre-deploy 스크립트

**package.json:**
```json
{
  "scripts": {
    "predeploy": "npm run check:all",
    "check:all": "npm run type-check && npm run lint && npm run test && npm run build",
    
    "type-check": "tsc --noEmit",
    "lint": "next lint",
    "test": "jest --passWithNoTests",
    "build": "next build"
  }
}
```

---

#### B. 필수 환경 변수 검증

**scripts/check-env.ts:**
```typescript
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'OPENAI_API_KEY',
]

const missingVars = requiredEnvVars.filter(
  varName => !process.env[varName]
)

if (missingVars.length > 0) {
  console.error('❌ Missing environment variables:')
  missingVars.forEach(varName => {
    console.error(`  - ${varName}`)
  })
  process.exit(1)
}

console.log('✅ All required environment variables are set')
```

**package.json:**
```json
{
  "scripts": {
    "check:env": "tsx scripts/check-env.ts",
    "predeploy": "npm run check:env && npm run check:all"
  }
}
```

---

#### C. Husky Pre-commit Hooks

**설치:**
```bash
npm install --save-dev husky
npx husky init
```

**.husky/pre-commit:**
```bash
#!/bin/sh
npm run lint-staged
npm run type-check
npm run test
```

**package.json:**
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

---

### 6.7 Staging 환경 관리

#### A. 브랜치별 배포 전략

```
main      → Production   (https://app.com)
develop   → Staging      (https://staging.app.com)
feature/* → Preview      (https://app-pr-123.vercel.app)
```

**Vercel 설정:**
```json
// vercel.json
{
  "git": {
    "deploymentEnabled": {
      "main": true,
      "develop": true
    }
  }
}
```

---

#### B. Staging 전용 설정

**.env.staging:**
```env
NODE_ENV=production
APP_ENV=staging

DATABASE_URL=postgresql://staging.db/myapp
API_URL=https://staging-api.example.com

# 디버그 모드 활성화
DEBUG=true
LOG_LEVEL=debug

# 외부 서비스 Sandbox 모드
STRIPE_MODE=test
OPENAI_ORG=staging
```

---

#### C. Staging → Production 승격

**수동 승격:**
```bash
# Staging 테스트 통과 후
git checkout main
git merge develop
git push origin main
```

**자동 승격 (승인 후):**
```yaml
# .github/workflows/promote-to-prod.yml
name: Promote to Production

on:
  workflow_dispatch:
    inputs:
      confirm:
        description: 'Type "PROMOTE" to confirm'
        required: true

jobs:
  promote:
    runs-on: ubuntu-latest
    if: github.event.inputs.confirm == 'PROMOTE'
    
    steps:
      - uses: actions/checkout@v4
        with:
          ref: develop
      
      - name: Merge to main
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git checkout main
          git merge develop --no-ff -m "Promote staging to production"
          git push origin main
```

---

#### D. Staging 접근 제한

**Basic Auth (Vercel):**
```bash
# Staging 환경에만 인증 추가
vercel env add BASIC_AUTH_USER staging
vercel env add BASIC_AUTH_PASSWORD staging
```

**middleware.ts:**
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Staging 환경만
  if (process.env.APP_ENV === 'staging') {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return new NextResponse('Authentication required', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Staging"',
        },
      })
    }
    
    const [user, password] = Buffer.from(
      authHeader.split(' ')[1],
      'base64'
    ).toString().split(':')
    
    if (
      user !== process.env.BASIC_AUTH_USER ||
      password !== process.env.BASIC_AUTH_PASSWORD
    ) {
      return new NextResponse('Invalid credentials', { status: 401 })
    }
  }
  
  return NextResponse.next()
}
```

---

## 7. 체크리스트

### ✅ 배포 전 준비

```
[ ] 프로덕션 빌드 테스트 (npm run build)
[ ] 모든 테스트 통과
[ ] 타입 에러 없음
[ ] 린트 통과
[ ] 보안 검사 (npm audit)
[ ] Lighthouse 점수 확인 (90+)
[ ] .env.example 최신 상태
[ ] CHANGELOG.md 업데이트
[ ] 버전 태그 생성 (git tag v1.0.0)
```

---

### ✅ 플랫폼 설정

```
[ ] 플랫폼 선택 (Vercel/Netlify/Render 등)
[ ] 계정 생성 및 로그인
[ ] GitHub 저장소 연결
[ ] 빌드 설정 확인
[ ] 환경 변수 설정 (모든 환경)
[ ] 도메인 연결 (선택)
[ ] SSL 인증서 확인
```

---

### ✅ 환경 변수

```
[ ] DATABASE_URL 설정
[ ] API 키 설정
[ ] NEXTAUTH_SECRET 생성 (32자 이상)
[ ] NEXTAUTH_URL 설정 (프로덕션/프리뷰 각각)
[ ] 외부 API 키 (OpenAI, Stripe 등)
[ ] SMTP 설정 (이메일 발송 시)
[ ] 환경별 분리 (production/preview/development)
[ ] 환경 변수 검증 코드 추가
```

---

### ✅ 배포 실행

```
[ ] Git push (main 브랜치)
[ ] 자동 배포 시작 확인
[ ] 빌드 로그 확인
[ ] 배포 성공 확인
[ ] 프리뷰 URL 테스트
[ ] 프로덕션 URL 테스트
```

---

### ✅ 배포 후 확인

```
[ ] 모든 페이지 접근 가능
[ ] API 정상 작동
[ ] 데이터베이스 연결 확인
[ ] 로그인/로그아웃 테스트
[ ] 결제 기능 테스트 (해당 시)
[ ] 이메일 발송 테스트 (해당 시)
[ ] 모바일에서 확인
[ ] 다양한 브라우저 테스트
[ ] 성능 측정 (Lighthouse)
[ ] 에러 로그 확인
```

---

### ✅ 도메인 & SSL

```
[ ] 도메인 연결 (커스텀 도메인 사용 시)
[ ] DNS 레코드 설정
[ ] SSL 인증서 발급 확인
[ ] HTTPS 리다이렉트 확인
[ ] www 리다이렉트 설정 (example.com ↔ www.example.com)
[ ] 서브도메인 설정 (필요 시)
```

---

### ✅ CI/CD

```
[ ] GitHub Actions 워크플로우 설정
[ ] 자동 테스트 실행 확인
[ ] 배포 자동화 확인
[ ] Dependabot 설정
[ ] 브랜치 보호 규칙 설정
[ ] PR 템플릿 작성
```

---

### 🎯 다음 단계

배포가 완료되었다면, 이제 철저한 모니터링과 관리가 필요합니다.

**다음으로 이동:** [05. 배포 후 관리 →](./05_POST_DEPLOYMENT.md)

---

## 📚 참고 자료

### 플랫폼 공식 문서

- [Vercel](https://vercel.com/docs)
- [Netlify](https://docs.netlify.com)
- [Render](https://render.com/docs)
- [Railway](https://docs.railway.app)
- [Fly.io](https://fly.io/docs)

### 도구

- [Certbot (Let's Encrypt)](https://certbot.eff.org)
- [GitHub Actions](https://docs.github.com/actions)
- [Dependabot](https://docs.github.com/code-security/dependabot)

---

[← 이전: 03. 검증](./03_QA_TESTING.md) | [목차](./README.md) | [다음: 05. 배포 후 관리 →](./05_POST_DEPLOYMENT.md)
