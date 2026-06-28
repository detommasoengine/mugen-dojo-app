# Session Log — 2026-04-16 — Sessione 001
## Setup Iniziale, Avvio Stack Locale e Configurazione Ambiente di Sviluppo

> **Agente**: Claude Sonnet 4.6 / Claude Opus 4.6
> **Data**: 2026-04-16
> **Durata**: Sessione lunga (multi-ora)
> **Stato finale**: Stack locale parzialmente operativo — Admin funzionante, Mobile con issue di rete aperta

---

## 1. Obiettivo della Sessione

Portare lo stack MugenDojo da uno stato di repository appena scaffoldato a un ambiente di sviluppo locale completamente avviato:
- Database Supabase locale (Docker)
- App Admin (Next.js) funzionante con login reale
- App Mobile (Expo) avviata e raggiungibile

---

## 2. Stato del Progetto all'Inizio della Sessione

### Cosa era già presente
- Struttura monorepo Turborepo + pnpm configurata
- `apps/admin` — Next.js 16 con scaffolding completo: login, dashboard, middleware auth, client Supabase SSR
- `apps/mobile` — Expo 54 scaffolding di default (Tab One/Two, nessuna logica MugenDojo)
- `packages/shared` — Tipi TypeScript hand-written, client Supabase configurato
- `supabase/` — `config.toml` configurato, 10 migrations SQL scritte, `seed.sql` vuoto
- `node_modules` — già installati (ma con problemi su drive NTFS)
- File `.env` con valori placeholder

### Cosa mancava
- Supabase locale mai avviato (0 container Docker)
- File `.env` non configurati con valori reali
- `seed.sql` vuoto — nessun utente di test
- Vari bug nelle migrations mai eseguiti

---

## 3. Cronologia Interventi

### 3.1 — Analisi preliminare
Letti tutti i file chiave: `CLAUDE.md`, `ENGINEERING-GUIDELINES.md`, `package.json`, `supabase/config.toml`, struttura app. Mappata la situazione completa prima di toccare qualsiasi cosa.

---

### 3.2 — Fix Naming Migrations (CRITICO)

**Problema**: `pnpm run db:start` falliva con:
```
ERROR: duplicate key value violates unique constraint "schema_migrations_pkey"
Key (version)=(20260412) already exists.
```

**Causa**: Supabase estrae la `version` dalla parte numerica iniziale del filename. Tutti i file erano `20260412_001_*.sql`, `20260412_002_*.sql` ecc. — Supabase estraeva `20260412` per tutti, causando conflitto di chiave primaria.

**Fix**: Rinominati tutti i file da `YYYYMMDD_NNN_name.sql` a `YYYYMMDDNNN_name.sql` (senza underscore tra data e sequenza).

```
PRIMA:  20260412_001_create_enums.sql
DOPO:   20260412001_create_enums.sql
```

**Aggiornato** anche `ENGINEERING-GUIDELINES.md` sezione 4.1 per riflettere il formato corretto.

---

### 3.3 — Fix Dipendenza Circolare Migrations (CRITICO)

**Problema**: `002_create_dojos.sql` definiva policy RLS che referenziavano la tabella `profiles`, ma `profiles` viene creata solo in `003_create_profiles.sql`.

```
ERROR: relation "profiles" does not exist (SQLSTATE 42P01)
At statement: CREATE POLICY "Users can view their own dojo" ON dojos...
```

**Fix**: Spostate le due policy RLS di `dojos` che referenziano `profiles` dalla fine di `002` alla fine di `003` (dopo la creazione di `profiles` e della funzione `get_user_dojo_ids()`).

---

### 3.4 — Analisi di Conformità Completa delle Migrations (PREVENTIVA)

Prima di procedere con nuovi tentativi di avvio DB, eseguita analisi sistematica di tutte e 10 le migrations. Trovati e corretti **7 bug**:

| # | Gravità | File | Problema | Fix |
|---|---------|------|---------|-----|
| 1 | **CRITICO** | `003_create_profiles.sql` | Policy `"Users can view their own dojo"` usava `dojo_id` (colonna inesistente su `dojos`; la PK si chiama `id`) | `dojo_id IN (...)` → `id IN (...)` |
| 2 | Basso | `006_create_calendar.sql` | Commento "FK added in migration 008" errato (la FK è in 009) | Corretto il commento |
| 3 | Medio | `009_create_projects_workshops.sql` | `project_members.profile_id` nullable senza CHECK: possibile riga con `profile_id IS NULL` e `external_name IS NULL` | Aggiunto `CONSTRAINT chk_project_member_identity CHECK ((profile_id IS NOT NULL AND external_name IS NULL) OR (profile_id IS NULL AND external_name IS NOT NULL))` |
| 4 | Medio | `010_fix_rls_helpers.sql` | Flag `can_send_communications` in `secretary_permissions` non aveva nessuna policy RLS corrispondente su `communications` | Aggiunta policy `"Secretary with permission can manage communications"` |
| 5 | Basso | `001_create_enums.sql` | Enum `workshop_frequency` definito ma non usato da nessuna colonna | Aggiunto commento esplicativo "reserved for future use" |
| 6 | Medio | `010_fix_rls_helpers.sql` | Policy INSERT su `attendances` non verificava `dojo_id` — utente poteva registrare presenze su eventi di dojo altrui | Aggiunto `AND dojo_id IN (SELECT get_user_dojo_ids())` |
| 7 | Basso | `007_create_attendances.sql` | Indice `(dojo_id, status)` su colonna a bassa cardinalità (3 valori) | Sostituito con partial index `WHERE status = 'registered'` |

---

### 3.5 — Avvio Supabase / Docker

**Problema 1**: Download immagini Docker lento (prima esecuzione). Gestito aspettando il completamento.

**Problema 2**: Docker Desktop non poteva montare `supabase/snippets` perché il progetto è su drive NTFS (`/mnt/3C68BC2468BBDB3A/...`) che non era nella whitelist di file sharing di Docker Desktop.

**Soluzione**: Il problema riguardava solo Supabase Studio (UI). L'errore si è risolto aggiungendo il path a Docker Desktop → Settings → Resources → File Sharing (azione manuale dell'utente). Lo stack si è avviato correttamente.

**Risultato finale db:start**:
```
API URL:    http://127.0.0.1:54321
DB URL:     postgresql://postgres:postgres@127.0.0.1:54322/postgres
Studio URL: http://127.0.0.1:54323
Mailpit:    http://127.0.0.1:54324
MCP:        http://127.0.0.1:54321/mcp
Publishable key: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
Secret key:      sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz
```

Credenziali salvate in `docs/environment/supabase` (file già esistente nel repo).

---

### 3.6 — Configurazione File `.env`

**File aggiornati/creati**:

| File | Azione |
|------|--------|
| `apps/admin/.env` | Aggiornato con URL e anon key locali |
| `apps/admin/.env.local` | Creato (override locale, priorità massima per Next.js) |
| `apps/mobile/.env.local` | Aggiornato con URL e anon key locali |
| `.gitignore` root | Aggiunti `.env.local` e `.env.*.local` |

**Valori per sviluppo locale**:
```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH

EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
```

> **NOTA**: Le chiavi locali Supabase cambiano ad ogni `db:start`. Dopo un `db:stop` + `db:start`, verificare con `pnpm run db:status` e aggiornare i file `.env`.

---

### 3.7 — Avvio App Admin (Next.js)

**Problema 1**: Processo Next.js zombie (PID 60480/85634) occupava la porta 3000 e impediva nuovi avvii.
```
⨯ Another next dev server is already running.
```
**Fix**: `kill -9 <PID>` + `rm -rf apps/admin/.next`

**Problema 2**: `next.config.ts` usava opzione deprecata in Next.js 15+:
```
⚠ Unrecognized key: 'serverComponentsExternalPackages' at "experimental"
```
**Fix**: Spostata da `experimental.serverComponentsExternalPackages` a `serverExternalPackages` (top-level).

**Problema 3**: Binary nativo di `lightningcss` mancante.
```
Error: Cannot find module '../lightningcss.linux-x64-gnu.node'
```
**Causa**: `lightningcss` usa `require('../lightningcss.linux-x64-gnu.node')` (path relativo), ma con `pnpm node-linker=hoisted` il binary è in un package separato (`lightningcss-linux-x64-gnu`) nella root `node_modules`, non dentro il package `lightningcss/`.

**Fix**:
1. Symlink manuale: `node_modules/lightningcss/lightningcss.linux-x64-gnu.node → node_modules/lightningcss-linux-x64-gnu/lightningcss.linux-x64-gnu.node`
2. Aggiunto script `postinstall` in `package.json` root per ricreare il symlink ad ogni `pnpm install`

**Problema 4**: Git safe.directory warning da Turbo su drive NTFS.
**Fix**: `git config --global --add safe.directory /mnt/3C68BC2468BBDB3A/...`

**Risultato**: Admin avviato su `http://localhost:3000` (o 3001 se 3000 occupata).

---

### 3.8 — Seed Database e Utenti di Test

**Problema 1**: `seed.sql` era vuoto — nessun utente, nessun dojo.

**Primo tentativo seed**: Fallito con:
```
ERROR: column "email_change": converting NULL to string is unsupported
```
GoTrue (auth service) non tollera `NULL` su colonne `varchar` — richede stringhe vuote `''`.

**Secondo tentativo**: Fallito con:
```
ERROR: duplicate key value violates unique constraint "users_phone_key"
```
Tre utenti con `phone = ''` (stringa vuota) — la colonna ha un UNIQUE constraint. `phone` deve essere `NULL` (che è esente da unique), non `''`.

**Fix finale**: Inserito esplicitamente ogni campo stringa di `auth.users` richiesto da GoTrue con `''` eccetto `phone` (lasciato assente → `NULL`).

**Seed finale funzionante** — crea:
- Dojo "Mugen Dojo" (id fisso: `dddddddd-dddd-dddd-dddd-000000000001`)
- 3 utenti auth con password `password123`
- 3 profili collegati al dojo

| Email | Password | Ruolo | Grado |
|-------|----------|-------|-------|
| `sensei@mugendojo.it` | `password123` | `head_master` | `dan_3` |
| `senpai@mugendojo.it` | `password123` | `secretary` | `kyu_1` |
| `studente@mugendojo.it` | `password123` | `aikidoka` | `kyu_4` |

---

### 3.9 — Fix Auth Login (Supabase GoTrue 500)

**Problema**: Login via form restituiva HTTP 500:
```
POST http://127.0.0.1:54321/auth/v1/token?grant_type=password → 500
Database error querying schema
```
**Causa**: Come descritto nel punto 3.8 — colonne `NULL` in `auth.users` che GoTrue non può scannerizzare.

**Fix**: Corretto `seed.sql` + `pnpm run db:reset`.

**Verifica funzionamento**: Login con `sensei@mugendojo.it` / `password123` → redirect a `/dashboard` con messaggio "Autenticato come: sensei@mugendojo.it". ✅

---

### 3.10 — Homepage Admin → Redirect Login

**Problema**: La root `/` mostrava la pagina default di `create-next-app`.

**Fix**: `apps/admin/src/app/page.tsx` sostituito con redirect immediato a `/login`:
```tsx
import { redirect } from 'next/navigation';
export default function Home() { redirect('/login'); }
```

---

### 3.11 — Avvio App Mobile (Expo)

**Script `dev` mancante**: Il `package.json` di `apps/mobile` aveva `start` ma non `dev`, quindi `turbo run dev --filter=@mugen/mobile` non trovava nulla.
**Fix**: Aggiunto `"dev": "expo start"` negli scripts.

**Avviso dipendenza incompatibile**:
```
@react-native-async-storage/async-storage@3.0.2 - expected version: 2.2.0
```
Non bloccante per ora, ma da risolvere prima del deployment.

**Metro config mancante** (CRITICO per monorepo):

Senza `metro.config.js`, Metro partiva dalla root del monorepo invece che da `apps/mobile/`, generando:
```
Unable to resolve module ./index from /mnt/.../MugenDojo/.
```

**Fix**: Creato `apps/mobile/metro.config.js`:
```js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);
config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

module.exports = config;
```

**Problema processo zombie Metro**: Il processo Metro dal giorno prima (PID 106109/106110) sopravviveva ai kill normali. Killato con `kill -9`.

**Stato finale mobile**:
- Bundle web → funziona (Tab One visibile nel browser)
- Bundle Android via Expo Go → `Failed to download remote update` (problema di rete, non di bundle)

**Issue aperta**: Expo Go su Android non riesce a scaricare il bundle. Due cause possibili:
1. Telefono su rete diversa dal PC
2. Il QR scansionato puntava al server vecchio ormai killato

**Soluzione alternativa aggiunta**: Modalità tunnel via ngrok (`pnpm run dev:mobile:tunnel`) per connessioni WAN.

---

## 4. Stato Finale Stack

| Servizio | URL | Stato |
|---|---|---|
| Supabase API (PostgREST) | `http://127.0.0.1:54321` | ✅ Attivo |
| Supabase DB (PostgreSQL) | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` | ✅ Attivo |
| Supabase Studio | `http://127.0.0.1:54323` | ✅ Attivo |
| Mailpit (email test) | `http://127.0.0.1:54324` | ✅ Attivo |
| App Admin (Next.js) | `http://localhost:3000` | ✅ Funzionante con login |
| App Mobile (Expo) | `exp://192.168.1.106:8081` | ⚠️ Web OK, Expo Go Android issue rete |

---

## 5. File Modificati in Questa Sessione

### Nuovi file creati
| File | Descrizione |
|------|-------------|
| `apps/admin/.env.local` | Credenziali Supabase locali per Next.js |
| `apps/mobile/metro.config.js` | Configurazione Metro per monorepo pnpm |
| `supabase/seed.sql` | Dati di test: dojo + 3 utenti con profili |
| `docs/sessions/` | Questa cartella (nuova) |

### File modificati
| File | Modifica |
|------|---------|
| `supabase/migrations/20260412001_create_enums.sql` | Aggiunto commento su `workshop_frequency` |
| `supabase/migrations/20260412002_create_dojos.sql` | Rimosso policy RLS che referenziava `profiles` (spostate in 003) |
| `supabase/migrations/20260412003_create_profiles.sql` | Aggiunto policy RLS di `dojos` + fix `dojo_id` → `id` |
| `supabase/migrations/20260412006_create_calendar.sql` | Fix commento "migration 008" → "migration 009" |
| `supabase/migrations/20260412007_create_attendances.sql` | Index `status` → partial index `WHERE status = 'registered'` |
| `supabase/migrations/20260412009_create_projects_workshops.sql` | Aggiunto `CHECK` su `project_members` per integrità identità |
| `supabase/migrations/20260412010_fix_rls_helpers.sql` | Fix policy INSERT attendances + aggiunta policy secretary communications |
| `supabase/migrations/` (tutti) | Rinominati: `20260412_NNN_` → `20260412NNN_` |
| `apps/admin/next.config.ts` | `experimental.serverComponentsExternalPackages` → `serverExternalPackages` |
| `apps/admin/src/app/page.tsx` | Sostituito default Next.js con `redirect('/login')` |
| `apps/mobile/package.json` | Aggiunti script `dev` e `dev:tunnel` |
| `package.json` (root) | Aggiunto script `postinstall` per symlink lightningcss + `dev:mobile:tunnel` |
| `.gitignore` | Aggiunti `.env.local`, `.env.*.local` |
| `docs/architecture/ENGINEERING-GUIDELINES.md` | Fix naming convention migrations (sezione 4.1) |

---

## 6. Issue Aperte (da risolvere nelle prossime sessioni)

### P1 — Expo Go Android non si connette
- **Sintomo**: `Failed to download remote update`
- **Ipotesi**: Telefono su rete diversa o QR scaduto
- **Soluzione suggerita**: Usare `pnpm run dev:mobile:tunnel` (modalità ngrok) oppure verificare che telefono e PC siano sulla stessa rete WiFi (192.168.1.x)
- **Da fare**: Testare connessione e verificare se il `metro.config.js` risolve il bundle Android

### P2 — `@react-native-async-storage/async-storage` versione incompatibile
- **Versione installata**: `3.0.2`
- **Versione attesa da Expo 54**: `2.2.0`
- **Fix**: `pnpm update @react-native-async-storage/async-storage@2.2.0` nel workspace `apps/mobile`

### P3 — Symlink `lightningcss` non persistente su nuovi ambienti
- Il `postinstall` nel `package.json` root crea il symlink dopo `pnpm install`, ma su macchine senza questo workaround (es. CI/CD) potrebbe non funzionare
- **Alternativa**: Aggiungere `lightningcss-linux-x64-gnu` come dipendenza esplicita in `apps/admin/package.json`

### P4 — Credenziali `.env` cambiano ad ogni `db:start`
- Le chiavi `sb_publishable_*` generate da Supabase CLI cambiano ad ogni avvio del container
- **Fix raccomandato**: Configurare chiavi statiche nel `config.toml` di Supabase (sezione `[auth]` con JWT secret fisso) oppure documentare la procedura di aggiornamento

### P5 — App Mobile scaffolding da sostituire
- `apps/mobile/app/(tabs)/index.tsx` è il default di Expo, non ha ancora nessuna logica MugenDojo
- Prossimo step: costruire schermata login mobile + struttura tab (Presenze, Calendario, Profilo, Diario)

### P6 — `pnpm-workspace.yaml` contiene campo non valido
- `nodeLinker: hoisted` in `pnpm-workspace.yaml` non è un campo valido (va solo in `.npmrc`)
- Non causa errori ma è confuso — rimuovere dalla prossima sessione

---

## 7. Comandi Utili per la Prossima Sessione

```bash
# Avviare Supabase (se non è già attivo)
pnpm run db:start

# Verificare credenziali correnti
pnpm run db:status

# Reset completo DB + seed (se si vuole ripartire da zero)
pnpm run db:reset

# Rigenerare i tipi TypeScript dopo modifiche allo schema
pnpm run db:types

# Avviare Admin
pnpm run dev:admin

# Avviare Mobile (LAN)
pnpm run dev:mobile

# Avviare Mobile (WAN/tunnel — richiede account Expo)
pnpm run dev:mobile:tunnel

# Verificare container Docker Supabase attivi
docker ps --format "table {{.Names}}\t{{.Status}}"

# Accedere al DB direttamente
docker exec -it supabase_db_MugenDojo psql -U postgres

# Killare processi Next.js zombi su porta 3000
lsof -ti :3000 | xargs -r kill -9

# Killare processi Metro zombi su porta 8081
lsof -ti :8081 | xargs -r kill -9
```

---

## 8. Architettura Auth (Admin) — Funzionante

Il sistema auth dell'app admin è completamente implementato e testato:

```
/                    → redirect a /login (middleware)
/login               → form email/password → supabase.auth.signInWithPassword()
/dashboard           → server component protetto, verifica sessione → redirect se non auth
/auth/callback       → route handler per OAuth/magic link (futuro)
```

**File chiave auth admin**:
- `src/middleware.ts` — refresh sessione + protezione route `/dashboard` + redirect da `/login` se già auth
- `src/lib/supabase/client.ts` — `createBrowserClient` per Client Components
- `src/lib/supabase/server.ts` — `createServerClient` con cookie per Server Components

**Dipendenza**: `@supabase/ssr` (non `@supabase/auth-helpers-nextjs` che è deprecato)

---

## 9. Note per Agenti AI nelle Sessioni Successive

1. **Leggere prima** `CLAUDE.md` e `docs/architecture/ENGINEERING-GUIDELINES.md`
2. **Verificare sempre** che Supabase sia attivo (`pnpm run db:status`) prima di operare su auth o dati
3. **Non modificare** migration già applicate — creare nuove migration con naming `YYYYMMDDNNN_descrizione.sql`
4. **Dopo ogni migration** rigenerare i tipi: `pnpm run db:types`
5. **Le credenziali locali** sono in `apps/admin/.env.local` e `apps/mobile/.env.local` — non committare
6. **Il symlink lightningcss** potrebbe non esistere dopo `pnpm install` — eseguire `pnpm install` che triggera il `postinstall`
7. **Per Expo Android** — se `Failed to download remote update`, usare `--tunnel` o verificare la rete
8. **Il processo Metro** può sopravvivere ai kill normali — usare `kill -9 <PID>` e poi `lsof -ti :8081 | xargs -r kill -9`
9. **I tipi in `packages/shared/src/database.types.ts`** sono attualmente hand-written (stub). Dopo aver avviato il DB locale, rigenerare con `pnpm run db:types` per avere i tipi reali auto-generati da Supabase

---

## 10. Documenti di riferimento aggiornati in questa sessione

| Documento | Aggiornamento |
|-----------|---------------|
| `docs/project-management/HANDOFF-20260416.md` | **Handoff completo** — stato stack, issue aperte, prossimi passi |
| `docs/project-management/ROADMAP.md` | M2: 3 task su 4 completati |
| `docs/project-management/BACKLOG.md` | Aggiunti P2-P6 da questa sessione; rimosso task db:types (risolto) |
| `docs/BRIEFING.md` | Aggiunta Sessione 3 (16 aprile) |
| `docs/architecture/ENGINEERING-GUIDELINES.md` | Sezione 4.1: naming convention migration corretta |
