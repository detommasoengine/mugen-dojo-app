"use client";

import { useEffect, useState } from "react";
import {
  type GradeType,
  type BeltColor,
  gradeBeltColor,
  checkExamEligibility,
  AIKIKAI_EXAM_REQUIREMENTS,
} from "@mugen/shared";
import { gradeLabel } from "@/lib/grade-label";

const BELT_VAR: Record<BeltColor, string> = {
  white: "var(--color-belt-white)",
  yellow: "var(--color-belt-yellow)",
  orange: "var(--color-belt-orange)",
  green: "var(--color-belt-green)",
  blue: "var(--color-belt-blue)",
  brown: "var(--color-belt-brown)",
  black: "var(--color-belt-black)",
};

interface EnsoHourGaugeProps {
  currentGrade: GradeType;
  accumulatedHours: number;
  monthsSinceLastGrade: number;
  size?: number;
}

/**
 * Signature element — the Monte Ore as an *enso* (zen brush circle).
 * A faint ink ring with an opening; over it a colored arc (belt color of the
 * target grade) fills with the hours accumulated toward the next exam.
 */
export function EnsoHourGauge({
  currentGrade,
  accumulatedHours,
  monthsSinceLastGrade,
  size = 240,
}: EnsoHourGaugeProps) {
  const result = checkExamEligibility({ currentGrade, accumulatedHours, monthsSinceLastGrade });
  const target = result.targetGrade;
  const req = target ? AIKIKAI_EXAM_REQUIREMENTS[target] : undefined;
  const minHours = req && !req.nominationOnly ? req.minHours : 0;
  const belt = target ? gradeBeltColor(target) : "black";

  const fraction = minHours > 0 ? Math.min(1, accumulatedHours / minHours) : result.nominationOnly ? 1 : 0;

  // Geometry: ring with a brush opening at the bottom (the enso gap).
  const stroke = 12;
  const r = (size - stroke * 2) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const gap = 0.12; // 12% opening — the enso's unclosed breath
  const arcLen = circumference * (1 - gap);

  // Animate the colored arc on mount (respect reduced motion).
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setProgress(fraction);
      return;
    }
    const id = requestAnimationFrame(() => setProgress(fraction));
    return () => cancelAnimationFrame(id);
  }, [fraction]);

  const filled = arcLen * progress;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          // start the stroke at the bottom-left so the opening sits low, like a brushed enso
          style={{ transform: "rotate(125deg)" }}
          role="img"
          aria-label={`Monte ore ${Math.round(accumulatedHours)} verso ${gradeLabel(target)}`}
        >
          {/* Paper enso — faint ink ring with the opening */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="var(--color-sumi)"
            strokeOpacity={0.12}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${arcLen} ${circumference}`}
          />
          {/* Progress arc — belt color of the target grade */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={BELT_VAR[belt]}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circumference}`}
            style={{ transition: "stroke-dasharray 1100ms cubic-bezier(0.22, 1, 0.36, 1)" }}
          />
        </svg>

        {/* Center readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-4xl font-semibold tabular-nums text-foreground">
            {Math.round(accumulatedHours)}
          </span>
          <span className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            ore
          </span>
        </div>
      </div>

      {/* Caption */}
      <div className="mt-4 text-center">
        {target ? (
          <>
            <p className="text-sm text-muted-foreground">
              verso <span className="font-display text-foreground">{gradeLabel(target)}</span>
            </p>
            <p className="mt-1 font-mono text-sm tabular-nums">
              {result.nominationOnly ? (
                <span className="text-muted-foreground">grado per nomina diretta</span>
              ) : result.eligible ? (
                <span className="text-accent">requisito ore raggiunto</span>
              ) : (
                <span className="text-muted-foreground">
                  mancano {result.missingHours} ore
                </span>
              )}
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Grado massimo raggiunto</p>
        )}
      </div>
    </div>
  );
}
