"use client";

import { useEffect, useRef } from "react";

// 「この要素をどこまで読み進めたか」を 0〜1 の数字にして、CSS 変数 --p に書き込む部品です。
//
//   要素の上端が画面の下から 85% の高さに来たとき … 0
//   要素の下端が画面の上から 60% の高さまで来たとき … 1
//
// CSS 側で「--p の分だけ線を伸ばす」のように使うと、スクロールにぴったり連動した動きになります。
// （Reveal は「一度だけ出てくる」動き、こちらは「スクロールを戻すと動きも戻る」動きです）
export default function ScrollLinked({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
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
      const start = vh * 0.85;
      const end = vh * 0.6;
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
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
