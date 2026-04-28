import { getDatabase } from './database';
import {
  addDays,
  dateKey,
  endOfWeekSunday,
  parseDateKey,
  startOfWeekMonday,
} from '../utils/dateKey';

export type CheckInRow = {
  date_key: string;
  checked_at: string;
  study_minutes: number | null;
};

export async function upsertCheckIn(
  dateKeyStr: string,
  studyMinutes: number | null
): Promise<void> {
  const db = await getDatabase();
  const checkedAt = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO check_ins (date_key, checked_at, study_minutes)
     VALUES (?, ?, ?)
     ON CONFLICT(date_key) DO UPDATE SET
       checked_at = excluded.checked_at,
       study_minutes = COALESCE(excluded.study_minutes, check_ins.study_minutes)`,
    [dateKeyStr, checkedAt, studyMinutes]
  );
}

/** Replace today's study minutes when user only updates duration */
export async function updateTodayStudyMinutes(
  dateKeyStr: string,
  studyMinutes: number | null
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE check_ins SET study_minutes = ? WHERE date_key = ?`,
    [studyMinutes, dateKeyStr]
  );
}

export async function listCheckInsDesc(limit = 120): Promise<CheckInRow[]> {
  const db = await getDatabase();
  return await db.getAllAsync<CheckInRow>(
    `SELECT date_key, checked_at, study_minutes FROM check_ins
     ORDER BY date_key DESC LIMIT ?`,
    [limit]
  );
}

export async function getDistinctCheckInDates(): Promise<Set<string>> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ date_key: string }>(
    `SELECT date_key FROM check_ins`
  );
  return new Set(rows.map((r) => r.date_key));
}

export async function getCheckIn(dateKeyStr: string): Promise<CheckInRow | null> {
  const db = await getDatabase();
  return (
    (await db.getFirstAsync<CheckInRow>(
      `SELECT date_key, checked_at, study_minutes FROM check_ins WHERE date_key = ?`,
      [dateKeyStr]
    )) ?? null
  );
}

export function computeStreak(dateSet: Set<string>): number {
  const today = dateKey(new Date());
  const yKey = dateKey(addDays(new Date(), -1));
  if (!dateSet.has(today) && !dateSet.has(yKey)) return 0;
  const anchor = dateSet.has(today) ? today : yKey;
  let count = 0;
  let cur = parseDateKey(anchor);
  while (dateSet.has(dateKey(cur))) {
    count += 1;
    cur = addDays(cur, -1);
  }
  return count;
}

export async function getDailyNote(dateKeyStr: string): Promise<string> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ body: string }>(
    `SELECT body FROM daily_notes WHERE date_key = ?`,
    [dateKeyStr]
  );
  return row?.body ?? '';
}

export async function saveDailyNote(dateKeyStr: string, body: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO daily_notes (date_key, body) VALUES (?, ?)
     ON CONFLICT(date_key) DO UPDATE SET body = excluded.body`,
    [dateKeyStr, body]
  );
}

export type VocabRow = { id: number; date_key: string; word: string };

export async function listVocabForDay(dateKeyStr: string): Promise<VocabRow[]> {
  const db = await getDatabase();
  return await db.getAllAsync<VocabRow>(
    `SELECT id, date_key, word FROM vocab_by_day WHERE date_key = ? ORDER BY id ASC`,
    [dateKeyStr]
  );
}

export async function addVocabWord(dateKeyStr: string, word: string): Promise<void> {
  const w = word.trim();
  if (!w) return;
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO vocab_by_day (date_key, word) VALUES (?, ?)`,
    [dateKeyStr, w]
  );
}

export async function deleteVocabWord(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM vocab_by_day WHERE id = ?`, [id]);
}

export type ReminderSlot = { id: number; hour: number; minute: number };

export async function listReminderSlots(): Promise<ReminderSlot[]> {
  const db = await getDatabase();
  return await db.getAllAsync<ReminderSlot>(
    `SELECT id, hour, minute FROM reminder_slots ORDER BY hour, minute`
  );
}

export async function addReminderSlot(hour: number, minute: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`INSERT INTO reminder_slots (hour, minute) VALUES (?, ?)`, [
    hour,
    minute,
  ]);
}

export async function deleteReminderSlot(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM reminder_slots WHERE id = ?`, [id]);
}

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>(
    `SELECT value FROM app_settings WHERE key = ?`,
    [key]
  );
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO app_settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [key, value]
  );
}

export async function getNudgeConfig(): Promise<{
  enabled: boolean;
  hour: number;
  minute: number;
}> {
  const enabled = (await getSetting('nudge_enabled')) === '1';
  const h = parseInt((await getSetting('nudge_hour')) ?? '20', 10);
  const m = parseInt((await getSetting('nudge_minute')) ?? '0', 10);
  return {
    enabled,
    hour: Number.isFinite(h) ? h : 20,
    minute: Number.isFinite(m) ? m : 0,
  };
}

export async function setNudgeConfig(
  enabled: boolean,
  hour: number,
  minute: number
): Promise<void> {
  await setSetting('nudge_enabled', enabled ? '1' : '0');
  await setSetting('nudge_hour', String(hour));
  await setSetting('nudge_minute', String(minute));
}

export type WeekStats = { daysStudied: number; totalMinutes: number };
export type MonthStats = { daysStudied: number; totalMinutes: number };

export async function statsForWeekContaining(date: Date): Promise<WeekStats> {
  const start = startOfWeekMonday(date);
  const end = endOfWeekSunday(start);
  const from = dateKey(start);
  const to = dateKey(end);
  return aggregateRange(from, to);
}

export async function statsForMonthContaining(date: Date): Promise<MonthStats> {
  const y = date.getFullYear();
  const mo = date.getMonth();
  const from = dateKey(new Date(y, mo, 1));
  const to = dateKey(new Date(y, mo + 1, 0));
  return aggregateRange(from, to);
}

async function aggregateRange(
  fromKey: string,
  toKey: string
): Promise<{ daysStudied: number; totalMinutes: number }> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ c: number; m: number | null }>(
    `SELECT COUNT(*) as c, COALESCE(SUM(study_minutes), 0) as m FROM check_ins
     WHERE date_key >= ? AND date_key <= ?`,
    [fromKey, toKey]
  );
  return {
    daysStudied: row?.c ?? 0,
    totalMinutes: row?.m ?? 0,
  };
}
