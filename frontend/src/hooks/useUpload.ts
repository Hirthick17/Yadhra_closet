// src/hooks/useUpload.ts
// Uploads images DIRECTLY to Cloudinary from the browser using a signed token.
//
// WHY this pattern instead of proxying through the backend:
//   - Vercel serverless functions cap request bodies at 4.5 MB — unusable for images.
//   - Proxying a 3 MB file through Express doubles bandwidth (browser→server→Cloudinary).
//   - Direct upload is faster, cheaper (no egress from the API server), and Vercel-safe.
//
// HOW security is maintained:
//   - The Cloudinary API secret NEVER leaves the backend.
//   - The backend generates a short-lived HMAC signature (expires in 1 hour).
//   - Without the signature, nobody can upload to your Cloudinary account.
//   - Only logged-in admins can fetch a signature (route is protected).

import { getAccessToken } from '../lib/api';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export interface UploadResult {
  url:      string;  // Full HTTPS Cloudinary URL (secure_url)
  publicId: string;  // Cloudinary public_id (needed for deletion)
}

// ─── Step 1: Fetch a signed upload token from the backend ───────────────────
interface SignatureResponse {
  success:   boolean;
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey:    string;
  folder:    string;
}

async function getUploadSignature(): Promise<SignatureResponse> {
  const token = getAccessToken();
  const res   = await fetch(`${API_BASE}/upload/sign`, {
    method:      'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).message ?? 'Failed to get upload signature');
  }

  return res.json();
}

// ─── Step 2: Upload directly to Cloudinary ───────────────────────────────────
export async function uploadImage(file: File): Promise<UploadResult> {
  // Validate client-side before hitting the network
  const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
  const ALLOWED  = ['image/jpeg', 'image/png', 'image/webp'];

  if (!ALLOWED.includes(file.type)) {
    throw new Error('Only JPG, PNG, and WebP images are allowed.');
  }
  if (file.size > MAX_SIZE) {
    throw new Error('File is too large. Maximum size is 5 MB.');
  }

  // Get a fresh signature from the backend
  const { signature, timestamp, cloudName, apiKey, folder } =
    await getUploadSignature();

  // Build the FormData exactly matching the signed parameters
  const formData = new FormData();
  formData.append('file',        file);
  formData.append('api_key',     apiKey);
  formData.append('timestamp',   String(timestamp));
  formData.append('signature',   signature);
  formData.append('folder',      folder);
  // Must match the 'eager' param that was signed on the server
  formData.append('eager',       'c_limit,w_1200,h_1600,q_auto,f_auto');

  // Upload directly to Cloudinary — bypasses the Express server entirely
  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: formData }
    // NOTE: No Content-Type header — fetch sets multipart boundary automatically
  );

  if (!uploadRes.ok) {
    const errData = await uploadRes.json().catch(() => ({}));
    throw new Error((errData as any).error?.message ?? 'Cloudinary upload failed');
  }

  const data = await uploadRes.json();

  return {
    url:      data.secure_url,  // e.g. https://res.cloudinary.com/...
    publicId: data.public_id,   // e.g. yadhra-closet/products/abc123
  };
}

// ─── React hook ──────────────────────────────────────────────────────────────
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
