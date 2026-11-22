# セキュリティ点検メモ

このリポジトリは **Public（だれでも見られる）** なので、うっかり秘密や個人情報を載せないことが一番大事です。
2026-11-22 に一度まとめて点検した結果と、これから気をつけることを書いておきます。

## 点検した結果（2026-11-22）

| 項目 | 結果 |
| --- | --- |
| 過去のコミット履歴に API キーなどの秘密情報がないか（`gitleaks` で全履歴をスキャン） | ✅ 見つからず |
| `.env` 系・`.dev.vars` が `.gitignore` に入っているか | ✅ `.env*` と `.dev.vars*` の両方が入っている。履歴にも一度もコミットされていない |
| `.dev.vars` の中身 | ✅ `NEXTJS_ENV=development` だけ（秘密ではない） |
| `NEXT_PUBLIC_` の付いた環境変数 | ✅ 使っていない（そもそも環境変数を読んでいない） |
| Next.js / React のバージョン | ⚠️ 16.4.2 / 19.3.0 だった → **16.4.6 / 19.3.1 に更新**（このとき Next.js に 7 件の既知の脆弱性あり） |
| `npm audit` | ⚠️ 16 件 → **3 件（すべて Moderate）** に減らした。残りは下の「残っているもの」を参照 |
| `package-lock.json` がコミットされているか | ✅ されている |
| コミットのメールアドレス | ⚠️ 28 件のコミットに大学のメールアドレス（学籍番号入り）が残っている。下の「自分でやること」を参照 |
| 画像の EXIF（撮影場所などの情報） | ✅ `docs/images` の画像はすべてスクリーンショットで、EXIF は空 |
| コード中のコメント・TODO の個人的なメモ | ✅ なし（名前・大学名はサイトに載せるために書いているもの） |
| GitHub Actions | ✅ 使っていない（`.github/workflows` がない） |
| `dangerouslySetInnerHTML` | ✅ `layout.tsx` の 1 か所だけ。中身は自分で書いた固定のスクリプト（`src/lib/theme.ts`）で、外から来た文字は入らないので安全 |
| セキュリティヘッダー | ⚠️ なかった → **追加した**（下を参照） |
| お問い合わせフォーム | ✅ ない（作るときは Cloudflare Turnstile・入力チェック・回数制限を付ける） |

## 追加したセキュリティヘッダー

ヘッダーは、ページといっしょにブラウザへ送る「このページはこう扱ってね」というメモです。

- **ページ本体（HTML）**：`next.config.ts` の `headers()` で設定しています。
  このサイトは OpenNext で Cloudflare Workers の上で動かしている（サーバーで HTML を作る）ので、`next.config` の設定がそのまま効きます。
- **静的ファイル（画像・JS・CSS）**：`public/_headers` で設定しています。
  こちらは Cloudflare が Next.js を通さずに直接配るので、別に書く必要があります。

| ヘッダー | 何を防ぐか |
| --- | --- |
| `X-Content-Type-Options: nosniff` | 画像などに見せかけたスクリプトをブラウザに実行させない |
| `X-Frame-Options: DENY` と CSP の `frame-ancestors 'none'` | 他人のサイトに透明に埋め込まれて、知らないうちにクリックさせられる（クリックジャッキング）のを防ぐ |
| `Referrer-Policy` | 外部サイトへ移動するとき、こちらの URL の細かい部分を送らない |
| `Permissions-Policy` | カメラ・マイク・位置情報などを使わせない |
| `Strict-Transport-Security` | いつも HTTPS（鍵付き）で開くようブラウザに覚えさせる |
| CSP の `base-uri` / `form-action` / `object-src` | リンク先のすり替えや、古いプラグインの読み込みを防ぐ |

あわせて `poweredByHeader: false` で「Next.js で作っています」という目印も送らないようにしました。

> CSP（Content-Security-Policy）でスクリプトまで細かく縛ると、Next.js がページに直接書き込む小さなスクリプトが止まってサイトが動かなくなります。
> 今はフォームもログインもないので、壊れずに効く項目だけにしています。

## 残っているもの（2026-11-22 時点）

`npm audit` で Moderate が 3 件残っています。どれも `@opennextjs/cloudflare` が**ビルドするとき**に使う `glob` / `minimatch` という部品で、公開しているサイトの中では動きません。`npm audit fix --force` は OpenNext をとても古い版（0.3.0）に戻してしまうので、**実行しないでください**。OpenNext 側が新しい `glob` に上げるのを待ちます。

## これから気をつけること

1. **秘密のキーは絶対にコミットしない**。必要になったら Cloudflare のダッシュボード（Workers & Pages → portfolio → Settings → Variables and Secrets）に入れて、ローカルでは `.dev.vars` に書く（`.dev.vars` はコミットされない設定になっています）。
2. **`NEXT_PUBLIC_` を付けた環境変数はだれでも見られる**。秘密のキーには付けない。
3. **月に 1 回くらい `npm audit` を実行**し、Next.js に更新が出ていたら `npm install next@latest eslint-config-next@latest react@latest react-dom@latest` で上げる。Dependabot を有効にしていれば、GitHub が知らせてくれます。
4. **写真を載せるときは EXIF（位置情報）を消してから**。スクリーンショットなら基本的に入っていません。
5. **履歴書 PDF などを置くときは**、住所・電話番号・生年月日が入っていないか確認する。

## 自分でやること（GitHub・Cloudflare の設定）

コードではなくアカウントの設定なので、本人にしかできません。

### 1. GitHub の 2 段階認証
GitHub 右上のアイコン → **Settings** → **Password and authentication** → **Two-factor authentication** を有効にする。
スマホの認証アプリ（Google Authenticator など）か、パスキーがおすすめです。リカバリーコードは必ず保存しておきます。

### 2. Cloudflare の 2 段階認証
Cloudflare ダッシュボード右上のアイコン → **My Profile** → **Authentication** → **Two-Factor Authentication** を有効にする。

### 3. Secret scanning・Push protection・Dependabot を有効にする
リポジトリのページ → **Settings** → 左の **Advanced Security**（または **Code security**）で、次をすべて **Enable** にする。
- **Dependabot alerts**（古くて危ない部品があると知らせてくれる）
- **Dependabot security updates**（直すための PR を自動で作ってくれる）
- **Secret scanning** と **Push protection**（キーを含む push を止めてくれる）

### 4. コミットのメールアドレスを非公開にする
1. GitHub 右上のアイコン → **Settings** → **Emails** で
   - **Keep my email addresses private** にチェック
   - **Block command line pushes that expose my email** にもチェック
   - その画面に出ている `数字+muyoggn@users.noreply.github.com` という形のアドレスをコピー
2. Mac のターミナルで次を実行（`<コピーしたアドレス>` を置きかえる）
   ```sh
   git config --global user.email "<コピーしたアドレス>"
   git config --global user.email   # 確認：表示されれば OK
   ```
3. GitHub の Web 画面で編集したときのアドレスも、1. の設定で noreply に変わります。

これで**これから**のコミットには大学のアドレスが残りません。**過去の**コミットに残っている分は、履歴を書きかえないと消えません（下を参照）。

### 5. Cloudflare の API トークン
Cloudflare ダッシュボード → My Profile → **API Tokens** を開き、使っていないトークンがあれば削除する。作るときは必要な権限だけ（例：Workers の編集だけ）に絞る。

## 過去のコミットのメールアドレスについて

過去 28 件のコミットに大学のメールアドレスが入っています。消すには「履歴の書きかえ」が必要で、次のような影響があります。

- すべてのコミットの ID が変わり、`main` を強制的に上書き（force push）することになる
- Mac にある `~/Desktop/portfolio` は作り直し（もう一度 clone）が必要
- すでにだれかがコピーしていたら、そちらには残る（大学のアドレスは秘密のキーではないので、無効化のような対応は不要）
