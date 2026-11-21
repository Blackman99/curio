// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Rose Window: a twelve-petal rose window with quatrefoils in a stone ring, leaning on a stone slab, and its coloured patch of light lying on the slab in front of it; the patch slowly slides as the sun moves
export default function roseWindow(T, col) {
  const top = new T.Group(), obj = new T.Group(), mats = [];
  top.add(obj); obj.rotation.x = .5; obj.position.set(0, -.13, -.02); top.scale.setScalar(.82);
  const S = 256, cv = document.createElement('canvas'); cv.width = cv.height = S;
  const g = cv.getContext('2d'), C = S / 2, Rw = S / 2 - 2;
  let seed = 7; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const glass = ['#1a3cff', '#1a3cff', '#1a3cff', '#3d7bff', '#d0102a', '#e8a21a', '#f2eedc', '#2a9a48'];
  g.fillStyle = '#2b2622'; g.fillRect(0, 0, S, S);
  const disc = (x, y, r, fill) => { g.beginPath(); g.arc(x, y, r, 0, 2 * Math.PI); g.fillStyle = fill; g.fill(); };
  const mosaic = (x, y, r, base) => {
    g.save(); g.beginPath(); g.arc(x, y, r, 0, 2 * Math.PI); g.clip();
    for (let i = 0; i < 40; i++) { const a = rnd() * 6.283, d = Math.sqrt(rnd()) * r; disc(x + d * Math.cos(a), y + d * Math.sin(a), r * (.18 + .2 * rnd()), rnd() < .6 ? base : glass[(rnd() * glass.length) | 0]); }
    g.restore(); g.lineWidth = 1; g.strokeStyle = 'rgba(20,16,14,.8)'; g.beginPath(); g.arc(x, y, r, 0, 2 * Math.PI); g.stroke();
  };
  const n = 12, R1 = Rw * 0.93, s = Math.sin(Math.PI / n), r1 = R1 * s / (1 + s), d1 = R1 / (1 + s);
  const R2 = d1 - r1, r2 = R2 * s / (1 + s), d2 = R2 / (1 + s), Rc = d2 - r2;
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + 2 * Math.PI * i / n, x = C + d1 * Math.cos(a), y = C + d1 * Math.sin(a);
    const s4 = Math.sin(Math.PI / 4), rf = (r1 - 3) * s4 / (1 + s4), df = (r1 - 3) / (1 + s4);
    for (let j = 0; j < 4; j++) { const b = a + j * Math.PI / 2; mosaic(x + df * Math.cos(b), y + df * Math.sin(b), rf - 1.5, '#1a3cff'); }
    const b = a + Math.PI / n, x2 = C + d2 * Math.cos(b), y2 = C + d2 * Math.sin(b);
    mosaic(x2, y2, r2 - 3, '#d0102a');
  }
  mosaic(C, C, Rc - 3, '#e8a21a');
  const tex = new T.CanvasTexture(cv); if ('colorSpace' in tex) tex.colorSpace = T.SRGBColorSpace;
  // stone slab (the floor) and the stone ring
  const stone = new T.MeshStandardMaterial({ color: 0x8a8478, roughness: .9, metalness: 0 });
  const slab = new T.Mesh(new T.BoxGeometry(.86, .05, .62), stone); slab.position.set(0, -.2, .02); obj.add(slab);
  const win = new T.Group(); win.position.set(0, .03, -.16); win.rotation.x = -.62; obj.add(win);
  const ringM = new T.MeshStandardMaterial({ color: 0xcfc6b4, roughness: .8, metalness: 0, emissive: 0x2a2620 });
  const ring = new T.Mesh(new T.TorusGeometry(.262, .022, 12, 64), ringM); win.add(ring);
  const back = new T.Mesh(new T.CylinderGeometry(.27, .27, .02, 64, 1, true), ringM); back.rotation.x = Math.PI / 2; win.add(back);
  const glassM = new T.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: 0xffffff, emissiveIntensity: .55, roughness: .4, metalness: 0, side: T.DoubleSide });
  const pane = new T.Mesh(new T.CircleGeometry(.258, 64), glassM); win.add(pane); mats.push(glassM);
  const foot = new T.Mesh(new T.BoxGeometry(.14, .2, .05), stone); foot.position.set(0, -.11, -.2); obj.add(foot);
  // the patch of light on the slab: the same glass, sheared and stretched, soft and additive
  const patchM = new T.MeshBasicMaterial({ map: tex, transparent: true, opacity: .95, blending: T.AdditiveBlending, depthWrite: false });
  const patch = new T.Mesh(new T.CircleGeometry(.2, 48), patchM);
  patch.rotation.x = -Math.PI / 2; patch.scale.set(1.05, 1.45, 1); patch.position.set(.08, -.172, .16); obj.add(patch); mats.push(patchM);
  const tick = (time) => { const a = Math.sin((time || 0) * .25); patch.position.x = .08 + .07 * a; patch.rotation.z = .25 * a; };
  void col;
  return { obj: top, mats, tick };
}
