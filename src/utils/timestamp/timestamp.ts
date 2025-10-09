// src/utils/timestamp/timestamp.ts

export type Dateish = Date | number | string;

/** Defensive parse: accepts Date, epoch (ms) as number/string, or ISO string */
export function parseDate(input: Dateish): Date {
  if (input instanceof Date) return input;
  if (typeof input === "number") return new Date(input);
  // string: try number first, then Date parse
  const maybeNum = Number(input);
  return Number.isFinite(maybeNum) ? new Date(maybeNum) : new Date(input);
}

export function formatLocal(
  date: Dateish,
  opts: Intl.DateTimeFormatOptions = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }
): string {
  return parseDate(date).toLocaleString(undefined, opts);
}

export function formatUTC(date: Dateish): string {
  const d = parseDate(date);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  const ss = String(d.getUTCSeconds()).padStart(2, "0");
  return `${y}-${m}-${day} ${hh}:${mm}:${ss} UTC`;
}

/** Returns label like "UTC-03:00" */
export function getUtcOffsetLabel(date: Dateish): string {
  const d = parseDate(date);
  const mins = -d.getTimezoneOffset(); // JS: negative means ahead of UTC
  const sign = mins >= 0 ? "+" : "-";
  const h = Math.floor(Math.abs(mins) / 60);
  const m = Math.abs(mins) % 60;
  return `UTC${sign}${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function toEpochMs(date: Dateish): number {
  return parseDate(date).getTime();
}

/** "Oct 06, 2025, 10:24 – 10:27" or spans with date on both sides if different days */
export function formatTimeRange(start: Dateish, end: Dateish): string {
  const s = parseDate(start);
  const e = parseDate(end);

  const sameDay =
    s.getFullYear() === e.getFullYear() &&
    s.getMonth() === e.getMonth() &&
    s.getDate() === e.getDate();

  const dOpts: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "2-digit",
  };
  const tOpts: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
  };

  const sDate = s.toLocaleDateString(undefined, dOpts);
  const eDate = e.toLocaleDateString(undefined, dOpts);
  const sTime = s.toLocaleTimeString(undefined, tOpts);
  const eTime = e.toLocaleTimeString(undefined, tOpts);

  return sameDay ? `${sDate}, ${sTime} – ${eTime}` : `${sDate} ${sTime} → ${eDate} ${eTime}`;
}

/** Seconds since a given epoch (ms) */
export function secondsSince(epochMs: number, at: Dateish = Date.now()): number {
  const diff = Math.max(0, toEpochMs(at) - epochMs);
  return Math.floor(diff / 1000);
}
