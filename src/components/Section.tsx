import Reveal from "@/components/Reveal";
import ScrollLinked from "@/components/ScrollLinked";

// 各セクション（About / Skills など）で共通の「見出し＋中身」の部品です。
// 同じ見た目を何度も書かずに済むよう、部品（コンポーネント）にしています。
// props（プロップス）は、部品に外から渡す値のことです。
//
// 見出しは大きな英字＋右肩に小さな番号。画面に入ると、寝かせた板が起き上がるように立ち上がります（.flip）。
// さらに、セクションが画面の下から入ってくるあいだ、見出しが左のふちから横にすべり出てきます（.title-slide）。
// ScrollLinked が「セクションがどこまで画面に入ったか」を --p に入れ、CSS がその分だけ横にずらします。
// 広い画面では「左に見出し・右に中身」の 2 列、スマホでは上下の 1 列になります。
type SectionProps = {
  id: string;
  number: string; // 右肩の小さな番号（01 など）
  title: string; // 英語の見出し（About など）
  label: string; // 日本語の小さな添え書き（自己紹介 など）
  children: React.ReactNode;
};

export default function Section({ id, number, title, label, children }: SectionProps) {
  return (
    // overflow-x-clip：左にずらした見出しを、セクションのふちで切り取る（そこから出てくるように見える）
    <section id={id} className="scroll-mt-20 overflow-x-clip py-28 sm:py-40">
      <ScrollLinked start={1} end={0.2} className="grid gap-10 md:grid-cols-[16rem_1fr] md:gap-12">
        <Reveal className="flip">
          {/* md:sticky：そのセクションを読んでいる間は、見出しが左に残る */}
          <header className="md:sticky md:top-28">
            <h2 className="title-slide font-display text-6xl font-semibold leading-none tracking-[-0.04em] sm:text-7xl">
              {title}
              <sup className="ml-1.5 align-super text-xs font-medium tracking-normal text-accent">{number}</sup>
            </h2>
            <p className="mt-5 tracking-[0.2em] text-muted">{label}</p>
          </header>
        </Reveal>
        <div className="min-w-0">{children}</div>
      </ScrollLinked>
    </section>
  );
}
