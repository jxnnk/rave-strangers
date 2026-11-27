/* Rave Strngrs – web app (real data via Supabase).
   Plain JavaScript, no build step. Hash routing: #events, #event-<id>, #map, #map-<venueId>, #club-<id>,
   #artists, #u-<handle>, #connect, #me, #login, #new-event, #promoter, #admin. */
(function(){
'use strict';

var SB_URL='https://wnmxloykrnbrpvzxhnsb.supabase.co';
var SB_KEY='sb_publishable_4vHWXBP7d04RUXs7lOQ9nA_yys9gxdN';   /* publishable key: safe in the browser, protected by Row Level Security */
/* Mail-Links (Passwort, Bestätigung) kommen als #access_token=…&type=recovery zurück.
   Ältere Links hängen das an einen vorhandenen Hash (#newpw#access_token=…), das versteht supabase-js nicht:
   vorher geradeziehen. Und merken, dass es ein Passwort-Link war. */
(function(){ var h=location.hash||'', i=h.indexOf('access_token=');
  if(i>1){ h='#'+h.slice(i); try{ history.replaceState(null,'',location.pathname+location.search+h); }catch(e){ location.hash=h; } }
  if(/type=recovery/.test(location.hash||'')){ try{ sessionStorage.setItem('rs-recovery','1'); }catch(e){} }
})();
var sb=window.supabase.createClient(SB_URL,SB_KEY);
/* Ziel für Mail-Links: die Startseite ohne Hash (ein Hash im Ziel würde die Anmelde-Daten im Link kaputt machen) */
function authBack(){ return location.origin+location.pathname; }

/* ---------- Texts ---------- */
var T={
  de:{
    org_label:'Label',org_collective:'Kollektiv',org_series:'Eventreihe',org_promoter:'Veranstalter',org_festival:'Festival',by_org:'Veranstaltet von',org_dates:'Nächste Termine',org_none:'Gerade keine Termine bei uns. Folge, dann sagen wir Bescheid.',org_next_n:'{n} Termine',org_follow_toast:'Du bekommst Bescheid, wenn neue Termine kommen.',orgs_t:'Kollektive & Labels',orgs_search:'z. B. UNREAL, 44 Label, Teletech',note_new_org:'Neu von {o}: {e}',follow:'Folgen',following_btn:'Du folgst',
    tagline:'Nie mehr allein raven.',new_here:'Neu hier? Konto erstellen',have_account:'Schon dabei? Einloggen',skip:'Erst mal umschauen',legal_hint:'Mit der Anmeldung akzeptierst du Nutzungsbedingungen und Datenschutz.',
    loc_btn:'Meine Stadt finden',loc_wait:'Suche deine Stadt …',loc_ok:'Stadt: {c}',loc_far:'Nächste Stadt mit Events: {c}',loc_fail:'Standort nicht gefunden. Wähl deine Stadt einfach aus.',loc_denied:'Standort nicht erlaubt. Du kannst die Stadt auch auswählen.',loc_none:'Dein Gerät kann keinen Standort liefern.',
    followers_l:'Follower',following_l:'Folgt',write_dm:'Schreiben',
    edit_profile:'Profil bearbeiten',
    av_t:'Profilbild', av_pick:'Bild wählen', av_change:'Bild ändern', av_del:'Entfernen', av_hint:'JPG oder PNG. Wird quadratisch zugeschnitten.', av_busy:'Lädt hoch …', av_ok:'Profilbild gespeichert', av_gone:'Profilbild entfernt', av_err:'Bild konnte nicht hochgeladen werden', av_add:'Profilbild hinzufügen',
    crew_group:'Crew-Gruppe',crew_group_join:'Crew-Gruppe beitreten',leave_group:'Gruppe verlassen',send_to_chat:'In Chat senden',sent_ok:'Gesendet.',event_msg:'hat ein Event geteilt',event_gone:'Event nicht mehr verfügbar',members_n:'{n} Mitglieder',open:'Öffnen',invite_t:'Freunde einladen',invite_sub:'Wer über deinen Link mitmacht, landet direkt in einem Chat mit dir.',invite_msg:'Komm zu Rave Strngrs, dann gehen wir zusammen raven 🖤',invite_n:'{n} über deinen Link dabei',qr_t:'Dein QR-Code',qr_sub:'Im Club zeigen: scannen, mitmachen, schon seid ihr im Chat.',copy_link:'Link kopieren',
    highlight:'Highlight',
    settings:'Einstellungen',set_account:'Konto',set_privacy:'Privatsphäre',set_session:'Sitzung',set_email:'E-Mail ändern',set_email_hint:'Wir schicken dir einen Bestätigungslink an die neue Adresse. Erst nach dem Klick wird sie geändert.',set_email_sent:'Check dein Postfach und bestätige die neue Adresse.',reset_rate:'Gerade wurden zu viele Mails verschickt. Versuch es in einer Stunde nochmal.',set_notify_tickets:'Ticket-Alarm',set_notify_tickets_sub:'Wenn Tickets für gemerkte Events rauskommen',set_notify_new:'Neue Termine',set_notify_new_sub:'Wenn Clubs, denen du folgst, neue Events haben',set_notify_reminder:'Erinnerung',set_notify_reminder_sub:'Am Tag vor deinen Events',set_dm_open:'Nachrichten von allen',set_dm_open_sub:'Aus: Nur Leute, mit denen du schon schreibst, erreichen dich',set_going_visible:'„Ich gehe hin“ öffentlich',set_going_visible_sub:'Andere sehen, dass du hingehst (gilt für neue Zusagen)',set_blocked:'Blockierte Personen',set_blocked_none:'Du hast niemanden blockiert.',unblock:'Freigeben',
    signup_exists:'Mit dieser E-Mail gibt es schon ein Konto. Melde dich an oder nutze „Passwort vergessen?“.',
    alarm_set:'Ticket-Alarm',alarm_on:'Ticket-Alarm an',alarm_note:'Noch keine Tickets? Aktivier den Ticket-Alarm, wir sagen dir Bescheid, sobald sie da sind.',alarm_toast:'Ticket-Alarm an. Wir melden uns, sobald es Tickets gibt.',get_tix:'Tickets',inbox_t:'Benachrichtigungen',inbox_empty:'Noch nichts da. Merk dir Events oder folge Clubs. Dann melden wir uns hier, sobald Tickets rauskommen oder neue Termine dazukommen.',note_tickets:'Tickets sind da: {e}',note_new:'Neu bei {v}: {e}',note_rem:'Morgen: {e}',inbox_note:'Push-Nachrichten aufs Handy kommen mit der App. Bis dahin landet alles hier.',
    nav_home:'Home',nav_events:'Events',nav_map:'Karte',nav_artists:'Artists',nav_connect:'Connect',nav_me:'Profil',
    home_hi:'Was geht',inst_t:'Rave Strngrs als App',inst_sub:'Leg die App auf deinen Startbildschirm. Dann öffnet sie sich wie eine normale App.',inst_btn:'Installieren',inst_ios:'Auf dem iPhone: unten auf Teilen tippen, dann „Zum Home-Bildschirm“.',inst_x:'Später',ride_t:'Mitfahren',ride_sub:'Fährst du mit dem Auto hin und hast Plätze frei? Oder suchst du eine Mitfahrt? Schreib den Fahrer direkt an und teilt euch die Spritkosten.',ride_from:'Abfahrt in',ride_when:'Abfahrtszeit',ride_seats:'Freie Plätze',ride_note:'Hinweis (optional)',ride_note_ph:'z.B. Rückfahrt ca. 6 Uhr, Spritkosten teilen',ride_offer:'Mitfahrt anbieten',ride_none:'Noch keine Mitfahrten. Fährst du hin? Biete Plätze an.',ride_login:'Logg dich ein, um Mitfahrten zu sehen und anzubieten.',ride_line:'{from} → {to}',ride_seats_n:'{n} Plätze frei',ride_seat_1:'1 Platz frei',ride_open:'+ Mitfahrt anbieten',ride_mine:'Deine Fahrt',del_t:'Konto löschen',del_sub:'Löscht dein Profil, deine Zusagen, Crew-Einträge, Nachrichten und Bewertungen endgültig. Das lässt sich nicht rückgängig machen.',del_btn:'Konto endgültig löschen',del_q:'Wirklich löschen? Tipp zur Bestätigung LÖSCHEN ein.',del_word:'LÖSCHEN',del_done:'Dein Konto wurde gelöscht.',crew_find:'Crew finden',crew_find_sub:'Allein unterwegs oder noch Platz in der Gruppe? Schreib kurz, wer du bist. Andere können dich direkt anschreiben.',crew_ph:'z.B. Wir sind zu zweit aus Neukölln und suchen noch Leute zum Vorglühen und Hingehen',crew_post:'Eintragen',crew_del:'Löschen',crew_none:'Noch sucht niemand Anschluss. Trag dich als Erste:r ein.',crew_login:'Logg dich ein, um zu sehen, wer für diesen Abend noch Leute sucht.',crew_mine:'Dein Eintrag',msg_btn:'Nachricht',chats:'Chats',chats_none:'Noch keine Chats. Schreib Leute bei einem Event unter „Crew finden“ an.',chat_ph:'Nachricht …',send:'Senden',chat_safety:'Triff dich zuerst an öffentlichen Orten und teil nur, was du teilen willst.',rate_limited:'Zu viele Nachrichten, warte kurz.',unread_n:'{n} neu',chat_with:'Chat mit {n}',you_:'Du',block_q:'{n} blockieren? Ihr seht euch dann nicht mehr und könnt euch nicht mehr schreiben.',crew_cnt:'{n} suchen Leute',pick_kicker:'Willkommen',pick_t:'Wo ravst du?',pick_sub:'Wähl deine Stadt, dann zeigen wir dir zuerst, was dort läuft. Du kannst sie jederzeit oben ändern.',pick_other:'Andere Stadt',pick_all:'Überall in DE',crew_t:'Wer kommt mit?',crew_sub:'Schick das Event in deine Gruppe. Wer zusagt, sieht, wer noch hingeht.',crew_wa:'In WhatsApp teilen',crew_more:'Teilen …',crew_copy:'Link kopieren',crew_msg:'Kommst du mit? 🖤',crew_going:'{n} gehen schon hin',adm_refs:'Herkunft (30 Tage)',adm_refs_sub:'Besuche über geteilte Links und neue Konten je Quelle.',ref_visits:'Besuche',ref_signups:'Konten',home_hi_name:'Was geht, {n}',home_sub:'Dein Wochenende, News aus der Szene und was neu ist.',home_city:'Stadt',home_all:'Überall',
    home_weekend:'Dein Wochenende',home_today:'Heute und morgen',home_weekend_none:'Für dieses Wochenende ist hier noch nichts eingetragen.',home_all_events:'Alle Events',
    home_remind:'Du gehst hin',home_new:'Neu in der App',home_news:'News',home_ticker:'Aus der Szene',home_kicker:'Techno · Deutschland · Heute Nacht',ticker_note:'Schlagzeilen von Groove, Mixmag und DJ Mag. Ein Tipp öffnet den Artikel beim Magazin.',
    no_posts:'Noch keine Beiträge.',post_write:'Beitrag schreiben',post_title:'Überschrift',post_body:'Text',post_link:'Link (optional)',post_publish:'Veröffentlichen',post_done:'Beitrag ist online',
    kind_news:'Redaktion',kind_artist:'Artist',kind_club:'Club',home_artists:'Verifizierte Artists entdecken',ago_now:'gerade eben',ago_min:'vor {n} Min.',ago_h:'vor {n} Std.',ago_d:'vor {n} Tagen',ago_1d:'gestern',
    banner:'Beta: Events aus öffentlichen Kalendern (ohne Gewähr). Konten sind echt.',
    loading:'Lädt …',load_err:'Die Daten konnten nicht geladen werden. Prüf deine Verbindung und lade neu.',retry:'Neu laden',
    events_title:'Raves in Deutschland',events_sub:'Finde Nächte, DJs und Leute, die auch hinwollen.',
    search:'Suche',search_ph:'Event, Club oder DJ',city:'Stadt',all_cities:'Alle Städte',when:'Zeitraum',
    when_all:'Alle Termine',when_week:'Nächste 7 Tage',when_month:'Nächste 30 Tage',genre_all:'Alle Genres',
    type_all:'Alles',type_club:'Clubnächte',type_fest:'Festivals & Open Airs',fest_tag:'Festival',fest_note:'Alle bestätigten Festivals in Deutschland und Europa für die nächsten Monate. Im normalen Kalender tauchen sie etwa zwei Monate vorher auf.',kind_event_site:'Festival- und Event-Gelände',kind_seasonal:'Open Air, nur in der Saison',kind_note:'Erscheint auf der Karte nur, wenn hier etwas ansteht.',f_end:'Ende (optional, bei mehrtägigen Events)',
    n_events:'{n} Events',none_found:'Keine Events gefunden. Probier weniger Filter.',going_n:'{n} aus der Community',
    back:'Zurück',date:'Datum',time:'Beginn',venue:'Ort',tba:'siehe Quelle',lineup:'Line-up',and_more:'und {n} weitere',
    lineup_tba:'Das Line-up steht noch nicht fest oder liegt uns nicht vor. Details über die Quelle.',
    banner_by:'Banner',
    who_goes:'Wer geht hin',nobody:'Noch niemand aus der Community. Sei die erste Person.',login_to_see:'Melde dich an, um zu sehen, wer hingeht.',
    go:'Ich gehe hin',going:'Du gehst hin',save_ev:'Merken',saved_ev:'Gemerkt',fr_n:'{n} deiner Leute',fr_going:'Von deinen Leuten gehen hin',home_friends:'Deine Leute gehen hin',home_foryou:'Für dich',foryou_note:'Events von Artists und Clubs, denen du folgst.',foryou_empty:'Folge Artists und Clubs, dann landen ihre Termine hier.',new_badge:'Neu',n_new:'{n} neu seit deinem letzten Besuch',following:'Folge ich',follow_club:'Club folgen',followed_club:'Du folgst dem Club',push_note:'Push-Benachrichtigungen kommen mit der Handy-App. Bis dahin siehst du Neues unter „Für dich“ auf Home.',cd_in:'Noch {t}',cd_live:'Läuft gerade',cd_h:'{h} Std {m} Min',cd_d:'{d} T {h} Std',tix_t:'Tickets',tix_available:'Tickets verfügbar',tix_few:'Nur noch wenige Tickets',tix_sold_out:'Ausverkauft',tix_unknown:'Ticketstatus unbekannt',tix_shop:'Tickets im Ticketshop',tix_price:'Preis',tix_official:'Offizieller Ticketshop',tix_resale_off:'Offizieller Wiederverkauf',tix_swap:'TicketSwap: Tickets für {v}',tix_swap_note:'TicketSwap ist ein Fan-zu-Fan-Marktplatz mit Käuferschutz. Der Link zeigt alle Angebote für diesen Club, wähl dort dein Datum. Nicht jedes Event wird auf TicketSwap gehandelt. Wir haben keine Verbindung zu TicketSwap.',scam_t:'Achtung vor Ticket-Betrug',scam_1:'Zahl nie per PayPal „Freunde & Familie“, Überweisung oder Gutscheinkarten an Fremde. Dann ist dein Geld weg.',scam_2:'Screenshots oder PDFs von Tickets können zigfach verkauft werden. Sicher ist nur eine offizielle Umschreibung auf deinen Namen.',scam_3:'Wer Druck macht („nur noch heute“, „schnell zahlen“), ist meistens Betrug.',scam_4:'Kauf am besten über offizielle Shops oder Plattformen mit Käuferschutz.',rr6:'Ticket-Betrug',f_price:'Preis (z. B. 15–20 €)',f_tstatus:'Ticketstatus',share_more:'',login_why:'Danach geht es direkt dort weiter, wo du warst.',no_rating:'Noch keine Bewertung',route:'Route',close:'Schließen',map_fail:'Die Karte kann auf diesem Gerät nicht geladen werden. Unten findest du alle Orte als Liste.',rev_t:'Bewertungen',rev_none:'Noch keine Bewertungen. Sei die erste Person!',rev_write:'Club bewerten',rev_edit:'Deine Bewertung ändern',rev_overall:'Gesamt',rev_sound:'Sound',rev_crowd:'Crowd',rev_door:'Tür & Einlass',rev_safety:'Awareness & Sicherheit',rev_body:'Was sollten andere wissen? (optional)',rev_send:'Bewertung speichern',rev_saved:'Danke für deine Bewertung!',rev_need_star:'Bitte gib mindestens eine Gesamtwertung.',rev_login:'Melde dich an, um den Club zu bewerten.',rev_n:'{n} Bewertungen',rev_one:'1 Bewertung',rev_rules:'Bewerte fair und aus eigener Erfahrung. Keine Namen von Türstehern oder Gästen.',pop_hint:'Tippen für Details',gcal:'In Google Kalender',share:'Teilen',copied:'Link kopiert',tickets:'Tickets & Infos',show_map:'Auf der Karte zeigen',
    nophone_t:'Foto- und Videoverbot',nophone_d:'Der Veranstalter nennt ein Foto- und Videoverbot. Das Handy bleibt in der Tasche, Connect davor und danach.',
    source_t:'Quelle',source_note:'Bitte Zeit, Line-up und Preis beim Veranstalter prüfen.',report_ev:'Falsche Angaben melden',
    aware_t:'Awareness & Sicherheit',aware_d:'Wenn es dir oder anderen nicht gut geht: Sprich das Awareness-Team, die Security oder das Barpersonal an. Im Notfall 112 anrufen.',aware_team:'Awareness vor Ort: {x}',
    pending:'In Prüfung',no_event:'Dieses Event gibt es nicht (mehr).',
    rules_t:'Regeln & Infos',r_phone:'Handy & Fotos',r_door:'Einlass',r_age:'Alter',r_access:'Barrierefreiheit',r_aware:'Awareness',not_set:'Noch nicht vom Club hinterlegt',photo_ban:'Fotoverbot, Handykamera wird am Einlass abgeklebt',
    upcoming:'Kommende Events',open_club:'Club-Seite',no_club:'Diesen Club gibt es nicht.',
    map_title:'Karte',map_sub:'Alle Clubs und Events auf einen Blick. Mit der Maus über einen Punkt fahren oder auf dem Handy antippen zeigt die Vorschau.',
    only_events:'Nur Orte mit Events',venues_t:'Alle Orte',ev_one:'1 Event',ev_many:'{n} Events',pick_marker:'Tippe auf einen Marker, um Events und Details zu sehen.',
    summary_map:'{v} Orte mit {e} Events im gewählten Zeitraum.',no_ev_here:'Keine Events an diesem Ort im gewählten Zeitraum.',
    approx:'Position ungefähr',zoom_in:'Vergrößern',zoom_out:'Verkleinern',zoom_reset:'Ganz Deutschland',leg_ev:'Mit Events',leg_none:'Ohne Events',zero:'keine Events',
    artists_title:'Artists',artists_sub:'DJs und Live-Acts mit verifiziertem Profil. Das rote Häkchen bedeutet: Identität geprüft.',
    no_artists:'Noch keine verifizierten Artists. Du legst auf? Beantrage die Verifizierung in deinem Profil.',verified:'Verifizierter Artist',
    connect_title:'Connect',connect_sub:'Leute, die zu denselben Events gehen wie du.',connect_login:'Melde dich an und markier Events mit "Ich gehe hin", dann siehst du hier, wer noch hingeht.',
    connect_none:'Noch niemand sonst bei deinen Events. Markier mehr Events oder lad Freunde ein.',goes_to:'geht zu',
    chat_soon:'Mitfahrgelegenheiten findest du direkt beim jeweiligen Event.',
    login_t:'Anmelden',signup_t:'Registrieren',email:'E-Mail',password:'Passwort',pw_hint:'Mindestens 8 Zeichen',display_name:'Anzeigename',
    login_btn:'Anmelden',signup_btn:'Konto erstellen',forgot:'Passwort vergessen?',reset_send_err:'Die Mail konnte gerade nicht verschickt werden. Das liegt an uns, nicht an dir. Bitte versuch es später nochmal.',reset_t:'Passwort zurücksetzen',reset_intro:'Kein Problem. Gib die E-Mail-Adresse deines Kontos ein, wir schicken dir einen Link.',reset_s1:'E-Mail eingeben und Link anfordern',reset_s2:'Mail öffnen und auf den neuesten Link tippen',reset_s3:'Neues Passwort festlegen, fertig',reset_btn:'Link senden',reset_sent_t:'Mail ist unterwegs',reset_sent_d:'Wenn es ein Konto mit {mail} gibt, kommt gleich eine Mail. Schau auch im Spam-Ordner. Öffne nur den neuesten Link, ältere werden ungültig.',reset_again:'Nochmal senden',reset_wait:'Nochmal senden in {n} s',reset_limit:'Gerade wurden zu viele Mails verschickt. Bitte versuch es in etwa einer Stunde nochmal.',reset_back:'Zurück zum Login',reset_open:'Passwort vergessen?',link_bad_t:'Link ungültig oder abgelaufen',link_bad_d:'Dieser Link funktioniert nicht mehr. Das passiert, wenn er älter ist oder schon ein neuerer verschickt wurde. Fordere einfach einen neuen an.',link_new:'Neuen Link anfordern',newpw_t:'Neues Passwort festlegen',newpw_l:'Neues Passwort (mind. 8 Zeichen)',newpw_l2:'Passwort wiederholen',newpw_btn:'Passwort speichern',newpw_ok:'Passwort geändert. Du bist eingeloggt.',newpw_mismatch:'Die Passwörter stimmen nicht überein.',newpw_need:'Öffne den Link aus der E-Mail „Passwort zurücksetzen“, um ein neues Passwort festzulegen.',change_pw:'Passwort ändern',reset_sent:'Wenn es ein Konto mit dieser E-Mail gibt, ist ein Link zum Zurücksetzen unterwegs.',
    signup_done:'Fast geschafft: Wir haben dir eine E-Mail geschickt. Klick auf den Link darin, dann bist du angemeldet.',
    login_need:'Dafür musst du angemeldet sein.',to_login:'Anmelden oder registrieren',logout:'Abmelden',
    terms:'Mit der Registrierung bestätigst du, dass du mindestens 18 Jahre alt bist.',age_ok:'Ich bin mindestens 18 Jahre alt.',
    err_generic:'Das hat nicht geklappt. Bitte versuch es noch einmal.',err_login:'E-Mail oder Passwort stimmt nicht, oder die E-Mail ist noch nicht bestätigt.',
    err_handle:'Dieser Nutzername ist schon vergeben.',err_handle_fmt:'Nutzername: 3 bis 30 Zeichen, nur a–z, 0–9, Punkt und Unterstrich.',err_pw:'Das Passwort braucht mindestens 8 Zeichen.',
    me_title:'Mein Profil',handle:'Nutzername',bio:'Über mich',bio_ph:'Was hörst du, wo tanzt du?',save:'Speichern',saved:'Gespeichert',soc_hint:'Socials verlinken',
    er_t:'Wie war das Event?',er_none:'Noch keine Bewertungen für dieses Event.',er_write:'Event bewerten',er_login:'Melde dich an, um das Event zu bewerten.',er_only_go:'Bewerten kann, wer dabei war. Tipp auf „Ich war dort“.',er_closed:'Bewertungen sind bis 3 Wochen nach dem Event möglich.',er_lineup:'Line-up & Musik',er_safety:'Sicherheit',er_aware:'Awareness & Wohlfühlen',er_was_there:'War vor Ort',er_verified_n:'{n} vor Ort eingecheckt',er_rules:'Bewerte fair und aus eigener Erfahrung. Keine Namen von Türstehern oder Gästen. Clubs und Veranstalter sehen dein Feedback.',er_torate:'Wie war es? Jetzt bewerten',er_torate_sub:'Deine letzten Events. Dein Feedback hilft Clubs und Veranstaltern, besser zu werden.',was_there:'Ich war dort',was_there_on:'Du warst dort',ci_t:'Bist du gerade hier?',ci_sub:'Tipp auf „Ich bin da“. Wir prüfen einmal, ob du in der Nähe des Clubs bist. Deine Position wird dafür nur verglichen und nie gespeichert.',ci_btn:'Ich bin da',ci_done:'Eingecheckt',ci_done_sub:'Deine Bewertung bekommt später das Häkchen „War vor Ort“.',ci_busy:'Prüfe Standort …',ci_ok:'Eingecheckt! Viel Spaß.',ci_far:'Du scheinst nicht am Club zu sein (mehr als 400 m entfernt).',ci_notnow:'Einchecken geht nur während des Events.',ci_denied:'Ohne Standort-Freigabe geht Einchecken nicht.',ci_err:'Einchecken hat nicht geklappt.',note_review:'Wie war „{e}“? Bewerte das Event.',org_rating:'Bewertung aus {n} Events-Feedbacks',my_going:'Ich gehe hin',my_saved:'Merkliste',my_subs:'Meine Einträge',none_yet:'Noch nichts.',
    verif_t:'Artist-Verifizierung',verif_none:'Du bist DJ oder Live-Act? Beantrage die Verifizierung. Dann bekommst du das rote Häkchen.',
    verif_name:'Artist-Name',verif_links:'Belege (Links, eins pro Zeile)',verif_links_ph:'z. B. Resident-Advisor-Seite, offizielles Instagram, Booking-Agentur',
    verif_btn:'Verifizierung beantragen',verif_pending:'Antrag eingegangen. Wir prüfen dein Profil und melden uns.',verif_rejected:'Dein letzter Antrag wurde abgelehnt. Du kannst einen neuen stellen.',verif_ok:'Dein Profil ist verifiziert.',
    admin_t:'Admin',admin_open:'Admin-Bereich öffnen',adm_verif:'Verifizierungs-Anträge',adm_events:'Events in Prüfung',rev_unclear:'Prüf-Agent unsicher',rev_waiting:'Wartet auf Prüfung',rev_live:'online',rev_note:'Prüf-Agent',adm_reports:'Meldungen',approve:'Freigeben',reject:'Ablehnen',publish:'Veröffentlichen',done:'Erledigt',
    profile_nf:'Dieses Profil gibt es nicht.',report:'Melden',block:'Blockieren',blocked:'Blockiert. Ihr seht euch gegenseitig nicht mehr.',report_reason:'Grund',
    rr1:'Belästigung',rr2:'Spam oder Fake-Profil',rr3:'Gefährliches Verhalten',rr4:'Falsche Angaben',rr5:'Sonstiges',report_txt:'Was ist passiert? (optional)',report_send:'Meldung senden',report_sent:'Danke. Unser Team prüft die Meldung vertraulich.',
    safety_note:'Melden und Blockieren bleibt anonym.',upcoming_going:'Geht zu',
    add_event:'Event eintragen',new_title:'Event eintragen',new_sub:'Dein erstes Event prüfen wir kurz, danach gehen deine Events sofort online.',new_sub_live:'Als Promoter gehen deine Events sofort online.',tier_t:'Dein Konto',tier_raver:'Raver · kostenlos',tier_promoter:'Promoter · aktiv bis {d}',tier_admin:'Admin',tier_ended:'Dein Promoter-Abo ist am {d} abgelaufen.',pro_t:'Promoter werden',pro_lead:'Events eintragen geht mit einem Promoter-Konto. Als Raver bleibt alles andere kostenlos: Events finden, Crew suchen, chatten.',pro_b1:'Deine Events erscheinen für alle Raver in Liste, Karte und Suche.',pro_b2:'Dein erstes Event prüfen wir kurz, danach gehen neue Events sofort online.',pro_b3:'Kostenpflichtiges Abo. Preis und Rechnung bekommst du nach deiner Anfrage per E-Mail.',pro_org:'Name von Kollektiv, Label oder Veranstaltung',pro_web:'Website oder Social-Link (optional)',pro_note:'Nachricht an uns (optional)',pro_send:'Promoter-Konto anfragen',pro_sent:'Anfrage gesendet. Wir melden uns per E-Mail.',pro_pending:'Deine Anfrage ist eingegangen. Wir melden uns per E-Mail mit Preis und Rechnung.',pro_rejected:'Deine letzte Anfrage wurde abgelehnt. Du kannst eine neue stellen.',pro_need:'Events eintragen geht nur mit einem Promoter-Konto.',adm_pro:'Promoter-Anfragen',adm_pro_act:'Aktive Promoter',adm_m1:'1 Monat',adm_m12:'12 Monate',adm_plus1:'+1 Monat',adm_end:'Beenden',adm_until:'bis {d}',
    f_title:'Name des Events',f_venue:'Club',f_venue_pick:'Club wählen',f_venue_missing:'Dein Club fehlt? Schreib es in den Namen, wir legen ihn an.',f_date:'Datum',f_time:'Beginn',f_genres:'Genres',
    f_lineup:'Line-up (Namen mit Komma trennen)',f_link:'Link zu Tickets oder Flyer',f_nophone:'Auf dem Event gilt ein Foto- und Videoverbot',f_kind:'Art',f_submit:'Event einreichen',
    f_err:'Bitte Name, Club und Datum ausfüllen.',sub_ok_pub:'Event ist online.',sub_ok_pend:'Danke! Dein Event wird geprüft und erscheint danach.',
    footer:'Rave Strngrs · Beta · Event-Daten aus öffentlichen Quellen, ohne Gewähr. Club-Adressen und Positionen: © OpenStreetMap-Mitwirkende.'
  },
  en:{
    org_label:'Label',org_collective:'Collective',org_series:'Event series',org_promoter:'Promoter',org_festival:'Festival',by_org:'Hosted by',org_dates:'Next dates',org_none:'No dates with us right now. Follow and we will let you know.',org_next_n:'{n} dates',org_follow_toast:'We will let you know when new dates come up.',orgs_t:'Collectives & labels',orgs_search:'e.g. UNREAL, 44 Label, Teletech',note_new_org:'New from {o}: {e}',follow:'Follow',following_btn:'Following',
    tagline:'Never rave alone again.',new_here:'New here? Create account',have_account:'Already in? Log in',skip:'Look around first',legal_hint:'By signing up you accept the terms and privacy policy.',
    loc_btn:'Find my city',loc_wait:'Finding your city …',loc_ok:'City: {c}',loc_far:'Nearest city with events: {c}',loc_fail:'Could not get your location. Just pick your city.',loc_denied:'Location not allowed. You can pick the city instead.',loc_none:'Your device cannot provide a location.',
    followers_l:'Followers',following_l:'Following',write_dm:'Message',
    edit_profile:'Edit profile',
    av_t:'Profile picture', av_pick:'Choose photo', av_change:'Change photo', av_del:'Remove', av_hint:'JPG or PNG. Cropped to a square.', av_busy:'Uploading …', av_ok:'Profile picture saved', av_gone:'Profile picture removed', av_err:'Could not upload the photo', av_add:'Add profile picture',
    crew_group:'Crew group',crew_group_join:'Join crew group',leave_group:'Leave group',send_to_chat:'Send to chat',sent_ok:'Sent.',event_msg:'shared an event',event_gone:'Event no longer available',members_n:'{n} members',open:'Open',invite_t:'Invite friends',invite_sub:'Anyone who joins through your link lands straight in a chat with you.',invite_msg:'Join me on Rave Strngrs and let’s go raving together 🖤',invite_n:'{n} joined via your link',qr_t:'Your QR code',qr_sub:'Show it at the club: scan, join, and you are in a chat.',copy_link:'Copy link',
    highlight:'Highlight',
    settings:'Settings',set_account:'Account',set_privacy:'Privacy',set_session:'Session',set_email:'Change email',set_email_hint:'We send a confirmation link to the new address. It only changes after you click it.',set_email_sent:'Check your inbox and confirm the new address.',reset_rate:'Too many emails were sent just now. Please try again in an hour.',set_notify_tickets:'Ticket alert',set_notify_tickets_sub:'When tickets for saved events come out',set_notify_new:'New dates',set_notify_new_sub:'When clubs you follow add events',set_notify_reminder:'Reminder',set_notify_reminder_sub:'The day before your events',set_dm_open:'Messages from everyone',set_dm_open_sub:'Off: only people you already chat with can reach you',set_going_visible:'“I’m going” public',set_going_visible_sub:'Others see that you go (applies to new ones)',set_blocked:'Blocked people',set_blocked_none:'You have not blocked anyone.',unblock:'Unblock',
    signup_exists:'This email already has an account. Log in or use “Forgot password?”.',
    alarm_set:'Ticket alert',alarm_on:'Ticket alert on',alarm_note:'No tickets yet? Turn on the ticket alert and we will tell you as soon as they are out.',alarm_toast:'Ticket alert on. We will let you know when tickets are out.',get_tix:'Tickets',inbox_t:'Notifications',inbox_empty:'Nothing here yet. Save events or follow clubs and we will tell you here when tickets drop or new dates are added.',note_tickets:'Tickets are out: {e}',note_new:'New at {v}: {e}',note_rem:'Tomorrow: {e}',inbox_note:'Push notifications to your phone arrive with the app. Until then everything lands here.',
    nav_home:'Home',nav_events:'Events',nav_map:'Map',nav_artists:'Artists',nav_connect:'Connect',nav_me:'Profile',
    home_hi:'What’s up',inst_t:'Rave Strngrs as an app',inst_sub:'Add it to your home screen and it opens like a normal app.',inst_btn:'Install',inst_ios:'On iPhone: tap Share at the bottom, then “Add to Home Screen”.',inst_x:'Later',ride_t:'Ride share',ride_sub:'Driving there with free seats, or looking for a ride? Message the driver directly and split the fuel costs.',ride_from:'Leaving from',ride_when:'Departure',ride_seats:'Free seats',ride_note:'Note (optional)',ride_note_ph:'e.g. Back around 6am, split fuel',ride_offer:'Offer a ride',ride_none:'No rides yet. Driving there? Offer seats.',ride_login:'Log in to see and offer rides.',ride_line:'{from} → {to}',ride_seats_n:'{n} seats free',ride_seat_1:'1 seat free',ride_open:'+ Offer a ride',ride_mine:'Your ride',del_t:'Delete account',del_sub:'Permanently deletes your profile, plans, crew posts, messages and reviews. This cannot be undone.',del_btn:'Delete account permanently',del_q:'Really delete? Type DELETE to confirm.',del_word:'DELETE',del_done:'Your account was deleted.',crew_find:'Find a crew',crew_find_sub:'Going alone or room in your group? Say who you are. Others can message you directly.',crew_ph:'e.g. Two of us from Neukölln, looking for people for pre-drinks and going together',crew_post:'Post',crew_del:'Delete',crew_none:'Nobody is looking yet. Be the first.',crew_login:'Log in to see who is still looking for people for this night.',crew_mine:'Your post',msg_btn:'Message',chats:'Chats',chats_none:'No chats yet. Message people at an event under “Find a crew”.',chat_ph:'Message …',send:'Send',chat_safety:'Meet in public places first and only share what you want to share.',rate_limited:'Too many messages, wait a moment.',unread_n:'{n} new',chat_with:'Chat with {n}',you_:'You',block_q:'Block {n}? You will no longer see or message each other.',crew_cnt:'{n} looking for people',pick_kicker:'Welcome',pick_t:'Where do you rave?',pick_sub:'Pick your city and we show you what is on there first. You can change it any time at the top.',pick_other:'Other city',pick_all:'All of Germany',crew_t:'Who is coming?',crew_sub:'Send the event to your group. Whoever says yes sees who else is going.',crew_wa:'Share on WhatsApp',crew_more:'Share …',crew_copy:'Copy link',crew_msg:'Coming along? 🖤',crew_going:'{n} already going',adm_refs:'Sources (30 days)',adm_refs_sub:'Visits via shared links and new accounts per source.',ref_visits:'Visits',ref_signups:'Accounts',home_hi_name:'What’s up, {n}',home_sub:'Your weekend, news from the scene and what is new.',home_city:'City',home_all:'Everywhere',
    home_weekend:'Your weekend',home_today:'Today and tomorrow',home_weekend_none:'Nothing listed here for this weekend yet.',home_all_events:'All events',
    home_remind:'You are going',home_new:'New in the app',home_news:'News',home_ticker:'From the scene',home_kicker:'Techno · Germany · Tonight',ticker_note:'Headlines from Groove, Mixmag and DJ Mag. Tap to read the article on the magazine’s site.',
    no_posts:'No posts yet.',post_write:'Write a post',post_title:'Headline',post_body:'Text',post_link:'Link (optional)',post_publish:'Publish',post_done:'Post is live',
    kind_news:'Editorial',kind_artist:'Artist',kind_club:'Club',home_artists:'Discover verified artists',ago_now:'just now',ago_min:'{n} min ago',ago_h:'{n} h ago',ago_d:'{n} days ago',ago_1d:'yesterday',
    banner:'Beta: events from public calendars (no guarantee). Accounts are real.',
    loading:'Loading …',load_err:'Could not load the data. Check your connection and reload.',retry:'Reload',
    events_title:'Raves in Germany',events_sub:'Find nights, DJs and people who are heading there too.',
    search:'Search',search_ph:'Event, club or DJ',city:'City',all_cities:'All cities',when:'When',
    when_all:'Any date',when_week:'Next 7 days',when_month:'Next 30 days',genre_all:'All genres',
    type_all:'All',type_club:'Club nights',type_fest:'Festivals & open airs',fest_tag:'Festival',fest_note:'All confirmed festivals in Germany and Europe for the coming months. In the regular calendar they show up about two months ahead.',kind_event_site:'Festival and event grounds',kind_seasonal:'Open air, in season only',kind_note:'Shows on the map only when something is coming up here.',f_end:'End (optional, for multi-day events)',
    n_events:'{n} events',none_found:'No events found. Try fewer filters.',going_n:'{n} from the community',
    back:'Back',date:'Date',time:'Starts',venue:'Venue',tba:'see source',lineup:'Line-up',and_more:'and {n} more',
    lineup_tba:'The line-up is not announced yet or we do not have it. Check the source.',
    banner_by:'Banner',
    who_goes:"Who's going",nobody:'Nobody from the community yet. Be the first.',login_to_see:"Log in to see who's going.",
    go:"I'm going",going:"You're going",save_ev:'Save',saved_ev:'Saved',fr_n:'{n} of your people',fr_going:'Your people going',home_friends:'Your people are going',home_foryou:'For you',foryou_note:'Events by artists and clubs you follow.',foryou_empty:'Follow artists and clubs and their dates will show up here.',new_badge:'New',n_new:'{n} new since your last visit',following:'Following',follow_club:'Follow club',followed_club:'You follow this club',push_note:'Push notifications arrive with the phone app. Until then, new dates show up under “For you” on Home.',cd_in:'In {t}',cd_live:'Happening now',cd_h:'{h} h {m} min',cd_d:'{d} d {h} h',tix_t:'Tickets',tix_available:'Tickets available',tix_few:'Only a few tickets left',tix_sold_out:'Sold out',tix_unknown:'Ticket status unknown',tix_shop:'Tickets at the ticket shop',tix_price:'Price',tix_official:'Official ticket shop',tix_resale_off:'Official resale',tix_swap:'TicketSwap: tickets for {v}',tix_swap_note:'TicketSwap is a fan-to-fan marketplace with buyer protection. The link shows all listings for this club, pick your date there. Not every event is traded on TicketSwap. We are not affiliated with TicketSwap.',scam_t:'Watch out for ticket scams',scam_1:'Never pay strangers via PayPal “Friends & Family”, bank transfer or gift cards. That money is gone.',scam_2:'Screenshots or PDFs of tickets can be sold many times. Only an official name transfer to you is safe.',scam_3:'Pressure (“today only”, “pay fast”) is usually a scam.',scam_4:'Buy through official shops or platforms with buyer protection.',rr6:'Ticket scam',f_price:'Price (e.g. €15–20)',f_tstatus:'Ticket status',share_more:'',login_why:'Afterwards you continue right where you were.',no_rating:'No rating yet',route:'Directions',close:'Close',map_fail:'The map cannot be loaded on this device. All places are listed below.',rev_t:'Ratings',rev_none:'No ratings yet. Be the first!',rev_write:'Rate this club',rev_edit:'Edit your rating',rev_overall:'Overall',rev_sound:'Sound',rev_crowd:'Crowd',rev_door:'Door & entry',rev_safety:'Awareness & safety',rev_body:'What should others know? (optional)',rev_send:'Save rating',rev_saved:'Thanks for your rating!',rev_need_star:'Please give at least an overall rating.',rev_login:'Log in to rate this club.',rev_n:'{n} ratings',rev_one:'1 rating',rev_rules:'Rate fairly and from your own experience. No names of door staff or guests.',pop_hint:'Tap for details',gcal:'Add to Google Calendar',share:'Share',copied:'Link copied',tickets:'Tickets & info',show_map:'Show on map',
    nophone_t:'No photos or video',nophone_d:'The organiser states a no-photo, no-video rule. Phones stay in your pocket. Connect before and after.',
    source_t:'Source',source_note:'Please check time, line-up and price with the organiser.',report_ev:'Report wrong details',
    aware_t:'Awareness & safety',aware_d:'If you or someone else is not okay: talk to the awareness team, security or bar staff. In an emergency call 112.',aware_team:'Awareness on site: {x}',
    pending:'Under review',no_event:'This event does not exist (any more).',
    rules_t:'Rules & info',r_phone:'Phones & photos',r_door:'Door',r_age:'Age',r_access:'Accessibility',r_aware:'Awareness',not_set:'Not provided by the club yet',photo_ban:'No photos, phone cameras get taped at the door',
    upcoming:'Upcoming events',open_club:'Club page',no_club:'This club does not exist.',
    map_title:'Map',map_sub:'All clubs and events at a glance. Hover a dot with the mouse or tap it on your phone for a preview.',
    only_events:'Only places with events',venues_t:'All places',ev_one:'1 event',ev_many:'{n} events',pick_marker:'Tap a marker to see events and details.',
    summary_map:'{v} places with {e} events in the chosen period.',no_ev_here:'No events at this place in the chosen period.',
    approx:'Approximate position',zoom_in:'Zoom in',zoom_out:'Zoom out',zoom_reset:'All of Germany',leg_ev:'With events',leg_none:'No events',zero:'no events',
    artists_title:'Artists',artists_sub:'DJs and live acts with a verified profile. The red tick means identity checked.',
    no_artists:'No verified artists yet. You play? Request verification in your profile.',verified:'Verified artist',
    connect_title:'Connect',connect_sub:'People going to the same events as you.',connect_login:'Log in and mark events with "I\'m going" to see who else is going.',
    connect_none:'Nobody else at your events yet. Mark more events or invite friends.',goes_to:'going to',
    chat_soon:'Ride shares are listed on each event.',
    login_t:'Log in',signup_t:'Sign up',email:'Email',password:'Password',pw_hint:'At least 8 characters',display_name:'Display name',
    login_btn:'Log in',signup_btn:'Create account',forgot:'Forgot password?',reset_send_err:'We couldn’t send the email right now. That’s on us, not you. Please try again later.',reset_t:'Reset password',reset_intro:'No problem. Enter the email of your account and we will send you a link.',reset_s1:'Enter your email and request the link',reset_s2:'Open the email and tap the newest link',reset_s3:'Set a new password, done',reset_btn:'Send link',reset_sent_t:'Email is on its way',reset_sent_d:'If an account with {mail} exists, an email is coming. Check your spam folder too. Only open the newest link, older ones stop working.',reset_again:'Send again',reset_wait:'Send again in {n} s',reset_limit:'Too many emails were sent just now. Please try again in about an hour.',reset_back:'Back to login',reset_open:'Forgot password?',link_bad_t:'Link invalid or expired',link_bad_d:'This link does not work any more. That happens when it is older or a newer one was sent. Just request a new one.',link_new:'Request a new link',newpw_t:'Set a new password',newpw_l:'New password (min. 8 characters)',newpw_l2:'Repeat password',newpw_btn:'Save password',newpw_ok:'Password changed. You are logged in.',newpw_mismatch:'The passwords do not match.',newpw_need:'Open the link from the reset password email to set a new password.',change_pw:'Change password',reset_sent:'If an account with this email exists, a reset link is on its way.',
    signup_done:'Almost there: we sent you an email. Click the link in it and you are logged in.',
    login_need:'You need to be logged in for this.',to_login:'Log in or sign up',logout:'Log out',
    terms:'By signing up you confirm that you are at least 18 years old.',age_ok:'I am at least 18 years old.',
    err_generic:'That did not work. Please try again.',err_login:'Email or password is wrong, or the email is not confirmed yet.',
    err_handle:'This username is taken.',err_handle_fmt:'Username: 3 to 30 characters, only a–z, 0–9, dot and underscore.',err_pw:'The password needs at least 8 characters.',
    me_title:'My profile',handle:'Username',bio:'About me',bio_ph:'What do you listen to, where do you dance?',save:'Save',saved:'Saved',soc_hint:'Link your socials',
    er_t:'How was the event?',er_none:'No ratings for this event yet.',er_write:'Rate this event',er_login:'Log in to rate this event.',er_only_go:'Only people who were there can rate. Tap “I was there”.',er_closed:'Ratings are possible up to 3 weeks after the event.',er_lineup:'Line-up & music',er_safety:'Safety',er_aware:'Awareness & comfort',er_was_there:'Was there',er_verified_n:'{n} checked in on site',er_rules:'Rate fairly and from your own experience. No names of door staff or guests. Clubs and promoters see your feedback.',er_torate:'How was it? Rate now',er_torate_sub:'Your recent events. Your feedback helps clubs and promoters get better.',was_there:'I was there',was_there_on:'You were there',ci_t:'Are you here right now?',ci_sub:'Tap “I’m here”. We check once whether you are near the club. Your position is only compared for this and never stored.',ci_btn:'I’m here',ci_done:'Checked in',ci_done_sub:'Your rating will get the “Was there” tick later.',ci_busy:'Checking location …',ci_ok:'Checked in! Have fun.',ci_far:'You don’t seem to be at the club (more than 400 m away).',ci_notnow:'Check-in only works during the event.',ci_denied:'Check-in needs location access.',ci_err:'Check-in didn’t work.',note_review:'How was “{e}”? Rate the event.',org_rating:'Rating from {n} event reviews',my_going:"I'm going",my_saved:'Saved',my_subs:'My submissions',none_yet:'Nothing yet.',
    verif_t:'Artist verification',verif_none:'Are you a DJ or live act? Request verification to get the red tick.',
    verif_name:'Artist name',verif_links:'Proof (links, one per line)',verif_links_ph:'e.g. Resident Advisor page, official Instagram, booking agency',
    verif_btn:'Request verification',verif_pending:"Request received. We'll check your profile and get back to you.",verif_rejected:'Your last request was declined. You can send a new one.',verif_ok:'Your profile is verified.',
    admin_t:'Admin',admin_open:'Open admin area',adm_verif:'Verification requests',adm_events:'Events under review',rev_unclear:'Review agent unsure',rev_waiting:'Waiting for review',rev_live:'live',rev_note:'Review agent',adm_reports:'Reports',approve:'Approve',reject:'Reject',publish:'Publish',done:'Done',
    profile_nf:'This profile does not exist.',report:'Report',block:'Block',blocked:'Blocked. You no longer see each other.',report_reason:'Reason',
    rr1:'Harassment',rr2:'Spam or fake profile',rr3:'Dangerous behaviour',rr4:'Wrong details',rr5:'Other',report_txt:'What happened? (optional)',report_send:'Send report',report_sent:'Thanks. Our team reviews the report confidentially.',
    safety_note:'Reporting and blocking are anonymous.',upcoming_going:'Going to',
    add_event:'Add event',new_title:'Add an event',new_sub:'We quickly check your first event, after that your events go live right away.',new_sub_live:'As a promoter, your events go live right away.',tier_t:'Your account',tier_raver:'Raver · free',tier_promoter:'Promoter · active until {d}',tier_admin:'Admin',tier_ended:'Your promoter subscription ended on {d}.',pro_t:'Become a promoter',pro_lead:'Adding events needs a promoter account. Everything else stays free for ravers: finding events, finding a crew, chatting.',pro_b1:'Your events show up for all ravers in the list, on the map and in search.',pro_b2:'We quickly check your first event, after that new events go live right away.',pro_b3:'Paid subscription. You get the price and an invoice by email after your request.',pro_org:'Name of your collective, label or event',pro_web:'Website or social link (optional)',pro_note:'Message to us (optional)',pro_send:'Request promoter account',pro_sent:'Request sent. We will get back to you by email.',pro_pending:'We got your request. We will email you the price and an invoice.',pro_rejected:'Your last request was declined. You can send a new one.',pro_need:'Adding events needs a promoter account.',adm_pro:'Promoter requests',adm_pro_act:'Active promoters',adm_m1:'1 month',adm_m12:'12 months',adm_plus1:'+1 month',adm_end:'End',adm_until:'until {d}',
    f_title:'Event name',f_venue:'Club',f_venue_pick:'Pick a club',f_venue_missing:'Your club is missing? Put it in the name, we will add it.',f_date:'Date',f_time:'Start',f_genres:'Genres',
    f_lineup:'Line-up (separate names with commas)',f_link:'Link to tickets or flyer',f_nophone:'This event has a no-photo, no-video rule',f_kind:'Type',f_submit:'Submit event',
    f_err:'Please fill in name, club and date.',sub_ok_pub:'Event is live.',sub_ok_pend:'Thanks! Your event will be checked and then appear.',
    footer:'Rave Strngrs · Beta · Event data from public sources, no guarantee. Club addresses and positions: © OpenStreetMap contributors.'
  }
};

/* ---------- Static lists ---------- */
var CITIES=[
  {name:'Berlin',lat:52.520,lon:13.405},{name:'Hamburg',lat:53.551,lon:9.994},{name:'München',lat:48.137,lon:11.576},
  {name:'Köln',lat:50.938,lon:6.960},{name:'Frankfurt',lat:50.111,lon:8.682},{name:'Stuttgart',lat:48.776,lon:9.183},
  {name:'Düsseldorf',lat:51.228,lon:6.774},{name:'Leipzig',lat:51.340,lon:12.373},{name:'Dresden',lat:51.050,lon:13.737},
  {name:'Karlsruhe',lat:49.007,lon:8.404},{name:'Hannover',lat:52.376,lon:9.732},{name:'Nürnberg',lat:49.452,lon:11.077},{name:'Bremen',lat:53.079,lon:8.802},
  {name:'Dortmund',lat:51.514,lon:7.465},{name:'Essen',lat:51.456,lon:7.012},{name:'Münster',lat:51.960,lon:7.626},{name:'Mannheim',lat:49.488,lon:8.466},
  {name:'Freiburg',lat:47.999,lon:7.842},{name:'Augsburg',lat:48.371,lon:10.898},{name:'Würzburg',lat:49.792,lon:9.953},{name:'Erfurt',lat:50.978,lon:11.029},
  {name:'Rostock',lat:54.092,lon:12.099},{name:'Kassel',lat:51.312,lon:9.479},{name:'Magdeburg',lat:52.121,lon:11.628}
];
var GENRES=['Techno','Hard Techno','Acid','Trance','House','Minimal','Drum & Bass','Electronic'];
var SOC=[['instagram','Instagram','https://instagram.com/'],['soundcloud','SoundCloud','https://soundcloud.com/'],['ra','Resident Advisor','https://ra.co/dj/'],['spotify','Spotify',null],['mixcloud','Mixcloud','https://www.mixcloud.com/'],['tiktok','TikTok','https://www.tiktok.com/@']];
var RULE_KEYS=['phone','door','age','access','aware'];
/* Festivals and temporary places appear this many days before they start and disappear once they are over. */
var LEAD_DAYS=60;
var RULE_LABEL={phone:'r_phone',door:'r_door',age:'r_age',access:'r_access',aware:'r_aware'};

/* ---------- State ---------- */
var VENUES=[], EVENTS=[], PAST=[]; /* PAST: vorbei, letzte 14 Tage (für Bewertungen) */
function lsGet(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
function lsSet(k,v){ try{ if(v===null) localStorage.removeItem(k); else localStorage.setItem(k,v); }catch(e){} }
var SAVED_CITY=lsGet('rs-city');
var S={
  lang:(navigator.language||'de').slice(0,2)==='de'?'de':'en',
  q:'',city:SAVED_CITY||'',genre:'',when:'all',type:'',onlyEvents:false,homeCity:SAVED_CITY,
  map:null,mapSel:null,mapHash:null,
  ready:false,loadErr:false,
  user:null,me:null,going:[],saved:[],counts:{},verif:null,follow:[],vfollow:[],attRows:[],lastSeen:null,
  authTab:'login',authMsg:'',authErr:''
};
var cache={att:{},profile:{},artists:null,connect:null,subs:null,admin:null,home:null,reviews:{},crew:{},rides:{},chats:null,chat:{}};

/* ---------- Helpers ---------- */
function t(k,v){ var s=(T[S.lang][k]!=null?T[S.lang][k]:k); if(v){ for(var x in v){ s=s.split('{'+x+'}').join(v[x]); } } return s; }
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function locale(){ return S.lang==='de'?'de-DE':'en-GB'; }
var BERLIN=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Berlin',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
function berlinParts(d){ var o={}; BERLIN.formatToParts(d).forEach(function(p){ o[p.type]=p.value; }); return {date:o.year+'-'+o.month+'-'+o.day,time:o.hour+':'+o.minute}; }
function berlinToISO(date,time){
  var a=date.split('-').map(Number), b=(time||'22:00').split(':').map(Number);
  var guess=Date.UTC(a[0],a[1]-1,a[2],b[0],b[1]);
  var p=berlinParts(new Date(guess)), pd=p.date.split('-').map(Number), pt=p.time.split(':').map(Number);
  var asUTC=Date.UTC(pd[0],pd[1]-1,pd[2],pt[0],pt[1]);
  return new Date(guess-(asUTC-guess)).toISOString();
}
var TODAY=berlinParts(new Date()).date;
function dayNum(iso){ var a=iso.split('-').map(Number); return Date.UTC(a[0],a[1]-1,a[2])/86400000; }
function offOf(date){ return Math.round(dayNum(date)-dayNum(TODAY)); }
function dayOf(off){ var a=TODAY.split('-').map(Number); return new Date(a[0],a[1]-1,a[2]+off); }
function isoOf(off){ var d=dayOf(off); return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2); }
function fmtMonth(d){ return d.toLocaleDateString(locale(),{month:'short'}).replace('.',''); }
function fmtDow(d){ return d.toLocaleDateString(locale(),{weekday:'short'}).replace('.',''); }
function fmtLong(d){ return d.toLocaleDateString(locale(),{weekday:'long',day:'numeric',month:'long'}); }
function fmtShort(d){ return d.toLocaleDateString(locale(),{weekday:'short',day:'numeric',month:'short'}); }
function hue(n){ var h=0; for(var i=0;i<n.length;i++){ h=(h*31+n.charCodeAt(i))%360; } return h; }
function initials(n){ var p=String(n||'?').trim().split(/\s+/); return (p[0][0]+(p[1]?p[1][0]:'')).toUpperCase(); }
function av(p,size){ var name=p&&typeof p==='object'?p.display_name:p, url=p&&typeof p==='object'?p.avatar_url:null;
  return '<span class="av" style="--h:'+hue(name||'?')+';--s:'+(size||40)+'px" aria-hidden="true">'+(url?'<img src="'+esc(url)+'" alt="" loading="lazy" onerror="this.remove()">':'')+esc(initials(name))+'</span>'; }
var VB='<svg class="vb" viewBox="0 0 24 24" role="img" aria-label="verified"><circle cx="12" cy="12" r="11" fill="#e4262e"/><path d="M7 12.5l3.2 3.2L17 9" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
function host(u){ try{ return new URL(u).hostname.replace(/^www\./,''); }catch(e){ return u; } }
function safeUrl(u){ return /^https?:\/\//i.test(u||'')?u:null; }
function venue(id){ for(var i=0;i<VENUES.length;i++){ if(VENUES[i].id===id) return VENUES[i]; } return null; }
function evt(id){ for(var i=0;i<EVENTS.length;i++){ if(EVENTS[i].id===id) return EVENTS[i]; } for(var j=0;j<PAST.length;j++){ if(PAST[j].id===id) return PAST[j]; } return null; }
function genreTags(g){ return g.map(function(x){ return '<span class="tag">'+esc(x)+'</span>'; }).join(' '); }
function isTemporary(e){ var v=venue(e.v); return e.type==='festival'||(v&&v.kind!=='club'); }
function upcoming(e){ if(e.endOff<0) return false; if(isTemporary(e)&&e.off>LEAD_DAYS) return false; return true; }
function inWindow(e){ if(!upcoming(e)&&!(S.type==='festival'&&e.endOff>=0&&isTemporary(e))) return false; if(S.when==='week'&&e.off>7) return false; if(S.when==='month'&&e.off>30) return false; return true; }
function sortedEvents(){ return EVENTS.slice().sort(function(a,b){ return a.off-b.off||(a.time||'').localeCompare(b.time||''); }); }
function has(arr,x){ return arr.indexOf(x)>-1; }
var toastTimer;
function toast(msg){ var el=document.getElementById('toast'); el.textContent=msg; el.className='show'; clearTimeout(toastTimer); toastTimer=setTimeout(function(){ el.className=''; },2600); }
function data(p){ return p.then(function(r){ if(r.error) throw r.error; return r.data; }); }
function fail(err){ if(window.console) console.error(err); toast(t('err_generic')); }
function needLogin(){ if(S.user) return false; try{ sessionStorage.setItem('rs-after',location.hash||'#home'); }catch(e){} toast(t('login_need')); location.hash='#login'; return true; }
function after(){ try{ return sessionStorage.getItem('rs-after'); }catch(e){ return null; } }
function buzz(){ try{ if(navigator.vibrate) navigator.vibrate(12); }catch(e){} }
function followsP(id){ for(var i=0;i<S.follow.length;i++){ if(S.follow[i].id===id) return S.follow[i]; } return null; }
function friendsAt(eid){ if(!S.user||!S.follow.length) return []; var out=[]; S.attRows.forEach(function(a){ if(a.event_id===eid){ var f=followsP(a.profile_id); if(f) out.push(f); } }); return out; }
function forYou(e){
  if(!S.user) return false;
  if(has(S.vfollow,e.v)) return true;
  for(var i=0;i<S.follow.length;i++){ var f=S.follow[i]; if(has(e.lineupIds,f.id)) return true; if(f.role==='artist'&&has(e.lineupLc,String(f.display_name).toLowerCase())) return true; }
  return false;
}
function isNew(e){ return S.lastSeen&&e.createdAt&&e.createdAt>S.lastSeen; }
function cdText(e){
  var st=new Date(e.startsAt).getTime(), en=e.endsAt?new Date(e.endsAt).getTime():st+12*3600e3, now=Date.now();
  if(now>=st&&now<=en) return t('cd_live');
  if(now>st) return '';
  var m=Math.floor((st-now)/60000), d=Math.floor(m/1440), h=Math.floor((m%1440)/60);
  if(m>4*1440) return '';
  return t('cd_in',{t:d?t('cd_d',{d:d,h:h}):t('cd_h',{h:h,m:m%60})});
}
function cdHTML(e){ var x=e.time?cdText(e):''; return x?'<span class="cd" data-cd="'+e.id+'">'+esc(x)+'</span>':''; }
function tixTag(e){ return e.tstatus==='sold_out'?' <span class="tag hot">'+t('tix_sold_out')+'</span>':(e.tstatus==='few'?' <span class="tag hot">'+t('tix_few')+'</span>':''); }
function emptyBox(txt){ return '<div class="empty" style="margin-top:0">'+txt+'</div>'; }
function loadingBox(){ return '<p class="sub" aria-busy="true">'+t('loading')+'</p>'; }

/* ---------- Data loading ---------- */
function mapEvent(r){
  var p=berlinParts(new Date(r.starts_at)), pe=r.ends_at?berlinParts(new Date(r.ends_at)):null;
  var lus=(r.event_lineup||[]).slice().sort(function(a,b){ return a.position-b.position; }), lu=lus.map(function(x){ return x.name; });
  return {id:r.id,title:r.title,v:r.venue_id,date:p.date,time:r.time_known?p.time:null,off:offOf(p.date),endDate:pe?pe.date:null,endOff:pe?Math.max(offOf(pe.date),offOf(p.date)):offOf(p.date),genres:r.genres||[],
    lineup:lu.length?lu:null,more:r.lineup_more||0,nophone:r.no_phone,src:safeUrl(r.source_url),ticket:safeUrl(r.ticket_url),
    type:r.kind==='club'?'club':'festival',status:r.status,createdBy:r.created_by,createdAt:r.created_at,startsAt:r.starts_at,endsAt:r.ends_at,
    img:safeUrl(r.image_url),imgCredit:r.image_credit||null,price:r.price_text||null,tstatus:r.ticket_status||null,resale:safeUrl(r.resale_url),lineupIds:lus.map(function(x){ return x.artist_id; }).filter(Boolean),lineupLc:lu.map(function(x){ return x.toLowerCase(); })};
}
function mapVenue(r){ return {id:r.id,name:r.name,city:r.city,addr:r.address,lat:r.lat,lon:r.lon,approx:r.approx,kind:r.kind||'club',rules:r.rules||{}}; }
var RATINGS={};
function loadRatings(){ return data(sb.from('venue_ratings').select('*')).then(function(r){ RATINGS={}; r.forEach(function(x){ RATINGS[x.venue_id]=x; }); }).catch(function(){}); }
function loadBase(){
  var since=berlinToISO(isoOf(-14),'00:00');   /* a little back, so festivals that are still running are included */
  return Promise.all([
    data(sb.from('venues').select('id,name,city,address,lat,lon,approx,kind,rules')),
    data(sb.from('events').select('id,venue_id,title,starts_at,ends_at,created_at,time_known,kind,genres,no_phone,ticket_url,source_url,lineup_more,status,created_by,price_text,ticket_status,resale_url,image_url,image_credit,event_lineup(position,name,artist_id)').eq('status','published').gte('starts_at',since).order('starts_at',{ascending:true}))
  ]).then(function(res){
    VENUES=res[0].map(mapVenue).filter(function(v){ return !(v.rules&&v.rules.hidden); }); /* hidden = checked: not a club */
    var allEv=res[1].map(mapEvent).filter(function(e){ return venue(e.v); });
    EVENTS=allEv.filter(function(e){ return e.endOff>=0; }); PAST=allEv.filter(function(e){ return e.endOff<0; });
    S.ready=true; S.loadErr=false;
    loadRatings().then(function(){ if(S.ready) render(false); });
    loadCrewCounts(); loadOrgs(); autoLocate();
  }).catch(function(err){ if(window.console) console.error(err); S.loadErr=true; });
}

var CREWN={};
/* ---------- Organizers: labels, collectives, event series (DB 024) ---------- */
var ORGS=[], EVORG={}; S.orgFollow=[];
function loadOrgs(){
  return Promise.all([sb.rpc('organizer_list'),sb.from('event_organizers').select('event_id,organizer_id')]).then(function(r){
    ORGS=(r[0]&&r[0].data)||[]; EVORG={}; ((r[1]&&r[1].data)||[]).forEach(function(x){ (EVORG[x.event_id]=EVORG[x.event_id]||[]).push(x.organizer_id); });
    if(S.ready) render(false); }).catch(function(){});
}
function orgById(id){ for(var i=0;i<ORGS.length;i++) if(ORGS[i].id===id) return ORGS[i]; return null; }
function orgBySlug(sl){ for(var i=0;i<ORGS.length;i++) if(ORGS[i].slug===sl) return ORGS[i]; return null; }
function orgsOf(eid){ return (EVORG[eid]||[]).map(orgById).filter(Boolean); }
function orgChips(e){ var os=orgsOf(e.id); if(!os.length) return '';
  return '<div class="chips orgchips" style="margin-top:10px"><span class="sub" style="margin:0 6px 0 0">'+t('by_org')+'</span>'+os.map(function(o){ return '<a class="chip" href="#org-'+esc(o.slug)+'">'+esc(o.name)+'</a>'; }).join('')+'</div>'; }
function viewOrg(sl){
  var o=orgBySlug(sl); if(!o) return ORGS.length?'<a class="back" href="#orgs">← '+t('orgs_t')+'</a>'+emptyBox(t('org_none')):loadingBox();
  var evs=sortedEvents().filter(function(e){ return upcoming(e)&&(EVORG[e.id]||[]).indexOf(o.id)>=0; });
  var cities={}; evs.forEach(function(e){ cities[venue(e.v).city]=1; });
  var on=has(S.orgFollow,o.id);
  return '<a class="back" href="#orgs">← '+t('orgs_t')+'</a><p class="kicker">'+t('org_'+o.kind)+'</p><h1>'+esc(o.name)+'</h1>'+
    '<p class="sub">'+(evs.length?t('org_next_n',{n:evs.length})+(Object.keys(cities).length?' · '+esc(Object.keys(cities).slice(0,4).join(', ')):''):t('org_none'))+'</p>'+
    '<div class="row" style="margin-top:14px"><button type="button" class="btn '+(on?'on':'primary')+'" data-act="orgfollow" data-id="'+o.id+'" aria-pressed="'+on+'">'+(on?'✓ '+t('following_btn'):'+ '+t('follow'))+'</button></div>'+
    orgRatingHTML(o)+
    '<div class="sec"><h2>'+t('org_dates')+'</h2>'+(evs.length?'<div class="list">'+evs.map(eventCard).join('')+'</div>':emptyBox(t('org_none')))+'</div>';
}
function viewOrgs(){
  var q=(S.orgQ||'').trim().toLowerCase();
  var list=ORGS.filter(function(o){ return !q||o.name.toLowerCase().indexOf(q)>=0; });
  return '<a class="back" href="#events">← '+t('nav_events')+'</a><h1>'+t('orgs_t')+'</h1>'+
    '<div class="field" style="margin-top:12px"><label class="sr" for="org-q">'+t('orgs_search')+'</label><input id="org-q" type="text" value="'+esc(S.orgQ||'')+'" placeholder="'+esc(t('orgs_search'))+'"></div>'+
    '<div class="people orglist">'+(list.length?list.map(function(o){ return '<a class="person" href="#org-'+esc(o.slug)+'"><div class="grow"><strong>'+esc(o.name)+'</strong><p>'+t('org_'+o.kind)+'</p></div>'+(o.upcoming?'<span class="tag hot">'+t('org_next_n',{n:o.upcoming})+'</span>':'')+(has(S.orgFollow,o.id)?' ✓':'')+'</a>'; }).join(''):emptyBox(t('none_found')))+'</div>';
}
function loadCrewCounts(){
  return sb.rpc('crew_counts').then(function(r){ if(r&&r.error) throw r.error; CREWN={}; ((r&&r.data)||[]).forEach(function(x){ CREWN[x.event_id]={c:x.crew||0,r:x.rides||0}; }); if(S.ready) render(false); }).catch(function(){});
}
function loadMine(){
  if(!S.user){ S.tier=null; S.checkins=[]; S.myEvRev=[]; S.me=null; S.going=[]; S.saved=[]; S.alarms=[]; S.notes=[]; updateBell(); S.counts={}; S.verif=null; S.follow=[]; S.vfollow=[]; S.attRows=[]; return Promise.resolve(); }
  var uid=S.user.id;
  return Promise.all([
    data(sb.from('profiles').select('*').eq('id',uid).maybeSingle()),
    data(sb.from('attendance').select('event_id,profile_id')),
    data(sb.from('bookmarks').select('event_id,remind').eq('profile_id',uid)),
    data(sb.from('artist_verifications').select('id,status,created_at').eq('profile_id',uid).order('created_at',{ascending:false}).limit(1)),
    data(sb.from('follows').select('artist,profiles!follows_artist_fkey(id,handle,display_name,avatar_url,verified,role)').eq('follower',uid)),
    data(sb.from('venue_follows').select('venue_id').eq('profile_id',uid))
  ]).then(function(r){
    S.me=r[0];
    loadTier();
    S.counts={}; S.going=[];
    r[1].forEach(function(a){ S.counts[a.event_id]=(S.counts[a.event_id]||0)+1; if(a.profile_id===uid) S.going.push(a.event_id); });
    S.saved=r[2].map(function(b){ return b.event_id; });
    S.alarms=r[2].filter(function(b){ return b.remind; }).map(function(b){ return b.event_id; });
    data(sb.from('organizer_follows').select('organizer_id').eq('profile_id',uid)).then(function(x){ S.orgFollow=x.map(function(y){ return y.organizer_id; }); }).catch(function(){});
    loadInbox(); loadSettings(); BLOCKS=null;
    data(sb.from('checkins').select('event_id').eq('profile_id',uid)).then(function(x){ S.checkins=x.map(function(y){ return y.event_id; }); }).catch(function(){});
    data(sb.from('reviews').select('event_id').eq('author',uid)).then(function(x){ S.myEvRev=x.map(function(y){ return y.event_id; }).filter(Boolean); }).catch(function(){});
    S.verif=r[3][0]||null;
    S.follow=r[4].map(function(x){ return x.profiles; }).filter(Boolean);
    S.vfollow=r[5].map(function(x){ return x.venue_id; });
    S.attRows=r[1];
  }).catch(fail);
}
/* ---------- Ticket alert + notifications (DB 021) ---------- */
S.alarms=[]; S.notes=[];
/* Ticket-Alarm nur, wenn man gerade wirklich keine Tickets kaufen kann */
function needsAlarm(e){ return !e.ticket||e.tstatus==='sold_out'; }
/* Preise stehen auf Deutsch auf den Club-Seiten; für Englisch übersetzen ("VVK ab 35 €" -> "Presale from €35") */
function priceTxt(p){ if(!p||S.lang==='de') return p||'';
  var w=[[/\bVorverkauf\b/gi,'Presale'],[/\bVVK\b/gi,'Presale'],[/\bAbendkasse\b/gi,'At the door'],[/\bAK\b/gi,'Door'],[/\bEintritt frei\b/gi,'Free entry'],[/\bkostenlos\b/gi,'free'],[/\berm(ä|ae)(ß|ss)igt\b/gi,'reduced'],[/\bab\b/gi,'from'],[/\bbis\b/gi,'until'],[/\bUhr\b/gi,'']];
  w.forEach(function(x){ p=p.replace(x[0],x[1]); });
  return p.replace(/(\d+)(?:,(\d{1,2}))?\s?€/g,function(m,a,b){ return '€'+a+(b?'.'+b:''); }).replace(/\s{2,}/g,' ').trim(); }
function alarmBtn(e,primary){ var on=has(S.alarms,e.id);
  return '<button type="button" class="btn'+(on?' on':(primary?' primary':''))+'" data-act="alarm" data-id="'+e.id+'" aria-pressed="'+on+'">'+(on?'🔔 ✓ '+t('alarm_on'):'🔔 '+t('alarm_set'))+'</button>'; }
function tixCta(e){ var st=e.tstatus||'unknown';
  if(e.ticket&&st!=='sold_out') return '<a class="btn primary" href="'+esc(e.ticket)+'" target="_blank" rel="noopener">'+t('get_tix')+' ↗</a>';
  if(st==='sold_out') return '<a class="btn primary" href="'+esc(swapUrl(e))+'" target="_blank" rel="noopener nofollow">TicketSwap ↗</a>';
  return alarmBtn(e,true); }
function unreadNotes(){ return S.notes.filter(function(n){ return !n.read_at; }).length; }
function updateBell(){ var b=document.getElementById('bell'); if(!b) return; b.hidden=!S.user; var n=unreadNotes(), c=b.querySelector('b'); c.textContent=n>9?'9+':String(n); c.hidden=!n; b.setAttribute('aria-label',t('inbox_t')+(n?' ('+n+')':'')); }
function loadInbox(){ if(!S.user) return;
  data(sb.from('notifications').select('id,kind,event_id,venue_id,organizer_id,created_at,read_at').order('created_at',{ascending:false}).limit(50))
    .then(function(r){ S.notes=r; updateBell(); if(route().tab==='me'&&location.hash==='#inbox') render(false); }).catch(function(){}); }
setInterval(function(){ if(S.user&&!document.hidden) loadInbox(); },60000);
function viewInbox(){
  if(!S.user) return viewLogin();
  var rows=S.notes.map(function(n){ var e=evt(n.event_id), v=venue(n.venue_id), ti=e?e.title:'…';
    var og=n.organizer_id?orgById(n.organizer_id):null; var txt=n.kind==='tickets'?t('note_tickets',{e:ti}):n.kind==='new_event'?(og?t('note_new_org',{o:og.name,e:ti}):t('note_new',{v:v?v.name:'',e:ti})):n.kind==='review'?t('note_review',{e:ti}):t('note_rem',{e:ti});
    var ic=n.kind==='tickets'?'🎟':n.kind==='new_event'?'✦':n.kind==='review'?'★':'⏰';
    return '<a class="note'+(n.read_at?'':' unread')+'" href="'+(e?'#event-'+e.id+(n.kind==='review'?'-rate':''):'#inbox')+'"><span class="ic">'+ic+'</span><div class="grow"><strong>'+esc(txt)+'</strong><p>'+esc(ago(n.created_at))+'</p></div></a>'; }).join('');
  if(unreadNotes()) setTimeout(markNotesRead,2000);
  return '<a class="back" href="#me">← '+t('nav_me')+'</a><h1>'+t('inbox_t')+'</h1><div class="sec notes">'+(rows||emptyBox(t('inbox_empty')))+'</div><p class="sub" style="font-size:13px">'+t('inbox_note')+'</p>';
}
function markNotesRead(){ if(!S.user||!unreadNotes()) return; var now=new Date().toISOString();
  S.notes.forEach(function(n){ if(!n.read_at) n.read_at=now; }); updateBell();
  sb.from('notifications').update({read_at:now}).is('read_at',null).then(function(){},function(){}); }
function toggleAlarm(id){
  if(needLogin()) return;
  var on=has(S.alarms,id);
  if(on) S.alarms.splice(S.alarms.indexOf(id),1); else { S.alarms.push(id); if(!has(S.saved,id)) S.saved.push(id); }
  buzz(); render(false); if(!on) toast(t('alarm_toast'));
  data(sb.from('bookmarks').upsert({event_id:id,profile_id:S.user.id,remind:!on})).catch(function(err){ loadMine().then(function(){ render(false); }); fail(err); });
}

function resetCaches(){ cache={att:{},profile:{},artists:null,connect:null,subs:null,admin:null,home:null,reviews:{},crew:{},rides:{},chats:null,chat:{}}; }

/* ---------- Shared pieces ---------- */
function whenOptions(){ return [['all','when_all'],['week','when_week'],['month','when_month']].map(function(w){ return '<option value="'+w[0]+'"'+(S.when===w[0]?' selected':'')+'>'+t(w[1])+'</option>'; }).join(''); }
function genreChips(){
  return '<button type="button" class="chip" data-act="genre" data-id="" aria-pressed="'+(S.genre==='')+'">'+t('genre_all')+'</button>'+
    GENRES.map(function(g){ return '<button type="button" class="chip" data-act="genre" data-id="'+esc(g)+'" aria-pressed="'+(S.genre===g)+'">'+esc(g)+'</button>'; }).join('');
}
function typeChips(){ return [['','type_all'],['club','type_club'],['festival','type_fest']].map(function(x){ return '<button type="button" class="chip" data-act="type" data-id="'+x[0]+'" aria-pressed="'+(S.type===x[0])+'">'+t(x[1])+'</button>'; }).join(''); }


/* ---------- install as app (PWA) ---------- */
var INSTALL_EVT=null;
function isStandalone(){ return (window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone===true; }
function isIOS(){ return /iphone|ipad|ipod/i.test(navigator.userAgent)&&!window.MSStream; }
window.addEventListener('beforeinstallprompt',function(e){ e.preventDefault(); INSTALL_EVT=e; if(location.hash===''||location.hash==='#home') render(false); });
window.addEventListener('appinstalled',function(){ INSTALL_EVT=null; lsSet('rs-inst','done'); render(false); });
if('serviceWorker' in navigator&&location.protocol==='https:'){ window.addEventListener('load',function(){ navigator.serviceWorker.register('sw.js').catch(function(){}); }); }
function installHTML(){
  if(isStandalone()||lsGet('rs-inst')) return '';
  if(!INSTALL_EVT&&!isIOS()) return '';
  return '<div class="install"><div class="grow"><strong>'+t('inst_t')+'</strong><p>'+(INSTALL_EVT?t('inst_sub'):t('inst_ios'))+'</p></div>'+
    (INSTALL_EVT?'<button type="button" class="btn small primary" data-act="install">'+t('inst_btn')+'</button>':'')+
    '<button type="button" class="btn small" data-act="instx" aria-label="'+t('inst_x')+'">✕</button></div>';
}

/* ---------- sharing & where users come from ---------- */
function appBase(){ return location.origin+location.pathname; }
function shareMsg(e,ref){
  if(!e) return {title:'Rave Strngrs',text:'',url:appBase()};
  var v=venue(e.v), d=dayOf(e.off), n=S.counts[e.id]||0;
  var url=appBase()+'?ref='+ref+'#event-'+e.id;
  var line2=fmtLong(d)+(e.time?', '+e.time:'')+' · '+(v?v.name+', '+v.city:'');
  var text=t('crew_msg')+'\n'+e.title+'\n'+line2+(n>1?'\n'+t('crew_going',{n:n}):'');
  return {title:e.title,text:text,url:url};
}
function waUrl(e){ var m=shareMsg(e,'wa'); return 'https://wa.me/?text='+encodeURIComponent(m.text+'\n'+m.url); }
function copyText(x){
  if(navigator.clipboard) navigator.clipboard.writeText(x).then(function(){ toast(t('copied')); },function(){ toast(x); });
  else toast(x);
}
function setCity(c){ S.homeCity=c; S.city=c; lsSet('rs-city',c); }
/* "Meine Stadt" via GPS: asked once on tap, used only here on the device, never saved or sent. */
/* On every visit: if location is allowed, follow the city you are in (unless you picked one by hand).
   First visit: ask once. Position stays in the browser, nothing is stored or sent. */
function autoLocate(){
  if(!navigator.geolocation||lsGet('rs-city-manual')==='1') return;
  function go(){ navigator.geolocation.getCurrentPosition(function(pos){
      var c=nearestCity(pos.coords.latitude,pos.coords.longitude); if(c&&c!==S.city){ setCity(c); render(false); } },function(){},{enableHighAccuracy:false,timeout:12000,maximumAge:900000}); }
  var ask=function(){ if(lsGet('rs-loc-asked')==='1') return; lsSet('rs-loc-asked','1'); go(); };
  if(navigator.permissions&&navigator.permissions.query){
    navigator.permissions.query({name:'geolocation'}).then(function(st){ if(st.state==='granted') go(); else if(st.state==='prompt') ask(); }).catch(ask);
  } else ask();
}
function nearestCity(la,lo){ var best=null, bd=1e9;
  VENUES.forEach(function(v){ if(!EVENTS.some(function(e){ return e.v===v.id&&upcoming(e); })) return;
    var dx=(v.lon-lo)*Math.cos(la*Math.PI/180), dy=v.lat-la, d=dx*dx+dy*dy; if(d<bd){ bd=d; best=v; } });
  return best?best.city:null; }
function locateCity(){
  if(!navigator.geolocation){ toast(t('loc_none')); return; }
  toast(t('loc_wait'));
  navigator.geolocation.getCurrentPosition(function(pos){
    var la=pos.coords.latitude, lo=pos.coords.longitude, best=null, bd=1e9;
    VENUES.forEach(function(v){ if(!EVENTS.some(function(e){ return e.v===v.id&&upcoming(e); })) return;
      var dx=(v.lon-lo)*Math.cos(la*Math.PI/180), dy=v.lat-la, d=dx*dx+dy*dy; if(d<bd){ bd=d; best=v; } });
    if(!best){ toast(t('loc_fail')); return; }
    var km=Math.sqrt(bd)*111; setCity(best.city); lsSet('rs-city-manual',''); render(false);
    toast(km>60?t('loc_far',{c:best.city}):t('loc_ok',{c:best.city}));
  },function(err){ toast(err&&err.code===1?t('loc_denied'):t('loc_fail')); },{enableHighAccuracy:false,timeout:12000,maximumAge:600000});
}
var REF=(function(){
  var r=null;
  try{ r=new URLSearchParams(location.search).get('ref'); }catch(e){}
  r=r?String(r).toLowerCase().slice(0,40):null;
  if(r&&!/^[a-z0-9_-]+$/.test(r)) r=null;
  if(r){
    if(!lsGet('rs-ref')) lsSet('rs-ref',r);              /* first touch wins for signup attribution */
    var m=/^#event-(\d+)/.exec(location.hash||'');
    var key='rs-ref-seen-'+r+(m?'-'+m[1]:'');
    var seen=null; try{ seen=sessionStorage.getItem(key); sessionStorage.setItem(key,'1'); }catch(e){}
    if(!seen){ try{ sb.rpc('track_ref',{p_ref:r,p_event:m?+m[1]:null}).then(function(){},function(){}); }catch(e){} }
    try{ history.replaceState(null,'',location.pathname+location.hash); }catch(e){}
  }
  return lsGet('rs-ref');
})();
var MON=['JAN','FEB','MÄR','APR','MAI','JUN','JUL','AUG','SEP','OKT','NOV','DEZ'];
function flyerHTML(e){ var v=venue(e.v), d=new Date(e.date+'T12:00:00'), c=CREWN[e.id];
  return '<a class="flyer" href="#event-'+e.id+'"><div class="fd"><b>'+d.getDate()+'</b><span>'+esc(fmtDow(d).toUpperCase())+' · '+MON[d.getMonth()]+'</span></div>'+
    '<div class="fb"><small>'+t('highlight')+'</small><strong>'+esc(e.title)+'</strong><div class="fm"><span>'+esc(v.name)+(e.time?' · '+esc(e.time):'')+'</span>'+(e.price?'<span>'+esc(priceTxt(e.price))+'</span>':'')+'</div>'+
    (c&&c.c?'<em>'+t('crew_cnt',{n:c.c})+'</em>':'')+'</div></a>'; }
function eventCard(e){
  var d=dayOf(e.off), v=venue(e.v), n=S.counts[e.id]||0, fr=friendsAt(e.id);
  var tag=tixTag(e)+(e.status==='pending'?' <span class="tag hot">'+t('pending')+'</span>':'')+(e.type==='festival'?' <span class="tag">'+t('fest_tag')+'</span>':'')+(has(S.saved,e.id)?' <span class="stars" title="'+t('saved_ev')+'">★</span>':'');
  return '<a class="ev" href="#event-'+e.id+'"><div class="date"><em>'+esc(fmtDow(d))+'</em><b>'+d.getDate()+'</b><span>'+esc(fmtMonth(d))+'</span></div>'+
    '<div><h3>'+esc(e.title)+tag+'</h3><p class="meta">'+esc(v?v.name:'')+(v?' · '+esc(v.city):'')+(e.time?' · '+esc(e.time):'')+'</p><div class="chips">'+genreTags(e.genres)+'</div></div>'+
    '<div class="side">'+(isNew(e)&&forYou(e)?'<span class="newb">'+t('new_badge')+'</span>':'')+cdHTML(e)+(fr.length?'<span class="fr">'+t('fr_n',{n:fr.length})+'</span>':'')+(CREWN[e.id]&&CREWN[e.id].c?'<span class="crewb">'+t('crew_cnt',{n:CREWN[e.id].c})+'</span>':'')+(n?'<span>'+(has(S.going,e.id)?'✓ ':'')+t('going_n',{n:n})+'</span>':'')+'</div></a>';
}
function socialsHTML(soc){
  var items=SOC.filter(function(s){ return soc&&soc[s[0]]; });
  if(!items.length) return '';
  return '<div class="socials">'+items.map(function(s){
    var val=String(soc[s[0]]), url=safeUrl(val)||(s[2]?s[2]+val.replace(/^@/,''):null);
    var inner='<em>'+esc(s[1])+'</em>'+esc(val.replace(/^https?:\/\/(www\.)?/,''));
    return url?'<a class="soc" href="'+esc(url)+'" target="_blank" rel="noopener nofollow">'+inner+'</a>':'<span class="soc">'+inner+'</span>';
  }).join('')+'</div>';
}
function gcalUrl(e){
  var v=venue(e.v), dates;
  function f(x){ return x.toISOString().replace(/[-:]/g,'').slice(0,15)+'Z'; }
  if(e.time){ var st=new Date(berlinToISO(e.date,e.time)); dates=f(st)+'/'+f(new Date(st.getTime()+6*3600000)); }
  else dates=e.date.replace(/-/g,'')+'/'+isoOf(e.off+1).replace(/-/g,'');
  var details=(e.lineup?'Line-up: '+e.lineup.join(', ')+'\n':'')+(e.src||'');
  return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text='+encodeURIComponent(e.title)+'&dates='+dates+'&location='+encodeURIComponent(v.name+', '+(v.addr||v.city))+'&details='+encodeURIComponent(details);
}
function ruleVal(x){ return x==='photo_ban'?t('photo_ban'):x; }
function swapUrl(e){
  /* direct TicketSwap event page if we have one, otherwise search the venue: full event titles rarely match TicketSwap's search */
  if(e.resale&&/^https:\/\/(www\.)?ticketswap\.[a-z.]+\//i.test(e.resale)) return e.resale;
  var v=venue(e.v); return 'https://www.ticketswap.com/search?query='+encodeURIComponent(v?v.name:e.title);
}
function scamHTML(){ return '<div class="warn" role="note"><b>⚠ '+t('scam_t')+'</b><ul><li>'+t('scam_1')+'</li><li>'+t('scam_2')+'</li><li>'+t('scam_3')+'</li><li>'+t('scam_4')+'</li></ul></div>'; }
function eur(x){ return x==null?'':Number(x).toLocaleString(locale(),{style:'currency',currency:'EUR'}); }
function ticketsHTML(e){
  var st=e.tstatus||'unknown', off=e.ticket||e.src;
  if(st==='unknown'&&e.ticket) st='shop'; /* Shop-Link da, Status unbekannt */
  var head='<div class="tix tix-'+st+'"><span class="tix-dot" aria-hidden="true"></span><strong>'+t('tix_'+st)+'</strong>'+(e.price?'<span class="tix-price">'+t('tix_price')+': '+esc(priceTxt(e.price))+'</span>':'')+'</div>';
  var links='<div class="row" style="margin-top:12px">'+(off?'<a class="btn'+(st!=='sold_out'?' primary':'')+'" href="'+esc(off)+'" target="_blank" rel="noopener">'+t('tix_official')+' ↗</a>':'')+
    (e.resale?'<a class="btn" href="'+esc(e.resale)+'" target="_blank" rel="noopener">'+t('tix_resale_off')+' ↗</a>':'')+
    '<a class="btn" href="'+esc(swapUrl(e))+'" target="_blank" rel="noopener nofollow">'+t('tix_swap',{v:(venue(e.v)||{}).name||''})+' ↗</a></div><p class="sub" style="font-size:13px">'+t('tix_swap_note')+'</p>';
  return head+(needsAlarm(e)?'<p class="sub" style="margin-top:12px">'+t('alarm_note')+'</p><div class="row">'+alarmBtn(e,false)+'</div>':'')+links+scamHTML();
}
function awareHTML(v){ var a=v&&v.rules&&v.rules.aware; return '<div class="nophone" style="margin-top:0"><div>'+t('aware_d')+(a?'<br><b>'+esc(t('aware_team',{x:a}))+'</b>':'')+'</div></div>'; }
function reportForm(kind,id){
  var reasons=[['rr1','harass'],['rr2','spam'],['rr6','scam'],['rr3','violence'],['rr4','wrong_info'],['rr5','other']].map(function(k){ return '<option value="'+k[1]+'">'+t(k[0])+'</option>'; }).join('');
  return '<details class="more"><summary>'+(kind==='event'?t('report_ev'):t('report'))+'</summary><form class="form" data-form="report" data-kind="'+kind+'" data-id="'+esc(id)+'" style="margin-top:8px">'+
    '<div class="field"><label for="rp-r">'+t('report_reason')+'</label><select id="rp-r" name="reason">'+reasons+'</select></div>'+
    '<div class="field"><label for="rp-t">'+t('report_txt')+'</label><textarea id="rp-t" name="text" maxlength="500"></textarea></div>'+
    '<div><button class="btn primary" type="submit">'+t('report_send')+'</button></div></form></details>';
}

/* ---------- Views: events ---------- */
function filteredEvents(){
  var q=S.q.trim().toLowerCase();
  return sortedEvents().filter(function(e){
    var v=venue(e.v);
    if(!inWindow(e)) return false;
    if(S.city&&v.city!==S.city) return false;
    if(S.genre&&e.genres.indexOf(S.genre)<0) return false;
    if(S.type==='festival'&&e.type!=='festival') return false;
    if(S.type==='club'&&e.type==='festival') return false;
    if(q&&(e.title+' '+v.name+' '+v.city+' '+(e.lineup||[]).join(' ')+' '+orgsOf(e.id).map(function(o){ return o.name; }).join(' ')).toLowerCase().indexOf(q)<0) return false;
    return true;
  });
}
function eventsListHTML(){
  var list=filteredEvents();
  if(!list.length) return '<div class="chips" style="margin:6px 0 10px"><a class="chip" href="#orgs">'+t('orgs_t')+'</a></div><div class="empty">'+t('none_found')+'</div>';
  var q=S.q.trim().toLowerCase(), om=q.length>=2?ORGS.filter(function(o){ return o.name.toLowerCase().indexOf(q)>=0; }).slice(0,4):[];
  var orgRow='<div class="chips" style="margin:6px 0 10px">'+om.map(function(o){ return '<a class="chip" aria-pressed="true" href="#org-'+esc(o.slug)+'">'+esc(o.name)+' →</a>'; }).join('')+'<a class="chip" href="#orgs">'+t('orgs_t')+'</a></div>';
  return orgRow+'<p class="count">'+t('n_events',{n:list.length})+'</p><div class="list">'+list.map(eventCard).join('')+'</div>';
}
function viewEvents(){
  var cities={}; VENUES.forEach(function(v){ cities[v.city]=1; });
  var cityOpts='<option value="">'+t('all_cities')+'</option>'+Object.keys(cities).sort(function(a,b){ return a.localeCompare(b,'de'); }).map(function(c){ return '<option'+(S.city===c?' selected':'')+'>'+esc(c)+'</option>'; }).join('');
  return '<div class="row" style="justify-content:space-between;align-items:flex-end"><div><h1>'+t('events_title')+'</h1><p class="sub">'+t('events_sub')+'</p></div>'+
    '<div class="row"><a class="btn" href="#map">'+t('nav_map')+'</a><a class="btn primary" href="#new-event">+ '+t('add_event')+'</a></div></div>'+
    '<div class="filters"><div class="field f-q"><label for="f-q">'+t('search')+'</label><input id="f-q" type="text" value="'+esc(S.q)+'" placeholder="'+esc(t('search_ph'))+'" autocomplete="off"></div>'+
    '<div class="field"><label for="f-city">'+t('city')+'</label><select id="f-city" data-sel="city">'+cityOpts+'</select></div>'+
    '<div class="field"><label for="f-when">'+t('when')+'</label><select id="f-when" data-sel="when">'+whenOptions()+'</select></div></div>'+
    '<div class="chips" style="margin-top:12px">'+typeChips()+'</div><div class="chips" style="margin-top:8px">'+genreChips()+'</div>'+
    (S.type==='festival'?'<p class="sub">'+t('fest_note')+'</p>':'')+
    '<div id="evlist">'+eventsListHTML()+'</div>';
}
function viewEvent(id){
  var e=evt(id);
  if(!e) return '<a class="back" href="#events">← '+t('back')+'</a><div class="empty">'+t('no_event')+'</div>';
  var d=dayOf(e.off), v=venue(e.v), go=has(S.going,e.id), sv=has(S.saved,e.id), n=S.counts[e.id]||0;
  var lineup=e.lineup?e.lineup.map(function(x){ return '<div class="person">'+av(x)+'<div class="grow"><strong>'+esc(x)+'</strong></div></div>'; }).join('')+(e.more?'<p class="sub" style="margin:4px 0 0">'+t('and_more',{n:e.more})+'</p>':''):emptyBox(t('lineup_tba'));
  var who;
  if(!S.user) who=emptyBox('<a class="link" href="#login" data-act="loginhere">'+t('login_to_see')+'</a>');
  else if(cache.att[e.id]===undefined){ who=loadingBox(); loadAttendees(e.id); }
  else who=cache.att[e.id].length?cache.att[e.id].map(function(p){ return '<a class="person" href="#u-'+esc(p.handle)+'">'+av(p)+'<div class="grow"><strong>'+esc(p.display_name)+(p.verified?VB:'')+'</strong><p>@'+esc(p.handle)+(p.city?' · '+esc(p.city):'')+'</p></div></a>'; }).join(''):emptyBox(t('nobody'));
  var fr=friendsAt(e.id), cdx=cdHTML(e);
  var hero=e.img?'<figure class="evbanner"><img src="'+esc(e.img)+'" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.closest(\'.evbanner\').remove()"><figcaption>'+t('banner_by')+': '+esc(e.imgCredit||host(e.src||e.img))+'</figcaption></figure>':'';
  return '<a class="back" href="#events">← '+t('back')+'</a>'+hero+(cdx?'<p class="kicker">'+cdx+'</p>':'')+'<h1>'+esc(e.title)+'</h1>'+
    '<div class="chips" style="margin-top:12px">'+genreTags(e.genres)+(e.type==='festival'?' <span class="tag hot">'+t('fest_tag')+'</span>':'')+'</div>'+orgChips(e)+
    '<dl class="facts"><div><dt>'+t('date')+'</dt><dd>'+esc(fmtLong(d))+(e.endDate&&e.endDate!==e.date?' – '+esc(fmtLong(dayOf(e.endOff))):'')+'</dd></div><div><dt>'+t('time')+'</dt><dd>'+(e.time?esc(e.time):t('tba'))+'</dd></div>'+
    '<div><dt>'+t('venue')+'</dt><dd><a href="#club-'+v.id+'">'+esc(v.name)+'</a>, '+esc(v.city)+'</dd></div></dl>'+
    (e.nophone?'<div class="nophone"><div><b>'+t('nophone_t')+'</b><br>'+t('nophone_d')+'</div></div>':'')+
    '<div class="row" style="margin-top:20px">'+(evPhase(e)==='past'?'':tixCta(e))+'<button type="button" class="btn '+(go?'on':'')+'" data-act="go" data-id="'+e.id+'" aria-pressed="'+go+'">'+(evPhase(e)==='past'?(go?'✓ '+t('was_there_on'):t('was_there')):(go?'✓ '+t('going'):t('go')))+'</button>'+
    '<button type="button" class="btn'+(sv?' on':'')+'" data-act="save" data-id="'+e.id+'" aria-pressed="'+sv+'">'+(sv?'★ '+t('saved_ev'):'☆ '+t('save_ev'))+'</button></div>'+
    checkinHTML(e)+evReviewsHTML(e)+
    '<div class="crewshare"><h2>'+t('crew_t')+'</h2><p class="sub">'+t('crew_sub')+'</p><div class="row">'+
      '<a class="btn primary" href="'+esc(waUrl(e))+'" target="_blank" rel="noopener" data-act="crewwa" data-id="'+e.id+'">'+t('crew_wa')+' ↗</a>'+
      (navigator.share?'<button type="button" class="btn" data-act="share" data-id="'+e.id+'">'+t('crew_more')+'</button>':'')+
      '<button type="button" class="btn" data-act="copylink" data-id="'+e.id+'">'+t('crew_copy')+'</button></div></div>'+
    crewHTML(e)+ridesHTML(e)+
    '<div class="row" style="margin-top:10px"><a class="btn" href="'+esc(gcalUrl(e))+'" target="_blank" rel="noopener">'+t('gcal')+' ↗</a>'+
    '<a class="btn" href="#map-'+v.id+'">'+t('show_map')+'</a></div>'+
    (n?'<p class="sub">'+t('going_n',{n:n})+'</p>':'')+
    (fr.length?'<div class="frline"><span class="fr">'+t('fr_going')+'</span>'+fr.slice(0,6).map(function(p){ return '<a href="#u-'+esc(p.handle)+'" title="'+esc(p.display_name)+'">'+av(p,30)+'</a>'; }).join('')+'<span class="sub" style="margin:0">'+esc(fr.slice(0,3).map(function(p){ return p.display_name; }).join(', '))+(fr.length>3?' +'+(fr.length-3):'')+'</span></div>':'')+
    '<div class="sec"><h2>'+t('tix_t')+'</h2>'+ticketsHTML(e)+'</div>'+
    '<div class="sec"><h2>'+t('lineup')+'</h2><div class="people">'+lineup+'</div></div>'+
    '<div class="sec"><h2>'+t('who_goes')+'</h2><div class="people">'+who+'</div></div>'+
    '<div class="sec"><h2>'+t('aware_t')+'</h2>'+awareHTML(v)+'</div>'+
    '<p class="srcbox">'+(e.src?t('source_t')+': <a class="link" href="'+esc(e.src)+'" target="_blank" rel="noopener">'+esc(host(e.src))+'</a>. '+t('source_note'):'')+'</p>'+
    (S.user?reportForm('event',e.id):'');
}
function loadAttendees(id){
  data(sb.from('attendance').select('profile_id,profiles(handle,display_name,avatar_url,city,verified)').eq('event_id',id)).then(function(rows){
    cache.att[id]=rows.filter(function(r){ return r.profiles; }).map(function(r){ return r.profiles; });
    if(location.hash==='#event-'+id) render(false);
  }).catch(function(err){ cache.att[id]=[]; fail(err); });
}

/* ---------- Views: home ---------- */
function relTime(iso){
  var m=Math.max(0,Math.round((Date.now()-new Date(iso).getTime())/60000));
  if(m<2) return t('ago_now'); if(m<60) return t('ago_min',{n:m});
  var h=Math.round(m/60); if(h<24) return t('ago_h',{n:h});
  var d=Math.round(h/24); return d===1?t('ago_1d'):t('ago_d',{n:d});
}
function weekendRange(){ var wd=dayOf(0).getDay(); var start=(wd===5||wd===6||wd===0)?0:5-wd; var end=(7-wd)%7; if(end<start) end=start+2; return [start,end]; }
function loadHome(){
  cache.home='loading';
  Promise.all([
    data(sb.from('posts').select('id,kind,title,body,link,created_at,author,profiles!posts_author_fkey(handle,display_name,avatar_url,verified)').eq('published',true).order('created_at',{ascending:false}).limit(10)),
    data(sb.from('headlines').select('url,source,title,published_at,lang').order('published_at',{ascending:false}).limit(40))
  ]).then(function(r){ cache.home={posts:r[0],headlines:r[1]}; if(route().tab==='home') render(false); })
    .catch(function(err){ cache.home={posts:[],headlines:[]}; fail(err); });
}
function postHTML(p){
  var a=p.profiles||{};
  return '<article class="card" style="margin-bottom:10px"><p class="sub" style="margin:0 0 6px;font-size:13px"><span class="tag'+(p.kind==='news'?' hot':'')+'">'+t('kind_'+p.kind)+'</span> '+
    (a.handle?'<a class="link" href="#u-'+esc(a.handle)+'">'+esc(a.display_name)+'</a>'+(a.verified?VB:''):'')+' · '+esc(relTime(p.created_at))+'</p>'+
    '<h3 style="margin:0 0 6px">'+esc(p.title)+'</h3>'+(p.body?'<p style="color:var(--text);white-space:pre-line;margin:0">'+esc(p.body)+'</p>':'')+
    (safeUrl(p.link)?'<p style="margin:8px 0 0"><a class="link" href="'+esc(p.link)+'" target="_blank" rel="noopener nofollow">'+esc(host(p.link))+' ↗</a></p>':'')+'</article>';
}
function headlinesFor(h){
  var all=(h&&h!=='loading')?h.headlines:[], mine=all.filter(function(x){ return x.lang===S.lang; }).slice(0,8);
  if(mine.length<5) mine=mine.concat(all.filter(function(x){ return x.lang!==S.lang; }).slice(0,5-mine.length));
  return mine;
}
function viewHome(){
  if(cache.home===null) loadHome();
  var city=S.homeCity!==null?S.homeCity:((S.me&&S.me.city)||'');
  var cities={}; EVENTS.forEach(function(e){ var v=venue(e.v); if(upcoming(e)) cities[v.city]=(cities[v.city]||0)+1; });
  var top=Object.keys(cities).sort(function(a,b){ return cities[b]-cities[a]; }).slice(0,8);
  if(city&&top.indexOf(city)<0) top.unshift(city);
  var needPick=S.homeCity===null&&!(S.me&&S.me.city);
  var allCities=Object.keys(cities).sort(function(a,b){ return a.localeCompare(b,'de'); });
  var picker=needPick?'<div class="citypick"><p class="kicker">'+t('pick_kicker')+'</p><h2>'+t('pick_t')+'</h2><p class="sub">'+t('pick_sub')+'</p><div class="cpgrid">'+
    top.slice(0,8).map(function(c){ return '<button type="button" class="btn" data-act="homecity" data-id="'+esc(c)+'">'+esc(c)+'<em>'+cities[c]+'</em></button>'; }).join('')+
    '<button type="button" class="btn" data-act="homecity" data-id="">'+t('pick_all')+'</button></div>'+
    '<div class="row" style="margin-top:12px"><button type="button" class="btn primary" data-act="locate">📍 '+t('loc_btn')+'</button></div>'+
    '<label class="sr" for="cp-other">'+t('pick_other')+'</label><select id="cp-other"><option value="">'+t('pick_other')+' …</option>'+allCities.map(function(c){ return '<option>'+esc(c)+'</option>'; }).join('')+'</select></div>':'';
  var chips='<button type="button" class="chip" data-act="locate" aria-label="'+esc(t('loc_btn'))+'">📍</button><button type="button" class="chip" data-act="homecity" data-id="" aria-pressed="'+(city==='')+'">'+t('home_all')+'</button>'+top.map(function(c){ return '<button type="button" class="chip" data-act="homecity" data-id="'+esc(c)+'" aria-pressed="'+(city===c)+'">'+esc(c)+'</button>'; }).join('');
  function inCity(e){ return !city||venue(e.v).city===city; }
  var rg=weekendRange();
  var wk=sortedEvents().filter(function(e){ return upcoming(e)&&inCity(e)&&e.off>=rg[0]&&e.off<=rg[1]; })
    .sort(function(a,b){ return (S.counts[b.id]||0)-(S.counts[a.id]||0)||a.off-b.off||(a.time||'').localeCompare(b.time||''); }).slice(0,8);
  var soon=S.user?S.going.map(evt).filter(function(e){ return e&&e.off>=0&&e.off<=1; }):[];
  var fresh=EVENTS.filter(function(e){ return upcoming(e)&&inCity(e)&&e.createdAt; }).sort(function(a,b){ return b.createdAt.localeCompare(a.createdAt)||a.off-b.off; }).slice(0,4);
  var friendEv=S.user?sortedEvents().filter(function(e){ return upcoming(e)&&friendsAt(e.id).length; }).slice(0,6):[];
  var fy=S.user?sortedEvents().filter(function(e){ return upcoming(e)&&forYou(e); }):[], fyNew=fy.filter(isNew).length;
  fy.sort(function(a,b){ return (isNew(b)?1:0)-(isNew(a)?1:0)||a.off-b.off; }); fy=fy.slice(0,6);
  var h=cache.home, isAdmin=S.me&&S.me.role==='admin', canPost=isAdmin||(S.me&&S.me.role==='artist'&&S.me.verified);
  var news=h==='loading'||!h?loadingBox():(h.posts.length?h.posts.map(postHTML).join(''):emptyBox(t('no_posts')));
  var ticker=h==='loading'||!h?'':(headlinesFor(h).length?'<div class="people">'+headlinesFor(h).map(function(x){ return '<a class="person" href="'+esc(x.url)+'" target="_blank" rel="noopener nofollow"><div class="grow"><strong>'+esc(x.title)+'</strong><p>'+esc(x.source)+(x.published_at?' · '+esc(relTime(x.published_at)):'')+'</p></div><span aria-hidden="true">↗</span></a>'; }).join('')+'</div><p class="sub" style="font-size:13px">'+t('ticker_note')+'</p>':'');
  var form=canPost?'<details class="more"><summary>+ '+t('post_write')+'</summary><form class="form" data-form="post" style="margin-top:8px">'+
    '<div class="field"><label for="p-title">'+t('post_title')+'</label><input id="p-title" name="title" type="text" maxlength="140" required></div>'+
    '<div class="field"><label for="p-body">'+t('post_body')+'</label><textarea id="p-body" name="body" maxlength="4000"></textarea></div>'+
    '<div class="field"><label for="p-link">'+t('post_link')+'</label><input id="p-link" name="link" type="url" placeholder="https://"></div>'+
    '<div><button class="btn primary" type="submit">'+t('post_publish')+'</button></div></form></details>':'';
  var marq=(h&&h!=='loading'&&headlinesFor(h).length)?(function(){ var items=headlinesFor(h).map(function(x){ return '<a href="'+esc(x.url)+'" target="_blank" rel="noopener nofollow"><b>'+esc(x.source)+'</b>'+esc(x.title)+'</a>'; }).join(''); return '<div class="marquee" aria-label="'+esc(t('home_ticker'))+'"><div class="track">'+items+'<span aria-hidden="true" style="display:inline-flex;gap:40px">'+items.replace(/<a /g,'<a tabindex="-1" ')+'</span></div></div>'; })():'';
  return marq+picker+installHTML()+'<p class="kicker">'+esc(t('home_kicker'))+'</p><h1>'+(S.me?esc(t('home_hi_name',{n:S.me.display_name})):t('home_hi'))+'</h1><p class="sub">'+t('home_sub')+'</p>'+
    '<div class="chips" style="margin-top:14px">'+chips+'</div>'+
    (wk.length?flyerHTML(wk[0]):'')+
    (soon.length?'<div class="sec"><h2>'+t('home_remind')+'</h2><div class="list" style="margin-top:0">'+soon.map(eventCard).join('')+'</div></div>':'')+
    (friendEv.length?'<div class="sec"><h2>'+t('home_friends')+'</h2><div class="list" style="margin-top:0">'+friendEv.map(eventCard).join('')+'</div></div>':'')+
    (S.user?'<div class="sec"><h2>'+t('home_foryou')+'</h2>'+(fy.length?(fyNew?'<p class="kicker">● '+t('n_new',{n:fyNew})+'</p>':'<p class="sub" style="margin:0 0 10px">'+t('foryou_note')+'</p>')+'<div class="list" style="margin-top:0">'+fy.map(eventCard).join('')+'</div>':emptyBox(t('foryou_empty')+' <a class="link" href="#artists">'+t('home_artists')+'</a>'))+'</div>':'')+
    '<div class="sec"><h2>'+(rg[0]===0?t('home_today'):t('home_weekend'))+'</h2>'+(wk.length?'<div class="list" style="margin-top:0">'+wk.map(eventCard).join('')+'</div>':emptyBox(t('home_weekend_none')))+
      '<div class="row" style="margin-top:10px"><a class="btn small" href="#events">'+t('home_all_events')+' →</a><a class="btn small" href="#map">'+t('nav_map')+' →</a></div></div>'+
    '<div class="sec"><h2>'+t('home_news')+'</h2>'+form+'<div style="margin-top:10px">'+news+'</div></div>'+
    (ticker?'<div class="sec"><h2>'+t('home_ticker')+'</h2>'+ticker+'</div>':'')+
    (fresh.length?'<div class="sec"><h2>'+t('home_new')+'</h2><div class="list" style="margin-top:0">'+fresh.map(eventCard).join('')+'</div></div>':'')+
    '<div class="sec"><a class="btn" href="#artists">'+t('home_artists')+' →</a></div>';
}

/* ---------- Views: club ---------- */
function revStars(name,val,label,req){
  var h='<div class="field"><label>'+label+'</label><div class="starpick" role="radiogroup" aria-label="'+esc(label)+'">';
  for(var i=5;i>=1;i--) h+='<input type="radio" id="'+name+i+'" name="'+name+'" value="'+i+'"'+(val===i?' checked':'')+'><label for="'+name+i+'" title="'+i+'">★</label>';
  return h+'</div></div>';
}
function loadReviews(id){
  cache.reviews[id]='loading';
  data(sb.from('reviews').select('id,author,stars,sound,crowd,door,safety,body,created_at,profiles(handle,display_name,avatar_url,verified)').eq('venue_id',id).is('event_id',null).order('created_at',{ascending:false}).limit(30))
    .then(function(r){ cache.reviews[id]=r; if(location.hash==='#club-'+id) render(false); }).catch(function(err){ cache.reviews[id]=[]; fail(err); });
}
function bar(label,x){ return x?'<div class="rbar"><span>'+label+'</span><i><b style="width:'+(x/5*100)+'%"></b></i><em>'+String(x).replace('.',S.lang==='de'?',':'.')+'</em></div>':''; }
/* ---------- Event-Bewertungen + Check-in (DB 027) ---------- */
S.checkins=[]; S.myEvRev=[]; var EVR={}, ORGR={};
function evPhase(e){ var now=Date.now(), s=new Date(e.startsAt).getTime(), end=e.endsAt?new Date(e.endsAt).getTime():s+14*3600e3;
  return now<s-3600e3?'future':(now<=end+2*3600e3?'live':'past'); }
function canRate(e){ return !!S.user&&has(S.going,e.id)&&evPhase(e)!=='future'&&Date.now()-new Date(e.startsAt).getTime()<21*864e5; }
function loadEvReviews(id){ EVR[id]='loading';
  Promise.all([data(sb.from('event_ratings').select('*').eq('event_id',id)),
    data(sb.from('reviews').select('id,author,stars,sound,crowd,door,safety,lineup,awareness,body,verified,created_at,profiles(handle,display_name,avatar_url,verified)').eq('event_id',id).order('created_at',{ascending:false}).limit(50))])
  .then(function(r){ EVR[id]={sum:r[0][0]||null,list:r[1]}; if(location.hash.indexOf('#event-'+id)===0){ render(false); jumpRate(); } })
  .catch(function(err){ EVR[id]={sum:null,list:[]}; fail(err); }); }
function checkinHTML(e){
  if(!S.user||evPhase(e)!=='live') return '';
  var on=has(S.checkins,e.id);
  return '<div class="checkin'+(on?' on':'')+'"><div class="grow"><b>'+(on?'✓ ':'')+t(on?'ci_done':'ci_t')+'</b><p class="sub" style="margin:4px 0 0">'+t(on?'ci_done_sub':'ci_sub')+'</p></div>'+
    (on?'':'<button type="button" class="btn primary" data-act="checkin" data-id="'+e.id+'">'+t('ci_btn')+'</button>')+'</div>'; }
function rateBars(r){ return bar(t('er_lineup'),r.lineup)+bar(t('rev_sound'),r.sound)+bar(t('rev_crowd'),r.crowd)+bar(t('rev_door'),r.door)+bar(t('er_safety'),r.safety)+bar(t('er_aware'),r.awareness); }
function evReviewsHTML(e){
  if(evPhase(e)==='future') return '';
  var c=EVR[e.id]; if(c===undefined){ loadEvReviews(e.id); c='loading'; }
  if(c==='loading') return '<div class="sec" id="rate"><h2>'+t('er_t')+'</h2>'+loadingBox()+'</div>';
  var r=c.sum, mine=S.user?c.list.filter(function(x){ return x.author===S.user.id; })[0]:null, sc=r?(r.score||r.avg):0;
  var sum=r&&r.n?'<div class="rsum"><div class="rbig"><b>'+String(sc).replace('.',S.lang==='de'?',':'.')+'</b>'+starsHTML(sc)+'<em>'+(r.n===1?t('rev_one'):t('rev_n',{n:r.n}))+(r.n_verified?'<br>'+t('er_verified_n',{n:r.n_verified}):'')+'</em></div><div class="rbars">'+rateBars(r)+'</div></div>':emptyBox(t('er_none'));
  var form;
  if(!S.user) form='<p class="sub"><a class="link" href="#login" data-act="loginhere">'+t('er_login')+'</a></p>';
  else if(mine||canRate(e)) form='<details class="more"'+(mine?'':' open')+'><summary>'+(mine?'✎ '+t('rev_edit'):'★ '+t('er_write'))+'</summary>'+
    '<form class="form" data-form="review" data-v="'+e.v+'" data-ev="'+e.id+'" data-rid="'+(mine?mine.id:'')+'" style="margin-top:8px" novalidate>'+
    '<p class="sub" style="margin:0;font-size:13px">'+t('er_rules')+'</p>'+revStars('r-stars',mine&&mine.stars,t('rev_overall'))+
    '<div class="form2">'+revStars('r-lineup',mine&&mine.lineup,t('er_lineup'))+revStars('r-sound',mine&&mine.sound,t('rev_sound'))+'</div>'+
    '<div class="form2">'+revStars('r-crowd',mine&&mine.crowd,t('rev_crowd'))+revStars('r-door',mine&&mine.door,t('rev_door'))+'</div>'+
    '<div class="form2">'+revStars('r-safety',mine&&mine.safety,t('er_safety'))+revStars('r-aware',mine&&mine.awareness,t('er_aware'))+'</div>'+
    '<div class="field"><label for="r-body">'+t('rev_body')+'</label><textarea id="r-body" name="body" maxlength="2000">'+esc(mine&&mine.body||'')+'</textarea></div>'+
    '<div id="rev-err" class="sub" style="color:var(--accent);margin:0" role="alert"></div><div><button class="btn primary" type="submit">'+t('rev_send')+'</button></div></form></details>';
  else form='<p class="sub">'+t(has(S.going,e.id)?'er_closed':'er_only_go')+'</p>';
  var items=c.list.filter(function(x){ return x.body; }).slice(0,20).map(function(x){ var p=x.profiles||{};
    return '<div class="review">'+starsHTML(x.stars)+(x.verified?'<span class="vtick">✓ '+t('er_was_there')+'</span>':'')+'<p>'+esc(x.body)+'</p><p class="addr">'+(p.handle?'<a class="link" href="#u-'+esc(p.handle)+'">'+esc(p.display_name)+'</a>'+(p.verified?VB:''):'')+' · '+esc(relTime(x.created_at))+'</p></div>'; }).join('');
  return '<div class="sec" id="rate"><h2>'+t('er_t')+'</h2>'+sum+form+(items?'<div class="reviews">'+items+'</div>':'')+'</div>';
}
function distM(a,b,c,d){ var R=6371000,r=Math.PI/180,x=Math.sin((c-a)*r/2),y=Math.sin((d-b)*r/2); return 2*R*Math.asin(Math.sqrt(x*x+Math.cos(a*r)*Math.cos(c*r)*y*y)); }
function jumpRate(){ if(!/^#event-\d+-rate$/.test(location.hash)) return; var el=document.getElementById('rate'); if(el&&el.scrollIntoView) setTimeout(function(){ el.scrollIntoView({block:'start'}); },50); }
function toRateHTML(){
  var list=EVENTS.concat(PAST).filter(function(e){ return has(S.going,e.id)&&!has(S.myEvRev,e.id)&&evPhase(e)==='past'&&canRate(e); }).sort(function(a,b){ return b.startsAt<a.startsAt?-1:1; }).slice(0,5);
  if(!list.length) return '';
  return '<div class="sec torate"><h2>'+t('er_torate')+'</h2><p class="sub">'+t('er_torate_sub')+'</p><div class="list" style="margin-top:0">'+list.map(function(e){
    var v=venue(e.v)||{}; return '<a class="ev" href="#event-'+e.id+'"><div class="grow"><strong>'+esc(e.title)+'</strong><p>'+esc(fmtLong(dayOf(e.off)))+' · '+esc(v.name||'')+'</p></div><span class="btn small primary">★ '+t('er_write')+'</span></a>'; }).join('')+'</div></div>'; }
function orgRatingHTML(o){
  var r=ORGR[o.id];
  if(r===undefined){ ORGR[o.id]=null; data(sb.from('organizer_ratings').select('*').eq('organizer_id',o.id)).then(function(x){ ORGR[o.id]=x[0]||false; if(location.hash==='#org-'+o.slug) render(false); }).catch(function(){ ORGR[o.id]=false; }); return ''; }
  if(!r||!r.n) return '';
  return '<div class="sec"><h2>'+t('rev_t')+'</h2><div class="rsum"><div class="rbig"><b>'+String(r.avg).replace('.',S.lang==='de'?',':'.')+'</b>'+starsHTML(r.avg)+'<em>'+t('org_rating',{n:r.n})+'</em></div><div class="rbars">'+rateBars(r)+'</div></div></div>'; }
function reviewsHTML(v){
  var r=RATINGS[v.id], list=cache.reviews[v.id];
  if(list===undefined){ loadReviews(v.id); list='loading'; }
  var sum=r&&r.n?'<div class="rsum"><div class="rbig"><b>'+String(r.avg).replace('.',S.lang==='de'?',':'.')+'</b>'+starsHTML(r.avg)+'<em>'+(r.n===1?t('rev_one'):t('rev_n',{n:r.n}))+'</em></div><div class="rbars">'+
    bar(t('rev_sound'),r.sound)+bar(t('rev_crowd'),r.crowd)+bar(t('rev_door'),r.door)+bar(t('rev_safety'),r.safety)+'</div></div>':emptyBox(t('rev_none'));
  var mine=S.user&&list!=='loading'?list.filter(function(x){ return x.author===S.user.id; })[0]:null;
  var items=list==='loading'?loadingBox():list.filter(function(x){ return x.body; }).slice(0,10).map(function(x){ var p=x.profiles||{};
    return '<div class="review">'+starsHTML(x.stars)+'<p>'+esc(x.body)+'</p><p class="addr">'+(p.handle?'<a class="link" href="#u-'+esc(p.handle)+'">'+esc(p.display_name)+'</a>'+(p.verified?VB:''):'')+' · '+esc(relTime(x.created_at))+'</p></div>'; }).join('');
  var form=!S.user?'<p class="sub"><a class="link" href="#login" data-act="loginhere">'+t('rev_login')+'</a></p>':
    '<details class="more"'+(mine?'':'')+'><summary>'+(mine?'✎ '+t('rev_edit'):'★ '+t('rev_write'))+'</summary><form class="form" data-form="review" data-v="'+v.id+'" data-rid="'+(mine?mine.id:'')+'" style="margin-top:8px" novalidate>'+
    '<p class="sub" style="margin:0;font-size:13px">'+t('rev_rules')+'</p>'+
    revStars('r-stars',mine&&mine.stars,t('rev_overall'))+
    '<div class="form2">'+revStars('r-sound',mine&&mine.sound,t('rev_sound'))+revStars('r-crowd',mine&&mine.crowd,t('rev_crowd'))+'</div>'+
    '<div class="form2">'+revStars('r-door',mine&&mine.door,t('rev_door'))+revStars('r-safety',mine&&mine.safety,t('rev_safety'))+'</div>'+
    '<div class="field"><label for="r-body">'+t('rev_body')+'</label><textarea id="r-body" name="body" maxlength="2000">'+esc(mine&&mine.body||'')+'</textarea></div>'+
    '<div id="rev-err" class="sub" style="color:var(--accent);margin:0" role="alert"></div><div><button class="btn primary" type="submit">'+t('rev_send')+'</button></div></form></details>';
  return sum+form+(items?'<div class="reviews">'+items+'</div>':'');
}
function viewClub(id){
  var v=venue(id);
  if(!v) return '<a class="back" href="#map">← '+t('back')+'</a><div class="empty">'+t('no_club')+'</div>';
  var evs=sortedEvents().filter(function(e){ return e.v===id&&upcoming(e); });
  var facts=RULE_KEYS.map(function(k){ var x=v.rules[k]; return '<div><dt>'+t(RULE_LABEL[k])+'</dt><dd'+(x?'':' style="color:var(--muted);font-weight:400"')+'>'+(x?esc(ruleVal(x)):t('not_set'))+'</dd></div>'; }).join('');
  var vf=has(S.vfollow,v.id);
  return '<a class="back" href="#map-'+v.id+'">← '+t('back')+'</a><h1>'+esc(v.name)+'</h1><p style="margin:10px 0 0">'+ratingLine(v.id)+'</p><p class="sub">'+esc(v.addr||v.city)+(v.approx?' · '+t('approx'):'')+'</p>'+(v.kind!=='club'?'<p class="sub"><span class="tag">'+t('kind_'+v.kind)+'</span> '+t('kind_note')+'</p>':'')+
    '<div class="row" style="margin-top:16px"><button type="button" class="btn '+(vf?'on':'primary')+'" data-act="vfollow" data-id="'+v.id+'" aria-pressed="'+vf+'">'+(vf?'✓ '+t('followed_club'):'+ '+t('follow_club'))+'</button><a class="btn" href="#map-'+v.id+'">'+t('show_map')+'</a></div>'+(vf?'<p class="sub" style="font-size:13px">'+t('push_note')+'</p>':'')+
    '<div class="sec"><h2>'+t('rev_t')+'</h2>'+reviewsHTML(v)+'</div>'+
    '<div class="sec"><h2>'+t('rules_t')+'</h2><dl class="facts" style="margin-top:0">'+facts+'</dl></div>'+
    '<div class="sec"><h2>'+t('aware_t')+'</h2>'+awareHTML(v)+'</div>'+
    '<div class="sec"><h2>'+t('upcoming')+'</h2>'+(evs.length?'<div class="list" style="margin-top:0">'+evs.map(eventCard).join('')+'</div>':emptyBox(t('no_ev_here')))+'</div>';
}

/* ---------- Views: artists, profiles ---------- */
function viewArtists(){
  if(cache.artists===null){
    cache.artists='loading';
    data(sb.from('profiles').select('handle,display_name,avatar_url,city,verified').eq('role','artist').eq('verified',true).order('display_name',{ascending:true}))
      .then(function(r){ cache.artists=r; if(location.hash==='#artists') render(false); }).catch(function(err){ cache.artists=[]; fail(err); });
  }
  var body=cache.artists==='loading'?loadingBox():(cache.artists.length?'<div class="grid">'+cache.artists.map(function(a){ return '<a class="acard" href="#u-'+esc(a.handle)+'">'+av(a,52)+'<div><strong>'+esc(a.display_name)+VB+'</strong><p>'+esc(a.city||'')+'</p></div></a>'; }).join('')+'</div>':'<div class="empty">'+t('no_artists')+'</div>');
  return '<h1>'+t('artists_title')+'</h1><p class="sub">'+t('artists_sub')+'</p>'+body;
}
function viewProfile(handle){
  var key=handle.toLowerCase();
  if(cache.profile[key]===undefined){
    cache.profile[key]='loading';
    data(sb.from('profiles').select('id,handle,display_name,avatar_url,city,bio,socials,verified,role').eq('handle',key).maybeSingle()).then(function(p){
      if(!p){ cache.profile[key]=null; return; }
      if(!S.user){ p.goes=[]; return p; }
      return data(sb.from('attendance').select('event_id').eq('profile_id',p.id)).then(function(a){ p.goes=a.map(function(x){ return x.event_id; }); return p; });
    }).then(function(p){ if(p) cache.profile[key]=p; if(location.hash.toLowerCase()==='#u-'+key) render(false); })
      .catch(function(err){ cache.profile[key]=null; fail(err); });
  }
  var p=cache.profile[key];
  var back='<a class="back" href="javascript:history.back()">← '+t('back')+'</a>';
  if(p==='loading') return back+loadingBox();
  if(!p) return back+'<div class="empty">'+t('profile_nf')+'</div>';
  var mine=S.user&&S.user.id===p.id, fo=!!followsP(p.id);
  var evs=(p.goes||[]).map(evt).filter(Boolean).sort(function(a,b){ return a.off-b.off; });
  return back+'<div class="hero">'+av(p,84)+'<div><h1>'+esc(p.display_name)+(p.verified?VB.replace('class="vb"','class="vb" style="width:26px;height:26px"'):'')+'</h1>'+
    '<p class="sub" style="margin-top:6px">@'+esc(p.handle)+(p.city?' · '+esc(p.city):'')+(p.verified?' · '+t('verified'):'')+'</p></div></div>'+
    fstatsHTML(p.id)+
    (mine?'':'<div class="row" style="margin-top:16px"><button type="button" class="btn" data-act="dm" data-id="'+esc(p.id)+'">'+t('write_dm')+'</button>'+'</div><div class="row" style="margin-top:8px"><button type="button" class="btn '+(fo?'on':'primary')+'" data-act="follow" data-id="'+esc(p.id)+'" data-h="'+esc(p.handle)+'" aria-pressed="'+fo+'">'+(fo?'✓ '+t('following'):'+ '+t('follow'))+'</button></div>')+
    (p.bio?'<p class="sub" style="margin-top:16px">'+esc(p.bio)+'</p>':'')+socialsHTML(p.socials)+
    (evs.length?'<div class="sec"><h2>'+t('upcoming_going')+'</h2><div class="list" style="margin-top:0">'+evs.map(eventCard).join('')+'</div></div>':'')+
    (S.user&&!mine?'<div class="sec"><div class="row"><button type="button" class="btn small" data-act="block" data-id="'+esc(p.id)+'">'+t('block')+'</button></div>'+reportForm('profile',p.id)+'<p class="sub">'+t('safety_note')+'</p></div>':'')+
    (mine?'<div class="row" style="margin-top:20px"><a class="btn" href="#me">'+t('me_title')+'</a></div>':'');
}

/* ---------- Followers / following ---------- */
var FSTATS={};
function fstatsHTML(id){
  var st=FSTATS[id];
  if(st===undefined){ FSTATS[id]=null;
    Promise.all([sb.from('follows').select('artist',{count:'exact',head:true}).eq('artist',id),sb.from('follows').select('follower',{count:'exact',head:true}).eq('follower',id)])
      .then(function(r){ FSTATS[id]={a:r[0].count||0,b:r[1].count||0}; render(false); }).catch(function(){}); }
  st=FSTATS[id]||{a:'–',b:'–'};
  return '<div class="fstats"><a href="#followers-'+esc(id)+'"><b>'+st.a+'</b><span>'+t('followers_l')+'</span></a><a href="#following-'+esc(id)+'"><b>'+st.b+'</b><span>'+t('following_l')+'</span></a></div>';
}
var FLIST={};
function viewFollowList(id,followers){
  var key=(followers?'a':'b')+id, rows=FLIST[key];
  if(rows===undefined){ FLIST[key]='loading';
    var q=followers?sb.from('follows').select('follower,profiles!follows_follower_fkey(id,handle,display_name,avatar_url,verified)').eq('artist',id):sb.from('follows').select('artist,profiles!follows_artist_fkey(id,handle,display_name,avatar_url,verified)').eq('follower',id);
    data(q.limit(500)).then(function(r){ FLIST[key]=r.map(function(x){ return x.profiles; }).filter(Boolean); render(false); }).catch(function(err){ FLIST[key]=[]; fail(err); }); rows='loading'; }
  var list=rows==='loading'?loadingBox():(rows.length?'<div class="people">'+rows.map(function(p){ return '<a class="person" href="#u-'+esc(p.handle)+'">'+av(p)+'<div class="grow"><strong>'+esc(p.display_name)+(p.verified?VB:'')+'</strong><p>@'+esc(p.handle)+'</p></div></a>'; }).join('')+'</div>':emptyBox(t('none_yet')));
  return '<a class="back" href="javascript:history.back()">← '+t('back')+'</a><h1>'+(followers?t('followers_l'):t('following_l'))+'</h1><div class="sec">'+list+'</div>';
}

/* ---------- Views: connect ---------- */
function viewConnect(){
  var head='<h1>'+t('connect_title')+'</h1><p class="sub">'+t('connect_sub')+'</p>';
  var soon='<div class="card" style="margin-top:24px"><p>'+t('chat_soon')+'</p></div>';
  if(!S.user) return head+'<div class="empty">'+t('connect_login')+'<div class="row" style="justify-content:center;margin-top:12px"><a class="btn primary" href="#login" data-act="loginhere">'+t('to_login')+'</a></div></div>'+soon;
  if(cache.connect===null){
    cache.connect='loading';
    var mine=S.going.slice();
    var p=mine.length?data(sb.from('attendance').select('event_id,profile_id,profiles(handle,display_name,avatar_url,city,verified)').in('event_id',mine)):Promise.resolve([]);
    p.then(function(rows){
      var by={};
      rows.forEach(function(r){ if(!r.profiles||r.profile_id===S.user.id) return; var k=r.profile_id; (by[k]=by[k]||{p:r.profiles,ev:[]}).ev.push(r.event_id); });
      cache.connect=Object.keys(by).map(function(k){ return by[k]; }).sort(function(a,b){ return b.ev.length-a.ev.length; });
      if(location.hash==='#connect') render(false);
    }).catch(function(err){ cache.connect=[]; fail(err); });
  }
  var c=cache.connect;
  var body=c==='loading'?loadingBox():(c.length?'<div class="people">'+c.map(function(x){
    var names=x.ev.map(evt).filter(Boolean).map(function(e){ return e.title; }).join(', ');
    return '<a class="person" href="#u-'+esc(x.p.handle)+'">'+av(x.p)+'<div class="grow"><strong>'+esc(x.p.display_name)+(x.p.verified?VB:'')+'</strong><p>'+(x.p.city?esc(x.p.city)+' · ':'')+t('goes_to')+' '+esc(names)+'</p></div></a>'; }).join('')+'</div>':'<div class="empty">'+t('connect_none')+'</div>');
  var chatsBox='<div class="sec"><h2>'+t('chats')+'</h2>'+chatsHTML()+'</div>';
  return head+chatsBox+'<div class="sec"><h2>'+t('connect_title')+'</h2>'+body+'</div>'+soon;
}


/* ---------- Crew finder & chat ---------- */
function ago(iso){
  var m=Math.round((Date.now()-new Date(iso).getTime())/60000);
  if(m<1) return S.lang==='de'?'gerade':'now';
  if(m<60) return m+' min';
  var h=Math.round(m/60); if(h<24) return h+' h';
  var p=berlinParts(new Date(iso)); return p.date;
}
function loadCrew(id){
  cache.crew[id]='loading';
  data(sb.from('crew_posts').select('id,author,body,created_at,profiles(handle,display_name,avatar_url,city,verified)').eq('event_id',id).order('created_at',{ascending:false}).limit(60))
    .then(function(r){ cache.crew[id]=r||[]; if(location.hash==='#event-'+id) render(false); })
    .catch(function(err){ cache.crew[id]=[]; fail(err); });
}
function crewHTML(e){
  var head='<div class="sec crew"><h2>'+t('crew_find')+'</h2><p class="sub">'+t('crew_find_sub')+'</p>'+
    '<div class="row" style="margin-bottom:12px"><button type="button" class="btn primary" data-act="joingrp" data-id="'+e.id+'">'+t('crew_group_join')+'</button><a class="btn" href="#sendev-'+e.id+'">'+t('send_to_chat')+'</a></div>';
  if(!S.user){ var cn=(CREWN[e.id]&&CREWN[e.id].c)||0; return head+'<div class="empty">'+(cn?'<b>'+t('crew_cnt',{n:cn})+'.</b> ':'')+'<a class="link" href="#login" data-act="loginhere">'+t('crew_login')+'</a></div></div>'; }
  var list=cache.crew[e.id];
  if(list===undefined){ loadCrew(e.id); list='loading'; }
  if(list==='loading') return head+loadingBox()+'</div>';
  var mine=list.filter(function(x){ return x.author===S.user.id; })[0];
  var form=mine?'':'<form class="form" data-form="crew" data-id="'+e.id+'" style="margin:10px 0 14px"><label class="sr" for="crew-b">'+t('crew_find')+'</label><textarea id="crew-b" name="body" maxlength="280" minlength="2" required placeholder="'+esc(t('crew_ph'))+'"></textarea><div><button class="btn primary" type="submit">'+t('crew_post')+'</button></div></form>';
  var items=list.length?'<div class="people">'+list.map(function(x){
    var p=x.profiles||{display_name:'Raver',handle:''}, own=x.author===S.user.id;
    return '<div class="person crewpost">'+av(p)+'<div class="grow"><strong>'+(p.handle?'<a href="#u-'+esc(p.handle)+'">'+esc(p.display_name)+'</a>':esc(p.display_name))+(p.verified?VB:'')+'</strong>'+
      '<p class="meta">'+(own?t('crew_mine')+' · ':'')+(p.city?esc(p.city)+' · ':'')+esc(ago(x.created_at))+'</p><p class="body">'+esc(x.body)+'</p></div>'+
      (own?'<button type="button" class="btn small" data-act="crewdel" data-id="'+x.id+'" data-ev="'+e.id+'">'+t('crew_del')+'</button>'
          :'<button type="button" class="btn small primary" data-act="dm" data-id="'+esc(x.author)+'">'+t('msg_btn')+'</button>')+'</div>';
  }).join('')+'</div>':emptyBox(t('crew_none'));
  return head+form+items+'</div>';
}

function loadRides(id){
  cache.rides[id]='loading';
  data(sb.from('rides').select('id,driver,from_city,departs_at,seats,note,profiles(handle,display_name,avatar_url,verified)').eq('event_id',id).order('departs_at',{ascending:true}).limit(50))
    .then(function(r){ cache.rides[id]=r||[]; if(location.hash==='#event-'+id) render(false); })
    .catch(function(err){ cache.rides[id]=[]; fail(err); });
}
function ridesHTML(e){
  var v=venue(e.v);
  var head='<div class="sec rides"><h2>'+t('ride_t')+'</h2><p class="sub">'+t('ride_sub')+'</p>';
  if(!S.user) return head+'<div class="empty"><a class="link" href="#login" data-act="loginhere">'+t('ride_login')+'</a></div></div>';
  var list=cache.rides[e.id];
  if(list===undefined){ loadRides(e.id); list='loading'; }
  if(list==='loading') return head+loadingBox()+'</div>';
  var mine=list.filter(function(x){ return x.driver===S.user.id; })[0];
  var d=dayOf(e.off), dd=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  var form=mine?'':'<details class="more"><summary>'+t('ride_open')+'</summary><form class="form" data-form="ride" data-id="'+e.id+'" style="margin-top:8px">'+
    '<div class="form2"><div class="field"><label for="r-from">'+t('ride_from')+'</label><input id="r-from" name="from" type="text" minlength="2" maxlength="60" required value="'+esc((S.me&&S.me.city)||S.homeCity||'')+'"></div>'+
    '<div class="field"><label for="r-when">'+t('ride_when')+'</label><input id="r-when" name="when" type="datetime-local" required value="'+dd+'T21:00"></div></div>'+
    '<div class="form2"><div class="field"><label for="r-seats">'+t('ride_seats')+'</label><select id="r-seats" name="seats">'+[1,2,3,4,5,6,7,8].map(function(n){ return '<option'+(n===3?' selected':'')+'>'+n+'</option>'; }).join('')+'</select></div>'+
    '<div class="field"><label for="r-note">'+t('ride_note')+'</label><input id="r-note" name="note" type="text" maxlength="200" placeholder="'+esc(t('ride_note_ph'))+'"></div></div>'+
    '<div><button class="btn primary" type="submit">'+t('ride_offer')+'</button></div></form></details>';
  var items=list.length?'<div class="people">'+list.map(function(x){
    var p=x.profiles||{display_name:'Raver',handle:''}, own=x.driver===S.user.id;
    return '<div class="person crewpost">'+av(p)+'<div class="grow"><strong>'+esc(t('ride_line',{from:x.from_city,to:v?v.city:''}))+'</strong>'+
      '<p class="meta">'+(own?t('ride_mine')+' · ':'')+esc(new Date(x.departs_at).toLocaleString(locale(),{timeZone:'Europe/Berlin',weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}))+' · '+(x.seats===1?t('ride_seat_1'):t('ride_seats_n',{n:x.seats}))+' · '+(p.handle?'<a href="#u-'+esc(p.handle)+'">'+esc(p.display_name)+'</a>':esc(p.display_name))+(p.verified?VB:'')+'</p>'+
      (x.note?'<p class="body">'+esc(x.note)+'</p>':'')+'</div>'+
      (own?'<button type="button" class="btn small" data-act="ridedel" data-id="'+x.id+'" data-ev="'+e.id+'">'+t('crew_del')+'</button>'
          :'<button type="button" class="btn small primary" data-act="dm" data-id="'+esc(x.driver)+'">'+t('msg_btn')+'</button>')+'</div>';
  }).join('')+'</div>':emptyBox(t('ride_none'));
  return head+items+form+'</div>';
}
function loadChats(){
  cache.chats='loading';
  sb.rpc('my_chats2').then(function(r){ if(r.error) throw r.error; cache.chats=r.data||[]; S.unread=(cache.chats||[]).reduce(function(a,c){ return a+(c.unread||0); },0); render(false); loadAvatars(cache.chats.map(function(c){ return c.other_id; })); })
    .catch(function(err){ cache.chats=[]; fail(err); });
}
var AVA={};
function loadAvatars(ids){ ids=(ids||[]).filter(function(id){ return id&&!(id in AVA); }); if(!ids.length) return;
  ids.forEach(function(id){ AVA[id]=null; });
  data(sb.from('profiles').select('id,avatar_url').in('id',ids)).then(function(r){ var any=false; r.forEach(function(p){ if(p.avatar_url){ AVA[p.id]=p.avatar_url; any=true; } }); if(any) render(false); }).catch(function(){}); }
function chatAv(x,nm){ return av({display_name:nm,avatar_url:x.is_group?null:AVA[x.other_id]}); }
function chatsHTML(){
  var c=cache.chats;
  if(c===null){ loadChats(); c='loading'; }
  if(c==='loading') return loadingBox();
  if(!c.length) return emptyBox(t('chats_none'));
  return '<div class="people">'+c.map(function(x){
    var nm=chatName(x), lb=x.last_body&&/^\[\[event:\d+\]\]$/.test(x.last_body)?t('event_msg'):x.last_body;
    var last=lb?((x.last_sender===S.user.id?t('you_')+': ':(x.is_group&&x.last_sender_name?x.last_sender_name+': ':''))+lb):(x.is_group?t('members_n',{n:x.members||1}):'');
    return '<a class="person" href="#chat-'+x.conversation_id+'">'+chatAv(x,nm)+'<div class="grow"><strong>'+esc(nm)+(x.other_verified?VB:'')+(x.is_group?' <span class="tag">'+t('crew_group')+'</span>':'')+'</strong><p>'+esc(last.slice(0,80))+'</p></div>'+
      (x.unread?'<span class="tag hot">'+t('unread_n',{n:x.unread})+'</span>':(x.last_at?'<span class="meta">'+esc(ago(x.last_at))+'</span>':''))+'</a>';
  }).join('')+'</div>';
}
function chatName(x){ return x.is_group?(x.title||t('crew_group')):(x.other_name||('@'+(x.other_handle||''))); }
function msgHTML(body){ var m=/^\[\[event:(\d+)\]\]$/.exec((body||'').trim()); if(!m) return '<p>'+esc(body)+'</p>';
  var e=evt(+m[1]); if(!e) return '<p>'+t('event_gone')+'</p>'; var v=venue(e.v);
  return '<a class="evmsg" href="#event-'+e.id+'"><small>'+esc(fmtShort(new Date(e.date+'T12:00:00')))+(e.time?' · '+esc(e.time):'')+'</small><strong>'+esc(e.title)+'</strong><span>'+esc(v.name)+'</span></a>'+
    (e.ticket?'<a class="btn small" href="'+esc(e.ticket)+'" target="_blank" rel="noopener">'+t('get_tix')+' ↗</a>':''); }
var CHATPOLL=null;
function loadChat(cid,quiet){
  if(!quiet) cache.chat[cid]=cache.chat[cid]||'loading';
  return data(sb.from('messages').select('id,sender,body,created_at,profiles(display_name,avatar_url,handle)').eq('conversation_id',cid).order('created_at',{ascending:true}).limit(300)).then(function(msgs){
    var prev=cache.chat[cid], changed=!prev||prev==='loading'||prev.msgs.length!==msgs.length;
    var other=(cache.chats||[]).filter&&(cache.chats||[]).filter(function(x){ return x.conversation_id===cid; })[0];
    cache.chat[cid]={msgs:msgs,other:other||(prev&&prev.other)||null};
    sb.from('conversation_members').update({last_read_at:new Date().toISOString()}).eq('conversation_id',cid).eq('profile_id',S.user.id).then(function(){},function(){});
    if(location.hash==='#chat-'+cid&&changed){ render(false); var box=document.getElementById('msgs'); if(box) box.scrollTop=box.scrollHeight; }
  });
}
function viewChat(cid){
  if(!S.user){ setTimeout(function(){ needLogin(); },0); return loadingBox(); }
  if(cache.chats===null) loadChats();
  var c=cache.chat[cid];
  if(!c){ loadChat(cid).catch(fail); c='loading'; }
  clearInterval(CHATPOLL); CHATPOLL=setInterval(function(){ if(location.hash!=='#chat-'+cid){ clearInterval(CHATPOLL); return; } loadChat(cid,true).catch(function(){}); },5000);
  if(c==='loading') return '<a class="back" href="#chats">← '+t('chats')+'</a>'+loadingBox();
  var o=c.other||((cache.chats||[]).filter?(cache.chats||[]).filter(function(x){ return x.conversation_id===cid; })[0]:null);
  var name=o?chatName(o):'Chat', grp=!!(o&&o.is_group);
  var msgs=c.msgs.map(function(m){ var me=m.sender===S.user.id, who=grp&&!me&&m.profiles?'<b class="who">'+esc(m.profiles.display_name||('@'+m.profiles.handle))+'</b>':'';
    return '<div class="msg'+(me?' me':'')+'">'+who+msgHTML(m.body)+'<span>'+esc(ago(m.created_at))+'</span></div>'; }).join('');
  return '<a class="back" href="#chats">← '+t('chats')+'</a><h1 class="chath">'+(o&&o.other_handle?'<a href="#u-'+esc(o.other_handle)+'">'+esc(name)+'</a>':esc(name))+(o&&o.other_verified?VB:'')+'</h1>'+
    '<p class="sub">'+t('chat_safety')+'</p><div class="msgs" id="msgs">'+(msgs||emptyBox('👋'))+'</div>'+
    '<form class="sendbar" data-form="msg" data-id="'+cid+'"><label class="sr" for="msg-b">'+t('chat_ph')+'</label><input id="msg-b" name="body" maxlength="2000" autocomplete="off" placeholder="'+esc(t('chat_ph'))+'" required><button class="btn primary" type="submit">'+t('send')+'</button></form>'+
    (grp?'<div class="sec"><div class="row">'+(o.event_id?'<a class="btn small" href="#event-'+o.event_id+'">'+t('open')+'</a>':'')+'<button type="button" class="btn small" data-act="leavegrp" data-id="'+cid+'">'+t('leave_group')+'</button></div></div>':'')+
    (o&&!grp?'<div class="sec"><div class="row"><button type="button" class="btn small" data-act="blockq" data-id="'+esc(o.other_id)+'" data-name="'+esc(name)+'">'+t('block')+'</button></div>'+reportForm('profile',o.other_id)+'</div>':'');
}
function viewChats(){
  if(!S.user){ setTimeout(function(){ needLogin(); },0); return loadingBox(); }
  return '<a class="back" href="#connect">← '+t('connect_title')+'</a><h1>'+t('chats')+'</h1><div class="sec">'+chatsHTML()+'</div>';
}

function viewSendEv(id){
  if(!S.user){ setTimeout(function(){ needLogin(); },0); return loadingBox(); }
  var e=evt(id); if(!e) return emptyBox(t('event_gone'));
  var c=cache.chats; if(c===null){ loadChats(); c='loading'; }
  var list=c==='loading'?loadingBox():(c.length?'<div class="people">'+c.map(function(x){ var nm=chatName(x);
    return '<button type="button" class="person" style="width:100%;text-align:left;background:none;border:0;border-bottom:1px solid var(--line)" data-act="sendto" data-id="'+x.conversation_id+'" data-ev="'+id+'">'+chatAv(x,nm)+'<div class="grow"><strong>'+esc(nm)+'</strong></div></button>'; }).join('')+'</div>':emptyBox(t('chats_none')));
  return '<a class="back" href="#event-'+id+'">← '+esc(e.title)+'</a><h1>'+t('send_to_chat')+'</h1><div class="sec">'+list+'</div>';
}
/* ---------- Invite friends + QR ---------- */
function inviteLink(){ return appBase()+'?ref=i-'+encodeURIComponent((S.me&&S.me.handle)||''); }
var INVITES=null;
function inviteHTML(){
  if(INVITES===null){ INVITES=0; data(sb.rpc('my_invites')).then(function(n){ INVITES=+n||0; if(location.hash==='#me') render(false); }).catch(function(){}); }
  return '<div class="sec invite"><h2>'+t('invite_t')+'</h2><p class="sub">'+t('invite_sub')+'</p>'+(INVITES?'<p class="kicker">'+t('invite_n',{n:INVITES})+'</p>':'')+
    '<div class="row"><button type="button" class="btn primary" data-act="invshare">'+t('invite_t')+'</button><button type="button" class="btn" data-act="invqr">QR</button><button type="button" class="btn" data-act="invcopy">'+t('copy_link')+'</button></div><div id="qrbox" class="qrbox" hidden></div></div>';
}
function showQr(){ var box=document.getElementById('qrbox'); if(!box) return;
  if(!box.hidden){ box.hidden=true; return; }
  function draw(){ var q=window.qrcode(0,'M'); q.addData(inviteLink()); q.make(); box.innerHTML=q.createSvgTag({cellSize:6,margin:3,scalable:true,alt:t('qr_t')})+'<p class="sub">'+t('qr_sub')+'</p>'; box.hidden=false; }
  if(window.qrcode) return draw();
  var sc=document.createElement('script'); sc.src='vendor/qrcode.js'; sc.onload=draw; document.head.appendChild(sc); }

/* ---------- Views: auth ---------- */
/* Login / welcome: big logo first, then it glides up and the options slide in one by one (CSS). */
function hasSession(){ try{ for(var i=0;i<localStorage.length;i++){ var k=localStorage.key(i); if(/^sb-.*-auth-token$/.test(k)) return true; } }catch(e){} return false; }
function showWelcomeGate(){ return !S.user&&!hasSession()&&lsGet('rs-welcome')!=='1'&&(location.hash===''||location.hash==='#home'); }
function viewLogin(gate){
  if(S.user){ setTimeout(function(){ location.hash='#me'; },0); return loadingBox(); }
  var login=S.authTab==='login', n=0;
  function wi(html){ n++; return '<div class="wi" style="--i:'+n+'">'+html+'</div>'; }
  return '<div class="welcome'+(gate?' gate':'')+'">'+
    '<div class="wlogo" aria-label="Rave Strngrs"><span>Rave</span><b>Strngrs</b></div>'+
    '<p class="wtag">'+t('tagline')+'</p>'+
    (S.authMsg?wi('<div class="nophone"><div>'+esc(S.authMsg)+'</div></div>'):'')+
    (after()?wi('<p class="sub">'+t('login_why')+'</p>'):'')+
    '<form class="form wform" data-form="'+(login?'login':'signup')+'" novalidate>'+
    (login?'':wi('<label class="sr" for="a-name">'+t('display_name')+'</label><input id="a-name" name="name" type="text" maxlength="60" autocomplete="nickname" required placeholder="'+esc(t('display_name'))+'">'))+
    wi('<label class="sr" for="a-mail">'+t('email')+'</label><input id="a-mail" name="email" type="email" autocomplete="email" required placeholder="'+esc(t('email'))+'">')+
    wi('<label class="sr" for="a-pw">'+t('password')+'</label><input id="a-pw" name="password" type="password" minlength="8" autocomplete="'+(login?'current-password':'new-password')+'" required placeholder="'+esc(t('password'))+'">'+(login?'':'<p class="sub" style="margin:6px 0 0;font-size:13px">'+t('pw_hint')+'</p>'))+
    (login?'':wi('<label class="row" style="gap:10px"><input type="checkbox" name="age" required style="width:20px;height:20px;accent-color:var(--accent)"> '+t('age_ok')+'</label>'))+
    '<div id="auth-err" class="sub" style="color:var(--accent);margin:0" role="alert">'+esc(S.authErr)+'</div>'+
    wi('<button class="btn primary wbig" type="submit">'+(login?t('login_btn'):t('signup_btn'))+'</button>')+
    '</form>'+
    wi('<button type="button" class="btn wbig2" data-act="authtab" data-id="'+(login?'signup':'login')+'">'+(login?t('new_here'):t('have_account'))+'</button>')+
    wi('<div class="wrow">'+(login?'<button type="button" class="linkbtn" data-act="forgot">'+t('reset_open')+'</button>':'<span></span>')+
      (gate?'<button type="button" class="linkbtn strong" data-act="skipwelcome">'+t('skip')+' →</button>':'')+'</div>')+
    wi('<p class="wlegal">'+t('legal_hint')+'</p>')+
  '</div>';
}

/* ---------- Views: my profile ---------- */
function viewMe(){
  if(!S.user) return viewLogin();
  var m=S.me;
  if(!m) return loadingBox();
  var soc=SOC.map(function(s){ return '<div class="field"><label for="soc-'+s[0]+'">'+esc(s[1])+'</label><input id="soc-'+s[0]+'" name="soc-'+s[0]+'" type="text" maxlength="200" value="'+esc((m.socials||{})[s[0]]||'')+'" placeholder="@handle"></div>'; }).join('');
  var cityOpts='<option value=""></option>'+CITIES.map(function(c){ return '<option'+(m.city===c.name?' selected':'')+'>'+esc(c.name)+'</option>'; }).join('');
  var verif;
  if(m.verified) verif='<p>'+t('verif_ok')+'</p>';
  else if(S.verif&&S.verif.status==='pending') verif='<p>'+t('verif_pending')+'</p>';
  else verif=(S.verif&&S.verif.status==='rejected'?'<p>'+t('verif_rejected')+'</p>':'')+'<p>'+t('verif_none')+'</p>'+
    '<form class="form" data-form="verify" style="margin-top:8px"><div class="field"><label for="v-name">'+t('verif_name')+'</label><input id="v-name" name="name" type="text" maxlength="80" required></div>'+
    '<div class="field"><label for="v-links">'+t('verif_links')+'</label><textarea id="v-links" name="links" placeholder="'+esc(t('verif_links_ph'))+'"></textarea></div><div><button class="btn" type="submit">'+t('verif_btn')+'</button></div></form>';
  var going=S.going.map(evt).filter(Boolean).sort(function(a,b){ return a.off-b.off; });
  var saved=S.saved.map(evt).filter(Boolean).sort(function(a,b){ return a.off-b.off; });
  if(cache.subs===null){
    cache.subs='loading';
    data(sb.from('events').select('id,title,starts_at,status').eq('created_by',S.user.id).order('created_at',{ascending:false}).limit(20))
      .then(function(r){ cache.subs=r; if(location.hash==='#me') render(false); }).catch(function(err){ cache.subs=[]; fail(err); });
  }
  var subs=cache.subs==='loading'?loadingBox():(cache.subs.length?'<div class="people">'+cache.subs.map(function(s){ var p=berlinParts(new Date(s.starts_at));
    return '<div class="person"><div class="grow"><strong>'+esc(s.title)+'</strong><p>'+esc(p.date)+'</p></div><span class="tag'+(s.status==='pending'?' hot':'')+'">'+(s.status==='pending'?t('pending'):esc(s.status))+'</span></div>'; }).join('')+'</div>':emptyBox(t('none_yet')));
  return '<div class="row" style="justify-content:space-between"><h1>'+t('me_title')+'</h1><div class="row"><a class="btn small" href="#settings">⚙ '+t('settings')+'</a></div></div>'+
    '<div class="hero" style="margin-top:16px"><a href="#settings" class="avlink" aria-label="'+esc(t(m.avatar_url?'av_change':'av_add'))+'">'+av(m,72)+(m.avatar_url?'':'<b class="avplus">+</b>')+'</a>'+'<div><h2 style="font-size:30px">'+esc(m.display_name)+(m.verified?VB:'')+'</h2><p class="sub" style="margin:2px 0 0"><a class="link" href="#u-'+esc(m.handle)+'">@'+esc(m.handle)+'</a>'+(m.city?' · '+esc(m.city):'')+'</p></div></div>'+
    fstatsHTML(m.id)+
    (m.role==='admin'?'<div class="row" style="margin-top:16px"><a class="btn primary" href="#admin">'+t('admin_open')+'</a></div>':'')+
    toRateHTML()+inviteHTML()+
    '<div class="sec"><h2>'+t('my_going')+'</h2>'+(going.length?'<div class="list" style="margin-top:0">'+going.map(eventCard).join('')+'</div>':emptyBox(t('none_yet')))+'</div>'+
    '<div class="sec"><h2>'+t('my_saved')+'</h2>'+(saved.length?'<div class="list" style="margin-top:0">'+saved.map(eventCard).join('')+'</div>':emptyBox(t('none_yet')))+'</div>'+
    '<div class="row" style="margin-top:22px"><a class="btn" href="#settings">✎ '+t('edit_profile')+'</a></div>'+
    '<div class="sec"><h2>'+t('tier_t')+'</h2><div class="card"><p><b style="color:var(--text)">'+esc(tierLine())+'</b></p>'+(S.tier&&S.tier.tier==='raver'&&S.tier.request_status==='pending'?'<p>'+t('pro_pending')+'</p>':'')+'<div class="row">'+(canAddEvents()?'<a class="btn primary" href="#new-event">+ '+t('add_event')+'</a>':'<a class="btn" href="#promoter">'+t('pro_t')+'</a>')+'</div></div></div>'+
    '<div class="sec"><h2>'+t('verif_t')+'</h2><div class="card">'+verif+'</div></div>'+
    '<div class="sec"><h2>'+t('my_subs')+'</h2>'+subs+'</div>'+
    '<div class="row" style="margin-top:28px"><a class="btn" href="#settings">⚙ '+t('settings')+'</a></div>';
}

/* ---------- Settings (DB 022) ---------- */
S.settings={}; var BLOCKS=null;
function setOn(k){ return S.settings[k]!==false; }
function loadSettings(){ if(!S.user) return;
  data(sb.from('user_settings').select('*').eq('profile_id',S.user.id)).then(function(r){ S.settings=r[0]||{}; if(location.hash==='#settings') render(false); }).catch(function(){}); }
function swRow(k){ var on=setOn(k);
  return '<label class="swrow"><div class="grow"><strong>'+t('set_'+k)+'</strong><p>'+t('set_'+k+'_sub')+'</p></div><input type="checkbox" role="switch" data-act="setting" data-id="'+k+'"'+(on?' checked':'')+'></label>'; }
function avEditHTML(m){
  return '<div class="avedit">'+av(m,84)+'<div class="grow"><strong>'+t('av_t')+'</strong><p class="sub" style="margin:2px 0 8px">'+t('av_hint')+'</p><div class="row">'+
    '<label class="btn small primary" for="av-file">'+t(m.avatar_url?'av_change':'av_pick')+'</label><input id="av-file" type="file" accept="image/*" class="sr">'+
    (m.avatar_url?'<button type="button" class="btn small" data-act="avdel">'+t('av_del')+'</button>':'')+'</div></div></div>'; }
function squareJpeg(file,size){ return new Promise(function(res,rej){
  var url=URL.createObjectURL(file), img=new Image();
  img.onload=function(){ var s=Math.min(img.naturalWidth,img.naturalHeight), c=document.createElement('canvas'); c.width=c.height=size;
    c.getContext('2d').drawImage(img,(img.naturalWidth-s)/2,(img.naturalHeight-s)/2,s,s,0,0,size,size); URL.revokeObjectURL(url);
    c.toBlob(function(b){ b?res(b):rej(new Error('blob')); },'image/jpeg',0.85); };
  img.onerror=function(){ URL.revokeObjectURL(url); rej(new Error('img')); }; img.src=url; }); }
function setAvatar(url){ return sb.from('profiles').update({avatar_url:url}).eq('id',S.user.id).select().single().then(function(r){ if(r.error) throw r.error; S.me=r.data; cache.profile={}; if(S.user) AVA[S.user.id]=url; render(false); }); }
function uploadAvatar(file){
  if(!file||!S.user) return; if(!/^image\//.test(file.type||'image/')){ toast(t('av_err')); return; }
  var path=S.user.id+'/avatar.jpg'; toast(t('av_busy'));
  squareJpeg(file,512).then(function(blob){ return sb.storage.from('avatars').upload(path,blob,{upsert:true,contentType:'image/jpeg',cacheControl:'3600'}); })
    .then(function(r){ if(r.error) throw r.error; return setAvatar(sb.storage.from('avatars').getPublicUrl(path).data.publicUrl+'?v='+Date.now()); })
    .then(function(){ toast(t('av_ok')); }).catch(function(){ toast(t('av_err')); }); }
function removeAvatar(){ if(!S.user) return;
  sb.storage.from('avatars').remove([S.user.id+'/avatar.jpg']).then(function(){ return setAvatar(null); }).then(function(){ toast(t('av_gone')); }).catch(function(){ toast(t('err_generic')); }); }
function meFormHTML(m){
  var soc=SOC.map(function(s){ return '<div class="field"><label for="soc-'+s[0]+'">'+esc(s[1])+'</label><input id="soc-'+s[0]+'" name="soc-'+s[0]+'" type="text" maxlength="200" value="'+esc((m.socials||{})[s[0]]||'')+'" placeholder="@handle"></div>'; }).join('');
  var cityOpts='<option value=""></option>'+CITIES.map(function(c){ return '<option'+(m.city===c.name?' selected':'')+'>'+esc(c.name)+'</option>'; }).join('');
  return avEditHTML(m)+
    '<form class="form" data-form="me" style="margin-top:0">'+
      '<div class="form2"><div class="field"><label for="me-name">'+t('display_name')+'</label><input id="me-name" name="name" type="text" maxlength="60" value="'+esc(m.display_name)+'" required></div>'+
      '<div class="field"><label for="me-handle">'+t('handle')+'</label><input id="me-handle" name="handle" type="text" maxlength="30" value="'+esc(m.handle)+'" autocapitalize="none" spellcheck="false"></div></div>'+
      '<div class="field"><label for="me-city">'+t('city')+'</label><select id="me-city" name="city">'+cityOpts+'</select></div>'+
      '<div class="field"><label for="me-bio">'+t('bio')+'</label><textarea id="me-bio" name="bio" maxlength="500" placeholder="'+esc(t('bio_ph'))+'">'+esc(m.bio||'')+'</textarea></div>'+
      '<div><b>'+t('soc_hint')+'</b></div><div class="form2">'+soc+'</div>'+
      '<div id="me-err" class="sub" style="color:var(--accent);margin:0" role="alert"></div><div><button class="btn primary" type="submit">'+t('save')+'</button></div></form>';
}
function viewSettings(){
  if(!S.user) return viewLogin();
  if(BLOCKS===null){ BLOCKS=[]; data(sb.rpc('my_blocks')).then(function(r){ BLOCKS=r||[]; if(location.hash==='#settings') render(false); }).catch(function(){}); }
  var bl=BLOCKS.length?BLOCKS.map(function(b){ return '<div class="swrow"><div class="grow"><strong>'+esc(b.display_name||('@'+b.handle))+'</strong></div><button type="button" class="btn small" data-act="unblock" data-id="'+esc(b.blocked)+'">'+t('unblock')+'</button></div>'; }).join(''):'<p class="sub">'+t('set_blocked_none')+'</p>';
  return '<a class="back" href="#me">← '+t('nav_me')+'</a><h1>'+t('settings')+'</h1>'+
    (S.me?'<div class="sec"><h2>'+t('edit_profile')+'</h2>'+meFormHTML(S.me)+'</div>':'')+
    '<div class="sec"><h2>'+t('set_account')+'</h2>'+
      '<form class="card form2" data-form="email"><div class="field"><label for="s-mail">'+t('set_email')+'</label><input id="s-mail" name="email" type="email" required autocomplete="email" value="'+esc(S.user.email||'')+'"></div><p class="sub" style="margin:0">'+t('set_email_hint')+'</p><div id="s-mail-msg" class="sub" role="status" style="margin:0"></div><div><button class="btn" type="submit">'+t('save')+'</button></div></form>'+
      '<div class="row" style="margin-top:12px"><a class="btn small" href="#newpw">'+t('change_pw')+'</a></div></div>'+
    '<div class="sec"><h2>'+t('inbox_t')+'</h2>'+swRow('notify_tickets')+swRow('notify_new')+swRow('notify_reminder')+'</div>'+
    '<div class="sec"><h2>'+t('set_privacy')+'</h2>'+swRow('dm_open')+swRow('going_visible')+'<h3 style="margin:18px 0 6px;font-size:14px">'+t('set_blocked')+'</h3>'+bl+'</div>'+
    '<div class="sec"><h2>'+t('set_session')+'</h2><div class="row"><button type="button" class="btn" data-act="logout">'+t('logout')+'</button></div></div>'+
    '<div class="sec danger"><h2>'+t('del_t')+'</h2><p class="sub">'+t('del_sub')+'</p><button type="button" class="btn small" data-act="delacct">'+t('del_btn')+'</button></div>';
}
function saveSetting(k,v){ if(!S.user) return; S.settings[k]=v;
  var row={profile_id:S.user.id,updated_at:new Date().toISOString()}; row[k]=v;
  data(sb.from('user_settings').upsert(row)).catch(function(err){ loadSettings(); fail(err); }); }

/* ---------- Account tiers (DB 029): raver = free, promoter = paid, may add events ---------- */
function loadTier(){ if(!S.user) return Promise.resolve();
  return sb.rpc('my_tier').then(function(r){ if(r.error) throw r.error; S.tier=(r.data&&r.data[0])||{tier:'raver'}; render(false); })
    .catch(function(err){ S.tier={tier:'raver'}; if(window.console) console.error(err); }); }
function canAddEvents(){ return !!S.tier&&(S.tier.tier==='promoter'||S.tier.tier==='admin'); }
function fmtUntil(x){ return new Date(x).toLocaleDateString(locale(),{day:'numeric',month:'long',year:'numeric',timeZone:'Europe/Berlin'}); }
function tierLine(){ var x=S.tier; if(!x) return '';
  if(x.tier==='admin') return t('tier_admin');
  if(x.tier==='promoter') return t('tier_promoter',{d:fmtUntil(x.active_until)});
  return t('tier_raver'); }
function viewPromoter(){
  var back='<a class="back" href="#me">← '+t('back')+'</a><h1>'+t('pro_t')+'</h1>';
  if(!S.user) return back+'<div class="empty">'+t('login_need')+'<div class="row" style="justify-content:center;margin-top:12px"><a class="btn primary" href="#login" data-act="loginhere">'+t('to_login')+'</a></div></div>';
  if(!S.tier) return back+loadingBox();
  if(canAddEvents()) return back+'<div class="card"><p>'+esc(tierLine())+'</p><div class="row"><a class="btn primary" href="#new-event">+ '+t('add_event')+'</a></div></div>';
  var x=S.tier, ended=x.active_until?'<p>'+t('tier_ended',{d:fmtUntil(x.active_until)})+'</p>':'';
  var info='<p class="sub">'+t('pro_lead')+'</p><ul class="sub" style="padding-left:20px;line-height:1.6"><li>'+t('pro_b1')+'</li><li>'+t('pro_b2')+'</li><li>'+t('pro_b3')+'</li></ul>';
  if(x.request_status==='pending') return back+info+'<div class="card">'+ended+'<p>'+t('pro_pending')+'</p></div>';
  return back+info+'<div class="card">'+ended+(x.request_status==='rejected'?'<p>'+t('pro_rejected')+'</p>':'')+
    '<form class="form" data-form="promoter"><div class="field"><label for="p-org">'+t('pro_org')+'</label><input id="p-org" name="org" type="text" maxlength="80" required></div>'+
    '<div class="field"><label for="p-web">'+t('pro_web')+'</label><input id="p-web" name="web" type="text" maxlength="300" placeholder="https://"></div>'+
    '<div class="field"><label for="p-note">'+t('pro_note')+'</label><textarea id="p-note" name="note" maxlength="1000"></textarea></div>'+
    '<div><button class="btn primary" type="submit">'+t('pro_send')+'</button></div></form></div>';
}

/* ---------- Views: new event ---------- */
function viewNew(){
  if(!S.user) return '<a class="back" href="#events">← '+t('back')+'</a><h1>'+t('new_title')+'</h1><div class="empty">'+t('login_need')+'<div class="row" style="justify-content:center;margin-top:12px"><a class="btn primary" href="#login" data-act="loginhere">'+t('to_login')+'</a></div></div>';
  if(!S.tier) return '<a class="back" href="#events">← '+t('back')+'</a><h1>'+t('new_title')+'</h1>'+loadingBox();
  if(!canAddEvents()) return '<a class="back" href="#events">← '+t('back')+'</a><h1>'+t('new_title')+'</h1><div class="card"><p><b style="color:var(--text)">'+t('pro_need')+'</b></p><p>'+t('pro_b1')+'</p><div class="row"><a class="btn primary" href="#promoter">'+t('pro_t')+'</a></div></div>';
  var vopts='<option value="">'+t('f_venue_pick')+'</option>'+VENUES.slice().sort(function(a,b){ return a.city.localeCompare(b.city,'de')||a.name.localeCompare(b.name,'de'); }).map(function(v){ return '<option value="'+v.id+'">'+esc(v.city)+' · '+esc(v.name)+'</option>'; }).join('');
  var g=GENRES.map(function(x){ return '<label class="chipcheck"><input type="checkbox" name="genre" value="'+esc(x)+'"><span>'+esc(x)+'</span></label>'; }).join('');
  return '<a class="back" href="#events">← '+t('back')+'</a><h1>'+t('new_title')+'</h1><p class="sub">'+t(S.tier.tier==='admin'||S.tier.trusted?'new_sub_live':'new_sub')+'</p>'+
    '<form class="form" data-form="event" novalidate>'+
    '<div class="field"><label for="n-title">'+t('f_title')+'</label><input id="n-title" name="title" type="text" maxlength="140"></div>'+
    '<div class="field"><label for="n-venue">'+t('f_venue')+'</label><select id="n-venue" name="venue">'+vopts+'</select><p class="sub" style="margin:4px 0 0;font-size:13px">'+t('f_venue_missing')+'</p></div>'+
    '<div class="form2"><div class="field"><label for="n-date">'+t('f_date')+'</label><input id="n-date" name="date" type="date" min="'+TODAY+'"></div>'+
    '<div class="field"><label for="n-time">'+t('f_time')+'</label><input id="n-time" name="time" type="time" value="23:00"></div></div>'+
    '<div class="field"><label for="n-end">'+t('f_end')+'</label><input id="n-end" name="end" type="date" min="'+TODAY+'"></div>'+
    '<div class="field"><label for="n-kind">'+t('f_kind')+'</label><select id="n-kind" name="kind"><option value="club">'+t('type_club')+'</option><option value="festival">'+t('type_fest')+'</option></select></div>'+
    '<div class="field"><label>'+t('f_genres')+'</label><div class="chips">'+g+'</div></div>'+
    '<div class="field"><label for="n-lineup">'+t('f_lineup')+'</label><input id="n-lineup" name="lineup" type="text"></div>'+
    '<div class="field"><label for="n-link">'+t('f_link')+'</label><input id="n-link" name="link" type="url" placeholder="https://"></div>'+
    '<div class="form2"><div class="field"><label for="n-price">'+t('f_price')+'</label><input id="n-price" name="price" type="text" maxlength="40"></div>'+
    '<div class="field"><label for="n-ts">'+t('f_tstatus')+'</label><select id="n-ts" name="tstatus"><option value="">'+t('tix_unknown')+'</option><option value="available">'+t('tix_available')+'</option><option value="few">'+t('tix_few')+'</option><option value="sold_out">'+t('tix_sold_out')+'</option></select></div></div>'+
    '<label class="row" style="gap:10px"><input type="checkbox" name="nophone" style="width:20px;height:20px;accent-color:#e4262e"> '+t('f_nophone')+'</label>'+
    '<div id="form-err" class="sub" style="color:var(--accent);margin:0" role="alert"></div><div><button class="btn primary" type="submit">'+t('f_submit')+'</button></div></form>';
}

function resetLeft(){ var u=0; try{ u=+sessionStorage.getItem('rs-reset-until')||0; }catch(e){} return Math.max(0,Math.ceil((u-Date.now())/1000)); }
var resetTick=null;
function viewReset(){
  var left=resetLeft(), sent=S.resetSent;
  /* Countdown: nur den Button-Text aktualisieren, nicht die ganze Seite neu zeichnen (sonst springt sie jede Sekunde) */
  if(left&&!resetTick) resetTick=setInterval(function(){
    var l=resetLeft(), b=document.querySelector('form[data-form=reset] button[type=submit]');
    if(location.hash!=='#reset'||!l){ clearInterval(resetTick); resetTick=null; if(location.hash==='#reset'&&b){ b.disabled=false; b.textContent=t(S.resetSent?'reset_again':'reset_btn'); } return; }
    if(b) b.textContent=t('reset_wait',{n:l}); },1000);
  var steps='<ol class="steps">'+[t('reset_s1'),t('reset_s2'),t('reset_s3')].map(function(x,i){ return '<li><span>'+(i+1)+'</span>'+esc(x)+'</li>'; }).join('')+'</ol>';
  var box=sent?'<div class="nophone"><div><b>'+t('reset_sent_t')+'</b><br>'+esc(t('reset_sent_d',{mail:sent}))+'</div></div>':'';
  return '<a class="back" href="#login">← '+t('reset_back')+'</a><h1>'+t('reset_t')+'</h1><p class="sub">'+t('reset_intro')+'</p>'+steps+box+
    '<form class="form" data-form="reset" novalidate><div class="field"><label for="r-mail">'+t('email')+'</label><input id="r-mail" name="email" type="email" autocomplete="email" value="'+esc(S.resetMail||'')+'" required></div>'+
    '<div id="reset-err" class="sub" style="color:var(--accent);margin:0" role="alert">'+esc(S.resetErr||'')+'</div>'+
    '<button class="btn primary" type="submit"'+(left?' disabled':'')+'>'+(left?t('reset_wait',{n:left}):(sent?t('reset_again'):t('reset_btn')))+'</button></form>';
}
function viewLinkBad(){
  return '<h1>'+t('link_bad_t')+'</h1><div class="empty" style="text-align:left">'+t('link_bad_d')+'</div>'+
    '<div class="row" style="margin-top:16px"><a class="btn primary" href="#reset">'+t('link_new')+'</a><a class="btn" href="#login">'+t('reset_back')+'</a></div>';
}
function viewNewPw(){
  if(!S.user) return '<h1>'+t('newpw_t')+'</h1><div class="empty">'+t('newpw_need')+'</div>';
  return '<a class="back" href="#me">← '+t('back')+'</a><h1>'+t('newpw_t')+'</h1>'+
    '<form data-form="newpw" class="card" style="margin-top:16px" autocomplete="on"><input type="email" name="username" value="'+esc(S.user.email||'')+'" autocomplete="username" hidden>'+
    '<div class="field"><label for="np-1">'+t('newpw_l')+'</label><input id="np-1" name="pw" type="password" minlength="8" autocomplete="new-password" required></div>'+
    '<div class="field"><label for="np-2">'+t('newpw_l2')+'</label><input id="np-2" name="pw2" type="password" minlength="8" autocomplete="new-password" required></div>'+
    '<div id="np-err" class="sub" style="color:var(--accent);margin:0 0 10px" role="alert"></div><button class="btn primary" type="submit">'+t('newpw_btn')+'</button></form>';
}

/* ---------- Views: admin ---------- */
function viewAdmin(){
  if(!S.me||S.me.role!=='admin') return '<div class="empty">'+t('login_need')+'</div>';
  if(cache.admin===null){
    cache.admin='loading';
    Promise.all([
      data(sb.from('artist_verifications').select('id,artist_name,proof_links,note,created_at,profile_id,profiles!artist_verifications_profile_id_fkey(handle,display_name,avatar_url)').eq('status','pending').order('created_at',{ascending:true})),
      data(sb.from('events').select('id,title,starts_at,venue_id,source_url,created_by,status,review_state,review_note').or('status.eq.pending,review_state.eq.unclear').neq('status','cancelled').order('starts_at',{ascending:true})),
      data(sb.from('reports').select('id,reason,kind,ref_id,target_user,note,snippet,details,created_at,target_profile,target_event').eq('status','open').order('created_at',{ascending:true})),
      sb.rpc('admin_ref_stats',{p_days:30}).then(function(x){ return (x&&x.data)||[]; },function(){ return []; }),
      data(sb.from('promoter_requests').select('id,org_name,website,note,created_at,profiles!promoter_requests_profile_id_fkey(handle,display_name)').eq('status','pending').order('created_at',{ascending:true})).catch(function(){ return []; }),
      data(sb.from('promoters').select('profile_id,org_name,active_until,profiles(handle,display_name)').gt('active_until',new Date().toISOString()).order('active_until',{ascending:true})).catch(function(){ return []; })
    ]).then(function(r){ cache.admin={verif:r[0],events:r[1],reports:r[2],refs:r[3]||[],proReq:r[4]||[],pros:r[5]||[]}; if(location.hash==='#admin') render(false); })
      .catch(function(err){ cache.admin={verif:[],events:[],reports:[],refs:[],proReq:[],pros:[]}; fail(err); });
  }
  var a=cache.admin;
  if(a==='loading') return '<h1>'+t('admin_t')+'</h1>'+loadingBox();
  var ver=a.verif.length?a.verif.map(function(x){
    var links=(x.proof_links||[]).map(function(u){ var s=safeUrl(u); return s?'<a class="link" href="'+esc(s)+'" target="_blank" rel="noopener nofollow">'+esc(host(s))+'</a>':esc(u); }).join(' · ');
    return '<div class="card" style="margin-bottom:8px"><p><b style="color:var(--text)">'+esc(x.artist_name)+'</b> · '+(x.profiles?'<a class="link" href="#u-'+esc(x.profiles.handle)+'">@'+esc(x.profiles.handle)+'</a>':'')+'</p><p>'+(links||'–')+'</p>'+
      '<div class="row"><button type="button" class="btn small primary" data-act="adm-approve" data-id="'+x.id+'">'+t('approve')+'</button><button type="button" class="btn small" data-act="adm-reject" data-id="'+x.id+'">'+t('reject')+'</button></div></div>'; }).join(''):emptyBox(t('none_yet'));
  var evs=a.events.length?a.events.map(function(x){ var v=venue(x.venue_id), p=berlinParts(new Date(x.starts_at)), s=safeUrl(x.source_url);
    var badge=x.review_state==='unclear'?' <span class="tag hot">'+t('rev_unclear')+'</span>':(x.status==='pending'?' <span class="tag">'+t('rev_waiting')+'</span>':'');
    return '<div class="card" style="margin-bottom:8px"><p><a class="link" href="#event-'+x.id+'"><b style="color:var(--text)">'+esc(x.title)+'</b></a>'+badge+(x.status==='published'?' <span class="tag">'+t('rev_live')+'</span>':'')+'</p><p>'+esc(p.date)+' '+esc(p.time)+' · '+esc(v?v.name+', '+v.city:'?')+(s?' · <a class="link" href="'+esc(s)+'" target="_blank" rel="noopener nofollow">'+esc(host(s))+'</a>':'')+'</p>'+
      (x.review_note?'<p class="sub" style="margin:4px 0 8px">'+t('rev_note')+': '+esc(x.review_note)+'</p>':'')+
      '<div class="row"><button type="button" class="btn small primary" data-act="adm-publish" data-id="'+x.id+'">'+t('publish')+'</button><button type="button" class="btn small" data-act="adm-cancel" data-id="'+x.id+'">'+t('reject')+'</button></div></div>'; }).join(''):emptyBox(t('none_yet'));
  var reps=a.reports.length?a.reports.map(function(x){
    var ev=x.target_event||(x.kind==='event'?x.ref_id:null), who=x.target_user||x.target_profile;
    var target=ev?'<a class="link" href="#event-'+(+ev)+'">Event #'+(+ev)+'</a>':esc(x.kind||'profile')+(who?' · '+esc(String(who).slice(0,8)):'')+(x.ref_id&&x.kind!=='event'?' #'+(+x.ref_id):'');
    var txt=x.note||x.details;
    return '<div class="card" style="margin-bottom:8px"><p><b style="color:var(--text)">'+esc(x.reason)+'</b> · '+target+'</p>'+(txt?'<p>'+esc(txt)+'</p>':'')+(x.snippet?'<p class="sub">„'+esc(x.snippet)+'“</p>':'')+
      '<div class="row"><button type="button" class="btn small" data-act="adm-report" data-id="'+x.id+'">'+t('done')+'</button></div></div>'; }).join(''):emptyBox(t('none_yet'));
  var refs=(a.refs||[]).length?'<table class="reftab"><thead><tr><th></th><th>'+t('ref_visits')+'</th><th>'+t('ref_signups')+'</th></tr></thead><tbody>'+a.refs.map(function(x){ return '<tr><td>'+esc(x.ref)+'</td><td>'+(+x.visits)+'</td><td>'+(+x.signups)+'</td></tr>'; }).join('')+'</tbody></table>':emptyBox(t('none_yet'));
  var who=function(p){ return p?'<a class="link" href="#u-'+esc(p.handle)+'">@'+esc(p.handle)+'</a>':''; };
  var proReq=a.proReq.length?a.proReq.map(function(x){ var s=safeUrl(x.website||'');
    return '<div class="card" style="margin-bottom:8px"><p><b style="color:var(--text)">'+esc(x.org_name)+'</b> · '+who(x.profiles)+'</p>'+
      (x.website?'<p>'+(s?'<a class="link" href="'+esc(s)+'" target="_blank" rel="noopener nofollow">'+esc(host(s))+'</a>':esc(x.website))+'</p>':'')+(x.note?'<p>'+esc(x.note)+'</p>':'')+
      '<div class="row"><button type="button" class="btn small primary" data-act="adm-pro-ok" data-id="'+x.id+'" data-m="1">'+t('adm_m1')+'</button><button type="button" class="btn small primary" data-act="adm-pro-ok" data-id="'+x.id+'" data-m="12">'+t('adm_m12')+'</button><button type="button" class="btn small" data-act="adm-pro-no" data-id="'+x.id+'">'+t('reject')+'</button></div></div>'; }).join(''):emptyBox(t('none_yet'));
  var pros=a.pros.length?a.pros.map(function(x){
    return '<div class="card" style="margin-bottom:8px"><p><b style="color:var(--text)">'+esc(x.org_name||'–')+'</b> · '+who(x.profiles)+' · '+t('adm_until',{d:fmtUntil(x.active_until)})+'</p>'+
      '<div class="row"><button type="button" class="btn small" data-act="adm-pro-ext" data-id="'+esc(x.profile_id)+'" data-m="1">'+t('adm_plus1')+'</button><button type="button" class="btn small" data-act="adm-pro-ext" data-id="'+esc(x.profile_id)+'" data-m="0">'+t('adm_end')+'</button></div></div>'; }).join(''):emptyBox(t('none_yet'));
  return '<a class="back" href="#me">← '+t('back')+'</a><h1>'+t('admin_t')+'</h1>'+
    '<div class="sec"><h2>'+t('adm_pro')+'</h2>'+proReq+'</div><div class="sec"><h2>'+t('adm_pro_act')+'</h2>'+pros+'</div>'+
    '<div class="sec"><h2>'+t('adm_refs')+'</h2><p class="sub">'+t('adm_refs_sub')+'</p>'+refs+'</div><div class="sec"><h2>'+t('adm_verif')+'</h2>'+ver+'</div><div class="sec"><h2>'+t('adm_events')+'</h2>'+evs+'</div><div class="sec"><h2>'+t('adm_reports')+'</h2>'+reps+'</div>';
}

/* ---------- Map: MapLibre GL (GPU) on OpenFreeMap vector tiles, restyled grey ---------- */
var ML=null, MLDIV=null, MLREADY=false, MLFAIL=false, MLWANT=null;
var DE_BOUNDS=[[5.6,47.1],[15.3,55.1]];
var MAPSTYLE='https://tiles.openfreemap.org/styles/positron';
function mapEvents(){ return EVENTS.filter(function(e){ return inWindow(e) && (!S.genre || e.genres.indexOf(S.genre)>-1); }).sort(function(a,b){ return a.off-b.off; }); }
function venueEvents(id,list){ return (list||mapEvents()).filter(function(e){ return e.v===id; }); }
function evCountLabel(n){ return n===1?t('ev_one'):t('ev_many',{n:n}); }
function starsHTML(x){ var r=Math.round(x||0), s=''; for(var i=1;i<=5;i++) s+='<span class="'+(i<=r?'on':'')+'">★</span>'; return '<span class="stars5" aria-label="'+(x||0)+' / 5">'+s+'</span>'; }
function ratingLine(id){ var r=RATINGS[id]; return r&&r.n?'<span class="rate">'+starsHTML(r.avg)+' <b>'+String(r.avg).replace('.',S.lang==='de'?',':'.')+'</b> <em>('+r.n+')</em></span>':'<span class="rate none">'+t('no_rating')+'</span>'; }
function isApple(){ var u=navigator.userAgent||''; return /iPhone|iPad|iPod|Macintosh/.test(u)&&!/Android/.test(u); }
function routeUrl(v){ /* Apple-Geräte -> Apple Karten, sonst Google Maps */
  return isApple() ? 'https://maps.apple.com/?daddr='+v.lat+','+v.lon+'&dirflg=d' : 'https://www.google.com/maps/dir/?api=1&destination='+v.lat+','+v.lon; }

function sheetHTML(){
  var v=S.mapSel?venue(S.mapSel):null;
  if(!v) return '';
  var evs=venueEvents(v.id).slice(0,3), vf=has(S.vfollow,v.id);
  var rows=evs.map(function(e){ var d=dayOf(e.off);
    return '<a class="evrow" href="#event-'+e.id+'"><b>'+esc(fmtDow(d))+' '+d.getDate()+'. '+esc(fmtMonth(d))+'</b><div><strong>'+esc(e.title)+'</strong><p>'+(e.time?esc(e.time):t('tba'))+' · '+esc(e.genres.join(', '))+'</p></div></a>'; }).join('');
  var more=venueEvents(v.id).length-evs.length;
  return '<div class="sheet-grip" aria-hidden="true"></div><button type="button" class="sheet-x" data-act="sheetclose" aria-label="'+esc(t('close'))+'">✕</button>'+
    '<p class="kicker" style="margin:0 0 6px">'+esc(v.city)+(v.kind!=='club'?' · '+esc(t('kind_'+v.kind)):'')+'</p>'+
    '<h2><a href="#club-'+v.id+'">'+esc(v.name)+'</a></h2>'+ratingLine(v.id)+
    '<p class="addr">'+esc(v.addr||v.city)+(v.approx?' · '+t('approx'):'')+'</p>'+
    (rows?'<div class="sheet-evs">'+rows+'</div>'+(more>0?'<p class="addr">+ '+evCountLabel(more)+'</p>':''):'<p class="sub" style="font-size:14px">'+t('no_ev_here')+'</p>')+
    '<div class="row" style="margin-top:12px"><a class="btn small primary" href="#club-'+v.id+'">'+t('open_club')+' →</a>'+
    '<a class="btn small" href="'+esc(routeUrl(v))+'" target="_blank" rel="noopener">'+t('route')+' ↗</a>'+
    '<button type="button" class="btn small'+(vf?' on':'')+'" data-act="vfollow" data-id="'+v.id+'" aria-pressed="'+vf+'">'+(vf?'✓ '+t('following'):'+ '+t('follow'))+'</button></div>';
}
var MLPOP=null, MLPINNED=false, MLHOVERT=null;
function isFine(){ return !!(window.matchMedia&&window.matchMedia('(hover:hover) and (pointer:fine)').matches); }
function popHTML(id){
  var v=venue(id); if(!v) return '';
  var evs=venueEvents(v.id).slice(0,2), more=venueEvents(v.id).length-evs.length;
  var rows=evs.map(function(e){ var d=dayOf(e.off);
    return '<a class="evrow" href="#event-'+e.id+'"><b>'+esc(fmtDow(d))+' '+d.getDate()+'.'+(d.getMonth()+1)+'. · '+(e.time?esc(e.time):t('tba'))+'</b><div><strong>'+esc(e.title)+'</strong></div></a>'; }).join('');
  return '<p class="kicker" style="margin:0 0 4px">'+esc(v.city)+(v.kind!=='club'?' · '+esc(t('kind_'+v.kind)):'')+'</p>'+
    '<h3 class="pop-t"><a href="#club-'+v.id+'">'+esc(v.name)+'</a></h3>'+ratingLine(v.id)+
    '<p class="addr">'+esc(v.addr||v.city)+'</p>'+
    (rows?'<div class="sheet-evs">'+rows+'</div>'+(more>0?'<p class="addr">+ '+evCountLabel(more)+'</p>':''):'<p class="addr">'+t('no_ev_here')+'</p>')+
    '<div class="row" style="margin-top:10px"><a class="btn small primary" href="#club-'+v.id+'">'+t('open_club')+' →</a><a class="btn small" href="'+esc(routeUrl(v))+'" target="_blank" rel="noopener">'+t('route')+' ↗</a></div>';
}
function closePop(){ clearTimeout(MLHOVERT); if(MLPOP){ MLPOP.remove(); MLPOP=null; } MLPINNED=false; }
function showPopup(id,pinned){
  var v=venue(id); if(!v||!ML) return;
  clearTimeout(MLHOVERT);
  if(MLPOP&&MLPINNED&&!pinned) return;
  if(MLPOP){ MLPOP.remove(); MLPOP=null; }
  MLPINNED=!!pinned; S.mapSel=pinned?id:S.mapSel; markSel();
  MLPOP=new maplibregl.Popup({focusAfterOpen:false,anchor:(ML.project([v.lon,v.lat]).y>360?'bottom':'top'),closeButton:true,closeOnClick:false,closeOnMove:false,offset:14,maxWidth:'290px',className:'rs-pop'+(pinned?' pinned':'')})
    .setLngLat([v.lon,v.lat]).setHTML(popHTML(id)).addTo(ML);
  var pe=MLPOP.getElement();
  pe.addEventListener('mouseenter',function(){ clearTimeout(MLHOVERT); });
  pe.addEventListener('mouseleave',function(){ if(!MLPINNED){ clearTimeout(MLHOVERT); MLHOVERT=setTimeout(closePop,250); } });
  MLPOP.on('close',function(){ MLPINNED=false; MLPOP=null; S.mapSel=null; markSel(); });
}
function setSheet(){ if(!S.mapSel) closePop();
  return;
  var s=document.getElementById('sheet'); if(!s) return;
  var h=sheetHTML(); s.innerHTML=h; s.classList.toggle('open',!!h);
}
function venueListHTML(){
  var list=mapEvents();
  var vs=VENUES.slice().sort(function(a,b){ return a.city.localeCompare(b.city,'de')||a.name.localeCompare(b.name,'de'); });
  return vs.map(function(v){ var n=venueEvents(v.id,list).length;
    if(v.kind!=='club'&&!n) return '';
    var r=RATINGS[v.id];
    return '<button type="button" class="person" data-act="mapvenue" data-id="'+v.id+'"><div class="grow"><strong>'+esc(v.name)+'</strong><p>'+esc(v.city)+' · '+(n?evCountLabel(n):t('zero'))+(r&&r.n?' · ★ '+r.avg:'')+'</p></div></button>'; }).join('');
}
function viewMap(){
  var list=mapEvents(), vs={}; list.forEach(function(e){ vs[e.v]=1; });
  return '<h1>'+t('map_title')+'</h1><p class="sub">'+t('map_sub')+'</p>'+
    '<div class="filters two">'+
      '<div class="field"><label for="m-when">'+t('when')+'</label><select id="m-when" data-sel="when">'+whenOptions()+'</select></div>'+
      '<div class="field" style="align-self:end"><button type="button" class="chip" data-act="onlyev" aria-pressed="'+S.onlyEvents+'" style="min-height:44px">'+t('only_events')+'</button></div>'+
    '</div>'+
    '<div class="chips" style="margin-top:12px">'+genreChips()+'</div>'+
    '<p class="count">'+t('summary_map',{v:Object.keys(vs).length,e:list.length})+'</p>'+
    '<div class="mapbox" id="mapbox">'+
      '<div id="mapslot" class="mapslot"></div>'+
      '<div class="mapctl">'+
        '<button type="button" data-act="zin" aria-label="'+esc(t('zoom_in'))+'">+</button>'+
        '<button type="button" data-act="zout" aria-label="'+esc(t('zoom_out'))+'">−</button>'+
        '<button type="button" data-act="zfit" aria-label="'+esc(t('zoom_reset'))+'"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button>'+
      '</div>'+
      '<div class="maplegend"><span><i></i>'+t('leg_ev')+'</span><span><i class="off"></i>'+t('leg_none')+'</span></div>'+
      
    '</div>'+
    '<div class="sec"><h2>'+t('venues_t')+'</h2><div class="people" id="venuelist">'+venueListHTML()+'</div></div>';
}
function venueGeo(){
  var list=mapEvents();
  return {type:'FeatureCollection',features:VENUES.map(function(v){
    var n=venueEvents(v.id,list).length;
    if((S.onlyEvents||v.kind!=='club')&&!n) return null;
    return {type:'Feature',geometry:{type:'Point',coordinates:[v.lon,v.lat]},properties:{id:v.id,name:v.name,n:n,ev:n?1:0}};
  }).filter(Boolean)};
}
/* Turn the light "positron" style into a steel-grey night map (not pitch black). */
function greyStyle(st){
  var C={bg:'#2a2a2f',water:'#1b1d22',green:'#2f3133',build:'#34343a',road:'#45454d',major:'#56565f',rail:'#3c3c44',border:'#77767c',text:'#bdbab3',halo:'#2a2a2f'};
  (st.layers||[]).forEach(function(l){
    var id=l.id, p=l.paint=l.paint||{};
    if(l.type==='background') p['background-color']=C.bg;
    else if(l.type==='fill'){ p['fill-color']=/water|ocean|lake|river/.test(id)?C.water:/build/.test(id)?C.build:/park|wood|forest|grass|landcover|landuse/.test(id)?C.green:C.bg; delete p['fill-pattern']; p['fill-outline-color']=p['fill-color']; }
    else if(l.type==='line'){ p['line-color']=/water|river|stream|canal/.test(id)?C.water:/boundary|admin/.test(id)?C.border:/rail|transit/.test(id)?C.rail:/motorway|trunk|primary/.test(id)?C.major:C.road; }
    else if(l.type==='symbol'&&l.layout&&l.layout['text-field']){ p['text-color']=/water/.test(id)?'#6d7480':C.text; p['text-halo-color']=C.halo; p['text-halo-width']=1.2;
      /* place names in the app language (Deutschland, Niedersachsen …), fallback: local name */
      if(JSON.stringify(l.layout['text-field']).indexOf('name')>=0) l.layout['text-field']=S.lang==='de'
        ?['coalesce',['get','name:de'],['get','name_de'],['get','name']]
        :['coalesce',['get','name:en'],['get','name_en'],['get','name']]; }
    else if(l.type==='fill-extrusion'){ p['fill-extrusion-color']=C.build; }
  });
  return st;
}
var FALLBACK_STYLE={version:8,glyphs:'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',sources:{},layers:[{id:'bg',type:'background',paint:{'background-color':'#2a2a2f'}}]};
function loadML(cb){
  if(window.maplibregl) return cb();
  var css=document.createElement('link'); css.rel='stylesheet'; css.href='vendor/maplibre-gl.css'; document.head.appendChild(css);
  var s=document.createElement('script'); s.src='vendor/maplibre-gl.js'; s.onload=cb; s.onerror=function(){ MLFAIL=true; mountMap(); }; document.head.appendChild(s);
}
function addVenueLayers(){
  var m=ML; if(MLREADY||m.getSource('venues')) return;
  var font=['Noto Sans Bold'];
  m.addSource('venues',{type:'geojson',data:venueGeo(),cluster:true,clusterRadius:42,clusterMaxZoom:12,clusterProperties:{ev:['+',['get','ev']],n:['+',['get','n']]}});
  m.addLayer({id:'cl',type:'circle',source:'venues',filter:['has','point_count'],paint:{
    'circle-color':['case',['>',['get','ev'],0],'#ff2b1c','#5a5a62'],'circle-stroke-color':'#111113','circle-stroke-width':2,
    'circle-radius':['step',['get','point_count'],15,5,19,15,24]}});
  m.addLayer({id:'cl-n',type:'symbol',source:'venues',filter:['has','point_count'],layout:{'text-field':['to-string',['get','point_count']],'text-font':font,'text-size':13,'text-allow-overlap':true},paint:{'text-color':['case',['>',['get','ev'],0],'#0a0a0a','#efece6']}});
  m.addLayer({id:'pt-sel',type:'circle',source:'venues',filter:['==',['get','id'],-1],paint:{'circle-radius':16,'circle-color':'rgba(255,43,28,.18)','circle-stroke-color':'#efece6','circle-stroke-width':2}});
  m.addLayer({id:'pt',type:'circle',source:'venues',filter:['!',['has','point_count']],paint:{
    'circle-color':['case',['>',['get','n'],0],'#ff2b1c','#6b6b73'],'circle-radius':['case',['>',['get','n'],0],8,5.5],
    'circle-stroke-color':'#111113','circle-stroke-width':1.5}});
  m.addLayer({id:'pt-name',type:'symbol',source:'venues',filter:['!',['has','point_count']],minzoom:10.5,layout:{'text-field':['get','name'],'text-font':font,'text-size':12,'text-offset':[0.9,0],'text-anchor':'left','text-optional':true},paint:{'text-color':'#efece6','text-halo-color':'#1a1a1d','text-halo-width':1.5}});
  m.on('click','cl',function(e){
    var f=e.features[0], src=m.getSource('venues');
    Promise.resolve(src.getClusterExpansionZoom(f.properties.cluster_id)).then(function(z){ m.easeTo({center:f.geometry.coordinates,zoom:Math.min(z+0.3,15),duration:450}); });
  });
  m.addLayer({id:'pt-hit',type:'circle',source:'venues',filter:['!',['has','point_count']],paint:{'circle-radius':20,'circle-color':'#000','circle-opacity':0}});
  var fine=isFine();
  m.on('click','pt-hit',function(e){ var f=e.features[0]; var id=+f.properties.id; var v=venue(id); if(v) m.easeTo({center:[v.lon,v.lat],offset:[0,110],duration:300}); showPopup(id,true); });
  if(fine){
    m.on('mouseenter','pt-hit',function(e){ m.getCanvas().style.cursor='pointer'; showPopup(+e.features[0].properties.id,false); });
    m.on('mouseleave','pt-hit',function(){ m.getCanvas().style.cursor=''; clearTimeout(MLHOVERT); MLHOVERT=setTimeout(function(){ if(!MLPINNED) closePop(); },300); });
  }
  m.on('click',function(e){ var hit=m.queryRenderedFeatures(e.point,{layers:['pt-hit','cl']}); if(!hit.length&&MLPOP){ closePop(); S.mapSel=null; markSel(); } });
  m.on('mouseenter','cl',function(){ m.getCanvas().style.cursor='pointer'; }); m.on('mouseleave','cl',function(){ m.getCanvas().style.cursor=''; });
  MLREADY=true; markSel();
  if(MLWANT){ var w=MLWANT; MLWANT=null; flyToVenue(w); }
}
function createMap(){
  MLDIV=document.createElement('div'); MLDIV.className='glmap';
  document.getElementById('mapslot').appendChild(MLDIV);
  var go=function(style){
    try{
      ML=new maplibregl.Map({container:MLDIV,style:style,bounds:DE_BOUNDS,fitBoundsOptions:{padding:20},maxBounds:[[1.5,45],[19.5,57]],minZoom:4.5,maxZoom:17,attributionControl:{compact:true},dragRotate:false,pitchWithRotate:false,touchPitch:false});
      ML.touchZoomRotate.disableRotation();
      ML.on('load',function(){ ML.resize(); addVenueLayers(); });
    }catch(err){ MLFAIL=true; ML=null; mountMap(); }
  };
  fetch(MAPSTYLE).then(function(r){ if(!r.ok) throw 0; return r.json(); }).then(function(st){ go(greyStyle(st)); }).catch(function(){ go(FALLBACK_STYLE); });
}
function mountMap(){
  var slot=document.getElementById('mapslot'); if(!slot) return;
  if(MLFAIL){ slot.innerHTML='<div class="empty" style="margin:20px">'+t('map_fail')+'</div>'; return; }
  if(!window.maplibregl) return loadML(mountMap);
  if(!ML){ if(!MLDIV) createMap(); else document.getElementById('mapslot').appendChild(MLDIV); return; }
  closePop(); slot.appendChild(MLDIV); ML.resize();
  if(MLREADY){ try{ ML.getSource('venues').setData(venueGeo()); }catch(e){} markSel(); }
  if(MLWANT&&MLREADY){ var w=MLWANT; MLWANT=null; flyToVenue(w); }
}
window.__rsMap=function(){ return ML; }; // debug/test hook
function markSel(){ if(ML&&MLREADY){ try{ ML.setFilter('pt-sel',['==',['get','id'],S.mapSel||-1]); }catch(e){} } }
function flyToVenue(id){
  var v=venue(id); if(!v) return;
  if(!ML||!MLREADY){ MLWANT=id; return; }
  ML.flyTo({center:[v.lon,v.lat],zoom:Math.max(ML.getZoom(),13.5),speed:1.6,offset:[0,110]});
  ML.once('moveend',function(){ showPopup(id,true); });
}
function selectVenue(id,center){
  S.mapSel=id; markSel();
  if(center) flyToVenue(id); else showPopup(id,true);
}
function focusVenueFromHash(id){ S.mapSel=id; MLWANT=id; }

/* ---------- Router ---------- */
var ICONS={
  home:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
  events:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  map:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.5-6.2-6.5-11A6.5 6.5 0 0 1 18.5 10c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/></svg>',
  artists:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/></svg>',
  connect:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/></svg>',
  me:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>'
};
function route(){
  var h=decodeURIComponent((location.hash||'#home').slice(1));
  if(/(^|[#&])error_code=|^error=/.test(h)) return {tab:'me',html:viewLinkBad()};
  if(h==='new-event') return {tab:'events',html:viewNew()};
  if(h==='promoter') return {tab:'me',html:viewPromoter()};
  var i=h.indexOf('-'), name=i<0?h:h.slice(0,i), arg=i<0?'':h.slice(i+1);
  switch(name){
    case 'event': return {tab:'events',html:viewEvent(parseInt(arg,10))};
    case 'map':
      if(arg){ if(S.mapHash!==h){ S.mapHash=h; focusVenueFromHash(+arg); } } else S.mapHash=null;
      return {tab:'map',html:viewMap(),map:true};
    case 'club': return {tab:'map',html:viewClub(+arg)};
    case 'artists': return {tab:'home',html:viewArtists()};
    case 'u': return {tab:'home',html:viewProfile(arg)};
    case 'orgs': return {tab:'events',html:viewOrgs()};
    case 'org': return {tab:'events',html:viewOrg(arg)};
    case 'followers': return {tab:'me',html:viewFollowList(arg,true)};
    case 'following': return {tab:'me',html:viewFollowList(arg,false)};
    case 'connect': return {tab:'connect',html:viewConnect()};
    case 'chats': return {tab:'connect',html:viewChats()};
    case 'chat': return {tab:'connect',html:viewChat(+arg)};
    case 'sendev': return {tab:'connect',html:viewSendEv(+arg)};
    case 'me': return {tab:'me',html:viewMe()};
    case 'inbox': return {tab:'me',html:viewInbox()};
    case 'settings': return {tab:'me',html:viewSettings()};
    case 'login': return {tab:'me',html:viewLogin()};
    case 'newpw': return {tab:'me',html:viewNewPw()};
    case 'reset': return {tab:'me',html:viewReset()};
    case 'admin': return {tab:'me',html:viewAdmin()};
    case 'events': return {tab:'events',html:viewEvents()};
    default: return {tab:'home',html:viewHome()};
  }
}
function render(scroll){
  document.documentElement.lang=S.lang;
  document.getElementById('banner').textContent=t('banner');
  var langBtns=document.querySelectorAll('.lang button');
  for(var i=0;i<langBtns.length;i++) langBtns[i].setAttribute('aria-pressed',langBtns[i].getAttribute('data-id')===S.lang?'true':'false');
  var view=document.getElementById('view');
  if(S.loadErr){ view.innerHTML='<div class="empty">'+t('load_err')+'<div class="row" style="justify-content:center;margin-top:12px"><button type="button" class="btn primary" data-act="reload">'+t('retry')+'</button></div></div>'; return; }
  if(!S.ready){ view.innerHTML=loadingBox(); return; }
  var r=route();
  if(r.tab==='home'&&showWelcomeGate()) r={tab:'home',html:viewLogin(true)};
  document.body.classList.toggle('gated',r.html.indexOf('welcome gate')>=0);
  document.getElementById('tabs').innerHTML=['home','events','map','connect','me'].map(function(k){
    return '<a href="#'+k+'"'+(r.tab===k?' aria-current="page"':'')+'>'+ICONS[k]+'<span>'+t('nav_'+k)+'</span></a>'; }).join('');
  view.innerHTML=r.html+'<footer>'+t('footer')+'</footer>';
  updateBell();
  if(r.map) mountMap();
  if(scroll) window.scrollTo(0,0);
  jumpRate();
}

/* ---------- Actions ---------- */
function toggleRow(table,eventId,list,extra){
  if(needLogin()) return;
  var on=has(list,eventId), uid=S.user.id;
  var p=on?data(sb.from(table).delete().eq('event_id',eventId).eq('profile_id',uid)):data(sb.from(table).insert(Object.assign({event_id:eventId,profile_id:uid},extra||{})));
  if(on) list.splice(list.indexOf(eventId),1); else list.push(eventId);
  if(table==='attendance'){ S.counts[eventId]=Math.max(0,(S.counts[eventId]||0)+(on?-1:1)); delete cache.att[eventId]; cache.connect=null; }
  render(false);
  p.catch(function(err){ if(on) list.push(eventId); else list.splice(list.indexOf(eventId),1); render(false); fail(err); });
}
function adminAct(p){ p.then(function(){ cache.admin=null; render(false); }).catch(fail); }
document.addEventListener('click',function(ev){
  var el=ev.target.closest('[data-act]'); if(!el) return;
  var act=el.getAttribute('data-act'), id=el.getAttribute('data-id');
  if(act==='alarm'){ toggleAlarm(+id); return; }
  if(act==='orgfollow'){ if(needLogin()) return; var oid=+id, on2=has(S.orgFollow,oid); buzz();
    if(on2) S.orgFollow.splice(S.orgFollow.indexOf(oid),1); else { S.orgFollow.push(oid); toast(t('org_follow_toast')); } render(false);
    data(on2?sb.from('organizer_follows').delete().eq('profile_id',S.user.id).eq('organizer_id',oid):sb.from('organizer_follows').insert({profile_id:S.user.id,organizer_id:oid})).catch(fail); return; }
  if(act==='locate'){ locateCity(); return; }
  if(act==='joingrp'){ if(needLogin()) return; data(sb.rpc('join_event_chat',{p_event:+id})).then(function(cid){ cache.chats=null; location.hash='#chat-'+cid; }).catch(fail); return; }
  if(act==='leavegrp'){ data(sb.rpc('leave_chat',{p_conv:+id})).then(function(){ cache.chats=null; location.hash='#chats'; }).catch(fail); return; }
  if(act==='sendto'){ var evid=+el.getAttribute('data-ev'); data(sb.from('messages').insert({conversation_id:+id,sender:S.user.id,body:'[[event:'+evid+']]'})).then(function(){ toast(t('sent_ok')); cache.chat[+id]=undefined; location.hash='#chat-'+id; }).catch(fail); return; }
  if(act==='invshare'){ var il=inviteLink(); if(navigator.share) navigator.share({text:t('invite_msg'),url:il}).catch(function(){}); else copyText(il); return; }
  if(act==='invcopy'){ copyText(inviteLink()); return; }
  if(act==='invqr'){ showQr(); return; }
  if(act==='setting'){ saveSetting(id, !!el.checked); return; }
  if(act==='avdel'){ removeAvatar(); return; }
  if(act==='unblock'){ data(sb.from('blocks').delete().eq('blocker',S.user.id).eq('blocked',id)).then(function(){ BLOCKS=null; render(false); }).catch(fail); return; }
  if(act==='lang'){ S.lang=id; try{ localStorage.setItem('rs-lang',id); }catch(e){} render(false); }
  else if(act==='genre'){ S.genre=id; render(false); }
  else if(act==='type'){ S.type=id; render(false); }
  else if(act==='share'){ var sm=shareMsg(evt(+id),'share');
    if(navigator.share) navigator.share({title:sm.title,text:sm.text,url:sm.url}).catch(function(){});
    else copyText(sm.url); }
  else if(act==='copylink'){ copyText(shareMsg(evt(+id),'link').url); }
  else if(act==='homecity'){ setCity(id); lsSet('rs-city-manual','1'); render(false); }
  else if(act==='onlyev'){ S.onlyEvents=!S.onlyEvents; render(false); }
  else if(act==='checkin'){
    if(needLogin()) return;
    if(!navigator.geolocation){ toast(t('ci_denied')); return; }
    toast(t('ci_busy'));
    var cev=evt(+id), cv=cev?venue(cev.v):null;
    navigator.geolocation.getCurrentPosition(function(pos){
      /* Vorab-Prüfung im Browser; der Server prüft den Abstand noch einmal selbst (DB 030). Die Position wird dort nur verglichen, nie gespeichert. */
      if(!cv||cv.lat==null){ toast(t('ci_err')); return; }
      if(distM(pos.coords.latitude,pos.coords.longitude,cv.lat,cv.lon)>400){ toast(t('ci_far')); return; }
      sb.rpc('check_in',{p_event:+id,p_lat:pos.coords.latitude,p_lon:pos.coords.longitude}).then(function(r){
        if(r.error){ toast(t('ci_err')); return; }
        if(r.data==='ok'){ if(!has(S.checkins,+id)) S.checkins.push(+id); if(!has(S.going,+id)) S.going.push(+id); buzz(); toast(t('ci_ok')); render(false); }
        else toast(t(r.data==='too_far'?'ci_far':r.data==='not_now'?'ci_notnow':'ci_err'));
      });
    },function(){ toast(t('ci_denied')); },{enableHighAccuracy:true,timeout:15000,maximumAge:60000});
  }
  else if(act==='go'){ if(S.user) buzz(); toggleRow('attendance',+id,S.going,{visible:setOn('going_visible')}); if(S.user) S.attRows=S.attRows.filter(function(a){ return !(a.event_id===+id&&a.profile_id===S.user.id); }).concat(has(S.going,+id)?[{event_id:+id,profile_id:S.user.id}]:[]); }
  else if(act==='follow'){ if(needLogin()) return; buzz(); var fp=followsP(id), hk=el.getAttribute('data-h'); delete FSTATS[id]; FLIST={};
    var pq=fp?data(sb.from('follows').delete().eq('follower',S.user.id).eq('artist',id)):data(sb.from('follows').insert({follower:S.user.id,artist:id}));
    if(fp) S.follow=S.follow.filter(function(x){ return x.id!==id; }); else { var cp=cache.profile[String(hk).toLowerCase()]; S.follow.push({id:id,handle:hk,display_name:cp&&cp.display_name||hk,verified:cp&&cp.verified,role:cp&&cp.role}); }
    render(false); pq.catch(function(err){ loadMine().then(function(){ render(false); }); fail(err); }); }
  else if(act==='vfollow'){ if(needLogin()) return; buzz(); var vid2=+id, on2=has(S.vfollow,vid2);
    var vq=on2?data(sb.from('venue_follows').delete().eq('profile_id',S.user.id).eq('venue_id',vid2)):data(sb.from('venue_follows').insert({profile_id:S.user.id,venue_id:vid2}));
    if(on2) S.vfollow.splice(S.vfollow.indexOf(vid2),1); else S.vfollow.push(vid2);
    render(false); vq.catch(function(err){ loadMine().then(function(){ render(false); }); fail(err); }); }
  else if(act==='loginhere'){ try{ sessionStorage.setItem('rs-after',location.hash); }catch(e){} }
  else if(act==='save'){ if(S.user){ buzz(); if(has(S.saved,+id)&&has(S.alarms,+id)) S.alarms.splice(S.alarms.indexOf(+id),1); } toggleRow('bookmarks',+id,S.saved); }
  else if(act==='skipwelcome'){ lsSet('rs-welcome','1'); render(true); }
  else if(act==='authtab'){ S.authTab=id; S.authErr=''; S.authMsg=''; render(false); }
  else if(act==='forgot'){ S.resetMail=((document.getElementById('a-mail')||{}).value||'').trim(); S.resetErr=''; location.hash='#reset'; }
  else if(act==='delacct'){
    var w=window.prompt(t('del_q')); if(w===null||w.trim().toUpperCase()!==t('del_word')) return;
    sb.rpc('delete_my_account').then(function(r){ if(r.error) throw r.error; return sb.auth.signOut(); })
      .then(function(){ lsSet('rs-ref',null); resetCaches(); toast(t('del_done')); location.hash='#home'; }).catch(fail);
  }
  else if(act==='install'){ if(INSTALL_EVT){ INSTALL_EVT.prompt(); INSTALL_EVT.userChoice.then(function(){ INSTALL_EVT=null; render(false); }); } }
  else if(act==='instx'){ lsSet('rs-inst','later'); render(false); }
  else if(act==='logout'){ sb.auth.signOut().then(function(){ location.hash='#home'; }); }
  else if(act==='dm'){
    if(needLogin()) return;
    sb.rpc('start_chat',{other:id}).then(function(r){ if(r.error) throw r.error; cache.chats=null; location.hash='#chat-'+r.data; })
      .catch(function(err){ toast(/rate_limited/.test(err&&err.message||'')?t('rate_limited'):t('err_generic')); });
  }
  else if(act==='ridedel'){ var rev=+el.getAttribute('data-ev');
    data(sb.from('rides').delete().eq('id',+id)).then(function(){ delete cache.rides[rev]; render(false); }).catch(fail);
  }
  else if(act==='crewdel'){ var cev=+el.getAttribute('data-ev');
    data(sb.from('crew_posts').delete().eq('id',+id)).then(function(){ delete cache.crew[cev]; render(false); }).catch(fail);
  }
  else if(act==='blockq'){
    if(!window.confirm(t('block_q',{n:el.getAttribute('data-name')||''}))) return;
    data(sb.from('blocks').insert({blocker:S.user.id,blocked:id})).then(function(){ toast(t('blocked')); resetCaches(); location.hash='#chats'; }).catch(fail);
  }
  else if(act==='block'){
    if(needLogin()) return;
    data(sb.from('blocks').insert({blocker:S.user.id,blocked:id})).then(function(){ toast(t('blocked')); resetCaches(); location.hash='#events'; }).catch(fail);
  }
  else if(act==='reload'){ location.reload(); }
  else if(act==='zin'){ if(ML) ML.zoomIn(); }
  else if(act==='zout'){ if(ML) ML.zoomOut(); }
  else if(act==='zfit'){ S.mapSel=null; closePop(); markSel(); if(ML) ML.fitBounds(DE_BOUNDS,{padding:20}); }
  
  else if(act==='mapvenue'){ var b=document.getElementById('mapbox'); if(b&&b.scrollIntoView) b.scrollIntoView({block:'center',behavior:'smooth'}); selectVenue(+id,true); }
  else if(act==='adm-approve'){ adminAct(data(sb.rpc('approve_artist',{req_id:+id}))); }
  else if(act==='adm-reject'){ adminAct(data(sb.from('artist_verifications').update({status:'rejected',reviewed_by:S.user.id,reviewed_at:new Date().toISOString()}).eq('id',+id))); }
  else if(act==='adm-publish'){ adminAct(data(sb.from('events').update({status:'published',review_state:'ok',reviewed_at:new Date().toISOString()}).eq('id',+id)).then(function(){ return loadBase(); })); }
  else if(act==='adm-cancel'){ adminAct(data(sb.from('events').update({status:'cancelled',review_state:'rejected',reviewed_at:new Date().toISOString()}).eq('id',+id)).then(function(){ return loadBase(); })); }
  else if(act==='adm-pro-ok'){ adminAct(data(sb.rpc('approve_promoter',{req_id:+id,p_months:+el.getAttribute('data-m')}))); }
  else if(act==='adm-pro-no'){ adminAct(data(sb.rpc('reject_promoter',{req_id:+id}))); }
  else if(act==='adm-pro-ext'){ if(el.getAttribute('data-m')==='0'&&!confirm(t('adm_end')+'?')) return; adminAct(data(sb.rpc('set_promoter_until',{p_profile:id,p_months:+el.getAttribute('data-m')}))); }
  else if(act==='adm-report'){ adminAct(data(sb.from('reports').update({status:'done'}).eq('id',+id))); }
});
document.addEventListener('change',function(ev){
  var sel=ev.target.getAttribute&&ev.target.getAttribute('data-sel');
  if(sel){ S[sel]=ev.target.value; render(false); }
  if(ev.target.id==='cp-other'&&ev.target.value){ setCity(ev.target.value); render(false); }
  if(ev.target.id==='av-file'&&ev.target.files&&ev.target.files[0]){ uploadAvatar(ev.target.files[0]); ev.target.value=''; }
});
document.addEventListener('input',function(ev){
  if(ev.target.id==='f-q'){ S.q=ev.target.value; var l=document.getElementById('evlist'); if(l) l.innerHTML=eventsListHTML(); }
  if(ev.target.id==='org-q'){ S.orgQ=ev.target.value; var tmp=document.createElement('div'); tmp.innerHTML=viewOrgs(); var nl=tmp.querySelector('.orglist'), ol=document.querySelector('.orglist'); if(nl&&ol) ol.innerHTML=nl.innerHTML; }
});
document.addEventListener('submit',function(ev){
  var f=ev.target.closest('form[data-form]'); if(!f) return;
  ev.preventDefault();
  var kind=f.getAttribute('data-form'), fd=new FormData(f), btn=f.querySelector('button[type=submit]');
  function busy(on){ if(btn) btn.disabled=on; }
  if(kind==='login'||kind==='signup'){
    var email=String(fd.get('email')||'').trim(), pw=String(fd.get('password')||'');
    var errEl=document.getElementById('auth-err');
    if(kind==='signup'){
      var name=String(fd.get('name')||'').trim();
      if(!name||!email){ errEl.textContent=t('err_generic'); return; }
      if(pw.length<8){ errEl.textContent=t('err_pw'); return; }
      if(!fd.get('age')){ errEl.textContent=t('terms'); return; }
      busy(true);
      sb.auth.signUp({email:email,password:pw,options:{data:REF?{display_name:name,ref:REF}:{display_name:name},emailRedirectTo:authBack()}}).then(function(r){
        busy(false);
        if(r.error){ errEl.textContent=r.error.message||t('err_generic'); return; }
        var u=r.data&&r.data.user;
        /* Supabase sends no mail for an address that already has an account (identities is empty) */
        if(u&&u.identities&&u.identities.length===0){ errEl.textContent=t('signup_exists'); return; }
        if(!r.data.session){ S.authMsg=t('signup_done'); S.authTab='login'; render(false); }
      });
    } else {
      busy(true);
      sb.auth.signInWithPassword({email:email,password:pw}).then(function(r){ busy(false); if(r.error){ errEl.textContent=t('err_login'); } });
    }
  } else if(kind==='email'){
    var nm=String(fd.get('email')||'').trim(), msgEl=document.getElementById('s-mail-msg');
    if(!nm||nm===S.user.email) return;
    sb.auth.updateUser({email:nm},{emailRedirectTo:authBack()}).then(function(r){
      if(r.error){ msgEl.textContent=/rate/i.test(r.error.message||'')?t('reset_rate'):(r.error.message||t('err_generic')); return; }
      msgEl.textContent=t('set_email_sent'); });
  } else if(kind==='reset'){
    var rm=String(fd.get('email')||'').trim(); S.resetMail=rm;
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(rm)){ S.resetErr=t('email')+'?'; render(false); return; }
    if(resetLeft()) return;
    busy(true);
    sb.auth.resetPasswordForEmail(rm,{redirectTo:authBack()}).then(function(r){
      busy(false);
      var err=r&&r.error;
      if(err&&(err.status===429||/rate limit|security purposes/i.test(err.message||''))){ S.resetErr=t('reset_limit'); }
      else if(err){ S.resetErr=(err.status>=500||/sending|smtp/i.test(err.message||''))?t('reset_send_err'):(err.message||t('err_generic')); }
      else { S.resetErr=''; S.resetSent=rm; try{ sessionStorage.setItem('rs-reset-until',String(Date.now()+60000)); }catch(e){} }
      render(false);
    });
  } else if(kind==='newpw'){
    var p1=String(fd.get('pw')||''), p2=String(fd.get('pw2')||''), npErr=document.getElementById('np-err');
    if(p1.length<8){ npErr.textContent=t('err_pw'); return; }
    if(p1!==p2){ npErr.textContent=t('newpw_mismatch'); return; }
    busy(true);
    sb.auth.updateUser({password:p1}).then(function(r){ busy(false); if(r.error){ npErr.textContent=r.error.message||t('err_generic'); return; } S.recovery=false; toast(t('newpw_ok')); location.hash='#me'; });
  } else if(kind==='me'){
    var handle=String(fd.get('handle')||'').trim().toLowerCase(), errMe=document.getElementById('me-err');
    if(!/^[a-z0-9_.]{3,30}$/.test(handle)){ errMe.textContent=t('err_handle_fmt'); return; }
    var socials={}; SOC.forEach(function(s){ var v=String(fd.get('soc-'+s[0])||'').trim(); if(v) socials[s[0]]=v; });
    var upd={display_name:String(fd.get('name')||'').trim()||S.me.display_name,handle:handle,city:fd.get('city')||null,bio:String(fd.get('bio')||'').trim()||null,socials:socials};
    busy(true);
    sb.from('profiles').update(upd).eq('id',S.user.id).select().single().then(function(r){
      busy(false);
      if(r.error){ errMe.textContent=r.error.code==='23505'?t('err_handle'):t('err_generic'); return; }
      S.me=r.data; cache.profile={}; render(false); toast(t('saved'));
    });
  } else if(kind==='promoter'){
    if(needLogin()) return;
    var org=String(fd.get('org')||'').trim(); if(!org) return;
    busy(true);
    data(sb.from('promoter_requests').insert({profile_id:S.user.id,org_name:org.slice(0,80),website:String(fd.get('web')||'').trim().slice(0,300)||null,note:String(fd.get('note')||'').trim().slice(0,1000)||null}))
      .then(function(){ busy(false); toast(t('pro_sent')); return loadTier(); }).catch(function(err){ busy(false); fail(err); });
  } else if(kind==='verify'){
    var links=String(fd.get('links')||'').split(/\s+/).map(function(x){ return x.trim(); }).filter(Boolean).slice(0,5);
    busy(true);
    data(sb.from('artist_verifications').insert({profile_id:S.user.id,artist_name:String(fd.get('name')||'').trim(),proof_links:links}).select('id,status,created_at').single())
      .then(function(r){ S.verif=r; render(false); }).catch(function(err){ busy(false); fail(err); });
  } else if(kind==='post'){
    var pt=String(fd.get('title')||'').trim(); if(pt.length<3) return;
    var kindP=(S.me.role==='admin')?'news':'artist';
    busy(true);
    data(sb.from('posts').insert({author:S.user.id,kind:kindP,title:pt,body:String(fd.get('body')||'').trim()||null,link:safeUrl(String(fd.get('link')||'').trim())}))
      .then(function(){ toast(t('post_done')); loadHome(); }).catch(function(err){ busy(false); fail(err); });
  } else if(kind==='review'){
    if(needLogin()) return;
    var rv=+f.getAttribute('data-v'), rev=+f.getAttribute('data-ev')||null, rid=f.getAttribute('data-rid'), rerr=document.getElementById('rev-err');
    function num(n){ var x=fd.get(n); return x?+x:null; }
    var row={stars:num('r-stars'),sound:num('r-sound'),crowd:num('r-crowd'),door:num('r-door'),safety:num('r-safety'),body:String(fd.get('body')||'').trim()||null};
    if(rev){ row.lineup=num('r-lineup'); row.awareness=num('r-aware'); }
    if(!row.stars){ rerr.textContent=t('rev_need_star'); return; }
    busy(true);
    var q=rid?sb.from('reviews').update(Object.assign(row,{updated_at:new Date().toISOString()})).eq('id',+rid):sb.from('reviews').insert(Object.assign(row,{venue_id:rv,author:S.user.id},rev?{event_id:rev}:{}));
    data(q).then(function(){ toast(t('rev_saved')); if(rev){ delete EVR[rev]; if(!has(S.myEvRev,rev)) S.myEvRev.push(rev); buzz(); } else delete cache.reviews[rv]; return loadRatings(); }).then(function(){ busy(false); render(false); })
      .catch(function(err){ busy(false); fail(err); });
  } else if(kind==='crew'){
    if(needLogin()) return;
    var cb=String(fd.get('body')||'').trim(), ceid=+f.getAttribute('data-id');
    if(cb.length<2) return;
    busy(true);
    data(sb.from('crew_posts').insert({event_id:ceid,author:S.user.id,body:cb.slice(0,280)})).then(function(){ busy(false); delete cache.crew[ceid]; buzz(); loadCrewCounts(); render(false); })
      .catch(function(err){ busy(false); fail(err); });
  } else if(kind==='ride'){
    if(needLogin()) return;
    var reid=+f.getAttribute('data-id'), rfrom=String(fd.get('from')||'').trim(), rwhen=String(fd.get('when')||''), rseats=+fd.get('seats')||1, rnote=String(fd.get('note')||'').trim();
    if(rfrom.length<2||!rwhen) return;
    busy(true);
    data(sb.from('rides').insert({event_id:reid,driver:S.user.id,from_city:rfrom.slice(0,60),departs_at:berlinToISO(rwhen.slice(0,10),rwhen.slice(11,16)),seats:Math.max(1,Math.min(8,rseats)),note:rnote?rnote.slice(0,200):null}))
      .then(function(){ busy(false); delete cache.rides[reid]; buzz(); render(false); }).catch(function(err){ busy(false); fail(err); });
  } else if(kind==='msg'){
    var mb=String(fd.get('body')||'').trim(), mcid=+f.getAttribute('data-id');
    if(!mb) return;
    var inp=f.querySelector('input'); if(inp) inp.value='';
    data(sb.from('messages').insert({conversation_id:mcid,sender:S.user.id,body:mb.slice(0,2000)})).then(function(){ return loadChat(mcid,true); })
      .then(function(){ var i2=document.getElementById('msg-b'); if(i2) i2.focus(); })
      .catch(function(err){ if(inp) inp.value=mb; toast(/rate_limited/.test(err&&err.message||'')?t('rate_limited'):t('err_generic')); });
  } else if(kind==='report'){
    if(needLogin()) return;
    /* Einheitliches Schema mit der Flutter-App (DB 030): kind + ref_id/target_user, reason als Code */
    var row={reporter:S.user.id,reason:String(fd.get('reason')),note:String(fd.get('text')||'').trim().slice(0,500)||null};
    if(f.getAttribute('data-kind')==='event'){ row.kind='event'; row.ref_id=+f.getAttribute('data-id'); } else { row.kind='profile'; row.target_user=f.getAttribute('data-id'); }
    busy(true);
    data(sb.from('reports').insert(row)).then(function(){ busy(false); f.reset(); var d=f.closest('details'); if(d) d.open=false; toast(t('report_sent')); }).catch(function(err){ busy(false); fail(err); });
  } else if(kind==='event'){
    var title=String(fd.get('title')||'').trim(), vid=+fd.get('venue'), date=fd.get('date'), errEv=document.getElementById('form-err');
    if(!title||!vid||!date){ errEv.textContent=t('f_err'); return; }
    var link=safeUrl(String(fd.get('link')||'').trim());
    var names=String(fd.get('lineup')||'').split(',').map(function(x){ return x.trim(); }).filter(Boolean).slice(0,40);
    var genres=fd.getAll('genre'); if(!genres.length) genres=['Techno'];
    busy(true);
    data(sb.from('events').insert({venue_id:vid,title:title,starts_at:berlinToISO(date,fd.get('time')||'22:00'),ends_at:(fd.get('end')&&fd.get('end')>date)?berlinToISO(fd.get('end'),'23:59'):null,time_known:!!fd.get('time'),kind:fd.get('kind')==='festival'?'festival':'club',genres:genres,no_phone:!!fd.get('nophone'),ticket_url:link,source_url:link,price_text:String(fd.get('price')||'').trim()||null,ticket_status:fd.get('tstatus')||null}).select('id,status').single())
      .then(function(row){
        var lp=names.length?data(sb.from('event_lineup').insert(names.map(function(n,i){ return {event_id:row.id,position:i,name:n}; }))):Promise.resolve();
        return lp.then(function(){ return row; });
      }).then(function(row){
        cache.subs=null;
        toast(row.status==='published'?t('sub_ok_pub'):t('sub_ok_pend'));
        return Promise.all([loadBase(),loadTier()]).then(function(){ location.hash=row.status==='published'?'#event-'+row.id:'#me'; });
      }).catch(function(err){ busy(false); if(/promoter_required/.test(err&&err.message||'')){ toast(t('pro_need')); loadTier(); location.hash='#promoter'; } else fail(err); });
  }
});

/* ---------- Start ---------- */
try{ var savedLang=localStorage.getItem('rs-lang'); if(savedLang==='de'||savedLang==='en') S.lang=savedLang; }catch(e){}
try{ S.lastSeen=localStorage.getItem('rs-seen'); localStorage.setItem('rs-seen',new Date().toISOString()); }catch(e){}
setInterval(function(){ var els=document.querySelectorAll('[data-cd]'); for(var i=0;i<els.length;i++){ var ce=evt(+els[i].getAttribute('data-cd')); if(ce) els[i].textContent=cdText(ce); } },30000);
window.addEventListener('hashchange',function(){ if(location.hash==='#chats'||location.hash==='#connect') cache.chats=null; render(true); });

render(false);
var first=true;
sb.auth.onAuthStateChange(function(evName,session){
  var rec=false; try{ rec=sessionStorage.getItem('rs-recovery')==='1'; }catch(e){}
  if(evName==='PASSWORD_RECOVERY'||(rec&&session)){ S.recovery=true; try{ sessionStorage.removeItem('rs-recovery'); }catch(e){} setTimeout(function(){ location.hash='#newpw'; },0); }
  var uid=session&&session.user?session.user.id:null, prev=S.user?S.user.id:null;
  S.user=session?session.user:null;
  if(uid===prev&&!first) return;
  first=false;
  resetCaches();
  /* supabase-js: do not call the client synchronously inside this callback */
  setTimeout(function(){ loadMine().then(function(){ if(S.user&&location.hash==='#login'){ var a=after(); try{ sessionStorage.removeItem('rs-after'); }catch(e){} location.hash=a&&a!=='#login'?a:'#me'; } else render(false); }); },0);
});
loadBase().then(function(){ render(false); });
})();
