"use client";

import { useEffect, useState } from "react";

// 最初の画面の板（LayerStack.tsx）が、スクロールすると画面の右はしに移ってきて「目次」になる部品です。
//   ・最初の画面を半分ほど過ぎると、右はしに小さな板が 1 枚ずつすべり込んでくる
//   ・今読んでいるセクションの板だけ朱色になり、少し左へ飛び出す
//   ・板（または横の文字）を押すと、そのセクションへスクロールで移動する
// スマホでは文字を出さず、小さな板だけを画面のふちに縦に並べる（本文と重ならないように）。

const ITEMS = [
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "works", label: "Works" },
  { id: "career", label: "Career" },
  { id: "contact", label: "Contact" },
];

export default function SideNav() {
  // show：目次を出すかどうか / active：今いるセクションの番号（-1 はまだどこにも入っていない）
  const [show, setShow] = useState(false);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      setShow(window.scrollY > vh * 0.45);
      // 画面の上から 4 割の線より上に頭が来ているセクションのうち、いちばん下のものを「今いる場所」にする
      let current = -1;
      ITEMS.forEach((item, i) => {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top <= vh * 0.4) current = i;
      });
      // ページの一番下まで来たら、最後の項目（Contact）にする（短いセクションでも選ばれるように）
      if (window.scrollY + vh >= document.documentElement.scrollHeight - 4) current = ITEMS.length - 1;
      setActive(current);
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
    <nav
      aria-label="目次"
      className={`side-nav fixed right-1 top-1/2 z-30 -translate-y-1/2 sm:right-6 ${show ? "is-shown" : ""}`}
    >
      <ul className="flex flex-col gap-1 sm:gap-2">
        {ITEMS.map((item, i) => {
          const isActive = i === active;
          return (
            <li key={item.id} style={{ "--i": i } as React.CSSProperties}>
              <a
                href={`#${item.id}`}
                aria-label={item.label}
                aria-current={isActive ? "location" : undefined}
                className={`side-item group flex items-center justify-end gap-3 ${isActive ? "is-active" : ""}`}
              >
                {/* 項目の名前。パソコンでは常に出す。スマホでは出さない（globals.css） */}
                <span className="side-label font-display text-sm tracking-tight">
                  <span className="mr-2 text-[10px] tabular-nums text-accent">{String(i + 1).padStart(2, "0")}</span>
                  {item.label}
                </span>
                {/* 最初の画面の板を小さくしたもの。同じ角度で斜めに寝かせている */}
                <span className="mini-scene" aria-hidden="true">
                  <span className="mini-plate" />
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
