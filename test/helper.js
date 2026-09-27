import { readFileSync } from 'node:fs';

export const root = new URL('../', import.meta.url);
export const read = (path) => readFileSync(new URL(path, root), 'utf8');

/**
 * js/i18n.js は通常のスクリプトなので、Node からは関数として読む。
 * window も localStorage も document も無い環境で読めることを、ここで確かめていることになる。
 */
export function loadI18n() {
  return new Function(`${read('js/i18n.js')}
    return I18n;`)();
}
