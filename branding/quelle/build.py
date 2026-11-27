import subprocess, os
from brand import *
def save(path, svg, png_w=None, png_h=None):
  open(path+'.svg','w').write(svg)
  args=['rsvg-convert']+(['-w',str(png_w)] if png_w else [])+(['-h',str(png_h)] if png_h else [])+[path+'.svg','-o',path+'.png']
  subprocess.run(args,check=True)
def png_only(path, svg, w=None):
  open('/tmp/_x.svg','w').write(svg); subprocess.run(['rsvg-convert']+(['-w',str(w)] if w else [])+['/tmp/_x.svg','-o',path],check=True)
O=__import__('os').path.join(__import__('os').path.dirname(__file__),'..')
# ---- Icons ----
for cw in ['primaer','hell','rot']:
  save(f'{O}/icon/icon-{cw}', icon_svg(cw), 1024)
for cw in ['mono-weiss','mono-schwarz']:
  save(f'{O}/icon/icon-{cw}-transparent', icon_svg(cw,bg=False), 1024)
save(f'{O}/icon/motiv-primaer-transparent', icon_svg('primaer',bg=False), 1024)
# ---- Wortmarke ----
for cw in ['primaer','hell','rot']:
  save(f'{O}/wortmarke/wortmarke-{cw}', wordmark_svg(cw), 2400)
save(f'{O}/wortmarke/wortmarke-fuer-dunkel-transparent', wordmark_svg('primaer',bg=False), 2400)
save(f'{O}/wortmarke/wortmarke-fuer-hell-transparent', wordmark_svg('hell',bg=False), 2400)
for cw in ['mono-weiss','mono-schwarz']:
  save(f'{O}/wortmarke/wortmarke-{cw}-transparent', wordmark_svg(cw,bg=False), 2400)
# ---- Lockups ----
def lockup_h(cw, tile):
  c=CW[cw]; wm=wordmark(c); T=600; gap=110; M=120
  g,ww,wh=place(wm, 0,0, h=T*0.78)
  W=M+T+gap+ww+M; H=T+2*M
  g,_,_=place(wm, M+T+gap, M+(T-wh)/2, h=T*0.78)
  return doc(W,H, icon_inline(CW['primaer'],M,M,T,tile=tile)+g, c['bg'])
def lockup_v(cw, tile):
  c=CW[cw]; wm=wordmark(c); T=620; M=140; gap=110
  _,ww,wh=place(wm,0,0,w=1200)
  W=max(ww,T)+2*M; H=M+T+gap+wh+M
  g,_,_=place(wm,(W-ww)/2,M+T+gap,w=1200)
  return doc(W,H, icon_inline(CW['primaer'],(W-T)/2,M,T,tile=tile)+g, c['bg'])
tiles={'primaer':SURF,'hell':BG,'rot':BG}
for cw in ['primaer','hell','rot']:
  t=tiles[cw]
  # bei Hell/Rot: Kachel dunkel mit Primärfarben-Motiv wirkt wie das echte App-Icon
  save(f'{O}/lockup/lockup-horizontal-{cw}', lockup_h(cw,t), 2400)
  save(f'{O}/lockup/lockup-gestapelt-{cw}', lockup_v(cw,t), 1600)
# ---- Anwendungen (PNG; Texte in Space Grotesk) ----
P=CW['primaer']
def txt(x,y,s,t,col=BONE,w=500,anchor='start',ls=0):
  return f'<text x="{x}" y="{y}" font-family="Space Grotesk" font-weight="{w}" font-size="{s}" fill="{col}" text-anchor="{anchor}" letter-spacing="{ls}">{t}</text>'
# Splash iPhone 1290x2796
W,H=1290,2796; T=520
g,ww,wh=place(wordmark(P),0,0,w=960)
body=icon_inline(P,(W-T)/2,H/2-T-80,T)+place(wordmark(P),(W-ww)/2,H/2+60,w=960)[0]
png_only(f'{O}/anwendungen/splash-iphone-1290x2796.png', doc(W,H,body,BG))
save(f'{O}/anwendungen/splash-logo-transparent', icon_svg('primaer',bg=False,scale=0.95), 1152)
# Play-Store Feature-Grafik 1024x500
W,H=1024,500
g,ww,wh=place(wordmark(P),0,0,w=620)
body=place(wordmark(P),(W-ww)/2,110,w=620)[0]+txt(W/2,410,30,'NIE MEHR ALLEIN RAVEN.',BONE,700,'middle',2)
png_only(f'{O}/anwendungen/play-feature-1024x500.png', doc(W,H,body,BG))
# Link-Vorschau / OG 1200x630
W,H=1200,630
g,ww,wh=place(wordmark(P),0,0,w=760)
body=place(wordmark(P),90,110,w=760)[0]+txt(96,470,40,'Nie mehr allein raven.',BONE,700)+txt(96,525,30,'Finde deine Crew, nicht nur die Party.','#8B8881',500)
body+=icon_inline(P,W-90-200,H-90-200,200,tile=SURF)
png_only(f'{O}/anwendungen/link-vorschau-1200x630.png', doc(W,H,body,BG))
# Story 1080x1920
W,H=1080,1920
g,ww,wh=place(wordmark(P),0,0,w=900)
body=place(wordmark(P),(W-ww)/2,700,w=900)[0]+txt(W/2,1420,56,'NIE MEHR ALLEIN RAVEN.',BONE,700,'middle',2)+txt(W/2,1500,40,'Finde deine Crew, nicht nur die Party.','#8B8881',500,'middle')
body+=f'<rect x="{W/2-28}" y="1640" width="56" height="56" fill="{RED}"/>'
png_only(f'{O}/anwendungen/story-1080x1920.png', doc(W,H,body,BG))
# Profilbild 1080 (kreissicher)
png_only(f'{O}/anwendungen/profilbild-1080.png', icon_svg('primaer',scale=0.92), 1080)
# Sticker: Wortmarke auf dunkler Platte mit hellem Rand, transparent außen
c=P; body0,x0,y0,w,h=wordmark(c); m=w*0.07
W2=w+2*m; H2=h+2*m
st=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0-m-30:.1f} {y0-m-30:.1f} {W2+60:.1f} {H2+60:.1f}"><rect x="{x0-m:.1f}" y="{y0-m:.1f}" width="{W2:.1f}" height="{H2:.1f}" rx="{m*0.8:.1f}" fill="{BG}" stroke="{BONE}" stroke-width="26"/>{body0}</svg>'
save(f'{O}/anwendungen/sticker-transparent', st, 2000)
