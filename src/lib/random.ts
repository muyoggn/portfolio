// 「毎回同じ順番で出てくる乱数」をつくる関数です（シード付き乱数）。
//
// Math.random() は表示のたびに違う値になるので、サーバーで作った HTML とブラウザで作った画面の
// 形が食い違ってしまいます。そこで、同じ seed（種）からは必ず同じ数の並びが出てくる計算を使い、
// 「自然でばらばらに見えるけれど、毎回同じ形」を作っています。
export function seeded(seed: number) {
  let a = seed >>> 0;
  const next = () => {
    // mulberry32 という、短くて質のよい乱数の計算方法
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next, // 0〜1
    range: (min: number, max: number) => min + next() * (max - min),
    int: (min: number, max: number) => Math.floor(min + next() * (max - min + 1)),
    chance: (p: number) => next() < p, // p の確率で true
    pick: <T,>(items: readonly T[]) => items[Math.floor(next() * items.length)],
  };
}
