import type { EventType, EventRole, AttendanceStatus } from '../database.types';

/** Round to 2 decimals to avoid float drift (DB stores numeric). */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export interface WeightedHoursInput {
  effectiveHours: number;
  eventWeight: number;
  roleWeight: number;
}

/**
 * Core hour formula: effective × event weight × role weight.
 * weighted_hours = effective_hours × event_weight × role_weight
 */
export function calculateWeightedHours({
  effectiveHours,
  eventWeight,
  roleWeight,
}: WeightedHoursInput): number {
  if (effectiveHours < 0 || eventWeight < 0 || roleWeight < 0) {
    throw new Error('Hours and weights must be non-negative');
  }
  return round2(effectiveHours * eventWeight * roleWeight);
}

/**
 * Participant always weighs 1; conductor uses the dojo-configured weight
 * (default 2.0, set on dojos.conductor_weight).
 */
export function resolveRoleWeight(role: EventRole, conductorWeight: number): number {
  return role === 'conductor' ? conductorWeight : 1;
}

export interface AttendanceLike {
  eventType: EventType;
  eventRole: EventRole;
  weightedHours: number;
  status: AttendanceStatus;
}

export interface HoursBreakdown {
  total: number;
  byType: Partial<Record<EventType, number>>;
  active: number;  // conductor hours
  passive: number; // participant hours
}

export interface BreakdownOptions {
  /** Attendance statuses to count. Default: confirmed only. */
  includeStatuses?: AttendanceStatus[];
}

/**
 * Aggregate stored weighted hours into a total + breakdown by event type
 * and by role (active conductor vs passive participant). Pending/rejected
 * attendances are excluded unless explicitly included.
 */
export function calculateHoursBreakdown(
  attendances: AttendanceLike[],
  options: BreakdownOptions = {},
): HoursBreakdown {
  const include = options.includeStatuses ?? ['confirmed'];
  const counted = attendances.filter((a) => include.includes(a.status));

  const byType: Partial<Record<EventType, number>> = {};
  let active = 0;
  let passive = 0;

  for (const a of counted) {
    byType[a.eventType] = round2((byType[a.eventType] ?? 0) + a.weightedHours);
    if (a.eventRole === 'conductor') active = round2(active + a.weightedHours);
    else passive = round2(passive + a.weightedHours);
  }

  return { total: round2(active + passive), byType, active, passive };
}
