# ADR-002 — Strategia multi-tenant e federazione futura

> Stato: `[ACCETTATA]` | Data: 2026-06-28 | Origine: intervista decisioni di dominio (2026-06-27, C.3)

## Contesto

MugenDojo nasce per un singolo Dojo (il "macro-progetto"). Lo schema però adotta già `dojo_id` su tutte le tabelle e RLS centralizzate (`get_user_dojo_ids()`, `is_head_master_of()`), e `profiles` è per-coppia utente/Dojo. Si è posta la domanda se un Aikidoka possa appartenere a più Dojo e se il monte ore sia separato o cumulativo.

## Decisione

In questa fase il **Dojo è l'insieme chiuso** del progetto: un'unica istanza operativa.

1. **Architettura multi-tenant mantenuta**: `dojo_id` + RLS restano la frontiera di isolamento. Nessuna semplificazione che leghi il codice a un singolo Dojo.
2. **Monte ore separato per Dojo**: ogni Dojo conta le proprie ore in modo indipendente. Nessuna logica di consolidamento cross-Dojo ora.
3. **Federazione = scalabilità futura**: dopo la fase di test commerciale, la soluzione potrà essere promossa a livello federale — altri dojo si affiliano e adottano la piattaforma con un profilo di Dojo proprio. Il design attuale non deve precludere questo percorso (niente assunzioni di "Dojo unico" hard-coded).

## Conseguenze

- **Vantaggi**: isolamento dati pulito da subito; percorso di crescita commerciale già abilitato a costo marginale; RLS già scritte reggono il multi-Dojo.
- **Costi/rinvii**: il caso di un Aikidoka realmente attivo in più Dojo (monte ore cumulativo, quale Dojo certifica l'esame) resta **non risolto** e si riaprirà con una ADR dedicata alla federazione.
- **Vincolo di design**: ogni nuova feature deve filtrare per `dojo_id` e passare dagli helper RLS esistenti.
