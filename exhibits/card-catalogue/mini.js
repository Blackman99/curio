// Curio mini exhibit for the 3D hall: default export (THREE, colour) -> {obj, mats, tick(T,dt,h)}.
// obj fits a ~0.9-unit cube centred at the origin; mats are the parts that glow when the case is hovered;
// tick is skipped under prefers-reduced-motion, so the first pose must read well on its own.
// Card Catalogue: a hot-pink catalogue drawer full of pop-art index cards in yellow, cyan, white and black; one card rises out of the drawer and sinks back, the way a pulled card flies out on the page
export default function cardCatalogue(T, col) {
  const obj = new T.Group(), mats = [];
  const PINK = 0xff2e93, COLS = [0xffff1f, 0x18d4ff, 0xffffff, 0xffff1f, 0x121212, 0xffff1f, 0x18d4ff, 0xffff1f, 0xffffff, 0xffff1f, 0x18d4ff, 0xffff1f];
  const wood = new T.MeshStandardMaterial({ color: PINK, roughness: .55, metalness: .05, emissive: new T.Color(PINK).multiplyScalar(.12) });
  const inside = new T.MeshStandardMaterial({ color: 0xb81866, roughness: .7, metalness: 0 });
  const W = .44, D = .74, H = .13, t = .022;
  const box = (w, h, d, m, x, y, z) => { const b = new T.Mesh(new T.BoxGeometry(w, h, d), m); b.position.set(x, y, z); obj.add(b); return b; };
  box(W, t, D, inside, 0, t / 2, 0);
  box(t, H, D, wood, -W / 2 + t / 2, H / 2, 0); box(t, H, D, wood, W / 2 - t / 2, H / 2, 0);
  box(W, H, t, wood, 0, H / 2, -D / 2 + t / 2);
  const front = box(W, H * 1.08, t, wood, 0, H * .54, D / 2 - t / 2);
  // a black label holder with a white label on the drawer front
  box(.17, .052, .006, new T.MeshStandardMaterial({ color: 0x121212, roughness: .4 }), 0, H * .6, D / 2 + .002);
  box(.15, .036, .007, new T.MeshStandardMaterial({ color: 0xffffff, roughness: .6, emissive: 0xffffff, emissiveIntensity: .25 }), 0, H * .6, D / 2 + .003);
  // index cards with a coloured tab each; the cards lean back a little more the further back they stand
  const cw = W - 2 * t - .03, ch = .22, cards = [];
  const cardMat = c => new T.MeshStandardMaterial({ color: c, roughness: .8, metalness: 0, emissive: new T.Color(c).multiplyScalar(c === 0x121212 ? 0 : .22) });
  COLS.forEach((c, k) => {
    const g = new T.Group(), z = D / 2 - .09 - k * .05;
    const m = cardMat(c), card = new T.Mesh(new T.BoxGeometry(cw, ch, .006), m); card.position.y = ch / 2; g.add(card);
    const tm = cardMat(COLS[(k + 3) % COLS.length]); tm.emissiveIntensity = .3; mats.push(tm);
    const tab = new T.Mesh(new T.BoxGeometry(.08, .035, .007), tm); tab.position.set(-cw / 2 + .06 + (k % 4) * .085, ch + .0175, 0); g.add(tab);
    g.position.set(0, t, z); g.rotation.x = -.08 - k * .012; obj.add(g); cards.push(g);
  });
  // the pulled card: taller in the drawer, a black name bar like the page's cards
  const pulled = cards[3];
  const bar = new T.Mesh(new T.BoxGeometry(cw * .8, .045, .008), new T.MeshStandardMaterial({ color: 0x121212, roughness: .5 }));
  bar.position.set(0, ch * .62, .002); pulled.add(bar);
  const yr = new T.Mesh(new T.BoxGeometry(cw * .3, .02, .008), new T.MeshStandardMaterial({ color: 0x18d4ff, roughness: .5, emissive: 0x18d4ff, emissiveIntensity: .3 }));
  yr.position.set(cw * .22, ch * .42, .002); pulled.add(yr); mats.push(yr.material);
  const base = pulled.position.y;
  obj.rotation.x = .5; obj.rotation.y = -.42; obj.position.set(0, -.18, 0); obj.scale.setScalar(1.02);
  const tick = (time) => { const s = .5 - .5 * Math.cos(time * .9); pulled.position.y = base + .1 * s * s * (3 - 2 * s); };
  return { obj, mats, tick };
}
