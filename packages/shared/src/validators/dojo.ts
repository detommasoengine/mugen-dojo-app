import { z } from 'zod';

const monthSchema = z.number().int().min(1).max(12);
const daySchema = z.number().int().min(1).max(31);

/**
 * Dojo configuration (weights + academic year). Mirrors the configurable
 * columns on `dojos` (migration 002). Only the Caposcuola can edit (RLS).
 */
export const dojoConfigSchema = z.object({
  default_event_weight: z.number().min(0),
  conductor_weight: z.number().min(0),
  academic_year_start_month: monthSchema,
  academic_year_start_day: daySchema.default(1),
  academic_year_end_month: monthSchema,
  academic_year_end_day: daySchema.default(31),
  require_attendance_confirmation: z.boolean().default(false),
});

export type DojoConfigInput = z.infer<typeof dojoConfigSchema>;
