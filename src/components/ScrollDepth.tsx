"use client";

import { useEffect } from "react";

// スクロールした量を CSS 変数 --sy に書き込むだけの、見た目のない部品です。
// CSS 側で「--sy × 奥行き」だけ葉っぱをずらすと、手前と奥で動く速さが変わり、
// 森の中を進んでいるような奥行き（パララックス効果）が生まれます。
// あわせて、ページ全体のうち何割読んだか（0〜1）を --sp に入れています（ヘッダーの伸びるツルで使用）。
export default function ScrollDepth() {
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const root = document.documentElement;
      const max = root.scrollHeight - window.innerHeight;
      root.style.setProperty("--sy", String(window.scrollY));
      root.style.setProperty("--sp", String(max > 0 ? Math.min(1, window.scrollY / max) : 0));
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
