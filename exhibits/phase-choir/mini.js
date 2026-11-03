// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Phase Choir: 6x6 grid of oscillator pins; phases relax toward sync as a travelling wave
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.4,metalness:.4,roughness:.35},o));
export default function choir(T,col){const g=new T.Group(),n=6,c=new T.Color(col),inst=new T.InstancedMesh(new T.BoxGeometry(.07,.07,.07),M(T,0xffffff,{emissiveIntensity:.5}),n*n),d=new T.Object3D(),ph=[];
  for(let i=0;i<n*n;i++)ph.push(Math.random()*6.28);
  const upd=t=>{for(let i=0;i<n;i++)for(let j=0;j<n;j++){const k=i*n+j,syn=.5+.5*Math.sin(t*.3),p=ph[k]*(1-syn)+(i+j)*.5*syn+t*2;
   d.position.set((i-2.5)*.14,Math.sin(p)*.12,(j-2.5)*.14);d.scale.setScalar(.7+.4*(Math.sin(p)*.5+.5));d.updateMatrix();inst.setMatrixAt(k,d.matrix);inst.setColorAt(k,c.clone().offsetHSL(Math.sin(p)*.08,0,Math.sin(p)*.15))}
   inst.instanceMatrix.needsUpdate=true;inst.instanceColor.needsUpdate=true};upd(2);g.add(inst);g.rotation.x=.5;
  return{obj:g,mats:[inst.material],tick:t=>upd(t)}}
