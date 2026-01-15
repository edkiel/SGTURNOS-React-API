import axios from 'axios';

// Base URL utilizada por el frontend
// En producción (Vercel/Netlify) usa la URL del backend de Render
// En desarrollo usa localhost
const isProduction = window.location.hostname.includes('vercel.app') || 
                     window.location.hostname.includes('netlify.app') ||
                     window.location.hostname.includes('pages.github.io');
export const API_BASE_URL = isProduction 
  ? (import.meta.env.VITE_API_URL || 'https://sgturnos-backend.onrender.com/api')
  : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085/api');

// Creamos una instancia de Axios para configurar los headers globalmente
export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para agregar el token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
