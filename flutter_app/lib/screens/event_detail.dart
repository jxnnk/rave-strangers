import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:share_plus/share_plus.dart';

import '../data.dart';
import '../strings.dart';
import '../theme.dart';
import '../widgets.dart';
import 'club.dart';

class EventDetail extends StatelessWidget {
  final Ev e;
  const EventDetail(this.e, {super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      body: ListenableBuilder(
        listenable: store,
        builder: (context, _) {
          final v = store.venues[e.venueId];
          final d = e.start;
          final n = store.counts[e.id] ?? 0;
          final goes = store.going.contains(e.id);
          final saved = store.saved.contains(e.id);
          return ListView(
            padding: const EdgeInsets.fromLTRB(18, 4, 18, 48),
            children: [
              Kicker('${fmtLong(d)} · ${e.timeLabel}'),
              const SizedBox(height: 10),
              Text(e.title.toUpperCase(), style: display(28)),
              const SizedBox(height: 12),
              if (v != null)
                InkWell(
                  onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => ClubScreen(v))),
                  child: Text('${v.name} · ${v.city} →',
                      style: body(17, weight: FontWeight.w600).copyWith(
                          decoration: TextDecoration.underline, decorationColor: C.accent, decorationThickness: 2)),
                ),
              const SizedBox(height: 10),
              Wrap(spacing: 10, runSpacing: 4, children: [for (final g in e.genres) Tag(g)]),
              const SizedBox(height: 18),
              Wrap(spacing: 8, runSpacing: 8, children: [
                RsButton(goes ? '✓ ${t('going_on')}' : t('going'),
                    primary: !goes,
                    active: goes,
                    onTap: () async {
                      if (store.user == null) {
                        askLogin(context);
                        return;
                      }
                      HapticFeedback.lightImpact();
                      await store.toggleGoing(e.id);
                    }),
                RsButton(saved ? '✓ ${t('saved')}' : t('save'),
                    active: saved,
                    onTap: () async {
                      if (store.user == null) {
                        askLogin(context);
                        return;
                      }
                      HapticFeedback.selectionClick();
                      await store.toggleSaved(e.id);
                    }),
                RsButton(t('share'), icon: Icons.ios_share, onTap: () {
                  final link = e.sourceUrl ?? webUrl;
                  Share.share('${e.title} · ${v?.name ?? ''} · ${fmtLong(d)} ${e.timeLabel}\n$link');
                }),
                if (v != null) RsButton(t('route'), onTap: () => openUrl(routeUrl(v))),
              ]),
              if (n > 0) ...[
                const SizedBox(height: 10),
                Text(t('going_n', {'n': n}).toUpperCase(), style: mono(11)),
              ],
              const SizedBox(height: 18),
              _Facts(rows: [
                [t('date'), fmtLong(d)],
                [t('start'), e.timeLabel],
                if (v != null) [t('venue'), v.name],
                if (v != null) [t('address'), v.address.isNotEmpty ? v.address : v.city],
              ]),
              Section(1, t('lineup')),
              if (e.lineup.isEmpty) Text(t('tba'), style: body(15, color: C.muted)),
              for (final name in e.lineup)
                Container(
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: C.line))),
                  child: Text(name, style: body(16, weight: FontWeight.w600)),
                ),
              if (e.lineupMore > 0)
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Text(t('more_artists', {'n': e.lineupMore}).toUpperCase(), style: mono(11)),
                ),
              Section(2, t('tickets')),
              _Tickets(e),
            ],
          );
        },
      ),
    );
  }
}

class _Facts extends StatelessWidget {
  final List<List<String>> rows;
  const _Facts({required this.rows});
  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(border: Border(top: BorderSide(color: C.line), left: BorderSide(color: C.line))),
      child: Column(children: [
        for (final r in rows)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
            decoration: const BoxDecoration(
                border: Border(right: BorderSide(color: C.line), bottom: BorderSide(color: C.line))),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(r[0].toUpperCase(), style: mono(10.5)),
              const SizedBox(height: 3),
              Text(r[1], style: body(15.5, weight: FontWeight.w600)),
            ]),
          ),
      ]),
    );
  }
}

class _Tickets extends StatelessWidget {
  final Ev e;
  const _Tickets(this.e);
  @override
  Widget build(BuildContext context) {
    final st = e.ticketStatus ?? 'unknown';
    final dot = switch (st) {
      'available' => C.green,
      'few' => C.amber,
      'sold_out' => C.accent,
      _ => C.muted,
    };
    final official = e.ticketUrl ?? e.sourceUrl;
    // Full event titles rarely match TicketSwap's search, so search the venue instead.
    final venueName = store.venues[e.venueId]?.name ?? e.title;
    final swap = 'https://www.ticketswap.com/search?query=${Uri.encodeComponent(venueName)}';
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Container(
        width: double.infinity,
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: C.surface, border: Border.all(color: st == 'sold_out' ? C.accent : C.line2)),
        child: Wrap(crossAxisAlignment: WrapCrossAlignment.center, spacing: 12, runSpacing: 6, children: [
          Container(width: 10, height: 10, decoration: BoxDecoration(color: dot, shape: BoxShape.circle)),
          Text(t('tix_$st').toUpperCase(), style: mono(12, color: C.text)),
          if (e.priceText != null) Text('${t('price')}: ${e.priceText}'.toUpperCase(), style: mono(11.5)),
        ]),
      ),
      const SizedBox(height: 12),
      Wrap(spacing: 8, runSpacing: 8, children: [
        if (official != null)
          RsButton('${t('tix_official')} ↗', primary: st != 'sold_out', onTap: () => openUrl(official)),
        RsButton('${t('tix_swap', {'v': venueName})} ↗', onTap: () => openUrl(swap)),
      ]),
      const SizedBox(height: 8),
      Text(t('tix_swap_note'), style: body(13, color: C.muted)),
      const SizedBox(height: 14),
      Container(
        width: double.infinity,
        padding: const EdgeInsets.fromLTRB(14, 14, 14, 8),
        decoration: const BoxDecoration(
          color: Color(0x10FF2B1C),
          border: Border(
              left: BorderSide(color: C.accent, width: 4),
              top: BorderSide(color: C.accent),
              right: BorderSide(color: C.accent),
              bottom: BorderSide(color: C.accent)),
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('⚠ ${t('scam_t')}'.toUpperCase(), style: mono(12, color: C.accent)),
          const SizedBox(height: 8),
          for (final k in ['scam_1', 'scam_2', 'scam_3', 'scam_4'])
            Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Text('•  ${t(k)}', style: body(14.5)),
            ),
        ]),
      ),
    ]);
  }
}
