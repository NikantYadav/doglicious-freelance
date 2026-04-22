import React from 'react';

export const Header = ({ title, subtitle, showBack, onBack }) => (
    <div className="header">
        {showBack && <button className="back-btn" onClick={onBack}>← Back</button>}
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
    </div>
);

export const LogoWrap = ({ children, style }) => (
    <div className="logo-wrap" style={style}>
        {children}
    </div>
);

export const PrimaryButton = ({ children, ...props }) => (
    <button className="btn btn-primary" {...props}>
        {children}
    </button>
);

export const SecondaryButton = ({ children, ...props }) => (
    <button className="btn btn-secondary" {...props}>
        {children}
    </button>
);

export const ActionButton = ({ children, ...props }) => (
    <button className="btn btn-green" {...props}>
        {children}
    </button>
);
