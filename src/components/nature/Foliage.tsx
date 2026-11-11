import Plant, { type LeafShape, type PlantData } from "./Plants";

// 画面のまわりを囲む植物を、場所ごとに 1 つの SVG にまとめています。
// 「どこに・どの植物を・どの向きで」生やすかは、下の配列（データ）で決めています。
// 植物を増やしたいときは、配列に 1 行足すだけで OK です。

type Layer = 1 | 2 | 3 | 4;

// ---- 植物ごとの「作り方」をまとめた小さな関数（毎回すべての数字を書かずに済むように） ----
// 引数：x, y = 根元の位置 / angle = 向き / length = 長さ / curve = しなり / layer = 奥行き
const vine = (x: number, y: number, angle: number, length: number, curve: number, layer: Layer, leaf: LeafShape = "pointed"): PlantData => ({
  kind: "branch", x, y, angle, length, curve, layer, leaf,
  count: Math.round(length / 55),
  leafSize: leaf === "heart" ? 55 : leaf === "round" ? 50 : 75,
  spread: leaf === "round" ? 75 : 55,
  opposite: leaf === "round", // ユーカリは葉が対になって並ぶ
});
const fern = (x: number, y: number, angle: number, length: number, curve: number, layer: Layer): PlantData => ({
  kind: "branch", x, y, angle, length, curve, layer, leaf: "narrow", opposite: true,
  count: Math.round(length / 18), leafSize: 30, spread: 65,
});
const palm = (x: number, y: number, angle: number, length: number, curve: number, layer: Layer): PlantData => ({
  kind: "branch", x, y, angle, length, curve, layer, leaf: "narrow", opposite: true,
  count: Math.round(length / 24), leafSize: 95, spread: 58,
});
const monstera = (x: number, y: number, angle: number, size: number, layer: Layer): PlantData => ({ kind: "monstera", x, y, angle, size, layer });
const grass = (x: number, y: number, height: number, layer: Layer, blades = 7): PlantData => ({ kind: "grass", x, y, angle: 0, height, blades, layer });
const flower = (x: number, y: number, size: number, color: 1 | 2 | 3, layer: Layer = 3): PlantData => ({ kind: "flower", x, y, angle: (x % 3) * 6 - 6, size, color, layer });

// 左端から右向きに伸びる植物たち（viewBox 420×900）
const left: PlantData[] = [
  palm(-30, 640, 58, 440, -90, 1),
  vine(-20, 380, 98, 300, 40, 1, "round"),
  vine(-20, 900, 25, 520, 90, 2),
  vine(-30, 250, 122, 330, 50, 2, "heart"),
  fern(-20, 560, 78, 280, -40, 3),
  monstera(-10, 770, 55, 170, 3),
  vine(-20, 70, 142, 260, -40, 4),
  monstera(-50, 920, 32, 220, 4),
  grass(20, 905, 170, 4, 8),
];

// 右端（同じ viewBox を左右反転して使う。左とは違う組み合わせにして単調にならないように）
const right: PlantData[] = [
  palm(-20, 480, 72, 400, 80, 1),
  vine(-30, 860, 40, 460, -80, 2),
  vine(-30, 140, 132, 300, -40, 2, "heart"),
  vine(-20, 690, 62, 320, -50, 2, "round"),
  monstera(-30, 420, 88, 150, 3),
  fern(-10, 900, 38, 320, 60, 4),
  monstera(-40, 640, 66, 180, 4),
];

// 上からたれ下がる植物（angle 180 前後 = 下向き。viewBox 1440×260）
const canopy: PlantData[] = [
  palm(30, -40, 145, 320, -60, 1),
  palm(1410, -40, 215, 320, 60, 1),
  vine(180, -20, 195, 220, 40, 1, "heart"),
  vine(520, -30, 172, 190, -30, 1, "round"),
  vine(900, -30, 188, 170, 30, 2, "heart"),
  vine(1250, -20, 160, 220, -40, 2),
  vine(700, -30, 182, 120, 20, 2, "round"),
  vine(340, -40, 185, 150, 20, 3, "heart"),
  vine(1080, -40, 175, 140, -20, 3),
];

// 足元：シダ・草・小さな花・低いモンステラを混ぜた茂み（viewBox 1440×210）
const ground: PlantData[] = [
  monstera(250, 215, -14, 120, 2),
  monstera(1180, 215, 16, 110, 2),
  ...[-40, 120, 290, 460, 630, 800, 980, 1150, 1320, 1480].map((x, i) =>
    fern(x, 212, (i % 2 === 0 ? -1 : 1) * (10 + (i % 3) * 9), 120 + (i % 4) * 20, (i % 2 === 0 ? 1 : -1) * 25, ([1, 3, 2, 4] as const)[i % 4]),
  ),
  ...[40, 200, 380, 540, 720, 890, 1060, 1240, 1400].map((x, i) => grass(x, 214, 70 + (i % 3) * 25, ([3, 4, 2] as const)[i % 3])),
  flower(90, 212, 13, 1),
  flower(330, 212, 11, 2),
  flower(560, 212, 12, 3),
  flower(860, 212, 11, 1),
  flower(1010, 212, 13, 2),
  flower(1290, 212, 12, 3),
];

function Cluster({ data, viewBox, className, preserve }: { data: PlantData[]; viewBox: string; className: string; preserve?: string }) {
  return (
        // overflow-visible：SVG の枠からはみ出した葉も切らずに表示する（上からたれ下がる葉が途中で切れないように）
    <svg viewBox={viewBox} preserveAspectRatio={preserve} className={`overflow-visible ${className}`} aria-hidden="true">
      {data.map((p, i) => (
        <Plant key={i} data={p} index={i} />
      ))}
    </svg>
  );
}

const depth = (d: number) => ({ "--depth": d }) as React.CSSProperties;

// ヒーロー（最初の画面）をぐるっと囲む植物。depth はスクロール時に動く速さ（奥行き感）
export function HeroFoliage() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="parallax absolute inset-y-0 left-0" style={depth(0.25)}>
        <Cluster data={left} viewBox="0 0 420 900" preserve="xMinYMid meet" className="h-full w-auto -translate-x-[45%] opacity-80 sm:translate-x-0 sm:opacity-100" />
      </div>
      <div className="parallax absolute inset-y-0 right-0" style={depth(0.35)}>
        <Cluster data={right} viewBox="0 0 420 900" preserve="xMinYMid meet" className="h-full w-auto translate-x-[45%] -scale-x-100 opacity-80 sm:translate-x-0 sm:opacity-100" />
      </div>
      <div className="parallax absolute inset-x-0 top-0" style={depth(0.15)}>
        <Cluster data={canopy} viewBox="0 0 1440 260" preserve="xMidYMin slice" className="h-40 w-full sm:h-56" />
      </div>
      <div className="absolute inset-x-0 bottom-0">
        <Ground />
      </div>
    </div>
  );
}

// 足元の茂み（ヒーローの下と、ページのいちばん下で使う）
export function Ground({ className = "h-24 sm:h-44" }: { className?: string }) {
  return <Cluster data={ground} viewBox="0 0 1440 210" preserve="xMidYMax slice" className={`w-full ${className}`} />;
}

// スクロール中も画面の両端からのぞく植物（大きい画面のときだけ表示）
export function SideFoliage() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 hidden lg:block" aria-hidden="true">
      <div className="absolute bottom-0 left-0 h-[70vh] opacity-40">
        <Cluster data={left.slice(0, 6)} viewBox="0 0 420 900" preserve="xMinYMax meet" className="h-full w-auto" />
      </div>
      <div className="absolute right-0 top-[20vh] h-[70vh] opacity-40">
        <Cluster data={right.slice(0, 5)} viewBox="0 0 420 900" preserve="xMinYMid meet" className="h-full w-auto -scale-x-100" />
      </div>
    </div>
  );
}
