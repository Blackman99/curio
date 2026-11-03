// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Budget Fuse Box: a black car fuse tray; one red blade fuse blown and spitting sparks, one intact, a tan budget fuse, and a glowing paperclip jammed in the last slot
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.4,metalness:.4,roughness:.35},o));
export default function fusebox(T,col){const g=new T.Group(),mats=[],abs=M(T,0x1c1e21,{metalness:.2,roughness:.75,emissiveIntensity:.03}),hole=M(T,0x050506,{metalness:0,roughness:1,emissiveIntensity:0}),steel=M(T,0xd9dde2,{metalness:.9,roughness:.25,emissiveIntensity:.05});
  const tray=new T.Mesh(new T.BoxGeometry(.74,.12,.38),abs);tray.position.y=-.28;g.add(tray);
  const rim=new T.Mesh(new T.BoxGeometry(.78,.03,.42),M(T,0x2a2d31,{metalness:.2,roughness:.6,emissiveIntensity:.03}));rim.position.y=-.215;g.add(rim);
  const X=[-.255,-.085,.085,.255];X.forEach(x=>{const h=new T.Mesh(new T.BoxGeometry(.14,.012,.07),hole);h.position.set(x,-.2,0);g.add(h)});
  const fuse=(x,c,blown)=>{const f=new T.Group();f.position.set(x,-.1,0);g.add(f);
   const body=new T.Mesh(new T.BoxGeometry(.13,.14,.045),new T.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:.08,metalness:.05,roughness:.4,transparent:true,opacity:.9}));f.add(body);mats.push(body.material);
   const cap=new T.Mesh(new T.BoxGeometry(.135,.03,.05),M(T,c,{metalness:.05,roughness:.55,emissiveIntensity:.06}));cap.position.y=.08;f.add(cap);
   for(const s of[-1,1]){const l=new T.Mesh(new T.BoxGeometry(.028,.06,.012),steel);l.position.set(s*.042,-.09,0);f.add(l)}
   const link=M(T,blown?0x2a1a10:0xe8eaed,{metalness:.8,roughness:.3,emissiveIntensity:blown?0:.15});
   if(blown){for(const s of[-1,1]){const p=new T.Mesh(new T.BoxGeometry(.03,.008,.006),link);p.position.set(s*.03,-.01,.024);f.add(p)}
    const soot=new T.Mesh(new T.CircleGeometry(.04,10),new T.MeshBasicMaterial({color:0x0a0604,transparent:true,opacity:.7}));soot.position.set(0,-.005,.0235);f.add(soot)}
   else{const p=new T.Mesh(new T.BoxGeometry(.09,.008,.006),link);p.position.set(0,-.01,.024);f.add(p)}
   return f};
  fuse(X[0],0xd8332b,false);fuse(X[1],0xd8332b,true);fuse(X[2],0xb8894f,false);
  // paperclip in the last slot, hot
  const pts=[[-.05,-.07],[-.05,.08],[.05,.08],[.05,-.04],[-.03,-.04],[-.03,.05],[.03,.05],[.03,-.02]].map(([x,y])=>new T.Vector3(x,y,0));
  const hotM=M(T,0xff7a2a,{metalness:.6,roughness:.3,emissiveIntensity:.9});mats.push(hotM);
  const clip=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts,false,'catmullrom',.15),60,.007,6,false),hotM);clip.position.set(X[3],-.12,0);clip.rotation.z=-.12;g.add(clip);
  // sparks above the blown fuse
  const N=18,pa=new Float32Array(N*3),pg=new T.BufferGeometry();pg.setAttribute('position',new T.BufferAttribute(pa,3));
  const sp=new T.Points(pg,new T.PointsMaterial({color:0xffd27a,size:.03,transparent:true,opacity:.95}));g.add(sp);
  const upd=t=>{for(let i=0;i<N;i++){const u=((t*1.6+i*.137)%1),a=-1.2+i*2.4/N*1+.3*Math.sin(i*7.3),r=u*.22;pa[i*3]=X[1]+Math.sin(a)*r;pa[i*3+1]=-.04+Math.cos(a)*r*1.1-u*u*.12;pa[i*3+2]=.03+Math.sin(i*3.1)*.03}pg.attributes.position.needsUpdate=true;
   hotM.emissiveIntensity=.75+.25*Math.sin(t*5)};
  upd(.35);g.rotation.x=.32;g.rotation.y=-.28;
  return{obj:g,mats,tick:t=>upd(t)}}
