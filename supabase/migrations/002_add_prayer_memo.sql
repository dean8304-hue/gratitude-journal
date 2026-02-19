-- meditation_reflections 테이블에 특별 기도 및 자유 메모 컬럼 추가
ALTER TABLE meditation_reflections
  ALTER COLUMN reflection DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS prayer TEXT,
  ADD COLUMN IF NOT EXISTS memo TEXT;
