import React, { useState, useEffect } from 'react';

const Dashboard = ({ user, onLogout }) => {
  const [newCorreo, setNewCorreo] = useState('');
  const [newContrasena, setNewContrasena] = useState('');
  const [newRol, setNewRol] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Funci\u00f3n para crear un usuario, ahora con autorizaci\u00f3n.
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // Obtenemos el token del localStorage
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setError('No hay token de autenticaci\u00f3n. Por favor, inicia sesi\u00f3n.');
      onLogout(); // Cerrar sesi\u00f3n si no hay token.
      return;
    }

    try {
      // Ajusta la URL completa para el endpoint de tu backend
      const response = await fetch('http://localhost:8085/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // A\u00f1adimos el token de autorizaci\u00f3n en el encabezado
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ correo: newCorreo, contrasena: newContrasena, rol: newRol }),
      });

      if (response.ok) {
        const text = await response.text();
        setMessage(text);
        setNewCorreo('');
        setNewContrasena('');
        setNewRol('');
      } else if (response.status === 401 || response.status === 403) {
        setError('No tienes permisos para realizar esta acci\u00f3n o tu sesi\u00f3n ha expirado.');
        onLogout(); // Cerrar sesi\u00f3n en caso de error de autorizaci\u00f3n
      } else {
        const errorText = await response.text();
        setError(errorText || 'Ocurri\u00f3 un error al crear el usuario.');
      }
    } catch (err) {
      setError('Ocurri\u00f3 un error de conexi\u00f3n con el servidor.');
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-xl p-8 bg-white rounded-xl shadow-lg relative">
      <button
        onClick={onLogout}
        className="absolute top-4 right-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl focus:outline-none focus:shadow-outline"
      >
        Cerrar Sesi\u00f3n
      </button>

      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Panel de Administraci\u00f3n</h2>
      {message && <p className="text-green-500 text-center mb-4">{message}</p>}
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      
      <div className="mt-8 p-6 bg-gray-50 rounded-xl">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Crear Nuevo Usuario</h3>
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
            <label className="block text-gray-700 text-sm font-bold mb-2">Contrase\u00f1a:</label>
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
      {/* Publish malla - visible only to admin (client-side guard) */}
      {(() => {
        // simple admin detection: check user role name or id
        const isAdmin = user && ((user.rol && user.rol.rol && String(user.rol.rol).toUpperCase().includes('ADMIN')) || (user.rol && user.rol.idRol && String(user.rol.idRol).toLowerCase().includes('adm')));
        if (!isAdmin) return null;
        return (
          <div className="mt-6 p-6 bg-blue-50 rounded-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Publicar Malla (Administradores)</h3>
            <div className="space-y-2">
              <input type="text" placeholder="roleId (ej: med03)" className="w-full p-2 border rounded" id="pubRole" />
              <input type="month" className="w-full p-2 border rounded" id="pubMonth" defaultValue={new Date().toISOString().slice(0,7)} />
              <button
                onClick={async () => {
                  const roleId = document.getElementById('pubRole').value;
                  const month = document.getElementById('pubMonth').value;
                  if (!roleId || !month) { setError('roleId y month son requeridos'); return; }
                  try {
                    const res = await fetch(`/api/mallas/publish?roleId=${encodeURIComponent(roleId)}&month=${encodeURIComponent(month)}`, { method: 'POST' });
                    if (!res.ok) { const t = await res.text(); setError(t || 'Error publicando'); return; }
                    const json = await res.json();
                    setMessage('Malla publicada: ' + json.file);
                  } catch (e) { setError('Error de red: ' + e.message); }
                }}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >Publicar Malla</button>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default Dashboard;
