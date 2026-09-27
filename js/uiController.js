import { escapeHtml } from './config.js';

export class UIController {
  constructor() {
    this.elements = {
      fileInput: document.getElementById('fileInput'),
      fileDropArea: document.getElementById('fileDropArea'),
      inputText: document.getElementById('inputText'),
      analyzeButton: document.getElementById('analyzeButton'),
      outputArea: document.getElementById('outputArea'),
      statsArea: document.getElementById('statsArea'),
      useTestLog: document.getElementById('useTestLog'),
      testLoader: document.getElementById('testLoader'),
      sampleSelector: document.getElementById('sampleSelector'),
      loadSample: document.getElementById('loadSample'),
      darkModeToggle: document.getElementById('darkModeToggle'),
      exportSection: document.getElementById('exportSection'),
      exportFormat: document.getElementById('exportFormat'),
      downloadButton: document.getElementById('downloadButton'),
      chartContainer: document.getElementById('chartContainer'),
      iocChart: document.getElementById('iocChart'),
      whitelistSection: document.getElementById('whitelistSection'),
      whitelistInput: document.getElementById('whitelistInput'),
      addWhitelistButton: document.getElementById('addWhitelistButton'),
      enableWhitelist: document.getElementById('enableWhitelist'),
      whitelistDisplay: document.getElementById('whitelistDisplay'),
      resultsSection: document.getElementById('resultsSection'),
      analysisArea: document.getElementById('analysisArea'),
      timelineArea: document.getElementById('timelineArea')
    };
  }

  showError(message) {
    alert(message);
  }

  setInputText(text) {
    this.elements.inputText.value = text;
  }

  getInputText() {
    return this.elements.inputText.value;
  }

  displayResults(stats, highlighted) {
    const pre = document.createElement('pre');
    pre.innerHTML = highlighted; // Only scanner-generated, escaped markup; preserve a leading newline.
    this.elements.outputArea.replaceChildren(pre);
  }

  displayStats(statsHTML) {
    this.elements.statsArea.innerHTML = statsHTML;
    document.getElementById('analysisStatus').textContent = '解析が完了しました。';
  }

  populateSampleSelector(samples) {
    samples.forEach(({ filename, label }) => {
      const option = document.createElement('option');
      option.value = filename;
      option.textContent = label;
      this.elements.sampleSelector.appendChild(option);
    });
  }

  getSelectedSample() {
    return this.elements.sampleSelector.value;
  }

  toggleTestLoader(show) {
    this.elements.testLoader.hidden = !show;
  }

  addDragOverClass() {
    this.elements.fileDropArea.classList.add('dragover');
  }

  removeDragOverClass() {
    this.elements.fileDropArea.classList.remove('dragover');
  }

  bindAnalyzeHandler(handler) {
    this.elements.analyzeButton.addEventListener('click', handler);
  }

  bindFileInputHandler(handler) {
    this.elements.fileInput.addEventListener('change', handler);
  }

  bindDropAreaHandlers(handlers) {
    const { dragover, dragleave, drop } = handlers;
    this.elements.fileDropArea.addEventListener('dragover', dragover);
    this.elements.fileDropArea.addEventListener('dragleave', dragleave);
    this.elements.fileDropArea.addEventListener('drop', drop);
  }

  bindTestLogToggle(handler) {
    this.elements.useTestLog.addEventListener('change', handler);
  }

  bindLoadSampleHandler(handler) {
    this.elements.loadSample.addEventListener('click', handler);
  }

  bindDownloadHandler(handler) {
    this.elements.downloadButton.addEventListener('click', handler);
  }

  getExportFormat() {
    return this.elements.exportFormat.value;
  }

  showExportSection() {
    this.elements.exportSection.hidden = false;
  }

  hideExportSection() {
    this.elements.exportSection.hidden = true;
  }

  showResultsSection() {
    this.elements.resultsSection.hidden = false;
  }

  hideResultsSection() {
    this.elements.resultsSection.hidden = true;
  }

  bindAddWhitelistHandler(handler) {
    this.elements.addWhitelistButton.addEventListener('click', handler);
    this.elements.whitelistInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handler();
    });
  }

  bindWhitelistToggleHandler(handler) {
    this.elements.enableWhitelist.addEventListener('change', handler);
  }

  getWhitelistInput() {
    return this.elements.whitelistInput.value;
  }

  clearWhitelistInput() {
    this.elements.whitelistInput.value = '';
  }

  setWhitelistEnabled(enabled) {
    this.elements.enableWhitelist.checked = enabled;
  }

  updateWhitelistDisplay(whitelist) {
    const html = whitelist.length === 0 
      ? '<p class="whitelist-empty">ホワイトリストは空です</p>'
      : whitelist.map(ioc => `
          <div class="whitelist-item">
            <span>${this.escapeHtml(ioc)}</span>
            <button class="remove-btn" data-ioc="${this.escapeHtml(ioc)}">×</button>
          </div>
        `).join('');
    
    this.elements.whitelistDisplay.innerHTML = html;

    // 削除ボタンのイベントリスナー
    this.elements.whitelistDisplay.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const ioc = e.target.dataset.ioc;
        if (this.onRemoveWhitelistItem) {
          this.onRemoveWhitelistItem(ioc);
        }
      });
    });
  }

  setRemoveWhitelistHandler(handler) {
    this.onRemoveWhitelistItem = handler;
  }

  escapeHtml(str) {
    return escapeHtml(str);
  }
}
