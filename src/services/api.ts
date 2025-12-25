import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

import { useAuthStore } from '../store/useAuthStore';

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token || localStorage.getItem('auth-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
