import { scan, statsFromMatches, highlightMatches } from './scanner.js';
import { escapeHtml } from './config.js';

export class IOCAnalyzer {
  constructor() {
    this.matches = [];
    this.whitelistManager = null;
  }

  setWhitelistManager(whitelistManager) {
    this.whitelistManager = whitelistManager;
  }

  analyze(text) {
    const allMatches = scan(text);
    this.matches = this.whitelistManager?.isEnabled()
      ? allMatches.filter(match => !this.whitelistManager.contains(match.value))
      : allMatches;

    return {
      matches: this.matches,
      stats: this.extractStats(this.matches, allMatches),
      highlighted: this.highlightIOCs(text, this.matches)
    };
  }

  extractStats(matches, allMatches = matches) {
    return statsFromMatches(matches, allMatches);
  }

  highlightIOCs(text, matches) {
    return highlightMatches(text, matches);
  }

  // 数字は込みで文言を作るので、訳したあとにエスケープする。
  generateStatsHTML(stats) {
    const t = (key, values) => escapeHtml(window.I18n.t(key, values));
    const items = Object.entries(stats).map(([type, data]) => {
      const counts = t('stats.item', { total: data.total, unique: data.unique });
      let html = `<li><strong>${escapeHtml(type)}</strong>: ${counts}`;
      if (data.filtered > 0) {
        html += ` <span class="filtered-count">${t('stats.filtered', { filtered: data.filtered })}</span>`;
      }
      html += '</li>';
      return html;
    });
    
    return `<ul>${items.join('')}</ul>`;
  }
}
