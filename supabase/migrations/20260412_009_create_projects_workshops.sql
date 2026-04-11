-- Migration: 20260412_009_create_projects_workshops
-- Description: Internal dojo projects and workshops (Laboratori)
-- Reference: docs/business/07-domande-stakeholder.md (section H)

-- Projects (Corsi, attività collaterali)
CREATE TABLE IF NOT EXISTS projects (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dojo_id         uuid NOT NULL REFERENCES dojos(id) ON DELETE CASCADE,

  name            text NOT NULL,
  description     text,
  is_main_course  boolean NOT NULL DEFAULT false,  -- The Aikido course itself

  -- Access control
  access_level    access_level NOT NULL DEFAULT 'dojo_members',
  grade_filter_min  grade_type,
  grade_filter_max  grade_type,

  -- Responsible person
  responsible_profile_id  uuid REFERENCES profiles(id),
  external_responsible    text,  -- For external instructors

  is_active       boolean NOT NULL DEFAULT true,

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_projects_dojo ON projects(dojo_id, is_active);

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Project memberships (who is enrolled in a project)
CREATE TABLE IF NOT EXISTS project_members (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  profile_id      uuid REFERENCES profiles(id) ON DELETE CASCADE,

  -- For external participants (not dojo members)
  external_name   text,
  external_email  text,

  enrolled_by     uuid NOT NULL REFERENCES profiles(id),  -- Must be head_master
  enrolled_at     timestamptz NOT NULL DEFAULT now(),
  is_active       boolean NOT NULL DEFAULT true,

  UNIQUE (project_id, profile_id)
);

-- Project grade exceptions
CREATE TABLE IF NOT EXISTS project_grade_exceptions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  profile_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  granted_by      uuid NOT NULL REFERENCES profiles(id),
  created_at      timestamptz NOT NULL DEFAULT now(),

  UNIQUE (project_id, profile_id)
);

-- Add FK from events to projects (deferred from migration 006)
ALTER TABLE events
  ADD CONSTRAINT fk_events_project
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;

-- Communications
CREATE TABLE IF NOT EXISTS communications (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dojo_id         uuid NOT NULL REFERENCES dojos(id) ON DELETE CASCADE,
  sent_by         uuid NOT NULL REFERENCES profiles(id),

  title           text NOT NULL,
  body            text NOT NULL,
  target_audience text NOT NULL DEFAULT 'all',  -- 'all', 'grade:kyu_3+', 'project:uuid', etc.

  published_at    timestamptz,
  is_draft        boolean NOT NULL DEFAULT true,

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_communications_dojo ON communications(dojo_id, published_at DESC);

CREATE TRIGGER communications_updated_at
  BEFORE UPDATE ON communications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_grade_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;

-- Projects: dojo members can view active projects
CREATE POLICY "Dojo members can view projects"
  ON projects FOR SELECT
  USING (
    dojo_id IN (SELECT p.dojo_id FROM profiles p WHERE p.user_id = auth.uid())
    AND is_active = true
  );

CREATE POLICY "Head master manages projects"
  ON projects FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid() AND p.dojo_id = projects.dojo_id AND p.role = 'head_master'
  ));

-- Project members: visible to enrolled members and head master
CREATE POLICY "Members can view own enrollment"
  ON project_members FOR SELECT
  USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Head master manages project members"
  ON project_members FOR ALL
  USING (EXISTS (
    SELECT 1 FROM projects pr
    JOIN profiles p ON p.dojo_id = pr.dojo_id
    WHERE pr.id = project_members.project_id
    AND p.user_id = auth.uid()
    AND p.role = 'head_master'
  ));

-- Project grade exceptions
CREATE POLICY "Dojo members can view project grade exceptions"
  ON project_grade_exceptions FOR SELECT
  USING (
    project_id IN (
      SELECT pr.id FROM projects pr
      WHERE pr.dojo_id IN (SELECT p.dojo_id FROM profiles p WHERE p.user_id = auth.uid())
    )
  );

CREATE POLICY "Head master manages project grade exceptions"
  ON project_grade_exceptions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM projects pr
    JOIN profiles p ON p.dojo_id = pr.dojo_id
    WHERE pr.id = project_grade_exceptions.project_id
    AND p.user_id = auth.uid()
    AND p.role = 'head_master'
  ));

-- Communications: dojo members can read published
CREATE POLICY "Dojo members can view published communications"
  ON communications FOR SELECT
  USING (
    dojo_id IN (SELECT p.dojo_id FROM profiles p WHERE p.user_id = auth.uid())
    AND is_draft = false
  );

CREATE POLICY "Head master manages communications"
  ON communications FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid() AND p.dojo_id = communications.dojo_id AND p.role = 'head_master'
  ));

-- ROLLBACK:
-- DROP TABLE IF EXISTS communications CASCADE;
-- DROP TABLE IF EXISTS project_grade_exceptions CASCADE;
-- DROP TABLE IF EXISTS project_members CASCADE;
-- ALTER TABLE events DROP CONSTRAINT IF EXISTS fk_events_project;
-- DROP TABLE IF EXISTS projects CASCADE;
