import { extractTimestamps } from './timeline.js';

export class AnalysisEngine {
  constructor() {
    this.originalText = '';
    this.stats = null;
  }

  setData(text, stats, matches) {
    this.originalText = text;
    this.stats = stats;
    this.matches = matches;
    this.lines = text.split(/\r?\n/);
    this.lineIndex = new Map();
    this.counts = new Map();
    for (const match of matches) {
      if (!this.lineIndex.has(match.line)) this.lineIndex.set(match.line, []);
      this.lineIndex.get(match.line).push(match);
      const key = match.type + '\0' + match.value;
      this.counts.set(key, (this.counts.get(key) || 0) + 1);
    }
    this.correlationLimit = 20000;
    this.truncated = false;
  }

  // IOC関連性分析
  analyzeCorrelations() {
    this.truncated = false;
    return this.analyzeCooccurrence();
  }

  // タイムライン分析
  analyzeTimeline() {
    const events = [];
    for (const [lineNumber, matches] of this.lineIndex) {
      const line = this.lines[lineNumber - 1];
      const iocs = this.uniqueLineIOCs(matches);
      for (const timestamp of this.extractTimestamps(line)) {
        events.push({
          lineNumber, timestamp: timestamp.raw, key: timestamp.key, hasYear: timestamp.hasYear,
          iocs, line: line.trim(), severity: this.calculateSeverity(iocs)
        });
      }
    }
    events.sort((a, b) => a.key - b.key);
    
    return this.groupEventsByTime(events);
  }

  // 詳細統計情報
  generateDetailedStats() {
    const details = {
      summary: this.generateSummary(),
      distribution: this.analyzeDistribution(),
      patterns: this.analyzePatterns(),
      risks: this.assessRisks()
    };
    
    return details;
  }

  // 全IOCを取得
  getAllIOCs() {
    const allIOCs = [];
    for (const [type, data] of Object.entries(this.stats)) {
      data.items.forEach(ioc => {
        allIOCs.push({ type, value: ioc });
      });
    }
    return allIOCs;
  }

  // 共起関係の分析
  analyzeCooccurrence() {
    const correlations = [];
    const append = item => {
      if (correlations.length >= this.correlationLimit) {
        this.truncated = true;
        return false;
      }
      correlations.push(item);
      return true;
    };
    for (const [lineNumber, matches] of this.lineIndex) {
      const iocs = this.uniqueLineIOCs(matches);
      const context = this.lines[lineNumber - 1].trim();
      for (let i = 0; i < iocs.length; i++) {
        for (let j = i + 1; j < iocs.length; j++) {
          const [ioc1, ioc2] = [iocs[i], iocs[j]];
          if (!append({
            type: 'cooccurrence', ioc1, ioc2, lineNumber, context,
            strength: this.calculateCorrelationStrength(ioc1, ioc2)
          })) return correlations;
          const relation = this.proximityRelation(ioc1, ioc2);
          if (relation && !append({ ...relation, lineNumber, context })) return correlations;
        }
      }
    }
    return correlations;
  }

  uniqueLineIOCs(matches) {
    return [...new Map(matches.map(match => [match.type + '\0' + match.value, match])).values()];
  }

  // Nearness uses scanner positions, not repeated text searches.
  proximityRelation(first, second) {
    const items = new Map([[first.type, first.value], [second.type, second.value]]);
    const proximity = Math.abs(first.start - second.start);
    const domain = items.get('domain');
    const ip = items.get('ipv4') || items.get('ipv6');
    if (domain && ip) {
      return { type: 'domain_ip_relation', domain, ip, proximity, strength: proximity < 50 ? 'high' : 'medium' };
    }
    const filePath = items.get('filePath');
    const hash = items.get('hash');
    if (filePath && hash) {
      return { type: 'file_hash_relation', filePath, hash, proximity, strength: proximity < 100 ? 'high' : 'medium' };
    }
    if (items.has('cve') && items.has('mitre')) {
      return { type: 'threat_intel_relation', cve: items.get('cve'), mitre: items.get('mitre'), proximity, strength: 'high' };
    }
    return null;
  }

  // タイムスタンプ抽出
  extractTimestamps(line) {
    return extractTimestamps(line);
  }

  // 相関強度の計算
  calculateCorrelationStrength(ioc1, ioc2) {
    // IOCタイプの組み合わせによる重み付け
    const typeWeights = {
      'domain-ipv4': 0.9,
      'domain-ipv6': 0.9,
      'filePath-hash': 0.8,
      'cve-mitre': 0.9,
      'url-domain': 0.7,
      'email-domain': 0.6
    };
    
    const key1 = `${ioc1.type}-${ioc2.type}`;
    const key2 = `${ioc2.type}-${ioc1.type}`;
    
    return typeWeights[key1] || typeWeights[key2] || 0.5;
  }

  // 重要度の計算
  calculateSeverity(iocs) {
    let score = 0;
    const weights = {
      ipv4: 3,
      ipv6: 3,
      domain: 4,
      url: 5,
      email: 2,
      hash: 6,
      filePath: 4,
      registryKey: 5,
      bitcoin: 7,
      cve: 8,
      mitre: 6,
      flag: 2
    };
    
    iocs.forEach(ioc => {
      score += weights[ioc.type] || 1;
    });
    
    if (score >= 15) return 'critical';
    if (score >= 10) return 'high';
    if (score >= 5) return 'medium';
    return 'low';
  }

  // イベントの時間グループ化
  groupEventsByTime(events) {
    const groups = [];
    let currentGroup = null;
    
    events.forEach(event => {
      if (!currentGroup || this.getTimeDiff(currentGroup.key, event.key) > 300000) { // 5分以上の間隔
        currentGroup = {
          startTime: event.timestamp,
          key: event.key,
          hasYear: event.hasYear,
          events: [event],
          severity: event.severity
        };
        groups.push(currentGroup);
      } else {
        currentGroup.events.push(event);
        // より高い重要度に更新
        if (this.getSeverityLevel(event.severity) > this.getSeverityLevel(currentGroup.severity)) {
          currentGroup.severity = event.severity;
        }
      }
    });
    
    return groups;
  }

  // サマリー生成
  generateSummary() {
    const totalIOCs = Object.values(this.stats).reduce((sum, data) => sum + data.total, 0);
    const uniqueIOCs = Object.values(this.stats).reduce((sum, data) => sum + data.unique, 0);
    const typesWithData = Object.keys(this.stats).filter(type => this.stats[type].total > 0);
    
    return {
      totalIOCs,
      uniqueIOCs,
      detectedTypes: typesWithData.length,
      dominantType: this.getDominantType(),
      riskLevel: this.calculateOverallRisk()
    };
  }

  // 分布分析
  analyzeDistribution() {
    const distribution = {};
    let total = 0;
    
    Object.entries(this.stats).forEach(([type, data]) => {
      distribution[type] = {
        count: data.total,
        percentage: 0,
        uniqueRatio: data.unique / (data.total || 1)
      };
      total += data.total;
    });
    
    // パーセンテージを計算
    Object.keys(distribution).forEach(type => {
      distribution[type].percentage = ((distribution[type].count / (total || 1)) * 100).toFixed(1);
    });
    
    return distribution;
  }

  // パターン分析
  analyzePatterns() {
    const patterns = {
      repeatedIOCs: this.findRepeatedIOCs(),
      suspiciousPatterns: this.findSuspiciousPatterns()
    };
    
    return patterns;
  }

  // リスク評価。文言は持たず、表示側で訳すキーを返す。
  assessRisks() {
    const risks = [];
    
    // 高リスクIOCタイプの検出
    const highRiskTypes = ['bitcoin', 'cve', 'hash'];
    highRiskTypes.forEach(type => {
      if (this.stats[type]?.total > 0) {
        risks.push({
          type: 'high_risk_ioc',
          iocType: type,
          count: this.stats[type].total,
          level: 'high',
          descriptionKey: 'risk.highRiskIoc',
          descriptionParams: { type }
        });
      }
    });
    
    return risks;
  }

  // ユーティリティメソッド
  getDominantType() {
    let maxCount = 0;
    let dominantType = null;
    
    Object.entries(this.stats).forEach(([type, data]) => {
      if (data.total > maxCount) {
        maxCount = data.total;
        dominantType = type;
      }
    });
    
    return dominantType;
  }

  calculateOverallRisk() {
    const totalIOCs = Object.values(this.stats).reduce((sum, data) => sum + data.total, 0);
    const highRiskCount = (this.stats.bitcoin?.total || 0) + (this.stats.cve?.total || 0) + (this.stats.hash?.total || 0);
    
    if (highRiskCount >= 5) return 'critical';
    if (highRiskCount >= 2 || totalIOCs >= 50) return 'high';
    if (totalIOCs >= 20) return 'medium';
    return 'low';
  }

  getTimeDiff(time1, time2) {
    return Math.abs(time1 - time2);
  }

  getSeverityLevel(severity) {
    const levels = { low: 1, medium: 2, high: 3, critical: 4 };
    return levels[severity] || 0;
  }

  findRepeatedIOCs() {
    const repeated = [];
    Object.entries(this.stats).forEach(([type, data]) => {
      data.items.forEach(ioc => {
        const count = this.counts.get(type + '\0' + ioc) || 0;
        if (count >= 3) {
          repeated.push({ type, ioc, count });
        }
      });
    });
    return repeated.sort((a, b) => b.count - a.count);
  }

  findSuspiciousPatterns() {
    const patterns = [];
    
    // 短時間での多数のアクセス
    if (this.stats.ipv4?.total >= 10) {
      patterns.push({
        type: 'multiple_ips',
        descriptionKey: 'pattern.multipleIps',
        descriptionParams: {}
      });
    }
    
    return patterns;
  }


}
