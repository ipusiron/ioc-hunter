import test from 'node:test';
test('All IPv6 forms including unspecified and defanged IPv4 tail round trip', () => {
  for (const value of ['::', '::1', '2001:db8::', 'fe80::1%eth0', '::ffff:192.0.2.1']) {
    assert.deepEqual(scan(defang(value, 'ipv6')).map(m => [m.type, m.value]), [['ipv6', value]]);
  }
});
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { scan, highlightMatches, statsFromMatches, defang } from '../js/scanner.js';
import { IOCAnalyzer } from '../js/iocAnalyzer.js';
import { AnalysisEngine } from '../js/analysisEngine.js';

test('B-3 overlaps select a single enclosing match', () => {
  for (const [text, type] of [['https://example.com/path', 'url'], ['user@example.com', 'email'],
    ['/tmp/.hidden/backdoor.sh', 'filePath'], ['http://192.168.1.100:8080/beacon', 'url']]) {
    assert.equal(scan(text).length, 1);
    assert.equal(scan(text)[0].type, type);
  }
});

const decode = text => text.replace(/&(?:amp|lt|gt|quot|#39);/g, value => ({
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'"
})[value]);
test('B-5 all six samples recover byte-for-byte text, balanced nonnested spans', () => {
  for (const file of ['advanced_ioc.txt', 'apache.txt', 'auth.log', 'dns.log', 'mail.log', 'proxy.log']) {
    const text = readFileSync(new URL('../samples/' + file, import.meta.url), 'utf8');
    const matches = scan(text);
    const html = highlightMatches(text, matches);
    assert.equal([...html.matchAll(/<span /g)].length, matches.length);
    assert.equal([...html.matchAll(/<\/span>/g)].length, matches.length);
    assert.doesNotMatch(html, /<span [^>]+>(?:(?!<\/span>)[\s\S])*<span /);
    assert.equal(decode(html.replace(/<\/?span\b[^>]*>/g, '')), text);
    for (const match of matches) assert.equal(text.slice(match.start, match.end), match.raw);
  }
});

const cases = [
  ['192[.]168[.]1[.]1', 'ipv4', '192.168.1.1'], ['evil[.]com', 'domain', 'evil.com'],
  ['evil(.)com', 'domain', 'evil.com'], ['evil{.}com', 'domain', 'evil.com'],
  ['user[@]example[.]com', 'email', 'user@example.com'], ['hxxp://evil.com/a', 'url', 'http://evil.com/a'],
  ['hxxps://evil[.]com/payload.exe', 'url', 'https://evil.com/payload.exe'],
  ['sub[.]evil[.]co[.]jp', 'domain', 'sub.evil.co.jp'],
  ['user(@)example.com', 'email', 'user@example.com'], ['user[at]example.com', 'email', 'user@example.com'],
  ['hxxp[://]evil.com/a', 'url', 'http://evil.com/a'], ['https[:]//evil.com', 'url', 'https://evil.com']
];
for (const [raw, type, value] of cases) {
  test(`C-1/C-2 ${raw} and export round trip`, () => {
    assert.deepEqual(scan(raw), [{ type, start: 0, end: raw.length, raw, value, line: 1 }]);
    const round = scan(defang(value, type));
    assert.equal(round.length, 1);
    assert.equal(round[0].value, value);
    assert.equal(round[0].type, type);
  });
}

test('normalization unique count, positions, line index, safe HTML attributes', () => {
  const text = '😀evil[.]com\r\nevil.com <script>alert(1)</script> & "';
  const matches = scan(text);
  assert.deepEqual(matches.map(m => [m.start, m.line]), [[2, 1], [14, 2]]);
  const stats = statsFromMatches(matches);
  assert.equal(stats.domain.total, 2);
  assert.equal(stats.domain.unique, 1);
  assert.doesNotMatch(highlightMatches(text, matches), /<script/);
  assert.equal(decode(highlightMatches(text, matches).replace(/<\/?span\b[^>]*>/g, '')), text);
  const attack = 'https://example.com/&quot;onmouseover=1';
  assert.match(highlightMatches(attack, scan(attack)), /&amp;quot;/);
});

test('shared scan, normalized whitelist, exact repeats, bounded correlation generation', () => {
  const analyzer = new IOCAnalyzer();
  analyzer.setWhitelistManager({ isEnabled: () => true, contains: value => value === 'evil.com' });
  const result = analyzer.analyze('evil[.]com evil.com 192.0.2.1');
  assert.equal(result.stats.domain.filtered, 2);
  assert.equal(result.matches.length, 1);
  assert.equal((result.highlighted.match(/<span /g) || []).length, 1);
  const text = Array.from({ length: 220 }, (_, i) => `host${i}.com`).join(' ');
  const all = new IOCAnalyzer().analyze(text);
  const engine = new AnalysisEngine();
  engine.setData(text, all.stats, all.matches);
  assert.equal(engine.analyzeCorrelations().length, 20000);
  assert.equal(engine.truncated, true);
});
