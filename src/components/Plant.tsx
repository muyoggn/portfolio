// 観葉植物のイラスト（SVG）です。SVG は「線や図形をコードで描く画像」で、
// CSS でアニメーションをつけられます。茎が伸びて → 葉が開いて → ゆらゆら揺れます。
// 色は currentColor / CSS 変数を使っているので、ダークモードでも自動で合います。
export default function Plant({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 260" className={className} aria-hidden="true">
      {/* 揺れる部分（茎と葉）。鉢の上を支点に揺らします。
          葉は <g> で向き（rotate）を決め、中の楕円だけを「開く」アニメーションさせます */}
      <g className="sway">
        <path className="stem" d="M100 200 C100 160 96 120 104 70" />
        <path className="stem" style={{ animationDelay: "0.3s" }} d="M101 170 C80 150 64 140 48 132" />
        <path className="stem" style={{ animationDelay: "0.5s" }} d="M100 140 C120 124 138 118 156 116" />
        <g transform="rotate(8 104 58)">
          <ellipse className="leaf" style={{ animationDelay: "1.1s" }} cx="104" cy="58" rx="16" ry="30" />
        </g>
        <g transform="rotate(-62 40 126)">
          <ellipse className="leaf" style={{ animationDelay: "1.3s" }} cx="40" cy="126" rx="13" ry="26" />
        </g>
        <g transform="rotate(64 164 110)">
          <ellipse className="leaf" style={{ animationDelay: "1.5s" }} cx="164" cy="110" rx="13" ry="26" />
        </g>
        <g transform="rotate(-30 88 100)">
          <ellipse className="leaf" style={{ animationDelay: "1.7s" }} cx="88" cy="100" rx="10" ry="20" />
        </g>
      </g>
      {/* 鉢 */}
      <path d="M62 200 H138 L128 254 H72 Z" className="fill-pot" />
      <rect x="56" y="192" width="88" height="14" rx="4" className="fill-pot" />
    </svg>
  );
}
