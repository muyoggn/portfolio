"use client";

import { useEffect, useRef, useState } from "react";

// 最初の画面の右側に浮かぶ「重なった板」です。1 枚 1 枚が、このページの各セクションへのリンクになっています。
//   ・マウスを動かすと、板の山全体が少しだけ向きを変える（--mx / --my）
//   ・板にマウスを乗せると、それより上の板がふわっと持ち上がり、選んだ板が朱色になって顔を出す
//   ・下へスクロールすると、板どうしの間隔が広がって重なりがほどけていく（globals.css の .plate）
// 3D のライブラリは使わず、CSS の transform だけで作っています（見た目のルールは globals.css）。

const LAYERS = [
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#works", label: "Works" },
  { href: "#career", label: "Career" },
  { href: "#contact", label: "Contact" },
];

export default function LayerStack({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  // active：今マウスを乗せている板の番号（-1 はどれにも乗せていない）
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // target：マウスがある位置 / current：今の向き。毎フレーム少しずつ target に近づけると、ぬるっと追いかける動きになる
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let frame = 0;
    const loop = () => {
      current.x += (target.x - current.x) * 0.08;
      current.y += (target.y - current.y) * 0.08;
      el.style.setProperty("--mx", current.x.toFixed(4));
      el.style.setProperty("--my", current.y.toFixed(4));
      const moving = Math.abs(target.x - current.x) + Math.abs(target.y - current.y) > 0.001;
      frame = moving ? requestAnimationFrame(loop) : 0;
    };
    const onMove = (e: PointerEvent) => {
      target.x = e.clientX / window.innerWidth - 0.5; // 画面の左端 -0.5 〜 右端 0.5
      target.y = e.clientY / window.innerHeight - 0.5;
      if (!frame) frame = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} className={`stack-scene flex items-center justify-center ${className}`}>
      <nav
        aria-label="セクション"
        className="stack h-44 w-44 sm:h-64 sm:w-64"
        onPointerLeave={() => setActive(-1)}
        onBlur={() => setActive(-1)}
      >
        <div className="stack-shadow" aria-hidden="true" />
        {LAYERS.map((layer, i) => (
          <a
            key={layer.href}
            href={layer.href}
            className={`plate ${i === active ? "is-active" : ""}`}
            onPointerEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            style={
              {
                // --z：下から何枚目か。いちばん上（About）がいちばん高い位置に来るように、逆の順番で数える
                "--z": LAYERS.length - 1 - i,
                // 選んだ板より上にある板（番号が小さい板）だけ持ち上げる
                "--lift": active >= 0 && i < active ? 1 : 0,
              } as React.CSSProperties
            }
          >
            {/* 文字は板の「手前のふち」にそって置く。下の板は上の板に隠れるので、ふちの文字だけがのぞいて見える */}
            <span className="plate-face flex items-end justify-between px-4 pb-2.5 sm:px-5 sm:pb-3">
              <span className="font-display text-base font-medium tracking-tight sm:text-lg">{layer.label}</span>
              <span className="font-display text-[11px] tabular-nums tracking-widest opacity-60">
                {String(i + 1).padStart(2, "0")}
              </span>
            </span>
          </a>
        ))}
      </nav>
    </div>
  );
}
