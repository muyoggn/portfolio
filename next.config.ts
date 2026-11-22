import type { NextConfig } from "next";

// =============================================================
// セキュリティヘッダー
// ブラウザに「このページはこう扱ってね」と伝える追加の決まりごとです。
// SSR（サーバーで作る HTML）にも付くように、ここ（next.config）で設定します。
// ※ public/_headers は Cloudflare が直接配る画像・JS などの静的ファイルにだけ効くため、
//   ページ本体（HTML）にはこちらの設定が必要です。
// =============================================================
const securityHeaders = [
  // ファイルの種類をブラウザに勝手に推測させない（画像に見せかけたスクリプトの実行を防ぐ）
  { key: "X-Content-Type-Options", value: "nosniff" },
  // 他のサイトの中に <iframe> で埋め込ませない（クリックジャッキング対策）
  { key: "X-Frame-Options", value: "DENY" },
  // 外部サイトへ移動するとき、送る URL 情報をドメインだけに絞る
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // カメラ・マイク・位置情報などは使わないので、すべて禁止しておく
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  // 「このサイトは必ず HTTPS で開いてね」と覚えてもらう（約 2 年間）
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  // Content-Security-Policy（CSP）：読み込んでよいものの決まり。
  // Next.js はページ内に小さなスクリプトを直接書き込むため、スクリプトまで厳しく縛ると
  // サイトが動かなくなります。そこで、壊れずに効果がある項目だけを指定しています。
  //   frame-ancestors 'none' … 埋め込み禁止（X-Frame-Options の新しい書き方）
  //   base-uri 'self'        … <base> タグでリンク先をすり替えられないようにする
  //   form-action 'self'     … フォームの送信先を自分のサイトだけに限る
  //   object-src 'none'      … 古いプラグイン（Flash など）を読み込ませない
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
  },
];

const nextConfig: NextConfig = {
  // レスポンスに「X-Powered-By: Next.js」を付けない（使っている技術をわざわざ教えない）
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
