import { z } from 'zod';
import { userRoleSchema, gradeTypeSchema } from './enums';

const bookletTypeSchema = z.enum(['green', 'blue', 'national']);

/**
 * Profile creation (Caposcuola/Segretario crea l'Aikidoka).
 * Mirrors `profiles` (migration 003) with form-facing defaults.
 */
export const profileCreateSchema = z.object({
  user_id: z.string().uuid(),
  dojo_id: z.string().uuid(),
  first_name: z.string().min(1, 'Nome obbligatorio'),
  last_name: z.string().min(1, 'Cognome obbligatorio'),
  date_of_birth: z.string().date().optional(),
  phone: z.string().optional(),
  photo_url: z.string().url().optional(),
  role: userRoleSchema.default('aikidoka'),
  current_grade: gradeTypeSchema.default('none'),
  enrollment_date: z.string().date().optional(),
  can_conduct: z.boolean().default(false),
  medical_cert_expiry: z.string().date().optional(),
  booklet_type: bookletTypeSchema.default('green'),
});

export type ProfileCreateInput = z.infer<typeof profileCreateSchema>;

/** Partial update; identity and role/grade escalation are guarded by RLS. */
export const profileUpdateSchema = profileCreateSchema
  .omit({ user_id: true, dojo_id: true })
  .partial();

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
