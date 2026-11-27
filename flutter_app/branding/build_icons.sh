#!/usr/bin/env bash
# Erzeugt alle App-Icons aus den SVG-Vorlagen in branding/ (Icon 09C2, Schrift als Pfade, keine Fonts nötig).
# Braucht rsvg-convert (Mac: brew install librsvg) und Python 3 mit Pillow.
# Aufruf aus flutter_app/:  bash branding/build_icons.sh
set -euo pipefail
cd "$(dirname "$0")/.."
SVG=branding/app-icon.svg
# iOS: 1024 px, RGB ohne Alpha (App Store lehnt Transparenz ab), Ecken rundet iOS selbst
rsvg-convert -w 1024 -h 1024 "$SVG" -o /tmp/rs-1024.png
python3 -c "from PIL import Image; Image.open('/tmp/rs-1024.png').convert('RGB').save('ios_assets/AppIcon.appiconset/icon-1024.png')"
# Google Play: 512 px, volle Fläche (Play maskiert selbst)
rsvg-convert -w 512 -h 512 "$SVG" -o branding/play-store-512.png
python3 -c "from PIL import Image; Image.open('branding/play-store-512.png').convert('RGB').save('branding/play-store-512.png')"
# Android: Legacy-Icon (vor Android 8) + Adaptive-Ebenen (108dp, Motiv in der 66dp-Sicherheitszone) + Monochrom (Android 13)
for d in mdpi:48:108 hdpi:72:162 xhdpi:96:216 xxhdpi:144:324 xxxhdpi:192:432; do
  IFS=: read n s f <<< "$d"; mkdir -p android_assets/res/mipmap-$n
  rsvg-convert -w $s -h $s "$SVG" -o android_assets/res/mipmap-$n/ic_launcher.png
  rsvg-convert -w $f -h $f branding/android-foreground.svg -o android_assets/res/mipmap-$n/ic_launcher_foreground.png
  rsvg-convert -w $f -h $f branding/android-monochrome.svg -o android_assets/res/mipmap-$n/ic_launcher_monochrome.png
done
# Web-App
rsvg-convert -w 192 -h 192 "$SVG" -o ../app/icon-192.png
rsvg-convert -w 512 -h 512 "$SVG" -o ../app/icon-512.png
echo "Icons erzeugt."
