import React, { useRef, useEffect, useState } from 'react';

// ── CameraModal ───────────────────────────────────────────────────────
// Uses getUserMedia to open the device camera directly.
// Works on both mobile and desktop (any device with a camera).

const CameraModal = ({ onCapture, onClose }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const [ready, setReady] = useState(false);
    const [error, setError] = useState(null);
    const [facingMode, setFacingMode] = useState('environment'); // 'environment' = back, 'user' = front

    const startCamera = async (mode) => {
        // Stop any existing stream first
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        setReady(false);
        setError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: false,
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => setReady(true);
            }
        } catch (err) {
            setError('Camera access denied or unavailable. Please allow camera permission and try again.');
        }
    };

    useEffect(() => {
        startCamera(facingMode);
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
            }
        };
    }, [facingMode]);

    const handleCapture = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        const maxDim = 1000;
        let w = video.videoWidth;
        let h = video.videoHeight;
        if (w > h && w > maxDim) { h = Math.round(h * maxDim / w); w = maxDim; }
        else if (h > maxDim) { w = Math.round(w * maxDim / h); h = maxDim; }

        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(video, 0, 0, w, h);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

        // Stop stream
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
        }

        onCapture({
            b64: dataUrl.split(',')[1],
            mime: 'image/jpeg',
            url: dataUrl,
        });
    };

    const toggleCamera = () => {
        setFacingMode(m => m === 'environment' ? 'user' : 'environment');
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            background: '#000',
            display: 'flex', flexDirection: 'column',
        }}>
            {/* Top bar */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', background: 'rgba(0,0,0,0.6)',
                position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2,
            }}>
                <button
                    onClick={onClose}
                    style={{
                        background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '20px',
                        color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                        padding: '7px 14px', fontFamily: 'inherit',
                    }}
                >
                    ✕ Cancel
                </button>
                <span style={{ color: '#fff', fontSize: '14px', fontWeight: 700 }}>Take Photo</span>
                <button
                    onClick={toggleCamera}
                    title="Flip camera"
                    style={{
                        background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '20px',
                        color: '#fff', fontSize: '13px', cursor: 'pointer',
                        padding: '7px 14px', fontFamily: 'inherit',
                    }}
                >
                    🔄 Flip
                </button>
            </div>

            {/* Video feed */}
            {error ? (
                <div style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', padding: '24px',
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📷</div>
                    <p style={{ color: '#fff', textAlign: 'center', fontSize: '14px', lineHeight: 1.6 }}>{error}</p>
                    <button
                        onClick={onClose}
                        style={{
                            marginTop: '20px', background: '#FBF6EC', border: 'none',
                            borderRadius: '12px', padding: '12px 24px',
                            fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                        }}
                    >
                        Go Back
                    </button>
                </div>
            ) : (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ flex: 1, objectFit: 'cover', width: '100%' }}
                />
            )}

            {/* Hidden canvas for capture */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Capture button */}
            {!error && (
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    padding: '24px', display: 'flex', justifyContent: 'center',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                }}>
                    <button
                        onClick={handleCapture}
                        disabled={!ready}
                        aria-label="Capture photo"
                        style={{
                            width: '72px', height: '72px', borderRadius: '50%',
                            background: ready ? '#fff' : 'rgba(255,255,255,0.4)',
                            border: '4px solid rgba(255,255,255,0.6)',
                            cursor: ready ? 'pointer' : 'default',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                            transition: 'transform 0.1s',
                        }}
                        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
                        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                    />
                </div>
            )}
        </div>
    );
};

export default CameraModal;
