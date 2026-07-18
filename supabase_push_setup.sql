-- 웹 푸시 구독 테이블 (앱이 꺼져 있어도 공지 푸시 알림을 받기 위한 기기 등록)
-- Supabase 대시보드 → SQL Editor에서 실행하세요

CREATE TABLE IF NOT EXISTS push_subscriptions (
  endpoint text PRIMARY KEY,
  p256dh text NOT NULL,
  auth text NOT NULL,
  user_email text,
  user_name text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
-- 기기 등록/갱신만 허용, 조회는 서버(edge function, service role)만 가능
CREATE POLICY "push_insert" ON push_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "push_update" ON push_subscriptions FOR UPDATE USING (true);
