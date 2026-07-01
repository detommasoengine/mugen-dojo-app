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

// Geometry baked into the sumi texture (public/textures/enso-sumi.png, 1024²).
// Keep in sync with docs/design/enso-gen.html: head at A0, sweep SPAN clockwise.
const TEX = 1024;
const T_R = 360;
const T_BAND = 96;
const A0 = (140 * Math.PI) / 180;
const SPAN = 0.87 * 2 * Math.PI; // ~313° → ~47° opening at the bottom
const TEXTURE_SRC = "/textures/enso-sumi.png";

const rnd = (s: number) => {
  const x = Math.sin(s * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const polar = (cx: number, cy: number, r: number, a: number) =>
  `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;

/** Arc centerline path from a0 to a1 (clockwise, y-down). */
function arcPath(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M ${polar(cx, cy, r, a0)} A ${r} ${r} 0 ${large} 1 ${polar(cx, cy, r, a1)}`;
}

interface Bristle { d: string; opacity: number; width: number; dash?: string }

/**
 * Procedural bristle bundle (artistic + cross-platform fallback when the raster
 * texture is unavailable). Follows the same arc geometry (A0..SPAN) so it aligns
 * with the reveal mask. Tapered head→tail, dry-brush gaps.
 */
function buildBristles(cx: number, cy: number, r: number, band: number, seed: number): Bristle[] {
  const NB = 22;
  const NP = 96;
  const env = (t: number) => {
    let w = Math.pow(1 - t, 0.55);
    w = 0.3 + 0.7 * w;
    if (t > 0.82) w *= Math.max(0, (1 - t) / 0.18);
    if (t < 0.05) w *= 0.55 + 0.45 * (t / 0.05);
    return band * w;
  };
  const out: Bristle[] = [];
  for (let b = 0; b < NB; b++) {
    const u = (b / (NB - 1)) * 2 - 1;
    const edge = Math.abs(u);
    const end = Math.min(1, 1 - 0.16 * edge * rnd(seed * 3 + b));
    let d = "";
    let started = false;
    for (let i = 0; i <= NP; i++) {
      const t = (i / NP) * end;
      const conv = 0.28 + 0.72 * Math.pow(1 - t, 0.7);
      const wob = Math.sin(t * 26 + b * 4) * 1.6;
      const rad = r + u * env(t) * conv + wob;
      const ang = A0 + t * SPAN;
      d += (started ? " L" : "M") + polar(cx, cy, rad, ang);
      started = true;
    }
    if (!started) continue;
    const width = ((2 * band) / NB) * 1.5;
    const opacity = 0.95 - 0.4 * edge * rnd(seed * 7 + b);
    const dash =
      edge > 0.5
        ? `${(5 + 16 * rnd(seed * 9 + b)).toFixed(1)} ${(2 + 5 * rnd(seed * 11 + b)).toFixed(1)}`
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
 * A real sumi brushstroke the Aikidoka imprints over time: a grayscale brush
 * texture (public/textures/enso-sumi.png) tinted to the target grade's belt
 * colour, revealed by a growing arc mask as hours accrue; the circle closes at
 * the requirement. A procedural bristle bundle is the cross-platform fallback
 * (and artistic layer) when the texture is unavailable.
 * Ref: docs/design/DESIGN-LANGUAGE.md §5a («Ogni Ora, Una Pennellata»).
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

  const scale = size / TEX;
  const cx = size / 2;
  const cy = size / 2;
  const r = T_R * scale;
  const band = T_BAND * scale;

  // Texture availability → fallback to procedural bristles on error.
  const [texOk, setTexOk] = useState(true);
  useEffect(() => {
    let alive = true;
    const img = new Image();
    img.onerror = () => {
      if (alive) setTexOk(false);
    };
    img.src = TEXTURE_SRC;
    return () => {
      alive = false;
    };
  }, []);

  const bristles = useMemo(() => buildBristles(cx, cy, r, band, 7), [cx, cy, r, band]);

  // Reveal by growing an arc mask along the stroke (cheap; texture stays static).
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
  const mInk = `enso-ink-${uid}`;
  const mReveal = `enso-reveal-${uid}`;
  const fBrush = `enso-brush-${uid}`;

  const arcCenter = arcPath(cx, cy, r, A0, A0 + SPAN);
  const arcPathLen = r * SPAN;
  const drawn = arcPathLen * fraction * progress;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label={`Monte ore ${Math.round(accumulatedHours)} verso ${gradeLabel(target)}`}
        >
          <defs>
            {/* Ink alpha from the grayscale texture (white ink → visible) */}
            <mask id={mInk}>
              <image href={TEXTURE_SRC} x={0} y={0} width={size} height={size} preserveAspectRatio="none" />
            </mask>
            {/* Progressive reveal — a thick arc that grows head→tail */}
            <mask id={mReveal}>
              <path
                d={arcCenter}
                fill="none"
                stroke="white"
                strokeWidth={2 * band + 20}
                strokeLinecap="round"
                pathLength={arcPathLen}
                strokeDasharray={`${drawn} ${arcPathLen + 10}`}
                style={{ transition: "stroke-dasharray 1300ms cubic-bezier(0.22, 1, 0.36, 1)" }}
              />
            </mask>
            {/* Subtle edge roughening for the procedural fallback */}
            <filter id={fBrush} x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.014 0.02" numOctaves={2} seed={7} result="w" />
              <feDisplacementMap in="SourceGraphic" in2="w" scale={5} />
            </filter>
          </defs>

          {/* Paper memory — faint full enso the path completes into */}
          {texOk ? (
            <g opacity={0.06} mask={`url(#${mInk})`}>
              <rect x={0} y={0} width={size} height={size} fill="var(--color-sumi)" />
            </g>
          ) : (
            <g opacity={0.06} filter={`url(#${fBrush})`}>
              {bristles.map((br, i) => (
                <path key={i} d={br.d} fill="none" stroke="var(--color-sumi)" strokeOpacity={br.opacity}
                  strokeWidth={br.width} strokeLinecap="round" strokeDasharray={br.dash} />
              ))}
            </g>
          )}

          {/* The brushstroke, belt-coloured, revealed by the growing arc */}
          {fraction > 0.001 && (
            <g mask={`url(#${mReveal})`}>
              {texOk ? (
                <g mask={`url(#${mInk})`}>
                  <rect x={0} y={0} width={size} height={size} fill={beltColor} />
                </g>
              ) : (
                <g filter={`url(#${fBrush})`}>
                  {bristles.map((br, i) => (
                    <path key={i} d={br.d} fill="none" stroke={beltColor} strokeOpacity={br.opacity}
                      strokeWidth={br.width} strokeLinecap="round" strokeDasharray={br.dash} />
                  ))}
                </g>
              )}
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
