#!/usr/bin/env bash
# Erzeugt alle App-Icons aus app-icon.svg. Braucht rsvg-convert (Mac: brew install librsvg) und Python 3 mit Pillow.
# Aufruf aus flutter_app/:  bash branding/build_icons.sh
set -euo pipefail
cd "$(dirname "$0")/.."
SVG=branding/app-icon.svg
# iOS: 1024 px, RGB ohne Alpha (App Store lehnt Transparenz ab), Ecken rundet iOS selbst
rsvg-convert -w 1024 -h 1024 "$SVG" -o /tmp/rs-1024.png
python3 -c "from PIL import Image; Image.open('/tmp/rs-1024.png').convert('RGB').save('ios_assets/AppIcon.appiconset/icon-1024.png')"
# Google Play: 512 px, volle Fläche (Play maskiert selbst)
rsvg-convert -w 512 -h 512 "$SVG" -o branding/play-store-512.png
# Android Legacy-Icons (vor Android 8), Adaptive Icon liegt als Vektor in android_assets/res/
for d in mdpi:48 hdpi:72 xhdpi:96 xxhdpi:144 xxxhdpi:192; do
  n=${d%%:*}; s=${d##*:}; mkdir -p android_assets/res/mipmap-$n
  rsvg-convert -w $s -h $s "$SVG" -o android_assets/res/mipmap-$n/ic_launcher.png
done
# Web-App
rsvg-convert -w 192 -h 192 "$SVG" -o ../app/icon-192.png
rsvg-convert -w 512 -h 512 "$SVG" -o ../app/icon-512.png
echo "Icons erzeugt."
