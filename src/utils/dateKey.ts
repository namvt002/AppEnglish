/** Local calendar date as YYYY-MM-DD */
export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(keyOrDate: string | Date, delta: number): Date {
  const base = typeof keyOrDate === 'string' ? parseDateKey(keyOrDate) : new Date(keyOrDate);
  const out = new Date(base);
  out.setDate(out.getDate() + delta);
  return out;
}

export function formatDisplayVi(key: string): string {
  const d = parseDateKey(key);
  return d.toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function startOfWeekMonday(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  return x;
}

export function endOfWeekSunday(startMonday: Date): Date {
  const x = new Date(startMonday);
  x.setDate(x.getDate() + 6);
  return x;
}
