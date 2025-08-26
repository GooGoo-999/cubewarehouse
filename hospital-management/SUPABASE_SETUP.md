# Supabase 설정 가이드

## 1. Supabase 프로젝트 설정

### 1.1 프로젝트 정보
- **Project ID**: `nndfjpxvjustvravslgg`
- **URL**: `https://xcwyjuhytnjdmiuoesbe.supabase.co`

### 1.2 API 키 확인
1. Supabase 대시보드 접속: https://supabase.com/dashboard
2. 프로젝트 선택: `nndfjpxvjustvravslgg`
3. Settings → API 메뉴로 이동
4. `anon public` 키 복사

## 2. Vercel 환경 변수 설정

### 2.1 Vercel 대시보드에서 설정
1. https://vercel.com/dashboard 접속
2. `cubemedi-warehouse` 프로젝트 선택
3. Settings → Environment Variables 메뉴로 이동
4. 다음 환경 변수 추가:

```
NEXT_PUBLIC_SUPABASE_URL = https://xcwyjuhytnjdmiuoesbe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = [Supabase에서 복사한 anon public 키]
```

### 2.2 환경 변수 확인
- `cubemedi.com/test-env`에서 환경 변수 상태 확인
- 모든 항목이 ✅로 표시되어야 함

## 3. 데이터베이스 테이블 생성 (중요!)

### 3.1 Supabase SQL Editor에서 DDL 실행
1. Supabase 대시보드 → SQL Editor
2. `SUPABASE_DDL.sql` 파일의 내용을 복사하여 붙여넣기
3. **실행 전 기존 정책 삭제** (필요시):

```sql
-- 기존 RLS 정책 삭제 (테이블이 이미 존재하는 경우)
DROP POLICY IF EXISTS "Allow read access for all users" ON accounts;
DROP POLICY IF EXISTS "Allow insert for admins" ON accounts;
DROP POLICY IF EXISTS "Allow update for admins" ON accounts;
DROP POLICY IF EXISTS "Allow delete for admins" ON accounts;

-- 다른 테이블들도 동일하게 삭제
DROP POLICY IF EXISTS "Allow read access for all users" ON hospitals;
DROP POLICY IF EXISTS "Allow insert for admins" ON hospitals;
DROP POLICY IF EXISTS "Allow update for admins" ON hospitals;
DROP POLICY IF EXISTS "Allow delete for admins" ON hospitals;

-- 나머지 테이블들도 동일하게 처리
```

4. **DDL 실행**: `SUPABASE_DDL.sql` 전체 내용 실행

### 3.2 테이블 생성 확인
SQL Editor에서 다음 쿼리로 테이블 존재 확인:

```sql
-- 테이블 목록 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

-- accounts 테이블 구조 확인
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'accounts';
```

## 4. 연결 테스트

### 4.1 웹에서 테스트
1. `cubemedi.com/test-env` 접속
2. "Supabase 연결 테스트" 버튼 클릭
3. 성공 메시지 확인

### 4.2 관리자 로그인 테스트
1. `cubemedi.com` 접속
2. 관리자 계정으로 로그인: `admin` / `admin123`
3. "데이터 마이그레이션" 메뉴 확인

## 5. 문제 해결

### 5.1 "Could not find the table 'public.accounts'" 오류
**원인**: Supabase에 테이블이 생성되지 않음
**해결**: 위의 3단계에서 DDL을 실행

### 5.2 "No API key found in request" 오류
**원인**: 환경 변수가 설정되지 않음
**해결**: Vercel에서 환경 변수 재설정

### 5.3 RLS 정책 오류
**원인**: 정책이 이미 존재함
**해결**: 기존 정책 삭제 후 DDL 재실행

## 6. 로컬 개발 환경

### 6.1 .env.local 파일 생성
프로젝트 루트에 `.env.local` 파일 생성:

```
NEXT_PUBLIC_SUPABASE_URL=https://xcwyjuhytnjdmiuoesbe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[실제 anon key]
```

### 6.2 개발 서버 실행
```bash
cd hospital-management
npm run dev
```

## 7. 데이터 마이그레이션

### 7.1 localStorage → Supabase
1. 관리자로 로그인
2. "데이터 마이그레이션" 메뉴 클릭
3. 각 섹션별로 "Supabase로 마이그레이션" 버튼 클릭

### 7.2 마이그레이션 확인
- Supabase 대시보드 → Table Editor에서 데이터 확인
- 웹 애플리케이션에서 데이터 정상 표시 확인
