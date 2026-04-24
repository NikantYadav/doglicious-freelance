import React, { useRef } from 'react';
import { LOGO_PLACEHOLDER } from './constants';

const WelcomeScreen = ({ photo, onPhotoUploaded, onClearPhoto, onNext }) => {
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const maxDim = 1000; // max width/height

                if (width > height && width > maxDim) {
                    height *= maxDim / width;
                    width = maxDim;
                } else if (height > maxDim) {
                    width *= maxDim / height;
                    height = maxDim;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                onPhotoUploaded({
                    b64: dataUrl.split(',')[1],
                    mime: 'image/jpeg',
                    url: dataUrl
                });
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    };

    return (
        <div
            id="screen-welcome"
            className="screen active"
            style={{
                background: 'linear-gradient(180deg,#FBF6EC 0%,#E8DBC8 100%)',
                padding: '24px 16px 40px',
                alignItems: 'center',
            }}
        >
            {/* Logo + title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px', width: '100%', maxWidth: '420px' }}>
                <div className="logo-wrap">
                    <img src={LOGO_PLACEHOLDER} alt="Doglicious" className="logo-img" style={{ width: '50px' }} />
                </div>
                <div>
                    <h1 style={{ color: '#3D2B00', fontSize: '22px', fontWeight: 900, letterSpacing: '-0.4px' }}>VetRx Scan</h1>
                    <p style={{ color: '#5C4215', fontSize: '12px' }}>AI Dog Health Scan</p>
                </div>
            </div>

            <p style={{ color: '#9B7E4A', fontSize: '13px', textAlign: 'center', marginBottom: '20px', width: '100%', maxWidth: '420px' }}>
                Click a Photo, Get Instant Insights 🐶
            </p>

            <input
                type="file"
                id="photoInput"
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleFileChange}
            />

            {/* Photo zone */}
            <div style={{ width: '100%', maxWidth: '420px', marginBottom: '20px' }}>
                {!photo ? (
                    <div className="photo-zone" onClick={() => fileInputRef.current.click()}>
                        <div style={{ fontSize: '48px' }}>📸</div>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ color: '#3D2B00', fontSize: '17px', fontWeight: 800 }}>Take or upload a photo</p>
                            <p style={{ color: '#9B7E4A', fontSize: '13px', marginTop: '4px' }}>of the affected area</p>
                        </div>
                        <div style={{ background: '#FBF6EC', borderRadius: '12px', padding: '8px 16px' }}>
                            <p style={{ color: '#5C4215', fontSize: '12px', textAlign: 'center' }}>
                                📱 Mobile opens camera<br />💻 Desktop opens file picker
                            </p>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="photo-preview-wrap">
                            <img src={photo.url} alt="Dog" />
                            <div className="photo-overlay" />
                            <button className="photo-clear" onClick={onClearPhoto}>✕</button>
                            <p className="photo-label">✅ Photo ready</p>
                        </div>
                        <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <button className="btn btn-primary" onClick={onNext}>Continue with this photo →</button>
                            <button className="btn btn-secondary" onClick={() => fileInputRef.current.click()}>Retake Photo</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Feature mini-cards */}
            <div className="grid-3" style={{ width: '100%', maxWidth: '420px' }}>
                <div className="mini-card">
                    <div style={{ fontSize: '22px', marginBottom: '4px' }}>🔍</div>
                    <p style={{ color: '#3D2B00', fontSize: '11px', fontWeight: 700 }}>AI Analysis</p>
                    <p style={{ color: '#9B7E4A', fontSize: '10px' }}>Photo + symptoms</p>
                </div>
                <div className="mini-card">
                    <div style={{ fontSize: '22px', marginBottom: '4px' }}>🍗</div>
                    <p style={{ color: '#3D2B00', fontSize: '11px', fontWeight: 700 }}>Diet Advice</p>
                    <p style={{ color: '#9B7E4A', fontSize: '10px' }}>Personalised plan</p>
                </div>
                <div className="mini-card">
                    <div style={{ fontSize: '22px', marginBottom: '4px' }}>💬</div>
                    <p style={{ color: '#3D2B00', fontSize: '11px', fontWeight: 700 }}>WhatsApp</p>
                    <p style={{ color: '#9B7E4A', fontSize: '10px' }}>Direct support</p>
                </div>
            </div>
        </div>
    );
};

export default WelcomeScreen;
