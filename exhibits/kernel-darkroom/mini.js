// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Kernel Darkroom: a small enlarger on its baseboard throwing a red cone of light onto a print, a 3x3 filter card in the drawer, and a developing tray beside it with a second print coming up
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.25,metalness:.6,roughness:.4},o));
function printCanvas(T,dev){const S=128,cv=document.createElement('canvas');cv.width=cv.height=S;const c=cv.getContext('2d'),im=c.createImageData(S,S),D=im.data;
  const h=x=>.40+.09*Math.sin(x*9.1+1.3)+.05*Math.sin(x*23+.4)+.025*Math.sin(x*61)-.16*Math.exp(-((x-.55)*(x-.55))*50);
  const tone=(x,y)=>{if(y<h(x))return .62+.3*(y/h(x));const rv=.70+.13*Math.sin(x*5.2+.3)-.4*(x-.5)*(x-.5);const d=Math.abs(y-rv);if(d<.03+.025*x)return .95;if(y<.52)return .3;return .12+.06*Math.sin(x*37)*Math.sin(y*29)};
  for(let y=0;y<S;y++)for(let x=0;x<S;x++){const u=x/S,v=y/S,e=1.5/S;let t=tone(u,v)+1.6*(tone(u+e,v+e)-tone(u-e,v-e));t=Math.max(0,Math.min(1,t));t=1-(1-t)*dev;
    const o=(y*S+x)*4;D[o]=Math.round(20+235*Math.pow(t,.8));D[o+1]=Math.round(3+90*t*t*t);D[o+2]=Math.round(2+70*t*t*t);D[o+3]=255}
  c.putImageData(im,0,0);c.strokeStyle='#ffcab9';c.lineWidth=7;c.strokeRect(0,0,S,S);const tx=new T.CanvasTexture(cv);tx.colorSpace=T.SRGBColorSpace;return tx}
export default function kernelDarkroom(T,col){
  const obj=new T.Group(),mats=[];
  const board=new T.Mesh(new T.BoxGeometry(.78,.035,.52),M(T,0x2a1712,{emissiveIntensity:.05,metalness:.1,roughness:.8}));board.position.y=-.13;obj.add(board);
  const easel=new T.Mesh(new T.BoxGeometry(.36,.012,.36),M(T,0x8a8478,{emissiveIntensity:0,metalness:.2,roughness:.6}));easel.position.set(-.08,-.106,.04);obj.add(easel);
  const ptex=printCanvas(T,1),pmat=new T.MeshStandardMaterial({color:0x8a7c74,map:ptex,emissive:0xffffff,emissiveMap:ptex,emissiveIntensity:.35,roughness:.7});mats.push(pmat);
  const pr=new T.Mesh(new T.PlaneGeometry(.3,.3),pmat);pr.rotation.x=-Math.PI/2;pr.position.set(-.08,-.099,.04);obj.add(pr);
  const steel=M(T,0x6e6a66,{emissiveIntensity:.03,metalness:.85,roughness:.35});
  const colm=new T.Mesh(new T.CylinderGeometry(.016,.016,.36,16),steel);colm.position.set(-.08,.05,-.19);obj.add(colm);
  const arm=new T.Mesh(new T.BoxGeometry(.05,.035,.15),steel);arm.position.set(-.08,.17,-.12);obj.add(arm);
  const headm=M(T,0x1d1412,{emissiveIntensity:.05,metalness:.4,roughness:.5});
  const head=new T.Mesh(new T.BoxGeometry(.2,.09,.17),headm);head.position.set(-.08,.18,.02);obj.add(head);
  const lamp=new T.Mesh(new T.CylinderGeometry(.06,.085,.06,24),headm);lamp.position.set(-.08,.25,.02);obj.add(lamp);
  const lens=new T.Mesh(new T.CylinderGeometry(.035,.04,.05,20),M(T,0x111111,{emissiveIntensity:.02,metalness:.7,roughness:.25}));lens.position.set(-.08,.115,.04);obj.add(lens);
  const glow=M(T,0xff3b1f,{emissiveIntensity:.9,metalness:0,roughness:.5});mats.push(glow);
  const lensGlass=new T.Mesh(new T.CircleGeometry(.03,20),glow);lensGlass.rotation.x=Math.PI/2;lensGlass.position.set(-.08,.089,.04);obj.add(lensGlass);
  const coneMat=new T.MeshBasicMaterial({color:0xff3b1f,transparent:true,opacity:.13,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide});
  const cone=new T.Mesh(new T.CylinderGeometry(.03,.2,.19,4,1,true),coneMat);cone.rotation.y=Math.PI/4;cone.position.set(-.08,-.004,.04);obj.add(cone);
  // the filter card in the drawer: a 3x3 grid of little squares
  const drawer=new T.Mesh(new T.BoxGeometry(.03,.05,.13),M(T,0x3a1c16,{emissiveIntensity:.05,metalness:.3,roughness:.6}));drawer.position.set(.035,.18,.02);obj.add(drawer);
  const kv=[-2,-1,0,-1,1,1,0,1,2],cellG=new T.BoxGeometry(.006,.012,.012);
  kv.forEach((v,i)=>{const m=v>0?glow:M(T,v<0?0x4a0c06:0x1a0806,{emissiveIntensity:.1,metalness:.2,roughness:.6});const c=new T.Mesh(cellG,m);c.position.set(.052,.195-Math.floor(i/3)*.016,-.016+(i%3)*.016);c.scale.set(1,1,1);obj.add(c)});
  // developing tray with a second print still coming up
  const trayM=M(T,0x5a1a12,{emissiveIntensity:.08,metalness:.2,roughness:.35});
  const tray=new T.Group();tray.position.set(.26,-.112,.1);obj.add(tray);
  const tb=new T.Mesh(new T.BoxGeometry(.2,.008,.16),trayM);tray.add(tb);
  for(const [w,d,x,z] of [[.2,.008,0,.076],[.2,.008,0,-.076],[.008,.16,.096,0],[.008,.16,-.096,0]]){const s=new T.Mesh(new T.BoxGeometry(w,.03,d),trayM);s.position.set(x,.015,z);tray.add(s)}
  const t2=printCanvas(T,.45),p2m=new T.MeshStandardMaterial({color:0x8a7c74,map:t2,emissive:0xffffff,emissiveMap:t2,emissiveIntensity:.3,roughness:.4});mats.push(p2m);
  const p2=new T.Mesh(new T.PlaneGeometry(.15,.12),p2m);p2.rotation.x=-Math.PI/2;p2.position.y=.01;tray.add(p2);
  const bulb=new T.Mesh(new T.SphereGeometry(.025,16,12),glow);bulb.position.set(.3,.08,-.19);obj.add(bulb);
  const bstem=new T.Mesh(new T.CylinderGeometry(.006,.006,.21,8),steel);bstem.position.set(.3,-.02,-.19);obj.add(bstem);
  obj.rotation.x=.42;obj.position.y=-.2;obj.scale.setScalar(.88);
  return{obj,mats,tick(t){coneMat.opacity=.11+.04*Math.sin(t*1.7);p2.rotation.z=.04*Math.sin(t*1.2);p2m.emissiveIntensity=.28+.06*Math.sin(t*.9)}};
}
