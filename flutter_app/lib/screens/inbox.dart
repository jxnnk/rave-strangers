// Notifications: ticket release, new dates at followed clubs, reminder the day before.
import 'package:flutter/material.dart';

import '../data.dart';
import '../strings.dart';
import '../theme.dart';
import '../widgets.dart';
import 'event_detail.dart';

class BellButton extends StatelessWidget {
  const BellButton({super.key});
  @override
  Widget build(BuildContext context) {
    final n = store.unreadNotes;
    return IconButton(
      tooltip: t('inbox_t'),
      onPressed: () {
        if (store.user == null) return askLogin(context);
        Navigator.of(context).push(MaterialPageRoute(builder: (_) => const InboxScreen()));
      },
      icon: Stack(clipBehavior: Clip.none, children: [
        Icon(n > 0 ? Icons.notifications : Icons.notifications_none, color: C.text, size: 24),
        if (n > 0) Positioned(right: -6, top: -5, child: Badge0(n)),
      ]),
    );
  }
}

class InboxScreen extends StatefulWidget {
  const InboxScreen({super.key});
  @override
  State<InboxScreen> createState() => _InboxScreenState();
}

class _InboxScreenState extends State<InboxScreen> {
  @override
  void initState() {
    super.initState();
    store.loadInbox().then((_) {
      // shown once as unread (red line), marked read a moment later
      Future.delayed(const Duration(seconds: 2), store.markNotesRead);
    });
  }

  String _text(Map<String, dynamic> n) {
    final e = store.events.where((x) => x.id == n['event_id']).firstOrNull;
    final v = store.venues[n['venue_id']];
    final title = e?.title ?? '…';
    return switch (n['kind']) {
      'tickets' => t('n_tickets', {'e': title}),
      'new_event' when n['organizer_id'] != null =>
        t('n_new_org', {'o': store.orgById(n['organizer_id'] as int)?.name ?? '', 'e': title}),
      'new_event' => t('n_new', {'v': v?.name ?? '', 'e': title}),
      'review' => t('n_review', {'e': title}),
      _ => t('n_rem', {'e': title}),
    };
  }

  IconData _icon(String? k) => switch (k) {
        'tickets' => Icons.confirmation_number_outlined,
        'new_event' => Icons.fiber_new_outlined,
        'review' => Icons.star_outline,
        _ => Icons.alarm,
      };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(t('inbox_t').toUpperCase(), style: mono(13, color: C.text))),
      body: ListenableBuilder(
        listenable: store,
        builder: (context, _) {
          final notes = store.notes;
          return RefreshIndicator(
            color: C.accent,
            backgroundColor: C.surface,
            onRefresh: store.loadInbox,
            child: ListView(
              padding: const EdgeInsets.fromLTRB(18, 8, 18, 40),
              children: [
                if (notes.isEmpty) EmptyBox(t('inbox_empty')),
                for (final n in notes)
                  InkWell(
                    onTap: () {
                      final e = store.events.where((x) => x.id == n['event_id']).firstOrNull;
                      if (e != null) Navigator.of(context).push(MaterialPageRoute(builder: (_) => EventDetail(e)));
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      decoration: BoxDecoration(
                        border: Border(
                          bottom: const BorderSide(color: C.line),
                          left: BorderSide(color: n['read_at'] == null ? C.accent : Colors.transparent, width: 3),
                        ),
                      ),
                      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        const SizedBox(width: 10),
                        Icon(_icon(n['kind'] as String?), color: n['kind'] == 'tickets' ? C.accent : C.muted, size: 22),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Text(_text(n), style: body(15.5, weight: FontWeight.w600)),
                            const SizedBox(height: 4),
                            Text(ago(n['created_at'] as String?).toUpperCase(), style: mono(10.5)),
                          ]),
                        ),
                      ]),
                    ),
                  ),
                const SizedBox(height: 24),
                Text(t('push_soon'), style: body(13, color: C.muted)),
              ],
            ),
          );
        },
      ),
    );
  }
}
