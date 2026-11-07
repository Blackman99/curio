// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Counterfeit GAN: an ink chart with eight genuine stacks round the ring, a pile of identical forgeries wandering from ink to ink, and a brass loupe over it
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.25,metalness:0,roughness:.85},o));
export default function counterfeitGan(T,col){const root=new T.Group(),g=new T.Group(),mats=[];root.add(g);
  // everything sits on a board tilted toward the visitor, like a chart on an easel
  g.rotation.x=.62;g.position.set(0,.02,-.04);g.scale.setScalar(.92);
  const hsl=(h,s,l)=>`hsl(${h},${s}%,${l}%)`;
  // the chart: a card printed with the ink wheel, the rings and the spokes
  const cv=document.createElement('canvas');cv.width=cv.height=256;const x=cv.getContext('2d');
  x.fillStyle='#e8dcc2';x.fillRect(0,0,256,256);
  for(let a=0;a<360;a+=3){x.fillStyle=hsl(a,60,62);x.globalAlpha=.24;x.beginPath();x.moveTo(128,128);x.arc(128,128,124,-(a+2)*Math.PI/180,-a*Math.PI/180+.01);x.fill()}
  const rg=x.createRadialGradient(128,128,0,128,128,124);rg.addColorStop(0,'rgba(232,220,194,.95)');rg.addColorStop(.6,'rgba(232,220,194,.2)');rg.addColorStop(1,'rgba(232,220,194,0)');x.globalAlpha=1;x.fillStyle=rg;x.fillRect(0,0,256,256);
  x.strokeStyle='rgba(70,45,25,.45)';x.lineWidth=1.5;for(const r of [40,82,122]){x.beginPath();x.arc(128,128,r,0,7);x.stroke()}
  x.strokeStyle='rgba(120,85,40,.9)';x.lineWidth=4;x.beginPath();x.arc(128,128,125,0,7);x.stroke();
  const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;
  const card=new T.Mesh(new T.CylinderGeometry(.42,.43,.025,72,1,true),M(T,0x4a2e1a,{emissiveIntensity:.08}));card.position.y=-.1;g.add(card);
  const face=new T.Mesh(new T.CircleGeometry(.42,72),new T.MeshStandardMaterial({color:0x7e7a70,map:tex,emissive:0xffffff,emissiveMap:tex,emissiveIntensity:.05,roughness:.9}));
  face.rotation.x=-Math.PI/2;face.position.y=-.0875;g.add(face);
  // a banknote texture per ink
  const noteTex=(h,s,l,label)=>{const c=document.createElement('canvas');c.width=96;c.height=48;const n=c.getContext('2d');n.fillStyle=hsl(h,s,l);n.fillRect(0,0,96,48);
    n.strokeStyle=label?'#fffaf0':'#3a1010';n.lineWidth=label?5:3;n.strokeRect(2,2,92,44);
    if(label){n.fillStyle='rgba(255,255,255,.6)';n.beginPath();n.ellipse(26,24,9,12,0,0,7);n.fill();n.fillStyle='#fff';n.font='600 22px monospace';n.textAlign='center';n.textBaseline='middle';n.fillText(label,64,25)}
    const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t};
  const NG=new T.BoxGeometry(.075,.004,.038),names=['1','2','5','10','20','50','100','200'];
  for(let k=0;k<8;k++){const a=k/8*Math.PI*2,tx=noteTex(k*45,72,48,names[k]),m=new T.MeshStandardMaterial({color:0xffffff,map:tx,roughness:.7,emissive:0xffffff,emissiveMap:tx,emissiveIntensity:.18});
    for(let i=0;i<4;i++){const n=new T.Mesh(NG,m);n.position.set(Math.cos(a)*.29+(i%2-.5)*.008,-.083+i*.0045,-Math.sin(a)*.29+((i*7)%3-1)*.006);n.rotation.y=a+Math.PI/2+(i-1.5)*.12;g.add(n)}}
  // the forger's pile: one note, printed over and over
  const pile=new T.Group();g.add(pile);const ft=noteTex(280,22,70,'');
  const fm=new T.MeshStandardMaterial({color:0xffffff,map:ft,roughness:.75,emissive:0xb03040,emissiveIntensity:.12});mats.push(fm);
  for(let i=0;i<14;i++){const n=new T.Mesh(NG,fm);n.position.set(((i*5)%7-3)*.004,-.083+i*.0042,((i*3)%5-2)*.004);n.rotation.y=((i*11)%9-4)*.09;pile.add(n)}
  const tag=new T.Mesh(new T.BoxGeometry(.05,.003,.018),M(T,0xb3121e,{emissiveIntensity:.45}));tag.position.set(.045,-.02,-.03);pile.add(tag);mats.push(tag.material);
  // the brass loupe, tilted over the pile
  const loupe=new T.Group();g.add(loupe);
  const brass=new T.MeshStandardMaterial({color:0xc9973e,metalness:.85,roughness:.32,emissive:0x3a2608,emissiveIntensity:.3});
  const ring=new T.Mesh(new T.TorusGeometry(.085,.011,12,48),brass);loupe.add(ring);
  const glass=new T.Mesh(new T.CircleGeometry(.08,40),new T.MeshStandardMaterial({color:0xdff3ff,transparent:true,opacity:.22,roughness:.05,metalness:0,emissive:0x9fd8ff,emissiveIntensity:.08}));loupe.add(glass);
  const handle=new T.Mesh(new T.CylinderGeometry(.012,.016,.15,16),M(T,0x3b2416,{roughness:.5,emissiveIntensity:.12}));handle.position.set(0,-.16,0);loupe.add(handle);
  const collar=new T.Mesh(new T.CylinderGeometry(.015,.015,.025,16),brass);collar.position.set(0,-.093,0);loupe.add(collar);
  loupe.rotation.set(-1.05,0,.35);
  // the pile wanders from ink to ink, the way a collapsed forger hops between modes
  const spots=[[0,0],[.1,.06],[-.08,.1],[-.12,-.05],[.05,-.12],[.16,-.02]];
  const place=(t)=>{const s=t/2.6,i=Math.floor(s)%spots.length,j=(i+1)%spots.length,f=s-Math.floor(s),e=f<.75?0:(f-.75)/.25,w=e*e*(3-2*e);
    const px=spots[i][0]+(spots[j][0]-spots[i][0])*w,pz=spots[i][1]+(spots[j][1]-spots[i][1])*w;pile.position.set(px,0,pz);
    loupe.position.set(px+.06,.06+.012*Math.sin(t*1.7),pz+.1)};
  place(0);
  // a small brass easel foot behind the board
  const foot=new T.Mesh(new T.BoxGeometry(.5,.03,.05),brass);foot.position.set(0,-.2,-.16);root.add(foot);
  return{obj:root,mats,tick:(t)=>{place(t)}};
}
