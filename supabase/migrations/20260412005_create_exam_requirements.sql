-- Migration: 20260412_005_create_exam_requirements
-- Description: Configurable exam requirements per dojo (defaults: Aikikai d'Italia official)
-- Reference: docs/business/04-ciclo-vita-aikidoka.md

CREATE TABLE IF NOT EXISTS exam_requirements (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dojo_id         uuid NOT NULL REFERENCES dojos(id) ON DELETE CASCADE,
  target_grade    grade_type NOT NULL,

  -- Requirements
  min_hours              integer NOT NULL,       -- Minimum training hours
  min_months_from_prev   integer NOT NULL,       -- Minimum months since previous grade
  min_age                integer,                -- Minimum age (e.g., 15 for 1st Dan)
  is_nomination          boolean NOT NULL DEFAULT false,  -- For Dan 5+: nomination only
  notes                  text,

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  UNIQUE (dojo_id, target_grade)
);

CREATE TRIGGER exam_requirements_updated_at
  BEFORE UPDATE ON exam_requirements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE exam_requirements ENABLE ROW LEVEL SECURITY;

-- All dojo members can read exam requirements
CREATE POLICY "Dojo members can view exam requirements"
  ON exam_requirements FOR SELECT
  USING (
    dojo_id IN (
      SELECT p.dojo_id FROM profiles p WHERE p.user_id = auth.uid()
    )
  );

-- Only head master can modify exam requirements
CREATE POLICY "Head master manages exam requirements"
  ON exam_requirements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
      AND p.dojo_id = exam_requirements.dojo_id
      AND p.role = 'head_master'
    )
  );

-- ROLLBACK:
-- DROP TRIGGER IF EXISTS exam_requirements_updated_at ON exam_requirements;
-- DROP TABLE IF EXISTS exam_requirements CASCADE;
