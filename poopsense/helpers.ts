export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function pad(n: number | string): string {
  return String(n).padStart(2, '0');
}

export function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function fmtDateShort(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d} ${MONTHS[parseInt(m, 10) - 1]?.slice(0, 3)} ${y}`;
}

export function timeNow(): string {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export interface AgeResult {
  years: number;
  months: number;
  days: number;
  label: string;
}

export function calcAge(dob: string): AgeResult {
  if (!dob) return { years: 0, months: 0, days: 0, label: 'Unknown' };
  const birth = new Date(dob);
  const today = new Date();
  let yrs = today.getFullYear() - birth.getFullYear();
  let mo = today.getMonth() - birth.getMonth();
  if (mo < 0) { yrs--; mo += 12; }
  const totalDays = Math.floor((today.getTime() - birth.getTime()) / 86400000);
  const parts: string[] = [];
  if (yrs > 0) parts.push(`${yrs}yr`);
  if (mo > 0) parts.push(`${mo}mo`);
  const label = parts.length ? parts.join(' ') : `${totalDays} days`;
  return { years: yrs, months: mo, days: totalDays, label };
}

const TRIAL_DAYS = 7;

export interface TrialStatus {
  daysLeft: number;
  daysUsed: number;
  isExpired: boolean;
  isSubscribed: boolean;
  startDate: Date | null;
}

export function getTrialStatus(
  startDateStr: string | null,
  subscribed: boolean,
): TrialStatus {
  if (subscribed) {
    return { daysLeft: 999, daysUsed: 0, isExpired: false, isSubscribed: true, startDate: null };
  }
  if (!startDateStr) {
    return { daysLeft: TRIAL_DAYS, daysUsed: 0, isExpired: false, isSubscribed: false, startDate: null };
  }
  const startDate = new Date(startDateStr);
  const today = new Date();
  const daysUsed = Math.floor((today.getTime() - startDate.getTime()) / 86400000) + 1;
  const daysLeft = Math.max(0, TRIAL_DAYS - daysUsed + 1);
  return {
    daysLeft,
    daysUsed: Math.min(daysUsed, TRIAL_DAYS),
    isExpired: daysLeft === 0,
    isSubscribed: false,
    startDate,
  };
}

export const DAILY_SCAN_LIMIT = 4;