import React, { useState } from 'react';
import { LOGO_PLACEHOLDER } from './constants';

const DisclaimerScreen = ({ onNext }) => {
    const [agreed, setAgreed] = useState(false);

    return (
        <div
            id="screen-disclaimer"
            className="screen active"
            style={{
                background: 'linear-gradient(160deg,#FBF6EC 0%,#E8DBC8 100%)',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '28px 16px',
            }}
        >
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div className="logo-wrap" style={{ margin: '0 auto 12px' }}>
                    <img src={LOGO_PLACEHOLDER} alt="Doglicious" className="logo-img" style={{ width: '100px' }} />
                </div>
                <h1 style={{ color: '#3D2B00', fontSize: '24px', fontWeight: 900, marginBottom: '4px' }}>VetRx Scan</h1>
                <p style={{ color: '#5C4215', fontSize: '13px' }}>AI Dog Health Scan – Click a Photo, Get Instant Insights</p>
            </div>

            <div className="card" style={{ width: '100%', padding: '20px 16px' }}>
                <h2 style={{ color: '#3D2B00', fontSize: '17px', fontWeight: 800, marginBottom: '12px', textAlign: 'center' }}>
                    Before You Begin
                </h2>
                <div style={{ background: '#FFF8ED', border: '1.5px solid #D4A853', borderRadius: '12px', padding: '14px', marginBottom: '20px' }}>
                    <p style={{ color: '#5C4215', fontSize: '13px', lineHeight: 1.65 }}>
                        <strong>⚠️ AI Health Disclaimer</strong><br /><br />
                        VetRx Scan is an AI-powered tool for general health insights. It is{' '}
                        <strong>not a substitute for professional veterinary advice</strong>.<br /><br />
                        Please consult your veterinarian before starting any treatment. In emergencies, seek immediate veterinary care.
                    </p>
                </div>

                {/* Checkbox row — large touch target */}
                <div
                    onClick={() => setAgreed(a => !a)}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', marginBottom: '20px', padding: '4px 0' }}
                >
                    <div style={{
                        width: '24px', height: '24px', minWidth: '24px', borderRadius: '6px',
                        border: '2px solid #C4A87A',
                        background: agreed ? '#3D2B00' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginTop: '1px', transition: 'all 0.15s', flexShrink: 0,
                    }}>
                        {agreed && <span style={{ color: '#FBF6EC', fontSize: '13px', fontWeight: 900 }}>✓</span>}
                    </div>
                    <span style={{ color: '#5C4215', fontSize: '13px', lineHeight: 1.55 }}>
                        I accept the Terms &amp; Conditions and understand this is an AI assistance tool, not a substitute for veterinary care.
                    </span>
                </div>

                <button className="btn btn-primary" onClick={onNext} disabled={!agreed}>
                    Start VetRx Scan 🐾
                </button>
            </div>

            <p style={{ color: '#9B7E4A', fontSize: '11px', marginTop: '16px', textAlign: 'center' }}>
                Powered by Doglicious.in · Superfood for Dogs
            </p>
        </div>
    );
};

export default DisclaimerScreen;
