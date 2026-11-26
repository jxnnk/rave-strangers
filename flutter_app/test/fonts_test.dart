import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';

// Schriften müssen gebündelt sein (google_fonts lädt sie mit allowRuntimeFetching=false nur aus assets/fonts).
void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  test('Anton + Space Grotesk liegen als Assets vor', () async {
    final manifest = await AssetManifest.loadFromAssetBundle(rootBundle);
    final assets = manifest.listAssets().toSet();
    for (final f in [
      'Anton-Regular',
      'SpaceGrotesk-Regular',
      'SpaceGrotesk-Medium',
      'SpaceGrotesk-SemiBold',
      'SpaceGrotesk-Bold',
    ]) {
      final path = 'assets/fonts/$f.ttf';
      expect(assets, contains(path));
      final data = await rootBundle.load(path);
      expect(data.lengthInBytes, greaterThan(10000), reason: path);
    }
  });
}
