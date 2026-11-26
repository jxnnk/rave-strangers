import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'data.dart';
import 'locate.dart';
import 'screens/community.dart';
import 'screens/events.dart';
import 'screens/home.dart';
import 'screens/map.dart';
import 'screens/profile.dart';
import 'screens/welcome.dart';
import 'strings.dart';
import 'theme.dart';
import 'widgets.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // Schriften liegen in assets/fonts (keine Anfrage an Google-Server, DSGVO + offline).
  GoogleFonts.config.allowRuntimeFetching = false;
  LicenseRegistry.addLicense(() async* {
    for (final f in ['anton', 'spacegrotesk']) {
      yield LicenseEntryWithLineBreaks(['google_fonts'], await rootBundle.loadString('assets/fonts/OFL-$f.txt'));
    }
  });
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
    systemNavigationBarColor: C.bg,
    systemNavigationBarIconBrightness: Brightness.light,
  ));
  await store.initLang();
  await Supabase.initialize(url: sbUrl, publishableKey: sbKey);
  store.init();
  runApp(const RaveStrangersApp());
}

class RaveStrangersApp extends StatelessWidget {
  const RaveStrangersApp({super.key});
  @override
  Widget build(BuildContext context) {
    // The key makes the whole app (incl. opened pages) switch language at once.
    return ListenableBuilder(
      listenable: store,
      builder: (context, _) => MaterialApp(
        key: ValueKey(appLang),
        title: 'Rave Strngrs',
        debugShowCheckedModeBanner: false,
        theme: buildTheme(),
        home: const Shell(),
      ),
    );
  }
}

class Shell extends StatefulWidget {
  const Shell({super.key});
  @override
  State<Shell> createState() => _ShellState();
}

class _ShellState extends State<Shell> with WidgetsBindingObserver {
  Timer? _poll;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    // badges (notifications, unread chats) stay fresh while the app is open
    _poll = Timer.periodic(const Duration(seconds: 60), (_) => store.loadInbox());
    // current city via GPS (asks once, then updates silently while the app is open)
    WidgetsBinding.instance.addPostFrameCallback((_) => autoLocate(context));
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      store.loadInbox();
      autoLocate(context);
    }
  }

  @override
  void dispose() {
    _poll?.cancel();
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: Listenable.merge([tabIndex, store]),
      // not const on purpose: the tabs must rebuild when data or language change
      builder: (context, _) => store.user == null && !store.welcomeDone
          ? const WelcomeScreen()
          : Scaffold(
        body: IndexedStack(
          index: tabIndex.value,
          children: [HomeScreen(), EventsScreen(), MapScreen(), CommunityScreen(), ProfileScreen()],
        ),
        bottomNavigationBar: _NavBar(tabIndex.value, store.unreadChats),
      ),
    );
  }
}

class _NavBar extends StatelessWidget {
  final int current, chatBadge;
  const _NavBar(this.current, this.chatBadge);

  @override
  Widget build(BuildContext context) {
    const icons = [Icons.home_outlined, Icons.calendar_today_outlined, Icons.place_outlined, Icons.groups_outlined, Icons.person_outline];
    const iconsOn = [Icons.home, Icons.calendar_today, Icons.place, Icons.groups, Icons.person];
    final labels = [t('tab_home'), t('tab_events'), t('tab_map'), t('tab_crew'), t('tab_me')];
    return Container(
      decoration: const BoxDecoration(color: C.bg, border: Border(top: BorderSide(color: C.line))),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 62,
          child: Row(children: [
            for (var i = 0; i < icons.length; i++)
              Expanded(
                child: Semantics(
                  selected: current == i,
                  button: true,
                  label: labels[i],
                  child: InkWell(
                    onTap: () {
                      HapticFeedback.selectionClick();
                      tabIndex.value = i;
                    },
                    child: Stack(alignment: Alignment.center, children: [
                      // red bar slides to the active tab
                      Positioned(
                        top: 0,
                        left: 18,
                        right: 18,
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 180),
                          height: 2,
                          color: current == i ? C.accent : Colors.transparent,
                        ),
                      ),
                      Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                        Stack(clipBehavior: Clip.none, children: [
                          Icon(current == i ? iconsOn[i] : icons[i], size: 22, color: current == i ? C.text : C.muted),
                          if (i == 3 && chatBadge > 0) Positioned(right: -10, top: -6, child: Badge0(chatBadge)),
                        ]),
                        const SizedBox(height: 4),
                        Text(labels[i].toUpperCase(),
                            style: mono(9, color: current == i ? C.text : C.muted, spacing: 0.8)),
                      ]),
                    ]),
                  ),
                ),
              ),
          ]),
        ),
      ),
    );
  }
}
