"use client";
// ↑ ボタンやスワイプに反応して動くので、ブラウザ側で動く部品にしています。

import { useEffect, useRef, useState } from "react";
import type { Work } from "@/data/profile";
import WorkArt from "@/components/WorkArt";

// 作品を横にぐるぐる回して見られる「カルーセル」です。
//
// しくみ：
// ・作品のカードを、円柱のまわりに並べたように置いています。真ん中のカードが正面、
//   となりのカードは少し奥に下がって、斜めにこちらを向きます（3D の rotateY と translateZ）。
// ・「正面にいるのは何番目か（active）」だけを覚えておき、各カードが正面から何枚ずれているか（offset）を
//   計算して、ずれた分だけ横・奥・斜めに動かします。最後のカードの次は最初のカードに戻ります（ぐるぐる）。
// ・動かすのは transform と opacity だけ。ブラウザが絵を描き直さずに済むので、なめらかに動きます。
// ・下の細い線が左から伸びきると、次の作品へ自動で回ります。マウスを乗せている間・画面の外にあるとき・
//   「動きを減らす」設定の人には、自動では回りません。
// ・矢印ボタン、キーボードの ← →、スマホでは指で横にスワイプしても回せます。

const AUTO_MS = 6000; // 自動で次へ回るまでの時間（ミリ秒）

// 「正面から何枚ずれているか」を、ぐるっと回った近いほうで数える。
// 例：作品が 5 つで正面が 0 番のとき、4 番は「+4 枚」ではなく「-1 枚（左となり）」
function ringOffset(i: number, active: number, n: number) {
  let d = (((i - active) % n) + n) % n;
  if (d > n / 2) d -= n;
  return d;
}

export default function WorkCarousel({ works }: { works: Work[] }) {
  const n = works.length;
  // active：いま正面の作品の番号。prev：ひとつ前に正面だった番号（回り込みの判定に使う）
  const [{ active, prev }, setPos] = useState({ active: 0, prev: 0 });
  const [drag, setDrag] = useState(0); // スワイプ中、指が動いた量（カード何枚分か。小数）
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const start = useRef<{ x: number; y: number; step: number; moved: boolean } | null>(null);
  const justDragged = useRef(false);

  const go = (to: number) => setPos((p) => ({ active: ((to % n) + n) % n, prev: p.active }));

  // 画面に入っているときだけ、自動で回す
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const paused = hovered || dragging || !inView;

  // ---- スワイプ（マウスのドラッグでも動く） ----
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const card = e.currentTarget.querySelector<HTMLElement>("[data-card]");
    // カード 1 枚分ずらすのに必要な指の移動量（px）
    const step = (card?.offsetWidth ?? 300) * 0.8;
    start.current = { x: e.clientX, y: e.clientY, step, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = start.current;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (!s.moved) {
      // 縦に動かしたなら、ページのスクロールとみなしてカルーセルは動かさない
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 6) {
        start.current = null;
        return;
      }
      if (Math.abs(dx) < 6) return;
      s.moved = true;
      setDragging(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    setDrag(dx / s.step);
  };
  const onPointerEnd = () => {
    const s = start.current;
    start.current = null;
    if (!s?.moved) return;
    // 少しでも（カード 0.15 枚分以上）動かしたら、その向きに 1 枚以上回す
    const moved = -drag;
    const by = Math.abs(moved) < 0.15 ? 0 : Math.sign(moved) * Math.max(1, Math.round(Math.abs(moved)));
    go(active + by);
    setDrag(0);
    setDragging(false);
    // 指を離した直後に届く「クリック」で、別のカードへ飛ばないようにする
    justDragged.current = true;
    setTimeout(() => (justDragged.current = false), 0);
  };

  const work = works[active];

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="作品の一覧"
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {/* ---- カードが回る舞台 ---- */}
      <div
        ref={stageRef}
        tabIndex={0}
        aria-label="← → キーで作品を切り替え"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(active + 1);
          if (e.key === "ArrowLeft") go(active - 1);
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        className={`carousel-stage relative select-none rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${dragging ? "is-dragging" : ""}`}
      >
        {/* 高さを決めるための見えない箱（カードと同じ 4:3） */}
        <div className="carousel-sizer aspect-[4/3]" aria-hidden="true" />
        {works.map((w, i) => {
          const o = ringOffset(i, active, n) + drag;
          const a = Math.abs(o);
          // 前回から 2 枚以上ずれた（反対側へ回り込んだ）カードは、横切る動きを見せずに一瞬で移す
          const jumped = Math.abs(ringOffset(i, active, n) - ringOffset(i, prev, n)) > 1.5;
          const hidden = a > 2.4;
          return (
            <div
              key={w.title}
              data-card
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} / ${n}：${w.title}`}
              aria-hidden={i !== active}
              onClick={() => {
                // スワイプした直後の「クリック」は無視。となりのカードを押したら、そのカードを正面へ
                if (!justDragged.current && i !== active) go(i);
              }}
              className={`carousel-card ${jumped ? "no-anim" : ""} ${i === active ? "is-active" : "cursor-pointer"}`}
              style={{
                transform: `translateX(${o * 86}%) translateZ(${a * -260}px) rotateY(${Math.max(-2, Math.min(2, o)) * 30}deg)`,
                opacity: hidden ? 0 : a <= 1 ? 1 - a * 0.3 : 0.7 - (a - 1) * 0.5,
                zIndex: 10 - Math.round(a * 2),
                visibility: hidden ? "hidden" : undefined,
              }}
            >
              <WorkArt work={w} />
            </div>
          );
        })}
      </div>

      {/* ---- 操作：細い線（どこにいるか＋自動で回るまでの時間）と、左右の矢印 ---- */}
      <div className="mt-8 flex items-center gap-6">
        <div className="flex flex-1 gap-2">
          {works.map((w, i) => (
            <button
              key={w.title}
              type="button"
              onClick={() => go(i)}
              aria-label={`${i + 1} 番目の作品：${w.title}`}
              aria-current={i === active}
              className="group relative h-6 flex-1"
            >
              <span className="absolute inset-x-0 top-1/2 h-px bg-line transition group-hover:bg-foreground/40" />
              {i === active && (
                <span
                  // key を変えると、線のアニメーションが最初からやり直しになる
                  key={active}
                  className="carousel-progress absolute inset-x-0 top-1/2 h-px bg-accent"
                  style={{ animationDuration: `${AUTO_MS}ms`, animationPlayState: paused ? "paused" : "running" }}
                  // 線が伸びきったら次の作品へ
                  onAnimationEnd={() => go(active + 1)}
                />
              )}
            </button>
          ))}
        </div>
        <p className="font-display text-sm tabular-nums text-muted">
          <span className="text-foreground">{String(active + 1).padStart(2, "0")}</span> / {String(n).padStart(2, "0")}
        </p>
        <div className="flex gap-2">
          {[
            { label: "前の作品", by: -1, icon: "←" },
            { label: "次の作品", by: 1, icon: "→" },
          ].map((b) => (
            <button
              key={b.label}
              type="button"
              onClick={() => go(active + b.by)}
              aria-label={b.label}
              className="grid h-10 w-10 place-items-center rounded-full border border-line text-sm transition hover:border-accent hover:text-accent"
            >
              {b.icon}
            </button>
          ))}
        </div>
      </div>

      {/* ---- 正面の作品の説明。作品が切り替わるたびに、下からふわっと入れ替わる ---- */}
      <div key={active} className="carousel-detail mt-10" aria-live={paused ? "polite" : "off"}>
        <p className="font-display text-sm tabular-nums text-muted">
          {String(active + 1).padStart(2, "0")}
          {work.sample && <span className="ml-3 font-sans">サンプル</span>}
        </p>
        <h3 className="mt-2 text-2xl font-medium">{work.title}</h3>
        <p className="mt-4 max-w-[36em] text-sm leading-loose text-muted">{work.description}</p>
        {work.tech.length > 0 && <p className="mt-5 text-sm leading-relaxed text-muted">{work.tech.join(" ／ ")}</p>}
        {work.url && (
          <a href={work.url} target="_blank" rel="noopener noreferrer" className="group mt-6 inline-flex items-center gap-2 text-sm">
            <span className="border-b border-foreground/30 pb-1 transition group-hover:border-accent group-hover:text-accent">
              {work.url.replace("https://", "")}
            </span>
            <span className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" aria-hidden="true">
              ↗
            </span>
          </a>
        )}
      </div>
    </div>
  );
}
