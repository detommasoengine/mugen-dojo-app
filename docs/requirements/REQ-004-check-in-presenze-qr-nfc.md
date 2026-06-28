# REQ-004 — Check-in Presenze in Loco (QR Code / NFC)

> Stato: `[BOZZA]` | Priorità: **MEDIA** — Estensione della funzionalità presenze core
> Dipende da: [REQ-001 — Gestione Presenze](REQ-001-gestione-presenze.md)

## Motivazione

Attualmente il sistema prevede tre metodi di registrazione presenza (REQ-001): `APPELLO`, `QR_CODE`, `INSERIMENTO_DIRETTO`. Questo requisito espande la modalità automatica **check-in in loco**, consentendo agli Aikidoka di registrare la propria presenza direttamente in sede, tramite tre modalità complementari: QR dinamico da beacon, QR stampato su supporto fisico, o rilevamento NFC.

**Obiettivi**:

- Ridurre il carico amministrativo del Caposcuola/Segretario nella registrazione presenze
- Garantire che la presenza sia realmente "in loco" (anti-frode)
- Offrire un'esperienza fluida e veloce per l'Aikidoka

---

## Concetti chiave

### Dispositivo Rivelatore (Beacon)

Il telefono del Caposcuola o di un collaboratore che conduce la lezione funge da **rivelatore**: genera e espone il token di check-in (QR o NFC) per quella specifica sessione.

### Token di sessione

Un codice univoco, temporaneo e legato a uno specifico evento/lezione. Il token:

- È generato dall'app del rivelatore all'inizio della lezione
- Ha una **scadenza temporale** (es. valido solo durante l'orario della lezione + margine configurabile)
- È legato all'`event_id` dell'evento nel calendario
- Non è riutilizzabile per un evento diverso

### QR Stampato (Supporto Cartaceo)

Modalità semplificata che **non richiede un dispositivo beacon**. Il Caposcuola genera e stampa un QR code permanente associato al Dojo (o a una specifica aula/sede). Il QR stampato viene posizionato in sede su un supporto cartaceo visibile.

A differenza del token di sessione (dinamico), il QR stampato è **statico e persistente** — la validità del check-in è garantita interamente lato app tramite:

- **Vincolo temporale**: l'app verifica che esista un evento calendarizzato nella fascia oraria corrente (± margine configurabile)
- **Vincolo di geolocalizzazione**: l'app verifica che il dispositivo si trovi entro un raggio configurabile dalla sede del Dojo (default: 1 km)
- **Vincolo di unicità**: una sola registrazione per evento per Aikidoka

### Check-in dell'Aikidoka

L'allievo, tramite la propria app mobile (già loggata), scansiona il QR Code (dinamico o stampato) o riceve il segnale NFC e conferma la presenza. La presenza viene registrata nel suo calendario personale.

---

## Requisiti funzionali

### RF-004.1 — Generazione token (lato Rivelatore)

- Il Caposcuola, un Segretario delegato o un Senpai Conduttore autorizzato può attivare la modalità "Check-in Lezione" dal proprio dispositivo
- L'app genera un token di sessione associato all'evento calendarizzato corrente (o al prossimo evento imminente)
- Il token è visualizzato come:
  - **QR Code** (modalità principale) — statico o rotante (vedi decisione aperta DP-1)
  - **Segnale NFC** (modalità secondaria) — tap-to-check-in
- Se non esiste un evento calendarizzato nell'orario corrente, il rivelatore può comunque generare un check-in "ad hoc" (registrato come `INSERIMENTO_DIRETTO` con nota automatica)

### RF-004.2 — Scansione e check-in (lato Aikidoka)

- L'Aikidoka accede alla funzione "Registra Presenza" nell'app mobile
- Può scegliere tra:
  - 📷 **Scansione QR Code** — fotocamera del telefono
  - 📱 **NFC** — avvicinamento al dispositivo rivelatore
- Dopo la scansione/lettura, l'app:
  1. Valida il token (verifica firma, scadenza, associazione evento)
  2. Mostra all'Aikidoka un riepilogo: nome evento, data, orario, conduttore
  3. L'Aikidoka conferma → la presenza è registrata
- Il metodo di registrazione viene salvato come `QR_CHECK_IN` o `NFC_CHECK_IN`

### RF-004.3 — Validazione e anti-frode

- Il token contiene una **firma crittografica** che impedisce la contraffazione (es. HMAC con secret del Dojo)
- **Vincolo temporale**: il token è valido solo nella finestra oraria dell'evento ± margine (default: 15 min prima, 15 min dopo)
- **Vincolo unicità**: un Aikidoka non può registrare la stessa presenza due volte per lo stesso evento
- **Geolocalizzazione** (opzionale, da valutare — vedi DP-2): controllo GPS per verificare la prossimità alla sede del Dojo

### RF-004.4 — Stato della presenza da check-in

- Le presenze registrate via check-in seguono lo stesso flusso di conferma di REQ-001 (RF-001.2):
  - Se il Dojo ha la conferma automatica disabilitata → stato `REGISTRATA`, richiede conferma
  - Se il Dojo ha la conferma automatica abilitata → stato `CONFERMATA` direttamente
- Il Caposcuola può configurare per tipo di check-in se la conferma è necessaria o automatica

### RF-004.5 — Dashboard rivelatore (real-time)

- Il dispositivo rivelatore mostra in tempo reale:
  - Numero di check-in ricevuti
  - Lista degli Aikidoka che hanno fatto check-in
  - Eventuali anomalie (tentativi multipli, token scaduti)
- Al termine della lezione, il rivelatore può "chiudere" la sessione di check-in

### RF-004.6 — Check-in tramite QR Stampato

- Il Caposcuola può generare dalla **dashboard admin** un QR code permanente associato al Dojo/sede
- Il QR codifica un identificativo univoco del Dojo (es. `dojo_id` + firma HMAC) — **non un token di sessione**
- Il QR viene stampato e posizionato in un punto visibile della sede (ingresso, bacheca, tatami)
- Quando l'Aikidoka lo scansiona, l'app:
  1. Decodifica il `dojo_id` e verifica la firma
  2. Controlla che esista un evento calendarizzato **in corso** (± margine configurabile, default: 15 min)
  3. _(Opzionale)_ Verifica la **geolocalizzazione** del dispositivo (entro raggio configurabile, default: 1 km dalla sede)
  4. Se tutti i vincoli sono soddisfatti → mostra riepilogo evento e consente il check-in
  5. Se non c'è evento in corso → mostra messaggio "Nessuna lezione in programma in questo momento"
- Il metodo di registrazione viene salvato come `QR_POSTER_CHECK_IN`
- **Vantaggi**: nessun dispositivo beacon necessario, funziona anche se il Caposcuola non è presente (lezione tenuta da collaboratore)
- **Limite**: meno sicuro del QR dinamico (il QR può essere fotografato e condiviso — mitigato dalla geolocalizzazione)

---

## Requisiti non funzionali

- **Offline-first**: la scansione QR deve funzionare anche senza connessione internet continua (sincronizzazione differita)
- **Performance**: il check-in deve completarsi in < 3 secondi (scansione → conferma visiva)
- **Compatibilità NFC**: supporto ai tag NFC standard (NDEF) e HCE (Host Card Emulation) per Android. iOS ha limitazioni NFC da valutare
- **Accessibilità**: alternativa manuale sempre disponibile (inserimento diretto o appello)

---

## Flusso utente

### Flusso Rivelatore (Caposcuola / Senpai Conduttore)

```
1. Apri app → Sezione "Lezione di oggi"
2. Tocca "Attiva Check-in"
3. L'app identifica l'evento corrente dal calendario
4. Genera token di sessione + QR Code visualizzato a schermo
5. (Opzionale) Attiva anche NFC beacon
6. Mostra contatore presenze in tempo reale
7. A fine lezione → "Chiudi Check-in"
```

### Flusso Aikidoka (Studente) — QR Dinamico / NFC

```
1. Apri app → Sezione "Registra Presenza"
2. Scegli metodo: QR / NFC
3. Scansiona QR code o avvicina telefono al rivelatore
4. Visualizza riepilogo evento
5. Conferma → ✅ "Presenza registrata!"
6. La presenza appare nel calendario personale
```

### Flusso Aikidoka (Studente) — QR Stampato

```
1. Arrivo in sede → Inquadra il QR stampato sulla bacheca/ingresso
2. L'app verifica: Dojo corretto? Lezione in corso? Posizione OK?
3. Se tutti i controlli passano → mostra riepilogo lezione
4. Conferma → ✅ "Presenza registrata!"
5. Se nessuna lezione → ⚠️ "Nessuna lezione in programma"
```

---

## Impatto sul modello dati

### Nuovi valori per `metodo_registrazione` (enum)

| Valore attuale        | Nuovo valore         | Note                                              |
| --------------------- | -------------------- | ------------------------------------------------- |
| `APPELLO`             | —                    | Invariato                                         |
| `QR_CODE`             | `QR_CHECK_IN`        | Rinominato per chiarezza, indica check-in in loco |
| `INSERIMENTO_DIRETTO` | —                    | Invariato                                         |
| —                     | `NFC_CHECK_IN`       | Nuovo                                             |
| —                     | `QR_POSTER_CHECK_IN` | Nuovo — check-in da QR stampato                   |

### Nuova entità: `CheckInSession`

| Campo          | Tipo      | Descrizione                             |
| -------------- | --------- | --------------------------------------- |
| `id`           | UUID      | PK                                      |
| `event_id`     | UUID      | FK → events                             |
| `dojo_id`      | UUID      | FK → dojos                              |
| `initiated_by` | UUID      | FK → users (rivelatore)                 |
| `token_hash`   | string    | Hash del token di sessione              |
| `started_at`   | timestamp | Inizio validità                         |
| `expires_at`   | timestamp | Fine validità                           |
| `closed_at`    | timestamp | Chiusura manuale (null = ancora aperta) |
| `method`       | enum      | `QR_DYNAMIC` / `NFC` / `BOTH`           |
| `status`       | enum      | `ACTIVE` / `CLOSED` / `EXPIRED`         |

### Nuova entità: `DojoQrPoster`

Per il QR stampato, un record persistente (non una sessione temporanea):

| Campo          | Tipo      | Descrizione                                  |
| -------------- | --------- | -------------------------------------------- |
| `id`           | UUID      | PK                                           |
| `dojo_id`      | UUID      | FK → dojos                                   |
| `label`        | string    | Etichetta (es. "Ingresso Dojo", "Tatami")    |
| `token_hash`   | string    | Hash HMAC del contenuto QR                   |
| `created_by`   | UUID      | FK → users (chi lo ha generato)              |
| `created_at`   | timestamp | Data creazione                               |
| `revoked_at`   | timestamp | Data revoca (null = attivo)                  |
| `geo_lat`      | decimal   | Latitudine sede (per validazione prossimità) |
| `geo_lng`      | decimal   | Longitudine sede                             |
| `geo_radius_m` | integer   | Raggio massimo in metri (default: 1000)      |

### Modifica a `Presenza`

- Aggiunta campo opzionale `checkin_session_id` (FK → checkin_sessions) per tracciare da quale sessione di check-in è stata generata la presenza

---

## Decisioni aperte

| ID   | Domanda                                                  | Opzioni                                                                                                                                              | Stato        |
| ---- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| DP-1 | QR statico o rotante?                                    | **Statico**: un QR fisso per tutta la lezione (più semplice). **Rotante**: il QR cambia ogni N secondi (più sicuro, impedisce sharing foto)          | Da discutere |
| DP-2 | Abilitare geolocalizzazione?                             | Potrebbe verificare la prossimità alla sede. Pro: anti-frode. Contro: privacy, complessità, GPS indoor impreciso                                     | Da discutere |
| DP-3 | NFC: HCE o tag fisico?                                   | **HCE**: il telefono del rivelatore emula un tag NFC. **Tag fisico**: un tag NFC programmato posizionato in sede                                     | Da discutere |
| DP-4 | Conferma automatica per check-in?                        | Il check-in in loco potrebbe essere auto-confermato (a differenza del QR remoto). Configurabile dal Caposcuola?                                      | Da discutere |
| DP-5 | Supporto iOS per NFC?                                    | iOS ha limitazioni sulla lettura NFC in background e sull'HCE. Valutare se NFC è solo Android o cross-platform                                       | Da discutere |
| DP-6 | QR Stampato: geolocalizzazione obbligatoria o opzionale? | Se obbligatoria, il check-in è più sicuro ma richiede permessi GPS. Se opzionale, il Caposcuola decide per il proprio Dojo. Raggio consigliato: 1 km | Da discutere |

---

## Riferimenti

- → [REQ-001 — Gestione Presenze](REQ-001-gestione-presenze.md) — Requisito base delle presenze
- → [02-modello-dominio](../business/02-modello-dominio.md) — Entità Presenza, Evento
- → [03-attori-ruoli](../business/03-attori-ruoli.md) — Permessi Caposcuola / Segretario / Senpai Conduttore
- → [05-calendario-regole](../business/05-calendario-regole.md) — Associazione eventi al calendario
- → ADR-002 (da creare) — Decisione architetturale su tecnologia QR/NFC
