import axios from 'axios';
import { Capacitor } from '@capacitor/core';

// Detect if running on Android/iOS
const isNative = Capacitor.isNativePlatform();

// Use your computer's IP address if running on device
// You MUST confirm this IP is correct for your local network
const DEV_API_URL = 'http://192.168.1.8:5001/api'; 
const PROD_API_URL = '/api'; // Stays relative for web

const api = axios.create({
  baseURL: isNative ? DEV_API_URL : PROD_API_URL,
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
