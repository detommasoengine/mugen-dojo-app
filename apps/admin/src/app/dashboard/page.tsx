import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  type GradeType,
  checkExamEligibility,
  gradeBeltColor,
} from "@mugen/shared";
import { EnsoHourGauge } from "@/components/enso-hour-gauge";
import { gradeLabel } from "@/lib/grade-label";
import { Card, CardContent, CardLabel } from "@/components/ui/card";

function monthsSince(dateStr: string | null): number {
  if (!dateStr) return 0;
  const d = new Date(dateStr);
  const now = new Date();
  return Math.max(0, (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth()));
}

function GradeChip({ grade }: { grade: GradeType }) {
  const belt = gradeBeltColor(grade);
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-washi px-3 py-1 text-sm">
      <span
        className="size-2.5 rounded-full ring-1 ring-black/10"
        style={{ background: `var(--color-belt-${belt})` }}
      />
      {gradeLabel(grade)}
    </span>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <CardLabel>{label}</CardLabel>
        <p className="mt-2 font-mono text-3xl font-semibold tabular-nums">{value}</p>
        {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, first_name, current_grade, enrollment_date, dojo_id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return (
      <p className="text-muted-foreground">
        Nessun profilo associato a questo account. Contatta il Caposcuola.
      </p>
    );
  }

  const { data: attData } = await supabase
    .from("attendances")
    .select("weighted_hours")
    .eq("profile_id", profile.id)
    .eq("status", "confirmed");
  const attendanceRows = attData ?? [];

  const accumulatedHours = attendanceRows.reduce(
    (sum, r) => sum + Number(r.weighted_hours),
    0,
  );

  const [{ count: aikidokaCount }, { count: presenzeCount }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("dojo_id", profile.dojo_id)
      .eq("role", "aikidoka")
      .eq("is_active", true),
    supabase
      .from("attendances")
      .select("id", { count: "exact", head: true })
      .eq("dojo_id", profile.dojo_id),
  ]);

  const months = monthsSince(profile.enrollment_date);
  const eligibility = checkExamEligibility({
    currentGrade: profile.current_grade,
    accumulatedHours,
    monthsSinceLastGrade: months,
  });

  const examHint = !eligibility.targetGrade
    ? "—"
    : eligibility.nominationOnly
      ? "nomina diretta"
      : eligibility.eligible
        ? "requisito ore raggiunto"
        : `mancano ${eligibility.missingHours} ore`;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Hero — Monte Ore enso */}
      <Card>
        <CardContent className="grid items-center gap-8 p-8 md:grid-cols-2">
          <div className="flex justify-center">
            <EnsoHourGauge
              currentGrade={profile.current_grade}
              accumulatedHours={accumulatedHours}
              monthsSinceLastGrade={months}
            />
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Konnichiwa,</p>
              <h2 className="font-display text-3xl">{profile.first_name}</h2>
            </div>
            <GradeChip grade={profile.current_grade} />
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Il tuo <span className="text-foreground">Monte Ore</span> verso il grado
              successivo. L&apos;anello si completa al raggiungimento delle ore richieste
              dal programma Aikikai.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard label="Aikidoka attivi" value={String(aikidokaCount ?? 0)} hint="nel Dojo" />
        <StatCard label="Presenze registrate" value={String(presenzeCount ?? 0)} hint="totale Dojo" />
        <StatCard
          label="Prossimo esame"
          value={gradeLabel(eligibility.targetGrade)}
          hint={examHint}
        />
      </div>
    </div>
  );
}
