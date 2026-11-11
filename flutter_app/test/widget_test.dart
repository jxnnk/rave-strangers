import 'package:flutter_test/flutter_test.dart';
import 'package:rave_strangers/data.dart';

void main() {
  test('Berlin-Zeit: Winter UTC+1, Sommer UTC+2', () {
    expect(berlin(DateTime.utc(2026, 11, 14, 22, 0)).hour, 23);
    expect(berlin(DateTime.utc(2026, 7, 4, 21, 0)).hour, 23);
  });
}
