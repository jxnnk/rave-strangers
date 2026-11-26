import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../data.dart';
import '../social.dart';
import 'organizer.dart';
import '../strings.dart';
import '../theme.dart';
import '../widgets.dart';
import 'club.dart';
import 'event_ratings.dart';

class EventDetail extends StatelessWidget {
  final Ev e;
  const EventDetail(this.e, {super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      bottomNavigationBar: ListenableBuilder(listenable: store, builder: (context, _) => _TicketBar(e)),
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
                RsButton(e.phase == 'past' ? (goes ? '✓ ${t('was_there_on')}' : t('was_there')) : (goes ? '✓ ${t('going_on')}' : t('going')),
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
                RsButton(t('share'), icon: Icons.ios_share, onTap: () => shareEvent(e)),
                if (v != null) RsButton(t('route'), onTap: () => openUrl(routeUrl(v))),
              ]),
              CheckinCard(e),
              _SocialProof(e, going: n),
              OrgChips(e),
              const SizedBox(height: 18),
              _Facts(rows: [
                [t('date'), fmtLong(d)],
                [t('start'), e.timeLabel],
                if (v != null) [t('venue'), v.name],
                if (v != null) [t('address'), v.address.isNotEmpty ? v.address : v.city],
              ]),
              EventRatings(e),
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
              Section(3, t('crew_t')),
              CrewSection(e),
              Section(4, t('rides_t')),
              RidesSection(e),
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
    var st = e.ticketStatus ?? 'unknown';
    if (st == 'unknown' && e.ticketUrl != null) st = 'shop'; // Shop-Link da, Status unbekannt
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
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Container(width: 10, height: 10, decoration: BoxDecoration(color: dot, shape: BoxShape.circle)),
            const SizedBox(width: 12),
            Expanded(child: Text(t('tix_$st').toUpperCase(), style: mono(12, color: C.text))),
          ]),
          if (e.price != null)
            Padding(
              padding: const EdgeInsets.only(left: 22, top: 6),
              child: Text('${t('price')}: ${e.price}', style: body(14, color: C.muted)),
            ),
        ]),
      ),
      const SizedBox(height: 12),
      if (needsAlarm(e)) ...[
        Text(t('alarm_note'), style: body(14.5)),
        const SizedBox(height: 10),
        AlarmButton(e),
        const SizedBox(height: 12),
      ],
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


/// Tickets can't be bought right now -> offer the ticket alert instead.
/// Ticket-Alarm nur anbieten, wenn man gerade wirklich keine Tickets kaufen kann.
bool needsAlarm(Ev e) => e.ticketUrl == null || e.ticketStatus == 'sold_out';

class AlarmButton extends StatelessWidget {
  final Ev e;
  final bool small;
  const AlarmButton(this.e, {super.key, this.small = false});
  @override
  Widget build(BuildContext context) {
    final on = store.alarms.contains(e.id);
    return RsButton(on ? '✓ ${t('alarm_on')}' : t('alarm_set'),
        icon: on ? Icons.notifications_active : Icons.notifications_none,
        active: on,
        primary: !on && !small,
        small: small, onTap: () async {
      if (store.user == null) {
        askLogin(context);
        return;
      }
      HapticFeedback.mediumImpact();
      await store.toggleAlarm(e.id);
      if (context.mounted && !on) toast(context, t('alarm_toast'));
    });
  }
}

/// "12 gehen hin · 3 suchen eine Crew · 2 Fahrten" – real numbers only, nothing invented.
class _SocialProof extends StatelessWidget {
  final Ev e;
  final int going;
  const _SocialProof(this.e, {required this.going});
  @override
  Widget build(BuildContext context) {
    final crew = store.crewN[e.id] ?? 0;
    final rides = store.ridesN[e.id] ?? 0;
    final parts = [
      if (going > 0) t('going_n', {'n': going}),
      if (crew > 0) t('crew_n', {'n': crew}),
      if (rides > 0) t('rides_n', {'n': rides}),
    ];
    final friends = store.friendsAt(e.id);
    if (friends.isNotEmpty) {
      parts.insert(0, t('friends_going', {'n': friends.take(3).map((f) => f['display_name'] ?? f['handle']).join(', ')}));
    }
    if (parts.isEmpty) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.only(top: 12),
      child: Row(children: [
        const Icon(Icons.groups_outlined, size: 18, color: C.accent),
        const SizedBox(width: 8),
        Expanded(child: Text(parts.join(' · ').toUpperCase(), style: mono(11, color: C.text))),
      ]),
    );
  }
}

/// Always visible at the bottom: status + the one action that matters right now.
class _TicketBar extends StatelessWidget {
  final Ev e;
  const _TicketBar(this.e);
  @override
  Widget build(BuildContext context) {
    final st = e.ticketStatus ?? 'unknown';
    final dot = switch (st) {
      'available' => C.green,
      'few' => C.amber,
      'sold_out' => C.accent,
      _ => C.muted,
    };
    final venueName = store.venues[e.venueId]?.name ?? e.title;
    final canBuy = e.ticketUrl != null && st != 'sold_out';
    final label = canBuy && st == 'unknown' ? t('tickets') : t('tix_$st');
    Widget action;
    if (canBuy) {
      action = RsButton('${t('get_tix')} ↗', primary: true, onTap: () {
        HapticFeedback.lightImpact();
        openUrl(e.ticketUrl!);
      });
    } else if (st == 'sold_out') {
      action = RsButton('TicketSwap ↗', primary: true,
          onTap: () => openUrl('https://www.ticketswap.com/search?query=${Uri.encodeComponent(venueName)}'));
    } else {
      action = AlarmButton(e);
    }
    return Container(
      decoration: const BoxDecoration(color: C.bg, border: Border(top: BorderSide(color: C.line2))),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 10, 12, 10),
          child: Row(children: [
            Container(width: 9, height: 9, decoration: BoxDecoration(color: dot, shape: BoxShape.circle)),
            const SizedBox(width: 10),
            Expanded(
              child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(label.toUpperCase(), maxLines: 1, overflow: TextOverflow.ellipsis, style: mono(11, color: C.text)),
                if (e.price != null)
                  Text(e.price!, maxLines: 1, overflow: TextOverflow.ellipsis, style: body(13.5, color: C.muted)),
              ]),
            ),
            const SizedBox(width: 10),
            action,
          ]),
        ),
      ),
    );
  }
}
