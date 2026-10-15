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

};
