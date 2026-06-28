# 07 — Domande aperte per gli Stakeholder

> Stato: `[ATTIVO]` — Documento vivo, da portare alle sessioni di confronto con gli stakeholder interni
> Ultimo aggiornamento: 2026-06-27 (intervista decisioni di dominio)

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

### A.3 — Conteggio ore per tipologia 🟢
> Nel monte ore complessivo, serve una vista separata per tipo (lezioni regolari, stage, laboratori, ore attive)?

**Decisione (2026-06-27)**: Sì. Il monte ore si presenta come **totale pesato + breakdown** per tipo evento (lezioni / stage / laboratori) e per ruolo (ore passive di partecipazione vs ore attive di conduzione 2×). Impatta la business logic in `packages/shared` e la UI dashboard.

---

## B — Lezioni e calendario

### B.1 — Lezioni differenziate per livello 🟢
> Possono esistere lezioni riservate a specifiche categorie di Aikidoka?

**Risposta**: Sì. Il Sensei può istituire lezioni singole o periodiche assegnate a categorie specifiche (es. solo Kyu, solo Dan, solo principianti, solo avanzati). Il calendario diventa selettivo: solo i profili che rientrano nel criterio vedono e possono accedere alla lezione. Il Sensei può abilitare eccezioni per singoli studenti o gruppi.

**Decisione (2026-06-27)**: Categorizzazione per **range di gradi (min/max) + eccezioni individuali**. Già supportato dallo schema: `events.grade_filter_min/max` (e `lesson_templates.grade_filter_*`) + tabella `event_grade_exceptions` per includere/escludere singoli profili. Nessun delta schema, solo UI/logica.

→ Integrato in [05-calendario-regole](05-calendario-regole.md)

### B.2 — Orario lezioni variabile 🟢
> Il template settimanale (Lun/Mer/Ven 19:00-20:00) è fisso tutto l'anno o può cambiare (es. orario estivo)?

**Decisione (2026-06-27)**: **Template multipli con periodo di validità**. Si possono definire più `lesson_templates` ciascuno con `valid_from`/`valid_to` (es. un template estivo con orario diverso). La generazione calendario seleziona il template valido per data. *Delta schema*: aggiungere `valid_from`/`valid_to` (+ opzionale `season_label`) a `lesson_templates`.

### B.3 — Numero massimo assenze 🟢
> Esiste un numero massimo di assenze tollerato o è solo un dato informativo?

**Decisione (2026-06-27)**: **Limite configurabile** per-Dojo che incide sull'idoneità all'esame (non solo informativo). Richiede il calcolo delle "sessioni attese" dai template attivi meno i `suspension_periods`. *Delta schema*: config su `dojos` (es. `max_absences_default`) con override opzionale per grado su `exam_requirements`.

---

## C — Ruoli e multi-tenancy

### C.1 — Pluralità di Segretari 🟢
> Può esistere più di un Segretario per Dojo?

**Risposta**: Sì. Solo il Caposcuola può abilitare uno o più Segretari. A ciascun Segretario Senpai, il Caposcuola può assegnare privilegi verticali o specifici (es. uno gestisce solo le iscrizioni, un altro gli esami, un altro ancora le comunicazioni ufficiali).

### C.2 — Ruolo Ospite 🟢
> Serve un ruolo "Ospite" per praticanti di passaggio da altri Dojo?

**Decisione (2026-06-27)**: Sì, e si distinguono **due concetti**:
- **Ospite generico** (`Role.GUEST`): partecipa a eventi/lezioni aperte ma non ha ancora un'identità acquisita nella disciplina (es. lezione di prova, prospect). Nessun percorso-grado né monte ore certificante.
- **Aikidoka guest** (flag `is_guest` su profilo Aikidoka): praticante già identitario ma esterno al Dojo target (es. partecipa a uno stage aperto).

*Delta schema*: aggiungere valore `guest` all'enum `user_role`; aggiungere `is_guest boolean` a `profiles`. → vedi ADR-003.

### C.3 — Multi-Dojo 🟢
> Un Aikidoka può appartenere a più Dojo contemporaneamente?

**Decisione (2026-06-27)**: In questa fase il **Dojo è l'insieme chiuso** del progetto (macro-progetto unico). L'**architettura multi-tenant resta mantenuta** (`dojo_id` + RLS già ovunque), con **monte ore separato per Dojo**. L'apertura a profili multi-Dojo è prevista come **scalabilità futura**: dopo la fase di test commerciale, promozione a livello federale con altri dojo che si affiliano e adottano la soluzione con profilo proprio. Il design non deve precludere questo percorso. → vedi ADR-002.

### C.4 — Delega temporanea totale 🟢
> Il Caposcuola può delegare temporaneamente tutti i suoi poteri (es. assenza prolungata)?

**Decisione (2026-06-27)**: **Non serve** un meccanismo dedicato di "acting head master". I 13 permessi granulari già delegabili ai Segretari coprono il caso operativo.

### C.5 — Sotto-ruoli Aikidoka 🟢
> Gli Aikidoka possono avere sotto-ruoli funzionali (es. "responsabile pulizia tatami", "referente armi")?

**Decisione (2026-06-27)**: **Sotto-ruoli con permessi** (incarichi che conferiscono capacità specifiche, es. il "cassiere" vede i pagamenti). Si generalizza il pattern di `secretary_permissions` in un modello di incarichi con flag permessi estendibili. → vedi ADR-003.

---

## D — Comunicazioni e notifiche

### D.1 — Tipologia comunicazioni 🟢
> Le comunicazioni ufficiali sono: broadcast a tutti, per gruppo di gradi, individuali, o tutte e tre?

**Decisione (2026-06-27)**: **Tutte e tre** — broadcast a tutto il Dojo, per gruppo (range gradi / etichette), e individuali. La tabella `communications` esiste (`target_audience` testuale copre broadcast/gruppo); *delta schema*: tabella `communication_recipients` (per messaggi individuali + tracciamento lettura `read_at`). → vedi ADR-005.

### D.2 — Canali di notifica 🟢
> Serve un sistema di notifiche push (mobile) e/o email? Per quali eventi?

**Decisione (2026-06-27)**: **Email + push da subito** (Expo Notifications + email SMTP/Supabase). *Delta schema*: tabelle `push_tokens` (token Expo per profilo) e `notifications`. → vedi ADR-005.

**Trigger**: lezione annullata, nuovo evento, scadenza certificato medico, promemoria esame, comunicazione ufficiale, scadenza quota.

---

## E — Documenti e amministrazione

### E.1 — Certificato medico 🟢
> Il certificato medico ha una gestione con scadenze e promemoria automatici?

**Decisione (2026-06-27)**: Sì — **scadenza + promemoria** automatici (email/push) prima della scadenza, con avviso/blocco se scaduto (rilevante per la responsabilità del Dojo nella pratica sportiva). *Delta schema*: `profiles.medical_cert_expiry date`, `profiles.medical_cert_file_path text`.

### E.2 — Quota associativa 🟢
> Il sistema deve tracciare lo stato della quota associativa Aikikai d'Italia?

**Decisione (2026-06-27)**: Sì — **solo tracciamento stato** (tessera Aikikai pagata/scaduta, quota Dojo) con promemoria, gestito dal sotto-ruolo "cassiere" (vedi C.5). Nessuna transazione reale ora. *Delta schema*: tabella leggera `membership_status`.

### E.3 — Gestione pagamenti 🟢
> Il sistema deve gestire i pagamenti delle quote (mensili, annuali) o solo tracciarli?

**Decisione (2026-06-27)**: **Solo tracciamento** in questa fase (vedi E.2). Il modello di **gestione completa** (importi, scadenze, ricevute, eventuale gateway) è documentato come **Follow-Up post-test** nella sezione I — non implementato ora.

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

### F.4 — Provider AI 🟢
> Per l'assistente AI: Google Gemini è la preferenza o valutiamo anche altri? (Es. integrazione NotebookLM)

**Decisione (2026-06-27)**: **Astrazione provider-agnostic**. Si progetta un layer astratto e si sceglie il provider definitivo in fase AI dedicata, senza lock-in prematuro. Candidato di riferimento: **Claude (Anthropic)** per RAG/tool-use e azioni agentiche (MCP). → vedi ADR-006.

---

## G — Feature future

### G.1 — Glossario interattivo 🟢
> Il glossario nell'app deve essere navigabile per livello dell'allievo? Con ricerca? Con immagini/video?

**Decisione (2026-06-27)**: **Navigabile per grado + ricerca**, gestito dal Caposcuola, voci collegate al programma tecnico di ogni grado. Già supportato dallo schema: `glossary_entries` ha `min_grade`, `category`, `reading`, `sort_order`. Nessun delta schema, solo UI.

### G.2 — Assistente AI — scope 🟢
> L'assistente deve essere disponibile a tutti gli Aikidoka o solo da un certo grado in su?

**Decisione (2026-06-27)**: **Fase futura**. Ora si predispone solo l'infrastruttura (`CREATE EXTENSION vector`), nessuna chat/UI. Scope per grado e moderazione si definiscono nella fase AI dedicata. → vedi ADR-006.

### G.3 — Chat vocale 🟢
> La chat vocale è prioritaria nella prima release o è una fase successiva?

**Decisione (2026-06-27)**: **Fase successiva**, dentro il modulo AI dedicato (G.2). Non in scope per l'MVP.

---

## H — Progetti interni, Corsi e Laboratori

### H.1 — Gestione Progetti Multipli 🟢
> Come si gestiscono attività collaterali o di approfondimento non strettamente facenti parte del monte ore classico di Aikido?

**Decisione (2026-06-27)**: Modello Progetti **confermato e già a schema** (`projects`, `project_members`, `project_grade_exceptions`, link `events.project_id`). La **UI dedicata arriva in fase successiva** al core (presenze/calendario/esami): non blocca l'MVP.


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

### H.2 — Laboratori 🟢
> Cosa sono i Laboratori e come si relazionano ai progetti?

**Decisione (2026-06-27)**: Confermati come attività dentro i Progetti, schema mantenuto. UI in fase successiva (vedi H.1).


**Risposta / Specifica in bozza**: 
I Progetti possono integrare al loro interno dei **Laboratori**. 
- Sono spazi di attività che possono essere periodici, occasionali, specifici o fondamentali.
- Possono essere gestiti dal Sensei, da un Aikidoka Senpai responsabile, o da esperti esterni autorizzati.
- L'accesso può essere pubblico (anche a non tesserati del Dojo), privato (solo per tesserati), o altamente selettivo (riservato solo a chi ha certi requisiti di grado / appartenenza ad altri progetti, es. "Solo per Kyu" o "Solo per Classe Antroposofica").
- Il Sensei manterrà sempre il potere di forzare l'accesso bypassando i requisiti (eccezioni).

---

## I — Gestione Pagamenti (feature futura avanzata)

> ⚠️ Feature non strettamente richiesta nella fase iniziale. Da discutere con il responsabile di progetto per una eventuale integrazione futura.
>
> **Decisione (2026-06-27)** — **FOLLOW-UP post-test**: in questa fase si implementa solo il **Livello 1 (tracciamento stato)**, vedi E.2/E.3. I **Livelli 2-3 (gestione quote e pagamenti integrati)** restano questa sezione come modulo dedicato da riaprire dopo i test iniziali, con ADR propria.

### I.1 — Scope della gestione pagamenti 🟡
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
