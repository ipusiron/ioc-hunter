import { scan, statsFromMatches, highlightMatches } from './scanner.js';

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

  generateStatsHTML(stats) {
    const items = Object.entries(stats).map(([type, data]) => {
      let html = `<li><strong>${type}</strong>: ${data.total} 件（ユニーク: ${data.unique} 件）`;
      if (data.filtered > 0) {
        html += ` <span class="filtered-count">（${data.filtered} 件除外）</span>`;
      }
      html += '</li>';
      return html;
    });
    
    return `<ul>${items.join('')}</ul>`;
  }
}
