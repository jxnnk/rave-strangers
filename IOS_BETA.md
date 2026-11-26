# iOS Public Beta (TestFlight) – kürzester Weg

Ziel: öffentlicher TestFlight-Link, den wir in Karlsruhe teilen können. Kein Mac nötig (Build über Codemagic).

## Kritischer Pfad (in dieser Reihenfolge, das Langsame zuerst)

| # | Schritt | Wer | Dauer |
|---|---|---|---|
| 1 | Apple Developer Program als **Einzelperson** beitreten (99 €/Jahr, Apple-ID mit 2FA, ab 18). Organisation braucht D-U-N-S und dauert Wochen, kann später umgezogen werden | Jannik oder Felix | 1–2 Tage Prüfung |
| 2 | ✅ Entwurf liegt in `app/legal/` (Datenschutz, Nutzungsbedingungen, Impressum). **Rote Felder ausfüllen** (Name, Anschrift, Mail, Supabase-Region), dann `dev` → `main`, damit die URLs live sind | Kontoinhaber | 15 min |
| 3 | ✅ Melden (Nachricht lange drücken, Crew-Post, Profil, Gruppe) + Blockieren im Profil. **Migration `supabase/migrations/026_reports.sql` im Supabase SQL-Editor ausführen**, sonst schlägt „Melden“ fehl. Offene Meldungen täglich prüfen: `select * from reports where status='open' order by created_at;` | Kontoinhaber | 5 min + täglich |
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

## Was das Repo jetzt automatisch erledigt (Stand 26.11.)

- `flutter_app/tool/prepare_ios.sh`: erzeugt `ios/`, setzt Bundle-ID, Name, Dunkelmodus, nur iPhone + Hochformat, iOS 15, Export-Compliance (`ITSAppUsesNonExemptEncryption=false`), ehrliche Zweckangaben, App-Icon (`ios_assets/`), dunklen Startbildschirm und das Privacy Manifest (`PrivacyInfo.xcprivacy`). Läuft in Codemagic und in GitHub Actions.
- GitHub Actions „iOS check“ (`.github/workflows/ios.yml`): bei jeder Änderung an `flutter_app/` Analyse + Tests, Release-Build ohne Signatur und Start im iPhone-Simulator mit Screenshot (Artefakt `ios-simulator`). Ist der Check grün, kompiliert und startet die App.
- Schriften sind in der App enthalten (kein Abruf bei Google).

## Formulare in App Store Connect (zum Abtippen)

**App-Datenschutz („Nutrition Label“)** – Datenerfassung: Ja. Alles „mit Identität verknüpft“, **kein Tracking**, Zweck nur „App-Funktionalität“:
- Kontaktinformationen → E-Mail-Adresse, Name
- Nutzerinhalte → Fotos oder Videos (Profilbild), Andere Nutzerinhalte (Chat, Crew-Posts)
- Kennungen → Nutzer-ID
- Nicht erfasst: Standort (wird nur auf dem Gerät genutzt), Nutzungsdaten, Diagnose, Kauf.

**Altersfreigabe**: Nutzergenerierte Inhalte / Kommunikation mit Fremden: Ja. Alkohol/Drogen-Bezug: selten/schwach. Ergebnis wählen: **18+** (passt zu unseren Nutzungsbedingungen).

**URLs** (nach Merge in `main`):
- Datenschutz: `https://jxnnk.github.io/rave-strangers/legal/datenschutz.html`
- Support/Marketing: `https://jxnnk.github.io/rave-strangers/legal/impressum.html`

**TestFlight → Testinformationen**
- Beta-Beschreibung: „Rave Strangers: Techno-Events in Karlsruhe finden und Leute, mit denen du hingehst. Crew-Finder, Chat, Mitfahren, Ticket-Alarm.“
- Was testen: „Events ansehen, ‚Ich gehe hin‘, Crew-Post schreiben, Chat, Mitfahren, Ticket-Alarm, Profilbild. Fehler bitte per Screenshot im TestFlight-Feedback.“
- Anmeldung erforderlich: Ja → **Demo-Konto** (in Supabase anlegen, E-Mail bestätigt, mit Profil und einem Crew-Post).
- Prüfnotizen (EN):
  > Rave Strangers is a community app for techno events in Germany (18+). Browsing works without an account ("Erst mal umschauen"). Social features need the demo account above. User-generated content: users can report any message (long-press), crew post, profile or group, and block users (profile menu or chat menu). Reports are reviewed within 24 hours. Users accept terms with zero tolerance for objectionable content at sign-up. Account deletion: Profile → Settings → Delete account. Location is only used once on-device ("find my city") and never stored.

## Bewusst offen (nicht nötig für TestFlight)
- Englische Zweckangaben (InfoPlist.strings) – Texte sind deutsch, App-Sprache Deutsch.
- iPad-Layout (App läuft auf iPad im iPhone-Modus).
