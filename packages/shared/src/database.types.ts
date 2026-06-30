/**
 * Adapter over the Supabase-generated types (`database.generated.ts`).
 * Re-exports `Database`/`Json` plus named aliases so `business/` and
 * `validators/` don't depend on the generated file's shape directly.
 * Regenerate the source with `pnpm run db:types`; this file should not
 * need to change unless an alias is added/removed.
 */

import type { Database as GeneratedDatabase, Json as GeneratedJson, Tables } from './database.generated';

export type Json = GeneratedJson;
export type Database = GeneratedDatabase;

// ─── Enums ────────────────────────────────────────────────────────────────────

export type UserRole = Database['public']['Enums']['user_role'];
export type GradeType = Database['public']['Enums']['grade_type'];
export type EventType = Database['public']['Enums']['event_type'];
export type AttendanceMethod = Database['public']['Enums']['attendance_method'];
export type AttendanceStatus = Database['public']['Enums']['attendance_status'];
export type EventRole = Database['public']['Enums']['event_role'];
export type ExamOutcome = Database['public']['Enums']['exam_outcome'];
export type ResourceType = Database['public']['Enums']['resource_type'];
export type AccessLevel = Database['public']['Enums']['access_level'];
export type WorkshopFrequency = Database['public']['Enums']['workshop_frequency'];

// ─── Table Row Types ───────────────────────────────────────────────────────────

export type Dojo = Tables<'dojos'>;
export type Profile = Tables<'profiles'>;
export type Event = Tables<'events'>;
export type Attendance = Tables<'attendances'>;
export type Project = Tables<'projects'>;
