import React from 'react';
import { useApp } from './AppContext';
import { getTrialStatus, fmtDate } from './helpers';

const GlobalInfoBar = () => {
  const { state } = useApp();
  const trialStatus = getTrialStatus(state.startDate, state.subscribed);

  const startLabel = state.startDate
    ? `Member since ${fmtDate(new Date(state.startDate))}`
    : 'Member since -';

  const daysLabel = state.subscribed
    ? '✓ Active'
    : `${trialStatus.daysLeft}/7 days`;

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
