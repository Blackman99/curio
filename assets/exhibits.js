// Curio mini-exhibit registry. Every demo in demos.json must set "exhibit" to a key here.
// A builder gets (THREE, color) and returns {obj, mats, tick(T,dt,h)}; obj fits ~0.9u cube centred at origin.
// tick is skipped under prefers-reduced-motion, so the initial pose must read well as a static pose.
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.4,metalness:.4,roughness:.35},o));
export const EXHIBITS={
 // Attention Loom: word-token tiles on a bar, curved red threads between them, a shuttle running along one thread
 loom(T,col){const g=new T.Group(),mats=[],tok=M(T,0xefe4cc,{emissiveIntensity:.15,metalness:.1}),red=M(T,col);mats.push(red);
  const n=5,xs=[];for(let i=0;i<n;i++){const x=-.4+i*.2;xs.push(x);const b=new T.Mesh(new T.BoxGeometry(.15,.09,.04),tok);b.position.set(x,-.3,0);g.add(b)}
  const pairs=[[0,2],[0,4],[1,3],[2,4],[1,4],[3,0]],th=[];
  pairs.forEach(([a,b],k)=>{const h=.18+Math.abs(a-b)*.12;const c=new T.QuadraticBezierCurve3(new T.Vector3(xs[a],-.25,0),new T.Vector3((xs[a]+xs[b])/2,-.25+h*1.6,(k%2?.08:-.08)),new T.Vector3(xs[b],-.25,0));
   const m=new T.Mesh(new T.TubeGeometry(c,24,.008+.006*(k%3),5,false),red);g.add(m);th.push(c)});
  const sh=new T.Mesh(new T.CapsuleGeometry(.03,.09,4,8),M(T,0xc9963f,{metalness:.9,emissiveIntensity:.2}));sh.rotation.z=Math.PI/2;g.add(sh);
  const put=s=>{const c=th[Math.floor(s)%th.length],u=s%1;sh.position.copy(c.getPoint(u))};put(1.5);
  return{obj:g,mats,tick:T=>{put(T*.6)}}},
 // Neural Storm: 3-4-3 MLP node lattice with edges, a small particle swarm swirling through it
 mlp(T,col){const g=new T.Group(),mats=[],nm=M(T,col);mats.push(nm);const L=[3,4,3],P=[];
  L.forEach((n,l)=>{for(let i=0;i<n;i++){const p=new T.Vector3(-.35+l*.35,(i-(n-1)/2)*.2,0);P.push([l,p]);const s=new T.Mesh(new T.SphereGeometry(.04,10,8),nm);s.position.copy(p);g.add(s)}});
  const e=[];P.forEach(([la,a])=>P.forEach(([lb,b])=>{if(lb===la+1)e.push(a.x,a.y,a.z,b.x,b.y,b.z)}));
  const eg=new T.BufferGeometry();eg.setAttribute('position',new T.Float32BufferAttribute(e,3));g.add(new T.LineSegments(eg,new T.LineBasicMaterial({color:col,transparent:true,opacity:.45})));
  const N=220,pa=new Float32Array(N*3),seed=[];for(let i=0;i<N;i++)seed.push([Math.random()*6.28,.15+Math.random()*.3,(Math.random()-.5)*.6]);
  const pg=new T.BufferGeometry();pg.setAttribute('position',new T.BufferAttribute(pa,3));
  const upd=t=>{for(let i=0;i<N;i++){const[a,r,y]=seed[i],k=a+t*(.6+r);pa[i*3]=Math.cos(k)*r*1.3;pa[i*3+1]=y+Math.sin(k*2+y*5)*.06;pa[i*3+2]=Math.sin(k)*r*.8}pg.attributes.position.needsUpdate=true};upd(0);
  g.add(new T.Points(pg,new T.PointsMaterial({color:0xbff6ff,size:.018,transparent:true,opacity:.9})));return{obj:g,mats,tick:t=>upd(t)}},
 // Diffusion Bloom: points that cycle from gaussian noise into a flower curve and back
 bloom(T,col){const g=new T.Group(),N=400,a=new Float32Array(N*3),noise=[],form=[];
  for(let i=0;i<N;i++){noise.push([(Math.random()-.5)*.9,(Math.random()-.5)*.9,(Math.random()-.5)*.9]);const th=i/N*Math.PI*2*3,r=.38*Math.abs(Math.cos(2.5*th/3*2))+.05,h=(i%7)/7*.06;form.push([Math.cos(th)*r,Math.sin(th)*r,h-.03])}
  const pg=new T.BufferGeometry();pg.setAttribute('position',new T.BufferAttribute(a,3));
  const set=s=>{s=s*s*(3-2*s);for(let i=0;i<N;i++)for(let k=0;k<3;k++)a[i*3+k]=noise[i][k]*(1-s)+form[i][k]*s;pg.attributes.position.needsUpdate=true};set(.85);
  g.add(new T.Points(pg,new T.PointsMaterial({color:col,size:.022})));
  const core=new T.Mesh(new T.SphereGeometry(.05,12,8),M(T,0xffe08a));g.add(core);
  return{obj:g,mats:[core.material],tick:t=>set(Math.min(1,Math.max(0,Math.sin(t*.8)*.8+.5)))}},
 // Latent Quicksilver: chrome blob whose vertices are displaced by a few random Fourier features
 quicksilver(T,col){const geo=new T.IcosahedronGeometry(.32,4),base=geo.attributes.position.array.slice(),F=[];for(let i=0;i<5;i++)F.push([Math.random()*6-3,Math.random()*6-3,Math.random()*6-3,Math.random()*6]);
  const m=M(T,col,{metalness:1,roughness:.08,emissiveIntensity:.15}),me=new T.Mesh(geo,m);const p=geo.attributes.position.array;
  const upd=t=>{for(let i=0;i<p.length;i+=3){const x=base[i],y=base[i+1],z=base[i+2];let f=0;for(const[a,b,c,ph]of F)f+=Math.sin(a*x+b*y+c*z+ph+t);const s=1+f*.07;p[i]=x*s;p[i+1]=y*s;p[i+2]=z*s}geo.attributes.position.needsUpdate=true;geo.computeVertexNormals()};upd(0);
  return{obj:me,mats:[m],tick:t=>upd(t*1.2)}},
 // Phase Choir: 6x6 grid of oscillator pins; phases relax toward sync as a travelling wave
 choir(T,col){const g=new T.Group(),n=6,c=new T.Color(col),inst=new T.InstancedMesh(new T.BoxGeometry(.07,.07,.07),M(T,0xffffff,{emissiveIntensity:.5}),n*n),d=new T.Object3D(),ph=[];
  for(let i=0;i<n*n;i++)ph.push(Math.random()*6.28);
  const upd=t=>{for(let i=0;i<n;i++)for(let j=0;j<n;j++){const k=i*n+j,syn=.5+.5*Math.sin(t*.3),p=ph[k]*(1-syn)+(i+j)*.5*syn+t*2;
   d.position.set((i-2.5)*.14,Math.sin(p)*.12,(j-2.5)*.14);d.scale.setScalar(.7+.4*(Math.sin(p)*.5+.5));d.updateMatrix();inst.setMatrixAt(k,d.matrix);inst.setColorAt(k,c.clone().offsetHSL(Math.sin(p)*.08,0,Math.sin(p)*.15))}
   inst.instanceMatrix.needsUpdate=true;inst.instanceColor.needsUpdate=true};upd(2);g.add(inst);g.rotation.x=.5;
  return{obj:g,mats:[inst.material],tick:t=>upd(t)}},
 // Snowflake Net: a paper sheet folding in half along a crease, with a red cut line, then unfolding
 fold(T,col){const g=new T.Group(),pm=M(T,col,{emissiveIntensity:.15,metalness:0,roughness:.9,side:T.DoubleSide});
  const a=new T.Mesh(new T.PlaneGeometry(.35,.6),pm);a.position.x=-.175;g.add(a);
  const hinge=new T.Group();const b=new T.Mesh(new T.PlaneGeometry(.35,.6),pm);b.position.x=.175;hinge.add(b);g.add(hinge);
  const cut=new T.Mesh(new T.BoxGeometry(.012,.5,.012),M(T,0xc8321e,{emissiveIntensity:.8}));cut.position.set(-.14,0,.01);cut.rotation.z=.5;g.add(cut);
  const hole=new T.Mesh(new T.CircleGeometry(.07,6),new T.MeshBasicMaterial({color:0x1d1a16,side:T.DoubleSide}));hole.position.set(.17,.1,.002);hinge.add(hole);
  const h2=hole.clone();h2.position.set(-.17,.1,.002);g.add(h2);
  const upd=t=>{hinge.rotation.y=-(Math.sin(t*.9)*.5+.5)*Math.PI*.92};upd(0);g.rotation.y=.4;
  return{obj:g,mats:[pm],tick:t=>upd(t)}},
 // Token Departures: mini split-flap board, rows flip through letters, top row lit as chosen token
 flap(T,col){const g=new T.Group(),W=['THE','CAT','SAT','RAN','SKY'],L='ABCDEFGHIJKLMNOPQRSTUVWXYZ',cv=document.createElement('canvas');cv.width=256;cv.height=192;const x=cv.getContext('2d'),tx=new T.CanvasTexture(cv);tx.colorSpace=T.SRGBColorSpace;
  const draw=t=>{x.fillStyle='#14110d';x.fillRect(0,0,256,192);x.font='bold 26px Courier New,monospace';x.textBaseline='middle';
   for(let r=0;r<4;r++){const w=W[(r+Math.floor(t/2.4))%W.length],pct=[46,23,12,7][r],Y=26+r*44;for(let c=0;c<3;c++){const X=14+c*34;x.fillStyle='#262019';x.fillRect(X,Y-18,30,36);const settle=(t%2.4)>(.3+c*.15+r*.1);x.fillStyle=r===0?'#f5c518':'#efe4cc';x.fillText(settle?w[c]:L[Math.floor(t*20+c*7+r*3)%26],X+6,Y+1);x.fillStyle='#000';x.fillRect(X,Y,30,1.5)}
    x.fillStyle=r===0?'#f5c518':'#b9ab8f';x.fillText(pct+'%',140,Y+1);x.fillStyle='#f5c518';x.fillRect(205,Y-6,pct*.9,12)}tx.needsUpdate=true};draw(2.2);
  const bm=new T.MeshStandardMaterial({map:tx,emissive:0xffffff,emissiveMap:tx,emissiveIntensity:.5,roughness:.6}),fr=M(T,col,{metalness:.8,emissiveIntensity:.1});
  const board=new T.Mesh(new T.PlaneGeometry(.8,.6),bm);board.position.z=.031;g.add(board);const box=new T.Mesh(new T.BoxGeometry(.86,.66,.06),fr);g.add(box);
  let last=-1;return{obj:g,mats:[bm],static:true,tick:t=>{const q=Math.floor(t*12);if(q!==last){last=q;draw(t)}}}},
 // Expert Post: tiny pneumatic tubes from a gate to 4 desks, capsules flowing along
 tubes(T,col){const g=new T.Group(),mats=[],br=M(T,col,{metalness:.85,roughness:.3,emissiveIntensity:.2}),dk=M(T,0x2a1a0e,{metalness:.4,emissiveIntensity:.1});mats.push(br,dk);
  const gate=new T.Mesh(new T.TorusGeometry(.08,.018,8,16),br);gate.rotation.y=Math.PI/2;g.add(gate);
  const hub=new T.Mesh(new T.SphereGeometry(.045,10,8),M(T,0x1a1208,{metalness:.6}));g.add(hub);
  const desks=[],caps=[];
  for(let i=0;i<4;i++){const a=(-.55+i*.37),x=.42,y=Math.sin(a)* .35,z=Math.cos(a)*.1;
   const curve=new T.QuadraticBezierCurve3(new T.Vector3(.08,0,0),new T.Vector3(.22,y*.6,.08*(i%2?1:-1)),new T.Vector3(x,y,z));
   const tube=new T.Mesh(new T.TubeGeometry(curve,16,.012,5,false),br);g.add(tube);
   const desk=new T.Mesh(new T.BoxGeometry(.1,.07,.06),dk);desk.position.set(x+.06,y,z);g.add(desk);
   const tag=new T.Mesh(new T.BoxGeometry(.08,.02,.01),M(T,[0xc45c4a,0x3a8a9a,0xc9a24a,0x4a8a5a][i],{emissiveIntensity:.5}));tag.position.set(x+.06,y+.045,z+.03);g.add(tag);
   desks.push(curve);
   const cap=new T.Mesh(new T.CapsuleGeometry(.016,.03,3,6),M(T,0xe8d4a0,{metalness:.7,emissiveIntensity:.15}));cap.rotation.z=Math.PI/2;g.add(cap);caps.push({mesh:cap,curve,off:i*.22});
  }
  // dead-letter chute
  const dead=new T.QuadraticBezierCurve3(new T.Vector3(.06,-.05,0),new T.Vector3(.15,-.28,0),new T.Vector3(.2,-.38,0));
  g.add(new T.Mesh(new T.TubeGeometry(dead,10,.01,5,false),M(T,0x6b1e1a,{metalness:.5,emissiveIntensity:.3})));
  const dcap=new T.Mesh(new T.CapsuleGeometry(.014,.025,3,6),M(T,0xc04030,{emissiveIntensity:.4}));dcap.rotation.z=Math.PI/2;g.add(dcap);
  const upd=t=>{for(const c of caps){const u=(t*.35+c.off)%1;c.mesh.position.copy(c.curve.getPoint(u));const tan=c.curve.getTangent(u);c.mesh.quaternion.setFromUnitVectors(new T.Vector3(1,0,0),tan.normalize())}
   const u=(t*.25+.5)%1;dcap.position.copy(dead.getPoint(u))};upd(.4);g.rotation.y=-.3;g.rotation.x=.25;
  return{obj:g,mats,tick:t=>upd(t)}},

};
