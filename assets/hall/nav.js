// Curio hall · walking: a body of radius r slides along walls and around cases; click-to-walk uses A* on a 0.2 m grid.
export function makeNav(world,{r=.3,res=.2}={}){
 const {x0,z0}=world.bounds,W=Math.ceil((world.bounds.x1-x0)/res),H=Math.ceil((world.bounds.z1-z0)/res),free=new Uint8Array(W*H);
 const cx=i=>x0+(i+.5)*res,cz=j=>z0+(j+.5)*res,ci=x=>Math.floor((x-x0)/res),cj=z=>Math.floor((z-z0)/res);
 for(let j=0;j<H;j++)for(let i=0;i<W;i++)free[j*W+i]=world.walk(cx(i),cz(j),r)?1:0;
 const solid=world.shapes.filter(s=>s.type!=='seg');
 for(const s of solid){const ext=s.type==='box'?[s.hx,s.hz]:[s.r,s.r],m=r+.06;
  for(let j=cj(s.z-ext[1]-m);j<=cj(s.z+ext[1]+m);j++)for(let i=ci(s.x-ext[0]-m);i<=ci(s.x+ext[0]+m);i++){if(i<0||j<0||i>=W||j>=H)continue;
   const x=cx(i),z=cz(j);const d=s.type==='box'?Math.hypot(Math.max(0,Math.abs(x-s.x)-s.hx),Math.max(0,Math.abs(z-s.z)-s.hz)):Math.hypot(x-s.x,z-s.z)-s.r;if(d<m)free[j*W+i]=0}}
 const ok=(i,j)=>i>=0&&j>=0&&i<W&&j<H&&free[j*W+i]===1;
 const freeAt=(x,z)=>ok(ci(x),cj(z));

 // push a point out of every shape; segments are walls, boxes are cases and benches, circles are columns and ropes
 function collide(p,prev){
  for(let it=0;it<4;it++){let moved=false;
   for(const s of world.shapes){let qx,qz;
    if(s.type==='seg'){const ax=s.a[0],az=s.a[1],dx=s.b[0]-ax,dz=s.b[1]-az,l2=dx*dx+dz*dz;const t=Math.max(0,Math.min(1,((p.x-ax)*dx+(p.z-az)*dz)/l2));qx=ax+dx*t;qz=az+dz*t}
    else if(s.type==='box'){qx=Math.max(s.x-s.hx,Math.min(s.x+s.hx,p.x));qz=Math.max(s.z-s.hz,Math.min(s.z+s.hz,p.z));
     if(qx===p.x&&qz===p.z){const ex=s.hx-Math.abs(p.x-s.x),ez=s.hz-Math.abs(p.z-s.z);if(ex<ez)p.x=s.x+Math.sign(p.x-s.x||1)*(s.hx+r);else p.z=s.z+Math.sign(p.z-s.z||1)*(s.hz+r);moved=true;continue}}
    else{const dx=p.x-s.x,dz=p.z-s.z,d=Math.hypot(dx,dz);if(d<s.r+r){const k=d>1e-6?(s.r+r)/d:1;p.x=s.x+(d>1e-6?dx*k:s.r+r);p.z=s.z+(d>1e-6?dz*k:0);moved=true}continue}
    const dx=p.x-qx,dz=p.z-qz,d=Math.hypot(dx,dz);if(d<r){if(d<1e-6)continue;p.x=qx+dx/d*r;p.z=qz+dz/d*r;moved=true}}
   if(!moved)break}
  if(prev&&!world.walk(p.x,p.z,r*.5)){p.x=prev.x;p.z=prev.z}
  return p}

 // nearest free cell to (x,z)
 function snap(x,z){let i=ci(x),j=cj(z);if(ok(i,j))return[i,j];for(let rad=1;rad<20;rad++){let best=null,bd=1e9;
  for(let dj=-rad;dj<=rad;dj++)for(let di=-rad;di<=rad;di++){if(Math.max(Math.abs(di),Math.abs(dj))!==rad)continue;if(ok(i+di,j+dj)){const d=di*di+dj*dj;if(d<bd){bd=d;best=[i+di,j+dj]}}}if(best)return best}return null}
 function los(ax,az,bx,bz){const d=Math.hypot(bx-ax,bz-az),n=Math.ceil(d/(res*.5));for(let k=0;k<=n;k++){const t=k/n;if(!freeAt(ax+(bx-ax)*t,az+(bz-az)*t))return false}return true}
 // A* with 8-neighbours, no corner cutting; returns smoothed world points (excluding the start)
 function path(fx,fz,tx,tz){const s=snap(fx,fz),g=snap(tx,tz);if(!s||!g)return null;const S=s[1]*W+s[0],Gl=g[1]*W+g[0];
  const gs=new Float32Array(W*H).fill(Infinity),from=new Int32Array(W*H).fill(-1),closed=new Uint8Array(W*H),heap=[];
  const hcost=k=>{const dx=Math.abs(k%W-g[0]),dz=Math.abs(Math.floor(k/W)-g[1]);return Math.max(dx,dz)+.4142*Math.min(dx,dz)};
  const push=(f,k)=>{heap.push([f,k]);let i=heap.length-1;while(i>0){const p=(i-1)>>1;if(heap[p][0]<=heap[i][0])break;[heap[p],heap[i]]=[heap[i],heap[p]];i=p}};
  const pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let i=0;for(;;){const l=2*i+1,rr=l+1;let m=i;if(l<heap.length&&heap[l][0]<heap[m][0])m=l;if(rr<heap.length&&heap[rr][0]<heap[m][0])m=rr;if(m===i)break;[heap[m],heap[i]]=[heap[i],heap[m]];i=m}}return top};
  gs[S]=0;push(hcost(S),S);let found=false;
  while(heap.length){const [,k]=pop();if(closed[k])continue;closed[k]=1;if(k===Gl){found=true;break}const i=k%W,j=Math.floor(k/W);
   for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){if(!di&&!dj)continue;const ni=i+di,nj=j+dj;if(!ok(ni,nj))continue;if(di&&dj&&(!ok(i+di,j)||!ok(i,j+dj)))continue;
    const nk=nj*W+ni,c=gs[k]+(di&&dj?1.4142:1);if(c<gs[nk]){gs[nk]=c;from[nk]=k;push(c+hcost(nk),nk)}}}
  if(!found)return null;const cells=[];for(let k=Gl;k!==-1;k=from[k])cells.push(k);cells.reverse();
  const pts=cells.map(k=>[cx(k%W),cz(Math.floor(k/W))]);pts[0]=[fx,fz];if(freeAt(tx,tz))pts[pts.length-1]=[tx,tz];
  const out=[];let a=0;while(a<pts.length-1){let b=pts.length-1;while(b>a+1&&!los(pts[a][0],pts[a][1],pts[b][0],pts[b][1]))b--;out.push({x:pts[b][0],z:pts[b][1]});a=b}
  return out}
 return{collide,path,freeAt,snap,los,r}}
