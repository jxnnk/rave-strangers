# iOS Public Beta (TestFlight) – kürzester Weg

Ziel: öffentlicher TestFlight-Link, den wir in Karlsruhe teilen können. Kein Mac nötig (Build über Codemagic).

## Kritischer Pfad (in dieser Reihenfolge, das Langsame zuerst)

| # | Schritt | Wer | Dauer |
|---|---|---|---|
| 1 | Apple Developer Program als **Einzelperson** beitreten (99 €/Jahr, Apple-ID mit 2FA, ab 18). Organisation braucht D-U-N-S und dauert Wochen, kann später umgezogen werden | Jannik oder Felix | 1–2 Tage Prüfung |
| 2 | Datenschutzerklärung als öffentliche URL (z. B. Seite in der Web-App). Pflichtfeld für externe Tester | Claude Entwurf, Kontoinhaber prüft | 1 Abend |
| 3 | **Melden**-Funktion für Chat, Crew-Posts, Profile + Kontakt-Mail für Meldungen (Blockieren gibt es schon). Apple-Regel 1.2 für Apps mit Nutzerinhalten | Claude | 1 Abend |
| 4 | Developer-Portal: Identifiers → App ID `de.ravestrangers.raveStrangers` registrieren | Kontoinhaber | 5 min |
| 5 | App Store Connect: neue App anlegen (Name „Rave Strangers“, Bundle ID aus 4, Sprache Deutsch). Apple ID der App in `codemagic.yaml` bei `APP_STORE_APPLE_ID` eintragen | Kontoinhaber | 10 min |
| 6 | App Store Connect → Benutzer und Zugriff → Integrationen → API-Key (Rolle App Manager) erstellen, `.p8` herunterladen | Kontoinhaber | 5 min |
| 7 | codemagic.io mit GitHub anmelden, Repo hinzufügen, unter Team integrations → Developer Portal den Key aus 6 als „Rave Strangers ASC“ hinterlegen | Kontoinhaber (Secret, nie in den Chat) | 10 min |
| 8 | TestFlight: interne Gruppe anlegen, dann externe Gruppe **„Public Beta“**. Testinformationen ausfüllen: Beschreibung, Feedback-Mail, Datenschutz-URL, **Demo-Login für Apple** (eigenes Testkonto in Supabase) | Kontoinhaber, Texte von Claude | 20 min |
| 9 | Build in Codemagic starten (Workflow „iOS → TestFlight“) | beide | ~20 min |
| 10 | Erster Build geht automatisch in die TestFlight-Prüfung. Nach Freigabe: öffentlichen Link aktivieren, Testerlimit setzen (z. B. 200) | Kontoinhaber | meist 1–2 Tage |

Realistisch: **öffentlicher Link in 3–5 Tagen**, bestimmt vor allem durch Schritt 1 und 10.

## Was Apple bei der Beta-Prüfung typischerweise anmerkt
- Login ohne Demo-Konto → Ablehnung. Immer Testkonto in die Prüfnotizen.
- Nutzerinhalte (Chat, Crew, Profilbilder) ohne Melden/Blockieren/Kontakt → Regel 1.2.
- Konto löschen muss in der App gehen (haben wir, Migration 016).
- Wenn Google-Login kommt, muss Apple-Login mit rein (Regel 4.8).
- Zweckangaben für Standort/Fotos müssen stimmen (setzt `codemagic.yaml`).
- Altersfreigabe wegen Party/Alkohol-Bezug und Chat mit Fremden: eher 18+ angeben.

## Risiko
- `apple_maps_flutter` (1.4.0) ist alt. Wenn der erste Build daran scheitert: auf iOS vorerst auch `flutter_map` nutzen, Apple-Karte später.
- Codemagic gratis: 500 Build-Minuten/Monat, reicht für ~20 iOS-Builds.

## Nicht nötig für die Beta
Push-Nachrichten, App-Store-Screenshots, DSA-Händlerstatus (erst für den echten Store-Release), Organisation/UG.
