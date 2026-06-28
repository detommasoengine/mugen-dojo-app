import type { GradeType } from '../database.types';

export interface ExamRequirement {
  /** Target grade this requirement unlocks. */
  grade: GradeType;
  minHours: number;
  minMonths: number;
  /** Minimum age in years, if any (e.g. 15 for Shodan). */
  minAge?: number;
  /** True for grades conferred by direct nomination, not by exam (5+ Dan). */
  nominationOnly?: boolean;
}

/**
 * Official Aikikai d'Italia defaults, keyed by TARGET grade.
 * Per-Dojo overrides live in the `exam_requirements` table; these are the
 * fallback when no override exists.
 * Source: docs/business/04-ciclo-vita-aikidoka.md
 */
export const AIKIKAI_EXAM_REQUIREMENTS: Partial<Record<GradeType, ExamRequirement>> = {
  kyu_6: { grade: 'kyu_6', minHours: 20, minMonths: 2 },
  kyu_5: { grade: 'kyu_5', minHours: 20, minMonths: 2 },
  kyu_4: { grade: 'kyu_4', minHours: 60, minMonths: 3 },
  kyu_3: { grade: 'kyu_3', minHours: 90, minMonths: 4 },
  kyu_2: { grade: 'kyu_2', minHours: 100, minMonths: 4 },
  kyu_1: { grade: 'kyu_1', minHours: 120, minMonths: 5 },
  dan_1: { grade: 'dan_1', minHours: 200, minMonths: 12, minAge: 15 },
  dan_2: { grade: 'dan_2', minHours: 500, minMonths: 24 },
  dan_3: { grade: 'dan_3', minHours: 600, minMonths: 36 },
  dan_4: { grade: 'dan_4', minHours: 800, minMonths: 48 },
  dan_5: { grade: 'dan_5', minHours: 0, minMonths: 0, nominationOnly: true },
  dan_6: { grade: 'dan_6', minHours: 0, minMonths: 0, nominationOnly: true },
  dan_7: { grade: 'dan_7', minHours: 0, minMonths: 0, nominationOnly: true },
};
