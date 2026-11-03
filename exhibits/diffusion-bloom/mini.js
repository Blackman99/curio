// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Diffusion Bloom: points that cycle from gaussian noise into a flower curve and back
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.4,metalness:.4,roughness:.35},o));
export default function bloom(T,col){const g=new T.Group(),N=400,a=new Float32Array(N*3),noise=[],form=[];
  for(let i=0;i<N;i++){noise.push([(Math.random()-.5)*.9,(Math.random()-.5)*.9,(Math.random()-.5)*.9]);const th=i/N*Math.PI*2*3,r=.38*Math.abs(Math.cos(2.5*th/3*2))+.05,h=(i%7)/7*.06;form.push([Math.cos(th)*r,Math.sin(th)*r,h-.03])}
  const pg=new T.BufferGeometry();pg.setAttribute('position',new T.BufferAttribute(a,3));
  const set=s=>{s=s*s*(3-2*s);for(let i=0;i<N;i++)for(let k=0;k<3;k++)a[i*3+k]=noise[i][k]*(1-s)+form[i][k]*s;pg.attributes.position.needsUpdate=true};set(.85);
  g.add(new T.Points(pg,new T.PointsMaterial({color:col,size:.022})));
  const core=new T.Mesh(new T.SphereGeometry(.05,12,8),M(T,0xffe08a));g.add(core);
  return{obj:g,mats:[core.material],tick:t=>set(Math.min(1,Math.max(0,Math.sin(t*.8)*.8+.5)))}}
