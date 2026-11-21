"use client";
// ↑ スクロールやボタンに反応して動くので、ブラウザ側で動く部品にしています。

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Work } from "@/data/profile";
import WorkArt from "@/components/WorkArt";

// 作品を横にぐるぐる回して見られる「カルーセル」です。
//
// しくみ：
// ・作品のカードを、円柱のまわりに並べたように置いています。真ん中のカードが正面、
//   となりのカードは少し奥に下がって、斜めにこちらを向きます（3D の rotateY と translateZ）。
// ・スクロールで回ります。Works の場所に来ると画面が留まり（sticky）、そのまま下へスクロールすると
//   カードが横に回っていきます。最後の作品まで回りきると、留まりが外れて次のセクションへ進みます。
//   トラックパッドの横スクロールや、スマホで横にスワイプしても同じように回ります。
// ・「いま何枚目まで回ったか」を小数（pos）で持ち、各カードが正面から何枚ずれているかを計算して、
//   その分だけ横・奥・斜めにずらします。
// ・スクロールの位置にそのまま合わせず、毎コマ少しずつ追いかける（なめらかに遅れてついてくる）ようにして、
//   速くスクロールしたときは、カードが進む向きに少し傾きます（スクロールの「速さ」を使う）。
// ・正面のカードを押すと、くるっと裏返って、裏に作品の説明が書いてあります。
//   （友人のサイトの「スクロールで回る・カードを押すと裏返る」という仕組みを参考にしました。見た目はこのサイトの板のままです）
// ・スクロールのたびに React で描き直すと重いので、カードの transform だけを直接書き換えています。
//   動かすのは transform と opacity だけなので、ブラウザは描き直さずに済み、なめらかに動きます。
// ・「動きを減らす」設定の人には、画面を留めず、矢印ボタンでパッと切り替える形にします。

const STEP_PX = 520; // 作品 1 つ分回すのに必要なスクロール量（px）

// 「正面から何枚ずれているか」を、ぐるっと回った近いほうで数える（小数でも OK）。
// 例：作品が 5 つで正面が 0 番のとき、4 番は「+4 枚」ではなく「-1 枚（左となり）」
function ringOffset(i: number, pos: number, n: number) {
  let d = (((i - pos) % n) + n) % n;
  if (d > n / 2) d -= n;
  return d;
}

// 作品 1 つ分のスクロールのうち、正面に来たあたりでは「ゆっくり」、間では「速め」に回す。
// 完全には止めないので、カクッとせず、ずっとぬるっと動き続ける（サイン波で速さに強弱を付けている）
function hold(t: number) {
  return t - (Math.sin(2 * Math.PI * t) / (2 * Math.PI)) * 0.85;
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

export default function WorkCarousel({ works }: { works: Work[] }) {
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
    const lean = Math.max(-8, Math.min(8, vel * 90)); // 傾き（度）
    const squeeze = 1 - Math.min(0.06, Math.abs(vel) * 0.8); // 速いときは少しだけ縮める
    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const o = ringOffset(i, pos, n);
      const a = Math.abs(o);
      const hidden = a > 2.4;
      el.style.transform = `translate3d(0, 0, 0) translateX(${o * 80}%) translateZ(${a * -260}px) rotateY(${Math.max(-2, Math.min(2, o)) * 30 - lean}deg) rotateZ(${lean * 0.25}deg) scale(${squeeze})`;
      el.style.opacity = String(hidden ? 0 : a <= 1 ? 1 - a * 0.3 : 0.7 - (a - 1) * 0.5);
      el.style.zIndex = String(10 - Math.round(a * 2));
      el.style.visibility = hidden ? "hidden" : "";
    });
    const near = ((Math.round(pos) % n) + n) % n;
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
    const total = track.offsetHeight - window.innerHeight; // 留まっている間にスクロールできる量
    const scrolled = Math.min(total, Math.max(0, -track.getBoundingClientRect().top));
    const p = total > 0 ? (scrolled / total) * (n - 1) : 0;
    const seg = Math.min(n - 2, Math.floor(p));
    return seg + hold(p - seg);
  };

  // i 番目の作品が正面に来るスクロール位置
  const scrollTopFor = (i: number) => {
    const track = trackRef.current;
    if (!track) return 0;
    const total = track.offsetHeight - window.innerHeight;
    return window.scrollY + track.getBoundingClientRect().top + (n > 1 ? (i / (n - 1)) * total : 0);
  };

  // i 番目の作品へ回す（矢印ボタン・下の線・キーボード）
  const go = (i: number) => {
    if (pinned) {
      const to = Math.min(n - 1, Math.max(0, i));
      window.scrollTo({ top: scrollTopFor(to), behavior: "smooth" });
    } else {
      staticPos.current = ((i % n) + n) % n;
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
      style={pinned ? { height: `calc(100svh + ${(n - 1) * STEP_PX}px)` } : undefined}
    >
      <div className={pinned ? "sticky top-0 flex h-svh flex-col justify-center pt-20" : ""}>
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
