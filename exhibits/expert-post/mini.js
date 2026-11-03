// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Expert Post: tiny pneumatic tubes from a gate to 4 desks, capsules flowing along
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.4,metalness:.4,roughness:.35},o));
export default function tubes(T,col){const g=new T.Group(),mats=[],br=M(T,col,{metalness:.85,roughness:.3,emissiveIntensity:.2}),dk=M(T,0x2a1a0e,{metalness:.4,emissiveIntensity:.1});mats.push(br,dk);
  const gate=new T.Mesh(new T.TorusGeometry(.08,.018,8,16),br);gate.rotation.y=Math.PI/2;g.add(gate);
  const hub=new T.Mesh(new T.SphereGeometry(.045,10,8),M(T,0x1a1208,{metalness:.6}));g.add(hub);
  const desks=[],caps=[];
  for(let i=0;i<4;i++){const a=(-.55+i*.37),x=.42,y=Math.sin(a)* .35,z=Math.cos(a)*.1;
   const curve=new T.QuadraticBezierCurve3(new T.Vector3(.08,0,0),new T.Vector3(.22,y*.6,.08*(i%2?1:-1)),new T.Vector3(x,y,z));
   const tube=new T.Mesh(new T.TubeGeometry(curve,16,.012,5,false),br);g.add(tube);
   const desk=new T.Mesh(new T.BoxGeometry(.1,.07,.06),dk);desk.position.set(x+.06,y,z);g.add(desk);
   const tag=new T.Mesh(new T.BoxGeometry(.08,.02,.01),M(T,[0xc45c4a,0x3a8a9a,0xc9a24a,0x4a8a5a][i],{emissiveIntensity:.5}));tag.position.set(x+.06,y+.045,z+.03);g.add(tag);
   desks.push(curve);
   const cap=new T.Mesh(new T.CapsuleGeometry(.016,.03,3,6),M(T,0xe8d4a0,{metalness:.7,emissiveIntensity:.15}));cap.rotation.z=Math.PI/2;g.add(cap);caps.push({mesh:cap,curve,off:i*.22});
  }
  // dead-letter chute
  const dead=new T.QuadraticBezierCurve3(new T.Vector3(.06,-.05,0),new T.Vector3(.15,-.28,0),new T.Vector3(.2,-.38,0));
  g.add(new T.Mesh(new T.TubeGeometry(dead,10,.01,5,false),M(T,0x6b1e1a,{metalness:.5,emissiveIntensity:.3})));
  const dcap=new T.Mesh(new T.CapsuleGeometry(.014,.025,3,6),M(T,0xc04030,{emissiveIntensity:.4}));dcap.rotation.z=Math.PI/2;g.add(dcap);
  const upd=t=>{for(const c of caps){const u=(t*.35+c.off)%1;c.mesh.position.copy(c.curve.getPoint(u));const tan=c.curve.getTangent(u);c.mesh.quaternion.setFromUnitVectors(new T.Vector3(1,0,0),tan.normalize())}
   const u=(t*.25+.5)%1;dcap.position.copy(dead.getPoint(u))};upd(.4);g.rotation.y=-.3;g.rotation.x=.25;
  return{obj:g,mats,tick:t=>upd(t)}}
