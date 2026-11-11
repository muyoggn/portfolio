import type { Metadata } from "next";
import { Geist_Mono, Noto_Sans_JP } from "next/font/google";
import { profile } from "@/data/profile";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

// Google Fonts の日本語フォントを読み込みます
const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
      className={`${notoSansJp.variable} ${geistMono.variable} h-full antialiased`}
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
