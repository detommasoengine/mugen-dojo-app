# REQ-001 — Gestione Presenze e Conteggio Ore

> Stato: `[BOZZA]` | Priorità: **ALTA** — Funzionalità core

## Descrizione

Il sistema deve consentire la registrazione delle presenze degli Aikidoka alle lezioni e agli eventi, e calcolare automaticamente il monte ore accumulato.

## Requisiti funzionali

### RF-001.1 — Registrazione presenza
- L'Aikidoka può registrare la propria presenza a un evento calendarizzato
- Il Caposcuola/Segretario può registrare la presenza per conto di un Aikidoka
- La presenza include: data, evento, ore effettive, eventuali note

### RF-001.2 — Conferma presenza
- Le presenze possono richiedere conferma da parte del Caposcuola/Segretario
- Lo stato della presenza: `REGISTRATA` → `CONFERMATA` / `RIFIUTATA`
- Configurabile: il Dojo può decidere se la conferma è necessaria o meno

### RF-001.3 — Conteggio ore
- Il sistema calcola il totale ore per qualsiasi intervallo di date
- Filtri disponibili: anno accademico, mese, intervallo personalizzato, tipo evento
- Il conteggio distingue tra ore di lezione regolare, stage, laboratorio

### RF-001.4 — Verifica requisiti esame
- Dato il grado attuale dell'Aikidoka, il sistema mostra:
  - Ore accumulate dal ultimo passaggio di grado
  - Ore mancanti per il prossimo esame
  - Mesi trascorsi dal ultimo passaggio
  - Stato di idoneità: idoneo / non ancora idoneo

## Requisiti non funzionali

- Il conteggio ore deve essere calcolato in tempo reale (non pre-calcolato con batch)
- La registrazione presenza deve funzionare anche offline (sincronizzazione successiva)

## Riferimenti
- → [02-modello-dominio](../business/02-modello-dominio.md) — Entità Presenza, Scheda Aikidoka
- → [05-calendario-regole](../business/05-calendario-regole.md) — Regole di conteggio
