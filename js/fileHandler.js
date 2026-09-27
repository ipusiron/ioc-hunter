import { CONFIG } from './config.js';

export class FileHandler {
  // i18n を渡さない場合はキーをそのまま返す（Nodeのテストから読めるようにするため）
  constructor(i18n = null) {
    this.i18n = i18n;
    this.maxSize = CONFIG.FILE.MAX_SIZE_BYTES;
    this.allowedExtensions = CONFIG.FILE.ALLOWED_EXTENSIONS;
  }

  t(key, values) {
    return this.i18n ? this.i18n.t(key, values) : key;
  }

  async readFile(file) {
    const validation = this.validateFile(file);
    if (!validation.valid) {
      throw new Error(this.t(validation.messageKey));
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error(this.t('error.fileRead')));
      reader.readAsText(file);
    });
  }

  validateFile(file) {
    if (file.size > this.maxSize) {
      return {
        valid: false,
        messageKey: 'error.fileTooLarge'
      };
    }

    const hasValidExtension = this.allowedExtensions.some(ext =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!hasValidExtension) {
      return {
        valid: false,
        messageKey: 'error.invalidFileType'
      };
    }

    return { valid: true };
  }

  async loadSampleFile(filename) {
    if (!/^[a-zA-Z0-9_-]+\.(?:txt|log)$/.test(filename)) {
      throw new Error(this.t('error.invalidSampleName'));
    }
    const response = await fetch(`samples/${filename}`);

    if (!response.ok) {
      throw new Error(this.t('error.sampleLoad', { filename }));
    }

    return response.text();
  }

  // list.txt は「ファイル名:日本語のラベル:英語のラベル」の3列である。
  async loadSampleList() {
    const response = await fetch('samples/list.txt');
    if (!response.ok) throw new Error(this.t('error.sampleList'));
    const text = await response.text();

    return text.split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line && line.includes(':'))
      .map(line => {
        const [filename, ja, en] = line.split(':');
        return { filename, labels: { ja, en: en || ja } };
      });
  }
}
