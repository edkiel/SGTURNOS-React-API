import React, { useState } from 'react';
import axios from 'axios';

const CrearUsuario = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/usuarios', { nombre, email, password });
      setMensajeExito('Usuario creado exitosamente.');
      console.log('Usuario creado:', response.data);
      // Limpia los campos del formulario
      setNombre('');
      setEmail('');
      setPassword('');
    } catch (err) {
      setError('Error al crear el usuario. Inténtalo de nuevo.');
      console.error('Error al crear el usuario:', err);
    }
  };

  return (
    <div>
      <h2>Crear Nuevo Usuario</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="nombre">Nombre:</label>
          <input
            type="text"
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>
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
        <button type="submit">Crear Usuario</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {mensajeExito && <p style={{ color: 'green' }}>{mensajeExito}</p>}
    </div>
  );
};

export default CrearUsuario;