// Invite friends: personal link (share), QR code to show at the club, count of people who joined.
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:share_plus/share_plus.dart';

import '../data.dart';
import '../social.dart';
import '../strings.dart';
import '../theme.dart';
import '../widgets.dart';

class InviteBox extends StatefulWidget {
  const InviteBox({super.key});
  @override
  State<InviteBox> createState() => _InviteBoxState();
}

class _InviteBoxState extends State<InviteBox> {
  int? _count;

  @override
  void initState() {
    super.initState();
    sb.rpc('my_invites').then((v) {
      if (mounted) setState(() => _count = (v as num?)?.toInt());
    }).catchError((_) {});
  }

  void _showQr() {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: C.surface,
      shape: const RoundedRectangleBorder(),
      builder: (c) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(24, 24, 24, 28),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Text(t('qr_t').toUpperCase(), style: display(24)),
            const SizedBox(height: 6),
            Text(t('qr_sub'), textAlign: TextAlign.center, style: body(14.5, color: C.muted)),
            const SizedBox(height: 18),
            Container(
              color: C.text,
              padding: const EdgeInsets.all(14),
              child: QrImageView(
                data: inviteLink(),
                size: 220,
                backgroundColor: C.text,
                eyeStyle: const QrEyeStyle(eyeShape: QrEyeShape.square, color: C.ink),
                dataModuleStyle: const QrDataModuleStyle(dataModuleShape: QrDataModuleShape.square, color: C.ink),
                semanticsLabel: t('qr_t'),
              ),
            ),
            const SizedBox(height: 14),
            Text('@${store.profile?['handle'] ?? ''}', style: mono(12)),
          ]),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(border: Border.all(color: C.accent, width: 2)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(t('invite_t').toUpperCase(), style: display(22)),
        const SizedBox(height: 6),
        Text(t('invite_sub'), style: body(14.5, color: C.muted)),
        if ((_count ?? 0) > 0) ...[
          const SizedBox(height: 8),
          Text(t('invite_n', {'n': _count!}), style: body(14, color: C.accent, weight: FontWeight.w700)),
        ],
        const SizedBox(height: 12),
        Wrap(spacing: 8, runSpacing: 8, children: [
          RsButton(t('invite_t'), primary: true, icon: Icons.ios_share,
              onTap: () => Share.share('${t('invite_msg')}\n${inviteLink()}')),
          RsButton('QR', icon: Icons.qr_code_2, onTap: _showQr),
          RsButton(t('copy_link'), icon: Icons.link, onTap: () {
            Clipboard.setData(ClipboardData(text: inviteLink()));
            toast(context, t('copied'));
          }),
        ]),
      ]),
    );
  }
}
