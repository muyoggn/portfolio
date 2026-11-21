"use client";

import { useEffect } from "react";

// スクロールした量を CSS 変数 --sy に書き込むだけの、見た目のない部品です。
// CSS 側でこの値を使うと、スクロールに合わせて最初の画面の板の間隔が広がったり、文字が薄くなったりします。
// あわせて、ページ全体のうち何割読んだか（0〜1）を --sp に、背景のトンネルを動かす量を --run に入れています。
export default function ScrollDepth() {
  useEffect(() => {
    let frame = 0;
    // 「動きを減らす」設定の人には、トンネルを動かさない
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const update = () => {
      frame = 0;
      const root = document.documentElement;
      const max = root.scrollHeight - window.innerHeight;
      root.style.setProperty("--sy", String(window.scrollY));
      root.style.setProperty("--sp", String(max > 0 ? Math.min(1, window.scrollY / max) : 0));
      // 背景のトンネルを手前へ動かす量。マス目 1 つ（80px）分動いたら 0 に戻る（くわしくは globals.css の「方眼のトンネル」）
      if (!reduced) root.style.setProperty("--run", `${((window.scrollY * 0.6) % 80).toFixed(1)}px`);
    };
    const onScroll = () => {
      // requestAnimationFrame：画面の描き直しのタイミングに合わせて 1 回だけ実行（動きがなめらかになる）
      if (!frame) frame = requestAnimationFrame(update);
    };
    update(); // 途中の位置で再読み込みしたときのために、最初に 1 回計算しておく
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);
  return null;
}
