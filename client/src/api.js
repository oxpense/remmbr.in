const BASE_URL = import.meta.env.VITE_API_URL || 'https://api.remmbr.xyz/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}

// Auth
export const auth = {
  sendOtp: (email, action) =>
    request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email, action }),
    }),
  registerVerify: (name, email, password, otp) =>
    request('/auth/register-verify', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, otp }),
    }),
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  resetPassword: (email, otp, newPassword) =>
    request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, newPassword }),
    }),
  me: () => request('/auth/me'),
  updateSettings: (settings) =>
    request('/auth/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),
};

// Items
export const items = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/items${query ? `?${query}` : ''}`);
  },
  getUpcoming: (days = 30) => request(`/items/upcoming?days=${days}`),
  getExpired: () => request('/items/expired'),
  getStats: () => request('/items/stats'),
  getById: (id) => request(`/items/${id}`),
  create: (data) =>
    request('/items', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    request(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    request(`/items/${id}`, {
      method: 'DELETE',
    }),
};

// Categories
export const categories = {
  getAll: () => request('/categories'),
  getWithCounts: () => request('/categories/with-counts'),
};

// Notifications
export const notifications = {
  sendTest: () => request('/notifications/test', { method: 'POST' }),
  getLogs: () => request('/notifications/logs'),
};

// Health
export const health = () => request('/health');
