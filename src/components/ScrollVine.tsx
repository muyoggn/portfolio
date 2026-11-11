"use client";

import { useEffect, useRef, useState } from "react";

// ヘッダーの下を、読んだ量に合わせて左から右へ伸びていく「ツル」です。
//
// ・茎は、波の高さが少しずつ違うくねくねした線（ベジェ曲線）
// ・ところどころに葉っぱと、くるっと巻いた巻きひげ（ツル植物の、ものに巻き付く細い部分）
// ・茎の先がそこまで伸びると、葉っぱと巻きひげが出てくる
//
// 画面の幅に合わせて形を作り直すので、スマホでもパソコンでも同じくらいの細かさの波になります。
// 伸び具合は CSS 変数 --sp（0〜1、ScrollDepth.tsx が更新）で決まります（globals.css の .vine-*）。

const WAVE = 46; // 波の半分の長さ（px）。小さくするほど細かくくねくねする
const MID = 9; // 茎の中心の高さ（SVG の上からの px）

type Part = { d: string; at: number; down?: boolean };

function build(width: number) {
  // 毎回同じ形になるように、決まった数列で波の高さを変える
  const amp = (i: number) => 2.5 + ((i * 7) % 5) * 0.7;
  let stem = `M0 ${MID}`;
  const leaves: Part[] = [];
  const curls: Part[] = [];
  const n = Math.ceil(width / WAVE);
  for (let i = 0; i < n; i++) {
    const x0 = i * WAVE;
    const x1 = x0 + WAVE;
    const up = i % 2 === 0; // 山と谷を交互に
    const y1 = MID + (up ? -amp(i) : amp(i));
    const y0 = i === 0 ? MID : MID + (up ? amp(i - 1) : -amp(i - 1));
    // 3 次ベジェ曲線：前の点から横向きに出て、次の点へ横向きに入る → なめらかな波になる
    stem += ` C${x0 + WAVE * 0.45} ${y0} ${x1 - WAVE * 0.45} ${y1} ${x1} ${y1}`;
    const at = x1 / width; // この場所がページの何割にあたるか

    // 山と谷のてっぺんに葉っぱ（山は上向き、谷は下向き）。たまに休む
    if (i % 3 !== 2) {
      const dir = up ? -1 : 1;
      const len = 8 + (i % 3) * 1.5;
      const tipX = x1 + len * 0.7;
      const tipY = y1 + dir * len * 0.7;
      // 葉の形：根元 → 先端へ 2 本の曲線でふくらみをつける
      leaves.push({
        d: `M${x1} ${y1} Q${x1 + len * 0.9} ${y1 + dir * 1} ${tipX} ${tipY} Q${x1 - 1} ${y1 + dir * len * 0.8} ${x1} ${y1}`,
        at,
        down: !up,
      });
    }
    // 5 つに 1 つくらい、くるっと巻いた巻きひげ
    if (i % 5 === 3) {
      const dir = up ? -1 : 1;
      const sx = x0 + WAVE / 2;
      const sy = MID;
      curls.push({
        d: `M${sx} ${sy} c3 ${dir * 4} 9 ${dir * 5} 9 ${dir * 1} c0 ${-dir * 3} -4 ${-dir * 3} -4 ${-dir * 0.5} c0 ${dir * 1.5} 2 ${dir * 1.5} 2 0`,
        at: sx / width,
      });
    }
  }
  return { stem, leaves, curls };
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
    <div ref={ref} className="pointer-events-none absolute inset-x-0 top-[calc(100%-10px)] h-5" aria-hidden="true">
      {shape && (
        <svg width={width} height="20" viewBox={`0 0 ${width} 20`} className="overflow-visible">
          {/* pathLength={1}：線の長さを 1 とみなすので、「--sp の分だけ描く」を CSS で簡単に書ける */}
          <path className="vine-stem" d={shape.stem} pathLength={1} />
          {shape.curls.map((c) => (
            <path key={c.d} className="vine-curl" d={c.d} pathLength={1} style={at(c.at)} />
          ))}
          {shape.leaves.map((l) => (
            <path key={l.d} className={`vine-leaf ${l.down ? "is-down" : ""}`} d={l.d} style={at(l.at)} />
          ))}
        </svg>
      )}
    </div>
  );
}
