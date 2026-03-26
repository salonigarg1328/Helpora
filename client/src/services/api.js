import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:3000/api' });

// Attach token to every request if available
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  console.log('Interceptor running, token:', token);
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});
const token = localStorage.getItem('token');
fetch('http://localhost:3000/api/reports/nearby?lat=28.7041&lng=77.1025&radius=10', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(res => res.json()).then(data => console.log(data));
export const login = (formData) => API.post('/auth/login', formData);
export const register = (formData) => API.post('/auth/register', formData);
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