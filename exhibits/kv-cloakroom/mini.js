// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// KV Cloakroom: a mahogany cloakroom counter with a brass rail of coats and a shelf of bowler hats; each coat has a cream claim ticket, and a gold glow (the newest letter's attention) moves along the tickets while a red ticket waits on the counter
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.4,metalness:.4,roughness:.35},o));
export default function cloakroom(T,col){const g=new T.Group(),mats=[],wood=M(T,0x3a1c12,{emissiveIntensity:.05,metalness:.1,roughness:.55}),brass=M(T,0xd2a253,{metalness:.9,roughness:.28,emissiveIntensity:.12});
  const base=new T.Mesh(new T.BoxGeometry(.9,.05,.42),wood);base.position.set(0,-.025,0);g.add(base);
  const edge=new T.Mesh(new T.BoxGeometry(.91,.008,.43),brass);edge.position.y=.002;g.add(edge);
  for(const x of[-.4,.4]){const p=new T.Mesh(new T.CylinderGeometry(.008,.01,.25,10),brass);p.position.set(x,.125,-.08);g.add(p)}
  const rail=new T.Mesh(new T.CylinderGeometry(.006,.006,.82,10),brass);rail.rotation.z=Math.PI/2;rail.position.set(0,.215,-.08);g.add(rail);
  const shelf=new T.Mesh(new T.BoxGeometry(.84,.01,.1),wood);shelf.position.set(0,.245,-.09);g.add(shelf);
  const WOOL=[0x3f5a63,0x5b3f5e,0x4d6040,0x6b4a33,0x334a6b,0x6a3a3f,0x4a5a52,0x5c5338],HAT=[0x7a4f8f,0x3f8f86,0x8f7a3f,0x4f7a3f,0x8f4f5a,0x3f5f8f,0x6f8f3f,0x8f603f];
  const tick0=M(T,0xf1e3c3,{emissiveIntensity:.05,metalness:0,roughness:.7}),coats=[],tags=[],n=8;
  for(let i=0;i<n;i++){const x=-.35+i*.1,c=new T.Group();c.position.set(x,.215,-.08);g.add(c);
   const hg=new T.Mesh(new T.TorusGeometry(.03,.003,4,12,Math.PI),brass);hg.position.y=-.03;c.add(hg);
   const body=new T.Mesh(new T.CylinderGeometry(.03,.042,.14,4,1),M(T,WOOL[i],{emissiveIntensity:.06,metalness:.05,roughness:.85}));body.rotation.y=Math.PI/4;body.scale.z=.35;body.position.y=-.105;c.add(body);
   const sh=new T.Mesh(new T.BoxGeometry(.072,.018,.022),body.material);sh.position.y=-.042;c.add(sh);
   const lap=new T.Mesh(new T.BoxGeometry(.006,.05,.03),M(T,0xe8dcc4,{emissiveIntensity:.06,metalness:0}));lap.position.set(0,-.07,.006);c.add(lap);
   const tm=M(T,0xf1e3c3,{emissive:new T.Color(0xffd27a).multiplyScalar(.6),emissiveIntensity:.05,metalness:0,roughness:.6});mats.push(tm);
   const tg=new T.Mesh(new T.BoxGeometry(.032,.024,.004),tm);tg.position.set(0,-.135,.024);c.add(tg);tags.push(tm);coats.push(c);
   const hm=M(T,HAT[i],{emissiveIntensity:.12,metalness:.1,roughness:.6}),brim=new T.Mesh(new T.CylinderGeometry(.03,.03,.004,16),hm);brim.position.set(x,.252,-.09);g.add(brim);
   const crown=new T.Mesh(new T.SphereGeometry(.02,14,8,0,Math.PI*2,0,Math.PI/2),hm);crown.position.set(x,.253,-.09);crown.scale.y=1.1;g.add(crown)}
  // the counter top in front, with the newest letter's red ticket and a brass bell
  const top=new T.Mesh(new T.BoxGeometry(.86,.04,.1),wood);top.position.set(0,.02,.14);g.add(top);
  const tr=new T.Mesh(new T.BoxGeometry(.86,.006,.105),brass);tr.position.set(0,.041,.14);g.add(tr);
  const red=M(T,0xe0654c,{emissive:new T.Color(col).multiplyScalar(.5),emissiveIntensity:.5,metalness:0,roughness:.5});mats.push(red);
  const rt=new T.Mesh(new T.BoxGeometry(.06,.004,.04),red);rt.position.set(.12,.046,.14);rt.rotation.y=.25;g.add(rt);
  const bell=new T.Mesh(new T.SphereGeometry(.025,16,8,0,Math.PI*2,0,Math.PI/2),brass);bell.position.set(-.18,.044,.14);g.add(bell);
  const upd=(t,h)=>{const f=(t*1.6)%(n+2)-1;for(let i=0;i<n;i++){const w=Math.max(0,1-Math.abs(i-f)*.8)+(i===n-1?.35:0);tags[i].emissiveIntensity=.05+1.1*w;coats[i].rotation.z=Math.sin(t*1.3+i*1.7)*.035*(1+(h||0))}};
  upd(3.7,0);g.position.y=-.1;g.rotation.set(.32,-.1,0);
  return{obj:g,mats,tick:(t,dt,h)=>upd(t,h)}}
