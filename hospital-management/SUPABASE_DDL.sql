-- Supabase 테이블 DDL (index.ts 타입 정의 기반)
-- 실행 전: Supabase Dashboard → SQL Editor에서 실행

-- 1. 계정 테이블 (User, Account 인터페이스 기반)
CREATE TABLE IF NOT EXISTS accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 병원 테이블 (Hospital 인터페이스 기반)
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

-- 3. 부품 테이블 (Part 인터페이스 기반)
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

-- 4. 창고 재고 테이블 (WarehouseItem 인터페이스 기반)
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

-- 5. 코일 재고 테이블 (CoilItem 인터페이스 기반)
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

-- 6. 입출고 히스토리 테이블 (InOutHistory 인터페이스 기반)
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

-- 7. 출고 부품 테이블 (OutboundPart 인터페이스 기반)
CREATE TABLE IF NOT EXISTS outbound_parts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date TEXT NOT NULL,
  hospital TEXT NOT NULL,
  part_name TEXT NOT NULL,
  part_number TEXT NOT NULL,
  serial_number TEXT NOT NULL,
  worker TEXT NOT NULL,
  notes TEXT NOT NULL,
  author TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. 출고 히스토리 테이블 (OutboundHistory 인터페이스 기반)
CREATE TABLE IF NOT EXISTS outbound_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date TEXT NOT NULL,
  hospital TEXT NOT NULL,
  part_name TEXT NOT NULL,
  part_number TEXT NOT NULL,
  serial_number TEXT NOT NULL,
  worker TEXT NOT NULL,
  notes TEXT NOT NULL,
  author TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 기본 계정 데이터 삽입 (UUID 형식으로 수정)
INSERT INTO accounts (id, username, name, password, role, created_at, updated_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'admin', '관리자', 'admin123', 'admin', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', 'user', '일반사용자', 'user123', 'user', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440003', 'thek', '테스트사용자', 'thek123', 'user', NOW(), NOW())
ON CONFLICT (username) DO NOTHING;

-- 샘플 병원 데이터 삽입 (UUID 형식으로 수정)
INSERT INTO hospitals (id, name, modality, system_id, equipment, software_version, address, phone, created_at, updated_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440101', '서울대병원', 'MRI', 'SNU001', 'GE SIGNA Pioneer', 'v2.1', '서울시 종로구', '02-1234-5678', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440102', '연세대병원', 'CT', 'YSU001', 'Siemens SOMATOM', 'v3.0', '서울시 서대문구', '02-2345-6789', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 샘플 창고 재고 데이터 삽입 (UUID 형식으로 수정)
INSERT INTO warehouse (id, part_name, part_number, serial_number, location, inbound_date, status, description, author, created_at, updated_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440201', 'RF 코일', 'RF-001', 'SN001', 'A-1-1', '2024-01-15', 'Good', 'MRI용 RF 코일 입고', '관리자', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440202', '그라디언트 코일', 'GC-001', 'SN002', 'A-1-2', '2024-01-16', 'Good', 'MRI용 그라디언트 코일 입고', '관리자', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 기존 코일 데이터 삭제 (중복 방지)
DELETE FROM coils WHERE id IN (
  '550e8400-e29b-41d4-a716-446655440301',
  '550e8400-e29b-41d4-a716-446655440302',
  '550e8400-e29b-41d4-a716-446655440303',
  '550e8400-e29b-41d4-a716-446655440304',
  '550e8400-e29b-41d4-a716-446655440305',
  '550e8400-e29b-41d4-a716-446655440306',
  '550e8400-e29b-41d4-a716-446655440307',
  '550e8400-e29b-41d4-a716-446655440308',
  '550e8400-e29b-41d4-a716-446655440309',
  '550e8400-e29b-41d4-a716-446655440310'
);

-- 샘플 코일 재고 데이터 삽입 (UUID 형식으로 수정) - 10개 목업 데이터
INSERT INTO coils (id, coil_name, coil_number, serial_number, location, inbound_date, status, description, author, created_at, updated_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440301', '헤드 코일', 'HC-001', 'CSN001', 'B-1-1', '2024-01-10', 'Good', 'MRI 헤드 코일 입고 - 32채널', '관리자', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440302', '스파인 코일', 'SC-001', 'CSN002', 'B-1-2', '2024-01-11', 'Good', 'MRI 스파인 코일 입고 - 16채널', '관리자', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440303', '어깨 코일', 'SHC-001', 'CSN003', 'B-1-3', '2024-01-12', 'Good', 'MRI 어깨 코일 입고 - 8채널', '김철수', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440304', '무릎 코일', 'KC-001', 'CSN004', 'B-1-4', '2024-01-13', 'Good', 'MRI 무릎 코일 입고 - 12채널', '이영희', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440305', '복부 코일', 'AC-001', 'CSN005', 'B-2-1', '2024-01-14', 'Good', 'MRI 복부 코일 입고 - 32채널', '박민수', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440306', '흉부 코일', 'CC-001', 'CSN006', 'B-2-2', '2024-01-15', 'Good', 'MRI 흉부 코일 입고 - 16채널', '최지영', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440307', '손목 코일', 'WC-001', 'CSN007', 'B-2-3', '2024-01-16', 'Bad', 'MRI 손목 코일 입고 - 8채널 (일부 채널 불량)', '정수민', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440308', '발목 코일', 'AC-002', 'CSN008', 'B-2-4', '2024-01-17', 'Good', 'MRI 발목 코일 입고 - 8채널', '한동훈', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440309', '목 코일', 'NC-001', 'CSN009', 'B-3-1', '2024-01-18', 'Good', 'MRI 목 코일 입고 - 12채널', '송미영', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440310', '골반 코일', 'PC-001', 'CSN010', 'B-3-2', '2024-01-19', 'Good', 'MRI 골반 코일 입고 - 16채널', '윤태호', NOW(), NOW());

-- RLS (Row Level Security) 활성화
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse ENABLE ROW LEVEL SECURITY;
ALTER TABLE coils ENABLE ROW LEVEL SECURITY;
ALTER TABLE inout_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbound_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbound_history ENABLE ROW LEVEL SECURITY;

-- RLS 정책 생성 (모든 사용자가 읽기 가능, 관리자만 쓰기/삭제 가능)
-- accounts 테이블 정책
CREATE POLICY "Allow read access for all users" ON accounts FOR SELECT USING (true);
CREATE POLICY "Allow insert for all users" ON accounts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for admins" ON accounts FOR UPDATE USING (
  EXISTS (SELECT 1 FROM accounts WHERE username = current_user AND role = 'admin')
);
CREATE POLICY "Allow delete for admins" ON accounts FOR DELETE USING (
  EXISTS (SELECT 1 FROM accounts WHERE username = current_user AND role = 'admin')
);

-- hospitals 테이블 정책
CREATE POLICY "Allow read access for all users" ON hospitals FOR SELECT USING (true);
CREATE POLICY "Allow insert for all users" ON hospitals FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for admins" ON hospitals FOR UPDATE USING (
  EXISTS (SELECT 1 FROM accounts WHERE username = current_user AND role = 'admin')
);
CREATE POLICY "Allow delete for admins" ON hospitals FOR DELETE USING (
  EXISTS (SELECT 1 FROM accounts WHERE username = current_user AND role = 'admin')
);

-- parts 테이블 정책
CREATE POLICY "Allow read access for all users" ON parts FOR SELECT USING (true);
CREATE POLICY "Allow insert for all users" ON parts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for admins" ON parts FOR UPDATE USING (
  EXISTS (SELECT 1 FROM accounts WHERE username = current_user AND role = 'admin')
);
CREATE POLICY "Allow delete for admins" ON parts FOR DELETE USING (
  EXISTS (SELECT 1 FROM accounts WHERE username = current_user AND role = 'admin')
);

-- warehouse 테이블 정책
CREATE POLICY "Allow read access for all users" ON warehouse FOR SELECT USING (true);
CREATE POLICY "Allow insert for all users" ON warehouse FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for admins" ON warehouse FOR UPDATE USING (
  EXISTS (SELECT 1 FROM accounts WHERE username = current_user AND role = 'admin')
);
CREATE POLICY "Allow delete for admins" ON warehouse FOR DELETE USING (
  EXISTS (SELECT 1 FROM accounts WHERE username = current_user AND role = 'admin')
);

-- coils 테이블 정책
CREATE POLICY "Allow read access for all users" ON coils FOR SELECT USING (true);
CREATE POLICY "Allow insert for all users" ON coils FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for admins" ON coils FOR UPDATE USING (
  EXISTS (SELECT 1 FROM accounts WHERE username = current_user AND role = 'admin')
);
CREATE POLICY "Allow delete for admins" ON coils FOR DELETE USING (
  EXISTS (SELECT 1 FROM accounts WHERE username = current_user AND role = 'admin')
);

-- inout_history 테이블 정책
CREATE POLICY "Allow read access for all users" ON inout_history FOR SELECT USING (true);
CREATE POLICY "Allow insert for all users" ON inout_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for admins" ON inout_history FOR UPDATE USING (
  EXISTS (SELECT 1 FROM accounts WHERE username = current_user AND role = 'admin')
);
CREATE POLICY "Allow delete for admins" ON inout_history FOR DELETE USING (
  EXISTS (SELECT 1 FROM accounts WHERE username = current_user AND role = 'admin')
);

-- outbound_parts 테이블 정책
CREATE POLICY "Allow read access for all users" ON outbound_parts FOR SELECT USING (true);
CREATE POLICY "Allow insert for all users" ON outbound_parts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for admins" ON outbound_parts FOR UPDATE USING (
  EXISTS (SELECT 1 FROM accounts WHERE username = current_user AND role = 'admin')
);
CREATE POLICY "Allow delete for admins" ON outbound_parts FOR DELETE USING (
  EXISTS (SELECT 1 FROM accounts WHERE username = current_user AND role = 'admin')
);

-- outbound_history 테이블 정책
CREATE POLICY "Allow read access for all users" ON outbound_history FOR SELECT USING (true);
CREATE POLICY "Allow insert for all users" ON outbound_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for admins" ON outbound_history FOR UPDATE USING (
  EXISTS (SELECT 1 FROM accounts WHERE username = current_user AND role = 'admin')
);
CREATE POLICY "Allow delete for admins" ON outbound_history FOR DELETE USING (
  EXISTS (SELECT 1 FROM accounts WHERE username = current_user AND role = 'admin')
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_accounts_username ON accounts(username);
CREATE INDEX IF NOT EXISTS idx_hospitals_name ON hospitals(name);
CREATE INDEX IF NOT EXISTS idx_parts_hospital_id ON parts(hospital_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_part_name ON warehouse(part_name);
CREATE INDEX IF NOT EXISTS idx_coils_coil_name ON coils(coil_name);
CREATE INDEX IF NOT EXISTS idx_inout_history_date ON inout_history(date);
CREATE INDEX IF NOT EXISTS idx_outbound_parts_date ON outbound_parts(date);
CREATE INDEX IF NOT EXISTS idx_outbound_history_date ON outbound_history(date);

-- 완료 메시지
SELECT '✅ 모든 테이블이 성공적으로 생성되었습니다!' as status;
