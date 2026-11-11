"use client";

import { useEffect, useRef, useState } from "react";
import { seeded } from "@/lib/random";

// ヘッダーの下を、読んだ量に合わせて左から右へ伸びていく「ツル」です。
//
// 本物のツルのように見せるため、形はすべて「ばらばら」に作っています。
//   ・波の長さも高さも、1 つずつ違う
//   ・ときどき、くるっと 1 回転する
//   ・ところどころで細い枝ヅルが分かれ、その先は巻きひげになっている
//   ・葉っぱは、形（とがった葉・ハート形・丸い葉）も大きさも向きも 1 枚ずつ違う
//
// ばらばらでも表示のたびに形が変わらないよう、シード付き乱数（src/lib/random.ts）を使っています。
// 伸び具合は CSS 変数 --sp（0〜1、ScrollDepth.tsx が更新）で決まります（globals.css の .vine-*）。

const MID = 14; // 茎の中心の高さ（SVG の上からの px）

type Pt = [number, number];
type Leaf = { x: number; y: number; angle: number; size: number; shape: keyof typeof LEAF; at: number; shade: number };
type Branch = { d: string; at: number };

// 葉の形（根元が (0,0)、上（-y）に向かって伸びる。長さ 10）
const LEAF = {
  pointed: "M0 0 C3 -2 4 -6 0 -10 C-4 -6 -3 -2 0 0Z",
  heart: "M0 0 C-1 1 -5 0 -4.5 -4.5 C-4 -7.5 -1 -9 0 -10 C1 -9 4 -7.5 4.5 -4.5 C5 0 1 1 0 0Z",
  round: "M0 0 C4 0 4.5 -6.5 0 -7.5 C-4.5 -6.5 -4 0 0 0Z",
} as const;

// 点の並びを、なめらかな曲線（Catmull-Rom → 3 次ベジェ）の d 属性に変える。
// 点と点をただ直線でつなぐとカクカクするので、前後の点の向きから制御点を作って、つなぎ目もなめらかにする
function smoothPath(pts: Pt[]) {
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

function build(width: number) {
  const r = seeded(20261111);

  // ---- 茎：1 本のなめらかな曲線として計算する ----
  // 「くねくね」は sin（波）で作り、波の長さ・高さを、さらにゆっくり変わる波で少しずつ変える。
  // こうすると波が急に変わらず、本物のツルのようにゆったりとうねる。
  const slow = (f: number, ph: number) => (x: number) => Math.sin(x * f + ph);
  const lenWave = [slow(0.011, r.range(0, 6)), slow(0.027, r.range(0, 6))];
  const ampWave = [slow(0.008, r.range(0, 6)), slow(0.021, r.range(0, 6))];
  // 1 回転する場所の目安（だいたい 300〜500px に 1 回）
  const loopTargets: number[] = [];
  for (let x = r.range(120, 260); x < width - 80; x += r.range(280, 520)) loopTargets.push(x);
  const loopSpots: { x: number; r: number }[] = []; // 実際に 1 回転した場所（葉を付けないため）

  const pts: Pt[] = [];
  let phase = Math.PI * r.range(0.2, 1.8);
  const STEP = 3; // 3px ごとに点を置く
  for (let t = -10; t <= width + 10; t += STEP) {
    const lambda = 70 + 22 * lenWave[0](t) + 10 * lenWave[1](t); // 波の長さ：およそ 40〜100px
    const prev = phase;
    phase += ((Math.PI * 2) / lambda) * STEP;
    const amp = 3.4 + 1.8 * ampWave[0](t) + 0.8 * ampWave[1](t); // 高さ：およそ 1〜6px
    const x = t + 1.2 * Math.sin(phase); // ほんの少し前後にもゆらして、左右対称な波にならないように
    const y = MID + amp * Math.cos(phase);
    pts.push([x, y]);
    // 波のいちばん下（phase が 2π の倍数）を通ったところで、目安の場所を過ぎていたら 1 回転する。
    // 茎が真横を向いている場所なので、そこから円を 1 周描いて戻ると、つなぎ目がなめらかになる
    if (loopTargets.length && t >= loopTargets[0] && Math.floor(prev / (Math.PI * 2)) !== Math.floor(phase / (Math.PI * 2))) {
      loopTargets.shift();
      const R = r.range(5, 7.5);
      const cy = y - R; // 円の中心は茎の上
      for (let k = 1; k <= 24; k++) {
        const th = Math.PI / 2 - (k / 24) * Math.PI * 2; // 下 → 右 → 上 → 左 → 下 と回る
        pts.push([x + R * Math.cos(th) + (k / 24) * 2, cy + R * Math.sin(th)]);
      }
      loopSpots.push({ x, r: R + 6 });
    }
  }
  const loopness = (x: number) => (loopSpots.some((l) => Math.abs(x - l.x) < l.r) ? 1 : 0);

  // 茎にそった長さを測って、「茎の何割の場所か」（at）を出せるようにする
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = cum[cum.length - 1];
  const tangent = (i: number) => {
    const a2 = pts[Math.max(0, i - 1)];
    const b2 = pts[Math.min(pts.length - 1, i + 1)];
    return (Math.atan2(b2[1] - a2[1], b2[0] - a2[0]) * 180) / Math.PI; // 茎の向き（度）
  };

  // ---- 葉っぱ：間隔・向き・形・大きさ・色をばらばらに。1 回転の場所には付けない ----
  const leaves: Leaf[] = [];
  for (let i = r.int(4, 10); i < pts.length - 2; i += r.int(7, 18)) {
    if (loopness(pts[i][0]) > 0.15) continue;
    const up = r.chance(0.5);
    // 回転の角度：0° で真上。茎の向きから、上側なら −50°、下側なら +130° 前後に開く
    const angle = tangent(i) + 90 + (up ? -140 : 40) + r.range(-25, 25);
    leaves.push({
      x: pts[i][0],
      y: pts[i][1],
      angle,
      size: r.range(0.75, 1.45),
      shape: r.pick(["pointed", "pointed", "heart", "round"] as const),
      at: cum[i] / total,
      shade: r.int(0, 2),
    });
  }

  // ---- 枝ヅル：ときどき細いツルが分かれ、先がくるっと巻く ----
  const branches: Branch[] = [];
  for (let i = r.int(30, 60); i < pts.length - 20; i += r.int(60, 140)) {
    if (loopness(pts[i][0]) > 0.15) continue;
    const [bx, by] = pts[i];
    const dir = r.chance(0.65) ? 1 : -1; // 主に下（ページ側）へたれる
    const bl = r.range(18, 36);
    const ex = bx + bl * r.range(0.7, 1);
    const ey = by + dir * bl * r.range(0.3, 0.6);
    const cr = r.range(2, 3.2); // 先の巻きひげの大きさ
    const d =
      `M${bx.toFixed(1)} ${by.toFixed(1)} C${(bx + bl * 0.35).toFixed(1)} ${by.toFixed(1)} ${(ex - bl * 0.35).toFixed(1)} ${(ey - dir * bl * 0.25).toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}` +
      ` c${cr} ${dir * cr} ${cr * 2.2} ${-dir * cr * 0.6} ${cr * 0.8} ${-dir * cr * 1.6}` +
      ` c${-cr * 0.9} ${-dir * cr * 0.4} ${-cr * 1.3} ${dir * cr * 0.6} ${-cr * 0.3} ${dir * cr * 0.8}`;
    const at = cum[i] / total;
    branches.push({ d, at });
    const n = r.int(1, 2);
    for (let j = 0; j < n; j++) {
      const t = r.range(0.3, 0.7);
      leaves.push({
        x: bx + (ex - bx) * t,
        y: by + (ey - by) * t,
        angle: (dir > 0 ? 120 : 55) + r.range(-25, 25),
        size: r.range(0.6, 0.95),
        shape: r.pick(["pointed", "round"] as const),
        at: at + 0.012 * (j + 1),
        shade: 2,
      });
    }
  }

  return { stem: smoothPath(pts), leaves, branches };
}

export default function ScrollVine() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const shape = width ? build(width) : null;
  const at = (v: number) => ({ "--at": v }) as React.CSSProperties;

  return (
    <div ref={ref} className="pointer-events-none absolute inset-x-0 top-[calc(100%-14px)] h-7" aria-hidden="true">
      {shape && (
        <svg width={width} height="28" viewBox={`0 0 ${width} 28`} className="overflow-visible">
          {/* pathLength={1}：線の長さを 1 とみなすので、「--sp の分だけ描く」を CSS で簡単に書ける */}
          <path className="vine-stem" d={shape.stem} pathLength={1} />
          {shape.branches.map((b) => (
            <path key={b.d} className="vine-curl" d={b.d} pathLength={1} style={at(b.at)} />
          ))}
          {shape.leaves.map((l, i) => (
            // 外側の g で場所と向きを決め、内側の path を CSS で「根元から」ふくらませる
            <g key={i} transform={`translate(${l.x.toFixed(1)} ${l.y.toFixed(1)}) rotate(${l.angle.toFixed(0)}) scale(${l.size.toFixed(2)})`}>
              <path className={`vine-leaf shade-${l.shade}`} d={LEAF[l.shape]} style={at(l.at)} />
            </g>
          ))}
        </svg>
      )}
    </div>
  );
}
