"use client";
// ↑ スクロールやボタンに反応して動くので、ブラウザ側で動く部品にしています。

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Work } from "@/data/profile";
import WorkArt from "@/components/WorkArt";

// 作品のカードを横一列の「帯」に並べて、スクロールで横にスライドさせて見る部品です。
//
// しくみ：
// ・作品のカードを左から順に、すき間をあけて横一列に並べています。真ん中に来たカードが正面で、
//   となりのカードは少し小さく、うすく見えます。最後のカードの次に最初のカードが来る（ぐるっと回る）ことはありません。
// ・Works の場所に来ると、見出しごと画面が留まり（sticky）、そのまま下へスクロールすると帯が左へ流れていきます。
//   最初のカードと最後のカードのところでは少しのあいだ帯が止まり（硬直）、ちゃんと見てから次へ進めます。
//   トラックパッドの横スクロールや、スマホで横にスワイプしても同じように動きます。
// ・「いま何枚目まで進んだか」を小数（pos）で持ち、各カードが正面から何枚ずれているかを計算して、
//   その分だけ横にずらします。
// ・スクロールの位置にそのまま合わせず、毎コマ少しずつ追いかける（なめらかに遅れてついてくる）ようにして、
//   速くスクロールしたときは、カードが進む向きに少し傾きます（スクロールの「速さ」を使う）。
// ・正面のカードを押すと、くるっと裏返って、裏に作品の説明が書いてあります。
//   （友人のサイトの「スクロールで回る・カードを押すと裏返る」という仕組みを参考にしました。見た目はこのサイトの板のままです）
// ・スクロールのたびに React で描き直すと重いので、カードの transform だけを直接書き換えています。
//   動かすのは transform と opacity だけなので、ブラウザは描き直さずに済み、なめらかに動きます。
// ・「動きを減らす」設定の人には、画面を留めず、矢印ボタンでパッと切り替える形にします。

const STEP_PX = 680; // 作品 1 つ分進むのに必要なスクロール量（px）。このうち 4 割は止まっている
const HOLD_PX = 360; // 最初のカードで、帯を止めておくスクロール量（px）
const END_HOLD_PX = 560; // 最後のカードで、帯を止めておくスクロール量（px）。最初より長め
const GAP = 1.12; // となりのカードとの間隔（カードの幅の何倍か。1 より大きいので、すき間があく）

// 作品 1 つ分のスクロールのうち、はじめと終わりの 2 割ずつ（合わせて 4 割）は帯を止めて、
// カードが正面でしっかり止まって見えるようにする（カードとカードの間の「硬直」）。
// 残りの 6 割で、ゆっくり動き出して → ゆっくり止まる曲線（コサインの半周）でとなりへ進む。
// 止まる・動くの切り替えは、追いかける動き（tick の 8%）がやわらげるので、カクッとはしない
const PAUSE = 0.2;
function hold(t: number) {
  const x = Math.min(1, Math.max(0, (t - PAUSE) / (1 - 2 * PAUSE)));
  return (1 - Math.cos(Math.PI * x)) / 2;
}

// 「動きを減らす」設定がオンかどうか。設定が変わったら教えてもらう（useSyncExternalStore）
const reduceQuery = "(prefers-reduced-motion: reduce)";
function useReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(reduceQuery);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(reduceQuery).matches,
    () => false, // サーバーで HTML を作るときは「オフ」として作る
  );
}

export default function WorkCarousel({ works, heading }: { works: Work[]; heading?: React.ReactNode }) {
  const n = works.length;
  const [active, setActive] = useState(0); // 正面に一番近い作品（説明文の切り替えに使う）
  const pinned = !useReducedMotion(); // false：「動きを減らす」設定のとき（画面を留めない）
  const trackRef = useRef<HTMLDivElement>(null); // 縦に長い外側の箱（この高さの分だけスクロールして回す）
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const staticPos = useRef(0); // 画面を留めないときの位置
  const [flipped, setFlipped] = useState<number | null>(null); // 裏返している作品の番号
  const justDragged = useRef(false);
  const activeRef = useRef(0); // active と同じ値（スクロール中に、変わったかどうかを素早く調べる用）

  // カードを pos（小数）の位置に並べる。スクロールのたびに呼ばれる
  // vel：1 コマでどれだけ回ったか（スクロールの速さ）。速いほどカードが傾く
  const place = (pos: number, vel = 0) => {
    const lean = Math.max(-6, Math.min(6, vel * 70)); // 傾き（度）
    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const o = i - pos; // 正面から何枚ずれているか（右がプラス、左がマイナス）
      const a = Math.abs(o);
      const hidden = a > 2.5;
      // となりのカードは 12% 小さく、うすく。間隔は GAP なので重ならない
      const scale = 1 - Math.min(1, a) * 0.12;
      el.style.transform = `translate3d(${o * GAP * 100}%, 0, 0) rotateY(${-lean}deg) scale(${scale})`;
      el.style.opacity = String(hidden ? 0 : 1 - Math.min(1, a) * 0.5 - Math.max(0, a - 1) * 0.3);
      el.style.visibility = hidden ? "hidden" : "";
    });
    const near = Math.min(n - 1, Math.max(0, Math.round(pos)));
    if (activeRef.current !== near) {
      activeRef.current = near;
      setActive(near);
      setFlipped(null); // 正面の作品が変わったら、裏返していたカードは表に戻す
    }
  };

  // スクロール量 → 何枚目まで回ったか
  const posFromScroll = () => {
    const track = trackRef.current;
    if (!track) return 0;
    // 留まっている間にスクロールできる量のうち、最初の HOLD_PX と最後の END_HOLD_PX は帯を止めておく
    const total = track.offsetHeight - window.innerHeight - HOLD_PX - END_HOLD_PX;
    const scrolled = Math.min(total, Math.max(0, -track.getBoundingClientRect().top - HOLD_PX));
    if (n < 2 || total <= 0) return 0;
    const p = (scrolled / total) * (n - 1);
    const seg = Math.min(n - 2, Math.floor(p));
    return seg + hold(p - seg);
  };

  // i 番目の作品が正面に来るスクロール位置
  const scrollTopFor = (i: number) => {
    const track = trackRef.current;
    if (!track) return 0;
    const total = track.offsetHeight - window.innerHeight - HOLD_PX - END_HOLD_PX;
    return window.scrollY + track.getBoundingClientRect().top + HOLD_PX + (n > 1 ? (i / (n - 1)) * total : 0);
  };

  // i 番目の作品へ回す（矢印ボタン・下の線・キーボード）
  const go = (i: number) => {
    if (pinned) {
      const to = Math.min(n - 1, Math.max(0, i));
      window.scrollTo({ top: scrollTopFor(to), behavior: "smooth" });
    } else {
      staticPos.current = Math.min(n - 1, Math.max(0, i));
      place(staticPos.current);
    }
  };

  useEffect(() => {
    if (!pinned) {
      place(staticPos.current);
      return;
    }
    // スクロールした位置（target）に、今の位置（cur）が少しずつ近づいていく。
    // こうすると、スクロールを止めてもしばらく「ぬるーっ」と動き続ける、なめらかな動きになる。
    // 近づく割合は「1 コマ（1/60 秒）あたり 8%」。画面の書き換えが 60 回/秒でも 120 回/秒でも
    // 同じ速さに見えるよう、前のコマからの経過時間（dt）で割合を調整している。
    // 近づききったら、毎コマの計算は止めておく（何もしていないときは動かさない）
    let frame = 0;
    let running = false;
    let last = 0;
    let cur = posFromScroll();
    const tick = (now: number) => {
      const dt = last ? Math.min(64, now - last) : 16.7;
      last = now;
      const target = posFromScroll();
      const prev = cur;
      cur += (target - cur) * (1 - Math.pow(1 - 0.08, dt / 16.7));
      if (Math.abs(target - cur) < 0.0003) cur = target;
      place(cur, (cur - prev) * (16.7 / dt));
      if (cur !== target) frame = requestAnimationFrame(tick);
      else {
        running = false;
        last = 0;
      }
    };
    const update = () => {
      if (running) return;
      running = true;
      frame = requestAnimationFrame(tick);
    };
    place(cur);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 設定が変わったときだけ付け直す
  }, [pinned]);

  // トラックパッドの横スクロール：縦のスクロールに置き換えて、同じように回す
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let acc = 0;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return; // 縦のスクロールはそのまま
      e.preventDefault(); // ブラウザの「戻る」ジェスチャーなどを止める
      if (pinned) {
        window.scrollBy(0, e.deltaX * 1.2);
      } else {
        // 画面を留めないときは、ある程度横に動かしたら 1 枚回す
        acc += e.deltaX;
        if (Math.abs(acc) > 80) {
          go(staticPos.current + Math.sign(acc));
          acc = 0;
        }
      }
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pinned が変わったときだけ付け直す
  }, [pinned]);

  // スマホ・マウスで横にドラッグ：これも縦のスクロールに置き換える
  const drag = useRef<{ x: number; y: number; last: number; moved: boolean } | null>(null);
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    drag.current = { x: e.clientX, y: e.clientY, last: e.clientX, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    if (!d.moved) {
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      // 縦に動かしたなら、ふつうのスクロールとしてブラウザに任せる
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 6) {
        drag.current = null;
        return;
      }
      if (Math.abs(dx) < 6) return;
      d.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    if (pinned) {
      // 指を左へ動かす → 次の作品へ（カード 1 枚の幅ほど動かすと、だいたい 1 枚回る）
      const card = cardRefs.current[0];
      const ratio = STEP_PX / ((card?.offsetWidth ?? 300) * 0.8);
      window.scrollBy(0, -(e.clientX - d.last) * ratio);
    }
    d.last = e.clientX;
  };
  const onPointerEnd = () => {
    const d = drag.current;
    drag.current = null;
    if (!d?.moved) return;
    // 指を離した直後に届く「クリック」で、カードが裏返らないようにする
    justDragged.current = true;
    setTimeout(() => (justDragged.current = false), 0);
    if (pinned) {
      // 指を離したら、いちばん近い作品にぴたっと合わせる
      go(Math.round(posFromScroll()));
    } else {
      const dx = d.last - d.x;
      if (Math.abs(dx) > 40) go(staticPos.current - Math.sign(dx));
    }
  };

  const work = works[active];

  return (
    // 外側の箱を「画面の高さ ＋ 作品の数ぶんのスクロール量」にして、中身を sticky で留める
    <div
      ref={trackRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="作品の一覧"
      style={pinned ? { height: `calc(100svh + ${(n - 1) * STEP_PX + HOLD_PX + END_HOLD_PX}px)` } : undefined}
    >
      <div className={pinned ? "sticky top-0 flex h-svh flex-col justify-center pt-16" : ""}>
        {/* 見出しもいっしょに画面に留めて、カードを見ている間も「Works」が見えるようにする */}
        {heading && <div className="mb-6 sm:mb-8">{heading}</div>}
        {/* ---- カードが回る舞台 ---- */}
        <div
          ref={stageRef}
          tabIndex={0}
          aria-label="← → キーで作品を切り替え、Enter で裏返す"
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") go(active + 1);
            if (e.key === "ArrowLeft") go(active - 1);
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setFlipped((f) => (f === active ? null : active));
            }
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
          className="carousel-stage relative select-none rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        >
          {/* 高さを決めるための見えない箱（カードと同じ 4:3） */}
          <div className="carousel-sizer aspect-[4/3]" aria-hidden="true" />
          {works.map((w, i) => (
            <div
              key={w.title}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} / ${n}：${w.title}`}
              aria-hidden={i !== active}
              onClick={() => {
                if (justDragged.current) return;
                // 正面のカードは裏返す。となりのカードは、そのカードを正面へ
                if (i === active) setFlipped((f) => (f === i ? null : i));
                else go(i);
              }}
              className="carousel-card cursor-pointer"
            >
              {/* 表と裏の 2 面。裏返すときは、この箱ごと Y 軸で 180° 回す */}
              <div className={`card-flip ${flipped === i ? "is-flipped" : ""}`}>
                <div className="card-face">
                  <WorkArt work={w} />
                </div>
                <div className="card-face card-back flex flex-col justify-between rounded-2xl border border-line p-[7%]">
                  <div>
                    <p className="font-display text-xs tabular-nums text-muted">
                      {String(i + 1).padStart(2, "0")}
                      {w.sample && <span className="ml-3 font-sans">サンプル</span>}
                    </p>
                    <p className="mt-2 font-medium sm:text-lg">{w.title}</p>
                    <p className="mt-2 text-xs leading-relaxed text-muted sm:mt-3 sm:text-sm sm:leading-loose">{w.description}</p>
                  </div>
                  {w.tech.length > 0 && <p className="text-xs leading-relaxed text-muted sm:text-sm">{w.tech.join(" ／ ")}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ---- 正面の作品の説明。作品が切り替わるたびに、下からふわっと入れ替わる ---- */}
        <div key={active} className="carousel-detail mt-6 min-h-[8rem] sm:mt-8" aria-live="polite">
          <p className="font-display text-sm tabular-nums text-muted">
            {String(active + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
            {work.sample && <span className="ml-3 font-sans">サンプル</span>}
          </p>
          <h3 className="mt-2 text-xl font-medium sm:text-2xl">{work.title}</h3>
          <p className="mt-3 text-sm text-muted">
            {flipped === active ? "もう一度押すと、表に戻ります" : "カードを押すと、裏返して説明が読めます"}
          </p>
          {work.url && (
            <a href={work.url} target="_blank" rel="noopener noreferrer" className="group mt-4 inline-flex items-center gap-2 text-sm">
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
    </div>
  );
}
