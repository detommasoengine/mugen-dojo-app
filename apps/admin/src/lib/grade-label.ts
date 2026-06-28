import type { GradeType } from "@mugen/shared";

/** Italian display label for a grade (UI text). */
export function gradeLabel(grade: GradeType | null): string {
  if (!grade || grade === "none") return "Nessun grado";
  const [kind, n] = grade.split("_");
  return `${n}° ${kind === "kyu" ? "Kyu" : "Dan"}`;
}
