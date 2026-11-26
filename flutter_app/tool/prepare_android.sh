#!/usr/bin/env bash
# Kopiert das App-Icon in das lokal erzeugte android/-Projekt (android/ liegt nicht im Repo).
# Aufruf aus flutter_app/ nach `flutter create --platforms=android .`:  bash tool/prepare_android.sh
set -euo pipefail
cd "$(dirname "$0")/.."
[ -d android/app/src/main/res ] || { echo "android/ fehlt: erst flutter create --platforms=android ."; exit 1; }
cp -R android_assets/res/. android/app/src/main/res/
# Manifest muss auf @mipmap/ic_launcher zeigen (Flutter-Standard)
grep -q '@mipmap/ic_launcher' android/app/src/main/AndroidManifest.xml && echo "App-Icon gesetzt."
