// 森をつくる「植物の部品」をまとめたファイルです。すべて SVG（コードで描く画像）で描いています。
//
//   branch   … 茎に葉が並ぶ枝（葉の形を変えると、ツル・ポトス・ユーカリ・シダ・ヤシになる）
//   monstera … 切れ込みの入った大きな葉（モンステラ）
//   grass    … 細長い草の株
//   flower   … 小さな花
//
// 位置・向き・大きさなどの数字を渡すだけで描けるので、
// Foliage.tsx で「どこに何を生やすか」をデータとして並べて森を組み立てています。

// ---- 葉の形（どれも長さ 100、根元が (0,0)、上に向かって伸びる） ----
const LEAF_SHAPES = {
  // 先のとがった葉（ツル植物など）
  pointed: "M0 0 C 18 -18 28 -55 0 -100 C -28 -55 -18 -18 0 0 Z",
  // ハート形の葉（ポトス）
  heart: "M0 0 C -10 10 -46 -2 -42 -44 C -38 -74 -12 -90 0 -100 C 12 -90 38 -74 42 -44 C 46 -2 10 10 0 0 Z",
  // 丸い葉（ユーカリ・ピレア）
  round: "M0 0 C 38 0 44 -62 0 -72 C -44 -62 -38 0 0 0 Z",
  // 細長い葉（ヤシの小葉・シダ）
  narrow: "M0 0 C 7 -30 7 -70 0 -100 C -7 -70 -7 -30 0 0 Z",
} as const;

export type LeafShape = keyof typeof LEAF_SHAPES;
type Layer = 1 | 2 | 3 | 4; // 1 = 奥（うすい色）… 4 = 手前（こい色）

type Base = {
  x: number; // 根元の位置
  y: number;
  angle: number; // 伸びる向き（0 = 上、90 = 右、180 = 下、-90 = 左）
  layer: Layer;
};

export type PlantData =
  | (Base & {
      kind: "branch";
      length: number;
      curve?: number; // しなり具合（＋で右、−で左）
      count: number; // 葉の数（opposite のときは「節」の数）
      leafSize: number;
      leaf?: LeafShape;
      opposite?: boolean; // true なら左右対になって生える（シダ・ヤシ）
      spread?: number; // 茎に対する葉の開き具合（度）
    })
  | (Base & { kind: "monstera"; size: number })
  | (Base & { kind: "grass"; height: number; blades: number })
  | (Base & { kind: "flower"; size: number; color: 1 | 2 | 3 });

const fillOf = (layer: Layer) => `var(--leaf-${layer})`;

// 枝：茎は「2 次ベジェ曲線」。t（0〜1）を動かすと茎の上の点と向きが求まり、そこに葉を生やします
function BranchShape(p: Extract<PlantData, { kind: "branch" }>) {
  const { length, curve = 0, count, leafSize, layer, leaf = "pointed", opposite = false, spread = 55 } = p;
  const pointAt = (t: number) => ({ px: 2 * (1 - t) * t * curve, py: -length * t });
  const angleAt = (t: number) => (Math.atan2(2 * curve * (1 - 2 * t), length) * 180) / Math.PI;

  const leaves: { px: number; py: number; rot: number; size: number }[] = [];
  for (let i = 1; i <= count; i++) {
    const t = i / (count + 1);
    const { px, py } = pointAt(t);
    const size = (leafSize * (1 - 0.45 * t)) / 100; // 先にいくほど小さく
    const sides = opposite ? [-1, 1] : [i % 2 === 0 ? 1 : -1]; // 対生 or 互生（交互）
    for (const side of sides) leaves.push({ px, py, rot: angleAt(t) + side * spread, size });
  }
  leaves.push({ px: 0, py: -length, rot: angleAt(1), size: (leafSize * 0.6) / 100 }); // 先端の葉

  return (
    <>
      <path
        d={`M0 0 Q ${curve} ${-length / 2} 0 ${-length}`}
        fill="none"
        stroke={fillOf(layer)}
        strokeWidth={opposite ? 2 + layer / 2 : 3 + layer}
        strokeLinecap="round"
      />
      {leaves.map((l, i) => (
        <g key={i} transform={`translate(${l.px} ${l.py}) rotate(${l.rot}) scale(${l.size})`}>
          <path d={LEAF_SHAPES[leaf]} fill={fillOf(layer)} />
          {/* 葉脈（ようみゃく）。テクノロジー感を出すため、回路のように細く光らせています */}
          {leaf !== "narrow" && <path d={`M0 -6 L0 ${leaf === "round" ? -62 : -88}`} className="vein" />}
        </g>
      ))}
    </>
  );
}

// モンステラ：中心の葉脈から左右に「羽」を並べ、すき間を切れ込みに見せています
function MonsteraShape({ size, layer }: { size: number; layer: Layer }) {
  const L = 100;
  const halfWidth = (t: number) => 46 * Math.pow(Math.sin(Math.PI * Math.min(t, 0.98)), 0.75);
  const lobes = 6;
  const parts: string[] = [];
  for (let i = 0; i < lobes; i++) {
    const t0 = 0.08 + (i / lobes) * 0.88;
    const t1 = t0 + 0.88 / lobes - 0.035; // 0.035 ぶんが切れ込みのすき間
    for (const side of [-1, 1]) {
      const e0 = Math.min(t0 + 0.07, 0.98);
      const e1 = Math.min(t1 + 0.07, 0.99);
      parts.push(
        `M0 ${-t0 * L} L${side * halfWidth(e0)} ${-e0 * L} Q${side * halfWidth((e0 + e1) / 2) * 1.08} ${-((e0 + e1) / 2) * L} ${side * halfWidth(e1)} ${-e1 * L} L0 ${-t1 * L} Z`,
      );
    }
  }
  return (
    <g transform={`scale(${size / 100})`}>
      {/* 葉柄（ようへい）：葉を支える長い柄 */}
      <path d="M0 60 Q 4 30 0 0" stroke={fillOf(layer)} strokeWidth={4} fill="none" strokeLinecap="round" />
      <path d="M0 0 L0 -100" stroke={fillOf(layer)} strokeWidth={5} strokeLinecap="round" />
      <path d={parts.join(" ")} fill={fillOf(layer)} />
      <path d="M0 -4 L0 -96" className="vein" />
    </g>
  );
}

// 草の株：長さと角度の違う細い葉を、根元から扇状に広げます
function GrassShape({ height, blades, layer }: { height: number; blades: number; layer: Layer }) {
  return (
    <>
      {Array.from({ length: blades }, (_, i) => {
        const spread = (i - (blades - 1) / 2) * 9;
        const h = height * (0.65 + ((i * 37) % 10) / 28);
        const bend = spread * 1.4;
        return (
          <path
            key={i}
            d={`M-3 0 Q ${bend * 0.4} ${-h / 2} ${bend} ${-h} Q ${bend * 0.4 + 2} ${-h / 2} 3 0 Z`}
            fill={fillOf(layer)}
          />
        );
      })}
    </>
  );
}

// 小さな花：細い茎の先に 5 枚の花びら
function FlowerShape({ size, color, layer }: { size: number; color: 1 | 2 | 3; layer: Layer }) {
  return (
    <>
      <path d={`M0 0 Q 3 ${-size * 1.5} 0 ${-size * 3}`} stroke={fillOf(layer)} strokeWidth={2} fill="none" />
      <g transform={`translate(0 ${-size * 3})`}>
        {[0, 72, 144, 216, 288].map((r) => (
          <ellipse key={r} cx={0} cy={-size * 0.45} rx={size * 0.32} ry={size * 0.5} transform={`rotate(${r})`} fill={`var(--flower-${color})`} />
        ))}
        <circle r={size * 0.25} fill="var(--flower-center)" />
      </g>
    </>
  );
}

// 1 つの植物を描く。外側で位置と向きを決め、内側で「ゆれる」「伸びて出てくる」動きをつけます
export default function Plant({ data, index }: { data: PlantData; index: number }) {
  let shape: React.ReactNode;
  if (data.kind === "branch") shape = <BranchShape {...data} />;
  else if (data.kind === "monstera") shape = <MonsteraShape size={data.size} layer={data.layer} />;
  else if (data.kind === "grass") shape = <GrassShape height={data.height} blades={data.blades} layer={data.layer} />;
  else shape = <FlowerShape size={data.size} color={data.color} layer={data.layer} />;

  return (
    <g transform={`translate(${data.x} ${data.y}) rotate(${data.angle})`}>
      <g
        className="sway"
        style={{ animationDuration: `${5 + (index % 4) * 1.5}s`, animationDelay: `${-index * 1.3}s` }}
      >
        <g className="grow" style={{ animationDelay: `${0.2 + (index % 6) * 0.15}s` }}>
          {shape}
        </g>
      </g>
    </g>
  );
}
