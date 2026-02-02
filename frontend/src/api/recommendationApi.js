const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:8080/api';

export const getRecommendation = async (requirements) => {
    const response = await fetch(`${API_BASE_URL}/recommend`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requirements),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get recommendation');
    }

    return response.json();
};

export const getAllServices = async () => {
    const response = await fetch(`${API_BASE_URL}/services`);

    if (!response.ok) {
        throw new Error('Failed to fetch services');
    }

    return response.json();
};

export const getUseCases = async () => {
    const response = await fetch(`${API_BASE_URL}/use-cases`);

    if (!response.ok) {
        throw new Error('Failed to fetch use cases');
    }

    return response.json();
};

export const healthCheck = async () => {
    const response = await fetch(`${API_BASE_URL}/health`);

    if (!response.ok) {
        throw new Error('API health check failed');
    }

    return response.json();
};
