import React, { useState } from 'react';
import axios from 'axios'; // Asegúrate de que axios esté instalado

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Reemplaza esta URL con la de tu endpoint de Spring Boot
      const response = await axios.post('http://localhost:8080/api/auth/login', { email, password });
      console.log('Login exitoso:', response.data);
      // Aquí podrías guardar el token de autenticación y redirigir al usuario
    } catch (err) {
      setError('Error en el login. Verifica tus credenciales.');
      console.error('Error en el login:', err);
    }
  };

  return (
    <div>
      <h2>Página de Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Correo:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Iniciar Sesión</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default Login;