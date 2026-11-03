// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Superposition Orrery: a tilted brass orrery whose five arms sit as a pentagon — five features in two dimensions
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.4,metalness:.4,roughness:.35},o));
export default function orrery(T,col){const g=new T.Group(),mats=[],br=M(T,0xc9a24a,{metalness:.9,roughness:.3,emissiveIntensity:.15}),ed=M(T,col,{emissiveIntensity:.8,metalness:.2});mats.push(ed);
  const plane=new T.Group();plane.rotation.x=.95;plane.position.y=.06;g.add(plane);const spin=new T.Group();plane.add(spin);
  const ring=new T.Mesh(new T.TorusGeometry(.36,.009,8,72),br);ring.rotation.x=Math.PI/2;spin.add(ring);
  const sun=new T.Mesh(new T.SphereGeometry(.035,16,10),M(T,0xffb35a,{emissiveIntensity:1.2,metalness:.1}));spin.add(sun);
  const C=[0xffd27a,0xff6f7d,0xa98bff,0x4fd2ff,0x4fe0b5],P=[],up=new T.Vector3(0,1,0),rod=(a,b,r,m)=>{const d=new T.Vector3().subVectors(b,a),o=new T.Mesh(new T.CylinderGeometry(r,r,d.length(),6),m);o.position.copy(a).addScaledVector(d,.5);o.quaternion.setFromUnitVectors(up,d.normalize());return o};
  const pm=[];for(let k=0;k<5;k++){const a=k/5*Math.PI*2-Math.PI/2,p=new T.Vector3(Math.cos(a)*.4,0,Math.sin(a)*.4);P.push(p);spin.add(rod(new T.Vector3(),p,.006,br));
   const m=M(T,C[k],{emissiveIntensity:.7,metalness:.2});pm.push(m);const s=new T.Mesh(new T.SphereGeometry(.042,16,12),m);s.position.copy(p);spin.add(s)}
  for(let k=0;k<5;k++)spin.add(rod(P[k],P[(k+1)%5],.005,ed));
  g.add(rod(new T.Vector3(0,.04,0),new T.Vector3(0,-.4,0),.012,br));const base=new T.Mesh(new T.CylinderGeometry(.16,.19,.04,32),M(T,0x1a1d2e,{emissiveIntensity:0,metalness:.6,roughness:.3}));base.position.y=-.42;g.add(base);
  return{obj:g,mats,tick:t=>{spin.rotation.y=t*.35;pm.forEach((m,k)=>{m.emissiveIntensity=.55+.35*Math.sin(t*2+k*1.3)})}}}
