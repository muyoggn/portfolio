import Reveal from "@/components/Reveal";

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
      <Reveal>
        {/* 見出しは「01. About」＋ 右に伸びる線。コードのコメント風に // を付けています */}
        <h2 className="mb-8 flex items-center gap-3 text-2xl font-bold">
          <span className="font-mono text-sm text-accent">
            {"//"} {number}.
          </span>
          {title}
          {/* 見出しが現れると、この線が左から右へ伸びる（globals.css の .heading-line） */}
          <span className="heading-line h-px flex-1 bg-line" />
        </h2>
      </Reveal>
      {children}
    </section>
  );
}
