# Briefing MugenDojo — Registro delle sessioni

Questo documento traccia le sessioni di briefing e le decisioni prese progressivamente.

---

## Sessione 1 — 2026-04-11 — Setup iniziale

### Cosa è stato fatto
- Creata la struttura documentale del progetto in `docs/`
- Definiti i documenti di business iniziali (glossario, modello dominio, ruoli, calendario)
- Creati i requisiti funzionali iniziali (REQ-001, REQ-002, REQ-003)
- Avviata l'analisi dello stack tecnologico (ADR-001)

---

## Sessione 2 — 2026-04-11 — Integrazione Knowledge e decisioni chiave

### Input ricevuti
- Integrati i PDF dalla cartella `docs/Knowledge/`:
  - **Conoscere l'Aikido** — Insegnamenti di Tada Sensei, Ki no Renma, 5 livelli della pratica, filosofia
  - **Programma di Esami** — Requisiti esatti per ogni passaggio di grado (Aikikai d'Italia)
- Ricevute decisioni chiave dall'utente su registrazione, risorse, AI

### Decisioni prese

#### Requisiti esami
- ✅ Inseriti i requisiti ufficiali Aikikai d'Italia (ore e mesi per ogni grado)
- ✅ I parametri saranno personalizzabili dal Caposcuola per ogni Dojo

#### Registrazione presenze
- ✅ Metodi definiti: appello, QR Code (con conferma Admin), inserimento diretto
- ✅ Pre-registrazione email da parte del Segretario
- ✅ Requisito: sicurezza, tracciabilità, restrizione ai soli utenti riconosciuti

#### Risorse di studio
- ✅ Due livelli: didattiche generali (Sensei/Segretario) e personali (Aikidoka)
- ✅ Il glossario Aikido sarà una sezione dell'app gestibile dal Caposcuola

#### Assistente AI (feature futura)
- ✅ Addestramento GPT/LLM su Knowledge Base interna specifica
- ✅ Chat testuale e vocale per domande su corso, studio, Dojo
- ✅ Azioni agentiche tramite MCP per interagire con le funzionalità dell'app
- ✅ Tecnologie da valutare: Google Gemini API, RAG, MCP
- ✅ Complessità da contenere — si procede solo se non impatta eccessivamente

#### Stack tecnologico
- ✅ Cross-platform Android + WebApp
- ✅ Database cloud (Supabase/Firebase/AWS — da decidere la soluzione più pratica)
- ✅ Valutare MCP e RAG per operazioni tramite LLM

### Documenti aggiornati
- `01-glossario-dominio.md` — Glossario massivamente espanso con terminologia dai PDF
- `02-modello-dominio.md` — Nuove entità: Risorsa Studio, Programma Tecnico, Comunicazione
- `04-ciclo-vita-aikidoka.md` — Requisiti esami ufficiali Aikikai, metodi registrazione, documenti
- `06-risorse-studio-ai.md` — **NUOVO** — Risorse di studio e feature AI

### Domande ancora aperte

#### Dominio e regole
1. ~~Requisiti esatti ore/mesi per ogni passaggio di grado~~ → ✅ Risolto
2. Le ore di stage hanno un peso diverso dalle ore di lezione regolare?
3. Possono esistere lezioni differenziate per livello (principianti/avanzati)?
4. Il template settimanale (Lun/Mer/Ven 19-20) è fisso tutto l'anno o cambia (es. orario estivo)?
5. Il certificato medico ha una gestione con scadenze e promemoria automatici?

#### Multi-tenancy e ruoli
6. Può esistere più di un Segretario per Dojo?
7. Serve un ruolo "Ospite" per praticanti di passaggio da altri Dojo?
8. Un Aikidoka può appartenere a più Dojo contemporaneamente?

#### Funzionalità
9. Le comunicazioni ufficiali: annunci broadcast, per gruppo di gradi, o anche individuali?
10. ~~Risorse di studio~~ → ✅ Risolto (due livelli)
11. Serve un sistema di notifiche push (mobile) ed email?
12. ~~Metodo registrazione presenze~~ → ✅ Risolto

#### Stack e AI
13. Preferenza tra Supabase, Firebase, AWS?
14. Esperienza pregressa con qualche tecnologia frontend (React, Flutter, ...)?
15. Budget previsto per infrastruttura cloud e API LLM?
16. Per l'assistente AI: Google Gemini è la preferenza o valutiamo anche altri?

### Prossimi passi
- [ ] Rispondere alle domande ancora aperte
- [ ] Decidere lo stack tecnologico definitivo (ADR-001)
- [ ] Definire wireframe delle schermate principali
- [ ] Progettare lo schema del database
- [ ] Definire le API
