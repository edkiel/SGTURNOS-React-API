import React, { useState, useEffect } from 'react';
import { api } from '../api';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      console.log('Obteniendo lista de usuarios...');
      const response = await api.get('/usuarios/getall');
      console.log('Respuesta del servidor:', response.data);
      setUsers(response.data);
      setError('');
    } catch (err) {
      console.error('Error al obtener usuarios:', err);
      console.error('Detalles del error:', {
        status: err.response?.status,
        data: err.response?.data,
        headers: err.response?.headers
      });
      
      if (err.response?.status === 403) {
        setError('No tienes permisos para ver la lista de usuarios');
      } else if (err.response?.status === 401) {
        setError('Sesión expirada. Por favor, vuelve a iniciar sesión.');
      } else if (!err.response) {
        setError('Error de conexión con el servidor');
      } else {
        setError(`Error al cargar la lista de usuarios: ${err.response.data?.message || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        await api.delete(`/usuarios/${userId}`);
        fetchUsers(); // Recargar la lista después de eliminar
        alert('Usuario eliminado correctamente');
      } catch (err) {
        console.error('Error al eliminar usuario:', err);
        alert('Error al eliminar el usuario');
      }
    }
  };

  const handleEdit = (user) => {
    setEditingUser({
      ...user,
      contrasena: '' // No mostrar la contraseña actual
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/usuarios/${editingUser.idUsuario}`, editingUser);
      setEditingUser(null);
      fetchUsers(); // Recargar la lista después de actualizar
      alert('Usuario actualizado correctamente');
    } catch (err) {
      console.error('Error al actualizar usuario:', err);
      alert('Error al actualizar el usuario');
    }
  };

  if (loading) {
    return <div className="text-center">Cargando usuarios...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Lista de Usuarios</h2>
        <button
          onClick={() => {
            setLoading(true);
            fetchUsers();
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Cargando...
            </>
          ) : (
            'Actualizar Lista'
          )}
        </button>
      </div>
      
      {/* Modal de edición */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-bold mb-4">Editar Usuario</h3>
            <form onSubmit={handleUpdate}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Primer Nombre</label>
                <input
                  type="text"
                  value={editingUser.primerNombre || ''}
                  onChange={(e) => setEditingUser({...editingUser, primerNombre: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Segundo Nombre</label>
                <input
                  type="text"
                  value={editingUser.segundoNombre || ''}
                  onChange={(e) => setEditingUser({...editingUser, segundoNombre: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Primer Apellido</label>
                <input
                  type="text"
                  value={editingUser.primerApellido || ''}
                  onChange={(e) => setEditingUser({...editingUser, primerApellido: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Segundo Apellido</label>
                <input
                  type="text"
                  value={editingUser.segundoApellido || ''}
                  onChange={(e) => setEditingUser({...editingUser, segundoApellido: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Correo</label>
                <input
                  type="email"
                  value={editingUser.correo || ''}
                  onChange={(e) => setEditingUser({...editingUser, correo: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Nueva Contraseña (dejar en blanco para mantener la actual)</label>
                <input
                  type="password"
                  value={editingUser.contrasena || ''}
                  onChange={(e) => setEditingUser({...editingUser, contrasena: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabla de usuarios */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.idUsuario}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {`${user.primerNombre} ${user.segundoNombre || ''} ${user.primerApellido} ${user.segundoApellido || ''}`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{user.correo}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.idRol}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleEdit(user)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(user.idUsuario)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;
