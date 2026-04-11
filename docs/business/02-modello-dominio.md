# 02 — Modello di Dominio

> Stato: `[IN REVISIONE]` — Integrato con requisiti ufficiali Aikikai e indicazioni utente

## Entità principali

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│    Dojo      │──1:N──│   Utente      │──1:N──│  Presenza    │
│              │       │              │       │              │
│ nome         │       │ ruolo        │       │ data         │
│ indirizzo    │       │ grado (kyu/  │       │ metodo_reg   │
│ federazione  │       │   dan)       │       │ ore_effettive│
│ config_esami │       │ data_iscriz  │       │ ore_pesate   │
│ config_orari │       │ email        │       │ stato        │
│ config_pesi  │       │ autorizzato_ │       │ confermata_da│
│              │       │  conduzione  │       │ ruolo_in_ev  │
└─────────────┘       └──────────────┘       └─────────────┘
       │                      │                      │
       │1:N                   │1:1                   │N:1
       ▼                      ▼                      ▼
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│  Calendario  │──1:N──│   Scheda      │       │   Evento     │
│  Annuale     │       │  Aikidoka     │       │              │
│              │       │              │       │ tipo         │
│ anno_acc     │       │ monte_ore    │       │ titolo       │
│ periodi_     │       │ grado_attuale│       │ data/ora     │
│  sospensione │       │ storico_gradi│       │ durata       │
│ lezioni_std  │       │ diario       │       │ luogo        │
└─────────────┘       │ libretto     │       │ istruttore   │
       │              └──────────────┘       └─────────────┘
       │                      │
       │                      │1:N
       │                      ▼
       │              ┌──────────────┐       ┌─────────────┐
       │              │  Risorsa      │       │ Programma    │
       │              │  Studio       │       │ Tecnico      │
       │              │              │       │              │
       │              │ tipo (did/   │       │ grado        │
       │              │   personale) │       │ tecniche[]   │
       │              │ titolo       │       │ esercizi_    │
       │              │ url/file     │       │  preparatori │
       │              │ creato_da    │       │ ore_minime   │
       │              └──────────────┘       │ mesi_minimi  │
       │                                     └─────────────┘
       │
       │1:N
       ▼
┌──────────────┐
│ Comunicazione │
│              │
│ tipo         │
│ titolo       │
│ corpo        │
│ destinatari  │
│ data         │
└──────────────┘
```

## Entità di dettaglio

### Dojo
- Rappresenta l'istanza del Dojo (multi-tenant)
- Contiene la configurazione specifica: federazione (default: Aikikai d'Italia), regole esami personalizzabili, orari standard
- Un Dojo ha un solo Caposcuola (Sensei) e potenzialmente più Senpai/Segretari
- **Config esami**: i requisiti ore/mesi per ogni grado sono personalizzabili dal Caposcuola (default: valori ufficiali Aikikai)
- **Config pesi ore**: pesi configurabili per tipologia evento e per ore di conduzione attiva

### Utente
- Può avere uno dei ruoli: `CAPOSCUOLA`, `SEGRETARIO`, `AIKIDOKA`
- Il grado attuale (Kyu/Dan) è parte del profilo
- Ha una data di iscrizione al Dojo
- **Pre-registrazione email**: il Segretario può pre-registrare l'email prima che l'utente acceda
- Solo utenti riconosciuti dal Caposcuola possono accedere al sistema
- **Autorizzato conduzione**: flag per Senpai delegati dal Caposcuola a condurre lezioni
- → vedi [03-attori-ruoli](03-attori-ruoli.md) per dettagli sui permessi

### Evento
Tipologie:
- `LEZIONE` — lezione regolare settimanale (default: 1 ora)
- `LEZIONE_EXTRA` — estensione oraria eccezionale
- `STAGE` — seminario, spesso multi-orario, con istruttore (anche esterno)
- `ESAME` — sessione d'esame Kyu/Dan
- `LABORATORIO` — attività pratica speciale
- `RADUNO` — raduno ufficiale (Pasqua, autunno, Ki no Renma, ecc.)

Attributi aggiuntivi:
- **Peso ore** (`peso_ore`): moltiplicatore configurabile dall'Admin (default: 1.0). Es. un'ora di stage con peso 1.5 conta come 1.5 ore nel monte ore
- **Filtro gradi** (`filtro_gradi`): restrizione opzionale per categoria (es. solo Kyu, solo Dan, range specifico)
- **Eccezioni** (`eccezioni[]`): lista di Aikidoka ammessi in deroga al filtro gradi, gestita dal Sensei
- **Conduttore** (`conduttore`): se un Senpai autorizzato conduce la lezione, le sue ore hanno peso maggiorato (default 2x, configurabile)

### Presenza
- Collega un Utente a un Evento
- **Ore effettive**: ore di presenza reale
- **Ore pesate**: ore effettive × peso dell'evento (o peso conduzione se conduttore)
- **Ruolo nell'evento** (`ruolo_in_evento`): `PARTECIPANTE` | `CONDUTTORE`
- **Metodo di registrazione**: `APPELLO`, `QR_CODE`, `INSERIMENTO_DIRETTO`
- **Stato**: `REGISTRATA` → `CONFERMATA` / `RIFIUTATA`
- QR Code richiede sempre conferma dell'Admin
- Confermata_da: riferimento all'utente Admin/Segretario che ha confermato

### Scheda Aikidoka
- Aggregazione del percorso dello studente
- Monte ore calcolato (totale e per periodo)
- Storico passaggi di grado con date
- Diario di bordo personale
- Stato libretto (verde → blu dal 4° Kyu)
- Stato quota associativa e certificato medico

### Risorsa di Studio
- **Tipo didattica** (creata da Sensei/Segretario): materiale ufficiale, bibliografie, video, link
- **Tipo personale** (creata da Aikidoka): appunti, riferimenti, note
- Possibile associazione a un grado specifico
- → vedi [06-risorse-studio-ai](06-risorse-studio-ai.md)

### Programma Tecnico
- Un record per ogni grado (6° Kyu → 4° Dan)
- Contiene la lista delle tecniche richieste per l'esame
- Ore minime e mesi minimi configurabili
- Esercizi preparatori specifici per grado
- Fonte: "Programma di Esami" di Tada Sensei (personalizzabile)

### Calendario Annuale
- Definisce l'anno accademico (1 Set – 31 Lug)
- Contiene i periodi di sospensione (agosto, festività configurabili)
- Template settimanale delle lezioni standard
- → vedi [05-calendario-regole](05-calendario-regole.md)

### Comunicazione
- Annunci ufficiali dal Caposcuola/Segretario
- Destinatari: tutti, per grado, individuali (da definire)

## Regole di business chiave

1. **Conteggio ore**: il monte ore deve essere calcolabile per qualsiasi intervallo temporale
2. **Requisiti esame configurabili**: i valori ufficiali Aikikai sono il default, ma il Caposcuola può personalizzarli
3. **Autonomia del Responsabile**: "Spetta al Responsabile di Dōjō decidere quando l'allievo è maturo"
4. **Sospensioni**: i periodi di sospensione escludono automaticamente la generazione di lezioni
5. **Settimane variabili**: alcuni mesi hanno 5 settimane — il sistema gestisce automaticamente
6. **Conferma presenze**: le presenze possono richiedere validazione (obbligatoria per QR Code)
7. **Accesso controllato**: solo utenti pre-registrati/riconosciuti dal Caposcuola possono accedere
8. **Libretto**: transizione automatica da verde a blu al conseguimento del 4° Kyu
9. **Dan ≥ 5°**: non sono esami ma nomine dirette — il sistema li gestisce diversamente

## Relazioni da approfondire

- [x] Risorse di studio — due livelli: didattiche (Sensei/Segretario) e personali (Aikidoka)
- [ ] Comunicazioni ufficiali — broadcast, per gruppo, individuali?
- [x] Storico passaggi di grado — entità separata con date nella Scheda
- [ ] Multi-Dojo — un Aikidoka può appartenere a più Dojo?
- [ ] Glossario interattivo — come si collega alla sezione didattica dell'app?
- [ ] Knowledge Base AI — come si alimenta dai documenti caricati?
