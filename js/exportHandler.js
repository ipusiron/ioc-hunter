import { defang, urlHost } from './scanner.js';

export function csvCell(value) {
  let text = String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}

export class ExportHandler {
  // i18n を渡さない場合はキーをそのまま返す（Nodeのテストから読めるように）
  constructor(i18n = null) {
    this.i18n = i18n;
    this.currentStats = null;
  }

  t(key, values) {
    return this.i18n ? this.i18n.t(key, values) : key;
  }

  setStats(stats) {
    this.currentStats = stats;
  }

  export(format, useDefang = false) {
    this.useDefang = useDefang;
    if (!this.currentStats) {
      throw new Error(this.t('error.noExportData'));
    }

    switch (format) {
      case 'json':
        return this.exportJSON();
      case 'csv':
        return this.exportCSV();
      case 'txt':
        return this.exportTXT();
      default:
        throw new Error(this.t('error.unsupportedFormat'));
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
      [this.t('file.csvHeader.type'), this.t('file.csvHeader.value'),
        this.t('file.csvHeader.total'), this.t('file.csvHeader.unique')]
    ];

    for (const [type, info] of Object.entries(this.currentStats)) {
      if (info.items.length === 0) {
        rows.push([type, this.t('file.csvEmpty'), info.total, info.unique]);
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
    let text = `${this.t('file.txtTitle')}\n`;
    text += `${this.t('file.txtDate')}: ${new Date().toISOString()}\n`;
    text += `${'='.repeat(50)}\n\n`;

    const summary = this.getSummary();
    text += `${this.t('file.txtSummary')}:\n`;
    text += `  ${this.t('file.txtTotal')}: ${summary.totalIOCs}\n`;
    text += `  ${this.t('file.txtUnique')}: ${summary.uniqueIOCs}\n\n`;

    for (const [type, info] of Object.entries(this.currentStats)) {
      text += `${type.toUpperCase()}\n`;
      text += `${'-'.repeat(30)}\n`;
      text += `  ${this.t('file.txtTypeTotal')}: ${info.total}\n`;
      text += `  ${this.t('file.txtTypeUnique')}: ${info.unique}\n`;
      
      if (info.items.length > 0) {
        text += `  ${this.t('file.txtItems')}:\n`;
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
      console.error('The download failed.');
      throw error;
    }
  }
}
