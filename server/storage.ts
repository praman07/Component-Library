import fs from 'fs';
import path from 'path';

/**
 * Storage Abstraction Layer
 * Supports uploading, downloading, checking existence, and deleting component files/bundles.
 * Falls back safely to memory/local storage when external object storage is not configured.
 */
export interface StorageProvider {
  upload(key: string, content: string | Buffer): Promise<string>;
  download(key: string): Promise<string>;
  delete(key: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;
}

export class LocalStorageProvider implements StorageProvider {
  private baseDir: string;
  private memoryFallback: Map<string, string> = new Map();

  constructor(baseDir?: string) {
    this.baseDir = baseDir || path.resolve(process.cwd(), 'data', 'storage');
    try {
      if (!fs.existsSync(this.baseDir)) {
        fs.mkdirSync(this.baseDir, { recursive: true });
      }
    } catch (err) {
      // In read-only environments (e.g. Vercel serverless lambda), memory fallback is used
    }
  }

  private resolvePath(key: string): string {
    const safeKey = key.replace(/^[/\\]+/, '').replace(/\.\./g, '_');
    return path.resolve(this.baseDir, safeKey);
  }

  async upload(key: string, content: string | Buffer): Promise<string> {
    const stringContent = typeof content === 'string' ? content : content.toString('utf-8');
    try {
      const filePath = this.resolvePath(key);
      const parentDir = path.dirname(filePath);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
      fs.writeFileSync(filePath, content);
      this.memoryFallback.set(key, stringContent);
      return filePath;
    } catch (err) {
      this.memoryFallback.set(key, stringContent);
      return `mem://${key}`;
    }
  }

  async download(key: string): Promise<string> {
    if (this.memoryFallback.has(key)) {
      return this.memoryFallback.get(key)!;
    }
    const filePath = this.resolvePath(key);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      this.memoryFallback.set(key, content);
      return content;
    }
    throw new Error(`Storage key not found: ${key}`);
  }

  async delete(key: string): Promise<boolean> {
    this.memoryFallback.delete(key);
    try {
      const filePath = this.resolvePath(key);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
    } catch (err) {
      // Ignore
    }
    return false;
  }

  async exists(key: string): Promise<boolean> {
    if (this.memoryFallback.has(key)) {
      return true;
    }
    const filePath = this.resolvePath(key);
    return fs.existsSync(filePath);
  }
}

export const storage: StorageProvider = new LocalStorageProvider();
