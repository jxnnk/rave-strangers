import 'dart:async';

import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../data.dart';
import '../strings.dart';
import '../theme.dart';
import '../widgets.dart';

/// "Passwort vergessen": eigene Seite mit Erklärung, Mail-Feld, Wartezeit
/// und verständlichen Meldungen (z.B. wenn das Mail-Limit erreicht ist).
/// Der Link in der Mail öffnet die Web-Seite "Neues Passwort festlegen";
/// danach meldet man sich in der App mit dem neuen Passwort an.
class ResetScreen extends StatefulWidget {
  final String initialEmail;
  const ResetScreen({super.key, this.initialEmail = ''});

  @override
  State<ResetScreen> createState() => _ResetScreenState();
}

class _ResetScreenState extends State<ResetScreen> {
  late final TextEditingController _mail = TextEditingController(text: widget.initialEmail);
  bool _busy = false;
  String? _sentTo;
  String? _err;
  int _left = 0;
  Timer? _timer;

  @override
  void dispose() {
    _timer?.cancel();
    _mail.dispose();
    super.dispose();
  }

  void _startCooldown() {
    _timer?.cancel();
    setState(() => _left = 60);
    _timer = Timer.periodic(const Duration(seconds: 1), (tm) {
      if (!mounted) {
        tm.cancel();
        return;
      }
      setState(() => _left = _left > 0 ? _left - 1 : 0);
      if (_left == 0) tm.cancel();
    });
  }

  Future<void> _send() async {
    final email = _mail.text.trim();
    if (!RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(email)) {
      setState(() => _err = '${t('email')}?');
      return;
    }
    if (_left > 0) return;
    setState(() {
      _busy = true;
      _err = null;
    });
    try {
      await sb.auth.resetPasswordForEmail(email, redirectTo: '$webUrl#newpw');
      _sentTo = email;
      _startCooldown();
    } on AuthException catch (e) {
      final limit = e.statusCode == '429' || RegExp('rate limit|security purposes', caseSensitive: false).hasMatch(e.message);
      _err = limit ? t('reset_limit') : e.message;
    } catch (e) {
      _err = '$e';
    }
    if (mounted) setState(() => _busy = false);
  }

  @override
  Widget build(BuildContext context) {
    Widget step(int n, String text) => Padding(
          padding: const EdgeInsets.only(bottom: 10),
          child: Row(children: [
            Container(
              width: 28,
              height: 28,
              alignment: Alignment.center,
              decoration: BoxDecoration(border: Border.all(color: C.accent)),
              child: Text('$n', style: mono(12, color: C.accent)),
            ),
            const SizedBox(width: 12),
            Expanded(child: Text(text, style: body(15))),
          ]),
        );

    final label = _busy
        ? '…'
        : _left > 0
            ? t('reset_wait', {'n': '$_left'})
            : (_sentTo != null ? t('reset_again') : t('reset_btn'));

    return Scaffold(
      backgroundColor: C.bg,
      appBar: AppBar(
        backgroundColor: C.bg,
        foregroundColor: C.text,
        elevation: 0,
        title: Text(t('reset_back').toUpperCase(), style: mono(11)),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(18, 8, 18, 48),
          children: [
            Text(t('reset_t').toUpperCase(), style: display(32)),
            const SizedBox(height: 10),
            Text(t('reset_intro'), style: body(15, color: C.muted)),
            const SizedBox(height: 20),
            step(1, t('reset_s1')),
            step(2, t('reset_s2')),
            step(3, t('reset_s3')),
            const SizedBox(height: 10),
            if (_sentTo != null)
              Container(
                margin: const EdgeInsets.only(bottom: 18),
                padding: const EdgeInsets.all(14),
                decoration: const BoxDecoration(
                  color: C.surface,
                  border: Border(left: BorderSide(color: C.accent, width: 3)),
                ),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(t('reset_sent_t').toUpperCase(), style: mono(11)),
                  const SizedBox(height: 6),
                  Text(t('reset_sent_d', {'mail': _sentTo!}), style: body(14.5, color: C.muted)),
                ]),
              ),
            Text(t('email').toUpperCase(), style: mono(10.5)),
            const SizedBox(height: 6),
            TextField(
              controller: _mail,
              keyboardType: TextInputType.emailAddress,
              autocorrect: false,
              autofillHints: const [AutofillHints.email],
              style: body(15.5),
              cursorColor: C.accent,
              onSubmitted: (_) => _send(),
            ),
            const SizedBox(height: 14),
            if (_err != null)
              Padding(
                padding: const EdgeInsets.only(bottom: 14),
                child: Text(_err!, style: body(14.5, color: C.accent)),
              ),
            Align(
              alignment: Alignment.centerLeft,
              child: RsButton(label, primary: true, onTap: (_busy || _left > 0) ? null : _send),
            ),
          ],
        ),
      ),
    );
  }
}
