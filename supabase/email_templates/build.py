#!/usr/bin/env python3
"""Baut die Supabase-Auth-Mails im Rave-Strangers-Design.
Ausgabe: *.html in diesem Ordner. Einfügen im Supabase-Dashboard unter
Authentication -> Emails -> Templates (Betreff + HTML je Vorlage, siehe README.md).
Mail-Clients können keine Webfonts zuverlässig: Überschriften nutzen Impact/Arial Narrow als Ersatz für Anton."""
import os, html
HERE = os.path.dirname(os.path.abspath(__file__))
BG, SURF, LINE, TEXT, MUTED, RED = '#111113', '#19191C', '#2A2A2F', '#EFECE6', '#9A978F', '#FF2B1C'
SITE = 'https://jxnnk.github.io/rave-strangers/'
DISPLAY = "Anton, Impact, 'Arial Narrow Bold', 'Helvetica Neue', Arial, sans-serif"
BODY = "'Space Grotesk', 'Helvetica Neue', Helvetica, Arial, sans-serif"

def button(url, label):
    return f'''<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 8px">
<tr><td bgcolor="{RED}" style="background:{RED}">
<a href="{url}" style="display:inline-block;padding:16px 28px;font-family:{DISPLAY};font-size:20px;letter-spacing:.04em;text-transform:uppercase;color:{BG};text-decoration:none">{label}</a>
</td></tr></table>'''

def code(tok):
    return f'''<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 8px">
<tr><td bgcolor="{SURF}" style="background:{SURF};border:1px solid {RED};padding:16px 26px;font-family:{DISPLAY};font-size:38px;letter-spacing:.18em;color:{TEXT}">{tok}</td></tr></table>'''

def page(preheader, kicker, title, de_html, en_html, action, note_de, note_en):
    return f'''<!DOCTYPE html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark">
<style>@font-face{{font-family:'Anton';src:url({SITE}fonts/Anton-Regular.ttf) format('truetype')}}@font-face{{font-family:'Space Grotesk';src:url({SITE}fonts/SpaceGrotesk-Regular.ttf) format('truetype');font-weight:400}}@font-face{{font-family:'Space Grotesk';src:url({SITE}fonts/SpaceGrotesk-Bold.ttf) format('truetype');font-weight:700}}</style>
<title>{html.escape(title)}</title></head>
<body style="margin:0;padding:0;background:{BG}" bgcolor="{BG}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">{preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="{BG}" style="background:{BG}">
<tr><td align="center" style="padding:32px 14px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px">
<tr><td style="padding:0 4px 22px;font-family:{DISPLAY};font-size:30px;line-height:1;letter-spacing:.01em;color:{TEXT}">RAVE <span style="color:{RED}">STRNGRS</span></td></tr>
<tr><td bgcolor="{SURF}" style="background:{SURF};border-top:4px solid {RED};padding:30px 28px 26px">
<div style="font-family:{BODY};font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:{RED}">{kicker}</div>
<h1 style="margin:10px 0 18px;font-family:{DISPLAY};font-weight:400;font-size:40px;line-height:1.02;text-transform:uppercase;color:{TEXT}">{title}</h1>
<div style="font-family:{BODY};font-size:16px;line-height:1.55;color:{TEXT}">{de_html}</div>
{action}
<p style="margin:14px 0 0;font-family:{BODY};font-size:13px;line-height:1.5;color:{MUTED}">{note_de}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:26px"><tr><td style="border-top:1px solid {LINE};padding-top:18px;font-family:{BODY};font-size:14px;line-height:1.5;color:{MUTED}" lang="en">
<b style="color:{TEXT}">English:</b> {en_html} {note_en}</td></tr></table>
</td></tr>
<tr><td style="padding:22px 4px 0;font-family:{BODY};font-size:12px;line-height:1.6;color:{MUTED}">
Nie mehr allein raven. Finde deine Crew, nicht nur die Party.<br>
<a href="{SITE}" style="color:{MUTED}">ravestrangers</a> &middot; <a href="{SITE}legal/impressum.html" style="color:{MUTED}">Impressum</a> &middot; <a href="{SITE}legal/datenschutz.html" style="color:{MUTED}">Datenschutz</a><br>
Du bekommst diese Mail, weil jemand mit deiner Adresse bei Rave Strangers etwas angefragt hat.
</td></tr>
</table></td></tr></table></body></html>
'''

IGNORE_DE = 'Warst du das nicht? Dann ignorier diese Mail einfach, es passiert nichts.'
IGNORE_EN = 'Not you? Just ignore this email, nothing will happen.'
T = {
 'confirm_signup': dict(
   subject='Willkommen bei Rave Strangers – bestätige deine Mail',
   pre='Ein Klick noch, dann findest du deine Crew.',
   kicker='Fast geschafft', title='Bestätige deine Mail',
   de='<p style="margin:0">Schön, dass du dabei bist! Tipp auf den Button, um deine E-Mail-Adresse zu bestätigen. Danach kannst du Events speichern, Crews finden und mit anderen Ravern schreiben.</p>',
   en='Welcome! Tap the button to confirm your email address.',
   action=button('{{ .ConfirmationURL }}', 'Mail bestätigen'),
   nde=IGNORE_DE, nen=IGNORE_EN),
 'reset_password': dict(
   subject='Rave Strangers – neues Passwort festlegen',
   pre='Hier kannst du ein neues Passwort festlegen.',
   kicker='Passwort vergessen?', title='Neues Passwort',
   de='<p style="margin:0">Kein Stress, passiert den Besten nach einer langen Nacht. Tipp auf den Button und leg ein neues Passwort fest. Der Link gilt nur kurz.</p>',
   en='Tap the button to set a new password. The link expires soon.',
   action=button('{{ .ConfirmationURL }}', 'Passwort ändern'),
   nde='Du hast nichts angefragt? Dann ignorier diese Mail, dein Passwort bleibt gleich.', nen='Didn’t ask for this? Ignore this email, your password stays the same.'),
 'magic_link': dict(
   subject='Dein Login-Link für Rave Strangers',
   pre='Ein Klick und du bist drin.',
   kicker='Login', title='Dein Login-Link',
   de='<p style="margin:0">Tipp auf den Button, um dich ohne Passwort anzumelden. Der Link gilt nur kurz und nur einmal.</p>',
   en='Tap the button to log in. The link works once and expires soon.',
   action=button('{{ .ConfirmationURL }}', 'Einloggen'),
   nde=IGNORE_DE, nen=IGNORE_EN),
 'change_email': dict(
   subject='Rave Strangers – neue E-Mail-Adresse bestätigen',
   pre='Bestätige deine neue E-Mail-Adresse.',
   kicker='Konto', title='Neue Mail bestätigen',
   de='<p style="margin:0">Du möchtest die E-Mail-Adresse deines Kontos von <b>{{ .Email }}</b> auf <b>{{ .NewEmail }}</b> ändern. Tipp auf den Button, um das zu bestätigen.</p>',
   en='Confirm changing your account email from {{ .Email }} to {{ .NewEmail }}.',
   action=button('{{ .ConfirmationURL }}', 'Änderung bestätigen'),
   nde='Das warst du nicht? Dann ignorier diese Mail und ändere zur Sicherheit dein Passwort.', nen='Not you? Ignore this email and change your password to be safe.'),
 'invite': dict(
   subject='Du wurdest zu Rave Strangers eingeladen',
   pre='Nie mehr allein raven. Deine Einladung wartet.',
   kicker='Einladung', title='Komm in die Crew',
   de='<p style="margin:0">Du wurdest zu Rave Strangers eingeladen, der App, mit der du nie mehr allein raven musst. Tipp auf den Button, um dein Konto anzulegen.</p>',
   en='You’ve been invited to Rave Strangers. Tap the button to create your account.',
   action=button('{{ .ConfirmationURL }}', 'Einladung annehmen'),
   nde='Kein Interesse? Dann ignorier diese Mail einfach.', nen='Not interested? Just ignore this email.'),
 'reauthentication': dict(
   subject='Dein Bestätigungscode für Rave Strangers',
   pre='Dein Code zur Bestätigung.',
   kicker='Sicherheit', title='Dein Code',
   de='<p style="margin:0">Gib diesen Code in der App ein, um die Aktion zu bestätigen:</p>',
   en='Enter this code in the app to confirm:',
   action=code('{{ .Token }}'),
   nde='Du hast nichts angefragt? Dann ändere zur Sicherheit dein Passwort.', nen='Didn’t request this? Change your password to be safe.'),
}
if __name__ == '__main__':
    rows = []
    for k, v in T.items():
        open(os.path.join(HERE, k + '.html'), 'w').write(page(v['pre'], v['kicker'], v['title'], v['de'], v['en'], v['action'], v['nde'], v['nen']))
        rows.append((k, v['subject']))
    print('\n'.join(f'{k}: {s}' for k, s in rows))
