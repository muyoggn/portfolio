// =============================================================
// サイトに表示する「中身（データ）」をここにまとめています。
// 名前・自己紹介・スキル・作品・経歴を変えたいときは、このファイルだけ
// 書き換えればページ全体に反映されます。
// =============================================================

// 「type」は TypeScript の機能で、データの形（どんな項目を持つか）を決めます。
// 形を決めておくと、項目の書き忘れや打ち間違いをエディタが教えてくれます。
export type Work = {
  title: string;
  description: string;
  tech: string[];
  url?: string; // 「?」が付いた項目は省略してもよい、という意味
  // カルーセルに出すプレビュー画像。public/ に画像を置いて "/works/xxx.png" のように書く
  image?: string;
  // 画像がまだないときの「仮の絵」の種類（WorkCarousel.tsx の WorkArt）
  art?: "site" | "game" | "chart" | "app" | "notes";
  // true にすると「サンプル」と小さく表示される（仮の作品の目印）
  sample?: boolean;
};

export type Skill = {
  name: string;
  note?: string; // どこで使ったか（授業・研究など）。省略可
};

export type SkillGroup = {
  category: string;
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
  // 最初の画面に小さく添える「ひとこと」。自分の言葉で書きたくなったら、"" の中に書いてください。
  // 空（""）のままなら、何も表示されません。
  catchCopy: "",
  about: [
    "工学院大学 情報学部 情報科学科の3年生です。社会シミュレーション研究室（八木研）に所属し、研究では Java を使った人工市場による金融市場のシミュレーションをしています。",
    "授業で Python や C 言語、HTML、CSS、JavaScriptを学び、Unity（C#）にも触れてきました。このサイトは Next.js・React・TypeScript・Tailwind CSS を学びながら作った、最初の Web 制作物です。",
    "趣味は観葉植物を育てることと料理をすることです。",
  ],
  links: {
    github: "https://github.com/muyoggn",
  },
};

export const skills: SkillGroup[] = [
  {
    category: "Web",
    items: [
      { name: "HTML" },
      { name: "CSS" },
      { name: "JavaScript" },
      { name: "TypeScript", note: "このサイト" },
    ],
  },
  {
    category: "プログラミング言語",
    items: [
      { name: "Java", note: "研究" },
      { name: "Python", note: "授業" },
      { name: "C", note: "授業" },
      { name: "C#", note: "Unity" },
    ],
  },
  {
    category: "フレームワーク・ツール",
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
    items: [{ name: "Cloudflare Workers" }],
  },
];

// 作品の一覧。Works のカルーセルに、この順番で並びます（最後まで行くと最初に戻ります）。
// 作品を足すときは、{ ... } のかたまりを 1 つコピーして書き換えてください。
const realWorks: Work[] = [
  {
    title: "ポートフォリオサイト",
    description:
      "このサイトです。Next.js で作成し、Cloudflare Workers で公開しています。",
    tech: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Cloudflare"],
    url: "https://github.com/muyoggn/portfolio",
    art: "site",
  },
];

// ---- ここから下は「仮のサンプル」です ----------------------------------
// 作品が 1 つだけだとカルーセルの動きが分からないので、見本として置いています。
// 本物の作品が増えたら、このかたまりごと消すか、下の works の行を
// 「export const works: Work[] = realWorks;」に書き換えてください。
const sampleWorks: Work[] = [
  {
    title: "2D アクションゲーム",
    description: "（サンプル）Unity で作った、横スクロールの小さなアクションゲーム。",
    tech: ["Unity", "C#"],
    art: "game",
    sample: true,
  },
  {
    title: "人工市場シミュレーションの可視化",
    description: "（サンプル）研究で動かしているシミュレーションの値動きを、グラフで見られるようにしたもの。",
    tech: ["Java", "Python"],
    art: "chart",
    sample: true,
  },
  {
    title: "レシピ帳アプリ",
    description: "（サンプル）作った料理と分量を記録して、あとから材料で探せる Web アプリ。",
    tech: ["Next.js", "TypeScript"],
    art: "app",
    sample: true,
  },
  {
    title: "観葉植物の水やり記録",
    description: "（サンプル）鉢ごとに水やりの日をメモして、次に水をあげる日を教えてくれるツール。",
    tech: ["TypeScript", "HTML / CSS"],
    art: "notes",
    sample: true,
  },
];
// ---- 仮のサンプルここまで ---------------------------------------------

export const works: Work[] = [...realWorks, ...sampleWorks];

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
  { period: "現在", title: "基本情報技術者試験 取得に向け学習中" },
];
