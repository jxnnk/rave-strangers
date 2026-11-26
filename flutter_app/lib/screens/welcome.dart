// Welcome / login: big logo first, then it moves up and the login options slide in one by one.
// Used as the start gate (with "look around without account") and inside the profile tab.
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../data.dart';
import '../strings.dart';
import '../theme.dart';
import '../widgets.dart';
import 'reset.dart';

class WelcomeScreen extends StatefulWidget {
  /// true inside the profile tab: no skip button, no own scaffold background tricks.
  final bool embedded;
  const WelcomeScreen({super.key, this.embedded = false});
  @override
  State<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends State<WelcomeScreen> with SingleTickerProviderStateMixin {
  late final AnimationController _a =
      AnimationController(vsync: this, duration: Duration(milliseconds: widget.embedded ? 900 : 2200))..forward();
  bool _login = true, _busy = false, _age = false, _msgOk = false;
  String? _msg;
  final _name = TextEditingController(), _mail = TextEditingController(), _pw = TextEditingController();

  @override
  void dispose() {
    _a.dispose();
    _name.dispose();
    _mail.dispose();
    _pw.dispose();
    super.dispose();
  }

  // 0..1 progress of one step inside the timeline
  Animation<double> _step(double from, double to) =>
      CurvedAnimation(parent: _a, curve: Interval(from, to, curve: Curves.easeOutCubic));

  Widget _in(int i, Widget child) {
    final start = (widget.embedded ? 0.1 : 0.5) + i * 0.05;
    final an = _step(start.clamp(0, 0.95), (start + 0.25).clamp(0.05, 1.0));
    return AnimatedBuilder(
      animation: an,
      builder: (_, c) => Opacity(
        opacity: an.value,
        child: Transform.translate(offset: Offset(0, 28 * (1 - an.value)), child: c),
      ),
      child: child,
    );
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
        HapticFeedback.mediumImpact();
        _msg = null;
      } else {
        final r = await sb.auth.signUp(
            email: email, password: pw, data: {'display_name': name}, emailRedirectTo: '$webUrl#me');
        if (r.user != null && (r.user!.identities?.isEmpty ?? false)) {
          _msg = t('signup_exists');
          _msgOk = false;
        } else {
          _msg = t('check_mail');
          _msgOk = true;
          _login = true;
        }
      }
    } on AuthException catch (e) {
      final m = e.message.toLowerCase();
      _msg = m.contains('invalid login') ? t('wrong_login') : (m.contains('rate') ? t('reset_rate') : e.message);
      _msgOk = false;
    } catch (_) {
      _msg = t('err');
      _msgOk = false;
    }
    if (mounted) setState(() => _busy = false);
  }

  Widget _input(String hint, TextEditingController c, {bool pw = false, TextInputType? type, String? fill}) =>
      TextField(
        controller: c,
        obscureText: pw,
        keyboardType: type,
        autocorrect: false,
        autofillHints: fill == null ? null : [fill],
        style: body(16),
        cursorColor: C.accent,
        decoration: InputDecoration(
          hintText: hint,
          filled: true,
          fillColor: C.surface,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
          enabledBorder: const OutlineInputBorder(borderRadius: BorderRadius.zero, borderSide: BorderSide(color: C.line2)),
          focusedBorder: const OutlineInputBorder(borderRadius: BorderRadius.zero, borderSide: BorderSide(color: C.text, width: 1.5)),
        ),
      );

  @override
  Widget build(BuildContext context) {
    final logoMove = _step(widget.embedded ? 0 : 0.18, widget.embedded ? 0.3 : 0.45);
    final logoIn = _step(0, widget.embedded ? 0.2 : 0.22);
    final tag = _step(widget.embedded ? 0.05 : 0.3, widget.embedded ? 0.35 : 0.55);
    final items = <Widget>[
      if (!_login) _input(t('name'), _name, fill: AutofillHints.nickname),
      _input(t('email'), _mail, type: TextInputType.emailAddress, fill: AutofillHints.email),
      _input(t('password'), _pw, pw: true, fill: _login ? AutofillHints.password : AutofillHints.newPassword),
      if (!_login)
        InkWell(
          onTap: () => setState(() => _age = !_age),
          child: Row(children: [
            Checkbox(
              value: _age,
              onChanged: (v) => setState(() => _age = v ?? false),
              activeColor: C.accent,
              side: const BorderSide(color: C.line2),
              shape: const RoundedRectangleBorder(),
            ),
            Expanded(child: Text(t('age'), style: body(14))),
          ]),
        ),
      if (!_login) const LegalLinks(),
      if (_msg != null) Text(_msg!, style: body(14.5, color: _msgOk ? C.green : C.accent)),
      SizedBox(
        height: 54,
        child: FilledButton(
          style: FilledButton.styleFrom(backgroundColor: C.accent, foregroundColor: C.ink, shape: const RoundedRectangleBorder()),
          onPressed: _busy ? null : _submit,
          child: Text(_busy ? '…' : (_login ? t('login') : t('signup')).toUpperCase(), style: display(19, color: C.ink)),
        ),
      ),
      SizedBox(
        height: 50,
        child: OutlinedButton(
          style: OutlinedButton.styleFrom(
              foregroundColor: C.text, side: const BorderSide(color: C.text, width: 1.5), shape: const RoundedRectangleBorder()),
          onPressed: () => setState(() {
            _login = !_login;
            _msg = null;
          }),
          child: Text(_login ? t('new_here') : t('have_account'), style: body(15, weight: FontWeight.w700)),
        ),
      ),
      Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        if (_login)
          TextButton(
            onPressed: () => Navigator.of(context)
                .push(MaterialPageRoute(builder: (_) => ResetScreen(initialEmail: _mail.text.trim()))),
            child: Text(t('reset_open'), style: body(14, color: C.muted)),
          )
        else
          const SizedBox.shrink(),
        if (!widget.embedded)
          TextButton(
            onPressed: store.skipWelcome,
            child: Text('${t('skip')} →', style: body(14, color: C.text, weight: FontWeight.w700)),
          ),
      ]),
      Text(t('legal_hint'), textAlign: TextAlign.center, style: body(11.5, color: C.muted)),
    ];

    final content = SafeArea(
      child: Stack(children: [
        LayoutBuilder(builder: (context, box) {
          return SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: ConstrainedBox(
              constraints: BoxConstraints(minHeight: box.maxHeight),
              child: AnimatedBuilder(
                animation: _a,
                builder: (context, _) => Column(children: [
                  // logo starts in the middle of the screen and glides up
                  SizedBox(height: (box.maxHeight * 0.36) * (1 - logoMove.value) + 64 * logoMove.value),
                  Opacity(
                    opacity: logoIn.value,
                    child: Transform.scale(
                      scale: 0.9 + 0.1 * logoIn.value + 0.25 * (1 - logoMove.value),
                      child: Text.rich(
                        TextSpan(children: [
                          TextSpan(text: 'RAVE\n', style: display(54)),
                          TextSpan(text: 'STRNGRS', style: display(54, color: C.accent)),
                        ]),
                        textAlign: TextAlign.center,
                        semanticsLabel: 'Rave Strangers',
                        style: const TextStyle(height: 0.92),
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  Opacity(opacity: tag.value, child: Text(t('tagline'), style: body(16, color: C.muted))),
                  const SizedBox(height: 36),
                  for (var i = 0; i < items.length; i++) ...[
                    _in(i + 1, items[i]),
                    const SizedBox(height: 12),
                  ],
                  const SizedBox(height: 20),
                ]),
              ),
            ),
          );
        }),
        // zuletzt, damit es über der Scroll-Fläche liegt und Antippen ankommt
        Positioned(top: 6, right: 12, child: _in(0, const LangSwitch())),
      ]),
    );
    return widget.embedded ? content : Scaffold(backgroundColor: C.bg, body: AutofillGroup(child: content));
  }
}
