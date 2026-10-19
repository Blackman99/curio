// Curio hall · the building: floor plan, rooms, cases, signage and the baked light. main.js drives it.
// Plan: an octagonal rotunda holds the newest exhibit; galleries of eight wall cases spiral out around it on a 16 m grid
// (N, NE, E, SE, S, …). Every exhibit keeps its place as the collection grows: No. k sits in gallery ⌊(k-1)/8⌋, slot (k-1)%8.
import {mulberry,canvas} from './tex.js';

export const K={CELL:16,IN:7.8,GH:5.6,DWH:1.5,DH:4.2,LA:3.5,LW:6.5,LP:8.4,SLOT:4.4,CD:.8,RH:8.2,EYE:1.62,HL:7.8*Math.tan(Math.PI/8)};
export const MOON=[-.25,1,.18];               // toward the moon: a point at height h throws its shadow (+.25h, -.18h) away
const MX=.25,MZ=-.18;
export const SERIF='"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif',MONO='"Courier New",Courier,monospace';
const ROMAN=['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX','XXI','XXII','XXIII','XXIV'];
const WALLC=['#8c3326','#2e6450','#37507f','#8a6430','#673b6c','#386a6f','#7c3d28','#525866'];
const SIDES=['n','e','s','w'],SD={n:[0,-1],e:[1,0],s:[0,1],w:[-1,0]};
const WF={n:{t:[1,0],n:[0,1]},e:{t:[0,1],n:[-1,0]},s:{t:[-1,0],n:[0,-1]},w:{t:[0,-1],n:[1,0]}};
const MON=['January','February','March','April','May','June','July','August','September','October','November','December'];
const dateLong=s=>{const [y,m,d]=String(s).split('-').map(Number);return y?`${d} ${MON[m-1]} ${y}`:String(s)};
const dateSpan=(a,b)=>{if(!a)return'';if(a===b)return dateLong(a);const [y1,m1,d1]=a.split('-').map(Number),[y2,m2,d2]=b.split('-').map(Number);
 return y1===y2&&m1===m2?`${d1} – ${d2} ${MON[m1-1]} ${y1}`:`${dateLong(a)} – ${dateLong(b)}`};

function spiral(n){const out=[];for(let r=1;out.length<n;r++){for(let x=0;x<=r;x++)out.push([x,-r]);for(let z=-r+1;z<=r;z++)out.push([r,z]);
 for(let x=r-1;x>=-r;x--)out.push([x,r]);for(let z=r-1;z>=-r;z--)out.push([-r,z]);for(let x=-r+1;x<0;x++)out.push([x,-r])}return out.slice(0,n)}

export function plan(list){
 const chrono=list.map((d,i)=>({d,i})).sort((a,b)=>String(a.d.no).localeCompare(String(b.d.no))||String(a.d.date).localeCompare(String(b.d.date)));
 const newest=chrono.length?chrono[chrono.length-1]:null,rest=chrono.slice(0,-1),G=Math.max(1,Math.ceil(rest.length/8));
 const rooms=[{id:0,kind:'rotunda',ci:0,cj:0,cx:0,cz:0,name:'The Rotunda',sub:'New acquisition',ex:newest?[newest]:[]}];
 spiral(G).forEach(([ci,cj],g)=>{const ex=rest.slice(g*8,g*8+8),a=ex[0],b=ex[ex.length-1];
  rooms.push({id:g+1,kind:'gallery',gi:g,ci,cj,cx:ci*K.CELL,cz:cj*K.CELL,name:'Gallery '+ROMAN[g%ROMAN.length],ex,color:WALLC[g%WALLC.length],
   sub:a?`Nos. ${a.d.no} – ${String(g*8+8).padStart(3,'0')}`:'',dates:a?dateSpan(a.d.date,b.d.date):''})});
 const at=new Map(rooms.map(r=>[r.ci+','+r.cj,r.id]));
 for(const r of rooms){r.doors={};r.adj=[];for(const s of SIDES){const j=at.get((r.ci+SD[s][0])+','+(r.cj+SD[s][1]));r.doors[s]=j??null;if(j!=null)r.adj.push(j)}}
 return{rooms,newest,chrono}}

// ---------------------------------------------------------------------------------------------------------------
export function buildHall(T,{G,X,BGU,list,EXHIBITS,tier,aniso}){
 const V3=T.Vector3,hi=tier==='high',{rooms,newest}=plan(list),IN=K.IN,GH=K.GH,DWH=K.DWH,DH=K.DH;
 const tex=(c,srgb=true)=>{const t=new T.CanvasTexture(c);if(srgb)t.colorSpace=T.SRGBColorSpace;t.anisotropy=aniso;return t};
 const cl=(t,rx,ry=rx,rot=0)=>{const c=t.clone();c.repeat.set(rx,ry);c.rotation=rot;c.needsUpdate=true;return c};
 const std=o=>new T.MeshStandardMaterial(o);

 // ---------------- materials
 const M={};
 M.walnut=std({map:cl(X.walnut.map,1/1.3),normalMap:cl(X.walnut.normal,1/1.3),normalScale:new T.Vector2(.45,.45),roughness:.5,envMapIntensity:.8});
 M.walnutD=std({map:M.walnut.map,normalMap:M.walnut.normalMap,normalScale:new T.Vector2(.45,.45),color:0x7a6a62,roughness:.55,envMapIntensity:.7});
 M.brass=std({color:0xd9a54e,metalness:1,roughness:1,roughnessMap:cl(X.smudge,2.5),envMapIntensity:1.25});
 M.gilt=std({color:0xe6b45c,metalness:1,roughness:1,roughnessMap:cl(X.smudge,4),envMapIntensity:1.35});
 M.iron=std({color:0x1d1b1a,metalness:.75,roughness:.42,envMapIntensity:.8});
 M.velvet=new T.MeshPhysicalMaterial({color:0x5c0c10,map:cl(X.velvet,6),roughness:.95,sheen:1,sheenColor:new T.Color(0xd04a44),sheenRoughness:.35});
 M.leather=std({map:cl(X.leather.map,1.4),normalMap:cl(X.leather.normal,1.4),roughness:.5,envMapIntensity:.6});
 M.linen=std({map:cl(X.linen.map,2.5),normalMap:cl(X.linen.normal,2.5),roughness:.96});
 M.marbleW=std({map:cl(X.marbleW.map,1/1.8),roughness:.16,envMapIntensity:1});
 M.marbleG=std({map:cl(X.marbleG.map,1/1.6),roughness:.14,envMapIntensity:1.1});
 M.marbleR=std({map:cl(X.marbleR.map,1/1.6),roughness:.2,envMapIntensity:1});
 M.lamp=new T.MeshBasicMaterial({color:new T.Color(1,.78,.52).multiplyScalar(6)});
 M.lampSoft=new T.MeshBasicMaterial({color:new T.Color(1,.86,.66).multiplyScalar(2.4)});
 M.white=std({color:0xe8e4dc,roughness:.6,envMapIntensity:.25});
 M.black=std({color:0x0b0a09,roughness:.25,metalness:.2});
 M.niche=std({color:0x4a1610,map:cl(X.plaster.map,1/2),normalMap:cl(X.plaster.normal,1/2),normalScale:new T.Vector2(.3,.3),roughness:.92,envMapIntensity:.3});
 M.dome=std({color:0xe8dcc4,map:X.coffer.map,normalMap:X.coffer.normal,normalScale:new T.Vector2(.9,.9),roughness:.85,envMapIntensity:.45});
 const glassMat=()=>{const m=std({color:0,metalness:0,roughness:.035,transparent:true,depthWrite:false,side:T.DoubleSide,envMapIntensity:1.8});
  m.blending=T.CustomBlending;m.blendSrc=T.OneFactor;m.blendDst=T.OneMinusSrcAlphaFactor;m.blendSrcAlpha=T.OneFactor;m.blendDstAlpha=T.OneMinusSrcAlphaFactor;
  m.onBeforeCompile=s=>{s.fragmentShader=s.fragmentShader.replace('#include <opaque_fragment>',
   '#include <opaque_fragment>\n float nv=abs(dot(normalize(vViewPosition),normal));gl_FragColor.a=mix(.03,.55,pow(1.-nv,5.));')};
  m.customProgramCacheKey=()=>'curio-glass';return m};
 M.glass=glassMat();M.glassSky=glassMat();M.glassSky.envMapIntensity=.03;M.glassSky.roughness=.2;
 const plasterMat=(color,lm,ao,silk)=>std({color:new T.Color(color),map:silk?cl(X.damask,1/.72):cl(X.plaster.map,1/2.4),normalMap:cl(X.plaster.normal,1/2.4),normalScale:new T.Vector2(.35,.35),
  roughness:.9,lightMap:lm,lightMapIntensity:7.5,aoMap:ao,aoMapIntensity:1,envMapIntensity:.3});
 M.ceilingFor=(lm,ao)=>std({color:0xc9c0b2,map:cl(X.plaster.map,1/3),roughness:.95,lightMap:lm,lightMapIntensity:3.2,aoMap:ao,envMapIntensity:.08});
 const TILE=X.parquet.tile;
 const parquetMat=(lm,ao)=>std({map:cl(X.parquet.map,1/TILE,1/TILE,Math.PI/4),normalMap:cl(X.parquet.normal,1/TILE,1/TILE,Math.PI/4),roughnessMap:cl(X.parquet.rough,1/TILE,1/TILE,Math.PI/4),
  normalScale:new T.Vector2(.6,.6),roughness:1,lightMap:lm,lightMapIntensity:8,aoMap:ao,aoMapIntensity:1,envMapIntensity:.9});
 const decal=(t,color=0xe6b45c,metal=.85)=>std({color,metalness:metal,roughness:.3,emissive:0x8a5a1c,emissiveIntensity:.35,alphaMap:t,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,envMapIntensity:1.4});
 const paperMat=t=>std({map:t,roughness:.82,envMapIntensity:.25,polygonOffset:true,polygonOffsetFactor:-2});
 for(const m of [M.lamp,M.lampSoft])m.toneMapped=true;

 // ---------------- small geometry helpers
 const quad=(P,uvf,uv1f)=>{const pos=[],uv=[],uv1=[],nrm=[];const a=new V3(...P[0]),b=new V3(...P[1]),c=new V3(...P[2]),n=b.clone().sub(a).cross(c.clone().sub(a)).normalize();
  for(const k of [0,1,2,0,2,3]){pos.push(...P[k]);nrm.push(n.x,n.y,n.z);uv.push(...uvf(P[k]));if(uv1f)uv1.push(...uv1f(P[k]))}
  const g=G.fromArrays(pos,nrm,uv);if(uv1f)g.setAttribute('uv1',new T.Float32BufferAttribute(uv1,2));return g};
 const boxUV=(g,s=1)=>{const p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;for(let i=0;i<p.count;i++){const ax=Math.abs(n.getX(i)),ay=Math.abs(n.getY(i)),az=Math.abs(n.getZ(i));
  const x=p.getX(i),y=p.getY(i),z=p.getZ(i);if(ax>=ay&&ax>=az)uv.setXY(i,z*s,y*s);else if(ay>=az)uv.setXY(i,x*s,z*s);else uv.setXY(i,x*s,y*s)}return g};
 const box=(w,h,d,x=0,y=0,z=0)=>boxUV(new T.BoxGeometry(w,h,d)).translate(x,y,z);
 const rb=(w,h,d,r,x=0,y=0,z=0)=>boxUV(G.rbox(w,h,d,r,2)).translate(x,y,z);
 const M4=()=>new T.Matrix4();
 const wallMat=(t,n,o)=>M4().makeBasis(new V3(t[0],0,t[1]),new V3(0,1,0),new V3(n[0],0,n[1])).setPosition(o[0],0,o[1]);
 const tr=(m,x,y,z)=>m.clone().multiply(M4().makeTranslation(x,y,z));
 const at=(m,x,y,z)=>new V3(x,y,z).applyMatrix4(m);

 // ---------------- profiles (material on the left of travel; see geo.sweep)
 const PR={
  base:[[0,0],[.024,0],[.024,.13],[.018,.15],[.018,.16],[.009,.176],[0,.182]],
  chair:[[0,.94],[.012,.94],[.02,.952],[.03,.972],[.03,.992],[.024,1.01],[.014,1.03],[0,1.04]],
  cornice:[[0,GH-.44],[.03,GH-.44],[.03,GH-.38],[.055,GH-.355],[.07,GH-.31],[.1,GH-.27],[.14,GH-.23],[.19,GH-.17],[.24,GH-.11],[.27,GH-.085],[.285,GH-.05],[.285,GH-.015],[0,GH-.015]],
  arch:[[.24,0],[.23,.016],[.2,.026],[.12,.03],[.11,.04],[.06,.042],[.05,.052],[.035,.058],[.01,.058],[0,.05],[0,0]],
  panel:[[.055,0],[.045,.008],[.035,.016],[.024,.02],[.014,.017],[.006,.01],[0,0]],
  gilt:[[.165,.012],[.158,.03],[.146,.036],[.13,.04],[.112,.052],[.09,.064],[.068,.072],[.05,.074],[.034,.07],[.02,.062],[.01,.05],[0,.042],[0,0]],
  trim:[[0,0],[0,-.1],[.05,-.1],[.06,-.085],[.1,-.07],[.16,-.04],[.24,-.02],[.3,0]],
  rail:[[0,-.012],[.012,-.012],[.012,.012],[0,.012],[0,-.012]],
  cap:[[0,0],[.03,0],[.04,.012],[.04,.03],[.03,.04],[0,.04]],
 };
 const shiftY=(p,dy)=>p.map(([o,y])=>[o,y+dy]);
 // hanging profile for the ceiling trim needs y measured downward from the ceiling
 const trimAt=y=>PR.trim.map(([o,d])=>[o,y+d]);

 // ---------------- text canvases
 const wrap=(g,t,w)=>{const out=[];let cur='';for(const word of String(t).split(/\s+/)){const s=cur?cur+' '+word:word;if(g.measureText(s).width>w&&cur){out.push(cur);cur=word}else cur=s}if(cur)out.push(cur);return out};
 const fit=(g,t,w,size,weight,fam)=>{let s=size;g.font=`${weight} ${s}px ${fam}`;while(g.measureText(t).width>w&&s>12){s-=2;g.font=`${weight} ${s}px ${fam}`}return s};
 function labelCanvas(d,head){const W=1024,H=640,c=canvas(W,H),g=c.getContext('2d'),R=mulberry(9);
  g.fillStyle='#f2e9d6';g.fillRect(0,0,W,H);for(let i=0;i<2500;i++){g.fillStyle=`rgba(${R()<.5?'90,60,30':'255,255,255'},${R()*.05})`;g.fillRect(R()*W,R()*H,2,2)}
  g.strokeStyle='#1d1a16';g.lineWidth=3;g.strokeRect(18,18,W-36,H-36);g.textBaseline='alphabetic';
  g.fillStyle='#b62d1b';g.font=`700 26px ${MONO}`;g.fillText((head?head+'  ·  ':'')+'No. '+d.no+'   ·   '+d.date,52,84);
  g.fillStyle='#1d1a16';fit(g,d.title,W-104,66,'900',SERIF);g.fillText(d.title,52,160);
  g.fillStyle='#6b3f22';g.font=`italic 30px ${SERIF}`;g.fillText(String(d.kind||''),52,206);
  g.fillStyle='#1d1a16';g.fillRect(52,228,120,4);
  g.font=`27px ${SERIF}`;g.fillStyle='#2a241d';const L=wrap(g,d.blurb||'',W-104);let y=278;for(const l of L.slice(0,10)){g.fillText(l,52,y);y+=36}
  g.fillStyle='#b62d1b';g.font=`700 22px ${MONO}`;g.fillText('CLICK THE CASE TO OPEN  →',52,H-46);return c}
 function sealedLabel(){const W=1024,H=640,c=canvas(W,H),g=c.getContext('2d');g.fillStyle='#e8dcc2';g.fillRect(0,0,W,H);g.strokeStyle='#1d1a16';g.lineWidth=3;g.strokeRect(18,18,W-36,H-36);
  g.fillStyle='#b62d1b';g.font=`700 26px ${MONO}`;g.fillText('RESERVED',52,84);g.fillStyle='#1d1a16';g.font=`900 64px ${SERIF}`;g.fillText('In preparation',52,170);
  g.fillStyle='#6b3f22';g.font=`italic 30px ${SERIF}`;g.fillText('A new exhibit is added to the cabinet each day.',52,226);g.fillText('This case is kept for one of them.',52,268);return c}
 function giltText(lines,W,H){const c=canvas(W,H),g=c.getContext('2d');g.fillStyle='#000';g.fillRect(0,0,W,H);g.fillStyle='#fff';g.textAlign='center';g.textBaseline='middle';
  for(const l of lines){const s=fit(g,l.t,W*.94,l.size,l.weight||'700',l.fam||SERIF);if(l.track){g.letterSpacing=l.track+'px'}g.fillText(l.t,W/2,l.y*H);g.letterSpacing='0px'}return c}
 function directoryCanvas(room){const W=1024,H=1024,c=canvas(W,H),g=c.getContext('2d');g.fillStyle='#f2e9d6';g.fillRect(0,0,W,H);g.strokeStyle='#1d1a16';g.lineWidth=4;g.strokeRect(24,24,W-48,H-48);
  g.fillStyle='#b62d1b';g.font=`700 30px ${MONO}`;g.fillText(room.name.toUpperCase()+'  ·  CONTENTS',70,110);g.fillStyle='#1d1a16';g.fillRect(70,134,180,5);
  let y=210;for(let q=0;q<8;q++){const e=room.ex[q];g.font=`700 28px ${MONO}`;g.fillStyle='#b62d1b';g.fillText(e?'No. '+e.d.no:'—',70,y);
   g.fillStyle=e?'#1d1a16':'#8a7a66';fit(g,e?e.d.title:'In preparation',W-360,44,'900',SERIF);g.fillText(e?e.d.title:'In preparation',260,y);
   if(e){g.font=`italic 24px ${SERIF}`;g.fillStyle='#6b3f22';g.fillText(String(e.d.kind||''),260,y+34)}y+=96}
  return c}
 function plateCanvas(d){const c=canvas(512,270),g=c.getContext('2d'),col=d.color||'#c8321e';const gr=g.createRadialGradient(256,135,10,256,135,300);gr.addColorStop(0,'#2a1d14');gr.addColorStop(1,'#0d0907');g.fillStyle=gr;g.fillRect(0,0,512,270);
  g.strokeStyle=col;g.globalAlpha=.6;g.lineWidth=2;g.strokeRect(22,22,468,226);g.globalAlpha=1;g.textAlign='center';g.fillStyle=col;g.font=`700 18px ${MONO}`;g.fillText('No. '+d.no,256,92);
  g.fillStyle='#efe4cc';fit(g,d.title,440,46,'900',SERIF);g.fillText(d.title,256,150);g.fillStyle='#b89a74';g.font=`italic 18px ${SERIF}`;g.fillText(String(d.kind||''),256,190);return c}
 function exitCanvas(){const c=canvas(256,96),g=c.getContext('2d');g.fillStyle='#0f7a3c';g.fillRect(0,0,256,96);g.fillStyle='#eafff0';g.font=`900 56px Arial,Helvetica,sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText('EXIT',128,52);return c}

 // ---------------- light bakes
 const px16=m=>(m+8)*32;
 function softRect(g,x,y,w,h,blur,alpha){g.save();g.shadowColor=`rgba(0,0,0,${alpha})`;g.shadowBlur=blur;g.shadowOffsetX=4000;g.fillStyle='#000';g.fillRect(x-4000,y,w,h);g.restore()}
 function moonPatch(h,cx=0,cz=0){ // light from a ±LA opening at the ceiling, clipped by the well top, with mullion shadows
  const s0=GH,s1=K.LW,x0=Math.max(-K.LA+MX*s0,-K.LA+MX*s1),x1=Math.min(K.LA+MX*s0,K.LA+MX*s1),z0=Math.max(-K.LA+MZ*s0,-K.LA+MZ*s1),z1=Math.min(K.LA+MZ*s0,K.LA+MZ*s1);
  h.save();h.globalCompositeOperation='lighter';h.shadowColor='rgba(125,155,225,.95)';h.shadowBlur=12;h.shadowOffsetX=4000;h.fillStyle='rgba(125,155,225,.95)';
  h.fillRect(px16(x0)-4000,px16(z0),(x1-x0)*32,(z1-z0)*32);h.restore();
  h.save();h.beginPath();h.rect(px16(x0),px16(z0),(x1-x0)*32,(z1-z0)*32);h.clip();h.globalCompositeOperation='destination-out';h.strokeStyle='rgba(0,0,0,.8)';h.lineWidth=2.2;
  for(const [a,b] of lanternBars()){const ax=a.x+MX*a.y,az=a.z+MZ*a.y,bx=b.x+MX*b.y,bz=b.z+MZ*b.y;h.beginPath();h.moveTo(px16(ax),px16(az));h.lineTo(px16(bx),px16(bz));h.stroke()}
  // the bench's shadow inside the patch
  h.fillStyle='rgba(0,0,0,.7)';h.fillRect(px16(-1+MX*.46),px16(-.27+MZ*.46),2*32,.54*32);h.restore()}
 function lanternBars(){const A=new V3(0,K.LP,0),C=[[-K.LA,-K.LA],[K.LA,-K.LA],[K.LA,K.LA],[-K.LA,K.LA]].map(([x,z])=>new V3(x,K.LW,z)),out=[];
  for(let k=0;k<4;k++){const a=C[k],b=C[(k+1)%4];out.push([a,A],[a,b]);for(let f=1;f<6;f++)out.push([a.clone().lerp(b,f/6),A]);for(const g of [1/3,2/3])out.push([a.clone().lerp(A,g),b.clone().lerp(A,g)])}return out}
 const bakeCache={};
 function galleryFloorBake(mask){const key='gf'+SIDES.map(s=>mask[s]?1:0).join('');if(bakeCache[key])return bakeCache[key];
  const S=512,a=canvas(S,S),g=a.getContext('2d'),l=canvas(S,S),h=l.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,S,S);
  // ambient occlusion along the walls, open at doorways
  for(const s of SIDES){const f=WF[s];for(const [s0,s1] of mask[s]?[[-IN,-DWH-.15],[DWH+.15,IN]]:[[-IN,IN]]){
   const P=[0,1].map(k=>{const sv=k?s1:s0;return[-f.n[0]*IN+f.t[0]*sv,-f.n[1]*IN+f.t[1]*sv]}),Q=P.map(p=>[p[0]+f.n[0]*1.1,p[1]+f.n[1]*1.1]);
   const gr=g.createLinearGradient(px16(P[0][0]),px16(P[0][1]),px16(Q[0][0]),px16(Q[0][1]));gr.addColorStop(0,'rgba(0,0,0,.5)');gr.addColorStop(.25,'rgba(0,0,0,.18)');gr.addColorStop(1,'rgba(0,0,0,0)');
   g.fillStyle=gr;g.beginPath();g.moveTo(px16(P[0][0]),px16(P[0][1]));g.lineTo(px16(P[1][0]),px16(P[1][1]));g.lineTo(px16(Q[1][0]),px16(Q[1][1]));g.lineTo(px16(Q[0][0]),px16(Q[0][1]));g.fill()}}
  for(const s of SIDES)for(const sv of [-K.SLOT,K.SLOT]){const f=WF[s],x=-f.n[0]*IN+f.t[0]*sv+f.n[0]*K.CD,z=-f.n[1]*IN+f.t[1]*sv+f.n[1]*K.CD;
   softRect(g,px16(x-.6),px16(z-.6),1.2*32,1.2*32,18,.75);softRect(g,px16(x-.54),px16(z-.54),1.08*32,1.08*32,5,.8)}
  softRect(g,px16(-1.02),px16(-.3),2.04*32,.6*32,10,.55);for(const [x,z] of [[-.85,-.2],[.85,-.2],[-.85,.2],[.85,.2]])softRect(g,px16(x-.05),px16(z-.05),3.2,3.2,4,.6);
  h.fillStyle='#000';h.fillRect(0,0,S,S);h.globalCompositeOperation='lighter';
  for(const s of SIDES)for(const sv of [-K.SLOT,K.SLOT]){const f=WF[s],x=-f.n[0]*IN+f.t[0]*sv+f.n[0]*1.55,z=-f.n[1]*IN+f.t[1]*sv+f.n[1]*1.55;
   const gr=h.createRadialGradient(px16(x),px16(z),0,px16(x),px16(z),1.9*32);gr.addColorStop(0,'rgba(255,190,120,.8)');gr.addColorStop(.5,'rgba(255,170,100,.3)');gr.addColorStop(1,'rgba(255,160,90,0)');h.fillStyle=gr;h.fillRect(0,0,S,S)}
  {const gr=h.createRadialGradient(256,256,0,256,256,7.5*32);gr.addColorStop(0,'rgba(140,112,90,.45)');gr.addColorStop(1,'rgba(110,88,70,.3)');h.fillStyle=gr;h.fillRect(0,0,S,S)}
  moonPatch(h);
  const A=tex(a,false),Lm=tex(l);for(const t of [A,Lm])t.channel=1;return bakeCache[key]={ao:A,lm:Lm}}
 function galleryWallBake(){if(bakeCache.gw)return bakeCache.gw;const W=512,H=512,a=canvas(W,H),g=a.getContext('2d'),l=canvas(W,H),h=l.getContext('2d');
  const sx=s=>(s+8)*32,sy=(row,y)=>(row?256:512)-y/GH*256;g.fillStyle='#fff';g.fillRect(0,0,W,H);h.fillStyle='#000';h.fillRect(0,0,W,H);h.globalCompositeOperation='lighter';
  for(const row of [0,1]){const top=row?0:256;
   let gr=g.createLinearGradient(0,sy(row,0),0,sy(row,.6));gr.addColorStop(0,'rgba(0,0,0,.45)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,top,W,256);
   gr=g.createLinearGradient(0,sy(row,GH),0,sy(row,GH-.9));gr.addColorStop(0,'rgba(0,0,0,.4)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,top,W,256);
   for(const e of [-1,1]){gr=g.createLinearGradient(sx(e*IN),0,sx(e*(IN-.9)),0);gr.addColorStop(0,'rgba(0,0,0,.45)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,top,W,256)}
   if(row)for(const e of [-1,1]){gr=g.createLinearGradient(sx(e*DWH),0,sx(e*(DWH+.6)),0);gr.addColorStop(0,'rgba(0,0,0,.28)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,sy(1,DH+.4),W,sy(1,0)-sy(1,DH+.4))}
   h.save();h.beginPath();h.rect(0,top,W,256);h.clip();
   const pools=[[-K.SLOT,1],[K.SLOT,1]];if(!row)pools.push([0,.75]);
   for(const [s,k] of pools){ // picture-light scallop over the frame, and the track spot grazing the case below it
    h.save();h.beginPath();h.rect(0,sy(row,3.9),W,sy(row,0)-sy(row,3.9));h.clip();h.translate(sx(s),sy(row,3.9));h.scale(1.25,1.15);let r=h.createRadialGradient(0,0,0,0,0,1.75*32);
    r.addColorStop(0,`rgba(255,222,170,${k})`);r.addColorStop(.3,`rgba(255,200,140,${.75*k})`);r.addColorStop(.62,`rgba(255,180,115,${.25*k})`);r.addColorStop(1,'rgba(255,170,100,0)');
    h.fillStyle=r;h.beginPath();h.arc(0,0,1.75*32,0,7);h.fill();h.restore();
    h.save();h.translate(sx(s),sy(row,3.9));h.scale(1.6,.6);r=h.createRadialGradient(0,0,0,0,0,.6*32);r.addColorStop(0,`rgba(255,214,160,${.35*k})`);r.addColorStop(1,'rgba(255,200,140,0)');h.fillStyle=r;h.beginPath();h.arc(0,0,.6*32,0,7);h.fill();h.restore();
    h.save();h.translate(sx(s),sy(row,1.9));h.scale(1.1,1.4);r=h.createRadialGradient(0,0,0,0,0,1.25*32);r.addColorStop(0,`rgba(255,200,140,${.35*k})`);r.addColorStop(1,'rgba(255,180,110,0)');h.fillStyle=r;h.beginPath();h.arc(0,0,1.25*32,0,7);h.fill();h.restore()}
   gr=h.createLinearGradient(0,sy(row,0),0,sy(row,1.2));gr.addColorStop(0,'rgba(90,60,40,.25)');gr.addColorStop(1,'rgba(90,60,40,0)');h.fillStyle=gr;h.fillRect(0,top,W,256);
   gr=h.createLinearGradient(0,sy(row,0),0,sy(row,GH));gr.addColorStop(0,'rgba(150,120,95,.42)');gr.addColorStop(.55,'rgba(150,120,95,.55)');gr.addColorStop(1,'rgba(120,105,100,.3)');h.fillStyle=gr;h.fillRect(0,top,W,256);h.restore()}
  const A=tex(a,false),Lm=tex(l);for(const t of [A,Lm])t.channel=1;return bakeCache.gw={ao:A,lm:Lm}}
 function ceilingBake(){if(bakeCache.c)return bakeCache.c;const S=128,a=canvas(S,S),g=a.getContext('2d'),l=canvas(S,S),h=l.getContext('2d'),p=m=>(m+8)*8;
  g.fillStyle='#fff';g.fillRect(0,0,S,S);for(const s of SIDES){const f=WF[s],x0=p(-f.n[0]*IN),z0=p(-f.n[1]*IN),x1=p(-f.n[0]*(IN-1.2)),z1=p(-f.n[1]*(IN-1.2));
   const gr=g.createLinearGradient(x0,z0,x1,z1);gr.addColorStop(0,'rgba(0,0,0,.55)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,S,S)}
  h.fillStyle='#000';h.fillRect(0,0,S,S);const gr=h.createRadialGradient(64,64,10,64,64,70);gr.addColorStop(0,'rgba(110,130,180,.5)');gr.addColorStop(.6,'rgba(150,120,95,.25)');gr.addColorStop(1,'rgba(120,90,70,.12)');h.fillStyle=gr;h.fillRect(0,0,S,S);
  const A=tex(a,false),Lm=tex(l);for(const t of [A,Lm])t.channel=1;return bakeCache.c={ao:A,lm:Lm}}

 // ---------------- world containers
 const world={rooms:[],slots:[],shapes:[],proxies:{floor:[],wall:[],hit:[]},shafts:[],dust:[],M,K,start:{x:0,z:5.4,yaw:0},lazy:[],ogQueue:[]};
 const dynamic=[];

 // ---------------- case pieces shared by all wall cases
 const PANE=.94,PH=1.1,PB=.97; // pane width, height, bottom
 const CG={};
 {const pane=new T.PlaneGeometry(PANE,PH);
  CG.static=[pane.clone().translate(0,PB+PH/2,-PANE/2),pane.clone().rotateY(Math.PI/2).translate(-PANE/2,PB+PH/2,0),pane.clone().rotateY(-Math.PI/2).translate(PANE/2,PB+PH/2,0)];
  CG.door=pane.clone().translate(PANE/2,0,0);CG.doorFrame=G.frame(PANE,PH,PR.rail).translate(PANE/2,0,0);}
 function caseStatic(add,Mc,sealed){
  add('walnutD',rb(1.08,.1,1.08,.012,0,.05,0),Mc);add('walnut',rb(.98,.8,.98,.008,0,.5,0),Mc);
  for(let f=0;f<4;f++){const m=M4().makeRotationY(f*Math.PI/2).multiply(M4().makeTranslation(0,.5,.49));add('walnut',G.frame(.7,.54,PR.panel),Mc.clone().multiply(m))}
  add('walnut',rb(1.06,.05,1.06,.012,0,.915,0),Mc);add('brass',box(.985,.028,.004,0,.13,.493),Mc);
  if(sealed){add('linen',G.drape(1,1.15,1,mulberry(3)()*9),Mc.clone().multiply(M4().makeTranslation(0,.94,0)));return}
  add('velvet',box(.94,.03,.94,0,.955,0),Mc);
  for(const [x,z] of [[-1,-1],[1,-1],[1,1],[-1,1]])add('brass',box(.024,1.15,.024,x*.47,PB+.55,z*.47),Mc);
  const sq=[[-.48,-.48],[-.48,.48],[.48,.48],[.48,-.48]];
  add('brass',G.sweep(sq,shiftY(PR.cap,.94),true),Mc);add('brass',G.sweep(sq,shiftY(PR.cap,PB+PH-.01),true),Mc);
  add('walnut',rb(1.04,.12,1.04,.02,0,PB+PH+.09,0),Mc);add('brass',G.sweep([[-.52,-.52],[-.52,.52],[.52,.52],[.52,-.52]],shiftY(PR.cap,PB+PH+.025),true),Mc);
  add('black',new T.PlaneGeometry(.9,.9).rotateX(Math.PI/2).translate(0,PB+PH+.027,0),Mc);for(const x of [-.3,.3])add('lampSoft',new T.PlaneGeometry(.05,.7).rotateX(Math.PI/2).translate(x,PB+PH+.029,0),Mc);
  for(const g of CG.static)add('glass',g.clone(),Mc)}
 // the dynamic part of a case: door, specimen, halo, pick box
 const dotT=tex((()=>{const c=canvas(64,64),g=c.getContext('2d'),r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.4,'rgba(255,255,255,.35)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,64,64);return c})());
 function specimen(d,scale){const col=new T.Color(d.color||'#c8321e');let X=EXHIBITS[d.exhibit];
  if(!X){console.warn('Curio: demo '+d.slug+' has no exhibit builder; add one to assets/exhibits.js');X=(T,c)=>{const m=new T.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:.4});return{obj:new T.Mesh(new T.IcosahedronGeometry(.4,1),m),mats:[m]}}}
  const xb=X(T,col),spec=new T.Group();spec.add(xb.obj);spec.userData.x=xb;spec.scale.setScalar(scale);return{spec,col,xb}}
 function caseDynamic(room,Mc,e,q){const grp=new T.Group();Mc.decompose(grp.position,grp.quaternion,grp.scale);
  if(!e){const n=new V3(0,0,1).applyQuaternion(grp.quaternion),c=at(Mc,0,PB+PH/2,0);const slot={i:-1,d:null,room:room.id,q,kind:'sealed',grp,center:c,normal:n,h:0,sealed:true};world.slots.push(slot);return slot}
  const door=new T.Group();door.position.set(-PANE/2,PB+PH/2,PANE/2);door.add(new T.Mesh(CG.door,M.glass));door.add(new T.Mesh(CG.doorFrame,M.brass));
  const lock=new T.Mesh(box(.03,.07,.018),M.brass);lock.position.set(PANE-.04,0,.012);door.add(lock);grp.add(door);
  const hit=new T.Mesh(new T.BoxGeometry(1.12,2.3,1.12),new T.MeshBasicMaterial({visible:false}));hit.position.y=1.15;grp.add(hit);
  let spec=null,halo=null,col=new T.Color('#776655'),xb=null;
  if(e){({spec,col,xb}=specimen(e.d,.92));spec.position.y=PB+PH/2+.02;grp.add(spec);
   halo=new T.Sprite(new T.SpriteMaterial({map:dotT,color:col,transparent:true,blending:T.AdditiveBlending,depthWrite:false,opacity:.3}));halo.scale.setScalar(1.3);halo.position.set(0,PB+PH/2,-.15);grp.add(halo)}
  room.group.add(grp);
  const n=new V3(0,0,1).applyQuaternion(grp.quaternion),c=at(Mc,0,PB+PH/2,0);
  const slot={i:e?e.i:-1,d:e?e.d:null,room:room.id,q,kind:'case',grp,door,spec,halo,hit,xb,col,center:c,normal:n,h:0,sealed:!e,
   open:u=>{door.rotation.y=-(1-Math.pow(1-u,3))*1.95},
   light:{pos:at(Mc,0,GH-.12,K.IN-3.9-K.CD+0),target:c.clone().setY(1.25)},
   view:{x:c.x+n.x*1.9,z:c.z+n.z*1.9,yaw:Math.atan2(n.x,n.z)},enter:{pos:c.clone().addScaledVector(n,.98),look:c.clone()}};
  hit.userData.slot=slot;world.proxies.hit.push(hit);world.slots.push(slot);return slot}

 // ---------------- gallery
 function gallery(room){
  const B={},add=(k,g,m)=>{if(m)g.applyMatrix4(m);(B[k]??=[]).push(g)},{cx,cz}=room,mask={};for(const s of SIDES)mask[s]=room.doors[s]!=null;
  const WM={};for(const s of SIDES){const f=WF[s];WM[s]=wallMat(f.t,f.n,[cx-f.n[0]*IN,cz-f.n[1]*IN])}
  const wp=(s,sv,d=0)=>{const f=WF[s];return[cx-f.n[0]*IN+f.t[0]*sv+f.n[0]*d,cz-f.n[1]*IN+f.t[1]*sv+f.n[1]*d]};
  const fb=galleryFloorBake(mask),wb=galleryWallBake(),cb=ceilingBake();
  const floorM=parquetMat(fb.lm,fb.ao),plM=plasterMat(room.color,wb.lm,wb.ao,true),ceM=M.ceilingFor(cb.lm,cb.ao);
  const borderM=std({map:cl(X.walnut.map,1/1.1),normalMap:cl(X.walnut.normal,1/1.1),normalScale:new T.Vector2(.4,.4),color:0x9a8070,roughness:.38,lightMap:fb.lm,lightMapIntensity:8,aoMap:fb.ao,envMapIntensity:.9});
  const uvF=p=>[p[0],-p[2]],uv1F=p=>[(p[0]-cx+8)/16,1-(p[2]-cz+8)/16];
  // floor and the half-passages under each door
  {const B_=IN-.62;add('floor',quad([[cx-B_,0,cz-B_],[cx-B_,0,cz+B_],[cx+B_,0,cz+B_],[cx+B_,0,cz-B_]],uvF,uv1F));
   const strip=(x0,x1,z0,z1,alongX)=>add('border',quad([[x0,0,z0],[x0,0,z1],[x1,0,z1],[x1,0,z0]],alongX?p=>[p[0],p[2]]:p=>[p[2],p[0]],uv1F));
   strip(cx-IN,cx+IN,cz-IN,cz-B_,true);strip(cx-IN,cx+IN,cz+B_,cz+IN,true);strip(cx-IN,cx-B_,cz-B_,cz+B_,false);strip(cx+B_,cx+IN,cz-B_,cz+B_,false);
   for(const e of [-1,1]){add('brass',box(2*B_+.03,.004,.016,cx,.002,cz+e*B_));add('brass',box(.016,.004,2*B_+.03,cx+e*B_,.002,cz))}}
  for(const s of SIDES)if(mask[s]){const P=[[-DWH,0],[-DWH,-.2],[DWH,-.2],[DWH,0]].map(([sv,d])=>{const w=wp(s,sv,d);return[w[0],0,w[1]]});
   const xs=P.map(p=>p[0]),zs=P.map(p=>p[2]),x0=Math.min(...xs),x1=Math.max(...xs),z0=Math.min(...zs),z1=Math.max(...zs);
   add('floor',quad([[x0,0,z0],[x0,0,z1],[x1,0,z1],[x1,0,z0]],uvF,uv1F));add('brass',box(s==='n'||s==='s'?3:.05,.006,s==='n'||s==='s'?.05:3,(x0+x1)/2+(s==='e'?.1:s==='w'?-.1:0),.003,(z0+z1)/2+(s==='s'?.1:s==='n'?-.1:0)))}
  // walls
  for(const s of SIDES){const m=WM[s],row=mask[s]?.5:0,pieces=mask[s]?[[-IN,-DWH,0,GH],[DWH,IN,0,GH],[-DWH,DWH,DH,GH]]:[[-IN,IN,0,GH]];
   for(const [s0,s1,y0,y1] of pieces)add('wall',quad([[s0,y0,0],[s1,y0,0],[s1,y1,0],[s0,y1,0]],p=>[p[0],p[1]],p=>[(p[0]+8)/16,row+p[1]/GH*.5]),m);
   // wainscot boards and raised panels
   for(const [s0,s1] of mask[s]?[[-IN,-DWH-.24],[DWH+.24,IN]]:[[-IN,IN]]){add('walnut',quad([[s0,.17,.012],[s1,.17,.012],[s1,.95,.012],[s0,.95,.012]],p=>[p[0],p[1]]),m);
    const L=s1-s0-.3,n=Math.max(1,Math.round(L/1.3)),pw=L/n;for(let k=0;k<n;k++)add('walnut',G.frame(pw-.16,.58,PR.panel).translate(s0+.15+pw*(k+.5),.57,.012),m)}
   if(mask[s]){ // door: linings, architrave, lintel
    add('walnut',quad([[-DWH,0,0],[-DWH,0,-.2],[-DWH,DH,-.2],[-DWH,DH,0]],p=>[p[2],p[1]]),m);add('walnut',quad([[DWH,0,-.2],[DWH,0,0],[DWH,DH,0],[DWH,DH,-.2]],p=>[p[2],p[1]]),m);
    add('walnut',quad([[-DWH,DH,0],[-DWH,DH,-.2],[DWH,DH,-.2],[DWH,DH,0]],p=>[p[0],p[2]]),m);
    add('walnut',G.sweep([[DWH,0],[DWH,-DH],[-DWH,-DH],[-DWH,0]],PR.arch).rotateX(Math.PI/2),m);
    const other=rooms[room.doors[s]];const c=tex(giltText([{t:(other.kind==='rotunda'?'THE ROTUNDA':other.name.toUpperCase()),y:.42,size:96,weight:'600',track:14},{t:other.kind==='rotunda'?'NEW ACQUISITION':(other.sub||''),y:.82,size:40,weight:'400',fam:MONO,track:6}],1024,192),false);
    add('_decal',{g:new T.PlaneGeometry(2.7,.506).translate(0,4.89,.01),m,mat:decal(c)})}
   else if(SIDES.filter(x=>!mask[x])[0]===s){const c=tex(giltText([{t:room.name.toUpperCase(),y:.3,size:150,weight:'600',track:24},{t:room.sub,y:.62,size:56,weight:'400',fam:SERIF},{t:room.dates,y:.84,size:40,weight:'400',fam:MONO,track:4}],1024,512),false);
    add('_decal',{g:new T.PlaneGeometry(3.4,1.7).translate(0,3.25,.01),m,mat:decal(c)})}
   else{world.lazy.push({room:room.id,run:()=>{const t=tex(directoryCanvas(room));const mm=new T.Mesh(new T.PlaneGeometry(1.5,1.5).translate(0,2.75,.03).applyMatrix4(m),paperMat(t));room.group.add(mm)}});
    add('walnut',rb(1.62,1.62,.03,.008,0,2.75,.015),m)}}
  // continuous skirting and chair rail, broken only at doors; cornice all round
  const first=SIDES.findIndex(s=>mask[s]),runs=[];
  if(first<0)runs.push({pts:SIDES.map(s=>wp(s,-IN)),closed:true});
  else{let cur=[wp(SIDES[first],DWH+.26)];for(let k=1;k<4;k++){const s=SIDES[(first+k)%4];cur.push(wp(s,-IN));if(mask[s]){cur.push(wp(s,-DWH-.26));runs.push({pts:cur});cur=[wp(s,DWH+.26)]}}
   cur.push(wp(SIDES[first],-IN),wp(SIDES[first],-DWH-.26));runs.push({pts:cur})}
  for(const r of runs){add('walnutD',G.sweep(r.pts,PR.base,!!r.closed));add('walnut',G.sweep(r.pts,PR.chair,!!r.closed))}
  add('ceilMould',G.sweep(SIDES.map(s=>wp(s,-IN)),PR.cornice,true));add('walnut',G.sweep(SIDES.map(s=>wp(s,-IN)),[[0,4.56],[.018,4.56],[.03,4.575],[.034,4.6],[.026,4.625],[.012,4.64],[0,4.64]],true));
  {const q=IN-1.25;add('ceilMould',G.sweep([[-q,-q],[-q,q],[q,q],[q,-q]].map(([x,z])=>[cx+x,cz+z]),[[0,GH],[0,GH-.03],[.015,GH-.05],[.04,GH-.06],[.065,GH-.05],[.08,GH-.03],[.08,GH]],true))}
  // ceiling with the lantern well
  const LA=K.LA,cUV=p=>[p[0],p[2]];
  for(const [x0,x1,z0,z1] of [[-IN,IN,-IN,-LA],[-IN,IN,LA,IN],[-IN,-LA,-LA,LA],[LA,IN,-LA,LA]])add('ceil',quad([[cx+x0,GH,cz+z0],[cx+x1,GH,cz+z0],[cx+x1,GH,cz+z1],[cx+x0,GH,cz+z1]],cUV,uv1F));
  for(let k=0;k<4;k++){const a=[[-LA,-LA],[LA,-LA],[LA,LA],[-LA,LA]][k],b=[[-LA,-LA],[LA,-LA],[LA,LA],[-LA,LA]][(k+1)%4];
   add('ceil',quad([[cx+a[0],GH,cz+a[1]],[cx+b[0],GH,cz+b[1]],[cx+b[0],K.LW,cz+b[1]],[cx+a[0],K.LW,cz+a[1]]],p=>[p[0]+p[2],p[1]],()=>[.5,.5]))}
  add('ceilMould',G.sweep([[-LA,-LA],[-LA,LA],[LA,LA],[LA,-LA]].map(([x,z])=>[cx+x,cz+z]),trimAt(GH),true));
  // lantern: glass pyramid, iron glazing bars, brass lighting track
  {const A=[cx,K.LP,cz],C=[[-LA,-LA],[LA,-LA],[LA,LA],[-LA,LA]].map(([x,z])=>[cx+x,K.LW,cz+z]);
   for(let k=0;k<4;k++){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([...C[k],...A,...C[(k+1)%4]],3));g.setAttribute('normal',new T.Float32BufferAttribute([0,-1,0,0,-1,0,0,-1,0],3));g.setAttribute('uv',new T.Float32BufferAttribute([0,0,.5,1,1,0],2));add('glassSky',g)}
   for(const [a,b] of lanternBars())add('iron',G.bar(a.clone().add(new V3(cx,0,cz)),b.clone().add(new V3(cx,0,cz)),.05,.07));
   const tq=3.9;for(let k=0;k<4;k++){const a=[[-tq,-tq],[tq,-tq],[tq,tq],[-tq,tq]][k],b=[[-tq,-tq],[tq,-tq],[tq,tq],[-tq,tq]][(k+1)%4];add('brass',G.bar(new V3(cx+a[0],GH-.025,cz+a[1]),new V3(cx+b[0],GH-.025,cz+b[1]),.04,.05))}}
  // slots: frame + plate, picture light, wall label, case, track spot
  for(const s of SIDES)for(const k of [0,1]){const q=SIDES.indexOf(s)*2+k,sv=k?K.SLOT:-K.SLOT,m=WM[s],e=room.ex[q];
   const Mc=tr(m,sv,0,K.CD);caseStatic(add,Mc,!e);const slot=caseDynamic(room,Mc,e,q);
   add('gilt',G.frame(2.13,1.27,PR.gilt).translate(sv,3.05,0),m);
   const plate=new T.Mesh(new T.PlaneGeometry(1.81,.95).translate(sv,3.05,.014).applyMatrix4(m),e?std({color:0x2a2018,roughness:.55,envMapIntensity:.4}):M.velvet);room.group.add(plate);
   if(e){slot.plate=plate;world.lazy.push({room:room.id,run:()=>{plate.material.map=tex(plateCanvas(e.d));plate.material.color.set(0xffffff);plate.material.needsUpdate=true;world.ogQueue.push({room:room.id,url:'./'+encodeURIComponent(e.d.slug)+'/og.png',apply:t=>{t.colorSpace=T.SRGBColorSpace;t.anisotropy=aniso;plate.material.map=t;plate.material.color.set(0xffffff);plate.material.needsUpdate=true}})}})}
   // picture light: wall plate, two arms, hooded bar with a glowing slot
   add('brass',rb(.12,.08,.02,.006,sv,3.78,.01),m);for(const e2 of [-.18,.18])add('brass',G.rod(new V3(sv+e2*.2,3.78,.02),new V3(sv+e2,3.86,.3),.009),m);
   add('brass',G.rod(new V3(sv-.55,3.86,.33),new V3(sv+.55,3.86,.33),.035,16),m);add('lamp',box(1.02,.012,.03,sv,3.822,.335),m);
   // label
   const lab=new T.Mesh(new T.PlaneGeometry(.4,.25).translate(sv+1.02,1.42,.0135).applyMatrix4(m),paperMat(null));room.group.add(lab);add('walnutD',rb(.43,.28,.012,.003,sv+1.02,1.42,.004),m);
   world.lazy.push({room:room.id,run:()=>{lab.material.map=tex(e?labelCanvas(e.d):sealedLabel());lab.material.needsUpdate=true}});
   // track spot aimed at the case
   const lp=at(m,sv*.85,GH-.16,IN-3.9);slot.light={pos:lp,target:slot.center.clone().setY(1.3)};
   const dir=slot.light.target.clone().sub(lp).normalize(),can=lp.clone(),tip=lp.clone().addScaledVector(dir,.17);
   add('brass',G.rod(new V3(lp.x,GH-.03,lp.z),new V3(lp.x,lp.y+.03,lp.z),.012),null);add('black',G.rod(can,tip,.05,16),null);add('lamp',new T.CircleGeometry(.04,16).lookAt(dir).translate(tip.x+dir.x*.002,tip.y+dir.y*.002,tip.z+dir.z*.002),null);
   world.shapes.push({type:'box',x:slot.center.x,z:slot.center.z,hx:.6,hz:.6,room:room.id})}
  // brass number plaques on the velvet, one atlas per room
  {const quads=[],slotsHere=world.slots.filter(sl=>sl.room===room.id&&sl.kind==='case');slotsHere.forEach((sl,k)=>{sl.grp.updateMatrix();const Mq=sl.grp.matrix.clone().multiply(M4().makeTranslation(0,.996,.33)).multiply(M4().makeRotationX(-1.0));
    const g=new T.PlaneGeometry(.17,.05).applyMatrix4(Mq),uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,(k%2+uv.getX(i))/2,(Math.floor(k/2)+uv.getY(i))/4);quads.push(g)});
   if(quads.length){const pm=std({color:0xffffff,metalness:.9,roughness:.32,envMapIntensity:1.3}),mesh=new T.Mesh(G.merge(quads),pm);room.group.add(mesh);
    world.lazy.push({room:room.id,run:()=>{const c=canvas(1024,512),g=c.getContext('2d');slotsHere.forEach((sl,k)=>{const x=(k%2)*512,y=(3-Math.floor(k/2))*128;const gr=g.createLinearGradient(x,y,x,y+128);gr.addColorStop(0,'#e8c27a');gr.addColorStop(1,'#b4843c');g.fillStyle=gr;g.fillRect(x,y,512,128);
     g.strokeStyle='#7a5520';g.lineWidth=6;g.strokeRect(x+8,y+8,496,112);g.fillStyle='#3a2810';g.textAlign='center';g.textBaseline='middle';g.font=`700 44px ${SERIF}`;g.fillText(sl.d?('No. '+sl.d.no):'—',x+256,y+66)});
     pm.map=tex(c);pm.needsUpdate=true}})}}
  // bench
  {const by=.44;add('leather',rb(1.96,.1,.52,.04,cx,by+.05,cz));add('walnut',rb(2.02,.06,.56,.01,cx,by-.02,cz));
   for(const [x,z] of [[-.85,-.2],[.85,-.2],[-.85,.2],[.85,.2]])add('walnut',G.lathe([[0,0],[.03,0],[.032,.03],[.026,.06],[.022,.2],[.03,.26],[.022,.3],[.025,by-.05],[0,by-.05]],16).translate(cx+x,0,cz+z));
   for(const z of [-.2,.2])add('walnut',box(1.7,.03,.03,cx,.12,cz+z));
   world.shapes.push({type:'box',x:cx,z:cz,hx:1.05,hz:.32,room:room.id});world.proxies.wall.push(new T.Mesh(new T.BoxGeometry(2.04,.5,.56).translate(cx,.25,cz)))}
  // palms in two opposite corners
  palm(add,cx-7.05,cz+7.05,room.id*31+1,room.id);palm(add,cx+7.05,cz-7.05,room.id*31+2,room.id);
  // ceiling furniture: smoke detectors, one camera dome
  for(const [x,z] of [[-5.6,-5.6],[5.6,5.6]])add('white',G.lathe([[0,0],[.075,0],[.075,.02],[.06,.035],[0,.035]],20).rotateX(Math.PI).translate(cx+x,GH,cz+z));
  add('black',new T.SphereGeometry(.07,16,8,0,Math.PI*2,Math.PI/2,Math.PI/2).translate(cx+7.2,GH-.02,cz-7.2));add('white',G.lathe([[0,0],[.09,0],[.09,.025],[0,.025]],20).rotateX(Math.PI).translate(cx+7.2,GH,cz-7.2));
  // moon shaft
  addShaft(room,cx,cz,K.LA-.3,GH);
  // collision: wall faces and door jambs
  for(const s of SIDES){const segs=mask[s]?[[-IN,-DWH],[DWH,IN]]:[[-IN,IN]];for(const [a,b] of segs){const p=wp(s,a),q=wp(s,b);world.shapes.push({type:'seg',a:p,b:q,room:room.id})}
   if(mask[s])for(const e of [-DWH,DWH]){world.shapes.push({type:'seg',a:wp(s,e,0),b:wp(s,e,-.2),room:room.id})}
   for(const [s0,s1,y0,y1] of mask[s]?[[-IN,-DWH,0,GH],[DWH,IN,0,GH],[-DWH,DWH,DH,GH]]:[[-IN,IN,0,GH]])world.proxies.wall.push(new T.Mesh(new T.PlaneGeometry(s1-s0,y1-y0).translate((s0+s1)/2,(y0+y1)/2,0).applyMatrix4(WM[s])))}
  const fp=new T.Mesh(new T.PlaneGeometry(2*IN+.4,2*IN+.4).rotateX(-Math.PI/2).translate(cx,0,cz));fp.userData.room=room.id;world.proxies.floor.push(fp);
  room.walk=(x,z,r)=>{const lx=x-cx,lz=z-cz;if(Math.abs(lx)<IN-r&&Math.abs(lz)<IN-r)return true;for(const s of SIDES)if(mask[s]){const f=WF[s],sv=lx*f.t[0]+lz*f.t[1],d=lx*f.n[0]+lz*f.n[1]+IN;if(Math.abs(sv)<DWH-r&&d<=r+.01&&d>-.21)return true}return false};
  room.inside=(x,z)=>Math.abs(x-cx)<=IN+.2&&Math.abs(z-cz)<=IN+.2;
  return{B,mats:{floor:floorM,wall:plM,ceil:ceM,border:borderM}}}

 // ---------------- rotunda
 function rotunda(room){
  const B={},add=(k,g,m)=>{if(m)g.applyMatrix4(m);(B[k]??=[]).push(g)},HL=K.HL,RH=K.RH,Rc=IN/Math.cos(Math.PI/8);
  const F=[];for(let k=0;k<8;k++){const ph=k*Math.PI/4,u=[Math.cos(ph),Math.sin(ph)],n=[-u[0],-u[1]],t=[n[1],-n[0]];
   const side=k%2?null:{0:'e',2:'s',4:'w',6:'n'}[k];F.push({k,u,n,t,side,door:side?room.doors[side]:null,m:wallMat(t,n,[u[0]*IN,u[1]*IN])})}
  const wp=(f,sv,d=0)=>[f.u[0]*IN+f.t[0]*sv+f.n[0]*d,f.u[1]*IN+f.t[1]*sv+f.n[1]*d];
  // bakes
  const S=hi?2048:1024,k16=S/16;
  const fb=(()=>{const a=canvas(512,512),g=a.getContext('2d'),l=canvas(512,512),h=l.getContext('2d'),p=m=>(m+8)*32;g.fillStyle='#fff';g.fillRect(0,0,512,512);
   g.save();g.beginPath();for(let k=0;k<8;k++){const an=(k+.5)*Math.PI/4;g.lineTo(p(Math.cos(an)*Rc),p(Math.sin(an)*Rc))}g.closePath();g.lineWidth=60;g.strokeStyle='rgba(0,0,0,.28)';g.filter='blur(14px)';g.stroke();g.filter='none';g.lineWidth=14;g.strokeStyle='rgba(0,0,0,.3)';g.stroke();g.restore();
   for(let k=0;k<8;k++){const an=(k+.5)*Math.PI/4,r=Rc-.42;softRect(g,p(Math.cos(an)*r-.5),p(Math.sin(an)*r-.5),32,32,16,.7)}
   g.save();g.shadowColor='rgba(0,0,0,.75)';g.shadowBlur=26;g.shadowOffsetX=4000;g.fillStyle='#000';g.beginPath();g.arc(256-4000,256,1.02*32,0,7);g.fill();g.restore();
   for(let k=0;k<8;k++){const an=(k+.5)*Math.PI/4;softRect(g,p(Math.cos(an)*2.2-.1),p(Math.sin(an)*2.2-.1),6.4,6.4,5,.6)}
   h.fillStyle='#000';h.fillRect(0,0,512,512);h.globalCompositeOperation='lighter';
   let r=h.createRadialGradient(256,256,.9*32,256,256,3.4*32);r.addColorStop(0,'rgba(255,200,130,.75)');r.addColorStop(.5,'rgba(255,180,110,.3)');r.addColorStop(1,'rgba(255,170,100,0)');h.fillStyle=r;h.fillRect(0,0,512,512);
   for(const f of F)if(f.side)for(const sv of [-2.35,2.35]){const [x,z]=wp(f,sv,1);r=h.createRadialGradient(p(x),p(z),0,p(x),p(z),2.2*32);r.addColorStop(0,'rgba(255,190,120,.4)');r.addColorStop(1,'rgba(255,170,100,0)');h.fillStyle=r;h.fillRect(0,0,512,512)}
   r=h.createRadialGradient(256,256,0,256,256,7.6*32);r.addColorStop(0,'rgba(90,70,55,.25)');r.addColorStop(1,'rgba(60,45,35,.1)');h.fillStyle=r;h.fillRect(0,0,512,512);
   const oy=RH+6*Math.sin(Math.acos(1.35/IN)),ox=MX*oy,oz=MZ*oy;h.save();h.shadowColor='rgba(130,160,225,.8)';h.shadowBlur=16;h.shadowOffsetX=4000;h.fillStyle='rgba(130,160,225,.8)';h.beginPath();h.ellipse(p(ox)-4000,p(oz),1.32*32,1.3*32,0,0,7);h.fill();h.restore();
   world.oculusPatch={x:ox,z:oz};
   const A=tex(a,false),Lm=tex(l);for(const t of [A,Lm])t.channel=1;return{ao:A,lm:Lm}})();
  const wb=(()=>{const W=512,H=512,a=canvas(W,H),g=a.getContext('2d'),l=canvas(W,H),h=l.getContext('2d'),sx=s=>(s+4)*64,sy=(row,y)=>(row?256:512)-y/RH*256;
   g.fillStyle='#fff';g.fillRect(0,0,W,H);h.fillStyle='#000';h.fillRect(0,0,W,H);h.globalCompositeOperation='lighter';
   for(const row of [0,1]){const top=row?0:256;let gr=g.createLinearGradient(0,sy(row,0),0,sy(row,.7));gr.addColorStop(0,'rgba(0,0,0,.45)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,top,W,256);
    for(const e of [-1,1]){gr=g.createLinearGradient(sx(e*HL),0,sx(e*(HL-.8)),0);gr.addColorStop(0,'rgba(0,0,0,.5)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,top,W,256)}
    gr=g.createLinearGradient(0,sy(row,RH),0,sy(row,RH-1.6));gr.addColorStop(0,'rgba(0,0,0,.5)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,top,W,256);
    h.save();h.beginPath();h.rect(0,top,W,256);h.clip();
    if(!row)for(const s of [-2.35,2.35]){h.save();h.translate(sx(s),sy(row,3.25));h.scale(1,1.7);const r=h.createRadialGradient(0,0,0,0,0,1.3*64);r.addColorStop(0,'rgba(255,214,160,.95)');r.addColorStop(.3,'rgba(255,190,120,.45)');r.addColorStop(1,'rgba(255,170,100,0)');h.fillStyle=r;h.beginPath();h.arc(0,0,1.3*64,0,7);h.fill();h.restore()}
    else{const r=h.createRadialGradient(sx(0),sy(row,2.3),0,sx(0),sy(row,2.3),3*64);r.addColorStop(0,'rgba(255,190,120,.45)');r.addColorStop(1,'rgba(255,170,100,0)');h.fillStyle=r;h.fillRect(0,top,W,256)}
    gr=h.createLinearGradient(0,sy(row,0),0,sy(row,RH));gr.addColorStop(0,'rgba(120,90,60,.3)');gr.addColorStop(.6,'rgba(70,60,60,.12)');gr.addColorStop(1,'rgba(90,100,130,.2)');h.fillStyle=gr;h.fillRect(0,top,W,256);h.restore()}
   const A=tex(a,false),Lm=tex(l);for(const t of [A,Lm])t.channel=1;return{ao:A,lm:Lm}})();
  // floor: inlaid marble rose
  const fc=canvas(S,S),g=fc.getContext('2d'),orm=canvas(S,S),o=orm.getContext('2d'),C=S/2;
  const pat=(img,m)=>{const p=g.createPattern(img,'repeat');p.setTransform(new DOMMatrix().scale(k16*m/img.width));return p};
  const W_=pat(X.marbleW.map.image,1.8),G_=pat(X.marbleG.map.image,1.4),S_=pat(X.marbleS.map.image,1.6),R_=pat(X.marbleR.map.image,1.4);
  o.fillStyle='rgb(0,40,0)';o.fillRect(0,0,S,S);g.fillStyle=W_;g.fillRect(0,0,S,S);
  g.save();g.translate(C,C);g.rotate(Math.PI/4);for(let i=-12;i<12;i++)for(let j=-12;j<12;j++)if((i+j)&1){g.fillStyle=G_;g.fillRect(i*.9*k16+.06*k16,j*.9*k16+.06*k16,.78*k16,.78*k16)}g.restore();
  const ring=(r0,r1,fill)=>{g.fillStyle=fill;g.beginPath();g.arc(C,C,r1*k16,0,7);g.arc(C,C,r0*k16,0,7,true);g.fill()};
  const brassLine=(r,w=.035)=>{for(const [c,ctx] of [['#c9963f',g],['rgb(0,70,255)',o]]){ctx.strokeStyle=c;ctx.lineWidth=w*k16;ctx.beginPath();ctx.arc(C,C,r*k16,0,7);ctx.stroke()}};
  ring(5.85,6.35,G_);ring(2.9,5.85,W_);
  for(let k=0;k<16;k++){if(k%2)continue;const a0=k*Math.PI/8,a1=(k+1)*Math.PI/8;g.fillStyle=S_;g.beginPath();g.arc(C,C,5.85*k16,a0,a1);g.arc(C,C,2.9*k16,a1,a0,true);g.fill()}
  for(let k=0;k<16;k++){const a=k*Math.PI/8;for(const [cc,ctx] of [['#c9963f',g],['rgb(0,70,255)',o]]){ctx.strokeStyle=cc;ctx.lineWidth=.03*k16;ctx.beginPath();ctx.moveTo(C+Math.cos(a)*2.9*k16,C+Math.sin(a)*2.9*k16);ctx.lineTo(C+Math.cos(a)*5.85*k16,C+Math.sin(a)*5.85*k16);ctx.stroke()}}
  ring(2.62,2.9,R_);ring(.95,2.62,W_);
  for(let k=0;k<32;k++){const a=k*Math.PI/16,long=k%2===0,r=long?2.6:1.9,w=long?.2:.14;g.fillStyle=long?(k%4===0?S_:G_):R_;g.beginPath();g.moveTo(C+Math.cos(a)*r*k16,C+Math.sin(a)*r*k16);
   g.lineTo(C+Math.cos(a+w)*1.0*k16,C+Math.sin(a+w)*1.0*k16);g.lineTo(C+Math.cos(a-w)*1.0*k16,C+Math.sin(a-w)*1.0*k16);g.closePath();g.fill();g.strokeStyle='#c9963f';g.lineWidth=.012*k16;g.stroke()}
  ring(0,.95,G_);for(const r of [.95,2.62,2.9,5.85,6.35])brassLine(r);
  g.save();g.beginPath();for(let k=0;k<8;k++){const an=(k+.5)*Math.PI/4;g.lineTo(C+Math.cos(an)*(Rc+.3)*k16,C+Math.sin(an)*(Rc+.3)*k16)}g.closePath();
  for(let k=8;k>0;k--){const an=(k-.5)*Math.PI/4,r=(IN-.42)/Math.cos(Math.PI/8);k===8?g.moveTo(C+Math.cos(an)*r*k16,C+Math.sin(an)*r*k16):g.lineTo(C+Math.cos(an)*r*k16,C+Math.sin(an)*r*k16)}g.closePath();g.fillStyle=G_;g.fill('evenodd');g.restore();
  g.save();g.beginPath();for(let k=0;k<8;k++){const an=(k+.5)*Math.PI/4,r=Rc-.42/Math.cos(Math.PI/8);g.lineTo(C+Math.cos(an)*r*k16,C+Math.sin(an)*r*k16)}g.closePath();g.strokeStyle='#c9963f';g.lineWidth=.03*k16;g.stroke();
  o.strokeStyle='rgb(0,70,255)';o.lineWidth=.03*k16;o.stroke();g.restore();
  // grout seams for the normal map
  const SN=Math.min(S,1024),kn=SN/16,hc=canvas(SN,SN),hg=hc.getContext('2d');hg.fillStyle='#fff';hg.fillRect(0,0,SN,SN);hg.strokeStyle='#777';hg.lineWidth=1.5;
  for(const r of [.95,2.62,2.9,5.85,6.35]){hg.beginPath();hg.arc(SN/2,SN/2,r*kn,0,7);hg.stroke()}
  hg.save();hg.translate(SN/2,SN/2);hg.rotate(Math.PI/4);for(let i=-12;i<=12;i++){hg.beginPath();hg.moveTo(i*.9*kn,-12*kn);hg.lineTo(i*.9*kn,12*kn);hg.moveTo(-12*kn,i*.9*kn);hg.lineTo(12*kn,i*.9*kn);hg.stroke()}hg.restore();
  const hd=hg.getImageData(0,0,SN,SN).data,hf=new Float32Array(SN*SN);for(let i=0;i<SN*SN;i++)hf[i]=hd[i*4]/255;
  const floorM=std({map:tex(fc),roughnessMap:tex(orm,false),metalnessMap:tex(orm,false),normalMap:tex(nCanvas(hf,SN),false),normalScale:new T.Vector2(.5,.5),roughness:1,metalness:1,
   lightMap:fb.lm,lightMapIntensity:4,aoMap:fb.ao,envMapIntensity:1.1});
  for(const t of ['map','roughnessMap','metalnessMap','normalMap'])floorM[t].wrapS=floorM[t].wrapT=T.ClampToEdgeWrapping;
  // octagon floor + passages
  {const sh=new T.Shape();for(let k=0;k<8;k++){const an=(k+.5)*Math.PI/4;const x=Math.cos(an)*Rc,z=Math.sin(an)*Rc;k?sh.lineTo(x,-z):sh.moveTo(x,-z)}
   const fg=new T.ShapeGeometry(sh).rotateX(-Math.PI/2),p=fg.attributes.position,uv=[],uv1=[];for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);uv.push((x+8)/16,1-(z+8)/16);uv1.push((x+8)/16,1-(z+8)/16)}
   fg.setAttribute('uv',new T.Float32BufferAttribute(uv,2));fg.setAttribute('uv1',new T.Float32BufferAttribute(uv1,2));add('floor',fg);
   for(const f of F)if(f.side){const P=[[-DWH,0],[-DWH,-.2],[DWH,-.2],[DWH,0]].map(([sv,d])=>{const w=wp(f,sv,d);return[w[0],0,w[1]]}),xs=P.map(q=>q[0]),zs=P.map(q=>q[2]);
    const x0=Math.min(...xs),x1=Math.max(...xs),z0=Math.min(...zs),z1=Math.max(...zs);add('floor',quad([[x0,0,z0],[x0,0,z1],[x1,0,z1],[x1,0,z0]],q=>[(q[0]+8)/16,1-(q[2]+8)/16],q=>[(q[0]+8)/16,1-(q[2]+8)/16]))}}
  const stuccoM=plasterMat('#cdb58d',wb.lm,wb.ao);stuccoM.lightMapIntensity=3.2;
  // walls
  for(const f of F){const m=f.m,row=f.side?0:.5,uv1=p=>[(p[0]+4)/8,row+p[1]/RH*.5];
   if(f.side){for(const [s0,s1,y0,y1] of [[-HL,-DWH,0,RH],[DWH,HL,0,RH],[-DWH,DWH,DH,RH]])add('wall',quad([[s0,y0,0],[s1,y0,0],[s1,y1,0],[s0,y1,0]],p=>[p[0],p[1]],uv1),m);
    add('walnut',quad([[-DWH,0,0],[-DWH,0,-.2],[-DWH,DH,-.2],[-DWH,DH,0]],p=>[p[2],p[1]]),m);add('walnut',quad([[DWH,0,-.2],[DWH,0,0],[DWH,DH,0],[DWH,DH,-.2]],p=>[p[2],p[1]]),m);
    add('walnut',quad([[-DWH,DH,0],[-DWH,DH,-.2],[DWH,DH,-.2],[DWH,DH,0]],p=>[p[0],p[2]]),m);
    add('marbleW',G.sweep([[DWH,0],[DWH,-DH],[-DWH,-DH],[-DWH,0]],PR.arch.map(([o,y])=>[o*1.5,y*1.6])).rotateX(Math.PI/2),m);
    // door head: frieze panel + cornice ledge
    add('marbleW',rb(DWH*2+1.1,.62,.08,.01,0,DH+.68,.04),m);add('marbleW',G.sweep([[-DWH-.66,-(DH+1.0)],[DWH+.66,-(DH+1.0)]],[[.18,0],[.12,.03],[.07,.09],[.03,.14],[0,.16],[0,0]]).rotateX(Math.PI/2),m);
    const other=f.door!=null?rooms[f.door]:null;
    if(other){const c=tex(giltText([{t:other.name.toUpperCase(),y:.42,size:110,weight:'600',track:16},{t:other.sub,y:.82,size:44,weight:'400',fam:MONO,track:6}],1024,224),false);add('_decal',{g:new T.PlaneGeometry(2.9,.634).translate(0,DH+.68,.085),m,mat:decal(c)})}
    else{ // closed double doors
     for(const e of [-1,1]){const lm=M4().makeTranslation(e*DWH/2,DH/2,-.17);add('walnut',rb(DWH-.02,DH-.02,.07,.008).applyMatrix4(lm),m);
      for(const [y,h] of [[1.05,1.5],[2.95,1.9]])add('walnut',G.frame(DWH-.42,h,PR.panel).translate(e*DWH/2,y,-.135),m);add('brass',G.rod(new V3(-e*.12,1.0,-.12),new V3(-e*.12,1.5,-.12),.016),m)}
     const isEntrance=f.side==='s';const c=tex(giltText([{t:isEntrance?'ENTRANCE':'GALLERY',y:.42,size:110,weight:'600',track:16},{t:isEntrance?'EST. MMXXVI':'IN PREPARATION',y:.82,size:44,weight:'400',fam:MONO,track:6}],1024,224),false);
     add('_decal',{g:new T.PlaneGeometry(2.9,.634).translate(0,DH+.68,.085),m,mat:decal(c)});
     if(isEntrance){add('black',box(.56,.22,.06,0,DH+1.42,.03),m);add('_decal',{g:new T.PlaneGeometry(.52,.195).translate(0,DH+1.42,.062),m,mat:new T.MeshBasicMaterial({map:tex(exitCanvas()),color:new T.Color(1.6,1.6,1.6)})})}}
    // sconces
    for(const sv of [-2.35,2.35]){add('brass',G.lathe([[0,0],[.1,0],[.1,.012],[.03,.03],[0,.03]],24).rotateX(Math.PI/2).translate(sv,3.05,0),m);
     add('brass',G.rod(new V3(sv,3.05,.02),new V3(sv,3.05,.22),.014),m);add('brass',G.lathe([[0,0],[.05,0],[.055,.04],[.04,.07],[0,.07]],20).translate(sv,3.05,.24),m);
     add('lamp',new T.SphereGeometry(.075,20,14).translate(sv,3.2,.24),m)}}
   else{const sh=new T.Shape();sh.moveTo(-HL,0);sh.lineTo(HL,0);sh.lineTo(HL,RH);sh.lineTo(-HL,RH);sh.closePath();
    const hole=new T.Path();hole.moveTo(-1.4,.35);hole.lineTo(1.4,.35);hole.lineTo(1.4,4.6);hole.absarc(0,4.6,1.4,0,Math.PI,false);hole.lineTo(-1.4,.35);sh.holes.push(hole);
    const sg=new T.ShapeGeometry(sh,24),p=sg.attributes.position,u1=[];for(let i=0;i<p.count;i++)u1.push(...uv1([p.getX(i),p.getY(i)]));sg.setAttribute('uv1',new T.Float32BufferAttribute(u1,2));add('wall',sg,m);
    const ND=.9;add('niche',quad([[-1.4,.35,0],[-1.4,.35,-ND],[-1.4,4.6,-ND],[-1.4,4.6,0]],p=>[p[2],p[1]]),m);add('niche',quad([[1.4,.35,-ND],[1.4,.35,0],[1.4,4.6,0],[1.4,4.6,-ND]],p=>[p[2],p[1]]),m);
    add('niche',quad([[-1.4,.35,-ND],[1.4,.35,-ND],[1.4,4.6,-ND],[-1.4,4.6,-ND]],p=>[p[0],p[1]]),m);add('niche',new T.CircleGeometry(1.4,32,0,Math.PI).translate(0,4.6,-ND),m);add('marbleW',quad([[-1.4,.35,0],[1.4,.35,0],[1.4,.35,-ND],[-1.4,.35,-ND]],p=>[p[0],p[2]]),m);
    {const pos=[],nrm=[],uv=[];for(let i=0;i<24;i++){const a0=i/24*Math.PI,a1=(i+1)/24*Math.PI,P0=[Math.cos(a0)*1.4,4.6+Math.sin(a0)*1.4],P1=[Math.cos(a1)*1.4,4.6+Math.sin(a1)*1.4];
      const v=[[...P0,0],[...P1,0],[...P1,-ND],[...P0,0],[...P1,-ND],[...P0,-ND]];for(const q of v){pos.push(...q);const a=Math.atan2(q[1]-4.6,q[0]);nrm.push(-Math.cos(a),-Math.sin(a),0);uv.push(a,q[2])}}
     add('niche',G.fromArrays(pos,nrm,uv),m)}
    // arch moulding around the niche
    {const pts=[[1.4,-.35],[1.4,-4.6]];for(let i=1;i<24;i++){const a=i/24*Math.PI;pts.push([Math.cos(a)*1.4,-(4.6+Math.sin(a)*1.4)])}pts.push([-1.4,-4.6],[-1.4,-.35]);add('marbleW',G.sweep(pts,PR.arch.map(([o,y])=>[o*1.1,y*1.3])).rotateX(Math.PI/2),m)}
    // lunette with the Curio mark
    world.lazy.push({room:room.id,run:()=>{const lc=canvas(512,256),lg=lc.getContext('2d');lg.fillStyle='#3a110c';lg.fillRect(0,0,512,256);const t=tex(lc);const mm=new T.Mesh(new T.CircleGeometry(1.36,32,0,Math.PI).translate(0,4.6,-ND+.012).applyMatrix4(m),std({map:t,roughness:.6,envMapIntensity:.6}));
     const uvA=mm.geometry.attributes.uv;for(let i=0;i<uvA.count;i++)uvA.setXY(i,uvA.getX(i),uvA.getY(i)*2-1);room.group.add(mm);
     const img=new Image();img.onload=()=>{lg.drawImage(img,256-112,24,224,224);t.needsUpdate=true};img.src='./assets/logo.svg'}});
    cabinet(add,m,f.k)}
   // dado: green marble panels between white marble skirting and a gilt rail
   for(const [s0,s1] of f.side?[[-HL,-DWH-.38],[DWH+.38,HL]]:[[-HL,-1.65],[1.65,HL]]){add('marbleG',quad([[s0,.16,.015],[s1,.16,.015],[s1,1.0,.015],[s0,1.0,.015]],p=>[p[0],p[1]]),m)}}
  {const runs=[];for(const f of F)if(!f.side){const a=F[(f.k+7)%8],b=F[(f.k+1)%8];runs.push([wp(a,DWH+.38),wp(a,HL),wp(f,HL),wp(b,-DWH-.38)])}
   for(const r of runs){add('marbleW',G.sweep(r,PR.base.map(([o,y])=>[o*1.3,y*1.1])));}
   for(const f of F)if(!f.side){const a=F[(f.k+7)%8],b=F[(f.k+1)%8];add('gilt',G.sweep([wp(a,DWH+.38),wp(a,HL),wp(f,-1.62)],PR.chair.map(([o,y])=>[o,y+.06])));add('gilt',G.sweep([wp(f,1.62),wp(f,HL),wp(b,-DWH-.38)],PR.chair.map(([o,y])=>[o,y+.06])))}}
  // columns at the corners
  for(let k=0;k<8;k++){const an=(k+.5)*Math.PI/4,r=Rc-.42,x=Math.cos(an)*r,z=Math.sin(an)*r,ry=-an;
   add('marbleW',rb(.92,.26,.92,.01).rotateY(ry).translate(x,.13,z));add('marbleW',G.lathe([[0,0],[.45,0],[.45,.05],[.42,.09],[.4,.12],[.37,.13],[.37,.15],[.4,.19],[.4,.24],[.37,.28],[0,.28]],48).translate(x,.26,z));
   add('marbleG',G.fluted(.36,.31,6.2,24,.028).translate(x,.54+3.1,z));
   add('marbleW',G.lathe([[0,0],[.33,0],[.34,.03],[.33,.05],[.36,.08],[.42,.18],[.47,.3],[.48,.36],[0,.36]],48).translate(x,6.74,z));add('marbleW',rb(.98,.14,.98,.01).rotateY(ry).translate(x,7.17,z));
   add('gilt',new T.TorusGeometry(.325,.018,8,48).rotateX(Math.PI/2).translate(x,6.76,z));
   world.shapes.push({type:'circle',x,z,r:.5,room:0})}
  // entablature, frieze inscription, dome, ribs, oculus
  const oct=[];for(let k=0;k<8;k++){const an=(k+.5)*Math.PI/4;oct.push([Math.cos(an)*Rc,Math.sin(an)*Rc])}
  add('marbleW',G.sweep(oct,[[0,7.24],[.3,7.24],[.3,7.4],[.32,7.42],[.32,7.52],[.3,7.54],[.3,7.86],[.34,7.88],[.4,7.94],[.46,7.98],[.62,8.04],[.66,8.1],[.66,8.17],[0,8.17]],true));
  const words={0:'SPECIMENS OF MACHINE THOUGHT',2:'A CABINET OF AI CURIOSITIES',4:'OPEN EVERY CASE',6:'CURIO · EST. MMXXVI'};
  for(const f of F)if(words[f.k]){const c=tex(giltText([{t:words[f.k],y:.55,size:150,weight:'600',track:30}],2048,192),false);add('_decal',{g:new T.PlaneGeometry(5.6,.525).translate(0,7.7,.305),m:f.m,mat:decal(c)})}
  const vg=G.vault(IN,6,1.35,12,24).translate(0,8.17,0);add('dome',vg);
  for(let k=0;k<8;k++){const an=(k+.5)*Math.PI/4,pts=[],pm=Math.acos(1.35/IN);for(let j=0;j<=20;j++){const ph=j/20*pm;const rr=Rc*Math.cos(ph)-.1;pts.push(new V3(Math.cos(an)*rr,8.17+6*Math.sin(ph),Math.sin(an)*rr))}
   add('gilt',new T.TubeGeometry(new T.CatmullRomCurve3(pts),40,.09,10,false))}
  const oy=8.17+6*Math.sin(Math.acos(1.35/IN));add('gilt',new T.TorusGeometry(1.45,.11,12,64).rotateX(Math.PI/2).translate(0,oy-.02,0));
  add('ceil',inward(new T.CylinderGeometry(1.42,1.42,.9,48,1,true)).translate(0,oy+.45,0));
  // a warm ring of sconce light just under the cornice
  addShaft(room,0,0,1.25,oy);
  // centrepiece: marble pedestal, bell jar, brass rope ring, lectern
  if(newest){const e=newest;
   add('marbleW',G.lathe([[0,0],[1.02,0],[1.02,.1],[.97,.13],[.94,.17],[.9,.19],[.9,.24],[0,.24]],64));add('marbleG',new T.CylinderGeometry(.66,.68,.68,64).translate(0,.58,0));
   add('gilt',new T.TorusGeometry(.67,.025,8,64).rotateX(Math.PI/2).translate(0,.27,0));add('gilt',new T.TorusGeometry(.665,.025,8,64).rotateX(Math.PI/2).translate(0,.9,0));
   add('marbleW',G.lathe([[0,.92],[.72,.92],[.76,.95],[.82,.98],[.86,1.02],[.86,1.06],[0,1.06]],64));add('velvet',new T.CylinderGeometry(.6,.6,.02,48).translate(0,1.07,0));
   const grp=new T.Group(),jar=new T.Group();grp.add(jar);
   const jarG=new T.CylinderGeometry(.64,.64,1.32,64,1,true).translate(0,1.08+.66,0),domeG=new T.SphereGeometry(.64,64,24,0,Math.PI*2,0,Math.PI/2).translate(0,2.4,0);
   jar.add(new T.Mesh(jarG,M.glass),new T.Mesh(domeG,M.glass));const ringM=new T.Mesh(new T.TorusGeometry(.645,.022,10,64).rotateX(Math.PI/2).translate(0,1.09,0),M.brass);jar.add(ringM);
   const knob=new T.Mesh(G.lathe([[0,0],[.05,0],[.03,.04],[.06,.09],[.04,.14],[0,.15]],24).translate(0,3.03,0),M.brass);jar.add(knob);
   const {spec,col,xb}=specimen(e.d,1.3);spec.position.y=1.76;grp.add(spec);
   const halo=new T.Sprite(new T.SpriteMaterial({map:dotT,color:col,transparent:true,blending:T.AdditiveBlending,depthWrite:false,opacity:.35}));halo.scale.setScalar(1.9);halo.position.set(0,1.76,-.2);grp.add(halo);
   const hit=new T.Mesh(new T.CylinderGeometry(.9,.9,3.2,16),new T.MeshBasicMaterial({visible:false}));hit.position.y=1.6;grp.add(hit);room.group.add(grp);
   const c=new V3(0,1.76,0),n=new V3(0,0,1);
   const slot={i:e.i,d:e.d,room:0,q:0,kind:'jar',grp,door:jar,spec,halo,hit,xb,col,center:c,normal:n,h:0,sealed:false,
    open:u=>{const k=1-Math.pow(1-u,3);jar.position.y=k*2.1;jar.rotation.z=k*.12},
    light:{pos:new V3(0,oy-.4,0),target:c.clone()},view:{x:0,z:3.6,yaw:0},enter:{pos:new V3(0,1.76,1.25),look:c.clone()}};
   hit.userData.slot=slot;world.proxies.hit.push(hit);world.slots.push(slot);world.centre=slot;
   for(let k=0;k<8;k++){const an=(k+.5)*Math.PI/4,x=Math.cos(an)*2.2,z=Math.sin(an)*2.2;add('brass',G.lathe([[0,0],[.16,0],[.16,.02],[.05,.05],[.03,.08],[.025,.88],[.035,.9],[0,.9]],24).translate(x,0,z));
    add('brass',new T.SphereGeometry(.05,16,12).translate(x,.94,z));
    const an2=(k+1.5)*Math.PI/4,x2=Math.cos(an2)*2.2,z2=Math.sin(an2)*2.2,pts=[];for(let i=0;i<=12;i++){const t=i/12;pts.push(new V3(x+(x2-x)*t,.86-.2*4*t*(1-t),z+(z2-z)*t))}
    add('velvet',new T.TubeGeometry(new T.CatmullRomCurve3(pts),24,.022,8,false))}
   world.shapes.push({type:'circle',x:0,z:0,r:2.3,room:0});
   // lectern facing the entrance
   const lm=M4().makeTranslation(0,0,2.85);add('brass',G.lathe([[0,0],[.2,0],[.2,.02],[.05,.05],[.03,.1],[.03,.92],[0,.92]],24),lm);
   const tilt=M4().makeTranslation(0,1.0,2.85).multiply(M4().makeRotationX(-.6));add('walnutD',rb(.62,.42,.03,.01),tilt);
   const lab=new T.Mesh(new T.PlaneGeometry(.58,.3625).translate(0,0,.018).applyMatrix4(tilt),paperMat(null));room.group.add(lab);
   world.lazy.push({room:0,run:()=>{lab.material.map=tex(labelCanvas(e.d,'NEW ACQUISITION'));lab.material.needsUpdate=true}});
   world.shapes.push({type:'circle',x:0,z:2.85,r:.35,room:0})}
  // palms flanking the entrance
  for(const e of [-1,1])palm(add,e*2.3,6.95,90+e,0);
  // collision
  for(const f of F){if(f.door!=null){for(const [a,b] of [[-HL,-DWH],[DWH,HL]])world.shapes.push({type:'seg',a:wp(f,a),b:wp(f,b),room:0});for(const e of [-DWH,DWH])world.shapes.push({type:'seg',a:wp(f,e,0),b:wp(f,e,-.2),room:0})}
   else world.shapes.push({type:'seg',a:wp(f,-HL),b:wp(f,HL),room:0});
   if(f.door==null)world.proxies.wall.push(new T.Mesh(new T.PlaneGeometry(2*HL,RH).translate(0,RH/2,0).applyMatrix4(f.m)));
   else for(const [s0,s1,y0,y1] of [[-HL,-DWH,0,RH],[DWH,HL,0,RH],[-DWH,DWH,DH,RH]])world.proxies.wall.push(new T.Mesh(new T.PlaneGeometry(s1-s0,y1-y0).translate((s0+s1)/2,(y0+y1)/2,0).applyMatrix4(f.m)))}
  const fp=new T.Mesh(new T.PlaneGeometry(2*IN+.4,2*IN+.4).rotateX(-Math.PI/2));fp.userData.room=0;world.proxies.floor.push(fp);
  const inOct=(x,z,r)=>Math.abs(x)<IN-r&&Math.abs(z)<IN-r&&(Math.abs(x)+Math.abs(z))<IN*Math.SQRT2-r*Math.SQRT2;
  room.walk=(x,z,r)=>{if(inOct(x,z,r))return true;for(const f of F)if(f.door!=null){const sv=x*f.t[0]+z*f.t[1],d=x*f.n[0]+z*f.n[1]+IN;if(Math.abs(sv)<DWH-r&&d<=r+.01&&d>-.21)return true}return false};
  room.inside=(x,z)=>Math.abs(x)<=IN+.2&&Math.abs(z)<=IN+.2&&(Math.abs(x)+Math.abs(z))<=IN*Math.SQRT2+.3;
  return{B,mats:{floor:floorM,wall:stuccoM,ceil:M.ceilingFor(null,null)}}}
 const inward=g=>{const ix=g.index.array;for(let i=0;i<ix.length;i+=3){const t=ix[i+1];ix[i+1]=ix[i+2];ix[i+2]=t}const n=g.attributes.normal;for(let i=0;i<n.count;i++)n.setXYZ(i,-n.getX(i),-n.getY(i),-n.getZ(i));return g};
 const nCanvas=(h,S)=>{const c=canvas(S,S),g=c.getContext('2d'),im=g.createImageData(S,S),d=im.data;for(let y=0;y<S;y++)for(let x=0;x<S;x++){const xa=Math.min(S-1,x+1),xb=Math.max(0,x-1),ya=Math.min(S-1,y+1),yb=Math.max(0,y-1);
  const dx=(h[y*S+xa]-h[y*S+xb])*2,dy=(h[ya*S+x]-h[yb*S+x])*2;let nx=-dx,ny=dy,nz=1;const l=Math.hypot(nx,ny,nz);const i=(y*S+x)*4;d[i]=(nx/l*.5+.5)*255;d[i+1]=(ny/l*.5+.5)*255;d[i+2]=(nz/l*.5+.5)*255;d[i+3]=255}g.putImageData(im,0,0);return c};

 // potted kentia palm in a bronze urn at (x,z)
 const frondG=(()=>{const N=12,pos=[],uv=[],nrm=[];for(let i=0;i<N;i++){for(const k of [i,i+1]){const t=k/N,y=Math.sin(t*1.9)*.55,z=t*1.25,w=.24*Math.sin(Math.PI*Math.min(1,t*1.1+.05));pos.push(-w,y,z,w,y,z);uv.push(0,t,1,t);nrm.push(0,1,0,0,1,0)}}
  const ix=[];for(let i=0;i<N;i++){const a=i*4;ix.push(a,a+2,a+1,a+1,a+2,a+3)}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setAttribute('normal',new T.Float32BufferAttribute(nrm,3));g.setIndex(ix);g.computeVertexNormals();return g})();
 function palm(add,x,z,seed,room){const R=mulberry(seed);add('brass',G.lathe([[0,0],[.2,0],[.22,.03],[.18,.08],[.26,.22],[.3,.42],[.29,.5],[.32,.53],[.32,.56],[0,.56]],40).translate(x,0,z));
  add('black',new T.CircleGeometry(.29,24).rotateX(-Math.PI/2).translate(x,.55,z));
  for(let s=0;s<4;s++){const a=R()*6.28,r=R()*.1,h=1.05+R()*.65,bx=x+Math.cos(a)*r,bz=z+Math.sin(a)*r,tx=bx+Math.cos(a)*.18,tz=bz+Math.sin(a)*.18;
   add('frondStem',G.rod(new V3(bx,.5,bz),new V3(tx,h,tz),.016,6));
   for(let f=0;f<6;f++){const g=frondG.clone(),yaw=f/6*6.28+R()*.5,pitch=-.15-R()*.35;g.applyMatrix4(M4().makeRotationX(pitch)).applyMatrix4(M4().makeRotationY(yaw)).applyMatrix4(M4().makeScale(.8+R()*.4,.8+R()*.3,.8+R()*.4)).translate(tx,h,tz);add('frond',g)}}
  world.shapes.push({type:'circle',x,z,r:.42,room})}
 // curiosity cabinet filling a rotunda niche (wall-local frame m)
 const drawers=[];
 function cabinet(add,m,k){const ND=.9,W=2.56,H=3.9,y0=.35,D=.72,zf=-.14;
  add('walnutD',box(W,H,D,0,y0+H/2,zf-D/2),m);add('walnut',G.sweep([[-W/2-.04,zf-D],[-W/2-.04,zf+.04],[W/2+.04,zf+.04],[W/2+.04,zf-D]],[[0,y0+H-.02],[.03,y0+H],[.06,y0+H+.05],[.1,y0+H+.1],[.1,y0+H+.16],[0,y0+H+.16]]),m);
  add('walnut',box(W,.12,.04,0,y0+.06,zf+.02),m);
  const cols=9,rows=17,cw=(W-.12)/cols,rh=(H-.32)/rows;for(let i=0;i<cols;i++)for(let j=0;j<rows;j++)drawers.push(M4().multiplyMatrices(m,M4().makeTranslation(-W/2+.06+cw*(i+.5),y0+.18+rh*(j+.5),zf+.004)).multiply(M4().makeScale(cw-.012,rh-.012,1)));
  if(k===3){const lean=m.clone().multiply(M4().makeTranslation(.55,0,.28)).multiply(M4().makeRotationX(-.085));
   for(const x of [-.3,.3])add('walnut',box(.05,4.2,.05,x,2.1,0),lean);for(let i=0;i<13;i++)add('brass',G.rod(new V3(-.3,.35+i*.3,0),new V3(.3,.35+i*.3,0),.012),lean);
   add('brass',G.rod(new V3(-1.3,4.15,zf+.06),new V3(1.3,4.15,zf+.06),.014),m)}}

 // ---------------- moon shafts (fake volumetric light) and dust
 const shaftMat=new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,fog:false,uniforms:{t:{value:0},k:{value:1}},
  vertexShader:'attribute float sd;varying vec2 vUv;varying float vS;varying vec3 vW;varying vec3 vN;void main(){vUv=uv;vS=sd;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;vN=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*w;}',
  fragmentShader:`varying vec2 vUv;varying float vS;varying vec3 vW;varying vec3 vN;uniform float t,k;
   float h1(float x){return fract(sin(x*127.1)*43758.5453);}float n1(float x){float i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(h1(i),h1(i+1.),f);}
   void main(){vec3 V=normalize(cameraPosition-vW);float view=smoothstep(.04,.6,abs(dot(normalize(vN),V)));float dist=smoothstep(.5,3.5,length(cameraPosition-vW));
    float edge=pow(sin(3.14159*vUv.x),1.6),st=.35+.65*n1(vUv.x*9.+vS*37.+t*.03)*n1(vUv.x*23.+vS*11.-t*.05);
    float vert=smoothstep(0.,.3,vUv.y)*(.45+.55*vUv.y)*smoothstep(1.,.9,vUv.y);
    float a=edge*st*vert*view*dist*k*(.85+.15*sin(t*.4+vS*6.));gl_FragColor=vec4(vec3(.55,.66,1.)*a*.05,1.);
    #include <colorspace_fragment>
   }`});
 function addShaft(room,cx,cz,hw,top){const R=mulberry(room.id*13+5),N=hi?10:6,pos=[],nrm=[],uv=[],sd=[];
  for(let k=0;k<N;k++){const a=R()*Math.PI,w=hw*(.45+R()*.6),ox=(R()*2-1)*hw*.5,oz=(R()*2-1)*hw*.5,dx=Math.cos(a)*w,dz=Math.sin(a)*w,s0=R();
   const T0=[cx+ox-dx,top,cz+oz-dz],T1=[cx+ox+dx,top,cz+oz+dz],B0=[T0[0]+MX*top,0,T0[2]+MZ*top],B1=[T1[0]+MX*top,0,T1[2]+MZ*top];
   const n=new V3(...B1).sub(new V3(...B0)).cross(new V3(...T0).sub(new V3(...B0))).normalize();
   for(const [P_,u,v] of [[B0,0,0],[B1,1,0],[T1,1,1],[B0,0,0],[T1,1,1],[T0,0,1]]){pos.push(...P_);nrm.push(n.x,n.y,n.z);uv.push(u,v);sd.push(s0)}}
  const g=G.fromArrays(pos,nrm,uv);g.setAttribute('sd',new T.Float32BufferAttribute(sd,1));g.computeBoundingSphere();
  const s=new T.Mesh(g,shaftMat);s.renderOrder=5;room.group.add(s);world.shafts.push(s);
  const Nd=hi?150:60,pa=new Float32Array(Nd*3),ph=new Float32Array(Nd);
  for(let i=0;i<Nd;i++){const y=R()*top*.9;pa[i*3]=cx+(R()*2-1)*hw*.8+MX*(top-y);pa[i*3+1]=y;pa[i*3+2]=cz+(R()*2-1)*hw*.8+MZ*(top-y);ph[i]=R()*100}
  const dg=new T.BufferGeometry();dg.setAttribute('position',new T.BufferAttribute(pa,3));dg.setAttribute('ph',new T.BufferAttribute(ph,1));
  const d=new T.Points(dg,dustMat);d.renderOrder=6;d.frustumCulled=false;room.group.add(d);world.dust.push(d)}
 const shaftMats={shaft:shaftMat};
 const dustMat=new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false,uniforms:{t:{value:0},px:{value:1}},
  vertexShader:`attribute float ph;uniform float t,px;varying float vA;void main(){vec3 p=position+vec3(sin(t*.13+ph)*.25,sin(t*.07+ph*1.7)*.35,cos(t*.11+ph*.7)*.25);
   vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=px*(1.6+1.2*fract(ph*7.3))*(5./max(1.,-mv.z));vA=(.25+.75*fract(ph*3.1))*smoothstep(16.,3.,-mv.z)*smoothstep(.4,1.5,-mv.z)*(.5+.5*sin(t*.9+ph*5.));}`,
  fragmentShader:'varying float vA;void main(){vec2 c=gl_PointCoord-.5;float a=smoothstep(.5,.0,length(c));a*=a*vA;gl_FragColor=vec4(vec3(.8,.86,1.)*a*.55,1.);\n#include <colorspace_fragment>\n}'});
 world.shaftMats=shaftMats;world.dustMat=dustMat;

 // ---------------- assemble rooms
 M.frond=std({map:X.frond,alphaTest:.45,side:T.DoubleSide,roughness:.62,envMapIntensity:.35});M.frondStem=std({color:0x4f4a28,roughness:.7});
 const sharedMat={frond:M.frond,frondStem:M.frondStem,walnut:M.walnut,walnutD:M.walnutD,brass:M.brass,gilt:M.gilt,iron:M.iron,velvet:M.velvet,leather:M.leather,linen:M.linen,marbleW:M.marbleW,marbleG:M.marbleG,
  lamp:M.lamp,lampSoft:M.lampSoft,white:M.white,black:M.black,glass:M.glass,glassSky:M.glassSky,niche:M.niche,dome:M.dome};
 for(const r of rooms){r.group=new T.Group();r.group.name=r.name;
  const {B,mats}=r.kind==='rotunda'?rotunda(r):gallery(r);
  const matOf=k=>k==='floor'?mats.floor:k==='border'?mats.border:k==='wall'?mats.wall:k==='ceil'||k==='ceilMould'?(k==='ceil'?mats.ceil:M.white):sharedMat[k];
  for(const [k,list_] of Object.entries(B)){if(k==='_decal'){for(const d of list_){const mm=new T.Mesh(d.g.applyMatrix4(d.m),d.mat);mm.renderOrder=2;r.group.add(mm)}continue}
   const g=G.merge(list_);if(!g)continue;g.computeBoundingSphere();const mesh=new T.Mesh(g,matOf(k));mesh.name=r.name+':'+k;if(k==='glass'||k==='glassSky')mesh.renderOrder=3;r.group.add(mesh)}
  world.rooms.push(r)}
 if(drawers.length){const dm=new T.InstancedMesh(new T.PlaneGeometry(1,1),std({map:X.drawer,roughness:.55,envMapIntensity:.5}),drawers.length),R=mulberry(5),c=new T.Color();
  drawers.forEach((m,i)=>{dm.setMatrixAt(i,m);const v=.72+R()*.4;dm.setColorAt(i,c.setRGB(v,v*.97,v*.92))});dm.computeBoundingSphere();rooms[0].group.add(dm)}
 // sky dome, seen through the lanterns and the oculus
 world.sky=new T.Mesh(new T.SphereGeometry(400,48,24),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,fog:false,uniforms:{L:{value:new V3(...MOON).normalize()}},
  vertexShader:'varying vec3 vD;void main(){vD=position;vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_Position=p.xyww;}',
  fragmentShader:`varying vec3 vD;uniform vec3 L;float h(vec3 p){p=fract(p*.3183+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
   void main(){vec3 d=normalize(vD);float y=max(d.y,0.);vec3 c=mix(vec3(.05,.07,.13),vec3(.008,.012,.035),pow(y,.5));
    vec3 q=d*260.;vec3 f=floor(q);float s=h(f);c+=vec3(.85,.9,1.)*step(.9972,s)*smoothstep(.42,.05,length(fract(q)-.5))*(.5+1.5*h(f+3.1))*smoothstep(0.,.25,y);
    float m=dot(d,normalize(L));c+=vec3(.9,.94,1.)*smoothstep(.99955,.99975,m)*6.+vec3(.25,.3,.5)*pow(max(m,0.),900.)*1.5+vec3(.06,.08,.15)*pow(max(m,0.),18.);
    gl_FragColor=vec4(c,1.);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
   }`}));
 world.sky.renderOrder=50;world.sky.frustumCulled=false;
 // nav bounds
 const xs=rooms.map(r=>r.cx),zs=rooms.map(r=>r.cz);world.bounds={x0:Math.min(...xs)-8.4,x1:Math.max(...xs)+8.4,z0:Math.min(...zs)-8.4,z1:Math.max(...zs)+8.4};
 world.walk=(x,z,r)=>{for(const rm of rooms)if(rm.walk(x,z,r))return true;return false};
 world.roomAt=(x,z)=>{for(const rm of rooms)if(rm.inside(x,z)&&rm.walk(x,z,0))return rm.id;let best=0,bd=1e9;for(const rm of rooms){const d=Math.hypot(x-rm.cx,z-rm.cz);if(d<bd){bd=d;best=rm.id}}return best};
 return world}
