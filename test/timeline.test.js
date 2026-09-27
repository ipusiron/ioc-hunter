import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { extractTimestamps } from '../js/timeline.js';

const samples = ['apache.txt', 'auth.log', 'dns.log', 'advanced_ioc.txt', 'mail.log', 'proxy.log'];
test('D-2 fixed keys, original text and 51 timestamps', () => {
  const expected = [
    ['[02/Jul/2025:10:00:01 +0900]', 1751418001000, true],
    ['Jul  2 10:05:01', 15761101000, false],
    ['02-Jul-2025 10:01:01.123', 1751450461123, true],
    ['2024-01-15 10:30:45', 1705314645000, true]
  ];
  for (const [raw, key, hasYear] of expected) {
    assert.deepEqual(extractTimestamps(raw), [{ raw, key, hasYear, start: 0 }]);
  }
  const timestamps = samples.map(name => extractTimestamps(readFileSync(new URL('../samples/' + name, import.meta.url), 'utf8')));
  assert.equal(timestamps.flat().length, 51);
  timestamps.slice(0, 4).forEach((items, i) => assert.equal(items[0].key, expected[i][1]));
  assert.equal(extractTimestamps('2024-01-15T19:30:45.123+09:00')[0].key, 1705314645123);
  assert.equal(extractTimestamps('2024-01-15T10:30:45Z')[0].key, 1705314645000);
  assert.deepEqual(extractTimestamps('2024-02-30 10:00:00'), []);
});

test('D-4 timezone independence in five genuinely different contexts', () => {
  const script = `
    import { readFileSync } from 'node:fs';
    import { extractTimestamps } from './js/timeline.js';
    const names = ${JSON.stringify(samples)};
    process.stdout.write(JSON.stringify({
      offset: new Date(2025, 6, 2).getTimezoneOffset(),
      results: names.map(name => extractTimestamps(readFileSync('samples/' + name, 'utf8')))
    }));`;
  const values = ['UTC', 'Asia/Tokyo', 'America/Los_Angeles', 'Pacific/Kiritimati', 'Europe/Paris'].map(TZ => {
    const child = spawnSync(process.execPath, ['--input-type=module', '-e', script], { env: { ...process.env, TZ }, encoding: 'utf8' });
    assert.equal(child.status, 0, child.stderr);
    return JSON.parse(child.stdout);
  });
  assert.equal(new Set(values.map(value => value.offset)).size, 5);
  values.forEach(value => assert.deepEqual(value.results, values[0].results));
  for (const name of ['timeline', 'scanner', 'analysisEngine', 'iocAnalyzer', 'config']) {
    const code = readFileSync(new URL('../js/' + name + '.js', import.meta.url), 'utf8');
    assert.doesNotMatch(code, /getHours|getMinutes|getTimezoneOffset|toLocale|new Date\([^)]*,/);
    assert.doesNotMatch(code, /new Date\(['"`]/);
  }
});
