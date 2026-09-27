import test from 'node:test';
import assert from 'node:assert/strict';
import { csvCell, ExportHandler } from '../js/exportHandler.js';
import { scan, statsFromMatches } from '../js/scanner.js';

test('E-1/E-2 RFC4180 all cells quoted, formula protection', () => {
  assert.equal(csvCell('a"b'), '"a""b"');
  assert.equal(csvCell('a\nb'), '"a\nb"');
  assert.equal(csvCell('=1+1'), '"\'=1+1"');
  for (const value of ['+7', '-7', '@SUM(1)', '\tx', '\rx']) assert.equal(csvCell(value), '"\'' + value + '"');
  assert.equal(csvCell('normal'), '"normal"');
  assert.equal(csvCell(3), '"3"');
});

test('E-3/E-4 normalized values and URL hosts; only CSV has BOM', () => {
  const exporter = new ExportHandler();
  const stats = statsFromMatches(scan('hxxps://evil[.]com/a user@example.com CVE-2021-44228'));
  exporter.setStats(stats);
  const normal = JSON.parse(exporter.export('json').content);
  assert.deepEqual(normal.iocs.url.items, [{ value: 'https://evil.com/a', host: 'evil.com' }]);
  const safe = JSON.parse(exporter.export('json', true).content);
  assert.deepEqual(safe.iocs.url.items, [{ value: 'hxxps://evil[.]com/a', host: 'evil[.]com' }]);
  assert.deepEqual(safe.iocs.email.items, ['user[@]example[.]com']);
  assert.deepEqual(safe.iocs.cve.items, ['CVE-2021-44228']);
  assert.deepEqual(safe.summary, normal.summary);
  for (const format of ['json', 'txt', 'csv']) {
    const content = exporter.export(format, true).content;
    assert.match(content, /hxxps:\/\/evil\[\.\]com\/a/);
    assert.equal(content.startsWith('\uFEFF'), format === 'csv');
  }
});
