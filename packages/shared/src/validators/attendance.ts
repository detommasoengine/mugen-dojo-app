import { z } from 'zod';
import { attendanceMethodSchema, attendanceStatusSchema, eventRoleSchema } from './enums';

/**
 * Attendance creation. Mirrors `attendances` (migration 007).
 * weighted_hours is precomputed via business/hours before insert.
 */
export const attendanceCreateSchema = z.object({
  event_id: z.string().uuid(),
  profile_id: z.string().uuid(),
  dojo_id: z.string().uuid(),
  method: attendanceMethodSchema,
  status: attendanceStatusSchema.default('registered'),
  event_role: eventRoleSchema.default('participant'),
  weighted_hours: z.number().min(0),
  notes: z.string().optional(),
});

export type AttendanceCreateInput = z.infer<typeof attendanceCreateSchema>;

/**
 * Manual registration form input (Admin). No weighted_hours — the server
 * computes it from event_weight/conductor_weight before validating with
 * attendanceCreateSchema and inserting.
 */
export const attendanceManualInputSchema = z.object({
  event_id: z.string().uuid(),
  profile_id: z.string().uuid(),
  effective_hours: z.number().positive(),
  method: attendanceMethodSchema,
  event_role: eventRoleSchema.default('participant'),
});

export type AttendanceManualInput = z.infer<typeof attendanceManualInputSchema>;

/** Confirm/reject transition. Excludes 'registered' to block reverting a decision. */
export const attendanceStatusUpdateSchema = z.object({
  status: z.enum(['confirmed', 'rejected']),
  notes: z.string().optional(),
});

export type AttendanceStatusUpdateInput = z.infer<typeof attendanceStatusUpdateSchema>;
