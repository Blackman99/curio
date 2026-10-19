// Curio hall · procedural textures. Everything is drawn into canvases at load time from a fixed seed,
// so every visit builds the same building and no image files are fetched for the architecture.
export const mulberry=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const hash=(a,b,c=0)=>{const s=Math.sin(a*12.9898+b*78.233+c*37.719)*43758.5453;return s-Math.floor(s)};
const sstep=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
export const canvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};

// tileable value-noise fbm on an n×n grid (values ~0..1)
export function fbm(n,base,oct,seed,gain=.5){
 const out=new Float32Array(n*n),R=mulberry(seed);let amp=1,tot=0;
 for(let o=0;o<oct;o++){const f=base<<o,lat=new Float32Array(f*f);for(let i=0;i<f*f;i++)lat[i]=R();
  for(let y=0;y<n;y++){const fy=y/n*f,y0=Math.floor(fy),ty=fy-y0,sy=ty*ty*(3-2*ty),r0=(y0%f)*f,r1=((y0+1)%f)*f;
   for(let x=0;x<n;x++){const fx=x/n*f,x0=Math.floor(fx),tx=fx-x0,sx=tx*tx*(3-2*tx),x1=(x0+1)%f;
    const a=lat[r0+x0],b=lat[r0+x1],c=lat[r1+x0],d=lat[r1+x1],ab=a+(b-a)*sx;out[y*n+x]+=amp*(ab+(c+(d-c)*sx-ab)*sy)}}
  tot+=amp;amp*=gain}
 for(let i=0;i<n*n;i++)out[i]/=tot;return out}
// bilinear, wrapping sample of an n×n array at texel coords
export const samp=(a,n,u,v)=>{u=((u%n)+n)%n;v=((v%n)+n)%n;const x0=Math.floor(u),y0=Math.floor(v),tx=u-x0,ty=v-y0,x1=(x0+1)%n,y1=(y0+1)%n;
 const p=a[y0*n+x0],q=a[y0*n+x1],r=a[y1*n+x0],s=a[y1*n+x1];return p+(q-p)*tx+(r+(s-r)*tx-p-(q-p)*tx)*ty};

// tangent-space normal map from a height field (wrapping); image rows run down, v runs up
export function normalCanvas(h,w,ht,str,wrap=true){const c=canvas(w,ht),g=c.getContext('2d'),im=g.createImageData(w,ht),d=im.data;
 const at=(x,y)=>{if(wrap){x=(x+w)%w;y=(y+ht)%ht}else{x=Math.max(0,Math.min(w-1,x));y=Math.max(0,Math.min(ht-1,y))}return h[y*w+x]};
 for(let y=0;y<ht;y++)for(let x=0;x<w;x++){const dx=(at(x+1,y)-at(x-1,y))*str,dy=(at(x,y+1)-at(x,y-1))*str;let nx=-dx,ny=dy,nz=1;const l=Math.hypot(nx,ny,nz);nx/=l;ny/=l;nz/=l;
  const i=(y*w+x)*4;d[i]=(nx*.5+.5)*255;d[i+1]=(ny*.5+.5)*255;d[i+2]=(nz*.5+.5)*255;d[i+3]=255}
 g.putImageData(im,0,0);return c}
// RGBA canvas from a per-pixel writer f(x,y,out[4])
export function pixels(w,h,f){const c=canvas(w,h),g=c.getContext('2d'),im=g.createImageData(w,h),d=im.data,o=[0,0,0,255];
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){o[3]=255;f(x,y,o);const i=(y*w+x)*4;d[i]=o[0];d[i+1]=o[1];d[i+2]=o[2];d[i+3]=o[3]}g.putImageData(im,0,0);return c}
// grayscale canvas from a float field 0..1
const gray=(a,w,h,lo=0,hi=1)=>pixels(w,h,(x,y,o)=>{const v=(lo+(hi-lo)*a[y*w+x])*255;o[0]=o[1]=o[2]=v});

export function makeTextures(T,{aniso=8,hi=true}={}){
 const tex=(c,{srgb=true,rep=true}={})=>{const t=new T.CanvasTexture(c);if(srgb)t.colorSpace=T.SRGBColorSpace;if(rep)t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=aniso;return t};
 const out={tex};
 const N1=hi?1024:512;

 // ---- herringbone parquet: planks 5:1, axis-aligned herringbone tile (rotated 45° on the floor)
 {const n=N1,L=5,u=n/(2*L),g1=fbm(256,4,4,11),g2=fbm(256,32,3,12),col=new Uint8ClampedArray(n*n*4),hgt=new Float32Array(n*n),rgh=new Float32Array(n*n);
  for(let py=0;py<n;py++)for(let px=0;px<n;px++){const x=(px+.5)/u,y=(py+.5)/u,m=Math.floor(y),s=Math.floor((x-m+L)/(2*L)),xp=x-2*L*s;let al,ac,ox,oy;
   if(xp>=m){al=xp-m;ac=y-m;ox=m+2*L*s;oy=m}else{const k=Math.floor(xp);al=y-(k+1);ac=xp-k;ox=k+2*L*s+.5;oy=k+1}
   const P=2*L,hid=hash(((ox%P)+P)%P,((oy%P)+P)%P),hid2=hash(oy,ox,3);
   const wob=samp(g1,256,al*9+hid*200,ac*4+hid2*90),st=.5+.5*Math.sin((ac*5.5+wob*2.6+hid*7)*6.283),pore=samp(g2,256,al*40+hid*300,ac*70);
   const de=Math.min(ac,1-ac)*u,dl=Math.min(al,L-al)*u,d=Math.min(de,dl),edge=sstep(.8,3.2,d);
   const tone=.78+.34*hid+.12*(hid2-.5),gr=.84+.13*st+.1*(pore-.5);
   let r=(124*tone)*gr,g=(80*tone)*gr,b=(44*tone)*gr;const k=.25+.75*edge;r*=k;g*=k;b*=k;
   const i=(py*n+px)*4;col[i]=r;col[i+1]=g;col[i+2]=b;col[i+3]=255;hgt[py*n+px]=edge*.9+st*.04+pore*.03;rgh[py*n+px]=edge<.5?.85:.3+.14*hid2+.08*st}
  const c=canvas(n,n);c.getContext('2d').putImageData(new ImageData(col,n,n),0,0);
  out.parquet={map:tex(c),normal:tex(normalCanvas(hgt,n,n,hi?2.2:1.4),{srgb:false}),rough:tex(gray(rgh,n,n),{srgb:false}),tile:2*L*.085}}

 // ---- marble: tileable veined stone, three colourways
 const marble=(seed,base,vein,cloud,veinK=1)=>{const n=512,w1=fbm(n,2,6,seed),w2=fbm(n,4,5,seed+1),cl=fbm(n,3,5,seed+2);
  const h=new Float32Array(n*n);const c=pixels(n,n,(x,y,o)=>{const u=x/n,v=y/n,w=w1[y*n+x],w_=w2[y*n+x];
   const t1=Math.sin((u*2+v*3)*6.283+w*13),t2=Math.sin((u*5-v*2)*6.283+w_*17+w*4);
   const v1=Math.pow(1-Math.abs(t1),18)*.9,v2=Math.pow(1-Math.abs(t2),40)*.6,vv=Math.min(1,(v1+v2)*veinK),cc=cl[y*n+x];
   for(let k=0;k<3;k++)o[k]=base[k]*(1-.18*(cc-.5)*2*cloud)*(1-vv)+vein[k]*vv;h[y*n+x]=vv});
  return{map:tex(c),h}};
 out.marbleW=marble(21,[232,228,219],[128,124,120],.35);
 out.marbleG=marble(31,[30,52,42],[150,170,150],.8,.8);
 out.marbleS=marble(41,[196,150,84],[120,80,40],.6,.7);
 out.marbleR=marble(51,[110,36,30],[220,190,170],.6,.6);

 // ---- plaster mottling (tinted by material colour) + fine relief
 {const n=512,a=fbm(n,4,6,61),b=fbm(n,32,3,62);out.plaster={map:tex(pixels(n,n,(x,y,o)=>{const v=(.9+.1*(a[y*n+x]-.5)*2+.03*(b[y*n+x]-.5))*255;o[0]=o[1]=o[2]=v})),
  normal:tex(normalCanvas(b.map((v,i)=>v*.6+a[i]*.4),n,n,1.2),{srgb:false})}}

 // ---- woven silk damask for the gallery walls: half-drop floral motif over an ogee lattice, multiplied by mottling
 {const n=512,c=canvas(n,n),g=c.getContext('2d'),a=fbm(n,4,5,63),w=fbm(n,64,2,64);g.fillStyle='#fff';g.fillRect(0,0,n,n);
  const motif=(cx,cy)=>{g.save();g.translate(cx,cy);g.scale(.9,.9);
   for(const sx of [-1,1]){g.save();g.scale(sx,1);g.beginPath();g.moveTo(0,58);g.bezierCurveTo(44,40,78,-8,34,-62);g.bezierCurveTo(24,-22,12,8,0,20);g.fill();
    g.beginPath();g.moveTo(0,-22);g.bezierCurveTo(34,-44,44,-96,4,-118);g.bezierCurveTo(14,-86,8,-54,0,-42);g.fill();
    g.beginPath();g.moveTo(0,70);g.bezierCurveTo(56,80,90,124,56,156);g.bezierCurveTo(44,126,22,104,0,98);g.fill();
    g.beginPath();g.moveTo(40,-4);g.bezierCurveTo(70,-20,96,8,84,36);g.bezierCurveTo(74,16,58,8,44,10);g.fill();g.restore()}
   g.beginPath();g.ellipse(0,-6,15,28,0,0,7);g.fill();g.beginPath();g.arc(0,-48,7,0,7);g.fill();g.restore()};
  const lattice=(ox,oy)=>{g.beginPath();g.moveTo(ox,oy+128);g.bezierCurveTo(ox+90,oy+150,ox+40,oy+230,ox+128,oy+256);g.bezierCurveTo(ox+216,oy+282,ox+166,oy+362,ox+256,oy+384);g.stroke();
   g.beginPath();g.moveTo(ox+256,oy+128);g.bezierCurveTo(ox+166,oy+150,ox+216,oy+230,ox+128,oy+256);g.bezierCurveTo(ox+40,oy+282,ox+90,oy+362,ox,oy+384);g.stroke()};
  for(const pass of [0,1]){g.fillStyle=pass?'rgba(255,255,255,.07)':'rgba(0,0,0,.13)';g.strokeStyle=pass?'rgba(255,255,255,.06)':'rgba(0,0,0,.11)';g.lineWidth=7;
   for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){const ox=dx*n+(pass?-1.5:0),oy=dy*n+(pass?-1.5:0);motif(ox+128,oy+128);motif(ox+384,oy+384);lattice(ox,oy-128);lattice(ox+256,oy-128)}}
  const im=g.getImageData(0,0,n,n),d=im.data;for(let i=0;i<n*n;i++){const k=(.9+.1*(a[i]-.5)*2)*(.97+.06*w[i]);d[i*4]*=k;d[i*4+1]*=k;d[i*4+2]*=k}g.putImageData(im,0,0);
  out.damask=tex(c)}

 // ---- palm frond: pinnate leaflets on a rachis, alpha-cut
 {const W=128,H=512,c=canvas(W,H),g=c.getContext('2d'),R=mulberry(17);g.clearRect(0,0,W,H);
  for(let k=0;k<46;k++){const y=H-12-k*(H-30)/46,len=(26+36*Math.sin(Math.PI*Math.min(1,(k+4)/46)))*(.85+R()*.3);
   for(const sx of [-1,1]){g.save();g.translate(W/2,y);g.rotate(sx*(1.05-k*.006)+(R()-.5)*.1);const l=R()*.15;g.fillStyle=`rgb(${48+R()*30|0},${92+R()*40|0},${38+R()*20|0})`;
    g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(sx*len*.5,-5,sx*len,-1);g.quadraticCurveTo(sx*len*.5,3,0,1.5);g.fill();g.restore()}}
  g.strokeStyle='#5a6a2a';g.lineWidth=3;g.beginPath();g.moveTo(W/2,H);g.lineTo(W/2,8);g.stroke();
  out.frond=tex(c);out.frond.wrapS=out.frond.wrapT=T.ClampToEdgeWrapping}

 // ---- walnut: long grain along u
 {const n=512,g1=fbm(n,2,5,71),g2=fbm(n,64,2,72),h=new Float32Array(n*n);
  out.walnut={map:tex(pixels(n,n,(x,y,o)=>{const u=x/n,v=y/n,w=g1[y*n+x],ring=.5+.5*Math.sin((v*9+w*3.2)*6.283),f=g2[y*n+x];
   const k=.72+.2*ring+.12*(f-.5);o[0]=92*k;o[1]=56*k;o[2]=32*k;h[y*n+x]=ring*.5+f*.5}))};
  out.walnut.normal=tex(normalCanvas(h,n,n,1.6),{srgb:false})}

 // ---- brass / gilt smudges (roughness in G)
 {const n=256,a=fbm(n,4,5,81),b=fbm(n,16,3,82);out.smudge=tex(pixels(n,n,(x,y,o)=>{const v=(.18+.22*a[y*n+x]+.12*b[y*n+x])*255;o[0]=o[1]=o[2]=v}),{srgb:false})}

 // ---- tufted leather: diamond button grid, puckered folds
 {const n=256,a=fbm(n,8,4,91),h=new Float32Array(n*n);
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){const u=x/n*4,v=y/n*4,du=u-Math.round(u),dv=v-Math.round(v),eu=(u+.5)-Math.round(u+.5),ev=(v+.5)-Math.round(v+.5);
   const d=Math.min(Math.hypot(du,dv),Math.hypot(eu,ev));h[y*n+x]=Math.sqrt(Math.min(1,d/.5))*.9+a[y*n+x]*.1-(d<.05?.3:0)}
  out.leather={map:tex(pixels(n,n,(x,y,o)=>{const k=.7+.3*h[y*n+x]+.1*(a[y*n+x]-.5);o[0]=86*k;o[1]=34*k;o[2]=24*k})),normal:tex(normalCanvas(h,n,n,6),{srgb:false})}}

 // ---- linen dust-sheet weave
 {const n=256,a=fbm(n,4,4,101),h=new Float32Array(n*n);for(let y=0;y<n;y++)for(let x=0;x<n;x++){h[y*n+x]=.5+.25*Math.sin(x*.785*4)*Math.sin(y*.785*4)+a[y*n+x]*.5}
  out.linen={map:tex(pixels(n,n,(x,y,o)=>{const k=.86+.14*a[y*n+x];o[0]=214*k;o[1]=204*k;o[2]=184*k})),normal:tex(normalCanvas(h,n,n,1.4),{srgb:false})}}

 // ---- velvet pile noise
 {const n=128,a=fbm(n,8,3,111);out.velvet=tex(pixels(n,n,(x,y,o)=>{const k=.85+.15*a[y*n+x];o[0]=255*k;o[1]=255*k;o[2]=255*k}))}

 // ---- dome coffers: one panel tile, rows of recessed squares with gilt rosettes
 {const W=512,Hh=1024,h=new Float32Array(W*Hh),col=new Uint8ClampedArray(W*Hh*4),cols=3,rows=6;
  for(let y=0;y<Hh;y++)for(let x=0;x<W;x++){const u=x/W*cols,v=y/Hh*rows,fu=u-Math.floor(u),fv=v-Math.floor(v),e=Math.min(fu,1-fu,fv,1-fv);
   const step=e<.08?1:e<.13?.75:e<.18?.5:.25,r=Math.hypot(fu-.5,fv-.5),ros=r<.09?1-r/.09:0;
   const hh=step+ros*.6+ (r<.09?.15*Math.sin(Math.atan2(fv-.5,fu-.5)*8):0);h[y*W+x]=hh;
   const gilt=ros>0||(e>.075&&e<.085),i=(y*W+x)*4;const k=.62+.38*step;
   if(gilt){col[i]=220;col[i+1]=172;col[i+2]=88}else{col[i]=236*k;col[i+1]=226*k;col[i+2]=206*k}col[i+3]=255}
  const c=canvas(W,Hh);c.getContext('2d').putImageData(new ImageData(col,W,Hh),0,0);
  out.coffer={map:tex(c),normal:tex(normalCanvas(h,W,Hh,3),{srgb:false})}}

 // ---- drawer front for the curiosity cabinets: walnut panel, paper label with scribble, brass pull
 out.drawer=tex((()=>{const c=canvas(256,192),g=c.getContext('2d'),R=mulberry(7);g.drawImage(out.walnut.map.image,0,0,256,192);
  g.strokeStyle='rgba(0,0,0,.55)';g.lineWidth=6;g.strokeRect(3,3,250,186);g.strokeStyle='rgba(255,220,170,.15)';g.lineWidth=2;g.strokeRect(10,10,236,172);
  g.fillStyle='#c9963f';g.fillRect(84,40,88,48);g.fillStyle='#e9dcc0';g.fillRect(90,46,76,36);g.strokeStyle='#3a2a1a';g.lineWidth=2;
  for(let l=0;l<2;l++){g.beginPath();let x=96;g.moveTo(x,58+l*12);while(x<158){x+=4+R()*6;g.lineTo(x,58+l*12+(R()-.5)*5)}g.stroke()}
  g.fillStyle='#8a6422';g.beginPath();g.ellipse(128,130,22,9,0,0,7);g.fill();g.fillStyle='#e0b45a';g.beginPath();g.ellipse(128,127,18,6,0,0,7);g.fill();return c})());
 return out}
