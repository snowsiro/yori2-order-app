-- Yori2 보안 강화 v2
-- Supabase 대시보드 → SQL Editor 에서 실행하세요.
-- 목적:
--   1. 공개 저장소에 노출됐던 사장님 비밀번호 교체
--   2. 직원 추가/삭제를 누구나 가능(anon) → 사장님 비밀번호 검증 RPC로 전환

-- ── 1. 사장님 비밀번호 변경 ──
-- 'NEW_PASSWORD' 를 새 비밀번호로 바꾼 뒤 실행하세요.
-- (기존 비밀번호가 GitHub 공개 저장소에 노출되었으므로 반드시 변경해야 합니다)
UPDATE users
SET password_hash = encode(sha256('NEW_PASSWORD'::bytea), 'hex')
WHERE role = 'owner';

-- ── 2. 직원 추가 RPC (사장님 인증 필요) ──
CREATE OR REPLACE FUNCTION add_staff(p_owner_email text, p_owner_password text, p_email text, p_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM users u
    WHERE u.email = lower(trim(p_owner_email))
      AND u.role = 'owner'
      AND u.password_hash = encode(sha256(p_owner_password::bytea), 'hex')
  ) THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;
  INSERT INTO users (email, name, role) VALUES (lower(trim(p_email)), trim(p_name), 'staff');
END;
$$;
GRANT EXECUTE ON FUNCTION add_staff(text, text, text, text) TO anon, authenticated;

-- ── 3. 직원 삭제 RPC (사장님 인증 필요, owner 계정은 삭제 불가) ──
CREATE OR REPLACE FUNCTION remove_staff(p_owner_email text, p_owner_password text, p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM users u
    WHERE u.email = lower(trim(p_owner_email))
      AND u.role = 'owner'
      AND u.password_hash = encode(sha256(p_owner_password::bytea), 'hex')
  ) THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;
  DELETE FROM users WHERE id = p_user_id AND role <> 'owner';
END;
$$;
GRANT EXECUTE ON FUNCTION remove_staff(text, text, uuid) TO anon, authenticated;

-- ── 4. 기존의 열려있던 직원 추가/삭제 정책 제거 ──
-- (이전엔 anon 키만 있으면 누구나 직원을 추가/삭제할 수 있었음)
DROP POLICY IF EXISTS "users_insert" ON users;
DROP POLICY IF EXISTS "users_delete" ON users;
