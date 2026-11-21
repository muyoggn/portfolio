import Header from "@/components/Header";
import LayerStack from "@/components/LayerStack";
import Reveal from "@/components/Reveal";
import ScrollLinked from "@/components/ScrollLinked";
import ScrollDepth from "@/components/ScrollDepth";
import Section from "@/components/Section";
import SpaceGrid from "@/components/SpaceGrid";
import Tilt from "@/components/Tilt";
import WorkPreview from "@/components/WorkPreview";
import {
  certifications,
  education,
  experience,
  profile,
  skills,
  works,
  type CareerItem,
} from "@/data/profile";

// 経歴の年表（学歴・アルバイト・資格で同じ見た目を使い回すための小さな部品）。
// 左に縦線を引き、各行に丸（節）を置きます。スクロールすると朱色の線が上から下へ伸びていき、
// 線が届いた丸に色が付きます（ScrollLinked が --p に「どこまで読んだか」を入れる → globals.css の .stem / .node）。
// 上が過去、下が現在の順に並べているので、線の伸びる向きと時間の流れがそろいます。
function Timeline({ heading, items }: { heading: string; items: CareerItem[] }) {
  return (
    <ScrollLinked>
      <h3 className="mb-6 flex items-center gap-3 font-medium">
        <span className="h-2 w-2 rounded-[2px] bg-accent" aria-hidden="true" />
        {heading}
      </h3>
      <ol className="relative ml-1.5 space-y-10 pl-8">
        {/* 灰色の線（まだ読んでいない部分）と、その上に伸びる朱色の線 */}
        <span className="absolute inset-y-1 left-0 w-px bg-line" aria-hidden="true" />
        <span className="stem absolute inset-y-1 left-0 w-px bg-accent" aria-hidden="true" />
        {items.map((item, i) => (
          <li key={item.title} className="relative" style={{ "--at": (i + 0.3) / items.length } as React.CSSProperties}>
            {/* 線の上の丸。灰色の丸の上に、線が届くと朱色の丸が重なる */}
            <span className="absolute -left-8 top-1.5 h-3 w-3 -translate-x-1/2 rounded-full border border-line bg-background" aria-hidden="true" />
            <span className="node absolute -left-8 top-1.5 h-3 w-3 -translate-x-1/2 rounded-full bg-accent" aria-hidden="true" />
            <p className="text-sm tabular-nums text-muted">{item.period}</p>
            <p className="mt-1 font-medium">{item.title}</p>
            {item.note && <p className="mt-1 text-sm text-muted">{item.note}</p>}
          </li>
        ))}
      </ol>
    </ScrollLinked>
  );
}

// トップページ（URL の「/」）です。
// src/app/page.tsx というファイルの置き場所が、そのまま URL になります。
export default function Home() {
  return (
    <>
      <Header />
      <ScrollDepth />
      {/* 背景の、上下左右が方眼の壁になったトンネル。画面に固定され、文字の後ろに見える */}
      <SpaceGrid />
      <main id="top" className="flex-1">
        {/* ヒーロー（最初の画面）：左に名前、右に宙に浮かぶ板の重なり。置く情報はこれだけにして、余白で見せる。
            section を画面より 560px 長くして、中身を sticky（その場に貼り付く）にしています。
            こうすると、スクロールし始めてもしばらく最初の画面がその場に留まり、その間に板が横へ広がる様子が見えます */}
        <section className="hero-pin relative">
          <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-2 px-6 pb-16 pt-24 sm:gap-6 sm:pb-24 sm:pt-28 lg:grid-cols-[1.1fr_1fr]">
            <div className="hero-fade">
              <Reveal>
                <p className="text-xs tracking-[0.3em] text-muted">PORTFOLIO</p>
              </Reveal>
              <Reveal delay={120}>
                <h1 className="mt-6 font-display text-[clamp(3.75rem,11vw,8.5rem)] font-semibold leading-[0.86] tracking-[-0.05em]">
                  Go
                  <br />
                  Nagayama
                  <span className="text-accent">.</span>
                </h1>
              </Reveal>
              <Reveal delay={260}>
                <p className="mt-10 text-sm">
                  {profile.name}
                  {/* スマホでは大学名を次の行に回して、変なところで折り返さないようにする */}
                  <span className="mx-3 hidden h-px w-6 translate-y-[-0.3em] bg-foreground/40 align-middle sm:inline-block" aria-hidden="true" />
                  <span className="mt-1 block text-muted sm:mt-0 sm:inline">{profile.role}</span>
                </p>
              </Reveal>
              {profile.catchCopy && (
                <Reveal delay={380}>
                  <p className="mt-4 text-sm leading-loose text-muted">{profile.catchCopy}</p>
                </Reveal>
              )}
            </div>
            <Reveal delay={300}>
              <LayerStack className="mt-16 h-[300px] sm:mt-14 sm:h-[460px] lg:mt-0" />
            </Reveal>
          </div>
          {/* 下へ読み進められることを、細い線が流れ落ちる動きでそっと知らせる */}
          <a
            href="#about"
            className="absolute bottom-8 left-6 flex items-center gap-3 text-[11px] tracking-[0.3em] text-muted transition hover:text-foreground sm:left-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]"
          >
            <span className="relative block h-10 w-px overflow-hidden bg-line" aria-hidden="true">
              <span className="scroll-cue absolute inset-0 bg-foreground" />
            </span>
            SCROLL
          </a>
          </div>
        </section>

        <div className="mx-auto w-full max-w-6xl px-6">
          <Section id="about" number="01" title="About" label="自己紹介">
            <Reveal className="max-w-[36em] space-y-7 text-[1.0625rem] leading-[2.1]">
              {profile.about.map((text) => (
                <p key={text}>{text}</p>
              ))}
            </Reveal>
          </Section>

          <Section id="skills" number="02" title="Skills" label="できること">
            {/* dl（定義リスト）：「見出し（dt）と説明（dd）」の組を並べるための HTML タグ */}
            <dl className="border-b border-line">
              {skills.map((group, i) => (
                // slide：下からではなく、左から横にすべり込んでくる（globals.css の .reveal.slide）
                <Reveal key={group.category} delay={i * 90} className="slide relative grid gap-3 py-8 sm:grid-cols-[11rem_1fr]">
                  <span className="rule absolute inset-x-0 top-0 h-px bg-line" aria-hidden="true" />
                  <dt className="text-sm text-muted">{group.category}</dt>
                  <dd>
                    <ul className="flex flex-wrap items-center gap-x-8 gap-y-3 text-lg">
                      {group.items.map((item) => (
                        <li key={item.name} className="flex items-baseline gap-2">
                          {item.name}
                          {/* どこで使ったか（研究・授業など）は、カッコも枠も付けず、小さめの灰色の字でそっと添える */}
                          {item.note && <span className="text-xs text-muted">{item.note}</span>}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </Reveal>
              ))}
            </dl>
          </Section>

          <Section id="works" number="03" title="Works" label="つくったもの">
            <ol className="space-y-24">
              {works.map((work, i) => (
                <li key={work.title}>
                  <Reveal className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
                    {/* マウスを乗せると傾いて、ミニチュアの層が立体的にずれる */}
                    <Tilt>
                      <WorkPreview />
                    </Tilt>
                    <div>
                      <p className="font-display text-sm tabular-nums text-muted">
                        {String(i + 1).padStart(2, "0")}
                      </p>
                      <h3 className="mt-2 text-3xl font-medium">{work.title}</h3>
                      <p className="mt-4 leading-loose text-muted">{work.description}</p>
                      {work.tech.length > 0 && (
                        <p className="mt-5 text-sm leading-relaxed text-muted">{work.tech.join(" ／ ")}</p>
                      )}
                      {work.url && (
                        <a
                          href={work.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group mt-6 inline-flex items-center gap-2 text-sm"
                        >
                          <span className="border-b border-foreground/30 pb-1 transition group-hover:border-accent group-hover:text-accent">
                            {work.url.replace("https://", "")}
                          </span>
                          <span className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" aria-hidden="true">
                            ↗
                          </span>
                        </a>
                      )}
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </Section>

          <Section id="career" number="04" title="Career" label="経歴">
            <div className="grid gap-14 sm:grid-cols-2 sm:gap-10">
              <Reveal>
                <Timeline heading="学歴" items={education} />
              </Reveal>
              <Reveal delay={150} className="space-y-14">
                <Timeline heading="アルバイト" items={experience} />
                <Timeline heading="資格" items={certifications} />
              </Reveal>
            </div>
          </Section>

          <Section id="contact" number="05" title="Contact" label="連絡先">
            <Reveal>
              <p className="text-sm text-muted">GitHub</p>
              {/* マウスを乗せると、文字の下に線が左から引かれ、矢印が右上へ動く */}
              <a
                href={profile.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-3 inline-flex items-baseline gap-3 font-display text-3xl font-medium tracking-[-0.03em] sm:text-6xl"
              >
                <span className="bg-[linear-gradient(var(--accent),var(--accent))] bg-[length:0%_2px] bg-left-bottom bg-no-repeat pb-1 transition-[background-size] duration-500 group-hover:bg-[length:100%_2px]">
                  {profile.links.github.replace("https://", "")}
                </span>
                <span className="text-2xl text-accent transition group-hover:-translate-y-1 group-hover:translate-x-1" aria-hidden="true">
                  ↗
                </span>
              </a>
            </Reveal>
          </Section>
        </div>
      </main>
      <footer className="mx-auto flex w-full max-w-6xl items-center justify-between border-t border-line px-6 py-8 text-xs text-muted">
        <p>© {new Date().getFullYear()} {profile.nameEn}</p>
        <a href="#top" className="transition hover:text-foreground">
          Back to top ↑
        </a>
      </footer>
    </>
  );
}
