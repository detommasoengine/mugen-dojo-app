"use client";

import { useEffect, useId, useMemo, useState } from "react";
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

interface Bristle {
  d: string;
  opacity: number;
  width: number;
  dash?: string;
}

const rnd = (s: number) => {
  const x = Math.sin(s * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * Build a bundle of thin bristle strokes following the arc. The bundle's
 * half-width tapers (heavy wet head → fine pointed tail); bristles fan out at
 * the head and converge at the tail. Outer bristles run shorter/gappier (dry
 * edges); a few overrun as whiskers. This simulates real brush bristles.
 */
function buildBristles(cx: number, cy: number, r: number, arc: number, wmax: number, seed: number): Bristle[] {
  const NB = 22;
  const NP = 90;
  const env = (t: number) => {
    let w = Math.pow(1 - t, 0.5);
    w = 0.32 + 0.68 * w;
    if (t > 0.8) w *= Math.max(0, (1 - t) / 0.2);
    if (t < 0.05) w *= 0.55 + 0.45 * (t / 0.05);
    w *= 0.85 + 0.25 * (0.5 + 0.5 * Math.sin(t * 30 + seed));
    return wmax * w;
  };
  const out: Bristle[] = [];
  for (let b = 0; b < NB; b++) {
    const u = (b / (NB - 1)) * 2 - 1;
    const edge = Math.abs(u);
    const start = -0.02 * rnd(seed + b) * (0.5 + edge);
    const overrun = edge > 0.75 ? 0.04 * rnd(seed * 2 + b) : 0;
    const end = Math.min(1, (arc / (2 * Math.PI)) * (1 - 0.18 * edge * rnd(seed * 3 + b)) + overrun);
    const jitter = (rnd(seed * 5 + b) - 0.5) * 0.1;
    let d = "";
    let started = false;
    for (let i = 0; i <= NP; i++) {
      const tt = i / NP;
      const t = start + tt * (end - start);
      if (t < 0 || t > 1.02) continue;
      const th = t * arc; // theta0 = 0
      const off = (u * 0.94 + jitter) * env(t);
      const wob = Math.sin(t * 60 + b * 3) * 0.6;
      const rad = r + off + wob;
      const x = (cx + rad * Math.cos(th)).toFixed(2);
      const y = (cy + rad * Math.sin(th)).toFixed(2);
      d += (started ? " L" : "M") + x + " " + y;
      started = true;
    }
    if (!started) continue;
    const width = (2 * wmax) / NB * 1.55;
    const opacity = 0.95 - 0.4 * edge * rnd(seed * 7 + b);
    const dash =
      edge > 0.5
        ? `${(6 + 18 * rnd(seed * 9 + b)).toFixed(1)} ${(2 + 5 * rnd(seed * 11 + b)).toFixed(1)}`
        : undefined;
    out.push({ d, opacity, width, dash });
  }
  return out;
}

interface EnsoHourGaugeProps {
  currentGrade: GradeType;
  accumulatedHours: number;
  monthsSinceLastGrade: number;
  size?: number;
}

/**
 * Signature element — the Monte Ore as an *enso* (zen brush circle).
 *
 * Not a geometric ring: a real sumi brushstroke the Aikidoka imprints over time.
 * Rendered as a bundle of bristles (dry-brush voids, fiber streaks, tapered tail)
 * in the belt color of the target grade. A growing arc mask reveals the stroke as
 * hours accrue; the circle closes when the requirement is met.
 * Ref: docs/design/DESIGN-LANGUAGE.md («Ogni Ora, Una Pennellata»).
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
  const beltColor = BELT_VAR[belt];

  const fraction =
    minHours > 0 ? Math.min(1, accumulatedHours / minHours) : result.nominationOnly ? 1 : 0;

  const cx = size / 2;
  const cy = size / 2;
  const r = (size - 44) / 2;
  const wmax = 15;
  const gap = 0.1;
  const fullArc = 2 * Math.PI * (1 - gap);
  const arc = fullArc * fraction;
  const C = 2 * Math.PI * r;
  const drawnLen = C * (1 - gap) * fraction;

  // Bristle bundles are deterministic — compute once.
  const seed = 7;
  const body = useMemo(() => buildBristles(cx, cy, r, arc, wmax, seed), [cx, cy, r, arc]);
  const ghost = useMemo(() => buildBristles(cx, cy, r, fullArc, wmax * 0.8, seed + 40), [cx, cy, r, fullArc]);

  // Reveal the stroke by growing an arc mask (cheap; bristles stay static).
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setProgress(1);
      return;
    }
    const id = requestAnimationFrame(() => setProgress(1));
    return () => cancelAnimationFrame(id);
  }, [fraction]);

  const uid = useId().replace(/:/g, "");
  const fBrush = `enso-brush-${uid}`;
  const mReveal = `enso-reveal-${uid}`;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: "rotate(133deg)" }}
          role="img"
          aria-label={`Monte ore ${Math.round(accumulatedHours)} verso ${gradeLabel(target)}`}
        >
          <defs>
            <filter id={fBrush} x="-30%" y="-30%" width="160%" height="160%">
              <feTurbulence type="fractalNoise" baseFrequency="0.013 0.017" numOctaves={2} seed={seed} result="warp" />
              <feDisplacementMap in="SourceGraphic" in2="warp" scale={6} result="d1" />
              <feTurbulence type="turbulence" baseFrequency="0.7 0.7" numOctaves={2} seed={seed + 3} result="grain" />
              <feDisplacementMap in="d1" in2="grain" scale={2.6} result="d2" />
              <feComponentTransfer in="d2">
                <feFuncA type="gamma" amplitude={1.2} exponent={1.35} offset={-0.075} />
              </feComponentTransfer>
            </filter>
            <mask id={mReveal}>
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke="white"
                strokeWidth={2 * wmax + 26}
                strokeLinecap="round"
                strokeDasharray={`${drawnLen * progress} ${C}`}
                style={{ transition: "stroke-dasharray 1300ms cubic-bezier(0.22, 1, 0.36, 1)" }}
              />
            </mask>
          </defs>

          {/* Paper memory — faint full enso the path completes into */}
          <g opacity={0.06} filter={`url(#${fBrush})`}>
            {ghost.map((br, i) => (
              <path key={i} d={br.d} fill="none" stroke="var(--color-sumi)" strokeOpacity={br.opacity}
                strokeWidth={br.width} strokeLinecap="round" strokeDasharray={br.dash} />
            ))}
          </g>

          {/* The brushstroke — bristle bundle in the belt color, revealed by the mask */}
          {drawnLen > 0.5 && (
            <g filter={`url(#${fBrush})`} mask={`url(#${mReveal})`}>
              {body.map((br, i) => (
                <path key={i} d={br.d} fill="none" stroke={beltColor} strokeOpacity={br.opacity}
                  strokeWidth={br.width} strokeLinecap="round" strokeDasharray={br.dash} />
              ))}
              <ellipse cx={cx + r} cy={cy} rx={wmax * 0.5} ry={wmax * 0.42} fill={beltColor} opacity={0.92} />
            </g>
          )}
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
                <span className="text-muted-foreground">mancano {result.missingHours} ore</span>
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
