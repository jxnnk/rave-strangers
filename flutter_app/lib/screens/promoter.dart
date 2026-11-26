// Kontostufen (Migration 029): Raver = kostenlos, Promoter = Abo, darf Events eintragen.
// Der Button "Event eintragen" ist für alle sichtbar. Raver landen beim Upgrade-Hinweis
// mit Anfrage-Formular, Promoter und Admins beim Event-Formular.
import 'package:flutter/material.dart';

import '../data.dart';
import '../strings.dart';
import '../theme.dart';
import '../widgets.dart';

String fmtDate(DateTime b) => appLang == 'de' ? '${b.day}.${b.month}.${b.year}' : '${fmtMon(b)} ${b.day}, ${b.year}';
String fmtUntil(String? iso) => iso == null ? '' : fmtDate(berlin(DateTime.parse(iso).toUtc()));

String tierLine() {
  final x = store.tier;
  if (x == null) return '';
  if (x['tier'] == 'admin') return t('tier_admin');
  if (x['tier'] == 'promoter') return t('tier_promoter', {'d': fmtUntil(x['active_until'] as String?)});
  return t('tier_raver');
}

/// "Event eintragen": Login nötig; Raver sehen den Upgrade-Hinweis, Promoter das Formular.
Future<void> openAddEvent(BuildContext context) async {
  if (store.user == null) {
    askLogin(context);
    return;
  }
  if (store.tier == null) await store.loadTier();
  if (!context.mounted) return;
  Navigator.of(context).push(MaterialPageRoute(
      builder: (_) => store.canAddEvents ? const NewEventScreen() : const PromoterScreen()));
}

/// Kurzer Block fürs Profil: Stufe + passender Button.
class TierBox extends StatelessWidget {
  const TierBox({super.key});
  @override
  Widget build(BuildContext context) {
    final x = store.tier;
    if (x == null) return const SizedBox.shrink();
    final pending = x['tier'] == 'raver' && x['request_status'] == 'pending';
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(top: 10),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: C.surface, border: Border.all(color: C.line2)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(tierLine(), style: body(15.5, weight: FontWeight.w700)),
        if (pending) ...[
          const SizedBox(height: 6),
          Text(t('pro_pending'), style: body(14, color: C.muted)),
        ],
        const SizedBox(height: 12),
        store.canAddEvents
            ? RsButton('+ ${t('add_event')}', primary: true, onTap: () => openAddEvent(context))
            : RsButton(t('pro_t'),
                onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const PromoterScreen()))),
      ]),
    );
  }
}

// ---------- Upgrade-Hinweis + Anfrage ----------
class PromoterScreen extends StatefulWidget {
  const PromoterScreen({super.key});
  @override
  State<PromoterScreen> createState() => _PromoterScreenState();
}

class _PromoterScreenState extends State<PromoterScreen> {
  final _org = TextEditingController();
  final _web = TextEditingController();
  final _note = TextEditingController();
  bool _busy = false;
  String? _error;

  @override
  void dispose() {
    _org.dispose();
    _web.dispose();
    _note.dispose();
    super.dispose();
  }

  Future<void> _send() async {
    final org = _org.text.trim();
    if (org.isEmpty || _busy) {
      setState(() => _error = t('pro_org_need'));
      return;
    }
    String? cut(String s, int n) => s.trim().isEmpty ? null : (s.trim().length > n ? s.trim().substring(0, n) : s.trim());
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await sb.from('promoter_requests').insert({
        'profile_id': store.user!.id,
        'org_name': cut(org, 80),
        'website': cut(_web.text, 300),
        'note': cut(_note.text, 1000),
      });
      await store.loadTier();
      if (mounted) toast(context, t('pro_sent'));
    } catch (e) {
      debugPrint('promoter request failed: $e');
      if (mounted) setState(() => _error = t('err'));
    }
    if (mounted) setState(() => _busy = false);
  }

  Widget _field(String label, TextEditingController c, {int max = 80, int lines = 1, TextInputType? type}) => Padding(
        padding: const EdgeInsets.only(bottom: 14),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(label.toUpperCase(), style: mono(10.5)),
          const SizedBox(height: 6),
          TextField(
            controller: c,
            maxLength: max,
            minLines: lines,
            maxLines: lines == 1 ? 1 : lines + 2,
            keyboardType: type,
            style: body(15.5),
            cursorColor: C.accent,
            decoration: const InputDecoration(counterText: ''),
          ),
        ]),
      );

  Widget _bullet(String s) => Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Padding(padding: const EdgeInsets.only(top: 7), child: Container(width: 6, height: 6, color: C.accent)),
          const SizedBox(width: 10),
          Expanded(child: Text(s, style: body(15))),
        ]),
      );

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      body: ListenableBuilder(
        listenable: store,
        builder: (context, _) {
          final x = store.tier ?? const <String, dynamic>{};
          final ended = x['tier'] == 'raver' && x['active_until'] != null;
          return ListView(
            padding: const EdgeInsets.fromLTRB(18, 8, 18, 48),
            children: [
              Text(t('pro_t').toUpperCase(), style: display(34)),
              const SizedBox(height: 12),
              if (store.canAddEvents) ...[
                Text(tierLine(), style: body(15.5, weight: FontWeight.w700)),
                const SizedBox(height: 14),
                RsButton('+ ${t('add_event')}', primary: true, onTap: () {
                  Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => const NewEventScreen()));
                }),
              ] else ...[
                Text(t('pro_lead'), style: body(15, color: C.muted)),
                const SizedBox(height: 16),
                _bullet(t('pro_b1')),
                _bullet(t('pro_b2')),
                _bullet(t('pro_b4')),
                const SizedBox(height: 14),
                if (ended)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: Text(t('tier_ended', {'d': fmtUntil(x['active_until'] as String?)}), style: body(14.5, color: C.amber)),
                  ),
                if (x['request_status'] == 'pending')
                  EmptyBox(t('pro_pending'))
                else ...[
                  if (x['request_status'] == 'rejected')
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Text(t('pro_rejected'), style: body(14.5, color: C.muted)),
                    ),
                  _field(t('pro_org'), _org),
                  _field(t('pro_web'), _web, max: 300, type: TextInputType.url),
                  _field(t('pro_note'), _note, max: 1000, lines: 3),
                  if (_error != null)
                    Padding(padding: const EdgeInsets.only(bottom: 10), child: Text(_error!, style: body(14, color: C.accent))),
                  RsButton(_busy ? '…' : t('pro_send'), primary: true, onTap: _busy ? null : _send),
                ],
              ],
            ],
          );
        },
      ),
    );
  }
}

// ---------- Event eintragen (Promoter / Admin) ----------
class NewEventScreen extends StatefulWidget {
  const NewEventScreen({super.key});
  @override
  State<NewEventScreen> createState() => _NewEventScreenState();
}

class _NewEventScreenState extends State<NewEventScreen> {
  final _title = TextEditingController();
  final _lineup = TextEditingController();
  final _link = TextEditingController();
  final _price = TextEditingController();
  int? _venue;
  DateTime? _date;
  TimeOfDay _time = const TimeOfDay(hour: 23, minute: 0);
  String _kind = 'club';
  final Set<String> _genres = {};
  bool _busy = false;
  String? _error;

  @override
  void dispose() {
    _title.dispose();
    _lineup.dispose();
    _link.dispose();
    _price.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final today = berlinToday();
    final d = await showDatePicker(
      context: context,
      initialDate: _date ?? today,
      firstDate: today,
      lastDate: today.add(const Duration(days: 730)),
    );
    if (d != null) setState(() => _date = d);
  }

  Future<void> _pickTime() async {
    final x = await showTimePicker(context: context, initialTime: _time);
    if (x != null) setState(() => _time = x);
  }

  Future<void> _submit() async {
    final title = _title.text.trim();
    if (title.isEmpty || _venue == null || _date == null) {
      setState(() => _error = t('f_err'));
      return;
    }
    var link = _link.text.trim();
    if (link.isNotEmpty && !link.startsWith('http')) link = 'https://$link';
    final uri = Uri.tryParse(link);
    final safeLink = link.isNotEmpty && uri != null && uri.scheme == 'https' && uri.host.isNotEmpty ? link : null;
    final names = _lineup.text.split(',').map((x) => x.trim()).where((x) => x.isNotEmpty).take(40).toList();
    final start = berlinToUtc(DateTime(_date!.year, _date!.month, _date!.day, _time.hour, _time.minute));
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final row = await sb
          .from('events')
          .insert({
            'venue_id': _venue,
            'title': title.length > 140 ? title.substring(0, 140) : title,
            'starts_at': start.toIso8601String(),
            'time_known': true,
            'kind': _kind,
            'genres': _genres.isEmpty ? ['Techno'] : _genres.toList(),
            'ticket_url': safeLink,
            'source_url': safeLink,
            'price_text': _price.text.trim().isEmpty ? null : _price.text.trim(),
          })
          .select('id,status')
          .single();
      if (names.isNotEmpty) {
        await sb.from('event_lineup').insert([
          for (var i = 0; i < names.length; i++) {'event_id': row['id'], 'position': i, 'name': names[i]}
        ]);
      }
      await Future.wait([store.load(), store.loadTier()]);
      if (!mounted) return;
      toast(context, row['status'] == 'published' ? t('sub_ok_pub') : t('sub_ok_pend'));
      Navigator.of(context).pop();
    } catch (e) {
      debugPrint('add event failed: $e');
      if (!mounted) return;
      if ('$e'.contains('promoter_required')) {
        await store.loadTier();
        if (!mounted) return;
        toast(context, t('pro_need'));
        Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => const PromoterScreen()));
        return;
      }
      setState(() {
        _busy = false;
        _error = t('err');
      });
    }
  }

  Widget _label(String s) => Padding(
        padding: const EdgeInsets.only(bottom: 6),
        child: Text(s.toUpperCase(), style: mono(10.5)),
      );

  Widget _text(String label, TextEditingController c, {int max = 140, TextInputType? type, String? hint}) => Padding(
        padding: const EdgeInsets.only(bottom: 14),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          _label(label),
          TextField(
            controller: c,
            maxLength: max,
            keyboardType: type,
            style: body(15.5),
            cursorColor: C.accent,
            decoration: InputDecoration(counterText: '', hintText: hint),
          ),
        ]),
      );

  Widget _box({required Widget child, VoidCallback? onTap}) => InkWell(
        onTap: onTap,
        child: Container(
          height: 48,
          padding: const EdgeInsets.symmetric(horizontal: 12),
          alignment: Alignment.centerLeft,
          decoration: BoxDecoration(color: C.surface, border: Border.all(color: C.line2)),
          child: child,
        ),
      );

  @override
  Widget build(BuildContext context) {
    final venues = store.venues.values.toList()
      ..sort((a, b) => a.city.compareTo(b.city) != 0 ? a.city.compareTo(b.city) : a.name.compareTo(b.name));
    final trusted = store.tier?['tier'] == 'admin' || store.tier?['trusted'] == true;
    final hh = _time.hour.toString().padLeft(2, '0'), mm = _time.minute.toString().padLeft(2, '0');
    return Scaffold(
      appBar: AppBar(),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(18, 8, 18, 48),
        children: [
          Text(t('add_event').toUpperCase(), style: display(34)),
          const SizedBox(height: 8),
          Text(trusted ? t('new_sub_live') : t('new_sub'), style: body(14.5, color: C.muted)),
          const SizedBox(height: 20),
          _text(t('f_title'), _title),
          _label(t('f_venue')),
          _box(
            child: DropdownButtonHideUnderline(
              child: DropdownButton<int>(
                value: _venue,
                isExpanded: true,
                hint: Text(t('f_venue_pick'), style: body(15, color: C.muted)),
                dropdownColor: C.surface,
                iconEnabledColor: C.muted,
                style: body(15),
                items: [
                  for (final v in venues)
                    DropdownMenuItem<int>(value: v.id, child: Text('${v.city} · ${v.name}', overflow: TextOverflow.ellipsis)),
                ],
                onChanged: (v) => setState(() => _venue = v),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.only(top: 4, bottom: 14),
            child: Text(t('f_venue_missing'), style: body(13, color: C.muted)),
          ),
          Row(children: [
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                _label(t('f_date')),
                _box(
                  onTap: _pickDate,
                  child: Text(_date == null ? '–' : '${fmtDow(_date!)} ${fmtDate(_date!)}', style: body(15)),
                ),
              ]),
            ),
            const SizedBox(width: 10),
            SizedBox(
              width: 110,
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                _label(t('f_time')),
                _box(onTap: _pickTime, child: Text('$hh:$mm', style: body(15))),
              ]),
            ),
          ]),
          const SizedBox(height: 14),
          _label(t('f_kind')),
          Wrap(spacing: 8, children: [
            RsButton(t('type_club'), small: true, active: _kind == 'club', onTap: () => setState(() => _kind = 'club')),
            RsButton(t('type_fest'), small: true, active: _kind == 'festival', onTap: () => setState(() => _kind = 'festival')),
          ]),
          const SizedBox(height: 14),
          _label(t('f_genres')),
          Wrap(spacing: 8, runSpacing: 8, children: [
            for (final g in genres)
              RsButton(g, small: true, active: _genres.contains(g), onTap: () {
                setState(() => _genres.contains(g) ? _genres.remove(g) : _genres.add(g));
              }),
          ]),
          const SizedBox(height: 14),
          _text(t('f_lineup'), _lineup, max: 600),
          _text(t('f_link'), _link, max: 300, type: TextInputType.url, hint: 'https://'),
          _text(t('f_price'), _price, max: 40),
          if (_error != null)
            Padding(padding: const EdgeInsets.only(bottom: 10), child: Text(_error!, style: body(14, color: C.accent))),
          RsButton(_busy ? '…' : t('f_submit'), primary: true, onTap: _busy ? null : _submit),
        ],
      ),
    );
  }
}
