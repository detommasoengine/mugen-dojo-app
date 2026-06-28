/**
 * Database type definitions for MugenDojo.
 *
 * NOTE: This file is a hand-written stub. Once the Supabase project is created
 * and the CLI is configured, replace this with the auto-generated version:
 *   pnpm run db:types
 * which runs: supabase gen types typescript --project-id <id> > packages/shared/src/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ─── Enums ────────────────────────────────────────────────────────────────────

export type UserRole = 'head_master' | 'secretary' | 'aikidoka' | 'guest';
export type GradeType =
  | 'none'
  | 'kyu_6' | 'kyu_5' | 'kyu_4' | 'kyu_3' | 'kyu_2' | 'kyu_1'
  | 'dan_1' | 'dan_2' | 'dan_3' | 'dan_4' | 'dan_5' | 'dan_6' | 'dan_7';
export type EventType =
  | 'lesson' | 'lesson_extra' | 'stage' | 'exam' | 'workshop' | 'gathering';
export type AttendanceMethod = 'roll_call' | 'qr_code' | 'direct_entry';
export type AttendanceStatus = 'registered' | 'confirmed' | 'rejected';
export type EventRole = 'participant' | 'conductor';
export type ExamOutcome = 'passed' | 'failed' | 'nomination';
export type ResourceType = 'didactic' | 'personal';
export type AccessLevel = 'public' | 'dojo_members' | 'filtered';
export type WorkshopFrequency = 'one_time' | 'periodic' | 'fundamental';

// ─── Table Row Types ───────────────────────────────────────────────────────────

export interface Dojo {
  id: string;
  name: string;
  address: string | null;
  federation: string;
  academic_year_start_month: number;
  academic_year_start_day: number;
  academic_year_end_month: number;
  academic_year_end_day: number;
  default_event_weight: number;
  conductor_weight: number;
  require_attendance_confirmation: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  dojo_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  phone: string | null;
  photo_url: string | null;
  role: UserRole;
  current_grade: GradeType;
  enrollment_date: string;
  can_conduct: boolean;
  is_guest: boolean;
  medical_cert_expiry: string | null;
  medical_cert_file_path: string | null;
  booklet_type: 'green' | 'blue' | 'national' | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  dojo_id: string;
  title: string;
  description: string | null;
  event_type: EventType;
  start_at: string;
  end_at: string;
  location: string | null;
  event_weight: number;
  is_cancelled: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: string;
  event_id: string;
  profile_id: string;
  dojo_id: string;
  method: AttendanceMethod;
  status: AttendanceStatus;
  event_role: EventRole;
  weighted_hours: number;
  notes: string | null;
  recorded_at: string;
  confirmed_by: string | null;
  confirmed_at: string | null;
}

export interface Project {
  id: string;
  dojo_id: string;
  title: string;
  description: string | null;
  access_level: AccessLevel;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// ─── Database Schema (for createClient generics) ────────────────────────────

export interface Database {
  public: {
    Tables: {
      dojos: { Row: Dojo; Insert: Partial<Dojo>; Update: Partial<Dojo> };
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      events: { Row: Event; Insert: Partial<Event>; Update: Partial<Event> };
      attendances: { Row: Attendance; Insert: Partial<Attendance>; Update: Partial<Attendance> };
      projects: { Row: Project; Insert: Partial<Project>; Update: Partial<Project> };
    };
    Views: Record<string, never>;
    Functions: {
      get_user_dojo_ids: { Args: Record<string, never>; Returns: string[] };
    };
    Enums: {
      user_role: UserRole;
      grade_type: GradeType;
      event_type: EventType;
      attendance_method: AttendanceMethod;
      attendance_status: AttendanceStatus;
      event_role: EventRole;
      exam_outcome: ExamOutcome;
      resource_type: ResourceType;
      access_level: AccessLevel;
      workshop_frequency: WorkshopFrequency;
    };
  };
}
