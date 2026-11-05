"use client";
// ↑ この部品はブラウザ側で動く（スクロールを見張る）ので "use client" が必要です。

import { useEffect, useRef, useState } from "react";

// 画面に入ってきたら、ふわっと下から浮かび上がらせる部品です。
// <Reveal> ... </Reveal> で囲むだけで使えます。
// delay（ミリ秒）を渡すと、少し遅れて出てきます（カードを順番に出すときに使う）。
export default function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // IntersectionObserver：要素が画面に入ったかどうかをブラウザが教えてくれる仕組み
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect(); // 一度出たら見張りは終わり
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
