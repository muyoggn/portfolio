import { seeded } from "@/lib/random";

// =============================================================
// 「神秘的なジャングル」の奥行きをつくる部品です。すべて SVG と CSS で描いています。
//
// 参考にしたのは「フラットデザインのジャングルの絵」の描き方です（絵そのものは使っていません）。
//   ・色は緑の濃さだけで描き分ける（黒は使わない）。奥ほど淡く、手前ほど濃い緑
//   ・木の幹は細長く、ゆるく弓なりに曲がり、根元は霧に溶けて見えなくなる
//   ・上からはヤシの葉がカーテンのようにたれ下がり、下の角からはシダと草むらが生える
//
// 重ねる順番（奥 → 手前）
//   1. 木の幹 3 層（遠く・中くらい・手前）… JungleTrunks
//   2. 霧と光                                … JungleMist
//   3. たれ下がるツル                        … Lianas
//   4. 手前の葉（ヤシ・シダ・草むら）        … JungleSilhouettes
//
// 形は「シード付き乱数」で 1 本ずつばらばらに作っています（毎回同じ形になるので表示がずれない）。
// 色は globals.css の --trunk-* / --canopy-* / --bush-* などで、昼と夜で切り替わります。
// =============================================================

const W = 1440;
const H = 900;

type Rand = ReturnType<typeof seeded>;
type Pt = [number, number];

// 2 次ベジェ曲線（始点 p0・制御点 p1・終点 p2）の t の場所と、そこでの向き
function bez(p0: Pt, p1: Pt, p2: Pt, t: number): Pt {
  const u = 1 - t;
  return [u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]];
}
function bezDir(p0: Pt, p1: Pt, p2: Pt, t: number): Pt {
  const dx = 2 * (1 - t) * (p1[0] - p0[0]) + 2 * t * (p2[0] - p1[0]);
  const dy = 2 * (1 - t) * (p1[1] - p0[1]) + 2 * t * (p2[1] - p1[1]);
  const len = Math.hypot(dx, dy) || 1;
  return [dx / len, dy / len];
}
const f1 = (n: number) => n.toFixed(1);

// ---- 1. 木の幹 ----
// 画面の下から上へ、ゆるく弓なりに曲がりながら伸びる細長い幹。
// 根元は少し太く広がり、上へいくほど細くなる。lean で上のほうがどれだけ横へかたむくかを決める
function trunkPath(r: Rand, x: number, width: number, lean: number) {
  const p0: Pt = [x, H + 30];
  const p2: Pt = [x + lean, -80];
  const p1: Pt = [x + lean * 0.3 + r.range(-70, 70), H * 0.45];
  const left: string[] = [];
  const right: string[] = [];
  const steps = 18;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const [cx, cy] = bez(p0, p1, p2, t);
    const [dx, dy] = bezDir(p0, p1, p2, t);
    const w = (width * (1 - 0.35 * t) * (1 + 0.5 * Math.pow(1 - t, 8))) / 2; // 上ほど細く、根元だけ少し広がる
    left.push(`${f1(cx - dy * w)} ${f1(cy + dx * w)}`);
    right.unshift(`${f1(cx + dy * w)} ${f1(cy - dx * w)}`);
  }
  return `M${left.join(" L")} L${right.join(" L")} Z`;
}

// 幹の色を、上は濃く・根元は霧に溶けて薄くするグラデーション
function TrunkFade({ id, color }: { id: string; color: string }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" style={{ stopColor: color, stopOpacity: 1 }} />
      <stop offset="0.55" style={{ stopColor: color, stopOpacity: 0.85 }} />
      <stop offset="1" style={{ stopColor: color, stopOpacity: 0.05 }} />
    </linearGradient>
  );
}

export function JungleTrunks({ seed = 7, className = "", near = true }: { seed?: number; className?: string; near?: boolean }) {
  const r = seeded(seed);
  // 遠く：たくさん・細い・淡い
  const far = Array.from({ length: 18 }, (_, i) => trunkPath(r, (i + r.range(0.1, 0.9)) * (W / 18), r.range(10, 24), r.range(-110, 110)));
  // 中くらい：少し太く、文字のある真ん中は少なめ
  const mid = Array.from({ length: 9 }, (_, i) => {
    const x = i < 7 ? (i % 2 === 0 ? r.range(0, 0.32) : r.range(0.68, 1)) * W : r.range(0.38, 0.62) * W;
    return trunkPath(r, x, r.range(24, 42), r.range(-140, 140));
  });
  // 手前：左右のはしに太い幹。画面の内側へ向かってかたむく
  const front = near
    ? [
        trunkPath(r, r.range(-60, 60), r.range(54, 76), r.range(120, 260)),
        trunkPath(r, r.range(140, 260), r.range(40, 56), r.range(-60, 40)),
        trunkPath(r, W - r.range(-60, 60), r.range(54, 76), -r.range(120, 260)),
        trunkPath(r, W - r.range(140, 260), r.range(40, 56), -r.range(-60, 40)),
      ]
    : [];
  const id = (layer: string) => `trunk-fade-${seed}-${layer}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" className={`h-full w-full ${className}`} aria-hidden="true">
      <defs>
        <TrunkFade id={id("far")} color="var(--trunk-far)" />
        <TrunkFade id={id("mid")} color="var(--trunk-mid)" />
        <TrunkFade id={id("near")} color="var(--trunk-near)" />
      </defs>
      <g className="trunk-far" fill={`url(#${id("far")})`}>
        {far.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      <g className="trunk-mid" fill={`url(#${id("mid")})`}>
        {mid.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      <g fill={`url(#${id("near")})`}>
        {front.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </svg>
  );
}

// ---- 2. 霧と、奥からさす光 ----
export function JungleMist() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* 奥の光（画面の中央少し上が明るく光る） */}
      <div className="jungle-glow" />
      {/* もや：ぼかした楕円が、ゆっくり左右にただよう */}
      <div className="mist" style={{ top: "30%", left: "-20%", width: "80%", animationDuration: "38s" }} />
      <div className="mist" style={{ top: "55%", left: "30%", width: "90%", animationDuration: "46s", animationDelay: "-12s" }} />
      <div className="mist" style={{ top: "75%", left: "-10%", width: "120%", animationDuration: "55s", animationDelay: "-25s" }} />
    </div>
  );
}

// ---- 3. たれ下がるツル（リアナ） ----
export function Lianas({ seed = 21, count = 9 }: { seed?: number; count?: number }) {
  const r = seeded(seed);
  const vines = Array.from({ length: count }, (_, i) => {
    // 中央を少し避けつつ、左右にばらける
    const side = i % 2 === 0 ? r.range(0.02, 0.33) : r.range(0.67, 0.98);
    const x = side * W;
    const len = r.range(180, 560);
    const bend = r.range(-30, 30);
    const kind = r.pick(["leafy", "leafy", "beads", "bare"] as const);
    const leaves: { y: number; s: number; rot: number }[] = [];
    if (kind !== "bare") {
      const n = Math.floor(len / r.range(22, 34));
      for (let k = 1; k <= n; k++) {
        const t = k / (n + 1);
        if (r.chance(0.2)) continue; // ところどころ葉が抜けている
        leaves.push({ y: t * len, s: r.range(0.6, 1.2) * (kind === "beads" ? 0.6 : 1), rot: (k % 2 ? 1 : -1) * r.range(30, 70) });
      }
    }
    return { x, len, bend, kind, leaves, dur: r.range(7, 12), delay: -r.range(0, 8), depth: r.int(1, 3) };
  });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMin slice" className="h-full w-full overflow-visible" aria-hidden="true">
      {vines.map((v, i) => (
        <g
          key={i}
          className={`liana depth-${v.depth}`}
          style={{ transformOrigin: `${v.x}px 0px`, animationDuration: `${v.dur}s`, animationDelay: `${v.delay}s` }}
        >
          <path d={`M${v.x} -10 Q${v.x + v.bend} ${v.len / 2} ${v.x + v.bend * 0.3} ${v.len}`} fill="none" strokeWidth={v.kind === "bare" ? 1.5 : 2} strokeLinecap="round" />
          {v.leaves.map((l, k) => {
            // 曲線の上の位置（2 次ベジェの式）
            const t = l.y / v.len;
            const px = (1 - t) * (1 - t) * v.x + 2 * (1 - t) * t * (v.x + v.bend) + t * t * (v.x + v.bend * 0.3);
            const py = -10 + (v.len + 10) * t;
            return v.kind === "beads" ? (
              <ellipse key={k} cx={px} cy={py} rx={5 * l.s} ry={7 * l.s} />
            ) : (
              <path key={k} transform={`translate(${px.toFixed(1)} ${py.toFixed(1)}) rotate(${(180 + l.rot).toFixed(0)}) scale(${l.s.toFixed(2)})`} d="M0 0 C7 -5 9 -15 0 -24 C-9 -15 -7 -5 0 0Z" />
            );
          })}
        </g>
      ))}
    </svg>
  );
}

// ---- 4. 手前の葉（ヤシ・シダ・草むら） ----

// 羽のような葉（ヤシやシダ）を 1 枚作る。
// 軸（まん中の茎）を 2 次ベジェ曲線で引き、その左右に細長い小葉をたくさん並べる。
// 小葉の向きは「軸の先のほう（along）」「外側（out）」「重力で下（fall）」の 3 つを混ぜて決める。
//   ・たれ下がるヤシ：fall を大きく → 小葉がカーテンのように下へたれる
//   ・下から生えるシダ：along と out を大きく → 小葉が先のほうへ斜めに開く
function frond(r: Rand, o: { end: Pt; ctrl: Pt; n: number; leaflet: number; along: number; out: number; fall: number; width: number }) {
  const p0: Pt = [0, 0];
  const parts: string[] = [];
  for (let i = 0; i < o.n; i++) {
    const t = 0.05 + (i / o.n) * 0.93;
    const [bx, by] = bez(p0, o.ctrl, o.end, t);
    const [tx, ty] = bezDir(p0, o.ctrl, o.end, t);
    // 小葉の長さ：根元と先は短く、まん中が長い。1 枚ずつ少しばらつかせる
    const shape = Math.pow(Math.sin(Math.PI * Math.min(0.98, t * 0.9 + 0.08)), 0.7);
    for (const side of [-1, 1]) {
      const len = o.leaflet * shape * r.range(0.8, 1.15);
      if (len < 4 || r.chance(0.05)) continue; // ところどころ小葉が抜けている
      let dx = tx * o.along + -ty * side * o.out;
      let dy = ty * o.along + tx * side * o.out + o.fall;
      const dl = Math.hypot(dx, dy) || 1;
      dx /= dl;
      dy /= dl;
      const ex = bx + dx * len;
      const ey = by + dy * len;
      // 小葉はまっすぐではなく、少し下へしなる
      const sag = len * 0.12;
      const mx = bx + dx * len * 0.5;
      const my = by + dy * len * 0.5 + sag;
      const w = Math.max(1.6, len * o.width);
      parts.push(
        `M${f1(bx)} ${f1(by)} Q${f1(mx - dy * w)} ${f1(my + dx * w)} ${f1(ex)} ${f1(ey)} Q${f1(mx + dy * w)} ${f1(my - dx * w)} ${f1(bx)} ${f1(by)}Z`,
      );
    }
  }
  // 軸：根元が太く先が細い線を、細長い三角形で描く
  const rib: string[] = [];
  const back: string[] = [];
  for (let k = 0; k <= 10; k++) {
    const t = k / 10;
    const [x, y] = bez(p0, o.ctrl, o.end, t);
    const [tx, ty] = bezDir(p0, o.ctrl, o.end, t);
    const w = 2.4 * (1 - t) + 0.4;
    rib.push(`${f1(x - ty * w)} ${f1(y + tx * w)}`);
    back.unshift(`${f1(x + ty * w)} ${f1(y - tx * w)}`);
  }
  parts.push(`M${rib.join(" L")} L${back.join(" L")} Z`);
  return parts.join(" ");
}

// 上からたれ下がるヤシの葉（根元は画面の上の外）
function hangingPalm(r: Rand) {
  const len = r.range(320, 440);
  return frond(r, {
    ctrl: [len * r.range(0.45, 0.6), -len * r.range(0.05, 0.15)],
    end: [len * r.range(0.8, 0.95), len * r.range(0.45, 0.65)],
    n: 26,
    leaflet: len * r.range(0.38, 0.48),
    along: 0.3,
    out: 0.3,
    fall: 1.2,
    width: 0.045,
  });
}

// 下の角から生えるシダ
function fern(r: Rand) {
  const len = r.range(240, 360);
  return frond(r, {
    ctrl: [len * r.range(0.05, 0.25), -len * 0.6],
    end: [len * r.range(0.45, 0.7), -len * r.range(0.6, 0.85)],
    n: 26,
    leaflet: len * r.range(0.22, 0.3),
    along: 0.7,
    out: 1,
    fall: 0.25,
    width: 0.09,
  });
}

// 草むら：なだらかな山の上のふちを、細い草の葉のギザギザにする
function bush(r: Rand, x0: number, x1: number, height: number) {
  const pts: string[] = [`${f1(x0)} ${H + 10}`];
  for (let x = x0; x <= x1; x += r.range(8, 16)) {
    const u = (x - x0) / (x1 - x0);
    const top = H - height * Math.pow(Math.sin(Math.PI * u), 0.6) - r.range(0, height * 0.12);
    const blade = r.range(10, 30);
    const lean = r.range(-8, 10);
    pts.push(`${f1(x)} ${f1(top + 6)}`, `${f1(x + 3 + lean)} ${f1(top - blade)}`, `${f1(x + 6)} ${f1(top + 4)}`);
  }
  pts.push(`${f1(x1)} ${H + 10}`);
  return `M${pts.join(" L")} Z`;
}

type Piece = { d: string; x: number; y: number; angle: number; layer: "far" | "near"; sway: boolean };

// 片側（左）の葉をまとめて作る。右側は同じ作り方で別の形にし、左右反転して置く
function foreground(seed: number): { pieces: Piece[]; bushes: { far: string; near: string } } {
  const r = seeded(seed);
  const pieces: Piece[] = [];
  // 上の角からたれ下がるヤシ（奥に淡い 3 枚、手前に濃い 3 枚）。葉を重ねて、うっそうと茂った感じに
  for (let i = 0; i < 6; i++) {
    pieces.push({ d: hangingPalm(r), x: r.range(-140, 160), y: r.range(-70, -10), angle: r.range(-15, 22), layer: i < 3 ? "far" : "near", sway: true });
  }
  // 横の途中から生えるシダ（幹のあたりから外へ）
  for (let i = 0; i < 2; i++) {
    pieces.push({ d: fern(r), x: r.range(-40, 20), y: H * r.range(0.45, 0.7), angle: r.range(35, 70), layer: "far", sway: true });
  }
  // 下の角から生えるシダ（奥に 2 枚、手前に 3 枚）
  for (let i = 0; i < 5; i++) {
    pieces.push({ d: fern(r), x: r.range(-30, 200), y: H + r.range(0, 30), angle: r.range(-30, 35), layer: i < 2 ? "far" : "near", sway: true });
  }
  return { pieces, bushes: { far: bush(r, -40, r.range(380, 480), r.range(110, 150)), near: bush(r, -40, r.range(240, 320), r.range(60, 90)) } };
}

// 左右どちらか片側の葉（flip で左右反転）
function SilhouetteSide({ seed, flip }: { seed: number; flip?: boolean }) {
  const { pieces, bushes } = foreground(seed);
  const draw = (layer: Piece["layer"]) =>
    pieces
      .filter((p) => p.layer === layer)
      .map((p, i) => (
        <g key={`${layer}-${i}`} transform={`translate(${f1(p.x)} ${f1(p.y)}) rotate(${p.angle.toFixed(0)})`}>
          {/* ゆっくり風にゆれる（.sway は根元を支点に回転する CSS アニメーション） */}
          <g className="sway" style={{ animationDuration: `${8 + (i % 3) * 1.7}s`, animationDelay: `${-i * 1.9}s` }}>
            <path d={p.d} />
          </g>
        </g>
      ));
  return (
    <svg
      viewBox={`0 0 600 ${H}`}
      preserveAspectRatio="xMinYMid meet"
      className={`h-full w-auto overflow-visible ${flip ? "-scale-x-100" : ""}`}
      aria-hidden="true"
    >
      <path className="bush-far" d={bushes.far} />
      <g className="canopy-far">{draw("far")}</g>
      <path className="bush-near" d={bushes.near} />
      <g className="canopy-near">{draw("near")}</g>
    </svg>
  );
}

export function JungleSilhouettes({ seed = 3 }: { seed?: number }) {
  return (
    <div className="silhouette-fade pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-y-0 left-0 -translate-x-[62%] sm:-translate-x-[12%]">
        <SilhouetteSide seed={seed} />
      </div>
      <div className="absolute inset-y-0 right-0 translate-x-[62%] sm:translate-x-[12%]">
        <SilhouetteSide seed={seed + 100} flip />
      </div>
    </div>
  );
}

// ---- ページ全体の背景（スクロールしても動かない、うっすらとした森） ----
export function JungleBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-20" aria-hidden="true">
      <JungleTrunks seed={42} near={false} className="backdrop-trunks hidden opacity-60 sm:block" />
      <div className="jungle-vignette absolute inset-0" />
    </div>
  );
}
