// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Reservoir Ripples: a little glass ripple tank; brass dippers on the short walls send rings across the water and floats with amber lamps ride it
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.4,metalness:.4,roughness:.35},o));
export default function ripples(T,col){const g=new T.Group(),mats=[],W=.7,D=.42,H=.1;
  const frame=M(T,0x9fb0ad,{emissiveIntensity:.12,metalness:.75,roughness:.3}),box=(w,h,d,x,y,z,m)=>{const b=new T.Mesh(new T.BoxGeometry(w,h,d),m||frame);b.position.set(x,y,z);g.add(b);return b};
  box(W+.06,.026,D+.06,0,-.013,0,M(T,0x1d2a2c,{emissiveIntensity:.06,metalness:.3,roughness:.7}));
  for(const x of[-W/2-.006,W/2+.006])for(const z of[-D/2-.006,D/2+.006])box(.012,H,.012,x,H/2,z);
  for(const z of[-D/2-.006,D/2+.006])box(W+.024,.01,.01,0,H,z);for(const x of[-W/2-.006,W/2+.006])box(.01,.01,D+.024,x,H,0);
  const glass=new T.MeshStandardMaterial({color:0xbfe8e4,transparent:true,opacity:.16,roughness:.1,metalness:0,side:T.DoubleSide,depthWrite:false});
  for(const z of[-D/2,D/2]){const p=new T.Mesh(new T.PlaneGeometry(W,H),glass);p.position.set(0,H/2,z);g.add(p)}
  for(const x of[-W/2,W/2]){const p=new T.Mesh(new T.PlaneGeometry(D,H),glass);p.position.set(x,H/2,0);p.rotation.y=Math.PI/2;g.add(p)}
  const NXg=56,NZg=34,geo=new T.PlaneGeometry(W,D,NXg,NZg);geo.rotateX(-Math.PI/2);const pos=geo.attributes.position,base=Float32Array.from(pos.array);
  const water=new T.Mesh(geo,new T.MeshStandardMaterial({color:0x2a6f74,metalness:.35,roughness:.22}));water.position.y=H*.62;g.add(water);
  const src=[];for(let j=0;j<4;j++){src.push([-W/2+.045,-D/2+D*(j+.5)/4,(j*1.7)%3]);src.push([W/2-.045,-D/2+D*(j+.5)/4,(j*2.3+1)%3])}
  const brass=M(T,0xc98e2c,{emissive:new T.Color(0x6a4410),emissiveIntensity:.35,metalness:.85,roughness:.3});mats.push(brass);const dip=[];
  for(const s of src){const b=new T.Mesh(new T.SphereGeometry(.017,14,10),brass);b.position.set(s[0],H*.62,s[1]);g.add(b);const arm=box(.07,.006,.006,s[0]+(s[0]<0?-.04:.04),H*.62+.025,s[1]);dip.push({b,s})}
  const lamp=M(T,0xffb43c,{emissive:new T.Color(0xffb43c).multiplyScalar(.6),emissiveIntensity:.7,metalness:0,roughness:.5});mats.push(lamp);
  const cork=M(T,0xe9e2cc,{emissiveIntensity:.18,metalness:0,roughness:.7}),fl=[];
  for(let j=0;j<6;j++)for(let i=0;i<10;i++){const x=-W/2+.075+i*(W-.15)/9,z=-D/2+.05+j*(D-.1)/5,m=new T.Mesh(new T.SphereGeometry(.0065,8,6),cork);m.position.set(x,H*.62,z);g.add(m);fl.push({m,x,z})}
  const hgt=(x,z,t)=>{let h=0;for(const s of src){const r=Math.hypot(x-s[0],z-s[1]);h+=Math.sin(r*95-t*6+s[2])*Math.exp(-r*4.2)}return h*.0042};
  const upd=t=>{const a=pos.array;for(let i=0;i<a.length;i+=3){a[i+1]=base[i+1]+hgt(base[i],base[i+2],t)}pos.needsUpdate=true;geo.computeVertexNormals();
   for(const f of fl){const h=hgt(f.x,f.z,t);f.m.position.y=H*.62+h+.003;f.m.material=Math.abs(h)>.0016?lamp:cork}
   for(const d of dip)d.b.position.y=H*.62+.004+Math.sin(t*6+d.s[2])*.006};
  upd(2.2);g.rotation.set(.42,-.38,0);g.position.set(0,-.06,0);
  return{obj:g,mats,tick:(t)=>upd(t)}}
