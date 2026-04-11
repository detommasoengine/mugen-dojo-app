# 03 — Attori e Ruoli

> Stato: `[IN REVISIONE]` — Aggiornato con decisioni briefing sessione 2

## Gerarchia dei ruoli

```
┌──────────────────────────────────────────────────┐
│              CAPOSCUOLA (Sensei)                  │
│           Amministratore Principale               │
│  Unico con potere di abilitazione/configurazione  │
├──────────────────────────────────────────────────┤
│    ┌────────────────────────────────────────┐     │
│    │  SEGRETARIO 1    SEGRETARIO 2    ...   │     │
│    │  (Senpai)        (Senpai)              │     │
│    │  Permessi: A,B   Permessi: C,D         │     │
│    │  Admin delegato con privilegi granulari │     │
│    └────────────────────────────────────────┘     │
├──────────────────────────────────────────────────┤
│    ┌────────────────────────────────────────┐     │
│    │  AIKIDOKA (Studente)                   │     │
│    │  ┌──────────────────────────────┐      │     │
│    │  │ SENPAI CONDUTTORE (delegato) │      │     │
│    │  │ Autorizzato a condurre       │      │     │
│    │  │ lezioni (ore attive 2x)      │      │     │
│    │  └──────────────────────────────┘      │     │
│    └────────────────────────────────────────┘     │
├──────────────────────────────────────────────────┤
│    ┌────────────────────────────────────────┐     │
│    │  PARTECIPANTE ESTERNO (futuro)         │     │
│    │  Accesso solo a Progetti specifici     │     │
│    └────────────────────────────────────────┘     │
└──────────────────────────────────────────────────┘
```

## Matrice dei permessi

| Funzionalità | Caposcuola | Segretario | Aikidoka |
|-------------|:----------:|:----------:|:--------:|
| **Gestione Utenti** | | | |
| Registrazione nuovi utenti | ✅ | ⚙️ | ❌ |
| Pre-registrazione email | ✅ | ⚙️ | ❌ |
| Modifica profili utenti | ✅ | ⚙️ | Solo proprio |
| Disattivazione/cancellazione utenti | ✅ | ❌ | ❌ |
| Assegnazione ruolo Segretario | ✅ | ❌ | ❌ |
| Configurazione permessi Segretario | ✅ | ❌ | ❌ |
| Autorizzazione conduzione lezioni | ✅ | ❌ | ❌ |
| **Calendario e Lezioni** | | | |
| Creazione/modifica calendario annuale | ✅ | ⚙️ | ❌ |
| Gestione periodi di sospensione | ✅ | ⚙️ | ❌ |
| Aggiunta eventi straordinari (stage, esami) | ✅ | ⚙️ | ❌ |
| Configurazione peso ore per evento | ✅ | ❌ | ❌ |
| Creazione lezioni con filtro per livello | ✅ | ⚙️ | ❌ |
| Gestione eccezioni accesso lezioni | ✅ | ⚙️ | ❌ |
| Visualizzazione calendario | ✅ | ✅ | ✅ (filtrato) |
| **Presenze** | | | |
| Registrazione propria presenza | ✅ | ✅ | ✅ |
| Conferma/validazione presenze altrui | ✅ | ⚙️ | ❌ |
| Visualizzazione presenze di tutti | ✅ | ⚙️ | ❌ |
| Visualizzazione proprie presenze | ✅ | ✅ | ✅ |
| **Comunicazioni** | | | |
| Invio comunicazioni ufficiali | ✅ | ⚙️ | ❌ |
| Ricezione comunicazioni | ✅ | ✅ | ✅ |
| **Scheda Personale** | | | |
| Visualizzazione scheda altrui | ✅ | ⚙️ | ❌ |
| Gestione propria scheda | ✅ | ✅ | ✅ |
| Diario di bordo | ✅ | ✅ | ✅ |
| Risorse di studio personali | ✅ | ✅ | ✅ |
| **Risorse didattiche** | | | |
| Creazione/gestione risorse didattiche generali | ✅ | ⚙️ | ❌ |
| Gestione glossario Aikido | ✅ | ⚙️ | ❌ |
| Consultazione risorse didattiche | ✅ | ✅ | ✅ |
| **Esami e Gradi** | | | |
| Registrazione esito esame | ✅ | ❌ | ❌ |
| Verifica requisiti esame | ✅ | ⚙️ | Solo proprio |
| **Progetti e Laboratori** | | | |
| Creazione/gestione Progetti | ✅ | ⚙️ | ❌ |
| Abilitazione utente a Progetto | ✅ | ❌ | ❌ |
| Gestione Laboratorio (se responsabile) | ✅ | ⚙️ | Solo se delegato |
| Iscrizione a Progetto (se abilitato) | ✅ | ✅ | ✅ |
| **Configurazione Dojo** | | | |
| Impostazioni generali | ✅ | ❌ | ❌ |
| Configurazione requisiti esami | ✅ | ❌ | ❌ |
| Configurazione pesi ore (conduzione, stage) | ✅ | ❌ | ❌ |

### Legenda

- ✅ Sempre abilitato
- ⚙️ Abilitabile dal Caposcuola (permesso delegabile singolarmente)
- ❌ Non consentito

## Segretari multipli con permessi granulari

Possono esistere **più Segretari** per Dojo. Solo il Caposcuola può abilitare un Segretario. Per ciascuno, il Caposcuola configura individualmente quali permessi ⚙️ sono attivi. Questo consente una distribuzione del lavoro flessibile:

**Esempio di configurazione**:
| | Segretario A | Segretario B | Segretario C |
|--|:---:|:---:|:---:|
| Gestione iscrizioni | ✅ | ❌ | ❌ |
| Gestione presenze | ✅ | ✅ | ❌ |
| Gestione comunicazioni | ❌ | ❌ | ✅ |
| Gestione calendario | ❌ | ✅ | ❌ |

## Senpai Conduttore

Un Aikidoka con carriera avanzata può essere **autorizzato dal Caposcuola a condurre lezioni**. Non è un cambio di ruolo nel sistema, ma un flag aggiuntivo sul profilo:
- Le ore di conduzione contano con peso maggiorato (default 2x, configurabile)
- L'autorizzazione è revocabile dal Caposcuola in qualsiasi momento
- La presenza del Senpai Conduttore è registrata con `ruolo_in_evento = CONDUTTORE`

## Domande aperte

→ Rimandate al documento [07-domande-stakeholder](07-domande-stakeholder.md):
- Ruolo "Ospite" per praticanti di passaggio
- Delega temporanea totale del Caposcuola
- Sotto-ruoli funzionali degli Aikidoka
- Ruolo "Partecipante Esterno" per Progetti aperti
