# Cubemedi Warehouse - 병원 관리 시스템

병원 부품 및 창고 관리를 위한 종합 웹 애플리케이션입니다.

## 🚀 주요 기능

- **병원 관리**: 병원 정보 등록 및 관리
- **부품 관리**: 의료 장비 부품 재고 관리
- **창고 관리**: 입출고 및 재고 추적
- **사용자 관리**: 관리자 및 일반 사용자 권한 관리
- **히스토리 추적**: 모든 거래 내역 기록

## 🛠️ 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React

## 📦 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_APP_NAME=Cubemedi Warehouse
```

### 3. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 4. 프로덕션 빌드
```bash
npm run build
npm start
```

## 🌐 배포

### Vercel 배포 (권장)
1. [Vercel](https://vercel.com)에 가입
2. GitHub 저장소 연결
3. 환경 변수 설정
4. 자동 배포

### 수동 배포
```bash
npm run build
vercel --prod
```

## 🔐 기본 계정

- **관리자**: admin / admin123
- **일반 사용자**: user / user123

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🤝 기여

버그 리포트나 기능 제안은 이슈를 통해 제출해주세요.
