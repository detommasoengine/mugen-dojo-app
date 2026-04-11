# 06 — Risorse di Studio e Assistente AI

> Stato: `[BOZZA]` — Feature futura da pianificare

## Risorse di studio

### Organizzazione a due livelli

1. **Risorse didattiche generali** (gestite da Sensei e Segretario/Collaboratore)
   - Materiale ufficiale del Dojo
   - Bibliografie consigliate
   - Video di riferimento
   - Link a risorse esterne verificate
   - Programmi tecnici per grado
   - Documenti Aikikai d'Italia (es. "Conoscere l'Aikido", "Programma di Esami")

2. **Risorse personali** (gestite dall'Aikidoka)
   - Appunti personali
   - Link e riferimenti salvati
   - Note dal Diario di Bordo
   - Materiale di studio personale

### Glossario come strumento didattico

Il glossario dell'Aikido (→ vedi [01-glossario-dominio](01-glossario-dominio.md)) sarà accessibile nell'app come sezione dedicata:
- Il Caposcuola potrà gestire e personalizzare il contenuto
- Possibilità di adattare il livello di dettaglio al grado dell'allievo (es. un 6° Kyu vede terminologia base, un 1° Kyu vede anche concetti avanzati)
- Collegamento con il programma tecnico di ogni grado

## Assistente AI (Feature futura)

### Obiettivo

Integrare un assistente AI basato su LLM per fornire un livello di conoscenza personalizzato all'allievo, in grado di:

- Rispondere a domande specifiche sul corso, lo studio, il Dojo
- Basarsi su una **Knowledge Base interna** specifica e curata
- Fornire risposte pertinenti e coerenti con gli insegnamenti del Dojo
- Interagire tramite **chat testuale o vocale**

### Architettura prevista

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────────┐
│  Chat UI     │────►│  Backend API     │────►│  LLM Provider    │
│  (testo/voce)│     │  + RAG Pipeline  │     │  (Gemini/altro)  │
│              │◄────│                  │◄────│                  │
└──────────────┘     └─────────────────┘     └──────────────────┘
                            │
                            ▼
                     ┌─────────────────┐
                     │  Knowledge Base  │
                     │  - PDF caricati  │
                     │  - Glossario     │
                     │  - Programmi     │
                     │  - Regole Dojo   │
                     └─────────────────┘
```

### Tecnologie da valutare

- **Google Gemini API** — per LLM e possibilmente voice
- **RAG (Retrieval-Augmented Generation)** — per fondare le risposte sulla Knowledge Base
- **MCP (Model Context Protocol)** — per azioni agentiche integrate nell'app
- **NotebookLM** — come strumento di analisi/preparazione della Knowledge

### Azioni agentiche (via MCP/API)

L'assistente potrebbe eseguire azioni nel sistema tramite comandi conversazionali:
- "Quante ore ho fatto questo mese?"
- "Sono idoneo per il prossimo esame?"
- "Mostrami il programma del 3° Kyu"
- "Registra la mia presenza alla lezione di oggi"
- "Quando è il prossimo stage?"

### Sicurezza e limiti

- L'assistente risponde solo con informazioni dalla Knowledge Base verificata
- Non inventa o confonde tecniche o regole
- Le azioni agentiche rispettano i permessi dell'utente
- Il Caposcuola controlla quali documenti alimentano la Knowledge Base

### Knowledge Base — contenuto iniziale

Dalla cartella `docs/Knowledge/`:
- `Conoscere_l'Aikido.pdf` — Insegnamenti di Tada Sensei, Ki no Renma, filosofia
- `Programma_di_Esami.pdf` — Programma tecnico completo per ogni grado

La Knowledge crescerà con materiale aggiuntivo caricato dal Caposcuola.

## Domande aperte

- [ ] Quale LLM provider preferire? (Google Gemini, OpenAI, Anthropic, open-source)
- [ ] Il costo delle API è sostenibile nel budget del progetto?
- [ ] L'assistente deve essere disponibile a tutti gli Aikidoka o solo a certi gradi?
- [ ] La chat vocale è prioritaria o può essere una fase successiva?
- [ ] Chi modera/valida le risposte dell'assistente?
