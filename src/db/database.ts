import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

let ready: Promise<SQLiteDatabase> | null = null;

export function getDatabase(): Promise<SQLiteDatabase> {
  if (!ready) {
    ready = (async () => {
      const db = await openDatabaseAsync('english_habit.db');
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS check_ins (
          date_key TEXT PRIMARY KEY NOT NULL,
          checked_at TEXT NOT NULL,
          study_minutes INTEGER
        );
        CREATE TABLE IF NOT EXISTS daily_notes (
          date_key TEXT PRIMARY KEY NOT NULL,
          body TEXT NOT NULL DEFAULT ''
        );
        CREATE TABLE IF NOT EXISTS vocab_by_day (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date_key TEXT NOT NULL,
          word TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS reminder_slots (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          hour INTEGER NOT NULL,
          minute INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS app_settings (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL
        );
      `);
      return db;
    })();
  }
  return ready;
}
