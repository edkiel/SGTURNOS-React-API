import React, { useState } from 'react';
import { api } from '../api';

const LoginForm = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔐 Login form submitted');
    console.log('Email:', email);
    console.log('Password:', password ? '***' : 'empty');
    setError('');
    setLoading(true);

    try {
      console.log('Enviando request a /auth/login...');
      
      // Crear un timeout de 10 segundos
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.log('⏱️ Timeout: El backend no respondió en 10 segundos');
      }, 10000);
      
      const response = await api.post('/auth/login', { email, password }, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      console.log('✅ Login exitoso:', response.data);
      
      // Guarda el token de acceso en el almacenamiento local
      localStorage.setItem('token', response.data.accessToken);
      setLoading(false);
      onLoginSuccess();

    } catch (err) {
      setLoading(false);
      console.log('❌ Error capturado:', err);
      console.log('Error response:', err.response);
      console.log('Error response data:', err.response?.data);
      console.log('Error message:', err.message);
      console.log('Error code:', err.code);
      
      if (err.code === 'ERR_CANCELED') {
        console.log('Request abortado por timeout');
        setError('El servidor tardó demasiado en responder. Verifica que el backend esté corriendo en http://localhost:8085');
      } else if (err.response) {
        // El servidor respondió con un código de estado fuera del rango 2xx
        if (err.response.status === 401) {
          // Intenta obtener el mensaje del error response (JSON)
          const errorData = err.response.data;
          console.log('Error data type:', typeof errorData);
          console.log('Error data:', errorData);
          
          if (typeof errorData === 'string') {
            setError(errorData);
          } else if (errorData && errorData.error) {
            setError(errorData.error);
          } else if (errorData && errorData.message) {
            setError(errorData.message);
          } else {
            setError('Credenciales incorrectas. Por favor, revisa tu correo y contraseña.');
          }
        } else if (err.response.status === 403) {
          setError('Acceso denegado. No tienes permiso para iniciar sesión.');
        } else if (err.response.status === 400) {
          const errorData = err.response.data;
          setError(typeof errorData === 'string' ? errorData : 'Solicitud inválida. Verifica los datos ingresados.');
        } else {
          const errorData = err.response.data;
          const message = typeof errorData === 'string' ? errorData : (errorData?.message || 'Ocurrió un error.');
          setError(`Error del servidor: ${message}`);
        }
      } else if (err.request) {
        // La solicitud fue hecha pero no se recibió respuesta
        console.log('No hay respuesta del servidor');
        setError('No hay conexión con el servidor. Verifica que el backend esté en funcionamiento en http://localhost:8085');
      } else {
        // Algo más causó el error
        setError('Ocurrió un error inesperado. Inténtalo de nuevo.');
      }
      console.error('Error de login detallado:', err);
    }
  };

  return (
    <div className="login-card w-full max-w-md p-4 sm:p-6 md:p-8 bg-white rounded-2xl shadow-2xl">
      <div className="flex flex-col items-center mb-6 sm:mb-8">
        <img 
          src="https://i.ibb.co/BV0Xp3sF/logosinfondo-SGT-naranja1.png" 
          alt="Logo SGTurnos" 
          className="h-16 w-16 sm:h-20 sm:w-20 mb-3 sm:mb-4"
        />
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-center text-gray-800 mb-1">Sistema de Gestión de Turnos</h1>
        <h2 className="text-base sm:text-lg font-semibold text-center text-gray-600 mb-3 sm:mb-4">SGTurnos</h2>
      </div>
      
      <h3 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-4 sm:mb-6">Iniciar Sesión</h3>
      
      {error && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-md animate-bounce" style={{ animationDuration: '0.5s' }}>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-700">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => setError('')}
              className="text-red-500 hover:text-red-700 focus:outline-none transition"
            >
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div>
          <label className="block text-gray-700 text-sm sm:text-base font-bold mb-2">Correo:</label>
          <input
            className="shadow-sm appearance-none border-2 border-gray-200 rounded-xl w-full py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 text-sm sm:text-base font-bold mb-2">Contraseña:</label>
          <input
            className="shadow-sm appearance-none border-2 border-gray-200 rounded-xl w-full py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
        </div>
        <button
          className={`text-white font-bold py-2.5 sm:py-3 px-4 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300 w-full transition-colors duration-300 transform text-sm sm:text-base ${
            loading 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
          }`}
          type="submit"
          disabled={loading}
        >
          {loading ? 'Iniciando sesión...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
