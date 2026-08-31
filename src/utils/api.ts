const rawApiUrl = import.meta.env.VITE_API_BASE_URL || 'https://research-paper-backend-1ub4.onrender.com';
const API_BASE_URL = rawApiUrl.replace(/\/$/, '');

let memoryToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export const setAccessToken = (token: string | null) => {
  memoryToken = token;
};

export const getAccessToken = () => memoryToken;

export const clearAccessToken = () => {
  memoryToken = null;
};

/**
 * Perform silent token refresh using the cookie-based refresh token.
 */
export const refreshAccessToken = async (): Promise<string | null> => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Refresh failed');
      }

      const data = await response.json();
      const token = data.access_token;
      setAccessToken(token);
      return token;
    } catch (error) {
      console.warn('Unable to refresh backend access token:', error);
      setAccessToken(null);
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

/**
 * Custom fetch wrapper that automatically appends the backend Access Token
 * and handles automatic token refreshing on 401.
 */
export const apiFetch = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  let url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  // Prevent browser caching of GET requests by adding a timestamp query param
  const method = (options.method || 'GET').toUpperCase();
  if (method === 'GET') {
    const separator = url.includes('?') ? '&' : '?';
    url = `${url}${separator}_t=${Date.now()}`;
  }
  
  // Set up headers
  const headers = new Headers(options.headers || {});
  if (memoryToken) {
    headers.set('Authorization', `Bearer ${memoryToken}`);
  }

  // Attempt the request
  let response = await fetch(url, { ...options, headers });

  // Handle 401 Unauthorized (expired backend token)
  if (response.status === 401) {
    console.log('Access token expired or invalid, attempting silent refresh...');
    const newToken = await refreshAccessToken();
    
    if (newToken) {
      headers.set('Authorization', `Bearer ${newToken}`);
      response = await fetch(url, { ...options, headers });
    }
  }

  return response;
};
