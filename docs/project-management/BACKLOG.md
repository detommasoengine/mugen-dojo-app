# Backlog Operativo

Questo file funge da "Issue Tracker" locale. Qui verranno depositati task sparsi, bug o refactoring non strettamente legati a macro-milestone.

## Da Smarcare

- `[ ]` [Bug?] Verificare limitazione permessi in `update dojo` se chi effettua l'invio via API non esplicita i campi giusti (validazione Zod).
- `[ ]` Implementare script generatore delle migrazioni in `packages/shared/scripts`.
- `[ ]` Configurare la generazione dei tipi database: Inserire lo statement di Supabase CLI nel `package.json` root.

## In Valutazione
- Valutare se implementare la logica RLS per bloccare l'amministratore (head master) di un altro dojo rispetto ai profili. Attualmente il multi-tenant è isolato, bisogna provarlo.
