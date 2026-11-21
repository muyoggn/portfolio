// 作品「ポートフォリオサイト」のプレビュー画像の代わりに、このサイトのミニチュアを
// 何枚かの層（レイヤー）に分けて組み立てています。作品のカルーセル（WorkCarousel.tsx）でカードが斜めを向くと、層ごとに奥行きがずれて立体的に見えます。
// 本物のスクリーンショットを用意したら、ここを <img> に差し替えても OK です。
export default function WorkPreview() {
  return (
    <div className="relative aspect-[4/3] w-full" style={{ transformStyle: "preserve-3d" }}>
      {/* いちばん奥：画面の土台 */}
      <div className="depth absolute inset-0 rounded-2xl border border-line bg-[var(--plate)]" style={{ "--d": 0 } as React.CSSProperties}>
        <div className="flex gap-1.5 p-4" aria-hidden="true">
          <span className="h-2 w-2 rounded-full bg-line" />
          <span className="h-2 w-2 rounded-full bg-line" />
          <span className="h-2 w-2 rounded-full bg-line" />
        </div>
      </div>
      {/* 真ん中：名前の文字 */}
      <div className="depth absolute left-[8%] top-[34%]" style={{ "--d": 40 } as React.CSSProperties}>
        <p className="font-display text-[clamp(1.25rem,3vw,2rem)] font-semibold leading-[0.9] tracking-[-0.04em]">
          Go
          <br />
          Nagayama
        </p>
        <span className="mt-4 block h-1 w-10 rounded-full bg-accent" />
      </div>
      {/* 手前：小さな板の重なり（このサイトのトップの絵） */}
      <div className="depth absolute right-[8%] top-[36%] h-[34%] w-[26%]" style={{ "--d": 80 } as React.CSSProperties}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="absolute inset-0 rounded-lg border border-[var(--plate-edge)] bg-[var(--plate)] shadow-sm"
            style={{ transform: `translate(${i * -8}px, ${i * -12}px)` }}
          />
        ))}
        <span
          className="absolute inset-0 rounded-lg bg-accent"
          style={{ transform: "translate(-24px, -36px)" }}
        />
      </div>
    </div>
  );
}
