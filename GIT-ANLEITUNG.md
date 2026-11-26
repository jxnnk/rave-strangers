# Git-Anleitung für Jannik & Fero

Wir arbeiten beide dauerhaft auf dem Branch **`dev`**. Wer zuerst fertig ist, pusht zuerst. Der andere holt sich den Stand vor seinem eigenen Push.

| Branch | Wofür | Wo zu sehen |
|---|---|---|
| `dev` | gemeinsamer Arbeitsstand, hier pushen wir beide | Vorschau: https://jxnnk.github.io/rave-strangers/dev/ |
| `main` | Live-Version für Nutzer | https://jxnnk.github.io/rave-strangers/ |

| Wer | Rechner | Bereich |
|---|---|---|
| Jannik | Windows | Web-App (`app/`), Android, Datenbank (`supabase/`), Events, Rechtstexte |
| Fero | Mac | iOS / Swift (`flutter_app/ios/`), Codemagic, TestFlight |

Dateien, die wir beide anfassen (Konfliktgefahr): `flutter_app/lib/strings.dart`, `flutter_app/lib/data.dart`, `flutter_app/pubspec.yaml`, `CLAUDE.md`. Vor größeren Änderungen daran kurz im Chat Bescheid geben.

## Einmalig: lokalen Stand von Fero zusammenführen

Fero pusht zuerst, weil nur sein Stand noch nicht auf GitHub ist.

1. **Fero:** Terminal öffnen, in den Projektordner wechseln.
2. **Fero:** Stand sichern, inklusive `ios/`-Ordner:
   ```
   git add -A
   git commit -m "iOS: mein lokaler Swift-Stand"
   ```
3. **Fero:** `dev` holen:
   ```
   git checkout dev
   git pull --rebase origin dev
   ```
   Auf einem anderen Branch gearbeitet? Vorher `git checkout dev`, dann `git merge NAME-DES-BRANCHES`.
4. **Fero:** Konflikte lösen, falls Git welche meldet (siehe unten).
5. **Fero:** Testen:
   ```
   cd flutter_app
   flutter pub get
   cd ios && pod install && cd ..
   flutter run
   ```
6. **Fero:** `git push origin dev`, dann Jannik schreiben: „gepusht“.
7. **Fero:** In `CLAUDE.md` den Hinweis anpassen, dass `ios/` nicht im Repo ist. Danach committen und pushen.
8. **Jannik:** Erst jetzt `git checkout dev` und `git pull`.

Bis Schritt 6 erledigt ist, ändert Jannik nichts an `flutter_app/`.

## Jannik (Windows): jeden Tag

Terminal: Windows-Taste → `PowerShell` → Enter, dann `cd C:\Users\Jannik\rave-strangers`

1. **Vorher:** `git checkout dev` → `git pull`
2. **Arbeiten.** Claude (Chat oder Claude Code) pusht seine Änderungen selbst auf `dev`. Danach reicht `git pull`.
3. **Selbst etwas geändert:**
   ```
   git add -A
   git commit -m "kurz was du gemacht hast"
   git pull --rebase origin dev
   git push origin dev
   ```
4. Fero schreiben: „gepusht: …“

Android testen: Emulator in Android Studio starten und warten, bis der Startbildschirm da ist. Dann `cd flutter_app` → `flutter pub get` → `flutter run`.

## Fero (Mac): jeden Tag

Terminal: Cmd + Leertaste → `Terminal` → Enter, dann `cd ~/rave-strangers` (oder wo das Repo liegt)

1. **Vorher:** `git checkout dev` → `git pull`. Sind neue Pakete dazugekommen: `cd flutter_app && flutter pub get && cd ios && pod install && cd ../..`
2. **Arbeiten** in Xcode oder mit Claude Code. `ios/` gehört ins Repo. `ios/Pods/` und generierte Dateien schließt die `.gitignore` aus.
3. **Nach jeder fertigen Teilaufgabe:**
   ```
   git add -A
   git commit -m "kurz was du gemacht hast"
   git pull --rebase origin dev
   git push origin dev
   ```
4. Jannik schreiben: „gepusht: …“

Für Claude Code: „Lies CLAUDE.md. Hol `dev`, mach meine Aufgabe, committe, `git pull --rebase origin dev`, löse Konflikte, push auf `dev`.“

## Konflikte lösen

Ein Konflikt heißt: Beide haben dieselbe Zeile geändert. Der Zweite, der pusht, löst ihn.

Erkennen: Nach `git pull --rebase` steht `CONFLICT (content): Merge conflict in DATEI`.

1. Datei öffnen. Beide Versionen stehen zwischen `<<<<<<<`, `=======` und `>>>>>>>`.
2. Richtige Version behalten (oder beide zusammenbauen) und die Markierungszeilen löschen.
3. `git add DATEI`
4. `git rebase --continue`
5. `git push origin dev`

Mit Claude Code: „Löse die Git-Konflikte, behalte beide Änderungen wo möglich, und erklär mir kurz, was du gemacht hast.“

Notbremse: `git rebase --abort`. Dann ist alles wie vor dem Pull.

Nie `git push --force`: Das ist der einzige Befehl, der die Arbeit des anderen auf GitHub überschreiben kann.

## Live gehen

Jeder Push auf `dev` landet nach etwa einer Minute in der Vorschau `/dev/`. Live (`main`) nur, wenn Jannik zu Claude „bring live“ sagt.

## Spickzettel

| Wann | Befehl |
|---|---|
| Vor dem Arbeiten | `git checkout dev` → `git pull` |
| Sichern | `git add -A` → `git commit -m "…"` |
| Hochladen | `git pull --rebase origin dev` → `git push origin dev` |
| Konflikt gelöst | `git add DATEI` → `git rebase --continue` |
| Pull ging schief | `git rebase --abort` |
| Was habe ich geändert? | `git status` |
| Wer hat was gemacht? | `git log --oneline -10` |
| App testen | `cd flutter_app` → `flutter pub get` → `flutter run` |
