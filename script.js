document.getElementById('analyzeButton').addEventListener('click', () => {
  const input = document.getElementById('inputText').value;
  const output = document.getElementById('outputArea');
  const stats = document.getElementById('statsArea');

  const patterns = {
    ipv4: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    ipv6: /\b(?:[a-fA-F0-9]{1,4}:){1,7}[a-fA-F0-9]{1,4}\b/g,
    domain: /\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}\b/gi,
    email: /\b[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/gi,
    hash: /\b[a-fA-F0-9]{32}\b|\b[a-fA-F0-9]{40}\b|\b[a-fA-F0-9]{64}\b/g,
  };

  let highlighted = input;
  let statsHtml = '<ul>';

  for (const [type, regex] of Object.entries(patterns)) {
    const matches = [...input.matchAll(regex)].map((m) => m[0]);
    const total = matches.length;
    const unique = new Set(matches).size;

    statsHtml += `<li><strong>${type}</strong>: ${total} 件（ユニーク: ${unique} 件）</li>`;

    highlighted = highlighted.replace(regex, (match) => {
      return `<span class="ioc ${type}">${match}</span>`;
    });
  }

  statsHtml += '</ul>';
  stats.innerHTML = statsHtml;
  output.innerHTML = `<pre>${highlighted}</pre>`;
});

// ファイル選択読み込み
document.getElementById('fileInput').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) readFile(file);
});

// ドラッグ＆ドロップ
const dropArea = document.getElementById('fileDropArea');

dropArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropArea.classList.add('dragover');
});

dropArea.addEventListener('dragleave', () => {
  dropArea.classList.remove('dragover');
});

dropArea.addEventListener('drop', (e) => {
  e.preventDefault();
  dropArea.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) readFile(file);
});

// 20MB制限付き読み込み
function readFile(file) {
  const MAX_SIZE = 20 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    alert('⚠ このファイルは20MBを超えているため読み込めません。');
    return;
  }

  if (!file.name.endsWith('.txt') && !file.name.endsWith('.log')) {
    alert('テキストファイル（.txt または .log）を選択してください。');
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    document.getElementById('inputText').value = reader.result;
  };
  reader.readAsText(file);
}

// list.txt を使ってサンプルログ一覧を読み込む
window.addEventListener('DOMContentLoaded', () => {
  fetch('samples/list.txt')
    .then((res) => res.text())
    .then((text) => {
      const selector = document.getElementById('sampleSelector');
      const lines = text.split(/\r?\n/);
      lines.forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.includes(':')) return;
        const [filename, label] = trimmed.split(':', 2);
        const option = document.createElement('option');
        option.value = filename;
        option.textContent = label;
        selector.appendChild(option);
      });
    });
});

// サンプル読み込みボタン
document.getElementById('loadSample').addEventListener('click', () => {
  const filename = document.getElementById('sampleSelector').value;
  if (!filename) {
    alert('読み込むテストログを選択してください。');
    return;
  }

  fetch(`samples/${filename}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`ファイル読み込みに失敗しました: ${filename}`);
      }
      return response.text();
    })
    .then((text) => {
      document.getElementById('inputText').value = text.trim();
    })
    .catch((err) => {
      alert(err.message);
    });
});

// チェックでテストログ選択UIを表示/非表示
document.getElementById('useTestLog').addEventListener('change', function () {
  const testLoader = document.getElementById('testLoader');
  testLoader.style.display = this.checked ? 'block' : 'none';
});
