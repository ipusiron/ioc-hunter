import { CONFIG, escapeHtml } from './config.js';
import { TLDS } from '../data/tlds.js';

export const PRIORITY = [
  'url', 'email', 'filePath', 'registryKey', 'ipv6', 'ipv4',
  'hash', 'bitcoin', 'cve', 'mitre', 'flag', 'domain'
];
const NETWORK_TYPES = new Set(['ipv4', 'ipv6', 'domain', 'email', 'url']);

export function refang(text) {
  if (typeof text !== 'string') return '';
  return text.replace(/\[\.\]|\(\.\)|\{\.\}/g, '.')
    .replace(/\[@\]|\(@\)|\[at\]/gi, '@')
    .replace(/\[:\/\/\]|\[:\]\/\//g, '://')
    .replace(/^hxxp(s?):/i, 'http$1:');
}

export function defang(value, type) {
  if (!NETWORK_TYPES.has(type)) return value;
  return value.replace(/\./g, '[.]').replace(/@/g, '[@]').replace(/^http(s?):/i, 'hxxp$1:');
}

export function isIPv4(value) {
  return /^(?:\d{1,3}\.){3}\d{1,3}$/.test(value)
    && value.split('.').every(part => Number(part) <= 255 && (part === '0' || !part.startsWith('0')));
}

export function isIPv6(value) {
  let address = value.split('%')[0];
  if (value.includes('%') && !/^[\w.-]+$/.test(value.slice(value.indexOf('%') + 1))) return false;
  if (address.includes('.')) {
    const colon = address.lastIndexOf(':');
    if (!isIPv4(address.slice(colon + 1))) return false;
    address = address.slice(0, colon + 1) + '0:0';
  }
  if (!/^[a-f\d:]+$/i.test(address)) return false;
  const halves = address.split('::');
  if (halves.length > 2) return false;
  const groups = halves.flatMap(half => half ? half.split(':') : []);
  if (!groups.every(part => /^[a-f\d]{1,4}$/i.test(part))) return false;
  return halves.length === 2 ? groups.length < 8 : groups.length === 8;
}

export function isDomain(value) {
  if (value.length > 253) return false;
  const labels = value.split('.');
  return labels.length >= 2 && TLDS.has(labels.at(-1).toUpperCase())
    && labels.every(label => /^[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?$/i.test(label));
}

export function urlHost(value) {
  // Validate the original authority before URL can normalize an invalid numeric IP.
  const authority = value.match(/^[a-z][a-z\d+.-]*:\/\/([^/?#]+)/i)?.[1];
  if (!authority) return null;
  const hostPort = authority.slice(authority.lastIndexOf('@') + 1);
  const host = hostPort.startsWith('[') ? hostPort.slice(1, hostPort.indexOf(']')) : hostPort.split(':')[0];
  if (!(isIPv4(host) || isIPv6(host) || isDomain(host))) return null;
  try {
    new URL(value.replace(/%[\w.-]+(?=\])/, ''));
    return host.toLowerCase();
  } catch {
    return null;
  }
}

function valid(type, value) {
  if (type === 'ipv4') return isIPv4(value);
  if (type === 'ipv6') return isIPv6(value);
  if (type === 'domain') return isDomain(value);
  if (type === 'email') return isDomain(value.slice(value.lastIndexOf('@') + 1));
  if (type === 'url') return urlHost(value) !== null;
  if (type === 'filePath' && value.startsWith('\\\\')) return /^\\\\[^\\]+\\[^\\]+/.test(value);
  return true;
}

function trimUrl(raw) {
  let value = raw.replace(/[.,;!?:。、，；！？]+$/u, '');
  // Keep balanced parentheses (and defang punctuation), discard prose closing punctuation.
  for (const [open, close] of [['(', ')'], ['[', ']'], ['{', '}']]) {
    while (value.endsWith(close) && value.split(close).length > value.split(open).length) value = value.slice(0, -1);
  }
  return value;
}

export function scan(text) {
  if (typeof text !== 'string') return [];
  const candidates = [];
  for (const type of PRIORITY) {
    const regex = new RegExp(CONFIG.PATTERNS[type]);
    for (const match of text.matchAll(regex)) {
      const raw = type === 'url' ? trimUrl(match[0]) : match[0];
      const value = NETWORK_TYPES.has(type) ? refang(raw) : raw;
      if (!valid(type, value)) continue;
      candidates.push({ type, start: match.index, end: match.index + raw.length, raw, value });
    }
  }
  candidates.sort((a, b) => a.start - b.start || b.end - a.end || PRIORITY.indexOf(a.type) - PRIORITY.indexOf(b.type));
  const matches = [];
  let end = 0;
  let cursor = 0;
  let line = 1;
  for (const match of candidates) {
    if (match.start < end) continue;
    while (cursor < match.start) {
      if (text[cursor] === '\n') line++;
      cursor++;
    }
    matches.push({ ...match, line });
    end = match.end;
  }
  return matches;
}

export function statsFromMatches(matches, allMatches = matches) {
  const stats = Object.fromEntries(Object.keys(CONFIG.PATTERNS).map(type => [type, {
    total: 0, unique: 0, items: [], filtered: 0
  }]));
  const sets = new Map(Object.keys(stats).map(type => [type, new Set()]));
  for (const match of allMatches) stats[match.type].filtered++;
  for (const match of matches) {
    stats[match.type].total++;
    stats[match.type].filtered--;
    sets.get(match.type).add(match.value);
  }
  for (const [type, values] of sets) {
    stats[type].items = [...values];
    stats[type].unique = values.size;
  }
  return stats;
}

export function highlightMatches(text, matches) {
  if (typeof text !== 'string') return '';
  const parts = [];
  let end = 0;
  for (const match of matches) {
    parts.push(escapeHtml(text.slice(end, match.start)));
    const attributes = `class="ioc ${match.type}" data-value="${escapeHtml(match.value)}"`;
    parts.push(`<span ${attributes}>${escapeHtml(text.slice(match.start, match.end))}</span>`);
    end = match.end;
  }
  parts.push(escapeHtml(text.slice(end)));
  return parts.join('');
}
