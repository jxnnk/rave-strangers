-- 011: headlines get a language; German feeds (Groove, Raveline) added. The app shows headlines in the interface language first.
alter table headlines add column if not exists lang text not null default 'en' check (lang in ('de','en'));
update headlines set lang = 'de' where source in ('Groove','Raveline');
-- private.refresh_headlines() now reads Groove + Raveline (de) and Mixmag + DJ Mag (en); see the function in the database.
