import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const files = ['index.html', 'css/style.css', 'data/tlds.js',
  ...['js', 'test'].flatMap(dir => readdirSync(new URL(dir + '/', root))
    .filter(name => name.endsWith('.js')).map(name => dir + '/' + name))];

test('Readable source line lengths and non-minified principal files', () => {
  for (const path of files) {
    const lines = readFileSync(new URL(path, root), 'utf8').split(/\r?\n/);
    const limit = path.endsWith('.html') ? 250 : 160;
    for (const [index, line] of lines.entries()) {
      assert.ok([...line].length <= limit, path + ':' + (index + 1) + ' length=' + [...line].length);
    }
  }
  for (const [path, minimum] of Object.entries({
    'css/style.css': 600, 'index.html': 150, 'js/script.js': 150,
    'js/scanner.js': 100, 'js/analysisEngine.js': 200, 'js/i18n.js': 300
  })) {
    assert.ok(readFileSync(new URL(path, root), 'utf8').split('\n').length >= minimum, path);
  }
});
