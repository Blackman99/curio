// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Podium Machine: a 3-step results podium; three toy contestants hop and swap places, the red crown rides whoever is No.1
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.4,metalness:.4,roughness:.35},o));
export default function podium(T,col){const g=new T.Group(),mats=[],paper=M(T,0xf1f0eb,{metalness:.05,roughness:.85,emissiveIntensity:.12}),red=M(T,col,{metalness:.2,roughness:.5,emissiveIntensity:.5}),ink=M(T,0x161616,{metalness:.3,roughness:.6,emissiveIntensity:.05});mats.push(paper,red,ink);
  const SX=[0,-.27,.27],SH=[.3,.2,.13];// slot 0 = No.1 (centre), 1 = No.2 (left), 2 = No.3 (right)
  SX.forEach((x,i)=>{const b=new T.Mesh(new T.BoxGeometry(.25,SH[i],.24),i?paper:red);b.position.set(x,-.38+SH[i]/2,0);g.add(b);
   const n=new T.Mesh(new T.BoxGeometry(.06,.06,.01),i?ink:paper);n.position.set(x,-.38+SH[i]*.62,.125);n.scale.y=i===0?1.4:1;g.add(n)});
  const base=new T.Mesh(new T.BoxGeometry(.86,.03,.32),ink);base.position.y=-.395;g.add(base);
  const figs=[0,1,2].map(i=>{const f=new T.Group(),bd=new T.Mesh(new T.BoxGeometry(.09,.13,.09),i===2?paper:ink);bd.position.y=.065;f.add(bd);
   const hd=new T.Mesh(new T.BoxGeometry(.065,.065,.065),i===2?paper:ink);hd.position.y=.17;f.add(hd);g.add(f);return f});
  const crown=new T.Group(),cb=new T.Mesh(new T.CylinderGeometry(.05,.045,.035,5,1,true),red);crown.add(cb);
  for(let k=0;k<5;k++){const sp=new T.Mesh(new T.ConeGeometry(.014,.045,4),red);const a=k/5*Math.PI*2;sp.position.set(Math.cos(a)*.045,.035,Math.sin(a)*.045);crown.add(sp)}g.add(crown);
  const P=[[0,1,2],[2,0,1],[1,2,0],[0,2,1],[2,1,0],[1,0,2]];// P[k][fig] = slot
  const top=s=>-.38+SH[s],sm=u=>u*u*(3-2*u);
  const upd=t=>{const per=1.5,p=t/per,k=Math.floor(p),u=p-k,a=P[((k%6)+6)%6],b=P[(((k+1)%6)+6)%6],w=sm(Math.max(0,(u-.55)/.45));
   let lead=null;figs.forEach((f,i)=>{const x=SX[a[i]]+(SX[b[i]]-SX[a[i]])*w,y=top(a[i])+(top(b[i])-top(a[i]))*w+Math.sin(Math.PI*w)*.22;f.position.set(x,y,0);f.rotation.y=w*Math.PI*2*(a[i]!==b[i]?1:0);
    if((w<.5?a[i]:b[i])===0)lead=f});
   crown.position.set(lead.position.x,lead.position.y+.235+Math.sin(Math.PI*w)*.06,0);crown.rotation.y=t*1.2};
  upd(.3);g.rotation.y=-.38;g.rotation.x=.22;
  return{obj:g,mats,tick:t=>upd(t)}}
