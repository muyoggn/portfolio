// =============================================================
// ライト / ダークモードを「時間帯」で自動的に切り替えるための設定と計算です。
//
//   auto  … 見ている人のパソコン・スマホの時計を見て、昼はライト、夜はダーク
//   light … いつでもライト（ヘッダーのボタンで選んだとき）
//   dark  … いつでもダーク（同上）
//
// 選んだモードはブラウザの localStorage（小さな保存場所）に覚えておくので、
// 次に開いたときも同じモードになります。
// =============================================================

// 何時から何時までを「昼（ライトモード）」にするか。好みで変えて OK です
export const DAY_START = 6; // 朝 6:00 からライト
export const NIGHT_START = 18; // 夕方 18:00 からダーク

export type ThemeMode = "auto" | "light" | "dark";
export type Theme = "light" | "dark";

export const STORAGE_KEY = "theme-mode";

// いまの時刻から、昼ならライト・夜ならダークを返す
export function themeByTime(date = new Date()): Theme {
  const h = date.getHours();
  return h >= DAY_START && h < NIGHT_START ? "light" : "dark";
}

export function resolveTheme(mode: ThemeMode): Theme {
  return mode === "auto" ? themeByTime() : mode;
}

// <html data-theme="dark"> のように、ページのいちばん外側に今のテーマを書き込む。
// CSS 側（globals.css）はこの印を見て色を切り替えます。
export function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  root.dataset.theme = resolveTheme(mode);
  root.dataset.themeMode = mode;
}

// ページが表示される「前」に実行する小さなスクリプト（layout.tsx の <head> に埋め込む）。
// React の部品が動き出すのを待ってから色を変えると、一瞬白い画面が見えてチラつくため、
// HTML を読み込んだ直後に、ここで先に色を決めてしまいます。
export const themeInitScript = `(function(){try{
var m=localStorage.getItem(${JSON.stringify(STORAGE_KEY)});
if(m!=="light"&&m!=="dark")m="auto";
var h=new Date().getHours();
var t=m==="auto"?(h>=${DAY_START}&&h<${NIGHT_START}?"light":"dark"):m;
var r=document.documentElement;r.dataset.theme=t;r.dataset.themeMode=m;
}catch(e){}})();`;
