import { seeded } from "@/lib/random";

// =============================================================
// 「神秘的なジャングル」の奥行きをつくる部品です。すべて SVG と CSS で描いています。
//
// 本物のジャングルの絵を観察すると、奥行きは次の 4 つの重なりでできています。
//   1. 遠くの木の幹  … 霧にかすんで、淡く・ぼやけて見える（JungleTrunks）
//   2. 霧と光        … 奥から光がさし、手前にもやがただよう（JungleMist）
//   3. たれ下がるツル … 上の枝から長いツル（つる植物）が何本もぶら下がる（Lianas）
//   4. 手前の大きな葉 … 光を背にして、黒いシルエットになる（JungleSilhouettes）
//
// 形は「シード付き乱数」で 1 本ずつばらばらに作っています（毎回同じ形になるので表示がずれない）。
// 色は globals.css の --trunk-far / --silhouette / --mist などで、昼と夜で切り替わります。
// =============================================================

const W = 1440;
const H = 900;

// ---- 1. 遠くの木の幹 ----
// 下から上へ、少しうねりながら細くなる幹。上のほうで枝分かれさせる
function trunkPath(r: ReturnType<typeof seeded>, x: number, width: number) {
  const sway = r.range(-40, 40);
  const left: string[] = [];
  const right: string[] = [];
  const steps = 8;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const y = H + 20 - (H + 40) * t;
    const cx = x + Math.sin(t * Math.PI) * sway;
    const w = width * (1 - t * 0.45); // 上ほど細く
    left.push(`${(cx - w / 2).toFixed(1)} ${y.toFixed(1)}`);
    right.unshift(`${(cx + w / 2).toFixed(1)} ${y.toFixed(1)}`);
  }
  let d = `M${left.join(" L")} L${right.join(" L")} Z`;
  // 枝：幹の上半分から、斜め上へ 1〜3 本
  const branches = r.int(1, 3);
  for (let b = 0; b < branches; b++) {
    const t = r.range(0.5, 0.85);
    const by = H + 20 - (H + 40) * t;
    const bx = x + Math.sin(t * Math.PI) * sway;
    const dir = r.chance(0.5) ? 1 : -1;
    const len = r.range(80, 200);
    const bw = width * 0.22;
    d += ` M${bx} ${by} Q${bx + dir * len * 0.5} ${by - len * 0.15} ${bx + dir * len} ${by - len * 0.6} L${bx + dir * len - dir * bw * 0.5} ${by - len * 0.6 + bw} Q${bx + dir * len * 0.45} ${by - len * 0.05} ${bx} ${by + bw * 2} Z`;
  }
  return d;
}

export function JungleTrunks({ seed = 7, className = "" }: { seed?: number; className?: string }) {
  const r = seeded(seed);
  // 奥（far：たくさん・細い・ぼやける）と、少し手前（mid：少ない・太い）の 2 層
  const far = Array.from({ length: 13 }, (_, i) => {
    const x = (i + r.range(0.1, 0.9)) * (W / 13);
    return trunkPath(r, x, r.range(8, 22));
  });
  const mid = Array.from({ length: 5 }, (_, i) => {
    // 真ん中（文字のある場所）を避けて、左右に寄せる
    const sideX = i % 2 === 0 ? r.range(20, 360) : r.range(1080, 1420);
    return trunkPath(r, sideX, r.range(22, 40));
  });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" className={`h-full w-full ${className}`} aria-hidden="true">
      <g className="trunk-far">
        {far.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      <g className="trunk-mid">
        {mid.map((d, i) => (
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

// ---- 4. 手前の大きな葉のシルエット ----
// バナナの葉：長い楕円の葉が、風で横に裂けている（すき間のある短冊を並べて表現）
function bananaLeaf(r: ReturnType<typeof seeded>) {
  const L = 100;
  const half = (t: number) => 22 * Math.pow(Math.sin(Math.PI * Math.min(t, 0.99)), 0.7);
  const parts: string[] = [];
  for (const side of [-1, 1]) {
    let t = 0.04;
    while (t < 0.97) {
      const step = r.range(0.06, 0.2); // 裂け目の間隔はばらばら
      const t1 = Math.min(0.99, t + step);
      const gap = r.chance(0.6) ? r.range(0.006, 0.018) : 0;
      const e0 = Math.min(t + 0.05, 0.99);
      const e1 = Math.min(t1 + 0.05, 0.995);
      parts.push(
        `M0 ${(-t * L).toFixed(1)} L${(side * half(e0)).toFixed(1)} ${(-e0 * L).toFixed(1)} L${(side * half(e1)).toFixed(1)} ${(-e1 * L).toFixed(1)} L0 ${(-(t1 - gap) * L).toFixed(1)} Z`,
      );
      t = t1;
    }
  }
  return parts.join(" ");
}

type Silhouette = { x: number; y: number; angle: number; size: number; kind: "banana" | "palm" | "monstera"; d: string };

function silhouettes(seed: number): Silhouette[] {
  const r = seeded(seed);
  const items: Silhouette[] = [];
  // 下の角から上へ向かって伸びる大きな葉
  for (let i = 0; i < 4; i++) {
    items.push({ x: r.range(-40, 140), y: H + r.range(0, 60), angle: r.range(15, 70), size: r.range(300, 460), kind: "banana", d: bananaLeaf(r) });
  }
  // 上の角から垂れ下がる葉
  for (let i = 0; i < 3; i++) {
    items.push({ x: r.range(-30, 160), y: r.range(-60, -10), angle: r.range(110, 165), size: r.range(220, 360), kind: "banana", d: bananaLeaf(r) });
  }
  // ヤシのような細い葉が集まったもの
  items.push({ x: r.range(0, 80), y: H * 0.55, angle: r.range(50, 80), size: r.range(260, 320), kind: "palm", d: "" });
  return items;
}

function PalmFrond({ size }: { size: number }) {
  // 茎に沿って、細長い葉を左右に並べる
  const blades = Array.from({ length: 16 }, (_, i) => {
    const t = (i + 1) / 17;
    const side = i % 2 === 0 ? 1 : -1;
    const len = 34 * Math.sin(Math.PI * Math.min(0.95, t + 0.1));
    return `M0 ${-t * 100} q${side * len * 0.6} ${-len * 0.1} ${side * len} ${len * 0.35} q${-side * len * 0.5} ${-len * 0.25} ${-side * len} ${-len * 0.35}Z`;
  });
  return (
    <g transform={`scale(${size / 100})`}>
      <path d="M0 10 Q4 -50 0 -100" fill="none" strokeWidth={1.2} className="silhouette-stroke" />
      <path d={blades.join(" ")} />
    </g>
  );
}

// 左右どちらか片側の葉のシルエット（flip で左右反転）
function SilhouetteSide({ items, flip }: { items: Silhouette[]; flip?: boolean }) {
  return (
    <svg
      viewBox={`0 0 500 ${H}`}
      preserveAspectRatio="xMinYMid meet"
      className={`silhouette h-full w-auto overflow-visible ${flip ? "-scale-x-100" : ""}`}
      aria-hidden="true"
    >
      {items.map((s, i) => (
        <g key={i} transform={`translate(${s.x.toFixed(0)} ${s.y.toFixed(0)}) rotate(${s.angle.toFixed(0)})`}>
          {/* ゆっくり風にゆれる（.sway は根元を支点に回転する CSS アニメーション） */}
          <g className="sway" style={{ animationDuration: `${7 + (i % 4) * 1.5}s`, animationDelay: `${-i * 1.3}s` }}>
            {s.kind === "palm" ? (
              <PalmFrond size={s.size} />
            ) : (
              <g transform={`scale(${(s.size / 100).toFixed(2)})`}>
                <path d="M0 14 L0 -98" fill="none" strokeWidth={1.6} className="silhouette-stroke" />
                <path d={s.d} />
              </g>
            )}
          </g>
        </g>
      ))}
    </svg>
  );
}

export function JungleSilhouettes({ seed = 3 }: { seed?: number }) {
  const left = silhouettes(seed);
  const right = silhouettes(seed + 100);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-y-0 left-0 -translate-x-[55%] sm:-translate-x-[15%]">
        <SilhouetteSide items={left} />
      </div>
      <div className="absolute inset-y-0 right-0 translate-x-[55%] sm:translate-x-[15%]">
        <SilhouetteSide items={right} flip />
      </div>
    </div>
  );
}

// ---- ページ全体の背景（スクロールしても動かない、うっすらとした森） ----
export function JungleBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-20" aria-hidden="true">
      <JungleTrunks seed={42} className="backdrop-trunks opacity-60" />
      <div className="jungle-vignette absolute inset-0" />
    </div>
  );
}
