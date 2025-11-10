import { CONFIG, escapeHtml, escapeHtmlMultiline } from './config.js';

export class IOCAnalyzer {
  constructor() {
    this.patterns = CONFIG.PATTERNS;
    this.whitelistManager = null;
  }

  setWhitelistManager(whitelistManager) {
    this.whitelistManager = whitelistManager;
  }

  analyze(text) {
    const stats = this.extractStats(text);
    const highlighted = this.highlightIOCs(text);
    
    return {
      stats,
      highlighted
    };
  }

  extractStats(text) {
    const results = {};
    
    for (const [type, regex] of Object.entries(this.patterns)) {
      const allMatches = [...text.matchAll(regex)].map(m => m[0]);
      
      // ホワイトリストフィルタリング
      const filteredMatches = this.whitelistManager && this.whitelistManager.isEnabled()
        ? allMatches.filter(match => !this.whitelistManager.contains(match))
        : allMatches;
      
      const uniqueMatches = [...new Set(filteredMatches)];
      
      results[type] = {
        total: filteredMatches.length,
        unique: uniqueMatches.length,
        items: uniqueMatches,
        filtered: allMatches.length - filteredMatches.length // フィルタされた数
      };
    }
    
    return results;
  }

  highlightIOCs(text) {
    // 【セキュリティ】まずテキスト全体をエスケープしてXSSを防ぐ
    let highlighted = escapeHtmlMultiline(text);

    // エスケープ後のテキストでIOCを検出してハイライト
    // IOC値は既にエスケープ済みなので安全にspanタグで囲める
    for (const [type, regex] of Object.entries(this.patterns)) {
      highlighted = highlighted.replace(regex, (match) => {
        // ホワイトリストに含まれる場合はハイライトしない
        if (this.whitelistManager && this.whitelistManager.isEnabled() &&
            this.whitelistManager.contains(match)) {
          return match;
        }
        // matchは既にエスケープ済みなので、そのままspanで囲む
        return `<span class="ioc ${type}">${match}</span>`;
      });
    }

    return highlighted;
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