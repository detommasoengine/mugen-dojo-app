-- Migration: 20260628003_dojo_checkin_and_attendance_sessions
-- Description: Dojo check-in config + rotating check-in session tokens (ADR-004, B.3)
-- Reference: docs/decisions/ADR-004-check-in-presenze.md

-- ── Dojo config: check-in, geofence (opt), auto-confirm, max absences ──────────
ALTER TABLE dojos ADD COLUMN IF NOT EXISTS printed_qr_enabled   boolean NOT NULL DEFAULT false;
ALTER TABLE dojos ADD COLUMN IF NOT EXISTS checkin_auto_confirm boolean NOT NULL DEFAULT true;
ALTER TABLE dojos ADD COLUMN IF NOT EXISTS checkin_geofence_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE dojos ADD COLUMN IF NOT EXISTS checkin_lat       numeric(9,6);
ALTER TABLE dojos ADD COLUMN IF NOT EXISTS checkin_lng       numeric(9,6);
ALTER TABLE dojos ADD COLUMN IF NOT EXISTS checkin_radius_m  integer;
-- B.3 — soglia assenze (NULL = nessun limite)
ALTER TABLE dojos ADD COLUMN IF NOT EXISTS max_absences_default integer;

-- ── Check-in session tokens (rotating, HMAC) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance_sessions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dojo_id       uuid NOT NULL REFERENCES dojos(id) ON DELETE CASCADE,
  event_id      uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,

  token_hash    text NOT NULL,               -- HMAC of the issued token (never the raw token)
  expires_at    timestamptz NOT NULL,

  -- Optional geo capture at issue time
  geo_enabled   boolean NOT NULL DEFAULT false,
  lat           numeric(9,6),
  lng           numeric(9,6),

  created_by    uuid NOT NULL REFERENCES profiles(id),
  created_at    timestamptz NOT NULL DEFAULT now(),

  CHECK (expires_at > created_at)
);

CREATE INDEX IF NOT EXISTS idx_attendance_sessions_event ON attendance_sessions(event_id);
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_expires ON attendance_sessions(dojo_id, expires_at);

ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;

-- Token is secret: only the head master manages/reads sessions directly.
-- Aikidoka validate via Edge Function (service role), never read the table.
CREATE POLICY "Head master manages attendance sessions"
  ON attendance_sessions FOR ALL
  USING (is_head_master_of(dojo_id));

-- ROLLBACK:
-- DROP TABLE IF EXISTS attendance_sessions CASCADE;
-- ALTER TABLE dojos DROP COLUMN IF EXISTS max_absences_default;
-- ALTER TABLE dojos DROP COLUMN IF EXISTS checkin_radius_m;
-- ALTER TABLE dojos DROP COLUMN IF EXISTS checkin_lng;
-- ALTER TABLE dojos DROP COLUMN IF EXISTS checkin_lat;
-- ALTER TABLE dojos DROP COLUMN IF EXISTS checkin_geofence_enabled;
-- ALTER TABLE dojos DROP COLUMN IF EXISTS checkin_auto_confirm;
-- ALTER TABLE dojos DROP COLUMN IF EXISTS printed_qr_enabled;
