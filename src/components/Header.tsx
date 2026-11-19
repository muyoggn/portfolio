import ScrollVine from "@/components/ScrollVine";
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
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <a href="#top" className="shrink-0 font-serif text-base italic tracking-normal sm:text-xl">
          {profile.nameEn}
        </a>
        <div className="flex items-center gap-2.5 sm:gap-5">
          <nav>
            <ul className="flex gap-2.5 text-[11px] text-muted sm:gap-6 sm:text-xs sm:tracking-wider">
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
      {/* 読んだ量を表すツル：スクロールに合わせて、くねくね曲がりながら右へ伸びていく */}
      <ScrollVine />
    </header>
  );
}
