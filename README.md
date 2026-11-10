# Rave Strangers

Eine Community-App für die Techno-Szene in Deutschland: alle Raves an einem Ort, Artists mit verifizierten Profilen, und Leute, die zu denselben Events gehen, finden sich vorher und nachher. Auf dem Floor bleibt das Handy aus.

## Stand

| Teil | Status |
|---|---|
| Klickbarer Prototyp (`prototype/`) | fertig, läuft komplett im Browser, Daten nur im Speicher |
| Datenbank-Bauplan (`supabase/schema.sql`) | fertig und getestet, noch nicht in Supabase eingespielt |
| Echte App mit Login | als Nächstes |

## Was der Prototyp kann

- Event-Kalender mit echten Terminen (Stand 10.11.2026, mit Quelle), Filter nach Stadt, Zeitraum, Genre, Clubnacht oder Festival
- Karte mit Clubs und Events (eigene SVG-Karte, Zoomen und Verschieben)
- Club-Seiten mit Regeln, Awareness, kommenden Events und Berichten
- Artist-Profile mit rotem Häkchen, Socials und Terminen, Artists folgen
- Wer geht hin, Crew-Suche, Mitfahrgelegenheiten, Chat
- Merkliste, Erinnerungen, Benachrichtigungen, Google-Kalender-Link
- Melden und Blockieren
- Rollen zum Ausprobieren: normaler Account, verifizierter Artist, Veranstalter (Club-Infos pflegen, .ics-Feed importieren)
- Deutsch und Englisch

Profile, Chats und Teilnehmende im Prototyp sind erfunden. Event-Daten stammen aus öffentlichen Kalendern, ohne Gewähr; einige Club-Positionen sind geschätzt und so markiert.

### Prototyp öffnen

`prototype/index.html` im Browser öffnen. Nach Änderungen an `prototype/src/app.html` neu bauen:

```
python3 prototype/build.py
```

Die Kartenform (Deutschland und Nachbarländer) liegt in `prototype/src/germany.geo.json`, erzeugt mit `make-geo.mjs` aus den offenen Natural-Earth-Daten (Paket `world-atlas`).

## Datenbank (Supabase)

`supabase/schema.sql` legt alle Tabellen an: Profile, Artist-Verifizierung, Clubs und Veranstalter, Events mit Line-up, Teilnahme, Merkliste, Folgen, Mitfahren, Crew-Suche, Chat, Bewertungen, Melden, Blockieren und Kalender-Feeds.

Jede Tabelle hat Row Level Security. Die wichtigsten Regeln:

- Das rote Häkchen und Rollen vergeben nur Admins (`approve_artist`).
- Events von verifizierten Artists und bestätigten Veranstaltern erscheinen sofort, alle anderen gehen in die Prüfung.
- Blockierte Personen können sich nicht schreiben und sehen sich nicht.
- Meldungen sehen nur Admins.
- Bewertungen gehen erst nach dem Event und nur, wenn man als Teilnehmer eingetragen war.

Einspielen: im Supabase-Projekt den SQL Editor öffnen, den Inhalt von `schema.sql` einfügen, Run.

## Sicherheit

- Der `service_role`-Schlüssel von Supabase gehört nie in den Code, nie in dieses Repo und nie in einen Chat.
- Geheime Werte kommen in eine `.env`-Datei, die von Git ignoriert wird.

## Später

- Echte Karte mit MapLibre und OpenStreetMap
- Push-Benachrichtigungen
- Automatischer Event-Import über offizielle Schnittstellen und Kalender-Feeds
- Rave-Mode
