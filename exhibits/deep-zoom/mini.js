// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Deep Zoom: a glowing neon-cyan and magenta Mandelbrot fractal disc tilted toward the visitor, with sculpted 3D cardioid core, nested holographic depth rings and a tiny orbiting minibrot crystal rising above the spiral
export default function deepZoom(T, col) {
  const top = new T.Group(), obj = new T.Group(), mats = [];
  top.add(obj);
  obj.rotation.x = 0.52;
  obj.position.set(0, -0.09, 0.02);
  top.scale.setScalar(0.86);

  // Procedural neon Mandelbrot CanvasTexture for the glowing holographic specimen disc
  const S = 256, cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const ctx = cv.getContext('2d');
  const img = ctx.createImageData(S, S), data = img.data;
  for (let py = 0; py < S; py++) {
    const ci = (py / S - 0.5) * 2.55;
    for (let px = 0; px < S; px++) {
      const cr = (px / S - 0.5) * 2.55 - 0.52;
      let zr = 0, zi = 0, n = 0, maxI = 64;
      while (n < maxI && zr * zr + zi * zi < 64) {
        const nr = zr * zr - zi * zi + cr;
        zi = 2 * zr * zi + ci;
        zr = nr;
        n++;
      }
      const o = (py * S + px) * 4;
      const dist = Math.hypot((px / S - 0.5) * 2, (py / S - 0.5) * 2);
      if (dist > 0.98) {
        data[o] = 6; data[o + 1] = 4; data[o + 2] = 18; data[o + 3] = 255;
      } else if (n >= maxI) {
        data[o] = 8; data[o + 1] = 5; data[o + 2] = 20; data[o + 3] = 255;
      } else {
        const sm = n + 1 - Math.log2(Math.max(1, 0.5 * Math.log2(zr * zr + zi * zi)));
        const u = Math.log(1 + sm * 0.45) * 3.8;
        const ph = ((u / 6.2831853) % 1 + 1) % 1;
        const dc = Math.min(Math.abs(ph - 0.24), 1 - Math.abs(ph - 0.24));
        const dm = Math.min(Math.abs(ph - 0.74), 1 - Math.abs(ph - 0.74));
        const pc = Math.exp(-Math.pow(dc / 0.14, 2));
        const pm = Math.exp(-Math.pow(dm / 0.14, 2));
        const fade = Math.max(0, 1 - Math.pow(dist / 0.98, 4));
        data[o] = Math.round((0.03 + 0.97 * pm * fade) * 255);
        data[o + 1] = Math.round((0.02 + 0.95 * pc * fade + 0.12 * pm * fade) * 255);
        data[o + 2] = Math.round((0.09 + 0.91 * Math.max(pc, pm * 0.9) * fade) * 255);
        data[o + 3] = 255;
      }
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new T.CanvasTexture(cv);
  if ('colorSpace' in tex) tex.colorSpace = T.SRGBColorSpace;

  // Dark obsidian base plate + glowing Mandelbrot top face
  const plateRimM = new T.MeshStandardMaterial({ color: 0x161229, roughness: 0.45, metalness: 0.35 });
  const basePlate = new T.Mesh(new T.CylinderGeometry(0.285, 0.295, 0.026, 48), plateRimM);
  basePlate.position.y = -0.02;
  obj.add(basePlate);

  const discM = new T.MeshStandardMaterial({
    color: 0x767486,
    map: tex,
    emissiveMap: tex,
    emissive: new T.Color(0xffffff).multiplyScalar(0.55),
    emissiveIntensity: 0.72,
    roughness: 0.42,
    metalness: 0.1
  });
  const disc = new T.Mesh(new T.CircleGeometry(0.278, 48), discM);
  disc.rotation.x = -Math.PI / 2;
  disc.position.y = -0.005;
  obj.add(disc);
  mats.push(discM);

  // Sculpted 3D extruded Mandelbrot cardioid silhouette + period-2 bulb rising from the disc
  const cardShape = new T.Shape();
  for (let i = 0; i <= 64; i++) {
    const th = (i / 64) * Math.PI * 2;
    const x = (0.5 * Math.cos(th) - 0.25 * Math.cos(2 * th) + 0.32) * 0.21;
    const y = (0.5 * Math.sin(th) - 0.25 * Math.sin(2 * th)) * 0.21;
    if (i === 0) cardShape.moveTo(x, y);
    else cardShape.lineTo(x, y);
  }
  const coreM = new T.MeshStandardMaterial({
    color: 0x0e0a20,
    emissive: new T.Color(0x00d8ff).multiplyScalar(0.25),
    emissiveIntensity: 0.4,
    roughness: 0.3,
    metalness: 0.45
  });
  const cardGeo = new T.ExtrudeGeometry(cardShape, { depth: 0.036, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.005, bevelSegments: 2 });
  cardGeo.rotateX(-Math.PI / 2);
  const cardMesh = new T.Mesh(cardGeo, coreM);
  cardMesh.position.y = -0.004;
  obj.add(cardMesh);

  // Period-2 bulb attached at (-1, 0) -> scaled offset (-0.143, 0)
  const bulb = new T.Mesh(new T.CylinderGeometry(0.052, 0.056, 0.036, 28), coreM);
  bulb.position.set(-0.142, 0.015, 0);
  obj.add(bulb);

  // Glowing neon-cyan rim around the base disc
  const cyanM = new T.MeshStandardMaterial({
    color: 0x00e8ff,
    emissive: new T.Color(0x00f0ff).multiplyScalar(0.5),
    emissiveIntensity: 0.85,
    roughness: 0.25,
    metalness: 0.2
  });
  const magM = new T.MeshStandardMaterial({
    color: 0xff22e0,
    emissive: new T.Color(0xff1ee0).multiplyScalar(0.5),
    emissiveIntensity: 0.85,
    roughness: 0.25,
    metalness: 0.2
  });
  mats.push(cyanM, magM);

  const outerRing = new T.Mesh(new T.TorusGeometry(0.286, 0.009, 10, 56), cyanM);
  outerRing.rotation.x = Math.PI / 2;
  outerRing.position.y = -0.006;
  obj.add(outerRing);

  // Nested floating holographic zoom rings rising toward the hidden deep minibrot crystal
  const rings = [];
  const ringSpecs = [
    { r: 0.21, y: 0.065, mat: magM, tilt: 0.06 },
    { r: 0.145, y: 0.125, mat: cyanM, tilt: -0.08 },
    { r: 0.09, y: 0.18, mat: magM, tilt: 0.05 }
  ];
  for (const rs of ringSpecs) {
    const m = new T.Mesh(new T.TorusGeometry(rs.r, 0.007, 10, 48), rs.mat);
    m.rotation.x = Math.PI / 2 + rs.tilt;
    m.position.y = rs.y;
    obj.add(m);
    rings.push({ mesh: m, baseY: rs.y, tilt: rs.tilt });
  }

  // Tiny glowing minibrot jewel hovering at the apex of the zoom tunnel
  const gemGroup = new T.Group();
  gemGroup.position.set(0, 0.225, 0);
  const gemCore = new T.Mesh(new T.OctahedronGeometry(0.036, 0), cyanM);
  gemCore.scale.set(1.2, 0.65, 1.0);
  const gemBulb = new T.Mesh(new T.SphereGeometry(0.017, 12, 10), magM);
  gemBulb.position.x = -0.042;
  gemGroup.add(gemCore, gemBulb);
  obj.add(gemGroup);

  void col;
  return {
    obj: top,
    mats,
    tick(time) {
      const t = time || 0;
      for (let i = 0; i < rings.length; i++) {
        const r = rings[i];
        r.mesh.position.y = r.baseY + Math.sin(t * 1.4 + i * 1.3) * 0.012;
        r.mesh.rotation.z = t * (i % 2 === 0 ? 0.35 : -0.45);
      }
      gemGroup.rotation.y = t * 0.9;
      gemGroup.position.y = 0.225 + Math.sin(t * 1.8) * 0.014;
      obj.rotation.y = Math.sin(t * 0.35) * 0.18;
    }
  };
}
