import React, { useRef, useState, useCallback } from 'react';
import { GalleryIcon, CameraIcon } from './Icons';
import { processImageFile, isSamsungBrowser } from './imageUtils';

const DogStrip = ({ dog, onEdit }) => (
  <div className="dog-strip">
    <div className="ds-av">{dog.av}</div>
    <div>
      <div className="ds-name">{dog.name}</div>
      <div className="ds-meta">{dog.breed} · {dog.age}yr{dog.wt ? ` · ${dog.wt}kg` : ''}</div>
    </div>
    <button className="ds-edit" onClick={onEdit} type="button">Edit</button>
  </div>
);

const TodayScansBar = ({ scans, limit }) => {
  const count = scans.length;
  return (
    <div style={{ background: 'var(--sf2)', borderRadius: 'var(--rs)', padding: '9px 14px', marginBottom: 10, border: '1px solid var(--bd)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--brand)' }}>{count}/{limit}</span>
          <span style={{ fontSize: 11, color: 'var(--t3)' }}>scans today</span>
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: '50%',
              background: i < count ? 'var(--brand)' : 'var(--sf3)',
              border: '1px solid var(--bds)',
            }} />
          ))}
        </div>
      </div>
    </div>
  );
};

const HomeVetCard = ({ vetName, vetNum, lastEntry, onShare, onSaveVet }) => {
  const [inputName, setInputName] = useState(vetName);
  const [inputNum, setInputNum] = useState(vetNum);
  const [savedVet, setSavedVet] = useState(!!(vetName && vetNum));
  const [showEdit, setShowEdit] = useState(false);

  const handleShare = () => {
    const name = savedVet ? vetName : inputName;
    const num = savedVet ? vetNum : inputNum;
    if (name || num) onSaveVet(name, num);
    onShare(name, num);
  };

  return (
    <div style={{ marginTop: 2 }}>
      <div className="home-vet-card">
        <div className="hvc-top">
          <div className="hvc-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.68 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 5.61 5.61l.71-.72a2 2 0 0 1 2.11-.45c.91.32 1.85.55 2.81.68a2 2 0 0 1 1.72 2.07z"/>
            </svg>
          </div>
          <div>
            <div className="hvc-title">Share Report with Vet</div>
            <div className="hvc-sub">Send PDF + summary via WhatsApp</div>
          </div>
          {lastEntry && <div className="hvc-badge">Latest scan</div>}
        </div>

        {savedVet && !showEdit ? (
          <div className="hvc-saved-vet">
            <span style={{ fontSize: 11, color: '#fff', fontWeight: 600 }}>👤 {vetName}</span>
            <span style={{ color: 'rgba(255,255,255,.45)' }}>·</span>
            <span style={{ fontSize: 10, opacity: 0.7, color: '#fff' }}>+91 {vetNum}</span>
            <button className="hvc-change-btn" onClick={() => setShowEdit(true)} type="button">Change</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <input
              className="hvc-input"
              type="text"
              placeholder="Vet name (e.g. Dr. Sharma)"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
            />
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.7)', flexShrink: 0 }}>+91</span>
              <input
                className="hvc-input"
                type="tel"
                placeholder="Vet mobile"
                maxLength={10}
                style={{ flex: 1, marginBottom: 0 }}
                value={inputNum}
                onChange={(e) => setInputNum(e.target.value.replace(/\D/g, ''))}
              />
            </div>
          </div>
        )}

        <button className="hvc-share-btn" onClick={handleShare} type="button">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Send PDF Report to Vet via WhatsApp
        </button>

        {!lastEntry && (
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', textAlign: 'center', marginTop: 6 }}>
            Complete a scan first to share a report
          </div>
        )}
      </div>
    </div>
  );
};

const DAILY_LIMIT = 4;

export const UploadScreen = ({
  dog, todayScans, lastEntry, hasDogHistory, vetName, vetNum,
  onEditDog, onContinue, onNavHist, onNavProg, onShareVet, onSaveVet, toast,
}) => {
  const [image, setImage] = useState(null);
  const [hasImage, setHasImage] = useState(false);
  const galleryRef = useRef(null);
  const cameraRef = useRef(null);
  const cameraRefSamsung = useRef(null);

  const handleFile = useCallback(async (file) => {
    try {
      const processed = await processImageFile(file);
      setImage(processed);
      setHasImage(true);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Image error');
    }
  }, [toast]);

  const handleGallery = () => galleryRef.current?.click();
  const handleCamera = () => {
    if (isSamsungBrowser()) {
      cameraRefSamsung.current?.click();
    } else {
      cameraRef.current?.click();
    }
  };

  return (
    <div className="content">
      {dog && <DogStrip dog={dog} onEdit={onEditDog} />}

      <input ref={galleryRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <input ref={cameraRefSamsung} type="file" accept="image/*" capture="user" style={{ display: 'none' }} onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

      {!hasImage ? (
        <div
          className="uphero"
          onClick={(e) => {
            const t = e.target;
            if (t.closest('button')) return;
            handleGallery();
          }}
        >
          <span className="upicon">💩</span>
          <h3>Scan your dog's stool</h3>
          <p>Upload a clear, well-lit photo for instant AI health analysis.<br />Tap the button or anywhere in this box</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', margin: '0 auto', maxWidth: 300 }}>
            <button className="btn" style={{ flex: 1, fontSize: 13, gap: 6 }} onClick={(e) => { e.stopPropagation(); handleGallery(); }} type="button">
              <GalleryIcon size={16} stroke="white" />
              Gallery
            </button>
            <button className="btn" style={{ flex: 1, fontSize: 13, background: 'var(--a)', gap: 6 }} onClick={(e) => { e.stopPropagation(); handleCamera(); }} type="button">
              <CameraIcon size={16} stroke="white" />
              Camera
            </button>
          </div>
        </div>
      ) : (
        <div>
          <img className="prev-img" src={image.url} alt="Preview" />
          <div className="pipe-badge">
            <div className="ps"><div className="ps-ic">📷</div><div className="ps-lb">Photo</div></div>
            <div className="pa">→</div>
            <div className="ps"><div className="ps-ic">🤖</div><div className="ps-lb">Claude<br />Vision</div></div>
            <div className="pa">→</div>
            <div className="ps"><div className="ps-ic">📋</div><div className="ps-lb">Structured<br />Report</div></div>
          </div>
          <button className="btn" onClick={() => image && onContinue(image)} type="button">Continue →</button>
          <button className="btn btn-out" style={{ marginTop: 8 }} onClick={() => { setHasImage(false); setImage(null); }} type="button">Change Photo</button>
        </div>
      )}

      {todayScans.length > 0 && <TodayScansBar scans={todayScans} limit={DAILY_LIMIT} />}

      {hasDogHistory && (
        <div style={{ marginTop: 12 }}>
          <div className="card">
            <p className="clbl">Quick access</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-out" style={{ fontSize: 11, padding: 9 }} onClick={onNavHist} type="button">📅 History</button>
              <button className="btn btn-out" style={{ fontSize: 11, padding: 9 }} onClick={onNavProg} type="button">📈 Progress</button>
            </div>
          </div>
        </div>
      )}

      {dog && (
        <HomeVetCard
          vetName={vetName}
          vetNum={vetNum}
          lastEntry={lastEntry}
          onShare={onShareVet}
          onSaveVet={onSaveVet}
        />
      )}
    </div>
  );
};

export default UploadScreen;
