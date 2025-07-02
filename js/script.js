import { CONFIG } from './config.js';
import { IOCAnalyzer } from './iocAnalyzer.js';
import { FileHandler } from './fileHandler.js';
import { UIController } from './uiController.js';
import { DarkModeHandler } from './darkModeHandler.js';
import { ExportHandler } from './exportHandler.js';
import { ChartRenderer } from './chartRenderer.js';
import { WhitelistManager } from './whitelistManager.js';
import { HelpModal } from './helpModal.js';
import { AnalysisEngine } from './analysisEngine.js';
import { TabManager } from './tabManager.js';

class IOCHunterApp {
  constructor() {
    this.analyzer = new IOCAnalyzer();
    this.fileHandler = new FileHandler();
    this.ui = new UIController();
    this.darkModeHandler = new DarkModeHandler();
    this.exportHandler = new ExportHandler();
    this.chartRenderer = new ChartRenderer();
    this.whitelistManager = new WhitelistManager();
    this.helpModal = new HelpModal();
    this.analysisEngine = new AnalysisEngine();
    this.tabManager = new TabManager();
    
    this.init();
  }

  init() {
    this.ui.bindAnalyzeHandler(() => this.handleAnalyze());
    this.ui.bindFileInputHandler((e) => this.handleFileSelect(e));
    this.ui.bindDropAreaHandlers({
      dragover: (e) => this.handleDragOver(e),
      dragleave: () => this.handleDragLeave(),
      drop: (e) => this.handleDrop(e)
    });
    this.ui.bindTestLogToggle((e) => this.handleTestLogToggle(e));
    this.ui.bindLoadSampleHandler(() => this.handleLoadSample());
    this.ui.bindDownloadHandler(() => this.handleDownload());
    
    // ホワイトリスト関連のイベントバインド
    this.ui.bindAddWhitelistHandler(() => this.handleAddWhitelist());
    this.ui.bindWhitelistToggleHandler((e) => this.handleWhitelistToggle(e));
    this.ui.setRemoveWhitelistHandler((ioc) => this.handleRemoveWhitelist(ioc));
    
    // ホワイトリストの初期化
    this.whitelistManager.init();
    this.analyzer.setWhitelistManager(this.whitelistManager);
    this.whitelistManager.setOnChangeCallback((data) => {
      this.ui.updateWhitelistDisplay(data.whitelist);
    });
    
    // 初期表示を更新
    this.ui.setWhitelistEnabled(this.whitelistManager.isEnabled());
    this.ui.updateWhitelistDisplay(this.whitelistManager.getAll());
    
    this.darkModeHandler.init();
    this.darkModeHandler.setOnToggleCallback(() => {
      // ダークモード切り替え時にグラフを再描画
      if (this.exportHandler.currentStats) {
        this.chartRenderer.render(this.exportHandler.currentStats);
      }
    });
    
    this.loadSampleList();
  }

  handleAnalyze() {
    const inputText = this.ui.getInputText();
    const { stats, highlighted } = this.analyzer.analyze(inputText);
    const statsHTML = this.analyzer.generateStatsHTML(stats);
    
    // 基本的な統計とハイライト表示
    this.ui.displayStats(statsHTML);
    this.ui.displayResults(stats, highlighted);
    
    // グラフを描画
    this.chartRenderer.render(stats);
    
    // 高度な分析を実行
    this.performAdvancedAnalysis(inputText, stats);
    
    // エクスポート用にstatsを保存し、セクションを表示
    this.exportHandler.setStats(stats);
    this.ui.showExportSection();
    this.ui.showResultsSection();
  }

  performAdvancedAnalysis(inputText, stats) {
    // 分析エンジンにデータを設定
    this.analysisEngine.setData(inputText, stats);
    
    // 関連性分析
    const correlations = this.analysisEngine.analyzeCorrelations();
    this.tabManager.updateAnalysisTab(correlations);
    
    // タイムライン分析
    const timelineGroups = this.analysisEngine.analyzeTimeline();
    this.tabManager.updateTimelineTab(timelineGroups);
    
    // 詳細統計（概要タブに追加情報として表示）
    const detailedStats = this.analysisEngine.generateDetailedStats();
    const detailedHTML = this.tabManager.generateDetailedStatsHTML(detailedStats);
    
    // 既存の統計の下に詳細統計を追加
    const statsArea = document.getElementById('statsArea');
    statsArea.innerHTML += detailedHTML;
  }

  async handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
      await this.processFile(file);
    }
  }

  handleDragOver(event) {
    event.preventDefault();
    this.ui.addDragOverClass();
  }

  handleDragLeave() {
    this.ui.removeDragOverClass();
  }

  async handleDrop(event) {
    event.preventDefault();
    this.ui.removeDragOverClass();
    const file = event.dataTransfer.files[0];
    if (file) {
      await this.processFile(file);
    }
  }

  async processFile(file) {
    try {
      const content = await this.fileHandler.readFile(file);
      this.ui.setInputText(content);
    } catch (error) {
      this.ui.showError(error.message);
    }
  }

  handleTestLogToggle(event) {
    this.ui.toggleTestLoader(event.target.checked);
  }

  async handleLoadSample() {
    const filename = this.ui.getSelectedSample();
    if (!filename) {
      this.ui.showError(CONFIG.MESSAGES.NO_SAMPLE_SELECTED);
      return;
    }

    try {
      const content = await this.fileHandler.loadSampleFile(filename);
      this.ui.setInputText(content.trim());
    } catch (error) {
      this.ui.showError(error.message);
    }
  }

  async loadSampleList() {
    try {
      const samples = await this.fileHandler.loadSampleList();
      this.ui.populateSampleSelector(samples);
    } catch (error) {
      console.error('サンプルリストの読み込みに失敗:', error);
    }
  }

  handleDownload() {
    try {
      const format = this.ui.getExportFormat();
      this.exportHandler.download(format);
    } catch (error) {
      this.ui.showError(error.message);
    }
  }

  handleAddWhitelist() {
    const ioc = this.ui.getWhitelistInput();
    if (ioc.trim()) {
      if (this.whitelistManager.add(ioc)) {
        this.ui.clearWhitelistInput();
      } else {
        this.ui.showError('無効なIOCまたは既に追加済みです');
      }
    }
  }

  handleRemoveWhitelist(ioc) {
    this.whitelistManager.remove(ioc);
  }

  handleWhitelistToggle(event) {
    this.whitelistManager.setEnabled(event.target.checked);
  }
}

// アプリケーションの初期化
window.addEventListener('DOMContentLoaded', () => {
  new IOCHunterApp();
});