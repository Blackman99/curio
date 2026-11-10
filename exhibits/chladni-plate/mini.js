// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Chladni Plate: a dark glass plate on a brass post, tipped toward you, with sand gathered on Ritz's u2v6 − u6v2 figure (the real mode shape, from beam functions) and a violin bow at its edge
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.25,metalness:.6,roughness:.4},o));
export default function chladniPlate(T,col){const root=new T.Group(),g=new T.Group(),mats=[];root.add(g);
  g.rotation.x=.6;g.position.set(0,.08,-.02);
  // the figure: phi = sum c_mn u_m(x) u_n(y) for the page's mode at 2,371 Hz (coefficients from the page's engine, antisymmetric under x<->y)
  const K=[0,0,2.36502,3.926602,5.497804,7.068583,8.63938,10.210176,11.780972];
  const u=(m,x)=>{if(m===0)return Math.SQRT1_2;const k=K[m],q=Math.cos(k)/Math.cosh(k);return(Math.cos(k*x)+Math.cos(k)*Math.cosh(k*x)/Math.cosh(k))/Math.sqrt(1+q*q)};
  const C=[[0,4,-.0063],[0,6,.056],[0,8,.0068],[2,4,-.0242],[2,6,.6988],[2,8,.0104],[4,6,.0876],[4,8,.0041],[6,8,-.0034]];
  const R=200,cv=document.createElement('canvas');cv.width=cv.height=R;const x=cv.getContext('2d'),im=x.createImageData(R,R),phi=new Float32Array(R*R);let mx=0;
  const U=[];for(let m=0;m<=8;m+=2){const a=new Float32Array(R);for(let i=0;i<R;i++)a[i]=u(m,-1+2*(i+.5)/R);U[m]=a}
  for(let j=0;j<R;j++)for(let i=0;i<R;i++){let s=0;for(const [a,b,c] of C)s+=c*(U[a][i]*U[b][j]-U[b][i]*U[a][j]);phi[j*R+i]=s;mx=Math.max(mx,Math.abs(s))}
  let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
  for(let p=0;p<R*R;p++){const v=Math.abs(phi[p])/mx,a=Math.min(1,Math.exp(-((v/.055)**2))*(.75+.5*rnd())+(rnd()<.004?.6:0));im.data[4*p]=242;im.data[4*p+1]=230;im.data[4*p+2]=206;im.data[4*p+3]=Math.round(255*a)}
  x.putImageData(im,0,0);const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;
  // the glass: a thin dark slab with a green polished edge
  const S=.64,glass=new T.Mesh(new T.BoxGeometry(S,.012,S),[M(T,0x2c5a50,{emissiveIntensity:.15,metalness:.2,roughness:.2}),M(T,0x2c5a50,{emissiveIntensity:.15,metalness:.2,roughness:.2}),
    new T.MeshStandardMaterial({color:0x0d1316,metalness:.35,roughness:.12}),M(T,0x0b0f12,{emissiveIntensity:0,metalness:.2,roughness:.3}),
    M(T,0x2c5a50,{emissiveIntensity:.15,metalness:.2,roughness:.2}),M(T,0x2c5a50,{emissiveIntensity:.15,metalness:.2,roughness:.2})]);g.add(glass);
  // the sand: a transparent layer just above the glass; it is what lights up on hover
  const sm=new T.MeshStandardMaterial({color:0x8a8478,map:tex,transparent:true,alphaTest:.04,emissive:new T.Color(col).lerp(new T.Color(0xf2e6ce),.7).multiplyScalar(.5),emissiveMap:tex,emissiveIntensity:.08,roughness:.95,metalness:0,depthWrite:false});
  const sand=new T.Mesh(new T.PlaneGeometry(S*.985,S*.985),sm);sand.rotation.x=-Math.PI/2;sand.position.y=.0068;g.add(sand);mats.push(sm);
  // a few grains that went over the edge, on the base
  // the brass post and a dark wooden foot
  const brass=M(T,0xb08a3c,{emissiveIntensity:.12,metalness:.85,roughness:.32}),wood=M(T,0x2e1d12,{emissiveIntensity:.05,metalness:0,roughness:.8});
  const post=new T.Mesh(new T.CylinderGeometry(.022,.026,.36,20),brass);post.position.set(0,-.17,0);root.add(post);
  const knob=new T.Mesh(new T.CylinderGeometry(.04,.04,.03,24),brass);knob.position.set(0,.06,-.01);knob.rotation.x=.6;root.add(knob);
  const foot=new T.Mesh(new T.CylinderGeometry(.2,.23,.05,40),wood);foot.position.y=-.36;root.add(foot);
  const ring=new T.Mesh(new T.TorusGeometry(.205,.006,8,48),brass);ring.rotation.x=Math.PI/2;ring.position.y=-.335;root.add(ring);
  // the bow, resting its hair on the right-hand edge
  const bow=new T.Group(),stick=new T.Mesh(new T.CylinderGeometry(.006,.008,.78,10),M(T,0x5a2412,{emissiveIntensity:.12,metalness:.1,roughness:.45}));
  const hair=new T.Mesh(new T.BoxGeometry(.012,.74,.003),M(T,0xf2ead8,{emissiveIntensity:.3,metalness:0,roughness:.7}));hair.position.x=-.022;
  const frog=new T.Mesh(new T.BoxGeometry(.03,.07,.022),M(T,0x111111,{emissiveIntensity:0,metalness:.3,roughness:.4}));frog.position.set(-.012,-.33,0);
  const tip=new T.Mesh(new T.BoxGeometry(.03,.025,.012),M(T,0xeee6d6,{emissiveIntensity:.2,metalness:0,roughness:.5}));tip.position.set(-.012,.385,0);
  bow.add(stick,hair,frog,tip);const arm=new T.Group();arm.add(bow);arm.position.set(S/2+.012,.01,.12);arm.rotation.set(0,0,-.5);g.add(arm);bow.position.y=.26;
  return{obj:root,mats,tick:(t)=>{bow.position.y=.26+Math.sin(t*2.1)*.035;sm.emissiveIntensity=.08+.04*Math.sin(t*9)}}}
