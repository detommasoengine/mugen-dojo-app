# Backlog Operativo

Questo file funge da "Issue Tracker" locale. Qui verranno depositati task sparsi, bug o refactoring non strettamente legati a macro-milestone.

## Da Smarcare

- `[ ]` [Bug?] Verificare limitazione permessi in `update dojo` se chi effettua l'invio via API non esplicita i campi giusti (validazione Zod).
- `[ ]` Implementare script generatore delle migrazioni in `packages/shared/scripts`.
- `[x]` ~~Configurare la generazione dei tipi database: Inserire lo statement di Supabase CLI nel `package.json` root.~~ → `pnpm run db:types` operativo.
- `[ ]` [P2] Fix `@react-native-async-storage/async-storage`: downgrade da `3.0.2` a `2.2.0` (versione attesa da Expo 54).
- `[ ]` [P4] Configurare JWT secret statico in `supabase/config.toml` per evitare che le chiavi cambino ad ogni `db:start`.
- `[ ]` [P6] Rimuovere `nodeLinker: hoisted` da `pnpm-workspace.yaml` — non è un campo valido in quel file (appartiene a `.npmrc` dove è già presente).
- `[x]` ~~Aggiornare `docs/business/02-modello-dominio.md` con schema DB definitivo (post migration 010).~~ → fatto sessione 2026-06-28 (sezione decisioni + delta).
- `[ ]` Installare dipendenze UI admin dichiarate ma assenti: `shadcn/ui`, TanStack Table, Recharts, FullCalendar (M5).
- `[ ]` Implementare business logic reale in `packages/shared` (`calculateHours` è stub → 0) con Zod + test (M3).
- `[ ]` [Ambiente] Eliminare copia ridondante `~/AIKIDO` (parziale) e, dopo remount RW del disco NTFS, la sorgente originale read-only.

## In Valutazione

- Valutare se implementare la logica RLS per bloccare l'amministratore (head master) di un altro dojo rispetto ai profili. Attualmente il multi-tenant è isolato, bisogna testarlo.
- [P3] Symlink `lightningcss` non portabile su ambienti CI/CD — alternativa: aggiungere `lightningcss-linux-x64-gnu` come dipendenza esplicita in `apps/admin/package.json`.

## Risolti

- `[x]` Duplicate key migration (versione estratta da filename) → rinominati `20260412_NNN_` → `20260412NNN_`
- `[x]` Dipendenza circolare RLS `dojos` → `profiles` → policy spostate in migration 003
- `[x]` 7 bug nelle migration (policy RLS, index, constraint) → corretti in sessioni 001
- `[x]` GoTrue 500 su login (NULL in colonne varchar auth.users) → seed corretto
- `[x]` `lightningcss` binary mancante → symlink + script `postinstall` in `package.json` root
- `[x]` `next.config.ts` opzione deprecata → `serverExternalPackages` (top-level)
- `[x]` `dev` script mancante in `apps/mobile/package.json` → aggiunto
- `[x]` Metro partiva dalla root monorepo → `apps/mobile/metro.config.js` creato
- `[x]` Homepage admin mostrava default Next.js → `redirect('/login')`
- `[x]` Disco repo montato read-only (NTFS `ro`) → migrazione su `~/DEV Projects/AIKIDO/MugenDojo` (ext4); `pnpm install` ok (992 pkg), lightningcss symlink valido, typecheck verde.

*Ultimo aggiornamento: 2026-06-28 (sessione decisioni di dominio + migrazione ambiente)*
