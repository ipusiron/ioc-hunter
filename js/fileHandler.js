import { CONFIG } from './config.js';

export class FileHandler {
  constructor() {
    this.maxSize = CONFIG.FILE.MAX_SIZE_BYTES;
    this.allowedExtensions = CONFIG.FILE.ALLOWED_EXTENSIONS;
  }

  async readFile(file) {
    const validation = this.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.message);
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'));
      reader.readAsText(file);
    });
  }

  validateFile(file) {
    if (file.size > this.maxSize) {
      return {
        valid: false,
        message: CONFIG.MESSAGES.FILE_TOO_LARGE
      };
    }

    const hasValidExtension = this.allowedExtensions.some(ext => 
      file.name.toLowerCase().endsWith(ext)
    );

    if (!hasValidExtension) {
      return {
        valid: false,
        message: CONFIG.MESSAGES.INVALID_FILE_TYPE
      };
    }

    return { valid: true };
  }

  async loadSampleFile(filename) {
    const response = await fetch(`samples/${filename}`);
    
    if (!response.ok) {
      throw new Error(`${CONFIG.MESSAGES.FILE_LOAD_ERROR}: ${filename}`);
    }
    
    return response.text();
  }

  async loadSampleList() {
    const response = await fetch('samples/list.txt');
    const text = await response.text();
    
    return text.split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line && line.includes(':'))
      .map(line => {
        const [filename, label] = line.split(':', 2);
        return { filename, label };
      });
  }
}