// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Random Forest: a round walnut plinth, a square meadow tinted amber and jade in rectangles by the forest's vote, a ring of small trees with amber and jade leaf clusters behind it, a lantern on the meadow and one leaf drifting down to it
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.4,metalness:.4,roughness:.35},o));
export default function grove(T,col){const g=new T.Group(),mats=[];let sd=7;const r=()=>(sd=sd*16807%2147483647)/2147483647;
  const base=new T.Mesh(new T.CylinderGeometry(.44,.45,.06,48),M(T,0x3a2416,{emissiveIntensity:.04,metalness:.1,roughness:.6}));base.position.y=-.03;g.add(base);
  const trim=new T.Mesh(new T.TorusGeometry(.446,.008,6,72),M(T,0xc8a050,{metalness:.9,roughness:.3,emissiveIntensity:.1}));trim.rotation.x=Math.PI/2;trim.position.y=-.004;g.add(trim);
  const moss=new T.Mesh(new T.CircleGeometry(.44,48),M(T,0x1f2d18,{emissiveIntensity:.06,metalness:0,roughness:1}));moss.rotation.x=-Math.PI/2;moss.position.y=.001;g.add(moss);
  const c=document.createElement('canvas');c.width=c.height=96;const x=c.getContext('2d');x.fillStyle='#9a5226';x.fillRect(0,0,96,96);x.fillStyle='#1f8468';
  [[0,52,60,44],[52,40,44,56],[30,44,30,10],[78,0,18,44],[60,34,12,8]].forEach(a=>x.fillRect(...a));
  for(let i=0;i<46;i++){const t=r()*Math.PI,k=i&1,px=k?(1-Math.cos(t))*30+30:Math.cos(t)*30+38,py=k?62-Math.sin(t)*26:44-Math.sin(t)*30;
   x.fillStyle=k?'#7ff0cf':'#ffc48a';x.beginPath();x.arc(px+(r()-.5)*8,py+(r()-.5)*8,2.2,0,7);x.fill()}
  const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;
  const S=.4,mead=new T.Mesh(new T.PlaneGeometry(S,S),new T.MeshStandardMaterial({map:tex,emissiveMap:tex,emissive:0xffffff,emissiveIntensity:.18,roughness:.9}));mead.rotation.x=-Math.PI/2;mead.position.set(0,.012,.06);g.add(mead);
  const rim=new T.Mesh(new T.BoxGeometry(S+.024,.016,S+.024),M(T,0x5a3a22,{emissiveIntensity:.05,metalness:0,roughness:.6}));rim.position.set(0,.003,.06);g.add(rim);
  const A=new T.Color(0xf39a4a),B=new T.Color(0x4fd1ae);
  const la=M(T,0xf39a4a,{emissive:A.clone().multiplyScalar(.5),emissiveIntensity:.7,metalness:0,roughness:.6,flatShading:true}),lb=M(T,0x4fd1ae,{emissive:B.clone().multiplyScalar(.5),emissiveIntensity:.7,metalness:0,roughness:.6,flatShading:true});mats.push(la,lb);
  const bark=M(T,0x3a2414,{emissiveIntensity:.05,metalness:0,roughness:.8}),ico=new T.IcosahedronGeometry(1,0),cyl=new T.CylinderGeometry(.7,1,1,5);cyl.translate(0,.5,0);const UP=new T.Vector3(0,1,0);
  // each little tree forks like a decision tree: a trunk, two or three levels of branches, a leaf cluster on every tip
  const tree=(px,pz,s)=>{const t=new T.Group(),tops=[];t.position.set(px,0,pz);t.scale.setScalar(s);t.rotation.y=r()*6.3;g.add(t);
   const grow=(p,d,len,rad,dp)=>{const m=new T.Mesh(cyl,bark);m.position.copy(p);m.quaternion.setFromUnitVectors(UP,d);m.scale.set(rad,len,rad);t.add(m);const e=p.clone().addScaledVector(d,len);
    if(dp>=2||dp>0&&r()<.3){tops.push(e);return}const ax=new T.Vector3(Math.cos(dp*2.4+s*9),0,Math.sin(dp*2.4+s*9));
    for(const sg of[1,-1])grow(e,d.clone().applyAxisAngle(ax,sg*(.5+r()*.3)).add(new T.Vector3(0,.25,0)).normalize(),len*.78,rad*.72,dp+1)};
   grow(new T.Vector3(),UP.clone(),.12,.012,0);
   tops.forEach(p=>{const b=new T.Mesh(ico,r()<.5?la:lb);b.position.copy(p);b.scale.setScalar(.03+r()*.014);t.add(b)});return{t,tops}};
  const trees=[];for(let i=0;i<9;i++){const a=-2.05+i*4.1/8,R=.355+(i&1)*.03;trees.push(tree(Math.sin(a)*R,-Math.cos(a)*R+.03,.68+r()*.2))}
  const lp=new T.Vector3(.08,.012,.04),pole=new T.Mesh(new T.CylinderGeometry(.004,.005,.1,6),bark);pole.position.set(lp.x,.06,lp.z);g.add(pole);
  const glow=M(T,0xffd27a,{emissive:0xffd27a,emissiveIntensity:1,metalness:0,roughness:.4});mats.push(glow);
  const lamp=new T.Mesh(new T.SphereGeometry(.014,12,8),glow);lamp.position.set(lp.x,.115,lp.z);g.add(lamp);
  const leaf=new T.Mesh(new T.CircleGeometry(.014,5),la);leaf.material=la;g.add(leaf);
  const t0=trees[4],from=t0.tops[0].clone().multiplyScalar(t0.t.scale.x).applyAxisAngle(UP,t0.t.rotation.y).add(t0.t.position);
  // one leaf at a time drifts from the tree behind the meadow down to the lantern, then the next
  const upd=t=>{const u=(t*.3)%1,s=u*u*(3-2*u);leaf.position.lerpVectors(from,lp,s);leaf.position.y+=Math.sin(u*Math.PI)*.08;leaf.position.x+=Math.sin(t*5)*.02*(1-s);leaf.rotation.set(-1.2+Math.sin(t*4)*.6*(1-s),t*2,Math.cos(t*3)*.5)};
  upd(1.2);g.rotation.x=.5;g.position.y=-.06;
  return{obj:g,mats,tick:t=>upd(t)}}
