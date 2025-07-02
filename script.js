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

// テストログの定義
const testLogs = {
  apache: `
192.0.2.10 - - [02/Jul/2025:10:00:01 +0900] "GET /index.html HTTP/1.1" 200 1024
203.0.113.55 - - [02/Jul/2025:10:01:12 +0900] "POST /login.php HTTP/1.1" 302 512 "http://evil.example.com"
198.51.100.23 - - [02/Jul/2025:10:02:45 +0900] "GET /api?hash=5f4dcc3b5aa765d61d8327deb882cf99" 200 256
`,
  auth: `
Jul 2 10:05:01 localhost sshd[2345]: Failed password for invalid user admin from 203.0.113.123 port 22 ssh2
Jul 2 10:05:04 localhost sshd[2346]: Accepted password for user1 from 192.0.2.55 port 22 ssh2
`,
  mail: `
Jul 2 10:00:01 mail postfix/smtpd[1234]: connect from unknown[203.0.113.50]
Jul 2 10:00:02 mail postfix/smtpd[1234]: NOQUEUE: reject: RCPT from unknown[203.0.113.50]: 554 5.7.1 <spam@badmail.com>
`,
  dns: `
02-Jul-2025 10:01:01.123 client 203.0.113.88#12345: query: bad-domain.xyz IN A + (192.0.2.1)
02-Jul-2025 10:01:02.456 client 203.0.113.88#12345: query: update.example.org IN MX + (192.0.2.1)
`,
  proxy: `
192.0.2.15 - - [02/Jul/2025:10:02:30 +0900] "GET http://malicious.site/dropper.js HTTP/1.1" 200 512 "-" "curl/7.64.1"
`,
};

// プルダウン＋ボタンによる読み込み
document.getElementById("loadSample").addEventListener("click", () => {
  const key = document.getElementById("sampleSelector").value;
  if (key && testLogs[key]) {
    document.getElementById("inputText").value = testLogs[key].trim();
  } else {
    alert("読み込むテストログを選択してください。");
  }
});
