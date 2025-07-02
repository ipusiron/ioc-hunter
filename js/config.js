export const CONFIG = {
  FILE: {
    MAX_SIZE_MB: 20,
    MAX_SIZE_BYTES: 20 * 1024 * 1024,
    ALLOWED_EXTENSIONS: ['.txt', '.log']
  },
  PATTERNS: {
    ipv4: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    ipv6: /\b(?:[a-fA-F0-9]{1,4}:){1,7}[a-fA-F0-9]{1,4}\b/g,
    domain: /\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}\b/gi,
    email: /\b[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/gi,
    hash: /\b[a-fA-F0-9]{32}\b|\b[a-fA-F0-9]{40}\b|\b[a-fA-F0-9]{64}\b/g,
    url: /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)/g,
    filePath: /(?:[A-Za-z]:\\(?:[^\\/:*?"<>|\r\n]+\\)*[^\\/:*?"<>|\r\n]*)|(?:\/(?:[^\/\0]+\/)*[^\/\0]+)/g,
    registryKey: /(?:HKEY_(?:CLASSES_ROOT|CURRENT_USER|LOCAL_MACHINE|USERS|CURRENT_CONFIG)|HKLM|HKCU|HKCR|HKU|HKCC)(?:\\[^\\<>:"|?*\r\n]+)*/g,
    bitcoin: /\b(?:[13][a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-z0-9]{39,59})\b/g,
    cve: /CVE-\d{4}-\d{4,}/g,
    mitre: /T\d{4}(?:\.\d{3})?/g,
  },
  MESSAGES: {
    FILE_TOO_LARGE: '⚠ このファイルは20MBを超えているため読み込めません。',
    INVALID_FILE_TYPE: 'テキストファイル（.txt または .log）を選択してください。',
    NO_SAMPLE_SELECTED: '読み込むテストログを選択してください。',
    FILE_LOAD_ERROR: 'ファイル読み込みに失敗しました'
  }
};