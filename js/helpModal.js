export class HelpModal {
  constructor() {
    this.modal = document.getElementById('helpModal');
    this.helpButton = document.getElementById('helpButton');
    this.closeButton = document.getElementById('closeHelp');
    this.overlay = this.modal.querySelector('.modal-overlay');
    this.helpContent = document.getElementById('helpContent');
    
    this.init();
  }

  init() {
    // ヘルプボタンクリックでモーダルを開く
    this.helpButton.addEventListener('click', () => this.show());
    
    // 閉じるボタンでモーダルを閉じる
    this.closeButton.addEventListener('click', () => this.hide());
    
    // オーバーレイクリックでモーダルを閉じる
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.hide();
      }
    });
    
    // ESCキーでモーダルを閉じる
    document.addEventListener('keydown', (e) => {
      if (!this.isVisible()) return;
      if (e.key === 'Escape') this.hide();
      if (e.key === 'Tab') {
        const items = [...this.modal.querySelectorAll('button, a[href], input, select, textarea, [tabindex="0"]')];
        const first = items[0];
        const last = items.at(-1);
        if ((e.shiftKey && document.activeElement === first) || (!e.shiftKey && document.activeElement === last)) {
          e.preventDefault();
          (e.shiftKey ? last : first).focus();
        }
      }
    });
    
    // ヘルプコンテンツを生成
    this.generateHelpContent();
  }

  show() {
    this.previousFocus = document.activeElement;
    this.modal.hidden = false;
    this.inertStates = [...document.body.children].filter(item => item !== this.modal)
      .map(item => [item, item.inert]);
    this.inertStates.forEach(([item]) => { item.inert = true; });
    document.body.classList.add('modal-open');
    this.closeButton.focus(); // フォーカスを移動
  }

  hide() {
    this.modal.hidden = true;
    this.inertStates?.forEach(([item, state]) => { item.inert = state; });
    document.body.classList.remove('modal-open');
    (this.previousFocus || this.helpButton).focus();
  }

  isVisible() {
    return !this.modal.hidden;
  }

  generateHelpContent() {
    const content = `
      <div class="help-section">
        <h3>📋 基本的な使い方</h3>
        <ol>
          <li><strong>テキスト入力</strong>: テキストエリアにログやテキストデータを貼り付け</li>
          <li><strong>ファイル読み込み</strong>: .txtや.logファイルをドラッグ&ドロップまたは選択</li>
          <li><strong>解析実行</strong>: 「解析する」ボタンをクリック</li>
          <li><strong>結果確認</strong>: IOCがハイライトされ、統計とグラフが表示されます</li>
        </ol>
      </div>

      <div class="help-section">
        <h3>🎯 検出できるIOCタイプ</h3>
        <div class="ioc-types">
          <div class="ioc-type-group">
            <h4>ネットワーク関連</h4>
            <ul>
              <li><span class="ioc-sample ipv4">IPv4</span> - 192.168.1.1</li>
              <li><span class="ioc-sample ipv6">IPv6</span> - 2001:db8::1</li>
              <li><span class="ioc-sample domain">ドメイン</span> - example.com</li>
              <li><span class="ioc-sample url">URL</span> - https://example.com</li>
              <li><span class="ioc-sample email">メール</span> - user@example.com</li>
            </ul>
          </div>
          <div class="ioc-type-group">
            <h4>ファイル・システム関連</h4>
            <ul>
              <li><span class="ioc-sample filePath">ファイルパス</span> - C:\\Windows\\System32</li>
              <li><span class="ioc-sample registryKey">レジストリキー</span> - HKLM\\Software</li>
              <li><span class="ioc-sample hash">ハッシュ値</span> - MD5/SHA1/SHA256/SHA512</li>
            </ul>
          </div>
          <div class="ioc-type-group">
            <h4>脅威インテリジェンス</h4>
            <ul>
              <li><span class="ioc-sample cve">CVE番号</span> - CVE-2021-44228</li>
              <li><span class="ioc-sample mitre">MITRE ATT&CK</span> - T1566.001</li>
              <li><span class="ioc-sample bitcoin">Bitcoin</span> - 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa</li>
              <li><span class="ioc-sample flag">CTFフラグ</span> - flag{example_flag}</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="help-section">
        <h3>⚪ ホワイトリスト機能</h3>
        <p>既知の安全なIOCを除外できます：</p>
        <ul>
          <li><strong>追加</strong>: テキストボックスに入力して「追加」ボタンまたはEnterキー</li>
          <li><strong>削除</strong>: 各項目の×ボタンをクリック</li>
          <li><strong>無効化</strong>: チェックボックスでON/OFF切り替え</li>
          <li><strong>自動保存</strong>: 設定は自動的にブラウザーに保存されます</li>
        </ul>
      </div>

      <div class="help-section">
        <h3>📊 統計とグラフ</h3>
        <ul>
          <li><strong>統計表示</strong>: 各IOCタイプの総数とユニーク数を表示</li>
          <li><strong>グラフ表示</strong>: 棒グラフで視覚的に確認</li>
          <li><strong>除外件数</strong>: ホワイトリストで除外された件数も表示</li>
          <li><strong>ダークモード対応</strong>: 月アイコンで切り替え可能</li>
        </ul>
      </div>

      <div class="help-section">
        <h3>📥 エクスポート機能</h3>
        <p>[.]・(.)・{.}、[@]・(@)・[at]、hxxp(s)、[://]・[:]//のdefang表記を検出します。
        画面には原文を表示し、正規形で集計します。「defangして出力」でネットワークIOCを無害化表記に戻せます。</p>
        <p>解析結果を以下の形式でダウンロードできます：</p>
        <ul>
          <li><strong>JSON形式</strong>: プログラムで処理しやすい構造化データ</li>
          <li><strong>CSV形式</strong>: Excelで開ける表形式（BOM付き）</li>
          <li><strong>テキスト形式</strong>: 読みやすいレポート形式</li>
        </ul>
      </div>

      <div class="help-section">
        <h3>⌨️ キーボードショートカット</h3>
        <ul>
          <li><strong>Enter</strong>: ホワイトリスト入力時に項目を追加</li>
          <li><strong>Escape</strong>: このヘルプを閉じる</li>
        </ul>
      </div>

      <div class="help-section">
        <h3>💡 活用例</h3>
        <ul>
          <li><strong>CTF競技</strong>: ログファイルからフラグやヒントを発見</li>
          <li><strong>インシデント対応</strong>: 攻撃者のIPやマルウェアハッシュを抽出</li>
          <li><strong>セキュリティ教育</strong>: ログ解析の練習教材として</li>
          <li><strong>脅威分析</strong>: IOCの収集と前処理</li>
        </ul>
      </div>

      <div class="help-section">
        <h3>⚠️ 注意事項</h3>
        <ul>
          <li>ファイルサイズは最大20MBまで</li>
          <li>すべての処理はブラウザー内で実行（データは外部送信されません）</li>
          <li>正規表現による検出のため、一部誤検出の可能性があります</li>
        </ul>
      </div>
    `;
    
    this.helpContent.innerHTML = content;
  }
}
