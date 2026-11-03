// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Backprop Waterworks: a walnut board with three glass tanks joined by glass pipes; water in the right reservoir, dye in the left one and in the outlet, dye beads climbing back up a pipe
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.4,metalness:.4,roughness:.35},o));
export default function waterworks(T,col){const g=new T.Group(),mats=[],brass=M(T,0xc9a050,{metalness:.9,roughness:.3,emissiveIntensity:.08}),wood=M(T,0x3a2414,{metalness:0,roughness:.75,emissiveIntensity:.04});
  const bd=new T.Mesh(new T.BoxGeometry(.8,.88,.03),wood);bd.position.z=-.17;g.add(bd);
  for(const[x,y]of[[-.36,.4],[.36,.4],[-.36,-.4],[.36,-.4]]){const r=new T.Mesh(new T.SphereGeometry(.014,8,6),brass);r.position.set(x,y,-.15);g.add(r)}
  const glass=new T.MeshStandardMaterial({color:0xe6f6ff,transparent:true,opacity:.24,roughness:.05,metalness:.1,depthWrite:false,side:T.DoubleSide});
  const dye=M(T,col,{emissiveIntensity:.75,metalness:0,roughness:.25,transparent:true,opacity:.92});mats.push(dye);
  const pink=M(T,0xff5a7e,{emissiveIntensity:.35,metalness:0,roughness:.25,transparent:true,opacity:.88});
  const water=M(T,0x8cc4d2,{emissiveIntensity:.25,metalness:0,roughness:.2,transparent:true,opacity:.75});
  const tank=(x,y,r,h,lv,wm,fun)=>{const t=new T.Group();t.position.set(x,y,0);g.add(t);
   const w=new T.Mesh(new T.CylinderGeometry(r*.9,r*.9,h*lv,28),wm);w.position.y=-h/2+h*lv/2;t.add(w);
   t.add(new T.Mesh(new T.CylinderGeometry(r,r,h,28,1,true),glass));
   for(const s of[-1,1]){const c=new T.Mesh(new T.TorusGeometry(r+.004,.01,6,28),brass);c.rotation.x=Math.PI/2;c.position.y=s*h/2;t.add(c)}
   const b=new T.Mesh(new T.CylinderGeometry(r+.02,r+.03,.03,28),brass);b.position.y=-h/2-.02;t.add(b);
   if(fun){const f=new T.Mesh(new T.CylinderGeometry(r*.95,r*.5,.07,24,1,true),brass);f.position.y=h/2+.045;t.add(f)}};
  tank(-.2,.21,.1,.24,.62,pink,true);tank(.2,.21,.1,.24,.78,water,true);tank(0,-.22,.125,.26,.58,dye,false);
  // pipes: out of the bottom of each reservoir, back towards the board, down into the outlet
  const V=(x,y,z)=>new T.Vector3(x,y,z);
  const pipe=(x0,x1,wm)=>{const c=new T.CatmullRomCurve3([V(x0,.06,0),V(x0,.0,-.07),V(x1,-.02,-.08),V(x1,-.07,0)],false,'centripetal');
   g.add(new T.Mesh(new T.TubeGeometry(c,28,.02,8,false),glass));g.add(new T.Mesh(new T.TubeGeometry(c,28,.011,6,false),wm));return c};
  const up=pipe(-.2,-.04,dye);pipe(.2,.04,water);
  // a valve wheel on the outlet
  const wh=new T.Mesh(new T.TorusGeometry(.04,.007,6,20),brass);wh.position.set(.19,-.33,.02);g.add(wh);
  const st=new T.Mesh(new T.CylinderGeometry(.008,.008,.07,6),brass);st.rotation.z=Math.PI/2;st.position.set(.15,-.33,.02);g.add(st);
  const bm=M(T,col,{emissiveIntensity:1.1,metalness:0,roughness:.3});mats.push(bm);
  const beads=[0,1,2].map(()=>{const b=new T.Mesh(new T.SphereGeometry(.016,10,8),bm);g.add(b);return b});
  const upd=t=>{beads.forEach((b,i)=>{const u=((t*.35+i/3)%1);b.position.copy(up.getPoint(1-u))});wh.rotation.z=-t*.8;dye.emissiveIntensity=.65+.15*Math.sin(t*2.2)};
  upd(.15);g.rotation.y=.28;g.rotation.x=.08;
  return{obj:g,mats,tick:t=>upd(t)}}
