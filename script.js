import { CONFIG } from './config.js';
import { IOCAnalyzer } from './iocAnalyzer.js';
import { FileHandler } from './fileHandler.js';
import { UIController } from './uiController.js';
import { DarkModeHandler } from './darkModeHandler.js';

class IOCHunterApp {
  constructor() {
    this.analyzer = new IOCAnalyzer();
    this.fileHandler = new FileHandler();
    this.ui = new UIController();
    this.darkModeHandler = new DarkModeHandler();
    
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
    
    this.darkModeHandler.init();
    this.loadSampleList();
  }

  handleAnalyze() {
    const inputText = this.ui.getInputText();
    const { stats, highlighted } = this.analyzer.analyze(inputText);
    const statsHTML = this.analyzer.generateStatsHTML(stats);
    
    this.ui.displayStats(statsHTML);
    this.ui.displayResults(stats, highlighted);
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
}

// アプリケーションの初期化
window.addEventListener('DOMContentLoaded', () => {
  new IOCHunterApp();
});