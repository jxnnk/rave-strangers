// Labels, collectives, event series: page with upcoming dates (where and when), follow, search list.
import 'package:flutter/material.dart';

import '../data.dart';
import '../strings.dart';
import '../theme.dart';
import '../widgets.dart';

String orgKind(String k) => t('org_$k');

void openOrg(BuildContext context, Org o) =>
    Navigator.of(context).push(MaterialPageRoute(builder: (_) => OrganizerScreen(o.id)));

/// "Veranstaltet von" chips on the event page.
class OrgChips extends StatelessWidget {
  final Ev e;
  const OrgChips(this.e, {super.key});
  @override
  Widget build(BuildContext context) {
    final os = store.orgsOf(e.id);
    if (os.isEmpty) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.only(top: 12),
      child: Wrap(spacing: 8, runSpacing: 8, crossAxisAlignment: WrapCrossAlignment.center, children: [
        Text(t('by_org'), style: body(13.5, color: C.muted)),
        for (final o in os)
          ActionChip(
            label: Text(o.name, style: body(13.5, weight: FontWeight.w700)),
            onPressed: () => openOrg(context, o),
            backgroundColor: C.surface,
            side: const BorderSide(color: C.line2),
            shape: const RoundedRectangleBorder(),
          ),
      ]),
    );
  }
}

class OrganizerScreen extends StatelessWidget {
  final int id;
  const OrganizerScreen(this.id, {super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      body: ListenableBuilder(
        listenable: store,
        builder: (context, _) {
          final o = store.orgById(id);
          if (o == null) return Center(child: Text(t('err'), style: body(15)));
          final evs = store.eventsOfOrg(o.id);
          final on = store.orgFollow.contains(o.id);
          final cities = {for (final e in evs) store.venues[e.venueId]?.city}.whereType<String>().toList();
          return ListView(padding: const EdgeInsets.fromLTRB(18, 4, 18, 48), children: [
            Text(orgKind(o.kind).toUpperCase(), style: mono(11, color: C.accent)),
            const SizedBox(height: 6),
            Text(o.name.toUpperCase(), style: display(40)),
            const SizedBox(height: 8),
            Text(
                evs.isEmpty
                    ? t('org_none')
                    : '${t('org_next_n', {'n': evs.length})}${cities.isEmpty ? '' : ' · ${cities.take(4).join(', ')}'}',
                style: body(15, color: C.muted)),
            const SizedBox(height: 14),
            RsButton(on ? '✓ ${t('following_btn')}' : '+ ${t('follow')}', primary: !on, active: on, onTap: () {
              if (store.user == null) {
                askLogin(context);
                return;
              }
              store.toggleOrgFollow(o.id);
              if (!on) toast(context, t('org_follow_toast'));
            }),
            Section(1, t('org_dates')),
            if (evs.isEmpty) EmptyBox(t('org_none')),
            for (final e in evs) EventRow(e),
          ]);
        },
      ),
    );
  }
}

/// List of all organizers with search (reached from the events page).
class OrganizerList extends StatefulWidget {
  const OrganizerList({super.key});
  @override
  State<OrganizerList> createState() => _OrganizerListState();
}

class _OrganizerListState extends State<OrganizerList> {
  String _q = '';
  @override
  Widget build(BuildContext context) {
    final list = store.orgs.where((o) => _q.isEmpty || o.name.toLowerCase().contains(_q.toLowerCase())).toList();
    return Scaffold(
      appBar: AppBar(title: Text(t('orgs_t').toUpperCase(), style: display(18))),
      body: ListView(padding: const EdgeInsets.all(18), children: [
        TextField(
          autofocus: true,
          style: body(15.5),
          cursorColor: C.accent,
          decoration: InputDecoration(hintText: t('orgs_search'), prefixIcon: const Icon(Icons.search, color: C.muted)),
          onChanged: (v) => setState(() => _q = v.trim()),
        ),
        const SizedBox(height: 10),
        if (list.isEmpty) EmptyBox(t('no_results')),
        for (final o in list)
          InkWell(
            onTap: () => openOrg(context, o),
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 14),
              decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: C.line))),
              child: Row(children: [
                Expanded(
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(o.name, style: body(16, weight: FontWeight.w700)),
                    Text(orgKind(o.kind), style: body(13, color: C.muted)),
                  ]),
                ),
                if (o.upcoming > 0) Text(t('org_next_n', {'n': o.upcoming}), style: body(13, color: C.accent)),
                if (store.orgFollow.contains(o.id)) const Padding(padding: EdgeInsets.only(left: 8), child: Icon(Icons.check, color: C.accent, size: 18)),
              ]),
            ),
          ),
      ]),
    );
  }
}
