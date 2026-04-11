# ROADMAP: MugenDojo Monorepo

Questa Roadmap traccia l'avanzamento ad alto livello del gestionale. La strategia segue iterazioni minime e incrementali.

## Milestone 1: Infrastruttura e Dati [COMPLETATA]
- `[x]` Definizione Architettura (ADR-001) e Linee guida.
- `[x]` Inizializzazione Monorepo (`apps/mobile`, `apps/admin`, `packages/shared`).
- `[x]` Setup database Supabase iniziale (Migrations `001`-`009`).
- `[x]` Regolamentazione ruoli tramite RLS (`profiles`).
- `[x]` Strutturazione branch di Project Management.

## Milestone 2: Autenticazione e Pacchetto Shared [IN PROGRESS]
- `[ ]` Configurare il client Supabase Auth su ambo le app.
- `[ ]` Integrare i tipi Typescript delle tabelle autogenerandoli (`pnpm run db:types`).
- `[ ]` Realizzare la login screen su `apps/mobile` (Expo).
- `[ ]` Realizzare la login screen su `apps/admin` (Next.js).

## Milestone 3: App Studenti (Mobile) [BACKLOG]
- `[ ]` Scheda Anagrafica (visualizzazione livello e abilitazioni).
- `[ ]` Modulo Scansione presenze / Appello (con `expo-barcode-scanner` / QR).
- `[ ]` Diario di bordo per gli appunti (creazione risorse).

## Milestone 4: Pannello Amministrazione (Web) [BACKLOG]
- `[ ]` Dashboard presenze e statistiche.
- `[ ]` Gestione Profili (assegnazione Kyu/Dan, permessi Segretari).
- `[ ]` Appartenenza ai Progetti (laboratori/workshop).

*Ultimo Aggiornamento: 2026-04-12*
