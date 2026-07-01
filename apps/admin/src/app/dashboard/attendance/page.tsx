import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  type AttendanceLike,
  type AttendanceStatus,
  type EventType,
  calculateHoursBreakdown,
} from "@mugen/shared";
import { Card, CardContent, CardLabel } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { eventTypeLabel } from "@/lib/event-type-label";
import { attendanceStatusLabel } from "@/lib/attendance-status-label";
import { AttendanceTable, type AttendanceRow } from "./attendance-table";
import { AttendanceForm } from "./attendance-form";

const STATUSES: AttendanceStatus[] = ["registered", "confirmed", "rejected"];
const EVENT_TYPES: EventType[] = ["lesson", "lesson_extra", "stage", "exam", "workshop", "gathering"];

function param(sp: { [key: string]: string | string[] | undefined }, key: string): string {
  const v = sp[key];
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, dojo_id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return (
      <p className="text-muted-foreground">
        Nessun profilo associato a questo account. Contatta il Caposcuola.
      </p>
    );
  }

  const status = param(sp, "status") as AttendanceStatus | "";
  const eventType = param(sp, "type") as EventType | "";
  const q = param(sp, "q").trim();
  const from = param(sp, "from");
  const to = param(sp, "to");

  let matchedProfileIds: string[] | null = null;
  if (q) {
    const { data: matches } = await supabase
      .from("profiles")
      .select("id")
      .eq("dojo_id", profile.dojo_id)
      .eq("role", "aikidoka")
      .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%`);
    matchedProfileIds = (matches ?? []).map((m) => m.id);
  }

  let rows: AttendanceRow[] = [];
  if (!matchedProfileIds || matchedProfileIds.length > 0) {
    let query = supabase
      .from("attendances")
      .select(
        "id, profile_id, event_id, effective_hours, weighted_hours, event_role, method, status, notes, created_at, profiles!attendances_profile_id_fkey(first_name, last_name), events(title, type, starts_at)",
      )
      .eq("dojo_id", profile.dojo_id)
      .order("created_at", { ascending: false });
    if (status) query = query.eq("status", status);
    if (matchedProfileIds) query = query.in("profile_id", matchedProfileIds);
    if (from) query = query.gte("created_at", from);
    if (to) query = query.lte("created_at", to);

    const { data } = await query;
    rows = data ?? [];
    if (eventType) rows = rows.filter((r) => r.events?.type === eventType);
  }

  const attendanceLikes: AttendanceLike[] = rows
    .filter((r) => r.events)
    .map((r) => ({
      eventType: r.events!.type,
      eventRole: r.event_role,
      weightedHours: Number(r.weighted_hours),
      status: r.status,
    }));
  const breakdown = calculateHoursBreakdown(attendanceLikes);

  const [{ data: events }, { data: aikidokas }] = await Promise.all([
    supabase
      .from("events")
      .select("id, title, starts_at")
      .eq("dojo_id", profile.dojo_id)
      .order("starts_at", { ascending: false })
      .limit(20),
    supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .eq("dojo_id", profile.dojo_id)
      .eq("role", "aikidoka")
      .eq("is_active", true)
      .order("first_name"),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl">Presenze</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Registra presenza</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registra presenza</DialogTitle>
              <DialogDescription>
                Registra la presenza di un Aikidoka a un evento del Dojo.
              </DialogDescription>
            </DialogHeader>
            <AttendanceForm events={events ?? []} aikidokas={aikidokas ?? []} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="grid gap-4 pt-5 sm:grid-cols-3">
          <div>
            <CardLabel>Ore confermate</CardLabel>
            <p className="mt-2 font-mono text-3xl font-semibold tabular-nums">{breakdown.total}</p>
          </div>
          <div>
            <CardLabel>Ore attive (conduzione)</CardLabel>
            <p className="mt-2 font-mono text-3xl font-semibold tabular-nums">{breakdown.active}</p>
          </div>
          <div>
            <CardLabel>Ore passive (partecipazione)</CardLabel>
            <p className="mt-2 font-mono text-3xl font-semibold tabular-nums">{breakdown.passive}</p>
          </div>
        </CardContent>
      </Card>

      <form method="get" className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="q" className="text-xs text-muted-foreground">Aikidoka</label>
          <input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="Cerca per nome"
            className="h-9 rounded-md border border-border bg-washi-raised px-3 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="status" className="text-xs text-muted-foreground">Stato</label>
          <select id="status" name="status" defaultValue={status} className="h-9 rounded-md border border-border bg-washi-raised px-3 text-sm">
            <option value="">Tutti</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{attendanceStatusLabel(s)}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="type" className="text-xs text-muted-foreground">Tipo evento</label>
          <select id="type" name="type" defaultValue={eventType} className="h-9 rounded-md border border-border bg-washi-raised px-3 text-sm">
            <option value="">Tutti</option>
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>{eventTypeLabel(t)}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="from" className="text-xs text-muted-foreground">Da</label>
          <input id="from" type="date" name="from" defaultValue={from} className="h-9 rounded-md border border-border bg-washi-raised px-3 text-sm" />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="to" className="text-xs text-muted-foreground">A</label>
          <input id="to" type="date" name="to" defaultValue={to} className="h-9 rounded-md border border-border bg-washi-raised px-3 text-sm" />
        </div>
        <Button type="submit" variant="outline">Filtra</Button>
      </form>

      <AttendanceTable data={rows} />
    </div>
  );
}
