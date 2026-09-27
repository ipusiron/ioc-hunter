import test from 'node:test';
import assert from 'node:assert/strict';
import { TLDS, TLD_LIST_VERSION, TLD_LIST_UPDATED } from '../data/tlds.js';

test('A-1 immutable IANA snapshot shape', () => {
  assert.equal(TLDS.size, 1438);
  assert.equal(TLD_LIST_VERSION, '2026092000');
  assert.equal(TLD_LIST_UPDATED, '2026-09-20');
  for (const tld of TLDS) assert.match(tld, /^[A-Z0-9-]+$/);
  for (const tld of ['COM', 'JP', 'SH', 'MD', 'PY', 'ZIP']) assert.ok(TLDS.has(tld));
  for (const tld of ['LOCAL', 'SERVICE', 'EXE', 'JS']) assert.ok(!TLDS.has(tld));
});
