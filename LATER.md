# Für später: Rechtliches & Organisatorisches

Bewusst zurückgestellt (Stand 14.11.2026). Vor dem öffentlichen Launch angehen.

- Impressum (Name + ladungsfähige Adresse, ggf. Impressum-Service)
- Datenschutzerklärung (DSGVO), Nutzungsbedingungen / AGB
- Konto löschen in der App, Melden & Blockieren (App-Store-Pflicht)
- Gewerbeanmeldung / UG, sobald Geld fließt; Beratung Steuerberater oder IHK
- Apple Developer: Einzelperson vs. Organisation (D-U-N-S), ab 18
- Google Play: privat (Testphase mit ~12 Testern / 14 Tage) vs. Organisation
- Quellen & Nutzungsbedingungen der Event-Verzeichnisse (z.B. technoairlines) prüfen
- Banner/Flyer: Rechte klären, Upload durch Veranstalter
- Supabase Pro (Backups) vor echten Nutzern
- Eigener Mail-Dienst (Brevo/Resend) gegen Mail-Limit

## Heute Abend (25.11.): Nutzungsanalyse mit PostHog
- Jannik: Konto auf eu.posthog.com (EU!), Projekt „Rave Strngrs“, Project API Key (`phc_…`) schicken.
- Claude: Einwilligungs-Dialog beim ersten Start (Ja/Nein gleich groß), PostHog erst nach „Ja“, in Flutter + Web.
- Messen: Funnel Event → Ticket-Klick, Crew-Posts/Gruppen/Nachrichten, Wiederkehr, Herkunft (Städte, Einladungslinks).
- Sitzungsaufnahmen nur mit Maskierung (Chats/Eingaben immer geschwärzt).
- Datenschutzerklärung: Abschnitt PostHog (Frankfurt, keine US-Übertragung) – Text vorbereiten.
- Vorlage: Branch `posthog/wizard-01a214927984` (vom PostHog-Assistenten, Commit `ce157b5`). **Nicht direkt mergen:** trackt ohne Einwilligung und wirft im Debug-Modus einen Fehler, wenn der Key fehlt. Brauchbare Teile (`posthog.dart`, Event-Aufrufe in `data.dart`/`social.dart`/`welcome.dart`) beim Bauen nach `dev` übernehmen.
