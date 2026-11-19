// Community building blocks: crew finder, rides, 1:1 chat. Same tables and rules as the web app.
import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:share_plus/share_plus.dart';

import 'data.dart';
import 'strings.dart';
import 'theme.dart';
import 'widgets.dart';

String? get myId => store.user?.id;

String personName(Map<String, dynamic>? p) =>
    ((p?['display_name'] as String?)?.trim().isNotEmpty ?? false) ? p!['display_name'] as String : '@${p?['handle'] ?? '?'}';

void showErr(BuildContext context) => toast(context, t('err'));

/// Invite friends: native share sheet (WhatsApp, Instagram DM, …) with a link that opens the event.
void shareEvent(Ev e) {
  final v = store.venues[e.venueId];
  final n = store.counts[e.id] ?? 0;
  final link = '$webUrl?ref=app#event-${e.id}';
  final lines = [
    t('share_msg'),
    e.title,
    '${fmtLong(e.start)} · ${e.timeLabel}${v != null ? ' · ${v.name}' : ''}',
    if (n > 1) t('share_going', {'n': n}),
    link,
  ];
  Share.share(lines.join('\n'));
}

/// Opens (or creates) the 1:1 chat with another person.
Future<void> openChat(BuildContext context, String otherId, String name) async {
  if (store.user == null) {
    askLogin(context);
    return;
  }
  if (otherId == myId) return;
  try {
    final cid = await sb.rpc('start_chat', params: {'other': otherId});
    if (!context.mounted) return;
    Navigator.of(context).push(MaterialPageRoute(
        builder: (_) => ChatScreen(conversationId: (cid as num).toInt(), otherId: otherId, otherName: name)));
  } catch (e) {
    debugPrint('start_chat failed: $e');
    if (context.mounted) showErr(context);
  }
}

// ---------------------------------------------------------------- Crew finder

class CrewSection extends StatefulWidget {
  final Ev e;
  const CrewSection(this.e, {super.key});
  @override
  State<CrewSection> createState() => _CrewSectionState();
}

class _CrewSectionState extends State<CrewSection> {
  List<Map<String, dynamic>>? _posts;
  final _ctrl = TextEditingController();
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    if (store.user == null) return;
    try {
      final r = await sb
          .from('crew_posts')
          .select('id,author,body,created_at,profiles(handle,display_name,city,verified)')
          .eq('event_id', widget.e.id)
          .order('created_at', ascending: false)
          .limit(60);
      if (!mounted) return;
      setState(() => _posts = List<Map<String, dynamic>>.from(r));
      final mine = _posts!.where((p) => p['author'] == myId).firstOrNull;
      if (mine != null && _ctrl.text.isEmpty) _ctrl.text = mine['body'] as String? ?? '';
    } catch (e) {
      debugPrint('crew load failed: $e');
      if (mounted) setState(() => _posts = []);
    }
  }

  Future<void> _post() async {
    final body = _ctrl.text.trim();
    if (body.isEmpty || _busy) return;
    setState(() => _busy = true);
    try {
      await sb.from('crew_posts').upsert(
        {'event_id': widget.e.id, 'author': myId, 'body': body.length > 280 ? body.substring(0, 280) : body},
        onConflict: 'event_id,author',
      );
      HapticFeedback.lightImpact();
      store.crewN[widget.e.id] = (_posts?.where((p) => p['author'] != myId).length ?? 0) + 1;
      await _load();
    } catch (e) {
      debugPrint('crew post failed: $e');
      if (mounted) showErr(context);
    }
    if (mounted) setState(() => _busy = false);
  }

  Future<void> _delete(int id) async {
    try {
      await sb.from('crew_posts').delete().eq('id', id);
      _ctrl.clear();
      await _load();
    } catch (_) {
      if (mounted) showErr(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    final e = widget.e;
    final n = store.crewN[e.id] ?? 0;
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(t('crew_sub'), style: body(14.5, color: C.muted)),
      const SizedBox(height: 12),
      RsButton(t('share_wa'), icon: Icons.ios_share, onTap: () => shareEvent(e)),
      const SizedBox(height: 16),
      if (store.user == null) ...[
        if (n > 0) Text(t('crew_n', {'n': n}).toUpperCase(), style: mono(11.5, color: C.accent)),
        const SizedBox(height: 8),
        EmptyBox(t('crew_login')),
        const SizedBox(height: 10),
        RsButton(t('login'), primary: true, onTap: () {
          Navigator.of(context).popUntil((r) => r.isFirst);
          tabIndex.value = 4;
        }),
      ] else ...[
        TextField(
          controller: _ctrl,
          maxLength: 280,
          minLines: 2,
          maxLines: 4,
          style: body(15),
          cursorColor: C.accent,
          decoration: InputDecoration(hintText: t('crew_ph'), counterText: ''),
        ),
        const SizedBox(height: 8),
        RsButton(
          _busy ? '…' : ((_posts ?? []).any((p) => p['author'] == myId) ? t('crew_update') : t('crew_post')),
          primary: true,
          onTap: _busy ? null : _post,
        ),
        const SizedBox(height: 14),
        if (_posts == null) const Padding(padding: EdgeInsets.all(16), child: Center(child: CircularProgressIndicator())),
        if (_posts != null && _posts!.isEmpty) EmptyBox(t('crew_empty')),
        for (final p in _posts ?? const <Map<String, dynamic>>[]) _CrewTile(p, onDelete: () => _delete(p['id'] as int)),
      ],
    ]);
  }
}

class _CrewTile extends StatelessWidget {
  final Map<String, dynamic> p;
  final VoidCallback onDelete;
  const _CrewTile(this.p, {required this.onDelete});
  @override
  Widget build(BuildContext context) {
    final prof = p['profiles'] as Map<String, dynamic>?;
    final mine = p['author'] == myId;
    final name = mine ? t('you') : personName(prof);
    final city = prof?['city'] as String?;
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12),
      decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: C.line))),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Avatar(name, size: 38),
        const SizedBox(width: 12),
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('$name${prof?['verified'] == true ? ' ✓' : ''}', style: body(15, weight: FontWeight.w700)),
            Text('${city != null && city.isNotEmpty ? '$city · ' : ''}${ago(p['created_at'] as String?)}'.toUpperCase(),
                style: mono(10)),
            const SizedBox(height: 6),
            Text(p['body'] as String? ?? '', style: body(15)),
            const SizedBox(height: 8),
            mine
                ? RsButton(t('delete'), small: true, onTap: onDelete)
                : RsButton(t('write_dm'), small: true, icon: Icons.chat_bubble_outline,
                    onTap: () => openChat(context, p['author'] as String, personName(prof))),
          ]),
        ),
      ]),
    );
  }
}

// ---------------------------------------------------------------- Rides

class RidesSection extends StatefulWidget {
  final Ev e;
  const RidesSection(this.e, {super.key});
  @override
  State<RidesSection> createState() => _RidesSectionState();
}

class _RidesSectionState extends State<RidesSection> {
  List<Map<String, dynamic>>? _rides;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    if (store.user == null) return;
    try {
      final r = await sb
          .from('rides')
          .select('id,driver,from_city,departs_at,seats,note,profiles(handle,display_name,verified)')
          .eq('event_id', widget.e.id)
          .order('departs_at', ascending: true)
          .limit(50);
      if (mounted) setState(() => _rides = List<Map<String, dynamic>>.from(r));
    } catch (e) {
      debugPrint('rides load failed: $e');
      if (mounted) setState(() => _rides = []);
    }
  }

  Future<void> _offer() async {
    final ok = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: C.surface,
      shape: const RoundedRectangleBorder(),
      builder: (_) => _RideForm(widget.e),
    );
    if (ok == true) _load();
  }

  Future<void> _delete(int id) async {
    try {
      await sb.from('rides').delete().eq('id', id);
      _load();
    } catch (_) {
      if (mounted) showErr(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (store.user == null) {
      final n = store.ridesN[widget.e.id] ?? 0;
      return n > 0 ? Text(t('rides_n', {'n': n}).toUpperCase(), style: mono(11.5)) : EmptyBox(t('crew_login'));
    }
    final rides = _rides;
    final iDrive = (rides ?? []).any((r) => r['driver'] == myId);
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      if (rides == null) const Padding(padding: EdgeInsets.all(16), child: Center(child: CircularProgressIndicator())),
      if (rides != null && rides.isEmpty) EmptyBox(t('ride_empty')),
      for (final r in rides ?? const <Map<String, dynamic>>[])
        Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: C.line))),
          child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Icon(Icons.directions_car_outlined, color: C.muted, size: 22),
            const SizedBox(width: 12),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('${r['from_city']} → ${store.venues[widget.e.venueId]?.city ?? ''}',
                    style: body(15.5, weight: FontWeight.w700)),
                Text(
                    '${_when(r['departs_at'] as String?)} · ${t('ride_seats_n', {'n': r['seats']})} · '
                            '${r['driver'] == myId ? t('you') : personName(r['profiles'] as Map<String, dynamic>?)}'
                        .toUpperCase(),
                    style: mono(10.5)),
                if ((r['note'] as String?)?.isNotEmpty ?? false) ...[
                  const SizedBox(height: 4),
                  Text(r['note'] as String, style: body(14.5)),
                ],
                const SizedBox(height: 8),
                r['driver'] == myId
                    ? RsButton(t('delete'), small: true, onTap: () => _delete(r['id'] as int))
                    : RsButton(t('ride_ask'), small: true, icon: Icons.chat_bubble_outline,
                        onTap: () => openChat(context, r['driver'] as String,
                            personName(r['profiles'] as Map<String, dynamic>?))),
              ]),
            ),
          ]),
        ),
      if (!iDrive) ...[
        const SizedBox(height: 12),
        RsButton('+ ${t('ride_offer')}', onTap: _offer),
      ],
    ]);
  }

  String _when(String? iso) {
    if (iso == null) return '';
    final b = berlin(DateTime.parse(iso));
    return '${fmtDow(b)} ${b.day}.${b.month}. ${fmtTime(b)}';
  }
}

class _RideForm extends StatefulWidget {
  final Ev e;
  const _RideForm(this.e);
  @override
  State<_RideForm> createState() => _RideFormState();
}

class _RideFormState extends State<_RideForm> {
  final _from = TextEditingController(text: (store.profile?['city'] as String?) ?? '');
  final _note = TextEditingController();
  DateTime? _when; // Berlin wall-clock time
  int _seats = 3;
  bool _busy = false;

  @override
  void dispose() {
    _from.dispose();
    _note.dispose();
    super.dispose();
  }

  Future<void> _pick() async {
    final start = widget.e.start;
    final today = berlinToday();
    final first = DateTime(today.year, today.month, today.day);
    var init = DateTime(start.year, start.month, start.day);
    if (init.isBefore(first)) init = first;
    final d = await showDatePicker(
      context: context,
      initialDate: init,
      firstDate: first,
      lastDate: init.add(const Duration(days: 1)),
    );
    if (d == null || !mounted) return;
    final tm = await showTimePicker(
        context: context, initialTime: TimeOfDay(hour: (start.hour + 22) % 24, minute: 0));
    if (tm == null) return;
    setState(() => _when = DateTime(d.year, d.month, d.day, tm.hour, tm.minute));
  }

  Future<void> _save() async {
    final from = _from.text.trim();
    if (from.isEmpty || _when == null) {
      toast(context, t('fill_all'));
      return;
    }
    setState(() => _busy = true);
    try {
      await sb.from('rides').insert({
        'event_id': widget.e.id,
        'driver': myId,
        'from_city': from.length > 60 ? from.substring(0, 60) : from,
        'departs_at': berlinToUtc(_when!).toIso8601String(),
        'seats': _seats,
        'note': _note.text.trim().isEmpty ? null : _note.text.trim(),
      });
      if (mounted) Navigator.of(context).pop(true);
    } catch (e) {
      debugPrint('ride insert failed: $e');
      if (mounted) {
        setState(() => _busy = false);
        showErr(context);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.fromLTRB(18, 18, 18, 18 + MediaQuery.of(context).viewInsets.bottom),
      child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(t('ride_offer').toUpperCase(), style: display(22)),
        const SizedBox(height: 16),
        Text(t('ride_from').toUpperCase(), style: mono(10.5)),
        TextField(controller: _from, maxLength: 60, style: body(15.5), decoration: const InputDecoration(counterText: '')),
        const SizedBox(height: 12),
        Text(t('ride_when').toUpperCase(), style: mono(10.5)),
        const SizedBox(height: 6),
        RsButton(
          _when == null ? t('ride_pick') : '${fmtDow(_when!)} ${_when!.day}.${_when!.month}. ${fmtTime(_when!)}',
          icon: Icons.schedule,
          onTap: _pick,
        ),
        const SizedBox(height: 12),
        Text(t('ride_seats').toUpperCase(), style: mono(10.5)),
        Wrap(spacing: 6, children: [
          for (var i = 1; i <= 6; i++)
            ChoiceChip(
              label: Text('$i'),
              selected: _seats == i,
              onSelected: (_) => setState(() => _seats = i),
              selectedColor: C.accent,
            ),
        ]),
        const SizedBox(height: 12),
        Text(t('ride_note').toUpperCase(), style: mono(10.5)),
        TextField(controller: _note, maxLength: 200, style: body(15.5), decoration: const InputDecoration(counterText: '')),
        const SizedBox(height: 16),
        RsButton(_busy ? '…' : t('ride_offer'), primary: true, onTap: _busy ? null : _save),
      ]),
    );
  }
}

// ---------------------------------------------------------------- Chat

class ChatScreen extends StatefulWidget {
  final int conversationId;
  final String otherId, otherName;
  const ChatScreen({super.key, required this.conversationId, required this.otherId, required this.otherName});
  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  List<Map<String, dynamic>> _msgs = [];
  final _ctrl = TextEditingController();
  final _scroll = ScrollController();
  Timer? _poll;
  bool _sending = false;

  @override
  void initState() {
    super.initState();
    _load();
    _poll = Timer.periodic(const Duration(seconds: 5), (_) => _load());
  }

  @override
  void dispose() {
    _poll?.cancel();
    _ctrl.dispose();
    _scroll.dispose();
    store.loadInbox();
    super.dispose();
  }

  Future<void> _load() async {
    try {
      final r = await sb
          .from('messages')
          .select('id,sender,body,created_at')
          .eq('conversation_id', widget.conversationId)
          .order('created_at', ascending: true)
          .limit(300);
      if (!mounted) return;
      final grew = r.length != _msgs.length;
      setState(() => _msgs = List<Map<String, dynamic>>.from(r));
      if (grew) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (_scroll.hasClients) _scroll.jumpTo(_scroll.position.maxScrollExtent);
        });
        sb
            .from('conversation_members')
            .update({'last_read_at': DateTime.now().toUtc().toIso8601String()})
            .eq('conversation_id', widget.conversationId)
            .eq('profile_id', myId!)
            .then((_) {}, onError: (_) {});
      }
    } catch (e) {
      debugPrint('messages failed: $e');
    }
  }

  Future<void> _send() async {
    final b = _ctrl.text.trim();
    if (b.isEmpty || _sending) return;
    setState(() => _sending = true);
    try {
      await sb.from('messages').insert({
        'conversation_id': widget.conversationId,
        'sender': myId,
        'body': b.length > 2000 ? b.substring(0, 2000) : b,
      });
      _ctrl.clear();
      HapticFeedback.selectionClick();
      await _load();
    } catch (e) {
      debugPrint('send failed: $e');
      if (mounted) showErr(context);
    }
    if (mounted) setState(() => _sending = false);
  }

  Future<void> _block() async {
    final yes = await showDialog<bool>(
      context: context,
      builder: (c) => AlertDialog(
        backgroundColor: C.surface,
        content: Text(t('block_q'), style: body(15)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(c, false), child: Text(t('cancel'))),
          TextButton(onPressed: () => Navigator.pop(c, true), child: Text(t('block'), style: const TextStyle(color: C.accent))),
        ],
      ),
    );
    if (yes != true) return;
    try {
      await sb.from('blocks').insert({'blocker': myId, 'blocked': widget.otherId});
      if (!mounted) return;
      toast(context, t('blocked'));
      Navigator.of(context).pop();
    } catch (_) {
      if (mounted) showErr(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.otherName.toUpperCase(), style: mono(13, color: C.text)),
        actions: [
          PopupMenuButton<String>(
            color: C.surface,
            onSelected: (_) => _block(),
            itemBuilder: (_) => [PopupMenuItem(value: 'block', child: Text(t('block')))],
          ),
        ],
      ),
      body: Column(children: [
        Expanded(
          child: ListView.builder(
            controller: _scroll,
            padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
            itemCount: _msgs.length,
            itemBuilder: (_, i) {
              final m = _msgs[i];
              final me = m['sender'] == myId;
              return Align(
                alignment: me ? Alignment.centerRight : Alignment.centerLeft,
                child: Container(
                  constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.78),
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
                  decoration: BoxDecoration(
                    color: me ? C.accent : C.surface2,
                    border: me ? null : Border.all(color: C.line),
                  ),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                    Text(m['body'] as String? ?? '', style: body(15, color: me ? C.ink : C.text)),
                    const SizedBox(height: 3),
                    Text(fmtTime(berlin(DateTime.parse(m['created_at'] as String))),
                        style: mono(9, color: me ? C.ink : C.muted, spacing: 0.3)),
                  ]),
                ),
              );
            },
          ),
        ),
        Container(
          decoration: const BoxDecoration(color: C.bg, border: Border(top: BorderSide(color: C.line))),
          padding: const EdgeInsets.fromLTRB(12, 8, 8, 8),
          child: SafeArea(
            top: false,
            child: Row(children: [
              Expanded(
                child: TextField(
                  controller: _ctrl,
                  minLines: 1,
                  maxLines: 4,
                  style: body(15),
                  cursorColor: C.accent,
                  textInputAction: TextInputAction.send,
                  onSubmitted: (_) => _send(),
                  decoration: InputDecoration(hintText: t('chat_ph')),
                ),
              ),
              IconButton(
                tooltip: t('send'),
                onPressed: _sending ? null : _send,
                icon: const Icon(Icons.send, color: C.accent),
              ),
            ]),
          ),
        ),
      ]),
    );
  }
}
