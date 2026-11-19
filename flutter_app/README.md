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

## Karte: Apple Karten auf iPhone/iPad

- iOS zeigt die native Apple-Karte (`lib/screens/apple_map_layer.dart`, Paket `apple_maps_flutter`), Android weiter OpenStreetMap.
- Nahe Clubs werden zu Zahlen-Bubbles zusammengefasst, Tippen zoomt hinein, ab Zoom 14 steht jeder Club einzeln.
- Kostenlos, kein API-Key. Bauen nur auf einem Mac oder per Cloud-Build (z. B. Codemagic), Apple-Entwicklerkonto nötig.
- Nach `flutter create .` in `ios/Runner/Info.plist` ergänzen:

```xml
<!-- App und Karte immer im Dunkelmodus -->
<key>UIUserInterfaceStyle</key>
<string>Dark</string>
<!-- Pflichttext, weil das Karten-Paket Standort-Funktionen enthält. Wir fragen den Standort nicht ab. -->
<key>NSLocationWhenInUseUsageDescription</key>
<string>Rave Strangers nutzt deinen Standort nicht. Die Karte zeigt nur Clubs.</string>
```

## Karte Android

Esri „Dark Gray Canvas“ (Raster, ohne API-Key). CARTO verlangt inzwischen einen Key. Vor großem Wachstum prüfen: Esri-Nutzungsbedingungen / kostenloses ArcGIS-Developer-Konto, oder auf MapLibre + OpenFreeMap (wie die Web-App) umsteigen.

## Benachrichtigungen

Tabelle `notifications` (Migration 021) wird per Trigger gefüllt: Tickets da, neuer Termin bei gefolgtem Club, Erinnerung am Tag vorher (pg_cron 12 Uhr). Die App zeigt sie unter der Glocke auf Home. Echte Push-Nachrichten: siehe LAUNCH.md (Firebase).
