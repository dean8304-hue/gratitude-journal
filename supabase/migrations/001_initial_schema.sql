-- ============================================
-- 감사일기 (Gratitude Journal) Database Schema
-- ============================================

-- 1. profiles 테이블
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT DEFAULT '',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notification_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. gratitude_entries 테이블
CREATE TABLE IF NOT EXISTS gratitude_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  discovery TEXT NOT NULL,       -- 오늘 발견한 감사한 것
  reason TEXT DEFAULT '',        -- 왜 감사한지 (선택)
  order_index INTEGER NOT NULL DEFAULT 0,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. meditation_reflections 테이블
CREATE TABLE IF NOT EXISTS meditation_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  jft_title TEXT NOT NULL,
  jft_content TEXT NOT NULL,
  reflection TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 4. reactions 테이블
CREATE TABLE IF NOT EXISTS reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  entry_id UUID NOT NULL REFERENCES gratitude_entries(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'cheer', 'pray', 'heart')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, entry_id, type)
);

-- 5. comments 테이블
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  entry_id UUID NOT NULL REFERENCES gratitude_entries(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_gratitude_entries_user_date ON gratitude_entries(user_id, date);
CREATE INDEX idx_gratitude_entries_public ON gratitude_entries(is_public, created_at DESC);
CREATE INDEX idx_meditation_reflections_user_date ON meditation_reflections(user_id, date);
CREATE INDEX idx_reactions_entry ON reactions(entry_id);
CREATE INDEX idx_comments_entry ON comments(entry_id, created_at);

-- ============================================
-- RLS (Row Level Security) Policies
-- ============================================

-- profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "프로필 조회는 모든 인증 사용자" ON profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "프로필 수정은 본인만" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "프로필 생성은 본인만" ON profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- gratitude_entries
ALTER TABLE gratitude_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "본인 감사 항목 전체 조회" ON gratitude_entries
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "공개 감사 항목 조회" ON gratitude_entries
  FOR SELECT TO authenticated USING (is_public = true);

CREATE POLICY "감사 항목 생성은 본인만" ON gratitude_entries
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "감사 항목 수정은 본인만" ON gratitude_entries
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "감사 항목 삭제는 본인만" ON gratitude_entries
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- meditation_reflections
ALTER TABLE meditation_reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "명상 기록 조회는 본인만" ON meditation_reflections
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "명상 기록 생성은 본인만" ON meditation_reflections
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "명상 기록 수정은 본인만" ON meditation_reflections
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- reactions
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "리액션 조회는 인증 사용자" ON reactions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "리액션 생성은 인증 사용자" ON reactions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "리액션 삭제는 본인만" ON reactions
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- comments
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "댓글 조회는 인증 사용자" ON comments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "댓글 생성은 인증 사용자" ON comments
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "댓글 수정은 본인만" ON comments
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "댓글 삭제는 본인만" ON comments
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ============================================
-- Functions & Triggers
-- ============================================

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_gratitude_entries_updated_at
  BEFORE UPDATE ON gratitude_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_meditation_reflections_updated_at
  BEFORE UPDATE ON meditation_reflections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 회원가입 시 프로필 자동 생성
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nickname', NEW.raw_user_meta_data->>'name', '익명')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
