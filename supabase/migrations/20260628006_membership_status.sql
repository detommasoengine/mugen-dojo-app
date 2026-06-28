-- Migration: 20260628006_membership_status
-- Description: Membership/fee status tracking only — no real transactions (E.2/E.3)
-- Reference: docs/business/07-domande-stakeholder.md (E.2/E.3, sezione I = follow-up)

CREATE TABLE IF NOT EXISTS membership_status (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id          uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  dojo_id             uuid NOT NULL REFERENCES dojos(id) ON DELETE CASCADE,

  -- Aikikai d'Italia card
  aikikai_card_status text NOT NULL DEFAULT 'unknown'
                        CHECK (aikikai_card_status IN ('unknown', 'active', 'expired', 'pending')),
  aikikai_expiry      date,

  -- Dojo fee
  dojo_fee_paid_until date,

  updated_at          timestamptz NOT NULL DEFAULT now(),
  created_at          timestamptz NOT NULL DEFAULT now(),

  UNIQUE (profile_id, dojo_id)
);

CREATE TRIGGER membership_status_updated_at
  BEFORE UPDATE ON membership_status
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE membership_status ENABLE ROW LEVEL SECURITY;

-- Owner reads their own status
CREATE POLICY "Users view own membership status"
  ON membership_status FOR SELECT
  USING (profile_id IN (SELECT get_user_profile_ids()));

-- Head master manages all statuses in the dojo (the 'cassiere' incarico is
-- enforced application-side via dojo_role_assignments until generalized in RLS)
CREATE POLICY "Head master manages membership status"
  ON membership_status FOR ALL
  USING (is_head_master_of(dojo_id));

-- ROLLBACK:
-- DROP TABLE IF EXISTS membership_status CASCADE;
