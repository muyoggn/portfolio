// 森の「空気」をつくる部品：木漏れ日の光の筋と、ふわふわ漂う光の粒。
// 光の粒は、明るいときは花粉、ダークモードでは蛍のように見えます。

// 位置をランダム「っぽく」ばらけさせるための簡単な計算（毎回同じ結果になるので表示がずれない）
const spread = (i: number, a: number, b: number) =>
  ((i * a + b) % 100) + (i % 3) * 0.3;

export function SunRays() {
  const rays = [
    { left: "12%", width: 90, delay: 0 },
    { left: "30%", width: 140, delay: 2 },
    { left: "52%", width: 70, delay: 4 },
    { left: "68%", width: 120, delay: 1 },
  ];
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {rays.map((r) => (
        <span
          key={r.left}
          className="ray"
          style={{
            left: r.left,
            width: r.width,
            animationDelay: `${r.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export function Fireflies({ count = 22 }: { count?: number }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="firefly"
          style={{
            left: `${spread(i, 37, 11)}%`,
            top: `${spread(i, 53, 29)}%`,
            width: 3 + (i % 4),
            height: 3 + (i % 4),
            animationDuration: `${8 + (i % 5) * 2}s`,
            animationDelay: `${-i * 0.9}s`,
          }}
        />
      ))}
    </div>
  );
}
