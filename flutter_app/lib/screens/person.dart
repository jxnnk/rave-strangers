// Public profile of a person + follower/following lists.
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../data.dart';
import '../report.dart';
import '../social.dart';
import '../strings.dart';
import '../theme.dart';
import '../widgets.dart';

void openPerson(BuildContext context, String id) {
  Navigator.of(context).push(MaterialPageRoute(builder: (_) => PersonScreen(id)));
}

Future<int> _count(String col, String id) async {
  try {
    final r = await sb.from('follows').select(col).eq(col, id).count(CountOption.exact);
    return r.count;
  } catch (_) {
    return 0;
  }
}

/// Followers and following count, tappable.
class FollowStats extends StatefulWidget {
  final String id;
  const FollowStats(this.id, {super.key});
  @override
  State<FollowStats> createState() => _FollowStatsState();
}

class _FollowStatsState extends State<FollowStats> {
  int? _followers, _following;
  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void didUpdateWidget(covariant FollowStats old) {
    super.didUpdateWidget(old);
    if (old.id != widget.id) _load();
  }

  Future<void> _load() async {
    final a = await _count('artist', widget.id);
    final b = await _count('follower', widget.id);
    if (mounted) {
      setState(() {
        _followers = a;
        _following = b;
      });
    }
  }

  Widget _stat(String n, String label, bool followers) => Expanded(
        child: InkWell(
          onTap: () => Navigator.of(context)
              .push(MaterialPageRoute(builder: (_) => FollowListScreen(widget.id, followers: followers))),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 12),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(n, style: display(28)),
              Text(label, style: body(13, color: C.muted)),
            ]),
          ),
        ),
      );

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(border: Border.symmetric(horizontal: BorderSide(color: C.line))),
      child: Row(children: [
        _stat('${_followers ?? '–'}', t('followers'), true),
        _stat('${_following ?? '–'}', t('following'), false),
      ]),
    );
  }
}

class PersonScreen extends StatefulWidget {
  final String id;
  const PersonScreen(this.id, {super.key});
  @override
  State<PersonScreen> createState() => _PersonScreenState();
}

class _PersonScreenState extends State<PersonScreen> {
  Map<String, dynamic>? _p;
  List<int> _goes = [];
  bool _loaded = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final p = await sb
          .from('profiles')
          .select('id,handle,display_name,avatar_url,city,bio,verified,role')
          .eq('id', widget.id)
          .maybeSingle();
      final a =
          store.user == null ? <dynamic>[] : await sb.from('attendance').select('event_id').eq('profile_id', widget.id);
      if (!mounted) return;
      setState(() {
        _p = p;
        _goes = [for (final x in a) x['event_id'] as int];
        _loaded = true;
      });
    } catch (_) {
      if (mounted) setState(() => _loaded = true);
    }
  }

  Future<void> _block(String id) async {
    if (store.user == null) {
      askLogin(context);
      return;
    }
    final yes = await showDialog<bool>(
      context: context,
      builder: (c) => AlertDialog(
        backgroundColor: C.surface,
        content: Text(t('block_q'), style: body(15)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(c, false), child: Text(t('cancel'))),
          TextButton(
              onPressed: () => Navigator.pop(c, true),
              child: Text(t('block'), style: const TextStyle(color: C.accent))),
        ],
      ),
    );
    if (yes != true) return;
    try {
      await sb.from('blocks').insert({'blocker': myId, 'blocked': id});
      if (!mounted) return;
      toast(context, t('blocked'));
      Navigator.of(context).pop();
    } catch (_) {
      if (mounted) toast(context, t('err'));
    }
  }

  @override
  Widget build(BuildContext context) {
    final p = _p;
    return Scaffold(
      appBar: AppBar(actions: [
        if (p != null && p['id'] != myId)
          PopupMenuButton<String>(
            color: C.surface,
            onSelected: (v) => v == 'block'
                ? _block(p['id'] as String)
                : reportContent(context,
                    kind: 'profile',
                    targetUser: p['id'] as String,
                    snippet: [p['display_name'], p['handle'], p['bio']].whereType<String>().join(' · ')),
            itemBuilder: (_) => [
              PopupMenuItem(value: 'report', child: Text(t('report_profile'))),
              PopupMenuItem(value: 'block', child: Text(t('block'))),
            ],
          ),
      ]),
      body: !_loaded
          ? const Center(child: CircularProgressIndicator())
          : p == null
              ? Center(child: Text(t('err'), style: body(15)))
              : ListenableBuilder(
                  listenable: store,
                  builder: (context, _) {
                    final me = p['id'] == myId;
                    final name = personName(p);
                    final follows = store.following.containsKey(p['id']);
                    final events = store.visibleEvents.where((e) => _goes.contains(e.id)).toList();
                    return ListView(padding: const EdgeInsets.fromLTRB(18, 4, 18, 48), children: [
                      Row(children: [
                        Avatar(name, size: 64, url: p['avatar_url'] as String?),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Text('${name.toUpperCase()}${p['verified'] == true ? ' ✓' : ''}', style: display(26)),
                            Text(
                                '@${p['handle']}${(p['city'] as String?)?.isNotEmpty ?? false ? ' · ${p['city']}' : ''}',
                                style: body(14, color: C.muted)),
                          ]),
                        ),
                      ]),
                      if ((p['bio'] as String?)?.isNotEmpty ?? false) ...[
                        const SizedBox(height: 14),
                        Text(p['bio'] as String, style: body(15.5)),
                      ],
                      const SizedBox(height: 16),
                      FollowStats(p['id'] as String),
                      if (!me) ...[
                        const SizedBox(height: 14),
                        Wrap(spacing: 8, runSpacing: 8, children: [
                          RsButton(follows ? '✓ ${t('following_btn')}' : '+ ${t('follow')}',
                              primary: !follows, active: follows, onTap: () {
                            if (store.user == null) {
                              askLogin(context);
                              return;
                            }
                            store.toggleFollow(p['id'] as String, Map<String, dynamic>.from(p));
                          }),
                          RsButton(t('write_dm'),
                              icon: Icons.chat_bubble_outline, onTap: () => openChat(context, p['id'] as String, name)),
                        ]),
                      ],
                      Section(1, t('goes_to')),
                      if (events.isEmpty) EmptyBox(store.user == null ? t('crew_login') : t('none_yet')),
                      for (final e in events) EventRow(e),
                    ]);
                  },
                ),
    );
  }
}

class FollowListScreen extends StatefulWidget {
  final String id;
  final bool followers;
  const FollowListScreen(this.id, {super.key, required this.followers});
  @override
  State<FollowListScreen> createState() => _FollowListScreenState();
}

class _FollowListScreenState extends State<FollowListScreen> {
  List<Map<String, dynamic>>? _rows;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final r = widget.followers
          ? await sb
              .from('follows')
              .select('follower,profiles!follows_follower_fkey(id,handle,display_name,avatar_url,verified,city)')
              .eq('artist', widget.id)
              .limit(500)
          : await sb
              .from('follows')
              .select('artist,profiles!follows_artist_fkey(id,handle,display_name,avatar_url,verified,city)')
              .eq('follower', widget.id)
              .limit(500);
      if (mounted) {
        setState(() => _rows = [
              for (final x in r)
                if (x['profiles'] != null) Map<String, dynamic>.from(x['profiles'] as Map)
            ]);
      }
    } catch (_) {
      if (mounted) setState(() => _rows = []);
    }
  }

  @override
  Widget build(BuildContext context) {
    final rows = _rows;
    return Scaffold(
      appBar:
          AppBar(title: Text((widget.followers ? t('followers') : t('following')).toUpperCase(), style: display(18))),
      body: rows == null
          ? const Center(child: CircularProgressIndicator())
          : ListView(padding: const EdgeInsets.all(18), children: [
              if (rows.isEmpty) EmptyBox(t('none_yet')),
              for (final p in rows)
                InkWell(
                  onTap: () => openPerson(context, p['id'] as String),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: C.line))),
                    child: Row(children: [
                      Avatar(personName(p), size: 40, url: p['avatar_url'] as String?),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Text('${personName(p)}${p['verified'] == true ? ' ✓' : ''}',
                              style: body(15.5, weight: FontWeight.w700)),
                          Text('@${p['handle']}', style: body(13, color: C.muted)),
                        ]),
                      ),
                    ]),
                  ),
                ),
            ]),
    );
  }
}
