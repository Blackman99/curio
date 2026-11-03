// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Lumen Landing: a dark browser pane; prism-coloured particles morph through the page's four engine stages: Lumen glyph, sphere, (2,3) knot, galaxy
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.4,metalness:.4,roughness:.35},o));
export default function lumen(T,col){const g=new T.Group(),mats=[],pane=M(T,0x0b0b10,{metalness:.3,roughness:.4,emissiveIntensity:.2,transparent:true}),bar=M(T,col,{metalness:.3,roughness:.5,emissiveIntensity:.45,transparent:true});mats.push(pane,bar);
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
  return{obj:g,mats,tick:t=>upd(t)}}
