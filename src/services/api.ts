import axios from 'axios';
import { Capacitor } from '@capacitor/core';

// Detect if running on Android/iOS
const isNative = Capacitor.isNativePlatform();

// Allow user to override the API URL (stored in localStorage)
const getBaseUrl = () => {
    const custom = localStorage.getItem('custom_api_url');
    if (custom) return `${custom}/api`;
    
    // Default fallback
    const DEV_API_URL = 'http://192.168.1.8:5001/api'; 
    const PROD_API_URL = '/api'; 
    return isNative ? DEV_API_URL : PROD_API_URL;
};

const api = axios.create({
  baseURL: getBaseUrl(),
});

export const updateApiUrl = (url: string) => {
    // Remove trailing slash if present
    const cleanUrl = url.replace(/\/$/, "");
    localStorage.setItem('custom_api_url', cleanUrl);
    api.defaults.baseURL = `${cleanUrl}/api`;
    console.log('API URL updated to:', api.defaults.baseURL);
};

import { useAuthStore } from '../store/useAuthStore';

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token || localStorage.getItem('auth-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
