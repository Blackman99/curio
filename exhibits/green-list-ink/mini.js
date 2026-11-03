// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Green-List Ink: a letter on a stand; a violet UV loupe drifts across it and only the green-list words glow inside its circle
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.4,metalness:.4,roughness:.35},o));
export default function greenink(T,col){const g=new T.Group(),mats=[],sh=new T.Group();sh.rotation.x=-.3;sh.position.y=.05;g.add(sh);
  sh.add(new T.Mesh(new T.BoxGeometry(.58,.76,.006),M(T,0xf3ebd8,{emissive:0x5a4a2a,emissiveIntensity:.3,metalness:0,roughness:.85})));
  const W=[],rn=k=>{const x=Math.sin(k*91.7+3.1)*43758.5453;return x-Math.floor(x)};let k=0;
  for(let r=0;r<10;r++){let x=r===9?.05:r%3===1?-.21:-.24;const y=.29-r*.066,end=r===0?-.02:.24;
   while(true){const w=.035+rn(k++)*.075;if(x+w>end)break;W.push([x+w/2,y,w,rn(k++)<.45]);x+=w+.022}}
  const bars=new T.InstancedMesh(new T.BoxGeometry(1,.017,.004),new T.MeshBasicMaterial({color:0xffffff,toneMapped:false}),W.length),m4=new T.Matrix4();
  W.forEach(([x,y,w],i)=>{m4.makeScale(w,1,1);m4.setPosition(x,y,.005);bars.setMatrixAt(i,m4);bars.setColorAt(i,new T.Color(0x2b3150))});sh.add(bars);
  const lamp=new T.Group();sh.add(lamp);
  const disc=new T.Mesh(new T.CircleGeometry(.135,40),new T.MeshBasicMaterial({color:0x5a2dff,transparent:true,opacity:.75,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false}));disc.position.z=.0045;lamp.add(disc);
  const metal=M(T,0x8d93a3,{metalness:.9,roughness:.3,emissiveIntensity:.05}),led=M(T,col,{emissiveIntensity:1.2,metalness:.1});mats.push(led);
  const ring=new T.Mesh(new T.TorusGeometry(.142,.016,10,48),metal);ring.position.z=.05;lamp.add(ring);
  for(let j=0;j<10;j++){const a=j/10*Math.PI*2,s=new T.Mesh(new T.SphereGeometry(.009,8,6),led);s.position.set(Math.cos(a)*.142,Math.sin(a)*.142,.066);lamp.add(s)}
  const hd=new T.Mesh(new T.CylinderGeometry(.022,.027,.22,12),M(T,0x1a1b22,{metalness:.3,roughness:.6,emissiveIntensity:.05}));hd.rotation.z=-Math.PI*.75;hd.position.set(.19,-.19,.05);lamp.add(hd);
  const stand=new T.Mesh(new T.BoxGeometry(.66,.04,.2),M(T,0x1a1d2e,{metalness:.6,roughness:.35,emissiveIntensity:0}));stand.position.set(0,-.38,.03);g.add(stand);
  const G=new T.Color(0xc8ff4a),U=new T.Color(0x1e1240),D=new T.Color(0x2b3150);
  const upd=t=>{const lx=.13*Math.sin(t*.7),ly=.04+.19*Math.sin(t*.43+1.1);lamp.position.set(lx,ly,0);
   W.forEach(([x,y,w,gr],i)=>bars.setColorAt(i,Math.hypot(x-lx,y-ly)<.125?(gr?G:U):D));bars.instanceColor.needsUpdate=true};
  upd(.6);return{obj:g,mats,tick:t=>upd(t)}}
