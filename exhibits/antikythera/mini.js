// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Antikythera Mechanism: the bronze box leaning back on its stand: zodiac dial, planet rings with gem markers, a silver Moon and a golden Sun pointer, and a corner cut away to show the triangular-toothed wheels turning
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.25,metalness:.6,roughness:.4},o));
export default function antikythera(T,col){const g=new T.Group(),mats=[],box=new T.Group();g.add(box);
  const gear=(n,r,h,m,spokes)=>{const s=new T.Shape(),rr=r*.9;for(let k=0;k<n;k++){const a=k*Math.PI*2/n,d=Math.PI/n;const p0=[rr*Math.cos(a-d),rr*Math.sin(a-d)],p1=[r*Math.cos(a),r*Math.sin(a)];k?s.lineTo(p0[0],p0[1]):s.moveTo(p0[0],p0[1]);s.lineTo(p1[0],p1[1])}
    if(spokes)for(let i=0;i<spokes;i++){const a0=i*Math.PI*2/spokes+.16,a1=a0+Math.PI*2/spokes-.32,hp=new T.Path();hp.absarc(0,0,r*.76,a0,a1,false);hp.absarc(0,0,r*.2,a1-.12,a0+.12,true);s.holes.push(hp)}
    const ge=new T.ExtrudeGeometry(s,{depth:h,bevelEnabled:false,curveSegments:5});ge.rotateX(-Math.PI/2);return new T.Mesh(ge,m)};
  const wood=M(T,0x3a2416,{emissiveIntensity:0,metalness:0,roughness:.8}),plate=M(T,0x5e5140,{emissiveIntensity:0,metalness:.55,roughness:.55}),
    dial=M(T,0x7c6848,{emissiveIntensity:.03,metalness:.6,roughness:.45}),bronze=M(T,0xc89a5a,{emissive:new T.Color(0x5a3a14),emissiveIntensity:.3,metalness:.8,roughness:.32}),
    gold=M(T,0xf0c060,{emissive:new T.Color(0x7a5410),emissiveIntensity:.5,metalness:.9,roughness:.22}),silver=M(T,0xe6e8ec,{emissive:new T.Color(0x5a5e66),emissiveIntensity:.35,metalness:.95,roughness:.18});
  mats.push(gold,silver);
  // the case and its front plate (face up; the whole group is tipped towards the visitor)
  const W=.5,L=.78,H=.08;const cs=new T.Mesh(new T.BoxGeometry(W+.04,H,L+.04),wood);cs.position.y=-H/2;box.add(cs);
  const fp=new T.Mesh(new T.BoxGeometry(W,.012,L),plate);fp.position.y=.006;box.add(fp);
  // zodiac and calendar rings
  const ring=(a,b,y,m)=>{const r=new T.Mesh(new T.RingGeometry(a,b,72,1),m);r.rotation.x=-Math.PI/2;r.position.y=y;box.add(r);return r};
  ring(.18,.215,.0135,dial);ring(.215,.235,.014,bronze);
  for(let i=0;i<12;i++){const t=new T.Mesh(new T.BoxGeometry(.004,.003,.034),M(T,0x2a1a08,{emissiveIntensity:0}));const a=i*Math.PI/6;t.position.set(Math.sin(a)*.197,.0155,Math.cos(a)*.197);t.rotation.y=a;box.add(t)}
  // planet rings with their stones (turquoise, lapis, gold Sun, carnelian, crystal, obsidian)
  const gems=[[0x2fb0a0,.07],[0x2848b0,.093],[0xf0c060,.116],[0xb8432c,.139],[0xece6d8,.16]],rings=[];
  gems.forEach(([c,r],i)=>{const rg=new T.Group();rg.position.y=.016+i*.002;box.add(rg);const rm=new T.Mesh(new T.RingGeometry(r-.009,r+.009,64,1),i%2?dial:bronze);rm.rotation.x=-Math.PI/2;rg.add(rm);
    const gm=M(T,c,{emissive:new T.Color(c),emissiveIntensity:.45,metalness:.1,roughness:.15});mats.push(gm);const s=new T.Mesh(new T.SphereGeometry(.012,16,10),gm);s.position.set(0,.006,-r);rg.add(s);rg.rotation.y=i*1.3+.4;rings.push(rg)});
  const earth=new T.Mesh(new T.SphereGeometry(.035,24,12,0,Math.PI*2,0,Math.PI/2),bronze);earth.position.y=.016;box.add(earth);
  // Moon pointer (silver, with the half-black phase ball) and Sun pointer (gold)
  const moon=new T.Group();moon.position.y=.03;box.add(moon);const mb=new T.Mesh(new T.BoxGeometry(.007,.004,.21),silver);mb.position.z=-.105;moon.add(mb);
  const ball=new T.Mesh(new T.SphereGeometry(.014,16,10),silver);ball.position.set(0,.006,-.06);moon.add(ball);const bk=new T.Mesh(new T.SphereGeometry(.0142,16,10,0,Math.PI),M(T,0x111111,{emissiveIntensity:0,metalness:.2}));bk.position.copy(ball.position);moon.add(bk);
  const sun=new T.Group();sun.position.y=.026;box.add(sun);const sb=new T.Mesh(new T.BoxGeometry(.007,.004,.215),gold);sb.position.z=-.107;sun.add(sb);const ss=new T.Mesh(new T.SphereGeometry(.016,16,10),gold);ss.position.set(0,.004,-.116);sun.add(ss);
  sun.rotation.y=.7;moon.rotation.y=-.9;
  // the cut-away corner: the great four-spoked wheel and two smaller wheels, standing proud of the case
  const big=gear(56,.15,.012,bronze,4);big.position.set(.17,.004,.31);box.add(big);
  const g2=gear(24,.062,.012,bronze,0);g2.position.set(-.02,.012,.37);box.add(g2);
  const g3=gear(32,.08,.012,bronze,4);g3.position.set(-.16,.008,.3);box.add(g3);
  const cut=new T.Mesh(new T.BoxGeometry(.5,.012,.16),M(T,0x1a120b,{emissiveIntensity:0,metalness:0,roughness:.9}));cut.position.set(0,.0075,.31);box.add(cut);
  // tip the box back like a lectern so the dial faces the visitor
  box.rotation.x=.62;box.position.set(0,-.04,0);g.scale.setScalar(1.05);
  return{obj:g,mats,tick(t,dt){t=t||0;sun.rotation.y=.7+t*.25;moon.rotation.y=-.9+t*.25*13.37;bk.rotation.y=t*.25*12.37;
    rings.forEach((r,i)=>{r.rotation.y=i*1.3+.4+t*[.9,.4,.25,.13,.03][i]});big.rotation.y=t*.25;g2.rotation.y=-t*.25*56/24;g3.rotation.y=-t*.25*56/32}}}
