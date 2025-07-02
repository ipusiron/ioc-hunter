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
      hash: '#4a235a'
    };
    
    // ダークモード用の色
    this.darkColors = {
      ipv4: '#64b5f6',
      ipv6: '#66bb6a',
      domain: '#ffb74d',
      email: '#ef5350',
      hash: '#ba68c8'
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
    
    // キャンバスのサイズを親要素に合わせる
    const containerWidth = this.chartContainer.clientWidth;
    this.canvas.width = Math.min(containerWidth - 20, 600);
    this.canvas.height = 300;
    
    // キャンバスをクリア
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // ダークモードの判定
    const isDarkMode = document.body.classList.contains('dark-mode');
    const colors = isDarkMode ? this.darkColors : this.colors;
    
    // データの準備
    const data = Object.entries(stats).map(([type, info]) => ({
      type,
      total: info.total,
      unique: info.unique,
      color: colors[type]
    }));
    
    // グラフの描画
    this.drawBarChart(data, isDarkMode);
  }

  drawBarChart(data, isDarkMode) {
    const padding = 40;
    const chartWidth = this.canvas.width - padding * 2;
    const chartHeight = this.canvas.height - padding * 2;
    
    // 最大値を取得
    const maxValue = Math.max(...data.map(d => Math.max(d.total, d.unique)));
    const scale = maxValue > 0 ? chartHeight / (maxValue * 1.2) : 0;
    
    // バーの幅を計算
    const groupWidth = chartWidth / data.length;
    const barWidth = groupWidth * 0.35;
    const barGap = groupWidth * 0.1;
    
    // 軸の色
    const axisColor = isDarkMode ? '#e0e0e0' : '#333';
    const gridColor = isDarkMode ? '#444' : '#ddd';
    
    // Y軸のグリッドラインを描画
    this.ctx.strokeStyle = gridColor;
    this.ctx.lineWidth = 0.5;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      this.ctx.beginPath();
      this.ctx.moveTo(padding, y);
      this.ctx.lineTo(this.canvas.width - padding, y);
      this.ctx.stroke();
      
      // Y軸のラベル
      const value = Math.round((maxValue * 1.2) * (1 - i / 5));
      this.ctx.fillStyle = axisColor;
      this.ctx.font = '12px sans-serif';
      this.ctx.textAlign = 'right';
      this.ctx.fillText(value.toString(), padding - 5, y + 4);
    }
    
    // X軸を描画
    this.ctx.strokeStyle = axisColor;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(padding, this.canvas.height - padding);
    this.ctx.lineTo(this.canvas.width - padding, this.canvas.height - padding);
    this.ctx.stroke();
    
    // Y軸を描画
    this.ctx.beginPath();
    this.ctx.moveTo(padding, padding);
    this.ctx.lineTo(padding, this.canvas.height - padding);
    this.ctx.stroke();
    
    // バーを描画
    data.forEach((item, index) => {
      const x = padding + groupWidth * index + groupWidth / 2;
      
      // 総数のバー
      const totalHeight = item.total * scale;
      this.ctx.fillStyle = item.color;
      this.ctx.globalAlpha = 0.8;
      this.ctx.fillRect(
        x - barWidth - barGap / 2,
        this.canvas.height - padding - totalHeight,
        barWidth,
        totalHeight
      );
      
      // ユニーク数のバー
      const uniqueHeight = item.unique * scale;
      this.ctx.globalAlpha = 0.5;
      this.ctx.fillRect(
        x + barGap / 2,
        this.canvas.height - padding - uniqueHeight,
        barWidth,
        uniqueHeight
      );
      
      this.ctx.globalAlpha = 1.0;
      
      // ラベル
      this.ctx.fillStyle = axisColor;
      this.ctx.font = '14px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(item.type.toUpperCase(), x, this.canvas.height - padding + 20);
      
      // 値の表示
      if (item.total > 0) {
        this.ctx.font = '11px sans-serif';
        this.ctx.fillStyle = item.color;
        this.ctx.fillText(
          item.total.toString(),
          x - barWidth / 2 - barGap / 2,
          this.canvas.height - padding - totalHeight - 5
        );
        this.ctx.fillText(
          item.unique.toString(),
          x + barWidth / 2 + barGap / 2,
          this.canvas.height - padding - uniqueHeight - 5
        );
      }
    });
    
    // 凡例
    this.ctx.font = '12px sans-serif';
    const legendY = 15;
    
    // 総数の凡例
    this.ctx.fillStyle = axisColor;
    this.ctx.globalAlpha = 0.8;
    this.ctx.fillRect(this.canvas.width - 150, legendY, 15, 15);
    this.ctx.globalAlpha = 1.0;
    this.ctx.fillText('総数', this.canvas.width - 130, legendY + 12);
    
    // ユニーク数の凡例
    this.ctx.globalAlpha = 0.5;
    this.ctx.fillRect(this.canvas.width - 80, legendY, 15, 15);
    this.ctx.globalAlpha = 1.0;
    this.ctx.fillText('ユニーク', this.canvas.width - 60, legendY + 12);
  }
}