export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api')
).replace(/\/$/, '');

export const apiUrl = (path: string): string => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

export const getAdminAuthHeaders = (): Record<string, string> => {
  try {
    const raw = localStorage.getItem('finance_pulse_admin_auth_v1');
    const token = raw ? JSON.parse(raw).token : '';
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
};

export const apiFetch = (path: string, init: RequestInit = {}): Promise<Response> => {
  return fetch(apiUrl(path), init);
};

export const adminApiFetch = (path: string, init: RequestInit = {}): Promise<Response> => {
  return fetch(apiUrl(path), {
    ...init,
    headers: {
      ...getAdminAuthHeaders(),
      ...(init.headers || {})
    }
  });
};
