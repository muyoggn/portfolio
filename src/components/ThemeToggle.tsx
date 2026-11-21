"use client";

import { useEffect, useState } from "react";
import {
  applyTheme,
  DAY_START,
  NIGHT_START,
  STORAGE_KEY,
  type ThemeMode,
} from "@/lib/theme";

// ヘッダー右端の切り替えスイッチ。「自動・ライト・ダーク」の 3 つが横に並んでいて、
// 選んでいるものの後ろに丸い「つまみ」がすべって移動します（スマホのスイッチのような見た目）。
// 3 つとも常に見えているので、押せば切り替わることがひと目でわかります。
// 「自動」のときは、ページを開いたままでも 1 分ごとに時刻を確かめ、夕方や朝になったら色が変わります。
const OPTIONS: { mode: ThemeMode; label: string }[] = [
  { mode: "auto", label: `自動（${DAY_START}時〜${NIGHT_START}時はライト、それ以外はダーク）` },
  { mode: "light", label: "ライト" },
  { mode: "dark", label: "ダーク" },
];

export default function ThemeToggle() {
  // サーバーで HTML を作る時点では、見る人の時計も保存した設定もわからないので null にしておく
  const [mode, setMode] = useState<ThemeMode | null>(null);

  // 表示されたら、<head> のスクリプトが決めたモードを読み取る
  useEffect(() => {
    const m = document.documentElement.dataset.themeMode as ThemeMode | undefined;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- ブラウザでしか分からない値を読み込むため
    setMode(m ?? "auto");
  }, []);

  // 「自動」のときだけ、1 分ごとに時刻を見直す
  useEffect(() => {
    if (mode !== "auto") return;
    const timer = setInterval(() => applyTheme("auto"), 60_000);
    return () => clearInterval(timer);
  }, [mode]);

  const choose = (next: ThemeMode) => {
    if (!mode || next === mode) return;
    // 色がパッと変わらず、ふわっと切り替わるように一時的にクラスを付ける
    const root = document.documentElement;
    root.classList.add("theme-changing");
    applyTheme(next);
    window.setTimeout(() => root.classList.remove("theme-changing"), 600);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // プライベートブラウズなどで保存できなくても、切り替え自体は動く
    }
    setMode(next);
  };

  // つまみの位置（0〜2）。読み込み前は「自動」の位置に置いておく
  const index = Math.max(0, OPTIONS.findIndex((o) => o.mode === mode));

  return (
    <div
      role="radiogroup"
      aria-label="色のテーマ"
      className="relative grid h-9 shrink-0 grid-cols-3 rounded-full border border-line bg-background/60 p-1"
    >
      {/* つまみ：選んでいるボタンの後ろに置く丸。translateX で横にすべらせる */}
      <span
        className="absolute inset-y-1 left-1 w-[calc((100%-0.5rem)/3)] rounded-full bg-foreground transition-transform duration-300 ease-out"
        style={{ transform: `translateX(${index * 100}%)` }}
        aria-hidden="true"
      />
      {OPTIONS.map((o) => {
        const selected = o.mode === mode;
        return (
          <button
            key={o.mode}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={o.label}
            title={o.label}
            onClick={() => choose(o.mode)}
            className={`relative z-10 flex w-11 items-center justify-center rounded-full transition-colors ${
              selected ? "text-background" : "text-muted hover:text-foreground"
            }`}
          >
            <Icon mode={o.mode} />
          </button>
        );
      })}
    </div>
  );
}

// それぞれのボタンの絵：自動は「AUTO」の文字、ライトは太陽、ダークは月
function Icon({ mode }: { mode: ThemeMode }) {
  if (mode === "auto") {
    return <span className="font-display text-[11px] font-semibold leading-none tracking-wide">AUTO</span>;
  }
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      {mode === "dark" ? (
        <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
      ) : (
        <>
          <path d="M12 8a4 4 0 1 0 0 8a4 4 0 1 0 0-8Z" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </>
      )}
    </svg>
  );
}
