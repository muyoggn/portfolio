import ScrollLinked from "@/components/ScrollLinked";
import { skills } from "@/data/profile";

// スクロールすると「横に」流れる、大きな文字の帯です。
//
// 縦にスクロールした量（ScrollLinked が入れる --p：0〜1）を、横の移動量に置き換えています。
// 1 段目は左へ、2 段目は右へ。勝手に動き続けるのではなく、スクロールを止めれば止まり、戻せば戻ります。
// 文字はスキル一覧（profile.ts）から自動で作るので、スキルを増やせば帯にも出てきます。
// 内容は下の Skills と同じなので、読み上げソフトには読ませません（ariaHidden）。
export default function SkillBand() {
  const names = skills.flatMap((group) => group.items.map((item) => item.name));
  const half = Math.ceil(names.length / 2);
  const rows = [names.slice(0, half), names.slice(half)];

  return (
    <ScrollLinked start={1} end={0} ariaHidden className="skill-band overflow-hidden py-10 sm:py-16">
      {rows.map((row, r) => (
        <div key={r} className={`band-row ${r === 1 ? "band-row-reverse" : ""}`}>
          {/* 画面の端が空かないよう、同じ並びを 3 回くり返す */}
          {[0, 1, 2].map((copy) => (
            <span key={copy} className="flex shrink-0 items-center">
              {row.map((name) => (
                <span key={name} className="flex items-center">
                  <span className={r === 0 ? "band-outline" : ""}>{name}</span>
                  <span className="mx-[0.45em] inline-block h-[0.14em] w-[0.14em] rounded-full bg-accent" />
                </span>
              ))}
            </span>
          ))}
        </div>
      ))}
    </ScrollLinked>
  );
}
