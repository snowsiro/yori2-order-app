-- Yori2 users 테이블 생성 및 초기 데이터 삽입
-- Supabase 대시보드 → SQL Editor에서 실행하세요

CREATE TABLE IF NOT EXISTS users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('owner', 'staff')),
  password_hash text
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 로그인 확인용 읽기 허용 (anon key로 이메일 조회 가능)
CREATE POLICY "users_read_anon" ON users FOR SELECT USING (true);

-- 유저 데이터 삽입 (비밀번호는 SHA-256 해시로 저장)
INSERT INTO users (email, name, role, password_hash) VALUES
  ('snowsiro@gmail.com',       'Seungjae Kim', 'owner', encode(sha256('yorikochen2'::bytea), 'hex')),
  ('yori2wien@gmail.com',      'Yori2',         'staff', NULL),
  ('jooseopark1070@gmail.com', 'Jooseo Park',   'staff', NULL),
  ('miggiebeee@gmail.com',     'Miguel',         'staff', NULL),
  ('dahyung43@gmail.com',      'Dahyung Lee',   'staff', NULL),
  ('tmf2157@gmail.com',        'Siwoo Jang',    'staff', NULL)
ON CONFLICT (email) DO NOTHING;
