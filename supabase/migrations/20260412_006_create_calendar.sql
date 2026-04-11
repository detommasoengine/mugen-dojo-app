-- Migration: 20260412_006_create_calendar
-- Description: Calendar system — lesson templates, suspension periods, events
-- Reference: docs/business/05-calendario-regole.md

-- Weekly lesson template (e.g., Mon/Wed/Fri 19:00-20:00)
CREATE TABLE IF NOT EXISTS lesson_templates (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dojo_id         uuid NOT NULL REFERENCES dojos(id) ON DELETE CASCADE,

  day_of_week     smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),  -- 0=Sunday, 1=Monday...
  start_time      time NOT NULL,
  end_time        time NOT NULL,
  duration_hours  numeric(3,1) NOT NULL DEFAULT 1.0,

  -- Optional grade filter
  grade_filter_min  grade_type,  -- Minimum grade to access (NULL = no filter)
  grade_filter_max  grade_type,  -- Maximum grade to access (NULL = no filter)

  is_active       boolean NOT NULL DEFAULT true,

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER lesson_templates_updated_at
  BEFORE UPDATE ON lesson_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Suspension periods (holidays, breaks)
CREATE TABLE IF NOT EXISTS suspension_periods (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dojo_id         uuid NOT NULL REFERENCES dojos(id) ON DELETE CASCADE,

  name            text NOT NULL,                  -- e.g., "Agosto", "Natale", "Pasqua"
  start_date      date NOT NULL,
  end_date        date NOT NULL,
  is_recurring    boolean NOT NULL DEFAULT false,  -- Recurs every year
  recurring_month_start  smallint,                 -- For recurring: start month (1-12)
  recurring_day_start    smallint,                 -- For recurring: start day

  created_at      timestamptz NOT NULL DEFAULT now(),

  CHECK (end_date >= start_date)
);

-- Events (the core calendar entity)
CREATE TABLE IF NOT EXISTS events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dojo_id         uuid NOT NULL REFERENCES dojos(id) ON DELETE CASCADE,

  -- Event info
  type            event_type NOT NULL,
  title           text NOT NULL,
  description     text,
  location        text,

  -- Timing
  starts_at       timestamptz NOT NULL,
  ends_at         timestamptz NOT NULL,
  duration_hours  numeric(4,1) NOT NULL,

  -- Weight multiplier for hours calculation (default from dojo config)
  event_weight    numeric(3,2) NOT NULL DEFAULT 1.0,

  -- Instructor / conductor
  instructor_name     text,       -- External instructor name (for stages)
  conductor_profile_id uuid REFERENCES profiles(id),  -- Internal Senpai conductor

  -- Grade-based access filter
  grade_filter_min  grade_type,
  grade_filter_max  grade_type,

  -- Generated from template?
  template_id     uuid REFERENCES lesson_templates(id),

  -- For exams: target grade
  exam_target_grade  grade_type,

  -- Project link (for workshops)
  project_id      uuid,  -- FK added in migration 008

  is_cancelled    boolean NOT NULL DEFAULT false,

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  CHECK (ends_at > starts_at)
);

-- Indexes
CREATE INDEX idx_events_dojo_date ON events(dojo_id, starts_at);
CREATE INDEX idx_events_type ON events(dojo_id, type);
CREATE INDEX idx_events_template ON events(template_id);

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Event grade exceptions (students allowed despite not matching grade filter)
CREATE TABLE IF NOT EXISTS event_grade_exceptions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  profile_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  granted_by      uuid NOT NULL REFERENCES profiles(id),
  created_at      timestamptz NOT NULL DEFAULT now(),

  UNIQUE (event_id, profile_id)
);

-- RLS for all calendar tables
ALTER TABLE lesson_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE suspension_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_grade_exceptions ENABLE ROW LEVEL SECURITY;

-- Lesson templates: all dojo members can read
CREATE POLICY "Dojo members can view lesson templates"
  ON lesson_templates FOR SELECT
  USING (dojo_id IN (SELECT p.dojo_id FROM profiles p WHERE p.user_id = auth.uid()));

CREATE POLICY "Head master manages lesson templates"
  ON lesson_templates FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid() AND p.dojo_id = lesson_templates.dojo_id AND p.role = 'head_master'
  ));

-- Suspension periods: all dojo members can read
CREATE POLICY "Dojo members can view suspensions"
  ON suspension_periods FOR SELECT
  USING (dojo_id IN (SELECT p.dojo_id FROM profiles p WHERE p.user_id = auth.uid()));

CREATE POLICY "Head master manages suspensions"
  ON suspension_periods FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid() AND p.dojo_id = suspension_periods.dojo_id AND p.role = 'head_master'
  ));

-- Events: all dojo members can read (UI handles grade filtering)
CREATE POLICY "Dojo members can view events"
  ON events FOR SELECT
  USING (dojo_id IN (SELECT p.dojo_id FROM profiles p WHERE p.user_id = auth.uid()));

CREATE POLICY "Head master manages events"
  ON events FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid() AND p.dojo_id = events.dojo_id AND p.role = 'head_master'
  ));

-- Grade exceptions: readable by involved profiles
CREATE POLICY "Dojo members can view grade exceptions"
  ON event_grade_exceptions FOR SELECT
  USING (
    event_id IN (
      SELECT e.id FROM events e
      WHERE e.dojo_id IN (SELECT p.dojo_id FROM profiles p WHERE p.user_id = auth.uid())
    )
  );

CREATE POLICY "Head master manages grade exceptions"
  ON event_grade_exceptions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM events e
      JOIN profiles p ON p.dojo_id = e.dojo_id
      WHERE e.id = event_grade_exceptions.event_id
      AND p.user_id = auth.uid()
      AND p.role = 'head_master'
    )
  );

-- ROLLBACK:
-- DROP TABLE IF EXISTS event_grade_exceptions CASCADE;
-- DROP TABLE IF EXISTS events CASCADE;
-- DROP TABLE IF EXISTS suspension_periods CASCADE;
-- DROP TRIGGER IF EXISTS lesson_templates_updated_at ON lesson_templates;
-- DROP TABLE IF EXISTS lesson_templates CASCADE;
