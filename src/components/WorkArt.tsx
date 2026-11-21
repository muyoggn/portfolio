import type { Work } from "@/data/profile";
import WorkPreview from "@/components/WorkPreview";

// 作品のプレビュー画像がまだないときに出す「仮の絵」です。
// 色はサイトと同じ白黒＋朱色だけ。種類（art）ごとに、作品の中身がなんとなく伝わる形を描いています。
// 本物のスクリーンショットを用意したら、profile.ts の作品に image: "/works/xxx.png" を書けば、
// こちらの絵の代わりに画像が出ます（WorkCarousel.tsx）。

// どの絵にも共通の「画面の枠」（左上にウィンドウの丸が 3 つ）
function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-line bg-[var(--plate)]">
      <div className="flex gap-1.5 p-4" aria-hidden="true">
        <span className="h-2 w-2 rounded-full bg-line" />
        <span className="h-2 w-2 rounded-full bg-line" />
        <span className="h-2 w-2 rounded-full bg-line" />
      </div>
      {children}
    </div>
  );
}

// ゲーム：地面と足場、朱色の四角いキャラクター、コイン
function Game() {
  return (
    <Frame>
      <div className="absolute inset-x-0 bottom-0 h-[18%] border-t border-foreground/15 bg-foreground/5" />
      <div className="absolute bottom-[38%] left-[18%] h-[5%] w-[22%] rounded-sm bg-foreground/15" />
      <div className="absolute bottom-[56%] right-[16%] h-[5%] w-[26%] rounded-sm bg-foreground/15" />
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="absolute h-[5%] w-[3.75%] rounded-full border border-foreground/30"
          style={{ bottom: "66%", right: `${22 + i * 7}%` }}
        />
      ))}
      <div className="absolute bottom-[18%] left-[46%] h-[13%] w-[9.75%] rounded-md bg-accent" />
      <div className="absolute bottom-[18%] right-[14%] h-[8%] w-[6%] rounded-t-md bg-foreground/25" />
    </Frame>
  );
}

// グラフ：方眼の上に、値動きの折れ線（朱色）と、もう 1 本の薄い線
function Chart() {
  return (
    <Frame>
      <svg viewBox="0 0 400 240" className="absolute inset-x-[6%] bottom-[8%] h-[72%] w-[88%]" preserveAspectRatio="none" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1="0" x2="400" y1={i * 60} y2={i * 60} stroke="currentColor" strokeOpacity="0.1" />
        ))}
        <polyline
          points="0,190 40,170 80,180 120,130 160,140 200,90 240,110 280,60 320,80 360,40 400,55"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        <polyline
          points="0,200 40,150 80,165 120,100 160,120 200,135 240,70 280,95 320,45 360,70 400,20"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </Frame>
  );
}

// アプリ：左に一覧、右に選んだ 1 件の中身
function App() {
  return (
    <Frame>
      <div className="absolute inset-x-[6%] bottom-[8%] top-[20%] grid grid-cols-[1fr_1.3fr] gap-[4%]">
        <div className="space-y-[8%]">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`flex items-center gap-2 rounded-md p-[6%] ${i === 1 ? "bg-foreground/10" : ""}`}>
              <span className={`h-3 w-3 shrink-0 rounded-full ${i === 1 ? "bg-accent" : "bg-foreground/20"}`} />
              <span className="h-1.5 w-full rounded-full bg-foreground/15" />
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-line p-[8%]">
          <div className="aspect-[16/9] rounded-md bg-foreground/10" />
          <div className="mt-[10%] space-y-2">
            <span className="block h-1.5 w-3/4 rounded-full bg-foreground/20" />
            <span className="block h-1.5 w-full rounded-full bg-foreground/10" />
            <span className="block h-1.5 w-2/3 rounded-full bg-foreground/10" />
          </div>
        </div>
      </div>
    </Frame>
  );
}

// 記録：カレンダーのマス目に、水やりした日の印
function Notes() {
  const marked = new Set([2, 6, 9, 13, 16, 20, 23]);
  return (
    <Frame>
      <div className="absolute inset-x-[8%] bottom-[10%] top-[22%] grid grid-cols-7 gap-[3%]">
        {Array.from({ length: 28 }, (_, i) => (
          <span key={i} className="relative rounded-[4px] border border-line">
            {marked.has(i) && <span className="absolute inset-[30%] rounded-full bg-foreground/25" />}
            {i === 25 && <span className="absolute inset-[30%] rounded-full bg-accent" />}
          </span>
        ))}
      </div>
    </Frame>
  );
}

export default function WorkArt({ work }: { work: Work }) {
  if (work.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- Cloudflare では画像の自動変換を使わないので、ふつうの img を使う
      <img
        src={work.image}
        alt={`${work.title} の画面`}
        draggable={false}
        className="aspect-[4/3] w-full rounded-2xl border border-line object-cover"
      />
    );
  }
  switch (work.art) {
    case "site":
      return <WorkPreview />;
    case "game":
      return <Game />;
    case "chart":
      return <Chart />;
    case "app":
      return <App />;
    default:
      return <Notes />;
  }
}
