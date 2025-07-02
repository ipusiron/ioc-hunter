export class DarkModeHandler {
  constructor() {
    this.STORAGE_KEY = 'ioc-hunter-dark-mode';
    this.toggleButton = document.getElementById('darkModeToggle');
    this.body = document.body;
    this.onToggleCallback = null;
  }

  init() {
    // 保存された設定またはシステム設定を適用
    const savedMode = this.getSavedMode();
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDarkMode = savedMode !== null ? savedMode : systemPrefersDark;
    
    if (shouldUseDarkMode) {
      this.enableDarkMode();
    }

    // ボタンクリックイベント
    this.toggleButton.addEventListener('click', () => this.toggle());

    // システム設定の変更を監視（保存された設定がない場合のみ）
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (this.getSavedMode() === null) {
        if (e.matches) {
          this.enableDarkMode();
        } else {
          this.disableDarkMode();
        }
      }
    });
  }

  toggle() {
    if (this.body.classList.contains('dark-mode')) {
      this.disableDarkMode();
      this.saveMode(false);
    } else {
      this.enableDarkMode();
      this.saveMode(true);
    }
    
    // コールバックを実行（グラフの再描画など）
    if (this.onToggleCallback) {
      this.onToggleCallback();
    }
  }

  setOnToggleCallback(callback) {
    this.onToggleCallback = callback;
  }

  enableDarkMode() {
    this.body.classList.add('dark-mode');
  }

  disableDarkMode() {
    this.body.classList.remove('dark-mode');
  }

  saveMode(isDark) {
    localStorage.setItem(this.STORAGE_KEY, isDark.toString());
  }

  getSavedMode() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    return saved === null ? null : saved === 'true';
  }
}