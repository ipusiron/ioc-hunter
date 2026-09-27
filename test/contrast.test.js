import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../css/style.css', import.meta.url), 'utf8');
export function contrast(a, b) {
  const luminance = value => {
    const hex = value.replace('#', '');
    const full = hex.length === 3 ? [...hex].map(c => c + c).join('') : hex;
    const linear = [0, 2, 4].map(i => parseInt(full.slice(i, i + 2), 16) / 255)
      .map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
  };
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

test('All 12 IOC text/background pairs pass in both themes', () => {
  const rules = [...css.matchAll(/^(body\.dark-mode )?\.ioc\.(\w+)\s*\{\s*background: (#[\da-f]+); color: (#[\da-f]+);/gm)];
  assert.equal(rules.length, 24);
  for (const [, theme, type, background, color] of rules) {
    assert.ok(contrast(color, background) >= 4.5, (theme || 'light ') + type);
  }
});

test('Buttons, active tabs, links and excluded counts meet light contrast', () => {
  const cases = [
    ['#downloadButton', '#fff', null], ['#addWhitelistButton', '#fff', null],
    ['.tab-button.active', null, '#f9f9f9'], ['.footer a', null, '#f9f9f9'],
    ['.filtered-count', null, '#f9f9f9'],
    ...['critical', 'high', 'medium', 'low'].map(level => ['.value.risk-' + level, null, '#f8f9fa'])
  ];
  for (const [selector, foreground, background] of cases) {
    const rule = css.split(selector + ' {')[1].split('}')[0];
    const fg = foreground || rule.match(/\bcolor: (#[\da-f]+);/)[1];
    const bg = background || rule.match(/\bbackground: (#[\da-f]+);/)[1];
    assert.ok(contrast(fg, bg) >= 4.5, selector);
  }
});
