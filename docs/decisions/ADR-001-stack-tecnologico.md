# ADR-001 — Scelta dello Stack Tecnologico

> Stato: `[PROPOSTA FINALE]` | Data: 2026-04-11 | Da confermare prima del setup

## Contesto

MugenDojo deve essere un'applicazione cross-platform (Android + WebApp) con database cloud.
Il team ha esperienza con React e React Native (base). Budget iniziale contenuto (tier gratuiti).
Il modello dati è fortemente relazionale (utenti ↔ presenze ↔ eventi ↔ progetti).

**Vincolo architetturale chiave**: il pannello Admin (Sensei/Segretari) ha esigenze UI molto diverse dall'app studente — tabelle dati complesse, grafici, calendari drag-and-drop, esportazioni Excel, configurazioni granulari. React Native for Web non è lo strumento ottimale per interfacce "Desktop-First" di questo tipo.

## Analisi delle opzioni

### Frontend / App Studente

| Opzione | Pro | Contro |
|---------|-----|--------|
| **React Native + Expo** | Cross-platform (Android + Web), ampio ecosistema, hot reload, **esperienza pregressa del team** | Non ideale per dashboard admin complesse |
| **Flutter** | Performance nativa, Material Design, Dart tipizzato | Ecosistema web meno maturo, **nessuna esperienza nel team** |

### Frontend / Dashboard Admin

| Opzione | Pro | Contro |
|---------|-----|--------|
| **Next.js + TailwindCSS** | SSR/SSG, ottimo per webapp desktop-first, ecosistema ricchissimo di componenti tabelle/grafici/calendar | Codebase separata dal mobile |
| **React.js (Vite) + TailwindCSS** | Setup leggero, SPA pura, nessun overhead SSR | Niente SSR (meno importante per admin panel) |

### Backend / Database

| Opzione | Pro | Contro |
|---------|-----|--------|
| **Supabase** | PostgreSQL, auth integrata, RLS, real-time, API REST auto, tier gratuito, open source, **pgvector per RAG futuro** | Edge Functions meno mature di Cloud Functions |
| **Firebase** | Real-time DB, auth facile, hosting, Cloud Functions | **NoSQL inadatto** al modello relazionale complesso |
| **AWS (Amplify)** | Scalabilità massima, servizi completi | Complessità eccessiva per team piccolo, costi meno prevedibili |

### AI / LLM (feature futura — non bloccante)

| Opzione | Pro | Contro |
|---------|-----|--------|
| **Google Gemini API** | Buon rapporto qualità/prezzo, voice API, multimodale | Meno ecosistema tool |
| **OpenAI API** | Ecosistema maturo, function calling | Costi più alti |
| **Anthropic Claude API** | Reasoning eccellente, tool use | Costi più alti |

Componenti aggiuntivi per AI (fase futura):
- **RAG** via Supabase pgvector (già integrato nello stack)
- **MCP** per azioni agentiche nell'app
- Da valutare il provider in base a costi e funzionalità al momento dell'implementazione

## Decisione proposta — Architettura Monorepo

### Principio: due "facciate", un solo cuore

```
                    ┌──────────────────────────────────────┐
                    │          MONOREPO (turborepo)         │
                    │                                      │
  ┌─────────────────┼──────────────────────────────────────┼─────────────────┐
  │                 │                                      │                 │
  │   apps/mobile   │         packages/shared              │   apps/admin    │
  │                 │                                      │                 │
  │  React Native   │   ┌──────────────────────────┐      │   Next.js       │
  │  + Expo         │   │  types/     (tipi TS)    │      │   + TailwindCSS │
  │                 │   │  utils/     (logica)     │      │                 │
  │  ┌───────────┐  │   │  hooks/     (Supabase)   │      │  ┌───────────┐  │
  │  │ Android   │  │   │  constants/ (config)     │      │  │ Dashboard │  │
  │  │ (Studenti)│  │   │  validators/(Zod schema) │      │  │ Sensei/   │  │
  │  └───────────┘  │   └──────────────────────────┘      │  │ Segretari │  │
  │                 │                                      │  └───────────┘  │
  │  Expo Router    │       Codice condiviso tra           │  App Router     │
  │  Zustand        │       entrambe le app                │  TanStack Table │
  │  TanStack Query │                                      │  Recharts       │
  │                 │                                      │  DnD Calendar   │
  └─────────────────┼──────────────────────────────────────┼─────────────────┘
                    │                                      │
                    │         BACKEND COMUNE                │
                    │                                      │
                    │   Supabase (hosted)                   │
                    │   ├── PostgreSQL + RLS                │
                    │   ├── Auth (stessa istanza)           │
                    │   ├── Storage                         │
                    │   ├── Edge Functions                  │
                    │   ├── Realtime                        │
                    │   └── pgvector (RAG futuro)           │
                    │                                      │
                    └──────────────────────────────────────┘
```

### Struttura Monorepo

```
mugendojo/
├── apps/
│   ├── mobile/          # React Native + Expo (Android + Web studente)
│   │   ├── app/         # Expo Router (file-based routing)
│   │   ├── components/
│   │   └── ...
│   └── admin/           # Next.js + TailwindCSS (Dashboard Sensei/Segretari)
│       ├── app/         # App Router (file-based routing)
│       ├── components/
│       └── ...
├── packages/
│   └── shared/          # Codice condiviso
│       ├── types/       # Tipi TypeScript (generati da Supabase + custom)
│       ├── utils/       # Logica di business (calcolo ore, validazioni)
│       ├── hooks/       # Hook Supabase condivisi
│       ├── constants/   # Configurazioni, enum
│       └── validators/  # Schema Zod condivisi
├── supabase/
│   ├── migrations/      # Schema DB versionato
│   ├── functions/       # Edge Functions
│   └── seed.sql         # Dati di seed
├── turbo.json           # Configurazione Turborepo
├── package.json         # Root workspace
└── tsconfig.base.json   # Config TS condivisa
```

### Cosa va dove

| Componente | App Mobile | App Admin | Shared |
|-----------|:----------:|:---------:|:------:|
| Login / Auth | ✅ | ✅ | Hook condiviso |
| Calendario (vista) | ✅ (semplice) | ✅ (drag-and-drop) | Tipi + logica |
| Registrazione presenze | ✅ (QR, tap) | ✅ (appello, batch) | Validazione |
| Scheda personale | ✅ | ✅ (vista admin) | Tipi |
| Monte ore / progressione | ✅ | ✅ (tutti gli studenti) | Calcolo |
| Diario di bordo | ✅ | ❌ | — |
| Gestione utenti | ❌ | ✅ | Tipi |
| Configurazione Dojo | ❌ | ✅ | Schema |
| Tabelle dati complesse | ❌ | ✅ (TanStack Table) | — |
| Grafici / statistiche | ❌ | ✅ (Recharts) | — |
| Gestione Progetti | ❌ | ✅ | Tipi + logica |
| Esportazione Excel | ❌ | ✅ | — |
| Risorse di studio | ✅ (consultazione) | ✅ (gestione) | Tipi |

### Stack per ciascuna app

#### apps/mobile (Studenti + consultazione)
- React Native + Expo SDK
- Expo Router (navigazione)
- Zustand (state locale)
- TanStack Query (data fetching + cache offline)
- React Native Paper o Tamagui (UI components)
- Supabase JS client

#### apps/admin (Sensei + Segretari)
- Next.js 14+ (App Router)
- TailwindCSS + shadcn/ui (UI desktop-first, componenti pronti e personalizzabili)
- TanStack Table (tabelle dati avanzate con sorting, filtri, paginazione)
- Recharts o Chart.js (grafici e statistiche)
- React Big Calendar o FullCalendar (calendario drag-and-drop)
- TanStack Query (data fetching)
- Supabase JS client (stessa istanza)

#### packages/shared
- TypeScript types (auto-generati da Supabase + custom)
- Zod schema (validazione condivisa frontend ↔ backend)
- Utility functions (calcolo monte ore, verifica requisiti esame, logica pesi)
- Supabase hooks/helpers condivisi
- Costanti e enum (ruoli, tipi evento, stati presenza)

### Motivazioni

1. **Due frontend, un backend**: il backend Supabase è unico. Auth, RLS, database, storage sono condivisi. Non c'è duplicazione di logica server.

2. **Ogni piattaforma usa lo strumento migliore**: React Native eccelle per app mobile. Next.js + TailwindCSS eccelle per dashboard web desktop-first. Forzare uno nei contesti dell'altro produce compromessi.

3. **Codice condiviso massimizzato**: tipi TypeScript, validazioni Zod, logica di business (calcolo ore, requisiti esame) sono nel package shared. Si scrive una volta, si usa ovunque.

4. **shadcn/ui per l'admin**: componenti copiati nel progetto (non dependency), completamente personalizzabili, basati su Radix UI + TailwindCSS. Ideali per form complessi, tabelle, dialog.

5. **Turborepo**: orchestrazione build/dev/lint efficiente, caching intelligente, parallelizzazione.

6. **Il team sa React**: entrambe le app usano React. La curva di apprendimento è Next.js (minimale per chi conosce React) e TailwindCSS.

### Tier gratuito Supabase (limiti iniziali)

| Risorsa | Limite free |
|---------|------------|
| Database | 500 MB |
| Storage | 1 GB |
| Auth Users | Illimitati (50K MAU) |
| Edge Functions | 500K invocazioni/mese |
| Realtime | 200 connessioni simultanee |
| Bandwidth | 5 GB/mese |

Ampiamente sufficiente per la fase iniziale (team interno Dojo).

## Conseguenze

### Vantaggi
- Ogni piattaforma ha l'UX ottimale (mobile-first per studenti, desktop-first per admin)
- Codebase TypeScript end-to-end con massimo riuso
- Auto-generazione tipi dal DB schema (condivisi tra le due app)
- Auth + RLS risolvono multi-tenancy senza codice custom
- Percorso chiaro verso RAG (pgvector)
- Scalabile: si può aggiungere una terza app (es. app iOS) senza toccare backend o shared

### Rischi e mitigazioni
| Rischio | Mitigazione |
|---------|------------|
| Complessità monorepo | Turborepo gestisce la complessità; la struttura è chiara fin dall'inizio |
| Due app da mantenere | Il codice shared minimizza la duplicazione; le UI sono intrinsecamente diverse |
| Supabase Edge Functions meno mature | Per logica complessa si può aggiungere un server Express/Fastify nel monorepo |
| Vendor lock-in Supabase | Supabase è open-source, self-hostable come fallback |
| Offline support (mobile) | TanStack Query + persistenza AsyncStorage |

## Prossimi passi dopo conferma

1. Inizializzare monorepo con Turborepo
2. Creare progetto Supabase
3. Setup `apps/mobile` (Expo) e `apps/admin` (Next.js)
4. Setup `packages/shared` (tipi, utils, validators)
5. Definire schema database PostgreSQL
6. Implementare RLS policies per i ruoli
7. Primo flusso end-to-end: Auth → Login → Dashboard base
