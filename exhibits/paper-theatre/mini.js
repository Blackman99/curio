// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Paper Theatre: a pop-up book open at its storm scene: red-and-gold proscenium, swagged curtain, three rows of cut-paper waves, a brig and a moon on the backdrop, footlights along the apron
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.25,metalness:0,roughness:.85,side:T.DoubleSide},o));
export default function paperTheatre(T,col){const g=new T.Group(),mats=[];
  const flat=(shape,m,z,depth=.006)=>{const ge=new T.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:10});const o=new T.Mesh(ge,m);o.position.z=z;return o};
  const paper=M(T,0xefe2c4,{emissiveIntensity:.18}),cloth=M(T,0x5e151a,{emissiveIntensity:.15}),
    red=M(T,0x9a2026,{emissiveIntensity:.3}),gold=M(T,0xe0b04a,{emissive:new T.Color(0x7a5414),emissiveIntensity:.5,metalness:.35,roughness:.5}),
    sky=M(T,0x52605a,{emissiveIntensity:.35}),cloud=M(T,0x34403c,{emissiveIntensity:.3}),
    seaA=M(T,0x29463f,{emissiveIntensity:.3}),seaB=M(T,0x2f5d55,{emissiveIntensity:.3}),seaC=M(T,0x3a7466,{emissiveIntensity:.32}),
    foam=M(T,0xeef3ea,{emissiveIntensity:.35}),hull=M(T,0x5e3b1f,{emissiveIntensity:.25}),sail=M(T,0xf1e6c8,{emissiveIntensity:.3}),
    moonM=M(T,0xfff0c0,{emissive:new T.Color(0xffe28a),emissiveIntensity:.9}),flame=M(T,0xffd46a,{emissive:new T.Color(0xffb030),emissiveIntensity:1.1});
  const plaqueM=M(T,0xe0b04a,{emissive:new T.Color(0x7a5414),emissiveIntensity:.5,metalness:.35,roughness:.5});mats.push(moonM,flame,plaqueM);
  const book=new T.Group();book.position.set(0,-.27,-.04);g.add(book);
  // the open book: floor page and back page (leaning back a little), on cloth boards
  const W=.78,D=.40,H=.40,lean=.12;
  const fb=new T.Mesh(new T.BoxGeometry(W+.03,.012,D+.02),cloth);fb.position.set(0,-.006,D/2);book.add(fb);
  const fl=new T.Mesh(new T.PlaneGeometry(W,D),paper);fl.rotation.x=-Math.PI/2;fl.position.set(0,.001,D/2);book.add(fl);
  const back=new T.Group();back.rotation.x=-lean;book.add(back);
  const bb=new T.Mesh(new T.BoxGeometry(W+.03,H+.015,.012),cloth);bb.position.set(0,H/2,-.008);back.add(bb);
  const bp=new T.Mesh(new T.PlaneGeometry(W-.02,H-.01),paper);bp.position.set(0,H/2,.0);back.add(bp);
  const sk=new T.Mesh(new T.PlaneGeometry(W-.07,H-.06),sky);sk.position.set(0,H/2,.003);back.add(sk);
  const moon=new T.Mesh(new T.CircleGeometry(.035,32),moonM);moon.position.set(.2,H*.74,.006);back.add(moon);
  // clouds on the backdrop
  const cs=new T.Shape();cs.moveTo(-.36,.0);for(let i=0;i<8;i++){const x0=-.36+i*.09;cs.quadraticCurveTo(x0+.045,.07+.03*Math.sin(i*1.7),x0+.09,.005)}cs.lineTo(.36,-.03);cs.lineTo(-.36,-.03);
  const cl=new T.Mesh(new T.ShapeGeometry(cs),cloud);cl.position.set(0,H*.55,.008);back.add(cl);
  // waves: a curling row as a shape
  const waveShape=(w,h,n,amp)=>{const s=new T.Shape();s.moveTo(-w/2,0);s.lineTo(-w/2,h-amp);const st=w/n;
    for(let k=0;k<n;k++){const x0=-w/2+k*st,tx=x0+st*.6;s.bezierCurveTo(x0+st*.25,h-amp,tx-st*.25,h,tx,h);s.bezierCurveTo(tx+st*.14,h-amp*.1,tx+st*.1,h-amp*.45,tx,h-amp*.4);s.bezierCurveTo(tx+st*.2,h-amp*.6,x0+st,h-amp,x0+st,h-amp)}
    s.lineTo(w/2,0);s.lineTo(-w/2,0);return s};
  const rows=[];
  for(const [z,h,amp,n,m] of [[.13,.15,.07,6,seaA],[.21,.12,.06,7,seaB],[.30,.09,.045,8,seaC]]){
    const r=new T.Group();r.position.z=z;book.add(r);
    r.add(flat(waveShape(W*.92,h,n,amp),m,0));
    for(let k=0;k<n;k++){const tx=-W*.46+(k+.6)*W*.92/n,f=new T.Mesh(new T.CircleGeometry(.009,10),foam);f.position.set(tx+.004,h-.004,.008);r.add(f)}
    rows.push(r)}
  // the brig between the second and third rows
  const ship=new T.Group();ship.position.set(-.05,.075,.255);book.add(ship);
  const hs=new T.Shape();hs.moveTo(-.09,0);hs.lineTo(.09,0);hs.lineTo(.075,-.035);hs.quadraticCurveTo(0,-.048,-.07,-.035);hs.lineTo(-.09,0);ship.add(flat(hs,hull,0,.008));
  for(const [x,hh,ww] of [[-.03,.13,.045],[.04,.11,.04]]){const mast=new T.Mesh(new T.BoxGeometry(.005,hh,.004),hull);mast.position.set(x,hh/2,.004);ship.add(mast);
    for(const [y,s] of [[hh*.72,.85],[hh*.38,1]]){const sp=new T.Shape(),a=ww*s,b=hh*.28;sp.moveTo(-a,b/2);sp.lineTo(a,b/2);sp.quadraticCurveTo(a+.008,0,a-.004,-b/2);sp.lineTo(-a+.004,-b/2);sp.quadraticCurveTo(-a-.008,0,-a,b/2);
      const m=flat(sp,sail,.006,.003);m.position.x=x;m.position.y=y;m.position.z=.006;ship.add(m)}}
  // the proscenium: a red frame with an arched opening, gold columns, a swag and footlights
  const P=new T.Group();P.position.z=D-.035;book.add(P);
  const pw=W*.94,ph=.27,ow=pw*.7,ob=.04,ot=.215;
  const ps=new T.Shape();ps.moveTo(-pw/2,0);ps.lineTo(pw/2,0);ps.lineTo(pw/2,ph-.02);ps.lineTo(.12,ph-.02);ps.quadraticCurveTo(0,ph+.03,-.12,ph-.02);ps.lineTo(-pw/2,ph-.02);ps.lineTo(-pw/2,0);
  const hole=new T.Path();hole.moveTo(-ow/2,ob);hole.lineTo(ow/2,ob);hole.lineTo(ow/2,ot-.03);hole.quadraticCurveTo(ow/4,ot-.065,0,ot-.03);hole.quadraticCurveTo(-ow/4,ot-.065,-ow/2,ot-.03);hole.lineTo(-ow/2,ob);ps.holes.push(hole);
  P.add(flat(ps,red,0,.01));
  for(const sx of [-1,1]){const c=new T.Mesh(new T.BoxGeometry(.045,ot-ob,.014),gold);c.position.set(sx*(ow/2+.04),ob+(ot-ob)/2,.006);P.add(c);
    const cap=new T.Mesh(new T.BoxGeometry(.06,.012,.018),gold);cap.position.set(sx*(ow/2+.04),ot+.004,.006);P.add(cap)}
  const sw=new T.Mesh(new T.TorusGeometry(ow/4,.007,6,24,Math.PI),gold);sw.rotation.z=Math.PI;sw.scale.y=.32;sw.position.set(-ow/4,ot-.012,.012);P.add(sw);
  const sw2=sw.clone();sw2.position.x=ow/4;P.add(sw2);
  const plaque=new T.Mesh(new T.BoxGeometry(.2,.03,.01),plaqueM);plaque.position.set(0,ph-.03,.008);P.add(plaque);
  const lights=[];for(let k=0;k<9;k++){const f=new T.Mesh(new T.SphereGeometry(.009,10,8),flame);f.scale.y=1.5;f.position.set(-ow/2+.03+k*(ow-.06)/8,ob-.012,.03);P.add(f);lights.push(f)}
  const apron=new T.Mesh(new T.BoxGeometry(ow,.012,.03),M(T,0x5a2a14,{emissiveIntensity:.2}));apron.position.set(0,.006,.02);P.add(apron);
  // a coloured ribbon bookmark in the exhibit's own colour
  const rib=new T.Mesh(new T.BoxGeometry(.022,.002,.16),M(T,col,{emissiveIntensity:.45}));rib.position.set(W/2-.04,.004,D+.07);rib.rotation.y=.2;book.add(rib);
  g.rotation.y=-.55;
  let t=0;
  function tick(T_,dt){t+=dt||.016;
    rows.forEach((r,i)=>{const s=i%2?-1:1;r.position.x=s*.018*Math.sin(t*.9+i);r.position.y=.006*Math.sin(t*1.3+i*1.7)});
    ship.rotation.z=.16*Math.sin(t*1.1);ship.position.y=.075+.012*Math.sin(t*1.3+1.2);
    lights.forEach((f,i)=>{f.scale.y=1.4+.25*Math.sin(t*7+i*1.9)});}
  return {obj:g,mats,tick};
}
