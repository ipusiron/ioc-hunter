/**
 * theme-init - 最初の描画の前にテーマを決める。<head> で同期読み込みする（module にしない）。
 *
 * style.css の既定はライトで、ダークは <html> の dark-mode クラスで切り替える。
 * この判定を module の script.js（DarkModeHandler）で行うと、ライトで描いたあとに
 * ダークへ切り替わって見える。
 *
 * 保存した選択（localStorage の ioc-hunter-dark-mode）があればそれに従い、"true" ならダーク、
 * それ以外の値はライトとする。保存がなければ OS の設定に従う。
 * localStorage が読めない環境でも落ちないよう try/catch で囲む。
 */
(function (global) {
  'use strict';

  var saved = null;
  try { saved = global.localStorage.getItem('ioc-hunter-dark-mode'); } catch (e) { /* 使えない環境でも続行 */ }

  var prefersDark = !!(global.matchMedia && global.matchMedia('(prefers-color-scheme: dark)').matches);
  var dark = saved === null ? prefersDark : saved === 'true';

  if (dark) global.document.documentElement.classList.add('dark-mode');
})(typeof window !== 'undefined' ? window : globalThis);
