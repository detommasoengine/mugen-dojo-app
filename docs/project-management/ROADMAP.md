# ROADMAP: MugenDojo Monorepo

Questa Roadmap traccia l'avanzamento ad alto livello del gestionale. La strategia segue iterazioni minime e incrementali.

## Milestone 1: Infrastruttura e Dati [COMPLETATA]
- `[x]` Definizione Architettura (ADR-001) e Linee guida.
- `[x]` Inizializzazione Monorepo (`apps/mobile`, `apps/admin`, `packages/shared`).
- `[x]` Setup database Supabase iniziale (Migrations `001`-`010`).
- `[x]` Regolamentazione ruoli tramite RLS (`profiles`, helper centralizzati).
- `[x]` Strutturazione branch di Project Management.

## Milestone 2: Autenticazione e Pacchetto Shared [IN PROGRESS]
- `[x]` Configurare il client Supabase Auth su ambo le app (`@supabase/ssr` admin, `supabase-js` + AsyncStorage mobile).
- `[x]` Integrare i tipi Typescript delle tabelle autogenerandoli (`pnpm run db:types` — script funzionante).
- `[ ]` Realizzare la login screen su `apps/mobile` (Expo). **(P5, bloccante)**
- `[x]` Realizzare la login screen su `apps/admin` (Next.js) — testata con login funzionante.

## Milestone 2.5: Consolidamento decisioni di dominio [IN PROGRESS — sessione 2026-06-27/28]
- `[x]` Intervista: chiuse ~20 domande aperte (vedi `07-domande-stakeholder.md`).
- `[x]` Aggiornato `02-modello-dominio.md` con nuove entità e delta.
- `[x]` Scritti ADR-002 (multi-tenant/federazione), 003 (ruoli estesi), 004 (check-in), 005 (notifiche), 006 (AI).
- `[x]` Migrazione repo su disco scrivibile (`~/DEV Projects/AIKIDO/MugenDojo`, ext4) — disco NTFS era read-only.
- `[ ]` Commit dei doc aggiornati.

## Milestone 3: Cuore di dominio in `packages/shared` (TDD) [BACKLOG]
- `[ ]` `calculateWeightedHours` (ore × peso_evento × peso_ruolo) + breakdown per tipo/ruolo (A.3).
- `[ ]` Verifica requisiti esame Kyu/Dan (ore/mesi, idoneità, assenze B.3).
- `[ ]` Generazione calendario da `lesson_templates` (stagionali B.2) − `suspension_periods`.
- `[ ]` Schemi **Zod** + tipi condivisi. È il valore riusato da Admin e Mobile.

## Milestone 4: Delta schema DB [BACKLOG]
- `[ ]` Migration: ruolo `guest` + `is_guest`; incarichi-permessi (ADR-003).
- `[ ]` Migration: `attendance_sessions` + config check-in (ADR-004).
- `[ ]` Migration: `notifications`, `push_tokens`, `communication_recipients` (ADR-005).
- `[ ]` Migration: `membership_status`, certificato medico, template stagionali, limite assenze.
- `[ ]` Migration: `CREATE EXTENSION vector` (ADR-006). Poi `db:types` + seed.

## Milestone 5: Pannello Amministrazione (Web) [BACKLOG]
- `[ ]` Design system «Sumi & Ai» su shadcn/ui (install deps mancanti: shadcn/ui, TanStack Table, Recharts, FullCalendar).
- `[ ]` Dashboard presenze e statistiche (signature: *enso* Monte Ore).
- `[ ]` Gestione Profili (assegnazione Kyu/Dan, permessi Segretari/incarichi).
- `[ ]` Calendario, Idoneità esami, Comunicazioni.

## Milestone 6: App Studenti (Mobile) [BACKLOG]
- `[ ]` Login + struttura tab (Presenze/Calendario/Profilo/Diario).
- `[ ]` Scheda Anagrafica (livello e abilitazioni).
- `[ ]` Check-in presenze QR (`expo-barcode-scanner`, REQ-004).
- `[ ]` Diario di bordo + Glossario per grado + Monte ore.

## Milestone 7: Estensioni [BACKLOG]
- `[ ]` Notifiche email + push (ADR-005).
- `[ ]` Tracciamento pagamenti (cassiere) + UI Progetti/Laboratori.

## Futuro
- Assistente AI (RAG/pgvector, ADR-006) · Federazione multi-Dojo (ADR-002) · Gestione pagamenti completa (sez. I).

*Ultimo Aggiornamento: 2026-06-28 (sessione decisioni di dominio + migrazione ambiente)*
