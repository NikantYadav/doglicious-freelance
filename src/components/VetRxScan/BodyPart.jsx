import React from 'react';
import { BODY_PARTS } from './constants';
import { Header, PrimaryButton } from './Common';

const BodyPartScreen = ({ selectedPart, onSelect, onNext, onBack }) => {
    return (
        <div id="screen-body" className="screen active">
            <Header
                title="Where is the issue?"
                subtitle="Select the area you photographed"
                showBack={true}
                onBack={onBack}
            />

            <div className="grid-parts" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                {BODY_PARTS.map((part) => (
                    <div
                        key={part.id}
                        className={`part-item ${selectedPart === part.label ? 'selected' : ''}`}
                        onClick={() => onSelect(part.label)}
                        style={{
                            padding: '20px 10px',
                            textAlign: 'center',
                            background: selectedPart === part.label ? '#F5E6CC' : '#fff',
                            border: selectedPart === part.label ? '2px solid #9B6E28' : '1.5px solid #D4C4A4',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        <div style={{ fontSize: '28px', marginBottom: '8px' }}>{part.icon}</div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#3D2B00' }}>{part.label}</div>
                    </div>
                ))}
            </div>

            <PrimaryButton
                id="btn-body-next"
                disabled={!selectedPart}
                onClick={onNext}
                style={{ width: '100%' }}
            >
                Next Step 🐾
            </PrimaryButton>
        </div>
    );
};

export default BodyPartScreen;
