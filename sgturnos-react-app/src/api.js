import axios from 'axios';

// Determinar la URL base del API
// En desarrollo local: SIEMPRE usa localhost (prioridad sobre variables de entorno)
// En producción (Vercel/Netlify): usa VITE_API_BASE_URL o fallback a Render
let API_BASE_URL;

if (typeof window !== 'undefined' && window.location) {
  const hostname = window.location.hostname;
  const isDevelopment = hostname === 'localhost' || hostname === '127.0.0.1';
  
  if (isDevelopment) {
    // Desarrollo local: FORZAR localhost (ignorar variables de entorno)
    API_BASE_URL = 'http://localhost:8085/api';
    console.log('🔧 Modo desarrollo: forzando backend local');
  } else {
    // Producción (Vercel, Netlify, etc.)
    // Intenta VITE_API_BASE_URL primero, luego VITE_API_URL, luego fallback
    let apiUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'https://sgturnos-backend.onrender.com/api';
    // Asegurar que termina con /api
    API_BASE_URL = apiUrl.endsWith('/api') ? apiUrl : (apiUrl.endsWith('/') ? apiUrl + 'api' : apiUrl + '/api');
  }
} else {
  // Fallback si window no está disponible
  API_BASE_URL = 'https://sgturnos-backend.onrender.com/api';
}

console.log('🌐 API_BASE_URL configurada como:', API_BASE_URL);

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
    console.log('📤 Request:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
