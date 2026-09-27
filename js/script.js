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

const I18n = window.I18n;
const t = (key, values) => I18n.t(key, values);

class IOCHunterApp {
  constructor() {
    this.analyzer = new IOCAnalyzer();
    this.fileHandler = new FileHandler(I18n);
    this.ui = new UIController();
    this.darkModeHandler = new DarkModeHandler();
    this.exportHandler = new ExportHandler(I18n);
    this.chartRenderer = new ChartRenderer();
    this.whitelistManager = new WhitelistManager();
    this.helpModal = new HelpModal();
    this.analysisEngine = new AnalysisEngine();
    this.tabManager = new TabManager();
    // 結果があるかをここで持つ。空のまま言語を変えても再描画しないため。
    this.lastAnalysis = null;

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
    this.bindLanguageToggle();
  }

  bindLanguageToggle() {
    document.getElementById('langToggle').addEventListener('click',
      () => I18n.setLanguage(I18n.language === 'ja' ? 'en' : 'ja'));
    document.addEventListener('languagechange', () => {
      this.ui.refreshSampleSelector();
      this.ui.refreshWhitelistDisplay();
      // 結果が出ているときだけ訳し直す。再走査はしない。
      this.renderAnalysis();
    });
  }

  handleAnalyze() {
    try {
      const inputText = this.ui.getInputText();

      if (!inputText.trim()) {
        this.ui.showError(t('error.emptyInput'));
        return;
      }

      const { stats, highlighted, matches } = this.analyzer.analyze(inputText);
      this.lastAnalysis = { inputText, stats, highlighted, matches };
      this.renderAnalysis(true);
    } catch (error) {
      console.error('Analysis failed.');
      this.ui.showError(t('error.analyze', { message: error.message }));
    }
  }

  // ここを通るのは「解析した直後」と「言語を変えたとき」の2とおりである。
  renderAnalysis(notify = false) {
    if (!this.lastAnalysis) return;
    const { inputText, stats, highlighted, matches } = this.lastAnalysis;

    // 基本的な統計とハイライト表示
    this.ui.displayStats(this.analyzer.generateStatsHTML(stats));
    this.ui.displayResults(stats, highlighted);

    // 可視化してからキャンバスの幅を取得する
    this.ui.showResultsSection();
    this.chartRenderer.render(stats);

    // エクスポート用にstatsを保存し、セクションを表示
    this.exportHandler.setStats(stats);
    this.ui.showExportSection();

    // 高度な分析を実行（表示の後に実行してエラーを防ぐ）
    try {
      this.performAdvancedAnalysis(inputText, stats, matches);
    } catch (error) {
      console.error('Advanced analysis failed.');
      // 言語を変えるたびに同じ警告を出さない
      if (notify) this.ui.showError(t('error.correlation'));
    }
  }

  performAdvancedAnalysis(inputText, stats, matches) {
    // 分析エンジンにデータを設定
    this.analysisEngine.setData(inputText, stats, matches);
    
    // 関連性分析
    const correlations = this.analysisEngine.analyzeCorrelations();
    this.tabManager.updateAnalysisTab(correlations, this.analysisEngine.truncated);
    
    // タイムライン分析
    const timelineGroups = this.analysisEngine.analyzeTimeline();
    this.tabManager.updateTimelineTab(timelineGroups);
    
    // 詳細統計（概要タブに追加情報として表示）
    const detailedStats = this.analysisEngine.generateDetailedStats();
    const detailedHTML = this.tabManager.generateDetailedStatsHTML(detailedStats);
    
    // 既存の統計の下に詳細統計を追加（安全に）
    const statsArea = document.getElementById('statsArea');
    if (statsArea && detailedHTML) {
      statsArea.innerHTML += detailedHTML;
    }
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
      this.ui.showError(t('error.noSample'));
      return;
    }

    try {
      const content = await this.fileHandler.loadSampleFile(filename);
      this.ui.setInputText(content);
    } catch (error) {
      this.ui.showError(error.message);
    }
  }

  async loadSampleList() {
    try {
      const samples = await this.fileHandler.loadSampleList();
      this.ui.populateSampleSelector(samples);
    } catch (error) {
      console.error('Failed to load the sample list.');
    }
  }

  handleDownload() {
    try {
      const format = this.ui.getExportFormat();
      this.exportHandler.download(format, document.getElementById('defangOutput').checked);
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
        this.ui.showError(t('error.duplicateIoc'));
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

// アプリケーションの初期化。言語の決定と適用を先に行う。
window.addEventListener('DOMContentLoaded', () => {
  I18n.init();
  new IOCHunterApp();
});
