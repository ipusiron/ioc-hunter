import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

// theme-init.js を、保存値と OS 設定を差し替えた仮の window で動かし、dark-mode が付くかを返す。
function run({ saved = null, prefersDark = false, storageThrows = false } = {}) {
  const classes = new Set();
  const window = {
    localStorage: { getItem: () => { if (storageThrows) throw new Error('blocked'); return saved; } },
    matchMedia: () => ({ matches: prefersDark }),
    document: { documentElement: { classList: { add: c => classes.add(c) } } },
  };
  vm.runInNewContext(read('js/theme-init.js'), { window });
  return classes.has('dark-mode');
}

test('保存値がなければ OS の設定に従う', () => {
  assert.equal(run({ prefersDark: true }), true);
  assert.equal(run({ prefersDark: false }), false);
});

test('保存値は OS の設定より優先する', () => {
  assert.equal(run({ saved: 'false', prefersDark: true }), false);
  assert.equal(run({ saved: 'true', prefersDark: false }), true);
});

test('"true" 以外の保存値はライトとして扱う', () => {
  assert.equal(run({ saved: 'dark', prefersDark: true }), false);
});

test('localStorage が使えなくても落ちず、OS の設定に従う', () => {
  assert.equal(run({ storageThrows: true, prefersDark: true }), true);
  assert.equal(run({ storageThrows: true, prefersDark: false }), false);
});

test('index.html の <head> で、stylesheet のあとに同期で読み込む', () => {
  const html = read('index.html');
  const head = html.slice(0, html.indexOf('</head>'));
  assert.ok(head.includes('<script src="js/theme-init.js"></script>'), '<head> に theme-init.js がない');
  assert.ok(head.indexOf('css/style.css') < head.indexOf('js/theme-init.js'));
});

test('ダークの CSS と JS は <html> のクラスを見る', () => {
  assert.doesNotMatch(read('css/style.css'), /body\.dark-mode/);
  assert.match(read('css/style.css'), /^html\.dark-mode body \{/m);
  for (const name of ['js/darkModeHandler.js', 'js/chartRenderer.js']) {
    assert.doesNotMatch(read(name), /body\.classList[^\n]*dark-mode/, name);
  }
  assert.doesNotMatch(read('js/darkModeHandler.js'), /prefers-color-scheme: dark\)'\)\.matches/);
});
