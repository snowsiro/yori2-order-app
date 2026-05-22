-- 공지사항 + 특이사항 테이블
-- Supabase 대시보드 → SQL Editor에서 실행하세요

CREATE TABLE IF NOT EXISTS announcements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  content text NOT NULL,
  author_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "announce_read"   ON announcements FOR SELECT USING (true);
CREATE POLICY "announce_insert" ON announcements FOR INSERT WITH CHECK (true);
CREATE POLICY "announce_delete" ON announcements FOR DELETE USING (true);

CREATE TABLE IF NOT EXISTS daily_notes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  content text NOT NULL,
  work_date date NOT NULL DEFAULT CURRENT_DATE,
  author_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE daily_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notes_read"   ON daily_notes FOR SELECT USING (true);
CREATE POLICY "notes_insert" ON daily_notes FOR INSERT WITH CHECK (true);
CREATE POLICY "notes_delete" ON daily_notes FOR DELETE USING (true);
