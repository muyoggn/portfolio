"use client";

import { useRef } from "react";

// 中身をマウスの位置に合わせて、ゆっくり傾ける部品です（作品のプレビューで使用）。
// 中の要素に className="depth" と --d（手前に出す量 px）を付けると、
// 傾けたときに手前のものほど大きくずれて、立体的に見えます（globals.css の .tilt / .depth）。
export default function Tilt({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const set = (x: number, y: number) => {
    ref.current?.style.setProperty("--tx", x.toFixed(3));
    ref.current?.style.setProperty("--ty", y.toFixed(3));
  };

  return (
    <div
      className={`tilt ${className}`}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        // カードの左端 -0.5 〜 右端 0.5 に直した、マウスの位置
        set((e.clientX - r.left) / r.width - 0.5, (e.clientY - r.top) / r.height - 0.5);
      }}
      onPointerLeave={() => set(0, 0)}
    >
      <div ref={ref} className="tilt-inner h-full">
        {children}
      </div>
    </div>
  );
}
