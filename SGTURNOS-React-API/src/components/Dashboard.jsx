import React, { useState } from 'react';

const Dashboard = () => {
  const [newCorreo, setNewCorreo] = useState('');
  const [newContrasena, setNewContrasena] = useState('');
  const [newRol, setNewRol] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo: newCorreo, contrasena: newContrasena, rol: newRol }),
      });

      if (response.ok) {
        const text = await response.text();
        setMessage(text);
        setNewCorreo('');
        setNewContrasena('');
        setNewRol('');
      } else {
        const errorText = await response.text();
        setError(errorText);
      }
    } catch (err) {
      setError('Ocurrió un error al crear el usuario.');
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-xl p-8 bg-white rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Panel de Administración</h2>
      {message && <p className="text-green-500 text-center mb-4">{message}</p>}
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <form onSubmit={handleCreateUser} className="space-y-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Correo del nuevo usuario:</label>
          <input
            className="shadow appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="email"
            value={newCorreo}
            onChange={(e) => setNewCorreo(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Contraseña:</label>
          <input
            className="shadow appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="password"
            value={newContrasena}
            onChange={(e) => setNewContrasena(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Rol (ej: ADMINISTRADOR, USUARIO):</label>
          <input
            className="shadow appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="text"
            value={newRol}
            onChange={(e) => setNewRol(e.target.value)}
            required
          />
        </div>
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-xl focus:outline-none focus:shadow-outline w-full"
          type="submit"
        >
          Crear Usuario
        </button>
      </form>
    </div>
  );
};

export default Dashboard;
