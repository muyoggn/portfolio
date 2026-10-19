# ポートフォリオ制作ガイド（はじめての人向け）

このファイルは、サイトを作りながら「今なにをしていて、なぜそれが必要か」を残しておくためのノートです。作業が進むたびに追記していきます。

---

## 1. 全体の流れ（ロードマップ）

| 段階 | やること | 状態 |
|---|---|---|
| ① 土台づくり | Next.js のプロジェクトを作り、Cloudflare で動く設定を入れる | ✅ 済み |
| ② 自分のPCで動かす | Node.js と VS Code を入れて、手元でサイトを表示する | これから |
| ③ GitHub に保存 | コードを GitHub にアップロードして、変更の履歴を残す | これから |
| ④ 公開 | Cloudflare にアップロードして、URL で誰でも見られるようにする | これから |
| ⑤ 中身を作る | 自己紹介・スキル・作品を自分の内容に書き換え、デザインを整える | これから |
| ⑥ 育てる | 作品詳細ページ、アニメーション、多言語対応などを少しずつ追加 | これから |

先に ③④ まで終わらせて「直したらすぐ公開される」状態を作ってから、⑤ の中身づくりに集中するのがおすすめです。公開できる状態が早めにあると、学んだことがすぐ形になって残ります。

---

## 2. 用語の解説

### HTML / CSS / JavaScript（土台の3つ）
- **HTML**：ページの「骨組み」。見出し・文章・リンクなどを並べる。
- **CSS**：ページの「見た目」。色・大きさ・配置を決める。
- **JavaScript（JS）**：ページの「動き」。クリックしたら何かが起きる、などの処理。

ブラウザが最終的に理解できるのはこの3つだけです。以下の道具はすべて、この3つを **楽に・安全に・効率よく** 作るためのものです。

### TypeScript（タイプスクリプト）
JavaScript に「型（データの種類のルール）」を足した言語です。
たとえば「名前は文字列、年齢は数字」と決めておくと、うっかり間違えたときに **実行する前にエディタが赤線で教えてくれます**。書いたものは最終的に JavaScript に変換されてブラウザで動きます。
→ このプロジェクトでは `src/data/profile.ts` の `type Work = {...}` がその例です。

### React（リアクト）
画面を「部品（コンポーネント）」に分けて作るための **ライブラリ** です。
ヘッダー、カード、ボタンなどを部品として一度作れば、何度でも使い回せます。HTML に似た書き方（JSX）で JavaScript の中に画面を書きます。
→ `src/components/Header.tsx` や `Section.tsx` が部品です。

### Next.js（ネクスト・ジェイエス）
React を使って **Webサイト全体** を作るための **フレームワーク** です。
React は「部品を作る道具」、Next.js は「部品を組み立ててサイトにする仕組み一式」と考えるとわかりやすいです。
- ファイルを置いた場所がそのまま URL になる（`src/app/page.tsx` → `/`）
- 画像やフォントの最適化、表示を速くする工夫が最初から入っている

### ライブラリとフレームワークの違い
- **ライブラリ**：必要なときに呼び出して使う「道具箱」（例：React）
- **フレームワーク**：作り方の「型」や「ルール」ごと提供される「枠組み」（例：Next.js、Angular）
Angular も Next.js と同じくフレームワークですが、React ではなく独自の仕組みを使います。同時に使うことはまずないので、このサイトでは Next.js を使います。

### Tailwind CSS（テイルウィンド）
CSS を **クラス名を並べるだけで書ける** ようにする道具です。
`className="text-xl font-bold"` と書けば「大きめの文字・太字」になります。別の CSS ファイルを行き来しなくてよいので、慣れると速く書けます。

### Node.js と npm
- **Node.js**：JavaScript をブラウザの外（自分のPC）で動かすためのソフト。Next.js を動かすのに必要です。
- **npm**：Node.js に付いてくる「道具の取り寄せ係」。`package.json` に書かれたライブラリをまとめてダウンロードします（`npm install`）。

### Git と GitHub
- **Git**：ファイルの変更履歴を記録するソフト。「いつ・何を・なぜ変えたか」を残せて、失敗しても前の状態に戻せます。
- **GitHub**：Git の履歴をインターネット上に保存するサービス。バックアップになり、就活では「どんなコードを書いてきたか」を見せる場所にもなります。

### Cloudflare（クラウドフレア）
作ったサイトを **インターネットに公開する（ホスティング）** サービスです。
このプロジェクトでは **Cloudflare Workers** を使います。友人のサイト（`〜.workers.dev`）と同じ方式です。無料枠で十分使えます。
Next.js を Cloudflare で動かすために **OpenNext（@opennextjs/cloudflare）** という変換ツールを入れています。

---

## 3. 用意してほしいもの

| もの | 用途 | 費用 |
|---|---|---|
| [Node.js](https://nodejs.org/ja)（LTS 版） | 自分のPCでサイトを動かす | 無料 |
| [VS Code](https://code.visualstudio.com/) | コードを書くエディタ | 無料 |
| [Git](https://git-scm.com/) | 変更履歴の記録（Mac は最初から入っていることが多い） | 無料 |
| [GitHub アカウント](https://github.com/signup) | コードの保存・公開 | 無料 |
| [Cloudflare アカウント](https://dash.cloudflare.com/sign-up) | サイトの公開 | 無料 |

---

## 4. フォルダの中身（どこを触ればいいか）

> **このセクションは覚えなくて大丈夫な「地図」です。** 今あなたが触るのは ★ の `profile.ts` だけ。色を変えたくなったら `globals.css`、写真を載せたくなったら `public/` に画像を置く、くらいです。設定ファイル（`next.config.ts`・`wrangler.jsonc` など）は触らなくてOKです。

```
portfolio/
├── src/
│   ├── app/
│   │   ├── layout.tsx   … 全ページ共通の外枠（フォント、タイトルなど）
│   │   ├── page.tsx     … トップページ本体
│   │   └── globals.css  … サイト全体の色などの設定
│   ├── components/      … 部品（ヘッダー、セクション枠）
│   └── data/
│       └── profile.ts   … ★ 名前・自己紹介・スキル・作品のデータ（まずはここを書き換える）
├── public/              … 画像などをそのまま置く場所
├── package.json         … 使っているライブラリと、実行コマンドの一覧
├── next.config.ts       … Next.js の設定
├── wrangler.jsonc       … Cloudflare の設定
└── open-next.config.ts  … Next.js を Cloudflare 用に変換する設定
```

---

## 5. よく使うコマンド

ターミナル（Mac は「ターミナル」、Windows は「PowerShell」）で、`portfolio` フォルダに移動してから実行します。

| コマンド | 意味 |
|---|---|
| `npm install` | 必要なライブラリを取り寄せる（最初に1回） |
| `npm run dev` | 開発用サーバーを起動。ブラウザで http://localhost:3000 を開くと表示される。ファイルを保存すると自動で反映 |
| `npm run build` | 公開用にまとめて変換できるか確認する |
| `npm run preview` | Cloudflare と同じ環境で、手元で動作確認する |
| `npm run deploy` | Cloudflare に公開する（Cloudflare へのログインが必要） |

---

## 6. 技術選定メモ（なぜそれを選んだか）

| 技術 | 選んだ理由 |
|---|---|
| Next.js 16 | 指定どおり。React 製サイトの定番で、求人でもよく見かける |
| TypeScript | 間違いに早く気づける。実務ではほぼ必須 |
| Tailwind CSS v4 | 指定どおり。クラス名だけで見た目を作れる |
| @opennextjs/cloudflare | Next.js を Cloudflare Workers で動かすための公式推奨ツール |
| Noto Sans JP | 日本語がきれいに表示される無料フォント |

今後、必要になったら追加候補：アニメーション（Framer Motion）、アイコン（lucide-react）、作品詳細を Markdown で書く仕組み（MDX）など。追加するときはここに理由を書き足します。

---

## 7. GitHub に保存する（ステップ③）

GitHub は「コードの保管庫」です。保管庫ひとつひとつを **リポジトリ（repository、略してリポジトリ／レポ）** と呼びます。

### あなたにやってほしいこと
1. **GitHub アカウントを作る**：https://github.com/signup （ユーザー名は就活でも見られるので、本名に近いものや読みやすいものがおすすめ）
2. **空のリポジトリを作る**：ログイン後、右上の「＋」→「New repository」
   - Repository name：`portfolio`
   - 公開範囲：**Public**（就活で見せられる。メールアドレスなどの秘密はコードに入れていないので公開して大丈夫）
   - 「Add a README」などのチェックは **すべて外したまま**（中身はこちらから入れるため）
   - 「Create repository」を押す
3. **Claude と GitHub をつなぐ**：https://claude.ai/connect-github を開いて連携し、続けて「Claude」アプリをインストールする画面で、さきほどの `portfolio` リポジトリを選ぶ

ここまで終わったらスレッドで教えてください。こちらで今あるコードと変更履歴をそのリポジトリにアップロード（**push／プッシュ**）します。

### 用語メモ
- **コミット（commit）**：変更を「セーブポイント」として記録すること。いつ・何を変えたかのメッセージを付ける
- **プッシュ（push）**：手元のコミットを GitHub に送ること

---

## 8. Cloudflare で公開する（ステップ④）

GitHub にコードが入ったら、Cloudflare に「このリポジトリが更新されたら自動でサイトを作り直して公開して」と設定します（**Workers Builds** という機能）。一度つなげば、以後はコードを GitHub に push するだけで公開サイトが更新されます。

1. **Cloudflare アカウントを作る**：https://dash.cloudflare.com/sign-up
2. ダッシュボード左メニュー「Workers & Pages」→「Create」→「Import a repository」（GitHub と連携を求められたら許可）
3. `portfolio` リポジトリを選び、設定を次のようにする
   - Project name：`portfolio`（`wrangler.jsonc` の `name` と同じにする）
   - Build command：`npx opennextjs-cloudflare build`
   - Deploy command：`npx opennextjs-cloudflare deploy`
4. 「Deploy」を押すと数分で `https://portfolio.＜あなたのサブドメイン＞.workers.dev` という URL ができます

詳しい手順は、GitHub への保存が終わった時点で画面に合わせて案内します。
