# Portfolio

Next.js + TypeScript + Tailwind CSS で作る個人ポートフォリオサイト。Cloudflare Workers で公開します。

- 学習ノート・用語解説: [docs/GUIDE.md](docs/GUIDE.md)
- 技術構成の全体図と各ツールの役割: [docs/STACK.md](docs/STACK.md)
- 表示内容の編集: `src/data/profile.ts`

```bash
npm install      # 最初に1回
npm run dev      # http://localhost:3000 で確認
npm run preview  # Cloudflare と同じ環境で確認
npm run deploy   # Cloudflare に公開
```
