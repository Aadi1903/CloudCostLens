/**
 * Deployment API — wraps all /api/deploy* endpoints
 */

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:8080/api');

const handleResponse = async (response) => {
  if (response.status === 401) {
    // Session expired or invalid — clear local storage and redirect to login
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    
    // Use window.location as we are outside the React Router context in this utility
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

const getAuthHeader = () => {
  const token = localStorage.getItem('jwt');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const startDeployment = async (requirements, recommendation) => {
  const response = await fetch(`${API_BASE}/deploy`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({ requirements, recommendation }),
  });
  return handleResponse(response);
};

export const getDeploymentStatus = async (deploymentId) => {
  const response = await fetch(`${API_BASE}/deploy/${deploymentId}/status`);
  return handleResponse(response);
};

export const getTerraformPlan = async (deploymentId) => {
  const response = await fetch(`${API_BASE}/deploy/${deploymentId}/plan`);
  return handleResponse(response);
};

export const createPlanPreview = async (requirements) => {
  const response = await fetch(`${API_BASE}/deploy/plan-preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requirements }),
  });
  return handleResponse(response);
};

export const destroyDeployment = async (deploymentId) => {
  const response = await fetch(`${API_BASE}/deploy/${deploymentId}/destroy`, {
    method: 'POST',
    headers: { ...getAuthHeader() }
  });
  return handleResponse(response);
};

export const stopDeployment = async (deploymentId) => {
  const response = await fetch(`${API_BASE}/deploy/${deploymentId}/stop`, {
    method: 'POST',
    headers: { ...getAuthHeader() }
  });
  return handleResponse(response);
};

export const getAllDeployments = async () => {
  const response = await fetch(`${API_BASE}/deployments`);
  return handleResponse(response);
};

export const getDeploymentResources = async (deploymentId) => {
  const response = await fetch(`${API_BASE}/deploy/${deploymentId}/resources`);
  return handleResponse(response);
};

export const getModuleInfo = async (applicationType, traffic = 'low') => {
  const response = await fetch(
    `${API_BASE}/deploy/module-info?applicationType=${encodeURIComponent(applicationType)}&traffic=${encodeURIComponent(traffic)}`
  );
  return handleResponse(response);
};
