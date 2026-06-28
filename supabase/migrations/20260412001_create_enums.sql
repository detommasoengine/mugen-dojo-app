-- Migration: 20260412_001_create_enums
-- Description: Create all enum types for the MugenDojo domain
-- Reference: docs/business/02-modello-dominio.md, docs/business/03-attori-ruoli.md

-- User roles in the dojo hierarchy
CREATE TYPE user_role AS ENUM (
  'head_master',   -- Caposcuola (Sensei) — full admin
  'secretary',     -- Segretario (Senpai) — delegated admin with granular permissions
  'aikidoka'       -- Aikidoka (Studente) — standard user
);

-- Grade types (Kyu descending, Dan ascending)
CREATE TYPE grade_type AS ENUM (
  'none',          -- No grade (beginner)
  'kyu_6', 'kyu_5', 'kyu_4', 'kyu_3', 'kyu_2', 'kyu_1',
  'dan_1', 'dan_2', 'dan_3', 'dan_4',
  'dan_5', 'dan_6', 'dan_7'  -- 5+ Dan: nomination only
);

-- Event types
CREATE TYPE event_type AS ENUM (
  'lesson',        -- Regular weekly lesson
  'lesson_extra',  -- Extended lesson (exception)
  'stage',         -- Seminar / workshop with external instructor
  'exam',          -- Kyu/Dan examination session
  'workshop',      -- Laboratorio (practical activity within a project)
  'gathering'      -- Raduno (official gathering: Easter, autumn, Ki no Renma)
);

-- Attendance registration method
CREATE TYPE attendance_method AS ENUM (
  'roll_call',     -- Appello
  'qr_code',       -- QR code scan (requires admin confirmation)
  'direct_entry'   -- Direct entry by admin/secretary
);

-- Attendance status
CREATE TYPE attendance_status AS ENUM (
  'registered',    -- Self-registered, pending confirmation
  'confirmed',     -- Confirmed by admin/secretary
  'rejected'       -- Rejected by admin/secretary
);

-- Role in event (for weighted hours calculation)
CREATE TYPE event_role AS ENUM (
  'participant',   -- Standard participant
  'conductor'      -- Senpai conducting the lesson (weighted hours)
);

-- Exam outcome
CREATE TYPE exam_outcome AS ENUM (
  'passed',
  'failed',
  'nomination'     -- For Dan 5+ (direct nomination)
);

-- Resource type
CREATE TYPE resource_type AS ENUM (
  'didactic',      -- Created by Sensei/Secretary — shared material
  'personal'       -- Created by Aikidoka — personal notes
);

-- Project access level
CREATE TYPE access_level AS ENUM (
  'public',        -- Open to everyone (including external)
  'dojo_members',  -- Only dojo members
  'filtered'       -- Filtered by grade/criteria
);

-- Workshop frequency (reserved for future workshops table — not used by any column yet)
CREATE TYPE workshop_frequency AS ENUM (
  'one_time',      -- Occasionale
  'periodic',      -- Periodico
  'fundamental'    -- Fondamentale (mandatory for the project path)
);

-- ROLLBACK:
-- DROP TYPE IF EXISTS workshop_frequency, access_level, resource_type,
--   exam_outcome, event_role, attendance_status, attendance_method,
--   event_type, grade_type, user_role CASCADE;
