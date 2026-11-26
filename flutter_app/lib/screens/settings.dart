// Settings: profile, account, notifications, privacy, app, logout/delete.
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../avatar_upload.dart';
import '../data.dart';
import '../strings.dart';
import '../theme.dart';
import '../widgets.dart';
import 'reset.dart';

const appVersion = '0.9.0';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(t('settings').toUpperCase(), style: mono(13, color: C.text))),
      body: ListenableBuilder(
        listenable: store,
        builder: (context, _) {
          if (store.user == null) return Center(child: Text(t('crew_login'), style: body(15)));
          return ListView(
            padding: const EdgeInsets.fromLTRB(18, 8, 18, 48),
            children: [
              _Head(t('set_profile')),
              const AvatarEditor(),
              _ProfileForm(),
              _Head(t('set_account')),
              _Row(
                icon: Icons.alternate_email,
                title: t('set_email'),
                sub: store.user?.email ?? '',
                onTap: () => _changeEmail(context),
              ),
              _Row(
                icon: Icons.lock_outline,
                title: t('reset_open'),
                onTap: () => Navigator.of(context).push(MaterialPageRoute(
                    builder: (_) => ResetScreen(initialEmail: store.user?.email ?? ''))),
              ),
              _Head(t('notif_t')),
              _Switch(t('set_n_tickets'), t('set_n_tickets_sub'), 'notify_tickets'),
              _Switch(t('set_n_new'), t('set_n_new_sub'), 'notify_new'),
              _Switch(t('set_n_rem'), t('set_n_rem_sub'), 'notify_reminder'),
              _Head(t('set_privacy')),
              _Switch(t('set_dm'), t('set_dm_sub'), 'dm_open'),
              _Switch(t('set_going'), t('set_going_sub'), 'going_visible'),
              _Row(
                icon: Icons.block,
                title: t('set_blocked'),
                onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const _BlockedScreen())),
              ),
              _Head(t('legal_t')),
              _Row(icon: Icons.privacy_tip_outlined, title: t('privacy_p'), onTap: () => openUrl(privacyUrl)),
              _Row(icon: Icons.gavel_outlined, title: t('terms_p'), onTap: () => openUrl(termsUrl)),
              _Row(icon: Icons.mail_outline, title: t('imprint_p'), onTap: () => openUrl(imprintUrl)),
              _Head(t('set_app')),
              Row(children: [
                Expanded(child: Text(t('language'), style: body(15.5))),
                const LangSwitch(),
              ]),
              const SizedBox(height: 14),
              Text('Rave Strngrs $appVersion', style: mono(10.5)),
              _Head(t('set_session')),
              Wrap(spacing: 10, runSpacing: 10, children: [
                RsButton(t('logout'), onTap: () async {
                  await sb.auth.signOut();
                  if (context.mounted) Navigator.of(context).pop();
                }),
                RsButton(t('del_acct'), onTap: () => deleteAccount(context)),
              ]),
            ],
          );
        },
      ),
    );
  }

  Future<void> _changeEmail(BuildContext context) async {
    final ctrl = TextEditingController();
    final mail = await showDialog<String>(
      context: context,
      builder: (c) => AlertDialog(
        backgroundColor: C.surface,
        title: Text(t('set_email').toUpperCase(), style: mono(13, color: C.text)),
        content: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(t('set_email_hint'), style: body(14.5, color: C.muted)),
          const SizedBox(height: 10),
          TextField(
            controller: ctrl,
            autofocus: true,
            keyboardType: TextInputType.emailAddress,
            style: body(15),
            cursorColor: C.accent,
            decoration: InputDecoration(hintText: t('email')),
          ),
        ]),
        actions: [
          TextButton(onPressed: () => Navigator.pop(c), child: Text(t('cancel'))),
          TextButton(onPressed: () => Navigator.pop(c, ctrl.text.trim()), child: Text(t('ok'))),
        ],
      ),
    );
    ctrl.dispose();
    if (mail == null || !mail.contains('@') || mail == store.user?.email) return;
    try {
      await sb.auth.updateUser(UserAttributes(email: mail), emailRedirectTo: webUrl);
      if (context.mounted) toast(context, t('set_email_sent'));
    } on AuthException catch (e) {
      if (context.mounted) {
        toast(context, e.statusCode == '429' || e.message.toLowerCase().contains('rate') ? t('reset_rate') : e.message);
      }
    } catch (_) {
      if (context.mounted) toast(context, t('err'));
    }
  }
}

/// Confirmation with typed word, then removes the account (RPC from DB 016).
Future<void> deleteAccount(BuildContext context) async {
  final ctrl = TextEditingController();
  final yes = await showDialog<bool>(
    context: context,
    builder: (c) => AlertDialog(
      backgroundColor: C.surface,
      title: Text(t('del_acct').toUpperCase(), style: mono(13, color: C.accent)),
      content: Column(mainAxisSize: MainAxisSize.min, children: [
        Text(t('del_q'), style: body(15)),
        const SizedBox(height: 12),
        TextField(controller: ctrl, autofocus: true, style: body(15), cursorColor: C.accent),
      ]),
      actions: [
        TextButton(onPressed: () => Navigator.pop(c, false), child: Text(t('cancel'))),
        TextButton(
          onPressed: () => Navigator.pop(c, ctrl.text.trim().toUpperCase() == t('del_word')),
          child: Text(t('del_acct'), style: const TextStyle(color: C.accent)),
        ),
      ],
    ),
  );
  ctrl.dispose();
  if (yes != true) return;
  try {
    await sb.rpc('delete_my_account');
    await sb.auth.signOut();
    if (context.mounted) {
      toast(context, t('deleted'));
      Navigator.of(context).popUntil((r) => r.isFirst);
    }
  } catch (_) {
    if (context.mounted) toast(context, t('err'));
  }
}

class _Head extends StatelessWidget {
  final String text;
  const _Head(this.text);
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(top: 28, bottom: 8),
        child: Text(text.toUpperCase(), style: mono(11, color: C.accent)),
      );
}

class _Row extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? sub;
  final VoidCallback onTap;
  const _Row({required this.icon, required this.title, this.sub, required this.onTap});
  @override
  Widget build(BuildContext context) => InkWell(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 14),
          decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: C.line))),
          child: Row(children: [
            Icon(icon, color: C.muted, size: 21),
            const SizedBox(width: 14),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(title, style: body(15.5)),
                if (sub != null && sub!.isNotEmpty) Text(sub!, style: body(13, color: C.muted)),
              ]),
            ),
            const Icon(Icons.chevron_right, color: C.muted),
          ]),
        ),
      );
}

class _Switch extends StatelessWidget {
  final String title, sub, keyName;
  const _Switch(this.title, this.sub, this.keyName);
  @override
  Widget build(BuildContext context) => Container(
        decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: C.line))),
        child: SwitchListTile(
          contentPadding: EdgeInsets.zero,
          value: store.setting(keyName),
          onChanged: (v) => store.saveSetting(keyName, v),
          activeThumbColor: C.ink,
          activeTrackColor: C.accent,
          title: Text(title, style: body(15.5)),
          subtitle: Text(sub, style: body(13, color: C.muted)),
        ),
      );
}

class _ProfileForm extends StatefulWidget {
  @override
  State<_ProfileForm> createState() => _ProfileFormState();
}

class _ProfileFormState extends State<_ProfileForm> {
  late final _name = TextEditingController(text: store.profile?['display_name'] as String? ?? '');
  late final _city = TextEditingController(text: store.profile?['city'] as String? ?? '');
  late final _bio = TextEditingController(text: store.profile?['bio'] as String? ?? '');
  bool _busy = false;

  @override
  void dispose() {
    _name.dispose();
    _city.dispose();
    _bio.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final name = _name.text.trim();
    if (name.isEmpty) {
      toast(context, t('fill_all'));
      return;
    }
    setState(() => _busy = true);
    try {
      await sb.from('profiles').update({
        'display_name': name.length > 60 ? name.substring(0, 60) : name,
        'city': _city.text.trim().isEmpty ? null : _city.text.trim(),
        'bio': _bio.text.trim().isEmpty ? null : _bio.text.trim(),
      }).eq('id', store.user!.id);
      await store.loadMine();
      if (mounted) toast(context, t('saved_ok'));
    } catch (e) {
      debugPrint('profile save failed: $e');
      if (mounted) toast(context, t('err'));
    }
    if (mounted) setState(() => _busy = false);
  }

  Widget _field(String label, TextEditingController c, {int max = 60, int lines = 1}) => Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(label.toUpperCase(), style: mono(10.5)),
          TextField(
            controller: c,
            maxLength: max,
            minLines: lines,
            maxLines: lines == 1 ? 1 : 5,
            style: body(15.5),
            cursorColor: C.accent,
            decoration: const InputDecoration(counterText: ''),
          ),
        ]),
      );

  @override
  Widget build(BuildContext context) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      _field(t('set_name'), _name),
      _field(t('set_city'), _city),
      _field(t('set_bio'), _bio, max: 300, lines: 3),
      RsButton(_busy ? '…' : t('save'), primary: true, onTap: _busy ? null : _save),
    ]);
  }
}

class _BlockedScreen extends StatefulWidget {
  const _BlockedScreen();
  @override
  State<_BlockedScreen> createState() => _BlockedScreenState();
}

class _BlockedScreenState extends State<_BlockedScreen> {
  List<Map<String, dynamic>>? _rows;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final r = await sb.rpc('my_blocks') as List;
      if (mounted) setState(() => _rows = List<Map<String, dynamic>>.from(r));
    } catch (_) {
      if (mounted) setState(() => _rows = []);
    }
  }

  Future<void> _unblock(String id) async {
    try {
      await sb.from('blocks').delete().eq('blocker', store.user!.id).eq('blocked', id);
      _load();
    } catch (_) {
      if (mounted) toast(context, t('err'));
    }
  }

  @override
  Widget build(BuildContext context) {
    final rows = _rows;
    return Scaffold(
      appBar: AppBar(title: Text(t('set_blocked').toUpperCase(), style: mono(13, color: C.text))),
      body: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          if (rows == null) const Center(child: CircularProgressIndicator()),
          if (rows != null && rows.isEmpty) EmptyBox(t('set_blocked_none')),
          for (final r in rows ?? const <Map<String, dynamic>>[])
            Container(
              padding: const EdgeInsets.symmetric(vertical: 12),
              decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: C.line))),
              child: Row(children: [
                Expanded(
                  child: Text(
                      ((r['display_name'] as String?)?.isNotEmpty ?? false) ? r['display_name'] as String : '@${r['handle']}',
                      style: body(15.5)),
                ),
                RsButton(t('unblock'), small: true, onTap: () => _unblock(r['blocked'] as String)),
              ]),
            ),
        ],
      ),
    );
  }
}
