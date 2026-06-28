-- Migration: 20260628009_grant_table_privileges
-- Description: Grant table/sequence/function privileges to anon & authenticated.
-- RLS still governs row access; without these table-level GRANTs PostgREST
-- returns "permission denied" for every public table (the first real data read
-- on the admin dashboard surfaced this gap, present since migration 003).

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Future tables/sequences created by the migration owner inherit the grants
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated;

-- ROLLBACK:
-- REVOKE SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public FROM authenticated;
-- REVOKE SELECT ON ALL TABLES IN SCHEMA public FROM anon;
