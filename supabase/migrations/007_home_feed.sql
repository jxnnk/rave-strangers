-- Home feed: own posts (news by admins, artist posts by verified artists, club posts by approved organisers)
-- and a headline ticker from public RSS feeds (title + link to the original only, no article text).

create table if not exists posts (
  id         bigint generated always as identity primary key,
  author     uuid not null references profiles(id) on delete cascade,
  kind       text not null default 'news' check (kind in ('news','artist','club')),
  venue_id   bigint references venues(id) on delete set null,
  title      text not null check (length(title) between 3 and 140),
  body       text check (length(body) <= 4000),
  link       text check (link is null or link ~ '^https?://'),
  published  boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists posts_recent on posts(created_at desc) where published;
alter table posts enable row level security;
create policy po_read   on posts for select using (published or author = auth.uid() or private.is_admin());
create policy po_insert on posts for insert with check (author = auth.uid() and (
     (kind = 'news'   and private.is_admin())
  or (kind = 'artist' and exists (select 1 from profiles where id = auth.uid() and role = 'artist' and verified))
  or (kind = 'club'   and venue_id is not null and private.manages_venue(venue_id))));
create policy po_update on posts for update using (author = auth.uid() or private.is_admin());
-- no delete policy: posts are hidden by setting published = false

create table if not exists headlines (
  url          text primary key,
  source       text not null,
  title        text not null,
  published_at timestamptz,
  fetched_at   timestamptz not null default now()
);
alter table headlines enable row level security;
create policy hl_read on headlines for select using (true);

-- Turn XML/HTML entities back into characters (&amp; -> &, &#8217; -> ’).
create or replace function private.unent(t text) returns text
language plpgsql immutable set search_path = public, private as $$
declare m text[];
begin
  if t is null then return null; end if;
  t := replace(replace(replace(replace(replace(replace(t, '&lt;', '<'), '&gt;', '>'), '&quot;', '"'), '&apos;', ''''), '&#039;', ''''), '&nbsp;', ' ');
  for m in select regexp_matches(t, '&#(\d+);', 'g') loop
    t := replace(t, '&#' || m[1] || ';', chr(m[1]::int));
  end loop;
  for m in select regexp_matches(t, '&#x([0-9a-fA-F]+);', 'g') loop
    t := replace(t, '&#x' || m[1] || ';', chr(('x' || lpad(m[1], 8, '0'))::bit(32)::int));
  end loop;
  return replace(t, '&amp;', '&');
end $$;

create or replace function private.refresh_headlines() returns int
language plpgsql security definer set search_path = public, private, extensions as $$
declare f record; r record; doc xml; it xml; t text; l text; d text; ts timestamptz; n int := 0;
begin
  perform extensions.http_set_curlopt('CURLOPT_TIMEOUT', '15');
  for f in select * from (values
      ('Groove',  'https://groove.de/feed/'),
      ('Mixmag',  'https://mixmag.net/rss.xml'),
      ('DJ Mag',  'https://djmag.com/rss.xml')) v(src, url) loop
    begin
      select * into r from extensions.http(('GET', f.url,
        array[extensions.http_header('User-Agent', 'RaveStrangers/0.1 (+https://github.com/jxnnk/rave-strangers)')], null, null)::extensions.http_request);
      if r.status <> 200 then continue; end if;
      doc := xmlparse(document r.content);
      foreach it in array xpath('/rss/channel/item', doc) loop
        t := private.unent(trim((xpath('/item/title/text()', it))[1]::text));
        l := private.unent(trim((xpath('/item/link/text()', it))[1]::text));
        d := (xpath('/item/pubDate/text()', it))[1]::text;
        if t is null or l is null or l !~ '^https?://' then continue; end if;
        begin ts := d::timestamptz; exception when others then ts := now(); end;
        insert into headlines (url, source, title, published_at) values (l, f.src, left(t, 300), ts)
          on conflict (url) do update set title = excluded.title;
        n := n + 1;
      end loop;
    exception when others then
      raise notice 'feed % failed: %', f.src, sqlerrm;
    end;
  end loop;
  return n;
end $$;
revoke execute on function private.refresh_headlines() from public, anon, authenticated;
revoke execute on function private.unent(text) from public, anon, authenticated;

-- Refresh every hour (minute 17, to stay off the full hour).
create extension if not exists pg_cron;
select cron.schedule('refresh-headlines', '17 * * * *', 'select private.refresh_headlines()');
