# SECURITY_FINDINGS.md — Rave Strangers

**Stand:** 2026-11-27 · **Grundlage:** statisches Code-Review von `main` (Commit frisch geklont), Fokus Supabase-Layer (`schema.sql` + Migrationen 002–028).
**Methode:** Lesen der RLS-Policies, `SECURITY DEFINER`-Funktionen und Trigger. **Kein** Angriff gegen die Live-Instanz — Egress-Proxy blockt `supabase.co`/`github.io`, daher sind die Findings gegen den Code verifiziert, **nicht** gegen die real ausgerollten Migrationen. Welche Migrationen produktiv laufen, musst du in Supabase gegenprüfen.

**Vertraulich — nicht als öffentliches GitHub-Issue posten.** Die App ist live; Meldung privat (`rave-strangers@mail.de` / GitHub Security Advisory).

Insgesamt sauber gebaut: RLS auf jeder Tabelle, Rolle/Verifizierung per Trigger geschützt, im Client nur der anon-Key, HTML durchgehend escaped — **kein XSS gefunden**. Die Lücken liegen in der Logik.

---

## Übersicht

| # | Schweregrad | Finding | Datei | Launch-Blocker? |
|---|-------------|---------|-------|-----------------|
| 1 | **Hoch** | Freigegebene Events nachträglich umbaubar (Ticket-Betrug + Fake-Pushes) | `017` + `021` + `024` | nein, aber vor Launch fixen |
| 2 | **Mittel–Hoch** | „Verifizierter" Check-in fälschbar | `028` | nein |
| 3 | **Mittel** | Einladungslink umgeht `dm_open` | `023` | nein |
| 4 | **Mittel** | Blockieren als Waffe in Gruppenchats | `schema.sql` (m_insert) | nein |
| 5 | **Mittel** | Posts fälschbar als News / fremder Club | `007` (po_update) | nein |
| 6 | **Funktionsfehler** | Melden-Funktion kaputt (Schema-Konflikt) | `026` vs `schema.sql` | **ja (Apple 1.2 / DSA Art. 16)** |

---

## 1 — Hoch: Freigegebene Events nachträglich umbaubar

**Wo:** `017_event_update_guard.sql`, `private.guard_event_update()`.

Der Trigger sperrt für normale Ersteller nur `status`, `created_by`, `origin`, `venue_id`:

```sql
new.status := case when new.status = 'cancelled' then 'cancelled'::event_status else old.status end;
new.created_by := old.created_by;
new.origin := old.origin;
new.venue_id := old.venue_id;
```

**Nicht gesperrt:** `title`, `ticket_url`, `ticket_status`, Banner-Bild und Line-up (`event_lineup`, via `el_write`). Ein Ersteller kann also ein harmloses Event durch den Review bringen und danach frei umbauen. Das greift in zwei automatische Mechanismen:

- **`021` `notify_tickets()`** feuert `after update of ticket_status, ticket_url`. Setzt der Ersteller nachträglich eine `ticket_url` (vorher NULL) oder `ticket_status` auf `available`, bekommen **alle, die das Event gemerkt haben oder hingehen**, eine „Tickets sind da"-Benachrichtigung — mit dem neuen, evtl. betrügerischen Link.
- **`024` `events_match_org()`** feuert `after insert or update of title`. Packt der Ersteller „Time Warp" oder „Awakenings" in den Titel, bekommen zusätzlich **alle Follower dieser Veranstalter** eine `new_event`-Push.

Ergebnis: Phishing-Ticketlink mit automatischer Reichweite an die genau interessierte Zielgruppe.

**Nebenbefund:** Verifizierte Artists (`role = 'artist' and verified`) sind im selben Trigger noch schwächer gebunden — sie dürfen `status` selbst setzen (also self-publishen) und Titel/Ticketlink ändern. Für vertrauenswürdige Artists evtl. gewollt, in Kombination mit dem Ticket-Push aber dieselbe Missbrauchsfläche.

**Fix** — bei Änderung sensibler Felder Event zurück auf `pending` (neuer Review) ODER Felder nach Freigabe sperren. Variante „zurück auf pending":

```sql
create or replace function private.guard_event_update() returns trigger
language plpgsql security definer set search_path = public, private as $$
begin
  if auth.uid() is null or private.is_admin() or private.manages_venue(new.venue_id) then
    return new;
  end if;
  new.created_by := old.created_by;
  new.origin     := old.origin;
  new.venue_id   := old.venue_id;

  -- Freigegebenes Event + Änderung an review-relevanten Feldern -> erneut in Review.
  if old.status = 'published'
     and ( new.title        is distinct from old.title
        or new.ticket_url   is distinct from old.ticket_url
        or new.ticket_status is distinct from old.ticket_status
        or new.banner_url   is distinct from old.banner_url )  -- Spaltennamen ans Schema anpassen
  then
    new.status := case when new.status = 'cancelled' then 'cancelled'::event_status
                       else 'pending'::event_status end;
  else
    new.status := case when new.status = 'cancelled' then 'cancelled'::event_status
                       else old.status end;
  end if;
  return new;
end $$;
```

Line-up separat absichern: `el_write` so einschränken, dass Änderungen an einem `published` Event es ebenfalls auf `pending` ziehen (oder bis Re-Review sperren). Spaltennamen (`banner_url` etc.) vor dem Deploy gegen `schema.sql` prüfen.

---

## 2 — Mittel–Hoch: „Verifizierter" Check-in ist fälschbar

**Wo:** `028_checkin_on_device.sql`, `public.check_in(p_event bigint)`.

Seit 028 rechnet die App den 400-m-Abstand, der Server bekommt nur die Event-ID und prüft **nur das Zeitfenster**:

```sql
if now() < e.starts_at - interval '1 hour' or now() > e.ends + interval '2 hours' then return 'not_now'; end if;
...
update public.reviews set verified = true where event_id = p_event and author = auth.uid();
```

Jeder eingeloggte Nutzer kann `rpc/check_in(event_id)` zur Event-Zeit von überall aufrufen und bekommt eine **`verified`-Bewertung** (die laut Repo doppelt zählt). Datenschutz-Versprechen („Standort verlässt das Gerät nicht") und Verifizierung schließen sich hier aus — die Verifizierung ist aktuell wertlos.

**Fix-Optionen (eine reicht):**
- **Rotierender Code/QR am Club:** Server erzeugt pro Event ein kurzlebiges Secret, `check_in(event_id, code)` prüft es. Standort bleibt am Gerät.
- **Koordinaten nur prüfen, nicht speichern:** `check_in(event_id, lat, lon)` serverseitig gegen die Venue-Koordinaten rechnen und sofort verwerfen — kein Insert von lat/lon. Bricht das Datenschutz-Versprechen minimal (Koordinaten verlassen das Gerät einmalig), ist aber am einfachsten.

Bis ein Fix steht: `verified`-Gewichtung in der Bewertungsanzeige entschärfen oder das Badge nicht als „vor Ort bestätigt" bewerben.

---

## 3 — Mittel: Einladungslink umgeht „Fremde dürfen mir schreiben: aus"

**Wo:** `023_group_chats_invites.sql`, `private.invite_connect()`.

```sql
if inviter is not null and inviter <> new.user_id then
  insert into conversations default values returning id into cid;
  insert into conversation_members(conversation_id, profile_id) values (cid, inviter), (cid, new.user_id);
end if;
```

Wer sich mit `?ref=i-<handle>` registriert, landet sofort in einem 1:1-Chat mit `<handle>` — **ohne** Prüfung von `dm_open`, Rate-Limit oder Block. Zum Vergleich prüft `public.start_chat` (Migration 022) alle drei:

```sql
if is_blocked_between(auth.uid(), other) then raise exception 'blocked'; end if;
if not coalesce((select dm_open from user_settings where profile_id = other), true) then raise exception 'dm_closed'; end if;
-- + Rate-Limit 10 Chats/h
```

Mit Wegwerf-Accounts lässt sich so jede Person anschreiben, die `dm_open = false` gesetzt hat. Der Eingeladene hat dem Chat nie zugestimmt.

**Fix** — in `invite_connect` dieselben Prüfungen wie in `start_chat`, bevor der Chat entsteht:

```sql
create or replace function private.invite_connect() returns trigger
language plpgsql security definer set search_path = public, private as $$
declare inviter uuid; cid bigint;
begin
  if new.ref like 'i-%' then
    select id into inviter from profiles where handle::text = substr(new.ref, 3);
    if inviter is not null and inviter <> new.user_id
       and not private.is_blocked_between(inviter, new.user_id)
       and coalesce((select dm_open from user_settings where profile_id = inviter), true)
    then
      insert into conversations default values returning id into cid;
      insert into conversation_members(conversation_id, profile_id) values (cid, inviter), (cid, new.user_id);
    end if;
  end if;
  return new;
end $$;
```

(`dm_open` des Einladenden ist die relevante Seite — er bekommt den fremden Kontakt aufgezwungen.)

---

## 4 — Mittel: Blockieren als Waffe in Gruppenchats

**Wo:** `schema.sql`, Policy `m_insert` auf `messages`.

```sql
create policy m_insert on messages for insert with check (
  sender = auth.uid() and in_conversation(conversation_id)
  and not exists (select 1 from conversation_members cm
                  where cm.conversation_id = messages.conversation_id
                    and cm.profile_id <> auth.uid() and is_blocked_between(auth.uid(), cm.profile_id)));
```

Die Block-Prüfung gilt gegen **jedes** andere Mitglied — auch in Event-Gruppenchats. Zwei Missbrauchswege:

- **Angreifer blockiert Opfer, tritt dem Event-Chat bei** → das Opfer kann im ganzen Gruppenchat nicht mehr schreiben (stumm für alle).
- **Wer einen Belästiger blockiert** und mit ihm im selben Event-Chat ist, **schaltet sich selbst stumm**.

**Fix** — Block-Prüfung nur für 1:1-Chats (ohne `event_id`); in Gruppen stattdessen Nachrichten blockierter Personen clientseitig/serverseitig beim Lesen ausblenden:

```sql
create policy m_insert on messages for insert with check (
  sender = auth.uid() and in_conversation(conversation_id)
  and (
    exists (select 1 from conversations c where c.id = messages.conversation_id and c.event_id is not null)
    or not exists (
      select 1 from conversation_members cm
      where cm.conversation_id = messages.conversation_id
        and cm.profile_id <> auth.uid()
        and private.is_blocked_between(auth.uid(), cm.profile_id)))
);
```

Ausblenden beim Lesen gehört dann in die Message-Lese-Funktion der Gruppen (nach `is_blocked_between` filtern).

---

## 5 — Mittel: Posts fälschbar als News oder fremder Club

**Wo:** `007_home_feed.sql`, Policy `po_update` auf `posts`.

```sql
create policy po_update on posts for update using (author = auth.uid() or private.is_admin());
-- kein WITH CHECK
```

Ohne `WITH CHECK` fällt Postgres beim UPDATE auf die `USING`-Bedingung zurück — die prüft nur `author = auth.uid()`. `po_insert` erzwingt dagegen, dass `kind = 'news'` nur Admins und `kind = 'club'` nur Venue-Manager setzen dürfen. Beim UPDATE fehlt das: Ein verifizierter Artist (darf `kind='artist'`-Posts anlegen) oder ein Club-Team kann den eigenen Post **nachträglich** auf `kind = 'news'` (offizielle News vortäuschen) oder `venue_id` auf einen fremden Club ändern.

**Fix** — `po_update` bekommt dieselbe Bedingung als `WITH CHECK` wie `po_insert`:

```sql
drop policy po_update on posts;
create policy po_update on posts for update
  using (author = auth.uid() or private.is_admin())
  with check (author = auth.uid() and (
       (kind = 'news'   and private.is_admin())
    or (kind = 'artist' and exists (select 1 from profiles where id = auth.uid() and role = 'artist' and verified))
    or (kind = 'club'   and venue_id is not null and private.manages_venue(venue_id))
  ) or private.is_admin());
```

---

## 6 — Funktionsfehler (Launch-Blocker): Melden-Funktion kaputt

**Wo:** `026_reports.sql` vs. `schema.sql` (Zeile 225).

`schema.sql` legt `reports` bereits an — mit **altem** Schema:

```sql
-- schema.sql
create table reports (
  reporter uuid ..., target_profile uuid, target_event bigint, target_message bigint,
  reason text, details text,
  status request_status not null default 'pending', ...);
```

Migration `026` nutzt `create table if not exists public.reports (...)` mit **neuem** Schema (`target_user`, `kind`, `ref_id`, `note`, `snippet`, `status text default 'open' check in ('open','done','dismissed')`). Weil die Tabelle schon existiert, **tut `026` beim Anlegen nichts** — live bleibt das alte Schema. Folgen:

- `026`-Policy `reports_insert_own` verlangt `status = 'open'`, aber `status` ist der Enum `request_status` (Werte `pending/...`) — `'open'` ist dort ungültig → Insert bzw. Policy-Auswertung schlägt fehl.
- Neue Spalten (`target_user`, `kind`, `ref_id`, `snippet`) existieren live nicht → der Client, der sie benutzt, bekommt Fehler.
- Web-App und Flutter nutzen unterschiedliche Spaltensätze (alt vs. neu) → mindestens eine der beiden Melden-Funktionen ist tot.
- Zusätzlich koexistieren die alten `rp_*`-Policies aus `schema.sql` mit den neuen `reports_*`-Policies.

Das ist **release-relevant**: Apple verlangt eine funktionierende Melden-Funktion für Nutzerinhalte (Review Guideline 1.2), der DSA (Art. 16) ebenfalls.

**Fix** — eine Quelle der Wahrheit herstellen. Sauberste Variante: Migration `026` ersetzt das alte Schema aktiv, statt sich auf `if not exists` zu verlassen. Da die App noch vor der Beta steht und `reports` kaum Produktivdaten hat, ist ein kontrollierter Rebuild vertretbar — **aber** die Projektregel „keine DROP/DELETE in Migrationen" beachten: das mit dir/Jannik abstimmen, bevor es nach `main` geht. Minimal-invasiv ohne DROP:

```sql
-- 029_reports_fix.sql — altes reports-Schema auf das neue angleichen (ohne DROP TABLE)
alter table public.reports add column if not exists target_user uuid references auth.users(id) on delete set null;
alter table public.reports add column if not exists kind    text;
alter table public.reports add column if not exists ref_id  bigint;
alter table public.reports add column if not exists note    text;
alter table public.reports add column if not exists snippet text;
-- status-Spalte von enum request_status auf text migrieren:
alter table public.reports alter column status drop default;
alter table public.reports alter column status type text using (
  case status::text when 'pending' then 'open' when 'accepted' then 'done' when 'rejected' then 'dismissed' else 'open' end);
alter table public.reports alter column status set default 'open';
alter table public.reports add constraint reports_status_chk check (status in ('open','done','dismissed')) not valid;
-- danach: alte rp_*-Policies droppen, nur die reports_*-Policies aus 026 behalten.
```

**Wichtig:** Exakte alten Enum-Werte und Spalten vor dem Schreiben per `\d reports` / Supabase-Introspektion gegen die Live-DB prüfen — das `case`-Mapping oben ist eine Annahme. Danach beide Apps auf **einen** Spaltensatz vereinheitlichen.

---

## Kleinkram (nicht blockierend)

- **RPC-Grants:** Einige Funktionen entziehen das Recht nur `anon` statt `public`. Folgenlos, weil die Funktionen selbst `auth.uid()` prüfen — bei Gelegenheit vereinheitlichen (`revoke ... from public, anon`).
- **Banner-Bilder von Fremd-Servern:** `banner_url` lädt Bilder von beliebigen Hosts → deren Betreiber sehen die IPs der Besucher. Für die Beta überlegen: Bilder in Supabase Storage spiegeln oder auf Allowlist beschränken.
- **Keine CSP:** Web-App liefert keine Content-Security-Policy aus. Kein akuter Bug (HTML ist escaped), aber Defense-in-Depth — via GitHub-Pages-Meta-Tag oder Header.
- **„Ich gehe hin" standardmäßig öffentlich** (`attendance.visible` default true, `going_visible` default true): bei einer Szene-App ein Stalking-Risiko. Überlegen, ob default `false` besser passt (oder im Onboarding bewusst abfragen).

---

## Verifikationsstatus

| Finding | Im Code bestätigt | Gegen Live-DB geprüft |
|---------|:---:|:---:|
| 1–6 | ✅ | ❌ (Egress-Proxy blockt Supabase) |

Die scharfe Prüfung gegen die laufende Instanz steht noch aus — read-only mit dem anon-Key kannst du selbst machen (dein Projekt, genau das, was dein Browser ohnehin tut). Das Prüfskript dafür liegt bereits bei dir (`rave_rls_check.sh`); die Logik-Bugs 1–5 brauchen einen eingeloggten Test-Account auf einer **Testkopie** (ein Titel wie „Time Warp" feuert sonst echte Pushes an Follower).

---

## Umsetzung (27.11.2026, Branch `dev`)

Alle sechs Funde sind in **`supabase/migrations/030_security_fixes.sql`** behoben, Web-App und Flutter sind angepasst. **Wirksam erst, wenn 030 im Supabase-SQL-Editor ausgeführt ist** (vorher 029). Die Migration ist idempotent und kommt ohne `DROP TABLE/COLUMN` und `DELETE` aus.

| # | Umsetzung |
|---|-----------|
| 1 | Ändert ein Nicht-Admin bei einem veröffentlichten Event `title`, `ticket_url`, `source_url` oder `image_url` (Banner heißt im Schema `image_url`), geht es zurück auf `pending`. Line-up-Änderungen ebenso (Trigger auf `event_lineup`, außer in den ersten 10 Minuten nach dem Anlegen). Niemand außer Admins kann selbst veröffentlichen, auch nicht verifizierte Artists. `ticket_status` allein löst keine Prüfung aus (der Link ist schon geprüft). Ticket- und Veranstalter-Pushes feuern nur für veröffentlichte Events. |
| 2 | `check_in(event, lat, lon)`: der Server rechnet den 400-m-Abstand selbst, die Position wird nur verglichen und nie gespeichert (Regel 7). `check_in(event)` ist gesperrt. Datenschutzerklärung, Check-in-Text und iOS-Standorttext sind angepasst. Bereits bestehende Check-ins bleiben (kein DELETE). |
| 3 | `invite_connect` prüft Blockieren, `dm_open` des Einladenden und höchstens 20 neue 1:1-Chats pro Stunde. |
| 4 | Block-Prüfung beim Schreiben nur noch in 1:1-Chats. In Gruppen blendet `m_read` Nachrichten blockierter Personen aus (beidseitig). Statt `drop policy` per `alter policy`. |
| 5 | `po_update` hat jetzt `WITH CHECK`: `news` nur Admins, `artist` nur verifizierte Artists, `club` nur das eigene Club-Team. Per `alter policy`. |
| 6 | `reports` bekommt die Spalten aus 026, `status` wird Text (`open/done/dismissed`), die alte „genau ein Ziel“-Prüfung entfällt, neue Prüfungen gelten für neue Zeilen (`not valid`). Web und Flutter nutzen jetzt denselben Spaltensatz (`kind`, `ref_id`, `target_user`, `reason` als Code, `note`). `kind` kennt zusätzlich `event`, `reason` zusätzlich `wrong_info`. |

Lokal gegen Postgres 16 getestet (schema.sql + alle Migrationen, 030 zweimal hintereinander): jeder Angriffsweg aus 1–6 wird abgewiesen, normale Nutzung geht weiter. **Nicht** gegen die Live-DB geprüft.

Offen aus „Kleinkram“: Banner-Bilder von Fremd-Servern, CSP, Voreinstellung „Ich gehe hin“ öffentlich. In Gruppenchats zeigt die Chatliste (`my_chats2`) als letzte Nachricht evtl. noch Text einer blockierten Person.
