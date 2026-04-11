-- Migration: 20260412_008_create_journals_resources
-- Description: Personal journals (Diario di Bordo) and study resources
-- Reference: docs/business/06-risorse-studio-ai.md

-- Journals (Diario di Bordo)
CREATE TABLE IF NOT EXISTS journals (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  dojo_id         uuid NOT NULL REFERENCES dojos(id) ON DELETE CASCADE,

  title           text,
  content         text NOT NULL,
  entry_date      date NOT NULL DEFAULT CURRENT_DATE,

  -- Optional link to an event
  event_id        uuid REFERENCES events(id),

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_journals_profile ON journals(profile_id, entry_date DESC);

CREATE TRIGGER journals_updated_at
  BEFORE UPDATE ON journals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Study resources
CREATE TABLE IF NOT EXISTS resources (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dojo_id         uuid NOT NULL REFERENCES dojos(id) ON DELETE CASCADE,
  created_by      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  type            resource_type NOT NULL,
  title           text NOT NULL,
  description     text,
  url             text,                -- External link
  file_path       text,                -- Supabase Storage path
  mime_type       text,

  -- Optional grade association (e.g., material for 3rd Kyu preparation)
  target_grade    grade_type,

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_resources_dojo_type ON resources(dojo_id, type);
CREATE INDEX idx_resources_created_by ON resources(created_by);

CREATE TRIGGER resources_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Glossary entries (managed by Sensei, consultable by all)
CREATE TABLE IF NOT EXISTS glossary_entries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dojo_id         uuid NOT NULL REFERENCES dojos(id) ON DELETE CASCADE,

  term            text NOT NULL,
  reading         text,                 -- Japanese reading (romaji)
  definition      text NOT NULL,
  category        text,                 -- e.g., "technique", "philosophy", "etiquette", "weapon"
  min_grade       grade_type,           -- Minimum grade to see this entry (progressive disclosure)

  sort_order      integer DEFAULT 0,

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  UNIQUE (dojo_id, term)
);

CREATE INDEX idx_glossary_dojo ON glossary_entries(dojo_id, category);

CREATE TRIGGER glossary_entries_updated_at
  BEFORE UPDATE ON glossary_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE glossary_entries ENABLE ROW LEVEL SECURITY;

-- Journals: only own
CREATE POLICY "Users can manage own journals"
  ON journals FOR ALL
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Head master can view all journals in dojo
CREATE POLICY "Head master can view all journals"
  ON journals FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid() AND p.dojo_id = journals.dojo_id AND p.role = 'head_master'
  ));

-- Resources: didactic visible to all dojo members, personal only to owner
CREATE POLICY "Users can view didactic resources"
  ON resources FOR SELECT
  USING (
    type = 'didactic'
    AND dojo_id IN (SELECT p.dojo_id FROM profiles p WHERE p.user_id = auth.uid())
  );

CREATE POLICY "Users can manage own personal resources"
  ON resources FOR ALL
  USING (
    type = 'personal'
    AND created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Head master manages didactic resources"
  ON resources FOR ALL
  USING (
    type = 'didactic'
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() AND p.dojo_id = resources.dojo_id AND p.role = 'head_master'
    )
  );

-- Glossary: all dojo members can read
CREATE POLICY "Dojo members can view glossary"
  ON glossary_entries FOR SELECT
  USING (dojo_id IN (SELECT p.dojo_id FROM profiles p WHERE p.user_id = auth.uid()));

CREATE POLICY "Head master manages glossary"
  ON glossary_entries FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid() AND p.dojo_id = glossary_entries.dojo_id AND p.role = 'head_master'
  ));

-- ROLLBACK:
-- DROP TABLE IF EXISTS glossary_entries CASCADE;
-- DROP TABLE IF EXISTS resources CASCADE;
-- DROP TABLE IF EXISTS journals CASCADE;
