// "Meine Stadt finden": one-time location on tap, used only on the device, never saved or sent.
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';

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
    return best.city;
  } catch (_) {
    if (context.mounted) toast(context, t('loc_fail'));
    return null;
  }
}
