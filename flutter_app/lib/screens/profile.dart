import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../data.dart';
import '../strings.dart';
import '../theme.dart';
import '../widgets.dart';
import 'reset.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: store,
      builder: (context, _) => SafeArea(
        bottom: false,
        child: store.user == null ? const _AuthForm() : const _Me(),
      ),
    );
  }
}

class _LangSwitch extends StatelessWidget {
  const _LangSwitch();
  @override
  Widget build(BuildContext context) {
    Widget b(String code) => Material(
          color: appLang == code ? C.text : Colors.transparent,
          child: InkWell(
            onTap: () => store.setLang(code),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              child: Text(code.toUpperCase(), style: mono(11, color: appLang == code ? C.bg : C.muted)),
            ),
          ),
        );
    return Container(
      decoration: BoxDecoration(border: Border.all(color: C.line2)),
      child: Row(mainAxisSize: MainAxisSize.min, children: [b('de'), b('en')]),
    );
  }
}

class _Me extends StatelessWidget {
  const _Me();
  @override
  Widget build(BuildContext context) {
    final p = store.profile ?? const <String, dynamic>{};
    final name = (p['display_name'] as String?) ?? store.user?.email ?? '';
    final handle = p['handle'] as String?;
    final verified = p['verified'] == true;
    final going = store.visibleEvents.where((e) => store.going.contains(e.id)).toList();
    final saved = store.visibleEvents.where((e) => store.saved.contains(e.id)).toList();
    return ListView(
      padding: const EdgeInsets.fromLTRB(18, 18, 18, 48),
      children: [
        Row(children: [const Brand(), const Spacer(), const _LangSwitch()]),
        const SizedBox(height: 28),
        Row(children: [
          Container(
            decoration: BoxDecoration(border: Border.all(color: C.accent)),
            child: Avatar(name, size: 64),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('${name.toUpperCase()}${verified ? ' ✓' : ''}', style: display(24)),
              if (handle != null) ...[
                const SizedBox(height: 6),
                Text('@$handle', style: mono(12)),
              ],
            ]),
          ),
        ]),
        Section(1, t('my_going')),
        if (going.isEmpty) EmptyBox(t('none_yet')),
        for (final e in going) EventRow(e),
        Section(2, t('my_saved')),
        if (saved.isEmpty) EmptyBox(t('none_yet')),
        for (final e in saved) EventRow(e),
        const SizedBox(height: 30),
        Align(
          alignment: Alignment.centerLeft,
          child: RsButton(t('logout'), onTap: () => sb.auth.signOut()),
        ),
      ],
    );
  }
}

class _AuthForm extends StatefulWidget {
  const _AuthForm();
  @override
  State<_AuthForm> createState() => _AuthFormState();
}

class _AuthFormState extends State<_AuthForm> {
  bool _login = true;
  bool _busy = false;
  bool _age = false;
  String? _msg;
  bool _msgOk = false;
  final _name = TextEditingController();
  final _mail = TextEditingController();
  final _pw = TextEditingController();

  @override
  void dispose() {
    _name.dispose();
    _mail.dispose();
    _pw.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final email = _mail.text.trim(), pw = _pw.text, name = _name.text.trim();
    if (email.isEmpty || pw.isEmpty || (!_login && name.isEmpty)) {
      setState(() {
        _msg = t('fill_all');
        _msgOk = false;
      });
      return;
    }
    if (!_login && !_age) {
      setState(() {
        _msg = t('need_age');
        _msgOk = false;
      });
      return;
    }
    setState(() => _busy = true);
    try {
      if (_login) {
        await sb.auth.signInWithPassword(email: email, password: pw);
        _msg = null;
      } else {
        await sb.auth.signUp(
            email: email, password: pw, data: {'display_name': name}, emailRedirectTo: '$webUrl#me');
        _msg = t('check_mail');
        _msgOk = true;
        _login = true;
      }
    } on AuthException catch (e) {
      _msg = e.message;
      _msgOk = false;
    } catch (e) {
      _msg = '$e';
      _msgOk = false;
    }
    if (mounted) setState(() => _busy = false);
  }

  Widget _field(String label, TextEditingController c, {bool pw = false, TextInputType? type}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(label.toUpperCase(), style: mono(10.5)),
        const SizedBox(height: 6),
        TextField(
          controller: c,
          obscureText: pw,
          keyboardType: type,
          autocorrect: false,
          style: body(15.5),
          cursorColor: C.accent,
        ),
      ]),
    );
  }

  @override
  Widget build(BuildContext context) {
    Widget seg(String label, bool on, VoidCallback tap) => Expanded(
          child: Material(
            color: on ? C.text : Colors.transparent,
            child: InkWell(
              onTap: tap,
              child: Container(
                height: 44,
                alignment: Alignment.center,
                child: Text(label.toUpperCase(), style: mono(11.5, color: on ? C.bg : C.muted)),
              ),
            ),
          ),
        );
    return ListView(
      padding: const EdgeInsets.fromLTRB(18, 18, 18, 48),
      children: [
        Row(children: [const Brand(), const Spacer(), const _LangSwitch()]),
        const SizedBox(height: 28),
        Text((_login ? t('login') : t('signup')).toUpperCase(), style: display(36)),
        const SizedBox(height: 10),
        Text(t('login_sub'), style: body(15, color: C.muted)),
        const SizedBox(height: 22),
        Container(
          decoration: BoxDecoration(border: Border.all(color: C.line2)),
          child: Row(children: [
            seg(t('login'), _login, () => setState(() => _login = true)),
            seg(t('signup'), !_login, () => setState(() => _login = false)),
          ]),
        ),
        const SizedBox(height: 20),
        if (!_login) _field(t('name'), _name),
        _field(t('email'), _mail, type: TextInputType.emailAddress),
        _field(t('password'), _pw, pw: true),
        if (!_login)
          InkWell(
            onTap: () => setState(() => _age = !_age),
            child: Padding(
              padding: const EdgeInsets.only(bottom: 14),
              child: Row(children: [
                Checkbox(
                  value: _age,
                  onChanged: (v) => setState(() => _age = v ?? false),
                  activeColor: C.accent,
                  side: const BorderSide(color: C.line2),
                  shape: const RoundedRectangleBorder(),
                ),
                Expanded(child: Text(t('age'), style: body(14.5))),
              ]),
            ),
          ),
        if (_msg != null)
          Padding(
            padding: const EdgeInsets.only(bottom: 14),
            child: Text(_msg!, style: body(14.5, color: _msgOk ? C.green : C.accent)),
          ),
        Wrap(spacing: 10, runSpacing: 10, children: [
          RsButton(_busy ? '…' : (_login ? t('login') : t('signup')),
              primary: true, onTap: _busy ? null : _submit),
          if (_login)
            RsButton(t('reset_open'),
                onTap: () => Navigator.of(context).push(MaterialPageRoute(
                    builder: (_) => ResetScreen(initialEmail: _mail.text.trim())))),
        ]),
      ],
    );
  }
}
