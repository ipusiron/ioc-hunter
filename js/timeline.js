const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function keyOf(year, month, day, hour, minute, second, millis = 0, offset = 0) {
  const values = [year, month, day, hour, minute, second, millis, offset].map(Number);
  const [y, mo, d, h, mi, s, ms, off] = values;
  if (!values.every(Number.isInteger) || y < 100 || mo < 1 || mo > 12 || d < 1
      || h > 23 || mi > 59 || s > 59 || ms > 999) return null;
  const key = Date.UTC(y, mo - 1, d, h, mi, s, ms);
  if (new Date(key).getUTCDate() !== d) return null;
  return key - off * 60000;
}

function offsetOf(value) {
  if (!value || value === 'Z') return 0;
  const match = value.match(/^([+-])(\d{2}):?(\d{2})$/);
  if (!match || Number(match[2]) > 23 || Number(match[3]) > 59) return NaN;
  return (Number(match[2]) * 60 + Number(match[3])) * (match[1] === '-' ? -1 : 1);
}

// Patterns retain the exact display text; only the comparison key is normalized.
const FORMATS = [
  {
    regex: /(?<!\d)(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{3}))?(Z|[+-]\d{2}:\d{2})?/g,
    parse: m => keyOf(...m.slice(1, 7), m[7] || 0, offsetOf(m[8])), hasYear: true
  },
  {
    regex: /\[(\d{2})\/(\w{3})\/(\d{4}):(\d{2}):(\d{2}):(\d{2})\s+([+-]\d{4})\]/g,
    parse: m => keyOf(m[3], MONTHS.indexOf(m[2]) + 1, m[1], ...m.slice(4, 7), 0, offsetOf(m[7])), hasYear: true
  },
  {
    regex: /(?<!\d)(\d{2})-(\w{3})-(\d{4}) (\d{2}):(\d{2}):(\d{2})\.(\d{3})/g,
    parse: m => keyOf(m[3], MONTHS.indexOf(m[2]) + 1, m[1], ...m.slice(4, 8)), hasYear: true
  },
  {
    regex: /(?<!\d)(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})(?!\d)/g,
    parse: m => keyOf(...m.slice(1, 7)), hasYear: true
  },
  {
    regex: /\b([A-Z][a-z]{2})\s+(\d{1,2}) (\d{2}):(\d{2}):(\d{2})(?!\d)/g,
    parse: m => keyOf(1970, MONTHS.indexOf(m[1]) + 1, ...m.slice(2, 6)), hasYear: false
  }
];

export function extractTimestamps(text) {
  if (typeof text !== 'string') return [];
  const timestamps = [];
  for (const format of FORMATS) {
    for (const match of text.matchAll(new RegExp(format.regex))) {
      const key = format.parse(match);
      if (key !== null) timestamps.push({ raw: match[0], key, hasYear: format.hasYear, start: match.index });
    }
  }
  return timestamps.sort((a, b) => a.start - b.start);
}
