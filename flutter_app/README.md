# Rave Strangers – Flutter-App

Native App (Android, später iOS) auf derselben Supabase-Datenbank wie die Web-App in `../app`.
Design: siehe `../DESIGN.md` (Tokens in `lib/theme.dart`).

## Starten (Windows, PowerShell)

```powershell
cd ~\rave-strangers
git pull
cd flutter_app
flutter create . --org de.ravestrangers --project-name rave_strangers --platforms android,ios,web
flutter pub get
flutter run
```

- `flutter create .` legt nur die fehlenden Plattform-Ordner (android/, ios/, web/) an, unser Code in `lib/` bleibt.
  Das ist nur beim ersten Mal nötig.
- `flutter run` fragt nach dem Gerät: Android-Emulator (vorher in Android Studio starten), angeschlossenes Handy
  oder `chrome` zum schnellen Testen.
- Hot Reload: im laufenden Terminal `r` drücken, Neustart `R`, beenden `q`.

## Aufbau
- `lib/main.dart` – Start, Supabase, untere Navigation (Home, Events, Karte, Profil)
- `lib/data.dart` – Modelle, Laden aus Supabase, Berlin-Zeit, „Ich gehe hin“/„Merken“
- `lib/theme.dart`, `lib/widgets.dart` – Design-System NACHTSCHICHT
- `lib/strings.dart` – Texte Deutsch/Englisch
- `lib/screens/` – Home, Events, Event-Seite, Karte mit Club-Vorschau, Club-Seite, Profil/Login

## Noch nicht in der App (gibt es in der Web-App)
Folgen, Bewertungen schreiben, Freunde-Pläne, Events eintragen, Admin. Kommt Schritt für Schritt.

## Hinweise
- Kartenkacheln: CARTO (OpenStreetMap-Daten), frei für Tests und kleine Nutzung. Vor dem Store-Release
  klären wir einen dauerhaften Kartenanbieter.
- Für einen Release-Build braucht Android noch `<uses-permission android:name="android.permission.INTERNET"/>`
  in `android/app/src/main/AndroidManifest.xml` (im Debug-Modus ist sie automatisch da).
