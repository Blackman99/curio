// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Latent Quicksilver: chrome blob whose vertices are displaced by a few random Fourier features
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.4,metalness:.4,roughness:.35},o));
export default function quicksilver(T,col){const geo=new T.IcosahedronGeometry(.32,4),base=geo.attributes.position.array.slice(),F=[];for(let i=0;i<5;i++)F.push([Math.random()*6-3,Math.random()*6-3,Math.random()*6-3,Math.random()*6]);
  const m=M(T,col,{metalness:1,roughness:.08,emissiveIntensity:.15}),me=new T.Mesh(geo,m);const p=geo.attributes.position.array;
  const upd=t=>{for(let i=0;i<p.length;i+=3){const x=base[i],y=base[i+1],z=base[i+2];let f=0;for(const[a,b,c,ph]of F)f+=Math.sin(a*x+b*y+c*z+ph+t);const s=1+f*.07;p[i]=x*s;p[i+1]=y*s;p[i+2]=z*s}geo.attributes.position.needsUpdate=true;geo.computeVertexNormals()};upd(0);
  return{obj:me,mats:[m],tick:t=>upd(t*1.2)}}
