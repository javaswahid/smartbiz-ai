const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const api = {
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('smartbiz_token');
    }
    return null;
  },

  setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('smartbiz_token', token);
    }
  },

  clearToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('smartbiz_token');
      localStorage.removeItem('smartbiz_user');
    }
  },

  getUser(): any | null {
    if (typeof window !== 'undefined') {
      const u = localStorage.getItem('smartbiz_user');
      return u ? JSON.parse(u) : null;
    }
    return null;
  },

  setUser(user: any) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('smartbiz_user', JSON.stringify(user));
    }
  },

  async request(endpoint: string, options: RequestInit = {}) {
    const token = this.getToken();
    const headers = new Headers(options.headers || {});

    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const config = {
      ...options,
      headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, config);

    // If unauthorized, auto-logout
    if (response.status === 401 || response.status === 403) {
      this.clearToken();
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Terjadi kesalahan sistem');
    }

    return json;
  },

  get(endpoint: string) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint: string, body: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  put(endpoint: string, body: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  delete(endpoint: string) {
    return this.request(endpoint, { method: 'DELETE' });
  },
};
export default api;
