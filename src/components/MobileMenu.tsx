"use client";

import { useState } from "react";

// スマホ用のメニュー。「Menu」を押すと、ヘッダーの下にリンクの一覧が開きます。
// リンクを押すと自動で閉じます（open を false に戻す）。
// パソコンの幅（sm 以上）では表示しません（ヘッダーに文字のメニューが並ぶため）。
export default function MobileMenu({ items }: { items: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="flex h-8 items-center gap-2 text-sm"
      >
        {open ? "Close" : "Menu"}
        {/* 2 本線 → × に変わるアイコン */}
        <span className="relative block h-3 w-4" aria-hidden="true">
          <span className={`absolute left-0 h-px w-4 bg-current transition ${open ? "top-1.5 rotate-45" : "top-0.5"}`} />
          <span className={`absolute left-0 h-px w-4 bg-current transition ${open ? "top-1.5 -rotate-45" : "top-2.5"}`} />
        </span>
      </button>
      <nav
        id="mobile-menu"
        className={`absolute inset-x-0 top-full border-b border-line bg-background px-6 pb-4 transition ${
          open ? "visible opacity-100" : "invisible -translate-y-2 opacity-0"
        }`}
      >
        <ul className="divide-y divide-line">
          {items.map((item, i) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-baseline justify-between py-3 font-display text-2xl font-medium tracking-tight"
              >
                {item.label}
                <span className="text-xs tabular-nums text-accent">{String(i + 1).padStart(2, "0")}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
