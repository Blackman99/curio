// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Scaling Observatory: a walnut plinth with a small silver-domed observatory whose brass telescope pokes out of the open slit, and a log-log sky plate in front, banded by the loss Chinchilla's law predicts; a glowing slit (one compute budget) sweeps across it and a reticle rides the compute-optimal line
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.4,metalness:.4,roughness:.35},o));
export default function observatory(T,col){const g=new T.Group(),mats=[];
  const base=new T.Mesh(new T.CylinderGeometry(.44,.45,.06,48),M(T,0x2e1c12,{emissiveIntensity:.04,metalness:.1,roughness:.6}));base.position.y=-.03;g.add(base);
  const trim=new T.Mesh(new T.TorusGeometry(.446,.008,6,72),M(T,0xc8a050,{metalness:.9,roughness:.3,emissiveIntensity:.1}));trim.rotation.x=Math.PI/2;trim.position.y=-.004;g.add(trim);
  // the plate: 10^7.5..10^12.5 parameters across, 10^8.2..10^13.7 tokens up, each pixel the band of its predicted loss (the law re-fitted to Chinchilla's runs)
  const Z=128,c=document.createElement('canvas');c.width=c.height=Z;const x=c.getContext('2d'),im=x.createImageData(Z,Z),LV=[4,3.5,3.1,2.8,2.6,2.45,2.33,2.24,2.17,2.11,2.06,2.02,1.98,1.95,1.92,1.89,1.86,1.83],
   P=[[0,[13,18,51]],[.3,[28,36,98]],[.5,[50,46,118]],[.66,[84,56,126]],[.79,[128,72,120]],[.89,[180,104,106]],[.955,[224,150,98]],[1,[250,208,130]]],
   pal=t=>{for(let i=1;i<P.length;i++)if(t<=P[i][0]){const f=(t-P[i-1][0])/(P[i][0]-P[i-1][0]);return P[i].slice(1)[0].map((v,j)=>P[i-1][1][j]+(v-P[i-1][1][j])*f)}return P[7][1]};
  for(let j=0;j<Z;j++)for(let i=0;i<Z;i++){const n=7.5+5*i/(Z-1),d=13.7-5.5*j/(Z-1),L=1.8171+477.5*Math.pow(10,-.3473*n)+2141*Math.pow(10,-.3671*d);let lv=null;for(const v of LV)if(L<=v)lv=v;
   const cc=lv==null?[8,11,30]:pal(Math.pow((4-lv)/2.2,1.15)),o=(j*Z+i)*4;im.data[o]=cc[0];im.data[o+1]=cc[1];im.data[o+2]=cc[2];im.data[o+3]=255}
  x.putImageData(im,0,0);x.fillStyle='#fff3d6';for(const[n,d]of[[10.85,12.15],[11.45,11.48],[11.24,11.48],[11.72,11.43],[9.9,13.18]]){x.beginPath();x.arc((n-7.5)/5*(Z-1),(13.7-d)/5.5*(Z-1),1.8,0,7);x.fill()}
  const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const S=.46,PX=.08,PZ=.1;
  const plate=new T.Mesh(new T.PlaneGeometry(S,S),new T.MeshStandardMaterial({map:tex,emissiveMap:tex,emissive:0xffffff,emissiveIntensity:.3,roughness:.8}));plate.rotation.x=-Math.PI/2;plate.position.set(PX,.012,PZ);g.add(plate);
  const rim=new T.Mesh(new T.BoxGeometry(S+.026,.014,S+.026),M(T,col,{emissiveIntensity:.08,metalness:.5,roughness:.4}));rim.position.set(PX,.004,PZ);g.add(rim);
  // the slit and the reticle: plate coordinates from decades
  const pt=(n,d)=>new T.Vector3(PX+((n-7.5)/5-.5)*S,.016,PZ-((d-8.2)/5.5-.5)*S);
  const sm=M(T,0xffd9a0,{emissive:new T.Color(0xffc878).multiplyScalar(.32),emissiveIntensity:.8,transparent:true,opacity:.42,metalness:0,roughness:.5}),
   rm=M(T,0xffd98a,{emissive:new T.Color(0xffd98a).multiplyScalar(.6),emissiveIntensity:.9,metalness:.3});mats.push(sm,rm);
  const slit=new T.Mesh(new T.BoxGeometry(1,.004,.03),sm);g.add(slit);const ret=new T.Mesh(new T.TorusGeometry(.022,.005,6,24),rm);ret.rotation.x=Math.PI/2;g.add(ret);
  const cr=new T.Mesh(new T.BoxGeometry(.06,.004,.005),rm);g.add(cr);
  // the observatory: a stone drum, a silver dome with its slit open toward the plate, a brass telescope poking out
  const OX=-.25,OZ=-.22,drum=new T.Mesh(new T.CylinderGeometry(.12,.125,.08,32),M(T,0xd8cdb6,{emissiveIntensity:.06,metalness:.05,roughness:.8}));drum.position.set(OX,.04,OZ);g.add(drum);
  const face=Math.atan2(PX-OX,PZ-OZ),dome=new T.Mesh(new T.SphereGeometry(.12,32,12,face+.26-Math.PI/2+Math.PI,2*Math.PI-.52,0,Math.PI/2),M(T,0xdfe4ec,{emissiveIntensity:.08,metalness:.6,roughness:.3,side:T.DoubleSide}));
  dome.position.set(OX,.08,OZ);g.add(dome);
  const tel=new T.Group();tel.position.set(OX,.1,OZ);g.add(tel);const tube=new T.Mesh(new T.CylinderGeometry(.015,.019,.2,16),M(T,0xc8923f,{metalness:.9,roughness:.28,emissiveIntensity:.12}));tube.position.y=.06;tel.add(tube);
  const lens=new T.Mesh(new T.CircleGeometry(.015,16),M(T,0x9fd2ff,{emissive:new T.Color(0x9fd2ff).multiplyScalar(.5),emissiveIntensity:.8,metalness:0}));lens.position.y=.161;lens.rotation.x=-Math.PI/2;tel.add(lens);mats.push(lens.material);
  // the slit for C = 6·10^k: n + d = k; its floor on the re-fitted law at n* = log10 G + k·β/(α+β)
  const upd=t=>{const k=22.99+1.25*Math.sin(t*.5),ns=-.9457+.5138*k,ps=[];for(let i=0;i<=40;i++){const n=7.5+5*i/40,d=k-n;if(d>=8.2&&d<=13.7)ps.push(pt(n,d))}
   if(ps.length>1){const a=ps[0],b=ps[ps.length-1];slit.position.copy(a).add(b).multiplyScalar(.5);slit.scale.x=a.distanceTo(b);slit.rotation.y=-Math.atan2(b.z-a.z,b.x-a.x)}
   const r=pt(ns,k-ns);ret.position.copy(r);ret.position.y=.02;cr.position.copy(ret.position);cr.rotation.y=slit.rotation.y+Math.PI/2;
   tel.rotation.set(Math.PI/2-.6,Math.atan2(r.x-OX,r.z-OZ),0,'YXZ')};
  upd(0);g.rotation.x=.42;g.position.y=-.04;
  return{obj:g,mats,tick:t=>upd(t)}}
