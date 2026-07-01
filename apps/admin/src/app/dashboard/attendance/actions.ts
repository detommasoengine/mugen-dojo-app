"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  attendanceManualInputSchema,
  attendanceStatusUpdateSchema,
  attendanceCreateSchema,
  calculateWeightedHours,
  resolveRoleWeight,
  type AttendanceManualInput,
} from "@mugen/shared";

type ActionResult = { ok: true } | { ok: false; error: string };

const ATTENDANCE_PATH = "/dashboard/attendance";

async function getActingProfile(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, dojo_id")
    .eq("user_id", user.id)
    .single();
  return profile;
}

export async function createAttendance(input: AttendanceManualInput): Promise<ActionResult> {
  const parsed = attendanceManualInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Dati non validi." };

  const supabase = await createSupabaseServerClient();
  const profile = await getActingProfile(supabase);
  if (!profile) return { ok: false, error: "Sessione scaduta, effettua di nuovo l'accesso." };

  const [{ data: event }, { data: dojo }] = await Promise.all([
    supabase.from("events").select("event_weight").eq("id", parsed.data.event_id).single(),
    supabase.from("dojos").select("conductor_weight").eq("id", profile.dojo_id).single(),
  ]);
  if (!event || !dojo) return { ok: false, error: "Evento non trovato." };

  const roleWeight = resolveRoleWeight(parsed.data.event_role, dojo.conductor_weight);
  const weighted_hours = calculateWeightedHours({
    effectiveHours: parsed.data.effective_hours,
    eventWeight: event.event_weight,
    roleWeight,
  });

  const insertPayload = {
    ...attendanceCreateSchema.parse({
      event_id: parsed.data.event_id,
      profile_id: parsed.data.profile_id,
      dojo_id: profile.dojo_id,
      method: parsed.data.method,
      event_role: parsed.data.event_role,
      weighted_hours,
    }),
    effective_hours: parsed.data.effective_hours,
  };

  const { error } = await supabase.from("attendances").insert(insertPayload).select("id").single();
  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Presenza già registrata per questo evento." };
    }
    return { ok: false, error: "Permesso negato o dati non validi." };
  }

  revalidatePath(ATTENDANCE_PATH);
  return { ok: true };
}

async function updateAttendanceStatus(
  attendanceId: string,
  status: "confirmed" | "rejected",
  notes?: string,
): Promise<ActionResult> {
  const parsed = attendanceStatusUpdateSchema.safeParse({ status, notes });
  if (!parsed.success) return { ok: false, error: "Dati non validi." };

  const supabase = await createSupabaseServerClient();
  const profile = await getActingProfile(supabase);
  if (!profile) return { ok: false, error: "Sessione scaduta, effettua di nuovo l'accesso." };

  const { error, count } = await supabase
    .from("attendances")
    .update(
      {
        status: parsed.data.status,
        confirmed_by: profile.id,
        confirmed_at: new Date().toISOString(),
        ...(parsed.data.notes !== undefined && { notes: parsed.data.notes }),
      },
      { count: "exact" },
    )
    .eq("id", attendanceId);

  if (error || !count) {
    return { ok: false, error: "Permesso negato o presenza non trovata." };
  }

  revalidatePath(ATTENDANCE_PATH);
  return { ok: true };
}

export async function confirmAttendance(attendanceId: string): Promise<ActionResult> {
  return updateAttendanceStatus(attendanceId, "confirmed");
}

export async function rejectAttendance(attendanceId: string, notes?: string): Promise<ActionResult> {
  return updateAttendanceStatus(attendanceId, "rejected", notes);
}
