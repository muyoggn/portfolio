// 背景の「立体空間のマス目」です。見た目だけの部品なので、中身（文字）はありません。
//
// 平らな方眼紙のような模様（CSS のグラデーションで線を引いたもの）を 2 枚用意して、
// 1 枚は「床」、1 枚は「天井」として、奥に向かって寝かせています（transform の rotateX）。
// perspective（遠近法）を付けているので、遠くのマス目ほど小さく見え、奥行きのある部屋のように見えます。
//
// スクロールすると床と天井のマス目が手前へゆっくり流れてきて（--sy を使用）、
// 「空間の中を前へ進んでいる」ような感覚をそっと加えます。
// 色や動きは globals.css の「立体空間のマス目」のところで決めています。
export default function SpaceGrid() {
  return (
    <div className="space" aria-hidden="true">
      <div className="space-plane space-ceiling" />
      <div className="space-plane space-floor" />
    </div>
  );
}
