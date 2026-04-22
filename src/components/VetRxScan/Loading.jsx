import React from 'react';
import { LOGO_PLACEHOLDER } from './constants';

const LoadingScreen = ({ status = '', sub = '' }) => {
    return (
        <div
            id="screen-loading"
            className="screen active"
            style={{
                background: '#3D2B00',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '32px 20px',
                textAlign: 'center',
            }}
        >
            <div className="logo-wrap" style={{ marginBottom: '28px' }}>
                <img src={LOGO_PLACEHOLDER} alt="Doglicious" className="logo-img" style={{ width: '80px' }} />
            </div>
            <div className="spinner" style={{ marginBottom: '24px' }} />
            <h2 style={{ color: '#FBF6EC', fontSize: '20px', fontWeight: 800, textAlign: 'center' }}>
                {status}
            </h2>
            <p style={{ color: 'rgba(251,246,236,0.55)', fontSize: '14px', textAlign: 'center', marginTop: '8px', lineHeight: 1.5 }}>
                {sub}
            </p>
        </div>
    );
};

export default LoadingScreen;
