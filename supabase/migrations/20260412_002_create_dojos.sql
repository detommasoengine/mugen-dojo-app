-- Migration: 20260412_002_create_dojos
-- Description: Dojo table — the root multi-tenant entity
-- Reference: docs/business/02-modello-dominio.md

CREATE TABLE IF NOT EXISTS dojos (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  address       text,
  federation    text NOT NULL DEFAULT 'Aikikai d''Italia',

  -- Academic year config
  academic_year_start_month  smallint NOT NULL DEFAULT 9,  -- September
  academic_year_start_day    smallint NOT NULL DEFAULT 1,
  academic_year_end_month    smallint NOT NULL DEFAULT 7,   -- July
  academic_year_end_day      smallint NOT NULL DEFAULT 31,

  -- Configurable weights
  default_event_weight       numeric(3,2) NOT NULL DEFAULT 1.0,
  conductor_weight           numeric(3,2) NOT NULL DEFAULT 2.0,

  -- Attendance confirmation
  require_attendance_confirmation boolean NOT NULL DEFAULT false,

  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER dojos_updated_at
  BEFORE UPDATE ON dojos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE dojos ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read their own dojo (via profiles)
CREATE POLICY "Users can view their own dojo"
  ON dojos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.dojo_id = dojos.id
      AND profiles.user_id = auth.uid()
    )
  );

-- Only head_master can update dojo settings
CREATE POLICY "Head master can update dojo"
  ON dojos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.dojo_id = dojos.id
      AND profiles.user_id = auth.uid()
      AND profiles.role = 'head_master'
    )
  );

-- ROLLBACK:
-- DROP TRIGGER IF EXISTS dojos_updated_at ON dojos;
-- DROP TABLE IF EXISTS dojos CASCADE;
