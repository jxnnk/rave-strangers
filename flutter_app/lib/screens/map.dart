import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

import '../data.dart';
import '../strings.dart';
import '../theme.dart';
import '../widgets.dart';
import 'apple_map_layer.dart';
import 'club.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});
  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  final _ctrl = MapController();
  double _zoom = 5.5;

  /// City name + centre of its venues. At low zoom only cities with several clubs, to keep it calm.
  List<(String, LatLng)> _cityLabels() {
    final acc = <String, List<double>>{};
    for (final v in store.venues.values) {
      if (v.city.isEmpty || v.city.contains('(')) continue;
      final a = acc.putIfAbsent(v.city, () => [0, 0, 0]);
      a[0] += v.lat;
      a[1] += v.lon;
      a[2] += 1;
    }
    final minN = _zoom < 6.5 ? 8 : (_zoom < 8 ? 4 : (_zoom < 10 ? 2 : 1));
    return [
      for (final e in acc.entries)
        if (e.value[2] >= minN) (e.key, LatLng(e.value[0] / e.value[2], e.value[1] / e.value[2]))
    ];
  }
  final _apple = GlobalKey<AppleMapLayerState>();
  // iPhone/iPad: native Apple Maps. Android (and everything else): OpenStreetMap.
  bool get _useApple => !kIsWeb && defaultTargetPlatform == TargetPlatform.iOS;
  bool _onlyEvents = true; // ~1200 clubs: start with the ones that have events
  bool _names = false;
  int? _selected;

  void _zoomBy(double delta) {
    if (_useApple) return _apple.currentState?.zoomBy(delta);
    final c = _ctrl.camera;
    _ctrl.move(c.center, (c.zoom + delta).clamp(4.5, 17.0).toDouble());
  }

  Future<void> _preview(Venue v) async {
    HapticFeedback.selectionClick();
    setState(() => _selected = v.id);
    await showModalBottomSheet<void>(
      context: context,
      backgroundColor: C.surface,
      barrierColor: Colors.black26,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(),
      builder: (_) => DecoratedBox(
        decoration: const BoxDecoration(border: Border(top: BorderSide(color: C.accent, width: 2))),
        child: ClubPreview(v),
      ),
    );
    if (mounted) setState(() => _selected = null);
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: store,
      builder: (context, _) {
        final count = <int, int>{};
        for (final e in store.visibleEvents) {
          count[e.venueId] = (count[e.venueId] ?? 0) + 1;
        }
        final vs = store.venues.values.where((v) {
          final n = count[v.id] ?? 0;
          return !((_onlyEvents || v.kind != 'club') && n == 0);
        }).toList()
          // grey dots first, red ones painted on top
          ..sort((a, b) => (count[a.id] ?? 0).compareTo(count[b.id] ?? 0));

        return Stack(children: [
          if (_useApple)
            AppleMapLayer(key: _apple, venues: vs, counts: count, onVenue: _preview)
          else
          FlutterMap(
            mapController: _ctrl,
            options: MapOptions(
              initialCenter: const LatLng(51.15, 10.4),
              initialZoom: 5.7,
              minZoom: 4.5,
              maxZoom: 17,
              backgroundColor: const Color(0xFF262628),
              interactionOptions: const InteractionOptions(flags: InteractiveFlag.all & ~InteractiveFlag.rotate),
              onPositionChanged: (camera, hasGesture) {
                final show = camera.zoom >= 11;
                final zb = (camera.zoom * 2).round() / 2; // only rebuild every half zoom step
                if (show != _names || zb != _zoom) {
                  WidgetsBinding.instance.addPostFrameCallback((_) {
                    if (mounted) {
                      setState(() {
                        _names = show;
                        _zoom = zb;
                      });
                    }
                  });
                }
              },
            ),
            children: [
              // Esri "Dark Gray Canvas": free, no API key, dark base + separate label layer
              TileLayer(
                urlTemplate:
                    'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
                maxNativeZoom: 16,
                userAgentPackageName: 'de.ravestrangers.rave_strangers',
              ),
              // Esri's label layer is English only ("Germany", "Lower Saxony"), so we draw our own
              // city names in the local spelling from our venues instead.
              if (_zoom >= 5.5 && _zoom < 12.5)
                MarkerLayer(markers: [
                  for (final c in _cityLabels())
                    Marker(
                      point: c.$2,
                      width: 160,
                      height: 22,
                      child: IgnorePointer(
                        child: Text(c.$1,
                            textAlign: TextAlign.center,
                            style: body(_zoom < 8 ? 12 : 13.5, color: const Color(0xFF9A968F), weight: FontWeight.w600)),
                      ),
                    ),
                ]),
              if (_names)
                MarkerLayer(markers: [
                  for (final v in vs)
                    Marker(
                      point: LatLng(v.lat, v.lon),
                      width: 160,
                      height: 22,
                      alignment: Alignment.centerRight,
                      child: IgnorePointer(
                        child: Padding(
                          padding: const EdgeInsets.only(left: 13),
                          child: Text(v.name,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: body(12.5, weight: FontWeight.w700).copyWith(
                                  shadows: const [Shadow(color: Color(0xFF1A1A1D), blurRadius: 3)])),
                        ),
                      ),
                    ),
                ]),
              MarkerLayer(markers: [
                for (final v in vs)
                  Marker(
                    point: LatLng(v.lat, v.lon),
                    width: 36,
                    height: 36,
                    child: GestureDetector(
                      behavior: HitTestBehavior.opaque,
                      onTap: () => _preview(v),
                      child: Center(child: _Dot(hasEvents: (count[v.id] ?? 0) > 0, selected: _selected == v.id)),
                    ),
                  ),
              ]),
            ],
          ),
          // top bar: title, legend, filter
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(10),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                  color: const Color(0xEB111113),
                  child: Row(mainAxisSize: MainAxisSize.min, children: [
                    const _Dot(hasEvents: true, selected: false, size: 9),
                    const SizedBox(width: 6),
                    Text(t('with_ev').toUpperCase(), style: mono(10)),
                    const SizedBox(width: 12),
                    const _Dot(hasEvents: false, selected: false, size: 9),
                    const SizedBox(width: 6),
                    Text(t('without_ev').toUpperCase(), style: mono(10)),
                  ]),
                ),
                const SizedBox(height: 8),
                Material(
                  color: _onlyEvents ? C.text : const Color(0xEB111113),
                  child: InkWell(
                    onTap: () => setState(() => _onlyEvents = !_onlyEvents),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
                      decoration: BoxDecoration(border: Border.all(color: _onlyEvents ? C.text : C.line2)),
                      child: Text(t('only_events').toUpperCase(),
                          style: mono(11, color: _onlyEvents ? C.bg : C.text)),
                    ),
                  ),
                ),
              ]),
            ),
          ),
          // zoom buttons
          SafeArea(
            child: Align(
              alignment: Alignment.topRight,
              child: Padding(
                padding: const EdgeInsets.all(10),
                child: Container(
                  decoration: BoxDecoration(border: Border.all(color: C.line2)),
                  child: Column(mainAxisSize: MainAxisSize.min, children: [
                    _MapBtn(Icons.add, () => _zoomBy(1)),
                    Container(width: 42, height: 1, color: C.line2),
                    _MapBtn(Icons.remove, () => _zoomBy(-1)),
                    Container(width: 42, height: 1, color: C.line2),
                    _MapBtn(Icons.crop_free, () => _useApple ? _apple.currentState?.reset() : _ctrl.move(const LatLng(51.15, 10.4), 5.7)),
                  ]),
                ),
              ),
            ),
          ),
          // Apple Maps shows its own legal notice, OSM needs ours
          if (!_useApple)
          Positioned(
            right: 4,
            bottom: 4,
            child: GestureDetector(
              onTap: () => openUrl('https://www.esri.com/en-us/legal/terms/full-master-agreement'),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                color: const Color(0xCC111113),
                child: Text('Esri, HERE, Garmin, © OpenStreetMap · Orte: OSM', style: mono(9, spacing: 0.3)),
              ),
            ),
          ),
        ]);
      },
    );
  }
}

class _Dot extends StatelessWidget {
  final bool hasEvents, selected;
  final double? size;
  const _Dot({required this.hasEvents, required this.selected, this.size});
  @override
  Widget build(BuildContext context) {
    final s = size ?? (hasEvents ? 16.0 : 11.0);
    final dot = Container(
      width: s,
      height: s,
      decoration: BoxDecoration(
        color: hasEvents ? C.accent : const Color(0xFF6B6B73),
        shape: BoxShape.circle,
        border: size == null ? Border.all(color: const Color(0xFF111113), width: 1.5) : null,
      ),
    );
    if (!selected) return dot;
    return Container(
      width: 32,
      height: 32,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: const Color(0x2EFF2B1C),
        border: Border.all(color: C.text, width: 2),
      ),
      child: dot,
    );
  }
}

class _MapBtn extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  const _MapBtn(this.icon, this.onTap);
  @override
  Widget build(BuildContext context) => Material(
        color: const Color(0xEB111113),
        child: InkWell(onTap: onTap, child: SizedBox(width: 42, height: 42, child: Icon(icon, size: 20, color: C.text))),
      );
}
