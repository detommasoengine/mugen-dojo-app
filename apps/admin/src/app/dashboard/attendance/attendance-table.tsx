"use client";

import { useReactTable, getCoreRowModel, flexRender, createColumnHelper } from "@tanstack/react-table";
import type { AttendanceMethod, AttendanceStatus, EventRole, EventType } from "@mugen/shared";
import { attendanceStatusLabel, attendanceStatusBadgeClass } from "@/lib/attendance-status-label";
import { eventTypeLabel } from "@/lib/event-type-label";
import { AttendanceRowActions } from "./attendance-row-actions";

export interface AttendanceRow {
  id: string;
  profile_id: string;
  event_id: string;
  effective_hours: number;
  weighted_hours: number;
  event_role: EventRole;
  method: AttendanceMethod;
  status: AttendanceStatus;
  notes: string | null;
  created_at: string;
  profiles: { first_name: string; last_name: string } | null;
  events: { title: string; type: EventType; starts_at: string } | null;
}

const columnHelper = createColumnHelper<AttendanceRow>();

const columns = [
  columnHelper.display({
    id: "aikidoka",
    header: "Aikidoka",
    cell: ({ row }) => {
      const p = row.original.profiles;
      return p ? `${p.first_name} ${p.last_name}` : "—";
    },
  }),
  columnHelper.display({
    id: "evento",
    header: "Evento",
    cell: ({ row }) => row.original.events?.title ?? "—",
  }),
  columnHelper.display({
    id: "data",
    header: "Data",
    cell: ({ row }) => {
      const starts = row.original.events?.starts_at;
      return starts ? new Date(starts).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";
    },
  }),
  columnHelper.display({
    id: "tipo",
    header: "Tipo",
    cell: ({ row }) => (row.original.events ? eventTypeLabel(row.original.events.type) : "—"),
  }),
  columnHelper.accessor("weighted_hours", {
    header: "Ore",
    cell: ({ getValue }) => (
      <span className="font-mono tabular-nums">{Number(getValue()).toFixed(2)}</span>
    ),
  }),
  columnHelper.accessor("status", {
    header: "Stato",
    cell: ({ getValue }) => {
      const status = getValue();
      return (
        <span className="inline-flex items-center gap-2 text-sm">
          <span className={`size-2 rounded-full ${attendanceStatusBadgeClass(status)}`} />
          {attendanceStatusLabel(status)}
        </span>
      );
    },
  }),
  columnHelper.display({
    id: "azioni",
    header: "Azioni",
    cell: ({ row }) =>
      row.original.status === "registered" ? (
        <AttendanceRowActions attendanceId={row.original.id} />
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  }),
];

export function AttendanceTable({ data }: { data: AttendanceRow[] }) {
  "use no memo"; // TanStack Table's returned functions aren't safe for the React Compiler to memoize.
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  if (data.length === 0) {
    return <p className="text-muted-foreground">Nessuna presenza trovata per i filtri selezionati.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-washi-raised">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-4 py-3 font-medium text-muted-foreground">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b border-border last:border-0">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
