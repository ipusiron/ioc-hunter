document.getElementById("analyzeButton").addEventListener("click", () => {
  const input = document.getElementById("inputText").value;
  const output = document.getElementById("outputArea");

  const patterns = {
    ipv4: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    ipv6: /\b(?:[a-fA-F0-9]{1,4}:){1,7}[a-fA-F0-9]{1,4}\b/g,
    domain: /\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}\b/gi,
    email: /\b[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/gi,
    hash: /\b[a-fA-F0-9]{32}\b|\b[a-fA-F0-9]{40}\b|\b[a-fA-F0-9]{64}\b/g,
  };

  let highlighted = input;

  for (const [type, regex] of Object.entries(patterns)) {
    highlighted = highlighted.replace(regex, match => {
      return `<span class="ioc ${type}">${match}</span>`;
    });
  }

  output.innerHTML = `<pre>${highlighted}</pre>`;
});

// ファイル選択による読み込み
document.getElementById("fileInput").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) readFile(file);
});

// ドラッグ＆ドロップ処理
const dropArea = document.getElementById("fileDropArea");

dropArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropArea.classList.add("dragover");
});

dropArea.addEventListener("dragleave", () => {
  dropArea.classList.remove("dragover");
});

dropArea.addEventListener("drop", (e) => {
  e.preventDefault();
  dropArea.classList.remove("dragover");
  const file = e.dataTransfer.files[0];
  if (file) readFile(file);
});

// ファイル読み込み＋サイズ制限（20MBまで許可）
function readFile(file) {
  const MAX_SIZE = 20 * 1024 * 1024; // 20MB

  if (file.size > MAX_SIZE) {
    alert("⚠ このファイルは20MBを超えているため読み込めません。");
    return;
  }

  if (!file.type.startsWith("text/") && !file.name.endsWith(".txt")) {
    alert("テキストファイル（.txt）を選択してください。");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    document.getElementById("inputText").value = reader.result;
  };
  reader.readAsText(file);
}
