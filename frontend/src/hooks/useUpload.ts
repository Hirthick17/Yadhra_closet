// src/hooks/useUpload.ts
// Uploads an image file to the backend which streams it to Cloudinary.
// Returns the public Cloudinary URL to store in the product's images array.
// WHY not upload directly to Cloudinary from the browser:
//   Uploading from frontend would expose your API secret in the JS bundle.
//   The backend holds the secret and signs the upload.

import { getAccessToken } from '../lib/api';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export interface UploadResult {
  url:      string;
  publicId: string;
}

// Upload a single image file. Returns the Cloudinary URL.
export async function uploadImage(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('image', file);

  const token = getAccessToken();
  const res   = await fetch(`${API_BASE}/upload`, {
    method:      'POST',
    credentials: 'include',
    headers:     token ? { Authorization: `Bearer ${token}` } : {},
    body:        formData,
    // NOTE: DO NOT set Content-Type header manually.
    // Fetch sets it automatically for FormData (with the boundary).
  });

  const data = await res.json();
  if (!data.success) throw new Error(data.message ?? 'Upload failed');
  return { url: data.url, publicId: data.publicId };
}

// Hook for tracking upload progress state in components
import { useState, useCallback } from 'react';

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const upload = useCallback(async (file: File): Promise<UploadResult | null> => {
    setUploading(true);
    setError(null);
    try {
      const result = await uploadImage(file);
      return result;
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  return { upload, uploading, error };
}
