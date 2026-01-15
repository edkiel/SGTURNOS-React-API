import axios from 'axios';

// Determinar la URL base del API
// En desarrollo local: http://localhost:8085/api
// En producción (Vercel): usar VITE_API_URL o fallback a Render
let API_BASE_URL;

if (typeof window !== 'undefined' && window.location) {
  const hostname = window.location.hostname;
  const isDevelopment = hostname === 'localhost' || hostname === '127.0.0.1';
  
  if (isDevelopment) {
    // Desarrollo local
    API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085/api';
  } else {
    // Producción (Vercel, Netlify, etc.)
    const apiUrl = import.meta.env.VITE_API_URL || 'https://sgturnos-backend.onrender.com/api';
    API_BASE_URL = apiUrl.endsWith('/api') ? apiUrl : apiUrl + '/api';
  }
} else {
  // Fallback si window no está disponible
  API_BASE_URL = 'https://sgturnos-backend.onrender.com/api';
}

export { API_BASE_URL };

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
