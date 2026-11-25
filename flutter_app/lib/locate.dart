// "Meine Stadt finden": one-time location on tap, used only on the device, never saved or sent.
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'theme.dart';

import 'data.dart';
import 'strings.dart';
import 'widgets.dart';

Future<String?> locateCity(BuildContext context) async {
  try {
    if (!await Geolocator.isLocationServiceEnabled()) {
      if (context.mounted) toast(context, t('loc_fail'));
      return null;
    }
    var perm = await Geolocator.checkPermission();
    if (perm == LocationPermission.denied) perm = await Geolocator.requestPermission();
    if (perm == LocationPermission.denied || perm == LocationPermission.deniedForever) {
      if (context.mounted) toast(context, t('loc_denied'));
      return null;
    }
    if (context.mounted) toast(context, t('loc_wait'));
    final pos = await Geolocator.getCurrentPosition(
      locationSettings: const LocationSettings(accuracy: LocationAccuracy.low, timeLimit: Duration(seconds: 12)),
    );
    final withEvents = {for (final e in store.visibleEvents) e.venueId};
    Venue? best;
    var bd = double.infinity;
    final k = math.cos(pos.latitude * math.pi / 180);
    for (final v in store.venues.values) {
      if (!withEvents.contains(v.id)) continue;
      final dx = (v.lon - pos.longitude) * k, dy = v.lat - pos.latitude;
      final d = dx * dx + dy * dy;
      if (d < bd) {
        bd = d;
        best = v;
      }
    }
    if (best == null) {
      if (context.mounted) toast(context, t('loc_fail'));
      return null;
    }
    final km = math.sqrt(bd) * 111;
    if (context.mounted) toast(context, km > 60 ? t('loc_far', {'c': best.city}) : t('loc_ok', {'c': best.city}));
    store.setHere(best.city);
    return best.city;
  } catch (_) {
    if (context.mounted) toast(context, t('loc_fail'));
    return null;
  }
}


/// Nearest city with upcoming events, or null.
String? _nearestCity(Position pos) {
  final withEvents = {for (final e in store.visibleEvents) e.venueId};
  Venue? best;
  var bd = double.infinity;
  final k = math.cos(pos.latitude * math.pi / 180);
  for (final v in store.venues.values) {
    if (!withEvents.contains(v.id)) continue;
    final dx = (v.lon - pos.longitude) * k, dy = v.lat - pos.latitude;
    final d = dx * dx + dy * dy;
    if (d < bd) {
      bd = d;
      best = v;
    }
  }
  return best?.city;
}

/// Called on start and whenever the app comes back: if location is allowed, update the current city.
/// The very first time it explains why and then shows the system prompt.
Future<void> autoLocate(BuildContext context) async {
  try {
    if (!await Geolocator.isLocationServiceEnabled()) return;
    var perm = await Geolocator.checkPermission();
    if (perm == LocationPermission.denied) {
      final prefs = await SharedPreferences.getInstance();
      if (prefs.getBool('loc_asked') == true || !context.mounted) return;
      await prefs.setBool('loc_asked', true);
      final ok = await showDialog<bool>(
        context: context,
        builder: (c) => AlertDialog(
          backgroundColor: C.surface,
          title: Text(t('loc_q_t').toUpperCase(), style: display(22)),
          content: Text(t('loc_q'), style: body(15)),
          actions: [
            TextButton(onPressed: () => Navigator.pop(c, false), child: Text(t('later'))),
            TextButton(onPressed: () => Navigator.pop(c, true), child: Text(t('allow'), style: const TextStyle(color: C.accent))),
          ],
        ),
      );
      if (ok != true) return;
      perm = await Geolocator.requestPermission();
    }
    if (perm != LocationPermission.whileInUse && perm != LocationPermission.always) return;
    // wait until events are loaded, otherwise there is nothing to compare with
    for (var i = 0; i < 20 && store.visibleEvents.isEmpty; i++) {
      await Future.delayed(const Duration(milliseconds: 500));
    }
    final pos = await Geolocator.getLastKnownPosition() ??
        await Geolocator.getCurrentPosition(
          locationSettings: const LocationSettings(accuracy: LocationAccuracy.low, timeLimit: Duration(seconds: 15)),
        );
    store.setHere(_nearestCity(pos));
  } catch (_) {}
}
