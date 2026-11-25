import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'data.dart';
import 'strings.dart';
import 'theme.dart';
import 'widgets.dart';

/// Profilbild: Datei liegt immer unter avatars/<user-id>/avatar.jpg (Bucket aus Migration 025).
String _path() => '${store.user!.id}/avatar.jpg';

Future<void> _setUrl(String? url) async {
  await sb.from('profiles').update({'avatar_url': url}).eq('id', store.user!.id);
  final id = store.user!.id;
  store.avatars[id] = url;
  await store.loadMine();
}

/// Galerie öffnen, Bild verkleinern, hochladen und im Profil speichern.
Future<void> pickAndUploadAvatar(BuildContext context) async {
  if (store.user == null) return;
  final XFile? f;
  try {
    f = await ImagePicker().pickImage(
      source: ImageSource.gallery,
      maxWidth: 768,
      maxHeight: 768,
      imageQuality: 85,
    );
  } catch (e) {
    debugPrint('avatar pick failed: $e');
    if (context.mounted) toast(context, t('av_err'));
    return;
  }
  if (f == null) return; // abgebrochen
  if (context.mounted) toast(context, t('av_busy'));
  try {
    final bytes = await f.readAsBytes();
    final type = f.mimeType ?? (f.name.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg');
    final bucket = sb.storage.from('avatars');
    await bucket.uploadBinary(_path(), bytes,
        fileOptions: FileOptions(upsert: true, contentType: type, cacheControl: '3600'));
    final url = '${bucket.getPublicUrl(_path())}?v=${DateTime.now().millisecondsSinceEpoch}';
    await _setUrl(url);
    if (context.mounted) toast(context, t('av_ok'));
  } catch (e) {
    debugPrint('avatar upload failed: $e');
    if (context.mounted) toast(context, t('av_err'));
  }
}

Future<void> removeAvatar(BuildContext context) async {
  if (store.user == null) return;
  try {
    await sb.storage.from('avatars').remove([_path()]);
    await _setUrl(null);
    if (context.mounted) toast(context, t('av_gone'));
  } catch (e) {
    debugPrint('avatar remove failed: $e');
    if (context.mounted) toast(context, t('err'));
  }
}

/// Eigenes Profilbild zum Antippen, mit "+" wenn noch keins da ist.
class MyAvatar extends StatelessWidget {
  final double size;
  const MyAvatar({super.key, this.size = 64});
  @override
  Widget build(BuildContext context) {
    final p = store.profile ?? const <String, dynamic>{};
    final name = (p['display_name'] as String?) ?? store.user?.email ?? '';
    final url = p['avatar_url'] as String?;
    final has = url != null && url.isNotEmpty;
    return Semantics(
      button: true,
      label: t(has ? 'av_change' : 'av_add'),
      child: InkWell(
        onTap: () => pickAndUploadAvatar(context),
        child: Stack(clipBehavior: Clip.none, children: [
          Container(
            decoration: BoxDecoration(border: Border.all(color: C.accent)),
            child: Avatar(name, size: size, url: url),
          ),
          if (!has)
            Positioned(
              right: -6,
              bottom: -6,
              child: Container(
                width: 24,
                height: 24,
                alignment: Alignment.center,
                decoration: BoxDecoration(color: C.accent, border: Border.all(color: C.bg, width: 2)),
                child: const Icon(Icons.add, size: 16, color: C.bg),
              ),
            ),
        ]),
      ),
    );
  }
}

/// Block für die Einstellungen: Bild, "Bild wählen/ändern", "Entfernen".
class AvatarEditor extends StatelessWidget {
  const AvatarEditor({super.key});
  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: store,
      builder: (context, _) {
        final url = store.profile?['avatar_url'] as String?;
        final has = url != null && url.isNotEmpty;
        return Container(
          margin: const EdgeInsets.only(bottom: 18),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(color: C.surface, border: Border.all(color: C.line)),
          child: Row(children: [
            const MyAvatar(size: 76),
            const SizedBox(width: 16),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(t('av_t'), style: body(15.5, weight: FontWeight.w700)),
                const SizedBox(height: 2),
                Text(t('av_hint'), style: body(13, color: C.muted)),
                const SizedBox(height: 10),
                Wrap(spacing: 8, runSpacing: 8, children: [
                  RsButton(t(has ? 'av_change' : 'av_pick'),
                      primary: true, small: true, onTap: () => pickAndUploadAvatar(context)),
                  if (has) RsButton(t('av_del'), small: true, onTap: () => removeAvatar(context)),
                ]),
              ]),
            ),
          ]),
        );
      },
    );
  }
}
