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
