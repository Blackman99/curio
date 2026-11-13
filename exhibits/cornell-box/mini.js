// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Cornell Box: the measured box (Cornell's own corner coordinates, scaled), open toward you, red wall left, green right, lamp in the ceiling, the two blocks tinted by the walls beside them, and a few light paths tracing through it
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.25,metalness:.6,roughness:.4},o));
export default function cornellBox(T,col){const root=new T.Group(),g=new T.Group(),mats=[];root.add(g);
  g.rotation.x=0;g.position.set(0,-.42,0);
  const s=.46/556,P=(x,y,z)=>[(278-x)*s,y*s,(280-z)*s];          // Cornell mm -> hall units, open side toward +z
  const quad=(q,mat,tint)=>{const v=[],c=[];const a=q.map(p=>P(...p));for(const i of[0,1,2,0,2,3]){v.push(...a[i]);c.push(...(tint||[1,1,1]))}
    const G=new T.BufferGeometry();G.setAttribute('position',new T.Float32BufferAttribute(v,3));G.setAttribute('color',new T.Float32BufferAttribute(c,3));G.computeVertexNormals();
    const m=new T.Mesh(G,mat);g.add(m);return m};
  const matte=(c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,metalness:0,roughness:.9,side:T.DoubleSide,vertexColors:true},o));
  const up=matte(0x8a8478),back=matte(0xd8d4cc,{emissive:0xd8d4cc,emissiveIntensity:.25}),red=matte(0xc8323c,{emissive:0xc8323c,emissiveIntensity:.3}),green=matte(0x2fae5c,{emissive:0x2fae5c,emissiveIntensity:.3});
  const ceil=matte(0x6e6a62);
  quad([[552.8,0,0],[0,0,0],[0,0,559.2],[549.6,0,559.2]],up);                       // floor
  quad([[556,548.8,0],[556,548.8,559.2],[0,548.8,559.2],[0,548.8,0]],ceil);           // ceiling
  quad([[549.6,0,559.2],[0,0,559.2],[0,548.8,559.2],[556,548.8,559.2]],back);         // back wall
  quad([[0,0,559.2],[0,0,0],[0,548.8,0],[0,548.8,559.2]],green);                      // right wall (green)
  quad([[552.8,0,0],[549.6,0,559.2],[556,548.8,559.2],[556,548.8,0]],red);            // left wall (red)
  // blocks: Cornell's corner coordinates; faces that look at a coloured wall carry its tint (the colour bleeding the page computes)
  const white=matte(0xe8e4dc,{emissive:0xe8e4dc,emissiveIntensity:.18});
  const block=(top,h,tint)=>{quad(top.map(p=>[p[0],h,p[1]]),new T.MeshStandardMaterial({color:0x9a968e,metalness:0,roughness:.9,side:T.DoubleSide,vertexColors:true}));
    for(let i=0;i<4;i++){const a=top[i],b=top[(i+1)%4],nx=-(b[1]-a[1])/Math.hypot(b[0]-a[0],b[1]-a[1]);const t=nx>.7?tint.red:nx<-.7?tint.green:null;quad([[a[0],0,a[1]],[a[0],h,a[1]],[b[0],h,b[1]],[b[0],0,b[1]]],white,t)}};
  block([[130,65],[82,225],[240,272],[290,114]],165,{red:null,green:[.62,1,.7]});
  block([[423,247],[265,296],[314,456],[472,406]],330,{red:[1,.66,.68],green:null});
  // the lamp, just under the ceiling
  const lm=M(T,0xfff2d8,{emissiveIntensity:1.6,metalness:0,roughness:.6});mats.push(lm);
  const lamp=new T.Mesh(new T.PlaneGeometry(130*s,105*s),lm);lamp.rotation.x=Math.PI/2;const lc=P(278,547,279.5);lamp.position.set(...lc);g.add(lamp);
  // a few light paths: camera -> surfaces -> lamp (drawn growing, then fading)
  const paths=[[[300,255,0],[455,180,296],[556,420,180],[278,548.7,280]],[[250,240,0],[90,0,330],[0,300,420],[200,548.7,300]],[[280,262,0],[278,320,559.2],[120,0,250],[300,548.7,250]]];
  const lines=paths.map((p,i)=>{const G=new T.BufferGeometry().setFromPoints(p.map(q=>new T.Vector3(...P(...q))));const L=new T.Line(G,new T.LineBasicMaterial({color:0xffe6b0,transparent:true,opacity:.85}));g.add(L);return L});
  let t=0;
  return{obj:root,mats,tick:(T_,dt)=>{t+=dt||1/60;lines.forEach((L,i)=>{const ph=((t*.45+i/3)%1);L.geometry.setDrawRange(0,Math.max(2,Math.min(4,1+Math.floor(ph*5))));L.material.opacity=ph<.8?.85:.85*(1-(ph-.8)/.2)})}}}
