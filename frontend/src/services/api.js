import axios from 'axios';

const API = axios.create({
  baseURL: 'https://archflow-zeta.vercel.app/api',
});

// Attach JWT token to every request if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('archflow_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const registerUser  = (data)  => API.post('/auth/register', data);
export const loginUser     = (data)  => API.post('/auth/login', data);
export const fetchMe       = ()      => API.get('/auth/me');

// Designs
export const generateDesign    = (prompt) => API.post('/designs/generate', { prompt });
export const fetchMyDesigns    = ()        => API.get('/designs');
export const fetchDesign       = (id)      => API.get(`/designs/${id}`);
export const fetchSharedDesign = (shareId) => API.get(`/designs/share/${shareId}`);
export const shareDesign       = (id)      => API.post(`/designs/${id}/share`);
export const unshareDesign     = (id)      => API.post(`/designs/${id}/unshare`);
export const regenerateDesign  = (id)      => API.post(`/designs/${id}/regenerate`);
export const fetchVersions     = (id)      => API.get(`/designs/${id}/versions`);
export const deleteDesign      = (id)      => API.delete(`/designs/${id}`);

export default API;
