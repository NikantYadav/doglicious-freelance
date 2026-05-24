import React, { useState, useEffect } from 'react';
import type { Dog } from '../../types';

const DOG_AVATARS = ['🐶', '🐕', '🦮', '🐕‍🦺', '🐩'];
const BREEDS = [
  'Labrador Retriever', 'Indian Pariah (Indie)', 'German Shepherd', 'Golden Retriever',
  'Beagle', 'Pomeranian', 'Shih Tzu', 'Pug', 'Dachshund', 'Doberman Pinscher', 'Other',
];
const DIETS = ['Dry Kibble', 'Wet / Canned Food', 'Home Cooked - Vegetarian', 'Home Cooked - Non-Vegetarian', 'Raw Diet (BARF)', 'Mixed / Combination'];
const MONTHS_LIST = [
  ['01','January'],['02','February'],['03','March'],['04','April'],['05','May'],['06','June'],
  ['07','July'],['08','August'],['09','September'],['10','October'],['11','November'],['12','December'],
];

function currentYears(): number[] {
  const y = new Date().getFullYear();
  return Array.from({ length: 26 }, (_, i) => y - i);
}

interface DogProfileFormProps {
  existingDog?: Dog;
  onSave: (data: Omit<Dog, 'id'>) => void;
  onBack: () => void;
  isNewDog?: boolean;
}

export const DogProfileForm: React.FC<DogProfileFormProps> = ({ existingDog, onSave, onBack, isNewDog = true }) => {
  const [av, setAv] = useState(existingDog?.av ?? '🐶');
  const [parentName, setParentName] = useState(existingDog?.parentName ?? '');
  const [parentMobile, setParentMobile] = useState(existingDog?.parentMobile ?? '');
  const [name, setName] = useState(existingDog?.name ?? '');
  const [breed, setBreed] = useState(existingDog?.breed ?? '');
  const [dobYear, setDobYear] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [wt, setWt] = useState(existingDog?.wt ?? '');
  const [diet, setDiet] = useState(existingDog?.diet ?? '');
  const [grams, setGrams] = useState(existingDog?.grams ?? '');
  const [freq, setFreq] = useState(existingDog?.freq ?? '');
  const [activity, setActivity] = useState(existingDog?.act ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Parse DOB from existing dog
  useEffect(() => {
    if (existingDog?.dob) {
      const [y, m] = existingDog.dob.split('-');
      setDobYear(y ?? '');
      setDobMonth(m ?? '');
    } else if (existingDog?.age) {
      const currentYear = new Date().getFullYear();
      const approxYear = currentYear - parseInt(existingDog.age, 10);
      setDobYear(String(approxYear));
    }
  }, [existingDog]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!parentName.trim()) errs.parentName = 'Required';
    if (!name.trim()) errs.name = 'Required';
    if (!breed) errs.breed = 'Select a breed';
    if (!dobYear) errs.dob = 'Select year';
    const wtNum = parseFloat(wt);
    if (!wt || isNaN(wtNum) || wtNum < 0.5 || wtNum > 100) errs.wt = 'Enter valid weight (0.5–100 kg)';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const dob = dobYear ? `${dobYear}-${dobMonth || '01'}` : '';
    const ageNum = dobYear ? new Date().getFullYear() - parseInt(dobYear, 10) : 0;
    onSave({
      av,
      parentName: parentName.trim(),
      parentMobile: parentMobile.replace(/\D/g, ''),
      name: name.trim(),
      breed,
      age: String(Math.max(0, ageNum)),
      dob,
      wt,
      diet,
      grams,
      freq,
      act: activity,
    });
  };

  return (
    <>
      <div className="nhdr">
        <div className="nhdr-row">
          <button className="nbk" onClick={onBack} type="button">← Back</button>
        </div>
      </div>

      <div className="ph">
        <h2>Dog Profile</h2>
        <p>Save once — used for every future scan</p>
      </div>

      <div className="fsec" style={{ overflowY: 'auto', flex: 1 }}>

        {/* Avatar picker */}
        <div style={{ marginBottom: 14 }}>
          <label className="fl">Choose avatar</label>
          <div className="av-picker">
            {DOG_AVATARS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className={`av-opt${av === emoji ? ' on' : ''}`}
                onClick={() => setAv(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Pet Parent */}
        <div style={{ background: 'linear-gradient(135deg,var(--sf2),var(--sf3))', borderRadius: 'var(--rs)', padding: '12px 14px', marginBottom: 14, border: '1px solid var(--bd)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>👤 Pet Parent Details</div>
          <div className={`fg${errors.parentName ? ' herr' : ''}`}>
            <label className="fl">Your Name <span className="req">*</span></label>
            <input className="fi" type="text" placeholder="e.g. Rahul Sharma" value={parentName} onChange={(e) => setParentName(e.target.value)} />
            <div className="ferr">{errors.parentName}</div>
          </div>
          <div className="fg" style={{ marginBottom: 0 }}>
            <label className="fl">Mobile (optional)</label>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ background: 'var(--sur)', border: '1.5px solid var(--bd)', borderRadius: 'var(--rs)', padding: '10px 11px', fontSize: 13, fontWeight: 700, color: 'var(--t2)', flexShrink: 0 }}>+91</span>
              <input className="fi" type="tel" placeholder="10-digit mobile" maxLength={10} value={parentMobile} onChange={(e) => setParentMobile(e.target.value.replace(/\D/g, ''))} style={{ flex: 1 }} />
            </div>
          </div>
        </div>

        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>🐕 Dog Details</div>

        <div className={`fg${errors.name ? ' herr' : ''}`}>
          <label className="fl">Dog's Name <span className="req">*</span></label>
          <input className="fi" type="text" placeholder="e.g. Bruno" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="ferr">{errors.name}</div>
        </div>

        <div className={`fg${errors.breed ? ' herr' : ''}`}>
          <label className="fl">Breed <span className="req">*</span></label>
          <select className="fi" value={breed} onChange={(e) => setBreed(e.target.value)}>
            <option value="">Select breed</option>
            {BREEDS.map((b) => <option key={b}>{b}</option>)}
          </select>
          <div className="ferr">Please select a breed</div>
        </div>

        <div className={`fg${errors.dob ? ' herr' : ''}`}>
          <label className="fl">Year &amp; Month Born <span className="req">*</span></label>
          <div className="frow" style={{ gap: 8, marginBottom: 0 }}>
            <select className="fi" value={dobYear} onChange={(e) => setDobYear(e.target.value)}>
              <option value="">Year born</option>
              {currentYears().map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <select className="fi" value={dobMonth} onChange={(e) => setDobMonth(e.target.value)}>
              <option value="">Month</option>
              {MONTHS_LIST.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
            </select>
          </div>
          <div className="ferr">{errors.dob}</div>
        </div>

        <div className={`fg${errors.wt ? ' herr' : ''}`}>
          <label className="fl">Weight (kg) <span className="req">*</span></label>
          <input className="fi" type="number" placeholder="e.g. 20" min={0.5} max={100} step={0.5} value={wt} onChange={(e) => setWt(e.target.value)} />
          <div className="ferr">{errors.wt}</div>
        </div>

        <div className="fg">
          <label className="fl">Diet Type</label>
          <select className="fi" value={diet} onChange={(e) => setDiet(e.target.value)}>
            <option value="">Select diet type</option>
            {DIETS.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>

        <div className="frow">
          <div className="fg">
            <label className="fl">Grams/meal</label>
            <input className="fi" type="number" placeholder="250" value={grams} onChange={(e) => setGrams(e.target.value)} />
          </div>
          <div className="fg">
            <label className="fl">Frequency</label>
            <select className="fi" value={freq} onChange={(e) => setFreq(e.target.value)}>
              <option value="">Select</option>
              <option>1x/day</option><option>2x/day</option><option>3x/day</option><option>Free feeding</option>
            </select>
          </div>
        </div>

        <div className="fg">
          <label className="fl">Activity</label>
          <select className="fi" value={activity} onChange={(e) => setActivity(e.target.value)}>
            <option value="">Select</option>
            <option>Low</option><option>Medium</option><option>High</option>
          </select>
        </div>

        <button className="btn" onClick={handleSave} style={{ marginTop: 4 }} type="button">
          Save Dog 🐾
        </button>

      </div>
    </>
  );
};