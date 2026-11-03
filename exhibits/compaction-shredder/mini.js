// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Compaction Shredder: graphite machine body, twin spinning blades, paper strip feeding in, KEEP strip ejecting
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.4,metalness:.4,roughness:.35},o));
export default function shredder(T,col){const g=new T.Group(),mats=[],iron=M(T,0x2a2e38,{metalness:.75,roughness:.4,emissiveIntensity:.08}),warn=M(T,col,{metalness:.25,roughness:.45,emissiveIntensity:.55}),paper=M(T,0xf7f4ea,{metalness:0,roughness:.9,emissiveIntensity:.12});mats.push(iron,warn,paper);
  const body=new T.Mesh(new T.BoxGeometry(.72,.42,.36),iron);body.position.y=-.06;g.add(body);
  const band=new T.Mesh(new T.BoxGeometry(.725,.05,.365),warn);band.position.y=.12;g.add(band);
  const slot=new T.Mesh(new T.BoxGeometry(.42,.04,.1),M(T,0x0e1014,{metalness:.5,emissiveIntensity:.05}));slot.position.set(0,.18,.12);g.add(slot);
  // twin blades
  const mkBlade=()=>{const b=new T.Group();
   for(let i=0;i<4;i++){const tth=new T.Mesh(new T.BoxGeometry(.22,.03,.02),M(T,0xc8ced8,{metalness:.9,roughness:.25,emissiveIntensity:.1}));tth.rotation.z=i*Math.PI/4;b.add(tth)}
   const hub=new T.Mesh(new T.CylinderGeometry(.035,.035,.025,10),warn);hub.rotation.x=Math.PI/2;b.add(hub);return b};
  const bL=mkBlade(),bR=mkBlade();bL.position.set(-.16,.02,.2);bR.position.set(.16,.02,.2);g.add(bL,bR);
  // paper strip descending into slot
  const strip=new T.Mesh(new T.BoxGeometry(.28,.34,.008),paper);strip.position.set(0,.36,.14);g.add(strip);
  // KEEP eject strip
  const keep=new T.Mesh(new T.BoxGeometry(.16,.03,.01),M(T,0xff8c42,{emissiveIntensity:.5}));keep.position.set(.4,-.02,.1);g.add(keep);
  const tray=new T.Mesh(new T.BoxGeometry(.18,.12,.08),iron);tray.position.set(.48,-.12,.05);g.add(tray);
  const lip=new T.Mesh(new T.BoxGeometry(.185,.015,.085),warn);lip.position.set(.48,-.05,.05);g.add(lip);
  const upd=t=>{bL.rotation.z=t*4;bR.rotation.z=-t*4.2;strip.position.y=.42-Math.abs(Math.sin(t*1.6))*.22;strip.scale.y=.85+.15*Math.cos(t*1.6);
   keep.position.set(.28+Math.abs(Math.sin(t*1.3))*.22,-.02+.08*Math.sin(t*1.3),.12);keep.rotation.z=Math.sin(t*1.3)*.4};
  upd(.7);g.rotation.y=-.35;g.rotation.x=.28;
  return{obj:g,mats,tick:t=>upd(t)}}
