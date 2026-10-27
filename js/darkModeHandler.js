export class DarkModeHandler {
  constructor() {
    this.STORAGE_KEY = 'ioc-hunter-dark-mode';
    this.toggleButton = document.getElementById('darkModeToggle');
    // テーマのクラスは <html> に付ける（<head> の theme-init.js が最初の描画の前に付ける）
    this.root = document.documentElement;
    this.onToggleCallback = null;
  }

  init() {
    // 初回のテーマは js/theme-init.js が決める。アイコンは CSS がクラスに合わせて切り替える

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
    if (this.root.classList.contains('dark-mode')) {
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
    this.root.classList.add('dark-mode');
  }

  disableDarkMode() {
    this.root.classList.remove('dark-mode');
  }

  // ストレージが使えない環境では覚えないだけにして、初期化を止めない
  saveMode(isDark) {
    try {
      localStorage.setItem(this.STORAGE_KEY, isDark.toString());
    } catch (error) {
      console.error('Could not remember the theme.');
    }
  }

  getSavedMode() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved === null ? null : saved === 'true';
    } catch (error) {
      return null;
    }
  }
}