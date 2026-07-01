"use client";

import { useActionState } from "react";
import { confirmAttendance, rejectAttendance } from "./actions";
import { Button } from "@/components/ui/button";

type ActionResult = { ok: boolean; error?: string };

const initialState: ActionResult = { ok: true };

export function AttendanceRowActions({ attendanceId }: { attendanceId: string }) {
  const [confirmState, confirmFormAction, confirmPending] = useActionState<ActionResult>(
    () => confirmAttendance(attendanceId),
    initialState,
  );
  const [rejectState, rejectFormAction, rejectPending] = useActionState<ActionResult>(
    () => rejectAttendance(attendanceId),
    initialState,
  );

  const error = !confirmState.ok ? confirmState.error : !rejectState.ok ? rejectState.error : null;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-2">
        <form action={confirmFormAction}>
          <Button type="submit" size="sm" variant="primary" disabled={confirmPending}>
            Conferma
          </Button>
        </form>
        <form action={rejectFormAction}>
          <Button type="submit" size="sm" variant="outline" disabled={rejectPending}>
            Rifiuta
          </Button>
        </form>
      </div>
      {error && <p className="text-xs text-accent">{error}</p>}
    </div>
  );
}
