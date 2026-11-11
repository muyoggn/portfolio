// =============================================================
// 3D の「浮かぶ森の小島」をつくるファイルです（three.js を使用）。
//
// three.js は、ブラウザの 3D 描画機能（WebGL）を簡単に使えるようにするライブラリです。
// 3D は次の 4 つがそろうと表示できます。
//
//   Scene（シーン）     … 3D の舞台。ここに物を置いていく
//   Camera（カメラ）    … どこから舞台を見るか
//   Light（ライト）     … 光。これがないと真っ暗
//   Renderer（描画係）  … カメラから見た舞台を、<canvas> に絵として描く
//
// 物（Mesh）は「形（Geometry）」と「材質（Material＝色や光の反射）」の組み合わせでできています。
// このファイルの物はすべて、three.js に最初から入っている基本の形（円柱・円すい・多面体・箱）を
// 組み合わせて作っています。外部の 3D モデルファイルを読み込まないので、軽いままです。
//
// このファイルは ForestIsland.tsx から「必要になったときだけ」読み込まれます。
// =============================================================

import {
  AdditiveBlending,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  DodecahedronGeometry,
  Group,
  HemisphereLight,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  NormalBlending,
  PerspectiveCamera,
  PointLight,
  Points,
  PointsMaterial,
  Scene,
  SphereGeometry,
  WebGLRenderer,
} from "three";

export type Theme = "light" | "dark";

// ---- 色（昼の森と夜の森）。globals.css の色合いに合わせています ----
const PALETTE = {
  light: {
    grass: "#6fae6b",
    soil: "#8a6a4a",
    trunk: "#7a5a3e",
    leaves: ["#3f8a55", "#5aa36a", "#7cc48f"],
    pine: "#2f7a4a",
    rock: "#a9b0a6",
    pot: "#c8774e",
    laptop: "#3a403c",
    screen: "#bff0cb",
    sky: "#fffbe6",
    ground: "#6d8a6f",
    hemi: 1.6,
    sun: 2.2,
    glow: 0,
    particle: "#fff3b8",
    particleOpacity: 0.7,
  },
  dark: {
    grass: "#234f35",
    soil: "#4a3a2c",
    trunk: "#3f3022",
    leaves: ["#1d4a30", "#25603d", "#2f7a4a"],
    pine: "#183d28",
    rock: "#4a524c",
    pot: "#6b4030",
    laptop: "#1a1f1c",
    screen: "#7cc48f",
    sky: "#6f8fbf",
    ground: "#0b1a11",
    hemi: 0.8,
    sun: 0.7,
    glow: 3,
    particle: "#d8ff7a",
    particleOpacity: 1,
  },
} as const;

// 毎回同じ結果になる「乱数っぽい数」をつくる関数（表示が毎回変わらないように）
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

// 形の頂点（かど）を少しずつランダムにずらして、ゴツゴツした「ローポリ」風にする。
// 同じ場所にある頂点は同じだけずらすので、形に穴があきません。
function roughen<T extends BufferGeometry>(geo: T, amount: number, seed: number): T {
  const rand = seeded(seed);
  const pos = geo.getAttribute("position") as BufferAttribute;
  const moved = new Map<string, [number, number, number]>();
  for (let i = 0; i < pos.count; i++) {
    // 同じ場所にある頂点は同じだけ動かす（別々に動かすと面と面の間にすき間ができる）。
    // 円の継ぎ目では sin(2π) が「-0.000…」になり、"0.000" と別の場所あつかいされてすき間ができていたので、
    // 小数 3 桁に丸めてから +0 して、-0 を 0 にそろえる
    const r3 = (v: number) => Math.round(v * 1000) / 1000 + 0;
    const key = `${r3(pos.getX(i))},${r3(pos.getY(i))},${r3(pos.getZ(i))}`;
    let d = moved.get(key);
    if (!d) {
      d = [(rand() - 0.5) * amount, (rand() - 0.5) * amount, (rand() - 0.5) * amount];
      moved.set(key, d);
    }
    pos.setXYZ(i, pos.getX(i) + d[0], pos.getY(i) + d[1], pos.getZ(i) + d[2]);
  }
  geo.computeVertexNormals();
  return geo;
}

export function createIslandScene(
  container: HTMLElement,
  { reducedMotion, theme }: { reducedMotion: boolean; theme: Theme },
) {
  // ---- 描画係（Renderer）。alpha: true で背景を透明にし、ページの背景が透けて見えるようにする ----
  const renderer = new WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 高精細画面でも重くなりすぎないよう 2 倍まで
  renderer.domElement.style.display = "block";
  container.appendChild(renderer.domElement);

  const scene = new Scene();
  const camera = new PerspectiveCamera(32, 1, 0.1, 60);
  camera.position.set(0, 3.2, 11.5);
  camera.lookAt(0, 0.1, 0);

  // ---- 光 ----
  const hemi = new HemisphereLight(); // 空からの光と地面からの照り返し（全体をやわらかく照らす）
  const sun = new DirectionalLight(); // 太陽の光（一方向から）
  sun.position.set(4, 7, 5);
  const glow = new PointLight(PALETTE.dark.screen, 0, 3, 1.5); // 夜だけ光るノートPCの画面の明かり
  glow.position.set(0.45, 0.75, 1.4);
  scene.add(hemi, sun, glow);

  // ---- 材質（色ごとに 1 つ作り、テーマが変わったら色だけ差し替える） ----
  const mat = (flat = true) => new MeshStandardMaterial({ flatShading: flat, roughness: 0.9 });
  const m = {
    grass: mat(),
    soil: mat(),
    trunk: mat(),
    leaves: [mat(), mat(), mat()],
    pine: mat(),
    rock: mat(),
    pot: mat(),
    laptop: mat(false),
    screen: new MeshBasicMaterial(), // 光の影響を受けない＝自分で光っているように見える
  };

  // 小島全体をまとめるグループ。これを回すと、上に乗った物も一緒に回る
  const island = new Group();
  scene.add(island);
  const add = (geo: BufferGeometry, material: MeshStandardMaterial | MeshBasicMaterial, x: number, y: number, z: number, parent: Group = island) => {
    const mesh = new Mesh(geo, material);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  };

  // 地面（草の生えた上面）と、その下の土のかたまり（逆さの円すい）
  add(roughen(new CylinderGeometry(2.5, 2.3, 0.45, 11, 1), 0.12, 1), m.grass, 0, 0, 0);
  // 土台の上の面は草地の中に少しもぐらせ、草地との間にすき間が見えないようにする
  const soil = add(roughen(new ConeGeometry(2.3, 2.8, 11, 3), 0.28, 2), m.soil, 0, -1.47, 0);
  soil.rotation.x = Math.PI;

  // 大きな木：幹＋葉のかたまり 3 つ（葉のかたまりは、風でゆれるように別のグループに）
  add(new CylinderGeometry(0.13, 0.22, 1.7, 6), m.trunk, -0.6, 1.05, -0.5);
  const crown = new Group();
  crown.position.set(-0.6, 1.9, -0.5);
  island.add(crown);
  add(roughen(new IcosahedronGeometry(0.95, 0), 0.12, 3), m.leaves[0], 0, 0.4, 0, crown);
  add(roughen(new IcosahedronGeometry(0.7, 0), 0.1, 4), m.leaves[1], 0.6, 0.05, 0.25, crown);
  add(roughen(new IcosahedronGeometry(0.62, 0), 0.1, 5), m.leaves[2], -0.55, 0, 0.1, crown);

  // とがった針葉樹（円すいを 3 段重ねる）
  const pine = (x: number, z: number, s: number) => {
    add(new CylinderGeometry(0.06 * s, 0.08 * s, 0.4 * s, 5), m.trunk, x, 0.4 * s, z);
    [0, 1, 2].forEach((i) => {
      const r = (0.55 - i * 0.14) * s;
      add(roughen(new ConeGeometry(r, 0.7 * s, 7), 0.04, 10 + i), m.pine, x, (0.75 + i * 0.38) * s, z);
    });
  };
  pine(1.45, -0.9, 1.1);
  pine(1.85, 0.2, 0.75);
  pine(-1.75, 0.5, 0.8);

  // 岩
  add(roughen(new DodecahedronGeometry(0.32, 0), 0.08, 20), m.rock, 1.25, 0.3, 1.25);
  add(roughen(new DodecahedronGeometry(0.2, 0), 0.06, 21), m.rock, -1.5, 0.28, 1.25);

  // 小さな草むら
  const rand = seeded(42);
  for (let i = 0; i < 9; i++) {
    const a = rand() * Math.PI * 2;
    const r = 0.8 + rand() * 1.4;
    const blade = add(new ConeGeometry(0.07, 0.35, 4), m.leaves[2], Math.cos(a) * r, 0.38, Math.sin(a) * r);
    blade.rotation.z = (rand() - 0.5) * 0.5;
  }

  // ノートPC（エンジニアらしさ）：本体の板＋少し倒した画面＋光る画面
  const laptop = new Group();
  laptop.position.set(0.35, 0.25, 1.15);
  laptop.rotation.y = -0.35;
  island.add(laptop);
  add(new BoxGeometry(0.8, 0.05, 0.55), m.laptop, 0, 0.03, 0, laptop);
  const lid = new Group();
  lid.position.set(0, 0.05, -0.27);
  lid.rotation.x = -0.25;
  laptop.add(lid);
  add(new BoxGeometry(0.8, 0.52, 0.04), m.laptop, 0, 0.26, 0, lid);
  add(new BoxGeometry(0.7, 0.42, 0.01), m.screen, 0, 0.26, 0.025, lid);

  // 鉢植えの観葉植物（趣味）：テラコッタの鉢＋丸い葉
  const potted = new Group();
  potted.position.set(1.0, 0.25, 0.55);
  island.add(potted);
  add(new CylinderGeometry(0.17, 0.12, 0.28, 8), m.pot, 0, 0.14, 0, potted);
  [
    [0, 0.42, 0, 0.17],
    [0.13, 0.36, 0.06, 0.13],
    [-0.12, 0.35, -0.04, 0.12],
  ].forEach(([x, y, z, r], i) => add(roughen(new IcosahedronGeometry(r, 0), 0.03, 30 + i), m.leaves[1], x, y, z, potted));

  // ---- 昼だけ咲く小さな花 ----
  // 地面から芽（茎）が伸び → つぼみの花びらが開き → しばらく咲いて → また閉じて地面に戻る、をくり返します。
  // 夜（ダークモード）は花が閉じて地面に隠れ、代わりに蛍が光ります。
  //
  // 花びらの動かし方：花びらを「ちょうつがい（pivot）」のグループに入れ、
  // ちょうつがいの角度を「上向き（つぼみ）」→「横向き（満開）」へ変えると、花が開いて見えます。
  //
  // 自然に見せる工夫：
  //   ・花は 4〜5 本だけ、あちこちにポツポツ生える。位置はばらばら（シード付き乱数）
  //   ・いっせいには咲かず、1 本ずつ順番に。芽が出て開くまでは 1.5 秒ほどと速め
  //   ・茎の高さ、花の大きさ、花びらの枚数（5 か 6）、傾きも 1 本ずつ違う
  //   ・茎には葉が付き、根元にも小さな葉が広がる
  //   ・咲いている時間（周期）も 1 本ずつ違うので、2 回目以降もいっせいに同じ動きをしない
  const FLOWER_COLORS = ["#ffffff", "#f6b4c6", "#ffd45e", "#c9b6f2"];
  const petalMats = FLOWER_COLORS.map((c) => new MeshStandardMaterial({ color: c, roughness: 0.7 }));
  const centerMat = new MeshStandardMaterial({ color: "#e3a13a", roughness: 0.6 });
  const stemGeo = new CylinderGeometry(0.016, 0.024, 1, 5).translate(0, 0.5, 0); // 高さ 1、根元が (0,0,0)。高さは scale で変える
  // 花びら：球を平たく細長くつぶし、根元がちょうつがいの位置に来るように少しずらす
  const petalGeo = new SphereGeometry(0.075, 8, 5).scale(1, 0.3, 1.7).translate(0, 0, 0.115);
  const centerGeo = new SphereGeometry(0.05, 8, 6);
  // 葉：花びらと同じ作り方で、細長い葉っぱの形にする
  const leafGeo = new SphereGeometry(0.05, 6, 4).scale(0.8, 0.25, 2.4).translate(0, 0, 0.11);
  const OPEN = -0.2; // 満開のときの花びらの角度（ほぼ横向き）
  const CLOSED = -1.4; // つぼみのときの角度（上向きに閉じている）

  // 花を植えてはいけない場所（木・針葉樹・岩・ノートPC・鉢植え）。[x, z, 半径]
  const blocked = [
    [-0.6, -0.5, 0.65], [0.35, 1.15, 0.6], [1.0, 0.55, 0.35], [1.45, -0.9, 0.5],
    [1.85, 0.2, 0.4], [-1.75, 0.5, 0.45], [1.25, 1.25, 0.4], [-1.5, 1.25, 0.3],
  ];
  const free = (x: number, z: number) =>
    Math.hypot(x, z) < 2.25 && blocked.every(([bx, bz, br]) => Math.hypot(x - bx, z - bz) > br);

  const fr = seeded(7);
  const spots: { x: number; z: number; color: number; delay: number }[] = [];
  // 花は 4〜5 本だけ、小島のあちこちにポツポツと。近くに固まらないよう、ほかの花から 0.8 以上はなす
  const count = 4 + Math.floor(fr() * 2);
  let nextDelay = 0.3; // 最初の花が咲き始めるまでの秒数
  for (let tries = 0; spots.length < count && tries < 400; tries++) {
    const a = fr() * Math.PI * 2;
    const rad = 0.5 + fr() * 1.7;
    const x = Math.cos(a) * rad;
    const z = Math.sin(a) * rad;
    if (!free(x, z) || spots.some((s2) => Math.hypot(s2.x - x, s2.z - z) < 0.8)) continue;
    spots.push({ x, z, color: Math.floor(fr() * FLOWER_COLORS.length), delay: nextDelay });
    nextDelay += 0.9 + fr() * 1.4; // 次の花は 0.9〜2.3 秒あとに、1 本ずつ順番に咲く
  }

  const flowers = spots.map(({ x, z, color, delay }) => {
    const height = 0.22 + fr() * 0.3;
    const petals = fr() < 0.7 ? 5 : 6;
    const g = new Group();
    g.position.set(x, 0.22, z);
    g.rotation.set((fr() - 0.5) * 0.35, fr() * Math.PI * 2, (fr() - 0.5) * 0.35); // 少しずつ傾いて生える
    island.add(g);
    const stem = new Mesh(stemGeo, m.leaves[2]);
    stem.scale.y = height;
    g.add(stem);
    // 葉：茎の途中に 1〜2 枚、根元に 2〜3 枚
    const leafAt = (y: number, tilt: number, size: number) => {
      const pivot = new Group();
      pivot.rotation.order = "YXZ";
      pivot.position.y = y;
      pivot.rotation.y = fr() * Math.PI * 2;
      pivot.rotation.x = tilt;
      const leaf = new Mesh(leafGeo, m.leaves[fr() < 0.5 ? 1 : 2]);
      leaf.scale.setScalar(size);
      pivot.add(leaf);
      g.add(pivot);
    };
    const stemLeaves = 1 + Math.floor(fr() * 2);
    for (let k = 0; k < stemLeaves; k++) leafAt(height * (0.25 + fr() * 0.35), -0.7 - fr() * 0.4, 0.7 + fr() * 0.4);
    const baseLeaves = 2 + Math.floor(fr() * 2);
    for (let k = 0; k < baseLeaves; k++) leafAt(0.01, -0.15 - fr() * 0.25, 0.9 + fr() * 0.5);

    const head = new Group(); // 茎の先（花がつく場所）
    head.position.y = height;
    head.rotation.x = (fr() - 0.5) * 0.5; // 花も少し横を向く
    g.add(head);
    const offset = fr() * Math.PI;
    const pivots = Array.from({ length: petals }, (_, k) => {
      const pivot = new Group();
      pivot.rotation.order = "YXZ"; // 先に向き（Y）を決めてから、開き具合（X）を傾ける
      pivot.rotation.y = offset + (k / petals) * Math.PI * 2;
      pivot.add(new Mesh(petalGeo, petalMats[color]));
      head.add(pivot);
      return pivot;
    });
    const center = new Mesh(centerGeo, centerMat);
    head.add(center);
    return {
      g, head, pivots, center, delay,
      bloomSize: 0.75 + fr() * 0.45, // 花の大きさ
      cycle: 15 + fr() * 10, // 咲いて閉じるまでの周期（秒）
      sway: fr() * 10,
    };
  });

  // 0〜1 の範囲で、なめらかに増える値（動きの始まりと終わりをゆっくりにする）
  const ease = (v: number) => {
    const c = Math.min(1, Math.max(0, v));
    return c * c * (3 - 2 * c);
  };

  // ある花の、ある時刻での「茎の伸び（grow）」と「花の開き（open）」を計算する
  // 動きの長さ（秒）。芽が出て開くまでは速く、咲いている時間は長く
  const SPROUT = 0.9; // 芽が出て茎が伸びる
  const OPEN_TIME = 0.6; // 花びらが開く
  const CLOSE_TIME = 1.6; // 閉じて地面に戻る

  // ある花の、ある時刻での「茎の伸び（grow）」と「花の開き（open）」を計算する
  function flowerState(time: number, cycle: number) {
    if (time < 0) return { grow: 0, open: 0 };
    const t = time % cycle;
    if (t < SPROUT) return { grow: ease(t / SPROUT), open: 0 }; // 芽が出て茎が伸びる
    if (t < SPROUT + OPEN_TIME) return { grow: 1, open: ease((t - SPROUT) / OPEN_TIME) }; // 花びらがパッと開く
    if (t < cycle - CLOSE_TIME) return { grow: 1, open: 1 }; // 咲いている
    const q = ease((t - (cycle - CLOSE_TIME)) / CLOSE_TIME); // 閉じて、地面に戻る
    return { grow: 1 - q, open: 1 - q };
  }

  let bloomClock = 0; // 花の時計（画面に見えている間だけ進む）
  let isDay = theme === "light";
  let day = isDay ? 1 : 0; // 昼らしさ 0〜1（テーマが変わったら少しずつ変える）

  function updateFlowers() {
    flowers.forEach((f) => {
      // 「動きを減らす」設定では、最初から満開で止めておく
      const { grow, open } = reducedMotion ? { grow: 1, open: 1 } : flowerState(bloomClock - f.delay, f.cycle);
      const size = grow * day;
      f.g.visible = size > 0.001;
      f.g.scale.setScalar(Math.max(0.001, size));
      f.head.scale.setScalar((0.4 + 0.6 * open) * f.bloomSize);
      const angle = CLOSED + (OPEN - CLOSED) * open;
      f.pivots.forEach((pv) => (pv.rotation.x = angle));
      f.center.scale.setScalar(open);
      if (!reducedMotion) f.head.rotation.z = Math.sin(bloomClock * 1.3 + f.sway) * 0.08; // 風でゆれる
    });
  }

  // ---- 光の粒（昼は花粉、夜は蛍）。たくさんの点を 1 つの物としてまとめて描く（Points） ----
  const COUNT = 45;
  const base = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    const a = rand() * Math.PI * 2;
    const r = 0.8 + rand() * 2.6;
    base.set([Math.cos(a) * r, 0.3 + rand() * 3, Math.sin(a) * r], i * 3);
  }
  const particleGeo = new BufferGeometry();
  particleGeo.setAttribute("position", new BufferAttribute(base.slice(), 3));
  const particleMat = new PointsMaterial({ size: 0.07, transparent: true, depthWrite: false });
  const particles = new Points(particleGeo, particleMat);
  island.add(particles);

  // ---- テーマ（昼/夜）に合わせて色と光の強さを切り替える ----
  function setTheme(t: Theme) {
    const p = PALETTE[t];
    m.grass.color.set(p.grass);
    m.soil.color.set(p.soil);
    m.trunk.color.set(p.trunk);
    m.leaves.forEach((l, i) => l.color.set(p.leaves[i]));
    m.pine.color.set(p.pine);
    m.rock.color.set(p.rock);
    m.pot.color.set(p.pot);
    m.laptop.color.set(p.laptop);
    m.screen.color.set(p.screen);
    hemi.color = new Color(p.sky);
    hemi.groundColor = new Color(p.ground);
    hemi.intensity = p.hemi;
    sun.intensity = p.sun;
    glow.intensity = p.glow;
    particleMat.color.set(p.particle);
    particleMat.opacity = p.particleOpacity;
    // 夜は光を「足し算」で重ねて、蛍がぼんやり光って見えるようにする
    particleMat.blending = t === "dark" ? AdditiveBlending : NormalBlending;
    particleMat.size = t === "dark" ? 0.1 : 0.06;
    particleMat.needsUpdate = true;
    // 夜から昼に変わったら、花をもう一度「芽」から咲かせる
    if (t === "light" && !isDay) bloomClock = 0;
    isDay = t === "light";
    if (reducedMotion) day = isDay ? 1 : 0;
    updateFlowers();
    render();
  }

  // ---- 大きさ：入れ物（container）の大きさが変わったら、描く大きさとカメラの縦横比を合わせる ----
  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    render();
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);

  // ---- さわって動かす：ドラッグで回す / マウスの位置で少し傾く / 矢印キーでも回せる ----
  let spin = 0; // ドラッグで足した回転
  let velocity = 0; // 指を離したあとも少し回り続けるための速さ（慣性）
  let dragging = false;
  let lastX = 0;
  const tilt = { x: 0, y: 0 }; // マウスの位置（-1〜1）
  const el = renderer.domElement;

  const onDown = (e: PointerEvent) => {
    dragging = true;
    lastX = e.clientX;
    velocity = 0;
    el.setPointerCapture(e.pointerId);
    container.dataset.dragging = "true";
  };
  const onMove = (e: PointerEvent) => {
    const rect = el.getBoundingClientRect();
    tilt.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    tilt.y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    if (!dragging) return;
    const dx = (e.clientX - lastX) * 0.01;
    lastX = e.clientX;
    spin += dx;
    velocity = dx;
    render();
  };
  const onUp = () => {
    dragging = false;
    delete container.dataset.dragging;
  };
  const onLeave = () => {
    tilt.x = 0;
    tilt.y = 0;
  };
  el.addEventListener("pointerdown", onDown);
  el.addEventListener("pointermove", onMove);
  el.addEventListener("pointerup", onUp);
  el.addEventListener("pointercancel", onUp);
  el.addEventListener("pointerleave", onLeave);
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      velocity = e.key === "ArrowLeft" ? -0.08 : 0.08;
    }
  };
  container.addEventListener("keydown", onKey);

  // ---- 毎フレームの動き ----
  const start = performance.now();
  let autoAngle = 0;
  let last = start;
  function frame(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = (now - start) / 1000;

    if (!dragging) {
      spin += velocity;
      velocity *= 0.94; // 少しずつ減速
    }
    if (!reducedMotion) autoAngle += dt * 0.18; // ゆっくり自動で回る

    // スクロール連動：ページを下に進むほど、小島も少し回って見える角度が変わる
    const scroll = reducedMotion ? 0 : window.scrollY * 0.0012;
    island.rotation.y = -0.5 + autoAngle + spin + scroll;
    // マウスの位置に合わせて、ふわっと傾く（目標の角度に少しずつ近づける）
    island.rotation.x += (tilt.y * 0.12 - island.rotation.x) * 0.06;
    island.rotation.z += (-tilt.x * 0.06 - island.rotation.z) * 0.06;

    // 花：昼らしさ（day）を目標に少しずつ近づけ、花の時計を進める
    day += ((isDay ? 1 : 0) - day) * (reducedMotion ? 1 : 0.04);
    bloomClock += dt;
    updateFlowers();

    if (!reducedMotion) {
      island.position.y = Math.sin(t * 0.9) * 0.08; // 浮かんでいるように上下する
      crown.rotation.z = Math.sin(t * 1.3) * 0.04; // 葉が風でゆれる
      // 光の粒をゆらゆら漂わせる
      const pos = particleGeo.getAttribute("position") as BufferAttribute;
      for (let i = 0; i < COUNT; i++) {
        pos.setXYZ(
          i,
          base[i * 3] + Math.sin(t * 0.6 + i) * 0.15,
          base[i * 3 + 1] + Math.sin(t * 0.8 + i * 1.7) * 0.2,
          base[i * 3 + 2] + Math.cos(t * 0.5 + i) * 0.15,
        );
      }
      pos.needsUpdate = true;
    }
    render();
  }

  function render() {
    renderer.render(scene, camera);
  }

  setTheme(theme);
  resize();

  return {
    setTheme,
    // 画面に見えている間だけ動かす（見えないときは止めて、電池と CPU を節約）
    play: () => renderer.setAnimationLoop(frame),
    pause: () => renderer.setAnimationLoop(null),
    // 部品が消えるときの後片付け（メモリを解放する）
    dispose() {
      renderer.setAnimationLoop(null);
      resizeObserver.disconnect();
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("pointerleave", onLeave);
      container.removeEventListener("keydown", onKey);
      scene.traverse((obj) => {
        if (obj instanceof Mesh || obj instanceof Points) obj.geometry.dispose();
      });
      [...Object.values(m).flat(), particleMat, ...petalMats, centerMat].forEach((x) => x.dispose());
      renderer.dispose();
      el.remove();
    },
  };
}
