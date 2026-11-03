// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// RoPE Carousel: striped platform, canopy, bobbing horses on brass poles
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.4,metalness:.4,roughness:.35},o));
export default function carousel(T,col){const g=new T.Group(),mats=[],br=M(T,0xc9a24a,{metalness:.9,roughness:.28,emissiveIntensity:.25}),cr=M(T,col,{metalness:.35,roughness:.45,emissiveIntensity:.45}),cr2=M(T,0xf4e8d0,{metalness:.2,roughness:.55,emissiveIntensity:.2});mats.push(br,cr,cr2);
  // striped disc platform
  const N=16,disc=new T.Group();
  for(let i=0;i<N;i++){const shape=new T.Shape();shape.moveTo(0,0);shape.absarc(0,0,.38,i/N*Math.PI*2,(i+1)/N*Math.PI*2,false);shape.lineTo(0,0);
   const geo=new T.ExtrudeGeometry(shape,{depth:.03,bevelEnabled:false});const m=new T.Mesh(geo,i%2?cr:cr2);m.rotation.x=-Math.PI/2;disc.add(m)}
  g.add(disc);
  const rim=new T.Mesh(new T.TorusGeometry(.39,.012,6,32),br);rim.rotation.x=Math.PI/2;rim.position.y=.02;g.add(rim);
  // spindle + canopy
  const spin=new T.Mesh(new T.CylinderGeometry(.018,.022,.42,8),br);spin.position.y=.24;g.add(spin);
  const canopy=new T.Mesh(new T.ConeGeometry(.42,.16,12,1,true),cr);canopy.position.y=.48;g.add(canopy);
  const fin=new T.Mesh(new T.SphereGeometry(.035,8,6),br);fin.position.y=.56;g.add(fin);
  // horses on poles
  const horses=[];
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2,R=.28;
   const pole=new T.Mesh(new T.CylinderGeometry(.006,.006,.28,5),br);pole.position.set(Math.cos(a)*R,.16,Math.sin(a)*R);g.add(pole);
   const body=new T.Mesh(new T.BoxGeometry(.07,.045,.03),i%2?cr:cr2);body.position.set(Math.cos(a)*R,.22,Math.sin(a)*R);g.add(body);
   const head=new T.Mesh(new T.BoxGeometry(.03,.025,.022),i%2?cr:cr2);head.position.set(Math.cos(a)*R+.03,.24,Math.sin(a)*R);g.add(head);
   horses.push({body,head,pole,a,R,ph:i*1.1});
  }
  // floor ring
  const floor=new T.Mesh(new T.CylinderGeometry(.45,.45,.02,24),M(T,0x2a1c14,{metalness:.2,roughness:.9,emissiveIntensity:.05}));floor.position.y=-.01;g.add(floor);
  const upd=t=>{disc.rotation.y=t*.35;spin.rotation.y=t*.35;canopy.rotation.y=t*.35;fin.rotation.y=t*.5;
   for(const h of horses){const bob=Math.sin(t*2.2+h.ph)*.04;const ang=h.a+t*.35;h.pole.position.set(Math.cos(ang)*h.R,.16+bob*.2,Math.sin(ang)*h.R);h.body.position.set(Math.cos(ang)*h.R,.22+bob,Math.sin(ang)*h.R);h.head.position.set(Math.cos(ang)*h.R+.03,.24+bob,Math.sin(ang)*h.R)}};
  upd(.6);g.rotation.x=.35;g.rotation.y=-.25;
  return{obj:g,mats,tick:t=>upd(t)}}
