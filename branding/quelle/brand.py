"""RAVE STRNGRS Markenpaket: Icon 09C2 + Wortmarke 03. Alle Schrift als Pfade (keine Font-Abhängigkeit)."""
import math
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

BG='#111113'; SURF='#19191C'; BONE='#EFECE6'; RED='#FF2B1C'
_F=TTFont(__import__('os').path.join(__import__('os').path.dirname(__file__),'../../flutter_app/assets/fonts/Anton-Regular.ttf')); _GS=_F.getGlyphSet(); _CM=_F.getBestCmap(); _UPM=_F['head'].unitsPerEm
def text_d(text, size, sx=1.0):
  """Pfad für text, Grundlinie y=0, links x=0. Rückgabe d, bbox (x0,y0,x1,y1) in y-unten-Koordinaten."""
  k=size/_UPM; x=0; spen=SVGPathPen(_GS); bp=BoundsPen(_GS)
  for ch in text:
    g=_CM[ord(ch)]; t=(k*sx,0,0,-k,x,0)
    _GS[g].draw(TransformPen(spen,t)); _GS[g].draw(TransformPen(bp,t))
    x+=_GS[g].width*k*sx
  return spen.getCommands(), bp.bounds
def cap_size(h):  # Schriftgröße, bei der die Versalhöhe von "R" = h ist
  d,b=text_d('R',1000); return h*1000/(b[3]-b[1])

S5=["01110","10001","10000","01110","00001","10001","01110"]
G5={'S':S5,'T':["11111","00100","00100","00100","00100","00100","00100"],'R':["11110","10001","10001","11110","10100","10010","10001"],
    'N':["10001","11001","10101","10011","10001","10001","10001"],'G':["01110","10001","10000","10111","10001","10001","01111"]}
def dots(word,x,y,h,col,rf=0.86):
  p=h/7; r=p*rf/2; b=''
  for i,ch in enumerate(word):
    for rr,row in enumerate(G5[ch]):
      for k,v in enumerate(row):
        if v=='1': b+=f'<circle cx="{x+(i*6+k)*p+p/2:.2f}" cy="{y+rr*p+p/2:.2f}" r="{r:.2f}" fill="{col}"/>'
  return b, (len(word)*6-1)*p

# Farbwelten: frame, letter, mis (None = ohne Versatz), block, dot ('knock' = ausgestanzt)
CW={
 'primaer': dict(bg=BG,  frame=BONE, letter=BONE, mis=RED,  block=RED, dot=BONE),
 'hell':    dict(bg=BONE,frame=BG,   letter=BG,   mis=RED,  block=RED, dot=BONE),
 'rot':     dict(bg=RED, frame=BG,   letter=BG,   mis=BONE, block=BG,  dot=RED),
 'mono-weiss':  dict(bg=None, frame=BONE, letter=BONE, mis=None, block=BONE, dot='knock'),
 'mono-schwarz':dict(bg=None, frame=BG,   letter=BG,   mis=None, block=BG,   dot='knock'),
}
_uid=[0]
def _id(p): _uid[0]+=1; return f'{p}{_uid[0]}'

def block_with_dots(x,y,w,h,col,dotsvg_fn,dot,ro,cx,cy):
  """Rotes Feld mit Punkten; dot='knock' stanzt die Punkte aus (Maske)."""
  tr=f'transform="rotate({ro} {cx:.2f} {cy:.2f})"'
  if dot=='knock':
    mid=_id('m'); dm=dotsvg_fn('#000')
    return (f'<mask id="{mid}" maskUnits="userSpaceOnUse" x="-2000" y="-2000" width="6000" height="6000">'
            f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="#fff"/>{dm}</mask>'
            f'<g {tr}><rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{col}" mask="url(#{mid})"/></g>')
  return f'<g {tr}><rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{col}"/>{dotsvg_fn(dot)}</g>'

# ---------- Icon 09C2 (Motiv in 1024er-Raum) ----------
def icon_motif(c, scale=1.1):
  s=320; ST=28; ax,ay,ar=212,212,-8; bx,by,br=492,492,7
  # R: Anton, 150 % breit, Versatz rot; Paar mittig im Kasten
  fs=232; sx=1.5; d,b=text_d('R',fs,sx); misx,misy=18,10
  ux0=b[0]; ux1=b[2]+(misx if c['mis'] else 0); uy0=b[1]; uy1=b[3]+(misy if c['mis'] else 0)
  ox=ax+s/2-(ux0+ux1)/2; oy=ay+s/2-(uy0+uy1)/2
  rg=(f'<path d="{d}" fill="{c["mis"]}" transform="translate({ox+misx:.2f} {oy+misy:.2f})"/>' if c['mis'] else '')+\
     f'<path d="{d}" fill="{c["letter"]}" transform="translate({ox:.2f} {oy:.2f})"/>'
  A=(f'<g transform="rotate({ar} {ax+s/2} {ay+s/2})"><rect x="{ax+ST/2}" y="{ay+ST/2}" width="{s-ST}" height="{s-ST}" '
     f'fill="none" stroke="{c["frame"]}" stroke-width="{ST}"/>{rg}</g>')
  def sd(col):
    h=s*0.74; cc=h/7*0.86; g=h/7*0.14; W=5*(cc+g)-g; x0=bx+s/2-W/2; y0=by+s/2-h/2; o=''
    for r in range(7):
      for k in range(5):
        if S5[r][k]=='1': o+=f'<circle cx="{x0+k*(cc+g)+cc/2:.2f}" cy="{y0+r*(cc+g)+cc/2:.2f}" r="{cc/2*1.18:.2f}" fill="{col}"/>'
    return o
  B=block_with_dots(bx,by,s,s,c['block'],sd,c['dot'],br,bx+s/2,by+s/2)
  return f'<g transform="translate(512 512) scale({scale}) translate(-512 -512)">{A}{B}</g>'

def icon_svg(cw='primaer', size=1024, rx=0, bg=True, scale=1.1, tile=None):
  c=CW[cw]; fill=tile or c['bg']
  back=f'<rect width="1024" height="1024" rx="{rx}" fill="{fill}"/>' if (bg and fill) else ''
  return f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 1024 1024">{back}{icon_motif(c,scale)}</svg>'

# ---------- Wortmarke 03 ----------
def wordmark(c):
  """Gibt (svg-body, x0,y0,w,h) zurück; Ursprung beliebig, bbox exakt (rotierte Rechtecke)."""
  rh=260; fr=34; pad=60; fs=cap_size(rh); sx=1.5
  d,b=text_d('RAVE',fs,sx); rw=b[2]-b[0]; o=rh*0.05; mx,my=o*1.2,o
  bw=rw+2*pad+2*fr; bh=rh+2*pad+2*fr; bx=0; by=0
  tx=bx+fr+pad-b[0]; ty=by+fr+pad-b[1]  # Grundlinie so, dass Versalhöhe oben bei fr+pad
  rv=(f'<path d="{d}" fill="{c["mis"]}" transform="translate({tx+mx:.2f} {ty+my:.2f})"/>' if c['mis'] else '')+\
     f'<path d="{d}" fill="{c["letter"]}" transform="translate({tx:.2f} {ty:.2f})"/>'
  A=(f'<g transform="rotate(-4 {bx+bw/2:.2f} {by+bh/2:.2f})"><rect x="{bx+fr/2}" y="{by+fr/2}" width="{bw-fr:.2f}" height="{bh-fr}" '
     f'fill="none" stroke="{c["frame"]}" stroke-width="{fr}"/>{rv}</g>')
  dh=rh*0.62; _,dw=dots('STRNGRS',0,0,dh,'#000'); sw=dw+2*pad; sx0=bx+bw-30; sy0=by+bh*0.45
  B=block_with_dots(sx0,sy0,sw,bh,c['block'],lambda col: dots('STRNGRS',sx0+pad,sy0+(bh-dh)/2,dh,col)[0],c['dot'],3,sx0+sw/2,sy0+bh/2)
  def corners(x,y,w,h,ro):
    cx,cy=x+w/2,y+h/2; a=math.radians(ro)
    return [(cx+(px-cx)*math.cos(a)-(py-cy)*math.sin(a), cy+(px-cx)*math.sin(a)+(py-cy)*math.cos(a)) for px,py in [(x,y),(x+w,y),(x,y+h),(x+w,y+h)]]
  pts=corners(bx,by,bw,bh,-4)+corners(sx0,sy0,sw,bh,3)
  xs=[p[0] for p in pts]; ys=[p[1] for p in pts]
  return A+B, min(xs),min(ys),max(xs)-min(xs),max(ys)-min(ys)

def place(body_bbox, x, y, w=None, h=None):
  body,bx,by,bw,bh=body_bbox; k=(w/bw) if w else (h/bh)
  return f'<g transform="translate({x:.2f} {y:.2f}) scale({k:.5f}) translate({-bx:.2f} {-by:.2f})">{body}</g>', bw*k, bh*k

def wordmark_svg(cw='primaer', margin=0.08, bg=True):
  c=CW[cw]; body,x0,y0,w,h=wordmark(c); m=w*margin
  back=f'<rect x="{x0-m:.2f}" y="{y0-m:.2f}" width="{w+2*m:.2f}" height="{h+2*m:.2f}" fill="{c["bg"]}"/>' if (bg and c['bg']) else ''
  return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0-m:.2f} {y0-m:.2f} {w+2*m:.2f} {h+2*m:.2f}">{back}{body}</svg>'

def doc(W,H,body,bg=None):
  back=f'<rect width="{W}" height="{H}" fill="{bg}"/>' if bg else ''
  return f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">{back}{body}</svg>'

def icon_inline(c, x, y, size, tile=None, rx_ratio=0.225, scale=1.1):
  """Icon als Gruppe an Position; tile = Kachelfarbe oder None (nur Motiv)."""
  k=size/1024
  t=f'<rect width="1024" height="1024" rx="{1024*rx_ratio}" fill="{tile}"/>' if tile else ''
  return f'<g transform="translate({x:.2f} {y:.2f}) scale({k:.5f})">{t}{icon_motif(c,scale)}</g>'
