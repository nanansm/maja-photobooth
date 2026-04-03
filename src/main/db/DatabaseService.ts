import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import fs from 'fs';
import * as types from '../../shared/types';

export class DatabaseService {
  private db: Database.Database | null = null;
  private dbPath: string;

  constructor() {
    const userDataPath = app.getPath('userData');
    this.dbPath = path.join(userDataPath, 'photobooth.db');
  }

  connect(): void {
    try {
      this.db = new Database(this.dbPath);
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('foreign_keys = ON');
      console.log(`Database connected at ${this.dbPath}`);
    } catch (error) {
      console.error('Failed to connect to database:', error);
      throw error;
    }
  }

  initialize(): void {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    const schema = `
      -- Packages
      CREATE TABLE IF NOT EXISTS packages (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        price INTEGER NOT NULL,
        photo_count INTEGER NOT NULL,
        print_count INTEGER NOT NULL,
        digital_copy INTEGER DEFAULT 1,
        is_active INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Sessions
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        package_id TEXT,
        payment_status TEXT DEFAULT 'pending',
        payment_method TEXT,
        xendit_invoice_id TEXT,
        amount INTEGER,
        photo_count INTEGER DEFAULT 0,
        print_count INTEGER DEFAULT 0,
        completed_at DATETIME,
        FOREIGN KEY (package_id) REFERENCES packages(id)
      );

      -- Photos
      CREATE TABLE IF NOT EXISTS photos (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        file_path TEXT NOT NULL,
        processed_path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
      );

      -- Config (key-value store)
      CREATE TABLE IF NOT EXISTS config (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Print queue
      CREATE TABLE IF NOT EXISTS print_jobs (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        file_path TEXT NOT NULL,
        printer_name TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        copies INTEGER DEFAULT 1,
        paper_size TEXT DEFAULT '4x6',
        quality TEXT DEFAULT 'normal',
        color_mode TEXT DEFAULT 'color',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        printed_at DATETIME,
        error_message TEXT,
        FOREIGN KEY (session_id) REFERENCES sessions(id)
      );

      -- Frames
      CREATE TABLE IF NOT EXISTS frames (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        preview_image TEXT NOT NULL,
        overlay_image TEXT NOT NULL,
        template_json TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Activity logs
      CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        level TEXT NOT NULL,
        message TEXT NOT NULL,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Indexes
      CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(payment_status);
      CREATE INDEX IF NOT EXISTS idx_sessions_created ON sessions(created_at);
      CREATE INDEX IF NOT EXISTS idx_photos_session ON photos(session_id);
      CREATE INDEX IF NOT EXISTS idx_print_jobs_status ON print_jobs(status);
      CREATE INDEX IF NOT EXISTS idx_logs_created ON logs(created_at);
    `;

    const statements = schema.split(';').filter(s => s.trim());
    for (const statement of statements) {
      try {
        this.db!.exec(statement);
      } catch (error) {
        console.error('Error executing SQL:', statement, error);
      }
    }

    this.seedDefaultData();
    console.log('Database schema initialized');
  }

  private seedDefaultData(): void {
    // Insert default packages if none exist
    const packages = this.db!.prepare('SELECT COUNT(*) as count FROM packages');
    const result = packages.get() as { count: number };

    if (result.count === 0) {
      const insertPackage = this.db!.prepare(
        `INSERT INTO packages (id, name, price, photo_count, print_count, digital_copy, is_active, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      );

      const defaultPackages = [
        ['basic', '1 Strip Photo', 15000, 4, 1, 1, 1, 1],
        ['standard', '2 Strip Photo', 25000, 8, 2, 1, 1, 2],
        ['digital-only', 'Digital Only', 10000, 4, 0, 1, 1, 3]
      ];

      for (const pkg of defaultPackages) {
        insertPackage.run(...pkg);
      }
      console.log('Default packages seeded');
    }

    // Insert default frames if none exist
    const frames = this.db!.prepare('SELECT COUNT(*) as count FROM frames');
    const frameResult = frames.get() as { count: number };

    if (frameResult.count === 0) {
      // Create assets/frames directory if it doesn't exist
      const framesDir = path.join(process.cwd(), 'assets', 'frames');
      if (!fs.existsSync(framesDir)) {
        fs.mkdirSync(framesDir, { recursive: true });
      }

      console.log('Default frames directory created. Add frame PNG and JSON templates to assets/frames/');
    }
  }

  // Generic query helpers
  query<T>(sql: string, params?: any[]): T[] {
    if (!this.db) throw new Error('Database not connected');
    const stmt = this.db.prepare(sql);
    return stmt.all(params) as T[];
  }

  getOne<T>(sql: string, params?: any[]): T | null {
    if (!this.db) throw new Error('Database not connected');
    const stmt = this.db.prepare(sql);
    return (stmt.get(params) as T) || null;
  }

  run(sql: string, params?: any[]): { changes: number; lastInsertRowid: number } {
    if (!this.db) throw new Error('Database not connected');
    const stmt = this.db.prepare(sql);
    const result = stmt.run(params);
    // Convert lastInsertRowid to number (better-sqlite3 v9 returns bigint)
    return {
      changes: result.changes,
      lastInsertRowid: Number(result.lastInsertRowid)
    };
  }

  // Transactions
  transaction<T>(callback: (db: Database.Database) => T): T {
    if (!this.db) throw new Error('Database not connected');
    // @ts-ignore - transaction type definitions may vary
    return this.db.transaction(callback)();
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Singleton instance
let dbInstance: DatabaseService | null = null;

export function getDatabase(): DatabaseService {
  if (!dbInstance) {
    dbInstance = new DatabaseService();
  }
  return dbInstance;
}
