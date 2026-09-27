import { escapeHtml } from './config.js';

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
    
    // ヘルプコンテンツを生成し、言語を変えたら作り直す
    this.generateHelpContent();
    document.addEventListener('languagechange', () => this.generateHelpContent());
  }

  show() {
    this.previousFocus = document.activeElement;
    this.modal.hidden = false;
    this.inertStates = [...document.body.children].filter(item => item !== this.modal)
      .map(item => [item, item.inert]);
    this.inertStates.forEach(([item]) => { item.inert = true; });
    document.body.classList.add('modal-open');
    this.closeButton.focus(); // フォーカスを移動する
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

  // 文言は辞書にあり、ここには残さない。
  // リストは言語を切り替えるたびに作り直す。
  generateHelpContent() {
    const t = (key) => escapeHtml(window.I18n.t(key));
    const item = (label, text) => `<li><strong>${t(label)}</strong>: ${t(text)}</li>`;
    const sample = (type, label, example) =>
      `<li><span class="ioc-sample ${type}">${t(label)}</span> - ${escapeHtml(example)}</li>`;
    const content = `
      <div class="help-section">
        <h3>${t('helpDoc.basicHeading')}</h3>
        <ol>
          ${item('helpDoc.basic1Label', 'helpDoc.basic1')}
          ${item('helpDoc.basic2Label', 'helpDoc.basic2')}
          ${item('helpDoc.basic3Label', 'helpDoc.basic3')}
          ${item('helpDoc.basic4Label', 'helpDoc.basic4')}
        </ol>
      </div>

      <div class="help-section">
        <h3>${t('helpDoc.typesHeading')}</h3>
        <div class="ioc-types">
          <div class="ioc-type-group">
            <h4>${t('helpDoc.typesNetwork')}</h4>
            <ul>
              <li><span class="ioc-sample ipv4">IPv4</span> - 192.168.1.1</li>
              <li><span class="ioc-sample ipv6">IPv6</span> - 2001:db8::1</li>
              ${sample('domain', 'helpDoc.typeDomain', 'example.com')}
              <li><span class="ioc-sample url">URL</span> - https://example.com</li>
              ${sample('email', 'helpDoc.typeEmail', 'user@example.com')}
            </ul>
          </div>
          <div class="ioc-type-group">
            <h4>${t('helpDoc.typesFile')}</h4>
            <ul>
              ${sample('filePath', 'helpDoc.typeFilePath', String.raw`C:\Windows\System32`)}
              ${sample('registryKey', 'helpDoc.typeRegistry', String.raw`HKLM\Software`)}
              ${sample('hash', 'helpDoc.typeHash', 'MD5/SHA1/SHA256/SHA512')}
            </ul>
          </div>
          <div class="ioc-type-group">
            <h4>${t('helpDoc.typesThreat')}</h4>
            <ul>
              ${sample('cve', 'helpDoc.typeCve', 'CVE-2021-44228')}
              <li><span class="ioc-sample mitre">MITRE ATT&CK</span> - T1566.001</li>
              <li><span class="ioc-sample bitcoin">Bitcoin</span> - 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa</li>
              ${sample('flag', 'helpDoc.typeFlag', 'flag{example_flag}')}
            </ul>
          </div>
        </div>
      </div>

      <div class="help-section">
        <h3>${t('helpDoc.whitelistHeading')}</h3>
        <p>${t('helpDoc.whitelistLead')}</p>
        <ul>
          ${item('helpDoc.whitelistAddLabel', 'helpDoc.whitelistAdd')}
          ${item('helpDoc.whitelistRemoveLabel', 'helpDoc.whitelistRemove')}
          ${item('helpDoc.whitelistDisableLabel', 'helpDoc.whitelistDisable')}
          ${item('helpDoc.whitelistSaveLabel', 'helpDoc.whitelistSave')}
        </ul>
      </div>

      <div class="help-section">
        <h3>${t('helpDoc.statsHeading')}</h3>
        <ul>
          ${item('helpDoc.statsCountLabel', 'helpDoc.statsCount')}
          ${item('helpDoc.statsChartLabel', 'helpDoc.statsChart')}
          ${item('helpDoc.statsFilteredLabel', 'helpDoc.statsFiltered')}
          ${item('helpDoc.statsThemeLabel', 'helpDoc.statsTheme')}
        </ul>
      </div>

      <div class="help-section">
        <h3>${t('helpDoc.exportHeading')}</h3>
        <p>${t('helpDoc.exportDefang')}</p>
        <p>${t('helpDoc.exportLead')}</p>
        <ul>
          ${item('helpDoc.exportJsonLabel', 'helpDoc.exportJson')}
          ${item('helpDoc.exportCsvLabel', 'helpDoc.exportCsv')}
          ${item('helpDoc.exportTxtLabel', 'helpDoc.exportTxt')}
        </ul>
      </div>

      <div class="help-section">
        <h3>${t('helpDoc.keysHeading')}</h3>
        <ul>
          <li><strong>Enter</strong>: ${t('helpDoc.keyEnter')}</li>
          <li><strong>Escape</strong>: ${t('helpDoc.keyEscape')}</li>
        </ul>
      </div>

      <div class="help-section">
        <h3>${t('helpDoc.useHeading')}</h3>
        <ul>
          ${item('helpDoc.useCtfLabel', 'helpDoc.useCtf')}
          ${item('helpDoc.useIrLabel', 'helpDoc.useIr')}
          ${item('helpDoc.useEduLabel', 'helpDoc.useEdu')}
          ${item('helpDoc.useThreatLabel', 'helpDoc.useThreat')}
        </ul>
      </div>

      <div class="help-section">
        <h3>${t('helpDoc.notesHeading')}</h3>
        <ul>
          <li>${t('helpDoc.note1')}</li>
          <li>${t('helpDoc.note2')}</li>
          <li>${t('helpDoc.note3')}</li>
        </ul>
      </div>
    `;

    this.helpContent.innerHTML = content;
  }
}
