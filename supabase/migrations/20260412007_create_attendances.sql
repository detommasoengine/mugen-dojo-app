-- Migration: 20260412_007_create_attendances
-- Description: Attendance records with weighted hours and grade history
-- Reference: docs/business/05-calendario-regole.md (weight system), docs/business/04-ciclo-vita-aikidoka.md

-- Attendance records
CREATE TABLE IF NOT EXISTS attendances (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dojo_id         uuid NOT NULL REFERENCES dojos(id) ON DELETE CASCADE,
  profile_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_id        uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,

  -- Hours
  effective_hours numeric(4,1) NOT NULL,   -- Actual hours attended
  weighted_hours  numeric(5,2) NOT NULL,   -- effective_hours × event_weight × role_weight

  -- Role and method
  event_role      event_role NOT NULL DEFAULT 'participant',
  method          attendance_method NOT NULL DEFAULT 'roll_call',
  status          attendance_status NOT NULL DEFAULT 'registered',

  -- Confirmation
  confirmed_by    uuid REFERENCES profiles(id),
  confirmed_at    timestamptz,

  notes           text,

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  UNIQUE (profile_id, event_id)
);

-- Indexes
CREATE INDEX idx_attendances_profile ON attendances(profile_id, created_at);
CREATE INDEX idx_attendances_event ON attendances(event_id);
CREATE INDEX idx_attendances_dojo_date ON attendances(dojo_id, created_at);
-- Partial index for pending confirmations queue (avoids full-scan on low-cardinality status column)
CREATE INDEX idx_attendances_pending ON attendances(dojo_id, created_at)
  WHERE status = 'registered';

CREATE TRIGGER attendances_updated_at
  BEFORE UPDATE ON attendances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grade history (track all grade changes)
CREATE TABLE IF NOT EXISTS grade_history (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  dojo_id         uuid NOT NULL REFERENCES dojos(id) ON DELETE CASCADE,

  previous_grade  grade_type,
  new_grade       grade_type NOT NULL,
  exam_date       date,
  outcome         exam_outcome NOT NULL DEFAULT 'passed',
  exam_event_id   uuid REFERENCES events(id),

  -- Hours accumulated at time of grade change
  total_hours_at_change  numeric(7,2),

  granted_by      uuid REFERENCES profiles(id),  -- Who registered the grade change
  notes           text,

  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_grade_history_profile ON grade_history(profile_id, created_at);

-- RLS
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_history ENABLE ROW LEVEL SECURITY;

-- Aikidoka can view their own attendance
CREATE POLICY "Users can view own attendance"
  ON attendances FOR SELECT
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Aikidoka can insert their own attendance (self-registration)
CREATE POLICY "Users can register own attendance"
  ON attendances FOR INSERT
  WITH CHECK (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    AND status = 'registered'
    AND event_role = 'participant'
  );

-- Head master can manage all attendance in their dojo
CREATE POLICY "Head master manages dojo attendance"
  ON attendances FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid() AND p.dojo_id = attendances.dojo_id AND p.role = 'head_master'
  ));

-- Secretary with attendance permission can view and confirm
CREATE POLICY "Secretary with permission can view attendance"
  ON attendances FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles p
    JOIN secretary_permissions sp ON sp.profile_id = p.id AND sp.dojo_id = p.dojo_id
    WHERE p.user_id = auth.uid()
    AND p.dojo_id = attendances.dojo_id
    AND p.role = 'secretary'
    AND sp.can_view_all_attendance = true
  ));

CREATE POLICY "Secretary with permission can confirm attendance"
  ON attendances FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles p
    JOIN secretary_permissions sp ON sp.profile_id = p.id AND sp.dojo_id = p.dojo_id
    WHERE p.user_id = auth.uid()
    AND p.dojo_id = attendances.dojo_id
    AND p.role = 'secretary'
    AND sp.can_confirm_attendance = true
  ));

-- Grade history: users can view their own
CREATE POLICY "Users can view own grade history"
  ON grade_history FOR SELECT
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Head master manages grade history
CREATE POLICY "Head master manages grade history"
  ON grade_history FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid() AND p.dojo_id = grade_history.dojo_id AND p.role = 'head_master'
  ));

-- ROLLBACK:
-- DROP TABLE IF EXISTS grade_history CASCADE;
-- DROP TRIGGER IF EXISTS attendances_updated_at ON attendances;
-- DROP TABLE IF EXISTS attendances CASCADE;
