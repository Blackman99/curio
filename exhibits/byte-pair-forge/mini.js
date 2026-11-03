// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Byte Pair Forge: mini anvil + glowing billet + hammer arc
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.4,metalness:.4,roughness:.35},o));
export default function forge(T,col){const g=new T.Group(),mats=[],iron=M(T,0x2a2420,{metalness:.85,roughness:.4,emissiveIntensity:.08}),hot=M(T,col,{metalness:.3,roughness:.35,emissiveIntensity:.7});mats.push(iron,hot);
  // anvil body
  const base=new T.Mesh(new T.BoxGeometry(.42,.08,.22),iron);base.position.y=-.28;g.add(base);
  const horn=new T.Mesh(new T.BoxGeometry(.18,.06,.1),iron);horn.position.set(-.22,-.22,0);g.add(horn);
  const top=new T.Mesh(new T.BoxGeometry(.36,.05,.16),iron);top.position.y=-.2;g.add(top);
  // glowing billet on anvil
  const billet=new T.Mesh(new T.BoxGeometry(.22,.05,.08),hot);billet.position.y=-.15;g.add(billet);
  // hammer group pivoting above
  const hm=new T.Group();hm.position.set(.12,.05,0);
  const handle=new T.Mesh(new T.CylinderGeometry(.012,.014,.28,6),M(T,0x5a3828,{metalness:.2,emissiveIntensity:.05}));handle.position.y=.1;hm.add(handle);
  const head=new T.Mesh(new T.BoxGeometry(.12,.06,.06),M(T,0x8a8480,{metalness:.9,roughness:.25,emissiveIntensity:.1}));head.position.set(0,-.05,0);hm.add(head);
  g.add(hm);
  // small spark dots
  const N=30,pa=new Float32Array(N*3),seed=[];for(let i=0;i<N;i++)seed.push([Math.random()*6.28,.05+Math.random()*.15,Math.random()]);
  const pg=new T.BufferGeometry();pg.setAttribute('position',new T.BufferAttribute(pa,3));
  const upd=(t)=>{hm.rotation.z=-.6+Math.sin(t*2.2)*.55;const hit=Math.sin(t*2.2);billet.material.emissiveIntensity=.45+Math.max(0,hit)*.5;
   for(let i=0;i<N;i++){const[a,r,ph]=seed[i],u=(t*1.5+ph)%1,k=a;pa[i*3]=Math.cos(k)*r*u*2;pa[i*3+1]=.05+u*.35;pa[i*3+2]=Math.sin(k)*r*u*1.2}pg.attributes.position.needsUpdate=true};
  upd(.8);g.add(new T.Points(pg,new T.PointsMaterial({color:col,size:.02,transparent:true,opacity:.85})));
  g.rotation.y=-.25;g.rotation.x=.2;
  return{obj:g,mats,tick:t=>upd(t)}}
