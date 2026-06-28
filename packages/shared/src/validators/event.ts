import { z } from 'zod';
import { eventTypeSchema, gradeTypeSchema } from './enums';
import { gradeIndex } from '../business/grades';

/**
 * Event creation (lesson/stage/exam/workshop...). Mirrors `events`
 * (migration 006) and enforces invariants the DB checks individually.
 */
export const eventCreateSchema = z
  .object({
    dojo_id: z.string().uuid(),
    type: eventTypeSchema,
    title: z.string().min(1, 'Titolo obbligatorio'),
    description: z.string().optional(),
    location: z.string().optional(),
    starts_at: z.string().datetime({ offset: true }),
    ends_at: z.string().datetime({ offset: true }),
    duration_hours: z.number().positive('La durata deve essere maggiore di zero'),
    event_weight: z.number().min(0).default(1),
    instructor_name: z.string().optional(),
    conductor_profile_id: z.string().uuid().optional(),
    grade_filter_min: gradeTypeSchema.optional(),
    grade_filter_max: gradeTypeSchema.optional(),
    exam_target_grade: gradeTypeSchema.optional(),
  })
  .refine((e) => new Date(e.ends_at) > new Date(e.starts_at), {
    message: 'La fine deve essere successiva all’inizio',
    path: ['ends_at'],
  })
  .refine(
    (e) =>
      e.grade_filter_min === undefined ||
      e.grade_filter_max === undefined ||
      gradeIndex(e.grade_filter_min) <= gradeIndex(e.grade_filter_max),
    { message: 'Il grado minimo non può superare il massimo', path: ['grade_filter_min'] },
  );

export type EventCreateInput = z.infer<typeof eventCreateSchema>;
