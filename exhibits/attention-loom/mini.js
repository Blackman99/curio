// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Attention Loom: word-token tiles on a bar, curved red threads between them, a shuttle running along one thread
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.4,metalness:.4,roughness:.35},o));
export default function loom(T,col){const g=new T.Group(),mats=[],tok=M(T,0xefe4cc,{emissiveIntensity:.15,metalness:.1}),red=M(T,col);mats.push(red);
  const n=5,xs=[];for(let i=0;i<n;i++){const x=-.4+i*.2;xs.push(x);const b=new T.Mesh(new T.BoxGeometry(.15,.09,.04),tok);b.position.set(x,-.3,0);g.add(b)}
  const pairs=[[0,2],[0,4],[1,3],[2,4],[1,4],[3,0]],th=[];
  pairs.forEach(([a,b],k)=>{const h=.18+Math.abs(a-b)*.12;const c=new T.QuadraticBezierCurve3(new T.Vector3(xs[a],-.25,0),new T.Vector3((xs[a]+xs[b])/2,-.25+h*1.6,(k%2?.08:-.08)),new T.Vector3(xs[b],-.25,0));
   const m=new T.Mesh(new T.TubeGeometry(c,24,.008+.006*(k%3),5,false),red);g.add(m);th.push(c)});
  const sh=new T.Mesh(new T.CapsuleGeometry(.03,.09,4,8),M(T,0xc9963f,{metalness:.9,emissiveIntensity:.2}));sh.rotation.z=Math.PI/2;g.add(sh);
  const put=s=>{const c=th[Math.floor(s)%th.length],u=s%1;sh.position.copy(c.getPoint(u))};put(1.5);
  return{obj:g,mats,tick:T=>{put(T*.6)}}}
