import 'package:flutter/material.dart';

import '../data.dart';
import '../strings.dart';
import '../theme.dart';
import '../widgets.dart';
import 'event_detail.dart';

class ClubScreen extends StatelessWidget {
  final Venue v;
  const ClubScreen(this.v, {super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      body: ListenableBuilder(
        listenable: store,
        builder: (context, _) {
          final evs = store.eventsAt(v.id);
          final r = store.ratings[v.id];
          return ListView(
            padding: const EdgeInsets.fromLTRB(18, 4, 18, 48),
            children: [
              Kicker(v.city),
              const SizedBox(height: 10),
              Text(v.name.toUpperCase(), style: display(32)),
              const SizedBox(height: 10),
              RatingLine(v.id),
              const SizedBox(height: 8),
              Text(v.address.isNotEmpty ? v.address : v.city, style: mono(12, spacing: 0.4)),
              if (v.approx) Text(t('approx').toUpperCase(), style: mono(10.5, color: C.amber)),
              const SizedBox(height: 16),
              Wrap(spacing: 8, runSpacing: 8, children: [
                RsButton(t('route'), primary: true, onTap: () => openUrl(routeUrl(v))),
              ]),
              if (r != null && r.n > 0) ...[
                const SizedBox(height: 18),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(color: C.surface, border: Border.all(color: C.line)),
                  child: Row(children: [
                    Text(appLang == 'de' ? r.avg.toString().replaceAll('.', ',') : r.avg.toString(),
                        style: display(44)),
                    const SizedBox(width: 16),
                    Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Stars(r.avg, size: 18),
                      const SizedBox(height: 4),
                      Text(t('ratings_n', {'n': r.n}).toUpperCase(), style: mono(11)),
                    ]),
                  ]),
                ),
              ],
              Section(1, t('upcoming')),
              if (evs.isEmpty) EmptyBox(t('no_ev_here')),
              for (final e in evs) EventRow(e),
            ],
          );
        },
      ),
    );
  }
}

/// Compact preview that slides up from the bottom when a club is tapped on the map.
class ClubPreview extends StatelessWidget {
  final Venue v;
  const ClubPreview(this.v, {super.key});

  @override
  Widget build(BuildContext context) {
    final evs = store.eventsAt(v.id);
    final nav = Navigator.of(context);
    return SafeArea(
      top: false,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(18, 10, 18, 18),
        child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
          Center(child: Container(width: 44, height: 4, color: C.line2)),
          const SizedBox(height: 14),
          Kicker(v.kind == 'club' ? v.city : '${v.city} · ${v.kind}'),
          const SizedBox(height: 6),
          Text(v.name.toUpperCase(), style: display(22)),
          const SizedBox(height: 8),
          RatingLine(v.id),
          const SizedBox(height: 6),
          Text(v.address.isNotEmpty ? v.address : v.city, style: mono(11.5, spacing: 0.4)),
          const SizedBox(height: 10),
          if (evs.isEmpty) Text(t('no_ev_here'), style: body(14, color: C.muted)),
          for (final e in evs.take(3))
            InkWell(
              onTap: () {
                nav.pop();
                nav.push(MaterialPageRoute(builder: (_) => EventDetail(e)));
              },
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 9),
                decoration: const BoxDecoration(border: Border(top: BorderSide(color: C.line))),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('${fmtDow(e.start)} ${e.start.day}.${e.start.month}. · ${e.timeLabel}'.toUpperCase(),
                      style: mono(10.5, color: C.accent)),
                  const SizedBox(height: 3),
                  Text(e.title, style: body(14.5, weight: FontWeight.w700), maxLines: 2, overflow: TextOverflow.ellipsis),
                ]),
              ),
            ),
          if (evs.length > 3)
            Padding(
              padding: const EdgeInsets.only(top: 4),
              child: Text(t('n_more', {'n': evs.length - 3}).toUpperCase(), style: mono(10.5)),
            ),
          const SizedBox(height: 12),
          Wrap(spacing: 8, runSpacing: 8, children: [
            RsButton('${t('open_club')} →', primary: true, small: true, onTap: () {
              nav.pop();
              nav.push(MaterialPageRoute(builder: (_) => ClubScreen(v)));
            }),
            RsButton('${t('route')} ↗', small: true, onTap: () => openUrl(routeUrl(v))),
          ]),
        ]),
      ),
    );
  }
}
