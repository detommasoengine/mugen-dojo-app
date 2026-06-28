# Engineering Guidelines — MugenDojo

> Stato: `[IN REVISIONE]` | Ultimo aggiornamento: 2026-04-11
> Questo documento definisce le regole operative, le convenzioni e le best practices da seguire nello sviluppo del progetto.
> Ogni agente o sviluppatore deve consultare questo file prima di procedere con qualsiasi operazione.

---

## 1. Struttura del Monorepo

### 1.1 — Layout cartelle (obbligatorio)

```
mugendojo/
├── apps/
│   ├── mobile/              # React Native + Expo (studenti)
│   │   ├── app/             # Expo Router — file-based routing
│   │   ├── components/      # Componenti UI specifici mobile
│   │   ├── assets/          # Immagini, font, icone
│   │   └── ...
│   └── admin/               # Next.js + TailwindCSS (Sensei/Segretari)
│       ├── app/             # App Router — file-based routing
│       ├── components/      # Componenti UI specifici admin
│       ├── assets/
│       └── ...
├── packages/
│   └── shared/              # Codice condiviso (MAI logica UI)
│       └── src/
│           ├── types/       # Tipi TypeScript (inclusi quelli auto-generati da Supabase)
│           ├── utils/       # Funzioni pure di logica business
│           ├── validators/  # Schema Zod
│           ├── constants/   # Enum, config, valori di default
│           └── hooks/       # Hook Supabase condivisi (data fetching)
├── supabase/
│   ├── migrations/          # File SQL numerati progressivamente
│   ├── functions/           # Edge Functions (Deno/TypeScript)
│   └── seed.sql             # Dati di sviluppo
├── docs/                    # Documentazione (persistente, versionata)
├── turbo.json
├── package.json
└── tsconfig.base.json
```

### 1.2 — Regole di collocazione

| Tipo di codice | Dove va | Dove NON va |
|---------------|---------|-------------|
| Tipo TS condiviso tra app | `packages/shared/src/types/` | Dentro una singola app |
| Logica di business (calcolo ore, requisiti) | `packages/shared/src/utils/` | Dentro un componente UI |
| Schema Zod per validazione | `packages/shared/src/validators/` | Duplicato in entrambe le app |
| Componente UI mobile | `apps/mobile/components/` | `packages/shared/` |
| Componente UI admin | `apps/admin/components/` | `packages/shared/` |
| Migration SQL | `supabase/migrations/` | Mai modificare migration già committate |
| Edge Function | `supabase/functions/` | Dentro le app frontend |

### 1.3 — Regola d'oro

> **Se un pezzo di logica serve a entrambe le app → va in `packages/shared`.**
> **Se è specifico di una UI → va nella rispettiva app.**
> **Mai duplicare codice tra `apps/mobile` e `apps/admin`.**

---

## 2. Convenzioni di naming

### 2.1 — File e cartelle

| Contesto | Convenzione | Esempio |
|----------|-------------|---------|
| Componenti React | PascalCase | `AttendanceCard.tsx` |
| Hook | camelCase con prefisso `use` | `useAttendance.ts` |
| Utility functions | camelCase | `calculateHours.ts` |
| Tipi/Interfacce | PascalCase con suffisso | `Attendance.types.ts` |
| Schema Zod | camelCase con suffisso `Schema` | `attendanceSchema.ts` |
| Costanti | SCREAMING_SNAKE_CASE | `EXAM_REQUIREMENTS.ts` |
| File route (Expo/Next) | kebab-case | `attendance-list.tsx` |
| Migration SQL | timestamp progressivo | `20260411_001_create_users.sql` |
| Edge Function | kebab-case | `validate-attendance/index.ts` |

### 2.2 — Codice

| Contesto | Convenzione | Esempio |
|----------|-------------|---------|
| Variabili e funzioni | camelCase (inglese) | `totalHours`, `calculateWeightedHours()` |
| Tipi e interfacce | PascalCase (inglese) | `Aikidoka`, `AttendanceRecord` |
| Enum values | SCREAMING_SNAKE_CASE | `EventType.STAGE`, `Role.CAPOSCUOLA` |
| Tabelle DB | snake_case (inglese) | `attendance_records`, `exam_requirements` |
| Colonne DB | snake_case (inglese) | `total_hours`, `created_at` |
| RLS Policies | descrittive in inglese | `"Users can view own attendance"` |
| Commenti codice | Inglese (brevi) | `// Weighted hours = effective × event weight × role weight` |
| UI labels / testi utente | Italiano | `"Monte Ore"`, `"Registra Presenza"` |

### 2.3 — Mapping dominio → codice

I termini del dominio Aikido vengono tradotti in inglese nel codice:

| Dominio (italiano) | Codice (inglese) | Tabella DB |
|-------|--------|------------|
| Dojo | `Dojo` | `dojos` |
| Aikidoka | `Aikidoka` | `aikidokas` (o `users`) |
| Caposcuola | `Role.HEAD_MASTER` | `role = 'head_master'` |
| Segretario | `Role.SECRETARY` | `role = 'secretary'` |
| Presenza | `Attendance` | `attendances` |
| Lezione | `Event` (type: LESSON) | `events` |
| Stage | `Event` (type: STAGE) | `events` |
| Monte Ore | `totalHours` / `weightedHours` | calcolato |
| Grado (Kyu/Dan) | `Grade` | `grades` |
| Scheda | `AikidokaProfile` | `aikidoka_profiles` |
| Diario di Bordo | `Journal` | `journals` |
| Progetto | `Project` | `projects` |
| Laboratorio | `Workshop` | `workshops` |

---

## 3. Workflow Git

### 3.1 — Branching strategy

```
main ──────────────────────────────────────────────►
  │
  ├── develop ─────────────────────────────────────►
  │     │
  │     ├── feature/TASK-001-auth-setup ──► PR → develop
  │     ├── feature/TASK-002-db-schema  ──► PR → develop
  │     ├── fix/TASK-010-attendance-calc ──► PR → develop
  │     └── ...
  │
  └── release/v0.1.0 ──► PR → main (con tag)
```

- **`main`**: sempre stabile e deployabile
- **`develop`**: integrazione delle feature, base per le PR
- **`feature/*`**: una branch per ogni task/feature
- **`fix/*`**: una branch per ogni bugfix
- **`release/*`**: preparazione release

### 3.2 — Regole commit

Formato: [Conventional Commits](https://www.conventionalcommits.org/)

```
<type>(<scope>): <descrizione breve>

[corpo opzionale]

[footer opzionale]
```

**Types consentiti**:

| Type | Uso |
|------|-----|
| `feat` | Nuova funzionalità |
| `fix` | Bugfix |
| `docs` | Solo documentazione |
| `style` | Formattazione (no logic change) |
| `refactor` | Refactoring (no feat, no fix) |
| `test` | Aggiunta/modifica test |
| `chore` | Configurazione, tooling, dipendenze |
| `db` | Migration database |

#### Regola Aurea dei Commit Progressivi
Ogni progressione logica di sviluppo (es. "scaffolding monorepo", "configurazione database", "creazione componente X") DEVE aver il suo commit dedicato prima di passare al blocco successivo. **Vietati** i commit monolitici di fine giornata. Questa prassi permette ad AI agenti e umani di ritornare ad uno status funzionante facilmente in caso di bug.

**Scopes consentiti**: `mobile`, `admin`, `shared`, `supabase`, `docs`, `root`

**Esempi**:
```
feat(shared): add weighted hours calculation utility
fix(mobile): correct QR code attendance registration flow
db(supabase): add events table and RLS policies
docs: update domain model with project entity
chore(root): configure turborepo caching
```

### 3.3 — Regole PR e review

1. **Ogni PR deve avere**:
   - Titolo che segue Conventional Commits
   - Descrizione con contesto ("perché") e checklist di test
   - Almeno 1 review prima del merge (anche self-review per team di 1, con checklist)
   - CI green (lint + type-check + test)

2. **Mai push diretto su `main` o `develop`** — sempre via PR

3. **Squash merge** su develop, **merge commit** su main (per storico pulito)

### 3.4 — Checklist pre-commit (da automatizzare con husky)

- [ ] `pnpm run lint` passa senza errori
- [ ] `pnpm run typecheck` passa senza errori
- [ ] `pnpm run test` passa (se ci sono test per il modulo toccato)
- [ ] Nessun `console.log` lasciato nel codice
- [ ] Nessun segreto (.env, API key) nel commit
- [ ] I tipi shared sono aggiornati se lo schema DB è cambiato

---

## 4. Database e Migration

### 4.1 — Regole migration

1. **Ogni modifica allo schema DB è una migration separata**
2. **Mai modificare una migration già committata** — crearne una nuova
3. **Naming**: `YYYYMMDDNNN_descrizione.sql` (es. `20260412001_create_users.sql`) — nessun underscore tra data e sequenza, così Supabase legge ogni version come numero univoco
4. **Ogni migration deve essere idempotente dove possibile** (es. `CREATE TABLE IF NOT EXISTS`)
5. **Includere sempre il rollback** come commento in fondo al file
6. **RLS policies**: definite nella stessa migration della tabella corrispondente

### 4.2 — Aggiornamento tipi

Dopo ogni migration:
```bash
npx supabase gen types typescript --local > packages/shared/src/types/database.types.ts
```
I tipi auto-generati vanno committati insieme alla migration.

### 4.3 — Seed data

- `supabase/seed.sql` contiene dati di sviluppo realistici
- Mai dati di produzione nel seed
- Il seed deve essere rieseguibile senza errori (usa `INSERT ... ON CONFLICT DO NOTHING`)

---

## 5. Gestione della documentazione

### 5.1 — Regola fondamentale

> **La documentazione in `docs/` è una base persistente viva.**
> Ogni modifica significativa al dominio, all'architettura o ai requisiti DEVE essere riflessa nei documenti corrispondenti.

### 5.2 — Quando aggiornare la documentazione

| Evento | Documento da aggiornare |
|--------|------------------------|
| Nuova entità nel modello | `docs/business/02-modello-dominio.md` |
| Nuovo termine di dominio | `docs/business/01-glossario-dominio.md` |
| Cambio ruoli/permessi | `docs/business/03-attori-ruoli.md` |
| Nuova regola di business | Documento business pertinente |
| Decisione architetturale | Nuovo ADR in `docs/decisions/` |
| Cambio schema DB | Migration + aggiornamento modello dominio |
| Nuova domanda da discutere | `docs/business/07-domande-stakeholder.md` |
| Sessione di briefing | `docs/BRIEFING.md` |

### 5.3 — ADR (Architecture Decision Records)

Ogni decisione architetturale significativa va documentata in `docs/decisions/`:
- Naming: `ADR-NNN-titolo.md`
- Formato: Contesto → Opzioni → Decisione → Conseguenze
- Le ADR non si cancellano: se una decisione viene ribaltata, si crea una nuova ADR che referenzia la precedente

### 5.4 — CLAUDE.md

Il file `CLAUDE.md` nella root è il punto di ingresso per gli agenti AI. Deve essere aggiornato quando:
- Cambia lo stack tecnologico
- Cambia la struttura delle cartelle
- Vengono aggiunti comandi di build/dev/test
- Cambiano le convenzioni fondamentali

---

## 6. Sviluppo e tooling

### 6.1 — Comandi standard (da configurare in turbo.json)

| Comando | Scope | Descrizione |
|---------|-------|-------------|
| `pnpm run dev` | Root | Avvia tutte le app in parallelo |
| `pnpm run dev:mobile` | apps/mobile | Avvia Expo dev server |
| `pnpm run dev:admin` | apps/admin | Avvia Next.js dev server |
| `pnpm run build` | Root | Build di tutte le app |
| `pnpm run lint` | Root | Lint di tutto il monorepo |
| `pnpm run typecheck` | Root | Type-check TypeScript |
| `pnpm run test` | Root | Esegue tutti i test |
| `pnpm run db:migrate` | supabase | Applica migration pendenti |
| `pnpm run db:reset` | supabase | Reset DB + seed |
| `pnpm run db:types` | supabase → shared | Rigenera tipi TS dal DB |

### 6.2 — Generazione moduli (da implementare)

Per mantenere consistenza, si useranno script/template per generare moduli:

```bash
# Generare un nuovo componente (futuro)
pnpm run generate:component -- --app=mobile --name=AttendanceCard

# Generare una nuova migration
pnpm run generate:migration -- --name=add_projects_table

# Generare un nuovo Edge Function
pnpm run generate:function -- --name=validate-attendance
```

> **NOTA**: Questi generatori saranno implementati incrementalmente. Fino ad allora, seguire manualmente le convenzioni di naming e collocazione definite sopra.

### 6.3 — Variabili d'ambiente

- `.env` nella root (per Supabase URL e key comuni)
- `.env.local` nelle singole app (per override locali)
- **Mai committare file `.env`** — usare `.env.example` come template

```
# .env.example
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### 6.4 — Dipendenze e Package Manager

- **Package Manager Ufficiale: `pnpm`** (scelto per gestire il Monorepo Turborepo in virtù della sua gestione hard-link dei workspace e della velocità estrema).
- **Dipendenze condivise** (Supabase client, Zod): in `packages/shared`
- **Dipendenze UI specifiche**: nella rispettiva app
- **Aggiornamenti**: usare `pnpm update -r` o aggiornare manualmente, mai in mezzo a una feature.
- **Lock file**: `pnpm-lock.yaml` va sempre committato (non usare package-lock.json).

### 6.5 — Validatori Zod (dove e quando)

**Perché lo stack** — Deciso in [ADR-001](../decisions/ADR-001-stack-tecnologico.md): Zod vive in `packages/shared/src/validators/` ed è la **single source of truth** per la validazione condivisa dalle due app (si scrive una volta, si usa ovunque) e per l'inferenza dei tipi di input. È l'esecuzione della regola di **validazione doppia** (§8.1.3): Zod al boundary + constraint DB.

**Dove applicare la validazione**:
- **Form** (admin + mobile): create/update di profilo, evento, presenza, configurazione Dojo, permessi, comunicazioni.
- **Input non fidato**: payload del token di check-in QR/NFC (REQ-004 / [ADR-004](../decisions/ADR-004-check-in-presenze.md)), deep link, query di ricerca.
- **Edge Functions** (futuro): validare il body prima di ogni operazione.
- **Invarianti di dominio** non coperti da un singolo constraint: `ends_at > starts_at`, `grade_filter_min <= grade_filter_max`, pesi/ore `>= 0`.

**Quando**:
- **Ora**: schemi per le entità a **schema stabile** (già migrato) + gli input della business logic (ore/esami).
- **Rinviato**: gli schemi dietro migration pendenti (`guest`, `attendance_sessions`, `notifications`…) seguono il relativo delta schema (evita drift). I `*Schema` sono allineati agli enum DB tramite guard `satisfies` a compile-time.

**Convenzioni**: file `camelCase`, export `xxxSchema` + tipo inferito `XxxInput` (vedi §3 naming). Logica di business assume input già validato; Zod fa da guardia.

---

## 7. Testing

### 7.1 — Strategia

| Livello | Tool | Cosa testa | Dove |
|---------|------|------------|------|
| Unit test | Vitest | Logica business, utils, validators | `packages/shared/` |
| Integration test | Vitest + Supabase local | Query DB, RLS policies | `supabase/` |
| Component test | React Testing Library | Componenti UI isolati | `apps/*/` |
| E2E (futuro) | Playwright / Detox | Flussi completi | Root |

### 7.2 — Regole

- Ogni utility in `packages/shared/src/utils/` deve avere test unitari
- Le RLS policies devono avere test di integrazione (utente può/non può accedere)
- I test devono passare prima di ogni PR
- Coverage minima target: 80% per `packages/shared`

---

## 8. Sicurezza

### 8.1 — Regole non negoziabili

1. **RLS sempre attivo**: ogni tabella Supabase deve avere Row Level Security abilitato
2. **Mai usare `service_role` key nel frontend** — solo `anon` key
3. **Validazione doppia**: Zod nel frontend + constraint DB nel backend
4. **Nessun segreto nel codice** — tutto in `.env`, mai committato
5. **Sanitizzare input utente** — specialmente per ricerca e testi liberi (diario, note)

### 8.2 — RLS pattern standard

```sql
-- Esempio: gli Aikidoka vedono solo le proprie presenze
CREATE POLICY "Users can view own attendance"
  ON attendances FOR SELECT
  USING (user_id = auth.uid());

-- I Caposcuola vedono tutte le presenze del proprio Dojo
CREATE POLICY "Head masters can view all dojo attendance"
  ON attendances FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'head_master'
      AND users.dojo_id = attendances.dojo_id
    )
  );
```

---

## 9. Procedura operativa per nuove feature

### Checklist da seguire per ogni nuova funzionalità:

```
1. [ ] Verificare che la feature sia documentata nei requisiti (docs/requirements/)
2. [ ] Creare branch: feature/TASK-NNN-descrizione
3. [ ] Se serve modifica DB:
   a. [ ] Scrivere migration in supabase/migrations/
   b. [ ] Aggiornare tipi: pnpm run db:types
   c. [ ] Aggiornare docs/business/02-modello-dominio.md se necessario
4. [ ] Scrivere logica condivisa in packages/shared/ (se serve a entrambe le app)
5. [ ] Implementare UI nella app pertinente (mobile e/o admin)
6. [ ] Scrivere test (almeno per la logica shared)
7. [ ] Verificare lint + typecheck + test
8. [ ] Aprire PR con descrizione e checklist
9. [ ] Review (anche self-review con checklist)
10. [ ] Merge su develop
11. [ ] Aggiornare documentazione se il dominio è cambiato
```

---

## 10. Convenzioni per agenti AI

### 10.1 — Prima di scrivere codice

- Leggere `CLAUDE.md` per il contesto generale
- Leggere questo file per le regole operative
- Consultare `docs/business/` per il dominio
- Verificare i tipi in `packages/shared/src/types/`

### 10.2 — Dopo aver scritto codice

- Verificare che il codice rispetti le convenzioni di naming
- Verificare la collocazione corretta (shared vs app-specific)
- Aggiornare la documentazione se il dominio è cambiato
- Non committare senza aver verificato lint e typecheck

### 10.3 — Quando si ha un dubbio

- Consultare `docs/business/07-domande-stakeholder.md` — potrebbe essere già stato discusso
- Se la domanda non è presente, aggiungerla al documento e chiedere all'utente
- Non assumere: chiedere piuttosto che inventare
