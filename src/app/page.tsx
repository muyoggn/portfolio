import Header from "@/components/Header";
import Section from "@/components/Section";
import { profile, skills, works } from "@/data/profile";

// トップページ（URL の「/」）です。
// src/app/page.tsx というファイルの置き場所が、そのまま URL になります。
export default function Home() {
  return (
    <>
      <Header />
      <main id="top" className="mx-auto w-full max-w-4xl flex-1 px-4">
        {/* ヒーロー：最初に目に入る自己紹介エリア */}
        <div className="py-24">
          <p className="font-mono text-sm text-accent">Hello, I&apos;m</p>
          <h1 className="mt-2 text-4xl font-bold sm:text-5xl">{profile.name}</h1>
          <p className="mt-2 text-muted">{profile.role}</p>
          <p className="mt-8 text-xl">{profile.catchCopy}</p>
          <a
            href="#works"
            className="mt-8 inline-block rounded-full bg-accent px-6 py-3 text-sm font-medium text-white hover:opacity-90"
          >
            作品を見る →
          </a>
        </div>

        <Section id="about" number="01" title="About">
          <div className="space-y-4 leading-relaxed">
            {profile.about.map((text) => (
              <p key={text}>{text}</p>
            ))}
          </div>
        </Section>

        <Section id="skills" number="02" title="Skills">
          <div className="grid gap-6 sm:grid-cols-2">
            {skills.map((group) => (
              <div key={group.category} className="rounded-lg border border-line p-5">
                <h3 className="mb-3 font-bold">{group.category}</h3>
                <ul className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <li key={item} className="rounded bg-surface px-2 py-1 text-sm">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        <Section id="works" number="03" title="Works">
          <div className="grid gap-6 sm:grid-cols-2">
            {works.map((work) => (
              <article key={work.title} className="rounded-lg border border-line p-5">
                <h3 className="font-bold">{work.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{work.description}</p>
                {work.tech.length > 0 && (
                  <p className="mt-4 font-mono text-xs text-accent">{work.tech.join(" / ")}</p>
                )}
              </article>
            ))}
          </div>
        </Section>

        <Section id="contact" number="04" title="Contact">
          <ul className="space-y-2">
            <li>
              Email:{" "}
              <a href={`mailto:${profile.links.email}`} className="text-accent underline">
                {profile.links.email}
              </a>
            </li>
            <li>
              GitHub:{" "}
              <a
                href={profile.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline"
              >
                {profile.links.github}
              </a>
            </li>
          </ul>
        </Section>
      </main>
      <footer className="border-t border-line py-6 text-center text-xs text-muted">
        © {profile.nameEn}
      </footer>
    </>
  );
}
