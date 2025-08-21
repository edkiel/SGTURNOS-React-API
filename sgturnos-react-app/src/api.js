import axios from 'axios';

// Creamos una instancia de Axios para configurar los headers globalmente
export const api = axios.create({
  baseURL: 'http://localhost:8085/api',
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
