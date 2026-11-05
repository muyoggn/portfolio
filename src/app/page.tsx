import Header from "@/components/Header";
import Plant from "@/components/Plant";
import Reveal from "@/components/Reveal";
import Section from "@/components/Section";
import Terminal from "@/components/Terminal";
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
function CareerList({ heading, items }: { heading: string; items: CareerItem[] }) {
  return (
    <div>
      <h3 className="mb-4 font-bold">{heading}</h3>
      <ol className="space-y-4 border-l-2 border-line pl-5">
        {items.map((item) => (
          <li key={item.title} className="relative">
            {/* 縦線の上に乗る小さな丸（新芽のイメージ） */}
            <span className="absolute -left-[1.72rem] top-1.5 h-3 w-3 rounded-full border-2 border-background bg-accent" />
            <p className="font-mono text-xs text-muted">{item.period}</p>
            <p className="mt-1">{item.title}</p>
            {item.note && <p className="text-sm text-muted">{item.note}</p>}
          </li>
        ))}
      </ol>
    </div>
  );
}

// カード共通の見た目。マウスを乗せると少し浮き上がり、枠が緑になります
const card =
  "h-full rounded-xl border border-line bg-background/70 p-5 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-lg hover:shadow-accent/10";

// トップページ（URL の「/」）です。
// src/app/page.tsx というファイルの置き場所が、そのまま URL になります。
export default function Home() {
  return (
    <>
      <Header />
      <main id="top" className="mx-auto w-full max-w-4xl flex-1 px-4">
        {/* ヒーロー：最初に目に入る自己紹介エリア */}
        <div className="grid items-center gap-10 py-12 md:grid-cols-[1fr_auto] md:py-28">
          <div>
            <Reveal>
              <p className="font-mono text-sm text-accent">Hello, I&apos;m</p>
              <h1 className="mt-2 text-4xl font-bold sm:text-5xl">{profile.name}</h1>
              <p className="mt-1 font-mono text-muted">{profile.nameEn}</p>
              <p className="mt-4 text-muted">{profile.role}</p>
              <p className="mt-6 text-xl">{profile.catchCopy}</p>
            </Reveal>
            <Reveal delay={200} className="mt-8">
              <Terminal
                lines={[
                  { command: "whoami", output: [`${profile.nameEn} / 情報科学科 3年`] },
                  { command: "cat interests.txt", output: ["社会シミュレーション", "観葉植物 🌿 / 料理 🍳"] },
                ]}
              />
            </Reveal>
            <Reveal delay={400}>
              <a
                href="#works"
                className="group mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-background transition hover:opacity-90"
              >
                作品を見る
                <span className="transition group-hover:translate-x-1">→</span>
              </a>
            </Reveal>
          </div>
          {/* 観葉植物のイラスト（スマホでは小さめ） */}
          <Plant className="order-first mx-auto -mb-6 w-28 md:order-last md:mb-0 md:w-56" />
        </div>

        <Section id="about" number="01" title="About">
          <Reveal className="space-y-4 leading-relaxed">
            {profile.about.map((text) => (
              <p key={text}>{text}</p>
            ))}
          </Reveal>
        </Section>

        <Section id="skills" number="02" title="Skills">
          <div className="grid gap-6 sm:grid-cols-2">
            {skills.map((group, i) => (
              <Reveal key={group.category} delay={i * 100}>
                <div className={card}>
                  <h3 className="mb-3 font-bold">{group.category}</h3>
                  <ul className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <li key={item.name} className="rounded-md bg-surface px-2 py-1 text-sm">
                        {item.name}
                        {item.note && <span className="ml-1 text-xs text-muted">（{item.note}）</span>}
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
                  <p className="mt-2 text-sm leading-relaxed text-muted">{work.description}</p>
                  {work.tech.length > 0 && (
                    <p className="mt-4 font-mono text-xs text-accent">{work.tech.join(" / ")}</p>
                  )}
                </article>
              </Reveal>
            ))}
          </div>
        </Section>

        <Section id="career" number="04" title="Career">
          <div className="grid gap-10 sm:grid-cols-2">
            <Reveal>
              <CareerList heading="学歴" items={education} />
            </Reveal>
            <Reveal delay={150} className="space-y-10">
              <CareerList heading="アルバイト" items={experience} />
              <CareerList heading="資格" items={certifications} />
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
      </main>
      <footer className="border-t border-line py-6 text-center font-mono text-xs text-muted">
        © {new Date().getFullYear()} {profile.nameEn} · grown with Next.js 🌱
      </footer>
    </>
  );
}
