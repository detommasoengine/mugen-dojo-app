-- Migration: 20260412_010_fix_rls_helpers
-- Description: Add SECURITY DEFINER helpers and fix all RLS policies
--   - get_user_profile_ids(): returns profile IDs for current user (bypasses RLS)
--   - is_head_master_of(uuid): checks head_master role for a dojo (bypasses RLS)
--   - Replace self-referential WITH CHECK on profiles with BEFORE UPDATE trigger
--   - Standardize all policies to use helper functions instead of direct subqueries
-- Reference: Supabase known anti-pattern — self-referential RLS infinite recursion

-- ============================================================================
-- 1. NEW SECURITY DEFINER HELPERS
-- ============================================================================

-- Returns all profile IDs belonging to the current authenticated user
CREATE OR REPLACE FUNCTION get_user_profile_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT id FROM profiles WHERE user_id = auth.uid();
$$;

-- Returns true if the current user is head_master of the given dojo
CREATE OR REPLACE FUNCTION is_head_master_of(target_dojo_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND dojo_id = target_dojo_id
    AND role = 'head_master'
  );
$$;

-- ============================================================================
-- 2. FIX PROFILES (003) — Replace self-referential UPDATE + HEAD MASTER policies
-- ============================================================================

-- Drop the broken self-referential policies
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Head master manages dojo profiles" ON profiles;

-- Anti-escalation trigger: prevents non-head-master users from changing
-- their own role, grade, or conductor status
CREATE OR REPLACE FUNCTION prevent_self_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- If the update is made by the profile owner (not a head_master acting on someone else)
  IF NEW.user_id = auth.uid() THEN
    -- Block changes to protected fields
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Cannot change own role';
    END IF;
    IF NEW.current_grade IS DISTINCT FROM OLD.current_grade THEN
      RAISE EXCEPTION 'Cannot change own grade';
    END IF;
    IF NEW.can_conduct IS DISTINCT FROM OLD.can_conduct THEN
      RAISE EXCEPTION 'Cannot change own conductor status';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

CREATE TRIGGER profiles_prevent_self_escalation
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION prevent_self_escalation();

-- Recreate UPDATE policy: simple ownership check (trigger handles anti-escalation)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Recreate head master policy using helper function
CREATE POLICY "Head master manages dojo profiles"
  ON profiles FOR ALL
  USING (is_head_master_of(dojo_id));

-- ============================================================================
-- 3. FIX DOJOS (002) — Use helpers instead of direct profile subqueries
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own dojo" ON dojos;
DROP POLICY IF EXISTS "Head master can update dojo" ON dojos;

CREATE POLICY "Users can view their own dojo"
  ON dojos FOR SELECT
  USING (id IN (SELECT get_user_dojo_ids()));

CREATE POLICY "Head master can update dojo"
  ON dojos FOR UPDATE
  USING (is_head_master_of(id));

-- ============================================================================
-- 4. FIX SECRETARY PERMISSIONS (004)
-- ============================================================================

DROP POLICY IF EXISTS "Secretaries can view own permissions" ON secretary_permissions;
DROP POLICY IF EXISTS "Head master manages secretary permissions" ON secretary_permissions;

CREATE POLICY "Secretaries can view own permissions"
  ON secretary_permissions FOR SELECT
  USING (profile_id IN (SELECT get_user_profile_ids()));

CREATE POLICY "Head master manages secretary permissions"
  ON secretary_permissions FOR ALL
  USING (is_head_master_of(dojo_id));

-- ============================================================================
-- 5. FIX EXAM REQUIREMENTS (005)
-- ============================================================================

DROP POLICY IF EXISTS "Dojo members can view exam requirements" ON exam_requirements;
DROP POLICY IF EXISTS "Head master manages exam requirements" ON exam_requirements;

CREATE POLICY "Dojo members can view exam requirements"
  ON exam_requirements FOR SELECT
  USING (dojo_id IN (SELECT get_user_dojo_ids()));

CREATE POLICY "Head master manages exam requirements"
  ON exam_requirements FOR ALL
  USING (is_head_master_of(dojo_id));

-- ============================================================================
-- 6. FIX CALENDAR (006)
-- ============================================================================

-- Lesson templates
DROP POLICY IF EXISTS "Dojo members can view lesson templates" ON lesson_templates;
DROP POLICY IF EXISTS "Head master manages lesson templates" ON lesson_templates;

CREATE POLICY "Dojo members can view lesson templates"
  ON lesson_templates FOR SELECT
  USING (dojo_id IN (SELECT get_user_dojo_ids()));

CREATE POLICY "Head master manages lesson templates"
  ON lesson_templates FOR ALL
  USING (is_head_master_of(dojo_id));

-- Suspension periods
DROP POLICY IF EXISTS "Dojo members can view suspensions" ON suspension_periods;
DROP POLICY IF EXISTS "Head master manages suspensions" ON suspension_periods;

CREATE POLICY "Dojo members can view suspensions"
  ON suspension_periods FOR SELECT
  USING (dojo_id IN (SELECT get_user_dojo_ids()));

CREATE POLICY "Head master manages suspensions"
  ON suspension_periods FOR ALL
  USING (is_head_master_of(dojo_id));

-- Events
DROP POLICY IF EXISTS "Dojo members can view events" ON events;
DROP POLICY IF EXISTS "Head master manages events" ON events;

CREATE POLICY "Dojo members can view events"
  ON events FOR SELECT
  USING (dojo_id IN (SELECT get_user_dojo_ids()));

CREATE POLICY "Head master manages events"
  ON events FOR ALL
  USING (is_head_master_of(dojo_id));

-- Event grade exceptions
DROP POLICY IF EXISTS "Dojo members can view grade exceptions" ON event_grade_exceptions;
DROP POLICY IF EXISTS "Head master manages grade exceptions" ON event_grade_exceptions;

CREATE POLICY "Dojo members can view grade exceptions"
  ON event_grade_exceptions FOR SELECT
  USING (
    event_id IN (
      SELECT e.id FROM events e
      WHERE e.dojo_id IN (SELECT get_user_dojo_ids())
    )
  );

CREATE POLICY "Head master manages grade exceptions"
  ON event_grade_exceptions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = event_grade_exceptions.event_id
      AND is_head_master_of(e.dojo_id)
    )
  );

-- ============================================================================
-- 7. FIX ATTENDANCES (007)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own attendance" ON attendances;
DROP POLICY IF EXISTS "Users can register own attendance" ON attendances;
DROP POLICY IF EXISTS "Head master manages dojo attendance" ON attendances;
DROP POLICY IF EXISTS "Secretary with permission can view attendance" ON attendances;
DROP POLICY IF EXISTS "Secretary with permission can confirm attendance" ON attendances;

CREATE POLICY "Users can view own attendance"
  ON attendances FOR SELECT
  USING (profile_id IN (SELECT get_user_profile_ids()));

CREATE POLICY "Users can register own attendance"
  ON attendances FOR INSERT
  WITH CHECK (
    profile_id IN (SELECT get_user_profile_ids())
    AND status = 'registered'
    AND event_role = 'participant'
  );

CREATE POLICY "Head master manages dojo attendance"
  ON attendances FOR ALL
  USING (is_head_master_of(dojo_id));

CREATE POLICY "Secretary with permission can view attendance"
  ON attendances FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM secretary_permissions sp
    WHERE sp.profile_id IN (SELECT get_user_profile_ids())
    AND sp.dojo_id = attendances.dojo_id
    AND sp.can_view_all_attendance = true
  ));

CREATE POLICY "Secretary with permission can confirm attendance"
  ON attendances FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM secretary_permissions sp
    WHERE sp.profile_id IN (SELECT get_user_profile_ids())
    AND sp.dojo_id = attendances.dojo_id
    AND sp.can_confirm_attendance = true
  ));

-- Grade history
DROP POLICY IF EXISTS "Users can view own grade history" ON grade_history;
DROP POLICY IF EXISTS "Head master manages grade history" ON grade_history;

CREATE POLICY "Users can view own grade history"
  ON grade_history FOR SELECT
  USING (profile_id IN (SELECT get_user_profile_ids()));

CREATE POLICY "Head master manages grade history"
  ON grade_history FOR ALL
  USING (is_head_master_of(dojo_id));

-- ============================================================================
-- 8. FIX JOURNALS & RESOURCES (008)
-- ============================================================================

DROP POLICY IF EXISTS "Users can manage own journals" ON journals;
DROP POLICY IF EXISTS "Head master can view all journals" ON journals;

CREATE POLICY "Users can manage own journals"
  ON journals FOR ALL
  USING (profile_id IN (SELECT get_user_profile_ids()));

CREATE POLICY "Head master can view all journals"
  ON journals FOR SELECT
  USING (is_head_master_of(dojo_id));

-- Resources
DROP POLICY IF EXISTS "Users can view didactic resources" ON resources;
DROP POLICY IF EXISTS "Users can manage own personal resources" ON resources;
DROP POLICY IF EXISTS "Head master manages didactic resources" ON resources;

CREATE POLICY "Users can view didactic resources"
  ON resources FOR SELECT
  USING (
    type = 'didactic'
    AND dojo_id IN (SELECT get_user_dojo_ids())
  );

CREATE POLICY "Users can manage own personal resources"
  ON resources FOR ALL
  USING (
    type = 'personal'
    AND created_by IN (SELECT get_user_profile_ids())
  );

CREATE POLICY "Head master manages didactic resources"
  ON resources FOR ALL
  USING (
    type = 'didactic'
    AND is_head_master_of(dojo_id)
  );

-- Glossary
DROP POLICY IF EXISTS "Dojo members can view glossary" ON glossary_entries;
DROP POLICY IF EXISTS "Head master manages glossary" ON glossary_entries;

CREATE POLICY "Dojo members can view glossary"
  ON glossary_entries FOR SELECT
  USING (dojo_id IN (SELECT get_user_dojo_ids()));

CREATE POLICY "Head master manages glossary"
  ON glossary_entries FOR ALL
  USING (is_head_master_of(dojo_id));

-- ============================================================================
-- 9. FIX PROJECTS & WORKSHOPS (009)
-- ============================================================================

DROP POLICY IF EXISTS "Dojo members can view projects" ON projects;
DROP POLICY IF EXISTS "Head master manages projects" ON projects;

CREATE POLICY "Dojo members can view projects"
  ON projects FOR SELECT
  USING (
    dojo_id IN (SELECT get_user_dojo_ids())
    AND is_active = true
  );

CREATE POLICY "Head master manages projects"
  ON projects FOR ALL
  USING (is_head_master_of(dojo_id));

-- Project members
DROP POLICY IF EXISTS "Members can view own enrollment" ON project_members;
DROP POLICY IF EXISTS "Head master manages project members" ON project_members;

CREATE POLICY "Members can view own enrollment"
  ON project_members FOR SELECT
  USING (profile_id IN (SELECT get_user_profile_ids()));

CREATE POLICY "Head master manages project members"
  ON project_members FOR ALL
  USING (EXISTS (
    SELECT 1 FROM projects pr
    WHERE pr.id = project_members.project_id
    AND is_head_master_of(pr.dojo_id)
  ));

-- Project grade exceptions
DROP POLICY IF EXISTS "Dojo members can view project grade exceptions" ON project_grade_exceptions;
DROP POLICY IF EXISTS "Head master manages project grade exceptions" ON project_grade_exceptions;

CREATE POLICY "Dojo members can view project grade exceptions"
  ON project_grade_exceptions FOR SELECT
  USING (
    project_id IN (
      SELECT pr.id FROM projects pr
      WHERE pr.dojo_id IN (SELECT get_user_dojo_ids())
    )
  );

CREATE POLICY "Head master manages project grade exceptions"
  ON project_grade_exceptions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM projects pr
    WHERE pr.id = project_grade_exceptions.project_id
    AND is_head_master_of(pr.dojo_id)
  ));

-- Communications
DROP POLICY IF EXISTS "Dojo members can view published communications" ON communications;
DROP POLICY IF EXISTS "Head master manages communications" ON communications;

CREATE POLICY "Dojo members can view published communications"
  ON communications FOR SELECT
  USING (
    dojo_id IN (SELECT get_user_dojo_ids())
    AND is_draft = false
  );

CREATE POLICY "Head master manages communications"
  ON communications FOR ALL
  USING (is_head_master_of(dojo_id));

-- ============================================================================
-- ROLLBACK:
-- DROP TRIGGER IF EXISTS profiles_prevent_self_escalation ON profiles;
-- DROP FUNCTION IF EXISTS prevent_self_escalation();
-- DROP FUNCTION IF EXISTS is_head_master_of(uuid);
-- DROP FUNCTION IF EXISTS get_user_profile_ids();
-- NOTE: After rollback, re-run migrations 002-009 to restore original policies
-- ============================================================================
