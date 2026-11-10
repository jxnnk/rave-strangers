/* Rave Strangers – web app (real data via Supabase).
   Plain JavaScript, no build step. Hash routing: #events, #event-<id>, #map, #map-<venueId>, #club-<id>,
   #artists, #u-<handle>, #connect, #me, #login, #new-event, #admin. */
(function(){
'use strict';

var SB_URL='https://wnmxloykrnbrpvzxhnsb.supabase.co';
var SB_KEY='sb_publishable_4vHWXBP7d04RUXs7lOQ9nA_yys9gxdN';   /* publishable key: safe in the browser, protected by Row Level Security */
var sb=window.supabase.createClient(SB_URL,SB_KEY);
var GEO=window.GEO;

/* ---------- Texts ---------- */
var T={
  de:{
    nav_events:'Events',nav_map:'Karte',nav_artists:'Artists',nav_connect:'Connect',nav_me:'Profil',
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
    go:'Ich gehe hin',going:'Du gehst hin',save_ev:'Merken',saved_ev:'Gemerkt',gcal:'In Google Kalender',tickets:'Tickets & Infos',show_map:'Auf der Karte zeigen',
    nophone_t:'Foto- und Videoverbot',nophone_d:'Der Veranstalter nennt ein Foto- und Videoverbot. Das Handy bleibt in der Tasche, Connect davor und danach.',
    source_t:'Quelle',source_note:'Bitte Zeit, Line-up und Preis beim Veranstalter prüfen.',report_ev:'Falsche Angaben melden',
    aware_t:'Awareness & Sicherheit',aware_d:'Wenn es dir oder anderen nicht gut geht: Sprich das Awareness-Team, die Security oder das Barpersonal an. Im Notfall 112 anrufen.',aware_team:'Awareness vor Ort: {x}',
    pending:'In Prüfung',no_event:'Dieses Event gibt es nicht (mehr).',
    rules_t:'Regeln & Infos',r_phone:'Handy & Fotos',r_door:'Einlass',r_age:'Alter',r_access:'Barrierefreiheit',r_aware:'Awareness',not_set:'Noch nicht vom Club hinterlegt',photo_ban:'Fotoverbot, Handykamera wird am Einlass abgeklebt',
    upcoming:'Kommende Events',open_club:'Club-Seite',no_club:'Diesen Club gibt es nicht.',
    map_title:'Karte',map_sub:'Alle Clubs und Events auf einen Blick. Ziehen zum Verschieben, Mausrad oder Plus und Minus zum Zoomen.',
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
    nav_events:'Events',nav_map:'Map',nav_artists:'Artists',nav_connect:'Connect',nav_me:'Profile',
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
    go:"I'm going",going:"You're going",save_ev:'Save',saved_ev:'Saved',gcal:'Add to Google Calendar',tickets:'Tickets & info',show_map:'Show on map',
    nophone_t:'No photos or video',nophone_d:'The organiser states a no-photo, no-video rule. Phones stay in your pocket. Connect before and after.',
    source_t:'Source',source_note:'Please check time, line-up and price with the organiser.',report_ev:'Report wrong details',
    aware_t:'Awareness & safety',aware_d:'If you or someone else is not okay: talk to the awareness team, security or bar staff. In an emergency call 112.',aware_team:'Awareness on site: {x}',
    pending:'Under review',no_event:'This event does not exist (any more).',
    rules_t:'Rules & info',r_phone:'Phones & photos',r_door:'Door',r_age:'Age',r_access:'Accessibility',r_aware:'Awareness',not_set:'Not provided by the club yet',photo_ban:'No photos, phone cameras get taped at the door',
    upcoming:'Upcoming events',open_club:'Club page',no_club:'This club does not exist.',
    map_title:'Map',map_sub:'All clubs and events at a glance. Drag to move, mouse wheel or plus and minus to zoom.',
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
  q:'',city:'',genre:'',when:'all',type:'',onlyEvents:false,
  map:null,mapSel:null,mapHash:null,
  ready:false,loadErr:false,
  user:null,me:null,going:[],saved:[],counts:{},verif:null,
  authTab:'login',authMsg:'',authErr:''
};
var cache={att:{},profile:{},artists:null,connect:null,subs:null,admin:null};

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
function proj(lon,lat){ var l=lon*Math.PI/180,p=lat*Math.PI/180; return [GEO.tx+GEO.k*l,GEO.ty-GEO.k*Math.log(Math.tan(Math.PI/4+p/2))]; }
CITIES.forEach(function(c){ var p=proj(c.lon,c.lat); c.x=p[0]; c.y=p[1]; });
var toastTimer;
function toast(msg){ var el=document.getElementById('toast'); el.textContent=msg; el.className='show'; clearTimeout(toastTimer); toastTimer=setTimeout(function(){ el.className=''; },2600); }
function data(p){ return p.then(function(r){ if(r.error) throw r.error; return r.data; }); }
function fail(err){ if(window.console) console.error(err); toast(t('err_generic')); }
function needLogin(){ if(S.user) return false; toast(t('login_need')); location.hash='#login'; return true; }
function emptyBox(txt){ return '<div class="empty" style="margin-top:0">'+txt+'</div>'; }
function loadingBox(){ return '<p class="sub" aria-busy="true">'+t('loading')+'</p>'; }

/* ---------- Data loading ---------- */
function mapEvent(r){
  var p=berlinParts(new Date(r.starts_at)), pe=r.ends_at?berlinParts(new Date(r.ends_at)):null;
  var lu=(r.event_lineup||[]).slice().sort(function(a,b){ return a.position-b.position; }).map(function(x){ return x.name; });
  return {id:r.id,title:r.title,v:r.venue_id,date:p.date,time:r.time_known?p.time:null,off:offOf(p.date),endDate:pe?pe.date:null,endOff:pe?Math.max(offOf(pe.date),offOf(p.date)):offOf(p.date),genres:r.genres||[],
    lineup:lu.length?lu:null,more:r.lineup_more||0,nophone:r.no_phone,src:safeUrl(r.source_url),ticket:safeUrl(r.ticket_url),
    type:r.kind==='club'?'club':'festival',status:r.status,createdBy:r.created_by};
}
function mapVenue(r){ var p=proj(r.lon,r.lat); return {id:r.id,name:r.name,city:r.city,addr:r.address,lat:r.lat,lon:r.lon,approx:r.approx,kind:r.kind||'club',rules:r.rules||{},x:p[0],y:p[1]}; }
function loadBase(){
  var since=berlinToISO(isoOf(-14),'00:00');   /* a little back, so festivals that are still running are included */
  return Promise.all([
    data(sb.from('venues').select('id,name,city,address,lat,lon,approx,kind,rules')),
    data(sb.from('events').select('id,venue_id,title,starts_at,ends_at,time_known,kind,genres,no_phone,ticket_url,source_url,lineup_more,status,created_by,event_lineup(position,name)').eq('status','published').gte('starts_at',since).order('starts_at',{ascending:true}))
  ]).then(function(res){
    VENUES=res[0].map(mapVenue);
    EVENTS=res[1].map(mapEvent).filter(function(e){ return venue(e.v)&&e.endOff>=0; });
    S.ready=true; S.loadErr=false;
  }).catch(function(err){ if(window.console) console.error(err); S.loadErr=true; });
}
function loadMine(){
  if(!S.user){ S.me=null; S.going=[]; S.saved=[]; S.counts={}; S.verif=null; return Promise.resolve(); }
  var uid=S.user.id;
  return Promise.all([
    data(sb.from('profiles').select('*').eq('id',uid).maybeSingle()),
    data(sb.from('attendance').select('event_id,profile_id')),
    data(sb.from('bookmarks').select('event_id').eq('profile_id',uid)),
    data(sb.from('artist_verifications').select('id,status,created_at').eq('profile_id',uid).order('created_at',{ascending:false}).limit(1))
  ]).then(function(r){
    S.me=r[0];
    S.counts={}; S.going=[];
    r[1].forEach(function(a){ S.counts[a.event_id]=(S.counts[a.event_id]||0)+1; if(a.profile_id===uid) S.going.push(a.event_id); });
    S.saved=r[2].map(function(b){ return b.event_id; });
    S.verif=r[3][0]||null;
  }).catch(fail);
}
function resetCaches(){ cache={att:{},profile:{},artists:null,connect:null,subs:null,admin:null}; }

/* ---------- Shared pieces ---------- */
function whenOptions(){ return [['all','when_all'],['week','when_week'],['month','when_month']].map(function(w){ return '<option value="'+w[0]+'"'+(S.when===w[0]?' selected':'')+'>'+t(w[1])+'</option>'; }).join(''); }
function genreChips(){
  return '<button type="button" class="chip" data-act="genre" data-id="" aria-pressed="'+(S.genre==='')+'">'+t('genre_all')+'</button>'+
    GENRES.map(function(g){ return '<button type="button" class="chip" data-act="genre" data-id="'+esc(g)+'" aria-pressed="'+(S.genre===g)+'">'+esc(g)+'</button>'; }).join('');
}
function typeChips(){ return [['','type_all'],['club','type_club'],['festival','type_fest']].map(function(x){ return '<button type="button" class="chip" data-act="type" data-id="'+x[0]+'" aria-pressed="'+(S.type===x[0])+'">'+t(x[1])+'</button>'; }).join(''); }
function eventCard(e){
  var d=dayOf(e.off), v=venue(e.v), n=S.counts[e.id]||0;
  var tag=(e.status==='pending'?' <span class="tag hot">'+t('pending')+'</span>':'')+(e.type==='festival'?' <span class="tag">'+t('fest_tag')+'</span>':'')+(has(S.saved,e.id)?' <span class="stars" title="'+t('saved_ev')+'">★</span>':'');
  return '<a class="ev" href="#event-'+e.id+'"><div class="date"><b>'+d.getDate()+'</b><span>'+esc(fmtMonth(d))+'</span></div>'+
    '<div><h3>'+esc(e.title)+tag+'</h3><p class="meta">'+esc(v?v.name:'')+(v?' · '+esc(v.city):'')+(e.time?' · '+esc(e.time):'')+'</p><div class="chips">'+genreTags(e.genres)+'</div></div>'+
    '<div class="side">'+(n?'<span>'+(has(S.going,e.id)?'✓ ':'')+t('going_n',{n:n})+'</span>':'')+'</div></a>';
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
function awareHTML(v){ var a=v&&v.rules&&v.rules.aware; return '<div class="nophone" style="margin-top:0"><div>'+t('aware_d')+(a?'<br><b>'+esc(t('aware_team',{x:a}))+'</b>':'')+'</div></div>'; }
function reportForm(kind,id){
  var reasons=['rr1','rr2','rr3','rr4','rr5'].map(function(k){ return '<option>'+t(k)+'</option>'; }).join('');
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
  if(!S.user) who=emptyBox('<a class="link" href="#login">'+t('login_to_see')+'</a>');
  else if(cache.att[e.id]===undefined){ who=loadingBox(); loadAttendees(e.id); }
  else who=cache.att[e.id].length?cache.att[e.id].map(function(p){ return '<a class="person" href="#u-'+esc(p.handle)+'">'+av(p.display_name)+'<div class="grow"><strong>'+esc(p.display_name)+(p.verified?VB:'')+'</strong><p>@'+esc(p.handle)+(p.city?' · '+esc(p.city):'')+'</p></div></a>'; }).join(''):emptyBox(t('nobody'));
  var tix=e.ticket||e.src;
  return '<a class="back" href="#events">← '+t('back')+'</a><h1>'+esc(e.title)+'</h1>'+
    '<div class="chips" style="margin-top:12px">'+genreTags(e.genres)+(e.type==='festival'?' <span class="tag hot">'+t('fest_tag')+'</span>':'')+'</div>'+
    '<dl class="facts"><div><dt>'+t('date')+'</dt><dd>'+esc(fmtLong(d))+(e.endDate&&e.endDate!==e.date?' – '+esc(fmtLong(dayOf(e.endOff))):'')+'</dd></div><div><dt>'+t('time')+'</dt><dd>'+(e.time?esc(e.time):t('tba'))+'</dd></div>'+
    '<div><dt>'+t('venue')+'</dt><dd><a href="#club-'+v.id+'">'+esc(v.name)+'</a>, '+esc(v.city)+'</dd></div></dl>'+
    (e.nophone?'<div class="nophone"><div><b>'+t('nophone_t')+'</b><br>'+t('nophone_d')+'</div></div>':'')+
    '<div class="row" style="margin-top:20px"><button type="button" class="btn '+(go?'on':'primary')+'" data-act="go" data-id="'+e.id+'" aria-pressed="'+go+'">'+(go?'✓ '+t('going'):t('go'))+'</button>'+
    '<button type="button" class="btn'+(sv?' on':'')+'" data-act="save" data-id="'+e.id+'" aria-pressed="'+sv+'">'+(sv?'★ '+t('saved_ev'):'☆ '+t('save_ev'))+'</button></div>'+
    '<div class="row" style="margin-top:10px"><a class="btn" href="'+esc(gcalUrl(e))+'" target="_blank" rel="noopener">'+t('gcal')+' ↗</a>'+
    (tix?'<a class="btn" href="'+esc(tix)+'" target="_blank" rel="noopener">'+t('tickets')+' ↗</a>':'')+'<a class="btn" href="#map-'+v.id+'">'+t('show_map')+'</a></div>'+
    (n?'<p class="sub">'+t('going_n',{n:n})+'</p>':'')+
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

/* ---------- Views: club ---------- */
function viewClub(id){
  var v=venue(id);
  if(!v) return '<a class="back" href="#map">← '+t('back')+'</a><div class="empty">'+t('no_club')+'</div>';
  var evs=sortedEvents().filter(function(e){ return e.v===id&&upcoming(e); });
  var facts=RULE_KEYS.map(function(k){ var x=v.rules[k]; return '<div><dt>'+t(RULE_LABEL[k])+'</dt><dd'+(x?'':' style="color:var(--muted);font-weight:400"')+'>'+(x?esc(ruleVal(x)):t('not_set'))+'</dd></div>'; }).join('');
  return '<a class="back" href="#map-'+v.id+'">← '+t('back')+'</a><h1>'+esc(v.name)+'</h1><p class="sub">'+esc(v.addr||v.city)+(v.approx?' · '+t('approx'):'')+'</p>'+(v.kind!=='club'?'<p class="sub"><span class="tag">'+t('kind_'+v.kind)+'</span> '+t('kind_note')+'</p>':'')+
    '<div class="row" style="margin-top:16px"><a class="btn" href="#map-'+v.id+'">'+t('show_map')+'</a></div>'+
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
  var mine=S.user&&S.user.id===p.id;
  var evs=(p.goes||[]).map(evt).filter(Boolean).sort(function(a,b){ return a.off-b.off; });
  return back+'<div class="hero">'+av(p.display_name,84)+'<div><h1>'+esc(p.display_name)+(p.verified?VB.replace('class="vb"','class="vb" style="width:26px;height:26px"'):'')+'</h1>'+
    '<p class="sub" style="margin-top:6px">@'+esc(p.handle)+(p.city?' · '+esc(p.city):'')+(p.verified?' · '+t('verified'):'')+'</p></div></div>'+
    (p.bio?'<p class="sub" style="margin-top:16px">'+esc(p.bio)+'</p>':'')+socialsHTML(p.socials)+
    (evs.length?'<div class="sec"><h2>'+t('upcoming_going')+'</h2><div class="list" style="margin-top:0">'+evs.map(eventCard).join('')+'</div></div>':'')+
    (S.user&&!mine?'<div class="sec"><div class="row"><button type="button" class="btn small" data-act="block" data-id="'+esc(p.id)+'">'+t('block')+'</button></div>'+reportForm('profile',p.id)+'<p class="sub">'+t('safety_note')+'</p></div>':'')+
    (mine?'<div class="row" style="margin-top:20px"><a class="btn" href="#me">'+t('me_title')+'</a></div>':'');
}

/* ---------- Views: connect ---------- */
function viewConnect(){
  var head='<h1>'+t('connect_title')+'</h1><p class="sub">'+t('connect_sub')+'</p>';
  var soon='<div class="card" style="margin-top:24px"><p>'+t('chat_soon')+'</p></div>';
  if(!S.user) return head+'<div class="empty">'+t('connect_login')+'<div class="row" style="justify-content:center;margin-top:12px"><a class="btn primary" href="#login">'+t('to_login')+'</a></div></div>'+soon;
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
    '<form class="form" data-form="'+(login?'login':'signup')+'" novalidate>'+
    (login?'':'<div class="field"><label for="a-name">'+t('display_name')+'</label><input id="a-name" name="name" type="text" maxlength="60" autocomplete="nickname" required></div>')+
    '<div class="field"><label for="a-mail">'+t('email')+'</label><input id="a-mail" name="email" type="email" autocomplete="email" required></div>'+
    '<div class="field"><label for="a-pw">'+t('password')+'</label><input id="a-pw" name="password" type="password" minlength="8" autocomplete="'+(login?'current-password':'new-password')+'" required>'+(login?'':'<p class="sub" style="margin:4px 0 0;font-size:13px">'+t('pw_hint')+'</p>')+'</div>'+
    (login?'':'<label class="row" style="gap:10px"><input type="checkbox" name="age" required style="width:20px;height:20px;accent-color:#e4262e"> '+t('age_ok')+'</label>')+
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
  if(!S.user) return '<a class="back" href="#events">← '+t('back')+'</a><h1>'+t('new_title')+'</h1><div class="empty">'+t('login_need')+'<div class="row" style="justify-content:center;margin-top:12px"><a class="btn primary" href="#login">'+t('to_login')+'</a></div></div>';
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

/* ---------- Map (shared with the prototype) ---------- */
var CL=[];   /* cluster centres of the last draw */
function mapEvents(){ return EVENTS.filter(function(e){ return inWindow(e) && (!S.genre || e.genres.indexOf(S.genre)>-1); }).sort(function(a,b){ return a.off-b.off; }); }
function venueEvents(id,list){ return (list||mapEvents()).filter(function(e){ return e.v===id; }); }
function evCountLabel(n){ return n===1?t('ev_one'):t('ev_many',{n:n}); }

function panelHTML(){
  var list=mapEvents();
  var v=S.mapSel?venue(S.mapSel):null;
  if(!v){
    var vs={}; list.forEach(function(e){ vs[e.v]=1; });
    return '<p class="sub" style="margin:0">'+t('pick_marker')+'</p><p class="sub">'+t('summary_map',{v:Object.keys(vs).length,e:list.length})+'</p>';
  }
  var evs=venueEvents(v.id,list);
  var rows=evs.map(function(e){ var d=dayOf(e.off);
    return '<a class="evrow" href="#event-'+e.id+'"><b>'+d.getDate()+'. '+esc(fmtMonth(d))+'</b><div><strong>'+esc(e.title)+'</strong><p>'+(e.time?esc(e.time):t('tba'))+' · '+esc(e.genres.join(', '))+'</p></div></a>'; }).join('');
  return '<h2><a href="#club-'+v.id+'">'+esc(v.name)+'</a></h2>'+
    '<p class="addr">'+esc(v.addr||v.city)+'</p>'+(v.kind!=='club'?'<p class="addr"><span class="tag">'+t('kind_'+v.kind)+'</span></p>':'')+
    (v.approx?'<p class="addr">'+t('approx')+'</p>':'')+
    '<p class="addr" style="color:var(--text)">'+evCountLabel(evs.length)+'</p>'+
    (rows||'<p class="sub">'+t('no_ev_here')+'</p>')+
    '<div class="row" style="margin-top:12px"><a class="btn small" href="#club-'+v.id+'">'+t('open_club')+' →</a></div>';
}
function venueListHTML(){
  var list=mapEvents();
  var vs=VENUES.slice().sort(function(a,b){ return a.city.localeCompare(b.city,'de')||a.name.localeCompare(b.name,'de'); });
  return vs.map(function(v){ var n=venueEvents(v.id,list).length;
    if(v.kind!=='club'&&!n) return '';
    return '<button type="button" class="person" data-act="mapvenue" data-id="'+v.id+'"><div class="grow"><strong>'+esc(v.name)+'</strong><p>'+esc(v.city)+' · '+(n?evCountLabel(n):t('zero'))+'</p></div></button>'; }).join('');
}
function viewMap(){
  return '<h1>'+t('map_title')+'</h1><p class="sub">'+t('map_sub')+'</p>'+
    '<div class="filters two">'+
      '<div class="field"><label for="m-when">'+t('when')+'</label><select id="m-when" data-sel="when">'+whenOptions()+'</select></div>'+
      '<div class="field" style="align-self:end"><button type="button" class="chip" data-act="onlyev" aria-pressed="'+S.onlyEvents+'" style="min-height:44px">'+t('only_events')+'</button></div>'+
    '</div>'+
    '<div class="chips" style="margin-top:12px">'+genreChips()+'</div>'+
    '<div class="mapgrid">'+
      '<div class="mapbox" id="mapbox">'+
        '<svg id="mapsvg" viewBox="0 0 '+GEO.W+' '+GEO.H+'" role="img" aria-label="'+esc(t('map_title'))+'">'+
          '<rect x="-6000" y="-6000" width="12000" height="12000" fill="#08080a"/>'+
          '<g class="land nb"><path d="'+GEO.nb+'"/></g>'+
          '<g class="land de"><path d="'+GEO.de+'"/></g>'+
          '<g id="mapdyn"></g>'+
        '</svg>'+
        '<div class="mapctl">'+
          '<button type="button" data-act="zin" aria-label="'+esc(t('zoom_in'))+'">+</button>'+
          '<button type="button" data-act="zout" aria-label="'+esc(t('zoom_out'))+'">−</button>'+
          '<button type="button" data-act="zfit" aria-label="'+esc(t('zoom_reset'))+'"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button>'+
        '</div>'+
        '<div class="maplegend"><span><i></i>'+t('leg_ev')+'</span><span><i class="off"></i>'+t('leg_none')+'</span></div>'+
      '</div>'+
      '<aside class="mappanel" id="mappanel" aria-live="polite">'+panelHTML()+'</aside>'+
    '</div>'+
    '<div class="sec"><h2>'+t('venues_t')+'</h2><div class="people" id="venuelist">'+venueListHTML()+'</div></div>';
}

function mapEl(){ return document.getElementById('mapsvg'); }
function mapSize(){ var r=mapEl().getBoundingClientRect(); return {cw:Math.max(r.width,1),ch:Math.max(r.height,1),left:r.left,top:r.top}; }
function fitView(){ var z=mapSize(); return {cx:GEO.W/2,cy:GEO.H/2,w:Math.max(GEO.W,GEO.H*z.cw/z.ch)}; }
function clampView(m){
  var minW=GEO.W/90, maxW=Math.max(fitView().w*1.25,GEO.W);
  m.w=Math.min(maxW,Math.max(minW,m.w));
  m.cx=Math.min(GEO.W+80,Math.max(-80,m.cx)); m.cy=Math.min(GEO.H+80,Math.max(-80,m.cy));
  return m;
}
function viewBoxOf(){ var z=mapSize(), h=S.map.w*z.ch/z.cw; return [S.map.cx-S.map.w/2,S.map.cy-h/2,S.map.w,h]; }

function drawMap(){
  var svg=mapEl(); if(!svg) return;
  if(!S.map) S.map=fitView();
  var vb=viewBoxOf(), z=mapSize(), s=S.map.w/z.cw;
  svg.setAttribute('viewBox',vb[0]+' '+vb[1]+' '+vb[2]+' '+vb[3]);
  var list=mapEvents(), out='';
  /* city labels */
  CITIES.forEach(function(c){
    out+='<circle class="cdot" cx="'+c.x+'" cy="'+c.y+'" r="'+(2.2*s)+'"/>'+
         '<text class="clabel" x="'+(c.x+6*s)+'" y="'+(c.y-5*s)+'" font-size="'+(11*s)+'" stroke-width="'+(3*s)+'">'+esc(c.name)+'</text>';
  });
  /* clusters */
  var items=[];
  VENUES.forEach(function(v){
    var n=venueEvents(v.id,list).length;
    if((S.onlyEvents||v.kind!=='club') && !n) return;   /* festival grounds and open airs only show up around their events */
    items.push({v:v,n:n,px:(v.x-vb[0])/s,py:(v.y-vb[1])/s});
  });
  items.sort(function(a,b){ return b.n-a.n; });
  var cls=[];
  items.forEach(function(it){
    var c=null;
    for(var i=0;i<cls.length;i++){ var dx=cls[i].px-it.px, dy=cls[i].py-it.py; if(dx*dx+dy*dy<20*20){ c=cls[i]; break; } }
    if(c){ c.items.push(it); c.n+=it.n; } else cls.push({items:[it],n:it.n,px:it.px,py:it.py,x:it.v.x,y:it.v.y});
  });
  cls.forEach(function(c){ if(c.items.length>1){ var sx=0,sy=0; c.items.forEach(function(i){ sx+=i.v.x; sy+=i.v.y; }); c.x=sx/c.items.length; c.y=sy/c.items.length; } });
  cls.sort(function(a,b){ return (a.n>0)-(b.n>0); });
  CL=[];
  var showNames=S.map.w<GEO.W/14;
  cls.forEach(function(c){
    if(c.items.length>1){
      CL.push({x:c.x,y:c.y});
      var r=(15+Math.min(6,c.items.length))*s;
      var label=c.items.length;
      out+='<g class="cl'+(c.n?'':' off')+'" data-cluster="'+(CL.length-1)+'" tabindex="0" role="button" aria-label="'+esc(c.items.length+' · '+evCountLabel(c.n))+'" transform="translate('+c.x+' '+c.y+')">'+
        '<circle class="dot" r="'+r+'"/><text font-size="'+(13*s)+'" dy="'+(4.5*s)+'">'+label+'</text></g>';
    } else {
      var it=c.items[0], v=it.v, sel=S.mapSel===v.id;
      out+='<g class="mk'+(it.n?'':' off')+'" data-venue="'+v.id+'" tabindex="0" role="button" aria-label="'+esc(v.name+', '+v.city+', '+(it.n?evCountLabel(it.n):t('zero')))+'" transform="translate('+v.x+' '+v.y+')">'+
        '<title>'+esc(v.name)+'</title>'+
        (sel?'<circle class="ring" r="'+(15*s)+'"/>':'')+
        '<circle class="dot" r="'+((it.n?9:6)*s)+'"/>'+
        (it.n>1?'<text font-size="'+(10*s)+'" dy="'+(3.6*s)+'">'+it.n+'</text>':'')+
        (showNames?'<text class="vname" x="'+(13*s)+'" dy="'+(4*s)+'" font-size="'+(12*s)+'" stroke-width="'+(3.5*s)+'">'+esc(v.name)+'</text>':'')+
        '</g>';
    }
  });
  document.getElementById('mapdyn').innerHTML=out;
}
function setPanel(){
  var p=document.getElementById('mappanel'); if(p) p.innerHTML=panelHTML();
}
var animTok=0;
function animateTo(target){
  var from={cx:S.map.cx,cy:S.map.cy,w:S.map.w};
  var to=clampView({cx:target.cx!=null?target.cx:from.cx,cy:target.cy!=null?target.cy:from.cy,w:target.w!=null?target.w:from.w});
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var tok=++animTok;
  if(reduce){ S.map=to; drawMap(); return; }
  var t0=null, dur=240;
  function step(ts){
    if(tok!==animTok||!mapEl()) return;
    if(t0===null) t0=ts;
    var k=Math.min(1,(ts-t0)/dur), e=1-Math.pow(1-k,3);
    S.map={cx:from.cx+(to.cx-from.cx)*e,cy:from.cy+(to.cy-from.cy)*e,w:from.w*Math.pow(to.w/from.w,e)};
    drawMap();
    if(k<1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
function zoomAt(clientX,clientY,f){
  var z=mapSize(), vb=viewBoxOf(), s=S.map.w/z.cw;
  var px=clientX-z.left, py=clientY-z.top;
  var sx=vb[0]+px*s, sy=vb[1]+py*s;
  var w=Math.min(Math.max(fitView().w*1.25,GEO.W),Math.max(GEO.W/90,S.map.w*f)), s2=w/z.cw, h=w*z.ch/z.cw;
  S.map=clampView({cx:sx-px*s2+w/2,cy:sy-py*s2+h/2,w:w});
  drawMap();
}
function selectVenue(id,center){
  S.mapSel=id; setPanel(); drawMap();
  var v=venue(id);
  if(center&&v){ animateTo({cx:v.x,cy:v.y,w:Math.min(S.map.w,GEO.W/45)}); }
  var p=document.getElementById('mappanel');
  if(p&&window.innerWidth<=860&&p.scrollIntoView){ p.scrollIntoView({block:'nearest',behavior:'smooth'}); }
}
function initMap(){
  var svg=mapEl(); if(!svg) return;
  var ptrs={}, moved=0, last=null;
  drawMap();
  svg.addEventListener('wheel',function(e){ e.preventDefault(); zoomAt(e.clientX,e.clientY,Math.exp(e.deltaY*0.0015)); },{passive:false});
  svg.addEventListener('dblclick',function(e){ zoomAt(e.clientX,e.clientY,0.5); });
  svg.addEventListener('pointerdown',function(e){
    if(e.button!==undefined&&e.button!==0&&e.pointerType==='mouse') return;
    ptrs[e.pointerId]={x:e.clientX,y:e.clientY}; moved=0; animTok++;
    svg.classList.add('drag');
    var n=Object.keys(ptrs).length;
    if(n===2){ var k=Object.keys(ptrs); last={d:Math.hypot(ptrs[k[0]].x-ptrs[k[1]].x,ptrs[k[0]].y-ptrs[k[1]].y)}; }
    function mv(ev){
      if(!ptrs[ev.pointerId]) return;
      var prev=ptrs[ev.pointerId], dx=ev.clientX-prev.x, dy=ev.clientY-prev.y;
      ptrs[ev.pointerId]={x:ev.clientX,y:ev.clientY};
      moved+=Math.abs(dx)+Math.abs(dy);
      var ks=Object.keys(ptrs);
      if(ks.length===1){
        var z=mapSize(), s=S.map.w/z.cw;
        S.map=clampView({cx:S.map.cx-dx*s,cy:S.map.cy-dy*s,w:S.map.w}); drawMap();
      } else if(ks.length===2&&last){
        var a=ptrs[ks[0]], b=ptrs[ks[1]], d=Math.hypot(a.x-b.x,a.y-b.y);
        if(last.d>0&&d>0) zoomAt((a.x+b.x)/2,(a.y+b.y)/2,last.d/d);
        last.d=d;
      }
    }
    function up(ev){
      delete ptrs[ev.pointerId];
      if(Object.keys(ptrs).length<2) last=null;
      if(!Object.keys(ptrs).length){
        svg.classList.remove('drag');
        window.removeEventListener('pointermove',mv); window.removeEventListener('pointerup',up); window.removeEventListener('pointercancel',up);
      }
    }
    window.addEventListener('pointermove',mv); window.addEventListener('pointerup',up); window.addEventListener('pointercancel',up);
  });
  svg.addEventListener('click',function(e){
    if(moved>6) return;
    var m=e.target.closest('[data-venue]'), c=e.target.closest('[data-cluster]');
    if(m){ selectVenue(+m.getAttribute('data-venue'),false); }
    else if(c){ var cc=CL[+c.getAttribute('data-cluster')]; if(cc) animateTo({cx:cc.x,cy:cc.y,w:S.map.w/2.6}); }
  });
  svg.addEventListener('keydown',function(e){
    if(e.key!=='Enter'&&e.key!==' ') return;
    var m=e.target.closest&&e.target.closest('[data-venue]'), c=e.target.closest&&e.target.closest('[data-cluster]');
    if(m){ e.preventDefault(); selectVenue(+m.getAttribute('data-venue'),false); }
    else if(c){ e.preventDefault(); var cc=CL[+c.getAttribute('data-cluster')]; if(cc) animateTo({cx:cc.x,cy:cc.y,w:S.map.w/2.6}); }
  });
}
function focusVenueFromHash(id){
  var v=venue(id); if(!v) return;
  S.mapSel=id;
  S.map={cx:v.x,cy:v.y,w:GEO.W/45};
}

/* ---------- Router ---------- */
var ICONS={
  events:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  map:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.5-6.2-6.5-11A6.5 6.5 0 0 1 18.5 10c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/></svg>',
  artists:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/></svg>',
  connect:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/></svg>',
  me:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>'
};
function route(){
  var h=decodeURIComponent((location.hash||'#events').slice(1));
  if(h==='new-event') return {tab:'events',html:viewNew()};
  var i=h.indexOf('-'), name=i<0?h:h.slice(0,i), arg=i<0?'':h.slice(i+1);
  switch(name){
    case 'event': return {tab:'events',html:viewEvent(+arg)};
    case 'map':
      if(arg){ if(S.mapHash!==h){ S.mapHash=h; focusVenueFromHash(+arg); } } else S.mapHash=null;
      return {tab:'map',html:viewMap(),map:true};
    case 'club': return {tab:'map',html:viewClub(+arg)};
    case 'artists': return {tab:'artists',html:viewArtists()};
    case 'u': return {tab:'artists',html:viewProfile(arg)};
    case 'connect': return {tab:'connect',html:viewConnect()};
    case 'me': return {tab:'me',html:viewMe()};
    case 'login': return {tab:'me',html:viewLogin()};
    case 'admin': return {tab:'me',html:viewAdmin()};
    default: return {tab:'events',html:viewEvents()};
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
  document.getElementById('tabs').innerHTML=['events','map','artists','connect','me'].map(function(k){
    return '<a href="#'+k+'"'+(r.tab===k?' aria-current="page"':'')+'>'+ICONS[k]+'<span>'+t('nav_'+k)+'</span></a>'; }).join('');
  view.innerHTML=r.html+'<footer>'+t('footer')+'</footer>';
  if(r.map) initMap();
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
  else if(act==='onlyev'){ S.onlyEvents=!S.onlyEvents; render(false); }
  else if(act==='go'){ toggleRow('attendance',+id,S.going); }
  else if(act==='save'){ toggleRow('bookmarks',+id,S.saved); }
  else if(act==='authtab'){ S.authTab=id; S.authErr=''; S.authMsg=''; render(false); }
  else if(act==='forgot'){
    var mail=(document.getElementById('a-mail')||{}).value;
    if(!mail){ document.getElementById('auth-err').textContent=t('email')+'?'; return; }
    sb.auth.resetPasswordForEmail(mail,{redirectTo:location.origin+location.pathname+'#me'}).then(function(){ S.authMsg=t('reset_sent'); render(false); });
  }
  else if(act==='logout'){ sb.auth.signOut().then(function(){ location.hash='#events'; }); }
  else if(act==='block'){
    if(needLogin()) return;
    data(sb.from('blocks').insert({blocker:S.user.id,blocked:id})).then(function(){ toast(t('blocked')); resetCaches(); location.hash='#events'; }).catch(fail);
  }
  else if(act==='reload'){ location.reload(); }
  else if(act==='zin'){ animateTo({w:S.map.w/1.8}); }
  else if(act==='zout'){ animateTo({w:S.map.w*1.8}); }
  else if(act==='zfit'){ S.mapSel=null; setPanel(); animateTo(fitView()); }
  else if(act==='mapvenue'){ selectVenue(+id,true); var b=document.getElementById('mapbox'); if(b&&b.scrollIntoView) b.scrollIntoView({block:'nearest',behavior:'smooth'}); }
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
    data(sb.from('events').insert({venue_id:vid,title:title,starts_at:berlinToISO(date,fd.get('time')||'22:00'),ends_at:(fd.get('end')&&fd.get('end')>date)?berlinToISO(fd.get('end'),'23:59'):null,time_known:!!fd.get('time'),kind:fd.get('kind')==='festival'?'festival':'club',genres:genres,no_phone:!!fd.get('nophone'),ticket_url:link,source_url:link}).select('id,status').single())
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
window.addEventListener('hashchange',function(){ render(true); });
window.addEventListener('resize',function(){ if(mapEl()) drawMap(); });
render(false);
var first=true;
sb.auth.onAuthStateChange(function(evName,session){
  var uid=session&&session.user?session.user.id:null, prev=S.user?S.user.id:null;
  S.user=session?session.user:null;
  if(uid===prev&&!first) return;
  first=false;
  resetCaches();
  /* supabase-js: do not call the client synchronously inside this callback */
  setTimeout(function(){ loadMine().then(function(){ if(S.user&&location.hash==='#login') location.hash='#me'; else render(false); }); },0);
});
loadBase().then(function(){ render(false); });
})();
