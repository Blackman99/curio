// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Speculative Press: a little cylinder proof press tilted toward you; a sheet on the bed with lines of black type and glowing red words (one per stroke), a struck pencil word, a yellow pencil, and the brass-ended roller rolling to and fro
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.4,metalness:.4,roughness:.35},o));
export default function press(T,col){const g=new T.Group(),mats=[],iron=M(T,0x2a2522,{emissiveIntensity:.04,metalness:.7,roughness:.45}),steel=M(T,0x8d8a84,{emissiveIntensity:.05,metalness:.85,roughness:.3}),brass=M(T,0xc9a35c,{metalness:.85,roughness:.3,emissiveIntensity:.1});
  const box=(w,h,d,m,x,y,z)=>{const b=new T.Mesh(new T.BoxGeometry(w,h,d),m);b.position.set(x,y,z);g.add(b);return b};
  box(.86,.08,.5,iron,0,-.045,0);box(.8,.014,.44,steel,0,.002,0);
  const paper=M(T,0xe2d6bb,{emissiveIntensity:.03,metalness:0,roughness:.95});box(.5,.004,.36,paper,-.07,.011,0);
  const ink=M(T,0x0b0908,{emissiveIntensity:0,metalness:0,roughness:1}),red=M(T,0xc8301a,{emissive:new T.Color(0xd8361c),emissiveIntensity:1.1,metalness:0,roughness:.7}),lead=M(T,0x8b867d,{emissiveIntensity:.05,metalness:0,roughness:.9});mats.push(red);
  let s=27;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;
  for(let r=0;r<7;r++){const z=-.135+r*.045;let x=-.3,end=r===6?-.02:.15,k=0;
   while(x<end){const w=.025+rnd()*.05;if(x+w>end)break;const last=r===6&&x+w+.03>end;const m=last?red:(k%3===2||rnd()<.18)?red:ink;box(w,.006,.017,m,x+w/2,.016,z);x+=w+.012;k++}
   if(r===6){const pw=.06;box(pw,.003,.016,lead,x+.004+pw/2,.0145,z);box(pw+.01,.0035,.004,red,x+.004+pw/2,.016,z)}}
  const car=new T.Group();g.add(car);
  const rg=new T.Group();car.add(rg);const roll=new T.Mesh(new T.CylinderGeometry(.055,.055,.46,36),M(T,0x1c1a19,{emissiveIntensity:0,metalness:.35,roughness:.55}));roll.rotation.x=Math.PI/2;rg.add(roll);
  for(const z of[-.25,.25]){const cap=new T.Mesh(new T.CylinderGeometry(.065,.065,.025,36),brass);cap.rotation.x=Math.PI/2;cap.position.z=z;car.add(cap);
   const arm=new T.Mesh(new T.BoxGeometry(.05,.13,.02),iron);arm.position.set(0,-.02,z+(z>0?.022:-.022));car.add(arm)}
  const crank=new T.Mesh(new T.TorusGeometry(.045,.008,8,28),brass);crank.position.set(0,0,.29);rg.add(crank);const spoke=new T.Mesh(new T.BoxGeometry(.09,.012,.01),brass);spoke.position.z=.29;rg.add(spoke);const knob=new T.Mesh(new T.CylinderGeometry(.009,.009,.05,10),M(T,0x5a2a1a,{emissiveIntensity:.1,metalness:.2,roughness:.5}));knob.rotation.x=Math.PI/2;knob.position.set(.045,0,.315);rg.add(knob);
  car.position.y=.075;
  for(const z of[-.235,.235])box(.8,.02,.012,brass,0,.016,z);
  const pen=new T.Group();g.add(pen);
  const body=new T.Mesh(new T.CylinderGeometry(.011,.011,.26,6),M(T,0xe2b33c,{emissiveIntensity:.15,metalness:.1,roughness:.6}));pen.add(body);
  const tip=new T.Mesh(new T.ConeGeometry(.011,.04,6),M(T,0xe9cfa1,{emissiveIntensity:.1,metalness:0,roughness:.8}));tip.position.y=-.15;tip.rotation.x=Math.PI;pen.add(tip);
  const lead2=new T.Mesh(new T.ConeGeometry(.004,.014,6),M(T,0x333333,{emissiveIntensity:0}));lead2.position.y=-.164;lead2.rotation.x=Math.PI;pen.add(lead2);
  pen.rotation.set(Math.PI/2,0,-.5);pen.position.set(.29,.03,.03);
  const upd=t=>{const x=.04+Math.sin(t*.9)*.2;car.position.x=x;rg.rotation.z=-x/.055};
  upd(0);g.rotation.x=.6;g.position.y=-.02;g.scale.setScalar(.98);
  return{obj:g,mats,tick:t=>upd(t)}}
