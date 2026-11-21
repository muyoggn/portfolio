// 背景の「方眼のトンネル」です。見た目だけの部品なので、中身（文字）はありません。
//
// 方眼紙のような模様（CSS のグラデーションで線を引いたもの）を 4 枚用意して、
// 床・天井・左の壁・右の壁として、奥へ向かって立てています（transform の rotateX / rotateY）。
// perspective（遠近法）を付けているので、遠くのマス目ほど小さく見え、四角いトンネルの中にいるように見えます。
//
// スクロールすると 4 枚の壁のマス目が手前へ流れてきて（--sy を使用）、
// 「トンネルの中を前へ進んでいる」ように感じられます。
// 色や動きは globals.css の「方眼のトンネル」のところで決めています。
export default function SpaceGrid() {
  return (
    <div className="space" aria-hidden="true">
      <div className="tunnel-wall tunnel-ceiling" />
      <div className="tunnel-wall tunnel-floor" />
      <div className="tunnel-wall tunnel-left" />
      <div className="tunnel-wall tunnel-right" />
    </div>
  );
}
