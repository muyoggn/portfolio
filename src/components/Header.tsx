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
    <header className="sticky top-0 z-10 border-b border-line bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <a href="#top" className="shrink-0 font-mono text-xs font-bold sm:text-sm">
          {profile.nameEn}
        </a>
        <div className="flex items-center gap-2 sm:gap-4">
          <nav>
            <ul className="flex gap-2.5 text-xs text-muted sm:gap-4 sm:text-sm">
              {navItems.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="hover:text-foreground">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <ThemeToggle />
        </div>
      </div>
      {/* 読んだ量を表すバー：スクロールに合わせてツルが右へ伸びていく（--sp は ScrollDepth.tsx が更新） */}
      <div className="scroll-vine" aria-hidden="true" />
    </header>
  );
}
