import React from 'react';

export default function ModalContainer({ isOpen, onClose, title, children, maxWidth = "500px", className = "" }) {
    return (
        <div className={`mbk${isOpen ? ' o' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className={`mbox ${className}`} style={{ maxWidth }} onClick={(e) => e.stopPropagation()}>
                {title !== undefined && title !== '' && (
                    <div className="mh">
                        <h3 className="mtitle">{title}</h3>
                        <button className="mcl" onClick={onClose}>
                            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
                        </button>
                    </div>
                )}
                {children}
            </div>
        </div>
    );
}
