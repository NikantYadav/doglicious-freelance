export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function pad(n) {
  return String(n).padStart(2, '0');
}

export function fmtDate(d) {
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function fmtDateShort(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d} ${MONTHS[parseInt(m, 10) - 1]?.slice(0, 3)} ${y}`;
}

export function timeNow() {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function calcAge(dob) {
  if (!dob) return { years: 0, months: 0, days: 0, label: 'Unknown' };
  const birth = new Date(dob);
  const today = new Date();
  let yrs = today.getFullYear() - birth.getFullYear();
  let mo = today.getMonth() - birth.getMonth();
  if (mo < 0) { yrs--; mo += 12; }
  const totalDays = Math.floor((today.getTime() - birth.getTime()) / 86400000);
  const parts = [];
  if (yrs > 0) parts.push(`${yrs}yr`);
  if (mo > 0) parts.push(`${mo}mo`);
  const label = parts.length ? parts.join(' ') : `${totalDays} days`;
  return { years: yrs, months: mo, days: totalDays, label };
}

/**
 * Compute trial/subscription display status.
 *
 * Driven entirely by the `quota` object returned by psGetQuota() — all quota
 * values (prices, limits, days) come from the backend env and are never
 * hardcoded or stored on the frontend.
 *
 * Pass `quota=null` only before the first psGetQuota() response arrives; the
 * function returns a safe loading state in that case.
 *
 * Returned shape:
 *   { isSubscribed, isTrial, isExpired, isLoading,
 *     scansLeft, scansUsed, trialScans, trialDays,
 *     dailyUsed, dailyCap, periodCap,
 *     subPrice, subDays, daysLeft, daysUsed }
 */
export function getTrialStatus(startDateStr, subscribed, quota = null) {
  // ── Quota not loaded yet — safe loading state ──────────────────────
  if (!quota) {
    return {
      isLoading:    true,
      isSubscribed: !!subscribed,
      isTrial:      !subscribed,
      isExpired:    false,
      scansLeft:    null,
      scansUsed:    null,
      trialScans:   null,
      trialDays:    null,
      dailyUsed:    null,
      dailyCap:     null,
      periodCap:    null,
      subPrice:     null,
      subDays:      null,
      daysLeft:     null,
      daysUsed:     null,
    };
  }

  // ── Subscribed ─────────────────────────────────────────────────────
  if (quota.subscribed) {
    const subExpiresAt = quota.subExpiresAt ? new Date(quota.subExpiresAt) : null;
    const daysLeft = subExpiresAt
      ? Math.max(0, Math.ceil((subExpiresAt.getTime() - Date.now()) / 86400000))
      : 0;
    return {
      isLoading:    false,
      isSubscribed: true,
      isTrial:      false,
      isExpired:    false,
      scansLeft:    Math.max(0, quota.periodCap - (quota.scanCount ?? 0)),
      scansUsed:    quota.scanCount ?? 0,
      trialScans:   quota.trialScans,
      trialDays:    quota.trialDays,
      dailyUsed:    quota.dailyUsed ?? 0,
      dailyCap:     quota.dailyCap,
      periodCap:    quota.periodCap,
      subPrice:     quota.subPrice,
      subDays:      quota.subDays,
      daysLeft,
      daysUsed:     Math.max(0, quota.subDays - daysLeft),
    };
  }

  // ── Free / trial ────────────────────────────────────────────────────
  const scansUsed = quota.scanCount ?? 0;
  const scansLeft = Math.max(0, quota.trialScans - scansUsed);

  const startDate = startDateStr ? new Date(startDateStr) : null;
  const daysUsed  = startDate
    ? Math.floor((Date.now() - startDate.getTime()) / 86400000)
    : 0;
  const daysLeft  = startDate
    ? Math.max(0, quota.trialDays - daysUsed)
    : quota.trialDays;

  const isExpired = quota.trialWindowElapsed || scansLeft === 0;

  return {
    isLoading:    false,
    isSubscribed: false,
    isTrial:      !isExpired,
    isExpired,
    scansLeft,
    scansUsed,
    trialScans:   quota.trialScans,
    trialDays:    quota.trialDays,
    dailyUsed:    0,
    dailyCap:     quota.dailyCap,
    periodCap:    quota.periodCap,
    subPrice:     quota.subPrice,
    subDays:      quota.subDays,
    daysLeft,
    daysUsed,
  };
}
