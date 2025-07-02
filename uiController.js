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
      darkModeToggle: document.getElementById('darkModeToggle')
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
    this.elements.outputArea.innerHTML = `<pre>${highlighted}</pre>`;
  }

  displayStats(statsHTML) {
    this.elements.statsArea.innerHTML = statsHTML;
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
    this.elements.testLoader.style.display = show ? 'block' : 'none';
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
}