"use client";

import { useEffect, useRef, useState } from "react";

// 最初の画面の板（LayerStack.tsx）が、スクロールすると 1 枚ずつ画面の右はしへ飛んでいき、
// 小さくなって縦に並び「目次」になる部品です。
//   ・スクロールし始めると、最初の画面の板の上に、同じ形・同じ大きさの板（この部品の板）がぴったり重なって入れ替わる
//   ・そこから上の板（About）から順に、少しずつ時間をずらして右はしの定位置へ縮みながら移動する
//   ・着いたら、今読んでいるセクションの板だけ朱色になる。板（または横の文字）を押すと、そのセクションへ移動する
// スマホでは文字を出さず、小さな板だけを画面のふちに縦に並べる。
//
// しくみ：右はしの板は、ふだんは定位置にある。飛んでいる途中は、JS で
//   「最初の画面の板がある場所までのずれ（translate）」と「大きさの比（scale）」を計算し、
//   それをスクロール量に合わせて 0 に近づけていく。こうすると、最初の画面の板から定位置へ動いて見える。

const ITEMS = [
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "works", label: "Works" },
  { id: "career", label: "Career" },
  { id: "contact", label: "Contact" },
];

// 1 枚ごとに出発を遅らせる量（全体の進み具合 0〜1 に対して）
const STAGGER = 0.1;
// ゆっくり動き出して、ゆっくり止まる（0〜1 → 0〜1）
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export default function SideNav() {
  // active：今いるセクションの番号（-1 はまだどこにも入っていない） / arrived：板が全部定位置に着いたか
  const [active, setActive] = useState(-1);
  const [arrived, setArrived] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const flies = Array.from(nav.querySelectorAll<HTMLElement>(".mini-fly"));
    const labels = Array.from(nav.querySelectorAll<HTMLElement>(".side-label"));
    const root = document.documentElement;
    let frame = 0;
    // 定位置にあるときの板の見た目の位置と大きさ（右はしの目次は画面に固定なので、画面の大きさが変わったときだけ測り直す）
    let home: DOMRect[] = [];
    const measure = () => {
      flies.forEach((el) => (el.style.transform = "none"));
      home = flies.map((el) => el.firstElementChild!.getBoundingClientRect());
    };

    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      // 飛ぶ動きの進み具合：スクロール 0 から画面の高さの 65% までで 0 → 1
      const t = reduced ? (window.scrollY > vh * 0.45 ? 1 : 0) : clamp01(window.scrollY / (vh * 0.65));
      // 入れ替わりの進み具合（0〜1）。最初の 12% のあいだに、最初の画面の板（文字入り）から、重ねて置いた目次の板へ
      // ふわっと入れ替える（globals.css の .hero-stack-out が --fly を使う）。入れ替わってから飛び始める
      const swap = clamp01(t / 0.12);
      const move = clamp01((t - 0.12) / 0.88);
      root.style.setProperty("--fly", String(swap));

      if (t >= 1 || reduced) {
        flies.forEach((el, i) => {
          el.style.transform = "";
          el.style.opacity = t > 0 ? "1" : "0";
          labels[i].style.opacity = "";
        });
      } else {
        const heroPlates = document.querySelectorAll<HTMLElement>("[data-hero-plate]");
        // 先に位置を全部読んでから、まとめて書き換える（読む・書くを交互にすると遅くなる）
        const heroRects = flies.map((_, i) => heroPlates[i]?.getBoundingClientRect());
        flies.forEach((el, i) => {
          const hero = heroRects[i];
          const to = home[i];
          if (!hero || hero.width === 0 || !to) return;
          // この板の進み具合。上の板ほど先に出発する
          const p = ease(clamp01((move - i * STAGGER) / (1 - STAGGER * (ITEMS.length - 1))));
          // sx, sy：最初の画面の板が、定位置の板の横・縦それぞれ何倍の大きさか / dx, dy：中心どうしのずれ
          // （遠近の付き方が少し違うので、横と縦を別々に合わせて、形がぴったり重なるようにする）
          const sx = hero.width / to.width;
          const sy = hero.height / to.height;
          const dx = hero.left + hero.width / 2 - (to.left + to.width / 2);
          const dy = hero.top + hero.height / 2 - (to.top + to.height / 2);
          el.style.transform = `translate3d(${dx * (1 - p)}px, ${dy * (1 - p)}px, 0) scale(${sx + (1 - sx) * p}, ${sy + (1 - sy) * p})`;
          el.style.opacity = String(swap);
          // 項目の名前は、板が着く直前にふわっと出す
          labels[i].style.opacity = String(clamp01((p - 0.75) / 0.25));
        });
      }
      setArrived(t >= 1);

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
    const onResize = () => {
      measure();
      onScroll();
    };
    measure();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <nav
      ref={navRef}
      aria-label="目次"
      className={`side-nav fixed right-1 top-1/2 z-30 -translate-y-1/2 sm:right-6 ${arrived ? "is-arrived" : ""}`}
    >
      <ul className="flex flex-col gap-1 sm:gap-2">
        {ITEMS.map((item, i) => {
          const isActive = arrived && i === active;
          return (
            // 上の板（About）ほど手前に重ねる（最初の画面の板の重なり順と同じにする）
            <li key={item.id} className="relative" style={{ zIndex: ITEMS.length - i }}>
              <a
                href={`#${item.id}`}
                aria-label={item.label}
                aria-current={isActive ? "location" : undefined}
                tabIndex={arrived ? undefined : -1}
                className={`side-item group flex items-center justify-end gap-3 ${isActive ? "is-active" : ""}`}
              >
                {/* 項目の名前。パソコンでは常に出す。スマホでは出さない（globals.css） */}
                <span className="side-label font-display text-sm tracking-tight">
                  <span className="mr-2 text-[10px] tabular-nums text-accent">{String(i + 1).padStart(2, "0")}</span>
                  {item.label}
                </span>
                {/* mini-scene：定位置（動かさない入れ物） / mini-fly：最初の画面から飛んでくる部分 / mini-plate：板そのもの */}
                <span className="mini-scene" aria-hidden="true">
                  <span className="mini-fly">
                    <span className="mini-plate" />
                  </span>
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
