import React from 'react';

const ProfileScreen = ({ profile, onChange, onNext, onBack }) => {
    const isFormValid = profile.breed && profile.ageYears && profile.weight && profile.foodType && profile.foodGrams && profile.foodTimes;

    const handleMobile = (val) => {
        onChange('mobile', val.replace(/\D/g, '').slice(0, 10));
    };

    return (
        <div id="screen-profile" className="screen active pb-100">
            <div className="header">
                <button className="back-btn" onClick={onBack}>← Back</button>
                <h2>Dog Profile</h2>
                <p>Tell us about your dog</p>
            </div>

            <div className="p-16" style={{ paddingTop: '20px' }}>
                <label className="field-label">Dog's Name</label>
                <input
                    className="input mb-16"
                    type="text"
                    placeholder="e.g. Bruno (optional)"
                    value={profile.name || ''}
                    onChange={e => onChange('name', e.target.value)}
                />

                <label className="field-label">Breed <span className="req">*</span></label>
                <select className="input mb-16" value={profile.breed || ''} onChange={e => onChange('breed', e.target.value)}>
                    <option value="">Select breed</option>
                    <option>Labrador Retriever</option>
                    <option>German Shepherd</option>
                    <option>Golden Retriever</option>
                    <option>Bulldog / French Bulldog</option>
                    <option>Poodle</option>
                    <option>Beagle</option>
                    <option>Rottweiler</option>
                    <option>Dachshund</option>
                    <option>Shih Tzu</option>
                    <option>Siberian Husky</option>
                    <option>Dobermann</option>
                    <option>Boxer</option>
                    <option>Cocker Spaniel</option>
                    <option>Pug</option>
                    <option>Great Dane</option>
                    <option>Lhasa Apso</option>
                    <option>Indie / Indian Pariah</option>
                    <option>Mixed Breed / Other</option>
                </select>

                <div className="grid-2 mb-16">
                    <div>
                        <label className="field-label">Age (Years) <span className="req">*</span></label>
                        <input
                            className="input"
                            type="number"
                            inputMode="numeric"
                            min="0" max="25"
                            placeholder="0–25"
                            value={profile.ageYears || ''}
                            onChange={e => onChange('ageYears', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="field-label">Months</label>
                        <input
                            className="input"
                            type="number"
                            inputMode="numeric"
                            min="0" max="11"
                            placeholder="0–11"
                            value={profile.ageMonths || ''}
                            onChange={e => onChange('ageMonths', e.target.value)}
                        />
                    </div>
                </div>

                <label className="field-label">Weight (kg) <span className="req">*</span></label>
                <input
                    className="input mb-16"
                    type="number"
                    inputMode="decimal"
                    placeholder="e.g. 28"
                    value={profile.weight || ''}
                    onChange={e => onChange('weight', e.target.value)}
                />

                <label className="field-label">Current Diet <span className="req">*</span></label>
                <select className="input mb-16" value={profile.foodType || ''} onChange={e => onChange('foodType', e.target.value)}>
                    <option value="">Select diet type</option>
                    <option>Dry Kibble</option>
                    <option>Wet / Canned Food</option>
                    <option>Home Cooked — Vegetarian</option>
                    <option>Home Cooked — Non-Vegetarian</option>
                    <option>Raw Diet (BARF)</option>
                    <option>Mixed / Combination</option>
                </select>

                <div className="grid-2 mb-16">
                    <div>
                        <label className="field-label">Grams/meal <span className="req">*</span></label>
                        <input
                            className="input"
                            type="number"
                            inputMode="numeric"
                            placeholder="e.g. 250"
                            value={profile.foodGrams || ''}
                            onChange={e => onChange('foodGrams', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="field-label">Frequency <span className="req">*</span></label>
                        <select className="input" value={profile.foodTimes || ''} onChange={e => onChange('foodTimes', e.target.value)}>
                            <option value="">Select</option>
                            <option>1× per day</option>
                            <option>2× per day</option>
                            <option>3× per day</option>
                            <option>4× per day</option>
                            <option>Free feeding</option>
                        </select>
                    </div>
                </div>

                <label className="field-label">Mobile (for WhatsApp follow-up)</label>
                <div style={{ position: 'relative', marginBottom: '4px' }}>
                    <span style={{
                        position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                        color: '#5C4215', fontSize: '14px', fontWeight: 600, pointerEvents: 'none',
                    }}>
                        🇮🇳 +91
                    </span>
                    <input
                        className="input"
                        type="text"
                        inputMode="numeric"
                        maxLength="10"
                        placeholder="10-digit number"
                        style={{ paddingLeft: '72px' }}
                        value={profile.mobile || ''}
                        onChange={e => handleMobile(e.target.value)}
                    />
                </div>
                {profile.mobile && profile.mobile.length > 0 && profile.mobile.length < 10 && (
                    <p style={{ color: '#D97706', fontSize: '12px', marginBottom: '12px', paddingLeft: '4px' }}>
                        ⚠️ Enter full 10-digit number ({10 - (profile.mobile || '').length} more digits)
                    </p>
                )}

                <label className="field-label" style={{ marginTop: '12px', marginBottom: '6px' }}>
                    Notes / Allergies / Medications
                </label>
                <textarea
                    className="input"
                    rows="3"
                    placeholder="Any known allergies, current medications... (optional)"
                    style={{ resize: 'vertical', minHeight: '80px' }}
                    value={profile.notes || ''}
                    onChange={e => onChange('notes', e.target.value)}
                />
            </div>

            <div className="fixed-bottom">
                <button className="btn btn-primary" onClick={onNext} disabled={!isFormValid}>
                    Analyze with VetRx AI 🔬
                </button>
            </div>
        </div>
    );
};

export default ProfileScreen;
