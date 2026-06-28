# ADR-003 — Modello ruoli esteso: Ospiti e sotto-ruoli con permessi

> Stato: `[ACCETTATA]` | Data: 2026-06-28 | Origine: intervista (2026-06-27, C.2 / C.4 / C.5)

## Contesto

Il modello ruoli iniziale prevede `head_master`, `secretary`, `aikidoka` (enum `user_role`) più i 13 flag granulari di `secretary_permissions`. L'intervista ha introdotto: praticanti esterni/di prova (C.2), la necessità (o meno) di delega totale del Caposcuola (C.4), e incarichi funzionali degli Aikidoka (C.5).

## Decisione

### Ospiti (C.2) — due concetti distinti
- **Ospite generico**: nuovo valore `guest` nell'enum `user_role`. Partecipa a eventi/lezioni aperte ma non ha percorso-grado né monte ore certificante (es. lezione di prova).
- **Aikidoka guest**: flag `profiles.is_guest boolean DEFAULT false`. Praticante già identitario nella disciplina ma esterno al Dojo target (es. stage aperto).

### Delega Caposcuola (C.4)
**Nessun meccanismo di "acting head master"**. I permessi granulari già delegabili ai Segretari coprono l'operatività durante un'assenza.

### Sotto-ruoli con permessi (C.5)
Gli incarichi degli Aikidoka **conferiscono capacità**, non sono solo etichette. Si **generalizza il pattern di `secretary_permissions`** in un modello di incarichi/permessi estendibile (es. il "cassiere" ottiene `can_view_payments` / `can_manage_payments`).

## Conseguenze

- *Delta schema*: `user_role += 'guest'`; `profiles.is_guest`; modello incarichi-permessi generalizzato (es. tabella `dojo_role_assignments` + flag, oppure estensione dei flag esistenti). Da dettagliare in migration.
- **RLS**: nuove policy per il ruolo `guest` (accesso ridotto: solo eventi aperti, niente percorso-grado). I permessi degli incarichi vanno verificati come quelli dei segretari.
- **Rischio**: la generalizzazione dei permessi tocca tabelle e policy esistenti — fare migration isolata + test RLS coi 3 utenti seed prima di estendere.
