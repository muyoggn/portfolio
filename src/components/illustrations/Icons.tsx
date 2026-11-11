// =============================================================
// 情報をパッと伝えるための「線画イラスト」をまとめたファイルです（すべて SVG）。
//
// ・文字を読まなくても「何の話か」がわかるように、各カードや経歴の行に添えています
// ・線は currentColor（まわりの文字色）で描くので、ライト/ダークどちらでも自動で色がなじみます
// ・後ろの丸っこい形は葉の色（--leaf-1）。サイト全体の「森」のテーマに合わせています
// ・画面に入ると、ペンで描くように線が伸びていきます（globals.css の .draw）
//
// 新しいイラストを足したいときは、下の ICONS に「名前: [線のデータ, ...]」を 1 行追加します。
// 線のデータ（d="..."）は SVG の path の書き方で、M = ペンを置く、l / h / v = 線を引く、c = 曲線 です。
// =============================================================

const ICONS = {
  // Web：ブラウザの窓と、その中の葉っぱ
  web: [
    "M6 10h36v28H6z",
    "M6 17h36",
    "M10.5 13.5h.01M14 13.5h.01M17.5 13.5h.01",
    "M16 33c0-8 6-12 15-12 0 8-6 12-15 12z",
    "M16 33l9-7",
  ],
  // プログラミング言語：< / > のコード記号
  code: ["M17 15l-9 9 9 9", "M31 15l9 9-9 9", "M27 11l-6 26"],
  // フレームワーク・ツール：積み重なった部品（レイヤー）
  layers: ["M24 7l17 8-17 8-17-8z", "M7 24l17 8 17-8", "M7 32l17 8 17-8"],
  // 公開・インフラ：雲と上向きの矢印（アップロード）
  cloud: [
    "M15 36h19a8 8 0 0 0 0-16 11 11 0 0 0-21-1.5A8.8 8.8 0 0 0 15 36z",
    "M24 32V22",
    "M20 26l4-4 4 4",
  ],
  // 研究：グラフ（人工市場の価格の動き）と、売り買いする参加者の点
  research: [
    "M8 8v32h32",
    "M13 31l7-9 6 5 8-12 5 4",
    "M13 31h.01M20 22h.01M26 27h.01M34 15h.01",
  ],
  // 趣味：観葉植物（鉢と葉）
  plant: [
    "M13 29h22",
    "M15 29l2.5 11h13L33 29",
    "M24 29V18",
    "M24 23c-6 0-9.5-3.5-9.5-9 6 0 9.5 3.5 9.5 9z",
    "M24 18c0-6 3.5-9.5 10-9.5 0 6-3.5 9.5-10 9.5z",
  ],
  // 趣味：料理（フライパンと湯気）
  cooking: [
    "M7 25h27c0 7-5.5 12-13.5 12S7 32 7 25z",
    "M34 27h8",
    "M15 19c-2-2 2-4 0-6.5M21 19c-2-2 2-4 0-6.5M27 19c-2-2 2-4 0-6.5",
  ],
  // 学歴：卒業帽
  school: [
    "M4 18l20-9 20 9-20 9z",
    "M12 22v8c0 3 5.5 5.5 12 5.5S36 33 36 30v-8",
    "M40 20v10",
  ],
  // アルバイト：お店（のれん付きの店先）
  shop: [
    "M10 20l3-10h22l3 10",
    "M8 20h32c0 3-2.5 5-5.3 5s-5.4-2-5.4-5c0 3-2.5 5-5.3 5s-5.3-2-5.3-5c0 3-2.6 5-5.4 5S8 23 8 20z",
    "M10 25v14h28V25",
    "M20 39v-8h8v8",
  ],
  // 資格：メダルとチェック
  medal: [
    "M24 5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 1 0 0-19z",
    "M19.5 14.5l3 3 6-6",
    "M18 22l-4 18 10-5 10 5-4-18",
  ],
} as const;

export type IconName = keyof typeof ICONS;

// 後ろに敷く、葉っぱのような丸い形
const BLOB = "M24 3c12 0 21 8 21 20S36 45 23 45 3 36 3 24 12 3 24 3z";

export function Icon({
  name,
  className = "h-12 w-12",
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={`draw shrink-0 text-accent ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={BLOB} fill="var(--leaf-1)" opacity="0.45" stroke="none" />
      {ICONS[name].map((d, i) => (
        // pathLength={1}：線の長さを「1」とみなす指定。描く動きの CSS を、どの線にも同じ数字で書ける
        <path key={d} d={d} pathLength={1} style={{ "--i": i } as React.CSSProperties} />
      ))}
    </svg>
  );
}

// 作品カード用の大きめのイラスト：ブラウザの中に、コードと植物が並ぶ「このサイト」の絵
export function WorkIllustration({ className = "" }: { className?: string }) {
  const line = (x: number, y: number, w: number, i: number) => (
    <path key={`${x}-${y}`} d={`M${x} ${y}h${w}`} pathLength={1} style={{ "--i": i } as React.CSSProperties} />
  );
  return (
    <svg
      viewBox="0 0 320 150"
      className={`draw w-full text-accent ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="0" y="0" width="320" height="150" rx="10" fill="var(--surface)" stroke="none" />
      <path d="M20 18h280v114H20z" pathLength={1} />
      <path d="M20 34h280" pathLength={1} />
      <path d="M30 26h.01M40 26h.01M50 26h.01" pathLength={1} />
      {/* 左側：コードの行（字下げで入れ子を表現） */}
      <g className="text-muted" stroke="currentColor">
        {line(36, 52, 60, 1)}
        {line(50, 66, 90, 2)}
        {line(50, 80, 70, 3)}
        {line(64, 94, 56, 4)}
        {line(50, 108, 80, 5)}
        {line(36, 122, 40, 6)}
      </g>
      {/* 右側：鉢植えの植物 */}
      <path d="M216 104h48l-6 20h-36z" pathLength={1} fill="var(--leaf-1)" />
      <path d="M240 104V64" pathLength={1} />
      <path d="M240 86c-14 0-22-8-22-20 14 0 22 8 22 20z" pathLength={1} fill="var(--leaf-2)" fillOpacity="0.5" />
      <path d="M240 72c0-14 8-22 24-22 0 14-8 22-24 22z" pathLength={1} fill="var(--leaf-2)" fillOpacity="0.5" />
      <path d="M240 92c8-2 14-8 16-14" pathLength={1} />
    </svg>
  );
}
