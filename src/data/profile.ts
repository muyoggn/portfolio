// =============================================================
// サイトに表示する「中身（データ）」をここにまとめています。
// 名前・自己紹介・スキル・作品を変えたいときは、このファイルだけ
// 書き換えればページ全体に反映されます。
// =============================================================

// 「type」は TypeScript の機能で、データの形（どんな項目を持つか）を決めます。
// 形を決めておくと、項目の書き忘れや打ち間違いをエディタが教えてくれます。
export type Work = {
  title: string;
  description: string;
  tech: string[];
  url?: string; // 「?」が付いた項目は省略してもよい、という意味
};

export type SkillGroup = {
  category: string;
  items: string[];
};

export const profile = {
  name: "あなたの名前",
  nameEn: "Your Name",
  role: "Web エンジニア志望の学生",
  catchCopy: "作りながら学ぶ、学んだことを形に残す。",
  about: [
    "ここに自己紹介を書きます。大学・専攻、興味のある分野、これまで取り組んできたことなどを 2〜3 文で。",
    "このサイト自体も、Next.js・React・TypeScript・Tailwind CSS を学びながら作った制作物の一つです。",
  ],
  links: {
    github: "https://github.com/",
    email: "you@example.com",
  },
};

export const skills: SkillGroup[] = [
  { category: "言語", items: ["HTML", "CSS", "JavaScript", "TypeScript"] },
  { category: "フレームワーク", items: ["React", "Next.js", "Tailwind CSS"] },
  { category: "ツール", items: ["Git", "GitHub", "VS Code"] },
  { category: "公開・インフラ", items: ["Cloudflare Workers"] },
];

export const works: Work[] = [
  {
    title: "ポートフォリオサイト",
    description:
      "このサイトです。Next.js で作成し、Cloudflare Workers で公開しています。",
    tech: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Cloudflare"],
  },
  {
    title: "作品 2（準備中）",
    description: "今後作ったものをここに追加していきます。",
    tech: [],
  },
];
