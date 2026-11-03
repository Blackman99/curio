// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Lottery Scratchcards: three scratch cards, the front one half scratched and punched full of holes, a coin still on it
export default function scratchcards(T,col){const g=new T.Group(),mats=[],s=new T.Group();g.add(s);
  const R=(a=>()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296})(34);
  const paper=(hole,scr)=>{const c=document.createElement('canvas');c.width=512;c.height=320;const x=c.getContext('2d');x.fillStyle='#f4ecd6';x.fillRect(0,0,512,320);
   const b=x.createLinearGradient(0,0,512,0);b.addColorStop(0,'#c0240f');b.addColorStop(.6,'#ea6a1e');b.addColorStop(1,'#f3b926');x.fillStyle=b;x.fillRect(0,0,512,54);
   x.fillStyle='#fff3cf';x.font='700 38px Georgia,serif';x.textBaseline='middle';x.fillText('LUCKY SEED',18,29);
   const cs=11,ox=16,oy=66;for(let py=0;py<3;py++)for(let px=0;px<5;px++)for(let j=0;j<6;j++)for(let i=0;i<7;i++){const cx=ox+px*(7*cs+18)+i*cs+cs/2,cy=oy+py*(6*cs+14)+j*cs+cs/2,h=R()<hole;if(h){x.fillStyle='#0a0d0c';x.beginPath();x.arc(cx,cy,cs*.44,0,7);x.fill()}else if(px+py*.6<scr){x.fillStyle=R()<.5?'#d83218':'#1b35a8';x.beginPath();x.arc(cx,cy,1.5+R()*3.2,0,7);x.fill()}else{x.fillStyle='#a9acb2';x.fillRect(cx-cs/2,cy-cs/2,cs,cs)}}
   const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t};
  const edge=new T.MeshStandardMaterial({color:0x8a8478,roughness:.9}),geo=new T.BoxGeometry(.84,.008,.525);
  const card=(hole,scr,x,z,ry,y)=>{const top=new T.MeshStandardMaterial({map:paper(hole,scr),color:0x8a8478,roughness:.86,metalness:0}),m=new T.Mesh(geo,[edge,edge,top,edge,edge,edge]);m.position.set(x,y,z);m.rotation.y=ry;s.add(m);return m};
  card(.08,0,-.05,-.05,.17,-.012);card(.34,3.2,.05,-.02,-.11,-.003);card(.72,3.6,0,.03,.015,.006);
  const foil=new T.MeshStandardMaterial({color:0xb9bcc2,metalness:.9,roughness:.32,emissive:new T.Color(0x55575c),emissiveIntensity:.25});mats.push(foil);
  const pw=new T.Mesh(new T.BoxGeometry(.2,.003,.06),foil);pw.position.set(.285,.012,.255-.235+.17);pw.rotation.y=.015;s.add(pw);
  const coin=new T.Group(),cm=new T.MeshStandardMaterial({color:0xd8c79c,metalness:.95,roughness:.3,emissive:0x4c3f1f,emissiveIntensity:.3}),d=new T.Mesh(new T.CylinderGeometry(.075,.075,.012,36),cm);coin.add(d);
  const rim=new T.Mesh(new T.TorusGeometry(.066,.0035,6,36),cm);rim.rotation.x=Math.PI/2;rim.position.y=.006;coin.add(rim);coin.rotation.x=.42;coin.rotation.z=-.2;coin.position.set(.17,.05,.07);s.add(coin);
  s.rotation.set(.9,-.24,.05);s.position.set(0,-.16,.02);
  return{obj:g,mats,tick:(t)=>{coin.position.x=.17+Math.sin(t*2.4)*.07;coin.position.z=.07+Math.sin(t*4.8)*.018}}}
