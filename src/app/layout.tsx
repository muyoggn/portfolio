import type { Metadata } from "next";
import { Cormorant_Garamond, Noto_Sans_JP, Shippori_Mincho } from "next/font/google";
import { profile } from "@/data/profile";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

// Google Fonts の日本語フォントを読み込みます
const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
});

// 名前や大きな見出しに使う明朝体（筆で書いたような、細くて上品な日本語フォント）。
// ゴシック体（Noto Sans JP）だけだと「よくあるテンプレート」の印象になりやすいので、
// 目立たせたい所だけ明朝体にして、雑誌のようなメリハリを付けています。
const shipporiMincho = Shippori_Mincho({
  variable: "--font-shippori-mincho",
  weight: ["500", "700"],
  subsets: ["latin"],
});

// 英語の見出し（About / Works など）に使う、細身のセリフ体（文字の端に小さな飾りがある書体）。
// 斜体（italic）にすると、手書きのような柔らかさが出ます。
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  weight: ["400", "500"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

// ブラウザのタブや検索結果に出るタイトル・説明文
export const metadata: Metadata = {
  title: `${profile.name} | Portfolio`,
  description: `${profile.name}のポートフォリオサイトです。`,
};

// すべてのページを包む「外枠」です。<html> や <body> はここに一度だけ書きます。
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${notoSansJp.variable} ${shipporiMincho.variable} ${cormorant.variable} h-full antialiased`}
      // <head> のスクリプトが data-theme を書き足すので、「サーバーの HTML と違う」という警告を出さないようにする
      suppressHydrationWarning
    >
      <head>
        {/* ページが表示される前に、時間帯（または保存した設定）でライト/ダークを決める。詳しくは src/lib/theme.ts */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
