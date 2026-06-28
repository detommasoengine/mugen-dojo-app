/**
 * Calendar generation: expand weekly lesson templates into dated occurrences
 * over a range, excluding suspension periods. Pure and timezone-safe — dates
 * are 'YYYY-MM-DD' strings compared lexicographically (valid for ISO dates).
 * Reference: docs/business/05-calendario-regole.md, REQ-002.
 */

export interface LessonTemplateInput {
  id?: string;
  /** 0=Sunday, 1=Monday, ... 6=Saturday (matches DB day_of_week). */
  dayOfWeek: number;
  startTime: string; // 'HH:MM'
  endTime: string;
  durationHours: number;
  isActive?: boolean; // default true
  validFrom?: string; // 'YYYY-MM-DD' inclusive
  validTo?: string;   // 'YYYY-MM-DD' inclusive
}

export interface SuspensionInput {
  startDate: string; // 'YYYY-MM-DD' inclusive
  endDate: string;   // 'YYYY-MM-DD' inclusive
}

export interface GenerateCalendarParams {
  templates: LessonTemplateInput[];
  suspensions: SuspensionInput[];
  from: string; // inclusive
  to: string;   // inclusive
}

export interface GeneratedOccurrence {
  date: string; // 'YYYY-MM-DD'
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  durationHours: number;
  templateId?: string;
}

const MS_PER_DAY = 86_400_000;

function toUtc(date: string): number {
  const [y, m, d] = date.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

function fromUtc(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** True when `date` falls inside any suspension range (inclusive bounds). */
export function isSuspended(date: string, suspensions: SuspensionInput[]): boolean {
  return suspensions.some((s) => date >= s.startDate && date <= s.endDate);
}

function isTemplateValidOn(t: LessonTemplateInput, date: string): boolean {
  if (t.isActive === false) return false;
  if (t.validFrom !== undefined && date < t.validFrom) return false;
  if (t.validTo !== undefined && date > t.validTo) return false;
  return true;
}

/**
 * Generate all lesson occurrences in [from, to], one per matching weekday and
 * active/valid template, excluding suspended dates. Sorted by date.
 */
export function generateCalendar(params: GenerateCalendarParams): GeneratedOccurrence[] {
  const { templates, suspensions, from, to } = params;
  const occurrences: GeneratedOccurrence[] = [];
  const end = toUtc(to);

  for (let ms = toUtc(from); ms <= end; ms += MS_PER_DAY) {
    const date = fromUtc(ms);
    if (isSuspended(date, suspensions)) continue;
    const dow = new Date(ms).getUTCDay();

    for (const t of templates) {
      if (t.dayOfWeek !== dow) continue;
      if (!isTemplateValidOn(t, date)) continue;
      occurrences.push({
        date,
        dayOfWeek: dow,
        startTime: t.startTime,
        endTime: t.endTime,
        durationHours: t.durationHours,
        templateId: t.id,
      });
    }
  }

  return occurrences;
}

/**
 * Number of expected lesson sessions in the range (used for absence ratios,
 * decision B.3). Equals the count of generated occurrences.
 */
export function countExpectedSessions(params: GenerateCalendarParams): number {
  return generateCalendar(params).length;
}

export interface AcademicYearConfig {
  startMonth: number; // 1-12
  startDay: number;
  endMonth: number;
  endDay: number;
}

const DEFAULT_ACADEMIC_YEAR: AcademicYearConfig = {
  startMonth: 9,
  startDay: 1,
  endMonth: 7,
  endDay: 31,
};

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Bounds of an academic year starting in `startYear` (default 1 Sep – 31 Jul;
 * August is implicitly excluded as it falls outside the range).
 */
export function academicYearBounds(
  startYear: number,
  config: AcademicYearConfig = DEFAULT_ACADEMIC_YEAR,
): { from: string; to: string } {
  return {
    from: `${startYear}-${pad(config.startMonth)}-${pad(config.startDay)}`,
    to: `${startYear + 1}-${pad(config.endMonth)}-${pad(config.endDay)}`,
  };
}
