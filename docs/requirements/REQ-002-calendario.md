# REQ-002 — Calendario e Pianificazione

> Stato: `[BOZZA]` | Priorità: **ALTA** — Funzionalità core

## Descrizione

Il sistema deve gestire un calendario annuale con generazione automatica delle lezioni, gestione sospensioni e pianificazione eventi speciali.

## Requisiti funzionali

### RF-002.1 — Generazione calendario annuale
- Generazione automatica delle lezioni dal template settimanale
- Esclusione automatica dei periodi di sospensione
- Possibilità di rigenerare o aggiornare il calendario

### RF-002.2 — Gestione sospensioni
- Configurazione periodi di sospensione fissi (agosto) e variabili (festività)
- Sospensione di singoli giorni o intervalli
- Visualizzazione chiara dei giorni sospesi

### RF-002.3 — Eventi speciali
- Creazione di stage, esami, laboratori con campi dedicati
- Associazione istruttore, luogo, durata, descrizione
- Gli eventi speciali appaiono nel calendario insieme alle lezioni

### RF-002.4 — Visualizzazione
- Vista mensile del calendario
- Vista settimanale
- Riepilogo ore previste vs ore effettive per periodo

## Riferimenti
- → [05-calendario-regole](../business/05-calendario-regole.md)
