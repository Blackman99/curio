// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Paper Lantern: a handmade accordion-pleated crayon-blue and rice-paper lantern with navy collars, warm inner candle glow and colourful paper tassel, gently turning and swaying
export default function paperLantern(T, col) {
  const obj = new T.Group(), mats = [];
  const root = new T.Group();
  const G = 16, R = 10, A = 0.25, B = 0.22, PLEAT = 0.017, PSI0 = 0.46;
  const ringPal = [0x266ec2, 0xf2ebd9, 0x7cb6e6, 0xf4eee0, 0x1d62b2, 0xf7f1e2, 0x72b99f, 0xf2ebd9, 0x4f93db, 0x266ec2];
  const prof = [];
  for (let r = 0; r <= R; r++) {
    const psi = PSI0 + (r / R) * (Math.PI - 2 * PSI0);
    const rad = A * Math.pow(Math.sin(psi), 0.86) + (r % 2 === 1 ? PLEAT : -PLEAT) * Math.sin(psi);
    prof.push([rad, B * Math.cos(psi)]);
  }
  const dphi = Math.PI * 2 / G;
  // Build pleated paper rings as distinct coloured bands with crisp flat shading
  for (let r = 0; r < R; r++) {
    const pos = [], idx = [];
    const [r0, y0] = prof[r], [r1, y1] = prof[r + 1];
    for (let g = 0; g < G; g++) {
      const a0 = g * dphi, a1 = (g + 1) * dphi;
      const o = pos.length / 3;
      pos.push(
        r0 * Math.sin(a0), y0, r0 * Math.cos(a0),
        r0 * Math.sin(a1), y0, r0 * Math.cos(a1),
        r1 * Math.sin(a1), y1, r1 * Math.cos(a1),
        r1 * Math.sin(a0), y1, r1 * Math.cos(a0)
      );
      idx.push(o, o + 1, o + 2, o, o + 2, o + 3);
    }
    const geo = new T.BufferGeometry();
    geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    const isLight = (r === 1 || r === 3 || r === 5 || r === 7);
    const mat = new T.MeshStandardMaterial({
      color: isLight ? 0xded4be : ringPal[r],
      emissive: new T.Color(isLight ? 0xffc86a : 0x1c4f94),
      emissiveIntensity: isLight ? 0.14 : 0.12,
      roughness: 0.82,
      metalness: 0.0,
      flatShading: true,
      side: T.DoubleSide
    });
    if (r === 4 || r === 5) mats.push(mat);
    root.add(new T.Mesh(geo, mat));
  }

  // Navy craft-paper top & bottom collars
  const colM = new T.MeshStandardMaterial({ color: 0x1a4a8a, emissive: 0x0e2a52, emissiveIntensity: 0.25, roughness: 0.7 });
  const cTop = new T.Mesh(new T.CylinderGeometry(prof[0][0] * 1.02, prof[0][0] * 1.02, 0.038, G, 1, true), colM);
  cTop.position.y = prof[0][1] + 0.018;
  const cBot = new T.Mesh(new T.CylinderGeometry(prof[R][0] * 1.02, prof[R][0] * 1.02, 0.038, G, 1, true), colM);
  cBot.position.y = prof[R][1] - 0.018;
  root.add(cTop, cBot);

  // Inner glowing candle bulb (main hover glow)
  const flameM = new T.MeshStandardMaterial({ color: 0xffe48a, emissive: new T.Color(0xffb83c).multiplyScalar(0.75), emissiveIntensity: 0.85, roughness: 0.35 });
  mats.push(flameM);
  const flame = new T.Mesh(new T.SphereGeometry(0.055, 14, 10), flameM);
  flame.scale.set(0.75, 1.3, 0.75);
  flame.position.y = -0.01;
  root.add(flame);

  // Short top hanging cord & bail
  const cordM = new T.MeshStandardMaterial({ color: 0x266ec2, roughness: 0.8 });
  const cord = new T.Mesh(new T.CylinderGeometry(0.008, 0.008, 0.09, 8), cordM);
  cord.position.y = prof[0][1] + 0.075;
  root.add(cord);

  // Hanging colourful paper tassel + bookmark card below bottom collar
  const tPal = [0x1f66b5, 0x7eb8ea, 0x6ebc9f, 0xe485a5];
  const tassel = new T.Group();
  tassel.position.y = prof[R][1] - 0.038;
  for (let k = 0; k < 8; k++) {
    const ang = k * Math.PI / 4;
    const strip = new T.Mesh(
      new T.BoxGeometry(0.018, 0.11, 0.004),
      new T.MeshStandardMaterial({ color: tPal[k % 4], emissive: tPal[k % 4], emissiveIntensity: 0.15, roughness: 0.75 })
    );
    strip.position.set(Math.sin(ang) * 0.028, -0.055, Math.cos(ang) * 0.028);
    strip.rotation.y = ang;
    tassel.add(strip);
  }
  const tagM = new T.MeshStandardMaterial({ color: 0xf7f1e2, emissive: 0x266ec2, emissiveIntensity: 0.12, roughness: 0.8 });
  const tag = new T.Mesh(new T.BoxGeometry(0.11, 0.05, 0.006), tagM);
  tag.position.y = -0.135;
  tassel.add(tag);
  root.add(tassel);

  // Tilt slightly toward viewer and seat cleanly in the center of the bell jar below the Rotunda title
  root.scale.setScalar(0.84);
  root.position.y = -0.14;
  root.rotation.x = 0.22;
  root.rotation.y = 0.35;
  obj.add(root);

  let t0 = 0;
  return {
    obj, mats,
    tick(t, dt) {
      t0 += dt || 0;
      root.rotation.y = 0.35 + t0 * 0.42;
      root.rotation.z = Math.sin(t0 * 1.1) * 0.06;
      tassel.rotation.z = -Math.sin(t0 * 1.1 - 0.5) * 0.1;
    }
  };
}
