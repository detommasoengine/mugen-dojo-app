import { describe, it, expect } from 'vitest';
import {
  generateCalendar,
  isSuspended,
  countExpectedSessions,
  academicYearBounds,
  type LessonTemplateInput,
} from './calendar';

// Mon/Wed/Fri 19:00-20:00 (dayOfWeek: 1=Mon, 3=Wed, 5=Fri)
const mwf: LessonTemplateInput[] = [
  { id: 'mon', dayOfWeek: 1, startTime: '19:00', endTime: '20:00', durationHours: 1 },
  { id: 'wed', dayOfWeek: 3, startTime: '19:00', endTime: '20:00', durationHours: 1 },
  { id: 'fri', dayOfWeek: 5, startTime: '19:00', endTime: '20:00', durationHours: 1 },
];

describe('generateCalendar', () => {
  it('emits one occurrence per matching weekday in range', () => {
    // Oct 2026: Mondays 5,12,19,26 → 4 occurrences for the Monday template
    const occ = generateCalendar({ templates: [mwf[0]], suspensions: [], from: '2026-10-01', to: '2026-10-31' });
    expect(occ).toHaveLength(4);
    expect(occ[0]).toMatchObject({ date: '2026-10-05', startTime: '19:00', durationHours: 1, templateId: 'mon' });
  });

  it('counts 13 sessions for Mon/Wed/Fri in October 2026', () => {
    // Oct 1 2026 = Thu. Mon 5,12,19,26 (4); Wed 7,14,21,28 (4); Fri 2,9,16,23,30 (5) = 13
    const occ = generateCalendar({ templates: mwf, suspensions: [], from: '2026-10-01', to: '2026-10-31' });
    expect(occ).toHaveLength(13);
  });

  it('excludes dates inside a suspension period', () => {
    const occ = generateCalendar({
      templates: mwf,
      suspensions: [{ startDate: '2026-10-12', endDate: '2026-10-18' }], // removes Mon 12, Wed 14, Fri 16
      from: '2026-10-01',
      to: '2026-10-31',
    });
    expect(occ).toHaveLength(10); // 13 - 3
    expect(occ.find((o) => o.date === '2026-10-12')).toBeUndefined();
  });

  it('respects template validity window', () => {
    const summer: LessonTemplateInput = { id: 's', dayOfWeek: 1, startTime: '20:00', endTime: '21:00', durationHours: 1, validFrom: '2026-10-15' };
    const occ = generateCalendar({ templates: [summer], suspensions: [], from: '2026-10-01', to: '2026-10-31' });
    // valid from Oct 15 → Mondays 19, 26 only
    expect(occ.map((o) => o.date)).toEqual(['2026-10-19', '2026-10-26']);
  });

  it('skips inactive templates', () => {
    const occ = generateCalendar({ templates: [{ ...mwf[0], isActive: false }], suspensions: [], from: '2026-10-01', to: '2026-10-31' });
    expect(occ).toHaveLength(0);
  });

  it('returns occurrences sorted by date', () => {
    const occ = generateCalendar({ templates: mwf, suspensions: [], from: '2026-10-01', to: '2026-10-09' });
    const dates = occ.map((o) => o.date);
    expect(dates).toEqual([...dates].sort());
  });
});

describe('isSuspended', () => {
  const susp = [{ startDate: '2026-08-01', endDate: '2026-08-31' }];
  it('is true inside the range (inclusive bounds)', () => {
    expect(isSuspended('2026-08-01', susp)).toBe(true);
    expect(isSuspended('2026-08-31', susp)).toBe(true);
    expect(isSuspended('2026-08-15', susp)).toBe(true);
  });
  it('is false outside the range', () => {
    expect(isSuspended('2026-07-31', susp)).toBe(false);
    expect(isSuspended('2026-09-01', susp)).toBe(false);
  });
});

describe('countExpectedSessions', () => {
  it('equals the number of generated occurrences', () => {
    const params = { templates: mwf, suspensions: [{ startDate: '2026-10-12', endDate: '2026-10-18' }], from: '2026-10-01', to: '2026-10-31' };
    expect(countExpectedSessions(params)).toBe(generateCalendar(params).length);
  });
});

describe('academicYearBounds', () => {
  it('spans Sep 1 to Jul 31 by default', () => {
    const { from, to } = academicYearBounds(2026);
    expect(from).toBe('2026-09-01');
    expect(to).toBe('2027-07-31');
  });
  it('honors a custom config', () => {
    const { from, to } = academicYearBounds(2026, { startMonth: 10, startDay: 1, endMonth: 6, endDay: 30 });
    expect(from).toBe('2026-10-01');
    expect(to).toBe('2027-06-30');
  });
});
