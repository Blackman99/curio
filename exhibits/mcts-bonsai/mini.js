// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// MCTS Bonsai: a bonsai in a glazed pot; the chosen limb carries a green crown, two cut-off limbs wither rust, a leaf drops
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.4,metalness:.4,roughness:.35},o));
export default function bonsai(T,col){const g=new T.Group(),mats=[],bark=M(T,0x4a3426,{metalness:.05,roughness:.85,emissiveIntensity:.08}),glaze=M(T,0x34465a,{metalness:.35,roughness:.3,emissiveIntensity:.06});
  const pot=new T.Mesh(new T.BoxGeometry(.6,.1,.34),glaze);pot.position.y=-.35;g.add(pot);const rim=new T.Mesh(new T.BoxGeometry(.64,.025,.37),M(T,0x5c7a92,{metalness:.4,roughness:.25,emissiveIntensity:.05}));rim.position.y=-.29;g.add(rim);
  const soil=new T.Mesh(new T.BoxGeometry(.58,.012,.32),M(T,0x3a2a1e,{metalness:0,roughness:1,emissiveIntensity:0}));soil.position.y=-.276;g.add(soil);
  for(const x of[-.2,.2]){const f=new T.Mesh(new T.BoxGeometry(.08,.03,.2),glaze);f.position.set(x,-.415,0);g.add(f)}
  const tube=(pts,r)=>new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(p=>new T.Vector3(...p))),20,r,7,false),bark);
  g.add(tube([[-.03,-.28,0],[.06,-.18,.01],[-.05,-.06,0],[.03,.06,0]],.042));g.add(new T.Mesh(new T.ConeGeometry(.08,.07,10),bark).translateY(-.255).translateX(-.03));
  const crown=new T.Group();crown.position.set(.03,.06,0);g.add(crown);
  crown.add(tube([[0,0,0],[.06,.1,.01],[.12,.2,0]],.024),tube([[0,0,0],[-.1,.04,.02],[-.22,.07,0]],.012),tube([[0,0,0],[.12,0,-.02],[.21,-.02,0]],.011),tube([[.06,.1,.01],[-.02,.2,0],[-.06,.27,0]],.014));
  const green=M(T,col,{metalness:.05,roughness:.7,emissiveIntensity:.35}),rust=M(T,0xb4532c,{metalness:.05,roughness:.7,emissiveIntensity:.35});mats.push(green,rust);
  const pad=(x,y,r,m)=>{const p=new T.Mesh(new T.IcosahedronGeometry(r,1),m);p.position.set(x,y,0);p.scale.set(1,.55,.8);crown.add(p);return p};
  const P=[pad(.13,.25,.15,green),pad(-.05,.29,.11,green),pad(.25,.16,.09,green),pad(-.23,.08,.06,rust),pad(.22,-.01,.05,rust)];
  const bloom=M(T,0xfbe8ee,{metalness:0,roughness:.6,emissiveIntensity:.25});for(let i=0;i<9;i++){const s=new T.Mesh(new T.SphereGeometry(.011,6,5),bloom);s.position.set(-.08+(i%5)*.07,.28+((i*37)%5)*.012,.1-((i*13)%3)*.03);crown.add(s)}
  const leaf=new T.Mesh(new T.CircleGeometry(.018,6),rust);leaf.scale.set(1,.5,1);g.add(leaf);
  const upd=t=>{crown.rotation.z=Math.sin(t*.8)*.025;P.slice(0,3).forEach((p,i)=>p.scale.set(1+.04*Math.sin(t*1.3+i),.55+.025*Math.sin(t*1.3+i),.8));
   const u=(t*.35)%1;leaf.position.set(-.2+.08*Math.sin(u*9),.12-.38*u,.06);leaf.rotation.z=u*8;leaf.visible=u<.97};
  upd(.4);g.rotation.y=-.25;return{obj:g,mats,tick:t=>upd(t)}}
