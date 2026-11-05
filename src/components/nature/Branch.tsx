// 1 本の枝（茎＋葉っぱ）を SVG で描く部品です。
// 数字（長さ・曲がり具合・葉の数）を渡すと、計算で葉を並べてくれるので、
// 同じ部品を使い回して、いろいろな形の枝で森を作れます。

// 葉っぱ 1 枚の形（長さ 100 の、先がとがった葉）。上（-y 方向）に向かって伸びます
const LEAF = "M0 0 C 18 -18 28 -55 0 -100 C -28 -55 -18 -18 0 0 Z";

export type BranchData = {
  x: number; // 枝の根元の位置
  y: number;
  angle: number; // 伸びる向き（0 = 上、90 = 右、180 = 下、-90 = 左）
  length: number; // 枝の長さ
  curve?: number; // 曲がり具合（＋で右、−で左にしなる）
  count: number; // 葉の枚数
  leafSize: number; // 根元側の葉の大きさ
  layer: 1 | 2 | 3 | 4; // 1 = 奥（うすい色）… 4 = 手前（こい色）
};

export default function Branch({
  data,
  index,
}: {
  data: BranchData;
  index: number;
}) {
  const { x, y, angle, length, curve = 0, count, leafSize, layer } = data;

  // 茎は「2 次ベジェ曲線」という曲線。t（0〜1）を動かすと茎の上の点が求まります
  const pointAt = (t: number) => ({
    px: 2 * (1 - t) * t * curve,
    py: -length * t,
  });
  // その点での茎の向き（角度）。葉をこの向きに合わせて生やします
  const angleAt = (t: number) =>
    (Math.atan2(2 * curve * (1 - 2 * t), length) * 180) / Math.PI;

  const leaves = [];
  for (let i = 1; i <= count; i++) {
    const t = i / (count + 1);
    const { px, py } = pointAt(t);
    const side = i % 2 === 0 ? 1 : -1; // 右・左と交互に生やす
    const size = (leafSize * (1 - 0.45 * t)) / 100; // 先にいくほど小さく
    leaves.push({ px, py, rot: angleAt(t) + side * 55, size });
  }
  // 枝の先端にも 1 枚
  leaves.push({
    px: 0,
    py: -length,
    rot: angleAt(1),
    size: (leafSize * 0.6) / 100,
  });

  return (
    // 外側の <g>：根元の位置と向きを決める
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      {/* 内側の <g>：風でゆれる（CSS の .sway）。根元を支点に回転します */}
      <g
        className="sway"
        style={{
          animationDuration: `${5 + (index % 4) * 1.5}s`,
          animationDelay: `${-index * 1.3}s`,
        }}
      >
        <g
          className="grow"
          style={{ animationDelay: `${0.2 + (index % 6) * 0.15}s` }}
        >
          <path
            d={`M0 0 Q ${curve} ${-length / 2} 0 ${-length}`}
            fill="none"
            stroke={`var(--leaf-${layer})`}
            strokeWidth={3 + layer}
            strokeLinecap="round"
          />
          {leaves.map((leaf, i) => (
            <g
              key={i}
              transform={`translate(${leaf.px} ${leaf.py}) rotate(${leaf.rot}) scale(${leaf.size})`}
            >
              <path d={LEAF} fill={`var(--leaf-${layer})`} />
              {/* 葉脈（ようみゃく）。テクノロジー感を出すため、回路のように細く光らせています */}
              <path d="M0 -6 L0 -88" className="vein" />
            </g>
          ))}
        </g>
      </g>
    </g>
  );
}
