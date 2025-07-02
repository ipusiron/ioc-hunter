import { CONFIG } from './config.js';

export class IOCAnalyzer {
  constructor() {
    this.patterns = CONFIG.PATTERNS;
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
      const matches = [...text.matchAll(regex)].map(m => m[0]);
      results[type] = {
        total: matches.length,
        unique: new Set(matches).size,
        items: [...new Set(matches)]
      };
    }
    
    return results;
  }

  highlightIOCs(text) {
    let highlighted = text;
    
    for (const [type, regex] of Object.entries(this.patterns)) {
      highlighted = highlighted.replace(regex, (match) => {
        return `<span class="ioc ${type}">${match}</span>`;
      });
    }
    
    return highlighted;
  }

  generateStatsHTML(stats) {
    const items = Object.entries(stats).map(([type, data]) => 
      `<li><strong>${type}</strong>: ${data.total} 件（ユニーク: ${data.unique} 件）</li>`
    );
    
    return `<ul>${items.join('')}</ul>`;
  }
}