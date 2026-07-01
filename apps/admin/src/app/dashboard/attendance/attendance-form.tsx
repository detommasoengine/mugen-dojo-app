"use client";

import { useActionState } from "react";
import { createAttendance } from "./actions";
import { Button } from "@/components/ui/button";
import type { AttendanceManualInput, AttendanceMethod } from "@mugen/shared";

type ActionResult = { ok: boolean; error?: string };

const METHOD_LABELS: Record<AttendanceMethod, string> = {
  roll_call: "Appello",
  qr_code: "QR Code",
  direct_entry: "Inserimento diretto",
};

interface AttendanceFormProps {
  events: { id: string; title: string; starts_at: string }[];
  aikidokas: { id: string; first_name: string; last_name: string }[];
}

async function submitAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const raw: AttendanceManualInput = {
    event_id: String(formData.get("event_id")),
    profile_id: String(formData.get("profile_id")),
    effective_hours: Number(formData.get("effective_hours")),
    method: formData.get("method") as AttendanceMethod,
    event_role: formData.get("event_role") as AttendanceManualInput["event_role"],
  };
  return createAttendance(raw);
}

export function AttendanceForm({ events, aikidokas }: AttendanceFormProps) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(submitAction, { ok: true });

  return (
    <form action={formAction} className="space-y-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="event_id" className="text-sm text-muted-foreground">Evento</label>
        <select id="event_id" name="event_id" required className="h-9 rounded-md border border-border bg-washi-raised px-3 text-sm">
          {events.map((e) => (
            <option key={e.id} value={e.id}>
              {e.title} — {new Date(e.starts_at).toLocaleDateString("it-IT")}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="profile_id" className="text-sm text-muted-foreground">Aikidoka</label>
        <select id="profile_id" name="profile_id" required className="h-9 rounded-md border border-border bg-washi-raised px-3 text-sm">
          {aikidokas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.first_name} {a.last_name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="effective_hours" className="text-sm text-muted-foreground">Ore effettive</label>
        <input
          id="effective_hours"
          name="effective_hours"
          type="number"
          step="0.5"
          min="0.5"
          required
          defaultValue="1"
          className="h-9 rounded-md border border-border bg-washi-raised px-3 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="method" className="text-sm text-muted-foreground">Metodo</label>
        <select id="method" name="method" required className="h-9 rounded-md border border-border bg-washi-raised px-3 text-sm">
          {(Object.entries(METHOD_LABELS) as [AttendanceMethod, string][]).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="event_role" className="text-sm text-muted-foreground">Ruolo</label>
        <select id="event_role" name="event_role" defaultValue="participant" className="h-9 rounded-md border border-border bg-washi-raised px-3 text-sm">
          <option value="participant">Partecipante</option>
          <option value="conductor">Conduttore</option>
        </select>
      </div>

      {!state.ok && <p className="text-sm text-accent">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Registrazione…" : "Registra"}
      </Button>
    </form>
  );
}
