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

## Promoter-Abo (Kontostufen, DB 029)
Stand 26.11.: Raver (kostenlos) und Promoter (Abo) sind gebaut (Web + Flutter). Nur Promoter und Admins tragen Events ein; das erste Event eines Promoters wird geprüft, danach geht es sofort online.
- Jannik: `supabase/migrations/029_promoter_tier.sql` im SQL-Editor ausführen (vorher sieht jeder „Raver“, Eintragen läuft noch nach alter Regel).
- Freischalten bis zur Online-Zahlung: Admin-Bereich → Promoter-Anfragen → „1 Monat“ / „12 Monate“, nach bezahlter Rechnung. Verlängern/Beenden unter „Aktive Promoter“.
- Offen: Preis festlegen; Online-Zahlung (Stripe auf der Website, Freischaltung per Webhook in einer Edge Function). Vorher Gewerbe, AGB mit Abo-Bedingungen, Kündigungsbutton (§ 312k BGB) für Verbraucher.
- iOS/Android: In der App keinen Preis und keinen Kauf-Link zeigen, solange nicht über Apple/Google abgerechnet wird (App Store 3.1.1 / 3.1.3, Google Play Payments). Die App zeigt deshalb nur „Anfrage stellen“.
- Später: Erinnerung kurz vor Abo-Ende, Promoter-Badge an Events.

## Genre-Filter: Mehrfachauswahl, Ober-/Untergenres, Rückfall (Notiz 27.11.)
**Von Felix (Idee):**
- Mehrere Genres gleichzeitig wählbar, nicht nur eins.
- Zwei Ebenen: Obergenre (z. B. Groove) mit Untergenres (z. B. Schranz).
- Gibt es für ein gewähltes Untergenre im gewählten Umkreis keine Events: Umkreis vergrößern **und** klar anzeigen „Kein Schranz in der Nähe, aber Groove-Events“ (Rückfall aufs Obergenre).

**Stand im Repo:** Filter ist Einzelauswahl über eine flache Liste mit 8 Genres, doppelt hart codiert (`flutter_app/lib/data.dart` `genres`, `app/app.js` `GENRES`). Events speichern `genres text[]`. Einen Umkreis-Filter gibt es noch nicht, gefiltert wird nach Stadt.

**Vorschlag Claude (offen, zu entscheiden):**
- Genre-Baum an einer Stelle pflegen (Tabelle `genres` mit `parent_id` oder eine gemeinsame JSON-Datei), statt zweier Listen.
- Mehrfachauswahl = ODER (Event passt, wenn es eins der Genres hat). Obergenre wählen schließt seine Untergenres ein.
- Rückfall nur anzeigen, nie still austauschen: Treffer fürs Untergenre zuerst, darunter eigener Abschnitt „Ähnlich: Groove“.
- Umkreis-Erweiterung in festen Stufen (z. B. 25 → 50 → 100 km) mit sichtbarem Hinweis; braucht Venue-Koordinaten und Standort nur im Vordergrund (Regel 7).
- Offene Frage: Wer ordnet Events Untergenres zu? Promoter beim Eintragen, sonst bleibt der Rückfall der Normalfall. Genre-Liste mit echten Kategorien aus der Szene abstimmen, keine erfundenen.
- Nicht Beta-blockierend → nach der Beta.

## Geschmacks-Swipe für Artists/Genres + Gemeinsamkeiten in der Crew (Notiz 27.11.)
**Von Felix (Idee):**
- Artists (und Genres) wie bei Tinder wischen: rechts = feier ich, links = nicht meins.
- Daraus gezielter Events vorschlagen, auf denen die gemochten Artists spielen.
- Crew: Beim Hinzufügen eines Freundes und auf dessen Profil Gemeinsamkeiten zeigen („Ihr feiert beide X“), gemeinsame Artists und Events, auf denen man schon war.

**Was es im Repo schon gibt (Basis):** `follows` (Profil folgt Artist-Profil), `event_lineup.artist_id` (Artist ↔ Event), `attendance` mit `visible` (privat hingehen möglich), `checkins` (027), Profilseite `person.dart`.

**Vorschlag Claude (offen, zu entscheiden):**
- Rechts-Wisch = bestehendes `follows` nutzen, statt neue Struktur; Links-Wisch nur als „nicht mehr zeigen“ speichern, nie anderen anzeigen.
- Swipe-Stapel nur aus Artists, die echt in Events im Repo vorkommen (keine erfundenen Profile).
- Event-Vorschläge: zuerst simpel „Events mit Artists, denen du folgst“, ohne Algorithmus-Blackbox.
- Gemeinsamkeiten nur aus Daten, die beide sichtbar haben: `attendance.visible`, Check-ins nur mit Opt-in. Eigene Einstellung „Meinen Musikgeschmack/meine Events in der Crew zeigen“ (DSGVO: Zweck klar, standardmäßig nur Crew).
- Nicht Beta-blockierend → nach der Beta. Gute Kandidat-Funktion für Bindung nach dem Start, weil sie den USP „Finde deine Crew“ direkt stützt.
