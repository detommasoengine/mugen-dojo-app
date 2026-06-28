# ADR-005 — Notifiche e comunicazioni

> Stato: `[ACCETTATA]` | Data: 2026-06-28 | Origine: intervista (2026-06-27, D.1 / D.2)

## Contesto

La tabella `communications` esiste con `target_audience` testuale ('all', 'grade:kyu_3+', 'project:uuid'). Restava da decidere la tipologia di comunicazioni e i canali di notifica.

## Decisione

### Tipologie di comunicazione (D.1)
**Broadcast + per gruppo (range gradi / etichette) + individuali**. Broadcast e gruppo restano espressi da `target_audience`; i messaggi individuali e il tracciamento lettura usano una tabella destinatari.

### Canali di notifica (D.2)
**Email + push da subito**: Expo Notifications (mobile) + email via SMTP/Supabase. Trigger previsti: lezione annullata, nuovo evento, scadenza certificato medico, promemoria esame, comunicazione ufficiale, scadenza quota.

## Modello dati

- `communication_recipients` (`communication_id`, `profile_id`, `read_at`) — destinatari individuali + stato lettura.
- `push_tokens` (`profile_id`, `expo_token`, `platform`) — registrazione device per push.
- `notifications` (generica, per canale/stato) — coda/log degli invii.

## Conseguenze

- **Infra**: serve configurare SMTP (o provider email) e il servizio push Expo; gli invii passano da Edge Function (mai `service_role` nel client).
- **Costi**: push Expo gratuito nei limiti; email dipende dal provider — coerente col budget contenuto della fase iniziale.
- **Rischio**: i trigger vanno centralizzati per evitare invii duplicati; valutare batching per i broadcast.
