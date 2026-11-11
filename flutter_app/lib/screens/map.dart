import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

import '../data.dart';
import '../strings.dart';
import '../theme.dart';
import '../widgets.dart';
import 'club.dart';

// Light raster map turned into a steel-grey night map (inverted greyscale), so it is not pitch black.
const _grey = ColorFilter.matrix(<double>[
  -0.19, -0.64, -0.07, 0, 265, //
  -0.19, -0.64, -0.07, 0, 265, //
  -0.19, -0.64, -0.07, 0, 272, //
  0, 0, 0, 1, 0,
]);

Widget _greyTile(BuildContext context, Widget tileWidget, TileImage tile) =>
    ColorFiltered(colorFilter: _grey, child: tileWidget);

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});
  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  final _ctrl = MapController();
  bool _onlyEvents = false;
  bool _names = false;
  int? _selected;

  void _zoom(double delta) {
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
          FlutterMap(
            mapController: _ctrl,
            options: MapOptions(
              initialCenter: const LatLng(51.15, 10.4),
              initialZoom: 5.7,
              minZoom: 4.5,
              maxZoom: 17,
              backgroundColor: const Color(0xFF2A2A2F),
              interactionOptions: const InteractionOptions(flags: InteractiveFlag.all & ~InteractiveFlag.rotate),
              onPositionChanged: (camera, hasGesture) {
                final show = camera.zoom >= 11;
                if (show != _names) {
                  WidgetsBinding.instance.addPostFrameCallback((_) {
                    if (mounted) setState(() => _names = show);
                  });
                }
              },
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
                userAgentPackageName: 'de.ravestrangers.rave_strangers',
                tileBuilder: _greyTile,
              ),
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
                    _MapBtn(Icons.add, () => _zoom(1)),
                    Container(width: 42, height: 1, color: C.line2),
                    _MapBtn(Icons.remove, () => _zoom(-1)),
                    Container(width: 42, height: 1, color: C.line2),
                    _MapBtn(Icons.crop_free, () => _ctrl.move(const LatLng(51.15, 10.4), 5.7)),
                  ]),
                ),
              ),
            ),
          ),
          Positioned(
            right: 4,
            bottom: 4,
            child: GestureDetector(
              onTap: () => openUrl('https://www.openstreetmap.org/copyright'),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                color: const Color(0xCC111113),
                child: Text('© OpenStreetMap · © CARTO', style: mono(9, spacing: 0.3)),
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
