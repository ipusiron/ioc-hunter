import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { scan } from '../js/scanner.js';

const root = new URL('../', import.meta.url);
const readme = readFileSync(new URL('README.md', root), 'utf8');

test('README identity and ordered block-style metadata are preserved', () => {
  const yaml = readme.match(/^<!--\r?\n---\r?\n([\s\S]+?)\r?\n---\r?\n-->/)?.[1];
  assert.ok(yaml);
  const keys = [...yaml.matchAll(/^(\w+):/gm)].map(m => m[1]);
  assert.deepEqual(keys, ['id', 'slug', 'title', 'subtitle_ja', 'subtitle_en', 'description_ja',
    'description_en', 'category_ja', 'category_en', 'difficulty', 'tags', 'repo_url', 'demo_url', 'hub']);
  for (const key of ['category_ja', 'category_en', 'tags']) assert.ok(yaml.includes(key + ':\n  - '));
  for (const line of ['id: day016', 'slug: ioc-hunter', 'hub: true',
    'repo_url: "https://github.com/ipusiron/ioc-hunter"', 'demo_url: "https://ipusiron.github.io/ioc-hunter/"']) {
    assert.ok(yaml.split('\n').includes(line), line);
  }
  assert.match(readme, /\*\*Day016 -/);
});

test('All 12 IOC table rows and 13 examples are actually detected', () => {
  const section = readme.split('## 📋 検出可能なIOCタイプ')[1].split('\n---')[0];
  const rows = [...section.matchAll(/^\| (\w+) \|[^\n]+/gm)];
  assert.equal(rows.length, 12);
  let count = 0;
  const types = { Domain: 'domain', Email: 'email', Hash: 'hash', URL: 'url', FilePath: 'filePath',
    RegistryKey: 'registryKey', Bitcoin: 'bitcoin', CVE: 'cve', MITRE: 'mitre', Flag: 'flag',
    IPv4: 'ipv4', IPv6: 'ipv6' };
  for (const [, label, ...unused] of rows) {
    const row = rows.find(r => r[1] === label)[0];
    for (const [, example] of row.matchAll(/`([^`]+)`/g)) {
      const matches = scan(example);
      assert.equal(matches.length, 1, example);
      assert.equal(matches[0].type, types[label]);
      assert.equal(matches[0].raw, example);
      count++;
    }
  }
  assert.equal(count, 13);
});

test('README flag and defang examples are verified with nonzero counts', () => {
  const flags = readme.split('**検出例**')[1].match(/```\n([\s\S]+?)\n```/)[1].split('\n');
  assert.equal(flags.length, 7);
  for (const flag of flags) assert.equal(scan(flag)[0]?.type, 'flag', flag);
  const rows = [...readme.matchAll(/^\| `([^`]+)` \| (ipv4|domain|email|url) \| `([^`]+)` \|$/gm)];
  assert.equal(rows.length, 8);
  for (const [, input, type, value] of rows) {
    assert.deepEqual(scan(input).map(m => [m.type, m.value]), [[type, value]]);
  }
});

test('All three relative README screenshots exist', () => {
  const images = [...readme.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)].map(m => m[1]);
  const local = images.filter(path => !/^https?:/.test(path));
  assert.deepEqual(local, ['assets/screenshot.png', 'assets/screenshot3.png', 'assets/screenshot4.png']);
  for (const path of local) assert.ok(existsSync(new URL(path, root)), path);
});

test('Use-case examples unique to this tool match scan() and defang() in both READMEs', async () => {
  const { defang } = await import('../js/scanner.js');
  const en = readFileSync(new URL('README.en.md', root), 'utf8');
  const code = (text, start) => text.slice(text.indexOf('`', text.indexOf(start)) + 1).split('`')[0];
  const found = text => scan(text).map(m => m.type + ':' + m.value);
  const path = String.raw`C:\Users\taro\Desktop\debug.log`;
  const leak = ['ipv4:10.0.5.23', 'filePath:' + path, 'email:admin@corp.example.jp'];
  assert.deepEqual(found(code(readme, '公開前の原稿から')), leak);
  assert.deepEqual(found(code(en, 'Finding internal details')), leak);
  const refs = ['cve:CVE-2021-44228', 'mitre:T1190', 'cve:CVE-2021-45046'];
  assert.deepEqual(found(code(readme, 'CVE番号とATT&CKの技術IDを一覧')), refs);
  assert.deepEqual(found(code(en, 'Listing the CVE numbers')), refs);
  const defanged = 'hxxps://login-check[.]example[.]com/verify';
  const [hit] = scan(defanged);
  assert.deepEqual([hit.type, hit.value], ['url', 'https://login-check.example.com/verify']);
  assert.equal(defang(hit.value, hit.type), defanged);
  for (const text of [readme, en]) assert.ok(text.includes('`' + defanged + '`') && text.includes('`' + hit.value + '`'));
});
