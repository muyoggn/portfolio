"use client";

import { useEffect, useState } from "react";
import {
  applyTheme,
  DAY_START,
  NIGHT_START,
  resolveTheme,
  STORAGE_KEY,
  type ThemeMode,
} from "@/lib/theme";

// ヘッダー右端のボタン。押すたびに「自動 → ライト → ダーク → 自動 …」と切り替わります。
// 「自動」のときは、ページを開いたままでも 1 分ごとに時刻を確かめ、夕方や朝になったら色が変わります。
const NEXT: Record<ThemeMode, ThemeMode> = {
  auto: "light",
  light: "dark",
  dark: "auto",
};

const LABEL: Record<ThemeMode, string> = {
  auto: `自動（${DAY_START}時〜${NIGHT_START}時はライト、それ以外はダーク）`,
  light: "ライトモード固定",
  dark: "ダークモード固定",
};

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

  const choose = () => {
    if (!mode) return;
    const next = NEXT[mode];
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

  const shown = mode ? resolveTheme(mode) : null;

  return (
    <button
      type="button"
      onClick={choose}
      title={mode ? `${LABEL[mode]}（クリックで切り替え）` : "テーマ切り替え"}
      aria-label={mode ? `テーマ：${LABEL[mode]}。クリックで切り替え` : "テーマ切り替え"}
      className="flex h-8 shrink-0 items-center gap-1 rounded-full border border-line px-2 text-muted transition hover:border-accent hover:text-foreground"
    >
      {/* 太陽か月のアイコン（今の見た目） */}
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        {shown === "dark" ? (
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
        ) : (
          <>
            <path d="M12 8a4 4 0 1 0 0 8a4 4 0 1 0 0-8Z" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        )}
      </svg>
      {/* 今のモード名（AUTO / LIGHT / DARK）を小さく添える */}
      <span className="hidden font-mono text-[10px] leading-none sm:inline">
        {mode === "auto" ? "AUTO" : mode === null ? "" : mode.toUpperCase()}
      </span>
    </button>
  );
}
