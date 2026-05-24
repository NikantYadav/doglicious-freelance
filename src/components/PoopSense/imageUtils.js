const MAX_DIM = 600;
const JPEG_QUALITY = 0.72;

export function processImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.match(/image.*/)) {
      reject(new Error('Please select an image file (JPG, PNG)'));
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      reject(new Error('Image too large. Use a photo under 15MB.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read image. Try a different photo.'));
    reader.onload = (ev) => {
      try {
        const rawUrl = ev.target?.result;
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
          const url = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
          const b64 = url.split(',')[1];
          if (!b64) { reject(new Error('Image processing error.')); return; }
          resolve({ url, b64 });
        };
        img.onerror = () => reject(new Error('Failed to decode image.'));
        img.src = rawUrl;
      } catch (err) {
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    };
    reader.readAsDataURL(file);
  });
}

export function isSamsungBrowser() {
  return /SamsungBrowser/i.test(navigator.userAgent);
}
