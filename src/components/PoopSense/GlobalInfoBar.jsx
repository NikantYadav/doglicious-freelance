import React from 'react';
import { useApp } from './AppContext';
import { getTrialStatus, fmtDate } from './helpers';

const GlobalInfoBar = ({ quota }) => {
  const { state } = useApp();
  const trialStatus = getTrialStatus(state.startDate, state.subscribed, quota);

  const startLabel = state.startDate
    ? `Member since ${fmtDate(new Date(state.startDate))}`
    : 'Member since -';

  let daysLabel;
  if (trialStatus.isSubscribed) {
    daysLabel = `✓ Active · ${trialStatus.daysLeft ?? '—'}d left`;
  } else if (trialStatus.isLoading || trialStatus.daysLeft === null || trialStatus.trialDays === null) {
    daysLabel = '…';
  } else {
    daysLabel = `${trialStatus.daysLeft}/${trialStatus.trialDays} days`;
  }

  return (
    <div
      style={{
        background: 'rgba(58,39,0,.08)',
        padding: '5px 16px',
        fontSize: '10px',
        color: 'var(--t2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--bd)',
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <span style={{ color: 'var(--t3)' }}>{startLabel}</span>
      <span style={{ fontWeight: 700, color: 'var(--a)' }}>{daysLabel}</span>
    </div>
  );
};

export default GlobalInfoBar;
