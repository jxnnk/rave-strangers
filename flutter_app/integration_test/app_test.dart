// Läuft auf dem iOS-Simulator in GitHub Actions (siehe .github/workflows/ios.yml):
// echte App, echte Supabase-Daten, ohne Konto. Prüft den Weg eines neuen Nutzers ohne Anmeldung.
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:rave_strangers/data.dart';
import 'package:rave_strangers/main.dart' as app;
import 'package:rave_strangers/strings.dart';
import 'package:rave_strangers/widgets.dart';

Future<void> pumpUntil(WidgetTester tester, bool Function() ok, {int seconds = 30, String what = ''}) async {
  for (var i = 0; i < seconds * 4; i++) {
    await tester.pump(const Duration(milliseconds: 250));
    if (ok()) return;
  }
  fail('Zeitüberschreitung: $what');
}

void main() {
  final binding = IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('Neuer Nutzer: Start, umschauen, Events laden, Event öffnen, alle Tabs', (tester) async {
    app.main();
    final skip = find.text('${t('skip')} →');
    await pumpUntil(tester, () => skip.evaluate().isNotEmpty, what: 'Startbildschirm');
    await tester.tap(skip);

    // Live-Daten aus Supabase
    await pumpUntil(tester, () => !store.loading && store.visibleEvents.isNotEmpty, seconds: 45, what: 'Events aus Supabase');
    binding.reportData = {'events': store.visibleEvents.length, 'venues': store.venues.length};
    debugPrint('IT: ${store.visibleEvents.length} Events, ${store.venues.length} Clubs geladen');

    // Events-Tab -> erstes Event öffnen -> zurück
    tabIndex.value = 1;
    await pumpUntil(tester, () => find.byType(EventRow).hitTestable().evaluate().isNotEmpty, what: 'Event-Liste');
    await tester.tap(find.byType(EventRow).hitTestable().first);
    await pumpUntil(tester, () => find.byType(BackButton).evaluate().isNotEmpty, what: 'Event-Seite');
    await tester.tap(find.byType(BackButton).first);
    await tester.pump(const Duration(seconds: 1));

    // Alle Tabs einmal (Karte = native Apple-Karte auf iOS)
    for (var i = 0; i < 5; i++) {
      tabIndex.value = i;
      for (var k = 0; k < 12; k++) {
        await tester.pump(const Duration(milliseconds: 250));
      }
      expect(tester.takeException(), isNull, reason: 'Tab $i');
    }
    debugPrint('IT: alle Tabs ok');
  });
}
