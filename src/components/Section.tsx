import Reveal from "@/components/Reveal";

// 各セクション（About / Skills など）で共通の「見出し＋中身」の部品です。
// 同じ見た目を何度も書かずに済むよう、部品（コンポーネント）にしています。
// props（プロップス）は、部品に外から渡す値のことです。
//
// レイアウト：広い画面では「左に見出し・右に中身」の 2 列。雑誌や作品集でよく使われる組み方で、
// 見出しが左の余白に置かれることで、中身の文章がゆったり読めます。
// スマホでは見出しが上、中身が下の 1 列になります。
type SectionProps = {
  id: string;
  title: string; // 英語の見出し（About など）
  label: string; // 日本語の小さな添え書き（自己紹介 など）
  children: React.ReactNode;
};

export default function Section({ id, title, label, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-20 py-20 sm:py-28">
      <div className="grid gap-10 md:grid-cols-[13rem_1fr] md:gap-12">
        <Reveal>
          {/* md:sticky：スクロールしても、そのセクションを読んでいる間は見出しが左に残る */}
          <header className="md:sticky md:top-28">
            <h2 className="font-serif text-5xl font-normal italic leading-none tracking-normal sm:text-6xl">
              {title}
            </h2>
            <p className="mt-4 text-xs tracking-[0.3em] text-muted">{label}</p>
          </header>
        </Reveal>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}
