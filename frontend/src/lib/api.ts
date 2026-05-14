// src/lib/api.ts
// Single API client — the ONLY place that talks to the backend.
// Adds auth header, handles auto-refresh on 401, parses JSON, throws on error.

const _envApiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
// Make sure API_BASE always ends with /api (in case the user only provided the domain in Vercel settings)
const API_BASE = _envApiUrl.endsWith('/api') ? _envApiUrl : `${_envApiUrl.replace(/\/+$/, '')}/api`;

// ── In-memory token (never localStorage — prevents XSS theft) ─────────────
let _accessToken: string | null = null;
export const setAccessToken = (t: string | null) => { _accessToken = t; };
export const getAccessToken = ()                  => _accessToken;

// ── Core fetch wrapper ────────────────────────────────────────────────────
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (_accessToken) {
    headers['Authorization'] = `Bearer ${_accessToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include', // Sends httpOnly refresh-token cookie automatically
  });

  // ── Silent token refresh on 401 ──────────────────────────────────────
  // Access tokens expire every 15 min. Instead of forcing re-login,
  // silently get a new one from the refresh-token cookie, then retry.
  if (res.status === 401 && path !== '/auth/refresh') {
    const refreshed = await _tryRefresh();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${_accessToken}`;
      const retry = await fetch(`${API_BASE}${path}`, {
        ...options, headers, credentials: 'include',
      });
      return _handleResponse<T>(retry);
    }
    // Refresh also failed — session truly expired, signal to AuthContext
    window.dispatchEvent(new Event('auth:expired'));
    throw Object.assign(new Error('Session expired. Please log in.'), { status: 401 });
  }

  return _handleResponse<T>(res);
}

// ── Parse JSON, throw on API errors ──────────────────────────────────────
async function _handleResponse<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({ success: false, message: 'Bad server response' }));
  if (!body.success) {
    const err = Object.assign(new Error(body.message ?? 'API error'), { status: res.status });
    throw err;
  }
  return body as T;
}

// ── Refresh access token via httpOnly cookie ──────────────────────────────
async function _tryRefresh(): Promise<boolean> {
  try {
    const res  = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST', credentials: 'include',
    });
    const body = await res.json();
    if (body.success && body.accessToken) {
      setAccessToken(body.accessToken);
      return true;
    }
    return false;
  } catch { return false; }
}
