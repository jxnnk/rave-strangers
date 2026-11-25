// Crew tab: the USP in one place. Your chats + people who are looking for a crew right now.
import 'package:flutter/material.dart';

import '../data.dart';
import '../social.dart';
import '../strings.dart';
import '../theme.dart';
import '../widgets.dart';
import 'event_detail.dart';
import 'person.dart';

class CommunityScreen extends StatefulWidget {
  const CommunityScreen({super.key});
  @override
  State<CommunityScreen> createState() => _CommunityScreenState();
}

class _CommunityScreenState extends State<CommunityScreen> {
  List<Map<String, dynamic>>? _chats;
  List<Map<String, dynamic>>? _feed;
  String? _loadedFor;

  Future<void> _load() async {
    _loadedFor = store.user?.id;
    if (store.user == null) return;
    try {
      final r = await Future.wait([
        sb.rpc('my_chats2').then((v) => List<Map<String, dynamic>>.from(v as List)),
        sb
            .from('crew_posts')
            .select('id,author,body,created_at,event_id,profiles(handle,display_name,avatar_url,city,verified)')
            .order('created_at', ascending: false)
            .limit(80)
            .then((v) => List<Map<String, dynamic>>.from(v)),
      ]);
      if (!mounted) return;
      final upcoming = {for (final e in store.visibleEvents) e.id};
      setState(() {
        _chats = r[0];
        store.loadAvatars(r[0].map((c) => c['other_id'] as String?));
        _feed = r[1].where((p) => upcoming.contains(p['event_id'])).take(40).toList();
      });
    } catch (e) {
      debugPrint('community load failed: $e');
      if (mounted) setState(() => _chats ??= []);
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: Listenable.merge([store, tabIndex]),
      builder: (context, _) {
        // load when the tab is opened (and again after login/logout)
        if (tabIndex.value == 3 && _loadedFor != store.user?.id) {
          _loadedFor = store.user?.id; // avoid double loads before the frame
          WidgetsBinding.instance.addPostFrameCallback((_) => _load());
        }
        return SafeArea(
          bottom: false,
          child: RefreshIndicator(
            color: C.accent,
            backgroundColor: C.surface,
            onRefresh: () async {
              await _load();
              await store.loadInbox();
            },
            child: ListView(
              padding: const EdgeInsets.fromLTRB(18, 18, 18, 48),
              children: [
                Kicker(t('com_kicker')),
                const SizedBox(height: 10),
                Text(t('com_head').toUpperCase(), style: display(30)),
                if (store.user == null) ...[
                  const SizedBox(height: 20),
                  EmptyBox(t('com_login')),
                  const SizedBox(height: 12),
                  RsButton(t('login'), primary: true, onTap: () => tabIndex.value = 4),
                ] else ...[
                  Section(1, t('my_chats')),
                  if (_chats == null) const Padding(padding: EdgeInsets.all(20), child: Center(child: CircularProgressIndicator())),
                  if (_chats != null && _chats!.isEmpty) EmptyBox(t('no_chats')),
                  for (final c in _chats ?? const <Map<String, dynamic>>[]) _ChatTile(c, onBack: _load),
                  Section(2, t('crew_feed')),
                  if (_feed != null && _feed!.isEmpty) EmptyBox(t('crew_feed_empty')),
                  for (final p in _feed ?? const <Map<String, dynamic>>[]) _FeedTile(p),
                ],
              ],
            ),
          ),
        );
      },
    );
  }
}

class _ChatTile extends StatelessWidget {
  final Map<String, dynamic> c;
  final Future<void> Function() onBack;
  const _ChatTile(this.c, {required this.onBack});
  @override
  Widget build(BuildContext context) {
    final group = c['is_group'] == true;
    final name = chatTitle(c);
    final unread = (c['unread'] as int?) ?? 0;
    final last = c['last_body'] as String?;
    final mineLast = c['last_sender'] == myId;
    return InkWell(
      onTap: () async {
        await Navigator.of(context).push(MaterialPageRoute(
            builder: (_) => ChatScreen(
                conversationId: (c['conversation_id'] as num).toInt(),
                otherId: c['other_id'] as String?,
                otherName: name,
                isGroup: group,
                eventId: (c['event_id'] as num?)?.toInt())));
        onBack();
      },
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: C.line))),
        child: Row(children: [
          Avatar(name, size: 42, url: group ? null : store.avatars[c['other_id']]),
          const SizedBox(width: 12),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('$name${c['other_verified'] == true ? ' ✓' : ''}',
                  style: body(15.5, weight: unread > 0 ? FontWeight.w800 : FontWeight.w600)),
              const SizedBox(height: 3),
              Text(
                  last == null
                      ? (group ? t('members_n', {'n': c['members'] ?? 1}) : '…')
                      : '${mineLast ? '${t('you')}: ' : (group ? '${c['last_sender_name'] ?? ''}: ' : '')}${last.startsWith('[[event:') ? t('event_msg') : last}',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: body(14, color: unread > 0 ? C.text : C.muted)),
            ]),
          ),
          const SizedBox(width: 8),
          Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
            Text(ago(c['last_at'] as String?).toUpperCase(), style: mono(9.5)),
            const SizedBox(height: 4),
            Badge0(unread),
          ]),
        ]),
      ),
    );
  }
}

class _FeedTile extends StatelessWidget {
  final Map<String, dynamic> p;
  const _FeedTile(this.p);
  @override
  Widget build(BuildContext context) {
    final e = store.events.where((x) => x.id == p['event_id']).firstOrNull;
    final v = e == null ? null : store.venues[e.venueId];
    final prof = p['profiles'] as Map<String, dynamic>?;
    final mine = p['author'] == myId;
    final name = mine ? t('you') : personName(prof);
    return InkWell(
      onTap: e == null ? null : () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => EventDetail(e))),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: C.line))),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          InkWell(onTap: () => openPerson(context, p['author'] as String), child: Avatar(name, size: 38, url: prof?['avatar_url'] as String?)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              if (e != null)
                Text('${fmtDow(e.start)} ${e.start.day}.${e.start.month}. · ${e.title}${v != null ? ' · ${v.city}' : ''}'
                        .toUpperCase(),
                    maxLines: 1, overflow: TextOverflow.ellipsis, style: mono(10, color: C.accent)),
              const SizedBox(height: 4),
              Text(name, style: body(15, weight: FontWeight.w700)),
              const SizedBox(height: 3),
              Text(p['body'] as String? ?? '', style: body(14.5)),
              if (!mine) ...[
                const SizedBox(height: 8),
                RsButton(t('write_dm'), small: true, icon: Icons.chat_bubble_outline,
                    onTap: () => openChat(context, p['author'] as String, personName(prof))),
              ],
            ]),
          ),
        ]),
      ),
    );
  }
}
