-- Migration: 20260628002_lesson_template_validity
-- Description: Seasonal lesson templates via validity window (B.2)
-- Reference: docs/business/07-domande-stakeholder.md (B.2)

ALTER TABLE lesson_templates ADD COLUMN IF NOT EXISTS valid_from date;
ALTER TABLE lesson_templates ADD COLUMN IF NOT EXISTS valid_to date;
ALTER TABLE lesson_templates ADD COLUMN IF NOT EXISTS season_label text;

-- valid_to must not precede valid_from when both are set
ALTER TABLE lesson_templates DROP CONSTRAINT IF EXISTS chk_lesson_template_validity;
ALTER TABLE lesson_templates ADD CONSTRAINT chk_lesson_template_validity
  CHECK (valid_from IS NULL OR valid_to IS NULL OR valid_to >= valid_from);

-- RLS: invariata (le policy esistenti su lesson_templates coprono i nuovi campi).

-- ROLLBACK:
-- ALTER TABLE lesson_templates DROP CONSTRAINT IF EXISTS chk_lesson_template_validity;
-- ALTER TABLE lesson_templates DROP COLUMN IF EXISTS season_label;
-- ALTER TABLE lesson_templates DROP COLUMN IF EXISTS valid_to;
-- ALTER TABLE lesson_templates DROP COLUMN IF EXISTS valid_from;
