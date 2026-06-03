import React from 'react';

/**
 * TrialBanner — shows current scan quota status in the app header.
 * `trial` is the object returned by getTrialStatus() — all values come
 * from the backend quota, no frontend constants.
 */
export const TrialBanner = ({ trial }) => {
  // Still loading quota from backend
  if (trial.isLoading) {
    return (
      <div className="trial-banner act" style={{ opacity: 0.5 }}>
        <div className="tb-left">
          <div className="tb-icon">⏳</div>
          <div>
            <div className="tb-txt">Loading…</div>
            <div className="tb-sub">Fetching your quota</div>
          </div>
        </div>
      </div>
    );
  }

  // ── Subscribed ───────────────────────────────────────────────────
  if (trial.isSubscribed) {
    const dailyLeft = Math.max(0, trial.dailyCap - trial.dailyUsed);
    return (
      <div className="trial-banner act">
        <div className="tb-left">
          <div className="tb-icon">⭐</div>
          <div>
            <div className="tb-txt">Premium Active</div>
            <div className="tb-sub">
              {dailyLeft} scan{dailyLeft !== 1 ? 's' : ''} left today · {trial.daysLeft}d remaining
            </div>
          </div>
        </div>
        <div className="tb-badge" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="tb-count" style={{ fontSize: 16 }}>{trial.scansLeft}</div>
          <div className="tb-clbl">scans left</div>
        </div>
      </div>
    );
  }

  // ── Trial expired ────────────────────────────────────────────────
  if (trial.isExpired) {
    return (
      <div className="trial-banner exp">
        <div className="tb-left">
          <div className="tb-icon">⏰</div>
          <div>
            <div className="tb-txt">Trial Ended</div>
            <div className="tb-sub">
              Subscribe to continue{trial.subPrice ? ` · ₹${trial.subPrice}/month` : ''}
            </div>
          </div>
        </div>
        <div className="tb-badge">
          <div className="tb-count">0</div>
          <div className="tb-clbl">scans left</div>
        </div>
      </div>
    );
  }

  // ── Trial active ─────────────────────────────────────────────────
  const warn = trial.scansLeft <= 1;
  return (
    <div className={warn ? 'trial-banner warn' : 'trial-banner act'}>
      <div className="tb-left">
        <div className="tb-icon">{warn ? '⚠️' : '🎉'}</div>
        <div>
          <div className="tb-txt">{warn ? 'Last Free Scan' : 'Free Trial'}</div>
          <div className="tb-sub">
            {trial.daysLeft}d left{trial.subPrice ? ` · ₹${trial.subPrice}/month after` : ''}
          </div>
        </div>
      </div>
      <div className="tb-badge">
        <div className="tb-count">{trial.scansLeft}</div>
        <div className="tb-clbl">scans left</div>
      </div>
    </div>
  );
};
