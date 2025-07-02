document.getElementById("analyzeButton").addEventListener("click", () => {
  const input = document.getElementById("inputText").value;
  const output = document.getElementById("outputArea");

  // 正規表現によるIOC検出
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
