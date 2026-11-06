"use client";

import { useEffect } from "react";

// スクロールした量を CSS 変数 --sy に書き込むだけの、見た目のない部品です。
// CSS 側で「--sy × 奥行き」だけ葉っぱをずらすと、手前と奥で動く速さが変わり、
// 森の中を進んでいるような奥行き（パララックス効果）が生まれます。
export default function ScrollDepth() {
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      document.documentElement.style.setProperty("--sy", String(window.scrollY));
    };
    const onScroll = () => {
      // requestAnimationFrame：画面の描き直しのタイミングに合わせて 1 回だけ実行（動きがなめらかになる）
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);
  return null;
}
