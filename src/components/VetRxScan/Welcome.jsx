import React, { useMemo, useRef, useState } from "react";
import { LOGO_PLACEHOLDER } from "./constants";
import ScanHistory from "./ScanHistory";
import CameraModal from "./CameraModal";

const canUseInlineCamera = () => {
  if (typeof navigator === "undefined") return false;
  return !!navigator.mediaDevices?.getUserMedia;
};

const isIOSDevice = () => {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return (
    /iPad|iPhone|iPod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
};

const isAndroidDevice = () => {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent || "");
};

const shouldTryInlineCameraOnAndroid = () => {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  if (!/Android/i.test(ua)) return false;

  const blockedBrowsers =
    /SamsungBrowser|; wv\)|\bwv\b|FBAN|FBAV|Instagram|Line\//i;
  if (blockedBrowsers.test(ua)) return false;

  return /Chrome\/|EdgA\//i.test(ua);
};

const WelcomeScreen = ({
  photo,
  scansLeft = 0,
  userName,
  phone,
  onPhotoUploaded,
  onClearPhoto,
  onNext,
  onLogout,
}) => {
  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null); // native capture input fallback
  const [showHistory, setShowHistory] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const supportsInlineCamera = useMemo(() => canUseInlineCamera(), []);
  const isIOS = useMemo(() => isIOSDevice(), []);
  const shouldTryInlineOnAndroid = useMemo(
    () => shouldTryInlineCameraOnAndroid(),
    [],
  );
  const prefersInlineCamera = useMemo(
    () =>
      supportsInlineCamera &&
      (isIOS || !isAndroidDevice() || shouldTryInlineOnAndroid),
    [isIOS, shouldTryInlineOnAndroid, supportsInlineCamera],
  );

  const processFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDim = 1000;

        if (width > height && width > maxDim) {
          height *= maxDim / width;
          width = maxDim;
        } else if (height > maxDim) {
          width *= maxDim / height;
          height = maxDim;
        }

        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        onPhotoUploaded({
          b64: dataUrl.split(",")[1],
          mime: "image/jpeg",
          url: dataUrl,
        });
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleGalleryChange = (e) => {
    processFile(e.target.files[0]);
    e.target.value = "";
  };

  const handleNativeCameraChange = (e) => {
    processFile(e.target.files[0]);
    e.target.value = "";
  };

  const openGalleryPicker = () => {
    if (!galleryInputRef.current) return;
    galleryInputRef.current.value = "";
    galleryInputRef.current.click();
  };

  const openNativeCameraFallback = () => {
    if (!cameraInputRef.current) return;
    cameraInputRef.current.value = "";
    cameraInputRef.current.click();
  };

  // iOS prefers inline camera to avoid the iOS black native-capture issue.
  // On Android, only safer Chrome-like browsers try inline first; others stay on native capture.
  const handleCameraClick = () => {
    if (prefersInlineCamera) {
      setShowCamera(true);
      return;
    }
    openNativeCameraFallback();
  };

  const handleCameraCapture = (photoData) => {
    setShowCamera(false);
    onPhotoUploaded(photoData);
  };

  return (
    <>
      {/* Camera modal — full screen, rendered outside the card */}
      {showCamera && (
        <CameraModal
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
          onUseNativeCamera={
            isAndroidDevice() ? openNativeCameraFallback : null
          }
          nativeFallbackLabel="Use system camera"
        />
      )}

      {/* Scan History panel */}
      {showHistory && phone && (
        <ScanHistory
          phone={phone}
          name={userName}
          onClose={() => setShowHistory(false)}
        />
      )}

      <div
        id="screen-welcome"
        className="screen active"
        style={{
          background: "linear-gradient(180deg,#FBF6EC 0%,#E8DBC8 100%)",
          padding: "24px 16px 40px",
          alignItems: "center",
          position: "relative",
        }}
      >
        {/* Header row: logo + title on left, badges on right — all in flow, no absolute positioning */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "6px",
            width: "100%",
            maxWidth: "420px",
          }}
        >
          <div className="logo-wrap" style={{ flexShrink: 0 }}>
            <img
              src={LOGO_PLACEHOLDER}
              alt="Doglicious"
              className="logo-img"
              style={{ width: "50px" }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1
              style={{
                color: "#3D2B00",
                fontSize: "22px",
                fontWeight: 900,
                letterSpacing: "-0.4px",
              }}
            >
              VetRx Scan
            </h1>
            <p style={{ color: "#5C4215", fontSize: "12px" }}>
              AI Dog Health Scan
            </p>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                background: "rgba(61,43,0,0.92)",
                color: "#FBF6EC",
                borderRadius: "999px",
                padding: "7px 11px",
                fontSize: "11px",
                fontWeight: 800,
                boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                whiteSpace: "nowrap",
              }}
            >
              {scansLeft} scans left
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                title="Log out"
                style={{
                  background: "rgba(61,43,0,0.92)",
                  color: "#FBF6EC",
                  borderRadius: "999px",
                  padding: "7px 11px",
                  fontSize: "11px",
                  fontWeight: 700,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  whiteSpace: "nowrap",
                }}
              >
                Logout
              </button>
            )}
          </div>
        </div>

        <p
          style={{
            color: "#9B7E4A",
            fontSize: "13px",
            textAlign: "center",
            marginBottom: "20px",
            width: "100%",
            maxWidth: "420px",
          }}
        >
          {userName ? `Hey ${userName}! ` : ""}Click a Photo, Get Instant
          Insights 🐶
        </p>

        {/* Hidden gallery input */}
        <input
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          ref={galleryInputRef}
          onChange={handleGalleryChange}
        />

        {/* Hidden native camera input fallback */}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: "none" }}
          ref={cameraInputRef}
          onChange={handleNativeCameraChange}
        />

        {/* Photo zone */}
        <div style={{ width: "100%", maxWidth: "420px", marginBottom: "20px" }}>
          {!photo ? (
            <div className="photo-zone" style={{ cursor: "default" }}>
              <div style={{ fontSize: "48px" }}>📸</div>
              <div style={{ textAlign: "center" }}>
                <p
                  style={{
                    color: "#3D2B00",
                    fontSize: "17px",
                    fontWeight: 800,
                  }}
                >
                  Take or upload a photo
                </p>
                <p
                  style={{
                    color: "#9B7E4A",
                    fontSize: "13px",
                    marginTop: "4px",
                  }}
                >
                  of the affected area
                </p>
              </div>
              {/* Two action buttons */}
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  width: "100%",
                  marginTop: "4px",
                }}
              >
                <button
                  type="button"
                  onClick={openGalleryPicker}
                  style={{
                    flex: 1,
                    padding: "12px 8px",
                    background: "#FBF6EC",
                    border: "1.5px solid #D4B896",
                    borderRadius: "12px",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "4px",
                    fontFamily: "inherit",
                  }}
                >
                  <span style={{ fontSize: "22px" }}>🖼️</span>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#3D2B00",
                    }}
                  >
                    Gallery
                  </span>
                  <span style={{ fontSize: "10px", color: "#9B7E4A" }}>
                    Upload from photos
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleCameraClick}
                  style={{
                    flex: 1,
                    padding: "12px 8px",
                    background: "#3D2B00",
                    border: "1.5px solid #3D2B00",
                    borderRadius: "12px",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "4px",
                    fontFamily: "inherit",
                  }}
                >
                  <span style={{ fontSize: "22px" }}>📷</span>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#FBF6EC",
                    }}
                  >
                    Camera
                  </span>
                  <span
                    style={{ fontSize: "10px", color: "rgba(251,246,236,0.7)" }}
                  >
                    {isIOS ? "Open in-app camera" : "Take a new photo"}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="photo-preview-wrap">
                <img src={photo.url} alt="Dog" />
                <div className="photo-overlay" />
                <button
                  type="button"
                  className="photo-clear"
                  onClick={onClearPhoto}
                >
                  ✕
                </button>
                <p className="photo-label">✅ Photo ready</p>
              </div>
              <div
                style={{
                  marginTop: "14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={onNext}
                >
                  Continue with this photo →
                </button>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                    onClick={openGalleryPicker}
                  >
                    🖼️ Gallery
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                    onClick={handleCameraClick}
                  >
                    📷 Camera
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Feature mini-cards */}
        <div className="grid-3" style={{ width: "100%", maxWidth: "420px" }}>
          <div className="mini-card">
            <div style={{ fontSize: "22px", marginBottom: "4px" }}>🔍</div>
            <p style={{ color: "#3D2B00", fontSize: "11px", fontWeight: 700 }}>
              AI Analysis
            </p>
            <p style={{ color: "#9B7E4A", fontSize: "10px" }}>
              Photo + symptoms
            </p>
          </div>
          <div className="mini-card">
            <div style={{ fontSize: "22px", marginBottom: "4px" }}>🍗</div>
            <p style={{ color: "#3D2B00", fontSize: "11px", fontWeight: 700 }}>
              Diet Advice
            </p>
            <p style={{ color: "#9B7E4A", fontSize: "10px" }}>
              Personalised plan
            </p>
          </div>
          <div className="mini-card">
            <div style={{ fontSize: "22px", marginBottom: "4px" }}>💬</div>
            <p style={{ color: "#3D2B00", fontSize: "11px", fontWeight: 700 }}>
              WhatsApp
            </p>
            <p style={{ color: "#9B7E4A", fontSize: "10px" }}>Direct support</p>
          </div>
        </div>

        {/* Scan History button */}
        {phone && (
          <div style={{ width: "100%", maxWidth: "420px", marginTop: "20px" }}>
            <button
              onClick={() => setShowHistory(true)}
              style={{
                width: "100%",
                padding: "14px 16px",
                background: "#fff",
                border: "1.5px solid #EDE8DC",
                borderRadius: "16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                fontFamily: "inherit",
                boxShadow: "0 2px 8px rgba(61,43,0,0.06)",
              }}
            >
              <span style={{ fontSize: "24px" }}>📋</span>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 800,
                    color: "#3D2B00",
                  }}
                >
                  My Scan History
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#9B7E4A",
                    marginTop: "2px",
                  }}
                >
                  View all your past diagnoses
                </div>
              </div>
              <span style={{ color: "#9B7E4A", fontSize: "18px" }}>›</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default WelcomeScreen;
