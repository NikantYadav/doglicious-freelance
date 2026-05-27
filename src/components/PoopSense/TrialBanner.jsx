import React from 'react';

export const TrialBanner = ({ trial }) => {
  let cls = 'trial-banner act';
  let icon = '🎉';
  let txt = 'Free Trial Active';
  let sub = '₹499 / month';
  let countLabel = 'days left';

  if (trial.isSubscribed) {
    cls = 'trial-banner act';
    icon = '⭐';
    txt = 'Premium Active';
    sub = '₹499 / month';
  } else if (trial.isExpired) {
    cls = 'trial-banner exp';
    icon = '⏰';
    txt = 'Trial Expired';
    sub = 'Subscribe to continue';
    countLabel = 'days used';
  } else if (trial.daysLeft <= 2) {
    cls = 'trial-banner warn';
    icon = '⚠️';
    txt = 'Trial Ending Soon';
    sub = '₹499 / month';
  }

  const count = trial.isSubscribed ? '∞' : trial.isExpired ? `${trial.daysUsed}` : `${trial.daysLeft}`;

  return (
    <div className={cls}>
      <div className="tb-left">
        <div className="tb-icon">{icon}</div>
        <div>
          <div className="tb-txt">{txt}</div>
          <div className="tb-sub">{sub}</div>
        </div>
      </div>
      {trial.isSubscribed ? (
        <div className="tb-badge" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="tb-clbl" style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', color: '#FFD580' }}>ACTIVE</div>
        </div>
      ) : (
        <div className="tb-badge">
          <div className="tb-count">{count}</div>
          <div className="tb-clbl">{countLabel}</div>
        </div>
      )}
    </div>
  );
};
