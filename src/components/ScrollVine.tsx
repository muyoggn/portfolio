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
type Cubic = [Pt, Pt, Pt, Pt]; // 3 次ベジェ曲線（始点・制御点 2 つ・終点）
type Leaf = { x: number; y: number; angle: number; size: number; shape: keyof typeof LEAF; at: number; shade: number };
type Branch = { d: string; at: number; len: number };

// 葉の形（根元が (0,0)、上（-y）に向かって伸びる。長さ 10）
const LEAF = {
  pointed: "M0 0 C3 -2 4 -6 0 -10 C-4 -6 -3 -2 0 0Z",
  heart: "M0 0 C-1 1 -5 0 -4.5 -4.5 C-4 -7.5 -1 -9 0 -10 C1 -9 4 -7.5 4.5 -4.5 C5 0 1 1 0 0Z",
  round: "M0 0 C4 0 4.5 -6.5 0 -7.5 C-4.5 -6.5 -4 0 0 0Z",
} as const;

const toD = (cs: Cubic[]) =>
  `M${cs[0][0].join(" ")}` + cs.map((c) => ` C${c[1].join(" ")} ${c[2].join(" ")} ${c[3].join(" ")}`).join("");

// ベジェ曲線の長さを、細かく区切って足し合わせて求める（だいたいの長さで十分）
function lengthOf(c: Cubic) {
  let len = 0;
  let prev = c[0];
  for (let i = 1; i <= 12; i++) {
    const p = pointOn(c, i / 12);
    len += Math.hypot(p[0] - prev[0], p[1] - prev[1]);
    prev = p;
  }
  return len;
}
function pointOn([a, b, c, d]: Cubic, t: number): Pt {
  const u = 1 - t;
  const f = (i: 0 | 1) => u * u * u * a[i] + 3 * u * u * t * b[i] + 3 * u * t * t * c[i] + t * t * t * d[i];
  return [f(0), f(1)];
}

function build(width: number) {
  const r = seeded(20261111);
  const stem: Cubic[] = [];
  const loopParts = new Set<number>(); // 1 回転の部分（ここには葉を付けず、くるっと巻いた形を見せる）
  let x = 0;
  let y = MID;
  let side = r.chance(0.5) ? 1 : -1;

  // ---- 茎（くねくね ＋ ときどき 1 回転） ----
  while (x < width) {
    if (x > 60 && x < width - 60 && r.chance(0.09)) {
      // 1 回転：円を 4 分の 1 ずつ、4 本のベジェ曲線で描く（k は円に近づけるための決まった数）
      const rad = r.range(6.5, 9);
      const dir = r.chance(0.5) ? -1 : 1; // 上に巻くか下に巻くか
      const k = 0.5523 * rad;
      const cy = y + dir * rad;
      const p: Pt = [x, y];
      for (let q = 0; q < 4; q++) loopParts.add(stem.length + q);
      stem.push([p, [x + k, y], [x + rad, cy - dir * k], [x + rad, cy]]);
      stem.push([[x + rad, cy], [x + rad, cy + dir * k], [x + k, cy + dir * rad], [x, cy + dir * rad]]);
      stem.push([[x, cy + dir * rad], [x - k, cy + dir * rad], [x - rad, cy + dir * k], [x - rad, cy]]);
      stem.push([[x - rad, cy], [x - rad, cy - dir * k], [x - k + 3, y], [x + 3, y]]);
      x += 3;
      continue;
    }
    const len = r.range(22, 70); // 波の長さはばらばら
    const amp = r.range(1, 7.5); // 波の高さもばらばら
    if (r.chance(0.8)) side = -side; // たまに同じ側に 2 回ふくらむ
    const nx = x + len;
    const ny = MID + side * amp;
    stem.push([[x, y], [x + len * r.range(0.3, 0.55), y], [nx - len * r.range(0.3, 0.55), ny], [nx, ny]]);
    x = nx;
    y = ny;
  }

  // 茎の長さを測り、「茎の何割の場所か」（at）を出せるようにする
  const lens = stem.map(lengthOf);
  const total = lens.reduce((a, b) => a + b, 0);
  let acc = 0;
  const leaves: Leaf[] = [];
  const branches: Branch[] = [];

  stem.forEach((c, i) => {
    const start = acc;
    acc += lens[i];
    // ---- 葉っぱ：1 本の曲線に 0〜2 枚。位置・形・大きさ・向きはすべてばらばら ----
    const count = loopParts.has(i) ? 0 : r.pick([0, 1, 1, 2, 2, 3]);
    for (let j = 0; j < count; j++) {
      const t = r.range(0.2, 0.9);
      const [lx, ly] = pointOn(c, t);
      const up = r.chance(0.5);
      leaves.push({
        x: lx,
        y: ly,
        // 回転の角度：0° で真上、90° で右、180° で真下。伸びる方向（右）へ少し傾けた向きを中心にばらつかせる
        angle: (up ? 40 : 140) + r.range(-30, 30),
        size: r.range(0.8, 1.5),
        shape: r.pick(["pointed", "pointed", "heart", "round"] as const),
        at: (start + lens[i] * t) / total,
        shade: r.int(0, 2),
      });
    }
    // ---- 枝ヅル：ときどき細いツルが分かれ、先がくるっと巻く ----
    if (i > 1 && !loopParts.has(i) && r.chance(0.12)) {
      const [bx, by] = pointOn(c, 0.5);
      const dir = r.chance(0.65) ? 1 : -1; // 主に下（ページ側）へたれる
      const bl = r.range(18, 38);
      const ex = bx + bl * r.range(0.6, 1);
      const ey = by + dir * bl * r.range(0.35, 0.7);
      const cr = r.range(2, 3.5); // 先の巻きひげの大きさ
      const d =
        `M${bx} ${by} C${bx + bl * 0.3} ${by + dir * 2} ${ex - bl * 0.3} ${ey - dir * bl * 0.3} ${ex} ${ey}` +
        ` c${cr} ${dir * cr} ${cr * 2.2} ${-dir * cr * 0.6} ${cr * 0.8} ${-dir * cr * 1.6}` +
        ` c${-cr * 0.9} ${-dir * cr * 0.4} ${-cr * 1.3} ${dir * cr * 0.6} ${-cr * 0.3} ${dir * cr * 0.8}`;
      const at = (start + lens[i] * 0.5) / total;
      branches.push({ d, at, len: bl });
      // 枝ヅルにも小さな葉を 1〜2 枚
      for (let j = 0; j < r.int(1, 2); j++) {
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
  });

  return { stem: toD(stem), leaves, branches };
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
