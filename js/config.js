// Candidate patterns; semantic validation and overlap resolution live in scanner.js.
const DOT = String.raw`(?:\.|\[\.\]|\(\.\)|\{\.\})`;
const LABEL = '[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?';
const DOMAIN = `${LABEL}(?:${DOT}${LABEL})+`;
const OCTET = '(?:25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]?\\d)';
const IPV4 = `${OCTET}(?:${DOT}${OCTET}){3}`;
const ROOTS = 'etc|var|tmp|usr|home|opt|root|bin|sbin|lib|lib64|proc|dev|srv|mnt|media|boot|run'
  + '|Users|Applications|Library|System|private|Volumes';

export const CONFIG = {
  FILE: {
    MAX_SIZE_MB: 20,
    MAX_SIZE_BYTES: 20 * 1024 * 1024,
    ALLOWED_EXTENSIONS: ['.txt', '.log']
  },
  PATTERNS: {
    ipv4: new RegExp(`(?<![\\w.]|${DOT})${IPV4}(?![\\w.]|${DOT}\\d)`, 'g'),
    ipv6: /(?<![\w:])(?:[a-f\d.]|\[\.\]|\(\.\)|\{\.\})*:(?:[a-f\d:.]|\[\.\]|\(\.\)|\{\.\})*(?:%[\w.-]+)?(?![\w:])/gi,
    domain: new RegExp(`(?<![\\w.-])${DOMAIN}(?![\\w-])`, 'gi'),
    email: new RegExp(`(?<![\\w.+%-])[a-z0-9._%+-]+(?:@|\\[@\\]|\\(@\\)|\\[at\\])${DOMAIN}(?![\\w-])`, 'gi'),
    hash: /(?<![a-z\d])(?:[a-f\d]{128}|[a-f\d]{64}|[a-f\d]{40}|[a-f\d]{32})(?![a-z\d])/gi,
    url: /(?<![\w])(?:https?|hxxps?)(?::\/\/|\[:\/\/\]|\[:\]\/\/)[^\s<>"']+/gi,
    filePath: new RegExp(String.raw`(?:[A-Za-z]:\\|\\\\)[^\s<>"|?*]+|\/(?:${ROOTS})\/[^\s<>"'|;]+`, 'g'),
    registryKey: /(?:HKEY_(?:CLASSES_ROOT|CURRENT_USER|LOCAL_MACHINE|USERS|CURRENT_CONFIG)|HKLM|HKCU|HKCR|HKU|HKCC)(?:\\[^\\<>:"|?*\r\n]+)*/g,
    bitcoin: /\b(?:[13][a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[ac-hj-np-z02-9]{39,59})\b/g,
    cve: /(?<![a-z\d])CVE-\d{4}-\d{4,7}(?![a-z\d])/gi,
    mitre: /(?<![a-z\d])T\d{4}(?:\.\d{3})?(?![a-z\d.])/gi,
    flag: /\b(?:flag|ctf|picoctf|hackthebox|tryhackme|htb|thm)\{[^}\r\n]{0,256}\}/gi,
  },
  MESSAGES: {
    FILE_TOO_LARGE: '⚠ このファイルは20MBを超えているため読み込めません。',
    INVALID_FILE_TYPE: 'テキストファイル（.txt または .log）を選択してください。',
    NO_SAMPLE_SELECTED: '読み込むテストログを選択してください。',
    FILE_LOAD_ERROR: 'ファイル読み込みに失敗しました'
  }
};

/**
 * HTMLエスケープユーティリティ
 * XSS攻撃を防ぐため、HTMLの特殊文字をエスケープ
 */
export function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[ch]);
}

/**
 * 複数行テキストの各行をエスケープ
 */
export function escapeHtmlMultiline(text) {
  if (typeof text !== 'string') return '';
  return text.split('\n').map(line => escapeHtml(line)).join('\n');
}
