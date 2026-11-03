// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Reward Regatta: a round lagoon tilted toward you, a sandy islet ringed by three red buoys and a white wake, a little sloop with a navy sail circling it forever, and an unvisited chequered finish flag at the rim
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.4,metalness:.4,roughness:.35},o));
export default function regatta(T,col){const g=new T.Group(),mats=[],R=.42;
  const water=new T.Mesh(new T.CylinderGeometry(R,R,.03,64),M(T,0x165f86,{emissiveIntensity:.08,metalness:.15,roughness:.22}));g.add(water);
  const sh=new T.Mesh(new T.CylinderGeometry(R*.62,R*.62,.032,48),M(T,0x2f8fb0,{emissiveIntensity:.08,metalness:.1,roughness:.28}));sh.position.y=.0015;g.add(sh);
  const rim=new T.Mesh(new T.TorusGeometry(R+.012,.022,10,72),M(T,0xe6d3a0,{emissiveIntensity:.08,metalness:.05,roughness:.8}));rim.rotation.x=Math.PI/2;g.add(rim);
  const base=new T.Mesh(new T.CylinderGeometry(R+.04,R+.05,.06,64),M(T,0x3b2416,{metalness:.1,roughness:.6,emissiveIntensity:.04}));base.position.y=-.045;g.add(base);
  const isl=new T.Mesh(new T.SphereGeometry(.085,24,12),M(T,0xead8a8,{emissiveIntensity:.1,metalness:0,roughness:.9}));isl.scale.set(1,.32,.8);isl.position.y=.012;g.add(isl);
  const tree=new T.Mesh(new T.ConeGeometry(.026,.07,10),M(T,0x6f8f4e,{emissiveIntensity:.1,metalness:0,roughness:.8}));tree.position.set(.01,.06,0);g.add(tree);
  const wake=new T.Mesh(new T.TorusGeometry(.2,.007,6,80),new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.85}));wake.rotation.x=Math.PI/2;wake.position.y=.018;g.add(wake);
  const red=M(T,0xe0452a,{emissive:new T.Color(0xe0452a).multiplyScalar(.5),emissiveIntensity:.6,metalness:.1,roughness:.4});mats.push(red);
  const band=M(T,0xfff4e0,{emissiveIntensity:.15,metalness:0,roughness:.6}),bs=[];
  for(let k=0;k<3;k++){const a=k*2.094+.5,b=new T.Group(),s=new T.Mesh(new T.SphereGeometry(.026,16,12),red),r=new T.Mesh(new T.TorusGeometry(.024,.006,6,20),band);r.rotation.x=Math.PI/2;b.add(s,r);b.position.set(Math.cos(a)*.2,.03,Math.sin(a)*.2);g.add(b);bs.push(b)}
  const boat=new T.Group(),hull=new T.Mesh(new T.SphereGeometry(.04,16,10),M(T,0xfbf8f0,{emissiveIntensity:.2,metalness:.1,roughness:.4}));hull.scale.set(1.5,.42,.62);boat.add(hull);
  const sail=new T.Mesh(new T.BufferGeometry().setFromPoints([new T.Vector3(.02,.012,0),new T.Vector3(.02,.13,0),new T.Vector3(-.055,.016,0)]),new T.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:.12,side:T.DoubleSide,roughness:.5}));
  sail.geometry.computeVertexNormals();boat.add(sail);g.add(boat);
  const pole=new T.Mesh(new T.CylinderGeometry(.004,.004,.16,6),band);pole.position.set(.36,.08,-.16);g.add(pole);
  const ck=document.createElement('canvas');ck.width=ck.height=32;const cx=ck.getContext('2d');for(let j=0;j<4;j++)for(let i=0;i<6;i++){cx.fillStyle=(i+j)%2?'#111':'#f6f3ea';cx.fillRect(i*32/6,j*8,32/6+1,8)}
  const fl=new T.Mesh(new T.PlaneGeometry(.075,.048),new T.MeshStandardMaterial({map:new T.CanvasTexture(ck),side:T.DoubleSide,roughness:.6}));fl.position.set(.36+.04,.135,-.16);g.add(fl);
  const upd=t=>{const a=-t*.9;boat.position.set(Math.cos(a)*.2,.03,Math.sin(a)*.2);boat.rotation.y=-a+Math.PI;
   bs.forEach((b,k)=>{b.position.y=.03+Math.sin(t*2.4+k*2)*.004})};
  upd(1.1);g.rotation.x=.55;g.position.y=-.02;g.scale.setScalar(1.02);
  return{obj:g,mats,tick:t=>upd(t)}}
