// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Snowflake Net: a paper sheet folding in half along a crease, with a red cut line, then unfolding
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.4,metalness:.4,roughness:.35},o));
export default function fold(T,col){const g=new T.Group(),pm=M(T,col,{emissiveIntensity:.15,metalness:0,roughness:.9,side:T.DoubleSide});
  const a=new T.Mesh(new T.PlaneGeometry(.35,.6),pm);a.position.x=-.175;g.add(a);
  const hinge=new T.Group();const b=new T.Mesh(new T.PlaneGeometry(.35,.6),pm);b.position.x=.175;hinge.add(b);g.add(hinge);
  const cut=new T.Mesh(new T.BoxGeometry(.012,.5,.012),M(T,0xc8321e,{emissiveIntensity:.8}));cut.position.set(-.14,0,.01);cut.rotation.z=.5;g.add(cut);
  const hole=new T.Mesh(new T.CircleGeometry(.07,6),new T.MeshBasicMaterial({color:0x1d1a16,side:T.DoubleSide}));hole.position.set(.17,.1,.002);hinge.add(hole);
  const h2=hole.clone();h2.position.set(-.17,.1,.002);g.add(h2);
  const upd=t=>{hinge.rotation.y=-(Math.sin(t*.9)*.5+.5)*Math.PI*.92};upd(0);g.rotation.y=.4;
  return{obj:g,mats:[pm],tick:t=>upd(t)}}
