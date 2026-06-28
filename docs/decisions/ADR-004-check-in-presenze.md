# ADR-004 — Check-in presenze in loco (QR / NFC)

> Stato: `[ACCETTATA]` | Data: 2026-06-28 | Origine: intervista (2026-06-27, REQ-004 DP-1..6)

## Contesto

REQ-004 prevede il check-in in loco con QR dinamico, QR stampato o NFC. Restavano aperte 6 decisioni progettuali (DP-1..6) su modalità, sicurezza e privacy.

## Decisione

| Aspetto | Scelta |
|---|---|
| **Modalità QR (DP-1)** | **Dinamico rotante + stampato**: token di sessione rotante (HMAC, scadenza ~15 min) per il check-in live, più QR stampato persistente del Dojo come fallback. |
| **Geolocalizzazione (DP-2/6)** | **Opzionale, configurabile per-Dojo**, disattivata di default (GPS indoor impreciso, privacy). Raggio configurabile quando attiva. |
| **NFC (DP-3/5)** | **Rinviato**. MVP solo QR; NFC come fase successiva dedicata (Android HCE; iOS ha limiti). |
| **Conferma (DP-4)** | **Configurabile, auto di default**: check-in via QR si auto-conferma (`REGISTRATA`→`CONFERMATA`); l'auto-registrazione senza QR resta da confermare. |

## Modello dati

- `attendance_sessions` (`id`, `event_id`, `token_hash`, `expires_at`, `created_by`, opzioni geo) — sessioni di check-in rotanti.
- Config su `dojos`: QR stampato persistente, geofence opzionale (lat/lng/raggio), policy auto-conferma per tipo.
- `attendances.method` (enum `AttendanceMethod`) già esistente: distingue appello / QR / inserimento diretto.

## Conseguenze

- **Sicurezza**: il token HMAC con scadenza mitiga lo screenshot del QR; il QR stampato è più esposto e va vincolato almeno a finestra temporale.
- **Privacy**: geolocalizzazione off di default → nessun dato di posizione raccolto salvo scelta esplicita del Dojo.
- **Rinvii**: NFC e antifrode avanzato (rotazione token lato stampato) non in MVP.
- Una Edge Function genera/valida i token (mai `service_role` nel client).
