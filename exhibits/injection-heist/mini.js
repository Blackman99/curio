// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Injection Heist: stacked file cards + red infected line + lock/countdown ring
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.4,metalness:.4,roughness:.35},o));
export default function heist(T,col){const g=new T.Group(),mats=[],neon=M(T,col,{metalness:.35,roughness:.4,emissiveIntensity:.65}),dark=M(T,0x0a120e,{metalness:.2,roughness:.85,emissiveIntensity:.08}),red=M(T,0xff2a4a,{metalness:.3,roughness:.4,emissiveIntensity:.9}),amber=M(T,0xffb000,{metalness:.4,roughness:.35,emissiveIntensity:.7});mats.push(neon,dark,red,amber);
  // stacked file cards
  const cards=[];
  for(let i=0;i<4;i++){const c=new T.Mesh(new T.BoxGeometry(.55,.08,.38),i===2?dark:M(T,0x122018,{metalness:.25,roughness:.7,emissive:col,emissiveIntensity:.12}));
   c.position.set(-.08+i*.03,.22-i*.11,.02*i);c.rotation.x=-.35;c.rotation.z=(i-1.5)*.04;g.add(c);cards.push(c);
   // filename bar
   const bar=new T.Mesh(new T.BoxGeometry(.42,.012,.01),neon);bar.position.set(0,.02,.2);c.add(bar)}
  // infected line on third card (index 2)
  const infect=new T.Mesh(new T.BoxGeometry(.48,.016,.012),red);infect.position.set(0,-.01,.2);cards[2].add(infect);
  // lock / countdown ring in front
  const ring=new T.Mesh(new T.TorusGeometry(.16,.014,8,24),amber);ring.position.set(.32,-.18,.28);ring.rotation.x=.5;g.add(ring);
  const dial=new T.Mesh(new T.CircleGeometry(.12,16),M(T,0x050806,{metalness:.1,emissive:0xffb000,emissiveIntensity:.25}));dial.position.copy(ring.position);dial.position.z-=.01;dial.rotation.x=ring.rotation.x;g.add(dial);
  const hand=new T.Mesh(new T.BoxGeometry(.01,.1,.01),amber);hand.position.set(0,.03,0);dial.add(hand);
  // tiny lock body
  const lock=new T.Mesh(new T.BoxGeometry(.07,.08,.04),neon);lock.position.set(-.34,-.22,.22);g.add(lock);
  const shackle=new T.Mesh(new T.TorusGeometry(.035,.008,6,12,Math.PI),neon);shackle.position.set(-.34,-.14,.22);shackle.rotation.z=Math.PI;g.add(shackle);
  const upd=t=>{infect.material.emissiveIntensity=.55+.45*(.5+.5*Math.sin(t*5));
   ring.rotation.z=t*.8;hand.rotation.z=-t*1.6;
   cards[2].position.y=.22-2*.11+.01*Math.sin(t*3);
   lock.material.emissiveIntensity=.4+.3*(.5+.5*Math.sin(t*2))};
  upd(.8);g.rotation.y=-.35;g.rotation.x=.2;
  return{obj:g,mats,tick:t=>upd(t)}}
