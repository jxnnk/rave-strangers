# Mail-Vorlagen (Supabase Auth)

Design wie die App: dunkel, roter Akzent, RAVE STRNGRS, Deutsch + kurzer englischer Teil.
Schriften kommen von unserer eigenen Seite (`app/fonts/`), nicht von Google. Mail-Programme ohne Webfonts (z. B. Gmail) zeigen eine ähnliche Ersatzschrift.

Ändern: Texte in `build.py` anpassen, dann `python3 supabase/email_templates/build.py`.

## Einfügen in Supabase

Supabase-Dashboard → Projekt **rave-strangers** → **Authentication → Emails → Templates**.
Für jede Vorlage: Betreff einfügen, dann in „Message body“ (Source/HTML) den kompletten Inhalt der Datei einfügen, **Save**.

| Vorlage in Supabase | Datei | Betreff |
|---|---|---|
| Confirm sign up | `confirm_signup.html` | Willkommen bei Rave Strangers – bestätige deine Mail |
| Reset password | `reset_password.html` | Rave Strangers – neues Passwort festlegen |
| Magic link | `magic_link.html` | Dein Login-Link für Rave Strangers |
| Change email address | `change_email.html` | Rave Strangers – neue E-Mail-Adresse bestätigen |
| Invite user | `invite.html` | Du wurdest zu Rave Strangers eingeladen |
| Reauthentication | `reauthentication.html` | Dein Bestätigungscode für Rave Strangers |

Die Platzhalter `{{ .ConfirmationURL }}`, `{{ .Token }}`, `{{ .Email }}`, `{{ .NewEmail }}` ersetzt Supabase beim Versand. Nicht verändern.

Damit die Mails von `rave-strangers@mail.de` kommen: **Authentication → Emails → SMTP Settings** (siehe LATER.md / Chat), Passwort trägt nur Jannik selbst ein.
