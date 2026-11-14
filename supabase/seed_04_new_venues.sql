-- New venues found after the big import (applied in Supabase)
-- Printhouse: new club in a former newspaper printing plant, open since 5 Sep 2026 (temporary use). Source: in-muenchen.de; position: OSM "Druckhaus Dessauerstraße".
insert into venues (name, city, address, lat, lon, approx, kind)
select 'Printhouse', 'München', 'Dessauerstraße 10, 80992 München', 48.1803634, 11.5324467, false, 'club'
where not exists (select 1 from venues where name ilike 'printhouse%');

-- Festival grounds (Germany + international), added 2026-11-12
insert into venues(name,city,address,lat,lon,approx,website,kind) values
 ('Maimarkthalle','Mannheim','Xaver-Fuhr-Straße 101, 68163 Mannheim',49.4683637,8.5239462,false,'https://www.time-warp.de/germany/mannheim/','event_site'),
 ('Westfalenhallen','Dortmund','Rheinlanddamm 200, 44139 Dortmund',51.4965148,7.4569324,false,'https://mayday.de/','event_site'),
 ('Ferropolis','Gräfenhainichen','Ferropolisstraße 1, 06773 Gräfenhainichen',51.7589553,12.4466641,false,'https://www.hive-festival.de/','event_site'),
 ('Airport Weeze (Parookaville)','Weeze','Flughafen-Ring, 47652 Weeze',51.6031019,6.1433899,false,'https://www.parookaville.com/','event_site'),
 ('Raketenbasis Pydna','Kastellaun','Raketenbasis Pydna, 56288 Kastellaun',50.0434566,7.4255143,false,'https://www.nature-one.de/','event_site'),
 ('Dürener Badesee','Düren','Am Badesee 1, 52349 Düren',50.8039001,6.4386762,false,'https://nibirii.com/','event_site'),
 ('Houtrak Spaarnwoude','Amsterdam (NL)','Houtrak, Spaarnwoude, Amsterdam, Niederlande',52.4003465,4.8000331,true,'https://www.awakenings.com/','event_site'),
 ('Parco Dora','Turin (IT)','Parco Dora, Corso Mortara, Torino, Italien',45.0897221,7.6666862,false,'https://www.kappafuturfestival.it/','event_site'),
 ('Beekse Bergen (Awakenings)','Hilvarenbeek (NL)','Beekse Bergen, 5081 NV Hilvarenbeek, Niederlande',51.5250552,5.1197983,true,'https://www.awakenings.com/','event_site'),
 ('The Garden Resort','Tisno (HR)','The Garden Resort, Tisno, Kroatien',43.8000969,15.6571124,false,'https://dekmantelselectors.com/','event_site');

-- 2026-11-13: neue Festival-Gelände (nächtlicher Event-Updater)
insert into venues (name, city, address, lat, lon, approx, website, kind) values
 ('Flugplatz Neustadt-Glewe (Airbeat One)','Neustadt-Glewe','Flugplatz, 19306 Neustadt-Glewe',53.3613328,11.6141158,false,'https://airbeat-one.de/','event_site'),
 ('Fira Gran Via','Barcelona (ES)','Av. Joan Carles I 64, 08908 L''Hospitalet de Llobregat',41.3567099,2.1259534,true,'https://sonar.es/','event_site');

-- 2026-11-13: SonneMondSterne-Gelände
insert into venues (name, city, address, lat, lon, approx, website, kind) values
 ('Saalburg Beach (SonneMondSterne)','Saalburg-Ebersdorf','Wetteraweg 2, 07929 Saalburg-Ebersdorf',50.5092166,11.7212712,false,'https://www.sonnemondsterne.de/','event_site');

-- 2026-11-14: Contact Festival, Stone Techno, Fairground, Ruhr-in-Love, Monegros
insert into venues (name, city, address, lat, lon, approx, website, kind) values
 ('Zenith (Kulturhalle)','München','Lilienthalallee 29, 80939 München',48.1946864,11.6078535,false,null,'event_site'),
 ('Zeche Zollverein','Essen','Gelsenkirchener Straße 181, 45309 Essen',51.4866151,7.0459905,false,'https://stone-techno.com/','event_site'),
 ('Messegelände Hannover','Hannover','Messegelände, 30521 Hannover',52.3246223,9.8056327,false,'https://fairground-festival.de/','event_site'),
 ('OLGA Park','Oberhausen','OLGA-Park, Osterfeld, 46117 Oberhausen',51.5013469,6.8746128,false,'https://www.ruhr-in-love.de/','event_site'),
 ('Monegros Desert (Festivalgelände)','Fraga (ES)','N-II km 416, Fraga, Huesca, Spain',41.4762813,0.2035917,true,'https://monegrosfestival.com/','event_site');
