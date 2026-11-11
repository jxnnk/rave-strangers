import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';

import '../data.dart';
import '../strings.dart';
import '../theme.dart';
import '../widgets.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: store,
      builder: (context, _) {
        final today = berlinToday();
        final all = store.visibleEvents;
        final tonight = all.where((e) => e.day == today).take(8).toList();
        final next = all
            .where((e) => e.day.isAfter(today) && e.day.difference(today).inDays <= 7)
            .take(8)
            .toList();
        final name = (store.profile?['display_name'] as String?)?.split(' ').first;
        final heads = store.headlinesForLang();
        return SafeArea(
          bottom: false,
          child: RefreshIndicator(
            color: C.accent,
            backgroundColor: C.surface,
            onRefresh: store.load,
            child: ListView(
              padding: const EdgeInsets.only(bottom: 40),
              children: [
                const Padding(padding: EdgeInsets.fromLTRB(18, 14, 18, 14), child: Brand()),
                if (heads.isNotEmpty) Marquee(heads),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 18),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    const SizedBox(height: 22),
                    Kicker(t('kicker')),
                    const SizedBox(height: 10),
                    Text((name != null ? t('hi_name', {'n': name}) : t('hi')).toUpperCase(), style: display(32)),
                    if (store.loading && store.events.isEmpty)
                      const Padding(padding: EdgeInsets.all(40), child: Center(child: CircularProgressIndicator())),
                    if (store.error != null && store.events.isEmpty) ...[
                      EmptyBox(t('load_err')),
                      const SizedBox(height: 10),
                      RsButton(t('retry'), onTap: store.load),
                    ],
                    Section(1, t('tonight')),
                    if (tonight.isEmpty && !store.loading) EmptyBox(t('nothing_tonight')),
                    for (final e in tonight) EventRow(e),
                    Section(2, t('next_days')),
                    for (final e in next) EventRow(e),
                    const SizedBox(height: 12),
                    RsButton('${t('all_events')} →', onTap: () => tabIndex.value = 1),
                    if (store.posts.isNotEmpty) ...[
                      Section(3, t('news')),
                      for (final p in store.posts) _PostTile(p),
                    ],
                    if (heads.isNotEmpty) ...[
                      Section(store.posts.isNotEmpty ? 4 : 3, t('scene')),
                      for (final h in heads) _HeadlineTile(h),
                    ],
                  ]),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _PostTile extends StatelessWidget {
  final Post p;
  const _PostTile(this.p);
  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: p.link == null ? null : () => openUrl(p.link!),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: C.line))),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('${p.author ?? 'Rave Strangers'}${p.verified ? ' ✓' : ''}'.toUpperCase(), style: mono(10.5, color: C.accent)),
          const SizedBox(height: 6),
          Text(p.title, style: body(17, weight: FontWeight.w700)),
          if (p.body != null) ...[
            const SizedBox(height: 6),
            Text(p.body!, style: body(15, color: C.muted), maxLines: 4, overflow: TextOverflow.ellipsis),
          ],
        ]),
      ),
    );
  }
}

class _HeadlineTile extends StatelessWidget {
  final Headline h;
  const _HeadlineTile(this.h);
  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => openUrl(h.url),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: C.line))),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(h.source.toUpperCase(), style: mono(10.5)),
          const SizedBox(height: 4),
          Text('${h.title} ↗', style: body(15.5, weight: FontWeight.w600)),
        ]),
      ),
    );
  }
}

/// Red LED ticker with the latest headlines.
class Marquee extends StatefulWidget {
  final List<Headline> items;
  const Marquee(this.items, {super.key});
  @override
  State<Marquee> createState() => _MarqueeState();
}

class _MarqueeState extends State<Marquee> with SingleTickerProviderStateMixin {
  final _sc = ScrollController();
  late final Ticker _ticker;

  @override
  void initState() {
    super.initState();
    _ticker = createTicker((_) {
      if (!_sc.hasClients) return;
      final pos = _sc.position;
      final half = (pos.maxScrollExtent + pos.viewportDimension) / 2;
      if (pos.maxScrollExtent <= 0) return;
      var o = _sc.offset + 0.6;
      if (o >= half) o -= half;
      _sc.jumpTo(o);
    })
      ..start();
  }

  @override
  void dispose() {
    _ticker.dispose();
    _sc.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final items = [...widget.items, ...widget.items];
    return Container(
      height: 36,
      color: C.accent,
      child: SingleChildScrollView(
        controller: _sc,
        scrollDirection: Axis.horizontal,
        physics: const NeverScrollableScrollPhysics(),
        child: Row(children: [
          for (final h in items)
            GestureDetector(
              onTap: () => openUrl(h.url),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 18),
                child: Row(children: [
                  Text(h.source.toUpperCase(), style: mono(12, color: C.ink, weight: FontWeight.w800)),
                  const SizedBox(width: 10),
                  Text(h.title.toUpperCase(), style: mono(12, color: C.ink, spacing: 0.6)),
                  const SizedBox(width: 30),
                  Text('///', style: mono(12, color: const Color(0x990B0B0C))),
                ]),
              ),
            ),
        ]),
      ),
    );
  }
}
