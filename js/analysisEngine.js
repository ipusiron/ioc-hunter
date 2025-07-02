export class AnalysisEngine {
  constructor() {
    this.originalText = '';
    this.stats = null;
  }

  setData(text, stats) {
    this.originalText = text;
    this.stats = stats;
  }

  // IOC関連性分析
  analyzeCorrelations() {
    const correlations = [];
    const allIOCs = this.getAllIOCs();
    
    // 共起関係の分析
    correlations.push(...this.analyzeCooccurrence(allIOCs));
    
    // ドメインとIPの関連性
    correlations.push(...this.analyzeDomainIPRelations());
    
    // ファイルパスとハッシュの関連性
    correlations.push(...this.analyzeFileHashRelations());
    
    // CVEとMITRE ATT&CKの関連性
    correlations.push(...this.analyzeThreatIntelRelations());
    
    return correlations;
  }

  // タイムライン分析
  analyzeTimeline() {
    const lines = this.originalText.split(/\r?\n/);
    const events = [];
    
    lines.forEach((line, index) => {
      // タイムスタンプパターンの検出
      const timestamps = this.extractTimestamps(line);
      const iocs = this.extractIOCsFromLine(line);
      
      if (timestamps.length > 0 && iocs.length > 0) {
        timestamps.forEach(timestamp => {
          events.push({
            lineNumber: index + 1,
            timestamp,
            iocs,
            line: line.trim(),
            severity: this.calculateSeverity(iocs)
          });
        });
      }
    });
    
    // 時系列でソート
    events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
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
  analyzeCooccurrence(allIOCs) {
    const correlations = [];
    const lines = this.originalText.split(/\r?\n/);
    
    lines.forEach((line, lineIndex) => {
      const lineIOCs = allIOCs.filter(ioc => 
        line.toLowerCase().includes(ioc.value.toLowerCase())
      );
      
      if (lineIOCs.length >= 2) {
        for (let i = 0; i < lineIOCs.length; i++) {
          for (let j = i + 1; j < lineIOCs.length; j++) {
            correlations.push({
              type: 'cooccurrence',
              ioc1: lineIOCs[i],
              ioc2: lineIOCs[j],
              lineNumber: lineIndex + 1,
              strength: this.calculateCorrelationStrength(lineIOCs[i], lineIOCs[j]),
              context: line.trim()
            });
          }
        }
      }
    });
    
    return correlations;
  }

  // ドメインとIPの関連性分析
  analyzeDomainIPRelations() {
    const correlations = [];
    const domains = this.stats.domain?.items || [];
    const ipv4s = this.stats.ipv4?.items || [];
    const ipv6s = this.stats.ipv6?.items || [];
    const allIPs = [...ipv4s, ...ipv6s];
    
    domains.forEach(domain => {
      allIPs.forEach(ip => {
        const proximity = this.findProximity(domain, ip);
        if (proximity.found) {
          correlations.push({
            type: 'domain_ip_relation',
            domain,
            ip,
            proximity: proximity.distance,
            lineNumber: proximity.lineNumber,
            strength: proximity.distance < 50 ? 'high' : 'medium',
            context: proximity.context
          });
        }
      });
    });
    
    return correlations;
  }

  // ファイルパスとハッシュの関連性分析
  analyzeFileHashRelations() {
    const correlations = [];
    const filePaths = this.stats.filePath?.items || [];
    const hashes = this.stats.hash?.items || [];
    
    filePaths.forEach(filePath => {
      hashes.forEach(hash => {
        const proximity = this.findProximity(filePath, hash);
        if (proximity.found) {
          correlations.push({
            type: 'file_hash_relation',
            filePath,
            hash,
            proximity: proximity.distance,
            lineNumber: proximity.lineNumber,
            strength: proximity.distance < 100 ? 'high' : 'medium',
            context: proximity.context
          });
        }
      });
    });
    
    return correlations;
  }

  // 脅威インテリジェンス関連性分析
  analyzeThreatIntelRelations() {
    const correlations = [];
    const cves = this.stats.cve?.items || [];
    const mitres = this.stats.mitre?.items || [];
    
    cves.forEach(cve => {
      mitres.forEach(mitre => {
        const proximity = this.findProximity(cve, mitre);
        if (proximity.found) {
          correlations.push({
            type: 'threat_intel_relation',
            cve,
            mitre,
            proximity: proximity.distance,
            lineNumber: proximity.lineNumber,
            strength: 'high',
            context: proximity.context
          });
        }
      });
    });
    
    return correlations;
  }

  // タイムスタンプ抽出
  extractTimestamps(line) {
    const patterns = [
      // ISO 8601: 2024-01-15T10:30:45
      /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})?/g,
      // Apache log: [15/Jan/2024:10:30:45 +0000]
      /\[(\d{2}\/\w{3}\/\d{4}:\d{2}:\d{2}:\d{2}\s+[+-]\d{4})\]/g,
      // Syslog: Jan 15 10:30:45
      /\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2}/g,
      // Simple: 2024-01-15 10:30:45
      /\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/g
    ];
    
    const timestamps = [];
    patterns.forEach(pattern => {
      const matches = line.matchAll(pattern);
      for (const match of matches) {
        timestamps.push(match[0]);
      }
    });
    
    return timestamps;
  }

  // 行からIOC抽出
  extractIOCsFromLine(line) {
    const iocs = [];
    const allIOCs = this.getAllIOCs();
    
    allIOCs.forEach(ioc => {
      if (line.toLowerCase().includes(ioc.value.toLowerCase())) {
        iocs.push(ioc);
      }
    });
    
    return iocs;
  }

  // 近接性を検索
  findProximity(item1, item2) {
    const lines = this.originalText.split(/\r?\n/);
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const pos1 = line.toLowerCase().indexOf(item1.toLowerCase());
      const pos2 = line.toLowerCase().indexOf(item2.toLowerCase());
      
      if (pos1 !== -1 && pos2 !== -1) {
        return {
          found: true,
          distance: Math.abs(pos1 - pos2),
          lineNumber: i + 1,
          context: line.trim()
        };
      }
    }
    
    return { found: false };
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
      if (!currentGroup || this.getTimeDiff(currentGroup.startTime, event.timestamp) > 300000) { // 5分以上の間隔
        currentGroup = {
          startTime: event.timestamp,
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
      distribution[type].percentage = ((distribution[type].count / total) * 100).toFixed(1);
    });
    
    return distribution;
  }

  // パターン分析
  analyzePatterns() {
    const patterns = {
      repeatedIOCs: this.findRepeatedIOCs(),
      suspiciousPatterns: this.findSuspiciousPatterns(),
      geographicDistribution: this.analyzeGeographic()
    };
    
    return patterns;
  }

  // リスク評価
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
          description: `${type}タイプのIOCが検出されました`
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
    return Math.abs(new Date(time1) - new Date(time2));
  }

  getSeverityLevel(severity) {
    const levels = { low: 1, medium: 2, high: 3, critical: 4 };
    return levels[severity] || 0;
  }

  findRepeatedIOCs() {
    const repeated = [];
    Object.entries(this.stats).forEach(([type, data]) => {
      data.items.forEach(ioc => {
        const count = (this.originalText.match(new RegExp(this.escapeRegex(ioc), 'gi')) || []).length;
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
        description: '多数のIPアドレスが検出されました（ポートスキャンの可能性）'
      });
    }
    
    return patterns;
  }

  analyzeGeographic() {
    // 簡易的な地理的分析（実際にはGeoIPデータベースが必要）
    const privateIPs = (this.stats.ipv4?.items || []).filter(ip => 
      ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')
    );
    
    return {
      privateIPs: privateIPs.length,
      publicIPs: (this.stats.ipv4?.total || 0) - privateIPs.length
    };
  }

  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}