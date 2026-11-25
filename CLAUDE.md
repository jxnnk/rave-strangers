# CLAUDE.md – Briefing für jede Claude-Sitzung

Lies diese Datei zuerst. Danach `LAUNCH.md` (Plan) und `LATER.md` (offene Punkte).

## Projekt
**Rave Strangers** (Logo: RAVE STRNGRS) – Techno-Community-App für Deutschland.
USP: „Nie mehr allein raven. Finde deine Crew, nicht nur die Party.“
Startstadt: **Karlsruhe**, danach Berlin. Launch-Ziel: so bald wie möglich.

## Aufbau
| Ordner | Inhalt |
|---|---|
| `app/` | Web-App (Vanilla JS, `app.js` mit Hash-Router), live über GitHub Pages |
| `flutter_app/` | Native App (Flutter). `android/` und `ios/` werden lokal erzeugt, nicht im Repo |
| `supabase/` | Migrationen (`0xx_*.sql`) und Seeds |
| `DESIGN.md` | Design-Regeln |

Backend: Supabase-Projekt `wnmxloykrnbrpvzxhnsb`, RLS überall an.
Nach Änderungen an `app/` den Cache in `app/sw.js` hochzählen (`rs-shell-vNN`).

## Design
- Farben: `#111113` (Hintergrund), `#19191C` (Flächen), `#EFECE6` (Text), `#FF2B1C` (Akzent)
- Schrift: **Anton** für Überschriften, **Space Grotesk** für alles andere
- Kein generischer „KI-Look“: keine Abschnittsnummern, keine [Klammer-Tags]

## Feste Regeln
1. **Nie** den Supabase `service_role`-Key teilen, committen oder in den Client packen. Nur der publishable Key gehört in die Apps.
2. **Keine** Events, Adressen, Bewertungen oder Testimonials erfinden. Nur echte, öffentliche Quellen.
3. **Kein** Scraping hinter Logins, kein Instagram/Facebook/TikTok-Scraping.
4. **Keine** privaten, geheimen oder illegalen Rave-Locations.
5. Migrationen ohne `DROP`/`DELETE`; Venues ausblenden über `rules.hidden=true`.
6. Secrets (SMTP, OAuth, API-Keys) trägt nur Jannik selbst ein – nie im Chat.
7. Standort nur im Vordergrund, nie speichern.
8. Texte immer DE + EN (`strings.dart` bzw. Strings in `app.js`), keine doppelten Keys.

## Hooks (`.claude/`, gelten automatisch für alle, brauchen Node)
- `migration-guard.js`: blockiert `DROP TABLE/COLUMN/...` und `TRUNCATE` in Migrationen, fragt bei `DELETE FROM` nach (Regel 5).
- `sw-cache-guard.js`: blockiert `git commit`/`git push`, wenn `app/` geändert, aber `rs-shell-vNN` nicht hochgezählt ist.
- `strings-check.js`: meldet nach jeder Bearbeitung fehlende DE/EN-Keys und Dubletten (Regel 8). Von Hand: `node .claude/hooks/strings-check.js`.

## Zusammenarbeit
- **`dev`** ist der gemeinsame Arbeits-Branch. Alle arbeiten und pushen dort.
- **`main`** ist die Live-Version (GitHub Pages). Nur wenn `dev` getestet ist, wird `dev` in `main` gemergt.
- Vor jedem Arbeiten: `git pull`. Vor jedem Push nochmal `git pull`, dann `git push`.
- Kleine, klare Commits, damit Konflikte selten und klein bleiben.
- **Für Claude:** Arbeite immer auf `dev`. Vor jeder Aufgabe `git checkout dev && git pull`, danach selbst committen und pushen. Konflikte selbst lösen und kurz erklären. Nach `main` mergen nur, wenn der Nutzer es ausdrücklich sagt.
- Wer eine Aufgabe übernimmt, trägt sich unten ein, damit niemand doppelt arbeitet.

## Offene Aufgaben (zum Aufteilen)
| Aufgabe | Wer |
|---|---|
| Flutter: neuen Stand kompilieren und Fehler fixen | Jannik |
| PostHog-Tracking mit Einwilligungs-Dialog (Web + Flutter) | – |
| Apple- und Google-Login | – |
| Push-Nachrichten (Firebase) | – |
| Profilbilder (Supabase Storage) | erledigt (Web + Flutter, Migration 025) |
| App-Icon | – |
| Karlsruhe-Events vollständig machen (nur echte Quellen) | – |
| Impressum, Datenschutz, AGB | – |
