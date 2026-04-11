# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Progetto

**MugenDojo** — Applicazione cross-platform (Android + WebApp) per la gestione delle attività interne di un Dojo di Aikido.

## Stack tecnologico — Architettura Monorepo (confermata)

Due frontend, un backend comune:

- **App Mobile** (studenti): React Native + Expo, Expo Router, Zustand, TanStack Query
- **App Admin** (Sensei/Segretari): Next.js + TailwindCSS + shadcn/ui, TanStack Table, Recharts, FullCalendar
- **Shared package**: tipi TS (auto-generati da Supabase), Zod schema, logica business (calcolo ore, requisiti esame)
- **Backend**: Supabase (PostgreSQL + RLS, Auth, Edge Functions, Storage)
- **Monorepo**: Turborepo
- **AI (futuro)**: RAG via Supabase pgvector, LLM provider da definire

→ Dettagli in `docs/decisions/ADR-001-stack-tecnologico.md`

## Dominio

Il sistema ruota attorno a un anno accademico (1 Settembre – 31 Luglio; Agosto è sospensione). Le lezioni regolari sono Lunedì, Mercoledì, Venerdì (19:00–20:00). Esistono anche eventi speciali: stage, esami, laboratori, progetti interni.

Il conteggio ore è fondamentale: serve a verificare i requisiti per sostenere esami di passaggio Kyu/Dan. Le ore hanno un sistema di pesi configurabili (per tipo evento e per ruolo conduttore/partecipante).

## Multi-tenancy e ruoli

- **Caposcuola (Admin)**: gestione completa — utenti, calendari, comunicazioni, abilitazione segretari, configurazione pesi ore
- **Segretario Senpai (Admin Secondario)**: più segretari possibili, ciascuno con permessi granulari delegati dal Caposcuola
- **Aikidoka (Studente)**: pannello personale con registrazione attività, diario di bordo, risorse di studio
- **Senpai Conduttore**: Aikidoka autorizzato a condurre lezioni (ore attive con peso 2x configurabile)

## Documentazione

La base di conoscenza del progetto è in `docs/`:

- `docs/business/` — 7 documenti: glossario, modello dominio, ruoli, ciclo vita, calendario, risorse AI, domande stakeholder
- `docs/architecture/ENGINEERING-GUIDELINES.md` **(FILE FONDAMENTALE)** — Linee guida architetturali, convenzioni per nomi, regole operative e policy vincolanti per questo agente (e ogni sviluppatore umano/AI). DEVE essere sempre letto prima di codificare.
- `docs/requirements/` — Requisiti funzionali (REQ-001, REQ-002, REQ-003)
- `docs/design/` — UI/UX e wireframe (da definire)
- `docs/decisions/` — ADR (Architecture Decision Records)
- `docs/Knowledge/` — PDF Aikikai d'Italia (glossario, programma esami)
- `docs/BRIEFING.md` — Registro sessioni di briefing

Consultare sempre `docs/business/00-INDICE.md` per la mappa completa.

## Lingua

L'interfaccia utente e le comunicazioni sono in italiano. Il codice (variabili, commenti tecnici) in inglese.
