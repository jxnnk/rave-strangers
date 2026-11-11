/* Rave Strangers – web app (real data via Supabase).
   Plain JavaScript, no build step. Hash routing: #events, #event-<id>, #map, #map-<venueId>, #club-<id>,
   #artists, #u-<handle>, #connect, #me, #login, #new-event, #admin. */
(function(){
'use strict';

var SB_URL='https://wnmxloykrnbrpvzxhnsb.supabase.co';
var SB_KEY='sb_publishable_4vHWXBP7d04RUXs7lOQ9nA_yys9gxdN';   /* publishable key: safe in the browser, protected by Row Level Security */
var sb=window.supabase.createClient(SB_URL,SB_KEY);

/* ---------- Texts ---------- */
var T={
  de:{
    nav_home:'Home',nav_events:'Events',nav_map:'Karte',nav_artists:'Artists',nav_connect:'Connect',nav_me:'Profil',
    home_hi:'Was geht',home_hi_name:'Was geht, {n}',home_sub:'Dein Wochenende, News aus der Szene und was neu ist.',home_city:'Stadt',home_all:'Überall',
    home_weekend:'Dein Wochenende',home_today:'Heute und morgen',home_weekend_none:'Für dieses Wochenende ist hier noch nichts eingetragen.',home_all_events:'Alle Events',
    home_remind:'Du gehst hin',home_new:'Neu in der App',home_news:'News',home_ticker:'Aus der Szene',home_kicker:'Techno · Deutschland · Heute Nacht',ticker_note:'Schlagzeilen von Groove, Mixmag und DJ Mag. Ein Tipp öffnet den Artikel beim Magazin.',
    no_posts:'Noch keine Beiträge.',post_write:'Beitrag schreiben',post_title:'Überschrift',post_body:'Text',post_link:'Link (optional)',post_publish:'Veröffentlichen',post_done:'Beitrag ist online',
    kind_news:'Redaktion',kind_artist:'Artist',kind_club:'Club',home_artists:'Verifizierte Artists entdecken',ago_now:'gerade eben',ago_min:'vor {n} Min.',ago_h:'vor {n} Std.',ago_d:'vor {n} Tagen',ago_1d:'gestern',
    banner:'Beta: Events aus öffentlichen Kalendern (ohne Gewähr). Konten sind echt.',
    loading:'Lädt …',load_err:'Die Daten konnten nicht geladen werden. Prüf deine Verbindung und lade neu.',retry:'Neu laden',
    events_title:'Raves in Deutschland',events_sub:'Finde Nächte, DJs und Leute, die auch hinwollen.',
    search:'Suche',search_ph:'Event, Club oder DJ',city:'Stadt',all_cities:'Alle Städte',when:'Zeitraum',
    when_all:'Alle Termine',when_week:'Nächste 7 Tage',when_month:'Nächste 30 Tage',genre_all:'Alle Genres',
    type_all:'Alles',type_club:'Clubnächte',type_fest:'Festivals & Open Airs',fest_tag:'Festival',fest_note:'Festivals erscheinen etwa zwei Monate vorher und verschwinden, sobald sie vorbei sind. Gerade ist Indoor-Saison, Open Airs für 2027 kommen rein, sobald Termine bestätigt sind.',kind_event_site:'Festival- und Event-Gelände',kind_seasonal:'Open Air, nur in der Saison',kind_note:'Erscheint auf der Karte nur, wenn hier etwas ansteht.',f_end:'Ende (optional, bei mehrtägigen Events)',
    n_events:'{n} Events',none_found:'Keine Events gefunden. Probier weniger Filter.',going_n:'{n} aus der Community',
    back:'Zurück',date:'Datum',time:'Beginn',venue:'Ort',tba:'siehe Quelle',lineup:'Line-up',and_more:'und {n} weitere',
    lineup_tba:'Das Line-up steht noch nicht fest oder liegt uns nicht vor. Details über die Quelle.',
    who_goes:'Wer geht hin',nobody:'Noch niemand aus der Community. Sei die erste Person.',login_to_see:'Melde dich an, um zu sehen, wer hingeht.',
    go:'Ich gehe hin',going:'Du gehst hin',save_ev:'Merken',saved_ev:'Gemerkt',fr_n:'{n} deiner Leute',fr_going:'Von deinen Leuten gehen hin',home_friends:'Deine Leute gehen hin',home_foryou:'Für dich',foryou_note:'Events von Artists und Clubs, denen du folgst.',foryou_empty:'Folge Artists und Clubs, dann landen ihre Termine hier.',new_badge:'Neu',n_new:'{n} neu seit deinem letzten Besuch',follow:'Folgen',following:'Folge ich',follow_club:'Club folgen',followed_club:'Du folgst dem Club',push_note:'Push-Benachrichtigungen kommen mit der Handy-App. Bis dahin siehst du Neues unter „Für dich“ auf Home.',cd_in:'Noch {t}',cd_live:'Läuft gerade',cd_h:'{h} Std {m} Min',cd_d:'{d} T {h} Std',tix_t:'Tickets',tix_available:'Tickets verfügbar',tix_few:'Nur noch wenige Tickets',tix_sold_out:'Ausverkauft',tix_unknown:'Ticketstatus unbekannt',tix_price:'Preis',tix_official:'Offizieller Ticketshop',tix_resale_off:'Offizieller Wiederverkauf',tix_swap:'Auf TicketSwap suchen',tix_swap_note:'TicketSwap ist ein Fan-zu-Fan-Marktplatz mit Käuferschutz. Wir haben keine Verbindung zu TicketSwap und sehen dort nichts ein.',scam_t:'Achtung vor Ticket-Betrug',scam_1:'Zahl nie per PayPal „Freunde & Familie“, Überweisung oder Gutscheinkarten an Fremde. Dann ist dein Geld weg.',scam_2:'Screenshots oder PDFs von Tickets können zigfach verkauft werden. Sicher ist nur eine offizielle Umschreibung auf deinen Namen.',scam_3:'Wer Druck macht („nur noch heute“, „schnell zahlen“), ist meistens Betrug.',scam_4:'Kauf am besten über offizielle Shops oder Plattformen mit Käuferschutz.',rr6:'Ticket-Betrug',f_price:'Preis (z. B. 15–20 €)',f_tstatus:'Ticketstatus',share_more:'',login_why:'Danach geht es direkt dort weiter, wo du warst.',no_rating:'Noch keine Bewertung',route:'Route',close:'Schließen',map_fail:'Die Karte kann auf diesem Gerät nicht geladen werden. Unten findest du alle Orte als Liste.',rev_t:'Bewertungen',rev_none:'Noch keine Bewertungen. Sei die erste Person!',rev_write:'Club bewerten',rev_edit:'Deine Bewertung ändern',rev_overall:'Gesamt',rev_sound:'Sound',rev_crowd:'Crowd',rev_door:'Tür & Einlass',rev_safety:'Awareness & Sicherheit',rev_body:'Was sollten andere wissen? (optional)',rev_send:'Bewertung speichern',rev_saved:'Danke für deine Bewertung!',rev_need_star:'Bitte gib mindestens eine Gesamtwertung.',rev_login:'Melde dich an, um den Club zu bewerten.',rev_n:'{n} Bewertungen',rev_one:'1 Bewertung',rev_rules:'Bewerte fair und aus eigener Erfahrung. Keine Namen von Türstehern oder Gästen.',pop_hint:'Tippen für Details',gcal:'In Google Kalender',share:'Teilen',copied:'Link kopiert',tickets:'Tickets & Infos',show_map:'Auf der Karte zeigen',
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
    chat_soon:'Chat, Crew-Suche und Mitfahrgelegenheiten kommen im nächsten Schritt.',
    login_t:'Anmelden',signup_t:'Registrieren',email:'E-Mail',password:'Passwort',pw_hint:'Mindestens 8 Zeichen',display_name:'Anzeigename',
    login_btn:'Anmelden',signup_btn:'Konto erstellen',forgot:'Passwort vergessen?',reset_sent:'Wenn es ein Konto mit dieser E-Mail gibt, ist ein Link zum Zurücksetzen unterwegs.',
    signup_done:'Fast geschafft: Wir haben dir eine E-Mail geschickt. Klick auf den Link darin, dann bist du angemeldet.',
    login_need:'Dafür musst du angemeldet sein.',to_login:'Anmelden oder registrieren',logout:'Abmelden',
    terms:'Mit der Registrierung bestätigst du, dass du mindestens 18 Jahre alt bist.',age_ok:'Ich bin mindestens 18 Jahre alt.',
    err_generic:'Das hat nicht geklappt. Bitte versuch es noch einmal.',err_login:'E-Mail oder Passwort stimmt nicht, oder die E-Mail ist noch nicht bestätigt.',
    err_handle:'Dieser Nutzername ist schon vergeben.',err_handle_fmt:'Nutzername: 3 bis 30 Zeichen, nur a–z, 0–9, Punkt und Unterstrich.',err_pw:'Das Passwort braucht mindestens 8 Zeichen.',
    me_title:'Mein Profil',handle:'Nutzername',bio:'Über mich',bio_ph:'Was hörst du, wo tanzt du?',save:'Speichern',saved:'Gespeichert',soc_hint:'Socials verlinken',
    my_going:'Ich gehe hin',my_saved:'Merkliste',my_subs:'Meine Einträge',none_yet:'Noch nichts.',
    verif_t:'Artist-Verifizierung',verif_none:'Du bist DJ oder Live-Act? Beantrage die Verifizierung. Dann bekommst du das rote Häkchen und deine Events erscheinen sofort.',
    verif_name:'Artist-Name',verif_links:'Belege (Links, eins pro Zeile)',verif_links_ph:'z. B. Resident-Advisor-Seite, offizielles Instagram, Booking-Agentur',
    verif_btn:'Verifizierung beantragen',verif_pending:'Antrag eingegangen. Wir prüfen dein Profil und melden uns.',verif_rejected:'Dein letzter Antrag wurde abgelehnt. Du kannst einen neuen stellen.',verif_ok:'Dein Profil ist verifiziert.',
    admin_t:'Admin',admin_open:'Admin-Bereich öffnen',adm_verif:'Verifizierungs-Anträge',adm_events:'Events in Prüfung',adm_reports:'Meldungen',approve:'Freigeben',reject:'Ablehnen',publish:'Veröffentlichen',done:'Erledigt',
    profile_nf:'Dieses Profil gibt es nicht.',report:'Melden',block:'Blockieren',blocked:'Blockiert. Ihr seht euch gegenseitig nicht mehr.',report_reason:'Grund',
    rr1:'Belästigung',rr2:'Spam oder Fake-Profil',rr3:'Gefährliches Verhalten',rr4:'Falsche Angaben',rr5:'Sonstiges',report_txt:'Was ist passiert? (optional)',report_send:'Meldung senden',report_sent:'Danke. Unser Team prüft die Meldung vertraulich.',
    safety_note:'Melden und Blockieren bleibt anonym.',upcoming_going:'Geht zu',
    add_event:'Event eintragen',new_title:'Event eintragen',new_sub:'Verifizierte Artists und Clubs erscheinen sofort, alle anderen Einträge werden kurz geprüft.',
    f_title:'Name des Events',f_venue:'Club',f_venue_pick:'Club wählen',f_venue_missing:'Dein Club fehlt? Schreib es in den Namen, wir legen ihn an.',f_date:'Datum',f_time:'Beginn',f_genres:'Genres',
    f_lineup:'Line-up (Namen mit Komma trennen)',f_link:'Link zu Tickets oder Flyer',f_nophone:'Auf dem Event gilt ein Foto- und Videoverbot',f_kind:'Art',f_submit:'Event einreichen',
    f_err:'Bitte Name, Club und Datum ausfüllen.',sub_ok_pub:'Event ist online.',sub_ok_pend:'Danke! Dein Event wird geprüft und erscheint danach.',
    footer:'Rave Strangers · Beta · Event-Daten aus öffentlichen Quellen, ohne Gewähr. Club-Adressen und Positionen: © OpenStreetMap-Mitwirkende.'
  },
  en:{
    nav_home:'Home',nav_events:'Events',nav_map:'Map',nav_artists:'Artists',nav_connect:'Connect',nav_me:'Profile',
    home_hi:'What’s up',home_hi_name:'What’s up, {n}',home_sub:'Your weekend, news from the scene and what is new.',home_city:'City',home_all:'Everywhere',
    home_weekend:'Your weekend',home_today:'Today and tomorrow',home_weekend_none:'Nothing listed here for this weekend yet.',home_all_events:'All events',
    home_remind:'You are going',home_new:'New in the app',home_news:'News',home_ticker:'From the scene',home_kicker:'Techno · Germany · Tonight',ticker_note:'Headlines from Groove, Mixmag and DJ Mag. Tap to read the article on the magazine’s site.',
    no_posts:'No posts yet.',post_write:'Write a post',post_title:'Headline',post_body:'Text',post_link:'Link (optional)',post_publish:'Publish',post_done:'Post is live',
    kind_news:'Editorial',kind_artist:'Artist',kind_club:'Club',home_artists:'Discover verified artists',ago_now:'just now',ago_min:'{n} min ago',ago_h:'{n} h ago',ago_d:'{n} days ago',ago_1d:'yesterday',
    banner:'Beta: events from public calendars (no guarantee). Accounts are real.',
    loading:'Loading …',load_err:'Could not load the data. Check your connection and reload.',retry:'Reload',
    events_title:'Raves in Germany',events_sub:'Find nights, DJs and people who are heading there too.',
    search:'Search',search_ph:'Event, club or DJ',city:'City',all_cities:'All cities',when:'When',
    when_all:'Any date',when_week:'Next 7 days',when_month:'Next 30 days',genre_all:'All genres',
    type_all:'All',type_club:'Club nights',type_fest:'Festivals & open airs',fest_tag:'Festival',fest_note:'Festivals show up about two months ahead and disappear once they are over. It is indoor season; open airs for 2027 get added once dates are confirmed.',kind_event_site:'Festival and event grounds',kind_seasonal:'Open air, in season only',kind_note:'Shows on the map only when something is coming up here.',f_end:'End (optional, for multi-day events)',
    n_events:'{n} events',none_found:'No events found. Try fewer filters.',going_n:'{n} from the community',
    back:'Back',date:'Date',time:'Starts',venue:'Venue',tba:'see source',lineup:'Line-up',and_more:'and {n} more',
    lineup_tba:'The line-up is not announced yet or we do not have it. Check the source.',
    who_goes:"Who's going",nobody:'Nobody from the community yet. Be the first.',login_to_see:"Log in to see who's going.",
    go:"I'm going",going:"You're going",save_ev:'Save',saved_ev:'Saved',fr_n:'{n} of your people',fr_going:'Your people going',home_friends:'Your people are going',home_foryou:'For you',foryou_note:'Events by artists and clubs you follow.',foryou_empty:'Follow artists and clubs and their dates will show up here.',new_badge:'New',n_new:'{n} new since your last visit',follow:'Follow',following:'Following',follow_club:'Follow club',followed_club:'You follow this club',push_note:'Push notifications arrive with the phone app. Until then, new dates show up under “For you” on Home.',cd_in:'In {t}',cd_live:'Happening now',cd_h:'{h} h {m} min',cd_d:'{d} d {h} h',tix_t:'Tickets',tix_available:'Tickets available',tix_few:'Only a few tickets left',tix_sold_out:'Sold out',tix_unknown:'Ticket status unknown',tix_price:'Price',tix_official:'Official ticket shop',tix_resale_off:'Official resale',tix_swap:'Search on TicketSwap',tix_swap_note:'TicketSwap is a fan-to-fan marketplace with buyer protection. We are not affiliated with TicketSwap and cannot see its listings.',scam_t:'Watch out for ticket scams',scam_1:'Never pay strangers via PayPal “Friends & Family”, bank transfer or gift cards. That money is gone.',scam_2:'Screenshots or PDFs of tickets can be sold many times. Only an official name transfer to you is safe.',scam_3:'Pressure (“today only”, “pay fast”) is usually a scam.',scam_4:'Buy through official shops or platforms with buyer protection.',rr6:'Ticket scam',f_price:'Price (e.g. €15–20)',f_tstatus:'Ticket status',share_more:'',login_why:'Afterwards you continue right where you were.',no_rating:'No rating yet',route:'Directions',close:'Close',map_fail:'The map cannot be loaded on this device. All places are listed below.',rev_t:'Ratings',rev_none:'No ratings yet. Be the first!',rev_write:'Rate this club',rev_edit:'Edit your rating',rev_overall:'Overall',rev_sound:'Sound',rev_crowd:'Crowd',rev_door:'Door & entry',rev_safety:'Awareness & safety',rev_body:'What should others know? (optional)',rev_send:'Save rating',rev_saved:'Thanks for your rating!',rev_need_star:'Please give at least an overall rating.',rev_login:'Log in to rate this club.',rev_n:'{n} ratings',rev_one:'1 rating',rev_rules:'Rate fairly and from your own experience. No names of door staff or guests.',pop_hint:'Tap for details',gcal:'Add to Google Calendar',share:'Share',copied:'Link copied',tickets:'Tickets & info',show_map:'Show on map',
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
    chat_soon:'Chat, crew finder and ride sharing come in the next step.',
    login_t:'Log in',signup_t:'Sign up',email:'Email',password:'Password',pw_hint:'At least 8 characters',display_name:'Display name',
    login_btn:'Log in',signup_btn:'Create account',forgot:'Forgot password?',reset_sent:'If an account with this email exists, a reset link is on its way.',
    signup_done:'Almost there: we sent you an email. Click the link in it and you are logged in.',
    login_need:'You need to be logged in for this.',to_login:'Log in or sign up',logout:'Log out',
    terms:'By signing up you confirm that you are at least 18 years old.',age_ok:'I am at least 18 years old.',
    err_generic:'That did not work. Please try again.',err_login:'Email or password is wrong, or the email is not confirmed yet.',
    err_handle:'This username is taken.',err_handle_fmt:'Username: 3 to 30 characters, only a–z, 0–9, dot and underscore.',err_pw:'The password needs at least 8 characters.',
    me_title:'My profile',handle:'Username',bio:'About me',bio_ph:'What do you listen to, where do you dance?',save:'Save',saved:'Saved',soc_hint:'Link your socials',
    my_going:"I'm going",my_saved:'Saved',my_subs:'My submissions',none_yet:'Nothing yet.',
    verif_t:'Artist verification',verif_none:'Are you a DJ or live act? Request verification to get the red tick; your events then go live right away.',
    verif_name:'Artist name',verif_links:'Proof (links, one per line)',verif_links_ph:'e.g. Resident Advisor page, official Instagram, booking agency',
    verif_btn:'Request verification',verif_pending:"Request received. We'll check your profile and get back to you.",verif_rejected:'Your last request was declined. You can send a new one.',verif_ok:'Your profile is verified.',
    admin_t:'Admin',admin_open:'Open admin area',adm_verif:'Verification requests',adm_events:'Events under review',adm_reports:'Reports',approve:'Approve',reject:'Reject',publish:'Publish',done:'Done',
    profile_nf:'This profile does not exist.',report:'Report',block:'Block',blocked:'Blocked. You no longer see each other.',report_reason:'Reason',
    rr1:'Harassment',rr2:'Spam or fake profile',rr3:'Dangerous behaviour',rr4:'Wrong details',rr5:'Other',report_txt:'What happened? (optional)',report_send:'Send report',report_sent:'Thanks. Our team reviews the report confidentially.',
    safety_note:'Reporting and blocking are anonymous.',upcoming_going:'Going to',
    add_event:'Add event',new_title:'Add an event',new_sub:'Verified artists and clubs go live right away, all other entries get a quick check.',
    f_title:'Event name',f_venue:'Club',f_venue_pick:'Pick a club',f_venue_missing:'Your club is missing? Put it in the name, we will add it.',f_date:'Date',f_time:'Start',f_genres:'Genres',
    f_lineup:'Line-up (separate names with commas)',f_link:'Link to tickets or flyer',f_nophone:'This event has a no-photo, no-video rule',f_kind:'Type',f_submit:'Submit event',
    f_err:'Please fill in name, club and date.',sub_ok_pub:'Event is live.',sub_ok_pend:'Thanks! Your event will be checked and then appear.',
    footer:'Rave Strangers · Beta · Event data from public sources, no guarantee. Club addresses and positions: © OpenStreetMap contributors.'
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
var VENUES=[], EVENTS=[];
var S={
  lang:(navigator.language||'de').slice(0,2)==='de'?'de':'en',
  q:'',city:'',genre:'',when:'all',type:'',onlyEvents:false,homeCity:null,
  map:null,mapSel:null,mapHash:null,
  ready:false,loadErr:false,
  user:null,me:null,going:[],saved:[],counts:{},verif:null,follow:[],vfollow:[],attRows:[],lastSeen:null,
  authTab:'login',authMsg:'',authErr:''
};
var cache={att:{},profile:{},artists:null,connect:null,subs:null,admin:null,home:null,reviews:{}};

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
function av(name,size){ return '<span class="av" style="--h:'+hue(name||'?')+';--s:'+(size||40)+'px" aria-hidden="true">'+esc(initials(name))+'</span>'; }
var VB='<svg class="vb" viewBox="0 0 24 24" role="img" aria-label="verified"><circle cx="12" cy="12" r="11" fill="#e4262e"/><path d="M7 12.5l3.2 3.2L17 9" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
function host(u){ try{ return new URL(u).hostname.replace(/^www\./,''); }catch(e){ return u; } }
function safeUrl(u){ return /^https?:\/\//i.test(u||'')?u:null; }
function venue(id){ for(var i=0;i<VENUES.length;i++){ if(VENUES[i].id===id) return VENUES[i]; } return null; }
function evt(id){ for(var i=0;i<EVENTS.length;i++){ if(EVENTS[i].id===id) return EVENTS[i]; } return null; }
function genreTags(g){ return g.map(function(x){ return '<span class="tag">'+esc(x)+'</span>'; }).join(' '); }
function isTemporary(e){ var v=venue(e.v); return e.type==='festival'||(v&&v.kind!=='club'); }
function upcoming(e){ if(e.endOff<0) return false; if(isTemporary(e)&&e.off>LEAD_DAYS) return false; return true; }
function inWindow(e){ if(!upcoming(e)) return false; if(S.when==='week'&&e.off>7) return false; if(S.when==='month'&&e.off>30) return false; return true; }
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
    price:r.price_text||null,tstatus:r.ticket_status||null,resale:safeUrl(r.resale_url),lineupIds:lus.map(function(x){ return x.artist_id; }).filter(Boolean),lineupLc:lu.map(function(x){ return x.toLowerCase(); })};
}
function mapVenue(r){ return {id:r.id,name:r.name,city:r.city,addr:r.address,lat:r.lat,lon:r.lon,approx:r.approx,kind:r.kind||'club',rules:r.rules||{}}; }
var RATINGS={};
function loadRatings(){ return data(sb.from('venue_ratings').select('*')).then(function(r){ RATINGS={}; r.forEach(function(x){ RATINGS[x.venue_id]=x; }); }).catch(function(){}); }
function loadBase(){
  var since=berlinToISO(isoOf(-14),'00:00');   /* a little back, so festivals that are still running are included */
  return Promise.all([
    data(sb.from('venues').select('id,name,city,address,lat,lon,approx,kind,rules')),
    data(sb.from('events').select('id,venue_id,title,starts_at,ends_at,created_at,time_known,kind,genres,no_phone,ticket_url,source_url,lineup_more,status,created_by,price_text,ticket_status,resale_url,event_lineup(position,name,artist_id)').eq('status','published').gte('starts_at',since).order('starts_at',{ascending:true}))
  ]).then(function(res){
    VENUES=res[0].map(mapVenue);
    EVENTS=res[1].map(mapEvent).filter(function(e){ return venue(e.v)&&e.endOff>=0; });
    S.ready=true; S.loadErr=false;
    loadRatings().then(function(){ if(S.ready) render(false); });
  }).catch(function(err){ if(window.console) console.error(err); S.loadErr=true; });
}
function loadMine(){
  if(!S.user){ S.me=null; S.going=[]; S.saved=[]; S.counts={}; S.verif=null; S.follow=[]; S.vfollow=[]; S.attRows=[]; return Promise.resolve(); }
  var uid=S.user.id;
  return Promise.all([
    data(sb.from('profiles').select('*').eq('id',uid).maybeSingle()),
    data(sb.from('attendance').select('event_id,profile_id')),
    data(sb.from('bookmarks').select('event_id').eq('profile_id',uid)),
    data(sb.from('artist_verifications').select('id,status,created_at').eq('profile_id',uid).order('created_at',{ascending:false}).limit(1)),
    data(sb.from('follows').select('artist,profiles!follows_artist_fkey(id,handle,display_name,verified,role)').eq('follower',uid)),
    data(sb.from('venue_follows').select('venue_id').eq('profile_id',uid))
  ]).then(function(r){
    S.me=r[0];
    S.counts={}; S.going=[];
    r[1].forEach(function(a){ S.counts[a.event_id]=(S.counts[a.event_id]||0)+1; if(a.profile_id===uid) S.going.push(a.event_id); });
    S.saved=r[2].map(function(b){ return b.event_id; });
    S.verif=r[3][0]||null;
    S.follow=r[4].map(function(x){ return x.profiles; }).filter(Boolean);
    S.vfollow=r[5].map(function(x){ return x.venue_id; });
    S.attRows=r[1];
  }).catch(fail);
}
function resetCaches(){ cache={att:{},profile:{},artists:null,connect:null,subs:null,admin:null,home:null,reviews:{}}; }

/* ---------- Shared pieces ---------- */
function whenOptions(){ return [['all','when_all'],['week','when_week'],['month','when_month']].map(function(w){ return '<option value="'+w[0]+'"'+(S.when===w[0]?' selected':'')+'>'+t(w[1])+'</option>'; }).join(''); }
function genreChips(){
  return '<button type="button" class="chip" data-act="genre" data-id="" aria-pressed="'+(S.genre==='')+'">'+t('genre_all')+'</button>'+
    GENRES.map(function(g){ return '<button type="button" class="chip" data-act="genre" data-id="'+esc(g)+'" aria-pressed="'+(S.genre===g)+'">'+esc(g)+'</button>'; }).join('');
}
function typeChips(){ return [['','type_all'],['club','type_club'],['festival','type_fest']].map(function(x){ return '<button type="button" class="chip" data-act="type" data-id="'+x[0]+'" aria-pressed="'+(S.type===x[0])+'">'+t(x[1])+'</button>'; }).join(''); }
function eventCard(e){
  var d=dayOf(e.off), v=venue(e.v), n=S.counts[e.id]||0, fr=friendsAt(e.id);
  var tag=tixTag(e)+(e.status==='pending'?' <span class="tag hot">'+t('pending')+'</span>':'')+(e.type==='festival'?' <span class="tag">'+t('fest_tag')+'</span>':'')+(has(S.saved,e.id)?' <span class="stars" title="'+t('saved_ev')+'">★</span>':'');
  return '<a class="ev" href="#event-'+e.id+'"><div class="date"><em>'+esc(fmtDow(d))+'</em><b>'+d.getDate()+'</b><span>'+esc(fmtMonth(d))+'</span></div>'+
    '<div><h3>'+esc(e.title)+tag+'</h3><p class="meta">'+esc(v?v.name:'')+(v?' · '+esc(v.city):'')+(e.time?' · '+esc(e.time):'')+'</p><div class="chips">'+genreTags(e.genres)+'</div></div>'+
    '<div class="side">'+(isNew(e)&&forYou(e)?'<span class="newb">'+t('new_badge')+'</span>':'')+cdHTML(e)+(fr.length?'<span class="fr">'+t('fr_n',{n:fr.length})+'</span>':'')+(n?'<span>'+(has(S.going,e.id)?'✓ ':'')+t('going_n',{n:n})+'</span>':'')+'</div></a>';
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
function swapUrl(e){ return 'https://www.ticketswap.com/search?query='+encodeURIComponent(e.title); }
function scamHTML(){ return '<div class="warn" role="note"><b>⚠ '+t('scam_t')+'</b><ul><li>'+t('scam_1')+'</li><li>'+t('scam_2')+'</li><li>'+t('scam_3')+'</li><li>'+t('scam_4')+'</li></ul></div>'; }
function eur(x){ return x==null?'':Number(x).toLocaleString(locale(),{style:'currency',currency:'EUR'}); }
function ticketsHTML(e){
  var st=e.tstatus||'unknown', off=e.ticket||e.src;
  var head='<div class="tix tix-'+st+'"><span class="tix-dot" aria-hidden="true"></span><strong>'+t('tix_'+st)+'</strong>'+(e.price?'<span class="tix-price">'+t('tix_price')+': '+esc(e.price)+'</span>':'')+'</div>';
  var links='<div class="row" style="margin-top:12px">'+(off?'<a class="btn'+(st!=='sold_out'?' primary':'')+'" href="'+esc(off)+'" target="_blank" rel="noopener">'+t('tix_official')+' ↗</a>':'')+
    (e.resale?'<a class="btn" href="'+esc(e.resale)+'" target="_blank" rel="noopener">'+t('tix_resale_off')+' ↗</a>':'')+
    '<a class="btn" href="'+esc(swapUrl(e))+'" target="_blank" rel="noopener nofollow">'+t('tix_swap')+' ↗</a></div><p class="sub" style="font-size:13px">'+t('tix_swap_note')+'</p>';
  return head+links+scamHTML();
}
function awareHTML(v){ var a=v&&v.rules&&v.rules.aware; return '<div class="nophone" style="margin-top:0"><div>'+t('aware_d')+(a?'<br><b>'+esc(t('aware_team',{x:a}))+'</b>':'')+'</div></div>'; }
function reportForm(kind,id){
  var reasons=['rr1','rr2','rr6','rr3','rr4','rr5'].map(function(k){ return '<option>'+t(k)+'</option>'; }).join('');
  return '<details class="more"><summary>'+(kind==='event'?t('report_ev'):t('report'))+'</summary><form class="form" data-form="report" data-kind="'+kind+'" data-id="'+esc(id)+'" style="margin-top:8px">'+
    '<div class="field"><label for="rp-r">'+t('report_reason')+'</label><select id="rp-r" name="reason">'+reasons+'</select></div>'+
    '<div class="field"><label for="rp-t">'+t('report_txt')+'</label><textarea id="rp-t" name="text" maxlength="1000"></textarea></div>'+
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
    if(q&&(e.title+' '+v.name+' '+v.city+' '+(e.lineup||[]).join(' ')).toLowerCase().indexOf(q)<0) return false;
    return true;
  });
}
function eventsListHTML(){
  var list=filteredEvents();
  if(!list.length) return '<div class="empty">'+t('none_found')+'</div>';
  return '<p class="count">'+t('n_events',{n:list.length})+'</p><div class="list">'+list.map(eventCard).join('')+'</div>';
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
  else who=cache.att[e.id].length?cache.att[e.id].map(function(p){ return '<a class="person" href="#u-'+esc(p.handle)+'">'+av(p.display_name)+'<div class="grow"><strong>'+esc(p.display_name)+(p.verified?VB:'')+'</strong><p>@'+esc(p.handle)+(p.city?' · '+esc(p.city):'')+'</p></div></a>'; }).join(''):emptyBox(t('nobody'));
  var fr=friendsAt(e.id), cdx=cdHTML(e);
  return '<a class="back" href="#events">← '+t('back')+'</a>'+(cdx?'<p class="kicker">'+cdx+'</p>':'')+'<h1>'+esc(e.title)+'</h1>'+
    '<div class="chips" style="margin-top:12px">'+genreTags(e.genres)+(e.type==='festival'?' <span class="tag hot">'+t('fest_tag')+'</span>':'')+'</div>'+
    '<dl class="facts"><div><dt>'+t('date')+'</dt><dd>'+esc(fmtLong(d))+(e.endDate&&e.endDate!==e.date?' – '+esc(fmtLong(dayOf(e.endOff))):'')+'</dd></div><div><dt>'+t('time')+'</dt><dd>'+(e.time?esc(e.time):t('tba'))+'</dd></div>'+
    '<div><dt>'+t('venue')+'</dt><dd><a href="#club-'+v.id+'">'+esc(v.name)+'</a>, '+esc(v.city)+'</dd></div></dl>'+
    (e.nophone?'<div class="nophone"><div><b>'+t('nophone_t')+'</b><br>'+t('nophone_d')+'</div></div>':'')+
    '<div class="row" style="margin-top:20px"><button type="button" class="btn '+(go?'on':'primary')+'" data-act="go" data-id="'+e.id+'" aria-pressed="'+go+'">'+(go?'✓ '+t('going'):t('go'))+'</button>'+
    '<button type="button" class="btn'+(sv?' on':'')+'" data-act="save" data-id="'+e.id+'" aria-pressed="'+sv+'">'+(sv?'★ '+t('saved_ev'):'☆ '+t('save_ev'))+'</button></div>'+
    '<div class="row" style="margin-top:10px"><a class="btn" href="'+esc(gcalUrl(e))+'" target="_blank" rel="noopener">'+t('gcal')+' ↗</a>'+
    '<a class="btn" href="#map-'+v.id+'">'+t('show_map')+'</a><button type="button" class="btn" data-act="share" data-id="'+e.id+'">'+t('share')+'</button></div>'+
    (n?'<p class="sub">'+t('going_n',{n:n})+'</p>':'')+
    (fr.length?'<div class="frline"><span class="fr">'+t('fr_going')+'</span>'+fr.slice(0,6).map(function(p){ return '<a href="#u-'+esc(p.handle)+'" title="'+esc(p.display_name)+'">'+av(p.display_name,30)+'</a>'; }).join('')+'<span class="sub" style="margin:0">'+esc(fr.slice(0,3).map(function(p){ return p.display_name; }).join(', '))+(fr.length>3?' +'+(fr.length-3):'')+'</span></div>':'')+
    '<div class="sec"><h2>'+t('tix_t')+'</h2>'+ticketsHTML(e)+'</div>'+
    '<div class="sec"><h2>'+t('lineup')+'</h2><div class="people">'+lineup+'</div></div>'+
    '<div class="sec"><h2>'+t('who_goes')+'</h2><div class="people">'+who+'</div></div>'+
    '<div class="sec"><h2>'+t('aware_t')+'</h2>'+awareHTML(v)+'</div>'+
    '<p class="srcbox">'+(e.src?t('source_t')+': <a class="link" href="'+esc(e.src)+'" target="_blank" rel="noopener">'+esc(host(e.src))+'</a>. '+t('source_note'):'')+'</p>'+
    (S.user?reportForm('event',e.id):'');
}
function loadAttendees(id){
  data(sb.from('attendance').select('profile_id,profiles(handle,display_name,city,verified)').eq('event_id',id)).then(function(rows){
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
    data(sb.from('posts').select('id,kind,title,body,link,created_at,author,profiles!posts_author_fkey(handle,display_name,verified)').eq('published',true).order('created_at',{ascending:false}).limit(10)),
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
  var chips='<button type="button" class="chip" data-act="homecity" data-id="" aria-pressed="'+(city==='')+'">'+t('home_all')+'</button>'+top.map(function(c){ return '<button type="button" class="chip" data-act="homecity" data-id="'+esc(c)+'" aria-pressed="'+(city===c)+'">'+esc(c)+'</button>'; }).join('');
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
  return marq+'<p class="kicker">'+esc(t('home_kicker'))+'</p><h1>'+(S.me?esc(t('home_hi_name',{n:S.me.display_name})):t('home_hi'))+'</h1><p class="sub">'+t('home_sub')+'</p>'+
    '<div class="chips" style="margin-top:14px">'+chips+'</div>'+
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
  data(sb.from('reviews').select('id,author,stars,sound,crowd,door,safety,body,created_at,profiles(handle,display_name,verified)').eq('venue_id',id).is('event_id',null).order('created_at',{ascending:false}).limit(30))
    .then(function(r){ cache.reviews[id]=r; if(location.hash==='#club-'+id) render(false); }).catch(function(err){ cache.reviews[id]=[]; fail(err); });
}
function bar(label,x){ return x?'<div class="rbar"><span>'+label+'</span><i><b style="width:'+(x/5*100)+'%"></b></i><em>'+String(x).replace('.',S.lang==='de'?',':'.')+'</em></div>':''; }
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
    data(sb.from('profiles').select('handle,display_name,city,verified').eq('role','artist').eq('verified',true).order('display_name',{ascending:true}))
      .then(function(r){ cache.artists=r; if(location.hash==='#artists') render(false); }).catch(function(err){ cache.artists=[]; fail(err); });
  }
  var body=cache.artists==='loading'?loadingBox():(cache.artists.length?'<div class="grid">'+cache.artists.map(function(a){ return '<a class="acard" href="#u-'+esc(a.handle)+'">'+av(a.display_name,52)+'<div><strong>'+esc(a.display_name)+VB+'</strong><p>'+esc(a.city||'')+'</p></div></a>'; }).join('')+'</div>':'<div class="empty">'+t('no_artists')+'</div>');
  return '<h1>'+t('artists_title')+'</h1><p class="sub">'+t('artists_sub')+'</p>'+body;
}
function viewProfile(handle){
  var key=handle.toLowerCase();
  if(cache.profile[key]===undefined){
    cache.profile[key]='loading';
    data(sb.from('profiles').select('id,handle,display_name,city,bio,socials,verified,role').eq('handle',key).maybeSingle()).then(function(p){
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
  return back+'<div class="hero">'+av(p.display_name,84)+'<div><h1>'+esc(p.display_name)+(p.verified?VB.replace('class="vb"','class="vb" style="width:26px;height:26px"'):'')+'</h1>'+
    '<p class="sub" style="margin-top:6px">@'+esc(p.handle)+(p.city?' · '+esc(p.city):'')+(p.verified?' · '+t('verified'):'')+'</p></div></div>'+
    (mine?'':'<div class="row" style="margin-top:16px"><button type="button" class="btn '+(fo?'on':'primary')+'" data-act="follow" data-id="'+esc(p.id)+'" data-h="'+esc(p.handle)+'" aria-pressed="'+fo+'">'+(fo?'✓ '+t('following'):'+ '+t('follow'))+'</button></div>')+
    (p.bio?'<p class="sub" style="margin-top:16px">'+esc(p.bio)+'</p>':'')+socialsHTML(p.socials)+
    (evs.length?'<div class="sec"><h2>'+t('upcoming_going')+'</h2><div class="list" style="margin-top:0">'+evs.map(eventCard).join('')+'</div></div>':'')+
    (S.user&&!mine?'<div class="sec"><div class="row"><button type="button" class="btn small" data-act="block" data-id="'+esc(p.id)+'">'+t('block')+'</button></div>'+reportForm('profile',p.id)+'<p class="sub">'+t('safety_note')+'</p></div>':'')+
    (mine?'<div class="row" style="margin-top:20px"><a class="btn" href="#me">'+t('me_title')+'</a></div>':'');
}

/* ---------- Views: connect ---------- */
function viewConnect(){
  var head='<h1>'+t('connect_title')+'</h1><p class="sub">'+t('connect_sub')+'</p>';
  var soon='<div class="card" style="margin-top:24px"><p>'+t('chat_soon')+'</p></div>';
  if(!S.user) return head+'<div class="empty">'+t('connect_login')+'<div class="row" style="justify-content:center;margin-top:12px"><a class="btn primary" href="#login" data-act="loginhere">'+t('to_login')+'</a></div></div>'+soon;
  if(cache.connect===null){
    cache.connect='loading';
    var mine=S.going.slice();
    var p=mine.length?data(sb.from('attendance').select('event_id,profile_id,profiles(handle,display_name,city,verified)').in('event_id',mine)):Promise.resolve([]);
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
    return '<a class="person" href="#u-'+esc(x.p.handle)+'">'+av(x.p.display_name)+'<div class="grow"><strong>'+esc(x.p.display_name)+(x.p.verified?VB:'')+'</strong><p>'+(x.p.city?esc(x.p.city)+' · ':'')+t('goes_to')+' '+esc(names)+'</p></div></a>'; }).join('')+'</div>':'<div class="empty">'+t('connect_none')+'</div>');
  return head+'<div class="sec">'+body+'</div>'+soon;
}

/* ---------- Views: auth ---------- */
function viewLogin(){
  if(S.user){ setTimeout(function(){ location.hash='#me'; },0); return loadingBox(); }
  var login=S.authTab==='login';
  return '<h1>'+(login?t('login_t'):t('signup_t'))+'</h1>'+
    '<div class="seg" role="group" style="margin-top:16px"><button type="button" data-act="authtab" data-id="login" aria-pressed="'+login+'">'+t('login_t')+'</button><button type="button" data-act="authtab" data-id="signup" aria-pressed="'+(!login)+'">'+t('signup_t')+'</button></div>'+
    (S.authMsg?'<div class="nophone"><div>'+esc(S.authMsg)+'</div></div>':'')+
    (after()?'<p class="sub">'+t('login_why')+'</p>':'')+'<form class="form" data-form="'+(login?'login':'signup')+'" novalidate>'+
    (login?'':'<div class="field"><label for="a-name">'+t('display_name')+'</label><input id="a-name" name="name" type="text" maxlength="60" autocomplete="nickname" required></div>')+
    '<div class="field"><label for="a-mail">'+t('email')+'</label><input id="a-mail" name="email" type="email" autocomplete="email" required></div>'+
    '<div class="field"><label for="a-pw">'+t('password')+'</label><input id="a-pw" name="password" type="password" minlength="8" autocomplete="'+(login?'current-password':'new-password')+'" required>'+(login?'':'<p class="sub" style="margin:4px 0 0;font-size:13px">'+t('pw_hint')+'</p>')+'</div>'+
    (login?'':'<label class="row" style="gap:10px"><input type="checkbox" name="age" required style="width:20px;height:20px;accent-color:var(--accent)"> '+t('age_ok')+'</label>')+
    '<div id="auth-err" class="sub" style="color:var(--accent);margin:0" role="alert">'+esc(S.authErr)+'</div>'+
    '<div class="row"><button class="btn primary" type="submit">'+(login?t('login_btn'):t('signup_btn'))+'</button>'+(login?'<button type="button" class="linkbtn" data-act="forgot">'+t('forgot')+'</button>':'')+'</div></form>';
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
  return '<div class="row" style="justify-content:space-between"><h1>'+t('me_title')+'</h1><button type="button" class="btn small" data-act="logout">'+t('logout')+'</button></div>'+
    '<div class="hero" style="margin-top:16px">'+av(m.display_name,72)+'<div><h2 style="font-size:30px">'+esc(m.display_name)+(m.verified?VB:'')+'</h2><p class="sub" style="margin:2px 0 0"><a class="link" href="#u-'+esc(m.handle)+'">@'+esc(m.handle)+'</a>'+(m.city?' · '+esc(m.city):'')+'</p></div></div>'+
    (m.role==='admin'?'<div class="row" style="margin-top:16px"><a class="btn primary" href="#admin">'+t('admin_open')+'</a></div>':'')+
    '<div class="sec"><h2>'+t('my_going')+'</h2>'+(going.length?'<div class="list" style="margin-top:0">'+going.map(eventCard).join('')+'</div>':emptyBox(t('none_yet')))+'</div>'+
    '<div class="sec"><h2>'+t('my_saved')+'</h2>'+(saved.length?'<div class="list" style="margin-top:0">'+saved.map(eventCard).join('')+'</div>':emptyBox(t('none_yet')))+'</div>'+
    '<div class="sec"><h2>'+t('me_title')+'</h2><form class="form" data-form="me" style="margin-top:0">'+
      '<div class="form2"><div class="field"><label for="me-name">'+t('display_name')+'</label><input id="me-name" name="name" type="text" maxlength="60" value="'+esc(m.display_name)+'" required></div>'+
      '<div class="field"><label for="me-handle">'+t('handle')+'</label><input id="me-handle" name="handle" type="text" maxlength="30" value="'+esc(m.handle)+'" autocapitalize="none" spellcheck="false"></div></div>'+
      '<div class="field"><label for="me-city">'+t('city')+'</label><select id="me-city" name="city">'+cityOpts+'</select></div>'+
      '<div class="field"><label for="me-bio">'+t('bio')+'</label><textarea id="me-bio" name="bio" maxlength="500" placeholder="'+esc(t('bio_ph'))+'">'+esc(m.bio||'')+'</textarea></div>'+
      '<div><b>'+t('soc_hint')+'</b></div><div class="form2">'+soc+'</div>'+
      '<div id="me-err" class="sub" style="color:var(--accent);margin:0" role="alert"></div><div><button class="btn primary" type="submit">'+t('save')+'</button></div></form></div>'+
    '<div class="sec"><h2>'+t('verif_t')+'</h2><div class="card">'+verif+'</div></div>'+
    '<div class="sec"><h2>'+t('my_subs')+'</h2>'+subs+'</div>';
}

/* ---------- Views: new event ---------- */
function viewNew(){
  if(!S.user) return '<a class="back" href="#events">← '+t('back')+'</a><h1>'+t('new_title')+'</h1><div class="empty">'+t('login_need')+'<div class="row" style="justify-content:center;margin-top:12px"><a class="btn primary" href="#login" data-act="loginhere">'+t('to_login')+'</a></div></div>';
  var vopts='<option value="">'+t('f_venue_pick')+'</option>'+VENUES.slice().sort(function(a,b){ return a.city.localeCompare(b.city,'de')||a.name.localeCompare(b.name,'de'); }).map(function(v){ return '<option value="'+v.id+'">'+esc(v.city)+' · '+esc(v.name)+'</option>'; }).join('');
  var g=GENRES.map(function(x){ return '<label class="chipcheck"><input type="checkbox" name="genre" value="'+esc(x)+'"><span>'+esc(x)+'</span></label>'; }).join('');
  return '<a class="back" href="#events">← '+t('back')+'</a><h1>'+t('new_title')+'</h1><p class="sub">'+t('new_sub')+'</p>'+
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

/* ---------- Views: admin ---------- */
function viewAdmin(){
  if(!S.me||S.me.role!=='admin') return '<div class="empty">'+t('login_need')+'</div>';
  if(cache.admin===null){
    cache.admin='loading';
    Promise.all([
      data(sb.from('artist_verifications').select('id,artist_name,proof_links,note,created_at,profile_id,profiles!artist_verifications_profile_id_fkey(handle,display_name)').eq('status','pending').order('created_at',{ascending:true})),
      data(sb.from('events').select('id,title,starts_at,venue_id,source_url,created_by').eq('status','pending').order('created_at',{ascending:true})),
      data(sb.from('reports').select('id,reason,details,created_at,target_profile,target_event').eq('status','pending').order('created_at',{ascending:true}))
    ]).then(function(r){ cache.admin={verif:r[0],events:r[1],reports:r[2]}; if(location.hash==='#admin') render(false); })
      .catch(function(err){ cache.admin={verif:[],events:[],reports:[]}; fail(err); });
  }
  var a=cache.admin;
  if(a==='loading') return '<h1>'+t('admin_t')+'</h1>'+loadingBox();
  var ver=a.verif.length?a.verif.map(function(x){
    var links=(x.proof_links||[]).map(function(u){ var s=safeUrl(u); return s?'<a class="link" href="'+esc(s)+'" target="_blank" rel="noopener nofollow">'+esc(host(s))+'</a>':esc(u); }).join(' · ');
    return '<div class="card" style="margin-bottom:8px"><p><b style="color:var(--text)">'+esc(x.artist_name)+'</b> · '+(x.profiles?'<a class="link" href="#u-'+esc(x.profiles.handle)+'">@'+esc(x.profiles.handle)+'</a>':'')+'</p><p>'+(links||'–')+'</p>'+
      '<div class="row"><button type="button" class="btn small primary" data-act="adm-approve" data-id="'+x.id+'">'+t('approve')+'</button><button type="button" class="btn small" data-act="adm-reject" data-id="'+x.id+'">'+t('reject')+'</button></div></div>'; }).join(''):emptyBox(t('none_yet'));
  var evs=a.events.length?a.events.map(function(x){ var v=venue(x.venue_id), p=berlinParts(new Date(x.starts_at)), s=safeUrl(x.source_url);
    return '<div class="card" style="margin-bottom:8px"><p><b style="color:var(--text)">'+esc(x.title)+'</b></p><p>'+esc(p.date)+' '+esc(p.time)+' · '+esc(v?v.name+', '+v.city:'?')+(s?' · <a class="link" href="'+esc(s)+'" target="_blank" rel="noopener nofollow">'+esc(host(s))+'</a>':'')+'</p>'+
      '<div class="row"><button type="button" class="btn small primary" data-act="adm-publish" data-id="'+x.id+'">'+t('publish')+'</button><button type="button" class="btn small" data-act="adm-cancel" data-id="'+x.id+'">'+t('reject')+'</button></div></div>'; }).join(''):emptyBox(t('none_yet'));
  var reps=a.reports.length?a.reports.map(function(x){
    var target=x.target_event?'<a class="link" href="#event-'+x.target_event+'">Event #'+x.target_event+'</a>':'Profil '+esc(String(x.target_profile).slice(0,8));
    return '<div class="card" style="margin-bottom:8px"><p><b style="color:var(--text)">'+esc(x.reason)+'</b> · '+target+'</p>'+(x.details?'<p>'+esc(x.details)+'</p>':'')+
      '<div class="row"><button type="button" class="btn small" data-act="adm-report" data-id="'+x.id+'">'+t('done')+'</button></div></div>'; }).join(''):emptyBox(t('none_yet'));
  return '<a class="back" href="#me">← '+t('back')+'</a><h1>'+t('admin_t')+'</h1>'+
    '<div class="sec"><h2>'+t('adm_verif')+'</h2>'+ver+'</div><div class="sec"><h2>'+t('adm_events')+'</h2>'+evs+'</div><div class="sec"><h2>'+t('adm_reports')+'</h2>'+reps+'</div>';
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
function routeUrl(v){ return 'https://www.google.com/maps/dir/?api=1&destination='+v.lat+','+v.lon; }

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
    return '<a class="evrow" href="#event-'+e.id+'"><b>'+esc(fmtDow(d))+' '+d.getDate()+'.'+(d.getMonth()+1)+'.</b><div><strong>'+esc(e.title)+'</strong><p>'+(e.time?esc(e.time):t('tba'))+'</p></div></a>'; }).join('');
  return '<p class="kicker" style="margin:0 0 4px">'+esc(v.city)+(v.kind!=='club'?' · '+esc(t('kind_'+v.kind)):'')+'</p>'+
    '<h3 class="pop-t"><a href="#club-'+v.id+'">'+esc(v.name)+'</a></h3>'+ratingLine(v.id)+
    '<p class="addr">'+esc(v.addr||v.city)+'</p>'+
    (rows?'<div class="sheet-evs">'+rows+'</div>'+(more>0?'<p class="addr">+ '+evCountLabel(more)+'</p>':''):'<p class="addr">'+t('no_ev_here')+'</p>')+
    (MLPINNED?'<div class="row" style="margin-top:10px"><a class="btn small primary" href="#club-'+v.id+'">'+t('open_club')+' →</a><a class="btn small" href="'+esc(routeUrl(v))+'" target="_blank" rel="noopener">'+t('route')+' ↗</a></div>':'<p class="addr pop-hint">'+t('pop_hint')+'</p>');
}
function closePop(){ clearTimeout(MLHOVERT); if(MLPOP){ MLPOP.remove(); MLPOP=null; } MLPINNED=false; }
function showPopup(id,pinned){
  var v=venue(id); if(!v||!ML) return;
  clearTimeout(MLHOVERT);
  if(MLPOP&&MLPINNED&&!pinned) return;
  if(MLPOP){ MLPOP.remove(); MLPOP=null; }
  MLPINNED=!!pinned; S.mapSel=pinned?id:S.mapSel; markSel();
  MLPOP=new maplibregl.Popup({anchor:isFine()?undefined:'bottom',closeButton:!!pinned,closeOnClick:false,closeOnMove:false,offset:14,maxWidth:'290px',className:'rs-pop'+(pinned?' pinned':'')})
    .setLngLat([v.lon,v.lat]).setHTML(popHTML(id)).addTo(ML);
  MLPOP.on('close',function(){ if(MLPINNED){ MLPINNED=false; MLPOP=null; S.mapSel=null; markSel(); } });
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
    else if(l.type==='symbol'&&l.layout&&l.layout['text-field']){ p['text-color']=/water/.test(id)?'#6d7480':C.text; p['text-halo-color']=C.halo; p['text-halo-width']=1.2; }
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
  m.on('click','pt-hit',function(e){ var f=e.features[0]; var id=+f.properties.id; var v=venue(id); if(v) m.easeTo({center:[v.lon,v.lat],offset:isFine()?[0,0]:[0,110],duration:300}); showPopup(id,true); });
  if(fine){
    m.on('mouseenter','pt-hit',function(e){ m.getCanvas().style.cursor='pointer'; showPopup(+e.features[0].properties.id,false); });
    m.on('mouseleave','pt-hit',function(){ m.getCanvas().style.cursor=''; clearTimeout(MLHOVERT); MLHOVERT=setTimeout(function(){ if(!MLPINNED) closePop(); },120); });
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
  ML.flyTo({center:[v.lon,v.lat],zoom:Math.max(ML.getZoom(),13.5),speed:1.6,offset:[0,isFine()?30:110]});
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
  if(h==='new-event') return {tab:'events',html:viewNew()};
  var i=h.indexOf('-'), name=i<0?h:h.slice(0,i), arg=i<0?'':h.slice(i+1);
  switch(name){
    case 'event': return {tab:'events',html:viewEvent(+arg)};
    case 'map':
      if(arg){ if(S.mapHash!==h){ S.mapHash=h; focusVenueFromHash(+arg); } } else S.mapHash=null;
      return {tab:'map',html:viewMap(),map:true};
    case 'club': return {tab:'map',html:viewClub(+arg)};
    case 'artists': return {tab:'home',html:viewArtists()};
    case 'u': return {tab:'home',html:viewProfile(arg)};
    case 'connect': return {tab:'connect',html:viewConnect()};
    case 'me': return {tab:'me',html:viewMe()};
    case 'login': return {tab:'me',html:viewLogin()};
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
  document.getElementById('tabs').innerHTML=['home','events','map','connect','me'].map(function(k){
    return '<a href="#'+k+'"'+(r.tab===k?' aria-current="page"':'')+'>'+ICONS[k]+'<span>'+t('nav_'+k)+'</span></a>'; }).join('');
  view.innerHTML=r.html+'<footer>'+t('footer')+'</footer>';
  if(r.map) mountMap();
  if(scroll) window.scrollTo(0,0);
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
  if(act==='lang'){ S.lang=id; try{ localStorage.setItem('rs-lang',id); }catch(e){} render(false); }
  else if(act==='genre'){ S.genre=id; render(false); }
  else if(act==='type'){ S.type=id; render(false); }
  else if(act==='share'){ var se=evt(+id), sv2=se&&venue(se.v), url=location.href.split('#')[0]+'#event-'+id, txt=se?se.title+' · '+(sv2?sv2.name:''):'';
    if(navigator.share) navigator.share({title:txt,text:txt,url:url}).catch(function(){});
    else if(navigator.clipboard) navigator.clipboard.writeText(url).then(function(){ toast(t('copied')); },function(){ toast(url); });
    else toast(url); }
  else if(act==='homecity'){ S.homeCity=id; render(false); }
  else if(act==='onlyev'){ S.onlyEvents=!S.onlyEvents; render(false); }
  else if(act==='go'){ if(S.user) buzz(); toggleRow('attendance',+id,S.going); if(S.user) S.attRows=S.attRows.filter(function(a){ return !(a.event_id===+id&&a.profile_id===S.user.id); }).concat(has(S.going,+id)?[{event_id:+id,profile_id:S.user.id}]:[]); }
  else if(act==='follow'){ if(needLogin()) return; buzz(); var fp=followsP(id), hk=el.getAttribute('data-h');
    var pq=fp?data(sb.from('follows').delete().eq('follower',S.user.id).eq('artist',id)):data(sb.from('follows').insert({follower:S.user.id,artist:id}));
    if(fp) S.follow=S.follow.filter(function(x){ return x.id!==id; }); else { var cp=cache.profile[String(hk).toLowerCase()]; S.follow.push({id:id,handle:hk,display_name:cp&&cp.display_name||hk,verified:cp&&cp.verified,role:cp&&cp.role}); }
    render(false); pq.catch(function(err){ loadMine().then(function(){ render(false); }); fail(err); }); }
  else if(act==='vfollow'){ if(needLogin()) return; buzz(); var vid2=+id, on2=has(S.vfollow,vid2);
    var vq=on2?data(sb.from('venue_follows').delete().eq('profile_id',S.user.id).eq('venue_id',vid2)):data(sb.from('venue_follows').insert({profile_id:S.user.id,venue_id:vid2}));
    if(on2) S.vfollow.splice(S.vfollow.indexOf(vid2),1); else S.vfollow.push(vid2);
    render(false); vq.catch(function(err){ loadMine().then(function(){ render(false); }); fail(err); }); }
  else if(act==='loginhere'){ try{ sessionStorage.setItem('rs-after',location.hash); }catch(e){} }
  else if(act==='save'){ if(S.user) buzz(); toggleRow('bookmarks',+id,S.saved); }
  else if(act==='authtab'){ S.authTab=id; S.authErr=''; S.authMsg=''; render(false); }
  else if(act==='forgot'){
    var mail=(document.getElementById('a-mail')||{}).value;
    if(!mail){ document.getElementById('auth-err').textContent=t('email')+'?'; return; }
    sb.auth.resetPasswordForEmail(mail,{redirectTo:location.origin+location.pathname+'#me'}).then(function(){ S.authMsg=t('reset_sent'); render(false); });
  }
  else if(act==='logout'){ sb.auth.signOut().then(function(){ location.hash='#home'; }); }
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
  else if(act==='adm-publish'){ adminAct(data(sb.from('events').update({status:'published'}).eq('id',+id)).then(function(){ return loadBase(); })); }
  else if(act==='adm-cancel'){ adminAct(data(sb.from('events').update({status:'cancelled'}).eq('id',+id))); }
  else if(act==='adm-report'){ adminAct(data(sb.from('reports').update({status:'approved'}).eq('id',+id))); }
});
document.addEventListener('change',function(ev){
  var sel=ev.target.getAttribute&&ev.target.getAttribute('data-sel');
  if(sel){ S[sel]=ev.target.value; render(false); }
});
document.addEventListener('input',function(ev){
  if(ev.target.id==='f-q'){ S.q=ev.target.value; var l=document.getElementById('evlist'); if(l) l.innerHTML=eventsListHTML(); }
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
      sb.auth.signUp({email:email,password:pw,options:{data:{display_name:name},emailRedirectTo:location.origin+location.pathname+'#me'}}).then(function(r){
        busy(false);
        if(r.error){ errEl.textContent=r.error.message||t('err_generic'); return; }
        if(!r.data.session){ S.authMsg=t('signup_done'); S.authTab='login'; render(false); }
      });
    } else {
      busy(true);
      sb.auth.signInWithPassword({email:email,password:pw}).then(function(r){ busy(false); if(r.error){ errEl.textContent=t('err_login'); } });
    }
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
    var rv=+f.getAttribute('data-v'), rid=f.getAttribute('data-rid'), rerr=document.getElementById('rev-err');
    function num(n){ var x=fd.get(n); return x?+x:null; }
    var row={stars:num('r-stars'),sound:num('r-sound'),crowd:num('r-crowd'),door:num('r-door'),safety:num('r-safety'),body:String(fd.get('body')||'').trim()||null};
    if(!row.stars){ rerr.textContent=t('rev_need_star'); return; }
    busy(true);
    var q=rid?sb.from('reviews').update(Object.assign(row,{updated_at:new Date().toISOString()})).eq('id',+rid):sb.from('reviews').insert(Object.assign(row,{venue_id:rv,author:S.user.id}));
    data(q).then(function(){ toast(t('rev_saved')); delete cache.reviews[rv]; return loadRatings(); }).then(function(){ render(false); })
      .catch(function(err){ busy(false); fail(err); });
  } else if(kind==='report'){
    if(needLogin()) return;
    var row={reporter:S.user.id,reason:String(fd.get('reason')),details:String(fd.get('text')||'').trim()||null};
    if(f.getAttribute('data-kind')==='event') row.target_event=+f.getAttribute('data-id'); else row.target_profile=f.getAttribute('data-id');
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
        return loadBase().then(function(){ location.hash=row.status==='published'?'#event-'+row.id:'#me'; });
      }).catch(function(err){ busy(false); fail(err); });
  }
});

/* ---------- Start ---------- */
try{ var savedLang=localStorage.getItem('rs-lang'); if(savedLang==='de'||savedLang==='en') S.lang=savedLang; }catch(e){}
try{ S.lastSeen=localStorage.getItem('rs-seen'); localStorage.setItem('rs-seen',new Date().toISOString()); }catch(e){}
setInterval(function(){ var els=document.querySelectorAll('[data-cd]'); for(var i=0;i<els.length;i++){ var ce=evt(+els[i].getAttribute('data-cd')); if(ce) els[i].textContent=cdText(ce); } },30000);
window.addEventListener('hashchange',function(){ render(true); });

render(false);
var first=true;
sb.auth.onAuthStateChange(function(evName,session){
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
