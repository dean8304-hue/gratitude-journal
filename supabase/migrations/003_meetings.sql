-- ============================================
-- meetings 테이블: NA 모임 안내
-- ============================================

CREATE TABLE IF NOT EXISTS meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  day_of_week TEXT,
  time TEXT,
  location_name TEXT,
  address TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_meetings_active ON meetings(is_active);
CREATE INDEX idx_meetings_created_by ON meetings(created_by);

-- RLS 활성화
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- 정책: 로그인 사용자 읽기 가능 (활성 모임만)
CREATE POLICY "meetings_select_policy" ON meetings
  FOR SELECT TO authenticated
  USING (true);

-- 정책: 로그인 사용자 모임 추가 가능
CREATE POLICY "meetings_insert_policy" ON meetings
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- 정책: 본인이 만든 모임만 수정 가능
CREATE POLICY "meetings_update_policy" ON meetings
  FOR UPDATE TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- 정책: 본인이 만든 모임만 삭제 가능
CREATE POLICY "meetings_delete_policy" ON meetings
  FOR DELETE TO authenticated
  USING (auth.uid() = created_by);

-- updated_at 자동 갱신 트리거
CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON meetings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
