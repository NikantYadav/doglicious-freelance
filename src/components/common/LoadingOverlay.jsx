import React from 'react';

export default function LoadingOverlay({ message = "Redirecting to Payment..." }) {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            zIndex: 1000001,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px'
        }}>
            <div className="spinner">
                <div className="bounce1"></div>
                <div className="bounce2"></div>
                <div className="bounce3"></div>
            </div>
            <div style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#3A2700',
                textAlign: 'center',
                padding: '0 20px'
            }}>
                {message}
            </div>
            <p style={{
                fontSize: '13px',
                color: 'rgba(58, 39, 0, 0.6)',
                marginTop: '-12px'
            }}>Please don't close or refresh the window.</p>

            <style>{`
        .spinner {
          width: 70px;
          text-align: center;
        }
        .spinner > div {
          width: 14px;
          height: 14px;
          background-color: #3A2700;
          border-radius: 100%;
          display: inline-block;
          -webkit-animation: sk-bouncedelay 1.4s infinite ease-in-out both;
          animation: sk-bouncedelay 1.4s infinite ease-in-out both;
          margin: 0 4px;
        }
        .spinner .bounce1 {
          -webkit-animation-delay: -0.32s;
          animation-delay: -0.32s;
        }
        .spinner .bounce2 {
          -webkit-animation-delay: -0.16s;
          animation-delay: -0.16s;
        }
        @-webkit-keyframes sk-bouncedelay {
          0%, 80%, 100% { -webkit-transform: scale(0) }
          40% { -webkit-transform: scale(1.0) }
        }
        @keyframes sk-bouncedelay {
          0%, 80%, 100% { 
            -webkit-transform: scale(0);
            transform: scale(0);
          } 40% { 
            -webkit-transform: scale(1.0);
            transform: scale(1.0);
          }
        }
      `}</style>
        </div>
    );
}
