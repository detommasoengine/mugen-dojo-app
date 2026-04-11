# REQ-003 — Gestione Utenti e Autenticazione

> Stato: `[BOZZA]` | Priorità: **ALTA** — Funzionalità core

## Descrizione

Sistema multi-tenant con gestione utenti basata su ruoli gerarchici.

## Requisiti funzionali

### RF-003.1 — Registrazione utenti
- Il Caposcuola crea l'account e genera credenziali di accesso
- L'Aikidoka completa la propria scheda al primo accesso
- Dati obbligatori: nome, cognome, email, data nascita

### RF-003.2 — Autenticazione
- Login con email e password
- Possibilità futura di login social o biometrico (mobile)
- Sessioni persistenti con refresh token

### RF-003.3 — Gestione ruoli
- Assegnazione ruoli: Caposcuola, Segretario, Aikidoka
- Delega permessi specifici dal Caposcuola al Segretario
- → vedi [03-attori-ruoli](../business/03-attori-ruoli.md)

### RF-003.4 — Profilo Aikidoka
- Scheda anagrafica completa
- Grado attuale e storico passaggi
- Foto profilo
- Scadenza certificato medico (opzionale)

## Riferimenti
- → [03-attori-ruoli](../business/03-attori-ruoli.md) — Matrice permessi
- → [04-ciclo-vita-aikidoka](../business/04-ciclo-vita-aikidoka.md) — Dati tracciati
