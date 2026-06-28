import type { GradeType } from '../database.types';

/**
 * Grade progression order, from beginner to top.
 * Kyu descend (6→1), Dan ascend (1→7). Index encodes progression.
 */
export const GRADE_ORDER: GradeType[] = [
  'none',
  'kyu_6', 'kyu_5', 'kyu_4', 'kyu_3', 'kyu_2', 'kyu_1',
  'dan_1', 'dan_2', 'dan_3', 'dan_4', 'dan_5', 'dan_6', 'dan_7',
];

/** Position of a grade in the progression (0 = none). */
export function gradeIndex(grade: GradeType): number {
  return GRADE_ORDER.indexOf(grade);
}

/** The grade an Aikidoka can progress to next, or null at the top. */
export function nextGrade(grade: GradeType): GradeType | null {
  const i = gradeIndex(grade);
  if (i < 0 || i >= GRADE_ORDER.length - 1) return null;
  return GRADE_ORDER[i + 1];
}

export function isKyu(grade: GradeType): boolean {
  return grade.startsWith('kyu_');
}

export function isDan(grade: GradeType): boolean {
  return grade.startsWith('dan_');
}
