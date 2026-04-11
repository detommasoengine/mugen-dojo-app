# 05 — Calendario e Regole Temporali

> Stato: `[IN REVISIONE]` — Aggiornato con decisioni su pesi e filtri livello

## Anno Accademico

- **Inizio**: 1 Settembre
- **Fine**: 31 Luglio
- **Sospensione fissa**: Agosto (intero mese)
- **Sospensioni configurabili**: festività nazionali, periodi personalizzati dal Caposcuola

## Lezioni regolari (template settimanale)

| Giorno | Orario | Durata | Note |
|--------|--------|--------|------|
| Lunedì | 19:00 – 20:00 | 1 ora | Lezione standard |
| Mercoledì | 19:00 – 20:00 | 1 ora | Lezione standard |
| Venerdì | 19:00 – 20:00 | 1 ora | Lezione standard |

- **Ore standard per settimana**: 3 ore
- **Eccezioni**: possibilità di estendere una lezione (es. 19:00–21:00) — gestite come evento eccezionale

## Lezioni con filtro per livello

Il Sensei può istituire lezioni (singole o periodiche) riservate a categorie specifiche di Aikidoka:

- **Filtri possibili**: per grado (es. solo Kyu, solo Dan), per range (es. 4°-1° Kyu), per etichetta personalizzata
- **Calendario selettivo**: solo i profili che rientrano nel criterio vedono e accedono alla lezione
- **Eccezioni**: il Sensei può abilitare singoli studenti o gruppi fuori requisiti
- Le lezioni filtrate contribuiscono normalmente al monte ore dei partecipanti

## Calcolo ore mensili

Il numero di ore mensili varia perché:
- Alcuni mesi hanno 5 occorrenze di un giorno della settimana
- Festività e sospensioni riducono il conteggio

Esempio di calcolo per Ottobre 2025 (nessuna sospensione):
- Lunedì: 4 occorrenze × 1h = 4h
- Mercoledì: 5 occorrenze × 1h = 5h
- Venerdì: 5 occorrenze × 1h = 5h
- **Totale potenziale**: 14h

Il sistema deve calcolare automaticamente le ore "disponibili" sottraendo le sospensioni.

## Generazione automatica del calendario

All'inizio dell'anno accademico (o in qualsiasi momento), il sistema deve poter:

1. **Generare** tutte le lezioni standard basandosi sul template settimanale
2. **Escludere** automaticamente i periodi di sospensione configurati
3. **Permettere** modifiche manuali (aggiunta/rimozione/spostamento singole lezioni)
4. **Aggiungere** eventi speciali (stage, esami, laboratori) in date specifiche

## Periodi di sospensione tipici (da configurare)

| Periodo | Date indicative | Note |
|---------|----------------|------|
| Agosto | 1 Ago – 31 Ago | Sospensione fissa |
| Natale | ~23 Dic – ~6 Gen | Configurabile |
| Pasqua | Variabile | Configurabile |
| Festività nazionali | 1 Nov, 8 Dic, 25 Apr, 1 Mag, 2 Giu, ... | Singoli giorni |

## Sistema di pesi ore

Ogni evento ha un **peso ore** (`peso_ore`) che moltiplica le ore effettive nel conteggio del monte ore.

### Peso per tipologia evento

| Tipo evento | Peso default | Configurabile |
|-------------|:------------:|:-------------:|
| Lezione regolare | 1.0 | No (fisso) |
| Stage | 1.0 | ✅ Sì, per singolo evento |
| Laboratorio | 1.0 | ✅ Sì, per singolo evento |
| Lezione extra | 1.0 | ✅ Sì |

L'amministratore sceglie il peso al momento della creazione dell'evento.

### Peso per ruolo nell'evento

| Ruolo | Peso default | Configurabile |
|-------|:------------:|:-------------:|
| Partecipante | 1.0 | No |
| Conduttore (Senpai delegato) | 2.0 | ✅ Sì, dal Caposcuola |

**Formula monte ore**:
```
ore_pesate = ore_effettive × peso_evento × peso_ruolo
```

**Esempio**: un Senpai Conduttore che tiene uno stage con peso 1.5, per 3 ore:
- Partecipante: 3h × 1.5 × 1.0 = 4.5 ore nel monte ore
- Conduttore: 3h × 1.5 × 2.0 = 9 ore nel monte ore

## Eventi speciali

### Stage
- Durata variabile (mezza giornata, giornata intera, weekend)
- Possono avere un istruttore esterno
- Le ore contano nel monte ore con peso configurabile
- Hanno una scheda dedicata con dettagli (tema, istruttore, luogo, costo)

### Esami
- Date fisse nel calendario (es. 2 sessioni all'anno)
- Associati ai candidati e al grado per cui sostengono l'esame
- Esito: superato / non superato

### Laboratori
- Attività pratiche all'interno di Progetti (→ vedi [07-domande-stakeholder](07-domande-stakeholder.md) sezione H)
- Possono essere specifici, periodici, occasionali, fondamentali
- Gestiti da Sensei, Senpai delegato o referente esterno autorizzato
- Le ore contano nel monte ore

## Regole di conteggio

1. Ogni presenza registrata contribuisce al monte ore con **ore pesate** (ore_effettive × peso)
2. Il conteggio deve essere filtrabile per:
   - Anno accademico
   - Intervallo di date personalizzato
   - Tipologia di evento (lezioni, stage, laboratori)
   - Ruolo (partecipante / conduttore)
3. Il totale ore deve essere confrontabile con i requisiti per il prossimo esame

## Domande aperte

→ Rimandate al documento [07-domande-stakeholder](07-domande-stakeholder.md):
- Template settimanale variabile (orario invernale/estivo)?
- Numero massimo di assenze tollerato?
