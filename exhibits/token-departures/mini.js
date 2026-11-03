// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Token Departures: mini split-flap board, rows flip through letters, top row lit as chosen token
const M=(T,c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:.4,metalness:.4,roughness:.35},o));
export default function flap(T,col){const g=new T.Group(),W=['THE','CAT','SAT','RAN','SKY'],L='ABCDEFGHIJKLMNOPQRSTUVWXYZ',cv=document.createElement('canvas');cv.width=256;cv.height=192;const x=cv.getContext('2d'),tx=new T.CanvasTexture(cv);tx.colorSpace=T.SRGBColorSpace;
  const draw=t=>{x.fillStyle='#14110d';x.fillRect(0,0,256,192);x.font='bold 26px Courier New,monospace';x.textBaseline='middle';
   for(let r=0;r<4;r++){const w=W[(r+Math.floor(t/2.4))%W.length],pct=[46,23,12,7][r],Y=26+r*44;for(let c=0;c<3;c++){const X=14+c*34;x.fillStyle='#262019';x.fillRect(X,Y-18,30,36);const settle=(t%2.4)>(.3+c*.15+r*.1);x.fillStyle=r===0?'#f5c518':'#efe4cc';x.fillText(settle?w[c]:L[Math.floor(t*20+c*7+r*3)%26],X+6,Y+1);x.fillStyle='#000';x.fillRect(X,Y,30,1.5)}
    x.fillStyle=r===0?'#f5c518':'#b9ab8f';x.fillText(pct+'%',140,Y+1);x.fillStyle='#f5c518';x.fillRect(205,Y-6,pct*.9,12)}tx.needsUpdate=true};draw(2.2);
  const bm=new T.MeshStandardMaterial({map:tx,emissive:0xffffff,emissiveMap:tx,emissiveIntensity:.5,roughness:.6}),fr=M(T,col,{metalness:.8,emissiveIntensity:.1});
  const board=new T.Mesh(new T.PlaneGeometry(.8,.6),bm);board.position.z=.031;g.add(board);const box=new T.Mesh(new T.BoxGeometry(.86,.66,.06),fr);g.add(box);
  let last=-1;return{obj:g,mats:[bm],static:true,tick:t=>{const q=Math.floor(t*12);if(q!==last){last=q;draw(t)}}}}
