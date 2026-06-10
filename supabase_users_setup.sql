-- Yori2 users 테이블 생성
-- Supabase 대시보드 → SQL Editor에서 실행하세요
-- 주의: 실제 이메일/비밀번호는 공개 저장소에 커밋하지 마세요.
--       직원 추가는 앱의 설정 → 직원 화면에서 하면 됩니다.

CREATE TABLE IF NOT EXISTS users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('owner', 'staff')),
  password_hash text
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 사장님(owner) 계정 생성 예시 — 값을 바꿔서 SQL Editor에서 직접 실행하세요:
-- INSERT INTO users (email, name, role, password_hash) VALUES
--   ('owner@example.com', 'Owner Name', 'owner', encode(sha256('YOUR_PASSWORD'::bytea), 'hex'));

-- 직원(staff) 계정 생성 예시 (비밀번호 없음):
-- INSERT INTO users (email, name, role) VALUES
--   ('staff@example.com', 'Staff Name', 'staff');
