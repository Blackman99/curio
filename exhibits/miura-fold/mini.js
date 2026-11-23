// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Miura Fold: a half-folded Miura-ori sheet of blueprint-blue panels with white creases, its far corner on a root block and an orange pull tab on the near one, slowly breathing open and shut on Miura's 1985 equations
export default function miuraFold(T, col) {
  const obj = new T.Group(), mats = [];
  const NX = 6, NY = 6, XI = 0.11, C = 0.1, TH = 10 * Math.PI / 180;
  const n = (NX + 1) * (NY + 1), P = new Float32Array(n * 3);
  const verts = w => {
    const ct = Math.cos(TH), st = Math.sin(TH), Sx = Math.sqrt(1 - ct * ct * Math.sin(w) ** 2), Sy = Math.cos(w) / Sx;
    const Lx = XI * Sx, H = XI * Math.sin(w) * ct, Ys = C * ct * Sy, V = C * st / Sx;
    for (let j = 0; j <= NY; j++) for (let i = 0; i <= NX; i++) {
      const o = 3 * (j * (NX + 1) + i);
      P[o] = i * Lx + (j & 1 ? V : 0); P[o + 1] = i & 1 ? H : 0; P[o + 2] = -j * Ys;
    }
  };
  const idx = [], edges = [];
  const v = (i, j) => j * (NX + 1) + i;
  for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) idx.push(v(i, j), v(i + 1, j), v(i + 1, j + 1), v(i, j), v(i + 1, j + 1), v(i, j + 1));
  for (let j = 0; j <= NY; j++) for (let i = 0; i < NX; i++) edges.push(v(i, j), v(i + 1, j));
  for (let i = 0; i <= NX; i++) for (let j = 0; j < NY; j++) edges.push(v(i, j), v(i, j + 1));
  const pos = new T.BufferAttribute(P, 3);
  const g = new T.BufferGeometry(); g.setAttribute('position', pos); g.setIndex(idx);
  const sheet = new T.Mesh(g, new T.MeshStandardMaterial({ color: 0x3f6aa6, emissive: 0x16325e, emissiveIntensity: .6, roughness: .75, metalness: 0, side: T.DoubleSide, flatShading: true, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }));
  const eg = new T.BufferGeometry(); eg.setAttribute('position', pos); eg.setIndex(edges);
  const lines = new T.LineSegments(eg, new T.LineBasicMaterial({ color: 0xffffff }));
  const tabM = new T.MeshStandardMaterial({ color: 0xff8a1f, emissive: new T.Color(0xff8a1f).multiplyScalar(.45), roughness: .5 });
  mats.push(tabM);
  const tab = new T.Mesh(new T.SphereGeometry(0.022, 16, 12), tabM);
  const root = new T.Group(); root.add(sheet, lines, tab);
  const foot = new T.Mesh(new T.BoxGeometry(0.05, 0.05, 0.05), new T.MeshStandardMaterial({ color: 0x9aa3ad, metalness: .8, roughness: .35 }));
  root.add(foot);
  let w = 0.95;
  const build = () => {
    verts(w); pos.needsUpdate = true; g.computeVertexNormals(); g.computeBoundingSphere();
    tab.position.set(P[0], P[1], P[2]);
    const o = 3 * (NY * (NX + 1) + NX); foot.position.set(P[o] + 0.03, P[o + 1] - 0.02, P[o + 2] - 0.03);
    // keep the sheet centred while it breathes
    let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
    for (let k = 0; k < P.length; k += 3) { x0 = Math.min(x0, P[k]); x1 = Math.max(x1, P[k]); z0 = Math.min(z0, P[k + 2]); z1 = Math.max(z1, P[k + 2]); }
    root.position.set(-(x0 + x1) / 2 * root.scale.x, root.position.y, 0);
  };
  root.scale.setScalar(1.1);
  const tilt = new T.Group(); tilt.add(root); tilt.rotation.x = .38; tilt.rotation.y = -.5; tilt.position.set(0, -.3, .02);
  obj.add(tilt);
  build();
  // centre in z inside the tilted group
  const zc = () => { let z0 = 1e9, z1 = -1e9; for (let k = 2; k < P.length; k += 3) { z0 = Math.min(z0, P[k]); z1 = Math.max(z1, P[k]); } return -(z0 + z1) / 2 * root.scale.x; };
  root.position.z = zc();
  let t0 = 0;
  return { obj, mats, tick(t, dt) { t0 += dt || 0; w = 0.95 + 0.33 * Math.sin(t0 * 0.5); build(); root.position.z = zc(); } };
}
