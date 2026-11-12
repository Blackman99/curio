// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Reading Stone: a sheet of The Sun (25 August 1835) tipped toward you, with a rock-crystal hemisphere gliding over it; under the dome the same print shows 1.55 times larger (a hemisphere magnifies by its refractive index)
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.25,metalness:.6,roughness:.4},o));
export default function readingStone(T,col){const root=new T.Group(),g=new T.Group(),mats=[];root.add(g);
  g.rotation.x=.5;g.position.set(0,-.2,.04);g.scale.setScalar(.88);
  // the page: masthead, rules and five columns of small print
  const W=1024,H=736,cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d');
  x.fillStyle='#efe6d1';x.fillRect(0,0,W,H);x.fillStyle='#231a12';x.strokeStyle='#231a12';
  x.lineWidth=3;x.beginPath();x.moveTo(40,34);x.lineTo(W-40,34);x.moveTo(40,128);x.lineTo(W-40,128);x.stroke();
  x.font='700 76px Georgia,serif';x.textAlign='center';x.fillText('THE SUN.',W/2,112);
  x.font='italic 20px Georgia,serif';x.textAlign='left';x.fillText('New-York,',40,112);x.textAlign='right';x.fillText('August 25, 1835.',W-40,112);
  const words='It is impossible to contemplate any great Astronomical discovery without feelings closely allied to a sensation of awe the weight of this ponderous lens was 14,826 lbs. and its estimated magnifying power 42,000 times'.split(' ');
  let wi=0,seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
  x.textAlign='left';x.font='17px Georgia,serif';const cw=(W-80-4*16)/5;
  for(let c=0;c<5;c++){const x0=40+c*(cw+16);if(c)x.fillRect(x0-9,146,1,H-176);
    for(let y=160;y<H-30;y+=21){let s='',xx=x0;while(true){const w=words[wi%words.length];const ww=x.measureText(w+' ').width;if(xx+ww>x0+cw)break;x.fillText(w,xx,y);xx+=ww;wi++}if(rnd()<.06)y+=5}}
  const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=4;
  const PW=.86,PH=PW*H/W,page=new T.Mesh(new T.PlaneGeometry(PW,PH),new T.MeshStandardMaterial({map:tex,color:0x8a8478,roughness:.95,metalness:0}));
  page.rotation.x=-Math.PI/2;g.add(page);
  const back=new T.Mesh(new T.BoxGeometry(PW+.03,.02,PH+.03),M(T,0x2a1d12,{emissiveIntensity:.05,metalness:.1,roughness:.8}));back.position.y=-.011;g.add(back);
  // under the dome: the same print, 1.55x larger (texture window shrunk by m about the dome's centre)
  const r=.15,m=1.55,mt=tex.clone();mt.needsUpdate=true;mt.repeat.set(2*r/PW/m,2*r/PH/m);
  const lensMat=new T.MeshStandardMaterial({map:mt,color:0x8a8478,emissive:new T.Color(0xfff2d8),emissiveMap:mt,emissiveIntensity:0,roughness:.6,metalness:0});
  const patch=new T.Mesh(new T.CircleGeometry(r*.985,48),lensMat);patch.rotation.x=-Math.PI/2;patch.position.y=.002;g.add(patch);mats.push(lensMat);
  // the stone: a clear hemisphere with a bright rim and a soft shadow
  const dome=new T.Mesh(new T.SphereGeometry(r,48,24,0,Math.PI*2,0,Math.PI/2),new T.MeshStandardMaterial({color:0xdfe9f2,transparent:true,opacity:.34,metalness:.45,roughness:.03,depthWrite:false}));
  const rim=new T.Mesh(new T.TorusGeometry(r,.006,8,64),new T.MeshStandardMaterial({color:0xe8f0f6,metalness:.5,roughness:.15,transparent:true,opacity:.85}));rim.rotation.x=Math.PI/2;
  const glintMat=M(T,new T.Color(col).lerp(new T.Color(0xffffff),.5).getHex(),{emissiveIntensity:.35,metalness:0,roughness:.2,transparent:true,opacity:.5});
  const glint=new T.Mesh(new T.SphereGeometry(.025,12,8),glintMat);glint.scale.set(1,.35,1);glint.position.set(-.05,r*.93,-.05);mats.push(glintMat);
  const sh=new T.Mesh(new T.CircleGeometry(r*1.18,40),new T.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.22,depthWrite:false}));sh.rotation.x=-Math.PI/2;sh.position.set(.04,.001,.05);
  const stone=new T.Group();stone.add(dome,rim,glint);g.add(sh,stone);
  const put=(u,v)=>{stone.position.set(u,0,v);patch.position.x=u;patch.position.z=v;sh.position.set(u+.04,.001,v+.05);
    // texture window centred on the page point under the dome
    mt.offset.set((u+PW/2)/PW-mt.repeat.x/2,1-(v+PH/2)/PH-mt.repeat.y/2)};
  put(-.12,.02);
  return{obj:root,mats,tick:(t)=>{put(-.12+.13*Math.sin(t*.35),.02+.06*Math.sin(t*.23))}};
}
