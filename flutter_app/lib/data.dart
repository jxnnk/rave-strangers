// Data layer: same Supabase project, tables and rules as the web app.
import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'strings.dart';

const sbUrl = 'https://wnmxloykrnbrpvzxhnsb.supabase.co';
// Publishable key: meant to be public, the database is protected by row level security.
const sbKey = 'sb_publishable_4vHWXBP7d04RUXs7lOQ9nA_yys9gxdN';
const webUrl = 'https://jxnnk.github.io/rave-strangers/';

SupabaseClient get sb => Supabase.instance.client;

const genres = ['Techno', 'Hard Techno', 'Acid', 'Trance', 'House', 'Minimal', 'Drum & Bass', 'Electronic'];

/// Festivals and temporary venues only show this many days before they start.
const leadDays = 60;

// ---------- Berlin time (CET/CEST), independent of the phone's time zone ----------
DateTime _lastSunday(int year, int month) {
  var d = DateTime.utc(year, month + 1, 0);
  while (d.weekday != DateTime.sunday) {
    d = d.subtract(const Duration(days: 1));
  }
  return d;
}

/// Returns a DateTime whose fields (year, month, day, hour…) are Berlin local time.
DateTime berlin(DateTime t) {
  final u = t.toUtc();
  final start = _lastSunday(u.year, 3).add(const Duration(hours: 1));
  final end = _lastSunday(u.year, 10).add(const Duration(hours: 1));
  final dst = !u.isBefore(start) && u.isBefore(end);
  return u.add(Duration(hours: dst ? 2 : 1));
}

DateTime dayKey(DateTime b) => DateTime.utc(b.year, b.month, b.day);
DateTime berlinToday() => dayKey(berlin(DateTime.now()));

const _wdDe = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const _wdEn = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const _wdLongDe = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
const _wdLongEn = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const _moDe = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
const _moEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const _moLongDe = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const _moLongEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

String fmtDow(DateTime b) => (appLang == 'de' ? _wdDe : _wdEn)[b.weekday - 1];
String fmtMon(DateTime b) => (appLang == 'de' ? _moDe : _moEn)[b.month - 1];
String fmtTime(DateTime b) => '${b.hour.toString().padLeft(2, '0')}:${b.minute.toString().padLeft(2, '0')}';
String fmtLong(DateTime b) => appLang == 'de'
    ? '${_wdLongDe[b.weekday - 1]}, ${b.day}. ${_moLongDe[b.month - 1]}'
    : '${_wdLongEn[b.weekday - 1]}, ${b.day} ${_moLongEn[b.month - 1]}';

// ---------- Models ----------
class Venue {
  final int id;
  final String name, city, address, kind;
  final double lat, lon;
  final bool approx;
  Venue.fromMap(Map<String, dynamic> m)
      : id = m['id'] as int,
        name = (m['name'] ?? '') as String,
        city = (m['city'] ?? '') as String,
        address = (m['address'] ?? '') as String,
        kind = (m['kind'] ?? 'club') as String,
        lat = (m['lat'] as num).toDouble(),
        lon = (m['lon'] as num).toDouble(),
        approx = m['approx'] == true;
}

class Ev {
  final int id, venueId;
  final String title, kind;
  final DateTime startUtc;
  final DateTime? endUtc;
  final bool timeKnown;
  final List<String> genres, lineup;
  final int lineupMore;
  final String? ticketUrl, sourceUrl, priceText, ticketStatus;

  Ev.fromMap(Map<String, dynamic> m)
      : id = m['id'] as int,
        venueId = m['venue_id'] as int,
        title = (m['title'] ?? '') as String,
        kind = (m['kind'] ?? 'club') as String,
        startUtc = DateTime.parse(m['starts_at'] as String).toUtc(),
        endUtc = m['ends_at'] == null ? null : DateTime.parse(m['ends_at'] as String).toUtc(),
        timeKnown = m['time_known'] != false,
        genres = ((m['genres'] as List?) ?? const []).map((x) => x.toString()).toList(),
        lineup = _lineup(m['event_lineup']),
        lineupMore = (m['lineup_more'] as int?) ?? 0,
        ticketUrl = _url(m['ticket_url']),
        sourceUrl = _url(m['source_url']),
        priceText = m['price_text'] as String?,
        ticketStatus = m['ticket_status'] as String?;

  static List<String> _lineup(dynamic raw) {
    final rows = ((raw as List?) ?? const []).map((x) => Map<String, dynamic>.from(x as Map)).toList();
    rows.sort((a, b) => ((a['position'] as int?) ?? 0).compareTo((b['position'] as int?) ?? 0));
    return rows.map((r) => (r['name'] ?? '').toString()).where((n) => n.isNotEmpty).toList();
  }

  static String? _url(dynamic u) {
    final s = u?.toString();
    return (s != null && s.startsWith('http')) ? s : null;
  }

  DateTime get start => berlin(startUtc);
  DateTime get day => dayKey(start);
  bool get isUpcoming => (endUtc ?? startUtc.add(const Duration(hours: 12))).isAfter(DateTime.now().toUtc());
  String get timeLabel => timeKnown ? fmtTime(start) : t('tba');
}

class Headline {
  final String url, source, title, lang;
  Headline.fromMap(Map<String, dynamic> m)
      : url = (m['url'] ?? '') as String,
        source = (m['source'] ?? '') as String,
        title = (m['title'] ?? '') as String,
        lang = (m['lang'] ?? 'en') as String;
}

class Post {
  final String title, kind;
  final String? body, link, author;
  final bool verified;
  final DateTime created;
  Post.fromMap(Map<String, dynamic> m)
      : title = (m['title'] ?? '') as String,
        kind = (m['kind'] ?? 'news') as String,
        body = m['body'] as String?,
        link = m['link'] as String?,
        author = (m['profiles'] is Map) ? (m['profiles']['display_name'] as String?) : null,
        verified = (m['profiles'] is Map) && m['profiles']['verified'] == true,
        created = DateTime.parse(m['created_at'] as String);
}

class Rating {
  final double avg;
  final int n;
  Rating(this.avg, this.n);
}

// ---------- Store ----------
class Store extends ChangeNotifier {
  Map<int, Venue> venues = {};
  List<Ev> events = [];
  Map<int, Rating> ratings = {};
  List<Headline> headlines = [];
  List<Post> posts = [];
  Set<int> going = {};
  Set<int> saved = {};
  Map<int, int> counts = {};
  Map<String, dynamic>? profile;
  bool loading = true;
  String? error;

  User? get user => sb.auth.currentUser;
  String get lang => appLang;

  void setLang(String l) {
    appLang = l;
    notifyListeners();
  }

  Future<void> init() async {
    sb.auth.onAuthStateChange.listen((_) => loadMine());
    await load();
  }

  Future<void> load() async {
    loading = true;
    error = null;
    notifyListeners();
    try {
      final since = DateTime.now().toUtc().subtract(const Duration(days: 1)).toIso8601String();
      final r = await Future.wait<List<Map<String, dynamic>>>([
        sb.from('venues').select('id,name,city,address,lat,lon,approx,kind'),
        sb
            .from('events')
            .select('id,venue_id,title,starts_at,ends_at,time_known,kind,genres,ticket_url,source_url,'
                'lineup_more,price_text,ticket_status,event_lineup(position,name)')
            .eq('status', 'published')
            .gte('starts_at', since)
            .order('starts_at', ascending: true),
        sb.from('headlines').select('url,source,title,lang').order('published_at', ascending: false).limit(40),
        sb
            .from('posts')
            .select('title,kind,body,link,created_at,profiles!posts_author_fkey(display_name,verified)')
            .eq('published', true)
            .order('created_at', ascending: false)
            .limit(10),
        sb.from('venue_ratings').select('venue_id,avg,n'),
      ]);
      venues = {for (final m in r[0]) (m['id'] as int): Venue.fromMap(m)};
      events = r[1].map(Ev.fromMap).where((e) => venues.containsKey(e.venueId)).toList();
      headlines = r[2].map(Headline.fromMap).toList();
      posts = r[3].map(Post.fromMap).toList();
      ratings = {
        for (final m in r[4])
          (m['venue_id'] as int): Rating(((m['avg'] as num?) ?? 0).toDouble(), (m['n'] as int?) ?? 0)
      };
    } catch (e) {
      error = '$e';
    }
    loading = false;
    notifyListeners();
    await loadMine();
  }

  Future<void> loadMine() async {
    final u = user;
    if (u == null) {
      going = {};
      saved = {};
      counts = {};
      profile = null;
      notifyListeners();
      return;
    }
    try {
      final p = await sb.from('profiles').select().eq('id', u.id).maybeSingle();
      final att = await sb.from('attendance').select('event_id,profile_id');
      final bm = await sb.from('bookmarks').select('event_id').eq('profile_id', u.id);
      profile = p;
      final c = <int, int>{};
      final g = <int>{};
      for (final a in att) {
        final id = a['event_id'] as int;
        c[id] = (c[id] ?? 0) + 1;
        if (a['profile_id'] == u.id) g.add(id);
      }
      counts = c;
      going = g;
      saved = bm.map((b) => b['event_id'] as int).toSet();
    } catch (e) {
      debugPrint('loadMine failed: $e');
    }
    notifyListeners();
  }

  /// Events that should be visible: upcoming, and temporary venues only shortly before.
  List<Ev> get visibleEvents {
    final today = berlinToday();
    return events.where((e) {
      if (!e.isUpcoming) return false;
      final v = venues[e.venueId];
      if (v != null && v.kind != 'club' && e.day.difference(today).inDays > leadDays) return false;
      return true;
    }).toList();
  }

  List<Ev> eventsAt(int venueId) => visibleEvents.where((e) => e.venueId == venueId).toList();

  List<String> get cities {
    final s = venues.values.map((v) => v.city).where((c) => c.isNotEmpty).toSet().toList();
    s.sort();
    return s;
  }

  List<Headline> headlinesForLang() {
    final mine = headlines.where((h) => h.lang == appLang).take(8).toList();
    if (mine.length < 5) mine.addAll(headlines.where((h) => h.lang != appLang).take(5 - mine.length));
    return mine;
  }

  Future<bool> toggleGoing(int id) => _toggle('attendance', id, going, countsToo: true);
  Future<bool> toggleSaved(int id) => _toggle('bookmarks', id, saved);

  Future<bool> _toggle(String table, int id, Set<int> set, {bool countsToo = false}) async {
    final u = user;
    if (u == null) return false;
    final on = set.contains(id);
    if (on) {
      set.remove(id);
      if (countsToo) {
        final n = (counts[id] ?? 1) - 1;
        counts[id] = n < 0 ? 0 : n;
      }
    } else {
      set.add(id);
      if (countsToo) counts[id] = (counts[id] ?? 0) + 1;
    }
    notifyListeners();
    try {
      if (on) {
        await sb.from(table).delete().eq('event_id', id).eq('profile_id', u.id);
      } else {
        await sb.from(table).insert({'event_id': id, 'profile_id': u.id});
      }
    } catch (e) {
      debugPrint('toggle $table failed: $e');
      await loadMine();
    }
    return true;
  }
}

final store = Store();
