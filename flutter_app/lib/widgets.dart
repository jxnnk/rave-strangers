// Shared building blocks of the NACHTSCHICHT design.
import 'package:flutter/foundation.dart';
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

/// Route to the venue in the phone's own maps app:
/// iPhone/iPad -> Apple Maps, Android -> Google Maps (app if installed, else browser).
String routeUrl(Venue v) {
  final p = defaultTargetPlatform;
  if (!kIsWeb && (p == TargetPlatform.iOS || p == TargetPlatform.macOS)) {
    return 'https://maps.apple.com/?daddr=${v.lat},${v.lon}&dirflg=d';
  }
  return 'https://www.google.com/maps/dir/?api=1&destination=${v.lat},${v.lon}';
}

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
    // Logo: RAVE STRNGRS (spoken and searchable as "Rave Strangers")
    return Semantics(
      label: 'Rave Strangers',
      child: ExcludeSemantics(
        child: Text.rich(TextSpan(children: [
          TextSpan(text: 'RAVE ', style: display(18)),
          TextSpan(text: 'STRNGRS', style: display(18, color: C.accent)),
        ])),
      ),
    );
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
        Expanded(child: Text(title.toUpperCase(), style: display(22))),
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
      Text(text, style: mono(10.5, color: hot ? C.accent : C.muted));
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
  final String? url; // profiles.avatar_url (Supabase Storage), falls vorhanden
  const Avatar(this.name, {super.key, this.size = 40, this.url});
  @override
  Widget build(BuildContext context) {
    final parts = name.trim().split(RegExp(r'\s+')).where((p) => p.isNotEmpty).toList();
    final ini = parts.isEmpty ? '?' : parts.take(2).map((p) => p[0].toUpperCase()).join();
    final letters = Text(ini, style: mono(size * 0.34, color: C.text));
    final u = url;
    return Container(
      width: size,
      height: size,
      alignment: Alignment.center,
      clipBehavior: Clip.hardEdge,
      decoration: BoxDecoration(color: C.surface2, border: Border.all(color: C.line2)),
      child: (u == null || u.isEmpty)
          ? letters
          : Image.network(
              u,
              width: size,
              height: size,
              fit: BoxFit.cover,
              cacheWidth: (size * 3).round(),
              errorBuilder: (_, __, ___) => letters,
            ),
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


/// "vor 5 Min" style relative time.
String ago(String? iso) {
  if (iso == null) return '';
  final d = DateTime.now().toUtc().difference(DateTime.parse(iso).toUtc());
  if (d.inMinutes < 1) return t('ago_now');
  if (d.inHours < 1) return t('ago_m', {'n': d.inMinutes});
  if (d.inDays < 1) return t('ago_h', {'n': d.inHours});
  return t('ago_d', {'n': d.inDays});
}

/// DE | EN toggle. Used in the Home header and in the profile.
class LangSwitch extends StatelessWidget {
  const LangSwitch({super.key});
  @override
  Widget build(BuildContext context) {
    Widget b(String code) => Material(
          color: appLang == code ? C.text : Colors.transparent,
          child: InkWell(
            onTap: () => store.setLang(code),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
              child: Text(code.toUpperCase(), style: mono(11, color: appLang == code ? C.bg : C.muted)),
            ),
          ),
        );
    return Semantics(
      label: t('language'),
      child: Container(
        decoration: BoxDecoration(border: Border.all(color: C.line2)),
        child: Row(mainAxisSize: MainAxisSize.min, children: [b('de'), b('en')]),
      ),
    );
  }
}

/// Small red counter on icons and tabs.
class Badge0 extends StatelessWidget {
  final int n;
  const Badge0(this.n, {super.key});
  @override
  Widget build(BuildContext context) {
    if (n <= 0) return const SizedBox.shrink();
    return Container(
      constraints: const BoxConstraints(minWidth: 17),
      height: 17,
      padding: const EdgeInsets.symmetric(horizontal: 4),
      alignment: Alignment.center,
      decoration: BoxDecoration(color: C.accent, borderRadius: BorderRadius.circular(9)),
      child: Text(n > 9 ? '9+' : '$n', style: mono(9.5, color: C.ink, spacing: 0)),
    );
  }
}


/// Highlight event as a red poster card (design Mix A+C).
class FlyerCard extends StatelessWidget {
  final Ev e;
  const FlyerCard(this.e, {super.key});
  static const _mon = ['JAN', 'FEB', 'MÄR', 'APR', 'MAI', 'JUN', 'JUL', 'AUG', 'SEP', 'OKT', 'NOV', 'DEZ'];
  @override
  Widget build(BuildContext context) {
    final v = store.venues[e.venueId];
    final crew = store.crewN[e.id] ?? 0;
    return Material(
      color: C.accent,
      child: InkWell(
        onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => EventDetail(e))),
        child: IntrinsicHeight(
          child: Row(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            Container(
              width: 84,
              decoration: const BoxDecoration(border: Border(right: BorderSide(color: C.ink, width: 3))),
              child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                Text('${e.start.day}', style: display(44, color: C.ink)),
                Text('${fmtDow(e.start).toUpperCase()} · ${_mon[e.start.month - 1]}', style: mono(10.5, color: C.ink, weight: FontWeight.w700)),
              ]),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(t('highlight').toUpperCase(), style: mono(10, color: C.ink, weight: FontWeight.w700)),
                  const SizedBox(height: 4),
                  Text(e.title.toUpperCase(), maxLines: 3, overflow: TextOverflow.ellipsis, style: display(28, color: C.ink)),
                  const SizedBox(height: 12),
                  Row(children: [
                    Expanded(
                      child: Text('${v?.name ?? ''} · ${e.timeLabel}',
                          maxLines: 1, overflow: TextOverflow.ellipsis, style: body(13.5, color: C.ink, weight: FontWeight.w700)),
                    ),
                    if (e.priceText != null) Text(e.priceText!, style: body(13.5, color: C.ink, weight: FontWeight.w700)),
                  ]),
                  if (crew > 0) ...[
                    const SizedBox(height: 4),
                    Text(t('crew_n', {'n': crew}), style: body(13, color: C.ink)),
                  ],
                ]),
              ),
            ),
          ]),
        ),
      ),
    );
  }
}

/// Most popular upcoming event (going count), first one on a tie.
Ev pickHighlight(List<Ev> l) {
  var best = l.first;
  for (final e in l) {
    if ((store.counts[e.id] ?? 0) > (store.counts[best.id] ?? 0)) best = e;
  }
  return best;
}

/// Links zu Nutzungsbedingungen und Datenschutz (unter der Zustimmung bei der Registrierung).
class LegalLinks extends StatelessWidget {
  const LegalLinks({super.key});
  @override
  Widget build(BuildContext context) {
    Widget link(String label, String url) => InkWell(
          onTap: () => openUrl(url),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 6),
            child: Text(label, style: body(13.5, color: C.muted).copyWith(decoration: TextDecoration.underline)),
          ),
        );
    return Padding(
      padding: const EdgeInsets.only(left: 48),
      child: Wrap(spacing: 16, children: [link(t('terms_p'), termsUrl), link(t('privacy_p'), privacyUrl)]),
    );
  }
}
