// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Photocopy Collapse: a beige copier with a green scan bar; its copies fan out on the table, many kinds of butterfly on the first sheet, one kind on the last
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.4,metalness:.4,roughness:.35},o));
export default function copier(T,col){const g=new T.Group(),mats=[],body=M(T,0xe9dfca,{metalness:.1,roughness:.7,emissiveIntensity:.1}),dark=M(T,0x35322e,{metalness:.35,roughness:.45,emissiveIntensity:.04}),paper=M(T,0xf8f6ef,{metalness:0,roughness:.9,emissiveIntensity:.16}),scan=M(T,col,{metalness:0,roughness:.35,emissiveIntensity:.95}),led=M(T,0xff5a3c,{metalness:0,roughness:.5,emissiveIntensity:.8});mats.push(scan,led);
  const box=(w,h,d,m,x,y,z)=>{const b=new T.Mesh(new T.BoxGeometry(w,h,d),m);b.position.set(x,y,z);g.add(b);return b};
  box(.7,.22,.36,body,0,.08,-.16);box(.66,.04,.34,dark,0,.21,-.16);box(.7,.035,.36,M(T,0xc9bc9f,{metalness:.1,roughness:.8,emissiveIntensity:.05}),0,-.015,-.16);
  box(.44,.05,.006,M(T,0x10201a,{metalness:.6,roughness:.2,emissiveIntensity:.05}),-.1,.125,.022);const bar=box(.035,.044,.01,scan,0,.125,.026);
  box(.15,.09,.006,dark,.24,.11,.022);box(.07,.03,.006,led,.22,.125,.027);const btn=new T.Mesh(new T.SphereGeometry(.016,10,8),M(T,0x2f9c58,{metalness:.2,roughness:.4,emissiveIntensity:.3}));btn.position.set(.28,.125,.03);g.add(btn);
  box(.62,.012,.02,M(T,0x1d1b18,{metalness:.2,roughness:.7,emissiveIntensity:0}),0,.015,.03);
  const wing=new T.CircleGeometry(.019,10),bm={},bmat=c=>bm[c]||(bm[c]=M(T,c,{metalness:0,roughness:.6,emissiveIntensity:.25}));
  const print=(s,ks,n,cols,dx,dy)=>{for(let i=0;i<n;i++){const c=ks[(i+Math.floor(i/3))%ks.length],x=(i%cols-(cols-1)/2)*dx,y=dy*((Math.floor(n/cols)-1)/2-Math.floor(i/cols));
    for(const sx of[-1,1]){const w=new T.Mesh(wing,bmat(c));w.position.set(x+sx*.015,y,.002);w.scale.set(1,.72,1);w.rotation.z=sx*.5;s.add(w)}
    const bd=new T.Mesh(new T.PlaneGeometry(.005,.03),dark);bd.position.set(x,y,.003);s.add(bd)}};
  // the copies, fanned on the table: fewer kinds each time
  const KINDS=[[0xe8892b,0xe3cc40,0xeeeae0,0x2f7bd8,0xb5342a,0x99cf84,0x2c2823],[0xe8892b,0xe3cc40,0xeeeae0,0xe8892b,0x2f7bd8],[0xe8892b,0xe3cc40,0xe8892b],[0xe8892b]];
  KINDS.forEach((ks,k)=>{const s=new T.Group();s.position.set(-.25+k*.13,-.03+k*.004,.24-k*.012);s.rotation.set(-Math.PI/2,0,.22-k*.12);g.add(s);
   s.add(new T.Mesh(new T.PlaneGeometry(.26,.34),paper));print(s,ks,12,3,.08,.075)});
  // the newest copy slides out of the slot
  const op=new T.Mesh(new T.PlaneGeometry(.3,.2),paper);op.rotation.x=-1.15;op.position.set(0,-.005,.08);g.add(op);print(op,[0xe8892b],6,3,.09,.07);
  const upd=t=>{const u=(t*.45)%1;bar.position.x=-.3+.4*(u<.8?u/.8:1-(u-.8)/.2);scan.emissiveIntensity=.75+.25*Math.sin(t*6);op.position.z=.08+.025*Math.sin(t*.9)};
  upd(.6);g.rotation.y=-.3;g.rotation.x=.2;
  return{obj:g,mats,tick:t=>upd(t)}}
