// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Hook Bouncer: nightclub door frame, velvet rope, clipboard, command blocks bouncing / slipping through
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.4,metalness:.4,roughness:.35},o));
export default function bouncer(T,col){const g=new T.Group(),mats=[],br=M(T,0xd4a84b,{metalness:.85,roughness:.3,emissiveIntensity:.2}),vel=M(T,0x5c1228,{metalness:.15,roughness:.7,emissiveIntensity:.25}),ink=M(T,0x1a0a10,{metalness:.2,roughness:.8,emissiveIntensity:.05}),clip=M(T,0xf4ecd8,{metalness:0,roughness:.9,emissiveIntensity:.12}),stamp=M(T,col,{metalness:.2,roughness:.45,emissiveIntensity:.75});mats.push(br,vel,stamp);
  // floor plank
  const floor=new T.Mesh(new T.BoxGeometry(.9,.03,.4),ink);floor.position.y=-.38;g.add(floor);
  // door frame
  const jambL=new T.Mesh(new T.BoxGeometry(.04,.7,.06),br);jambL.position.set(-.08,0,0);g.add(jambL);
  const jambR=new T.Mesh(new T.BoxGeometry(.04,.7,.06),br);jambR.position.set(.22,0,0);g.add(jambR);
  const lintel=new T.Mesh(new T.BoxGeometry(.38,.05,.07),br);lintel.position.set(.07,.38,0);g.add(lintel);
  // dark doorway
  const door=new T.Mesh(new T.BoxGeometry(.26,.62,.02),ink);door.position.set(.07,0,-.01);g.add(door);
  // bouncer body (crossed-arms silhouette)
  const body=new T.Mesh(new T.BoxGeometry(.12,.22,.06),ink);body.position.set(.1,-.05,.04);g.add(body);
  const head=new T.Mesh(new T.SphereGeometry(.045,10,8),ink);head.position.set(.1,.1,.05);g.add(head);
  const clipB=new T.Mesh(new T.BoxGeometry(.07,.09,.01),clip);clipB.position.set(.02,-.02,.08);clipB.rotation.z=-.3;g.add(clipB);
  const line=new T.Mesh(new T.BoxGeometry(.05,.008,.012),stamp);line.position.set(.02,-.01,.09);g.add(line);
  // velvet rope posts + rope
  const post=()=>{const p=new T.Group();const s=new T.Mesh(new T.CylinderGeometry(.015,.015,.22,8),br);s.position.y=.11;p.add(s);const top=new T.Mesh(new T.SphereGeometry(.03,8,6),br);top.position.y=.23;p.add(top);return p};
  const p1=post(),p2=post();p1.position.set(-.38,-.38,.12);p2.position.set(-.18,-.38,.12);g.add(p1,p2);
  const rope=new T.Mesh(new T.TubeGeometry(new T.QuadraticBezierCurve3(new T.Vector3(-.38,-.15,.12),new T.Vector3(-.28,-.05,.16),new T.Vector3(-.18,-.15,.12)),10,.012,6,false),vel);g.add(rope);
  // command blocks: one blocked (left, bouncing), one slipped (right)
  const mkBlk=(txtCol)=>{const m=M(T,txtCol,{metalness:.1,roughness:.6,emissiveIntensity:.35});mats.push(m);return new T.Mesh(new T.BoxGeometry(.22,.07,.04),m)};
  const blocked=mkBlk(col);blocked.position.set(-.28,.12,.18);g.add(blocked);
  const slipped=mkBlk(0x2db87a);slipped.position.set(.38,-.18,.1);g.add(slipped);
  // BLOCKED stamp chip
  const stampChip=new T.Mesh(new T.BoxGeometry(.14,.04,.015),stamp);stampChip.position.set(-.22,.22,.22);stampChip.rotation.z=-.25;g.add(stampChip);
  const upd=t=>{const bounce=Math.abs(Math.sin(t*3.2));blocked.position.set(-.28-bounce*.08,.12+bounce*.1,.18);blocked.rotation.z=-.15-bounce*.2;
   slipped.position.set(.28+Math.abs(Math.sin(t*1.4))*.14,-.22+.06*Math.sin(t*1.4),.1);slipped.rotation.z=Math.sin(t*1.4)*.15;
   stampChip.material.emissiveIntensity=.45+.4*(.5+.5*Math.sin(t*5));
   head.position.y=.1+.01*Math.sin(t*2)};
  upd(.5);g.rotation.y=-.35;g.rotation.x=.22;
  return{obj:g,mats,tick:t=>upd(t)}}
