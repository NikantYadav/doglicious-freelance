import React from 'react';
import { TOOL_TITLES, TOOL_SRCS } from '../../data/homeData';

export default function ToolsModal({ isOpen, onClose, activeTool, setActiveTool }) {
    // iframe height: on mobile use viewport height, on desktop fixed
    const iframeHeight = typeof window !== 'undefined' && window.innerWidth < 768
        ? `${window.innerHeight * 0.65}px`
        : '560px';

    return (
        <div className={`mbk${isOpen ? ' o' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="mbox tools-modal-wide" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="tools-header">
                    <span style={{ fontWeight: "600", fontSize: "15px" }}>{TOOL_TITLES[activeTool]}</span>
                    <button className="mcl" onClick={onClose}>
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                            <path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                {/* Scrollable tabs */}
                <div className="tool-tabs">
                    {TOOL_TITLES.map((t, i) => (
                        <button
                            key={i}
                            className={`tool-tab${activeTool === i ? ' a' : ''}`}
                            onClick={() => setActiveTool(i)}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {/* Tool iframe — uses static files from public/tools/ */}
                <div style={{ padding: "0", overflow: "hidden" }}>
                    <iframe
                        key={activeTool}
                        src={TOOL_SRCS[activeTool]}
                        width="100%"
                        height={iframeHeight}
                        frameBorder="0"
                        style={{ display: "block", borderRadius: "0 0 var(--r-xl) var(--r-xl)" }}
                        title={TOOL_TITLES[activeTool]}
                    />
                </div>
            </div>
        </div>
    );
}
