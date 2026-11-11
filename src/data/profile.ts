// =============================================================
// サイトに表示する「中身（データ）」をここにまとめています。
// 名前・自己紹介・スキル・作品・経歴を変えたいときは、このファイルだけ
// 書き換えればページ全体に反映されます。
// =============================================================

import type { IconName } from "@/components/illustrations/Icons";

// 「type」は TypeScript の機能で、データの形（どんな項目を持つか）を決めます。
// 形を決めておくと、項目の書き忘れや打ち間違いをエディタが教えてくれます。
export type Work = {
  title: string;
  description: string;
  tech: string[];
  url?: string; // 「?」が付いた項目は省略してもよい、という意味
};

export type Skill = {
  name: string;
  note?: string; // どこで使ったか（授業・研究など）。省略可
};

export type SkillGroup = {
  category: string;
  icon: IconName; // カードに添えるイラスト（src/components/illustrations/Icons.tsx の名前）
  items: Skill[];
};

// 経歴の 1 行分
export type CareerItem = {
  period: string; // 期間（例："2024.4 – 現在"）
  title: string;
  note?: string;
};

export const profile = {
  name: "永山 悟宇",
  nameEn: "Go Nagayama",
  role: "工学院大学 情報学部 情報科学科 3年",
  catchCopy: "作りながら学ぶ、学んだことを形に残す。",
  about: [
    "工学院大学 情報学部 情報科学科の3年生です。社会シミュレーション研究室（八木研）に所属し、研究では Java を使った人工市場による金融市場のシミュレーションをしています。",
    "授業で Python や C 言語、HTML、CSS、JavaScriptを学び、Unity（C#）にも触れてきました。このサイトは Next.js・React・TypeScript・Tailwind CSS を学びながら作った、最初の Web 制作物です。",
    "趣味は観葉植物を育てることと料理をすることです。",
  ],
  links: {
    github: "https://github.com/muyoggn",
  },
  // About の下に並べる「ひと目でわかる自分」。イラスト＋短い言葉で、文章を読む前に雰囲気が伝わるように
  highlights: [
    { icon: "research", title: "研究", text: "Java で人工市場をつくり、金融市場をシミュレーション" },
    { icon: "plant", title: "趣味", text: "観葉植物を育てること" },
    { icon: "cooking", title: "趣味", text: "料理をすること" },
  ] satisfies { icon: IconName; title: string; text: string }[],
};

export const skills: SkillGroup[] = [
  {
    category: "Web",
    icon: "web",
    items: [
      { name: "HTML" },
      { name: "CSS" },
      { name: "JavaScript" },
      { name: "TypeScript", note: "このサイト" },
    ],
  },
  {
    category: "プログラミング言語",
    icon: "code",
    items: [
      { name: "Java", note: "研究" },
      { name: "Python", note: "授業" },
      { name: "C", note: "授業" },
      { name: "C#", note: "Unity" },
    ],
  },
  {
    category: "フレームワーク・ツール",
    icon: "layers",
    items: [
      { name: "React" },
      { name: "Next.js" },
      { name: "Tailwind CSS" },
      { name: "Unity" },
      { name: "Git / GitHub" },
    ],
  },
  {
    category: "公開・インフラ",
    icon: "cloud",
    items: [{ name: "Cloudflare Workers" }],
  },
];

export const works: Work[] = [
  {
    title: "ポートフォリオサイト",
    description:
      "このサイトです。Next.js で作成し、Cloudflare Workers で公開しています。",
    tech: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Cloudflare"],
    url: "https://github.com/muyoggn/portfolio",
  },
];

// 学歴（上が古く、下が新しい。画面では縦線が上から下へ「過去 → 現在」と伸びていきます）
// 経歴を足すときは、どの一覧も「古いものを上、新しいものを下」に書いてください
export const education: CareerItem[] = [
  { period: "2021.04 – 2024.03", title: "明秀学園日立高等学校 特進STクラス" },
  {
    period: "2024.04 – 現在",
    title: "工学院大学 情報学部 情報科学科",
    note: "社会シミュレーション研究室（八木研究室）所属",
  },
];

// アルバイトなど
export const experience: CareerItem[] = [
  { period: "2024.05 – 現在", title: "焼肉 平城苑 八王子店", note: "アルバイト" },
];

// 資格
export const certifications: CareerItem[] = [
  { period: "2022.07", title: "実用英語技能検定 2級 合格" },
];
