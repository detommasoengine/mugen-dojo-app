import { describe, it, expect } from 'vitest';
import { AIKIKAI_EXAM_REQUIREMENTS } from './examRequirements';
import { checkExamEligibility } from './examEligibility';

describe('AIKIKAI_EXAM_REQUIREMENTS', () => {
  it('matches official Aikikai defaults for kyu and dan', () => {
    expect(AIKIKAI_EXAM_REQUIREMENTS.kyu_4).toMatchObject({ minHours: 60, minMonths: 3 });
    expect(AIKIKAI_EXAM_REQUIREMENTS.kyu_1).toMatchObject({ minHours: 120, minMonths: 5 });
    expect(AIKIKAI_EXAM_REQUIREMENTS.dan_1).toMatchObject({ minHours: 200, minMonths: 12, minAge: 15 });
    expect(AIKIKAI_EXAM_REQUIREMENTS.dan_5?.nominationOnly).toBe(true);
  });
});

describe('checkExamEligibility', () => {
  it('is eligible when hours and months are met', () => {
    const r = checkExamEligibility({
      currentGrade: 'kyu_5',
      accumulatedHours: 70,
      monthsSinceLastGrade: 4,
    });
    expect(r.targetGrade).toBe('kyu_4');
    expect(r.eligible).toBe(true);
    expect(r.missingHours).toBe(0);
    expect(r.missingMonths).toBe(0);
  });

  it('reports missing hours and months', () => {
    const r = checkExamEligibility({
      currentGrade: 'kyu_5',
      accumulatedHours: 40,
      monthsSinceLastGrade: 1,
    });
    expect(r.eligible).toBe(false);
    expect(r.missingHours).toBe(20); // 60 - 40
    expect(r.missingMonths).toBe(2); // 3 - 1
  });

  it('enforces minimum age for dan_1', () => {
    const base = { currentGrade: 'kyu_1' as const, accumulatedHours: 250, monthsSinceLastGrade: 24 };
    expect(checkExamEligibility({ ...base, ageYears: 14 }).eligible).toBe(false);
    expect(checkExamEligibility({ ...base, ageYears: 16 }).eligible).toBe(true);
  });

  it('flags nomination-only grades as not exam-eligible', () => {
    const r = checkExamEligibility({
      currentGrade: 'dan_4',
      accumulatedHours: 99999,
      monthsSinceLastGrade: 999,
    });
    expect(r.targetGrade).toBe('dan_5');
    expect(r.nominationOnly).toBe(true);
    expect(r.eligible).toBe(false);
  });

  it('returns no target at the top grade', () => {
    const r = checkExamEligibility({
      currentGrade: 'dan_7',
      accumulatedHours: 99999,
      monthsSinceLastGrade: 999,
    });
    expect(r.targetGrade).toBeNull();
    expect(r.eligible).toBe(false);
  });

  it('allows per-dojo requirement overrides', () => {
    const r = checkExamEligibility({
      currentGrade: 'kyu_5',
      accumulatedHours: 30,
      monthsSinceLastGrade: 2,
      requirements: { kyu_4: { grade: 'kyu_4', minHours: 30, minMonths: 2 } },
    });
    expect(r.eligible).toBe(true);
  });
});
