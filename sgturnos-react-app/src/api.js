import axios from 'axios';

// Base URL utilizada por el frontend (usa variable de entorno o localhost por defecto)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085/api';

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
