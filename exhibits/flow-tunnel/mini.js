// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Flow Tunnel: a little glass wind tunnel; threads integrated from the exact flow-matching field run from a noisy rake to five target points on the outlet screen, and beads of smoke travel along them
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.4,metalness:.4,roughness:.35},o));
export default function flowtunnel(T,col){const g=new T.Group(),mats=[],TG=[[1.45,.72],[.72,.18],[0,-.42],[-.72,.18],[-1.45,.72]],k=.125,L=.84,hx=.22,hy=.17,beads=[],cs=[0x2f8fff,0x56dcf2,0xffe2b0,0xff9a48,0xff5236];
  const r=(()=>{let s=32;return()=>{s=(s+0x6D2B79F5)|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}})();
  const frame=M(T,0x8fa6b8,{emissiveIntensity:.05,metalness:.6,roughness:.35}),box=(w,h,d,x,y,z)=>{const b=new T.Mesh(new T.BoxGeometry(w,h,d),frame);b.position.set(x,y,z);g.add(b)};
  for(const y of[-hy,hy])for(const z of[-hx,hx])box(L,.006,.006,0,y,z);
  for(const x of[-L/2,-L/6,L/6,L/2]){for(const z of[-hx,hx])box(.006,2*hy,.006,x,0,z);for(const y of[-hy,hy])box(.006,.006,2*hx,x,y,0)}
  const base=new T.Mesh(new T.BoxGeometry(L+.05,.02,2*hx+.05),M(T,0x1b222b,{emissiveIntensity:.05,metalness:.3,roughness:.7}));base.position.y=-hy-.014;g.add(base);
  const screen=new T.Mesh(new T.PlaneGeometry(2*hx,2*hy),new T.MeshStandardMaterial({color:0x0a0f15,transparent:true,opacity:.6,side:T.DoubleSide,roughness:.4}));screen.position.x=L/2;screen.rotation.y=Math.PI/2;g.add(screen);
  for(let n=0;n<40;n++){const u=Math.min(1.3,Math.sqrt(-2*Math.log(r()+1e-9))*.72),a=r()*6.2832;let x=u*Math.cos(a),y=u*Math.sin(a);const pts=[],S=30;
   for(let i=0;i<=S;i++){const t=i/S;pts.push(new T.Vector3(-L/2+L*t,y*k,x*k));if(i===S)break;const s=1-t,d=TG.map(p=>((x-t*p[0])**2+(y-t*p[1])**2)/(2*s*s)),b=Math.min(...d);let W=0,mx=0,my=0;TG.forEach((p,j)=>{const w=Math.exp(b-d[j]);W+=w;mx+=w*p[0];my+=w*p[1]});x+=((mx/W-x)/s)/S;y+=((my/W-y)/s)/S}
   let c=0,bd=1e9;TG.forEach((p,j)=>{const e=(p[0]-x)**2+(p[1]-y)**2;if(e<bd){bd=e;c=cs[j]}});
   g.add(new T.Line(new T.BufferGeometry().setFromPoints(pts),new T.LineBasicMaterial({color:c,transparent:true,opacity:.8})));
   if(n%2===0){const m=M(T,c,{emissive:new T.Color(c).multiplyScalar(.45),emissiveIntensity:.5,metalness:0,roughness:.5});mats.push(m);const b=new T.Mesh(new T.SphereGeometry(.005,8,6),m);g.add(b);beads.push({b,pts,o:r()})}}
  TG.forEach((p,j)=>{const m=M(T,cs[j],{emissive:new T.Color(cs[j]).multiplyScalar(.45),emissiveIntensity:.55,metalness:0,roughness:.4});mats.push(m);const s=new T.Mesh(new T.SphereGeometry(.011,10,8),m);s.position.set(L/2,p[1]*k,p[0]*k);g.add(s)});
  const upd=t=>{for(const q of beads){const u=(q.o+t*.12)%1,f=u*(q.pts.length-1),i=Math.min(q.pts.length-2,f|0);q.b.position.lerpVectors(q.pts[i],q.pts[i+1],f-i)}};
  upd(3);g.rotation.set(.2,-.62,0);g.position.y=-.02;
  return{obj:g,mats,tick:(t)=>upd(t)}}
