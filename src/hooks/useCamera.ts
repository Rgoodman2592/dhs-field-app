import { useRef, useState, useCallback } from 'react';

/** Compress an image blob to max dimension and JPEG quality */
async function compressImage(blob: Blob, maxDim = 1920, quality = 0.8): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (b) => resolve(b || blob),
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(blob);
    };
    img.src = url;
  });
}

export function useCamera() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [photos, setPhotos] = useState<Array<{ id: string; url: string; blob: Blob }>>([]);
  const [capturing, setCapturing] = useState(false);

  const capturePhoto = useCallback(() => {
    // Use file input with capture="environment" for rear camera on mobile
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setCapturing(true);
      try {
        const compressed = await compressImage(file);
        const id = crypto.randomUUID();
        const url = URL.createObjectURL(compressed);
        setPhotos(prev => [...prev, { id, url, blob: compressed }]);
      } finally {
        setCapturing(false);
      }
    };
    input.click();
    inputRef.current = input;
  }, []);

  const selectFromGallery = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;
      setCapturing(true);
      try {
        for (const file of Array.from(files)) {
          const compressed = await compressImage(file);
          const id = crypto.randomUUID();
          const url = URL.createObjectURL(compressed);
          setPhotos(prev => [...prev, { id, url, blob: compressed }]);
        }
      } finally {
        setCapturing(false);
      }
    };
    input.click();
  }, []);

  const removePhoto = useCallback((id: string) => {
    setPhotos(prev => {
      const photo = prev.find(p => p.id === id);
      if (photo) URL.revokeObjectURL(photo.url);
      return prev.filter(p => p.id !== id);
    });
  }, []);

  const clearPhotos = useCallback(() => {
    photos.forEach(p => URL.revokeObjectURL(p.url));
    setPhotos([]);
  }, [photos]);

  return { photos, capturePhoto, selectFromGallery, removePhoto, clearPhotos, capturing };
}
