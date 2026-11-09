// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Murmuration: a twisting ribbon of starlings over a dusky sea plate, the ruined pier's piles and pavilion ring below, a low sun behind
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.25,metalness:0,roughness:.85},o));
export default function murmuration(T,col){const root=new T.Group(),mats=[];
  // the base and the sea
  const base=new T.Mesh(new T.CylinderGeometry(.44,.46,.05,48,1,true),M(T,0x2a2230,{emissiveIntensity:.12}));base.position.y=-.155;root.add(base);
  const sea=new T.Mesh(new T.CircleGeometry(.44,48),M(T,0x6a6074,{emissive:0x2a2232,emissiveIntensity:.3,roughness:.5,metalness:.1}));sea.rotation.x=-Math.PI/2;sea.position.y=-.13;root.add(sea);
  // the pier: two rows of piles running back, and the ring of the old pavilion
  const pileM=M(T,0x16121a,{emissiveIntensity:.05}),pg=new T.BoxGeometry(.012,.07,.012);
  for(let i=0;i<9;i++){const z=.3-i*.055;if(i===5)continue;for(const x of[.2,.245]){const p=new T.Mesh(pg,pileM);p.position.set(x+i*.006,-.1,z);root.add(p)}}
  for(let i=0;i<10;i++){const a=i/10*Math.PI*2;if(i===3||i===7)continue;const p=new T.Mesh(new T.BoxGeometry(.012,.1,.012),pileM);p.position.set(.27+Math.cos(a)*.07,-.085,-.22+Math.sin(a)*.05);root.add(p)}
  const ring=new T.Mesh(new T.TorusGeometry(.07,.004,6,32,Math.PI*1.4),pileM);ring.rotation.x=Math.PI/2;ring.scale.set(1,.72,1);ring.position.set(.27,-.035,-.22);root.add(ring);
  // a low sun behind the flock: the glowing part
  const sunM=new T.MeshStandardMaterial({color:0xffc890,emissive:new T.Color(0xff9a5a).multiplyScalar(.7),emissiveIntensity:1,roughness:1});mats.push(sunM);
  const sun=new T.Mesh(new T.CircleGeometry(.07,40),sunM);sun.position.set(-.18,-.07,-.36);root.add(sun);
  // the birds: one instanced mesh of little two-winged darts flowing along a twisted ribbon
  const N=1700,bg=new T.BufferGeometry();bg.setAttribute('position',new T.Float32BufferAttribute([.009,0,0,-.006,0,0,-.004,.0015,.011, .009,0,0,-.004,.0015,-.011,-.006,0,0],3));bg.computeVertexNormals();
  const birdM=new T.MeshStandardMaterial({color:0x140e18,emissive:0x0a060c,roughness:.9,side:T.DoubleSide});
  const birds=new T.InstancedMesh(bg,birdM,N);birds.frustumCulled=false;root.add(birds);
  const U=[],W=[],H=[];let s=41;const R=()=>{s=(s*16807)%2147483647;return s/2147483647};
  for(let i=0;i<N;i++){U.push(R());const w=R()*2-1;W.push(Math.sign(w)*Math.pow(Math.abs(w),.8));H.push((R()+R()+R()-1.5)*.5)}
  const m4=new T.Matrix4(),q=new T.Quaternion(),e=new T.Euler(),v=new T.Vector3(),sc=new T.Vector3(1,1,1);
  function place(t){for(let i=0;i<N;i++){const u=(U[i]+t*.035)%1,a=(u-.5)*Math.PI*1.5,tw=Math.sin(a*1.4+t*.4)*1.1;
      const cx=Math.sin(a)*.34,cz=-Math.cos(a)*.13+.02,tx=Math.cos(a),tz=Math.sin(a)*.38,tl=Math.hypot(tx,tz),nx=-tz/tl,nz=tx/tl;
      const wid=.12*(1-Math.pow(Math.abs(u-.5)*2,3)*.7),sd=W[i]*wid*Math.cos(tw),y=.03+W[i]*wid*Math.sin(tw)*.7+H[i]*.025+Math.sin(a*2+t*.3)*.03;
      v.set(cx+nx*sd,y,cz+nz*sd);e.set(Math.sin(tw)*.6,-Math.atan2(tz,tx),0,'YXZ');q.setFromEuler(e);m4.compose(v,q,sc);birds.setMatrixAt(i,m4)}
    birds.instanceMatrix.needsUpdate=true}
  place(0);
  return{obj:root,mats,tick:(t)=>place(t)}}
