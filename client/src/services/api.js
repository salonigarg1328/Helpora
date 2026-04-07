import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL || 'http://localhost:5000';

const API = axios.create({ baseURL: `${API_BASE_URL.replace(/\/$/, '')}/api` });

// Attach token to every request if available
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});
export const login = (formData) => API.post('/auth/login', formData);
export const register = (formData) => API.post('/auth/register', formData);
export const forgotPassword = (formData) => API.post('/auth/forgot-password', formData);
export const resetPassword = (token, formData) => API.post(`/auth/reset-password/${token}`, formData);
export const createReport = (reportData) => API.post('/reports', reportData);
export const getNearbyReports = (lat, lng, radius = 10) =>
  API.get(`/reports/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
export const acceptReport = (id) => API.patch(`/reports/${id}/accept`);
export const resolveReport = (id) => API.patch(`/reports/${id}/resolve`);
export const getMyResources = () => API.get('/resources/me');
export const addResource = (data) => API.post('/resources', data);
export const updateResource = (id, data) => API.put(`/resources/${id}`, data);
export const deleteResource = (id) => API.delete(`/resources/${id}`);
export const getUnverifiedNgos = () => API.get('/admin/ngos/unverified');
export const verifyNgo = (id) => API.patch(`/admin/verify/${id}`);
export const getStats = () => API.get('/admin/stats');
export const getRecommendations = (reportId) => API.get(`/reports/${reportId}/recommendations`);
export const getMyReports = () => API.get('/reports/my-reports');
export const getMyAcceptedReports = () => API.get('/reports/my-accepted');
export const apiBaseUrl = API_BASE_URL;