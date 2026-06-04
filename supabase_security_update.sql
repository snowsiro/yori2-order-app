-- Yori2 보안 강화 마이그레이션
-- Supabase 대시보드 → SQL Editor 에서 실행하세요.
-- 목적: password_hash가 공개 anon key로 노출되던 문제를 차단합니다.

-- ── 1. 원본 users 테이블의 anon 직접 SELECT 정책 제거 ──
-- (기존엔 USING(true) 라 누구나 password_hash까지 읽을 수 있었음)
DROP POLICY IF EXISTS "users_read_anon" ON users;

-- 직원 추가/삭제(설정 화면)는 계속 동작해야 하므로 INSERT/DELETE 정책은 유지
DROP POLICY IF EXISTS "users_insert" ON users;
DROP POLICY IF EXISTS "users_delete" ON users;
CREATE POLICY "users_insert" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "users_delete" ON users FOR DELETE USING (true);

-- ── 2. 민감정보(password_hash) 제외한 공개 view ──
-- 앱은 이 view 로만 사용자 목록/역할을 조회합니다.
CREATE OR REPLACE VIEW users_public
WITH (security_invoker = false) AS
  SELECT id, email, name, role FROM users;
GRANT SELECT ON users_public TO anon, authenticated;

-- ── 3. 로그인 검증 함수 ──
-- password_hash를 클라이언트로 보내지 않고 서버 내부에서 비교합니다.
-- staff(password_hash IS NULL)는 비밀번호 없이 이메일만으로 통과합니다.
CREATE OR REPLACE FUNCTION verify_login(p_email text, p_password text)
RETURNS TABLE(email text, name text, role text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  u public.users%ROWTYPE;
BEGIN
  SELECT * INTO u FROM public.users WHERE public.users.email = lower(trim(p_email));
  IF NOT FOUND THEN
    RETURN; -- 등록되지 않은 이메일: 빈 결과
  END IF;
  IF u.password_hash IS NULL
     OR u.password_hash = encode(sha256(p_password::bytea), 'hex') THEN
    RETURN QUERY SELECT u.email, u.name, u.role;
  END IF;
END;
$$;
GRANT EXECUTE ON FUNCTION verify_login(text, text) TO anon, authenticated;
