# RAVE STRNGRS – Markenpaket

Icon **09C2** (R im Rahmen mit rotem Druckversatz, S aus LED-Punkten) und Wortmarke **03** („RAVE“ im Rahmen, „STRNGRS“ auf rotem Feld, beide leicht gekippt).
Überblick über alles: `markenpaket-uebersicht.png`.

Alle SVGs enthalten die Schrift als Pfade und sehen deshalb auf jedem Rechner gleich aus.

| Ordner | Inhalt |
|---|---|
| `wortmarke/` | Primär (dunkel), Hell, Rot, transparent für dunkle/helle Flächen, einfarbig weiß/schwarz |
| `icon/` | App-Icon Primär/Hell/Rot, einfarbig weiß/schwarz, Motiv ohne Hintergrund |
| `lockup/` | Icon + Wortmarke horizontal und gestapelt, je Primär/Hell/Rot |
| `anwendungen/` | Splash iPhone, Splash-Logo, Play-Feature-Grafik 1024×500, Link-Vorschau 1200×630, Story 1080×1920, Profilbild, Sticker |
| `quelle/` | Generator (`brand.py`, `build.py`) |

## Regeln
- Wortmarke nie verzerren, umfärben oder ohne Rahmen/Feld verwenden. Abstand ringsum mindestens die Höhe des roten Feldes.
- Auf dunklen Flächen „Primär“, auf hellen „Hell“, auf Fotos die einfarbige Version.
- Rot ist ein Signal: In der App keine großen roten Flächen. Die Variante „Rot“ ist für Plakate, Sticker und Social Media.
- LED-Punktschrift nur für „STRNGRS“ und das S. Texte in Anton (Überschriften) und Space Grotesk (alles andere).

## Neu erzeugen
```
pip install fonttools pillow        # einmalig, dazu rsvg-convert (Mac: brew install librsvg)
python3 branding/quelle/build.py    # erzeugt alle Dateien in branding/
bash flutter_app/branding/build_icons.sh   # App-Icons für iOS, Android, Play, Web
```
Die Anwendungen mit Text (Feature-Grafik, Link-Vorschau, Story) brauchen Space Grotesk als installierte Schrift.
