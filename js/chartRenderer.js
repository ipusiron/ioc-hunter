export class ChartRenderer {
  constructor() {
    this.canvas = document.getElementById('iocChart');
    this.ctx = this.canvas.getContext('2d');
    this.chartContainer = document.getElementById('chartContainer');
    
    // IOCタイプごとの色（ライトモード）
    this.colors = {
      ipv4: '#0c4f88',
      ipv6: '#236e4a',
      domain: '#856404',
      email: '#721c24',
      hash: '#4a235a',
      url: '#155724',
      filePath: '#004085',
      registryKey: '#721c24',
      bitcoin: '#856404',
      cve: '#0c5460',
      mitre: '#383d41',
      flag: '#cc0000'
    };
    
    // ダークモード用の色
    this.darkColors = {
      ipv4: '#64b5f6',
      ipv6: '#66bb6a',
      domain: '#ffb74d',
      email: '#ef5350',
      hash: '#ba68c8',
      url: '#81c784',
      filePath: '#64b5f6',
      registryKey: '#f48fb1',
      bitcoin: '#ffb74d',
      cve: '#4dd0e1',
      mitre: '#bdbdbd',
      flag: '#ff6b6b'
    };
  }

  render(stats) {
    // データが空の場合は非表示
    const hasData = Object.values(stats).some(s => s.total > 0);
    if (!hasData) {
      this.chartContainer.style.display = 'none';
      return;
    }

    this.chartContainer.style.display = 'block';
    
    // ダークモードの判定
    const isDarkMode = document.body.classList.contains('dark-mode');
    const colors = isDarkMode ? this.darkColors : this.colors;
    
    // データの準備（値が0より大きいもののみ表示）
    const data = Object.entries(stats)
      .filter(([type, info]) => info.total > 0)
      .map(([type, info]) => ({
        type,
        total: info.total,
        unique: info.unique,
        color: colors[type] || (isDarkMode ? '#bdbdbd' : '#666')
      }));
    
    // キャンバスのサイズを動的に調整（横棒グラフなので高さを調整）
    const containerWidth = this.chartContainer.clientWidth;
    this.canvas.width = Math.min(containerWidth - 20, 700);
    this.canvas.height = Math.max(300, data.length * 40 + 100); // データ数に応じて高さを調整
    
    // キャンバスをクリア
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 横棒グラフの描画
    this.drawHorizontalBarChart(data, isDarkMode);
  }

  drawHorizontalBarChart(data, isDarkMode) {
    const padding = 80; // 左側のラベル用に多めに確保
    const rightPadding = 40;
    const topPadding = 40;
    const bottomPadding = 40;
    
    const chartWidth = this.canvas.width - padding - rightPadding;
    const chartHeight = this.canvas.height - topPadding - bottomPadding;
    
    // 最大値を取得
    const maxValue = Math.max(...data.map(d => Math.max(d.total, d.unique)));
    const scale = maxValue > 0 ? chartWidth / (maxValue * 1.1) : 0;
    
    // バーの高さを計算
    const barHeight = Math.min(25, chartHeight / (data.length * 2.5));
    const groupHeight = chartHeight / data.length;
    const barGap = 3;
    
    // 軸の色
    const axisColor = isDarkMode ? '#e0e0e0' : '#333';
    const gridColor = isDarkMode ? '#444' : '#ddd';
    
    // X軸のグリッドラインを描画
    this.ctx.strokeStyle = gridColor;
    this.ctx.lineWidth = 0.5;
    for (let i = 0; i <= 5; i++) {
      const x = padding + (chartWidth / 5) * i;
      this.ctx.beginPath();
      this.ctx.moveTo(x, topPadding);
      this.ctx.lineTo(x, this.canvas.height - bottomPadding);
      this.ctx.stroke();
      
      // X軸のラベル
      const value = Math.round((maxValue * 1.1) * (i / 5));
      this.ctx.fillStyle = axisColor;
      this.ctx.font = '12px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(value.toString(), x, this.canvas.height - bottomPadding + 20);
    }
    
    // Y軸を描画
    this.ctx.strokeStyle = axisColor;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(padding, topPadding);
    this.ctx.lineTo(padding, this.canvas.height - bottomPadding);
    this.ctx.stroke();
    
    // X軸を描画
    this.ctx.beginPath();
    this.ctx.moveTo(padding, this.canvas.height - bottomPadding);
    this.ctx.lineTo(this.canvas.width - rightPadding, this.canvas.height - bottomPadding);
    this.ctx.stroke();
    
    // 横棒を描画
    data.forEach((item, index) => {
      const y = topPadding + groupHeight * index + groupHeight / 2;
      
      // 総数のバー
      const totalWidth = item.total * scale;
      this.ctx.fillStyle = item.color;
      this.ctx.globalAlpha = 0.8;
      this.ctx.fillRect(
        padding,
        y - barHeight - barGap / 2,
        totalWidth,
        barHeight
      );
      
      // ユニーク数のバー
      const uniqueWidth = item.unique * scale;
      this.ctx.globalAlpha = 0.5;
      this.ctx.fillRect(
        padding,
        y + barGap / 2,
        uniqueWidth,
        barHeight
      );
      
      this.ctx.globalAlpha = 1.0;
      
      // IOCタイプのラベル（左側）
      this.ctx.fillStyle = axisColor;
      this.ctx.font = '14px sans-serif';
      this.ctx.textAlign = 'right';
      this.ctx.fillText(item.type.toUpperCase(), padding - 10, y + 5);
      
      // 値の表示
      if (item.total > 0) {
        this.ctx.font = '11px sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillStyle = item.color;
        
        // 総数の値
        this.ctx.fillText(
          item.total.toString(),
          padding + totalWidth + 5,
          y - barHeight / 2 - barGap / 2 + 4
        );
        
        // ユニーク数の値
        this.ctx.fillText(
          item.unique.toString(),
          padding + uniqueWidth + 5,
          y + barHeight / 2 + barGap / 2 + 4
        );
      }
    });
    
    // 凡例
    this.ctx.font = '12px sans-serif';
    const legendX = this.canvas.width - 150;
    const legendY = 20;
    
    // サンプル色を使用（最初に見つかったIOCタイプの色）
    const sampleColor = data.length > 0 ? data[0].color : axisColor;
    
    // 総数の凡例
    this.ctx.fillStyle = sampleColor;
    this.ctx.globalAlpha = 0.8;
    this.ctx.fillRect(legendX, legendY, 15, 15);
    this.ctx.globalAlpha = 1.0;
    this.ctx.fillStyle = axisColor;
    this.ctx.textAlign = 'left';
    this.ctx.fillText('総数', legendX + 20, legendY + 12);
    
    // ユニーク数の凡例
    this.ctx.fillStyle = sampleColor;
    this.ctx.globalAlpha = 0.5;
    this.ctx.fillRect(legendX, legendY + 20, 15, 15);
    this.ctx.globalAlpha = 1.0;
    this.ctx.fillStyle = axisColor;
    this.ctx.fillText('ユニーク', legendX + 20, legendY + 32);
  }
}