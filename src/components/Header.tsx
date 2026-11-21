import ThemeToggle from "@/components/ThemeToggle";
import { profile } from "@/data/profile";

// ページ上部の帯。左に名前、右に色のテーマの切り替えだけを置いています。
// セクションへの目次は、右はしの小さな板（SideNav.tsx）にまとめたので、ここには並べません。
export default function Header() {
  return (
    // fixed：画面の上にずっと貼りついたままにする。背景を半透明＋ぼかしにして、下の内容がうっすら透ける
    <header className="fixed inset-x-0 top-0 z-20 bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#top" className="shrink-0 font-display text-sm font-semibold tracking-tight sm:text-base">
          {profile.nameEn}
        </a>
        <ThemeToggle />
      </div>
      {/* 読んだ量を表す細い線（globals.css の .progress。ScrollDepth.tsx が --sp を書き込む） */}
      <span className="progress absolute inset-x-0 bottom-0 h-px bg-accent" aria-hidden="true" />
    </header>
  );
}
