// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Type Foundry: a wooden type case tipped toward you, lead sorts in its compartments, and a freshly cast slug across the front whose face still glows: QUOUSQUE TANDEM
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.25,metalness:.6,roughness:.4},o));
export default function typeFoundry(T,col){const root=new T.Group(),g=new T.Group(),mats=[];root.add(g);
  g.rotation.x=.62;g.position.set(0,-.26,0);g.scale.setScalar(.88);
  const wood=M(T,0x8a5a32,{emissive:0x2a160a,emissiveIntensity:.3,metalness:0,roughness:.75}),dark=M(T,0x4a2e18,{emissive:0x140a04,emissiveIntensity:.3,metalness:0,roughness:.8}),
    lead=M(T,0x9ea3aa,{emissive:0x3a3d42,emissiveIntensity:.3,metalness:.85,roughness:.35}),brass=M(T,0xc89a48,{emissive:0x4a3410,emissiveIntensity:.3,metalness:.9,roughness:.3});
  const box=(w,h,d,m,x,y,z)=>{const b=new T.Mesh(new T.BoxGeometry(w,h,d),m);b.position.set(x,y,z);g.add(b);return b};
  const W=.86,D=.54,H=.07;
  box(W,.025,D,wood,0,-.03,0);                                   // floor
  box(W,H,.03,wood,0,0,-D/2+.015);box(W,H,.03,wood,0,0,D/2-.015);   // back / front rails
  box(.03,H,D,wood,-W/2+.015,0,0);box(.03,H,D,wood,W/2-.015,0,0);   // sides
  box(.2,.022,.05,brass,0,.005,D/2+.01);                           // drawer pull
  // compartments: a California job case has small boxes on the left, large in the middle; here 3 rows of mixed widths
  const rows=[[1,1,1,1,1,1,1,1,1,1],[1,1,2,2,1,1,1,1],[1,1,2,2,2,1,1]];const z0=-D/2+.03,rh=(D-.06-.16)/3;
  rows.forEach((r,ri)=>{const tot=r.reduce((a,b)=>a+b,0),z=z0+rh*ri;box(W-.06,.05,.012,dark,0,-.005,z);let x=-W/2+.03;
    r.forEach((u,ci)=>{const w=(W-.06)*u/tot;if(ci)box(.012,.05,rh,dark,x,-.005,z+rh/2);x+=w})});
  box(W-.06,.05,.012,dark,0,-.005,z0+rh*3);
  // lead sorts in the compartments (deterministic scatter)
  let s=7;const rnd=()=>{s=(s*16807)%2147483647;return s/2147483647};
  const sorts=new T.InstancedMesh(new T.BoxGeometry(.022,.034,.03),lead,160);const m4=new T.Matrix4(),q=new T.Quaternion(),e=new T.Euler();let n=0;
  rows.forEach((r,ri)=>{const tot=r.reduce((a,b)=>a+b,0),z=z0+rh*ri;let x=-W/2+.03;r.forEach(u=>{const w=(W-.06)*u/tot,k=Math.floor(3+rnd()*6*u);
    for(let i=0;i<k&&n<160;i++){e.set(0,rnd()*Math.PI,(rnd()-.5)*.5);q.setFromEuler(e);m4.compose(new T.Vector3(x+.02+rnd()*(w-.04),-.0,z+.02+rnd()*(rh-.04)),q,new T.Vector3(1,1,1));sorts.setMatrixAt(n++,m4)}x+=w})});
  sorts.count=n;sorts.frustumCulled=false;g.add(sorts);
  // the slug: a cast line of type across the front, face up, still hot
  const zS=D/2-.1;box(.74,.05,.06,lead,0,.0,zS);
  const cv=document.createElement('canvas');cv.width=1024;cv.height=96;const c=cv.getContext('2d');
  c.fillStyle='#000';c.fillRect(0,0,1024,96);const gr=c.createLinearGradient(0,0,0,96);gr.addColorStop(0,'#fff2c8');gr.addColorStop(.55,'#ffb04a');gr.addColorStop(1,'#ff6a1a');
  c.fillStyle=gr;c.font='800 74px "Arial Narrow",Arial,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('QUOUSQUE TANDEM',512,52);
  const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;
  const face=new T.MeshStandardMaterial({color:0x2a2b2e,emissive:0xffffff,emissiveMap:tex,emissiveIntensity:.9,metalness:.7,roughness:.4});
  const pl=new T.Mesh(new T.PlaneGeometry(.72,.0675),face);pl.rotation.x=-Math.PI/2;pl.position.set(0,.0255,zS);g.add(pl);mats.push(face);
  return{obj:root,mats,tick:(t)=>{face.emissiveIntensity=.8+.12*Math.sin(t*1.7)}}}
