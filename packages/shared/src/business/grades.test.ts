import { describe, it, expect } from 'vitest';
import { GRADE_ORDER, gradeIndex, nextGrade, isKyu, isDan, gradeBeltColor } from './grades';

describe('grade ordering', () => {
  it('orders none → kyu_6..kyu_1 → dan_1..dan_7', () => {
    expect(GRADE_ORDER[0]).toBe('none');
    expect(GRADE_ORDER[1]).toBe('kyu_6');
    expect(GRADE_ORDER[6]).toBe('kyu_1');
    expect(GRADE_ORDER[7]).toBe('dan_1');
    expect(GRADE_ORDER.at(-1)).toBe('dan_7');
  });

  it('gradeIndex is monotonic along progression', () => {
    expect(gradeIndex('kyu_4')).toBeLessThan(gradeIndex('kyu_1'));
    expect(gradeIndex('kyu_1')).toBeLessThan(gradeIndex('dan_1'));
  });
});

describe('nextGrade', () => {
  it('returns the next grade in progression', () => {
    expect(nextGrade('none')).toBe('kyu_6');
    expect(nextGrade('kyu_4')).toBe('kyu_3');
    expect(nextGrade('kyu_1')).toBe('dan_1');
  });

  it('returns null at the top (dan_7)', () => {
    expect(nextGrade('dan_7')).toBeNull();
  });
});

describe('isKyu / isDan', () => {
  it('classifies kyu grades', () => {
    expect(isKyu('kyu_4')).toBe(true);
    expect(isKyu('dan_1')).toBe(false);
    expect(isKyu('none')).toBe(false);
  });

  it('classifies dan grades', () => {
    expect(isDan('dan_2')).toBe(true);
    expect(isDan('kyu_1')).toBe(false);
  });
});

describe('gradeBeltColor', () => {
  it('maps kyu grades through the belt colors', () => {
    expect(gradeBeltColor('none')).toBe('white');
    expect(gradeBeltColor('kyu_4')).toBe('orange');
    expect(gradeBeltColor('kyu_1')).toBe('brown');
  });
  it('maps all dan grades to black', () => {
    expect(gradeBeltColor('dan_1')).toBe('black');
    expect(gradeBeltColor('dan_5')).toBe('black');
  });
});

