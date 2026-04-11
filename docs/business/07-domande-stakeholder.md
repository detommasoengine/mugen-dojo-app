# 07 — Domande aperte per gli Stakeholder

> Stato: `[ATTIVO]` — Documento vivo, da portare alle sessioni di confronto con gli stakeholder interni
> Ultimo aggiornamento: 2026-04-11

Questo documento raccoglie tutte le domande di specifica che richiedono discussione e validazione con gli stakeholder interni del progetto (Caposcuola, Segretario, eventuali collaboratori tecnici).

## Legenda stato

- 🟢 **RISPOSTO** — Risposta ricevuta, integrata nella documentazione
- 🟡 **PARZIALE** — Risposta iniziale ricevuta, da approfondire
- 🔴 **APERTO** — Nessuna risposta ancora

---

## A — Conteggio ore e pesi

### A.1 — Peso ore di stage 🟢
> Le ore di stage pesano diversamente dalle ore di lezione regolare?

**Risposta**: Le ore di stage hanno tendenzialmente lo stesso peso di un'ora di lezione (1:1). Tuttavia il sistema deve consentire all'amministratore di assegnare un **peso configurabile** a ciascun evento/stage. Il peso scelto si riflette nel conteggio totale delle ore dello studente.

**Esempio**: Se un'ora di stage ha peso 1.5, partecipare a 4 ore di stage conta come 6 ore nel monte ore.

→ Integrato in [02-modello-dominio](02-modello-dominio.md) e [05-calendario-regole](05-calendario-regole.md)

### A.2 — Peso ore di lezione attiva (conduzione) 🟢
> Come si conteggiano le ore di un Senpai che conduce una lezione?

**Risposta**: Quando un Aikidoka Senpai con requisiti di carriera avanzati è autorizzato e delegato dal Caposcuola a condurre una lezione, le ore vengono conteggiate come **"ore di lezione attive"** con un peso maggiorato. Il default è **2x** (1 ora condotta = 2 ore nel monte ore), ma il parametro è configurabile dall'amministratore (es. 1.5x, 2x, 3x).

**Prerequisiti**: L'Aikidoka deve essere esplicitamente autorizzato/delegato dal Caposcuola per la conduzione.

→ Integrato in [02-modello-dominio](02-modello-dominio.md)

### A.3 — Conteggio ore per tipologia 🔴
> Nel monte ore complessivo, serve una vista separata per tipo (lezioni regolari, stage, laboratori, ore attive)?

**Da discutere**: Potrebbe essere utile per il Caposcuola vedere non solo il totale ma anche la composizione delle ore.

---

## B — Lezioni e calendario

### B.1 — Lezioni differenziate per livello 🟡
> Possono esistere lezioni riservate a specifiche categorie di Aikidoka?

**Risposta**: Sì. Il Sensei può istituire lezioni singole o periodiche assegnate a categorie specifiche (es. solo Kyu, solo Dan, solo principianti, solo avanzati). Il calendario diventa selettivo: solo i profili che rientrano nel criterio vedono e possono accedere alla lezione. Il Sensei può abilitare eccezioni per singoli studenti o gruppi.

→ Integrato in [05-calendario-regole](05-calendario-regole.md)

**Da approfondire**:
- Come gestire le categorie? Per grado singolo, per range di gradi, o per etichette personalizzate?
- Le eccezioni sono temporanee (per una singola lezione) o persistenti?

### B.2 — Orario lezioni variabile 🔴
> Il template settimanale (Lun/Mer/Ven 19:00-20:00) è fisso tutto l'anno o può cambiare (es. orario estivo)?

### B.3 — Numero massimo assenze 🔴
> Esiste un numero massimo di assenze tollerato o è solo un dato informativo?

---

## C — Ruoli e multi-tenancy

### C.1 — Pluralità di Segretari 🟢
> Può esistere più di un Segretario per Dojo?

**Risposta**: Sì. Solo il Caposcuola può abilitare uno o più Segretari. A ciascun Segretario Senpai, il Caposcuola può assegnare privilegi verticali o specifici (es. uno gestisce solo le iscrizioni, un altro gli esami, un altro ancora le comunicazioni ufficiali).

### C.2 — Ruolo Ospite 🔴
> Serve un ruolo "Ospite" per praticanti di passaggio da altri Dojo?

**Nota**: Potrebbe essere utile per stage aperti o lezioni di prova.

### C.3 — Multi-Dojo 🔴
> Un Aikidoka può appartenere a più Dojo contemporaneamente?

**Nota**: Rilevante per la struttura multi-tenant. Se sì, il monte ore è separato per Dojo o cumulativo?

### C.4 — Delega temporanea totale 🔴
> Il Caposcuola può delegare temporaneamente tutti i suoi poteri (es. assenza prolungata)?

### C.5 — Sotto-ruoli Aikidoka 🔴
> Gli Aikidoka possono avere sotto-ruoli funzionali (es. "responsabile pulizia tatami", "referente armi")?

---

## D — Comunicazioni e notifiche

### D.1 — Tipologia comunicazioni 🔴
> Le comunicazioni ufficiali sono: broadcast a tutti, per gruppo di gradi, individuali, o tutte e tre?

### D.2 — Canali di notifica 🔴
> Serve un sistema di notifiche push (mobile) e/o email? Per quali eventi?

**Possibili trigger**: lezione annullata, nuovo evento, scadenza certificato medico, promemoria esame, comunicazione ufficiale.

---

## E — Documenti e amministrazione

### E.1 — Certificato medico 🔴
> Il certificato medico ha una gestione con scadenze e promemoria automatici?

### E.2 — Quota associativa 🔴
> Il sistema deve tracciare lo stato della quota associativa Aikikai d'Italia?

### E.3 — Gestione pagamenti 🔴
> Il sistema deve gestire i pagamenti delle quote (mensili, annuali) o solo tracciarli?

---

## F — Stack tecnologico

### F.1 — Preferenza backend 🟡
> Preferenza tra Supabase, Firebase, AWS?

**Risposta**: Non c'è una preferenza rigida al momento. Verrà scelta l'opzione più in linea con il livello di scalabilità e di costo richiesti, valutando le funzionalità offerte (Supabase, Firebase, ecc.).

### F.2 — Esperienza frontend 🟢
> Esperienza pregressa con React, Flutter, o altre tecnologie?

**Risposta**: Esperienza da sfruttare in React e base in React Native. Nessuna esperienza in Flutter, ma apertura all'apprendimento se dovesse risultare la scelta più strategica. Si consiglia l'uso primario del framework React/React Native.

### F.3 — Budget infrastruttura 🟡
> Budget previsto per cloud e API LLM?

**Risposta**: Al momento non stringente e puntuale. Inizialmente per uso ridotto (Sensei e gruppo interno), quindi budget contenuto o in tier gratuiti. Da valutare a progetto maturo l'eventuale "upgrade".

### F.4 — Provider AI 🟡
> Per l'assistente AI: Google Gemini è la preferenza o valutiamo anche altri? (Es. integrazione NotebookLM)

**Risposta**: Si è deciso di rimandare la specifica proposta di NotebookLM, e forse in generale funzionalità AI complesse, ad una fase successiva quando ci sarà una visione più chiara dell'integrazione.

---

## G — Feature future

### G.1 — Glossario interattivo 🔴
> Il glossario nell'app deve essere navigabile per livello dell'allievo? Con ricerca? Con immagini/video?

### G.2 — Assistente AI — scope 🔴
> L'assistente deve essere disponibile a tutti gli Aikidoka o solo da un certo grado in su?

### G.3 — Chat vocale 🔴
> La chat vocale è prioritaria nella prima release o è una fase successiva?

---

## H — Progetti interni, Corsi e Laboratori

### H.1 — Gestione Progetti Multipli 🟡
> Come si gestiscono attività collaterali o di approfondimento non strettamente facenti parte del monte ore classico di Aikido?

**Risposta / Specifica in bozza**: 
È emersa la necessità di modellare l'entità **Progetti**. Un Progetto può essere di varia natura:
- Il corso di Aikido principale stesso (visto come progetto master).
- Sotto-progetti teorici o filosofici legati all'Aikido.
- Corsi secondari e collaterali (es. Yoga).
- Classe di Antroposofia e Scienze dello Spirito.
- Corso di lingua/cultura giapponese.

**Proprietà previste per un Progetto:**
- Ha un proprio calendario.
- Ha un proprio gruppo di partecipanti e criteri di iscrizione.
- Ha un proprio responsabile/conduttore.
- Può avere un proprio budget o logiche finanziarie.

### H.2 — Laboratori 🟡
> Cosa sono i Laboratori e come si relazionano ai progetti?

**Risposta / Specifica in bozza**: 
I Progetti possono integrare al loro interno dei **Laboratori**. 
- Sono spazi di attività che possono essere periodici, occasionali, specifici o fondamentali.
- Possono essere gestiti dal Sensei, da un Aikidoka Senpai responsabile, o da esperti esterni autorizzati.
- L'accesso può essere pubblico (anche a non tesserati del Dojo), privato (solo per tesserati), o altamente selettivo (riservato solo a chi ha certi requisiti di grado / appartenenza ad altri progetti, es. "Solo per Kyu" o "Solo per Classe Antroposofica").
- Il Sensei manterrà sempre il potere di forzare l'accesso bypassando i requisiti (eccezioni).

---

## I — Gestione Pagamenti (feature futura avanzata)

> ⚠️ Feature non strettamente richiesta nella fase iniziale. Da discutere con il responsabile di progetto per una eventuale integrazione futura.

### I.1 — Scope della gestione pagamenti 🔴
> Il sistema deve gestire i pagamenti o solo tracciarli?

**Opzioni da valutare**:
- **Livello 1 — Solo tracciamento**: il sistema registra lo stato dei pagamenti (pagato/non pagato, data, importo) senza gestire transazioni reali
- **Livello 2 — Gestione quote**: generazione automatica delle quote (mensili, annuali, per progetto), notifiche di scadenza, storico pagamenti
- **Livello 3 — Pagamenti integrati**: integrazione con gateway di pagamento (Stripe, PayPal, ecc.) per pagamenti online

### I.2 — Tipologie di pagamento da gestire 🔴
> Quali flussi finanziari esistono nel Dojo?

**Possibili voci**:
- Quota associativa Aikikai d'Italia (annuale, obbligatoria per esami)
- Quota mensile/annuale di frequenza al Dojo
- Quote di partecipazione a stage ed eventi speciali
- Quote di iscrizione a Progetti/Corsi specifici (Yoga, Antroposofia, Giapponese, ecc.)
- Costi per esami di grado
- Eventuali costi per materiale (keikogi, armi, ecc.)

### I.3 — Fatturazione e ricevute 🔴
> Serve emettere ricevute o fatture? Il Dojo è un'associazione con obblighi fiscali specifici?

**Nota**: Le ASD/ETS hanno regimi fiscali particolari. Da verificare con il commercialista/responsabile del Dojo.

### I.4 — Solleciti e scadenze 🔴
> Il sistema deve inviare promemoria automatici per pagamenti in scadenza o scaduti?

### I.5 — Dashboard finanziaria 🔴
> Serve una vista riepilogativa per il Caposcuola/Segretario con entrate, quote scadute, situazione complessiva?

**Da discutere**: il livello di complessità di questa feature potrebbe richiedere competenze contabili specifiche e conformità normativa.

---

## Come usare questo documento

1. Portare le domande 🔴 alle sessioni con gli stakeholder
2. Aggiornare lo stato (🟢/🟡/🔴) dopo ogni discussione
3. Per le risposte 🟢, verificare che siano state integrate nei documenti di riferimento
4. Nuove domande vengono aggiunte in fondo alla sezione appropriata
