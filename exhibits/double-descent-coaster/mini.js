// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Double Descent Coaster: a little red coaster whose track is the default ride's real learning curve (log test error against log width): a slow dip, a needle at p = n, a long run-out; a teal car rides it while the bulbs chase
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.4,metalness:.4,roughness:.35},o));
export default function coaster(T,col){const g=new T.Group(),mats=[],P=[[0,35],[11,34],[18,34],[22,34],[29,31],[33,27],[38,24],[41,19],[43,9],[45,16],[47,13],[49,16],[50,32],[50.5,54],[51,100],[52,65],[52.5,73],[53,69],[55,53],[56,49],[57,51],[59,27],[62,24],[65,13],[67,9],[73,8],[78,5],[84,4],[89,2],[95,2],[100,0]];
  const base=new T.Mesh(new T.BoxGeometry(.94,.03,.26),M(T,0x241a2e,{emissiveIntensity:.05,metalness:.2,roughness:.7}));base.position.y=-.16;g.add(base);
  const B=-.145,cv=new T.CatmullRomCurve3(P.map(([x,h])=>new T.Vector3(-.42+x*.0084,-.085+h*.0022,0)),false,'centripetal');
  const red=M(T,0xe0453a,{emissiveIntensity:.15,metalness:.4,roughness:.4}),post=M(T,0xcfc2dd,{emissiveIntensity:.05,metalness:.3,roughness:.5});
  for(const z of[-.028,.028]){const t=new T.Mesh(new T.TubeGeometry(cv,320,.0055,6,false),red);t.position.z=z;g.add(t)}
  for(let i=0;i<=26;i++){const x=-.41+i*.0315,u=(()=>{let a=0,b=1;for(let k=0;k<30;k++){const m=(a+b)/2;if(cv.getPointAt(m).x<x)a=m;else b=m}return a})(),y=cv.getPointAt(u).y-B;
   const c=new T.Mesh(new T.CylinderGeometry(.0035,.0035,y,5),post);c.position.set(x,B+y/2,0);g.add(c)}
  const bulbs=[];for(let i=0;i<22;i++){const m=M(T,0xffd27a,{emissive:new T.Color(0xffc060).multiplyScalar(.6),emissiveIntensity:.3,metalness:0,roughness:.4});mats.push(m);
   const b=new T.Mesh(new T.SphereGeometry(.007,8,6),m),p=cv.getPointAt(i/21);b.position.set(p.x,p.y+.002,.04);g.add(b);bulbs.push(m)}
  const teal=M(T,0x1fb6a8,{emissive:new T.Color(col).multiplyScalar(.5),emissiveIntensity:.35,metalness:.3,roughness:.4});mats.push(teal);
  const car=new T.Group(),body=new T.Mesh(new T.BoxGeometry(.075,.03,.085),teal);body.position.y=.022;car.add(body);
  for(const z of[-.02,.02]){const head=new T.Mesh(new T.SphereGeometry(.011,8,6),M(T,0xf2c7a0,{emissiveIntensity:.1,metalness:0}));head.position.set(-.008,.048,z);car.add(head)}g.add(car);
  const upd=t=>{const u=(t*.09)%1,p=cv.getPointAt(u),d=cv.getTangentAt(u);car.position.copy(p);car.rotation.set(0,0,Math.atan2(d.y,d.x));
   bulbs.forEach((m,i)=>{const w=.5+.5*Math.sin(t*5-i*.9);m.emissiveIntensity=.15+.9*w*w})};
  upd(5.6);g.position.y=.02;g.rotation.set(.22,-.32,0);
  return{obj:g,mats,tick:(t)=>upd(t)}}
