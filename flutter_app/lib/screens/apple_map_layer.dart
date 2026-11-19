// Native Apple Maps (MapKit) for iPhone/iPad. Android keeps the OpenStreetMap layer in map.dart.
// Clubs close to each other are merged into numbered bubbles, like in Apple's own apps.
import 'dart:math' as math;
import 'dart:ui' as ui;

import 'package:apple_maps_flutter/apple_maps_flutter.dart' as am;
import 'package:flutter/material.dart';

import '../data.dart';
import '../theme.dart';

const _home = am.LatLng(51.15, 10.4);
const _homeZoom = 5.7;
const _grey = Color(0xFF6B6B73);

class AppleMapLayer extends StatefulWidget {
  final List<Venue> venues;
  final Map<int, int> counts; // venueId -> number of visible events
  final void Function(Venue) onVenue;
  const AppleMapLayer({super.key, required this.venues, required this.counts, required this.onVenue});

  @override
  State<AppleMapLayer> createState() => AppleMapLayerState();
}

class AppleMapLayerState extends State<AppleMapLayer> {
  am.AppleMapController? _ctrl;
  am.LatLng _center = _home;
  double _zoom = _homeZoom;
  double _builtZoom = -1;
  int _sig = 0;
  int _gen = 0;
  Set<am.Annotation> _ann = {};
  final _icons = <String, am.BitmapDescriptor>{};

  /// Used by the zoom buttons of the map screen.
  void zoomBy(double d) =>
      _ctrl?.animateCamera(am.CameraUpdate.newLatLngZoom(_center, (_zoom + d).clamp(4.5, 17.0).toDouble()));
  void reset() => _ctrl?.animateCamera(am.CameraUpdate.newLatLngZoom(_home, _homeZoom));

  int _signature() => Object.hash(
        Object.hashAll(widget.venues.map((v) => v.id)),
        Object.hashAll(widget.venues.map((v) => (widget.counts[v.id] ?? 0) > 0)),
      );

  @override
  void initState() {
    super.initState();
    _sig = _signature();
    _rebuild();
  }

  @override
  void didUpdateWidget(covariant AppleMapLayer old) {
    super.didUpdateWidget(old);
    final s = _signature();
    if (s != _sig) {
      _sig = s;
      _rebuild();
    }
  }

  /// Draws a round marker (optionally with a number) as PNG for MapKit.
  Future<am.BitmapDescriptor> _icon(String key, double size, Color fill, String? label) async {
    final hit = _icons[key];
    if (hit != null) return hit;
    final dpr = ui.PlatformDispatcher.instance.views.first.devicePixelRatio;
    final px = (size * dpr).ceil();
    final rec = ui.PictureRecorder();
    final c = Canvas(rec)..scale(dpr);
    final r = size / 2;
    c.drawCircle(Offset(r, r), r, Paint()..color = C.bg);
    c.drawCircle(Offset(r, r), r - (label == null ? 1.5 : 2), Paint()..color = fill);
    if (label != null) {
      final tp = TextPainter(
        text: TextSpan(
          text: label,
          style: TextStyle(color: C.text, fontSize: size * (label.length > 2 ? 0.32 : 0.4), fontWeight: FontWeight.w800),
        ),
        textDirection: TextDirection.ltr,
      )..layout();
      tp.paint(c, Offset(r - tp.width / 2, r - tp.height / 2));
    }
    final img = await rec.endRecording().toImage(px, px);
    final data = await img.toByteData(format: ui.ImageByteFormat.png);
    final d = am.BitmapDescriptor.fromBytes(data!.buffer.asUint8List());
    _icons[key] = d;
    return d;
  }

  Future<void> _rebuild() async {
    final gen = ++_gen;
    final z = _zoom;
    _builtZoom = z;
    // grid of ~56 px cells in Web-Mercator space; from zoom 14 every club stands alone
    final cell = 56 / (256 * math.pow(2, z));
    final groups = <String, List<Venue>>{};
    for (final v in widget.venues) {
      final x = (v.lon + 180) / 360;
      final s = math.sin(v.lat * math.pi / 180).clamp(-0.9999, 0.9999);
      final y = 0.5 - math.log((1 + s) / (1 - s)) / (4 * math.pi);
      final k = z >= 14 ? 'v${v.id}' : '${(x / cell).floor()}:${(y / cell).floor()}';
      (groups[k] ??= []).add(v);
    }

    final out = <am.Annotation>{};
    for (final e in groups.entries) {
      final g = e.value;
      if (g.length == 1) {
        final v = g.first;
        final has = (widget.counts[v.id] ?? 0) > 0;
        out.add(am.Annotation(
          annotationId: am.AnnotationId('v${v.id}'),
          position: am.LatLng(v.lat, v.lon),
          anchor: const Offset(0.5, 0.5),
          icon: await _icon(has ? 'red' : 'grey', has ? 18 : 13, has ? C.accent : _grey, null),
          zIndex: has ? 2 : 1,
          onTap: () => widget.onVenue(v),
        ));
      } else {
        final lat = g.map((v) => v.lat).reduce((a, b) => a + b) / g.length;
        final lon = g.map((v) => v.lon).reduce((a, b) => a + b) / g.length;
        final has = g.any((v) => (widget.counts[v.id] ?? 0) > 0);
        final n = g.length;
        final label = n > 999 ? '999+' : '$n';
        final size = n < 10 ? 30.0 : (n < 100 ? 36.0 : 42.0);
        final pos = am.LatLng(lat, lon);
        out.add(am.Annotation(
          annotationId: am.AnnotationId('c${e.key}'),
          position: pos,
          anchor: const Offset(0.5, 0.5),
          icon: await _icon('c$label$has', size, has ? C.accent : _grey, label),
          zIndex: 3,
          onTap: () => _ctrl?.animateCamera(am.CameraUpdate.newLatLngZoom(pos, math.min(z + 2, 17.0))),
        ));
      }
    }
    if (gen != _gen || !mounted) return;
    setState(() => _ann = out);
  }

  @override
  Widget build(BuildContext context) {
    return am.AppleMap(
      initialCameraPosition: const am.CameraPosition(target: _home, zoom: _homeZoom),
      onMapCreated: (c) => _ctrl = c,
      minMaxZoomPreference: const am.MinMaxZoomPreference(4.5, 17),
      rotateGesturesEnabled: false,
      pitchGesturesEnabled: false,
      compassEnabled: false,
      annotations: _ann,
      onCameraMove: (p) {
        _center = p.target;
        _zoom = p.zoom;
      },
      onCameraIdle: () {
        if ((_zoom - _builtZoom).abs() > 0.3) _rebuild();
      },
    );
  }
}
