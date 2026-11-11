"use client";

import { useEffect, useRef, useState } from "react";

// 3D の「浮かぶ森の小島」を表示する部品です。ドラッグ（スマホは横にスワイプ）で回せます。
//
// 軽く保つための工夫：
//  1. three.js（3D のライブラリ）は大きいので、ページを開いた瞬間には読み込まない。
//     この部品が画面に近づいたときに初めて import()（あとから読み込み）する
//  2. 画面の外に出たら描画を止める
//  3. 3D が使えない環境では、代わりに SVG の絵（下の Fallback）をそのまま見せる
//  4. 「動きを減らす」設定の人には、自動回転や浮遊を止める（ドラッグで回すのは可能）
type Scene = ReturnType<typeof import("./islandScene").createIslandScene>;

export default function ForestIsland({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    let scene: Scene | null = null;
    let cancelled = false;
    let visible = false;
    const currentTheme = () => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");

    // テーマ（data-theme）が変わったら 3D の色も変える
    const themeWatcher = new MutationObserver(() => scene?.setTheme(currentTheme()));

    const load = async () => {
      try {
        const { createIslandScene } = await import("./islandScene");
        if (cancelled) return;
        scene = createIslandScene(container, {
          reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
          theme: currentTheme(),
        });
        themeWatcher.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
        if (visible) scene.play();
        setReady(true);
      } catch {
        // WebGL が使えないブラウザなど。SVG の絵が出たままになるので、何もしなくて OK
      }
    };

    // 画面に近づいたら読み込み、見えている間だけ動かす
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !scene && !cancelled) {
          void load();
        }
        if (scene) {
          if (visible) scene.play();
          else scene.pause();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(container);

    return () => {
      cancelled = true;
      observer.disconnect();
      themeWatcher.disconnect();
      scene?.dispose();
    };
  }, []);

  return (
    <figure className={className}>
      <div
        ref={ref}
        tabIndex={0}
        role="img"
        aria-label="森の小島の 3D イラスト。木、針葉樹、ノートパソコン、鉢植えの植物が乗っています。左右の矢印キーやドラッグで回せます。"
        className="island relative aspect-square w-full cursor-grab touch-pan-y rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-accent data-[dragging]:cursor-grabbing"
      >
        {/* 3D が準備できるまで（または使えない環境で）見せる平面の絵 */}
        {!ready && <Fallback />}
      </div>
      <figcaption className="mt-2 text-center font-mono text-xs text-muted">
        ↔ drag to rotate
      </figcaption>
    </figure>
  );
}

function Fallback() {
  return (
    <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <path d="M40 118 L100 182 L160 118 Z" fill="var(--leaf-4)" opacity="0.5" />
      <ellipse cx="100" cy="116" rx="64" ry="16" fill="var(--leaf-3)" />
      <rect x="78" y="70" width="6" height="44" fill="var(--leaf-4)" />
      <circle cx="81" cy="64" r="22" fill="var(--leaf-2)" />
      <circle cx="96" cy="74" r="14" fill="var(--leaf-3)" />
      <path d="M126 112 L136 76 L146 112 Z" fill="var(--leaf-3)" />
    </svg>
  );
}
