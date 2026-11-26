#!/usr/bin/env bash
# Erzeugt/ergänzt flutter_app/ios für einen App-Store-tauglichen Build (läuft auf macOS: Codemagic, GitHub Actions, Mac).
# Idempotent: kann beliebig oft laufen. Aufruf aus flutter_app/:  bash tool/prepare_ios.sh
set -euo pipefail
cd "$(dirname "$0")/.."

BUNDLE_ID="de.ravestrangers.raveStrangers"
MIN_IOS="15.0"   # Minimum der aktuellen Flutter-Version

# 1) Plattform-Ordner (nicht im Repo, siehe CLAUDE.md)
if [ ! -d ios/Runner.xcodeproj ]; then
  flutter create . --org de.ravestrangers --project-name rave_strangers --platforms ios
fi

P=ios/Runner/Info.plist
pb() { /usr/libexec/PlistBuddy -c "Delete :$1" "$P" 2>/dev/null || true; /usr/libexec/PlistBuddy -c "Add :$1 $2 $3" "$P"; }

# 2) Info.plist: Name, Sprache, Darstellung, Export-Compliance, Zweckangaben
pb CFBundleDisplayName string "Rave Strngrs"
pb CFBundleName string "Rave Strngrs"
pb CFBundleDevelopmentRegion string de
/usr/libexec/PlistBuddy -c "Delete :CFBundleLocalizations" "$P" 2>/dev/null || true
/usr/libexec/PlistBuddy -c "Add :CFBundleLocalizations array" -c "Add :CFBundleLocalizations:0 string de" -c "Add :CFBundleLocalizations:1 string en" "$P"
pb UIUserInterfaceStyle string Dark
pb ITSAppUsesNonExemptEncryption bool false          # nur HTTPS -> keine Exportdokumente nötig
pb UIStatusBarStyle string UIStatusBarStyleLightContent
# Nur Hochformat (iPhone)
/usr/libexec/PlistBuddy -c "Delete :UISupportedInterfaceOrientations" "$P" 2>/dev/null || true
/usr/libexec/PlistBuddy -c "Delete :UISupportedInterfaceOrientations~ipad" "$P" 2>/dev/null || true
/usr/libexec/PlistBuddy -c "Add :UISupportedInterfaceOrientations array" -c "Add :UISupportedInterfaceOrientations:0 string UIInterfaceOrientationPortrait" "$P"
# Zweckangaben: ehrlich, sonst Ablehnung nach 5.1.1. Kamera/Mikrofon verlangt Apple, weil image_picker sie technisch enthält.
pb NSLocationWhenInUseUsageDescription string "Damit wir dir automatisch die Events in der Stadt zeigen, in der du gerade bist, und du dich bei einem Event vor Ort einchecken kannst. Dein Standort bleibt auf dem Gerät und wird nicht gespeichert oder gesendet."
pb NSLocationAlwaysAndWhenInUseUsageDescription string "Rave Strngrs nutzt deinen Standort nie im Hintergrund, nur während die App geöffnet ist."
pb NSPhotoLibraryUsageDescription string "Damit du ein Profilbild aus deiner Galerie auswählen kannst. Nur das gewählte Bild wird hochgeladen."
pb NSCameraUsageDescription string "Rave Strngrs nutzt die Kamera derzeit nicht. Profilbilder wählst du aus deiner Galerie."
pb NSMicrophoneUsageDescription string "Rave Strngrs nimmt keinen Ton auf. Die Angabe ist nötig, weil das Foto-Modul technisch auch Videos aufnehmen könnte."
plutil -lint "$P"

# 3) App-Icon (1024 px, ohne Transparenz; Xcode erzeugt alle Größen)
rm -rf ios/Runner/Assets.xcassets/AppIcon.appiconset
cp -R ios_assets/AppIcon.appiconset ios/Runner/Assets.xcassets/AppIcon.appiconset

# 4) Startbildschirm dunkel statt weiß (#111113)
LS=ios/Runner/Base.lproj/LaunchScreen.storyboard
sed -i '' -E 's#<color key="backgroundColor"[^/]*/>#<color key="backgroundColor" red="0.0667" green="0.0667" blue="0.0745" alpha="1" colorSpace="custom" customColorSpace="sRGB"/>#g' "$LS"

# 5) Privacy Manifest + Projekt-Einstellungen (nur iPhone, Mindest-iOS)
cp ios_assets/PrivacyInfo.xcprivacy ios/Runner/PrivacyInfo.xcprivacy
ruby - "$MIN_IOS" "$BUNDLE_ID" <<'RUBY'
require 'xcodeproj'
min, bundle = ARGV
project = Xcodeproj::Project.open('ios/Runner.xcodeproj')
target = project.targets.find { |t| t.name == 'Runner' }
group = project.main_group['Runner']
unless group.files.any? { |f| f.path == 'PrivacyInfo.xcprivacy' }
  ref = group.new_file('PrivacyInfo.xcprivacy')
  target.resources_build_phase.add_file_reference(ref)
end
project.targets.each do |t|
  t.build_configurations.each do |c|
    c.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = min
    next unless t.name == 'Runner'
    c.build_settings['TARGETED_DEVICE_FAMILY'] = '1'
    c.build_settings['PRODUCT_BUNDLE_IDENTIFIER'] = bundle
  end
end
project.save
puts "xcodeproj ok: PrivacyInfo in Runner, iPhone only, iOS #{min}"
RUBY

# 6) Podfile: Mindest-iOS für alle Pods gleich setzen (Podfile entsteht erst beim ersten iOS-Build)
[ -f ios/Podfile ] || flutter build ios --config-only --no-codesign
if [ -f ios/Podfile ]; then
  sed -i '' -E "s/^# *platform :ios.*/platform :ios, '$MIN_IOS'/; s/^platform :ios.*/platform :ios, '$MIN_IOS'/" ios/Podfile
  grep -q "IPHONEOS_DEPLOYMENT_TARGET" ios/Podfile || sed -i '' "s/    flutter_additional_ios_build_settings(target)/    flutter_additional_ios_build_settings(target)\n    target.build_configurations.each { |c| c.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '$MIN_IOS' }/" ios/Podfile
fi

echo "prepare_ios: fertig"
