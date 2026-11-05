import Branch, { type BranchData } from "./Branch";

// 画面のまわりを囲む「葉っぱのかたまり」を、場所ごとに 1 つの SVG にまとめています。
// どの位置にどんな枝を生やすかは、下の配列（データ）で決めています。

// 左端から右向きに伸びる枝たち（右側は同じ形を左右反転して使い、少し変化をつける）
const side: BranchData[] = [
  {
    x: -30,
    y: 520,
    angle: 70,
    length: 300,
    curve: -50,
    count: 6,
    leafSize: 70,
    layer: 1,
  },
  {
    x: -20,
    y: 900,
    angle: 25,
    length: 520,
    curve: 90,
    count: 8,
    leafSize: 80,
    layer: 2,
  },
  {
    x: -30,
    y: 300,
    angle: 115,
    length: 320,
    curve: 50,
    count: 6,
    leafSize: 65,
    layer: 2,
  },
  {
    x: -30,
    y: 700,
    angle: 55,
    length: 380,
    curve: -70,
    count: 7,
    leafSize: 75,
    layer: 3,
  },
  {
    x: -20,
    y: 80,
    angle: 140,
    length: 260,
    curve: -40,
    count: 5,
    leafSize: 70,
    layer: 4,
  },
  {
    x: -50,
    y: 820,
    angle: 75,
    length: 260,
    curve: 40,
    count: 5,
    leafSize: 90,
    layer: 4,
  },
];

const sideRight: BranchData[] = [
  {
    x: -30,
    y: 420,
    angle: 80,
    length: 280,
    curve: 60,
    count: 6,
    leafSize: 65,
    layer: 1,
  },
  {
    x: -20,
    y: 880,
    angle: 35,
    length: 460,
    curve: -80,
    count: 7,
    leafSize: 80,
    layer: 2,
  },
  {
    x: -30,
    y: 200,
    angle: 125,
    length: 300,
    curve: -40,
    count: 6,
    leafSize: 65,
    layer: 3,
  },
  {
    x: -40,
    y: 640,
    angle: 65,
    length: 300,
    curve: 60,
    count: 6,
    leafSize: 85,
    layer: 4,
  },
];

// 上からたれ下がる枝（angle 180 前後 = 下向き）
const canopy: BranchData[] = [
  {
    x: 180,
    y: -20,
    angle: 200,
    length: 200,
    curve: 40,
    count: 6,
    leafSize: 55,
    layer: 1,
  },
  {
    x: 520,
    y: -30,
    angle: 170,
    length: 170,
    curve: -30,
    count: 5,
    leafSize: 50,
    layer: 1,
  },
  {
    x: 900,
    y: -30,
    angle: 190,
    length: 160,
    curve: 30,
    count: 5,
    leafSize: 50,
    layer: 2,
  },
  {
    x: 1250,
    y: -20,
    angle: 160,
    length: 220,
    curve: -40,
    count: 6,
    leafSize: 60,
    layer: 2,
  },
  {
    x: 340,
    y: -40,
    angle: 185,
    length: 140,
    curve: 20,
    count: 4,
    leafSize: 60,
    layer: 3,
  },
  {
    x: 1080,
    y: -40,
    angle: 175,
    length: 130,
    curve: -20,
    count: 4,
    leafSize: 60,
    layer: 3,
  },
];

// 足元のシダ（細かい葉がたくさん並ぶ）
const fernX = [-40, 40, 120, 200, 290, 370, 460, 540, 630, 720, 800, 890, 980, 1060, 1150, 1240, 1320, 1410, 1480];
const ferns: BranchData[] = fernX.map((x, i) => ({
  x,
  y: 210,
  angle: (i % 2 === 0 ? -1 : 1) * (10 + (i % 3) * 9),
  length: 110 + (i % 4) * 22,
  curve: (i % 2 === 0 ? 1 : -1) * 25,
  count: 11,
  leafSize: 24,
  // 奥（薄い色）と手前（濃い色）を混ぜて、茂みに奥行きを出す
  layer: ([1, 3, 2, 4] as const)[i % 4],
}));

function Cluster({
  data,
  viewBox,
  className,
  preserve,
}: {
  data: BranchData[];
  viewBox: string;
  className: string;
  preserve?: string;
}) {
  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio={preserve}
      className={className}
      aria-hidden="true"
    >
      {data.map((b, i) => (
        <Branch key={i} data={b} index={i} />
      ))}
    </svg>
  );
}

// ヒーロー（最初の画面）をぐるっと囲む葉っぱ。depth はスクロール時に動く速さ（奥行き感）
export function HeroFoliage() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <div
        className="parallax absolute inset-y-0 left-0"
        style={{ "--depth": 0.25 } as React.CSSProperties}
      >
        <Cluster
          data={side}
          viewBox="0 0 420 900"
          className="h-full w-auto -translate-x-[45%] opacity-80 sm:translate-x-0 sm:opacity-100"
          preserve="xMinYMid meet"
        />
      </div>
      <div
        className="parallax absolute inset-y-0 right-0"
        style={{ "--depth": 0.35 } as React.CSSProperties}
      >
        <Cluster
          data={sideRight}
          viewBox="0 0 420 900"
          className="h-full w-auto translate-x-[45%] -scale-x-100 opacity-80 sm:translate-x-0 sm:opacity-100"
          preserve="xMinYMid meet"
        />
      </div>
      <div
        className="parallax absolute inset-x-0 top-0"
        style={{ "--depth": 0.15 } as React.CSSProperties}
      >
        <Cluster
          data={canopy}
          viewBox="0 0 1440 260"
          className="h-40 w-full sm:h-56"
          preserve="xMidYMin slice"
        />
      </div>
      <div className="absolute inset-x-0 bottom-0">
        <Ferns />
      </div>
    </div>
  );
}

// 足元のシダの列（ヒーローの下と、ページのいちばん下で使う）
export function Ferns({ className = "h-24 sm:h-44" }: { className?: string }) {
  return (
    <Cluster
      data={ferns}
      viewBox="0 0 1440 230"
      className={`w-full ${className}`}
      preserve="xMidYMax slice"
    />
  );
}

// スクロール中も画面の両端からのぞく葉っぱ（大きい画面のときだけ表示）
export function SideFoliage() {
  return (
    <div
      className="pointer-events-none fixed inset-y-0 left-0 right-0 -z-10 hidden lg:block"
      aria-hidden="true"
    >
      <div className="absolute bottom-0 left-0 h-[70vh] opacity-40">
        <Cluster
          data={side.slice(0, 4)}
          viewBox="0 0 420 900"
          className="h-full w-auto"
          preserve="xMinYMax meet"
        />
      </div>
      <div className="absolute right-0 top-[20vh] h-[70vh] opacity-40">
        <Cluster
          data={sideRight.slice(0, 3)}
          viewBox="0 0 420 900"
          className="h-full w-auto -scale-x-100"
          preserve="xMinYMid meet"
        />
      </div>
    </div>
  );
}
