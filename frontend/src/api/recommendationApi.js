/**
 * Recommendation API — wraps all /api/recommend* and /api/health endpoints.
 * In production (when served from Spring Boot), uses relative /api path.
 * In development (Vite dev server), uses absolute localhost:8080.
 */

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:8080/api');

const handleResponse = async (response) => {
  if (response.status === 401) {
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login?expired=true';
    }
    throw new Error('Your session has expired. Please log in again.');
  }

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      message = body.error || body.message || message;
    } catch { /* ignore parse error */ }
    throw new Error(message);
  }
  return response.json();
};

export const getRecommendation = async (requirements) => {
  const response = await fetch(`${API_BASE}/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requirements),
  });
  return handleResponse(response);
};

export const getAllServices = async () => {
  const response = await fetch(`${API_BASE}/services`);
  return handleResponse(response);
};

export const getUseCases = async () => {
  const response = await fetch(`${API_BASE}/use-cases`);
  return handleResponse(response);
};

export const healthCheck = async () => {
  const response = await fetch(`${API_BASE}/health`);
  return handleResponse(response);
};

export const checkCredentials = async () => {
  const response = await fetch(`${API_BASE}/health/credentials`);
  return handleResponse(response);
};
