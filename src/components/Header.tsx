import MobileMenu from "@/components/MobileMenu";
import ThemeToggle from "@/components/ThemeToggle";
import { profile } from "@/data/profile";

// ページ上部のメニュー。href="#about" のように書くと、
// 同じページ内の id="about" の場所へスクロールで移動します。
const navItems = [
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#works", label: "Works" },
  { href: "#career", label: "Career" },
  { href: "#contact", label: "Contact" },
];

export default function Header() {
  return (
    // fixed：画面の上にずっと貼りついたままにする。背景を半透明＋ぼかしにして、下の内容がうっすら透ける
    <header className="fixed inset-x-0 top-0 z-20 bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#top" className="shrink-0 font-display text-sm font-semibold tracking-tight sm:text-base">
          {profile.nameEn}
        </a>
        <div className="flex items-center gap-3 sm:gap-6">
          {/* パソコンでは文字のメニューを並べ、スマホでは「Menu」ボタン（MobileMenu.tsx）にまとめる */}
          <nav className="hidden sm:block">
            <ul className="flex gap-6 text-sm text-muted">
              {navItems.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="transition hover:text-foreground">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <ThemeToggle />
          <MobileMenu items={navItems} />
        </div>
      </div>
      {/* 読んだ量を表す細い線（globals.css の .progress。ScrollDepth.tsx が --sp を書き込む） */}
      <span className="progress absolute inset-x-0 bottom-0 h-px bg-accent" aria-hidden="true" />
    </header>
  );
}
