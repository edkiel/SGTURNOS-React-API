import React, { useState } from 'react';
import axios from 'axios';

const LoginForm = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Ajusta esta URL si tu backend no est\u00e1 en localhost:8085
      const response = await axios.post('http://localhost:8085/api/auth/login', { email, password });
      
      // Guarda el token de acceso en el almacenamiento local
      localStorage.setItem('accessToken', response.data.accessToken);
      onLoginSuccess();

    } catch (err) {
      if (err.response) {
        // El servidor respondi\u00f3 con un c\u00f3digo de estado fuera del rango 2xx
        if (err.response.status === 401) {
          setError('Credenciales incorrectas. Por favor, revisa tu correo y contrase\u00f1a.');
        } else if (err.response.status === 403) {
          setError('Acceso denegado. No tienes permiso para iniciar sesi\u00f3n.');
        } else {
          setError(`Error del servidor: ${err.response.data.message || 'Ocurri\u00f3 un error.'}`);
        }
      } else if (err.request) {
        // La solicitud fue hecha pero no se recibi\u00f3 respuesta
        setError('Ocurri\u00f3 un error de conexi\u00f3n con el servidor. Verifica que el backend est\u00e9 en funcionamiento.');
      } else {
        // Algo m\u00e1s caus\u00f3 el error
        setError('Ocurri\u00f3 un error inesperado. Int\u00e9ntalo de nuevo.');
      }
      console.error(err);
    }
  };

  return (
    <div className="login-card w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl">
      <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-8">Iniciar Sesi\u00f3n</h2>
      {error && <p className="text-red-500 text-center mb-4 font-semibold">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 text-base font-bold mb-2">Correo:</label>
          <input
            className="shadow-sm appearance-none border-2 border-gray-200 rounded-xl w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 text-base font-bold mb-2">Contrase\u00f1a:</label>
          <input
            className="shadow-sm appearance-none border-2 border-gray-200 rounded-xl w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300 w-full transition-colors duration-300 transform hover:scale-105"
          type="submit"
        >
          Entrar
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
