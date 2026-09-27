import { defang, urlHost } from './scanner.js';

export function csvCell(value) {
  let text = String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}

export class ExportHandler {
  constructor() {
    this.currentStats = null;
  }

  setStats(stats) {
    this.currentStats = stats;
  }

  export(format, useDefang = false) {
    this.useDefang = useDefang;
    if (!this.currentStats) {
      throw new Error('エクスポートするデータがありません');
    }

    switch (format) {
      case 'json':
        return this.exportJSON();
      case 'csv':
        return this.exportCSV();
      case 'txt':
        return this.exportTXT();
      default:
        throw new Error('サポートされていない形式です');
    }
  }

  exportJSON() {
    const data = {
      exportDate: new Date().toISOString(),
      summary: this.getSummary(),
      iocs: {}
    };

    for (const [type, info] of Object.entries(this.currentStats)) {
      data.iocs[type] = {
        total: info.total,
        unique: info.unique,
        items: info.items.map(value => type === 'url'
          ? { value: this.outputValue(value, type), host: this.outputValue(urlHost(value), 'domain') }
          : this.outputValue(value, type))
      };
    }

    return {
      content: JSON.stringify(data, null, 2),
      filename: `ioc_results_${this.getTimestamp()}.json`,
      mimeType: 'application/json'
    };
  }

  exportCSV() {
    const rows = [
      ['IOCタイプ', 'IOC値', '総数', 'ユニーク数']
    ];

    for (const [type, info] of Object.entries(this.currentStats)) {
      if (info.items.length === 0) {
        rows.push([type, '(なし)', info.total, info.unique]);
      } else {
        info.items.forEach((item, index) => {
          if (index === 0) {
            rows.push([type, this.outputValue(item, type), info.total, info.unique]);
          } else {
            rows.push(['', this.outputValue(item, type), '', '']);
          }
        });
      }
    }

    const csv = rows.map(row => row.map(csvCell).join(',')).join('\r\n');

    return {
      content: '\uFEFF' + csv, // BOM付きでExcelでの文字化けを防ぐ
      filename: `ioc_results_${this.getTimestamp()}.csv`,
      mimeType: 'text/csv;charset=utf-8'
    };
  }

  exportTXT() {
    let text = `IOC抽出結果\n`;
    text += `抽出日時: ${new Date().toISOString()}\n`;
    text += `${'='.repeat(50)}\n\n`;

    const summary = this.getSummary();
    text += `サマリー:\n`;
    text += `  総IOC数: ${summary.totalIOCs}\n`;
    text += `  ユニークIOC数: ${summary.uniqueIOCs}\n\n`;

    for (const [type, info] of Object.entries(this.currentStats)) {
      text += `${type.toUpperCase()}\n`;
      text += `${'-'.repeat(30)}\n`;
      text += `  総数: ${info.total}\n`;
      text += `  ユニーク数: ${info.unique}\n`;
      
      if (info.items.length > 0) {
        text += `  検出項目:\n`;
        info.items.forEach(item => {
          text += `    - ${this.outputValue(item, type)}\n`;
        });
      }
      text += '\n';
    }

    return {
      content: text,
      filename: `ioc_results_${this.getTimestamp()}.txt`,
      mimeType: 'text/plain;charset=utf-8'
    };
  }

  outputValue(value, type) {
    return this.useDefang ? defang(value, type) : value;
  }

  getSummary() {
    let totalIOCs = 0;
    let uniqueIOCs = 0;

    for (const info of Object.values(this.currentStats)) {
      totalIOCs += info.total;
      uniqueIOCs += info.unique;
    }

    return { totalIOCs, uniqueIOCs };
  }

  getTimestamp() {
    const now = new Date();
    return now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
  }

  download(format, useDefang = false) {
    try {
      const exportData = this.export(format, useDefang);
      const blob = new Blob([exportData.content], { type: exportData.mimeType });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = exportData.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('ダウンロードに失敗しました。');
      throw error;
    }
  }
}
