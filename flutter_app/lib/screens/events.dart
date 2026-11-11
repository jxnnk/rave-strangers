import 'package:flutter/material.dart';

import '../data.dart';
import '../strings.dart';
import '../theme.dart';
import '../widgets.dart';

class EventsScreen extends StatefulWidget {
  const EventsScreen({super.key});
  @override
  State<EventsScreen> createState() => _EventsScreenState();
}

class _EventsScreenState extends State<EventsScreen> {
  String _q = '';
  String? _city;
  String? _genre;

  bool _match(Ev e) {
    final v = store.venues[e.venueId];
    if (_city != null && v?.city != _city) return false;
    if (_genre != null && !e.genres.contains(_genre)) return false;
    if (_q.isEmpty) return true;
    final q = _q.toLowerCase();
    return e.title.toLowerCase().contains(q) ||
        (v?.name.toLowerCase().contains(q) ?? false) ||
        e.lineup.any((n) => n.toLowerCase().contains(q));
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: store,
      builder: (context, _) {
        final list = store.visibleEvents.where(_match).toList();
        return SafeArea(
          bottom: false,
          child: RefreshIndicator(
            color: C.accent,
            backgroundColor: C.surface,
            onRefresh: store.load,
            child: CustomScrollView(slivers: [
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(18, 18, 18, 0),
                sliver: SliverToBoxAdapter(
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(t('tab_events').toUpperCase(), style: display(40)),
                    const SizedBox(height: 18),
                    TextField(
                      style: body(15),
                      cursorColor: C.accent,
                      decoration: InputDecoration(
                          hintText: t('search'), prefixIcon: const Icon(Icons.search, color: C.muted)),
                      onChanged: (v) => setState(() => _q = v.trim()),
                    ),
                    const SizedBox(height: 10),
                    Container(
                      height: 48,
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      decoration: BoxDecoration(color: C.surface, border: Border.all(color: C.line2)),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String?>(
                          value: _city,
                          isExpanded: true,
                          dropdownColor: C.surface,
                          iconEnabledColor: C.muted,
                          style: body(15),
                          items: [
                            DropdownMenuItem<String?>(value: null, child: Text(t('all_cities'))),
                            for (final c in store.cities) DropdownMenuItem<String?>(value: c, child: Text(c)),
                          ],
                          onChanged: (v) => setState(() => _city = v),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      height: 36,
                      child: ListView(scrollDirection: Axis.horizontal, children: [
                        _Chip(t('all_genres'), _genre == null, () => setState(() => _genre = null)),
                        for (final g in genres) _Chip(g, _genre == g, () => setState(() => _genre = _genre == g ? null : g)),
                      ]),
                    ),
                    const SizedBox(height: 16),
                    Text(t('n_events', {'n': list.length}).toUpperCase(), style: mono(11)),
                    const SizedBox(height: 8),
                    Container(height: 1, color: C.line),
                  ]),
                ),
              ),
              if (list.isEmpty && !store.loading)
                SliverPadding(
                  padding: const EdgeInsets.all(18),
                  sliver: SliverToBoxAdapter(child: EmptyBox(t('no_results'))),
                ),
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(18, 0, 18, 40),
                sliver: SliverList.builder(
                  itemCount: list.length,
                  itemBuilder: (context, i) => EventRow(list[i]),
                ),
              ),
            ]),
          ),
        );
      },
    );
  }
}

class _Chip extends StatelessWidget {
  final String label;
  final bool on;
  final VoidCallback onTap;
  const _Chip(this.label, this.on, this.onTap);
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 6),
      child: Material(
        color: on ? C.text : Colors.transparent,
        child: InkWell(
          onTap: onTap,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            alignment: Alignment.center,
            decoration: BoxDecoration(border: Border.all(color: on ? C.text : C.line2)),
            child: Text(label.toUpperCase(), style: mono(11, color: on ? C.bg : C.muted)),
          ),
        ),
      ),
    );
  }
}
