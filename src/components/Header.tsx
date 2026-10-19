import { profile } from "@/data/profile";

// ページ上部のメニュー。href="#about" のように書くと、
// 同じページ内の id="about" の場所へスクロールで移動します。
const navItems = [
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#works", label: "Works" },
  { href: "#contact", label: "Contact" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <a href="#top" className="font-mono text-sm font-bold">
          {profile.nameEn}
        </a>
        <nav>
          <ul className="flex gap-4 text-sm text-muted">
            {navItems.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="hover:text-foreground">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
