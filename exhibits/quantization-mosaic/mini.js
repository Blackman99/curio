// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Quantization Mosaic: a 2 x 2 panel of blue-and-white tiles on a little easel, painted with the page's design; the 1-bit tile is crazed, and its cracks slowly close and open as if it were being re-fired
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.25,metalness:.6,roughness:.4},o));
function ink(u,v){const u2=u*u,v2=v*v,r2=u2+v2,r=Math.sqrt(r2);if(r<.035)return 1;
  if(r>.075){const c4=(u2*u2-6*u2*v2+v2*v2)/(r2*r2);if(r<.34*(.42+.58*c4*c4))return 1}
  if(r>.47&&r<.51)return 1;const du=u-.7,dv=v-.7;if(Math.sqrt(du*du+dv*dv)<.11)return 1;
  const t=(u+v)*.7071067811865476,w=Math.abs(u-v)*.7071067811865476;if(t>.99&&t<1.22){const s=(t-.99)/.23;if(w<.22*s*(1-s))return 1}
  const cu=1-u,cv=1-v,rc=Math.sqrt(cu*cu+cv*cv);if(rc<.07||(rc>.15&&rc<.24))return 1;if(Math.abs(1-u)+1.25*v<.19)return 1;
  const eu=u-.62;return Math.sqrt(eu*eu+v2)<.045?1:0}
function tileCanvas(broken){const S=128,cv=document.createElement('canvas');cv.width=cv.height=S;const c=cv.getContext('2d'),im=c.createImageData(S,S),D=im.data;
  for(let y=0;y<S;y++)for(let x=0;x<S;x++){const X=Math.abs((2*x+1)/S-1),Y=Math.abs((2*y+1)/S-1);let u=Math.max(X,Y),v=Math.min(X,Y);
    let k=ink(u,v);
    // the 1-bit painting: the ring falls apart and the rosette swells into a blot
    if(broken){const r=Math.hypot(u,v);if(r>.44&&r<.54)k=(Math.atan2(v,u)*9.7%1)<.45?k:0;if(r<.2)k=1;if(r>.2&&r<.3&&Math.atan2(v,u)>.5)k=1}
    const o=(y*S+x)*4,a=k?1:0;D[o]=247-(247-26)*a;D[o+1]=243-(243-56)*a;D[o+2]=234-(234-150)*a;D[o+3]=255}
  c.putImageData(im,0,0);return cv}
function crackCanvas(){const S=128,cv=document.createElement('canvas');cv.width=cv.height=S;const c=cv.getContext('2d');c.strokeStyle='rgba(20,20,24,.95)';c.lineWidth=1.3;
  let s=11;const rnd=()=>((s=Math.imul(s^(s>>>15),1|s)+0x6D2B79F5|0)>>>0)/4294967296;
  for(let k=0;k<9;k++){let x=S/2+(rnd()-.5)*S*.8,y=S/2+(rnd()-.5)*S*.8;c.beginPath();c.moveTo(x,y);for(let j=0;j<6;j++){x+=(rnd()-.5)*34;y+=(rnd()-.5)*34;c.lineTo(x,y)}c.stroke()}
  return cv}
export default function quantizationMosaic(T,col){const root=new T.Group(),g=new T.Group(),mats=[];root.add(g);
  g.rotation.x=-.3;g.position.set(0,-.02,0);
  const wood=M(T,0x8a7a62,{emissive:0x241c12,emissiveIntensity:.3,metalness:0,roughness:.85}),
    grout=M(T,0xb9b2a2,{emissive:0x2a2824,emissiveIntensity:.3,metalness:0,roughness:.9});
  const back=new T.Mesh(new T.BoxGeometry(.66,.66,.04),grout);back.position.z=-.025;g.add(back);
  const frame=new T.Mesh(new T.BoxGeometry(.72,.72,.03),wood);frame.position.z=-.055;g.add(frame);
  const good=new T.CanvasTexture(tileCanvas(false)),bad=new T.CanvasTexture(tileCanvas(true));
  for(const t of [good,bad]){t.colorSpace=T.SRGBColorSpace||t.colorSpace;t.anisotropy=4}
  const tileMat=tex=>new T.MeshStandardMaterial({map:tex,color:0xc8c6c0,emissive:0x2e2e30,emissiveMap:tex,emissiveIntensity:.35,metalness:0,roughness:.28});
  const mg=tileMat(good),mb=tileMat(bad);mats.push(mg,mb);
  const geo=new T.BoxGeometry(.3,.3,.03);
  [[-1,1,mg],[1,1,mg],[-1,-1,mg],[1,-1,mb]].forEach(([i,j,m])=>{const t=new T.Mesh(geo,[grout,grout,grout,grout,m,grout]);t.position.set(i*.158,j*.158,.0);g.add(t)});
  const cm=new T.MeshBasicMaterial({map:new T.CanvasTexture(crackCanvas()),transparent:true,opacity:.9,depthWrite:false});
  const cr=new T.Mesh(new T.PlaneGeometry(.3,.3),cm);cr.position.set(.158,-.158,.0162);g.add(cr);
  // easel: two legs behind and a ledge under the panel
  const ledge=new T.Mesh(new T.BoxGeometry(.76,.03,.08),wood);ledge.position.set(0,-.375,.01);g.add(ledge);
  for(const x of [-.22,.22]){const leg=new T.Mesh(new T.BoxGeometry(.035,.62,.035),wood);leg.position.set(x,-.33,-.16);leg.rotation.x=.62;root.add(leg)}
  const foot=new T.Mesh(new T.BoxGeometry(.6,.025,.3),wood);foot.position.set(0,-.43,-.05);root.add(foot);
  root.scale.setScalar(.72);root.position.y=-.1;
  return{obj:root,mats,tick:(t)=>{const k=.5+.5*Math.sin(t*.9);cm.opacity=.15+.8*k}}}
