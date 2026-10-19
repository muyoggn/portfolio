// 各セクション（About / Skills など）で共通の「見出し＋中身」の枠です。
// 同じ見た目を何度も書かずに済むよう、部品（コンポーネント）にしています。
// props（プロップス）は、部品に外から渡す値のことです。
type SectionProps = {
  id: string;
  number: string;
  title: string;
  children: React.ReactNode;
};

export default function Section({ id, number, title, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-16 py-16">
      <h2 className="mb-8 flex items-baseline gap-3 text-2xl font-bold">
        <span className="font-mono text-sm text-accent">{number}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}
