// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// t-SNE Planisphere: a navy star disk in a brass ring tilted toward you, coloured stars gathered into constellations with faint figure lines, a rust arc for the exaggerated steps, a brass pointer, and a loupe holding one handwritten digit; the disk turns slowly
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.4,metalness:.4,roughness:.35},o));
export default function planisphere(T,col){const g=new T.Group(),mats=[],R=.4,brass=M(T,0xd2ad62,{metalness:.85,roughness:.3,emissiveIntensity:.08}),disk=new T.Group();g.add(disk);
  const sky=new T.Mesh(new T.CylinderGeometry(R,R,.03,72),new T.MeshBasicMaterial({color:0x14224a}));disk.add(sky);
  const band=new T.Mesh(new T.RingGeometry(R+.005,R+.07,96),M(T,0x3b311b,{emissiveIntensity:.05,metalness:.5,roughness:.5,side:T.DoubleSide}));band.rotation.x=-Math.PI/2;band.position.y=.016;g.add(band);
  const ex=new T.Mesh(new T.RingGeometry(R+.008,R+.067,32,1,0,Math.PI/2),M(T,0xc25a3f,{emissiveIntensity:.25,metalness:.2,roughness:.5,side:T.DoubleSide}));ex.rotation.x=-Math.PI/2;ex.rotation.z=0;ex.position.y=.017;g.add(ex);
  for(const r of [R+.005,R+.072]){const t=new T.Mesh(new T.TorusGeometry(r,.007,8,96),brass);t.rotation.x=Math.PI/2;t.position.y=.018;g.add(t)}
  const base=new T.Mesh(new T.CylinderGeometry(R+.09,R+.1,.05,72),M(T,0x241c10,{metalness:.3,roughness:.6,emissiveIntensity:.03}));base.position.y=-.03;g.add(base);
  const tk=new T.BoxGeometry(.004,.006,.024);for(let k=0;k<40;k++){const a=k/40*Math.PI*2,m=new T.Mesh(tk,brass);m.position.set(Math.cos(a)*(R+.058),.021,Math.sin(a)*(R+.058));m.rotation.y=-a+Math.PI/2;g.add(m)}
  const ptr=new T.Mesh(new T.ConeGeometry(.018,.05,10),brass);ptr.rotation.x=Math.PI/2;ptr.position.set(0,.03,-(R+.1));g.add(ptr);
  const pal=[0xff7b6b,0xffb35c,0xf2e46b,0xa6e36b,0x4fd6a8,0x54c8f0,0x7d9bff,0xb98cff],sg=new T.SphereGeometry(.0105,10,8);
  let s=11;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;
  const ctr=[[-.2,-.14],[.03,-.25],[.22,-.12],[.24,.12],[.04,.25],[-.2,.15],[-.03,.02],[-.27,-.0]];const pts=[];
  ctr.forEach((c,k)=>{const m=M(T,pal[k],{emissive:new T.Color(pal[k]).multiplyScalar(.55),emissiveIntensity:.9,metalness:0,roughness:.4});mats.push(m);const p=[];
   for(let i=0;i<8;i++){const x=c[0]+(rnd()+rnd()-1)*.075,z=c[1]+(rnd()+rnd()-1)*.075;const st=new T.Mesh(sg,m);st.position.set(x,.02,z);st.scale.setScalar(.8+rnd()*.7);disk.add(st);p.push(new T.Vector3(x,.017,z))}
   const seg=[];const used=[0];while(used.length<p.length){let best=null;for(const a of used)for(let b=0;b<p.length;b++){if(used.includes(b))continue;const d=p[a].distanceTo(p[b]);if(!best||d<best[2])best=[a,b,d]}used.push(best[1]);seg.push(p[best[0]],p[best[1]])}
   disk.add(new T.LineSegments(new T.BufferGeometry().setFromPoints(seg),new T.LineBasicMaterial({color:pal[k],transparent:true,opacity:.45})));pts.push(p)});
  const dust=[];for(let i=0;i<60;i++){const a=rnd()*6.283,r=Math.sqrt(rnd())*R*.95;dust.push(new T.Vector3(Math.cos(a)*r,.0165,Math.sin(a)*r))}
  disk.add(new T.Points(new T.BufferGeometry().setFromPoints(dust),new T.PointsMaterial({color:0xefe6cf,size:.006,transparent:true,opacity:.5})));
  const cv=document.createElement('canvas');cv.width=cv.height=80;const c2=cv.getContext('2d');c2.fillStyle='#070c1c';c2.fillRect(0,0,80,80);c2.fillStyle='#54c8f0';
  const five=['..XXXXX.','.XX.....','.X......','.XXXXX..','......X.','......X.','.X...XX.','..XXXX..'];five.forEach((r,j)=>[...r].forEach((ch,i)=>{if(ch==='X')c2.fillRect(8+i*8+1,8+j*8+1,6,6)}));
  const lp=new T.Group(),glass=new T.Mesh(new T.CircleGeometry(.075,40),new T.MeshBasicMaterial({map:new T.CanvasTexture(cv)}));lp.add(glass);
  const lr=new T.Mesh(new T.TorusGeometry(.078,.009,10,48),brass);lp.add(lr);const stalk=new T.Mesh(new T.CylinderGeometry(.004,.004,.12,6),brass);stalk.position.set(0,-.09,0);lp.add(stalk);
  lp.position.set(-.12,.17,.06);g.add(lp);
  const upd=t=>{disk.rotation.y=t*.12};
  upd(0);g.rotation.x=.62;g.position.y=-.03;lp.rotation.x=-.62;g.scale.setScalar(.86);
  return{obj:g,mats,tick:t=>upd(t)}}
