// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Road Bike: a Swiss-red and matte-carbon 700c road bicycle on a crisp drafting plinth with a glowing red steer-axis laser and ground trail bar, spinning its spoked wheels and chainring while gently self-steering
export default function roadBike(T, col) {
  const obj = new T.Group(), mats = [];
  const M = (c, o = {}) => new T.MeshStandardMaterial({ color: c, roughness: .42, metalness: .25, ...o });
  const redM = M(0xdc1c24, { emissive: new T.Color(0xdc1c24).multiplyScalar(.22), roughness: .32, metalness: .18 });
  const carbonM = M(0x1f2229, { roughness: .45, metalness: .18 });
  const alloyM = M(0xcbd0d8, { roughness: .24, metalness: .86 });
  const plinthM = M(0x8c8a84, { roughness: .82, metalness: .04 });
  const laserM = M(0xff2a32, { emissive: new T.Color(0xff2a32).multiplyScalar(.55), roughness: .25, metalness: .1 });
  mats.push(redM, laserM);

  const s = 0.44; // scale: 1 m real bike -> 0.44 hall units (wheelbase ~0.44, total length ~0.74)
  const root = new T.Group();
  const roll = new T.Group();
  root.add(roll);

  const tube = (a, b, r, mat) => {
    const va = new T.Vector3(...a), vb = new T.Vector3(...b);
    const len = va.distanceTo(vb);
    const g = new T.CylinderGeometry(r, r, len, 10);
    const m = new T.Mesh(g, mat);
    m.position.copy(va).add(vb).multiplyScalar(.5);
    m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
    return m;
  };

  const rW = 0.339 * s, wb = 1.00 * s, bbX = 0.409 * s, bbY = 0.267 * s;
  const stX = 0.255 * s, stY = 0.769 * s, sadX = 0.194 * s, sadY = 0.960 * s;
  const htTopX = 0.789 * s, htTopY = 0.842 * s, htBotX = 0.842 * s, htBotY = 0.678 * s;
  const steerGndX = 1.063 * s;

  const makeWheel = () => {
    const wg = new T.Group();
    wg.add(new T.Mesh(new T.TorusGeometry(rW - 0.014 * s, 0.015 * s, 10, 32), carbonM));
    wg.add(new T.Mesh(new T.TorusGeometry(rW - 0.036 * s, 0.012 * s, 8, 32), M(0x2c3038, { roughness: .35, metalness: .3 })));
    const hub = new T.Mesh(new T.CylinderGeometry(0.018 * s, 0.018 * s, 0.07 * s, 12), alloyM);
    hub.rotation.x = Math.PI / 2; wg.add(hub);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI;
      const sp = new T.Mesh(new T.CylinderGeometry(0.0025 * s, 0.0025 * s, (rW - 0.038 * s) * 2, 5), alloyM);
      sp.rotation.z = a; wg.add(sp);
    }
    return wg;
  };

  const rw = makeWheel(); rw.position.set(0, rW, 0); roll.add(rw);
  // Cassette & chainring
  const cass = new T.Mesh(new T.CylinderGeometry(0.055 * s, 0.025 * s, 0.034 * s, 14), alloyM);
  cass.rotation.x = Math.PI / 2; cass.position.set(0, rW, 0.036 * s); roll.add(cass);
  const ring = new T.Mesh(new T.CylinderGeometry(0.102 * s, 0.102 * s, 0.010 * s, 20), M(0x363a42, { metalness: .8, roughness: .28 }));
  ring.rotation.x = Math.PI / 2; ring.position.set(bbX, bbY, 0.044 * s); roll.add(ring);

  // Diamond frame in Swiss red
  roll.add(
    tube([htBotX, htBotY, 0], [htTopX, htTopY, 0], 0.022 * s, redM),
    tube([bbX, bbY, 0], [htBotX, htBotY + 0.02 * s, 0], 0.022 * s, redM),
    tube([stX, stY, 0], [htTopX, htTopY - 0.02 * s, 0], 0.017 * s, redM),
    tube([bbX, bbY, 0], [stX, stY, 0], 0.017 * s, redM),
    tube([0, rW, 0.042 * s], [stX + 0.018 * s, stY - 0.05 * s, 0.012 * s], 0.009 * s, redM),
    tube([0, rW, -0.042 * s], [stX + 0.018 * s, stY - 0.05 * s, -0.012 * s], 0.009 * s, redM),
    tube([0, rW, 0.042 * s], [bbX, bbY, 0.026 * s], 0.011 * s, redM),
    tube([0, rW, -0.042 * s], [bbX, bbY, -0.026 * s], 0.011 * s, redM),
    tube([stX, stY, 0], [sadX, sadY, 0], 0.013 * s, carbonM),
  );
  const saddle = new T.Mesh(new T.BoxGeometry(0.24 * s, 0.024 * s, 0.11 * s), carbonM);
  saddle.position.set(sadX, sadY + 0.012 * s, 0); roll.add(saddle);

  // Steer group (fork + front wheel + drop handlebars pivoting around exact 72° steer axis)
  const lam = 18 * Math.PI / 180;
  const steerPivot = new T.Group();
  steerPivot.position.set(htBotX, htBotY, 0);
  steerPivot.rotation.z = lam;
  const steer = new T.Group();
  steerPivot.add(steer);
  roll.add(steerPivot);

  const fw = makeWheel();
  const dx = wb - htBotX, dy = rW - htBotY;
  const lx = dx * Math.cos(lam) + dy * Math.sin(lam), ly = -dx * Math.sin(lam) + dy * Math.cos(lam);
  fw.position.set(lx, ly, 0);
  steer.add(fw);
  for (const side of [-1, 1]) {
    steer.add(tube([0, 0, side * 0.024 * s], [lx, ly, side * 0.044 * s], 0.012 * s, carbonM));
  }
  const topLocalY = Math.hypot(htTopX - htBotX, htTopY - htBotY) + 0.03 * s;
  steer.add(tube([0, topLocalY, 0], [0.10 * s, topLocalY + 0.015 * s, 0], 0.015 * s, carbonM));
  const bar = new T.Mesh(new T.CylinderGeometry(0.013 * s, 0.013 * s, 0.36 * s, 10), carbonM);
  bar.rotation.x = Math.PI / 2; bar.position.set(0.10 * s, topLocalY + 0.015 * s, 0);
  steer.add(bar);
  for (const side of [-1, 1]) {
    const drop = new T.Mesh(new T.TorusGeometry(0.062 * s, 0.012 * s, 8, 14, Math.PI), carbonM);
    drop.position.set(0.10 * s, topLocalY - 0.048 * s, side * 0.18 * s);
    drop.rotation.z = -Math.PI / 2;
    steer.add(drop);
  }

  // Glowing Swiss red steer-axis ray & ground trail indicator
  roll.add(
    tube([htTopX, htTopY + 0.02 * s, 0], [steerGndX, 0.005, 0], 0.0045 * s, laserM),
    tube([wb, rW, 0], [wb, 0.005, 0], 0.003 * s, carbonM),
  );
  const trailBar = new T.Mesh(new T.BoxGeometry(Math.max(0.02, steerGndX - wb), 0.009, 0.024), laserM);
  trailBar.position.set(0.5 * (wb + steerGndX), 0.006, 0);
  roll.add(trailBar);

  // Compact Swiss drafting plinth
  const plinth = new T.Mesh(new T.BoxGeometry(0.76, 0.022, 0.20), plinthM);
  plinth.position.set(0.5 * wb, -0.011, 0);
  root.add(plinth);

  // Center around origin & seat plinth cleanly above the velvet pedestal
  root.position.set(-0.5 * wb, -0.34, 0);
  const stage = new T.Group();
  stage.add(root);
  stage.rotation.y = -0.34;
  stage.rotation.x = 0.08;
  obj.add(stage);

  let ang = 0;
  return {
    obj, mats,
    tick(t, dt) {
      const d = dt || 0.016;
      ang += d * 3.8;
      rw.rotation.z = -ang;
      fw.rotation.z = -ang;
      ring.rotation.y = -ang * 0.34;
      const sway = Math.sin(t * 1.4) * 0.07;
      roll.rotation.x = sway;
      steer.rotation.y = -sway * 1.9;
    },
  };
}
