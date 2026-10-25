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

 // Byte Pair Forge: mini anvil + glowing billet + hammer arc
 forge(T,col){const g=new T.Group(),mats=[],iron=M(T,0x2a2420,{metalness:.85,roughness:.4,emissiveIntensity:.08}),hot=M(T,col,{metalness:.3,roughness:.35,emissiveIntensity:.7});mats.push(iron,hot);
  // anvil body
  const base=new T.Mesh(new T.BoxGeometry(.42,.08,.22),iron);base.position.y=-.28;g.add(base);
  const horn=new T.Mesh(new T.BoxGeometry(.18,.06,.1),iron);horn.position.set(-.22,-.22,0);g.add(horn);
  const top=new T.Mesh(new T.BoxGeometry(.36,.05,.16),iron);top.position.y=-.2;g.add(top);
  // glowing billet on anvil
  const billet=new T.Mesh(new T.BoxGeometry(.22,.05,.08),hot);billet.position.y=-.15;g.add(billet);
  // hammer group pivoting above
  const hm=new T.Group();hm.position.set(.12,.05,0);
  const handle=new T.Mesh(new T.CylinderGeometry(.012,.014,.28,6),M(T,0x5a3828,{metalness:.2,emissiveIntensity:.05}));handle.position.y=.1;hm.add(handle);
  const head=new T.Mesh(new T.BoxGeometry(.12,.06,.06),M(T,0x8a8480,{metalness:.9,roughness:.25,emissiveIntensity:.1}));head.position.set(0,-.05,0);hm.add(head);
  g.add(hm);
  // small spark dots
  const N=30,pa=new Float32Array(N*3),seed=[];for(let i=0;i<N;i++)seed.push([Math.random()*6.28,.05+Math.random()*.15,Math.random()]);
  const pg=new T.BufferGeometry();pg.setAttribute('position',new T.BufferAttribute(pa,3));
  const upd=(t)=>{hm.rotation.z=-.6+Math.sin(t*2.2)*.55;const hit=Math.sin(t*2.2);billet.material.emissiveIntensity=.45+Math.max(0,hit)*.5;
   for(let i=0;i<N;i++){const[a,r,ph]=seed[i],u=(t*1.5+ph)%1,k=a;pa[i*3]=Math.cos(k)*r*u*2;pa[i*3+1]=.05+u*.35;pa[i*3+2]=Math.sin(k)*r*u*1.2}pg.attributes.position.needsUpdate=true};
  upd(.8);g.add(new T.Points(pg,new T.PointsMaterial({color:col,size:.02,transparent:true,opacity:.85})));
  g.rotation.y=-.25;g.rotation.x=.2;
  return{obj:g,mats,tick:t=>upd(t)}},



 // RoPE Carousel: striped platform, canopy, bobbing horses on brass poles
 carousel(T,col){const g=new T.Group(),mats=[],br=M(T,0xc9a24a,{metalness:.9,roughness:.28,emissiveIntensity:.25}),cr=M(T,col,{metalness:.35,roughness:.45,emissiveIntensity:.45}),cr2=M(T,0xf4e8d0,{metalness:.2,roughness:.55,emissiveIntensity:.2});mats.push(br,cr,cr2);
  // striped disc platform
  const N=16,disc=new T.Group();
  for(let i=0;i<N;i++){const shape=new T.Shape();shape.moveTo(0,0);shape.absarc(0,0,.38,i/N*Math.PI*2,(i+1)/N*Math.PI*2,false);shape.lineTo(0,0);
   const geo=new T.ExtrudeGeometry(shape,{depth:.03,bevelEnabled:false});const m=new T.Mesh(geo,i%2?cr:cr2);m.rotation.x=-Math.PI/2;disc.add(m)}
  g.add(disc);
  const rim=new T.Mesh(new T.TorusGeometry(.39,.012,6,32),br);rim.rotation.x=Math.PI/2;rim.position.y=.02;g.add(rim);
  // spindle + canopy
  const spin=new T.Mesh(new T.CylinderGeometry(.018,.022,.42,8),br);spin.position.y=.24;g.add(spin);
  const canopy=new T.Mesh(new T.ConeGeometry(.42,.16,12,1,true),cr);canopy.position.y=.48;g.add(canopy);
  const fin=new T.Mesh(new T.SphereGeometry(.035,8,6),br);fin.position.y=.56;g.add(fin);
  // horses on poles
  const horses=[];
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2,R=.28;
   const pole=new T.Mesh(new T.CylinderGeometry(.006,.006,.28,5),br);pole.position.set(Math.cos(a)*R,.16,Math.sin(a)*R);g.add(pole);
   const body=new T.Mesh(new T.BoxGeometry(.07,.045,.03),i%2?cr:cr2);body.position.set(Math.cos(a)*R,.22,Math.sin(a)*R);g.add(body);
   const head=new T.Mesh(new T.BoxGeometry(.03,.025,.022),i%2?cr:cr2);head.position.set(Math.cos(a)*R+.03,.24,Math.sin(a)*R);g.add(head);
   horses.push({body,head,pole,a,R,ph:i*1.1});
  }
  // floor ring
  const floor=new T.Mesh(new T.CylinderGeometry(.45,.45,.02,24),M(T,0x2a1c14,{metalness:.2,roughness:.9,emissiveIntensity:.05}));floor.position.y=-.01;g.add(floor);
  const upd=t=>{disc.rotation.y=t*.35;spin.rotation.y=t*.35;canopy.rotation.y=t*.35;fin.rotation.y=t*.5;
   for(const h of horses){const bob=Math.sin(t*2.2+h.ph)*.04;const ang=h.a+t*.35;h.pole.position.set(Math.cos(ang)*h.R,.16+bob*.2,Math.sin(ang)*h.R);h.body.position.set(Math.cos(ang)*h.R,.22+bob,Math.sin(ang)*h.R);h.head.position.set(Math.cos(ang)*h.R+.03,.24+bob,Math.sin(ang)*h.R)}};
  upd(.6);g.rotation.x=.35;g.rotation.y=-.25;
  return{obj:g,mats,tick:t=>upd(t)}},



 // Injection Heist: stacked file cards + red infected line + lock/countdown ring
 heist(T,col){const g=new T.Group(),mats=[],neon=M(T,col,{metalness:.35,roughness:.4,emissiveIntensity:.65}),dark=M(T,0x0a120e,{metalness:.2,roughness:.85,emissiveIntensity:.08}),red=M(T,0xff2a4a,{metalness:.3,roughness:.4,emissiveIntensity:.9}),amber=M(T,0xffb000,{metalness:.4,roughness:.35,emissiveIntensity:.7});mats.push(neon,dark,red,amber);
  // stacked file cards
  const cards=[];
  for(let i=0;i<4;i++){const c=new T.Mesh(new T.BoxGeometry(.55,.08,.38),i===2?dark:M(T,0x122018,{metalness:.25,roughness:.7,emissive:col,emissiveIntensity:.12}));
   c.position.set(-.08+i*.03,.22-i*.11,.02*i);c.rotation.x=-.35;c.rotation.z=(i-1.5)*.04;g.add(c);cards.push(c);
   // filename bar
   const bar=new T.Mesh(new T.BoxGeometry(.42,.012,.01),neon);bar.position.set(0,.02,.2);c.add(bar)}
  // infected line on third card (index 2)
  const infect=new T.Mesh(new T.BoxGeometry(.48,.016,.012),red);infect.position.set(0,-.01,.2);cards[2].add(infect);
  // lock / countdown ring in front
  const ring=new T.Mesh(new T.TorusGeometry(.16,.014,8,24),amber);ring.position.set(.32,-.18,.28);ring.rotation.x=.5;g.add(ring);
  const dial=new T.Mesh(new T.CircleGeometry(.12,16),M(T,0x050806,{metalness:.1,emissive:0xffb000,emissiveIntensity:.25}));dial.position.copy(ring.position);dial.position.z-=.01;dial.rotation.x=ring.rotation.x;g.add(dial);
  const hand=new T.Mesh(new T.BoxGeometry(.01,.1,.01),amber);hand.position.set(0,.03,0);dial.add(hand);
  // tiny lock body
  const lock=new T.Mesh(new T.BoxGeometry(.07,.08,.04),neon);lock.position.set(-.34,-.22,.22);g.add(lock);
  const shackle=new T.Mesh(new T.TorusGeometry(.035,.008,6,12,Math.PI),neon);shackle.position.set(-.34,-.14,.22);shackle.rotation.z=Math.PI;g.add(shackle);
  const upd=t=>{infect.material.emissiveIntensity=.55+.45*(.5+.5*Math.sin(t*5));
   ring.rotation.z=t*.8;hand.rotation.z=-t*1.6;
   cards[2].position.y=.22-2*.11+.01*Math.sin(t*3);
   lock.material.emissiveIntensity=.4+.3*(.5+.5*Math.sin(t*2))};
  upd(.8);g.rotation.y=-.35;g.rotation.x=.2;
  return{obj:g,mats,tick:t=>upd(t)}},



 // Loss Chord: glowing waveform/speaker + bead descending a loss curve
 chord(T,col){const g=new T.Group(),mats=[],teal=M(T,col,{metalness:.35,roughness:.4,emissiveIntensity:.7}),mag=M(T,0xe846b4,{metalness:.3,roughness:.4,emissiveIntensity:.85}),dark=M(T,0x0a0e22,{metalness:.2,roughness:.8,emissiveIntensity:.1});mats.push(teal,mag,dark);
  // speaker cone / body
  const body=new T.Mesh(new T.CylinderGeometry(.16,.2,.1,20),dark);body.rotation.x=Math.PI/2;body.position.set(-.28,0,0);g.add(body);
  const cone=new T.Mesh(new T.ConeGeometry(.18,.12,16,1,true),teal);cone.rotation.z=-Math.PI/2;cone.position.set(-.18,0,0);g.add(cone);
  const rim=new T.Mesh(new T.TorusGeometry(.18,.012,8,24),mag);rim.rotation.y=Math.PI/2;rim.position.set(-.12,0,0);g.add(rim);
  // glowing waveform rings in front of speaker
  const waves=[];
  for(let i=0;i<3;i++){const w=new T.Mesh(new T.TorusGeometry(.1+i*.06,.006,6,24),i%2?mag:teal);w.rotation.y=Math.PI/2;w.position.set(-.05+i*.04,0,0);g.add(w);waves.push(w)}
  // loss curve (bezier valley)
  const curve=new T.CubicBezierCurve3(new T.Vector3(-.05,.28,0),new T.Vector3(.12,.32,.04),new T.Vector3(.22,-.05,-.02),new T.Vector3(.42,-.22,0));
  const tube=new T.Mesh(new T.TubeGeometry(curve,28,.01,6,false),teal);g.add(tube);
  // valley floor shadow ribbon
  const floor=new T.Mesh(new T.TubeGeometry(curve,20,.004,4,false),dark);floor.position.y=-.02;g.add(floor);
  // bead on curve
  const bead=new T.Mesh(new T.SphereGeometry(.045,12,10),mag);g.add(bead);
  // tiny star at minimum
  const star=new T.Mesh(new T.OctahedronGeometry(.03,0),teal);star.position.copy(curve.getPoint(1));star.position.y-=.02;g.add(star);
  const upd=t=>{const u=(.15+.7*(.5+.5*Math.sin(t*.7)));bead.position.copy(curve.getPoint(u));
   const tan=curve.getTangent(u);bead.scale.setScalar(.85+.25*(.5+.5*Math.sin(t*3)));
   for(let i=0;i<waves.length;i++){const s=1+.08*Math.sin(t*3.5+i*1.2);waves[i].scale.set(1,s,s);waves[i].material.emissiveIntensity=.45+.4*(.5+.5*Math.sin(t*4+i))}};
  upd(.9);g.rotation.y=-.3;g.rotation.x=.2;
  return{obj:g,mats,tick:t=>upd(t)}},


 // Podium Machine: a 3-step results podium; three toy contestants hop and swap places, the red crown rides whoever is No.1
 podium(T,col){const g=new T.Group(),mats=[],paper=M(T,0xf1f0eb,{metalness:.05,roughness:.85,emissiveIntensity:.12}),red=M(T,col,{metalness:.2,roughness:.5,emissiveIntensity:.5}),ink=M(T,0x161616,{metalness:.3,roughness:.6,emissiveIntensity:.05});mats.push(paper,red,ink);
  const SX=[0,-.27,.27],SH=[.3,.2,.13];// slot 0 = No.1 (centre), 1 = No.2 (left), 2 = No.3 (right)
  SX.forEach((x,i)=>{const b=new T.Mesh(new T.BoxGeometry(.25,SH[i],.24),i?paper:red);b.position.set(x,-.38+SH[i]/2,0);g.add(b);
   const n=new T.Mesh(new T.BoxGeometry(.06,.06,.01),i?ink:paper);n.position.set(x,-.38+SH[i]*.62,.125);n.scale.y=i===0?1.4:1;g.add(n)});
  const base=new T.Mesh(new T.BoxGeometry(.86,.03,.32),ink);base.position.y=-.395;g.add(base);
  const figs=[0,1,2].map(i=>{const f=new T.Group(),bd=new T.Mesh(new T.BoxGeometry(.09,.13,.09),i===2?paper:ink);bd.position.y=.065;f.add(bd);
   const hd=new T.Mesh(new T.BoxGeometry(.065,.065,.065),i===2?paper:ink);hd.position.y=.17;f.add(hd);g.add(f);return f});
  const crown=new T.Group(),cb=new T.Mesh(new T.CylinderGeometry(.05,.045,.035,5,1,true),red);crown.add(cb);
  for(let k=0;k<5;k++){const sp=new T.Mesh(new T.ConeGeometry(.014,.045,4),red);const a=k/5*Math.PI*2;sp.position.set(Math.cos(a)*.045,.035,Math.sin(a)*.045);crown.add(sp)}g.add(crown);
  const P=[[0,1,2],[2,0,1],[1,2,0],[0,2,1],[2,1,0],[1,0,2]];// P[k][fig] = slot
  const top=s=>-.38+SH[s],sm=u=>u*u*(3-2*u);
  const upd=t=>{const per=1.5,p=t/per,k=Math.floor(p),u=p-k,a=P[((k%6)+6)%6],b=P[(((k+1)%6)+6)%6],w=sm(Math.max(0,(u-.55)/.45));
   let lead=null;figs.forEach((f,i)=>{const x=SX[a[i]]+(SX[b[i]]-SX[a[i]])*w,y=top(a[i])+(top(b[i])-top(a[i]))*w+Math.sin(Math.PI*w)*.22;f.position.set(x,y,0);f.rotation.y=w*Math.PI*2*(a[i]!==b[i]?1:0);
    if((w<.5?a[i]:b[i])===0)lead=f});
   crown.position.set(lead.position.x,lead.position.y+.235+Math.sin(Math.PI*w)*.06,0);crown.rotation.y=t*1.2};
  upd(.3);g.rotation.y=-.38;g.rotation.x=.22;
  return{obj:g,mats,tick:t=>upd(t)}},
 // Lumen Landing: a dark browser pane; prism-coloured particles morph through the page's four engine stages: Lumen glyph, sphere, (2,3) knot, galaxy
 lumen(T,col){const g=new T.Group(),mats=[],pane=M(T,0x0b0b10,{metalness:.3,roughness:.4,emissiveIntensity:.2,transparent:true}),bar=M(T,col,{metalness:.3,roughness:.5,emissiveIntensity:.45,transparent:true});mats.push(pane,bar);
  const sc=new T.Mesh(new T.BoxGeometry(.86,.62,.02),pane);sc.position.z=-.32;sc.renderOrder=1;g.add(sc);// pane and bar draw over the case halo so the screen stays dark
  const tb=new T.Mesh(new T.BoxGeometry(.86,.045,.026),bar);tb.position.set(0,.288,-.31);tb.renderOrder=1;g.add(tb);
  [0xff5f57,0xfebc2e,0x28c840].forEach((c,i)=>{const d=new T.Mesh(new T.SphereGeometry(.011,8,6),M(T,c,{emissiveIntensity:.7}));d.position.set(-.39+i*.032,.288,-.295);g.add(d)});
  const N=700,S=[[],[],[],[]],D=[],rn=(i,k)=>{const x=Math.sin(i*127.1+k*311.7)*43758.5453;return x-Math.floor(x)},ga=Math.PI*(3-Math.sqrt(5)),ca=Math.cos(1),sa=Math.sin(1);
  const pa=new Float32Array(N*3),ci=new Float32Array(N*3),C=[0x7c9cff,0xff7ad9,0x7dffcf].map(h=>new T.Color(h)),c=new T.Color();
  for(let i=0;i<N;i++){let a=rn(i,1),b=rn(i,2);if(a+b>1){a=1-a;b=1-b}const gx=-.28+.56*a+.28*b,gy=-.22+.52*b;S[0].push([gx,gy,(rn(i,3)-.5)*.04]);// glyph: the Lumen triangle, filled
   const y=1-2*(i+.5)/N,r=Math.sqrt(1-y*y);S[1].push([Math.cos(ga*i)*r*.27,y*.27,Math.sin(ga*i)*r*.27]);// sphere
   const u=i/N*Math.PI*2,q=.19+.075*Math.cos(3*u);S[2].push([q*Math.cos(2*u)+(rn(i,4)-.5)*.03,q*Math.sin(2*u)+(rn(i,5)-.5)*.03,.075*Math.sin(3*u)+(rn(i,6)-.5)*.03]);// (2,3) torus knot
   const v=rn(i,8),rr=.03+.31*v,an=(i%3)*Math.PI*2/3+rr*9+(rn(i,9)-.5)*.5,yy=(rn(i,10)-.5)*.03*(1-v),zz=Math.sin(an)*rr;S[3].push([Math.cos(an)*rr,yy*ca-zz*sa,yy*sa+zz*ca]);// three-arm galaxy, tilted toward the viewer
   const f=Math.min(1,Math.max(0,((gx+.28)/.56+(.3-gy)/.52)/2));c.copy(f<.5?C[0]:C[1]).lerp(f<.5?C[1]:C[2],f<.5?f*2:f*2-1);ci.set([c.r,c.g,c.b],i*3);D.push(rn(i,7)*.3)}
  const pg=new T.BufferGeometry();pg.setAttribute('position',new T.BufferAttribute(pa,3));pg.setAttribute('color',new T.BufferAttribute(ci,3));
  const pts=new T.Points(pg,new T.PointsMaterial({size:.019,vertexColors:true,transparent:true,depthWrite:false}));pts.renderOrder=2;g.add(pts);
  const sm=x=>x*x*(3-2*x),upd=t=>{const p=t/2.4,k=Math.floor(p),u=p-k,A=S[((k%4)+4)%4],B=S[(((k+1)%4)+4)%4];
   for(let i=0;i<N;i++){const w=sm(Math.min(1,Math.max(0,(u-.4-D[i])/.3))),j=Math.sin(Math.PI*w)*.05;
    pa[i*3]=A[i][0]+(B[i][0]-A[i][0])*w+j*Math.sin(i*1.7+t*2.1);pa[i*3+1]=A[i][1]+(B[i][1]-A[i][1])*w+j*Math.cos(i*2.3+t*1.7);pa[i*3+2]=A[i][2]+(B[i][2]-A[i][2])*w+j*Math.sin(i*3.1+t*1.3)}
   pg.attributes.position.needsUpdate=true};
  upd(.3);
  return{obj:g,mats,tick:t=>upd(t)}},
 // Superposition Orrery: a tilted brass orrery whose five arms sit as a pentagon — five features in two dimensions
 orrery(T,col){const g=new T.Group(),mats=[],br=M(T,0xc9a24a,{metalness:.9,roughness:.3,emissiveIntensity:.15}),ed=M(T,col,{emissiveIntensity:.8,metalness:.2});mats.push(ed);
  const plane=new T.Group();plane.rotation.x=.95;plane.position.y=.06;g.add(plane);const spin=new T.Group();plane.add(spin);
  const ring=new T.Mesh(new T.TorusGeometry(.36,.009,8,72),br);ring.rotation.x=Math.PI/2;spin.add(ring);
  const sun=new T.Mesh(new T.SphereGeometry(.035,16,10),M(T,0xffb35a,{emissiveIntensity:1.2,metalness:.1}));spin.add(sun);
  const C=[0xffd27a,0xff6f7d,0xa98bff,0x4fd2ff,0x4fe0b5],P=[],up=new T.Vector3(0,1,0),rod=(a,b,r,m)=>{const d=new T.Vector3().subVectors(b,a),o=new T.Mesh(new T.CylinderGeometry(r,r,d.length(),6),m);o.position.copy(a).addScaledVector(d,.5);o.quaternion.setFromUnitVectors(up,d.normalize());return o};
  const pm=[];for(let k=0;k<5;k++){const a=k/5*Math.PI*2-Math.PI/2,p=new T.Vector3(Math.cos(a)*.4,0,Math.sin(a)*.4);P.push(p);spin.add(rod(new T.Vector3(),p,.006,br));
   const m=M(T,C[k],{emissiveIntensity:.7,metalness:.2});pm.push(m);const s=new T.Mesh(new T.SphereGeometry(.042,16,12),m);s.position.copy(p);spin.add(s)}
  for(let k=0;k<5;k++)spin.add(rod(P[k],P[(k+1)%5],.005,ed));
  g.add(rod(new T.Vector3(0,.04,0),new T.Vector3(0,-.4,0),.012,br));const base=new T.Mesh(new T.CylinderGeometry(.16,.19,.04,32),M(T,0x1a1d2e,{emissiveIntensity:0,metalness:.6,roughness:.3}));base.position.y=-.42;g.add(base);
  return{obj:g,mats,tick:t=>{spin.rotation.y=t*.35;pm.forEach((m,k)=>{m.emissiveIntensity=.55+.35*Math.sin(t*2+k*1.3)})}}},


 // Compaction Shredder: graphite machine body, twin spinning blades, paper strip feeding in, KEEP strip ejecting
 shredder(T,col){const g=new T.Group(),mats=[],iron=M(T,0x2a2e38,{metalness:.75,roughness:.4,emissiveIntensity:.08}),warn=M(T,col,{metalness:.25,roughness:.45,emissiveIntensity:.55}),paper=M(T,0xf7f4ea,{metalness:0,roughness:.9,emissiveIntensity:.12});mats.push(iron,warn,paper);
  const body=new T.Mesh(new T.BoxGeometry(.72,.42,.36),iron);body.position.y=-.06;g.add(body);
  const band=new T.Mesh(new T.BoxGeometry(.725,.05,.365),warn);band.position.y=.12;g.add(band);
  const slot=new T.Mesh(new T.BoxGeometry(.42,.04,.1),M(T,0x0e1014,{metalness:.5,emissiveIntensity:.05}));slot.position.set(0,.18,.12);g.add(slot);
  // twin blades
  const mkBlade=()=>{const b=new T.Group();
   for(let i=0;i<4;i++){const tth=new T.Mesh(new T.BoxGeometry(.22,.03,.02),M(T,0xc8ced8,{metalness:.9,roughness:.25,emissiveIntensity:.1}));tth.rotation.z=i*Math.PI/4;b.add(tth)}
   const hub=new T.Mesh(new T.CylinderGeometry(.035,.035,.025,10),warn);hub.rotation.x=Math.PI/2;b.add(hub);return b};
  const bL=mkBlade(),bR=mkBlade();bL.position.set(-.16,.02,.2);bR.position.set(.16,.02,.2);g.add(bL,bR);
  // paper strip descending into slot
  const strip=new T.Mesh(new T.BoxGeometry(.28,.34,.008),paper);strip.position.set(0,.36,.14);g.add(strip);
  // KEEP eject strip
  const keep=new T.Mesh(new T.BoxGeometry(.16,.03,.01),M(T,0xff8c42,{emissiveIntensity:.5}));keep.position.set(.4,-.02,.1);g.add(keep);
  const tray=new T.Mesh(new T.BoxGeometry(.18,.12,.08),iron);tray.position.set(.48,-.12,.05);g.add(tray);
  const lip=new T.Mesh(new T.BoxGeometry(.185,.015,.085),warn);lip.position.set(.48,-.05,.05);g.add(lip);
  const upd=t=>{bL.rotation.z=t*4;bR.rotation.z=-t*4.2;strip.position.y=.42-Math.abs(Math.sin(t*1.6))*.22;strip.scale.y=.85+.15*Math.cos(t*1.6);
   keep.position.set(.28+Math.abs(Math.sin(t*1.3))*.22,-.02+.08*Math.sin(t*1.3),.12);keep.rotation.z=Math.sin(t*1.3)*.4};
  upd(.7);g.rotation.y=-.35;g.rotation.x=.28;
  return{obj:g,mats,tick:t=>upd(t)}},
 // Green-List Ink: a letter on a stand; a violet UV loupe drifts across it and only the green-list words glow inside its circle
 greenink(T,col){const g=new T.Group(),mats=[],sh=new T.Group();sh.rotation.x=-.3;sh.position.y=.05;g.add(sh);
  sh.add(new T.Mesh(new T.BoxGeometry(.58,.76,.006),M(T,0xf3ebd8,{emissive:0x5a4a2a,emissiveIntensity:.3,metalness:0,roughness:.85})));
  const W=[],rn=k=>{const x=Math.sin(k*91.7+3.1)*43758.5453;return x-Math.floor(x)};let k=0;
  for(let r=0;r<10;r++){let x=r===9?.05:r%3===1?-.21:-.24;const y=.29-r*.066,end=r===0?-.02:.24;
   while(true){const w=.035+rn(k++)*.075;if(x+w>end)break;W.push([x+w/2,y,w,rn(k++)<.45]);x+=w+.022}}
  const bars=new T.InstancedMesh(new T.BoxGeometry(1,.017,.004),new T.MeshBasicMaterial({color:0xffffff,toneMapped:false}),W.length),m4=new T.Matrix4();
  W.forEach(([x,y,w],i)=>{m4.makeScale(w,1,1);m4.setPosition(x,y,.005);bars.setMatrixAt(i,m4);bars.setColorAt(i,new T.Color(0x2b3150))});sh.add(bars);
  const lamp=new T.Group();sh.add(lamp);
  const disc=new T.Mesh(new T.CircleGeometry(.135,40),new T.MeshBasicMaterial({color:0x5a2dff,transparent:true,opacity:.75,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false}));disc.position.z=.0045;lamp.add(disc);
  const metal=M(T,0x8d93a3,{metalness:.9,roughness:.3,emissiveIntensity:.05}),led=M(T,col,{emissiveIntensity:1.2,metalness:.1});mats.push(led);
  const ring=new T.Mesh(new T.TorusGeometry(.142,.016,10,48),metal);ring.position.z=.05;lamp.add(ring);
  for(let j=0;j<10;j++){const a=j/10*Math.PI*2,s=new T.Mesh(new T.SphereGeometry(.009,8,6),led);s.position.set(Math.cos(a)*.142,Math.sin(a)*.142,.066);lamp.add(s)}
  const hd=new T.Mesh(new T.CylinderGeometry(.022,.027,.22,12),M(T,0x1a1b22,{metalness:.3,roughness:.6,emissiveIntensity:.05}));hd.rotation.z=-Math.PI*.75;hd.position.set(.19,-.19,.05);lamp.add(hd);
  const stand=new T.Mesh(new T.BoxGeometry(.66,.04,.2),M(T,0x1a1d2e,{metalness:.6,roughness:.35,emissiveIntensity:0}));stand.position.set(0,-.38,.03);g.add(stand);
  const G=new T.Color(0xc8ff4a),U=new T.Color(0x1e1240),D=new T.Color(0x2b3150);
  const upd=t=>{const lx=.13*Math.sin(t*.7),ly=.04+.19*Math.sin(t*.43+1.1);lamp.position.set(lx,ly,0);
   W.forEach(([x,y,w,gr],i)=>bars.setColorAt(i,Math.hypot(x-lx,y-ly)<.125?(gr?G:U):D));bars.instanceColor.needsUpdate=true};
  upd(.6);return{obj:g,mats,tick:t=>upd(t)}},


 // Hook Bouncer: nightclub door frame, velvet rope, clipboard, command blocks bouncing / slipping through
 bouncer(T,col){const g=new T.Group(),mats=[],br=M(T,0xd4a84b,{metalness:.85,roughness:.3,emissiveIntensity:.2}),vel=M(T,0x5c1228,{metalness:.15,roughness:.7,emissiveIntensity:.25}),ink=M(T,0x1a0a10,{metalness:.2,roughness:.8,emissiveIntensity:.05}),clip=M(T,0xf4ecd8,{metalness:0,roughness:.9,emissiveIntensity:.12}),stamp=M(T,col,{metalness:.2,roughness:.45,emissiveIntensity:.75});mats.push(br,vel,stamp);
  // floor plank
  const floor=new T.Mesh(new T.BoxGeometry(.9,.03,.4),ink);floor.position.y=-.38;g.add(floor);
  // door frame
  const jambL=new T.Mesh(new T.BoxGeometry(.04,.7,.06),br);jambL.position.set(-.08,0,0);g.add(jambL);
  const jambR=new T.Mesh(new T.BoxGeometry(.04,.7,.06),br);jambR.position.set(.22,0,0);g.add(jambR);
  const lintel=new T.Mesh(new T.BoxGeometry(.38,.05,.07),br);lintel.position.set(.07,.38,0);g.add(lintel);
  // dark doorway
  const door=new T.Mesh(new T.BoxGeometry(.26,.62,.02),ink);door.position.set(.07,0,-.01);g.add(door);
  // bouncer body (crossed-arms silhouette)
  const body=new T.Mesh(new T.BoxGeometry(.12,.22,.06),ink);body.position.set(.1,-.05,.04);g.add(body);
  const head=new T.Mesh(new T.SphereGeometry(.045,10,8),ink);head.position.set(.1,.1,.05);g.add(head);
  const clipB=new T.Mesh(new T.BoxGeometry(.07,.09,.01),clip);clipB.position.set(.02,-.02,.08);clipB.rotation.z=-.3;g.add(clipB);
  const line=new T.Mesh(new T.BoxGeometry(.05,.008,.012),stamp);line.position.set(.02,-.01,.09);g.add(line);
  // velvet rope posts + rope
  const post=()=>{const p=new T.Group();const s=new T.Mesh(new T.CylinderGeometry(.015,.015,.22,8),br);s.position.y=.11;p.add(s);const top=new T.Mesh(new T.SphereGeometry(.03,8,6),br);top.position.y=.23;p.add(top);return p};
  const p1=post(),p2=post();p1.position.set(-.38,-.38,.12);p2.position.set(-.18,-.38,.12);g.add(p1,p2);
  const rope=new T.Mesh(new T.TubeGeometry(new T.QuadraticBezierCurve3(new T.Vector3(-.38,-.15,.12),new T.Vector3(-.28,-.05,.16),new T.Vector3(-.18,-.15,.12)),10,.012,6,false),vel);g.add(rope);
  // command blocks: one blocked (left, bouncing), one slipped (right)
  const mkBlk=(txtCol)=>{const m=M(T,txtCol,{metalness:.1,roughness:.6,emissiveIntensity:.35});mats.push(m);return new T.Mesh(new T.BoxGeometry(.22,.07,.04),m)};
  const blocked=mkBlk(col);blocked.position.set(-.28,.12,.18);g.add(blocked);
  const slipped=mkBlk(0x2db87a);slipped.position.set(.38,-.18,.1);g.add(slipped);
  // BLOCKED stamp chip
  const stampChip=new T.Mesh(new T.BoxGeometry(.14,.04,.015),stamp);stampChip.position.set(-.22,.22,.22);stampChip.rotation.z=-.25;g.add(stampChip);
  const upd=t=>{const bounce=Math.abs(Math.sin(t*3.2));blocked.position.set(-.28-bounce*.08,.12+bounce*.1,.18);blocked.rotation.z=-.15-bounce*.2;
   slipped.position.set(.28+Math.abs(Math.sin(t*1.4))*.14,-.22+.06*Math.sin(t*1.4),.1);slipped.rotation.z=Math.sin(t*1.4)*.15;
   stampChip.material.emissiveIntensity=.45+.4*(.5+.5*Math.sin(t*5));
   head.position.y=.1+.01*Math.sin(t*2)};
  upd(.5);g.rotation.y=-.35;g.rotation.x=.22;
  return{obj:g,mats,tick:t=>upd(t)}},
 // MCTS Bonsai: a bonsai in a glazed pot; the chosen limb carries a green crown, two cut-off limbs wither rust, a leaf drops
 bonsai(T,col){const g=new T.Group(),mats=[],bark=M(T,0x4a3426,{metalness:.05,roughness:.85,emissiveIntensity:.08}),glaze=M(T,0x34465a,{metalness:.35,roughness:.3,emissiveIntensity:.06});
  const pot=new T.Mesh(new T.BoxGeometry(.6,.1,.34),glaze);pot.position.y=-.35;g.add(pot);const rim=new T.Mesh(new T.BoxGeometry(.64,.025,.37),M(T,0x5c7a92,{metalness:.4,roughness:.25,emissiveIntensity:.05}));rim.position.y=-.29;g.add(rim);
  const soil=new T.Mesh(new T.BoxGeometry(.58,.012,.32),M(T,0x3a2a1e,{metalness:0,roughness:1,emissiveIntensity:0}));soil.position.y=-.276;g.add(soil);
  for(const x of[-.2,.2]){const f=new T.Mesh(new T.BoxGeometry(.08,.03,.2),glaze);f.position.set(x,-.415,0);g.add(f)}
  const tube=(pts,r)=>new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(p=>new T.Vector3(...p))),20,r,7,false),bark);
  g.add(tube([[-.03,-.28,0],[.06,-.18,.01],[-.05,-.06,0],[.03,.06,0]],.042));g.add(new T.Mesh(new T.ConeGeometry(.08,.07,10),bark).translateY(-.255).translateX(-.03));
  const crown=new T.Group();crown.position.set(.03,.06,0);g.add(crown);
  crown.add(tube([[0,0,0],[.06,.1,.01],[.12,.2,0]],.024),tube([[0,0,0],[-.1,.04,.02],[-.22,.07,0]],.012),tube([[0,0,0],[.12,0,-.02],[.21,-.02,0]],.011),tube([[.06,.1,.01],[-.02,.2,0],[-.06,.27,0]],.014));
  const green=M(T,col,{metalness:.05,roughness:.7,emissiveIntensity:.35}),rust=M(T,0xb4532c,{metalness:.05,roughness:.7,emissiveIntensity:.35});mats.push(green,rust);
  const pad=(x,y,r,m)=>{const p=new T.Mesh(new T.IcosahedronGeometry(r,1),m);p.position.set(x,y,0);p.scale.set(1,.55,.8);crown.add(p);return p};
  const P=[pad(.13,.25,.15,green),pad(-.05,.29,.11,green),pad(.25,.16,.09,green),pad(-.23,.08,.06,rust),pad(.22,-.01,.05,rust)];
  const bloom=M(T,0xfbe8ee,{metalness:0,roughness:.6,emissiveIntensity:.25});for(let i=0;i<9;i++){const s=new T.Mesh(new T.SphereGeometry(.011,6,5),bloom);s.position.set(-.08+(i%5)*.07,.28+((i*37)%5)*.012,.1-((i*13)%3)*.03);crown.add(s)}
  const leaf=new T.Mesh(new T.CircleGeometry(.018,6),rust);leaf.scale.set(1,.5,1);g.add(leaf);
  const upd=t=>{crown.rotation.z=Math.sin(t*.8)*.025;P.slice(0,3).forEach((p,i)=>p.scale.set(1+.04*Math.sin(t*1.3+i),.55+.025*Math.sin(t*1.3+i),.8));
   const u=(t*.35)%1;leaf.position.set(-.2+.08*Math.sin(u*9),.12-.38*u,.06);leaf.rotation.z=u*8;leaf.visible=u<.97};
  upd(.4);g.rotation.y=-.25;return{obj:g,mats,tick:t=>upd(t)}},
 // Photocopy Collapse: a beige copier with a green scan bar; its copies fan out on the table, many kinds of butterfly on the first sheet, one kind on the last
 copier(T,col){const g=new T.Group(),mats=[],body=M(T,0xe9dfca,{metalness:.1,roughness:.7,emissiveIntensity:.1}),dark=M(T,0x35322e,{metalness:.35,roughness:.45,emissiveIntensity:.04}),paper=M(T,0xf8f6ef,{metalness:0,roughness:.9,emissiveIntensity:.16}),scan=M(T,col,{metalness:0,roughness:.35,emissiveIntensity:.95}),led=M(T,0xff5a3c,{metalness:0,roughness:.5,emissiveIntensity:.8});mats.push(scan,led);
  const box=(w,h,d,m,x,y,z)=>{const b=new T.Mesh(new T.BoxGeometry(w,h,d),m);b.position.set(x,y,z);g.add(b);return b};
  box(.7,.22,.36,body,0,.08,-.16);box(.66,.04,.34,dark,0,.21,-.16);box(.7,.035,.36,M(T,0xc9bc9f,{metalness:.1,roughness:.8,emissiveIntensity:.05}),0,-.015,-.16);
  box(.44,.05,.006,M(T,0x10201a,{metalness:.6,roughness:.2,emissiveIntensity:.05}),-.1,.125,.022);const bar=box(.035,.044,.01,scan,0,.125,.026);
  box(.15,.09,.006,dark,.24,.11,.022);box(.07,.03,.006,led,.22,.125,.027);const btn=new T.Mesh(new T.SphereGeometry(.016,10,8),M(T,0x2f9c58,{metalness:.2,roughness:.4,emissiveIntensity:.3}));btn.position.set(.28,.125,.03);g.add(btn);
  box(.62,.012,.02,M(T,0x1d1b18,{metalness:.2,roughness:.7,emissiveIntensity:0}),0,.015,.03);
  const wing=new T.CircleGeometry(.019,10),bm={},bmat=c=>bm[c]||(bm[c]=M(T,c,{metalness:0,roughness:.6,emissiveIntensity:.25}));
  const print=(s,ks,n,cols,dx,dy)=>{for(let i=0;i<n;i++){const c=ks[(i+Math.floor(i/3))%ks.length],x=(i%cols-(cols-1)/2)*dx,y=dy*((Math.floor(n/cols)-1)/2-Math.floor(i/cols));
    for(const sx of[-1,1]){const w=new T.Mesh(wing,bmat(c));w.position.set(x+sx*.015,y,.002);w.scale.set(1,.72,1);w.rotation.z=sx*.5;s.add(w)}
    const bd=new T.Mesh(new T.PlaneGeometry(.005,.03),dark);bd.position.set(x,y,.003);s.add(bd)}};
  // the copies, fanned on the table: fewer kinds each time
  const KINDS=[[0xe8892b,0xe3cc40,0xeeeae0,0x2f7bd8,0xb5342a,0x99cf84,0x2c2823],[0xe8892b,0xe3cc40,0xeeeae0,0xe8892b,0x2f7bd8],[0xe8892b,0xe3cc40,0xe8892b],[0xe8892b]];
  KINDS.forEach((ks,k)=>{const s=new T.Group();s.position.set(-.25+k*.13,-.03+k*.004,.24-k*.012);s.rotation.set(-Math.PI/2,0,.22-k*.12);g.add(s);
   s.add(new T.Mesh(new T.PlaneGeometry(.26,.34),paper));print(s,ks,12,3,.08,.075)});
  // the newest copy slides out of the slot
  const op=new T.Mesh(new T.PlaneGeometry(.3,.2),paper);op.rotation.x=-1.15;op.position.set(0,-.005,.08);g.add(op);print(op,[0xe8892b],6,3,.09,.07);
  const upd=t=>{const u=(t*.45)%1;bar.position.x=-.3+.4*(u<.8?u/.8:1-(u-.8)/.2);scan.emissiveIntensity=.75+.25*Math.sin(t*6);op.position.z=.08+.025*Math.sin(t*.9)};
  upd(.6);g.rotation.y=-.3;g.rotation.x=.2;
  return{obj:g,mats,tick:t=>upd(t)}},

 // Budget Fuse Box: a black car fuse tray; one red blade fuse blown and spitting sparks, one intact, a tan budget fuse, and a glowing paperclip jammed in the last slot
 fusebox(T,col){const g=new T.Group(),mats=[],abs=M(T,0x1c1e21,{metalness:.2,roughness:.75,emissiveIntensity:.03}),hole=M(T,0x050506,{metalness:0,roughness:1,emissiveIntensity:0}),steel=M(T,0xd9dde2,{metalness:.9,roughness:.25,emissiveIntensity:.05});
  const tray=new T.Mesh(new T.BoxGeometry(.74,.12,.38),abs);tray.position.y=-.28;g.add(tray);
  const rim=new T.Mesh(new T.BoxGeometry(.78,.03,.42),M(T,0x2a2d31,{metalness:.2,roughness:.6,emissiveIntensity:.03}));rim.position.y=-.215;g.add(rim);
  const X=[-.255,-.085,.085,.255];X.forEach(x=>{const h=new T.Mesh(new T.BoxGeometry(.14,.012,.07),hole);h.position.set(x,-.2,0);g.add(h)});
  const fuse=(x,c,blown)=>{const f=new T.Group();f.position.set(x,-.1,0);g.add(f);
   const body=new T.Mesh(new T.BoxGeometry(.13,.14,.045),new T.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:.08,metalness:.05,roughness:.4,transparent:true,opacity:.9}));f.add(body);mats.push(body.material);
   const cap=new T.Mesh(new T.BoxGeometry(.135,.03,.05),M(T,c,{metalness:.05,roughness:.55,emissiveIntensity:.06}));cap.position.y=.08;f.add(cap);
   for(const s of[-1,1]){const l=new T.Mesh(new T.BoxGeometry(.028,.06,.012),steel);l.position.set(s*.042,-.09,0);f.add(l)}
   const link=M(T,blown?0x2a1a10:0xe8eaed,{metalness:.8,roughness:.3,emissiveIntensity:blown?0:.15});
   if(blown){for(const s of[-1,1]){const p=new T.Mesh(new T.BoxGeometry(.03,.008,.006),link);p.position.set(s*.03,-.01,.024);f.add(p)}
    const soot=new T.Mesh(new T.CircleGeometry(.04,10),new T.MeshBasicMaterial({color:0x0a0604,transparent:true,opacity:.7}));soot.position.set(0,-.005,.0235);f.add(soot)}
   else{const p=new T.Mesh(new T.BoxGeometry(.09,.008,.006),link);p.position.set(0,-.01,.024);f.add(p)}
   return f};
  fuse(X[0],0xd8332b,false);fuse(X[1],0xd8332b,true);fuse(X[2],0xb8894f,false);
  // paperclip in the last slot, hot
  const pts=[[-.05,-.07],[-.05,.08],[.05,.08],[.05,-.04],[-.03,-.04],[-.03,.05],[.03,.05],[.03,-.02]].map(([x,y])=>new T.Vector3(x,y,0));
  const hotM=M(T,0xff7a2a,{metalness:.6,roughness:.3,emissiveIntensity:.9});mats.push(hotM);
  const clip=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts,false,'catmullrom',.15),60,.007,6,false),hotM);clip.position.set(X[3],-.12,0);clip.rotation.z=-.12;g.add(clip);
  // sparks above the blown fuse
  const N=18,pa=new Float32Array(N*3),pg=new T.BufferGeometry();pg.setAttribute('position',new T.BufferAttribute(pa,3));
  const sp=new T.Points(pg,new T.PointsMaterial({color:0xffd27a,size:.03,transparent:true,opacity:.95}));g.add(sp);
  const upd=t=>{for(let i=0;i<N;i++){const u=((t*1.6+i*.137)%1),a=-1.2+i*2.4/N*1+.3*Math.sin(i*7.3),r=u*.22;pa[i*3]=X[1]+Math.sin(a)*r;pa[i*3+1]=-.04+Math.cos(a)*r*1.1-u*u*.12;pa[i*3+2]=.03+Math.sin(i*3.1)*.03}pg.attributes.position.needsUpdate=true;
   hotM.emissiveIntensity=.75+.25*Math.sin(t*5)};
  upd(.35);g.rotation.x=.32;g.rotation.y=-.28;
  return{obj:g,mats,tick:t=>upd(t)}},
 // Backprop Waterworks: a walnut board with three glass tanks joined by glass pipes; water in the right reservoir, dye in the left one and in the outlet, dye beads climbing back up a pipe
 waterworks(T,col){const g=new T.Group(),mats=[],brass=M(T,0xc9a050,{metalness:.9,roughness:.3,emissiveIntensity:.08}),wood=M(T,0x3a2414,{metalness:0,roughness:.75,emissiveIntensity:.04});
  const bd=new T.Mesh(new T.BoxGeometry(.8,.88,.03),wood);bd.position.z=-.17;g.add(bd);
  for(const[x,y]of[[-.36,.4],[.36,.4],[-.36,-.4],[.36,-.4]]){const r=new T.Mesh(new T.SphereGeometry(.014,8,6),brass);r.position.set(x,y,-.15);g.add(r)}
  const glass=new T.MeshStandardMaterial({color:0xe6f6ff,transparent:true,opacity:.24,roughness:.05,metalness:.1,depthWrite:false,side:T.DoubleSide});
  const dye=M(T,col,{emissiveIntensity:.75,metalness:0,roughness:.25,transparent:true,opacity:.92});mats.push(dye);
  const pink=M(T,0xff5a7e,{emissiveIntensity:.35,metalness:0,roughness:.25,transparent:true,opacity:.88});
  const water=M(T,0x8cc4d2,{emissiveIntensity:.25,metalness:0,roughness:.2,transparent:true,opacity:.75});
  const tank=(x,y,r,h,lv,wm,fun)=>{const t=new T.Group();t.position.set(x,y,0);g.add(t);
   const w=new T.Mesh(new T.CylinderGeometry(r*.9,r*.9,h*lv,28),wm);w.position.y=-h/2+h*lv/2;t.add(w);
   t.add(new T.Mesh(new T.CylinderGeometry(r,r,h,28,1,true),glass));
   for(const s of[-1,1]){const c=new T.Mesh(new T.TorusGeometry(r+.004,.01,6,28),brass);c.rotation.x=Math.PI/2;c.position.y=s*h/2;t.add(c)}
   const b=new T.Mesh(new T.CylinderGeometry(r+.02,r+.03,.03,28),brass);b.position.y=-h/2-.02;t.add(b);
   if(fun){const f=new T.Mesh(new T.CylinderGeometry(r*.95,r*.5,.07,24,1,true),brass);f.position.y=h/2+.045;t.add(f)}};
  tank(-.2,.21,.1,.24,.62,pink,true);tank(.2,.21,.1,.24,.78,water,true);tank(0,-.22,.125,.26,.58,dye,false);
  // pipes: out of the bottom of each reservoir, back towards the board, down into the outlet
  const V=(x,y,z)=>new T.Vector3(x,y,z);
  const pipe=(x0,x1,wm)=>{const c=new T.CatmullRomCurve3([V(x0,.06,0),V(x0,.0,-.07),V(x1,-.02,-.08),V(x1,-.07,0)],false,'centripetal');
   g.add(new T.Mesh(new T.TubeGeometry(c,28,.02,8,false),glass));g.add(new T.Mesh(new T.TubeGeometry(c,28,.011,6,false),wm));return c};
  const up=pipe(-.2,-.04,dye);pipe(.2,.04,water);
  // a valve wheel on the outlet
  const wh=new T.Mesh(new T.TorusGeometry(.04,.007,6,20),brass);wh.position.set(.19,-.33,.02);g.add(wh);
  const st=new T.Mesh(new T.CylinderGeometry(.008,.008,.07,6),brass);st.rotation.z=Math.PI/2;st.position.set(.15,-.33,.02);g.add(st);
  const bm=M(T,col,{emissiveIntensity:1.1,metalness:0,roughness:.3});mats.push(bm);
  const beads=[0,1,2].map(()=>{const b=new T.Mesh(new T.SphereGeometry(.016,10,8),bm);g.add(b);return b});
  const upd=t=>{beads.forEach((b,i)=>{const u=((t*.35+i/3)%1);b.position.copy(up.getPoint(1-u))});wh.rotation.z=-t*.8;dye.emissiveIntensity=.65+.15*Math.sin(t*2.2)};
  upd(.15);g.rotation.y=.28;g.rotation.x=.08;
  return{obj:g,mats,tick:t=>upd(t)}},
 // Hopfield Flip-Dots: a little flip-disc sign on a brass easel showing a cat; every few seconds a quarter of the discs flip over at random, then clack back one by one to the stored cat
 flipdots(T,col){const g=new T.Group(),mats=[],paint=M(T,0x1d2120,{metalness:.3,roughness:.6,emissiveIntensity:.03}),brass=M(T,0xc9a050,{metalness:.9,roughness:.3,emissiveIntensity:.08});
  const face=M(T,0x050606,{metalness:0,roughness:.9,emissiveIntensity:0}),blk=M(T,0x161718,{metalness:.2,roughness:.55,emissiveIntensity:0}),yel=M(T,col,{emissive:new T.Color(col).multiplyScalar(.55),emissiveIntensity:.75,metalness:.05,roughness:.4});mats.push(yel);
  const hb=new T.Mesh(new T.BoxGeometry(.9,.64,.05),paint);g.add(hb);const fc=new T.Mesh(new T.PlaneGeometry(.82,.56),face);fc.position.z=.026;g.add(fc);
  const pl=new T.Mesh(new T.BoxGeometry(.4,.045,.012),brass);pl.position.set(0,-.36,.012);g.add(pl);
  for(const s of[-1,1]){const l=new T.Mesh(new T.CylinderGeometry(.012,.014,.5,8),brass);l.position.set(s*.3,-.43,-.06);l.rotation.x=-.22;g.add(l)}
  const CAT=['.#........#.','.##......##.','.##########.','.#..####..#.','.##########.','.####..####.','..########..','....####....'],dg=new T.CircleGeometry(.027,16),discs=[];
  let h=7;const rnd=()=>(h=Math.imul(h^h>>>15,2246822519)+0x6D2B79F5|0,(h>>>0)/4294967296);
  CAT.forEach((row,y)=>[...row].forEach((ch,x)=>{const d=new T.Group();d.position.set((x-5.5)*.066,(3.5-y)*.066,.034);const a=new T.Mesh(dg,yel),b=new T.Mesh(dg,blk);a.position.z=.002;b.position.z=-.002;b.rotation.y=Math.PI;d.add(a,b);g.add(d);
   discs.push({d,on:ch==='#',scr:rnd()<.3,ts:1.6+rnd()*.35,tb:2.6+rnd()*2.2,rot:ch==='#'?0:Math.PI})}));
  const upd=(t,dt)=>{const u=t%7;for(const q of discs){const flipped=q.scr&&u>=q.ts&&u<q.tb,want=(q.on!==flipped)?0:Math.PI;q.rot+=(want-q.rot)*Math.min(1,dt*22);q.d.rotation.x=q.rot}};
  upd(0,1);g.scale.setScalar(.88);g.position.y=.1;g.rotation.y=-.3;g.rotation.x=-.06;
  return{obj:g,mats,tick:(t,dt)=>upd(t,dt||.016)}},
 // Optimizer Derby: a tilted relief model of Rosenbrock's banana valley on a walnut plinth, four marbles (steel, brass, violet, red) rolling along the valley floor from a blue starting gate to a chequered flag
 derby(T,col){const g=new T.Group(),mats=[],N=48,S=.7,geo=new T.PlaneGeometry(S,S,N,N);geo.rotateX(-Math.PI/2);
  const f=(x,y)=>{const a=1-x,b=y-x*x;return a*a+100*b*b},L=(x,y)=>Math.log1p(f(x,y)/12)/Math.log1p(260),H=.13,dx=X=>X/S*3.4,dy=Z=>1.05-Z/S*3.4;
  const P=geo.attributes.position,C=[],turf=new T.Color(0x2f7a32),sand=new T.Color(0xc9b07a),chalk=new T.Color(0xf2ede2),ink=new T.Color(0x5b4a30),c=new T.Color();
  for(let i=0;i<P.count;i++){const x=dx(P.getX(i)),y=dy(P.getZ(i)),u=Math.min(1,L(x,y));P.setY(i,H*u);
   c.copy(turf).lerp(sand,Math.min(1,u*2.4));if(u>.42)c.lerp(chalk,Math.min(1,(u-.42)*2.2));const q=(Math.log10(f(x,y)+1e-3)*2)%1;if(q>0&&q<.13)c.lerp(ink,.45);C.push(c.r,c.g,c.b)}
  geo.setAttribute('color',new T.Float32BufferAttribute(C,3));geo.computeVertexNormals();
  g.add(new T.Mesh(geo,new T.MeshStandardMaterial({vertexColors:true,roughness:.9,metalness:0})));
  const base=new T.Mesh(new T.BoxGeometry(S+.03,.07,S+.03),M(T,0x3b2416,{metalness:.1,roughness:.6,emissiveIntensity:.04}));base.position.y=-.036;g.add(base);
  const trim=new T.Mesh(new T.BoxGeometry(S+.05,.012,S+.05),M(T,0xc8a050,{metalness:.9,roughness:.3,emissiveIntensity:.1}));trim.position.y=-.068;g.add(trim);
  const at=(x,y,r)=>new T.Vector3(x*S/3.4,H*Math.min(1,L(x,y))+r,(1.05-y)*S/3.4);
  const wht=M(T,0xf1ece2,{emissiveIntensity:.15}),pole=new T.Mesh(new T.CylinderGeometry(.005,.005,.17,6),wht);pole.position.copy(at(1,1,.085)).add(new T.Vector3(.035,0,0));g.add(pole);
  const ck=document.createElement('canvas');ck.width=ck.height=32;const cx=ck.getContext('2d');for(let j=0;j<4;j++)for(let i=0;i<6;i++){cx.fillStyle=(i+j)%2?'#111':'#f6f3ea';cx.fillRect(i*32/6,j*8,32/6+1,8)}
  const fl=new T.Mesh(new T.PlaneGeometry(.08,.05),new T.MeshStandardMaterial({map:new T.CanvasTexture(ck),side:T.DoubleSide,roughness:.6}));fl.position.copy(pole.position).add(new T.Vector3(.04,.06,0));g.add(fl);
  const gb=M(T,col,{emissive:new T.Color(col).multiplyScalar(.6),emissiveIntensity:.8});mats.push(gb);
  const gate=new T.Mesh(new T.BoxGeometry(.12,.012,.012),gb);gate.position.copy(at(-1.45,2.1,.07));gate.rotation.y=.45;g.add(gate);
  for(const s of[-1,1]){const p=new T.Mesh(new T.CylinderGeometry(.004,.004,.07,6),wht);p.position.copy(gate.position).add(new T.Vector3(s*.06*Math.cos(.45),-.035,-s*.06*Math.sin(.45)));g.add(p)}
  const balls=[0xc9d1db,0xe8a93b,0xa98bff,0xff4b5c].map((cc,k)=>{const m=M(T,cc,{emissive:new T.Color(cc).multiplyScalar(.45),emissiveIntensity:.6,metalness:k<2?.6:.1,roughness:.25});mats.push(m);
   const b=new T.Mesh(new T.SphereGeometry(.028,18,14),m);g.add(b);return b});
  // each marble follows the valley floor y = x² from the gate to the flag at its own pace; SGD barely gets going
  const pace=[.14,.8,.52,1],upd=t=>{balls.forEach((b,k)=>{const u=Math.min(1,((t*.15+.35)%1.3)*pace[k]),x=-1.45+2.45*u;b.position.copy(at(x,x*x,.028))})};
  upd(2.2);g.rotation.x=.62;g.rotation.y=.2;g.position.y=-.03;
  return{obj:g,mats,tick:t=>upd(t)}},
 // Reward Regatta: a round lagoon tilted toward you, a sandy islet ringed by three red buoys and a white wake, a little sloop with a navy sail circling it forever, and an unvisited chequered finish flag at the rim
 regatta(T,col){const g=new T.Group(),mats=[],R=.42;
  const water=new T.Mesh(new T.CylinderGeometry(R,R,.03,64),M(T,0x165f86,{emissiveIntensity:.08,metalness:.15,roughness:.22}));g.add(water);
  const sh=new T.Mesh(new T.CylinderGeometry(R*.62,R*.62,.032,48),M(T,0x2f8fb0,{emissiveIntensity:.08,metalness:.1,roughness:.28}));sh.position.y=.0015;g.add(sh);
  const rim=new T.Mesh(new T.TorusGeometry(R+.012,.022,10,72),M(T,0xe6d3a0,{emissiveIntensity:.08,metalness:.05,roughness:.8}));rim.rotation.x=Math.PI/2;g.add(rim);
  const base=new T.Mesh(new T.CylinderGeometry(R+.04,R+.05,.06,64),M(T,0x3b2416,{metalness:.1,roughness:.6,emissiveIntensity:.04}));base.position.y=-.045;g.add(base);
  const isl=new T.Mesh(new T.SphereGeometry(.085,24,12),M(T,0xead8a8,{emissiveIntensity:.1,metalness:0,roughness:.9}));isl.scale.set(1,.32,.8);isl.position.y=.012;g.add(isl);
  const tree=new T.Mesh(new T.ConeGeometry(.026,.07,10),M(T,0x6f8f4e,{emissiveIntensity:.1,metalness:0,roughness:.8}));tree.position.set(.01,.06,0);g.add(tree);
  const wake=new T.Mesh(new T.TorusGeometry(.2,.007,6,80),new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.85}));wake.rotation.x=Math.PI/2;wake.position.y=.018;g.add(wake);
  const red=M(T,0xe0452a,{emissive:new T.Color(0xe0452a).multiplyScalar(.5),emissiveIntensity:.6,metalness:.1,roughness:.4});mats.push(red);
  const band=M(T,0xfff4e0,{emissiveIntensity:.15,metalness:0,roughness:.6}),bs=[];
  for(let k=0;k<3;k++){const a=k*2.094+.5,b=new T.Group(),s=new T.Mesh(new T.SphereGeometry(.026,16,12),red),r=new T.Mesh(new T.TorusGeometry(.024,.006,6,20),band);r.rotation.x=Math.PI/2;b.add(s,r);b.position.set(Math.cos(a)*.2,.03,Math.sin(a)*.2);g.add(b);bs.push(b)}
  const boat=new T.Group(),hull=new T.Mesh(new T.SphereGeometry(.04,16,10),M(T,0xfbf8f0,{emissiveIntensity:.2,metalness:.1,roughness:.4}));hull.scale.set(1.5,.42,.62);boat.add(hull);
  const sail=new T.Mesh(new T.BufferGeometry().setFromPoints([new T.Vector3(.02,.012,0),new T.Vector3(.02,.13,0),new T.Vector3(-.055,.016,0)]),new T.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:.12,side:T.DoubleSide,roughness:.5}));
  sail.geometry.computeVertexNormals();boat.add(sail);g.add(boat);
  const pole=new T.Mesh(new T.CylinderGeometry(.004,.004,.16,6),band);pole.position.set(.36,.08,-.16);g.add(pole);
  const ck=document.createElement('canvas');ck.width=ck.height=32;const cx=ck.getContext('2d');for(let j=0;j<4;j++)for(let i=0;i<6;i++){cx.fillStyle=(i+j)%2?'#111':'#f6f3ea';cx.fillRect(i*32/6,j*8,32/6+1,8)}
  const fl=new T.Mesh(new T.PlaneGeometry(.075,.048),new T.MeshStandardMaterial({map:new T.CanvasTexture(ck),side:T.DoubleSide,roughness:.6}));fl.position.set(.36+.04,.135,-.16);g.add(fl);
  const upd=t=>{const a=-t*.9;boat.position.set(Math.cos(a)*.2,.03,Math.sin(a)*.2);boat.rotation.y=-a+Math.PI;
   bs.forEach((b,k)=>{b.position.y=.03+Math.sin(t*2.4+k*2)*.004})};
  upd(1.1);g.rotation.x=.55;g.position.y=-.02;g.scale.setScalar(1.02);
  return{obj:g,mats,tick:t=>upd(t)}},
 // t-SNE Planisphere: a navy star disk in a brass ring tilted toward you, coloured stars gathered into constellations with faint figure lines, a rust arc for the exaggerated steps, a brass pointer, and a loupe holding one handwritten digit; the disk turns slowly
 planisphere(T,col){const g=new T.Group(),mats=[],R=.4,brass=M(T,0xd2ad62,{metalness:.85,roughness:.3,emissiveIntensity:.08}),disk=new T.Group();g.add(disk);
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
  return{obj:g,mats,tick:t=>upd(t)}},
 // Speculative Press: a little cylinder proof press tilted toward you; a sheet on the bed with lines of black type and glowing red words (one per stroke), a struck pencil word, a yellow pencil, and the brass-ended roller rolling to and fro
 press(T,col){const g=new T.Group(),mats=[],iron=M(T,0x2a2522,{emissiveIntensity:.04,metalness:.7,roughness:.45}),steel=M(T,0x8d8a84,{emissiveIntensity:.05,metalness:.85,roughness:.3}),brass=M(T,0xc9a35c,{metalness:.85,roughness:.3,emissiveIntensity:.1});
  const box=(w,h,d,m,x,y,z)=>{const b=new T.Mesh(new T.BoxGeometry(w,h,d),m);b.position.set(x,y,z);g.add(b);return b};
  box(.86,.08,.5,iron,0,-.045,0);box(.8,.014,.44,steel,0,.002,0);
  const paper=M(T,0xe2d6bb,{emissiveIntensity:.03,metalness:0,roughness:.95});box(.5,.004,.36,paper,-.07,.011,0);
  const ink=M(T,0x0b0908,{emissiveIntensity:0,metalness:0,roughness:1}),red=M(T,0xc8301a,{emissive:new T.Color(0xd8361c),emissiveIntensity:1.1,metalness:0,roughness:.7}),lead=M(T,0x8b867d,{emissiveIntensity:.05,metalness:0,roughness:.9});mats.push(red);
  let s=27;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;
  for(let r=0;r<7;r++){const z=-.135+r*.045;let x=-.3,end=r===6?-.02:.15,k=0;
   while(x<end){const w=.025+rnd()*.05;if(x+w>end)break;const last=r===6&&x+w+.03>end;const m=last?red:(k%3===2||rnd()<.18)?red:ink;box(w,.006,.017,m,x+w/2,.016,z);x+=w+.012;k++}
   if(r===6){const pw=.06;box(pw,.003,.016,lead,x+.004+pw/2,.0145,z);box(pw+.01,.0035,.004,red,x+.004+pw/2,.016,z)}}
  const car=new T.Group();g.add(car);
  const rg=new T.Group();car.add(rg);const roll=new T.Mesh(new T.CylinderGeometry(.055,.055,.46,36),M(T,0x1c1a19,{emissiveIntensity:0,metalness:.35,roughness:.55}));roll.rotation.x=Math.PI/2;rg.add(roll);
  for(const z of[-.25,.25]){const cap=new T.Mesh(new T.CylinderGeometry(.065,.065,.025,36),brass);cap.rotation.x=Math.PI/2;cap.position.z=z;car.add(cap);
   const arm=new T.Mesh(new T.BoxGeometry(.05,.13,.02),iron);arm.position.set(0,-.02,z+(z>0?.022:-.022));car.add(arm)}
  const crank=new T.Mesh(new T.TorusGeometry(.045,.008,8,28),brass);crank.position.set(0,0,.29);rg.add(crank);const spoke=new T.Mesh(new T.BoxGeometry(.09,.012,.01),brass);spoke.position.z=.29;rg.add(spoke);const knob=new T.Mesh(new T.CylinderGeometry(.009,.009,.05,10),M(T,0x5a2a1a,{emissiveIntensity:.1,metalness:.2,roughness:.5}));knob.rotation.x=Math.PI/2;knob.position.set(.045,0,.315);rg.add(knob);
  car.position.y=.075;
  for(const z of[-.235,.235])box(.8,.02,.012,brass,0,.016,z);
  const pen=new T.Group();g.add(pen);
  const body=new T.Mesh(new T.CylinderGeometry(.011,.011,.26,6),M(T,0xe2b33c,{emissiveIntensity:.15,metalness:.1,roughness:.6}));pen.add(body);
  const tip=new T.Mesh(new T.ConeGeometry(.011,.04,6),M(T,0xe9cfa1,{emissiveIntensity:.1,metalness:0,roughness:.8}));tip.position.y=-.15;tip.rotation.x=Math.PI;pen.add(tip);
  const lead2=new T.Mesh(new T.ConeGeometry(.004,.014,6),M(T,0x333333,{emissiveIntensity:0}));lead2.position.y=-.164;lead2.rotation.x=Math.PI;pen.add(lead2);
  pen.rotation.set(Math.PI/2,0,-.5);pen.position.set(.29,.03,.03);
  const upd=t=>{const x=.04+Math.sin(t*.9)*.2;car.position.x=x;rg.rotation.z=-x/.055};
  upd(0);g.rotation.x=.6;g.position.y=-.02;g.scale.setScalar(.98);
  return{obj:g,mats,tick:t=>upd(t)}},
};
