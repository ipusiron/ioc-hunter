import { escapeHtml } from './config.js';

export class TabManager {
  constructor() {
    this.activeTab = 'overview';
    this.init();
  }

  init() {
    // タブボタンのイベントリスナー
    document.querySelectorAll('.tab-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const tabName = e.target.dataset.tab;
        this.switchTab(tabName);
      });
    });
  }

  switchTab(tabName) {
    // 以前のアクティブタブを非アクティブ化
    document.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.remove('active');
    });

    // 新しいタブをアクティブ化
    const button = document.querySelector(`[data-tab="${tabName}"]`);
    const panel = document.getElementById(`tab-${tabName}`);
    
    if (button && panel) {
      button.classList.add('active');
      panel.classList.add('active');
      this.activeTab = tabName;
    }
  }

  showResults() {
    document.getElementById('resultsSection').style.display = 'block';
  }

  hideResults() {
    document.getElementById('resultsSection').style.display = 'none';
  }

  updateAnalysisTab(correlations) {
    const analysisArea = document.getElementById('analysisArea');
    
    if (correlations.length === 0) {
      analysisArea.innerHTML = '<p class="no-data">関連性のあるIOCは検出されませんでした。</p>';
      return;
    }

    const html = `
      <div class="analysis-summary">
        <div class="stat-card">
          <h4>検出された関連性</h4>
          <div class="stat-value">${correlations.length}</div>
        </div>
      </div>
      
      <div class="correlations-list">
        ${correlations.map(corr => this.renderCorrelation(corr)).join('')}
      </div>
    `;
    
    analysisArea.innerHTML = html;
  }

  updateTimelineTab(timelineGroups) {
    const timelineArea = document.getElementById('timelineArea');
    
    if (timelineGroups.length === 0) {
      timelineArea.innerHTML = '<p class="no-data">タイムスタンプ付きのIOCは検出されませんでした。</p>';
      return;
    }

    const html = `
      <div class="timeline-summary">
        <div class="stat-card">
          <h4>時間グループ</h4>
          <div class="stat-value">${timelineGroups.length}</div>
        </div>
      </div>
      
      <div class="timeline-container">
        ${timelineGroups.map(group => this.renderTimelineGroup(group)).join('')}
      </div>
    `;
    
    timelineArea.innerHTML = html;
  }

  renderCorrelation(correlation) {
    const strengthClass = typeof correlation.strength === 'number'
      ? (correlation.strength > 0.7 ? 'high' : correlation.strength > 0.4 ? 'medium' : 'low')
      : correlation.strength;

    switch (correlation.type) {
      case 'cooccurrence':
        return `
          <div class="correlation-item ${strengthClass}">
            <div class="correlation-header">
              <span class="correlation-type">共起関係</span>
              <span class="strength-badge ${strengthClass}">${strengthClass}</span>
            </div>
            <div class="correlation-details">
              <div class="ioc-pair">
                <span class="ioc-item ${correlation.ioc1.type}">${escapeHtml(correlation.ioc1.value)}</span>
                <span class="relation-symbol">↔</span>
                <span class="ioc-item ${correlation.ioc2.type}">${escapeHtml(correlation.ioc2.value)}</span>
              </div>
              <div class="context">
                <small>行 ${correlation.lineNumber}: ${escapeHtml(correlation.context)}</small>
              </div>
            </div>
          </div>
        `;

      case 'domain_ip_relation':
        return `
          <div class="correlation-item ${strengthClass}">
            <div class="correlation-header">
              <span class="correlation-type">ドメイン-IP関連</span>
              <span class="strength-badge ${strengthClass}">${strengthClass}</span>
            </div>
            <div class="correlation-details">
              <div class="ioc-pair">
                <span class="ioc-item domain">${escapeHtml(correlation.domain)}</span>
                <span class="relation-symbol">→</span>
                <span class="ioc-item ipv4">${escapeHtml(correlation.ip)}</span>
              </div>
              <div class="context">
                <small>行 ${correlation.lineNumber}: 距離 ${correlation.proximity}文字</small>
              </div>
            </div>
          </div>
        `;

      case 'file_hash_relation':
        return `
          <div class="correlation-item ${strengthClass}">
            <div class="correlation-header">
              <span class="correlation-type">ファイル-ハッシュ関連</span>
              <span class="strength-badge ${strengthClass}">${strengthClass}</span>
            </div>
            <div class="correlation-details">
              <div class="ioc-pair">
                <span class="ioc-item filePath">${escapeHtml(correlation.filePath)}</span>
                <span class="relation-symbol">→</span>
                <span class="ioc-item hash">${escapeHtml(correlation.hash)}</span>
              </div>
              <div class="context">
                <small>行 ${correlation.lineNumber}: ${escapeHtml(correlation.context)}</small>
              </div>
            </div>
          </div>
        `;

      default:
        return `
          <div class="correlation-item ${strengthClass}">
            <div class="correlation-header">
              <span class="correlation-type">${escapeHtml(correlation.type)}</span>
              <span class="strength-badge ${strengthClass}">${strengthClass}</span>
            </div>
            <div class="correlation-details">
              <div class="context">
                <small>行 ${correlation.lineNumber}: ${escapeHtml(correlation.context)}</small>
              </div>
            </div>
          </div>
        `;
    }
  }

  renderTimelineGroup(group) {
    const severityClass = group.severity;
    const startTime = new Date(group.startTime).toLocaleString('ja-JP');

    return `
      <div class="timeline-group ${severityClass}">
        <div class="timeline-header">
          <div class="timeline-time">${escapeHtml(startTime)}</div>
          <div class="severity-badge ${severityClass}">${escapeHtml(group.severity)}</div>
          <div class="event-count">${group.events.length} events</div>
        </div>
        <div class="timeline-events">
          ${group.events.map(event => `
            <div class="timeline-event">
              <div class="event-line">行 ${event.lineNumber}</div>
              <div class="event-iocs">
                ${event.iocs.map(ioc => `
                  <span class="ioc-tag ${ioc.type}">${escapeHtml(ioc.value)}</span>
                `).join('')}
              </div>
              <div class="event-context">${escapeHtml(event.line)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  generateDetailedStatsHTML(detailedStats) {
    const { summary, distribution, patterns, risks } = detailedStats;
    
    return `
      <div class="detailed-stats">
        <div class="stats-summary">
          <h4>📈 サマリー</h4>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="label">総IOC数</span>
              <span class="value">${summary.totalIOCs}</span>
            </div>
            <div class="summary-item">
              <span class="label">ユニークIOC数</span>
              <span class="value">${summary.uniqueIOCs}</span>
            </div>
            <div class="summary-item">
              <span class="label">検出タイプ数</span>
              <span class="value">${summary.detectedTypes}</span>
            </div>
            <div class="summary-item">
              <span class="label">優勢タイプ</span>
              <span class="value">${summary.dominantType || 'なし'}</span>
            </div>
            <div class="summary-item">
              <span class="label">リスクレベル</span>
              <span class="value risk-${summary.riskLevel}">${summary.riskLevel}</span>
            </div>
          </div>
        </div>

        <div class="distribution-analysis">
          <h4>📊 分布分析</h4>
          <div class="distribution-grid">
            ${Object.entries(distribution).filter(([type, data]) => data.count > 0).map(([type, data]) => `
              <div class="distribution-item">
                <span class="type-label ${type}">${type}</span>
                <span class="percentage">${data.percentage}%</span>
                <span class="unique-ratio">重複率: ${(100 - data.uniqueRatio * 100).toFixed(1)}%</span>
              </div>
            `).join('')}
          </div>
        </div>

        ${patterns.repeatedIOCs.length > 0 ? `
          <div class="patterns-analysis">
            <h4>🔄 繰り返しパターン</h4>
            <div class="repeated-iocs">
              ${patterns.repeatedIOCs.slice(0, 10).map(item => `
                <div class="repeated-item">
                  <span class="ioc-item ${item.type}">${escapeHtml(item.ioc)}</span>
                  <span class="count-badge">${item.count}回</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${risks.length > 0 ? `
          <div class="risk-assessment">
            <h4>⚠️ リスク評価</h4>
            <div class="risks-list">
              ${risks.map(risk => `
                <div class="risk-item ${risk.level}">
                  <span class="risk-level">${escapeHtml(risk.level)}</span>
                  <span class="risk-description">${escapeHtml(risk.description)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }
}