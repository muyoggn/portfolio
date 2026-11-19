import type { Metadata } from "next";
import { Inter_Tight, Noto_Sans_JP } from "next/font/google";
import { profile } from "@/data/profile";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

// Google Fonts の日本語フォントを読み込みます
const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
});

// 名前や見出しに使う英字フォント。字と字の間をぎゅっと詰めて大きく置くと、
// 少ない文字でも「顔」になる見出しが作れます。
const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  weight: ["400", "500", "600"],
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
      className={`${notoSansJp.variable} ${interTight.variable} h-full antialiased`}
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
