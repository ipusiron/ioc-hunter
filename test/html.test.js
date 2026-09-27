import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { FileHandler } from '../js/fileHandler.js';

test('File size boundaries and unsuccessful sample responses are rejected', async () => {
  const handler = new FileHandler();
  assert.equal(handler.validateFile({ name: 'sample.log', size: 20 * 1024 * 1024 }).valid, true);
  assert.equal(handler.validateFile({ name: 'sample.log', size: 20 * 1024 * 1024 + 1 }).valid, false);
  assert.equal(handler.validateFile({ name: 'sample.exe', size: 1 }).valid, false);
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () => ({ ok: false, status: 404 });
    await assert.rejects(handler.loadSampleList(), /サンプル一覧/);
    await assert.rejects(handler.loadSampleFile('apache.txt'), /読み込み/);
    await assert.rejects(handler.loadSampleFile('../README.md'), /無効/);
  } finally {
    globalThis.fetch = original;
  }
});

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const html = read('index.html');

test('HTML security, local modules, accessibility and stable IDs', () => {
  const csp = html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)[1];
  for (const value of ["default-src 'self'", "script-src 'self'", "style-src 'self'",
    "img-src 'self' data:", "font-src 'self'", "connect-src 'self'", "object-src 'none'",
    "base-uri 'self'", "form-action 'self'"]) assert.ok(csp.includes(value), value);
  assert.doesNotMatch(csp, /unsafe-inline|unsafe-eval|frame-ancestors/);
  assert.match(html, /name="referrer" content="no-referrer"/);
  assert.match(html, /<noscript>/);
  assert.match(html, /<script type="module" src="js\/script.js"><\/script>/);
  assert.doesNotMatch(html, /\son\w+\s*=|\sstyle\s*=|<style\b/i);
  assert.doesNotMatch(html, /<(?:script|link|img)[^>]+(?:src|href)="https?:/i);
  for (const role of ['tablist', 'tab', 'tabpanel', 'dialog']) assert.ok(html.includes('role="' + role + '"'));
  assert.equal([...html.matchAll(/role="tab"/g)].length, 4);
  assert.equal([...html.matchAll(/role="tabpanel"/g)].length, 4);
  assert.equal([...html.matchAll(/aria-selected=/g)].length, 4);
  assert.equal([...html.matchAll(/aria-controls=/g)].length, 4);
  assert.match(html, /aria-modal="true"/);
  assert.match(html, /aria-live="polite"/);
  for (const id of ['inputText', 'outputArea', 'statsArea', 'helpModal', 'analyzeButton',
    'resultsSection', 'defangOutput', 'whitelistInput', 'downloadButton', 'analysisStatus']) {
    assert.ok(html.includes('id="' + id + '"'), id);
  }
  for (const link of html.matchAll(/<a\b[^>]*href="https?:[^>]*>/g)) {
    assert.match(link[0], /rel="noopener noreferrer"/);
  }
});

test('No dependencies, exact package contract, mandatory CI', () => {
  assert.deepEqual(JSON.parse(read('package.json')), {
    name: 'ioc-hunter', private: true, type: 'module', scripts: { test: 'node --test' }
  });
  const workflow = read('.github/workflows/test.yml');
  for (const value of ['push', 'pull_request', 'contents: read', 'node-version: 22', 'npm test']) {
    assert.ok(workflow.includes(value), value);
  }
  assert.doesNotMatch(read('js/script.js'), /console\.log/);
  assert.match(read('.gitignore'), /\*\.log\r?\n!samples\/\*\.log/);
});
