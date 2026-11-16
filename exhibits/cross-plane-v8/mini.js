// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Cross-Plane V8: an orange small-block on a little stand, the near bank cut open so four pistons ride a cross-plane crank (pins 0-90-270-180); chrome valve cover and air cleaner, red plug wires, and headers that glow with each bank's uneven 270-180-90-180 exhaust beat
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.25,metalness:.6,roughness:.4},o));
export default function crossPlaneV8(T,col){const g=new T.Group(),mats=[],e=new T.Group();g.add(e);e.rotation.set(.32,-.95,0);e.position.set(0,-.07,0);
  const s=.00052,D=Math.PI/180,r=44.2*s,L=144.8*s,ZP=[1.5,.5,-.5,-1.5].map(k=>k*111.8*s),PIN=[0,90,270,180],FIRE={1:0,8:90,4:180,3:270,6:360,5:450,7:540,2:630};
  const paint=M(T,0xd8561b,{color:0xc65018,emissive:0x5a2008,emissiveIntensity:.25,metalness:.15,roughness:.5}),cut=M(T,0xb8bcc2,{emissive:0x4a4c50,emissiveIntensity:.3,metalness:.8,roughness:.35}),
    steel=M(T,0xb0b5bb,{emissive:0x45484c,emissiveIntensity:.3,metalness:.9,roughness:.3}),alu=M(T,0xd2d6dc,{emissive:0x55585c,emissiveIntensity:.35,metalness:.9,roughness:.3}),
    chrome=M(T,0xe6e9ee,{emissive:0x5c5f63,emissiveIntensity:.35,metalness:1,roughness:.12}),dark=M(T,0x2a2c30,{emissiveIntensity:.1,metalness:.5,roughness:.6}),
    wire=M(T,0xb0241e,{emissive:0x5a0c08,emissiveIntensity:.4,metalness:0,roughness:.5}),stand=M(T,0x3b4048,{emissiveIntensity:.08,metalness:.5,roughness:.5}),
    hdrL=M(T,0xc8ccd2,{emissive:new T.Color(0xff5a14),emissiveIntensity:0,metalness:.9,roughness:.25}),hdrR=hdrL.clone(),glow=M(T,0xffa040,{emissive:new T.Color(0xff8a2a).multiplyScalar(.7),emissiveIntensity:1,metalness:0,roughness:.4,transparent:true,opacity:0});
  mats.push(hdrL,hdrR,glow);
  const box=(w,h,d,m,par=e)=>{const b=new T.Mesh(new T.BoxGeometry(w,h,d),m);par.add(b);return b};
  const cylm=(rt,rb,h,m,seg=16,par=e)=>{const c=new T.Mesh(new T.CylinderGeometry(rt,rb,h,seg),m);par.add(c);return c};
  const bank=(sgn)=>{const gr=new T.Group();gr.rotation.z=-sgn*Math.PI/4;e.add(gr);return gr};
  // banks: left (+x) cut open to its valley half, right whole with a chrome valve cover
  const BL=bank(1),BR=bank(-1),H0=95*s,H1=229*s,HT=300*s,len=487*s;
  box(62*s,H1-H0,len,paint,BL).position.set(-31*s,(H0+H1)/2,0);box(1.2*s,H1-H0,len,cut,BL).position.set(.6*s,(H0+H1)/2,0);
  box(74*s,HT-H1,len+10*s,paint,BL).position.set(-37*s,(H1+HT)/2,0);box(1.2*s,HT-H1,len+10*s,cut,BL).position.set(.6*s,(H1+HT)/2,0);
  box(124*s,H1-H0,len,paint,BR).position.set(0,(H0+H1)/2,0);box(148*s,HT-H1,len+10*s,paint,BR).position.set(0,(H1+HT)/2,0);box(136*s,64*s,len,chrome,BR).position.set(0,HT+32*s,0);
  // valve springs and rockers on the cut head
  for(const z of ZP)for(const dz of [-24,24]){const sp=cylm(15*s,15*s,46*s,dark,10,BL);sp.position.set(30*s,HT+10*s,z+(dz+12)*s);const rk=box(60*s,8*s,12*s,steel,BL);rk.position.set(28*s,HT+40*s,z+(dz+12)*s)}
  // crankcase, pan, front balancer, intake, air cleaner
  box(128*s,110*s,len,paint).position.set(-64*s,-21*s,0);box(135*s,150*s,len,paint).position.set(-68*s,-150*s,0);box(1.2*s,150*s,len,cut).position.set(.6*s,-150*s,0);
  const bal=cylm(78*s,78*s,34*s,dark,24);bal.rotation.x=Math.PI/2;bal.position.set(0,0,len/2+30*s);
  box(250*s,80*s,len-60*s,paint).position.set(0,270*s,0);box(120*s,80*s,110*s,alu).position.set(0,350*s,0);
  const ac=cylm(150*s,150*s,44*s,chrome,32);ac.position.set(0,400*s,0);
  // crank: four throws at 0-90-270-180, rods and pistons in the left bank
  const crank=new T.Group();e.add(crank);const throws=[];
  for(let k=0;k<4;k++){const t=new T.Group();crank.add(t);t.rotation.z=-(45+PIN[k])*D;const p=cylm(26*s,26*s,48*s,steel,12,t);p.rotation.x=Math.PI/2;p.position.set(0,r,ZP[k]);
    for(const dz of [-34,34]){box(70*s,110*s,18*s,steel,t).position.set(0,r*.4,ZP[k]+dz*s);const cw=box(130*s,60*s,18*s,steel,t);cw.position.set(0,-58*s,ZP[k]+dz*s)}throws.push(t)}
  const mj=cylm(31*s,31*s,len,steel,12,crank);mj.rotation.x=Math.PI/2;
  const pist=[],rods=[],glows=[];
  for(let k=0;k<4;k++){const z=ZP[k]+12*s;const pg=new T.Group();BL.add(pg);const pc=cylm(50*s,50*s,78*s,alu,20,pg);pist.push(pg);
    const rd=box(22*s,L,20*s,steel,e);rods.push(rd);
    const gl=cylm(49*s,49*s,1,glow.clone(),20,BL);gl.material.opacity=0;mats.push(gl.material);glows.push(gl)}
  // plug wires over the top, headers down each side
  for(const sgn of [1,-1])for(const z of ZP){const a=new T.Vector3(sgn*250*s,170*s,z),b=new T.Vector3(sgn*150*s,400*s,z*.6),c=new T.Vector3(0,470*s,-200*s);
    const w=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([a,b,c]),16,3.6*s,6),wire);e.add(w)}
  const hdr={1:hdrL,'-1':hdrR};
  for(const sgn of [1,-1])for(const z of ZP){const p0=new T.Vector3(sgn*250*s,110*s,z),p1=new T.Vector3(sgn*330*s,0,z*.9),p2=new T.Vector3(sgn*320*s,-150*s,-200*s);
    const h=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([p0,p1,p2]),20,19*s,8),hdr[sgn]);e.add(h)}
  // a low plinth under it
  box(720*s,26*s,640*s,stand).position.set(0,-240*s,0);
  const lb=[1,3,5,7],pos=(th)=>{for(let k=0;k<4;k++){const psi=th+45+PIN[k],u=(psi-45)*D,sn=Math.sin(u),cs=Math.cos(u),sp=r*cs+Math.sqrt(L*L-r*r*sn*sn);
      throws[k].rotation.z=-(45+PIN[k])*D;pist[k].position.set(0,sp+(39.6-39)*s,ZP[k]+12*s);
      const pin=new T.Vector3(r*Math.sin(psi*D),r*Math.cos(psi*D),ZP[k]+12*s),wp=new T.Vector3(sp*Math.SQRT1_2,sp*Math.SQRT1_2,ZP[k]+12*s),d=wp.clone().sub(pin);
      rods[k].position.copy(pin).addScaledVector(d,.5);rods[k].rotation.set(0,0,Math.atan2(-d.x,d.y));
      const crown=sp+39.6*s,hh=Math.max(.0005,H1-crown);glows[k].scale.set(1,hh,1);glows[k].position.set(0,crown+hh/2,ZP[k]+12*s);
      const ph=((th-FIRE[lb[k]])%720+720)%720;glows[k].material.opacity=ph<120?.75*Math.exp(-ph/45):0}
    crank.rotation.z=-th*D;
    // exhaust pulse glow per bank: left fires 1,3,5,7 at 0,270,450,540; right 8,4,6,2 at 90,180,360,630
    const pl=(list)=>{let v=0;for(const f of list){const x=((th-f-180)%720+720)%720;if(x<200)v+=Math.sin(x/200*Math.PI)*Math.exp(-x/90)}return v};
    hdrL.emissiveIntensity=1.1*pl([0,270,450,540]);hdrR.emissiveIntensity=1.1*pl([90,180,360,630])};
  pos(30);
  return{obj:g,mats,tick:(t)=>{pos((t*150)%720)}}}
