"use client";

import { useEffect, useState } from "react";

// ヒーローに置く「ターミナル（黒い画面）」風の部品です。
// コマンドを 1 文字ずつ打ち込み、その結果をふわっと表示する…という動きを 1 回だけ再生します。
//
// なめらかに見せるための工夫：
//  1. 全部の行を最初から「見えない状態」で置いておき、枠の高さを最初から確定させる
//     （行が増えるたびに枠が伸びると、まわりの文字やボタンがガタッと動いてしまうため）
//  2. 結果の行は、パッと出すのではなく opacity（透明度）と位置を少しずつ変えてフェードイン
//  3. 背景をぼかす効果（backdrop-blur）は重い処理なので使わない
type Line = { command: string; output: string[] };

const TYPE_SPEED = 55; // 1 文字打つ間隔（ミリ秒）
const LINE_PAUSE = 450; // 1 行打ち終わってから次に進むまでの間（ミリ秒）

export default function Terminal({ lines }: { lines: Line[] }) {
  // step：何行目のコマンドを打っているか / typed：そのコマンドを何文字まで打ったか
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    if (step >= lines.length) return;
    const command = lines[step].command;
    const timer =
      typed < command.length
        ? setTimeout(() => setTyped(typed + 1), TYPE_SPEED)
        : setTimeout(() => {
            setStep(step + 1);
            setTyped(0);
          }, LINE_PAUSE);
    return () => clearTimeout(timer);
  }, [step, typed, lines]);

  const finished = step >= lines.length;

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-terminal/95 font-mono text-sm text-terminal-text shadow-lg shadow-accent/10">
      {/* ウィンドウ上部の 3 つの丸 */}
      <div className="flex gap-1.5 border-b border-white/10 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#e0796b]" />
        <span className="h-3 w-3 rounded-full bg-[#e8c36a]" />
        <span className="h-3 w-3 rounded-full bg-[#7cc48f]" />
      </div>
      <div className="space-y-3 p-5 leading-relaxed">
        {lines.map((line, i) => {
          const started = i <= step; // この行のコマンドを打ち始めたか
          const done = i < step; // 打ち終わって結果が出たか
          const shown = done ? line.command.length : i === step ? typed : 0;
          return (
            <div key={line.command} className={started ? "" : "invisible"}>
              <p>
                <span className="text-leaf">~/portfolio $</span> {line.command.slice(0, shown)}
                {/* 点滅するカーソル（打っている行だけ） */}
                {i === step && <span className="cursor">▍</span>}
                {/* まだ打っていない残りの文字は、透明にして場所だけ確保 */}
                <span className="invisible">{line.command.slice(shown)}</span>
              </p>
              {line.output.map((out) => (
                <p key={out} className={`term-out ${done ? "is-shown" : ""}`}>
                  {out}
                </p>
              ))}
            </div>
          );
        })}
        <p className={finished ? "" : "invisible"}>
          <span className="text-leaf">~/portfolio $</span> <span className="cursor">▍</span>
        </p>
      </div>
    </div>
  );
}
