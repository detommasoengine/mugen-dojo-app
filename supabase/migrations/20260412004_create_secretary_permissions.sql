-- Migration: 20260412_004_create_secretary_permissions
-- Description: Granular permissions for secretaries, assigned by head master
-- Reference: docs/business/03-attori-ruoli.md (multiple secretaries with individual permissions)

CREATE TABLE IF NOT EXISTS secretary_permissions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  dojo_id         uuid NOT NULL REFERENCES dojos(id) ON DELETE CASCADE,

  -- Granular permissions (all default false, enabled by head master)
  can_manage_users           boolean NOT NULL DEFAULT false,
  can_manage_calendar        boolean NOT NULL DEFAULT false,
  can_manage_suspensions     boolean NOT NULL DEFAULT false,
  can_manage_events          boolean NOT NULL DEFAULT false,
  can_confirm_attendance     boolean NOT NULL DEFAULT false,
  can_view_all_attendance    boolean NOT NULL DEFAULT false,
  can_view_all_profiles      boolean NOT NULL DEFAULT false,
  can_send_communications    boolean NOT NULL DEFAULT false,
  can_manage_resources       boolean NOT NULL DEFAULT false,
  can_manage_glossary        boolean NOT NULL DEFAULT false,
  can_verify_exam_requirements boolean NOT NULL DEFAULT false,
  can_manage_projects        boolean NOT NULL DEFAULT false,
  can_pre_register_emails    boolean NOT NULL DEFAULT false,

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  UNIQUE (profile_id, dojo_id)
);

CREATE TRIGGER secretary_permissions_updated_at
  BEFORE UPDATE ON secretary_permissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE secretary_permissions ENABLE ROW LEVEL SECURITY;

-- Secretaries can read their own permissions
CREATE POLICY "Secretaries can view own permissions"
  ON secretary_permissions FOR SELECT
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Head master can manage all secretary permissions in their dojo
CREATE POLICY "Head master manages secretary permissions"
  ON secretary_permissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
      AND p.dojo_id = secretary_permissions.dojo_id
      AND p.role = 'head_master'
    )
  );

-- ROLLBACK:
-- DROP TRIGGER IF EXISTS secretary_permissions_updated_at ON secretary_permissions;
-- DROP TABLE IF EXISTS secretary_permissions CASCADE;
