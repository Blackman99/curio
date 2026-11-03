// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Loss Chord: glowing waveform/speaker + bead descending a loss curve
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.4,metalness:.4,roughness:.35},o));
export default function chord(T,col){const g=new T.Group(),mats=[],teal=M(T,col,{metalness:.35,roughness:.4,emissiveIntensity:.7}),mag=M(T,0xe846b4,{metalness:.3,roughness:.4,emissiveIntensity:.85}),dark=M(T,0x0a0e22,{metalness:.2,roughness:.8,emissiveIntensity:.1});mats.push(teal,mag,dark);
  // speaker cone / body
  const body=new T.Mesh(new T.CylinderGeometry(.16,.2,.1,20),dark);body.rotation.x=Math.PI/2;body.position.set(-.28,0,0);g.add(body);
  const cone=new T.Mesh(new T.ConeGeometry(.18,.12,16,1,true),teal);cone.rotation.z=-Math.PI/2;cone.position.set(-.18,0,0);g.add(cone);
  const rim=new T.Mesh(new T.TorusGeometry(.18,.012,8,24),mag);rim.rotation.y=Math.PI/2;rim.position.set(-.12,0,0);g.add(rim);
  // glowing waveform rings in front of speaker
  const waves=[];
  for(let i=0;i<3;i++){const w=new T.Mesh(new T.TorusGeometry(.1+i*.06,.006,6,24),i%2?mag:teal);w.rotation.y=Math.PI/2;w.position.set(-.05+i*.04,0,0);g.add(w);waves.push(w)}
  // loss curve (bezier valley)
  const curve=new T.CubicBezierCurve3(new T.Vector3(-.05,.28,0),new T.Vector3(.12,.32,.04),new T.Vector3(.22,-.05,-.02),new T.Vector3(.42,-.22,0));
  const tube=new T.Mesh(new T.TubeGeometry(curve,28,.01,6,false),teal);g.add(tube);
  // valley floor shadow ribbon
  const floor=new T.Mesh(new T.TubeGeometry(curve,20,.004,4,false),dark);floor.position.y=-.02;g.add(floor);
  // bead on curve
  const bead=new T.Mesh(new T.SphereGeometry(.045,12,10),mag);g.add(bead);
  // tiny star at minimum
  const star=new T.Mesh(new T.OctahedronGeometry(.03,0),teal);star.position.copy(curve.getPoint(1));star.position.y-=.02;g.add(star);
  const upd=t=>{const u=(.15+.7*(.5+.5*Math.sin(t*.7)));bead.position.copy(curve.getPoint(u));
   const tan=curve.getTangent(u);bead.scale.setScalar(.85+.25*(.5+.5*Math.sin(t*3)));
   for(let i=0;i<waves.length;i++){const s=1+.08*Math.sin(t*3.5+i*1.2);waves[i].scale.set(1,s,s);waves[i].material.emissiveIntensity=.45+.4*(.5+.5*Math.sin(t*4+i))}};
  upd(.9);g.rotation.y=-.3;g.rotation.x=.2;
  return{obj:g,mats,tick:t=>upd(t)}}
