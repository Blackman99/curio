// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Pendulum Atlas: a walnut board tipped toward you with a small plate of the atlas (40 x 40, from the page's double-precision map) and two double pendulums, brass in double precision and a pale ghost rounded to single precision after every step: they swing together, then part
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.25,metalness:.6,roughness:.4},o));
export default function pendulumAtlas(T,col){const root=new T.Group(),g=new T.Group(),mats=[];root.add(g);
  g.rotation.x=.6;g.position.set(0,-.2,0);g.scale.setScalar(.9);
  const wood=M(T,0x6a3f22,{emissive:0x1e0f06,emissiveIntensity:.3,metalness:0,roughness:.8}),dark=M(T,0x3a2414,{emissive:0x100804,emissiveIntensity:.3,metalness:0,roughness:.85}),
    brass=M(T,0xd8a850,{emissive:0x5a3c10,emissiveIntensity:.35,metalness:.9,roughness:.28}),ghost=M(T,0x9ccfff,{emissive:0x3a6a9a,emissiveIntensity:.5,metalness:.2,roughness:.3,transparent:true,opacity:.7});
  mats.push(brass,ghost);
  const box=(w,h,d,m,x,y,z)=>{const b=new T.Mesh(new T.BoxGeometry(w,h,d),m);b.position.set(x,y,z);g.add(b);return b};
  // board lying flat (y up), long side across; the group tips it toward the visitor
  box(.88,.035,.6,wood,0,-.02,0);box(.9,.02,.62,dark,0,-.045,0);
  // the atlas plate
  const MAP='bbbaaaaaaaaaaaaaaaawwccddcbcccbbaaaaaaaabbbbaaaaaaaaaaaaaacffdcccbccccbbbbaaaaaabbbbbaaaaaaaaaaaadwffddccbbbbbcbbcbaaababbbbbaaaaaaaaaaacwffffcccbbccbbcbcbbbbbaabbbbaaaaaaaaacccffffffccecdcccbbbbbbbbaabbbbabaaaaaacccwffffffdwdccccccccbbbbbaabbbcbabaaaccbccffffffffdcdeccccbbbbbbbaabbbbbaabbbaaawwffffffffwewdcccbbbbbbbbaaabbbbbaaaaaabwffffffffffdewcccbbbbcbbbaaabbbbbaaaaabcwffffffffffecccccbbbbcbbbbaabbbbbbaabbbcffffffffffffwecccccccbbbbbaabbbbbbbbbcdwffffffffffffwdccccdcbcabbbaabbbbcbbccccwffffffffffffwwwcwwdbcbabbbaabbbbbbbbbbeffffffffffffffwwwwwcccaabbaabbbbbbbbbbbdffffffffffffffwwwweccbaabcaabbbcccbbbbbwffffffffffffffwwecccbaaabbaabbbccbbbccbfffffffffffffffwddccbaaabbcaabbccbbbbbbeffffffffffffffffcdcbaaaabbbabbccbbbbbbbbffffffffffffffffccbaaaabbcbbbbbcbbaaaabbffffffffffffffffdbaaaaabbbcccccbbaaaaabdffffffffffffffffbbaaaabbcbbbbbcbbaaaabccffffffffffffffffbbbbbbbbccbbabbbaaaabccwffffffffffffffffdbbbbbbccbbaacbbaaacccddfffffffffffffffwbccbbbccbbbaabbaaabcccewwffffffffffffffdbbbbbcccbbbaacbaabccewwwwffffffffffffffcbbbbbbbbbbbaabbaacccwwwwwffffffffffffffebbbbbbbbbbaabbbabcbdwwewwwffffffffffffwccccbbcbbbbaabbbacbccccccewffffffffffffwccbbbbbbbbbaabbbbbcccccccdwffffffffffffcbbbaabbbbbcaabbbbcbbbbcccdceffffffffffwcbaaaaabbbbcaaabbbcbbbbcccwedffffffffffwbaaaaaabbbbbaaabbbbbbbbcccdwewffffffffwdaaabbbaacbbbbaabbbbbbbcccccdcdffffffffccbbcaaababcbbbaabbbbbccccccccdwdffffffwcccaaaaaababbbbaabbbbbbbbccccceccffffffcccaaaaaaaaabbbbaabbbbbcbcbbccbbccdffffwcaaaaaaaaaaabbbbbabaaabcbbcbbbbbccwdffwdaaaaaaaaaaaabbbbbaaaaaabbbbccccbcccdffcaaaaaaaaaaaaaabbbbaaaaaaaabbcccbcddccwwaaaaaaaaaaaaaaaabbb',PAL={f:[226,216,192],w:[250,247,240],a:[24,90,32],b:[96,230,104],c:[150,24,18],d:[236,80,58],e:[180,100,236]};
  const cv=document.createElement('canvas');cv.width=cv.height=160;const cx=cv.getContext('2d');
  for(let k=0;k<1600;k++){const c=PAL[MAP[k]];cx.fillStyle=`rgb(${c[0]},${c[1]},${c[2]})`;cx.fillRect((k%40)*4,Math.floor(k/40)*4,4,4)}
  const tx=new T.CanvasTexture(cv);tx.magFilter=T.NearestFilter;tx.colorSpace=T.SRGBColorSpace||tx.colorSpace;
  const plate=new T.Mesh(new T.PlaneGeometry(.46,.46),new T.MeshStandardMaterial({map:tx,emissiveMap:tx,emissive:0xffffff,emissiveIntensity:.32,color:0x8a8478,metalness:0,roughness:.85}));
  plate.rotation.x=-Math.PI/2;plate.position.set(-.18,.0,.0);g.add(plate);
  box(.5,.012,.02,brass,-.18,.0,-.24);box(.5,.012,.02,brass,-.18,.0,.24);box(.02,.012,.5,brass,-.43,.0,0);box(.02,.012,.5,brass,.07,.0,0);
  // two pendulums on the right half, swinging in the board's plane (x, -z = "up" on the board)
  const velvet=M(T,0x15110e,{emissive:0x050403,emissiveIntensity:.3,metalness:0,roughness:.95});box(.37,.008,.52,velvet,.255,.0,0);
  box(.38,.012,.016,brass,.255,.002,-.262);box(.38,.012,.016,brass,.255,.002,.262);
  const L=.09,mk=(m,x,w)=>{const p=new T.Group();p.position.set(x,.03,-.02);g.add(p);
    const r1=new T.Group(),r2=new T.Group();p.add(r1);r1.add(r2);r2.position.set(0,0,L);
    const bar=(par)=>{const b=new T.Mesh(new T.BoxGeometry(w,.016,L+w*.6),m);b.position.set(0,0,L/2);par.add(b)};bar(r1);bar(r2);
    const pin=new T.Mesh(new T.CylinderGeometry(.016,.016,.026,16),brass);p.add(pin);const pin2=new T.Mesh(new T.CylinderGeometry(.013,.013,.024,16),m);r2.add(pin2);
    return{r1,r2}};
  const PA=mk(brass,.255,.028),PB=mk(ghost,.255,.02);PB.r1.parent.position.y=.05;
  // Heyl's rods in momentum form, RK4, step 0.01; the ghost is rounded to single precision after every step
  const F=Math.fround,der=(y)=>{const c=Math.cos(y[0]-y[1]),s=Math.sin(y[0]-y[1]),den=16-9*c*c,w1=6*(2*y[2]-3*c*y[3])/den,w2=6*(8*y[3]-3*c*y[2])/den,m=w1*w2*s;return[w1,w2,-.5*(m+3*Math.sin(y[0])),-.5*(Math.sin(y[1])-m)]};
  const rk=(y,h)=>{const a=der(y),b=der(y.map((v,i)=>v+h/2*a[i])),c=der(y.map((v,i)=>v+h/2*b[i])),d=der(y.map((v,i)=>v+h*c[i]));return y.map((v,i)=>v+h/6*(a[i]+2*b[i]+2*c[i]+d[i]))};
  const A0=[1.6628,1.8224,0,0];let U=A0.slice(),V=A0.map(F),acc=0,t=0;
  const pose=()=>{PA.r1.rotation.y=U[0];PA.r2.rotation.y=U[1]-U[0];PB.r1.rotation.y=V[0];PB.r2.rotation.y=V[1]-V[0]};pose();
  const tick=(T_,dt)=>{acc+=Math.min(dt||0,.1)*2.4;while(acc>.01){acc-=.01;t+=.01;U=rk(U,.01);V=rk(V,.01).map(F);if(t>70){t=0;U=A0.slice();V=A0.map(F)}}pose()};
  return{obj:root,mats,tick}}
