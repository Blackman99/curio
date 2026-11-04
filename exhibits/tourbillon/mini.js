// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Tourbillon: a watch movement half taken apart: perlaged plate, gold wheels lifted off their pivots, a steel cage with its balance turning at six o'clock, a striped bridge and blued screws floating above
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.4,metalness:.4,roughness:.35},o));
export default function tourbillon(T,col){const g=new T.Group(),mats=[],mv=new T.Group();g.add(mv);
  const gear=(n,r,h,m)=>{const s=new T.Shape(),rr=r*.9;for(let k=0;k<n;k++){const a=k*Math.PI*2/n,d=Math.PI/n;
      const p=[[rr,a-d*.5],[r,a-d*.25],[r,a+d*.25],[rr,a+d*.5],[rr,a+d*1.5]];for(const [q,b] of p){const x=q*Math.cos(b),y=q*Math.sin(b);k||q!==rr||b!==a-d*.5?s.lineTo(x,y):s.moveTo(x,y)}}
    for(let i=0;i<5;i++){const a0=i*Math.PI*2/5+.12,a1=a0+Math.PI*2/5-.24,hp=new T.Path();hp.absarc(0,0,r*.72,a0,a1,false);hp.absarc(0,0,r*.24,a1-.1,a0+.1,true);s.holes.push(hp)}
    const ge=new T.ExtrudeGeometry(s,{depth:h,bevelEnabled:false,curveSegments:6});ge.rotateX(-Math.PI/2);return new T.Mesh(ge,m)};
  const plateM=M(T,0x8a8c90,{emissiveIntensity:0,metalness:.75,roughness:.38}),gold=M(T,0xe8b862,{emissive:new T.Color(0x7a5414),emissiveIntensity:.35,metalness:.85,roughness:.28}),
    steel=M(T,0xdfe3e8,{emissiveIntensity:.12,metalness:.9,roughness:.18}),blue=M(T,0x2a46b8,{emissive:new T.Color(0x16247a),emissiveIntensity:.45,metalness:.7,roughness:.3}),
    ruby=M(T,0xe0284a,{emissive:new T.Color(0x9a0f28),emissiveIntensity:.7,metalness:.1,roughness:.2});mats.push(gold,ruby);
  const plate=new T.Mesh(new T.CylinderGeometry(.4,.4,.028,64),plateM);plate.position.y=-.014;mv.add(plate);
  const sink=new T.Mesh(new T.CylinderGeometry(.15,.15,.012,48),M(T,0x5e6064,{emissiveIntensity:0,metalness:.7,roughness:.45}));sink.position.set(0,.002,.23);mv.add(sink);
  const wheels=[[0,.03,0,.135,40],[.07,.075,-.13,.15,48],[-.06,.12,.0,.12,36]].map(([x,y,z,r,n],i)=>{const w=gear(n,r,.014,gold);w.position.set(x,y,z);mv.add(w);
    const ar=new T.Mesh(new T.CylinderGeometry(.006,.006,y+.03,8),steel);ar.position.set(x,(y)/2,z);mv.add(ar);return w});
  const barrel=new T.Mesh(new T.CylinderGeometry(.15,.15,.05,48),gold);barrel.position.set(-.12,.07,-.17);mv.add(barrel);
  const cage=new T.Group();cage.position.set(0,.04,.23);mv.add(cage);
  const ring=(r,t,m,y)=>{const o=new T.Mesh(new T.TorusGeometry(r,t,8,48),m);o.rotation.x=Math.PI/2;o.position.y=y;cage.add(o);return o};
  ring(.125,.008,steel,0);ring(.125,.006,steel,.09);
  for(let i=0;i<3;i++){const a=i*Math.PI*2/3,p=new T.Mesh(new T.CylinderGeometry(.006,.006,.09,8),steel);p.position.set(Math.cos(a)*.125,.045,Math.sin(a)*.125);cage.add(p);
    const arm=new T.Mesh(new T.BoxGeometry(.125,.006,.014),steel);arm.position.set(Math.cos(a)*.062,.09,Math.sin(a)*.062);arm.rotation.y=-a;cage.add(arm)}
  const bal=new T.Group();bal.position.y=.06;cage.add(bal);const br=new T.Mesh(new T.TorusGeometry(.085,.007,8,48),gold);br.rotation.x=Math.PI/2;bal.add(br);
  const bar=new T.Mesh(new T.BoxGeometry(.17,.006,.012),gold);bal.add(bar);
  for(let i=0;i<8;i++){const a=i*Math.PI/4,s=new T.Mesh(new T.SphereGeometry(.009,8,6),gold);s.position.set(Math.cos(a)*.092,0,Math.sin(a)*.092);bal.add(s)}
  const hs=[];for(let i=0;i<=120;i++){const t=i/120,r=.012+t*.05,a=t*Math.PI*2*6;hs.push(new T.Vector3(Math.cos(a)*r,.075,Math.sin(a)*r))}
  cage.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(hs),240,.0018,4),blue));
  const bridge=new T.Group();bridge.position.y=.175;mv.add(bridge);
  const bs=new T.Shape();bs.absarc(-.05,-.05,.07,Math.PI*.5,Math.PI*1.6,false);bs.absarc(.21,-.16,.05,-Math.PI*.6,Math.PI*.4,false);bs.absarc(.05,.12,.06,0,Math.PI,false);
  const bg=new T.ExtrudeGeometry(bs,{depth:.022,bevelEnabled:true,bevelThickness:.004,bevelSize:.004,bevelSegments:1,curveSegments:16});bg.rotateX(-Math.PI/2);
  const bm=new T.Mesh(bg,M(T,0x8e9093,{emissiveIntensity:0,metalness:.8,roughness:.3}));bridge.add(bm);
  for(const [x,z] of[[-.05,.05],[.07,-.05]]){const j=new T.Mesh(new T.CylinderGeometry(.016,.016,.008,16),ruby);j.position.set(x,.03,z);bridge.add(j);
    const ch=new T.Mesh(new T.TorusGeometry(.02,.004,6,20),gold);ch.rotation.x=Math.PI/2;ch.position.set(x,.03,z);bridge.add(ch)}
  for(const [x,y,z] of[[-.17,.235,.06],[.22,.225,.17],[.08,.245,-.2],[-.02,.22,-.05]]){const s=new T.Mesh(new T.CylinderGeometry(.014,.014,.01,12),blue);s.position.set(x,y,z);mv.add(s)}
  mv.rotation.set(.36,-.5,0);mv.position.set(0,-.13,0);g.add(mv);
  const tick=(t)=>{t=+t||0;cage.rotation.y=-t*Math.PI*2/60*6;bal.rotation.y=Math.sin(t*Math.PI*2*1.2)*2.4;wheels[0].rotation.y=-t*.05;wheels[1].rotation.y=t*.4;wheels[2].rotation.y=-t*.12};
  bal.rotation.y=1.1;cage.rotation.y=.4;
  return{obj:g,mats,tick}}
