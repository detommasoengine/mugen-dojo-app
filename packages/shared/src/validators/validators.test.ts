import { describe, it, expect } from 'vitest';
import {
  gradeTypeSchema,
  userRoleSchema,
  profileCreateSchema,
  eventCreateSchema,
  attendanceCreateSchema,
  dojoConfigSchema,
  checkInTokenSchema,
} from './index';

const UUID = '00000000-0000-0000-0000-000000000001';

describe('enum schemas', () => {
  it('accepts valid enum values', () => {
    expect(gradeTypeSchema.parse('kyu_4')).toBe('kyu_4');
    expect(userRoleSchema.parse('head_master')).toBe('head_master');
  });
  it('rejects invalid enum values', () => {
    expect(gradeTypeSchema.safeParse('kyu_9').success).toBe(false);
    expect(userRoleSchema.safeParse('admin').success).toBe(false);
  });
});

describe('profileCreateSchema', () => {
  it('requires names and ids, defaults role and grade', () => {
    const p = profileCreateSchema.parse({
      user_id: UUID,
      dojo_id: UUID,
      first_name: 'Giulia',
      last_name: 'Verdi',
    });
    expect(p.role).toBe('aikidoka');
    expect(p.current_grade).toBe('none');
    expect(p.can_conduct).toBe(false);
  });
  it('rejects malformed uuid and empty names', () => {
    expect(profileCreateSchema.safeParse({ user_id: 'x', dojo_id: UUID, first_name: 'A', last_name: 'B' }).success).toBe(false);
    expect(profileCreateSchema.safeParse({ user_id: UUID, dojo_id: UUID, first_name: '', last_name: 'B' }).success).toBe(false);
  });
});

describe('eventCreateSchema', () => {
  const base = {
    dojo_id: UUID,
    type: 'lesson' as const,
    title: 'Lezione',
    starts_at: '2026-10-05T19:00:00+02:00',
    ends_at: '2026-10-05T20:00:00+02:00',
    duration_hours: 1,
  };
  it('accepts a valid event', () => {
    const e = eventCreateSchema.parse(base);
    expect(e.event_weight).toBe(1); // default
  });
  it('rejects ends_at not after starts_at', () => {
    expect(eventCreateSchema.safeParse({ ...base, ends_at: base.starts_at }).success).toBe(false);
  });
  it('rejects negative weight and non-positive duration', () => {
    expect(eventCreateSchema.safeParse({ ...base, event_weight: -1 }).success).toBe(false);
    expect(eventCreateSchema.safeParse({ ...base, duration_hours: 0 }).success).toBe(false);
  });
  it('rejects inverted grade filter (min above max)', () => {
    expect(eventCreateSchema.safeParse({ ...base, grade_filter_min: 'kyu_1', grade_filter_max: 'kyu_4' }).success).toBe(false);
    expect(eventCreateSchema.safeParse({ ...base, grade_filter_min: 'kyu_4', grade_filter_max: 'kyu_1' }).success).toBe(true);
  });
});

describe('attendanceCreateSchema', () => {
  const base = { event_id: UUID, profile_id: UUID, dojo_id: UUID, method: 'qr_code' as const, event_role: 'participant' as const, weighted_hours: 1 };
  it('accepts valid attendance and defaults status to registered', () => {
    expect(attendanceCreateSchema.parse(base).status).toBe('registered');
  });
  it('rejects negative weighted_hours', () => {
    expect(attendanceCreateSchema.safeParse({ ...base, weighted_hours: -2 }).success).toBe(false);
  });
});

describe('dojoConfigSchema', () => {
  it('rejects negative weights and out-of-range months', () => {
    expect(dojoConfigSchema.safeParse({ default_event_weight: -1, conductor_weight: 2, academic_year_start_month: 9, academic_year_end_month: 7 }).success).toBe(false);
    expect(dojoConfigSchema.safeParse({ default_event_weight: 1, conductor_weight: 2, academic_year_start_month: 13, academic_year_end_month: 7 }).success).toBe(false);
  });
});

describe('checkInTokenSchema', () => {
  it('parses a well-formed token payload', () => {
    const t = checkInTokenSchema.parse({ event_id: UUID, dojo_id: UUID, issued_at: 1700000000, expires_at: 1700000900, nonce: 'abc123' });
    expect(t.event_id).toBe(UUID);
  });
  it('rejects when expires_at <= issued_at', () => {
    expect(checkInTokenSchema.safeParse({ event_id: UUID, dojo_id: UUID, issued_at: 1700000900, expires_at: 1700000900, nonce: 'abc' }).success).toBe(false);
  });
});
