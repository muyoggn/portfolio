import Header from "@/components/Header";
import { Icon, WorkIllustration, type IconName } from "@/components/illustrations/Icons";
import { Fireflies, SunRays } from "@/components/nature/Atmosphere";
import { Ground, HeroFoliage, SideFoliage } from "@/components/nature/Foliage";
import { JungleBackdrop, JungleMist, JungleSilhouettes, JungleTrunks, Lianas } from "@/components/nature/Jungle";
import Reveal from "@/components/Reveal";
import ScrollDepth from "@/components/ScrollDepth";
import ScrollLinked from "@/components/ScrollLinked";
import Section from "@/components/Section";
import Terminal from "@/components/Terminal";
import ForestIsland from "@/components/three/ForestIsland";
import {
  certifications,
  education,
  experience,
  profile,
  skills,
  works,
  type CareerItem,
} from "@/data/profile";

// 経歴の一覧（学歴・アルバイト・資格で同じ見た目を使い回すための小さな部品）
// スクロールすると、左の縦線（茎）が上から伸びていき、届いたところの丸（節）に色が付きます。
function CareerList({
  heading,
  icon,
  items,
}: {
  heading: string;
  icon: IconName;
  items: CareerItem[];
}) {
  return (
    <ScrollLinked>
      <h3 className="mb-4 flex items-center gap-3 font-bold">
        <Icon name={icon} className="h-10 w-10" />
        {heading}
      </h3>
      <ol className="relative ml-5 space-y-4 pl-5">
        {/* 灰色の線（まだ伸びていない部分）と、その上に伸びる緑の茎 */}
        <span className="absolute inset-y-0 left-0 w-0.5 bg-line" aria-hidden="true" />
        <span className="stem absolute inset-y-0 left-0 w-0.5 bg-accent" aria-hidden="true" />
        {items.map((item, i) => (
          <li
            key={item.title}
            className="relative"
            style={{ "--at": (i + 0.3) / items.length } as React.CSSProperties}
          >
            {/* 縦線の上に乗る小さな丸（新芽のイメージ）。茎が届くと色が付く */}
            <span className="absolute -left-[1.6rem] top-1.5 h-3 w-3 rounded-full border-2 border-background bg-line" aria-hidden="true" />
            <span className="node absolute -left-[1.6rem] top-1.5 h-3 w-3 rounded-full border-2 border-background bg-accent" aria-hidden="true" />
            <p className="font-mono text-xs text-muted">{item.period}</p>
            <p className="mt-1">{item.title}</p>
            {item.note && <p className="text-sm text-muted">{item.note}</p>}
          </li>
        ))}
      </ol>
    </ScrollLinked>
  );
}

// カード共通の見た目。マウスを乗せると少し浮き上がり、枠が緑になります
const card =
  "h-full rounded-xl border border-line bg-background/85 p-5 transition duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-lg hover:shadow-accent/10";

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
          {/* hero-fade：スクロールすると中身がゆっくり沈みながら薄くなる（globals.css） */}
          <div className="hero-fade relative mx-auto w-full max-w-2xl px-6 pb-32 pt-36 sm:pt-44">
            <Reveal className="text-center">
              <p className="font-mono text-sm text-accent">Hello, I&apos;m</p>
              <h1 className="mt-2 text-4xl font-bold sm:text-5xl">
                {profile.name}
              </h1>
              <p className="mt-1 font-mono text-muted">{profile.nameEn}</p>
              <p className="mt-4 text-sm text-muted sm:text-base">
                {profile.role}
              </p>
              <p className="mt-6 text-lg sm:text-xl">{profile.catchCopy}</p>
            </Reveal>
            <Reveal delay={300} className="mt-8">
              <Terminal
                lines={[
                  {
                    command: "whoami",
                    output: [`${profile.nameEn} / 情報科学科 3年`],
                  },
                  {
                    command: "cat interests.txt",
                    output: ["社会シミュレーション", "観葉植物 🌿 / 料理 🍳"],
                  },
                  {
                    command: "npm run grow",
                    output: ["🌱 → 🌿 → 🌳  ...growing every day"],
                  },
                ]}
              />
            </Reveal>
            <Reveal delay={500} className="text-center">
              <a
                href="#works"
                className="group mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-background shadow-lg shadow-accent/20 transition hover:opacity-90"
              >
                作品を見る
                <span className="transition group-hover:translate-x-1">→</span>
              </a>
            </Reveal>
          </div>
        </div>

        <div className="mx-auto w-full max-w-4xl px-4">
          <Section id="about" number="01" title="About">
            <div className="grid items-center gap-10 md:grid-cols-[1fr_300px]">
              <div>
                <Reveal className="space-y-4 leading-relaxed">
                  {profile.about.map((text) => (
                    <p key={text}>{text}</p>
                  ))}
                </Reveal>
                {/* ひと目でわかる自分：イラスト＋短い言葉 */}
                <ul className="mt-8 grid gap-4 sm:grid-cols-3">
                  {profile.highlights.map((h, i) => (
                    <li key={h.text}>
                      <Reveal delay={i * 120} className="flex items-center gap-3 sm:flex-col sm:text-center">
                        <Icon name={h.icon} className="h-14 w-14" />
                        <div>
                          <p className="font-mono text-xs text-accent">{h.title}</p>
                          <p className="text-sm">{h.text}</p>
                        </div>
                      </Reveal>
                    </li>
                  ))}
                </ul>
              </div>
              {/* 3D の小島：ドラッグで回せる（three.js） */}
              <Reveal delay={200}>
                <ForestIsland className="mx-auto max-w-[300px]" />
              </Reveal>
            </div>
          </Section>

          <Section id="skills" number="02" title="Skills">
            <div className="grid gap-6 sm:grid-cols-2">
              {skills.map((group, i) => (
                <Reveal key={group.category} delay={i * 100}>
                  <div className={card}>
                    <h3 className="mb-3 flex items-center gap-3 font-bold">
                      <Icon name={group.icon} className="h-10 w-10" />
                      {group.category}
                    </h3>
                    <ul className="flex flex-wrap gap-2">
                      {group.items.map((item, j) => (
                        <li
                          key={item.name}
                          className="chip rounded-md bg-surface px-2 py-1 text-sm"
                          style={{ "--i": j } as React.CSSProperties}
                        >
                          {item.name}
                          {item.note && (
                            <span className="ml-1 text-xs text-muted">
                              （{item.note}）
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              ))}
            </div>
          </Section>

          <Section id="works" number="03" title="Works">
            <div className="grid gap-6 sm:grid-cols-2">
              {works.map((work, i) => (
                <Reveal key={work.title} delay={i * 100}>
                  <article className={card}>
                    {/* 作品のイメージ図（スクリーンショットの代わりのイラスト） */}
                    <WorkIllustration className="mb-4 rounded-lg" />
                    <h3 className="font-bold">
                      {work.url ? (
                        <a
                          href={work.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-accent"
                        >
                          {work.title} ↗
                        </a>
                      ) : (
                        work.title
                      )}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {work.description}
                    </p>
                    {work.tech.length > 0 && (
                      <p className="mt-4 font-mono text-xs text-accent">
                        {work.tech.join(" / ")}
                      </p>
                    )}
                  </article>
                </Reveal>
              ))}
            </div>
          </Section>

          <Section id="career" number="04" title="Career">
            <div className="grid gap-10 sm:grid-cols-2">
              <Reveal>
                <CareerList heading="学歴" icon="school" items={education} />
              </Reveal>
              <Reveal delay={150} className="space-y-10">
                <CareerList heading="アルバイト" icon="shop" items={experience} />
                <CareerList heading="資格" icon="medal" items={certifications} />
              </Reveal>
            </div>
          </Section>

          <Section id="contact" number="05" title="Contact">
            <Reveal>
              <a
                href={profile.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className={`${card} inline-flex items-center gap-3 font-mono`}
              >
                <span className="text-accent">GitHub</span>
                <span>{profile.links.github.replace("https://", "")}</span>
              </a>
            </Reveal>
          </Section>
        </div>
      </main>
      {/* ページのいちばん下も、植物の茂みで締めくくる */}
      <Ground className="h-20 sm:h-36" />
      <footer className="bg-[var(--leaf-4)] py-6 text-center font-mono text-xs text-white/80">
        © {new Date().getFullYear()} {profile.nameEn} · grown with Next.js 🌱
      </footer>
    </>
  );
}
