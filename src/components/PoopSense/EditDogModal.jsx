import React, { useState, useEffect } from 'react';

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

function currentYears() {
  const y = new Date().getFullYear();
  return Array.from({ length: 26 }, (_, i) => y - i);
}

export const EditDogModal = ({ isOpen, dog, onClose, onSave, onDelete, toast }) => {
  const [av, setAv] = useState('🐶');
  const [parentName, setParentName] = useState('');
  const [parentMobile, setParentMobile] = useState('');
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [dobYear, setDobYear] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [wt, setWt] = useState('');
  const [diet, setDiet] = useState('');
  const [grams, setGrams] = useState('');
  const [freq, setFreq] = useState('');
  const [activity, setActivity] = useState('');
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    if (dog) {
      setAv(dog.av || '🐶');
      setParentName(dog.parentName || '');
      setParentMobile(dog.parentMobile || '');
      setName(dog.name || '');
      setBreed(dog.breed || '');
      setWt(dog.wt || '');
      setDiet(dog.diet || '');
      setGrams(dog.grams || '');
      setFreq(dog.freq || '');
      setActivity(dog.act || '');
      if (dog.dob) {
        const [y, m] = dog.dob.split('-');
        setDobYear(y || '');
        setDobMonth(m || '');
      } else if (dog.age) {
        setDobYear(String(new Date().getFullYear() - parseInt(dog.age, 10)));
        setDobMonth('');
      }
      setShowDelete(true);
    } else {
      setAv('🐶'); setParentName(''); setParentMobile(''); setName('');
      setBreed(''); setDobYear(''); setDobMonth(''); setWt('');
      setDiet(''); setGrams(''); setFreq(''); setActivity('');
      setShowDelete(false);
    }
  }, [dog, isOpen]);

  const handleSave = () => {
    if (!parentName.trim()) { toast('Please enter pet parent name'); return; }
    if (!name.trim()) { toast('Please enter dog name'); return; }
    if (!breed) { toast('Please select a breed'); return; }
    if (!dobYear) { toast('Please select year of birth'); return; }
    const wtNum = parseFloat(wt);
    if (!wt || isNaN(wtNum) || wtNum < 0.5 || wtNum > 100) { toast('Please enter valid weight (0.5–100 kg)'); return; }

    const dob = `${dobYear}-${dobMonth || '01'}`;
    const ageNum = Math.max(0, new Date().getFullYear() - parseInt(dobYear, 10));

    onSave({
      id: dog?.id || '',
      av, parentName: parentName.trim(), parentMobile: parentMobile.replace(/\D/g, ''),
      name: name.trim(), breed, age: String(ageNum), dob, wt, diet, grams, freq, act: activity,
    });
  };

  const handleDelete = () => {
    if (!dog) return;
    if (!confirm('Permanently delete this dog and ALL their data? This CANNOT be undone!')) return;
    onDelete(dog.id);
    onClose();
  };

  return (
    <div className={`modal-bg${isOpen ? ' open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-h">
          <div className="modal-title">{dog ? 'Edit Dog' : 'Add Dog'}</div>
          <button className="modal-close" onClick={onClose} type="button">✕</button>
        </div>

        <div className="av-picker" style={{ marginBottom: 12 }}>
          {DOG_AVATARS.map((emoji) => (
            <button key={emoji} type="button" className={`av-opt${av === emoji ? ' on' : ''}`} onClick={() => setAv(emoji)}>
              {emoji}
            </button>
          ))}
        </div>

        <div style={{ background: 'var(--sf2)', borderRadius: 'var(--rs)', padding: 12, marginBottom: 12, border: '1px solid var(--bd)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>👤 Pet Parent</div>
          <div className="fg" style={{ marginBottom: 8 }}>
            <label className="fl">Parent Name <span className="req">*</span></label>
            <input className="fi" type="text" placeholder="e.g. Rahul Sharma" value={parentName} onChange={(e) => setParentName(e.target.value)} />
          </div>
          <div className="fg" style={{ marginBottom: 0 }}>
            <label className="fl">Parent Mobile</label>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ background: 'var(--sur)', border: '1.5px solid var(--bd)', borderRadius: 'var(--rs)', padding: '10px 11px', fontSize: 13, fontWeight: 700, color: 'var(--t2)', flexShrink: 0 }}>+91</span>
              <input className="fi" type="tel" placeholder="10-digit" maxLength={10} value={parentMobile} onChange={(e) => setParentMobile(e.target.value.replace(/\D/g, ''))} style={{ flex: 1 }} />
            </div>
          </div>
        </div>

        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>🐕 Dog Details</div>

        <div className="fg">
          <label className="fl">Dog's Name <span className="req">*</span></label>
          <input className="fi" type="text" placeholder="e.g. Bruno" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="fg">
          <label className="fl">Breed <span className="req">*</span></label>
          <select className="fi" value={breed} onChange={(e) => setBreed(e.target.value)}>
            <option value="">Select breed</option>
            {BREEDS.map((b) => <option key={b}>{b}</option>)}
          </select>
        </div>

        <div className="fg">
          <label className="fl">Year &amp; Month Born <span className="req">*</span></label>
          <div className="frow" style={{ gap: 8 }}>
            <select className="fi" value={dobYear} onChange={(e) => setDobYear(e.target.value)}>
              <option value="">Year born</option>
              {currentYears().map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <select className="fi" value={dobMonth} onChange={(e) => setDobMonth(e.target.value)}>
              <option value="">Month</option>
              {MONTHS_LIST.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
            </select>
          </div>
        </div>

        <div className="fg">
          <label className="fl">Weight (kg) <span className="req">*</span></label>
          <input className="fi" type="number" placeholder="e.g. 20" min={0.5} max={100} step={0.5} value={wt} onChange={(e) => setWt(e.target.value)} />
        </div>

        <div className="fg">
          <label className="fl">Diet Type</label>
          <select className="fi" value={diet} onChange={(e) => setDiet(e.target.value)}>
            <option value="">Select</option>
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

        <button className="btn" onClick={handleSave} style={{ marginTop: 4 }} type="button">Save Dog 🐾</button>

        {showDelete && (
          <>
            <hr className="del-divider" />
            <div className="del-warn">⚠️ Deleting this dog will permanently remove ALL their scan history and data.</div>
            <button className="btn btn-red" onClick={handleDelete} style={{ fontSize: 12 }} type="button">
              🗑️ Delete Dog &amp; All Data Permanently
            </button>
          </>
        )}
      </div>
    </div>
  );
};
