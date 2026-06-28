import { z } from 'zod';
import type {
  UserRole, GradeType, EventType, AttendanceMethod, AttendanceStatus, EventRole,
} from '../database.types';

/**
 * Zod enums mirroring the DB enums (migration 20260412001_create_enums).
 * The `satisfies` guards make the build fail if a tuple drifts from the
 * corresponding TS union in database.types.
 */
export const userRoleSchema = z.enum(
  ['head_master', 'secretary', 'aikidoka'] satisfies readonly UserRole[] as [UserRole, ...UserRole[]],
);

export const gradeTypeSchema = z.enum(
  [
    'none',
    'kyu_6', 'kyu_5', 'kyu_4', 'kyu_3', 'kyu_2', 'kyu_1',
    'dan_1', 'dan_2', 'dan_3', 'dan_4', 'dan_5', 'dan_6', 'dan_7',
  ] satisfies readonly GradeType[] as [GradeType, ...GradeType[]],
);

export const eventTypeSchema = z.enum(
  ['lesson', 'lesson_extra', 'stage', 'exam', 'workshop', 'gathering'] satisfies readonly EventType[] as [EventType, ...EventType[]],
);

export const attendanceMethodSchema = z.enum(
  ['roll_call', 'qr_code', 'direct_entry'] satisfies readonly AttendanceMethod[] as [AttendanceMethod, ...AttendanceMethod[]],
);

export const attendanceStatusSchema = z.enum(
  ['registered', 'confirmed', 'rejected'] satisfies readonly AttendanceStatus[] as [AttendanceStatus, ...AttendanceStatus[]],
);

export const eventRoleSchema = z.enum(
  ['participant', 'conductor'] satisfies readonly EventRole[] as [EventRole, ...EventRole[]],
);
