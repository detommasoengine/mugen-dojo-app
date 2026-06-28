-- Migration: 20260628005_communication_recipients
-- Description: Individual communication recipients + read tracking (ADR-005 D.1)
-- Reference: docs/decisions/ADR-005-notifiche-comunicazioni.md
-- Broadcast/group stay on communications.target_audience; this adds 1:1 + read state.

CREATE TABLE IF NOT EXISTS communication_recipients (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  communication_id  uuid NOT NULL REFERENCES communications(id) ON DELETE CASCADE,
  profile_id        uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  read_at           timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),

  UNIQUE (communication_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_comm_recipients_profile ON communication_recipients(profile_id);

ALTER TABLE communication_recipients ENABLE ROW LEVEL SECURITY;

-- Recipient reads and marks-as-read their own deliveries
CREATE POLICY "Recipients view own communication deliveries"
  ON communication_recipients FOR SELECT
  USING (profile_id IN (SELECT get_user_profile_ids()));

CREATE POLICY "Recipients update own read state"
  ON communication_recipients FOR UPDATE
  USING (profile_id IN (SELECT get_user_profile_ids()));

-- Head master manages recipients of communications in their dojo
CREATE POLICY "Head master manages communication recipients"
  ON communication_recipients FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM communications c
      WHERE c.id = communication_recipients.communication_id
      AND is_head_master_of(c.dojo_id)
    )
  );

-- ROLLBACK:
-- DROP TABLE IF EXISTS communication_recipients CASCADE;
