// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Mark I Perceptron: a hammertone cabinet with a neon retina showing an X, a tangle of patch cords and a rack of knobs whose pointers turn in slow waves
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.4,metalness:.4,roughness:.35},o));
export default function markone(T,col){const g=new T.Group(),mats=[],paint=M(T,0x747f6c,{emissiveIntensity:.28,metalness:.2,roughness:.85}),dark=M(T,0x14140f,{emissiveIntensity:.04,metalness:.2,roughness:.8}),board=M(T,0x4a3018,{emissiveIntensity:.25,metalness:.1,roughness:.8}),ivory=M(T,0xf4eedb,{emissiveIntensity:.35,metalness:.1,roughness:.5}),warm=M(T,0xe2962c,{emissiveIntensity:.25,metalness:.25,roughness:.45}),cool=M(T,0x3a9fc4,{emissiveIntensity:.25,metalness:.25,roughness:.45}),neon=M(T,0xff7a2a,{emissive:new T.Color(0xff7a2a).multiplyScalar(.55),emissiveIntensity:1,metalness:0,roughness:.5});mats.push(neon);
  const r=(()=>{let s=33;return()=>{s=(s+0x6D2B79F5)|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}})();
  const box=(w,h,d,x,y,z,m)=>{const b=new T.Mesh(new T.BoxGeometry(w,h,d),m);b.position.set(x,y,z);g.add(b);return b},Z=.075;
  box(.92,.36,.15,0,0,0,paint);box(.21,.28,.008,-.335,0,Z+.004,dark);box(.2,.28,.008,-.075,0,Z+.004,board);box(.34,.32,.008,.27,0,Z+.004,dark);
  const dot=new T.CylinderGeometry(.0085,.0085,.008,10);dot.rotateX(Math.PI/2);const off=dark;
  for(let j=0;j<9;j++)for(let i=0;i<9;i++){const on=i===j||i+j===8,d=new T.Mesh(dot,on?neon:M(T,0x2a2319,{emissiveIntensity:.08,roughness:.7}));d.position.set(-.335+(i-4)*.022,(4-j)*.022+.02,Z+.011);g.add(d)}
  const pal=[0x0d0d0a,0x2a261f,0x5a5142,0x7c2a1c,0xe2962c,0x3a9fc4];
  for(let n=0;n<58;n++){const x0=-.165+r()*.05,y0=.125-r()*.2,x1=.0+r()*.018,y1=.125-r()*.2,sag=.02+r()*.09,c=new T.CubicBezierCurve3(new T.Vector3(x0,y0,Z+.01),new T.Vector3(x0+.03,y0-sag,Z+.018+r()*.02),new T.Vector3(x1-.03,y1-sag,Z+.018+r()*.02),new T.Vector3(x1,y1,Z+.01));g.add(new T.Line(new T.BufferGeometry().setFromPoints(c.getPoints(18)),new T.LineBasicMaterial({color:pal[n%13===0?4:n%17===0?5:n%3]})))}
  const cap=new T.CylinderGeometry(.0145,.0165,.012,14);cap.rotateX(Math.PI/2);const ptr=new T.BoxGeometry(.0034,.0125,.003),kn=[];
  for(let j=0;j<7;j++)for(let i=0;i<8;i++){const k=new T.Group(),u=r(),c=new T.Mesh(cap,u<.5?warm:cool),p=new T.Mesh(ptr,ivory);p.position.set(0,.0065,.0075);k.add(c,p);k.position.set(.27+(i-3.5)*.041,(3-j)*.041,Z+.014);g.add(k);kn.push({k,a:(u-.5)*3.6,o:r()*6.28})}
  const upd=t=>{for(const q of kn)q.k.rotation.z=q.a+Math.sin(t*.55+q.o)*.42};upd(3);
  g.rotation.set(.42,-.3,0);g.position.set(.02,-.06,0);
  return{obj:g,mats,tick:(t)=>upd(t)}}
