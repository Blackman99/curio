// Curio hall · renderer, walking camera, picking, portal culling, post-processing, HUD and the open-a-case animation.
import * as THREE from '../vendor/three.module.min.js';
import * as BGU from '../vendor/three-addons.js';
import {EXHIBITS} from '../exhibits.js';
import {makeTextures,mulberry} from './tex.js';
import {makeGeo} from './geo.js';
import {buildHall,K,plan} from './build.js';
import {makeNav} from './nav.js';
const {EffectComposer,RenderPass,UnrealBloomPass,OutputPass,ShaderPass}=BGU;

export async function startHall({list,V,openExhibit,esc}){
 const Q=new URLSearchParams(location.search),FIXED=Q.has('fixed');
 const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const coarse=matchMedia('(pointer:coarse)').matches,mobile=coarse||innerWidth<700;
 const tier=Q.get('quality')||(mobile?'low':'high'),hi=tier==='high';
 const cv=document.getElementById('c');
 const R=new THREE.WebGLRenderer({canvas:cv,antialias:!hi,powerPreference:'high-performance',preserveDrawingBuffer:FIXED});R.info.autoReset=false;
 let PR=Math.min(devicePixelRatio,hi?1.75:1.5);R.setPixelRatio(PR);R.setSize(innerWidth,innerHeight);
 R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.22;
 const S=new THREE.Scene(),root=new THREE.Group();S.add(root);S.fog=new THREE.FogExp2(0x0b0806,.014);S.background=new THREE.Color(0x020306);
 const cam=new THREE.PerspectiveCamera(mobile?70:60,innerWidth/innerHeight,.05,160);cam.rotation.order='YXZ';

 // ---------- build
 const t0=performance.now();
 const X=makeTextures(THREE,{aniso:Math.min(8,R.capabilities.getMaxAnisotropy()),hi});const tTex=performance.now()-t0;
 const G=makeGeo(THREE,BGU);
 const W=buildHall(THREE,{G,X,BGU,list,EXHIBITS,tier,aniso:Math.min(8,R.capabilities.getMaxAnisotropy())});
 for(const r of W.rooms)root.add(r.group);root.add(W.sky);
 const tHall=performance.now()-t0-tTex;
 const nav=makeNav(W,{r:.3});
 const buildMs=performance.now()-t0;

 // ---------- lights: warm fill, a pool of track spots that follow the visitor, a key light through the oculus
 const hemi=new THREE.HemisphereLight(0xffe2c4,0x2a1a10,.34);root.add(hemi);
 const NS=hi?6:4,spots=[];for(let k=0;k<NS;k++){const s=new THREE.SpotLight(0xffc68c,0,18,.36,.7,2);s.target=new THREE.Object3D();root.add(s,s.target);spots.push(s)}
 const key=new THREE.SpotLight(0xffd6a6,0,30,.13,.6,2);key.target=new THREE.Object3D();root.add(key,key.target);
 if(W.centre){key.position.copy(W.centre.light.pos);key.target.position.copy(W.centre.light.target);key.intensity=900}

 // ---------- environment reflections captured from inside the rotunda; set per material (scene.environment ignores envMapIntensity)
 let ENV=null,tEnv=0;const withEnv=o=>{if(ENV)o.traverse(n=>{if(n.material)for(const m of [].concat(n.material))if(m.isMeshStandardMaterial&&!m.envMap){m.envMap=ENV;m.needsUpdate=true}})};
 {const pm=new THREE.PMREMGenerator(R);W.rooms.forEach(r=>r.group.visible=r.id===0);root.position.set(0,-2.2,0);root.updateMatrixWorld(true);
  const te=performance.now();const rt=pm.fromScene(S,.035,.1,80);tEnv=performance.now()-te;ENV=rt.texture;root.position.set(0,0,0);root.updateMatrixWorld(true);pm.dispose();withEnv(root)}

 // ---------- post
 let comp=null,bloom=null,fin=null;
 if(hi){const rt=new THREE.WebGLRenderTarget(innerWidth*PR,innerHeight*PR,{type:THREE.HalfFloatType,samples:4});
  comp=new EffectComposer(R,rt);comp.setPixelRatio(PR);comp.setSize(innerWidth,innerHeight);comp.addPass(new RenderPass(S,cam));
  bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),.42,.55,.92);comp.addPass(bloom);comp.addPass(new OutputPass());
  // a single NaN/Inf texel fed to the blur chain grows into a screen-sized black rectangle: drop non-finite texels before bloom sees them
  {const hp=bloom.materialHighPassFilter;hp.fragmentShader=hp.fragmentShader.replace('vec4 texel = texture2D( tDiffuse, vUv );',
   'vec4 texel = texture2D( tDiffuse, vUv ); if ( any( equal( floatBitsToUint( texel ) & 0x7f800000u, uvec4( 0x7f800000u ) ) ) ) texel = vec4( 0.0 );');hp.needsUpdate=true}
  fin=new ShaderPass({uniforms:{tDiffuse:{value:null},t:{value:0},vig:{value:1}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
   fragmentShader:`uniform sampler2D tDiffuse;uniform float t,vig;varying vec2 vUv;float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
    void main(){vec4 c=texture2D(tDiffuse,vUv);vec2 d=vUv-.5;float v=1.-dot(d,d)*.9*vig;c.rgb*=v;c.rgb+=(h(vUv*vec2(1731.,977.)+t)-.5)*.022;gl_FragColor=c;}`});comp.addPass(fin)}
 W.dustMat.uniforms.px.value=PR*(innerHeight/900);

 // ---------- doors between rooms, for portal culling
 const DOORS=[];for(const r of W.rooms)for(const [s,j] of Object.entries(r.doors))if(j!=null&&r.id<j){const d={n:[0,-1],e:[1,0],s:[0,1],w:[-1,0]}[s],cx=r.cx+d[0]*8,cz=r.cz+d[1]*8,t=[-d[1],d[0]];
  DOORS.push({a:r.id,b:j,p:[[-1,0],[1,0],[1,1],[-1,1]].map(([u,v])=>new THREE.Vector3(cx+t[0]*u*1.55,v*(K.DH+.05),cz+t[1]*u*1.55)),c:new THREE.Vector3(cx,K.DH/2,cz)})}
 const proj=new THREE.Vector3();
 function visibleRooms(cur){const vis=new Set([cur]);const walk=(room,rect,depth)=>{if(depth>4)return;for(const d of DOORS){const o=d.a===room?d.b:d.b===room?d.a:null;if(o==null)continue;
   let x0=1,x1=-1,y0=1,y1=-1,behind=0;for(const p of d.p){proj.copy(p).applyMatrix4(cam.matrixWorldInverse);if(proj.z>-.05){behind++;continue}proj.applyMatrix4(cam.projectionMatrix);x0=Math.min(x0,proj.x);x1=Math.max(x1,proj.x);y0=Math.min(y0,proj.y);y1=Math.max(y1,proj.y)}
   if(behind===4)continue;if(behind){if(d.c.distanceTo(cam.position)>3.2)continue;x0=-1;x1=1;y0=-1;y1=1}
   const nr=[Math.max(rect[0],x0),Math.min(rect[1],x1),Math.max(rect[2],y0),Math.min(rect[3],y1)];if(nr[0]>=nr[1]||nr[2]>=nr[3])continue;
   const first=!vis.has(o);vis.add(o);if(first||depth<2)walk(o,nr,depth+1)}};walk(cur,[-1,1,-1,1],0);return vis}

 // ---------- player
 const P={x:W.start.x,z:W.start.z,yaw:W.start.yaw,pitch:-.04,vx:0,vz:0,bob:0,path:null,onArrive:null,face:null,fast:false};
 let yawT=P.yaw,pitchT=P.pitch;
 const keys=new Set(),joy={on:false,id:null,x:0,y:0,ox:0,oy:0};let wheelV=0;
 const curRoom=()=>W.roomAt(P.x,P.z);

 // ---------- HUD
 const $=id=>document.getElementById(id);
 const card=$('card'),hint=$('hint'),toast=$('toast'),mapC=$('map'),dir=$('dirlist'),joyEl=$('joy'),ring=new THREE.Mesh(new THREE.RingGeometry(.22,.27,48).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xffe2a8,transparent:true,opacity:.0,depthWrite:false,fog:false}));
 ring.renderOrder=8;root.add(ring);
 hint.textContent=coarse?'Left thumb walks · drag to look · tap a case to open':'W A S D to walk · drag to look around · click the floor to go there · click a case to open';
 const bySlot=new Map(W.slots.filter(s=>s.i>=0).map(s=>[s.i,s]));
 {const P_=plan(list);dir.innerHTML=P_.rooms.map(r=>`<li class="rm"><b>${esc(r.name)}</b>${r.kind==='gallery'&&r.dates?` <i>${esc(r.dates)}</i>`:''}<ul>${r.ex.map(e=>`<li><a href="${esc('./'+encodeURIComponent(e.d.slug)+'/')}" data-i="${e.i}"><span>No. ${esc(e.d.no)}</span> ${esc(e.d.title)}</a></li>`).join('')}</ul></li>`).join('')}
 dir.addEventListener('click',e=>{const a=e.target.closest('a');if(!a||e.metaKey||e.ctrlKey||e.shiftKey||e.button)return;e.preventDefault();goTo(+a.dataset.i);if(mobile)$('plan').classList.remove('open')});
 $('plantoggle').addEventListener('click',()=>$('plan').classList.toggle('open'));
 let shown=-1;const showCard=sl=>{const i=sl?sl.i:-1;if(i===shown)return;shown=i;if(i<0){card.classList.remove('on');return}const d=sl.d;
  card.innerHTML=`<a href="${esc('./'+encodeURIComponent(d.slug)+'/')}"><b>No. ${esc(d.no)} · ${esc(d.kind)}</b><h2>${esc(d.title)}</h2><p>${esc(d.blurb)}</p><span>Open the exhibit →</span></a>`;card.classList.add('on')};
 card.addEventListener('click',e=>{if(shown>=0&&!(e.metaKey||e.ctrlKey||e.shiftKey||e.button)&&e.target.closest('a')){e.preventDefault();goTo(shown)}});
 let toastT=0,lastRoom=-1;const showToast=r=>{toast.innerHTML=`<b>${esc(r.name)}</b><span>${esc(r.kind==='rotunda'?'New acquisition · No. '+(W.centre?W.centre.d.no:''):[r.sub,r.dates].filter(Boolean).join(' · '))}</span>`;toast.classList.add('on');toastT=3.2};

 // minimap
 const mg=mapC.getContext('2d'),MB=W.bounds;let mapScale=1,mapOff=[0,0];
 const mapFit=()=>{const w=mapC.clientWidth,h=mapC.clientHeight,dpr=Math.min(2,devicePixelRatio);mapC.width=w*dpr;mapC.height=h*dpr;mapScale=Math.min(w/(MB.x1-MB.x0),h/(MB.z1-MB.z0))*.94;
  mapOff=[w/2-(MB.x0+MB.x1)/2*mapScale,h/2-(MB.z0+MB.z1)/2*mapScale];mg.setTransform(dpr,0,0,dpr,0,0)};
 const mp=(x,z)=>[mapOff[0]+x*mapScale,mapOff[1]+z*mapScale];
 let mapHover=null;
 function drawMap(vis,cur){const w=mapC.clientWidth,h=mapC.clientHeight;mg.clearRect(0,0,w,h);
  for(const r of W.rooms){const on=vis.has(r.id);mg.fillStyle=r.id===cur?'rgba(217,167,74,.22)':on?'rgba(239,228,204,.08)':'rgba(239,228,204,.04)';mg.strokeStyle=r.id===cur?'#d9a74a':'rgba(239,228,204,.4)';mg.lineWidth=1;
   mg.beginPath();if(r.kind==='rotunda'){for(let k=0;k<8;k++){const a=(k+.5)*Math.PI/4,R_=7.8/Math.cos(Math.PI/8),[x,y]=mp(r.cx+Math.cos(a)*R_,r.cz+Math.sin(a)*R_);k?mg.lineTo(x,y):mg.moveTo(x,y)}mg.closePath()}
   else{const [x,y]=mp(r.cx-7.8,r.cz-7.8);mg.rect(x,y,15.6*mapScale,15.6*mapScale)}mg.fill();mg.stroke()}
  mg.fillStyle='#0b0806';for(const d of DOORS){const [x,y]=mp(d.c.x,d.c.z),hor=Math.abs(d.p[0].x-d.p[1].x)>.1;mg.fillRect(x-(hor?1.5:.5)*mapScale,y-(hor?.5:1.5)*mapScale,(hor?3:1)*mapScale,(hor?1:3)*mapScale)}
  for(const s of W.slots){const [x,y]=mp(s.center.x,s.center.z);mg.beginPath();mg.arc(x,y,s===mapHover?4:2.6,0,7);mg.fillStyle=s.i>=0?'#'+s.col.getHexString():'rgba(239,228,204,.25)';mg.fill();if(s===mapHover){mg.strokeStyle='#fff';mg.stroke()}}
  const [px,py]=mp(P.x,P.z),fw=-P.yaw-Math.PI/2;mg.fillStyle='rgba(255,226,168,.18)';mg.beginPath();mg.moveTo(px,py);mg.arc(px,py,26,fw-.5,fw+.5);mg.closePath();mg.fill();
  mg.fillStyle='#ffe2a8';mg.beginPath();mg.moveTo(px+Math.cos(fw)*6,py+Math.sin(fw)*6);mg.lineTo(px+Math.cos(fw+2.5)*4.5,py+Math.sin(fw+2.5)*4.5);mg.lineTo(px+Math.cos(fw-2.5)*4.5,py+Math.sin(fw-2.5)*4.5);mg.fill();
  if(mapHover&&mapHover.d){mg.font='700 10px "Courier New",monospace';const t='No. '+mapHover.d.no+' '+mapHover.d.title,tw=mg.measureText(t).width;const [x,y]=mp(mapHover.center.x,mapHover.center.z);
   const bx=Math.max(4,Math.min(w-tw-12,x-tw/2-4));mg.fillStyle='rgba(11,8,6,.9)';mg.fillRect(bx,y-22,tw+8,14);mg.fillStyle='#efe4cc';mg.fillText(t,bx+4,y-12)}}
 const mapPick=e=>{const b=mapC.getBoundingClientRect(),x=e.clientX-b.left,y=e.clientY-b.top;let best=null,bd=9;for(const s of W.slots){if(s.i<0)continue;const [sx,sy]=mp(s.center.x,s.center.z),d=Math.hypot(sx-x,sy-y);if(d<bd){bd=d;best=s}}
  return{slot:best,x:(x-mapOff[0])/mapScale,z:(y-mapOff[1])/mapScale}};
 mapC.addEventListener('pointermove',e=>{mapHover=mapPick(e).slot});mapC.addEventListener('pointerleave',()=>mapHover=null);
 mapC.addEventListener('click',e=>{interact();const m=mapPick(e);if(m.slot)goTo(m.slot.i);else walkTo(m.x,m.z,{fast:true})});
 mapFit();

 // ---------- walking to things
 function walkTo(x,z,{fast=false,face=null,then=null}={}){const p=nav.path(P.x,P.z,x,z);if(!p||!p.length){then&&then(false);return false}P.path=p;P.fast=fast;P.face=face;P.onArrive=then;
  ring.position.set(p[p.length-1].x,.012,p[p.length-1].z);ring.material.opacity=.9;return true}
 function goTo(i){const sl=bySlot.get(i);if(!sl||A.i>=0||V.open>=0)return;interact();const v=sl.view,d=Math.hypot(P.x-v.x,P.z-v.z);
  const near=d<2.6&&curRoom()===sl.room&&Math.abs(angDiff(P.yaw,v.yaw))<1.2;if(near){openExhibit(i);return}
  walkTo(v.x,v.z,{fast:d>9,face:v.yaw,then:okk=>{if(okk!==false)openExhibit(i)}})}
 const angDiff=(a,b)=>{let d=a-b;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return d};

 // ---------- picking
 const ray=new THREE.Raycaster(),mouse=new THREE.Vector2(9,9);let hover=null,floorHit=null,visible=new Set([0]);
 const setMouse=e=>mouse.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);
 function pick(){ray.setFromCamera(mouse,cam);ray.far=34;const hits=W.proxies.hit.filter(h=>visible.has(h.userData.slot.room));
  const a=ray.intersectObjects(hits,false)[0],w=ray.intersectObjects(W.proxies.wall,false)[0],f=ray.intersectObjects(W.proxies.floor.filter(m=>visible.has(m.userData.room)),false)[0];
  const da=a?a.distance:1e9,dw=w?w.distance:1e9,df=f?f.distance:1e9;
  if(a&&da<=dw&&da<=df&&da<14)return{slot:a.object.userData.slot};if(f&&df<dw&&nav.freeAt(f.point.x,f.point.z))return{floor:f.point};return{}}

 // ---------- input
 let drag=null,intro=RM||FIXED&&Q.has('noIntro')?1:0,introFast=false;const interact=()=>{if(intro<1)introFast=true}; // touching anything lands the fly-in quickly instead of cutting
 const LOOK=.0042;
 cv.addEventListener('pointerdown',e=>{if(e.button>0||A.i>=0)return;interact();
  if(e.pointerType!=='mouse'&&e.clientX<innerWidth*.45&&e.clientY>innerHeight*.5&&!joy.on){joy.on=true;joy.id=e.pointerId;joy.ox=e.clientX;joy.oy=e.clientY;joy.x=joy.y=0;
   joyEl.style.left=e.clientX+'px';joyEl.style.top=e.clientY+'px';joyEl.classList.add('on');try{cv.setPointerCapture(e.pointerId)}catch(_){}return}
  if(drag)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,lx:e.clientX,ly:e.clientY,moved:0,t:performance.now()};try{cv.setPointerCapture(e.pointerId)}catch(_){}});
 cv.addEventListener('pointermove',e=>{if(e.pointerType==='mouse')setMouse(e);
  if(joy.on&&e.pointerId===joy.id){const dx=e.clientX-joy.ox,dy=e.clientY-joy.oy,l=Math.hypot(dx,dy),m=Math.min(1,l/55);joy.x=l?dx/l*m:0;joy.y=l?dy/l*m:0;
   joyEl.firstElementChild.style.transform=`translate(${joy.x*34}px,${joy.y*34}px)`;return}
  if(drag&&e.pointerId===drag.id){const dx=e.clientX-drag.lx,dy=e.clientY-drag.ly;drag.lx=e.clientX;drag.ly=e.clientY;drag.moved=Math.max(drag.moved,Math.hypot(e.clientX-drag.x,e.clientY-drag.y));
   if(drag.moved>5){yawT+=dx*LOOK*(coarse?1.25:1);pitchT=Math.max(-1.15,Math.min(1.2,pitchT+dy*LOOK*(coarse?1.25:1)));cv.classList.add('drag');P.face=null}}});
 const endPtr=e=>{if(joy.on&&e.pointerId===joy.id){joy.on=false;joy.x=joy.y=0;joyEl.classList.remove('on');return}
  if(!drag||e.pointerId!==drag.id)return;const was=drag;drag=null;cv.classList.remove('drag');
  if(e.type==='pointerup'&&was.moved<=6){setMouse(e);const h=pick();if(h.slot)goTo(h.slot.i);else if(h.floor)walkTo(h.floor.x,h.floor.z)}
  if(e.pointerType!=='mouse')mouse.set(9,9)};
 cv.addEventListener('pointerup',endPtr);cv.addEventListener('pointercancel',endPtr);
 cv.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'&&!drag)mouse.set(9,9)});
 addEventListener('wheel',e=>{if(A.i>=0||V.open>=0||e.target.closest&&e.target.closest('#plan'))return;interact();P.path=null;wheelV-=e.deltaY*(e.deltaMode?.6:.012);wheelV=Math.max(-6,Math.min(6,wheelV));e.preventDefault()},{passive:false});
 addEventListener('keydown',e=>{if(A.i>=0||V.open>=0||e.metaKey||e.ctrlKey||e.altKey)return;if(e.target.closest&&e.target.closest('input,textarea'))return;const k=e.key.toLowerCase();
  if(['w','a','s','d','q','e','arrowup','arrowdown','arrowleft','arrowright','shift'].includes(k)){keys.add(k);interact();P.path=null;P.face=null;if(k.startsWith('arrow'))e.preventDefault()}
  if(e.key==='Enter'&&hover)goTo(hover.i)});
 addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));addEventListener('blur',()=>keys.clear());
 addEventListener('resize',()=>{cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();R.setSize(innerWidth,innerHeight);if(comp){comp.setSize(innerWidth,innerHeight);bloom.setSize(innerWidth,innerHeight)}mapFit();W.dustMat.uniforms.px.value=PR*(innerHeight/900)});

 // ---------- open / close a case
 const A={i:-1,t:0,dir:0,cb:null,dur:1.6,slot:null,from:{p:new THREE.Vector3(),q:new THREE.Quaternion()}};const flood=$('flood');
 const toP=new THREE.Vector3(),toQ=new THREE.Quaternion(),mtx=new THREE.Matrix4();
 const placeAt=sl=>{P.x=sl.view.x;P.z=sl.view.z;P.yaw=yawT=sl.view.yaw;P.pitch=pitchT=-.05;P.vx=P.vz=0;P.path=null;intro=1};
 V.enter=(i,cb,instant)=>{const sl=bySlot.get(i);if(!sl){cb&&cb();return}P.path=null;
  const far=Math.hypot(P.x-sl.view.x,P.z-sl.view.z)>4||curRoom()!==sl.room;if(instant||far)placeAt(sl);
  syncCam(0);A.from.p.copy(cam.position);A.from.q.copy(cam.quaternion);A.i=i;A.slot=sl;A.cb=cb;
  if(instant){A.t=1;A.dir=0;sl.open(1);applyEnter(1)}else{A.t=0;A.dir=1}};
 V.exit=(i,cb)=>{if(A.i<0){cb&&cb();return}A.dir=-1;A.t=Math.min(A.t,1);A.cb=cb};
 function applyEnter(u){const sl=A.slot;mtx.lookAt(sl.enter.pos,sl.enter.look,cam.up);toQ.setFromRotationMatrix(mtx);toP.copy(sl.enter.pos);
  const ec=u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2,cm=Math.min(1,ec*1.15);cam.position.lerpVectors(A.from.p,toP,cm);cam.quaternion.slerpQuaternions(A.from.q,toQ,cm);
  sl.open(Math.max(0,Math.min(1,(u-.35)/.4)));const fl=Math.max(0,(u-.6)/.4);flood.style.opacity=(fl*fl).toFixed(3);sl.h=Math.max(sl.h,u);cam.updateMatrixWorld()}

 // ---------- loop
 let T=0,frame=0,lastNow=performance.now(),fpsAcc=0,fpsN=0,fpsT=0,quality=hi?3:1,spotTick=0;
 const fwd=new THREE.Vector3(),tmp=new THREE.Vector3();
 function syncCam(dt){const ease=1-Math.pow(1-Math.min(1,intro),3);
  const bobY=RM?0:Math.sin(P.bob)*.022,bobX=RM?0:Math.cos(P.bob*.5)*.012;
  const ix=P.x,iz=P.z,iy=K.EYE+bobY;
  if(intro<1){const sx=0,sy=10.5,sz=1.2;cam.position.set(sx+(ix-sx)*ease,sy+(iy-sy)*ease,sz+(iz-sz)*ease);cam.rotation.set(-.95*(1-ease)+P.pitch*ease,P.yaw-.55*(1-ease)*(1-ease),0)}
  else{cam.position.set(ix+Math.cos(P.yaw)*bobX,iy,iz-Math.sin(P.yaw)*bobX);cam.rotation.set(P.pitch,P.yaw,0)}
  cam.updateMatrixWorld()}
 function step(dt){T+=dt;frame++;R.info.reset();
  if(intro<1&&!RM){intro=Math.min(1,intro+dt/(introFast?.7:3.8))}
  // movement
  if(A.i<0&&V.open<0){
   const turn=(keys.has('arrowleft')||keys.has('q')?1:0)-(keys.has('arrowright')||keys.has('e')?1:0);if(turn){yawT+=turn*dt*1.9}
   let f=(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0),s=(keys.has('d')?1:0)-(keys.has('a')?1:0);
   if(joy.on){f+=-joy.y;s+=joy.x}
   const run=keys.has('shift')?2:1,sp=3*run;let dvx=0,dvz=0;const sy=Math.sin(P.yaw),cy=Math.cos(P.yaw);
   if(f||s){const l=Math.max(1,Math.hypot(f,s));dvx=(-sy*f+cy*s)/l*sp;dvz=(-cy*f-sy*s)/l*sp}
   if(Math.abs(wheelV)>.01){dvx+=-sy*wheelV*1.6;dvz+=-cy*wheelV*1.6;wheelV*=Math.pow(.02,dt)}
   if(P.path&&P.path.length){const wp=P.path[0],dx=wp.x-P.x,dz=wp.z-P.z,d=Math.hypot(dx,dz),last=P.path.length===1;
    const vmax=P.fast?7.5:3.2,rem=P.path.reduce((a,p,k)=>a+(k?Math.hypot(p.x-P.path[k-1].x,p.z-P.path[k-1].z):d),0),v=Math.min(vmax,.8+rem*1.6);
    if(d<(last?.06:.35)){P.path.shift();if(!P.path.length){P.path=null;const cb=P.onArrive;P.onArrive=null;ring.material.opacity=0;if(P.face!=null){yawT=P.yaw+angDiff(P.face,P.yaw)}if(cb)setTimeout(()=>cb(true),P.face!=null?380:0)}}
    else{dvx=dx/d*v;dvz=dz/d*v;if(!drag){const want=Math.atan2(-dx,-dz),rr=rem<2&&P.face!=null?P.face:want;P.yaw+=angDiff(rr,P.yaw)*Math.min(1,dt*(rem<2?3.2:2.4));yawT=P.yaw}}}
   const k=Math.min(1,dt*(P.path?6:9));P.vx+=(dvx-P.vx)*k;P.vz+=(dvz-P.vz)*k;
   if(Math.abs(P.vx)+Math.abs(P.vz)>.001){const prev={x:P.x,z:P.z},n={x:P.x+P.vx*dt,z:P.z+P.vz*dt};nav.collide(n,prev);
    if(P.path&&Math.hypot(n.x-prev.x,n.z-prev.z)<Math.hypot(P.vx,P.vz)*dt*.15){P.stuck=(P.stuck||0)+dt;if(P.stuck>.6){P.path=null;P.stuck=0;ring.material.opacity=0;const cb=P.onArrive;P.onArrive=null;cb&&cb(false)}}else P.stuck=0;
    P.x=n.x;P.z=n.z;P.bob+=Math.hypot(P.vx,P.vz)*dt*2.4}
   const kl=RM?1:Math.min(1,dt*10);P.yaw+=(yawT-P.yaw)*kl;P.pitch+=(pitchT-P.pitch)*kl}
  if(A.i>=0){if(A.dir)A.t=Math.max(0,Math.min(1,A.t+A.dir*Math.min(.25,dt)/(RM?.3:A.dur)));
   syncCam(dt);applyEnter(A.t);
   if(A.dir===1&&A.t>=1){A.dir=0;const c=A.cb;A.cb=null;c&&c();setTimeout(()=>{if(V.open>=0)flood.style.opacity=0},500)}
   else if(A.dir===-1&&A.t<=0){A.dir=0;A.slot.open(0);flood.style.opacity=0;A.i=-1;const c=A.cb;A.cb=null;c&&c()}
   else if(!A.dir&&V.open>=0)flood.style.opacity=0}
  else syncCam(dt);
  // rooms
  const cur=curRoom();visible=visibleRooms(cur);const warm=new Set([...visible,...W.rooms[cur].adj]);for(const r of W.rooms){const v=visible.has(r.id);if(r.group.visible!==v)r.group.visible=v;if(warm.has(r.id)&&!r.loaded){r.loaded=true;for(const L of W.lazy)if(L.room===r.id)L.run();withEnv(r.group)}}
  if(cur!==lastRoom){if(lastRoom>=0||intro>=1)showToast(W.rooms[cur]);lastRoom=cur}
  if(toastT>0){toastT-=dt;if(toastT<=0)toast.classList.remove('on')}
  // hover & card
  hover=null;floorHit=null;if(A.i<0&&V.open<0&&!(drag&&drag.moved>5)&&mouse.x<5){const h=pick();hover=h.slot||null;floorHit=h.floor||null}
  cv.classList.toggle('hot',!!hover);
  if(floorHit&&!P.path){ring.position.set(floorHit.x,.012,floorHit.z);ring.material.opacity=.45}else if(!P.path)ring.material.opacity=0;
  let near=null,nd=3.4;if(!hover&&A.i<0){fwd.set(-Math.sin(P.yaw),0,-Math.cos(P.yaw));for(const s of W.slots){if(s.i<0||s.room!==cur)continue;tmp.set(s.center.x-P.x,0,s.center.z-P.z);const d=tmp.length();if(d<nd&&tmp.normalize().dot(fwd)>.8){nd=d;near=s}}}
  const focus=A.i>=0?A.slot:hover||near;showCard(A.i>=0||V.open>=0?null:focus);
  // exhibits
  for(const s of W.slots){if(s.i<0||!visible.has(s.room))continue;const isF=s===focus;s.h+=((isF?1:0)-s.h)*Math.min(1,dt*6);
   const dist=Math.hypot(s.center.x-cam.position.x,s.center.z-cam.position.z);
   if(!RM){s.spec.rotation.y=Math.sin(T*.35+s.i)*.6+s.h*Math.sin(T*1.2)*.3;if(s.xb.tick&&(dist<13||s.h>.05))s.xb.tick(T+s.i,dt,s.h)}
   s.spec.position.y=(s.kind==='jar'?1.76:1.54)+(RM?0:Math.sin(T*1.5+s.i)*.035)+s.h*.04;
   s.xb.mats.forEach(m=>m.emissiveIntensity=(m.userData.b??=m.emissiveIntensity)+s.h*1.0);s.halo.material.opacity=.22+s.h*.5;s.halo.scale.setScalar((s.kind==='jar'?1.9:1.25)+s.h*.6)}
  // spot pool: the nearest lit cases in view get a real light
  if(--spotTick<=0){spotTick=10;const c=W.slots.filter(s=>s.i>=0&&s.kind==='case'&&visible.has(s.room)).map(s=>[s,Math.hypot(s.center.x-P.x,s.center.z-P.z)]).sort((a,b)=>a[1]-b[1]).slice(0,NS);
   spots.forEach((sp,k)=>{const e=c[k];sp.userData.s=e?e[0]:null;if(e){sp.position.copy(e[0].light.pos);sp.target.position.copy(e[0].light.target);sp.target.updateMatrixWorld()}})}
  spots.forEach(sp=>{const s=sp.userData.s;const want=s?85*(1+s.h*.8):0;sp.intensity+=(want-sp.intensity)*Math.min(1,dt*8)});
  if(W.centre){key.intensity=900*(1+W.centre.h*.5)*(visible.has(0)?1:0)}
  // ambience
  W.shaftMats.shaft.uniforms.t.value=RM?0:T;W.dustMat.uniforms.t.value=RM?0:T;if(fin){fin.uniforms.t.value=FIXED?0:T%10}
  if(ring.material.opacity>0)ring.scale.setScalar(1+Math.sin(T*4)*.06);
  drawMap(visible,cur);pumpOg()}
 // og plates load two at a time, rooms in view first
 let ogBusy=0;const ogLoader=new THREE.TextureLoader();
 function pumpOg(){while(ogBusy<2&&W.ogQueue.length){let k=W.ogQueue.findIndex(q=>visible.has(q.room));if(k<0)k=0;const q=W.ogQueue.splice(k,1)[0];ogBusy++;
  ogLoader.load(q.url,t=>{ogBusy--;q.apply(t)},undefined,()=>{ogBusy--})}}
 function render(){if(comp)comp.render();else R.render(S,cam)}

 // ---------- adaptive quality (high tier only): step down resolution, then bloom, when frames run long
 function adapt(rdt){if(!hi||FIXED||intro<1)return;fpsAcc+=rdt;fpsN++;if(fpsAcc<2.5)return;const avg=fpsAcc/fpsN;fpsAcc=0;fpsN=0;
  if(avg>1/42&&quality>0){quality--;if(quality===2){PR=Math.max(1,PR-.35)}else if(quality===1){PR=1}else if(quality===0){bloom.enabled=false}
   R.setPixelRatio(PR);comp.setPixelRatio(PR);comp.setSize(innerWidth,innerHeight);W.dustMat.uniforms.px.value=PR*(innerHeight/900)}}

 // compile every material up front (in parallel where the driver allows) so the first walk through a door does not hitch
 W.rooms.forEach(r=>r.group.visible=true);syncCam(0);try{if(R.extensions.has('KHR_parallel_shader_compile'))await R.compileAsync(S,cam);else R.compile(S,cam)}catch(_){}
 const readyMs=performance.now()-t0;document.getElementById('veil').style.opacity=0;
 const state=()=>({ready:true,tier,quality,pixelRatio:PR,buildMs:Math.round(buildMs),readyMs:Math.round(readyMs),timing:{tex:Math.round(tTex),hall:Math.round(tHall),nav:Math.round(buildMs-tTex-tHall),env:Math.round(tEnv)},x:+P.x.toFixed(3),z:+P.z.toFixed(3),yaw:+P.yaw.toFixed(3),pitch:+P.pitch.toFixed(3),room:curRoom(),
  visible:[...visible],walking:!!P.path,path:P.path?P.path.map(p=>[+p.x.toFixed(2),+p.z.toFixed(2)]):null,hover:hover?hover.i:-1,card:shown,intro,open:A.i,doorT:A.t,
  rooms:W.rooms.map(r=>({id:r.id,name:r.name,kind:r.kind,cx:r.cx,cz:r.cz,adj:r.adj,ex:r.ex.map(e=>e.d.slug)})),slots:W.slots.map(s=>({i:s.i,slug:s.d?s.d.slug:null,room:s.room,q:s.q,x:+s.center.x.toFixed(2),z:+s.center.z.toFixed(2),view:s.view||null})),
  calls:R.info.render.calls,tris:R.info.render.triangles,textures:R.info.memory.textures,geometries:R.info.memory.geometries,frame,T:+T.toFixed(3)});
 const api={state,goTo,walkTo,teleport:(x,z,yaw=P.yaw,pitch=0)=>{P.x=x;P.z=z;P.yaw=yawT=yaw;P.pitch=pitchT=pitch;P.vx=P.vz=0;P.path=null;intro=1},
  look:(yaw,pitch)=>{yawT=yaw;pitchT=pitch;P.yaw=yaw;P.pitch=pitch},key:(k,on)=>on?keys.add(k):keys.delete(k),nav,THREE,R,S,cam,W,A,P};
 window.__archive=api;
 if(V.open>=0)V.enter(V.open,null,true); // a deep link opened the viewer before the hall was ready
 if(FIXED){const stepN=n=>{for(let k=0;k<n;k++){step(1/60);window.__frame=frame;window.__state={t:+T.toFixed(3),frame,room:curRoom(),x:P.x,z:P.z,yaw:P.yaw}}render()};window.step=stepN;stepN(1)}
 else R.setAnimationLoop(()=>{const now=performance.now(),rdt=(now-lastNow)/1000;lastNow=now;
  if(V.open>=0&&A.dir===0&&A.t>=1&&V.el.classList.contains('show'))return; // the viewer covers the hall: give the exhibit the GPU
  const dt=Math.min(.1,rdt);step(dt);render();adapt(rdt)});
 return api}
