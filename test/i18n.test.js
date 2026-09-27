import test from 'node:test';
import assert from 'node:assert/strict';
import { read, loadI18n } from './helper.js';
import { ExportHandler } from '../js/exportHandler.js';
import { FileHandler } from '../js/fileHandler.js';

const I18n = loadI18n();
const html = read('index.html');
const JP = /[぀-ヿ一-鿿]/;
const SCRIPTS = ['js/script.js', 'js/uiController.js', 'js/iocAnalyzer.js', 'js/tabManager.js',
  'js/chartRenderer.js', 'js/helpModal.js', 'js/exportHandler.js', 'js/fileHandler.js',
  'js/analysisEngine.js', 'js/whitelistManager.js', 'js/darkModeHandler.js'];

/** data-i18n="..." / data-i18n-aria-label="..." などに書かれたキーを全部集める */
function keysInHtml() {
  const found = new Set();
  for (const m of html.matchAll(/data-i18n(?:-[a-z-]+)?="([^"]+)"/g)) found.add(m[1]);
  return [...found];
}

/**
 * t("...") / descriptionKey: "..." / ヘルパーに渡す "helpDoc.xxx" を集める。
 * 名前空間は辞書から作るので、後ろの綴りを間違えたときに落ちる。
 */
function keysInScripts() {
  const spaces = [...new Set(Object.keys(I18n.ja).map(key => key.split('.')[0]))];
  const namespaced = new RegExp(`['"]((?:${spaces.join('|')})\\.[\\w.]*[\\w])['"]`, 'g');
  const found = new Set();
  for (const name of SCRIPTS) {
    const source = read(name);
    for (const m of source.matchAll(/\bt\(\s*['"]([a-zA-Z][\w.]*[\w])['"]/g)) found.add(m[1]);
    for (const m of source.matchAll(/(?:Key|key):\s*['"]([a-zA-Z][\w.]*[\w])['"]/g)) found.add(m[1]);
    for (const m of source.matchAll(namespaced)) found.add(m[1]);
  }
  return [...found];
}

test('日本語と英語で、キーの集合が同じ', () => {
  const ja = Object.keys(I18n.ja).sort();
  const en = Object.keys(I18n.en).sort();
  assert.deepEqual(ja.filter(key => !(key in I18n.en)), [], '英語に無いキーがある');
  assert.deepEqual(en.filter(key => !(key in I18n.ja)), [], '日本語に無いキーがある');
  assert.equal(ja.length, en.length);
});

test('差し込みの名前が、日本語と英語で一致する', () => {
  const holes = value => [...String(value).matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',');
  const mismatched = Object.keys(I18n.ja).filter(key => holes(I18n.ja[key]) !== holes(I18n.en[key]));
  assert.deepEqual(mismatched, []);
});

test('index.html が指すキーは、すべて辞書にある', () => {
  assert.ok(keysInHtml().length >= 35);
  assert.deepEqual(keysInHtml().filter(key => !(key in I18n.ja)), []);
});

test('スクリプトが呼ぶキーは、すべて辞書にある', () => {
  assert.ok(keysInScripts().length >= 40);
  assert.deepEqual(keysInScripts().filter(key => !(key in I18n.ja)), []);
});

test('辞書に、日本語のまま残った英語訳がない', () => {
  // 言語の切り替えボタンだけは、相手の言語を出すのが正しい
  const expected = new Set(['app.langButton']);
  assert.deepEqual(Object.keys(I18n.en)
    .filter(key => !expected.has(key) && JP.test(I18n.en[key])), []);
});

test('t() は差し込みを埋める。知らないキーは黙って通さない', () => {
  assert.equal(I18n.t('stats.item', { total: 6, unique: 3 }), '6 件（ユニーク: 3 件）');
  assert.equal(I18n.t('timeline.line', { line: 12 }), '行 12');
  // 知らない差し込み名はそのまま残し、文を壊さない
  assert.equal(I18n.t('timeline.line', {}), '行 {line}');
  assert.throws(() => I18n.t('no.such.key'), /Unknown message/);
});

test('切り替えボタンのIDは langToggle で、i18n.js を先に読み込む', () => {
  assert.match(html, /id="langToggle"[^>]*data-i18n="app\.langButton"/);
  assert.ok(html.indexOf('js/i18n.js') < html.indexOf('js/script.js'));
  assert.match(html, /<script src="js\/i18n\.js"><\/script>/);
});

test('JSが書き込むスロットには data-i18n を付けない', () => {
  // 結果が出ている状態で言語を変えたときに、初期文言へ巻き戻るのを防ぐ
  for (const id of ['analysisStatus', 'statsArea', 'outputArea', 'analysisArea',
    'timelineArea', 'helpContent', 'whitelistDisplay']) {
    assert.doesNotMatch(html, new RegExp(`id="${id}"[^>]*data-i18n`), id);
  }
});

test('子要素を持つ要素に data-i18n を付けていない', () => {
  const pattern = /<(\w+)[^>]*data-i18n="[^"]+"[^>]*>([\s\S]*?)<\/\1\s*>/g;
  for (const [, tag, inner] of html.matchAll(pattern)) {
    assert.doesNotMatch(inner, /</, tag + ': ' + inner.slice(0, 40));
  }
});

test('noscript は日英を1つのテキストノードで併記する', () => {
  const inner = html.match(/<noscript>([^<]+)<\/noscript>/)[1];
  assert.ok(JP.test(inner), '日本語がない');
  assert.match(inner, /Enable JavaScript/);
});

test('純ロジックと辞書以外に、和文の文字列が残っていない', () => {
  // コメントは日本語のままでよいので、コメントを取り除いてから見る
  const strip = source => source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  for (const name of [...SCRIPTS, 'js/config.js', 'js/scanner.js', 'js/timeline.js']) {
    const lines = strip(read(name)).split('\n').filter(line => JP.test(line));
    assert.deepEqual(lines, [], name);
  }
});

test('scanner.js と timeline.js には和文もi18nも入れない', () => {
  for (const name of ['js/scanner.js', 'js/timeline.js', 'data/tlds.js']) {
    const source = read(name);
    assert.doesNotMatch(source, JP, name);
    assert.doesNotMatch(source, /I18n/, name);
  }
});

test('i18n.js はDOMと辞書だけを持ち、走査のロジックを持たない', () => {
  const source = read('js/i18n.js');
  assert.match(source, /const STORAGE_KEY = 'ioc-hunter-language';/);
  // ストレージが使えない環境でも init が落ちないようにする
  assert.equal([...source.matchAll(/try \{ [^}]*localStorage/g)].length, 2);
  assert.doesNotMatch(source, /PATTERNS|scan\(/);
});

test('サンプル一覧は日英2列を持ち、英語側に和文が残っていない', () => {
  const lines = read('samples/list.txt').split(/\r?\n/).filter(Boolean);
  assert.equal(lines.length, 6);
  for (const line of lines) {
    const [filename, ja, en] = line.split(':');
    assert.match(filename, /\.(?:txt|log)$/);
    assert.ok(ja, line);
    assert.ok(en, 'englishが無い: ' + line);
    assert.doesNotMatch(en, JP, line);
  }
});

test('エクスポートの見出しは言語に追従する', () => {
  const stats = { cve: { total: 1, unique: 1, items: ['CVE-2021-44228'] } };
  const plain = new ExportHandler();
  plain.setStats(stats);
  // i18n を渡さなければキーがそのまま出る（Nodeのテストから読めるようにするため）
  assert.match(plain.export('csv').content, /"file\.csvHeader\.type"/);

  const exporter = new ExportHandler(I18n);
  exporter.setStats(stats);
  assert.match(exporter.export('csv').content, /"IOCタイプ"/);
  assert.match(exporter.export('txt').content, /IOC抽出結果/);
  exporter.currentStats = null;
  assert.throws(() => exporter.export('json'), /エクスポートするデータがありません/);
  exporter.setStats(stats);
  assert.throws(() => exporter.export('xml'), /サポートされていない形式です/);
});

test('ファイル読み込みの失敗メッセージも辞書を通る', async () => {
  const handler = new FileHandler(I18n);
  assert.equal(handler.validateFile({ name: 'x.exe', size: 1 }).messageKey, 'error.invalidFileType');
  assert.equal(handler.validateFile({ name: 'x.log', size: 1e9 }).messageKey, 'error.fileTooLarge');
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () => ({ ok: false, status: 404 });
    await assert.rejects(handler.loadSampleList(), /サンプル一覧を読み込めませんでした。/);
    await assert.rejects(handler.loadSampleFile('apache.txt'), /apache\.txt/);
  } finally {
    globalThis.fetch = original;
  }
});

test('READMEは日英で相互にリンクし、構造図に i18n.js と README.en.md がある', () => {
  const ja = read('README.md');
  const en = read('README.en.md');
  assert.match(ja, /^\[English\]\(README\.en\.md\) · 日本語$/m);
  assert.match(en, /^English · \[日本語\]\(README\.md\)$/m);
  // 言語リンクはYAMLコメントより後に置く（先頭に足すと readme.test.js が落ちる）
  assert.ok(ja.indexOf('[English](README.en.md)') > ja.indexOf('-->'));
  for (const name of ['i18n.js', 'README.en.md']) assert.ok(ja.includes(name), name);
  // 英語READMEの画像は日本語READMEと同じ実体を指す
  const images = [...en.matchAll(/!\[[^\]]*\]\((assets\/[^)]+)\)/g)].map(m => m[1]);
  assert.deepEqual(images,
    ['assets/screenshot.png', 'assets/screenshot3.png', 'assets/screenshot4.png']);
  // 英語版に和文が残るのは、日本語版へのリンクの行だけである
  assert.deepEqual(en.split(/\r?\n/).filter(line => JP.test(line)),
    ['English · [日本語](README.md)']);
});
