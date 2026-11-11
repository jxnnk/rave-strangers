import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'data.dart';
import 'screens/events.dart';
import 'screens/home.dart';
import 'screens/map.dart';
import 'screens/profile.dart';
import 'strings.dart';
import 'theme.dart';
import 'widgets.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
    systemNavigationBarColor: C.bg,
    systemNavigationBarIconBrightness: Brightness.light,
  ));
  await Supabase.initialize(url: sbUrl, anonKey: sbKey);
  store.init();
  runApp(const RaveStrangersApp());
}

class RaveStrangersApp extends StatelessWidget {
  const RaveStrangersApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Rave Strangers',
      debugShowCheckedModeBanner: false,
      theme: buildTheme(),
      home: const Shell(),
    );
  }
}

class Shell extends StatelessWidget {
  const Shell({super.key});
  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      // rebuild on language change too
      listenable: Listenable.merge([tabIndex, store]),
      builder: (context, _) => Scaffold(
        body: IndexedStack(
          index: tabIndex.value,
          children: const [HomeScreen(), EventsScreen(), MapScreen(), ProfileScreen()],
        ),
        bottomNavigationBar: const _NavBar(),
      ),
    );
  }
}

class _NavBar extends StatelessWidget {
  const _NavBar();
  @override
  Widget build(BuildContext context) {
    const icons = [Icons.home_outlined, Icons.calendar_today_outlined, Icons.place_outlined, Icons.person_outline];
    final labels = [t('tab_home'), t('tab_events'), t('tab_map'), t('tab_me')];
    return Container(
      decoration: const BoxDecoration(color: C.bg, border: Border(top: BorderSide(color: C.line))),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 60,
          child: Row(children: [
            for (var i = 0; i < 4; i++)
              Expanded(
                child: InkWell(
                  onTap: () {
                    HapticFeedback.selectionClick();
                    tabIndex.value = i;
                  },
                  child: Stack(alignment: Alignment.center, children: [
                    if (tabIndex.value == i)
                      Positioned(top: 0, left: 24, right: 24, child: Container(height: 2, color: C.accent)),
                    Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                      Icon(icons[i], size: 22, color: tabIndex.value == i ? C.text : C.muted),
                      const SizedBox(height: 4),
                      Text(labels[i].toUpperCase(),
                          style: mono(9.5, color: tabIndex.value == i ? C.text : C.muted, spacing: 1)),
                    ]),
                  ]),
                ),
              ),
          ]),
        ),
      ),
    );
  }
}
