// Curio hall · geometry helpers: moulding sweeps, rounded boxes, fluted shafts, vaults, bars, draped cloth, merging.
export function makeGeo(T,BGU){
 const V3=T.Vector3,V2=T.Vector2;
 const fromArrays=(pos,nrm,uv)=>{const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(nrm,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));return g};

 // Sweep a cross-section along a polyline in the XZ plane. prof = [[off,y],...] traversed so the outside is on the right
 // (wall at off=0, bottom first); off is measured along the left normal (-dz,dx) of the path.
 function sweep(path,prof,closed=false,smooth=40){
  const P=path.map(p=>new V2(p[0],p[1])),n=P.length,segs=closed?n:n-1;
  const sn=i=>{const a=P[i],b=P[(i+1)%n],d=b.clone().sub(a).normalize();return new V2(-d.y,d.x)};
  const off=[];for(let i=0;i<n;i++){const a=(i>0||closed)?sn((i-1+n)%n):null,b=(i<n-1||closed)?sn(i%n):null;
   if(a&&b){const m=a.clone().add(b).normalize();off.push(m.multiplyScalar(1/Math.max(.25,m.dot(b))))}else off.push((a||b).clone())}
  // profile edge normals in (off,y), smoothed across soft corners
  const E=[];for(let k=0;k<prof.length-1;k++){const dx=prof[k+1][0]-prof[k][0],dy=prof[k+1][1]-prof[k][1],l=Math.hypot(dx,dy)||1;E.push([dy/l,-dx/l])}
  const cs=Math.cos(smooth*Math.PI/180),vn=(k,side)=>{const e=E[k],o=side?E[k+1]:E[k-1];if(!o)return e;const d=e[0]*o[0]+e[1]*o[1];if(d<cs)return e;const x=e[0]+o[0],y=e[1]+o[1],l=Math.hypot(x,y);return[x/l,y/l]};
  const pos=[],nrm=[],uv=[];let acc=0;const arc=[0];for(let k=1;k<prof.length;k++)arc.push(arc[k-1]+Math.hypot(prof[k][0]-prof[k-1][0],prof[k][1]-prof[k-1][1]));
  for(let s=0;s<segs;s++){const i=s,j=(s+1)%n,len=P[i].distanceTo(P[j]),N=sn(i);
   for(let k=0;k<prof.length-1;k++){const [oa,ya]=prof[k],[ob,yb]=prof[k+1],na=vn(k,0),nb=vn(k,1);
    const A0=[P[i].x+off[i].x*oa,ya,P[i].y+off[i].y*oa],A1=[P[j].x+off[j].x*oa,ya,P[j].y+off[j].y*oa],B0=[P[i].x+off[i].x*ob,yb,P[i].y+off[i].y*ob],B1=[P[j].x+off[j].x*ob,yb,P[j].y+off[j].y*ob];
    const NA=[N.x*na[0],na[1],N.y*na[0]],NB=[N.x*nb[0],nb[1],N.y*nb[0]];
    pos.push(...A0,...A1,...B0,...A1,...B1,...B0);nrm.push(...NA,...NA,...NB,...NA,...NB,...NB);
    uv.push(acc,arc[k],acc+len,arc[k],acc,arc[k+1],acc+len,arc[k],acc+len,arc[k+1],acc,arc[k+1])}
   acc+=len}
  if(!closed){const tri=T.ShapeUtils.triangulateShape(prof.map(p=>new V2(p[0],p[1])),[]);
   for(const [end,i] of [[0,0],[1,n-1]]){const d=end?P[n-1].clone().sub(P[n-2]).normalize():P[0].clone().sub(P[1]).normalize();
    for(const t of tri){const pts=t.map(k=>[P[i].x+off[i].x*prof[k][0],prof[k][1],P[i].y+off[i].y*prof[k][0]]);
     const e1=new V3(...pts[1]).sub(new V3(...pts[0])),e2=new V3(...pts[2]).sub(new V3(...pts[0])),fn=e1.cross(e2);const flip=fn.x*d.x+fn.z*d.y<0;
     const o=flip?[pts[0],pts[2],pts[1]]:pts;for(const p of o){pos.push(...p);nrm.push(d.x,0,d.y);uv.push(p[0],p[1])}}}}
  return fromArrays(pos,nrm,uv)}
 // rectangular frame in the XY plane facing +z: profile off = inset from the outer edge, y = depth out of the wall
 const frame=(w,h,prof)=>sweep([[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]],prof,true).rotateX(Math.PI/2);

 // rounded box with true quarter-round edges
 function rbox(w,h,d,r,s=3){const k=2*s+1,g=new T.BoxGeometry(w,h,d,k,k,k),p=g.attributes.position,nm=g.attributes.normal,v=new V3(),c=new V3(),hw=w/2-r,hh=h/2-r,hd=d/2-r;
  const map=(x,full,inner)=>{const i=Math.round((x/full+.5)*k);if(i<=s)return -inner-r+r*(i/s);if(i>=k-s)return inner+r*((i-(k-s))/s);return x/full*2*inner};
  for(let i=0;i<p.count;i++){v.set(map(p.getX(i),w,hw),map(p.getY(i),h,hh),map(p.getZ(i),d,hd));c.set(Math.max(-hw,Math.min(hw,v.x)),Math.max(-hh,Math.min(hh,v.y)),Math.max(-hd,Math.min(hd,v.z)));
   const o=v.clone().sub(c);if(o.lengthSq()>1e-12){o.normalize();v.copy(c).addScaledVector(o,r);nm.setXYZ(i,o.x,o.y,o.z)}p.setXYZ(i,v.x,v.y,v.z)}
  return g}

 // fluted column shaft with entasis, open-ended
 function fluted(r0,r1,h,flutes=24,depth=.03){const seg=flutes*8,g=new T.CylinderGeometry(r1,r0,h,seg,12,true),p=g.attributes.position,per=Math.PI*2/flutes;
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),th=Math.atan2(z,x),R=Math.hypot(x,z),u=y/h+.5,ent=1+.025*Math.sin(u*Math.PI*.9);
   let f=((th%per)+per)%per/per*2-1;const gr=Math.abs(f)<.8?Math.sqrt(1-(f/.8)**2):0;const rr=R*ent-depth*gr*(u>.04&&u<.97?1:0);p.setXYZ(i,Math.cos(th)*rr,y,Math.sin(th)*rr)}
  g.computeVertexNormals();return g}

 // octagonal cloister vault (inside faces), apothem a at the springing, height hd, open oculus radius ro
 function vault(a,hd,ro,segPer=12,rings=24){const I=8*segPer,phiMax=Math.acos(ro/a),pa=[],ua=[],ix=[];
  for(let j=0;j<=rings;j++)for(let i=0;i<=I;i++){const th=i/I*Math.PI*2,loc=((th%(Math.PI/4))+Math.PI/4)%(Math.PI/4)-Math.PI/8,rho=a/Math.cos(loc),ph=j/rings*phiMax;
   pa.push(Math.cos(th)*rho*Math.cos(ph),hd*Math.sin(ph),Math.sin(th)*rho*Math.cos(ph));ua.push(i/segPer,j/rings)}
  const id=(i,j)=>j*(I+1)+i;for(let j=0;j<rings;j++)for(let i=0;i<I;i++){const a0=id(i,j),a1=id(i+1,j),b0=id(i,j+1),b1=id(i+1,j+1);ix.push(a0,a1,b0,a1,b1,b0)}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pa,3));g.setAttribute('uv',new T.Float32BufferAttribute(ua,2));g.setIndex(ix);g.computeVertexNormals();return g}

 // box spanning a→b with square section t (for mullions, bars, rails)
 function bar(a,b,t,t2=t){const d=new V3().subVectors(b,a),l=d.length(),g=new T.BoxGeometry(t,l,t2);const q=new T.Quaternion().setFromUnitVectors(new V3(0,1,0),d.normalize());
  g.applyQuaternion(q);g.translate((a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2);return g}
 function rod(a,b,r,seg=10){const d=new V3().subVectors(b,a),l=d.length(),g=new T.CylinderGeometry(r,r,l,seg,1,false);const q=new T.Quaternion().setFromUnitVectors(new V3(0,1,0),d.normalize());
  g.applyQuaternion(q);g.translate((a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2);return g}

 // draped dust sheet over a w×h×d case (origin at the base centre)
 function drape(w,h,d,seed=1){const g=new T.BoxGeometry(w,h,d,18,14,18);g.translate(0,h/2,0);g.deleteAttribute('normal');g.deleteAttribute('uv');
  const m=BGU.mergeVertices(g,1e-4),p=m.attributes.position,uv=[];
  for(let i=0;i<p.count;i++){let x=p.getX(i),y=p.getY(i),z=p.getZ(i);const t=1-y/h,th=Math.atan2(z,x),fl=t*t;
   const s=1+fl*.07+Math.sin(th*7+seed+y*3)*.016*fl+Math.sin(th*13+seed*2)*.006*fl;x*=s;z*=s;
   if(y>h-.001){const r=Math.max(Math.abs(x)/(w/2),Math.abs(z)/(d/2));y+=.03*(1-r*r)}p.setXYZ(i,x,y,z);uv.push((x+z)*1.5,y*1.5)}
  m.setAttribute('uv',new T.Float32BufferAttribute(uv,2));m.computeVertexNormals();return m}

 // lathe from [[r,y],...]
 const lathe=(pts,seg=48)=>new T.LatheGeometry(pts.map(p=>new V2(p[0],p[1])),seg);

 // Merge geometry buckets: {key:[geom,...]} → BufferGeometry per key (non-indexed, common attributes only)
 function merge(list){if(!list.length)return null;const gs=list.map(g=>g.index?g.toNonIndexed():g);
  const names=Object.keys(gs[0].attributes).filter(nm=>gs.every(g=>g.attributes[nm]));
  for(const g of gs)for(const nm of Object.keys(g.attributes))if(!names.includes(nm))g.deleteAttribute(nm);
  for(const g of gs)g.morphAttributes={};
  const m=BGU.mergeGeometries(gs,false);gs.forEach(g=>g.dispose());return m}
 return{sweep,frame,rbox,fluted,vault,bar,rod,drape,lathe,merge,fromArrays}}
