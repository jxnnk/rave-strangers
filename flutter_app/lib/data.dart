// Data layer: same Supabase project, tables and rules as the web app.
import 'dart:ui' as ui;

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'strings.dart';

const sbUrl = 'https://wnmxloykrnbrpvzxhnsb.supabase.co';
// Publishable key: meant to be public, the database is protected by row level security.
const sbKey = 'sb_publishable_4vHWXBP7d04RUXs7lOQ9nA_yys9gxdN';
const webUrl = 'https://jxnnk.github.io/rave-strangers/';
// Rechtstexte (statisch in app/legal/, auch als URLs für App Store Connect).
const privacyUrl = '${webUrl}legal/datenschutz.html';
const termsUrl = '${webUrl}legal/nutzungsbedingungen.html';
const imprintUrl = '${webUrl}legal/impressum.html';

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

/// Inverse of [berlin]: wall-clock time in Berlin -> UTC instant.
DateTime berlinToUtc(DateTime local) {
  final wall = DateTime.utc(local.year, local.month, local.day, local.hour, local.minute);
  for (final h in [1, 2]) {
    final u = wall.subtract(Duration(hours: h));
    if (berlin(u) == wall) return u;
  }
  return wall.subtract(const Duration(hours: 1));
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
/// Label, collective or event series (44 Label, UNREAL, Teletech ...).
class Org {
  final int id, upcoming;
  final String name, slug, kind;
  Org(this.id, this.name, this.slug, this.kind, this.upcoming);
}

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
  /// Preis in der App-Sprache ("VVK ab 35 €" -> "Presale from €35").
  String? get price => priceText == null ? null : localPrice(priceText!);

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
  /// 'future' (mehr als 1 h vorher), 'live' (läuft, bis 2 h nach Ende) oder 'past'.
  String get phase {
    final now = DateTime.now().toUtc();
    final end = endUtc ?? startUtc.add(const Duration(hours: 14));
    if (now.isBefore(startUtc.subtract(const Duration(hours: 1)))) return 'future';
    if (now.isBefore(end.add(const Duration(hours: 2)))) return 'live';
    return 'past';
  }

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
  Set<int> checkins = {}; // Events, bei denen ich vor Ort eingecheckt habe (DB 027)
  Set<int> myEvRev = {}; // Events, die ich schon bewertet habe
  /// Darf ich dieses Event bewerten? Dabei gewesen, angefangen, höchstens 3 Wochen her.
  bool canRate(Ev e) =>
      user != null && going.contains(e.id) && e.phase != 'future' &&
      DateTime.now().toUtc().difference(e.startUtc).inDays < 21;
  /// Vergangene Events, bei denen ich war und noch nicht bewertet habe (neueste zuerst).
  List<Ev> get toRate => events.where((e) => e.phase == 'past' && canRate(e) && !myEvRev.contains(e.id)).toList()
    ..sort((a, b) => b.startUtc.compareTo(a.startUtc));
  Future<String> checkIn(int eventId) async {
    final r = await sb.rpc('check_in', params: {'p_event': eventId}) as String?;
    if (r == 'ok') {
      checkins.add(eventId);
      if (!going.contains(eventId)) {
        going.add(eventId);
        counts[eventId] = (counts[eventId] ?? 0) + 1;
      }
      notifyListeners();
    }
    return r ?? 'err';
  }
  Set<int> saved = {};
  Set<int> alarms = {}; // bookmarks with remind = ticket alert
  Set<int> vfollow = {}; // followed clubs -> new dates land in notifications
  /// City you are in right now (from GPS while the app is open). Kept in memory only.
  String? hereCity;
  List<Org> orgs = [];
  Map<int, List<int>> eventOrgs = {}; // event id -> organizer ids
  Set<int> orgFollow = {};
  Org? orgById(int id) => orgs.where((o) => o.id == id).firstOrNull;
  List<Org> orgsOf(int eventId) => (eventOrgs[eventId] ?? const <int>[]).map(orgById).whereType<Org>().toList();
  List<Ev> eventsOfOrg(int orgId) => visibleEvents.where((e) => eventOrgs[e.id]?.contains(orgId) ?? false).toList();
  /// Start screen was dismissed with "look around without account" (saved on the device).
  bool welcomeDone = false;
  void skipWelcome() {
    welcomeDone = true;
    notifyListeners();
    SharedPreferences.getInstance().then((p) => p.setBool('welcome_done', true)).catchError((_) => false);
  }
  void setHere(String? c) {
    if (c == hereCity) return;
    hereCity = c;
    notifyListeners();
  }
  List<Map<String, dynamic>> attRows = []; // visible "going" rows (event_id, profile_id)
  /// People I follow: id -> profile (handle, display_name, verified, city).
  Map<String, Map<String, dynamic>> following = {};
  /// user_settings row (DB 022). Missing keys = default true.
  Map<String, dynamic> settings = {};
  bool setting(String k) => settings[k] != false;
  Map<int, int> counts = {};
  Map<int, int> crewN = {}, ridesN = {};
  List<Map<String, dynamic>> notes = [];
  int unreadChats = 0;
  int get unreadNotes => notes.where((n) => n['read_at'] == null).length;
  Map<String, dynamic>? profile;
  /// Profilbilder anderer Leute (id -> avatar_url), z. B. für die Chatliste.
  final Map<String, String?> avatars = {};
  Future<void> loadAvatars(Iterable<String?> ids) async {
    final todo = ids.whereType<String>().where((id) => !avatars.containsKey(id)).toSet().toList();
    if (todo.isEmpty) return;
    for (final id in todo) {
      avatars[id] = null;
    }
    try {
      final r = await sb.from('profiles').select('id,avatar_url').inFilter('id', todo);
      var any = false;
      for (final p in List<Map<String, dynamic>>.from(r)) {
        final u = p['avatar_url'] as String?;
        if (u != null && u.isNotEmpty) {
          avatars[p['id'] as String] = u;
          any = true;
        }
      }
      if (any) notifyListeners();
    } catch (e) {
      debugPrint('avatars failed: $e');
    }
  }

  bool loading = true;
  String? error;

  User? get user => sb.auth.currentUser;
  String get lang => appLang;

  void setLang(String l) {
    if (l == appLang) return;
    appLang = l;
    notifyListeners();
    SharedPreferences.getInstance().then((p) => p.setString('lang', l)).catchError((_) => false);
  }

  /// Saved choice first, otherwise the phone's language (German -> de, everything else -> en).
  Future<void> initLang() async {
    try {
      final p = await SharedPreferences.getInstance();
      welcomeDone = p.getBool('welcome_done') ?? false;
      final saved = p.getString('lang');
      if (saved == 'de' || saved == 'en') {
        appLang = saved!;
        return;
      }
    } catch (_) {}
    appLang = ui.PlatformDispatcher.instance.locale.languageCode == 'de' ? 'de' : 'en';
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
      // 14 Tage zurück: vergangene Events braucht es für Bewertungen (visibleEvents zeigt weiter nur kommende)
      final since = DateTime.now().toUtc().subtract(const Duration(days: 14)).toIso8601String();
      final r = await Future.wait<List<Map<String, dynamic>>>([
        sb.from('venues').select('id,name,city,address,lat,lon,approx,kind,rules'),
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
            .select('title,kind,body,link,created_at,profiles!posts_author_fkey(display_name,avatar_url,verified)')
            .eq('published', true)
            .order('created_at', ascending: false)
            .limit(10),
        sb.from('venue_ratings').select('venue_id,avg,n'),
      ]);
      try {
        final ol = await sb.rpc('organizer_list') as List;
        orgs = [for (final o in ol) Org(o['id'] as int, o['name'] as String, o['slug'] as String, o['kind'] as String, (o['upcoming'] as int?) ?? 0)];
        final eo = await sb.from('event_organizers').select('event_id,organizer_id');
        final m = <int, List<int>>{};
        for (final x in eo) {
          (m[x['event_id'] as int] ??= []).add(x['organizer_id'] as int);
        }
        eventOrgs = m;
      } catch (e) {
        debugPrint('organizers failed: $e');
      }
      try {
        final cc = await sb.rpc('crew_counts') as List;
        crewN = {for (final m in cc) (m['event_id'] as int): (m['crew'] as int?) ?? 0};
        ridesN = {for (final m in cc) (m['event_id'] as int): (m['rides'] as int?) ?? 0};
      } catch (_) {}
      venues = {
        for (final m in r[0])
          if ((m['rules'] as Map?)?['hidden'] != true) (m['id'] as int): Venue.fromMap(m)
      }; // hidden = checked, not a club
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
      checkins = {};
      myEvRev = {};
      going = {};
      saved = {};
      alarms = {};
      vfollow = {};
      orgFollow = {};
      following = {};
      attRows = [];
      settings = {};
      notes = [];
      unreadChats = 0;
      profile = null;
      notifyListeners();
      return;
    }
    try {
      final p = await sb.from('profiles').select().eq('id', u.id).maybeSingle();
      final att = await sb.from('attendance').select('event_id,profile_id');
      final bm = await sb.from('bookmarks').select('event_id,remind').eq('profile_id', u.id);
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
      attRows = List<Map<String, dynamic>>.from(att);
      saved = bm.map((b) => b['event_id'] as int).toSet();
      try {
        final ci = await sb.from('checkins').select('event_id').eq('profile_id', u.id);
        checkins = ci.map((x) => x['event_id'] as int).toSet();
        final mr = await sb.from('reviews').select('event_id').eq('author', u.id);
        myEvRev = mr.map((x) => x['event_id'] as int?).whereType<int>().toSet();
      } catch (e) {
        debugPrint('checkins/reviews failed: $e');
      }
      alarms = bm.where((b) => b['remind'] == true).map((b) => b['event_id'] as int).toSet();
      final fl = await sb
          .from('follows')
          .select('artist,profiles!follows_artist_fkey(id,handle,display_name,avatar_url,verified,city)')
          .eq('follower', u.id);
      following = {
        for (final f in fl)
          if (f['profiles'] != null) f['artist'] as String: Map<String, dynamic>.from(f['profiles'] as Map)
      };
      try {
        final of = await sb.from('organizer_follows').select('organizer_id').eq('profile_id', u.id);
        orgFollow = of.map((x) => x['organizer_id'] as int).toSet();
      } catch (_) {}
      final vf = await sb.from('venue_follows').select('venue_id').eq('profile_id', u.id);
      vfollow = vf.map((x) => x['venue_id'] as int).toSet();
      final st = await sb.from('user_settings').select().eq('profile_id', u.id).maybeSingle();
      settings = st ?? {};
    } catch (e) {
      debugPrint('loadMine failed: $e');
    }
    notifyListeners();
    await loadInbox();
  }

  /// Notifications and unread chats (badge numbers).
  Future<void> loadInbox() async {
    if (user == null) return;
    try {
      final r = await sb
          .from('notifications')
          .select('id,kind,event_id,venue_id,organizer_id,created_at,read_at')
          .order('created_at', ascending: false)
          .limit(50);
      notes = List<Map<String, dynamic>>.from(r);
    } catch (e) {
      debugPrint('notifications failed: $e');
    }
    try {
      final c = await sb.rpc('my_chats2') as List;
      unreadChats = c.fold<int>(0, (a, m) => a + ((m['unread'] as int?) ?? 0));
    } catch (_) {}
    notifyListeners();
  }

  Future<void> markNotesRead() async {
    if (user == null || unreadNotes == 0) return;
    final now = DateTime.now().toUtc().toIso8601String();
    for (final n in notes) {
      n['read_at'] ??= now;
    }
    notifyListeners();
    try {
      await sb.from('notifications').update({'read_at': now}).isFilter('read_at', null);
    } catch (e) {
      debugPrint('mark read failed: $e');
    }
  }

  /// People I follow who go to this event.
  List<Map<String, dynamic>> friendsAt(int eventId) => [
        for (final a in attRows)
          if (a['event_id'] == eventId && following.containsKey(a['profile_id'])) following[a['profile_id']]!
      ];

  Future<void> toggleFollow(String id, Map<String, dynamic> prof) async {
    final u = user;
    if (u == null || id == u.id) return;
    final on = following.containsKey(id);
    if (on) {
      following.remove(id);
    } else {
      following[id] = prof;
    }
    notifyListeners();
    try {
      if (on) {
        await sb.from('follows').delete().eq('follower', u.id).eq('artist', id);
      } else {
        await sb.from('follows').insert({'follower': u.id, 'artist': id});
      }
    } catch (e) {
      debugPrint('follow failed: $e');
      await loadMine();
    }
  }

  Future<void> toggleOrgFollow(int id) async {
    final u = user;
    if (u == null) return;
    final on = orgFollow.contains(id);
    if (on) {
      orgFollow.remove(id);
    } else {
      orgFollow.add(id);
    }
    notifyListeners();
    try {
      if (on) {
        await sb.from('organizer_follows').delete().eq('profile_id', u.id).eq('organizer_id', id);
      } else {
        await sb.from('organizer_follows').insert({'profile_id': u.id, 'organizer_id': id});
      }
    } catch (e) {
      debugPrint('org follow failed: $e');
      await loadMine();
    }
  }

  Future<void> saveSetting(String key, bool value) async {
    final u = user;
    if (u == null) return;
    settings[key] = value;
    notifyListeners();
    try {
      await sb.from('user_settings').upsert({'profile_id': u.id, key: value, 'updated_at': DateTime.now().toUtc().toIso8601String()});
    } catch (e) {
      debugPrint('setting failed: $e');
      await loadMine();
    }
  }

  Future<void> toggleVenueFollow(int venueId) async {
    final u = user;
    if (u == null) return;
    final on = vfollow.contains(venueId);
    on ? vfollow.remove(venueId) : vfollow.add(venueId);
    notifyListeners();
    try {
      if (on) {
        await sb.from('venue_follows').delete().eq('venue_id', venueId).eq('profile_id', u.id);
      } else {
        await sb.from('venue_follows').insert({'venue_id': venueId, 'profile_id': u.id});
      }
    } catch (e) {
      debugPrint('venue follow failed: $e');
      await loadMine();
    }
  }

  /// Ticket alert = bookmark with remind. Turning it on also saves the event.
  Future<bool> toggleAlarm(int id) async {
    final u = user;
    if (u == null) return false;
    final on = alarms.contains(id);
    if (on) {
      alarms.remove(id);
    } else {
      alarms.add(id);
      saved.add(id);
    }
    notifyListeners();
    try {
      await sb.from('bookmarks').upsert({'event_id': id, 'profile_id': u.id, 'remind': !on});
    } catch (e) {
      debugPrint('alarm failed: $e');
      await loadMine();
    }
    return true;
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
  Future<bool> toggleSaved(int id) {
    if (saved.contains(id)) alarms.remove(id);
    return _toggle('bookmarks', id, saved);
  }

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
        await sb.from(table).insert({
          'event_id': id,
          'profile_id': u.id,
          if (table == 'attendance') 'visible': setting('going_visible'),
        });
      }
    } catch (e) {
      debugPrint('toggle $table failed: $e');
      await loadMine();
    }
    return true;
  }
}

final store = Store();

/// Preise kommen auf Deutsch aus den Club-Seiten. Für Englisch die üblichen Wörter übersetzen.
String localPrice(String p) {
  if (appLang == 'de') return p;
  var s = p;
  const words = {
    r'\bVorverkauf\b': 'Presale',
    r'\bVVK\b': 'Presale',
    r'\bAbendkasse\b': 'At the door',
    r'\bAK\b': 'Door',
    r'\bEintritt frei\b': 'Free entry',
    r'\bkostenlos\b': 'free',
    r'\bermäßigt\b': 'reduced',
    r'\bab\b': 'from',
    r'\bbis\b': 'until',
    r'\bUhr\b': '',
  };
  words.forEach((k, v) => s = s.replaceAll(RegExp(k, caseSensitive: false), v));
  // 29,90 € -> €29.90
  s = s.replaceAllMapped(RegExp(r'(\d+)(?:,(\d{1,2}))?\s?€'), (m) => '€${m[1]}${m[2] != null ? '.${m[2]}' : ''}');
  return s.replaceAll(RegExp(r'\s{2,}'), ' ').trim();
}
