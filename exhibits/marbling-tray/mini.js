// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Marbling Tray: a walnut ebru tray with a bouquet pattern floating on the size, and a sheet of paper half lifted off it showing the print on its underside
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.25,metalness:0,roughness:.85},o));
export default function marblingTray(T,col){const g=new T.Group(),mats=[];
  // the pattern: the page's own maps, run backwards per pixel on a small canvas
  const W=48,H=32,PX=256,PY=172,pal=[[36,50,112],[178,50,46],[216,160,58],[26,24,28],[240,234,218]];
  let a=7;const R=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
  const ops=[];[[0,16,3.2,4.4],[1,18,2.4,3.4],[2,18,1.8,2.6],[3,16,1,1.6],[4,16,.7,1.1]].forEach(([p,n,r0,r1])=>{for(let k=0;k<n;k++)ops.push({k:0,x:(R()-.5)*W*1.1,y:(R()-.5)*H*1.1,r:r0+(r1-r0)*R(),i:p})});
  const comb=(mx,my,t0,s,n,z,c)=>ops.push({k:1,mx,my,t0,s,n,z,c});
  comb(1,0,-20,4,11,5,.8);comb(-1,0,14,4,11,5,.8);comb(0,1,-24,1.2,46,4,.3);
  ops.push({k:2,mx:1,my:0,A:-1.5,L:6});comb(0,-1,-30,6,11,4,.9);ops.push({k:2,mx:1,my:0,A:1.5,L:6});
  const cs=(t,o)=>{const q=Math.pow(2,-o.s/o.c),k0=Math.floor((t-o.t0)/o.s),kl=Math.min(k0,o.n-1),kr=Math.max(k0+1,0);let r=0;
    if(kl>=0)r=Math.pow(2,-(t-(o.t0+kl*o.s))/o.c)*(1-Math.pow(2,-(kl+1)*o.s/o.c))/(1-q);
    if(kr<=o.n-1)r+=Math.pow(2,-((o.t0+kr*o.s)-t)/o.c)*(1-Math.pow(2,-(o.n-kr)*o.s/o.c))/(1-q);return r};
  const ink=(x,y)=>{for(let j=ops.length-1;j>=0;j--){const o=ops[j];
      if(o.k===0){const qx=x-o.x,qy=y-o.y,d2=qx*qx+qy*qy,r2=o.r*o.r;if(d2<r2)return[o.i,Math.sqrt(d2/r2)];const f=Math.sqrt(1-r2/d2);x=o.x+qx*f;y=o.y+qy*f}
      else if(o.k===1){const D=o.z*cs(-o.my*x+o.mx*y,o);x-=D*o.mx;y-=D*o.my}
      else{const D=o.A*Math.sin((-o.my*x+o.mx*y)/o.L*6.283185307);x-=D*o.mx;y-=D*o.my}}return null};
  const cv=document.createElement('canvas');cv.width=PX;cv.height=PY;const cx=cv.getContext('2d'),im=cx.createImageData(PX,PY);
  for(let j=0;j<PY;j++)for(let i=0;i<PX;i++){let r=0,gg=0,b=0;for(const[ox,oy]of[[.25,.25],[.75,.75]]){const h=ink((i+ox)/PX*W-W/2,(j+oy)/PY*H-H/2);
      const c=h?pal[h[0]].map(v=>v*(1-.35*Math.max(0,(h[1]-.85)/.15))):[220,212,194];r+=c[0];gg+=c[1];b+=c[2]}
    const k=(j*PX+i)*4;im.data[k]=r/2;im.data[k+1]=gg/2;im.data[k+2]=b/2;im.data[k+3]=255}
  cx.putImageData(im,0,0);const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=4;
  // the walnut tray, tilted a little towards the visitor
  const wood=M(T,0x4a2c16,{emissiveIntensity:.12,roughness:.6}),tray=new T.Group();tray.rotation.x=.34;tray.position.set(0,-.16,.04);g.add(tray);
  const TWm=.8,THm=TWm*H/W,rim=.035,dep=.05;
  const base=new T.Mesh(new T.BoxGeometry(TWm+2*rim,.02,THm+2*rim),wood);base.position.y=-.01;tray.add(base);
  for(const[sx,sz,px,pz]of[[TWm+2*rim,rim,0,-(THm+rim)/2],[TWm+2*rim,rim,0,(THm+rim)/2],[rim,THm,-(TWm+rim)/2,0],[rim,THm,(TWm+rim)/2,0]]){
    const m=new T.Mesh(new T.BoxGeometry(sx,dep,sz),wood);m.position.set(px,dep/2-.01,pz);tray.add(m)}
  // the size with the paint on it (an upward plane: map only, colour held down so the hall lights don't blow it out)
  const bathM=new T.MeshStandardMaterial({map:tex,color:0x7e7a70,emissive:0xffffff,emissiveMap:tex,emissiveIntensity:.05,roughness:.45,metalness:0});mats.push(bathM);
  const bath=new T.Mesh(new T.PlaneGeometry(TWm,THm),bathM);bath.rotation.x=-Math.PI/2;bath.position.y=.022;tray.add(bath);
  // a sheet of paper hinged on the far edge, half lifted: the print (the tray's mirror image) on its underside
  const PWm=TWm*.78,PHm=THm*.6,hinge=new T.Group();hinge.position.set(.03,.03,-THm*.42);tray.add(hinge);
  const pg=new T.PlaneGeometry(PWm,PHm);const uv=pg.attributes.uv;
  for(let k=0;k<uv.count;k++){uv.setXY(k,.13+uv.getX(k)*.78,1-(.08+(1-uv.getY(k))*.6))}
  const printM=new T.MeshStandardMaterial({map:tex,color:0xb4ae9f,emissive:0xffffff,emissiveMap:tex,emissiveIntensity:.08,roughness:.8,side:T.BackSide});mats.push(printM);
  const backM=M(T,0xe9e0cc,{emissiveIntensity:.2,side:T.FrontSide});
  const sheet=new T.Group();hinge.add(sheet);
  for(const m of[printM,backM]){const p=new T.Mesh(pg,m);p.rotation.x=-Math.PI/2;p.position.z=PHm/2;sheet.add(p)}
  hinge.rotation.x=-.62;
  // a small comb resting on the near rim: a walnut bar and brass tines
  const brass=M(T,0xd6a84a,{emissive:new T.Color(0x6a4810),emissiveIntensity:.45,metalness:.6,roughness:.35});mats.push(brass);
  const combG=new T.Group();combG.position.set(-.04,.052,(THm+rim)/2);combG.rotation.y=.05;tray.add(combG);
  const bar=new T.Mesh(new T.BoxGeometry(.44,.018,.022),M(T,0x2e1a0c,{emissiveIntensity:.1,roughness:.5}));combG.add(bar);
  const tine=new T.CylinderGeometry(.003,.0016,.05,6);for(let k=0;k<12;k++){const t=new T.Mesh(tine,brass);t.position.set(-.2+k*.0364,-.024,-.014);t.rotation.x=.5;combG.add(t)}
  g.position.y=-.02;
  return{obj:g,mats,tick:(t)=>{hinge.rotation.x=-.62-.12*Math.sin(t*.7)}}}
