// Shared building blocks of the NACHTSCHICHT design.
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import 'data.dart';
import 'screens/event_detail.dart';
import 'strings.dart';
import 'theme.dart';

/// Global tab index of the bottom navigation (0 Home, 1 Events, 2 Karte, 3 Profil).
final tabIndex = ValueNotifier<int>(0);

Future<void> openUrl(String url) async {
  try {
    await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
  } catch (_) {}
}

String routeUrl(Venue v) => 'https://www.google.com/maps/dir/?api=1&destination=${v.lat},${v.lon}';

void toast(BuildContext context, String msg) {
  ScaffoldMessenger.of(context)
    ..hideCurrentSnackBar()
    ..showSnackBar(SnackBar(content: Text(msg.toUpperCase())));
}

/// Shows a hint and jumps to the profile tab (login).
void askLogin(BuildContext context) {
  toast(context, t('login_need'));
  Navigator.of(context).popUntil((r) => r.isFirst);
  tabIndex.value = 3;
}

class Brand extends StatelessWidget {
  const Brand({super.key});
  @override
  Widget build(BuildContext context) {
    return Row(mainAxisSize: MainAxisSize.min, children: [
      Text('RAVE', style: display(15)),
      Transform(
        transform: Matrix4.skewX(-0.38),
        alignment: Alignment.center,
        child: Container(width: 3, height: 20, color: C.accent, margin: const EdgeInsets.symmetric(horizontal: 7)),
      ),
      Text('STRANGERS', style: display(15)),
    ]);
  }
}

class Kicker extends StatelessWidget {
  final String text;
  final Color color;
  const Kicker(this.text, {super.key, this.color = C.accent});
  @override
  Widget build(BuildContext context) => Text(text.toUpperCase(), style: mono(11, color: color, spacing: 1.6));
}

/// "01  TITLE" with a hairline above, like the web app's numbered sections.
class Section extends StatelessWidget {
  final int no;
  final String title;
  const Section(this.no, this.title, {super.key});
  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(top: 30, bottom: 6),
      padding: const EdgeInsets.only(top: 12),
      decoration: const BoxDecoration(border: Border(top: BorderSide(color: C.line))),
      child: Row(crossAxisAlignment: CrossAxisAlignment.baseline, textBaseline: TextBaseline.alphabetic, children: [
        Text(no.toString().padLeft(2, '0'), style: mono(11, color: C.accent)),
        const SizedBox(width: 10),
        Expanded(child: Text(title.toUpperCase(), style: display(18))),
      ]),
    );
  }
}

class Tag extends StatelessWidget {
  final String text;
  final bool hot;
  const Tag(this.text, {super.key, this.hot = false});
  @override
  Widget build(BuildContext context) =>
      Text('[ ${text.toUpperCase()} ]', style: mono(10.5, color: hot ? C.accent : C.muted));
}

class RsButton extends StatelessWidget {
  final String label;
  final VoidCallback? onTap;
  final bool primary, active, small;
  final IconData? icon;
  const RsButton(this.label,
      {super.key, this.onTap, this.primary = false, this.active = false, this.small = false, this.icon});
  @override
  Widget build(BuildContext context) {
    final fg = primary ? C.ink : (active ? C.accent : C.text);
    return Material(
      color: primary ? C.accent : Colors.transparent,
      child: InkWell(
        onTap: onTap,
        child: Container(
          height: small ? 38 : 48,
          padding: EdgeInsets.symmetric(horizontal: small ? 12 : 18),
          decoration: BoxDecoration(border: Border.all(color: primary || active ? C.accent : C.line2)),
          child: Row(mainAxisSize: MainAxisSize.min, children: [
            if (icon != null) ...[Icon(icon, size: 16, color: fg), const SizedBox(width: 8)],
            Text(label.toUpperCase(), style: mono(small ? 11 : 12, color: fg, spacing: 1.3)),
          ]),
        ),
      ),
    );
  }
}

class EmptyBox extends StatelessWidget {
  final String text;
  const EmptyBox(this.text, {super.key});
  @override
  Widget build(BuildContext context) => Container(
        margin: const EdgeInsets.only(top: 10),
        padding: const EdgeInsets.all(22),
        decoration: BoxDecoration(border: Border.all(color: C.line2)),
        child: Text(text, textAlign: TextAlign.center, style: body(15, color: C.muted)),
      );
}

class Stars extends StatelessWidget {
  final double value;
  final double size;
  const Stars(this.value, {super.key, this.size = 14});
  @override
  Widget build(BuildContext context) {
    final r = value.round();
    return Row(mainAxisSize: MainAxisSize.min, children: [
      for (var i = 1; i <= 5; i++)
        Text('★', style: TextStyle(fontSize: size, color: i <= r ? C.accent : C.line2, height: 1)),
    ]);
  }
}

class RatingLine extends StatelessWidget {
  final int venueId;
  const RatingLine(this.venueId, {super.key});
  @override
  Widget build(BuildContext context) {
    final r = store.ratings[venueId];
    if (r == null || r.n == 0) return Text(t('no_rating').toUpperCase(), style: mono(10.5));
    final avg = appLang == 'de' ? r.avg.toString().replaceAll('.', ',') : r.avg.toString();
    return Row(mainAxisSize: MainAxisSize.min, children: [
      Stars(r.avg),
      const SizedBox(width: 6),
      Text(avg, style: mono(12, color: C.text, weight: FontWeight.w700)),
      const SizedBox(width: 4),
      Text('(${r.n})', style: mono(12)),
    ]);
  }
}

class Avatar extends StatelessWidget {
  final String name;
  final double size;
  const Avatar(this.name, {super.key, this.size = 40});
  @override
  Widget build(BuildContext context) {
    final parts = name.trim().split(RegExp(r'\s+')).where((p) => p.isNotEmpty).toList();
    final ini = parts.isEmpty ? '?' : parts.take(2).map((p) => p[0].toUpperCase()).join();
    return Container(
      width: size,
      height: size,
      alignment: Alignment.center,
      decoration: BoxDecoration(color: C.surface2, border: Border.all(color: C.line2)),
      child: Text(ini, style: mono(size * 0.34, color: C.text)),
    );
  }
}

/// One line of the timetable: date column, title, meta, genres.
class EventRow extends StatelessWidget {
  final Ev e;
  const EventRow(this.e, {super.key});
  @override
  Widget build(BuildContext context) {
    final v = store.venues[e.venueId];
    final d = e.start;
    final n = store.counts[e.id] ?? 0;
    final goes = store.going.contains(e.id);
    final tix = e.ticketStatus == 'sold_out'
        ? t('tix_sold_out')
        : (e.ticketStatus == 'few' ? t('tix_few') : null);
    return InkWell(
      onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => EventDetail(e))),
      child: Container(
        padding: const EdgeInsets.fromLTRB(4, 14, 4, 14),
        decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: C.line))),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          SizedBox(
            width: 62,
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(fmtDow(d).toUpperCase(), style: mono(10.5, color: C.accent)),
              const SizedBox(height: 4),
              Text('${d.day}', style: display(28)),
              const SizedBox(height: 4),
              Text(fmtMon(d).toUpperCase(), style: mono(10.5)),
            ]),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(e.title, style: body(16.5, weight: FontWeight.w700)),
              const SizedBox(height: 6),
              Text('${e.timeLabel} · ${v?.name ?? ''} · ${v?.city ?? ''}'.toUpperCase(), style: mono(11, spacing: 0.5)),
              const SizedBox(height: 8),
              Wrap(spacing: 10, runSpacing: 4, children: [
                if (tix != null) Tag(tix, hot: true),
                for (final g in e.genres.take(3)) Tag(g),
              ]),
              if (n > 0) ...[
                const SizedBox(height: 6),
                Text('${goes ? '✓ ' : ''}${t('going_n', {'n': n})}'.toUpperCase(),
                    style: mono(10.5, color: goes ? C.accent : C.muted)),
              ],
            ]),
          ),
        ]),
      ),
    );
  }
}
