import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext({
    toast: (msg, type = 'info') => { }
});

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const toast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            removeToast(id);
        }, duration);
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div
                style={{
                    position: 'fixed',
                    bottom: '24px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1000000,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    pointerEvents: 'none',
                    width: '100%',
                    maxWidth: '400px',
                    padding: '0 20px'
                }}
            >
                {toasts.map(t => (
                    <div
                        key={t.id}
                        className={`toast-item toast-${t.type}`}
                        style={{
                            padding: '12px 20px',
                            borderRadius: '16px',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            fontSize: '14px',
                            fontWeight: '500',
                            textAlign: 'center',
                            pointerEvents: 'auto',
                            animation: 'toastIn 0.4s cubic-bezier(0.2, 1, 0.3, 1), toastOut 0.4s 3.6s cubic-bezier(0.2, 1, 0.3, 1) forwards',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        {t.type === 'error' && <span>⚠️</span>}
                        {t.type === 'success' && <span>✓</span>}
                        {t.message}
                    </div>
                ))}
            </div>
            <style>{`
                .toast-item {
                    color: #fff;
                    background: rgba(28, 28, 30, 0.85);
                }
                .toast-error {
                    background: rgba(255, 59, 48, 0.9) !important;
                }
                .toast-success {
                    background: rgba(52, 199, 89, 0.9) !important;
                }
                
                @media (prefers-color-scheme: light) {
                    .toast-item:not(.toast-error):not(.toast-success) {
                        background: rgba(255, 255, 255, 0.85);
                        color: #1c1c1e;
                        border: 1px solid rgba(0,0,0,0.05);
                    }
                }

                @keyframes toastIn {
                    0% { transform: translateY(20px); opacity: 0; scale: 0.9; }
                    100% { transform: translateY(0); opacity: 1; scale: 1; }
                }
                @keyframes toastOut {
                    0% { transform: translateY(0); opacity: 1; scale: 1; }
                    100% { transform: translateY(-20px); opacity: 0; scale: 0.9; }
                }
            `}</style>
        </ToastContext.Provider>
    );
}

export const useToast = () => useContext(ToastContext);
