import Header from "@/components/Header";
import LayerStack from "@/components/LayerStack";
import Reveal from "@/components/Reveal";
import ScrollDepth from "@/components/ScrollDepth";
import Section from "@/components/Section";
import Tilt from "@/components/Tilt";
import WorkPreview from "@/components/WorkPreview";
import {
  certifications,
  education,
  experience,
  profile,
  skills,
  works,
} from "@/data/profile";

// 経歴は「学歴・アルバイト・資格」を同じ見た目の表で並べます。
// 枠で囲む代わりに、行と行の間に細い線（.rule）を引くだけにして、すっきり見せています。
const careerGroups = [
  { label: "学歴", items: education },
  { label: "アルバイト", items: experience },
  { label: "資格", items: certifications },
];

// トップページ（URL の「/」）です。
// src/app/page.tsx というファイルの置き場所が、そのまま URL になります。
export default function Home() {
  return (
    <>
      <Header />
      <ScrollDepth />
      <main id="top" className="flex-1">
        {/* ヒーロー（最初の画面）：左に名前、右に宙に浮かぶ板の重なり。置く情報はこれだけにして、余白で見せる */}
        <section className="relative flex min-h-[100svh] items-center overflow-hidden">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-6 px-6 pb-24 pt-28 lg:grid-cols-[1.1fr_1fr]">
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
              <LayerStack className="mt-14 h-[340px] sm:h-[460px] lg:mt-0" />
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
        </section>

        <div className="mx-auto w-full max-w-6xl px-6">
          <Section id="about" number="01" title="About" label="自己紹介">
            <Reveal className="max-w-[36em] space-y-6 text-[15px] leading-[2.1]">
              {profile.about.map((text) => (
                <p key={text}>{text}</p>
              ))}
            </Reveal>
          </Section>

          <Section id="skills" number="02" title="Skills" label="できること">
            {/* dl（定義リスト）：「見出し（dt）と説明（dd）」の組を並べるための HTML タグ */}
            <dl className="border-b border-line">
              {skills.map((group, i) => (
                <Reveal key={group.category} delay={i * 80} className="relative grid gap-3 py-6 sm:grid-cols-[11rem_1fr]">
                  <span className="rule absolute inset-x-0 top-0 h-px bg-line" aria-hidden="true" />
                  <dt className="text-sm text-muted">{group.category}</dt>
                  <dd>
                    <ul className="flex flex-wrap gap-x-7 gap-y-2">
                      {group.items.map((item) => (
                        <li key={item.name}>
                          {item.name}
                          {item.note && <span className="ml-2 text-xs text-muted">{item.note}</span>}
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
                      <h3 className="mt-2 text-2xl font-medium">{work.title}</h3>
                      <p className="mt-4 text-sm leading-loose text-muted">{work.description}</p>
                      {work.tech.length > 0 && (
                        <p className="mt-5 text-xs leading-relaxed text-muted">{work.tech.join(" ／ ")}</p>
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
            <div className="space-y-14">
              {careerGroups.map((group) => (
                <div key={group.label}>
                  <h3 className="mb-3 text-xs tracking-[0.3em] text-muted">{group.label}</h3>
                  <ol className="border-b border-line">
                    {group.items.map((item, i) => (
                      <li key={item.title}>
                        <Reveal delay={i * 100} className="relative grid gap-1 py-5 sm:grid-cols-[11rem_1fr] sm:gap-3">
                          <span className="rule absolute inset-x-0 top-0 h-px bg-line" aria-hidden="true" />
                          {/* tabular-nums：数字の幅をそろえて、年月の縦の位置がずれないようにする */}
                          <p className="text-sm tabular-nums text-muted">{item.period}</p>
                          <div>
                            <p>{item.title}</p>
                            {item.note && <p className="mt-1 text-sm text-muted">{item.note}</p>}
                          </div>
                        </Reveal>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
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
                className="group mt-3 inline-flex items-baseline gap-3 font-display text-3xl font-medium tracking-[-0.03em] sm:text-5xl"
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
