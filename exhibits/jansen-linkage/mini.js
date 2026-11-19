// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Beach Walker: a small white-tube walking machine on a disc of wet sand, eight legs on Jansen's holy numbers (four crank throws, each a leg and its mirror), coral flag on the ridge, footprints behind it
export default function beachWalker(T, col) {
  const obj = new T.Group(), mats = [];
  const S = 0.0034;                                   // 1 cm of the real leg
  const R = [41.5, 39.3, 40.1, 55.8, 39.4, 36.7, 65.7, 49, 50, 61.9];
  const X = (P, r1, Q, r2, s) => {
    const dx = Q[0] - P[0], dy = Q[1] - P[1], d = Math.hypot(dx, dy), a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
    const h = Math.sqrt(Math.max(0, r1 * r1 - a * a)), ex = dx / d, ey = dy / d;
    return [P[0] + a * ex - s * h * ey, P[1] + a * ey + s * h * ex];
  };
  const pose = u => {
    const A = [15 * Math.cos(u * 2 * Math.PI), 15 * Math.sin(u * 2 * Math.PI)], B = [-38, -7.8];
    const C = X(B, R[0], A, R[8], 1), D = X(B, R[1], A, R[9], -1), E = X(B, R[2], C, R[3], 1), F = X(E, R[4], D, R[5], -1), G = X(F, R[6], D, R[7], -1);
    return { O: [0, 0], A, B, C, D, E, F, G };
  };
  const BARS = [['O', 'A'], ['A', 'C'], ['A', 'D'], ['B', 'C'], ['B', 'D'], ['B', 'E'], ['C', 'E'], ['E', 'F'], ['D', 'F'], ['F', 'G'], ['D', 'G']];
  const NP = 4, NL = NP * 2, ZS = 0.07;
  const tubeM = new T.MeshStandardMaterial({ color: 0xffffff, roughness: .5, emissive: 0xdfe6ea, emissiveIntensity: .16 });
  const footM = new T.MeshStandardMaterial({ color: 0x3b4146, roughness: .8 });
  const flagM = new T.MeshStandardMaterial({ color: 0xff6a45, emissive: new T.Color(0xff6a45).multiplyScalar(.5), emissiveIntensity: .35, roughness: .8, side: T.DoubleSide });
  mats.push(flagM);
  const geo = new T.CylinderGeometry(1, 1, 1, 6);
  const bars = new T.InstancedMesh(geo, tubeM, NL * BARS.length + 12);
  const feet = new T.InstancedMesh(new T.SphereGeometry(1, 8, 6), footM, NL);
  const root = new T.Group(); obj.add(root);
  root.add(bars, feet);
  // a disc of wet sand with a trail of footprints
  const sand = new T.Mesh(new T.CylinderGeometry(.35, .36, .03, 40), new T.MeshStandardMaterial({ color: 0x8a8070, roughness: .5, metalness: .1 }));
  sand.position.y = -.015; root.add(sand);
  const printM = new T.MeshStandardMaterial({ color: 0x5e5244, roughness: .9 });
  for (let k = 0; k < 14; k++) {
    const p = new T.Mesh(new T.CircleGeometry(.012, 10), printM);
    p.rotation.x = -Math.PI / 2; p.scale.set(1.5, 1, 1);
    p.position.set(-.31 + (k >> 2) * .05 + (k % 2) * .02, .001, -.1 + (k % 4) * .06); root.add(p);
  }
  const m4 = new T.Matrix4(), q = new T.Quaternion(), sc = new T.Vector3(), v = new T.Vector3(), Y = new T.Vector3(0, 1, 0);
  const a3 = new T.Vector3(), b3 = new T.Vector3();
  let n = 0;
  const tube = (a, b, r) => { v.subVectors(b, a); const L = v.length(); q.setFromUnitVectors(Y, v.normalize()); sc.set(r, L, r); bars.setMatrixAt(n++, m4.compose(a3.addVectors(a, b).multiplyScalar(.5), q, sc)); };
  const flag = new T.Mesh(new T.PlaneGeometry(.09, .055), flagM); root.add(flag);
  let foot0 = 0;
  function build(u) {
    n = 0;
    const ps = []; let ymin = Infinity;
    for (let p = 0; p < NP; p++) { const f = pose(u + p / NP), m = pose(.5 - u - p / NP); ps.push(f, m); ymin = Math.min(ymin, f.G[1], m.G[1]); }
    foot0 = ymin;
    const W = (out, pt, sd, z) => out.set(-sd * pt[0] * S, (pt[1] - ymin) * S, z);
    let fk = 0;
    for (let p = 0; p < NP; p++) {
      const z = (p - (NP - 1) / 2) * ZS;
      for (let k = 0; k < 2; k++) {
        const P = ps[p * 2 + k], sd = k ? -1 : 1, zz = z + (k ? .012 : -.012);
        for (const [a, b] of BARS) tube(W(a3.clone(), P[a], a === 'O' ? 1 : sd, zz), W(b3.clone(), P[b], sd, zz), a === 'O' ? .005 : .0035);
        W(v, P.G, sd, zz); sc.set(.008, .005, .01); feet.setMatrixAt(fk++, m4.compose(v, q.identity(), sc));
      }
    }
    // frame: shaft, pivot rails, ridge, mast
    const zf = -(NP - 1) / 2 * ZS - .03, zb = -zf;
    const pts = [[0, 0], [-38, -7.8], [38, -7.8], [0, 26]];
    for (const p of pts) tube(W(a3.clone(), p, 1, zf), W(b3.clone(), p, 1, zb), .004);
    for (const z of [zf, zb]) { tube(W(a3.clone(), pts[1], 1, z), W(b3.clone(), pts[3], 1, z), .004); tube(W(a3.clone(), pts[2], 1, z), W(b3.clone(), pts[3], 1, z), .004); tube(W(a3.clone(), pts[1], 1, z), W(b3.clone(), pts[2], 1, z), .004); }
    W(a3, pts[3], 1, zf); b3.copy(a3); b3.y += .11; tube(a3.clone(), b3.clone(), .0025);
    flag.position.set(b3.x + .045, b3.y - .025, b3.z);
    bars.count = n; bars.instanceMatrix.needsUpdate = true; feet.instanceMatrix.needsUpdate = true;
  }
  let u = .07; build(u);
  root.rotation.y = -.5; root.rotation.x = .42; root.position.y = -.3; root.scale.setScalar(.86);
  return { obj, mats, tick(t, dt) { u += (dt || 0) * .25; build(u); flag.rotation.y = Math.sin(t * 6) * .25; } };
}
