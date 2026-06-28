# ADR-006 — Assistente AI: infrastruttura ora, provider-agnostic poi

> Stato: `[ACCETTATA]` | Data: 2026-06-28 | Origine: intervista (2026-06-27, F.4 / G.2 / G.3)

## Contesto

È previsto un assistente AI (RAG su knowledge base interna: glossario, programmi tecnici, regole Dojo, PDF Aikikai) con possibili azioni agentiche (MCP) e chat vocale. Lo stack include già Supabase/pgvector. Restavano aperti scope, provider e priorità della chat vocale.

## Decisione

1. **Fase futura**: nessuna chat/UI ora. Si **predispone solo l'infrastruttura** — `CREATE EXTENSION IF NOT EXISTS vector`. La tabella `knowledge_chunks` e la pipeline RAG sono rimandate alla fase AI dedicata.
2. **Provider-agnostic**: si progetta un **layer astratto** sul provider LLM; la scelta definitiva avviene in fase di implementazione, senza lock-in. **Candidato di riferimento: Claude (Anthropic)** per RAG/tool-use e azioni agentiche (MCP).
3. **Chat vocale (G.3)**: **fase successiva** dentro il modulo AI, non in MVP.
4. **Scope per grado e moderazione (G.2)**: definiti nella fase AI dedicata.

## Conseguenze

- **Ora**: unico intervento è abilitare `pgvector` in una migration; nessun costo API in fase test.
- **Futuro**: l'astrazione evita di riscrivere l'integrazione se cambia il provider; il candidato Claude allinea l'assistente all'ecosistema di sviluppo.
- **Rinvii**: ingest dei documenti, chunking/embedding, policy d'accesso alla KB e voce restano da specificare.
- Sostituisce, per la parte AI, l'indecisione di ADR-001 (provider non scelto): qui si fissa la *strategia* (astrazione), non il fornitore.
