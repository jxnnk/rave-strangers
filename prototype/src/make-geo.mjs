import {feature} from 'topojson-client';
import {geoMercator, geoPath} from 'd3-geo';
import fs from 'fs';
const W=600,H=820;
const t50=JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-50m.json','utf8'));
const t110=JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-110m.json','utf8'));
const f50=feature(t50,t50.objects.countries).features;
const f110=feature(t110,t110.objects.countries).features;
const de=f50.find(f=>f.id==='276');
const proj=geoMercator().fitExtent([[10,10],[W-10,H-10]],de);
const path=geoPath(proj).digits(1);
const nbIds=['208','616','203','040','756','250','056','528','442','438','380','752'];
const nb50=f50.filter(f=>nbIds.includes(f.id));
const out={W,H,k:proj.scale(),tx:proj.translate()[0],ty:proj.translate()[1],center:proj.center(),rot:proj.rotate(),
 de:path(de), nb:nb50.map(f=>path(f)).join('')};
// numeric check of the simple formula
const lon=13.405,lat=52.52;
const p=proj([lon,lat]);
const l=lon*Math.PI/180,ph=lat*Math.PI/180;
const mine=[out.tx+out.k*l,out.ty-out.k*Math.log(Math.tan(Math.PI/4+ph/2))];
console.log('d3',p,'mine',mine);
console.log('sizes de',out.de.length,'nb',out.nb.length, 'ids', nb50.map(f=>f.id).join(','));
fs.writeFileSync('geo.json',JSON.stringify(out));
