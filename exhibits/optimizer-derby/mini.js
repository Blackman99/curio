// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Optimizer Derby: a tilted relief model of Rosenbrock's banana valley on a walnut plinth, four marbles (steel, brass, violet, red) rolling along the valley floor from a blue starting gate to a chequered flag
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.4,metalness:.4,roughness:.35},o));
export default function derby(T,col){const g=new T.Group(),mats=[],N=48,S=.7,geo=new T.PlaneGeometry(S,S,N,N);geo.rotateX(-Math.PI/2);
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
  return{obj:g,mats,tick:t=>upd(t)}}
