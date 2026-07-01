# MugenDojo — Design Language «Sumi & Ai» (墨と藍)

> Stato: `[ATTIVO]` · Validata dai deck cliente (`docs/design/MugenDojo_Digital_Harmony.pdf`, `…_The_Infinite_Way.pdf`), 2026-07-01.
> Riferimento vincolante per ogni UI (Admin + Mobile). UI in italiano, codice in inglese.

L'identità non è un'ipotesi: i materiali del cliente confermano washi + indaco *aizome* + sigillo vermiglio + *enso* + display mincho. Lo strumento è **invisibile**: «amplifica, non sostituisce».

## 1. Principio guida (voice & comportamento)

- **Strumento invisibile / Mushin** — interfaccia svuotata da rumore, ampio spazio negativo (*ma* 間), serenità. La gestione burocratica scompare in background.
- **Human-in-the-loop, non negoziabile** — «il sistema **propone** i dati, il Maestro **dispone**». L'algoritmo non decide mai l'idoneità all'esame: la mostra. La decisione resta del Caposcuola (ciclo-vita §04). L'AI futura (ADR-006) si ancora a questo.
- **Tono** — «promemoria gentili», «certezza ma con discrezione». Niente allarmi rumorosi; errori chiari e non drammatici; empty-state come invito calmo.
- *Zanshin* nel diario (presenza che continua dopo il gesto); il check-in è un **rituale** d'ingresso (Genkan), non un tap frettoloso.

## 2. Information architecture — «le stanze del Dojo» (IBRIDO)

Le stanze sono **gruppi di sezione**; ogni voce del rail mostra icona-stanza + **label funzionale** chiara (brand + usabilità).

| Stanza | Sezioni (label funzionali) |
|--------|----------------------------|
| **Genkan** (ingresso) | Presenze · Check-in QR/NFC · Ospiti |
| **Tatami** (keiko) — *cuore* | Dashboard/Monte Ore · Calendario · Stage · Ore di conduzione |
| **Shobo** (biblioteca) | Esami/Programmi per grado · Diario · Glossario/Risorse |
| **Shomen** (santuario) — *solo Caposcuola* | Idoneità · Eccezioni · Deleghe/Permessi |
| **Naka-niwa** (cortile) | Comunicazioni · Progetti/Laboratori · Scadenze |

Mobile (Aikidoka): 3 tab «Bussola del proprio cammino» — **Diario**, **Glossario/Risorse**, **Idoneità/Monte Ore** — con nomi funzionali.

## 3. Palette (token in `apps/admin/src/app/globals.css`)

`sumi #1B1A17` (inchiostro/testo) · `ai #20374D` (indaco aizome/brand) · `ai-deep #14222F` · `washi #E9EAE4` (carta, sfondo) · `washi-raised #F3F2ED` · `shu #C7402A` (vermiglio del sigillo, accento parsimonioso) · `tatami #9A9367` (data-viz). Cinture: `belt-{white,yellow,orange,green,blue,brown,black}` per i gradi.

> Nuance: i deck usano un washi **più caldo** (crema). Resta distintivo perché l'accento è indaco/vermiglio-sigillo (non terracotta). Scaldare leggermente `washi` è opzionale, mantenendo `ai` primario.

## 4. Tipografia

- **Display** Zen Old Mincho — titoli, gradi, momenti rituali. Usata con misura.
- **Body** IBM Plex Sans — testo, buon supporto diacritici italiani.
- **Dati** IBM Plex Mono — Monte Ore e cifre, come un registro/ledger.

## 5. Signature & motivi visivi

- **Enso = Monte Ore** — anello a pennello con apertura, tacche indaco, stroke = colore cintura del grado target, si completa con le ore. Già implementato: `apps/admin/src/components/enso-hour-gauge.tsx` (validato 1:1 dai deck «Ogni Ora, Una Pennellata»).
- **Sumi a pennello full-bleed** come divisori/hero accent.
- **Texture**: trama *aizome*/intreccio del filo, pieghe dell'hakama, carta washi (fibre) per superfici/empty-state.
- **Calligrafia kanji** sobria come watermark/brand: 無 (mu), 心 (kokoro), 合気 (aiki).
- **Illustrazioni line-art a inchiostro** per diagrammi/empty-state (stile mappa del dojo), non icone generiche.
- Layout: rail verticale = cucitura dell'hakama; card calme con filo `ai`; numerazione progressiva solo dove c'è sequenza reale (gradi Kyu 6→1→Dan).

## 5a. Enso «Monte Ore» — realizzazione tecnica

Non un anello geometrico: una **pennellata sumi reale** che l'Aikidoka imprime nel tempo. Metodo (ibrido procedurale) in `apps/admin/src/components/enso-hour-gauge.tsx`, prototipo tunabile in `docs/design/enso-prototype.html`:

- **Fascio di setole** (non un tratto pieno): ~22 sotto-pennellate sottili che seguono l'arco. Simula i peli del pennello → setole interne, vuoti *dry-brush*, coda sfrangiata.
- **Inviluppo di larghezza affusolato**: testa pesante (touch-down bagnato) → assottiglia → coda a punta fine. Le setole si aprono a ventaglio alla testa e convergono in punta alla coda.
- **Setole esterne più corte e gappy** (`stroke-dasharray` irregolare) = bordi secchi; alcune sfuggono come *whisker*.
- **Filtro dry-brush**: `feTurbulence`+`feDisplacementMap` (edge organico) + `feComponentTransfer` sull'alpha (vuoti d'inchiostro).
- **Colore = cintura del grado target** (`gradeBeltColor`); nero sumi al Dan.
- **Rivelazione progressiva** = maschera ad arco che cresce con le ore (il fascio resta statico → performante); il cerchio si chiude al requisito. `prefers-reduced-motion` → nessuna animazione.
- **Ghost**: enso completo molto tenue (opacity ~0.06) = "memoria della carta" del cammino da compiere.

**Mobile (react-native-svg)**: i filtri SVG sono limitati; portare il fascio di setole (path + dash) che regge da solo, con filtro ridotto o assente. La forma/taper danno già il carattere brush; la grana fine è un plus.

## 6. Quality floor (sempre)

Focus tastiera visibile · `prefers-reduced-motion` rispettato (enso e ogni animazione) · responsive fino a mobile · contrasto AA · empty-state come invito ad agire, non vuoto.
