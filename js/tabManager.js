import { escapeHtml } from './config.js';

// 訳したあとにエスケープする。差し込み値は呼び出し側でエスケープしない。
const t = (key, values) => escapeHtml(window.I18n.t(key, values));

// 関連性の種別名。知らない種別は生の識別子をそのまま出す。
const CORRELATION_LABELS = {
  cooccurrence: 'correlation.cooccurrence',
  domain_ip_relation: 'correlation.domainIp',
  file_hash_relation: 'correlation.fileHash',
  threat_intel_relation: 'correlation.threatIntel'
};

export class TabManager {
  constructor() {
    this.activeTab = 'overview';
    this.init();
  }

  init() {
    // タブボタンのイベントリスナー
    document.querySelectorAll('.tab-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const tabName = e.currentTarget.dataset.tab;
        this.switchTab(tabName);
      });
    });
    const buttons = [...document.querySelectorAll('.tab-button')];
    buttons.forEach((button, index) => button.addEventListener('keydown', event => {
      const targets = {
        ArrowRight: (index + 1) % buttons.length,
        ArrowLeft: (index - 1 + buttons.length) % buttons.length,
        Home: 0, End: buttons.length - 1
      };
      if (!(event.key in targets)) return;
      event.preventDefault();
      const next = buttons[targets[event.key]];
      this.switchTab(next.dataset.tab);
      next.focus();
    }));
  }

  switchTab(tabName) {
    // 以前のアクティブタブを非アクティブ化
    document.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
      btn.tabIndex = -1;
    });
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.remove('active');
      panel.hidden = true;
    });

    // 新しいタブをアクティブ化
    const button = document.querySelector(`[data-tab="${tabName}"]`);
    const panel = document.getElementById(`tab-${tabName}`);
    
    if (button && panel) {
      button.classList.add('active');
      button.setAttribute('aria-selected', 'true');
      button.tabIndex = 0;
      panel.classList.add('active');
      panel.hidden = false;
      this.activeTab = tabName;
    }
  }

  showResults() {
    document.getElementById('resultsSection').hidden = false;
  }

  hideResults() {
    document.getElementById('resultsSection').hidden = true;
  }

  updateAnalysisTab(correlations, truncated = false) {
    const analysisArea = document.getElementById('analysisArea');
    
    if (correlations.length === 0) {
      analysisArea.innerHTML = `<p class="no-data">${t('analysis.empty')}</p>`;
      return;
    }

    const html = `
      ${truncated ? `<p class="limit-warning">${t('analysis.limit')}</p>` : ''}
      <div class="analysis-summary">
        <div class="stat-card">
          <h4>${t('analysis.found')}</h4>
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
      timelineArea.innerHTML = `<p class="no-data">${t('timeline.empty')}</p>`;
      return;
    }

    const html = `
      <div class="timeline-summary">
        <div class="stat-card">
          <h4>${t('timeline.groups')}</h4>
          <div class="stat-value">${timelineGroups.length}</div>
        </div>
      </div>
      
      <div class="timeline-container">
        ${timelineGroups.map(group => this.renderTimelineGroup(group)).join('')}
      </div>
    `;
    
    timelineArea.innerHTML = html;
  }

  correlationLabel(type) {
    const key = CORRELATION_LABELS[type];
    return key ? t(key) : escapeHtml(type);
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
              <span class="correlation-type">${t('correlation.cooccurrence')}</span>
              <span class="strength-badge ${strengthClass}">${strengthClass}</span>
            </div>
            <div class="correlation-details">
              <div class="ioc-pair">
                <span class="ioc-item ${correlation.ioc1.type}">${escapeHtml(correlation.ioc1.value)}</span>
                <span class="relation-symbol">↔</span>
                <span class="ioc-item ${correlation.ioc2.type}">${escapeHtml(correlation.ioc2.value)}</span>
              </div>
              <div class="context">
                <small>${t('correlation.context',
                  { line: correlation.lineNumber, context: correlation.context })}</small>
              </div>
            </div>
          </div>
        `;

      case 'domain_ip_relation':
        return `
          <div class="correlation-item ${strengthClass}">
            <div class="correlation-header">
              <span class="correlation-type">${t('correlation.domainIp')}</span>
              <span class="strength-badge ${strengthClass}">${strengthClass}</span>
            </div>
            <div class="correlation-details">
              <div class="ioc-pair">
                <span class="ioc-item domain">${escapeHtml(correlation.domain)}</span>
                <span class="relation-symbol">→</span>
                <span class="ioc-item ipv4">${escapeHtml(correlation.ip)}</span>
              </div>
              <div class="context">
                <small>${t('correlation.proximity',
                  { line: correlation.lineNumber, proximity: correlation.proximity })}</small>
              </div>
            </div>
          </div>
        `;

      case 'file_hash_relation':
        return `
          <div class="correlation-item ${strengthClass}">
            <div class="correlation-header">
              <span class="correlation-type">${t('correlation.fileHash')}</span>
              <span class="strength-badge ${strengthClass}">${strengthClass}</span>
            </div>
            <div class="correlation-details">
              <div class="ioc-pair">
                <span class="ioc-item filePath">${escapeHtml(correlation.filePath)}</span>
                <span class="relation-symbol">→</span>
                <span class="ioc-item hash">${escapeHtml(correlation.hash)}</span>
              </div>
              <div class="context">
                <small>${t('correlation.context',
                  { line: correlation.lineNumber, context: correlation.context })}</small>
              </div>
            </div>
          </div>
        `;

      default:
        return `
          <div class="correlation-item ${strengthClass}">
            <div class="correlation-header">
              <span class="correlation-type">${this.correlationLabel(correlation.type)}</span>
              <span class="strength-badge ${strengthClass}">${strengthClass}</span>
            </div>
            <div class="correlation-details">
              <div class="context">
                <small>${t('correlation.context',
                  { line: correlation.lineNumber, context: correlation.context })}</small>
              </div>
            </div>
          </div>
        `;
    }
  }

  renderTimelineGroup(group) {
    const severityClass = group.severity;
    const startTime = group.startTime;

    return `
      <div class="timeline-group ${severityClass}">
        <div class="timeline-header">
          <div class="timeline-time">${escapeHtml(startTime)}</div>
          <div class="severity-badge ${severityClass}">${escapeHtml(group.severity)}</div>
          <div class="event-count">${t('timeline.events', { count: group.events.length })}</div>
        </div>
        <div class="timeline-events">
          ${group.events.map(event => `
            <div class="timeline-event">
              <div class="event-line">${t('timeline.line', { line: event.lineNumber })}</div>
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
          <h4>${t('detail.summary')}</h4>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="label">${t('detail.totalIocs')}</span>
              <span class="value">${summary.totalIOCs}</span>
            </div>
            <div class="summary-item">
              <span class="label">${t('detail.uniqueIocs')}</span>
              <span class="value">${summary.uniqueIOCs}</span>
            </div>
            <div class="summary-item">
              <span class="label">${t('detail.detectedTypes')}</span>
              <span class="value">${summary.detectedTypes}</span>
            </div>
            <div class="summary-item">
              <span class="label">${t('detail.dominantType')}</span>
              <span class="value">${escapeHtml(summary.dominantType) || t('detail.none')}</span>
            </div>
            <div class="summary-item">
              <span class="label">${t('detail.riskLevel')}</span>
              <span class="value risk-${summary.riskLevel}">${summary.riskLevel}</span>
            </div>
          </div>
        </div>

        <div class="distribution-analysis">
          <h4>${t('detail.distribution')}</h4>
          <div class="distribution-grid">
            ${Object.entries(distribution).filter(([type, data]) => data.count > 0).map(([type, data]) => `
              <div class="distribution-item">
                <span class="type-label ${type}">${escapeHtml(type)}</span>
                <span class="percentage">${data.percentage}%</span>
                <span class="unique-ratio">${t('detail.duplicateRate',
                  { rate: (100 - data.uniqueRatio * 100).toFixed(1) })}</span>
              </div>
            `).join('')}
          </div>
        </div>

        ${patterns.repeatedIOCs.length > 0 ? `
          <div class="patterns-analysis">
            <h4>${t('detail.patterns')}</h4>
            <div class="repeated-iocs">
              ${patterns.repeatedIOCs.slice(0, 10).map(item => `
                <div class="repeated-item">
                  <span class="ioc-item ${item.type}">${escapeHtml(item.ioc)}</span>
                  <span class="count-badge">${t('detail.count', { count: item.count })}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${risks.length > 0 ? `
          <div class="risk-assessment">
            <h4>${t('detail.risks')}</h4>
            <div class="risks-list">
              ${risks.map(risk => `
                <div class="risk-item ${risk.level}">
                  <span class="risk-level">${escapeHtml(risk.level)}</span>
                  <span class="risk-description">${t(risk.descriptionKey,
                    risk.descriptionParams)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }
}
