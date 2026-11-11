// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Beam Lighthouse: a black-and-white barred lighthouse on a rock in a disc of night sea, its lamp turning three beams over a little fan of word-buoys (the search tree)
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.25,metalness:.6,roughness:.4},o));
export default function beamLighthouse(T,col){const root=new T.Group(),g=new T.Group(),mats=[];root.add(g);
  g.rotation.x=.42;g.position.set(0,-.12,0);g.scale.setScalar(.92);
  // the sea: a dark disc with a lighter rim
  const sea=new T.Mesh(new T.CylinderGeometry(.44,.44,.03,64),new T.MeshStandardMaterial({color:0x0b1322,metalness:.15,roughness:.6}));sea.position.y=-.06;g.add(sea);
  const rim=new T.Mesh(new T.TorusGeometry(.44,.012,8,72),M(T,0x8a8c90,{emissiveIntensity:.05,metalness:.8,roughness:.3}));rim.rotation.x=Math.PI/2;rim.position.y=-.045;g.add(rim);
  // the rock
  const rockM=new T.MeshStandardMaterial({color:0x2a2e36,roughness:.9,metalness:.05,flatShading:true});
  [[-.15,-.03,.02,.085],[-.08,-.035,.07,.055],[-.22,-.04,-.04,.055],[-.1,-.04,-.07,.05]].forEach(([x,y,z,r])=>{const m=new T.Mesh(new T.DodecahedronGeometry(r,0),rockM);m.position.set(x,y,z);m.scale.y=.7;m.rotation.set(x*7,z*9,x*3);g.add(m)});
  // the tower, barred black and white
  const tx=-.15,ty=.02,H=.17,r0=.042,r1=.03,bands=6;
  for(let i=0;i<bands;i++){const a=r0+(r1-r0)*i/bands,b=r0+(r1-r0)*(i+1)/bands,m=new T.Mesh(new T.CylinderGeometry(b,a,H/bands,24),new T.MeshStandardMaterial({color:i%2?0x15171b:0xd8dce2,roughness:.6,metalness:.1,emissive:i%2?0x000000:0x40444c,emissiveIntensity:.25}));m.position.set(tx,ty+H*(i+.5)/bands,0);g.add(m)}
  const gal=new T.Mesh(new T.CylinderGeometry(.045,.045,.008,24),M(T,0x2a2f38,{emissiveIntensity:.05}));gal.position.set(tx,ty+H+.004,0);g.add(gal);
  const lampM=M(T,0xffd98a,{emissiveIntensity:1.1,metalness:0,roughness:.3});mats.push(lampM);
  const lamp=new T.Mesh(new T.CylinderGeometry(.024,.024,.04,20),lampM);lamp.position.set(tx,ty+H+.028,0);g.add(lamp);
  const dome=new T.Mesh(new T.SphereGeometry(.028,20,10,0,Math.PI*2,0,Math.PI/2),M(T,0x1d2128,{emissiveIntensity:.05}));dome.position.set(tx,ty+H+.048,0);g.add(dome);
  // three beams turning about the lamp
  const beams=new T.Group();beams.position.set(tx,ty+H+.028,0);g.add(beams);
  const bm=new T.MeshBasicMaterial({color:0xffd27a,transparent:true,opacity:.13,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide});
  for(let i=0;i<3;i++){const c=new T.ConeGeometry(.026,.27,20,1,true);c.translate(0,-.135,0);c.rotateZ(Math.PI/2);const m=new T.Mesh(c,bm);m.rotation.y=i*2*Math.PI/3;m.rotation.z=-.08;beams.add(m)}
  // the search tree on the water: a prompt and three columns of word-buoys, the kept ones lit
  const keptM=M(T,0xffe7b0,{emissiveIntensity:.9,metalness:0,roughness:.4}),dropM=new T.MeshStandardMaterial({color:0x56637d,roughness:.6,metalness:.1});mats.push(keptM);
  const word=(x,z,w,kept)=>{const m=new T.Mesh(new T.BoxGeometry(w,.008,.016),kept?keptM:dropM);m.position.set(x,-.038,z);g.add(m);return m};
  word(-.02,0,.1,true);
  const cols=[[.09,[[-.09,1],[-.03,1],[.03,0],[.09,0]]],[.19,[[-.13,1],[-.07,0],[0,1],[.06,0],[.12,0]]],[.29,[[-.1,1],[-.04,0],[.03,1],[.1,0]]]];
  const lineM=new T.LineBasicMaterial({color:new T.Color(col).lerp(new T.Color(0xffd98a),.6),transparent:true,opacity:.7});
  let prev=[[.03,0]];
  cols.forEach(([x,rows])=>{const next=[];rows.forEach(([z,k])=>{word(x+.03,z,.06,!!k);const p=prev[Math.abs(Math.round(z*10))%prev.length];
    const ln=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(p[0],-.036,p[1]),new T.Vector3(x,-.036,z)]),k?lineM:new T.LineBasicMaterial({color:0x3a4660}));g.add(ln);if(k)next.push([x+.06,z])});prev=next});
  // a buoy where the best sentence moors
  const buoy=new T.Mesh(new T.SphereGeometry(.012,12,8),keptM);buoy.position.set(.37,-.03,.03);g.add(buoy);
  const tick=(t)=>{beams.rotation.y=.9+t*.7;lampM.emissiveIntensity=1+.15*Math.sin(t*4.4)};
  tick(0);
  return{obj:root,mats,tick}}
