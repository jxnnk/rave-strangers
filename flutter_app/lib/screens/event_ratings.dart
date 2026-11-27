// Event-Bewertungen + Check-in vor Ort (DB 027/028).
// Standort: nur im Vordergrund, Abstand wird auf dem Gerät berechnet, an den Server geht nur die Event-ID.
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:geolocator/geolocator.dart';

import '../data.dart';
import '../strings.dart';
import '../theme.dart';
import '../widgets.dart';

String _num(num? x) => x == null ? '' : (appLang == 'de' ? x.toString().replaceAll('.', ',') : x.toString());

class Stars extends StatelessWidget {
  final num value;
  final double size;
  const Stars(this.value, {super.key, this.size = 16});
  @override
  Widget build(BuildContext context) {
    final r = value.round();
    return Row(mainAxisSize: MainAxisSize.min, children: [
      for (var i = 1; i <= 5; i++) Icon(Icons.star, size: size, color: i <= r ? C.accent : C.line2),
    ]);
  }
}

/// "Bist du gerade hier?" – nur während des Events.
class CheckinCard extends StatefulWidget {
  final Ev e;
  const CheckinCard(this.e, {super.key});
  @override
  State<CheckinCard> createState() => _CheckinCardState();
}

class _CheckinCardState extends State<CheckinCard> {
  bool _busy = false;

  Future<void> _go() async {
    final v = store.venues[widget.e.venueId];
    if (v == null) return;
    setState(() => _busy = true);
    try {
      if (!await Geolocator.isLocationServiceEnabled()) {
        if (mounted) toast(context, t('ci_denied'));
        return;
      }
      var perm = await Geolocator.checkPermission();
      if (perm == LocationPermission.denied) perm = await Geolocator.requestPermission();
      if (perm == LocationPermission.denied || perm == LocationPermission.deniedForever) {
        if (mounted) toast(context, t('ci_denied'));
        return;
      }
      if (mounted) toast(context, t('ci_busy'));
      final pos = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(accuracy: LocationAccuracy.high, timeLimit: Duration(seconds: 15)),
      );
      final d = Geolocator.distanceBetween(pos.latitude, pos.longitude, v.lat, v.lon);
      if (d > 400) {
        if (mounted) toast(context, t('ci_far'));
        return;
      }
      final r = await store.checkIn(widget.e.id, pos.latitude, pos.longitude);
      if (!mounted) return;
      if (r == 'ok') {
        HapticFeedback.mediumImpact();
        toast(context, t('ci_ok'));
      } else {
        toast(context, t(r == 'not_now' ? 'ci_notnow' : r == 'too_far' ? 'ci_far' : 'ci_err'));
      }
    } catch (e) {
      debugPrint('check-in failed: $e');
      if (mounted) toast(context, t('ci_err'));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (store.user == null || widget.e.phase != 'live') return const SizedBox.shrink();
    final on = store.checkins.contains(widget.e.id);
    final col = on ? C.green : C.accent;
    return Container(
      margin: const EdgeInsets.only(top: 16),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: col.withValues(alpha: 0.07), border: Border.all(color: col)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text('${on ? '✓ ' : ''}${t(on ? 'ci_done' : 'ci_t')}'.toUpperCase(), style: display(20)),
        const SizedBox(height: 4),
        Text(t(on ? 'ci_done_sub' : 'ci_sub'), style: body(14, color: C.muted)),
        if (!on) ...[
          const SizedBox(height: 10),
          RsButton(_busy ? '…' : t('ci_btn'), primary: true, icon: Icons.place_outlined, onTap: _busy ? null : _go),
        ],
      ]),
    );
  }
}

/// "Wie war das Event?" – ab Beginn sichtbar.
class EventRatings extends StatefulWidget {
  final Ev e;
  const EventRatings(this.e, {super.key});
  @override
  State<EventRatings> createState() => _EventRatingsState();
}

class _EventRatingsState extends State<EventRatings> {
  Map<String, dynamic>? _sum;
  List<Map<String, dynamic>>? _list;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final r = await Future.wait([
        sb.from('event_ratings').select().eq('event_id', widget.e.id),
        sb
            .from('reviews')
            .select('id,author,stars,sound,crowd,door,safety,lineup,awareness,body,verified,created_at,'
                'profiles(handle,display_name,avatar_url,verified)')
            .eq('event_id', widget.e.id)
            .order('created_at', ascending: false)
            .limit(50),
      ]);
      if (!mounted) return;
      setState(() {
        _sum = r[0].isEmpty ? null : Map<String, dynamic>.from(r[0].first);
        _list = List<Map<String, dynamic>>.from(r[1]);
      });
    } catch (e) {
      debugPrint('event ratings failed: $e');
      if (mounted) setState(() => _list = []);
    }
  }

  Widget _bar(String label, num? x) {
    if (x == null) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(children: [
        SizedBox(width: 130, child: Text(label, style: body(13, color: C.muted))),
        Expanded(
          child: Container(
            height: 6,
            color: C.line,
            alignment: Alignment.centerLeft,
            child: FractionallySizedBox(widthFactor: (x / 5).clamp(0, 1).toDouble(), child: Container(color: C.accent)),
          ),
        ),
        const SizedBox(width: 8),
        Text(_num(x), style: mono(12, color: C.text)),
      ]),
    );
  }

  Future<void> _openForm(Map<String, dynamic>? mine) async {
    final saved = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: C.bg,
      shape: const RoundedRectangleBorder(),
      builder: (_) => _ReviewSheet(e: widget.e, mine: mine),
    );
    if (saved == true) {
      store.myEvRev.add(widget.e.id);
      _load();
    }
  }

  @override
  Widget build(BuildContext context) {
    final e = widget.e;
    if (e.phase == 'future') return const SizedBox.shrink();
    final list = _list;
    final s = _sum;
    final mine = store.user == null ? null : list?.where((x) => x['author'] == store.user!.id).firstOrNull;
    final score = (s?['score'] ?? s?['avg']) as num?;
    final n = (s?['n'] as int?) ?? 0;
    final nv = (s?['n_verified'] as int?) ?? 0;
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Section(0, t('er_t')),
      if (list == null)
        const Padding(padding: EdgeInsets.all(16), child: Center(child: CircularProgressIndicator(color: C.accent)))
      else ...[
        if (n == 0)
          Text(t('er_none'), style: body(15, color: C.muted))
        else ...[
          Row(crossAxisAlignment: CrossAxisAlignment.end, children: [
            Text(_num(score), style: display(44)),
            const SizedBox(width: 12),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Stars(score ?? 0, size: 18),
                const SizedBox(height: 4),
                Text(n == 1 ? t('rev_one') : t('rev_n', {'n': n}), style: body(13, color: C.muted)),
                if (nv > 0) Text(t('er_verified_n', {'n': nv}), style: body(13, color: C.green)),
              ]),
            ),
          ]),
          const SizedBox(height: 12),
          _bar(t('er_lineup'), s?['lineup'] as num?),
          _bar(t('rev_sound'), s?['sound'] as num?),
          _bar(t('rev_crowd'), s?['crowd'] as num?),
          _bar(t('rev_door'), s?['door'] as num?),
          _bar(t('er_safety'), s?['safety'] as num?),
          _bar(t('er_aware'), s?['awareness'] as num?),
        ],
        const SizedBox(height: 12),
        if (store.user == null)
          Text(t('er_login'), style: body(14, color: C.muted))
        else if (mine != null || store.canRate(e))
          RsButton(mine != null ? '✎ ${t('rev_edit')}' : '★ ${t('er_write')}',
              primary: mine == null, onTap: () => _openForm(mine))
        else
          Text(t(store.going.contains(e.id) ? 'er_closed' : 'er_only_go'), style: body(14, color: C.muted)),
        for (final r in list.where((x) => (x['body'] as String?)?.isNotEmpty ?? false).take(20))
          Container(
            padding: const EdgeInsets.symmetric(vertical: 12),
            decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: C.line))),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Stars(r['stars'] as num? ?? 0, size: 15),
                if (r['verified'] == true) ...[
                  const SizedBox(width: 10),
                  Text('✓ ${t('er_was_there')}', style: mono(11.5, color: C.green)),
                ],
              ]),
              const SizedBox(height: 6),
              Text(r['body'] as String, style: body(15)),
              const SizedBox(height: 4),
              Text('${(r['profiles'] as Map?)?['display_name'] ?? ''} · ${ago(r['created_at'] as String?)}',
                  style: body(12.5, color: C.muted)),
            ]),
          ),
      ],
    ]);
  }
}

class _ReviewSheet extends StatefulWidget {
  final Ev e;
  final Map<String, dynamic>? mine;
  const _ReviewSheet({required this.e, this.mine});
  @override
  State<_ReviewSheet> createState() => _ReviewSheetState();
}

class _ReviewSheetState extends State<_ReviewSheet> {
  static const _keys = ['stars', 'lineup', 'sound', 'crowd', 'door', 'safety', 'awareness'];
  late final Map<String, int?> _v = {for (final k in _keys) k: widget.mine?[k] as int?};
  late final _body = TextEditingController(text: widget.mine?['body'] as String? ?? '');
  bool _busy = false;
  String? _err;

  String _label(String k) => switch (k) {
        'stars' => t('rev_overall'),
        'lineup' => t('er_lineup'),
        'sound' => t('rev_sound'),
        'crowd' => t('rev_crowd'),
        'door' => t('rev_door'),
        'safety' => t('er_safety'),
        _ => t('er_aware'),
      };

  @override
  void dispose() {
    _body.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (_v['stars'] == null) {
      setState(() => _err = t('rev_need_star'));
      return;
    }
    setState(() {
      _busy = true;
      _err = null;
    });
    final row = <String, dynamic>{
      for (final k in _keys) k: _v[k],
      'body': _body.text.trim().isEmpty ? null : _body.text.trim(),
    };
    try {
      final id = widget.mine?['id'];
      if (id != null) {
        await sb.from('reviews').update(row).eq('id', id);
      } else {
        await sb.from('reviews').insert({
          ...row,
          'event_id': widget.e.id,
          'venue_id': widget.e.venueId,
          'author': store.user!.id,
        });
      }
      HapticFeedback.lightImpact();
      if (mounted) {
        toast(context, t('rev_saved'));
        Navigator.of(context).pop(true);
      }
    } catch (e) {
      debugPrint('review save failed: $e');
      if (mounted) setState(() => _err = t('err'));
    }
    if (mounted) setState(() => _busy = false);
  }

  Widget _row(String k) => Padding(
        padding: const EdgeInsets.only(bottom: 10),
        child: Row(children: [
          Expanded(child: Text(_label(k), style: body(15, weight: k == 'stars' ? FontWeight.w700 : FontWeight.w400))),
          for (var i = 1; i <= 5; i++)
            InkResponse(
              radius: 22,
              onTap: () => setState(() => _v[k] = _v[k] == i && k != 'stars' ? null : i),
              child: Padding(
                padding: const EdgeInsets.all(4),
                child: Icon(Icons.star, size: 28, color: (_v[k] ?? 0) >= i ? C.accent : C.line2),
              ),
            ),
        ]),
      );

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(18, 18, 18, 18),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
            Text(t('er_write').toUpperCase(), style: display(24)),
            const SizedBox(height: 4),
            Text(widget.e.title, style: body(15, color: C.muted)),
            const SizedBox(height: 6),
            Text(t('er_rules'), style: body(12.5, color: C.muted)),
            const SizedBox(height: 14),
            for (final k in _keys) _row(k),
            TextField(
              controller: _body,
              maxLength: 2000,
              minLines: 3,
              maxLines: 6,
              style: body(15),
              cursorColor: C.accent,
              decoration: InputDecoration(hintText: t('rev_body'), counterText: ''),
            ),
            if (_err != null) Padding(padding: const EdgeInsets.only(top: 8), child: Text(_err!, style: body(14, color: C.accent))),
            const SizedBox(height: 12),
            RsButton(_busy ? '…' : t('rev_send'), primary: true, onTap: _busy ? null : _save),
          ]),
        ),
      ),
    );
  }
}
