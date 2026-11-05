"use client";

import { useEffect, useState } from "react";

// ヒーローに置く「ターミナル（黒い画面）」風の部品です。
// コマンドを 1 文字ずつ打ち込み、その結果を表示する…という動きを繰り返さず 1 回だけ再生します。
type Line = { command: string; output: string[] };

export default function Terminal({ lines }: { lines: Line[] }) {
  // step：何行目のコマンドを打っているか / typed：そのコマンドを何文字まで打ったか
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    if (step >= lines.length) return;
    const command = lines[step].command;
    // まだ打ち終わっていなければ 1 文字進める。打ち終わったら少し待って次の行へ
    const timer =
      typed < command.length
        ? setTimeout(() => setTyped(typed + 1), 70)
        : setTimeout(() => {
            setStep(step + 1);
            setTyped(0);
          }, 500);
    return () => clearTimeout(timer);
  }, [step, typed, lines]);

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-terminal/90 font-mono backdrop-blur text-sm text-terminal-text shadow-lg shadow-accent/10">
      {/* ウィンドウ上部の 3 つの丸 */}
      <div className="flex gap-1.5 border-b border-white/10 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#e0796b]" />
        <span className="h-3 w-3 rounded-full bg-[#e8c36a]" />
        <span className="h-3 w-3 rounded-full bg-[#7cc48f]" />
      </div>
      <div className="min-h-56 space-y-3 p-5 leading-relaxed">
        {lines.slice(0, step + 1).map((line, i) => {
          const done = i < step;
          return (
            <div key={line.command}>
              <p>
                <span className="text-leaf">~/portfolio $</span>{" "}
                {done ? line.command : line.command.slice(0, typed)}
                {/* 点滅するカーソル */}
                {!done && <span className="cursor">▍</span>}
              </p>
              {done && line.output.map((out) => <p key={out} className="opacity-80">{out}</p>)}
            </div>
          );
        })}
        {step >= lines.length && (
          <p>
            <span className="text-leaf">~/portfolio $</span> <span className="cursor">▍</span>
          </p>
        )}
      </div>
    </div>
  );
}
