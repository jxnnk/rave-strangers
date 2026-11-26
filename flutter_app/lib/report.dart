// Melden von Nutzerinhalten (Tabelle `reports`, Migration 026).
// Pflicht für Apps mit Nutzerinhalten (Apple 1.2, Google Play UGC): melden, blockieren, Kontakt.
import 'package:flutter/material.dart';

import 'data.dart';
import 'strings.dart';
import 'theme.dart';
import 'widgets.dart';

const _reasons = ['harass', 'hate', 'sexual', 'violence', 'scam', 'spam', 'minor', 'other'];

/// Öffnet das Melde-Formular. [kind]: message | crew_post | profile | group.
/// Gibt true zurück, wenn gemeldet wurde. Optional kann die Person direkt blockiert werden.
Future<bool> reportContent(
  BuildContext context, {
  required String kind,
  String? targetUser,
  int? refId,
  String? snippet,
}) async {
  if (store.user == null) {
    askLogin(context);
    return false;
  }
  final sent = await showModalBottomSheet<bool>(
    context: context,
    isScrollControlled: true,
    backgroundColor: C.surface,
    shape: const RoundedRectangleBorder(),
    builder: (_) => _ReportSheet(kind: kind, targetUser: targetUser, refId: refId, snippet: snippet),
  );
  if (sent == true && context.mounted) toast(context, t('report_ok'));
  return sent == true;
}

class _ReportSheet extends StatefulWidget {
  final String kind;
  final String? targetUser;
  final int? refId;
  final String? snippet;
  const _ReportSheet({required this.kind, this.targetUser, this.refId, this.snippet});
  @override
  State<_ReportSheet> createState() => _ReportSheetState();
}

class _ReportSheetState extends State<_ReportSheet> {
  String? _reason;
  bool _block = false;
  bool _busy = false;
  final _note = TextEditingController();

  @override
  void dispose() {
    _note.dispose();
    super.dispose();
  }

  Future<void> _send() async {
    if (_reason == null || _busy) return;
    setState(() => _busy = true);
    final me = store.user!.id;
    String? cut(String? s) => s == null ? null : (s.length > 500 ? s.substring(0, 500) : s);
    try {
      await sb.from('reports').insert({
        'reporter': me,
        'target_user': widget.targetUser,
        'kind': widget.kind,
        'ref_id': widget.refId,
        'reason': _reason,
        'note': cut(_note.text.trim().isEmpty ? null : _note.text.trim()),
        'snippet': cut(widget.snippet),
      });
      if (_block && widget.targetUser != null && widget.targetUser != me) {
        try {
          await sb.from('blocks').insert({'blocker': me, 'blocked': widget.targetUser});
        } catch (e) {
          debugPrint('block after report failed: $e'); // schon blockiert o. Ä.
        }
      }
      if (mounted) Navigator.of(context).pop(true);
    } catch (e) {
      debugPrint('report failed: $e');
      if (!mounted) return;
      setState(() => _busy = false);
      toast(context, '$e'.contains('rate_limited') ? t('report_rate') : t('err'));
    }
  }

  @override
  Widget build(BuildContext context) {
    final canBlock = widget.targetUser != null && widget.targetUser != store.user?.id;
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 16),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
            Text(t('report_t').toUpperCase(), style: display(22)),
            const SizedBox(height: 6),
            Text(t('report_sub'), style: body(13.5, color: C.muted)),
            const SizedBox(height: 10),
            for (final r in _reasons)
              InkWell(
                onTap: () => setState(() => _reason = r),
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  child: Row(children: [
                    Icon(_reason == r ? Icons.radio_button_checked : Icons.radio_button_unchecked,
                        color: _reason == r ? C.accent : C.muted, size: 20),
                    const SizedBox(width: 12),
                    Expanded(child: Text(t('r_$r'), style: body(15))),
                  ]),
                ),
              ),
            const SizedBox(height: 6),
            TextField(
              controller: _note,
              maxLength: 500,
              minLines: 1,
              maxLines: 3,
              style: body(15),
              cursorColor: C.accent,
              decoration: InputDecoration(hintText: t('report_note'), counterText: ''),
            ),
            if (canBlock)
              CheckboxListTile(
                value: _block,
                onChanged: (v) => setState(() => _block = v ?? false),
                activeColor: C.accent,
                contentPadding: EdgeInsets.zero,
                controlAffinity: ListTileControlAffinity.leading,
                title: Text(t('report_block'), style: body(15)),
              ),
            const SizedBox(height: 8),
            SizedBox(
              width: double.infinity,
              child: RsButton(_busy ? '…' : t('report_send'),
                  primary: true, onTap: _reason == null || _busy ? null : _send),
            ),
          ]),
        ),
      ),
    );
  }
}
