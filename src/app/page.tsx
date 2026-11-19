import Header from "@/components/Header";
import { WorkIllustration } from "@/components/illustrations/WorkIllustration";
import { Fireflies, SunRays } from "@/components/nature/Atmosphere";
import { Ground, HeroFoliage, SideFoliage } from "@/components/nature/Foliage";
import { JungleBackdrop, JungleMist, JungleSilhouettes, JungleTrunks, Lianas } from "@/components/nature/Jungle";
import Reveal from "@/components/Reveal";
import ScrollDepth from "@/components/ScrollDepth";
import Section from "@/components/Section";
import ForestIsland from "@/components/three/ForestIsland";
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
      <JungleBackdrop />
      <SideFoliage />
      <main id="top" className="flex-1">
        {/* ヒーロー：ジャングルの奥をのぞきこむような最初の画面。
            奥から順に「木の幹 → 光と霧 → たれ下がるツル → 生い茂る植物 → 光の粒 → 手前の葉（ヤシ・シダ・草むら）」と重ねています */}
        <div className="relative isolate flex min-h-[92svh] items-center overflow-hidden bg-[radial-gradient(ellipse_at_50%_0%,var(--sun),transparent_70%)]">
          <div className="silhouette-fade parallax absolute inset-0" style={{ "--depth": 0.4 } as React.CSSProperties}>
            <JungleTrunks />
          </div>
          <JungleMist />
          <SunRays />
          <div className="parallax pointer-events-none absolute inset-0" style={{ "--depth": 0.2 } as React.CSSProperties}>
            <Lianas />
          </div>
          <HeroFoliage />
          <Fireflies />
          <JungleSilhouettes />
          <div className="jungle-vignette silhouette-fade pointer-events-none absolute inset-0" aria-hidden="true" />
          {/* hero-fade：スクロールすると中身がゆっくり沈みながら薄くなる（globals.css）
              名前は「縦書き」にしています。[writing-mode:vertical-rl] は「文字を上から下へ、行を右から左へ」並べる CSS。
              日本語ならではの組み方で、よくある「Hello, I'm 〇〇」の横書きテンプレートと差を付けています */}
          <div className="hero-fade relative mx-auto flex w-full max-w-5xl flex-col items-center px-6 pb-44 pt-32 sm:pt-40">
            <Reveal className="flex items-start gap-5 sm:gap-8">
              <p className="pt-3 text-xs tracking-[0.4em] text-muted [writing-mode:vertical-rl] sm:text-sm">
                {profile.role}
              </p>
              <h1 className="font-mincho text-6xl font-medium tracking-[0.18em] [writing-mode:vertical-rl] sm:text-8xl">
                {profile.name}
              </h1>
            </Reveal>
            <Reveal delay={350}>
              <p className="mt-6 font-serif text-2xl italic tracking-wide text-muted sm:text-3xl">
                {profile.nameEn}
              </p>
            </Reveal>
            {profile.catchCopy && (
              <Reveal delay={500}>
                <p className="mt-6 text-sm leading-loose tracking-[0.2em]">{profile.catchCopy}</p>
              </Reveal>
            )}
          </div>
          {/* 下へ読み進められることを、細い線が流れ落ちる動きでそっと知らせる */}
          <a
            href="#about"
            className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 font-serif text-sm italic tracking-[0.2em] text-foreground/70 hover:text-foreground"
          >
            scroll
            <span className="relative h-14 w-px overflow-hidden bg-foreground/15" aria-hidden="true">
              <span className="scroll-cue absolute inset-0 bg-foreground/70" />
            </span>
          </a>
        </div>

        <div className="mx-auto w-full max-w-5xl px-6">
          <Section id="about" title="About" label="自己紹介">
            <div className="grid items-start gap-12 lg:grid-cols-[1fr_15rem]">
              <Reveal className="max-w-[34em] space-y-6 text-[15px] leading-[2.1]">
                {profile.about.map((text) => (
                  <p key={text}>{text}</p>
                ))}
              </Reveal>
              {/* 3D の小島：ドラッグで回せる（three.js） */}
              <Reveal delay={200}>
                <ForestIsland className="mx-auto max-w-[260px]" />
              </Reveal>
            </div>
          </Section>

          <Section id="skills" title="Skills" label="できること">
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

          <Section id="works" title="Works" label="つくったもの">
            <ol className="space-y-20">
              {works.map((work, i) => (
                <li key={work.title}>
                  <Reveal className="group grid items-center gap-8 lg:grid-cols-[1.15fr_1fr]">
                    {/* 作品のイメージ図（スクリーンショットを用意するまでの仮のイラスト）。マウスを乗せると少しだけ寄る */}
                    <div className="overflow-hidden rounded-sm">
                      <WorkIllustration className="transition duration-700 group-hover:scale-[1.03]" />
                    </div>
                    <div>
                      <p className="font-serif text-lg italic text-muted">
                        No.{String(i + 1).padStart(2, "0")}
                      </p>
                      <h3 className="mt-2 font-mincho text-2xl font-medium">{work.title}</h3>
                      <p className="mt-4 text-sm leading-loose text-muted">{work.description}</p>
                      {work.tech.length > 0 && (
                        <p className="mt-5 text-xs leading-relaxed text-muted">{work.tech.join(" ／ ")}</p>
                      )}
                      {work.url && (
                        <a
                          href={work.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-6 inline-flex items-center gap-2 border-b border-foreground/40 pb-1 text-sm transition hover:border-accent hover:text-accent"
                        >
                          {work.url.replace("https://", "")}
                          <span aria-hidden="true">↗</span>
                        </a>
                      )}
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </Section>

          <Section id="career" title="Career" label="経歴">
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

          <Section id="contact" title="Contact" label="連絡先">
            <Reveal>
              <p className="text-sm text-muted">GitHub</p>
              {/* マウスを乗せると、文字の下に線が左から引かれる */}
              <a
                href={profile.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-3 inline-flex items-baseline gap-3 font-serif text-3xl italic tracking-normal sm:text-5xl"
              >
                <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-1 transition-[background-size] duration-500 group-hover:bg-[length:100%_1px]">
                  {profile.links.github.replace("https://", "")}
                </span>
                <span className="text-2xl transition group-hover:-translate-y-1 group-hover:translate-x-1" aria-hidden="true">
                  ↗
                </span>
              </a>
            </Reveal>
          </Section>
        </div>
      </main>
      {/* ページのいちばん下も、植物の茂みで締めくくる */}
      <Ground className="h-20 sm:h-36" />
      <footer className="bg-[var(--leaf-4)] py-6 text-center text-xs tracking-[0.2em] text-white/70">
        © {new Date().getFullYear()} {profile.nameEn}
      </footer>
    </>
  );
}
