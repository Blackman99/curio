// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Hopfield Flip-Dots: a little flip-disc sign on a brass easel showing a cat; every few seconds a quarter of the discs flip over at random, then clack back one by one to the stored cat
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.4,metalness:.4,roughness:.35},o));
export default function flipdots(T,col){const g=new T.Group(),mats=[],paint=M(T,0x1d2120,{metalness:.3,roughness:.6,emissiveIntensity:.03}),brass=M(T,0xc9a050,{metalness:.9,roughness:.3,emissiveIntensity:.08});
  const face=M(T,0x050606,{metalness:0,roughness:.9,emissiveIntensity:0}),blk=M(T,0x161718,{metalness:.2,roughness:.55,emissiveIntensity:0}),yel=M(T,col,{emissive:new T.Color(col).multiplyScalar(.55),emissiveIntensity:.75,metalness:.05,roughness:.4});mats.push(yel);
  const hb=new T.Mesh(new T.BoxGeometry(.9,.64,.05),paint);g.add(hb);const fc=new T.Mesh(new T.PlaneGeometry(.82,.56),face);fc.position.z=.026;g.add(fc);
  const pl=new T.Mesh(new T.BoxGeometry(.4,.045,.012),brass);pl.position.set(0,-.36,.012);g.add(pl);
  for(const s of[-1,1]){const l=new T.Mesh(new T.CylinderGeometry(.012,.014,.5,8),brass);l.position.set(s*.3,-.43,-.06);l.rotation.x=-.22;g.add(l)}
  const CAT=['.#........#.','.##......##.','.##########.','.#..####..#.','.##########.','.####..####.','..########..','....####....'],dg=new T.CircleGeometry(.027,16),discs=[];
  let h=7;const rnd=()=>(h=Math.imul(h^h>>>15,2246822519)+0x6D2B79F5|0,(h>>>0)/4294967296);
  CAT.forEach((row,y)=>[...row].forEach((ch,x)=>{const d=new T.Group();d.position.set((x-5.5)*.066,(3.5-y)*.066,.034);const a=new T.Mesh(dg,yel),b=new T.Mesh(dg,blk);a.position.z=.002;b.position.z=-.002;b.rotation.y=Math.PI;d.add(a,b);g.add(d);
   discs.push({d,on:ch==='#',scr:rnd()<.3,ts:1.6+rnd()*.35,tb:2.6+rnd()*2.2,rot:ch==='#'?0:Math.PI})}));
  const upd=(t,dt)=>{const u=t%7;for(const q of discs){const flipped=q.scr&&u>=q.ts&&u<q.tb,want=(q.on!==flipped)?0:Math.PI;q.rot+=(want-q.rot)*Math.min(1,dt*22);q.d.rotation.x=q.rot}};
  upd(0,1);g.scale.setScalar(.88);g.position.y=.1;g.rotation.y=-.3;g.rotation.x=-.06;
  return{obj:g,mats,tick:(t,dt)=>upd(t,dt||.016)}}
