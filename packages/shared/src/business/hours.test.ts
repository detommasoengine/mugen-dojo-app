import { describe, it, expect } from 'vitest';
import {
  calculateWeightedHours,
  resolveRoleWeight,
  calculateHoursBreakdown,
  type AttendanceLike,
} from './hours';

describe('calculateWeightedHours', () => {
  it('multiplies effective hours by event and role weight', () => {
    // 1h regular lesson as participant
    expect(calculateWeightedHours({ effectiveHours: 1, eventWeight: 1, roleWeight: 1 })).toBe(1);
    // stage weight 1.5, 3h, participant → 4.5
    expect(calculateWeightedHours({ effectiveHours: 3, eventWeight: 1.5, roleWeight: 1 })).toBe(4.5);
    // stage weight 1.5, 3h, conductor 2x → 9
    expect(calculateWeightedHours({ effectiveHours: 3, eventWeight: 1.5, roleWeight: 2 })).toBe(9);
  });

  it('rounds to 2 decimals', () => {
    expect(calculateWeightedHours({ effectiveHours: 1, eventWeight: 1.333, roleWeight: 1 })).toBe(1.33);
  });

  it('rejects negative inputs', () => {
    expect(() => calculateWeightedHours({ effectiveHours: -1, eventWeight: 1, roleWeight: 1 })).toThrow();
  });
});

describe('resolveRoleWeight', () => {
  it('participant always weighs 1', () => {
    expect(resolveRoleWeight('participant', 2)).toBe(1);
  });
  it('conductor uses the dojo conductor weight', () => {
    expect(resolveRoleWeight('conductor', 2)).toBe(2);
    expect(resolveRoleWeight('conductor', 3)).toBe(3);
  });
});

describe('calculateHoursBreakdown', () => {
  const rows: AttendanceLike[] = [
    { eventType: 'lesson', eventRole: 'participant', weightedHours: 1, status: 'confirmed' },
    { eventType: 'lesson', eventRole: 'participant', weightedHours: 1, status: 'confirmed' },
    { eventType: 'stage', eventRole: 'participant', weightedHours: 4.5, status: 'confirmed' },
    { eventType: 'lesson', eventRole: 'conductor', weightedHours: 2, status: 'confirmed' },
    { eventType: 'lesson', eventRole: 'participant', weightedHours: 1, status: 'registered' }, // pending, excluded
    { eventType: 'stage', eventRole: 'participant', weightedHours: 99, status: 'rejected' }, // excluded
  ];

  it('totals only confirmed attendances by default', () => {
    const b = calculateHoursBreakdown(rows);
    expect(b.total).toBe(8.5); // 1+1+4.5+2
  });

  it('breaks down by event type', () => {
    const b = calculateHoursBreakdown(rows);
    expect(b.byType.lesson).toBe(4); // 1+1+2
    expect(b.byType.stage).toBe(4.5);
  });

  it('splits active (conductor) vs passive (participant) hours', () => {
    const b = calculateHoursBreakdown(rows);
    expect(b.active).toBe(2);
    expect(b.passive).toBe(6.5);
  });

  it('can include pending statuses when asked', () => {
    const b = calculateHoursBreakdown(rows, { includeStatuses: ['confirmed', 'registered'] });
    expect(b.total).toBe(9.5);
  });
});
