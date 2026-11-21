"use client";

import { useEffect, useRef } from "react";

// 「この要素をどこまで読み進めたか」を 0〜1 の数字にして、CSS 変数 --p に書き込む部品です。
//
//   要素の上端が画面の下から 85% の高さに来たとき … 0
//   要素の下端が画面の上から 60% の高さまで来たとき … 1
//
// CSS 側で「--p の分だけ線を伸ばす」のように使うと、スクロールにぴったり連動した動きになります。
// （Reveal は「一度だけ出てくる」動き、こちらは「スクロールを戻すと動きも戻る」動きです）
//
// start / end を渡すと、「画面のどこからどこまでで 0→1 にするか」を変えられます（画面の高さに対する割合）。
// たとえば start=1 なら「要素の上端が画面の下端に来たとき」から数え始めます。
export default function ScrollLinked({
  children,
  className = "",
  start: startRatio = 0.85,
  end: endRatio = 0.6,
}: {
  children: React.ReactNode;
  className?: string;
  start?: number;
  end?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect(); // 画面の中での要素の位置
      const vh = window.innerHeight;
      const start = vh * startRatio;
      const end = vh * endRatio;
      const total = rect.height + start - end;
      const p = (start - rect.top) / total;
      el.style.setProperty("--p", String(Math.min(1, Math.max(0, p))));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [startRatio, endRatio]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
