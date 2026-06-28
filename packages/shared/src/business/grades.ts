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

export type BeltColor =
  | 'white' | 'yellow' | 'orange' | 'green' | 'blue' | 'brown' | 'black';

/**
 * Belt color associated with a grade. Used by the UI (grade chips, the enso
 * Monte Ore gauge). Dan grades are all black; Kyu descend through the colors.
 */
export function gradeBeltColor(grade: GradeType): BeltColor {
  if (isDan(grade)) return 'black';
  switch (grade) {
    case 'none':
    case 'kyu_6':
      return 'white';
    case 'kyu_5':
      return 'yellow';
    case 'kyu_4':
      return 'orange';
    case 'kyu_3':
      return 'green';
    case 'kyu_2':
      return 'blue';
    case 'kyu_1':
      return 'brown';
    default:
      return 'white';
  }
}
