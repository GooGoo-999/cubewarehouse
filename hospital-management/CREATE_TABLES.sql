-- Supabase 테이블 생성 스크립트
-- Supabase SQL Editor에서 실행하세요

-- 1. 기존 정책 삭제 (필요시)
DROP POLICY IF EXISTS "Allow read access for all users" ON accounts;
DROP POLICY IF EXISTS "Allow insert for admins" ON accounts;
DROP POLICY IF EXISTS "Allow update for admins" ON accounts;
DROP POLICY IF EXISTS "Allow delete for admins" ON accounts;

DROP POLICY IF EXISTS "Allow read access for all users" ON hospitals;
DROP POLICY IF EXISTS "Allow insert for admins" ON hospitals;
DROP POLICY IF EXISTS "Allow update for admins" ON hospitals;
DROP POLICY IF EXISTS "Allow delete for admins" ON hospitals;

DROP POLICY IF EXISTS "Allow read access for all users" ON parts;
DROP POLICY IF EXISTS "Allow insert for admins" ON parts;
DROP POLICY IF EXISTS "Allow update for admins" ON parts;
DROP POLICY IF EXISTS "Allow delete for admins" ON parts;

DROP POLICY IF EXISTS "Allow read access for all users" ON warehouse;
DROP POLICY IF EXISTS "Allow insert for admins" ON warehouse;
DROP POLICY IF EXISTS "Allow update for admins" ON warehouse;
DROP POLICY IF EXISTS "Allow delete for admins" ON warehouse;

DROP POLICY IF EXISTS "Allow read access for all users" ON coils;
DROP POLICY IF EXISTS "Allow insert for admins" ON coils;
DROP POLICY IF EXISTS "Allow update for admins" ON coils;
DROP POLICY IF EXISTS "Allow delete for admins" ON coils;

DROP POLICY IF EXISTS "Allow read access for all users" ON inout_history;
DROP POLICY IF EXISTS "Allow insert for admins" ON inout_history;
DROP POLICY IF EXISTS "Allow update for admins" ON inout_history;
DROP POLICY IF EXISTS "Allow delete for admins" ON inout_history;

DROP POLICY IF EXISTS "Allow read access for all users" ON outbound_parts;
DROP POLICY IF EXISTS "Allow insert for admins" ON outbound_parts;
DROP POLICY IF EXISTS "Allow update for admins" ON outbound_parts;
DROP POLICY IF EXISTS "Allow delete for admins" ON outbound_parts;

DROP POLICY IF EXISTS "Allow read access for all users" ON outbound_history;
DROP POLICY IF EXISTS "Allow insert for admins" ON outbound_history;
DROP POLICY IF EXISTS "Allow update for admins" ON outbound_history;
DROP POLICY IF EXISTS "Allow delete for admins" ON outbound_history;

-- 2. 테이블 생성
CREATE TABLE IF NOT EXISTS accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hospitals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  modality TEXT NOT NULL,
  system_id TEXT NOT NULL,
  equipment TEXT NOT NULL,
  software_version TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  hospital_name TEXT NOT NULL,
  part_name TEXT NOT NULL,
  part_number TEXT NOT NULL,
  serial_number TEXT NOT NULL,
  replacement_date TEXT NOT NULL,
  worker TEXT NOT NULL,
  error_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS warehouse (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  part_name TEXT NOT NULL,
  part_number TEXT NOT NULL,
  serial_number TEXT NOT NULL,
  location TEXT NOT NULL,
  inbound_date TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Good', 'Bad')),
  description TEXT NOT NULL,
  author TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coils (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coil_name TEXT NOT NULL,
  coil_number TEXT NOT NULL,
  serial_number TEXT NOT NULL,
  location TEXT NOT NULL,
  inbound_date TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Good', 'Bad')),
  description TEXT NOT NULL,
  author TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inout_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date TEXT NOT NULL,
  part_name TEXT NOT NULL,
  part_number TEXT NOT NULL,
  serial_number TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('입고', '출고', '삭제')),
  hospital_name TEXT,
  status TEXT,
  description TEXT NOT NULL,
  inbounder TEXT,
  outbounder TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS outbound_parts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date TEXT NOT NULL,
  hospital TEXT NOT NULL,
  part_name TEXT NOT NULL,
  part_number TEXT NOT NULL,
  serial_number TEXT NOT NULL,
  worker TEXT NOT NULL,
  notes TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS outbound_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date TEXT NOT NULL,
  hospital TEXT NOT NULL,
  part_name TEXT NOT NULL,
  part_number TEXT NOT NULL,
  serial_number TEXT NOT NULL,
  worker TEXT NOT NULL,
  notes TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. RLS 활성화
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse ENABLE ROW LEVEL SECURITY;
ALTER TABLE coils ENABLE ROW LEVEL SECURITY;
ALTER TABLE inout_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbound_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbound_history ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책 생성
CREATE POLICY "Allow read access for all users" ON accounts FOR SELECT USING (true);
CREATE POLICY "Allow insert for admins" ON accounts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for admins" ON accounts FOR UPDATE USING (true);
CREATE POLICY "Allow delete for admins" ON accounts FOR DELETE USING (true);

CREATE POLICY "Allow read access for all users" ON hospitals FOR SELECT USING (true);
CREATE POLICY "Allow insert for admins" ON hospitals FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for admins" ON hospitals FOR UPDATE USING (true);
CREATE POLICY "Allow delete for admins" ON hospitals FOR DELETE USING (true);

CREATE POLICY "Allow read access for all users" ON parts FOR SELECT USING (true);
CREATE POLICY "Allow insert for admins" ON parts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for admins" ON parts FOR UPDATE USING (true);
CREATE POLICY "Allow delete for admins" ON parts FOR DELETE USING (true);

CREATE POLICY "Allow read access for all users" ON warehouse FOR SELECT USING (true);
CREATE POLICY "Allow insert for admins" ON warehouse FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for admins" ON warehouse FOR UPDATE USING (true);
CREATE POLICY "Allow delete for admins" ON warehouse FOR DELETE USING (true);

CREATE POLICY "Allow read access for all users" ON coils FOR SELECT USING (true);
CREATE POLICY "Allow insert for admins" ON coils FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for admins" ON coils FOR UPDATE USING (true);
CREATE POLICY "Allow delete for admins" ON coils FOR DELETE USING (true);

CREATE POLICY "Allow read access for all users" ON inout_history FOR SELECT USING (true);
CREATE POLICY "Allow insert for admins" ON inout_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for admins" ON inout_history FOR UPDATE USING (true);
CREATE POLICY "Allow delete for admins" ON inout_history FOR DELETE USING (true);

CREATE POLICY "Allow read access for all users" ON outbound_parts FOR SELECT USING (true);
CREATE POLICY "Allow insert for admins" ON outbound_parts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for admins" ON outbound_parts FOR UPDATE USING (true);
CREATE POLICY "Allow delete for admins" ON outbound_parts FOR DELETE USING (true);

CREATE POLICY "Allow read access for all users" ON outbound_history FOR SELECT USING (true);
CREATE POLICY "Allow insert for admins" ON outbound_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for admins" ON outbound_history FOR UPDATE USING (true);
CREATE POLICY "Allow delete for admins" ON outbound_history FOR DELETE USING (true);

-- 5. 기본 관리자 계정 생성
INSERT INTO accounts (id, username, name, password, role, created_at, updated_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'admin', '관리자', 'admin123', 'admin', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', 'user', '일반사용자', 'user123', 'user', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440003', 'thek', '테스트사용자', 'thek123', 'user', NOW(), NOW())
ON CONFLICT (username) DO NOTHING;

-- 6. 테이블 생성 확인
SELECT 'accounts' as table_name, COUNT(*) as row_count FROM accounts
UNION ALL
SELECT 'hospitals', COUNT(*) FROM hospitals
UNION ALL
SELECT 'parts', COUNT(*) FROM parts
UNION ALL
SELECT 'warehouse', COUNT(*) FROM warehouse
UNION ALL
SELECT 'coils', COUNT(*) FROM coils
UNION ALL
SELECT 'inout_history', COUNT(*) FROM inout_history
UNION ALL
SELECT 'outbound_parts', COUNT(*) FROM outbound_parts
UNION ALL
SELECT 'outbound_history', COUNT(*) FROM outbound_history;
