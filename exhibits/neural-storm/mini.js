// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Neural Storm: 3-4-3 MLP node lattice with edges, a small particle swarm swirling through it
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.4,metalness:.4,roughness:.35},o));
export default function mlp(T,col){const g=new T.Group(),mats=[],nm=M(T,col);mats.push(nm);const L=[3,4,3],P=[];
  L.forEach((n,l)=>{for(let i=0;i<n;i++){const p=new T.Vector3(-.35+l*.35,(i-(n-1)/2)*.2,0);P.push([l,p]);const s=new T.Mesh(new T.SphereGeometry(.04,10,8),nm);s.position.copy(p);g.add(s)}});
  const e=[];P.forEach(([la,a])=>P.forEach(([lb,b])=>{if(lb===la+1)e.push(a.x,a.y,a.z,b.x,b.y,b.z)}));
  const eg=new T.BufferGeometry();eg.setAttribute('position',new T.Float32BufferAttribute(e,3));g.add(new T.LineSegments(eg,new T.LineBasicMaterial({color:col,transparent:true,opacity:.45})));
  const N=220,pa=new Float32Array(N*3),seed=[];for(let i=0;i<N;i++)seed.push([Math.random()*6.28,.15+Math.random()*.3,(Math.random()-.5)*.6]);
  const pg=new T.BufferGeometry();pg.setAttribute('position',new T.BufferAttribute(pa,3));
  const upd=t=>{for(let i=0;i<N;i++){const[a,r,y]=seed[i],k=a+t*(.6+r);pa[i*3]=Math.cos(k)*r*1.3;pa[i*3+1]=y+Math.sin(k*2+y*5)*.06;pa[i*3+2]=Math.sin(k)*r*.8}pg.attributes.position.needsUpdate=true};upd(0);
  g.add(new T.Points(pg,new T.PointsMaterial({color:0xbff6ff,size:.018,transparent:true,opacity:.9})));return{obj:g,mats,tick:t=>upd(t)}}
