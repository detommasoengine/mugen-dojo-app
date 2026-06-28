-- Migration: 20260628004_notifications
-- Description: Push device tokens + notification queue/log (ADR-005 D.2)
-- Reference: docs/decisions/ADR-005-notifiche-comunicazioni.md

-- ── Expo push tokens (device registration) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS push_tokens (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  expo_token    text NOT NULL,
  platform      text NOT NULL CHECK (platform IN ('android', 'ios', 'web')),
  created_at    timestamptz NOT NULL DEFAULT now(),

  UNIQUE (profile_id, expo_token)
);

CREATE INDEX IF NOT EXISTS idx_push_tokens_profile ON push_tokens(profile_id);

-- ── Notifications (queue/log, per channel) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dojo_id       uuid NOT NULL REFERENCES dojos(id) ON DELETE CASCADE,
  profile_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,  -- recipient

  channel       text NOT NULL CHECK (channel IN ('email', 'push', 'in_app')),
  type          text NOT NULL,   -- e.g. 'lesson_cancelled', 'exam_reminder', 'medical_cert_expiry'
  title         text NOT NULL,
  body          text NOT NULL,

  status        text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at       timestamptz,
  read_at       timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(profile_id, created_at DESC);

ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Push tokens: each user manages their own device tokens
CREATE POLICY "Users manage own push tokens"
  ON push_tokens FOR ALL
  USING (profile_id IN (SELECT get_user_profile_ids()));

-- Notifications: recipient reads (and marks read) their own
CREATE POLICY "Users view own notifications"
  ON notifications FOR SELECT
  USING (profile_id IN (SELECT get_user_profile_ids()));

CREATE POLICY "Users update own notifications"
  ON notifications FOR UPDATE
  USING (profile_id IN (SELECT get_user_profile_ids()));

-- Head master manages all notifications in the dojo (sends go via Edge Function)
CREATE POLICY "Head master manages notifications"
  ON notifications FOR ALL
  USING (is_head_master_of(dojo_id));

-- ROLLBACK:
-- DROP TABLE IF EXISTS notifications CASCADE;
-- DROP TABLE IF EXISTS push_tokens CASCADE;
