-- Migration: 20260628001_extend_roles_and_profile_fields
-- Description: Guest role + profile flags/fields (ADR-003 C.2, E.1)
-- Reference: docs/decisions/ADR-003-modello-ruoli-esteso.md

-- C.2 — Ospite generico: nuovo valore enum (non usato nello stesso tx)
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'guest';

-- C.2 — Aikidoka guest: praticante identitario esterno al Dojo target
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_guest boolean NOT NULL DEFAULT false;

-- E.1 — Certificato medico: file (la scadenza medical_cert_expiry esiste già)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS medical_cert_file_path text;

-- RLS: invariata. Le policy esistenti su profiles coprono i nuovi campi.

-- ROLLBACK:
-- ALTER TABLE profiles DROP COLUMN IF EXISTS medical_cert_file_path;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS is_guest;
-- NB: un valore enum aggiunto con ALTER TYPE non è removibile senza ricreare il tipo.
