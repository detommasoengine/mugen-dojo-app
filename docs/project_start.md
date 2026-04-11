Creiamo un'applicazione Cross Platform (destinata ad Android e WebApp) che servirà per gestire le attività interne di un Dojo di Aikido
La prima gestione che userà l'applicazione è una tabella di registrazione di tutte le ore di lezione che sono state accumulate nel mio percorso nel dojo di Aikido.
L'obiettivo è quello di avere una traccia del numero di ore di lezione presenziate al fine di poter calcolare quante sono state accumulate in un periodo e verificare se sono sufficienti per conseguire l'esame per l'accesso al Kyu o Dan successivo.
Le regole sono le seguenti:
- Ogni mese c'è una calendarizzazione delle ore che comprende: lezioni settimanali, ore straordinarie conseguite per partecipazione a stage specifici in date particolari (includere scheda per eventi specifici.
- Ogni settimana prevede 3 lezioni distribuite nei giorni: Lunedì, Mercoledì, Venerdì dalle 19:00 alle 20:00
- Potrebbero capitare delle eccezioni in cui si estenda l'orario di una lezione ad un altra ora (ma sono eccezioni);
- Considera che alcuni mesi sono composti da 5 settimane
- Ci sono alcuni mesi o periodi nel quale si sospendono le lezioni (Agosto, periodi festivitá), bisogna quindi segnare, predisporre e configurare i giorni che sono giá bloccati nel periodo.

Bisogna garantire un conteggio ben calcolabile in un periodo.

Ci sarà quindi un calendario che caricherà tutte le lezioni previste di un anno accademico (che va da 01 Settembre a 31 Luglio); Agosto è il mese di sospensione.
Ci sono calendarizzate le date degli Esami, stage, Laboratori.

 
Proviamo ad impostare ora un modello iniziale, da far avanzare il progetto con altre soluzioni
Usiamo un database in Cloud per consentire di avere tutte le tabelle necessarie contattabili per gestire le attività (Supabase, Firebase, AWS). Decidiamo la soluzione più pratica.

Dopo questa sezione, cercheremo delle funzionalità aggiuntive da integrare.

Studia quindi la natura di questo strumento (che non si limiterà solo alla semplice gestione delle lezioni, calendari, Esami, ...)

Ma a tutti gli strumenti, funzionalità legate alla Disciplina dell'Aikido in un Dojo.

Studiamo meglio questo Dominio informandoci sul Web su come può essere strutturato e poi facciamo breafing per iniziare a dargli una struttura


Aggiungo già da ora che l'applicazione dovrà avere un'accesso multitennant per consentire a più livelli di utenti di gestire alcune attività.
Nel Dojo la struttura gerarchica prevede:
- Il Caposcuola responsabile (Admin) che gestisce tutte le operazioni di: 
  ** Registrazione, Modifica e Cancellazione degli utenti: Standard e con gestione avanzata
  ** Calendari Lezioni, Eventi Stage, 
  ** Comunicazioni Ufficiali, 
  ** Abilitazione Collaboratore Segretario,

- Segretario Senpai (Admin Secondario): ha i privilegi a gestire le funzionalità abilitate dal Caposcuola

- Aikidoka: studenti iscritti al Dojo che seguono il percorso:
   * Ogni studente ha un suo pannello di gestione
   * Avrà una scheda di registrazioneche compilerà una volta che riceverà le credenziali di Accesso;
   * Registrerà tutte le sue attività all'interno 
   * potr tenere: Diario di Bordo, tutte le tappe  calendarizzate, * * Informazioni e risorse di studio (Elenco bibliografie, video, link, Scritti, ...)










Intanto ti chedo di raccogliere in un modulo tutte queste domande di specifiche, per lasciarle aperte ad una ridiscussione futura da argomentare con gli altri stakeholder interni del progetto.


Ti rispondo comunque intanto a questi punti per inniziare ad argomentarle:

# 1. Ore di stage pesano diversamente dalle ore di lezione?
Le ore di stage tendenzialmente hanno lo stesso perso di un'ora di lezione. 
Le ore di stage sono considerate ore di approfondimento e possono però venire conteggiate in modo diverso rispetto alle ore di lezione, assegnandoli un peso differente.
L'amministratore che gestisce la costruzione dell'evento, potrà decidere quale peso assegnare alle ore di partecipazione ad uno stage che verrà poi riflesso nel conteggio totale delle ore di lezione di uno studente. 

# 1.a peso ore di lezione attive
Qualora un Aikidoka Senpai (con requisiti di carriera avanzati) fosse autorizzato e delegato dal caposcuola a condurre una lezione, le ore di lezione attive verranno conteggiate come ore di lezione attive e varranno doppie (1 ora di lezione tenuta come conduttore varrà 2 ore di lezione attive).
Anche questo parametro può essere configurabile, ovvero l'amministratore potrà decidere quale peso assegnare alle ore di lezione attive tenute da un Aikidoka Senpai (es. 1 ora di lezione tenuta come conduttore varrà 3 ore di lezione attive). 

# 2. Lezioni differenziate per livello?

Sarà possibile integrare un sistema di differenziazione delle lezioni per livello, in modo da consentire una gestione più mirata e personalizzata del percorso.
Ad esempio, il Sensei, può istituire una lezione singola o periodica da assegnare ad una particolare categoria di Aikidoka (es. solo per i Kyu, solo per i Dan, solo per i principianti, solo per gli avanzati, ecc.), integrando un calendario selettivo. I profili degli studenti che rientrano in questo criterio hanno accesso alla lezione. Qualora il Sensei vogli abilitare un'eccezione per uno o un gruppo di studenti fuori requisiti, potrà farlo.

# 3. Può esistere più di un Segretario?
Sì, può esistere più di un Segretario, ma solo il Caposcuola può abilitare un Segretario. 
Ad ogni Segretario Senpai il Caposcuola potrà assegnare dei privilegi specifici, in modo da consentire una gestione più mirata e personalizzata del percorso. Ad esempio, un Segretario potrebbe essere abilitato a gestire solo le iscrizioni, un altro solo la gestione degli esami, un altro ancora la gestione delle comunicazioni ufficiali, ecc. 

# 4. Preferenza tra Supabase/Firebase/AWS?

La scelta del database dipenderà dal livello di integrazione dell'applicazione con i servizi offerti da ciascuna piattaforma. 
In base al livello di scala ed agli specifici requisiti profilati, si potrà optare per una soluzione più in linea con le necessità attuali del progetto, in termini di spese e funzionalità offerte piuttosto che un'altra. 

# 5. Esperienza con React/Flutter?
Con React ho una discreta esperienza, ho sviluppato diverse applicazioni web con React e React Native (base). 
Con Flutter non ho ancora nessuna esperienza, ma sono disposto ad imparare se è necessario ed utile al nostro progetto.

# 6. Budget per cloud e API LLM?
Per quanto riguarda il budget per cloud e API LLM, non ho ancora una idea precisa, ma sono disposto a discuterne e a trovare una soluzione che sia in linea con le necessità del progetto.
Inizialmente il progetto sarà utilizzato solo da me e dal team interno del dojo, quindi non avrò bisogno di un budget elevato. Successivamente, quando il progetto sarà più maturo, potremo valutare un budget più elevato.
Non è comunque un requisito strettamente necessario.
---


# 7. Aggiunta di PROGETTI interni al Dojo
Vorrei inoltre aggiungere un altro punto da mettere a sistema, che vorrei fosse integrato in un requisito da sviluppare:
* L'aggiunta di PROGETTI interni al Dojo, che potrebbero diventare sistemici e possono essere (ad esempio): 
  * Progetto di studio di un particolare aspetto tecnico o filosofico dell'Aikido
  * Lo stesso Corso di Aikido è di per se un Progetto (che è considerato come Progetto Principale)
  * Progetto di un Corso di Yoga secondario e collaterale
  * Progetto di studio di una Classe Antroposofica per i Corsisti che vogliono approfondire i temi avanzati delle Scienze dello Spirito
  * Progetto di studio di un Corso di Lingua Giapponese per i Corsisti che vogliono approfondire i temi avanzati della lingua giapponese

Ogni progetto avrà un suo calendario, un suo budget, un suo gruppo di partecipazione, un suo responsabile, ecc. e può integrare dei Laboratori, che sono spazi di attività che possono essere: specifici, Periodici, Occasionali, fondamentali.
I Laboratori possono essere gestiti da un Aikidoka Senpai, che sarà il responsabile del laboratorio e potrà gestire le attività del laboratorio in autonomia, oppure possono essere gestiti dal Sensei o da un referente esterno autorizzato dal Sensei.
Possono essere previsti dei Laboratori che sono aperti a tutti (anche agli esterni), ai partecipanti del Dojo, oppure possono essere previsti dei Laboratori che sono aperti solo a una categoria di Aikidoka o iscritti a Progetti specifici (es. solo per i Kyu o Principianti di Aikido, solo per i Dan o gli avanzati, iscritti al Percorso di Antroposofia, ...), integrando un calendario selettivo. I profili degli studenti che rientrano in questo criterio hanno accesso al laboratorio. Qualora il Sensei voglia abilitare un'eccezione per uno o un gruppo di studenti fuori requisiti, potrà farlo.

Questi progetti potranno essere partecipati dagli iscritti all'interno del Dojo, che possono essere Aikidoka oppure soggetti che sono autorizzati ad accedere al progetto specifico, integrando un calendario selettivo. I profili degli studenti che rientrano in questo criterio hanno accesso al progetto. Qualora il Sensei voglia abilitare un'eccezione per uno o un gruppo di studenti fuori requisiti, potrà farlo.
Comuqnue solo il Sensei può abilitare un utente ad un Progetto.


# 8. Proposta NotebookLM
Rimandiamo questa proposta ad una fase successiva, quando avremo una idea più chiara di come integrare questa funzionalità nel sistema.


---
Mettiamo tutte queste note in un documento separato, che potremo consultare in futuro per integrare queste funzionalità nel sistema. Molte di queste domande, saranno poi ridiscusse con i soggetti interni al dominio. Quindi è utile avere un punto di raccolta.