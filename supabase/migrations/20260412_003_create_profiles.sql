-- Migration: 20260412_003_create_profiles
-- Description: User profiles extending Supabase auth.users
-- Reference: docs/business/03-attori-ruoli.md, docs/business/04-ciclo-vita-aikidoka.md

CREATE TABLE IF NOT EXISTS profiles (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dojo_id         uuid NOT NULL REFERENCES dojos(id) ON DELETE CASCADE,

  -- Identity
  first_name      text NOT NULL,
  last_name       text NOT NULL,
  date_of_birth   date,
  phone           text,
  photo_url       text,

  -- Dojo role and grade
  role            user_role NOT NULL DEFAULT 'aikidoka',
  current_grade   grade_type NOT NULL DEFAULT 'none',
  enrollment_date date NOT NULL DEFAULT CURRENT_DATE,

  -- Conductor authorization (Senpai allowed to lead lessons)
  can_conduct     boolean NOT NULL DEFAULT false,

  -- Medical certificate
  medical_cert_expiry  date,

  -- Booklet type (green → blue at kyu_4)
  booklet_type    text CHECK (booklet_type IN ('green', 'blue', 'national')) DEFAULT 'green',

  -- Account status
  is_active       boolean NOT NULL DEFAULT true,

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  -- Constraints
  UNIQUE (user_id, dojo_id)
);

-- Indexes
CREATE INDEX idx_profiles_dojo_id ON profiles(dojo_id);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_role ON profiles(dojo_id, role);

-- Auto-update updated_at
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Helper function per leggere i dojo senza innescare RLS loop
CREATE OR REPLACE FUNCTION get_user_dojo_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT dojo_id FROM profiles WHERE user_id = auth.uid();
$$;

-- Users can view all profiles in their dojo
CREATE POLICY "Users can view dojo profiles"
  ON profiles FOR SELECT
  USING (
    dojo_id IN (SELECT get_user_dojo_ids())
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    -- Prevent self role/grade escalation
    AND role = (SELECT role FROM profiles WHERE user_id = auth.uid() AND dojo_id = profiles.dojo_id)
    AND current_grade = (SELECT current_grade FROM profiles WHERE user_id = auth.uid() AND dojo_id = profiles.dojo_id)
    AND can_conduct = (SELECT can_conduct FROM profiles WHERE user_id = auth.uid() AND dojo_id = profiles.dojo_id)
  );

-- Head master can insert/update/delete all profiles in their dojo
CREATE POLICY "Head master manages dojo profiles"
  ON profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
      AND p.dojo_id = profiles.dojo_id
      AND p.role = 'head_master'
    )
  );

-- ROLLBACK:
-- DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
-- DROP TABLE IF EXISTS profiles CASCADE;
