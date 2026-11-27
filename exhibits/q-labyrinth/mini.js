// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Q Labyrinth: a tilted 4-shade pocket-LCD voxel maze cartridge with raised pixel brick walls, a Q-value heatmap floor, cliff cats, a glowing cheese wedge, and a tiny scurrying pixel mouse
export default function qLabyrinth(T, col) {
  const top = new T.Group(), obj = new T.Group(), mats = [];
  top.add(obj);
  obj.rotation.x = 0.68;
  obj.position.set(0, -0.09, 0.02);
  top.scale.setScalar(0.90);

  // 9x7 mini voxel maze matching Cat Alley silhouette
  const MW = 9, MH = 7, CELL = 0.068;
  const bw = MW * CELL, bh = MH * CELL;
  const ROWS = [
    '#########',
    '#.......#',
    '#.###.#.#',
    '#S.....C#',
    '#.XXXXX.#',
    '#.......#',
    '#########',
  ];

  // Outer pocket-LCD cartridge housing (dark green frame + bevel)
  const frameMat = new T.MeshStandardMaterial({ color: 0x164218, roughness: 0.58, metalness: 0.12 });
  const baseBox = new T.Mesh(new T.BoxGeometry(bw + 0.08, 0.055, bh + 0.08), frameMat);
  baseBox.position.y = -0.028;
  obj.add(baseBox);

  // 4-shade green Bayer-dithered Q-value heatmap floor texture (subdued color so hall lights don't blow out)
  const cv = document.createElement('canvas');
  cv.width = 144; cv.height = 112;
  const ctx = cv.getContext('2d');
  const img = ctx.createImageData(144, 112), d = img.data;
  const P = [[142, 160, 100], [108, 142, 68], [46, 98, 46], [22, 56, 22]];
  const B = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  for (let py = 0; py < 112; py++) {
    const r = (py / 16) | 0;
    for (let px = 0; px < 144; px++) {
      const c = (px / 16) | 0;
      const dist = Math.hypot(c - 7, r - 3);
      const t = Math.max(0, 1 - dist / 6.8);
      const sc = t * 2.5;
      const lo = Math.floor(sc), hi = Math.min(3, lo + 1);
      const sh = B[((py & 3) << 2) | (px & 3)] < Math.floor((sc - lo) * 16) ? hi : lo;
      const o = (py * 144 + px) * 4;
      d[o] = P[sh][0]; d[o + 1] = P[sh][1]; d[o + 2] = P[sh][2]; d[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const floorTex = new T.CanvasTexture(cv);
  floorTex.magFilter = floorTex.minFilter = T.NearestFilter;
  const floorMat = new T.MeshStandardMaterial({
    color: 0x8a9278,
    map: floorTex,
    emissive: new T.Color(0x28541e),
    emissiveMap: floorTex,
    emissiveIntensity: 0.04,
    roughness: 0.96,
    metalness: 0.0,
  });
  const floorMesh = new T.Mesh(new T.PlaneGeometry(bw, bh), floorMat);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.position.y = 0.002;
  obj.add(floorMesh);

  // Voxel walls (InstancedMesh)
  const wallCoords = [];
  const catCoords = [];
  for (let r = 0; r < MH; r++) {
    for (let c = 0; c < MW; c++) {
      const ch = ROWS[r][c];
      const wx = (c - (MW - 1) / 2) * CELL;
      const wz = (r - (MH - 1) / 2) * CELL;
      if (ch === '#') wallCoords.push([wx, wz]);
      else if (ch === 'X') catCoords.push([wx, wz]);
    }
  }
  const wallMat = new T.MeshStandardMaterial({ color: 0x245c26, roughness: 0.55, metalness: 0.08 });
  const wallGeo = new T.BoxGeometry(CELL * 0.94, 0.048, CELL * 0.94);
  const walls = new T.InstancedMesh(wallGeo, wallMat, wallCoords.length);
  const dm = new T.Object3D();
  wallCoords.forEach(([x, z], i) => {
    dm.position.set(x, 0.024, z);
    dm.updateMatrix();
    walls.setMatrixAt(i, dm.matrix);
  });
  walls.instanceMatrix.needsUpdate = true;
  walls.frustumCulled = false;
  obj.add(walls);

  // Cliff cats (tiny dark green voxel cubes + pointy ears)
  const catMat = new T.MeshStandardMaterial({ color: 0x0f320f, roughness: 0.45, metalness: 0.1 });
  const catBodyGeo = new T.BoxGeometry(CELL * 0.58, 0.038, CELL * 0.52);
  const catEarGeo = new T.BoxGeometry(CELL * 0.18, 0.022, CELL * 0.18);
  for (const [x, z] of catCoords) {
    const g = new T.Group();
    g.position.set(x, 0.02, z);
    g.add(new T.Mesh(catBodyGeo, catMat));
    const e1 = new T.Mesh(catEarGeo, catMat); e1.position.set(-0.013, 0.025, -0.008);
    const e2 = new T.Mesh(catEarGeo, catMat); e2.position.set(0.013, 0.025, -0.008);
    g.add(e1, e2);
    obj.add(g);
  }

  // Glowing pixel cheese wedge (goes in mats for hover glow)
  const cheeseMat = new T.MeshStandardMaterial({
    color: 0xb8dc58,
    emissive: new T.Color(col).multiplyScalar(0.55),
    emissiveIntensity: 0.35,
    roughness: 0.35,
  });
  mats.push(cheeseMat);
  const cheese = new T.Mesh(new T.CylinderGeometry(0.028, 0.032, 0.036, 3), cheeseMat);
  const cx = (7 - (MW - 1) / 2) * CELL, cz = (3 - (MH - 1) / 2) * CELL;
  cheese.position.set(cx, 0.026, cz);
  cheese.rotation.y = 0.4;
  obj.add(cheese);

  // Cute voxel mouse with glowing phosphor highlight (animated along the alley path)
  const mouseMat = new T.MeshStandardMaterial({
    color: 0xcce290,
    emissive: new T.Color(0x74b840),
    emissiveIntensity: 0.25,
    roughness: 0.4,
  });
  mats.push(mouseMat);
  const mouse = new T.Group();
  const mBody = new T.Mesh(new T.BoxGeometry(0.044, 0.028, 0.032), mouseMat);
  const mEar1 = new T.Mesh(new T.BoxGeometry(0.016, 0.018, 0.010), mouseMat);
  const mEar2 = new T.Mesh(new T.BoxGeometry(0.016, 0.018, 0.010), mouseMat);
  mEar1.position.set(0.008, 0.018, -0.013);
  mEar2.position.set(0.008, 0.018, 0.013);
  mouse.add(mBody, mEar1, mEar2);
  const sx = (1 - (MW - 1) / 2) * CELL, sz = (3 - (MH - 1) / 2) * CELL;
  mouse.position.set(sx + CELL * 2.2, 0.022, sz);
  obj.add(mouse);

  // Path waypoints across the alley
  const path = [[1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [6, 2], [6, 1], [4, 1], [1, 1], [1, 2], [1, 3]];

  return {
    obj: top,
    mats,
    tick(t) {
      cheese.position.y = 0.026 + Math.sin(t * 3.0) * 0.005;
      cheese.rotation.y = 0.4 + t * 0.9;
      const u = ((t * 0.55) % 1) * (path.length - 1);
      const i = Math.floor(u), f = u - i;
      const a = path[i], b = path[i + 1];
      const gc = a[0] + (b[0] - a[0]) * f;
      const gr = a[1] + (b[1] - a[1]) * f;
      mouse.position.set((gc - (MW - 1) / 2) * CELL, 0.022 + Math.abs(Math.sin(t * 14)) * 0.005, (gr - (MH - 1) / 2) * CELL);
      mouse.rotation.y = Math.atan2(-(b[1] - a[1]), b[0] - a[0]);
      obj.rotation.z = Math.sin(t * 0.7) * 0.04;
    },
  };
}
