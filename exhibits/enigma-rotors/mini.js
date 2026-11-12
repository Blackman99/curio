// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Enigma I: the open machine in its oak case, tipped toward you: keys, a lamp board with one lamp lit, three rotors with their thumbwheels, cables on the plugboard, and an amber trace of the current; the lamps spell out WO BLEIBT ZAHLENMELDUNG FRAGE as the right rotor steps
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.25,metalness:.6,roughness:.4},o));
export default function enigma(T,col){const g=new T.Group(),mats=[],m=new T.Group();g.add(m);m.rotation.x=.48;m.position.set(0,-.2,.04);m.scale.setScalar(.86);
  const s=.0019,KB=['QWERTZUIO','ASDFGHJK','PYXCVBNML'],P={},L={};
  KB.forEach((r,i)=>[...r].forEach((ch,j)=>{const o=j-(r.length-1)/2;P[ch]=[o*27*s,[57,81,105][i]*s];L[ch]=[o*23.5*s,[-7,11,29][i]*s]}));
  const wood=M(T,0x9a6a36,{emissiveIntensity:.05,metalness:0,roughness:.6}),paint=M(T,0x8a8c90,{color:0x262628,emissive:0x141416,emissiveIntensity:.2,metalness:.3,roughness:.75}),
    alu=M(T,0xcfd2d6,{emissive:0x55585c,emissiveIntensity:.3,metalness:.9,roughness:.3}),key=M(T,0xf2ecdf,{emissive:0x7a7468,emissiveIntensity:.1,metalness:0,roughness:.4}),
    lamp=M(T,0x3a3632,{emissive:0x17140f,emissiveIntensity:.3,metalness:0,roughness:.5}),cab=M(T,0x2a2622,{emissiveIntensity:.05,metalness:0,roughness:.8}),
    lit=M(T,0xffc75a,{emissive:new T.Color(0xffa82e),emissiveIntensity:1.4,metalness:0,roughness:.3}),amber=M(T,0xffb347,{emissive:new T.Color(0xff9d2a).multiplyScalar(.6),emissiveIntensity:1,metalness:0,roughness:.4,transparent:true,opacity:.9}),
    blue=M(T,0x8fd0ff,{emissive:new T.Color(0x5ab4ff).multiplyScalar(.6),emissiveIntensity:1,metalness:0,roughness:.4,transparent:true,opacity:.9});
  mats.push(lit,amber,blue);
  const B=(w,h,d,mt,x,y,z)=>{const b=new T.Mesh(new T.BoxGeometry(w,h,d),mt);b.position.set(x,y,z);m.add(b);return b};
  // oak case (open top), black deck and lamp board, the folded-down flap
  const W=340*s,D=260*s,H=96*s;B(W,.012,D,wood,0,-H/2,0);B(.016,H,D,wood,-W/2,0,0);B(.016,H,D,wood,W/2,0,0);B(W,H,.016,wood,0,0,-D/2);B(W,.03,.016,wood,0,-H/2+.015,D/2);
  B(W-.03,.012,.2,wood,0,-H/2-.004,D/2+.1);
  B(W-.03,H*.82,.18,paint,0,-H*.09,.13);B(W-.03,H*.95,.13,paint,0,-H*.02,-.0);B(W-.03,H,.11,paint,0,0,-.125);
  // keys on short stems
  const kg=new T.CylinderGeometry(9*s,9*s,4*s,18),sg=new T.CylinderGeometry(2*s,2*s,16*s,8),top=H*.32,keys={};
  for(const ch in P){const k=new T.Mesh(kg,key);k.position.set(P[ch][0],top+.03,P[ch][1]-.03);m.add(k);keys[ch]=k;const st=new T.Mesh(sg,alu);st.position.set(P[ch][0],top+.015,P[ch][1]-.03);m.add(st)}
  // lamp windows; the lit one moves
  const lg=new T.CylinderGeometry(7.4*s,7.4*s,2*s,18),lamps={};for(const ch in L){const l=new T.Mesh(lg,lamp);l.position.set(L[ch][0],H*.47,L[ch][1]-.03);m.add(l);lamps[ch]=l}
  // three rotors, the reflector and entry wheel, thumbwheels sticking up through the cover
  const rz=-.125,ry=H*.45,rot=[];B(.34,.006,.13,paint,-.03,H*.5,rz).material=paint;
  for(let i=0;i<3;i++){const r=new T.Group();r.position.set(-.08+i*.055,ry,rz);m.add(r);const th=new T.Mesh(new T.CylinderGeometry(.052,.052,.008,24),alu);th.rotation.z=Math.PI/2;r.add(th);
    for(let k=0;k<24;k++){const n=new T.Mesh(new T.BoxGeometry(.009,.006,.006),alu);const a=k/24*Math.PI*2;n.position.set(0,Math.cos(a)*.053,Math.sin(a)*.053);n.rotation.x=a;r.add(n)}
    const rg=new T.Mesh(new T.CylinderGeometry(.045,.045,.02,24),alu);rg.rotation.z=Math.PI/2;rg.position.x=-.016;r.add(rg);rot.push(r)}
  const uk=new T.Mesh(new T.CylinderGeometry(.044,.044,.03,24),alu);uk.rotation.z=Math.PI/2;uk.position.set(-.135,ry,rz);m.add(uk);
  // plugboard cables hanging over the front
  for(let i=0;i<4;i++){const x0=-.12+i*.07,pts=[];for(let k=0;k<=12;k++){const u=k/12;pts.push(new T.Vector3(x0+u*.05,-H*.1-Math.sin(u*Math.PI)*.05,D/2+.012+Math.sin(u*Math.PI)*.02))}
    m.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),16,.0035,6),cab))}
  // the current: from the pressed key into the rotors (amber) and back to the lit lamp (blue)
  const path=(a,b,mt)=>{const pts=[new T.Vector3(a[0],top+.035,a[1]-.03),new T.Vector3(a[0]*.6,H*.2,-.02),new T.Vector3(-.03,ry,rz+.01),new T.Vector3(b[0]*.6,H*.25,-.03),new T.Vector3(b[0],H*.5,b[1]-.03)];
    const t=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),40,.0045,6),mt);m.add(t);return t};
  const MSG='WOBLEIBTZAHLENMELDUNGFRAGE',CT='IBAVLEQQLTIUMMJREOCIIYYVOA';let cur=null,at=-1;
  function show(i){const k=CT[i],o=MSG[i];if(at>=0){lamps[MSG[at]].material=lamp;keys[CT[at]].position.y=top+.03}at=i;lamps[o].material=lit;keys[k].position.y=top+.022;
    if(cur){for(const c of cur){m.remove(c);c.geometry.dispose()}}const mid=[(P[k][0]+L[o][0])/2,0];
    cur=[path(P[k],[mid[0]-.04,0],amber),path([mid[0]+.04,P[k][1]],L[o],blue)];cur[1].geometry.dispose();
    const pts=[new T.Vector3(-.03,ry,rz+.01),new T.Vector3(L[o][0]*.6,H*.28,-.03),new T.Vector3(L[o][0],H*.5,L[o][1]-.03)];cur[1].geometry=new T.TubeGeometry(new T.CatmullRomCurve3(pts),30,.0045,6)}
  show(0);let t0=0,step=0;
  return{obj:g,mats,tick(Tm){const i=Math.floor(Tm/.9)%MSG.length;if(i!==at){show(i);step++}
    for(let j=0;j<3;j++){const target=j===2?step:Math.floor(step/26)*(j===1?1:0);rot[j].rotation.x+=((target*Math.PI*2/26)-rot[j].rotation.x)*.2}void t0}};}
