// =============================================================
// 作品（Works）に添える線画イラストです（SVG）。
// 本物のスクリーンショットを用意するまでの「仮の絵」として使っています。
//
// ・線は currentColor（まわりの文字色）で描くので、ライト/ダークどちらでも自動で色がなじみます
// ・画面に入ると、ペンで描くように線が伸びていきます（globals.css の .draw）
// =============================================================

// 作品の大きめのイラスト：ブラウザの中に、コードと植物が並ぶ「このサイト」の絵
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
