import type { AttendanceStatus } from "@mugen/shared";

/** Italian display label for an attendance status (UI text). */
export function attendanceStatusLabel(status: AttendanceStatus): string {
  switch (status) {
    case "registered":
      return "Da confermare";
    case "confirmed":
      return "Confermata";
    case "rejected":
      return "Rifiutata";
  }
}

/** Tailwind classes for a status-colored badge dot. */
export function attendanceStatusBadgeClass(status: AttendanceStatus): string {
  switch (status) {
    case "registered":
      return "bg-tatami";
    case "confirmed":
      return "bg-ai";
    case "rejected":
      return "bg-accent";
  }
}
