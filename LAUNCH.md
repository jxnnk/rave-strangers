# Launch-Plan Rave Strangers (Ziel: in 1–2 Wochen live)

Prinzip: lieber wenige Funktionen, die perfekt laufen, als viele halbe.
USP in einem Satz: **Nie mehr allein raven. Finde deine Crew, nicht nur die Party.**

## Stand 20.11.

- Web-App live (PWA). Events, Karte, Crew-Finder, Chat, Mitfahren, Ticket-Alarm, Benachrichtigungen.
- Android-App läuft im Emulator. Crew-Tab, Chat, Mitfahren, Ticket-Alarm und Glocke wurden heute Nacht eingebaut, sind aber noch nicht getestet.
- iOS: Code für Apple Karten ist da, ein Build braucht noch Mac oder Codemagic.
- Daten: tägliche Event-, Prüf-, Link-Check- und News-Aufgaben.

## Woche 1: fertig machen

| # | Aufgabe | Wer |
|---|---|---|
| 1 | Android-App durchklicken, Screenshots von Fehlern schicken | Jannik |
| 2 | Fehler aus 1 beheben | Claude |
| 3 | Google-Play-Konto anlegen (25 € einmalig) | Jannik |
| 4 | Firebase-Projekt anlegen (kostenlos), `google-services.json` herunterladen | Jannik |
| 5 | Echte Push-Nachrichten: FCM in Flutter + Supabase Edge Function, die neue Zeilen aus `notifications` verschickt | Claude |
| 6 | App-Icon, Splash-Screen, Store-Texte, Screenshots | Claude (+ Jannik freigeben) |
| 7 | Datenschutzerklärung + Impressum (siehe LATER.md) | Jannik mit Vorlage von Claude |
| 8 | „Leaked password protection“ in Supabase Auth einschalten | Jannik |

## Woche 2: raus damit

| # | Aufgabe | Wer |
|---|---|---|
| 9 | Interner Test im Play Store mit 10–20 Leuten aus der Szene | Jannik |
| 10 | Apple-Entwicklerkonto (99 €/Jahr) + Codemagic für iOS-Build | Jannik |
| 11 | Start-Stadt wählen, 3–5 Clubs dort persönlich anschreiben | Jannik |
| 12 | Erste 5 Kurzvideos (Skill `kurzvideo-marketing`) | Claude + Jannik |
| 13 | Play-Store-Freigabe, Web-App bewerben | beide |

## Was wir bewusst NICHT vor dem Launch bauen

- Standort-Tracking, Live-Check-in (zu „Spionage“, abgelehnt)
- eigener Ticketverkauf (rechtlich + Zahlungen = später)
- Organizer-Konten mit Banner-Upload (nach Launch)

## Psychologie, ehrlich eingesetzt

Eingebaut:
- Ticket-Button immer sichtbar (feste Leiste unten in der App, ganz oben im Web)
- Ticket-Alarm statt Sackgasse, wenn es noch keine Tickets gibt
- Social Proof nur mit echten Zahlen: „12 gehen hin · 3 suchen eine Crew · 2 Fahrten“
- Teilen mit fertigem Text + Link („Kommst du mit? 🖤“), der zurück in die App führt
- Club folgen → Benachrichtigung bei neuen Terminen; Erinnerung am Tag vorher

Nicht machen (Dark Patterns, in der EU verboten): erfundene Knappheit, Fake-Countdowns, „Nur noch 2 Tickets!“ ohne echte Daten, Schuldgefühl-Buttons.

## Prompts für die nächsten Sessions (einfach reinkopieren)

1. **Fehlerjagd:** „Hier sind Screenshots/Fehler aus der Android-App. Behebe alles, halte das Design NACHTSCHICHT ein und sag mir, wie ich die neue Version mit `git pull` + `R` lade.“
2. **Push live:** „Ich habe das Firebase-Projekt angelegt und `google-services.json` liegt in `flutter_app/android/app/`. Bau echte Push-Nachrichten für Ticket-Alarm, neue Termine und Erinnerungen (FCM + Supabase Edge Function), mit Erlaubnis-Abfrage erst nach dem ersten Ticket-Alarm.“
3. **Store-Paket:** „Erstell App-Icon, Splash, Store-Beschreibung (DE/EN), 6 Screenshot-Texte und die Checkliste für die Play-Store-Freigabe.“
4. **Start-Stadt:** „Wir starten in <Stadt>. Prüfe, ob alle Clubs und Events der nächsten 4 Wochen drin sind, und schreib mir eine Liste mit Clubs + Kontakt für Outreach.“
5. **Video-Woche:** „Nutze den Skill kurzvideo-marketing und plane 5 Kurzvideos für die Launch-Woche in <Stadt>.“
6. **Qualität:** „Geh die App wie ein neuer Nutzer durch (Onboarding → Event → Crew → Chat → Tickets). Liste alles, was verwirrt oder hakt, und behebe die Top 5.“
