import type { EventType } from "@mugen/shared";

/** Italian display label for an event type (UI text). */
export function eventTypeLabel(type: EventType): string {
  switch (type) {
    case "lesson":
      return "Lezione";
    case "lesson_extra":
      return "Lezione extra";
    case "stage":
      return "Stage";
    case "exam":
      return "Esame";
    case "workshop":
      return "Laboratorio";
    case "gathering":
      return "Raduno";
  }
}
