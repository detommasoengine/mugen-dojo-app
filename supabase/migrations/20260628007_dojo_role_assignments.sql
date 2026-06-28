-- Migration: 20260628007_dojo_role_assignments
-- Description: Aikidoka functional incarichi that grant capabilities (ADR-003 C.5)
-- Reference: docs/decisions/ADR-003-modello-ruoli-esteso.md
-- Generalizes the secretary_permissions pattern: an assignment carries a label
-- plus capability flags (extendable). E.g. 'cassiere' -> can_view/manage_payments.

CREATE TABLE IF NOT EXISTS dojo_role_assignments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id          uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  dojo_id             uuid NOT NULL REFERENCES dojos(id) ON DELETE CASCADE,

  label               text NOT NULL,   -- e.g. 'cassiere', 'referente_armi', 'responsabile_tatami'

  -- Capability flags (all default false, enabled by head master)
  can_view_payments   boolean NOT NULL DEFAULT false,
  can_manage_payments boolean NOT NULL DEFAULT false,
  can_manage_resources boolean NOT NULL DEFAULT false,

  assigned_by         uuid NOT NULL REFERENCES profiles(id),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),

  UNIQUE (profile_id, dojo_id, label)
);

CREATE INDEX IF NOT EXISTS idx_role_assignments_profile ON dojo_role_assignments(profile_id);

CREATE TRIGGER dojo_role_assignments_updated_at
  BEFORE UPDATE ON dojo_role_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE dojo_role_assignments ENABLE ROW LEVEL SECURITY;

-- Holder reads their own incarichi
CREATE POLICY "Users view own role assignments"
  ON dojo_role_assignments FOR SELECT
  USING (profile_id IN (SELECT get_user_profile_ids()));

-- Only the head master assigns/revokes incarichi
CREATE POLICY "Head master manages role assignments"
  ON dojo_role_assignments FOR ALL
  USING (is_head_master_of(dojo_id));

-- ROLLBACK:
-- DROP TABLE IF EXISTS dojo_role_assignments CASCADE;
