import { refang } from './scanner.js';

export class WhitelistManager {
  constructor() {
    this.STORAGE_KEY = 'ioc-hunter-whitelist';
    this.whitelist = new Set();
    this.enabled = true;
    this.onChangeCallback = null;
  }

  init() {
    this.loadFromStorage();
  }

  add(ioc) {
    if (!ioc || typeof ioc !== 'string') return false;
    
    const normalizedIOC = refang(ioc).trim().toLowerCase();
    if (normalizedIOC.length === 0 || this.whitelist.has(normalizedIOC)) return false;
    
    this.whitelist.add(normalizedIOC);
    this.saveToStorage();
    this.notifyChange();
    return true;
  }

  remove(ioc) {
    const normalizedIOC = refang(ioc).trim().toLowerCase();
    const deleted = this.whitelist.delete(normalizedIOC);
    if (deleted) {
      this.saveToStorage();
      this.notifyChange();
    }
    return deleted;
  }

  contains(ioc) {
    if (!this.enabled) return false;
    const normalizedIOC = refang(ioc).trim().toLowerCase();
    return this.whitelist.has(normalizedIOC);
  }

  getAll() {
    return Array.from(this.whitelist);
  }

  clear() {
    this.whitelist.clear();
    this.saveToStorage();
    this.notifyChange();
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    this.saveToStorage();
    this.notifyChange();
  }

  isEnabled() {
    return this.enabled;
  }

  saveToStorage() {
    const data = {
      whitelist: this.getAll(),
      enabled: this.enabled
    };
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Could not save the whitelist.');
    }
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.whitelist = new Set(data.whitelist || []);
        this.enabled = data.enabled !== false;
      }
    } catch (error) {
      console.error('Failed to load the whitelist.');
    }
  }

  importList(iocList) {
    if (!Array.isArray(iocList)) return 0;
    
    let added = 0;
    iocList.forEach(ioc => {
      if (this.add(ioc)) added++;
    });
    
    return added;
  }

  exportList() {
    return {
      whitelist: this.getAll(),
      enabled: this.enabled,
      exportDate: new Date().toISOString()
    };
  }

  setOnChangeCallback(callback) {
    this.onChangeCallback = callback;
  }

  notifyChange() {
    if (this.onChangeCallback) {
      this.onChangeCallback({
        whitelist: this.getAll(),
        enabled: this.enabled
      });
    }
  }


}
