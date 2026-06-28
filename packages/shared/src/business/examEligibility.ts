import type { GradeType } from '../database.types';
import { nextGrade } from './grades';
import { AIKIKAI_EXAM_REQUIREMENTS, type ExamRequirement } from './examRequirements';

export interface EligibilityInput {
  currentGrade: GradeType;
  accumulatedHours: number;
  monthsSinceLastGrade: number;
  ageYears?: number;
  /** Per-Dojo overrides; fall back to Aikikai defaults when absent. */
  requirements?: Partial<Record<GradeType, ExamRequirement>>;
}

export interface EligibilityResult {
  targetGrade: GradeType | null;
  eligible: boolean;
  nominationOnly: boolean;
  missingHours: number;
  missingMonths: number;
  ageMet: boolean;
  reasons: string[];
}

/**
 * Verify whether an Aikidoka meets the requirements to sit the exam for their
 * next grade. Returns missing hours/months and a human-readable reason list.
 */
export function checkExamEligibility(input: EligibilityInput): EligibilityResult {
  const target = nextGrade(input.currentGrade);
  const reasons: string[] = [];

  if (target === null) {
    return {
      targetGrade: null,
      eligible: false,
      nominationOnly: false,
      missingHours: 0,
      missingMonths: 0,
      ageMet: true,
      reasons: ['Grado massimo raggiunto'],
    };
  }

  const req = input.requirements?.[target] ?? AIKIKAI_EXAM_REQUIREMENTS[target];

  if (!req) {
    return {
      targetGrade: target,
      eligible: false,
      nominationOnly: false,
      missingHours: 0,
      missingMonths: 0,
      ageMet: true,
      reasons: ['Nessun requisito definito per il grado'],
    };
  }

  if (req.nominationOnly) {
    return {
      targetGrade: target,
      eligible: false,
      nominationOnly: true,
      missingHours: 0,
      missingMonths: 0,
      ageMet: true,
      reasons: ['Grado conferito per nomina diretta, non per esame'],
    };
  }

  const missingHours = Math.max(0, req.minHours - input.accumulatedHours);
  const missingMonths = Math.max(0, req.minMonths - input.monthsSinceLastGrade);
  const ageMet = req.minAge === undefined || (input.ageYears ?? 0) >= req.minAge;

  if (missingHours > 0) reasons.push(`Mancano ${missingHours} ore`);
  if (missingMonths > 0) reasons.push(`Mancano ${missingMonths} mesi`);
  if (!ageMet) reasons.push(`Età minima ${req.minAge} anni non raggiunta`);

  const eligible = missingHours === 0 && missingMonths === 0 && ageMet;
  if (eligible) reasons.push('Requisiti soddisfatti');

  return {
    targetGrade: target,
    eligible,
    nominationOnly: false,
    missingHours,
    missingMonths,
    ageMet,
    reasons,
  };
}
