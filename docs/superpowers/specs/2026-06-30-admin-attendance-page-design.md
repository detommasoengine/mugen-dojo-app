# A1 — Pagina Presenze (Admin) — Design

> Stato: `[APPROVATO]` | Task board: `.agent/bus/BOARD.md` → A1 (WIP, owner `sonnet`, branch `feat/admin-attendance-page`)
> Riferimenti: [REQ-001](../../requirements/REQ-001-gestione-presenze.md), `docs/architecture/ENGINEERING-GUIDELINES.md`, `.agent/handoffs/HANDOFF-20260628.md`

## Obiettivo

Pagina Admin "Presenze": tabella unica con filtri, coda di conferma/rifiuto inline, riepilogo ore, e registrazione manuale di una presenza. Copre RF-001.1, RF-001.2, RF-001.3 di REQ-001.

## Routing

Nuova route `apps/admin/src/app/dashboard/attendance/page.tsx`, nidificata sotto `dashboard/` per ereditare `dashboard/layout.tsx` (auth guard + `AppShell`) senza toccare la struttura dei layout esistenti.

`apps/admin/src/components/app-shell/app-shell.tsx`: il nav item "Presenze" passa da disabled a `{ href: "/dashboard/attendance", label: "Presenze", icon: ClipboardCheck }`.

## Data layer (server component)

Query `attendances` con join `events` (title, type/`type`, starts_at) e `profiles` (first_name, last_name), filtrata per `dojo_id` dell'utente loggato. Client Supabase server-side con sessione utente (mai `service_role`) — le RLS esistenti (`20260412007_create_attendances.sql`) già autorizzano head_master (full manage) e secretary con permesso (view + confirm).

Filtri letti da `searchParams` (server-driven, no stato client pesante):
- intervallo date (anno accademico / mese / custom)
- tipo evento (`event_type`)
- aikidoka (ricerca per nome → risolta a `profile_id`)
- stato presenza (`registered` / `confirmed` / `rejected`)

## UI

### Card riepilogo ore

Sopra la tabella. Usa `calculateHoursBreakdown` (da `@mugen/shared`) **sempre con `includeStatuses: ['confirmed']`** (default della funzione) — la card mostra il "Monte Ore" confermato del set filtrato, non un mix di stati. Etichetta esplicita in italiano: "Ore confermate" (non "ore totali"), per evitare ambiguità quando il filtro stato include `registered`/`rejected` e la tabella sotto mostra righe che la card non conta.

### Tabella

`@tanstack/react-table` (nuova dipendenza in `apps/admin/package.json`). Colonne: Aikidoka, Evento, Data, Tipo, Ore (`weighted_hours`), Stato, Azioni.

Filtri sopra la tabella: date range, select tipo evento, search aikidoka, select stato — tutti sincronizzati su `searchParams`.

### Azioni inline (righe `status='registered'`)

Bottoni Conferma/Rifiuta — server action, visibili sempre (RLS è la guardia reale; nascondere lato UI per utenti senza permesso è solo polish, non sicurezza, e non blocca questa iterazione se la RLS rifiuta l'update).

### Dialog "Registra presenza"

Nuovo primitivo `apps/admin/src/components/ui/dialog.tsx`, tematizzato Sumi&Ai, basato su `@radix-ui/react-dialog` (nuova dipendenza — scelta per coerenza con l'ecosistema Radix già implicito nello stack shadcn/ui di ADR-001, accessibilità focus-trap/ESC gratis).

Form: select evento (eventi recenti del dojo), select aikidoka, ore effettive, metodo, ruolo (participant/conductor).

## Validation (`packages/shared/src/validators/attendance.ts`)

Lo schema esistente `attendanceCreateSchema` richiede `weighted_hours` — non adatto come schema dell'**input utente** (l'utente non deve poter passare ore pesate arbitrarie). Si introducono due schemi distinti:

```ts
// Input dal form — niente weighted_hours, lo calcola il server
export const attendanceManualInputSchema = z.object({
  event_id: z.string().uuid(),
  profile_id: z.string().uuid(),
  effective_hours: z.number().positive(),
  method: attendanceMethodSchema,
  event_role: eventRoleSchema.default('participant'),
});
export type AttendanceManualInput = z.infer<typeof attendanceManualInputSchema>;

// Stato — usato dall'azione conferma/rifiuta
export const attendanceStatusUpdateSchema = z.object({
  status: z.enum(['confirmed', 'rejected']),
  notes: z.string().optional(),
});
export type AttendanceStatusUpdateInput = z.infer<typeof attendanceStatusUpdateSchema>;
```

`attendanceCreateSchema` (con `weighted_hours`) resta il contratto di **insert** verso il DB, validato lato server dopo il calcolo — non cambia.

## Server actions (`apps/admin/src/app/dashboard/attendance/actions.ts`)

### `createAttendance(input: AttendanceManualInput)`

1. Valida `input` con `attendanceManualInputSchema`.
2. Fetch `events.event_weight` (per `event_id`) e `dojos.conductor_weight` (per il dojo dell'utente).
3. `roleWeight = resolveRoleWeight(input.event_role, conductorWeight)`.
4. `weighted_hours = calculateWeightedHours({ effectiveHours: input.effective_hours, eventWeight, roleWeight })`.
5. Costruisce il payload completo, lo rivalida con `attendanceCreateSchema` (contratto insert), esegue `.insert()`.
6. **Vincolo `UNIQUE(profile_id, event_id)`** (migration `20260412007`): se l'insert fallisce per violazione unique (Postgres code `23505`), ritorna errore applicativo chiaro — *"Presenza già registrata per questo evento."* — non una 500 generica. Nessun altro errore DB viene mascherato.
7. `revalidatePath('/dashboard/attendance')`.

### `confirmAttendance(attendanceId: string)` / `rejectAttendance(attendanceId: string, notes?: string)`

Valida con `attendanceStatusUpdateSchema`. L'update imposta **tutti e tre** i campi previsti dallo schema 007: `status`, `confirmed_by` (= `profiles.id` dell'utente loggato, risolto da `auth.uid()`), `confirmed_at` (= `now()`). Non solo `status` — altrimenti la colonna di audit resta orfana. `revalidatePath` dopo.

## Dipendenze nuove

- `apps/admin`: `@tanstack/react-table`, `@radix-ui/react-dialog`
- Nessuna migration, nessuna modifica schema DB → **nessun nuovo GRANT necessario**.

## Test

- `@mugen/shared`: unit test per `attendanceManualInputSchema` e `attendanceStatusUpdateSchema` in `validators.test.ts` (pattern esistente — round-trip valido/invalido, guard enum).
- Niente E2E in questa iterazione (REQ-001 §7.1 marca l'E2E come "futuro").

## Fuori scope (rimandato)

- Nascondere lato UI le azioni Conferma/Rifiuta per utenti senza permesso (oggi solo la RLS le blocca).
- A4 (Idoneità esami) — userà gli stessi dati `attendances` ma con vista/filtri dedicati.
