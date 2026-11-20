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

-- 2026-11-15 nightly updater
insert into venues (name, city, address, lat, lon, approx, website, kind) values
 ('Rebstockpark','Frankfurt','Rebstockpark, Bockenheim, Frankfurt am Main',50.1105075,8.6147248,true,'https://www.lovefamilypark.com','event_site'),
 ('Spindler & Klatt','Berlin','Köpenicker Straße 16-17, 10997 Berlin',52.5058141,13.4347954,false,null,'club');

-- 2026-11-16 nightly updater
insert into venues (name, city, address, lat, lon, approx, website, kind) values
 ('Strijkviertel (Verknipt Festival)','Utrecht (NL)','Strijkviertel, Leidsche Rijn, Utrecht',52.0734578,5.0638091,true,'https://www.verknipt.org/','event_site'),
 ('Ziggo Dome','Amsterdam (NL)','Arena boulevard 61-75, 1101 DL Amsterdam',52.3134068,4.9371231,false,null,'event_site');

-- 2026-11-18 nightly updater
insert into venues (name, city, address, lat, lon, approx, website, kind) values
 ('Melodrom','Kaufbeuren','Sudetenstraße 12, 87600 Kaufbeuren',47.8999084,10.6429401,false,'https://www.melodrom.de/','club'),
 ('HanseMesse Rostock','Rostock','Zur HanseMesse 1, 18106 Rostock',54.1391840,12.0731330,false,null,'event_site'),
 ('Weser-Ems-Hallen','Oldenburg','Messestraße, 26123 Oldenburg',53.1482599,8.2318406,true,null,'event_site'),
 ('Alpincenter Wittenburg','Wittenburg','Ziggelmark, 19243 Wittenburg',53.5037331,11.0280729,true,null,'event_site'),
 ('Brauclub','Chemnitz','Neumarkt 2, 09111 Chemnitz',50.8332536,12.9210616,false,null,'club'),
 ('KRAFTVERKEHR','Chemnitz','Fraunhoferstraße 60, 09120 Chemnitz',50.8080012,12.9231691,false,null,'event_site'),
 ('Clubzentrum COMMA','Gera','Heinrichstraße 47, 07545 Gera',50.8719578,12.0761582,false,null,'club'),
 ('Stadthalle Weißenfels','Weißenfels','Beuditzstraße 69a, 06667 Weißenfels',51.2017761,11.9570982,false,null,'event_site'),
 ('NDSM-Werf (DGTL)','Amsterdam (NL)','NDSM, Amsterdam-Noord',52.4003737,4.8929539,true,null,'event_site'),
 ('Amsterdamse Bos','Amsterdam (NL)','Amsterdamse Bos, Amstelveen',52.3115707,4.8283374,true,null,'event_site'),
 ('Karree','Freiburg','Fahnenbergplatz 3, 79098 Freiburg im Breisgau',47.9978301,7.8485052,false,null,'club');

-- 2026-11-18 manueller Lauf (Bayern/BW)
insert into venues (name, city, address, lat, lon, approx, website, kind) values
 ('ROXY – Kultur in Ulm','Ulm','Schillerstraße, 89077 Ulm',48.3916798,9.9855877,false,null,'club'),
 ('Hallo Werner','Augsburg','Schrannenstraße 8, 86150 Augsburg',48.3654108,10.8909229,false,null,'club');

-- 2026-11-19 nächtlicher Lauf (Sachsen-Anhalt/MV/Brandenburg, NRW, Festivals)
insert into venues (name, city, address, lat, lon, approx, website, kind) values
 ('Helgas Stadtpalast','Rostock','Am Vögenteich 19, 18057 Rostock',54.0852224,12.1252806,false,null,'club'),
 ('Zwischenbau','Rostock','Erich-Schlesinger-Straße 19a, 18059 Rostock',54.0787788,12.1146801,false,null,'club'),
 ('Burg Storkow','Storkow (Mark)','Schloßstraße, 15859 Storkow (Mark)',52.2528076,13.9332350,true,null,'event_site'),
 ('FZW','Dortmund','Ritterstraße 20, 44137 Dortmund',51.5149728,7.4501291,false,null,'club'),
 ('Drucklufthaus','Oberhausen','Am Förderturm 27, 46049 Oberhausen',51.4726361,6.8465168,false,null,'club'),
 ('Auto Böhler Schrottplatz (Hasardeur)','Karlsruhe','Ottostraße 6, 76227 Karlsruhe',48.9973298,8.4477550,false,'https://hasardeur-festival.de/','event_site'),
 ('Stoppelmarkt Vechta','Vechta','Stoppelmarkt, 49377 Vechta',52.7479851,8.2956479,true,'https://www.tantemiatanzt.de/','event_site');

-- Nachtlauf 2026-11-20
insert into venues (name, city, address, lat, lon, approx, website, kind) values
 ('Bukowski (BUKO)','Heilbronn','Hafenstraße 36, 74076 Heilbronn',49.1495419,9.2050668,false,'https://www.bukowski-live.de','club'),
 ('Reithalle Strasse E','Dresden','Werner-Hartmann-Straße 2, 01099 Dresden',51.0855930,13.7644580,false,null,'club'),
 ('Kuckucksei','Nürtingen','Neckarstraße, 72622 Nürtingen',48.6268394,9.3311079,false,null,'club'),
 ('Vybe Club','Paderborn','Marienstraße 20, 33098 Paderborn',51.7180443,8.7496520,false,null,'club'),
 ('Kulturwerft Gollan','Lübeck','Einsiedelstraße (Innovationszentrum), 23554 Lübeck',53.8771899,10.6846129,false,null,'club'),
 ('Holstenhallen','Neumünster','Holstenhallen, Neumünster',54.0922185,9.9740844,true,null,'event_site'),
 ('Studio dB','Berlin','Uferstraße 8-11, 13357 Berlin',52.5522701,13.3735644,false,null,'club'),
 ('809 Club','Essen','Kopstadtplatz 25, 45127 Essen',51.4579196,7.0112043,false,null,'club'),
 ('Alte MFR Fabrikhalle','Leutershausen','Am Graben 12, 91578 Leutershausen',49.2995921,10.4050617,true,null,'event_site'),
 ('Die Scheuer','Idstein','Wallbacher Straße 2, 65510 Idstein-Wörsdorf',50.2458451,8.2548198,false,null,'club'),
 ('Jugendhaus Ost','Wolfsburg','Walter-Flex-Weg 2, 38446 Wolfsburg',52.4187785,10.7999869,false,null,'club'),
 ('Schongauer Brauhaus','Schongau','Altenstadter Straße, 86956 Schongau',47.8166020,10.8918554,false,null,'club'),
 ('H1 Club & Lounge','Hamburg','Kiebitzhof, 22089 Hamburg',53.5638484,10.0363951,false,null,'club'),
 ('Studentenclub Block 17','Wismar','Philipp-Müller-Straße 20, 23966 Wismar',53.8900575,11.4434479,false,null,'club'),
 ('Mauerpfeiffer','Saarbrücken','Lebacher Straße 7a, 66113 Saarbrücken',49.2429378,6.9808294,false,null,'club'),
 ('Exerzierhalle Wittenberg','Lutherstadt Wittenberg','Lutherstraße 57, 06886 Lutherstadt Wittenberg',51.8701175,12.6442412,false,null,'event_site'),
 ('The Soho Stage','Augsburg','Ludwigstraße 32, 86152 Augsburg',48.3708567,10.8933176,false,null,'club');
