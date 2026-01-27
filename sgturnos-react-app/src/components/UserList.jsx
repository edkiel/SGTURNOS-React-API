import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import CrearUsuarioCompleto from './CrearUsuarioCompleto';
import Toast from './common/Toast';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchField, setSearchField] = useState('all'); // all, name, id, rol, correo, usuario
  const [showCrearUsuario, setShowCrearUsuario] = useState(false);
  const [showCrearAdmin, setShowCrearAdmin] = useState(false);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [toastData, setToastData] = useState({ visible: false, message: '', type: 'success' });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState(null);
  const [filterActivos, setFilterActivos] = useState(true); // true = solo activos, false = todos

  const showToast = (message, type = 'success') => {
    setToastData({ visible: true, message, type });
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      console.log('Obteniendo lista de usuarios...');
      const response = await api.get('/usuarios');
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
    // Cargar roles estándar para edición
    const cargarRoles = async () => {
      try {
        const resp = await api.get('/roles/estandar');
        const roles = Array.isArray(resp.data?.roles) ? resp.data.roles : [];
        // Detectar si el usuario autenticado es administrador (desde JWT en localStorage)
        try {
          const token = localStorage.getItem('token');
          if (token) {
            const payload = token.split('.')[1];
            const decoded = JSON.parse(atob(payload));
            const rolRaw = decoded.rol || decoded.idRol || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'] || '';
            const rolStr = String(rolRaw).toUpperCase();
            const adminDetected = rolStr.includes('ADMIN');
            setIsAdminUser(adminDetected);
            if (adminDetected) {
              const hasAdmin = roles.some(r => (r.rol || '').toUpperCase() === 'ADMINISTRADOR');
              if (!hasAdmin) roles.push({ id: 'adm05', rol: 'ADMINISTRADOR' });
            }
          }
        } catch {}
        setAvailableRoles(roles);
      } catch (e) {
        // fallback si falla
        const fallback = [
          { id: 'aux01', rol: 'AUXILIAR' },
          { id: 'med02', rol: 'MEDICO' },
          { id: 'ter04', rol: 'TERAPIA' },
          { id: 'enfer03', rol: 'ENFERMERO' }
        ];
        try {
          const token = localStorage.getItem('token');
          if (token) {
            const payload = token.split('.')[1];
            const decoded = JSON.parse(atob(payload));
            const rolRaw = decoded.rol || decoded.idRol || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'] || '';
            const adminDetected = String(rolRaw).toUpperCase().includes('ADMIN');
            setIsAdminUser(adminDetected);
            if (adminDetected) fallback.push({ id: 'adm05', rol: 'ADMINISTRADOR' });
          }
        } catch {}
        setAvailableRoles(fallback);
      }
    };
    cargarRoles();
  }, []);

  const handleDelete = (user) => {
    setConfirmDelete(user);
  };

  const handleDeactivate = (user) => {
    setConfirmDeactivate(user);
  };

  const confirmDeactivateUser = async () => {
    if (!confirmDeactivate) return;
    try {
      await api.post(`/usuarios/${confirmDeactivate.idUsuario}/desactivar`);
      setConfirmDeactivate(null);
      fetchUsers();
      showToast(`✅ Usuario ${confirmDeactivate.correo} desactivado correctamente.`);
    } catch (err) {
      console.error('Error al desactivar usuario:', err);
      showToast('No pudimos desactivar al usuario. Verifica tu conexión o permisos.', 'error');
      setConfirmDeactivate(null);
    }
  };

  const confirmActivateUser = async (user) => {
    try {
      await api.post(`/usuarios/${user.idUsuario}/activar`);
      fetchUsers();
      showToast(`✅ Usuario ${user.correo} reactivado correctamente.`);
    } catch (err) {
      console.error('Error al reactivar usuario:', err);
      showToast('No pudimos reactivar al usuario. Verifica tu conexión o permisos.', 'error');
    }
  };

  const confirmDeleteUser = async () => {
    if (!confirmDelete) return;
    try {
      await api.delete(`/usuarios/${confirmDelete.idUsuario}`);
      setConfirmDelete(null);
      fetchUsers();
      showToast('Usuario eliminado. La lista ya está al día.');
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
      showToast('No pudimos eliminar al usuario. Verifica tu conexión o permisos.', 'error');
      setConfirmDelete(null);
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
      await api.put(`/usuarios/update/${editingUser.idUsuario}`, editingUser);
      setEditingUser(null);
      fetchUsers(); // Recargar la lista después de actualizar
      showToast('Perfil actualizado con éxito.');
    } catch (err) {
      console.error('Error al actualizar usuario:', err);
      showToast('No pudimos actualizar el perfil. Intenta nuevamente.', 'error');
    }
  };

  if (loading) {
    return <div className="text-center">Cargando usuarios...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  // Totales por rol para tarjetas resumen
  const roleCounts = users.reduce((acc, user) => {
    const roleNameRaw = (user.rol?.rol || user.idRol || 'SIN ROL').toString();
    const key = roleNameRaw.trim() === '' ? 'SIN ROL' : roleNameRaw.toUpperCase();
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const roleEntries = Object.entries(roleCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="w-full p-4 bg-gradient-to-br from-gray-50 to-slate-100 rounded-xl shadow-lg" style={{ maxWidth: '100%' }}>
      {/* Header Principal de Usuarios */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl shadow-2xl mb-6 overflow-hidden">
        {/* Contenedor Principal */}
        <div className="px-8 py-6">
          {/* Fila 1: Título */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Título Gestión de Usuarios */}
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292m0 0H7.465M12.354 9.354H16.465m-8.109-4a3 3 0 01-3-3H3.5m0 0h4m0 0a3 3 0 013-3h4a3 3 0 110 6h-4a3 3 0 01-3-3m0 0H3.5m4 6a3 3 0 013 3v4a3 3 0 01-3 3h-4a3 3 0 01-3-3v-4a3 3 0 013-3h4z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">Gestión de Usuarios</h1>
                <p className="text-purple-100 text-sm mt-1">Administración de cuentas y permisos</p>
              </div>
            </div>
          </div>

          {/* Tarjetas de totales por rol en una fila compacta */}
          <div className="border-t border-white/20 pt-4 mt-4">
            <p className="text-purple-100 text-xs font-semibold mb-3">Usuarios por Rol</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {roleEntries.slice(0, 5).map(([rol, total]) => (
                <div
                  key={rol}
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-3 py-2 text-center"
                >
                  <p className="text-xs text-purple-100 font-medium">{rol}</p>
                  <p className="text-lg font-bold text-white">{total}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 animate-fadeIn">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-red-100">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Confirmar Eliminación</h3>
            <p className="text-center text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar al usuario <span className="font-semibold text-gray-900">{confirmDelete.primerNombre} {confirmDelete.segundoNombre} {confirmDelete.primerApellido} {confirmDelete.segundoApellido}</span>?
              <br />
              <span className="text-sm text-red-600 mt-2 block">Esta acción no se puede deshacer.</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteUser}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast 
        message={toastData.message}
        type={toastData.type}
        isVisible={toastData.visible}
        onClose={() => setToastData({ ...toastData, visible: false })}
        duration={3500}
      />

      {/* Formulario para usuarios normales */}
      {showCrearUsuario && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow-lg border-2 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-blue-900">➕ Nuevo Usuario (rol estándar)</h2>
            <button
              onClick={() => setShowCrearUsuario(false)}
              className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
            >
              ✕ Cerrar
            </button>
          </div>
          <CrearUsuarioCompleto
            variant="normal"
            onUsuarioCreado={() => {
              fetchUsers();
              setShowCrearUsuario(false);
            }}
          />
        </div>
      )}

      {/* Formulario para administradores con departamento */}
      {showCrearAdmin && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow-lg border-2 border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-purple-900">🔐 Nuevo Administrador (Jefe / Operaciones / RRHH)</h2>
            <button
              onClick={() => setShowCrearAdmin(false)}
              className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
            >
              ✕ Cerrar
            </button>
          </div>
          <CrearUsuarioCompleto
            variant="admin"
            onUsuarioCreado={() => {
              fetchUsers();
              setShowCrearAdmin(false);
            }}
          />
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div className="w-full sm:w-auto flex items-center gap-3">
          <h2 className="text-2xl font-bold">Lista de Usuarios</h2>
          <select
            aria-label="Campo de busqueda"
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
            className="ml-3 p-2 border rounded"
          >
            <option value="all">Todos</option>
            <option value="name">Nombre</option>
            <option value="id">Id</option>
            <option value="rol">Rol</option>
            <option value="correo">Correo</option>
          </select>
          <input
            type="text"
            aria-label="Buscar usuarios"
            placeholder={
              searchField === 'all'
                ? 'Buscar por nombre, correo, rol o id...'
                : searchField === 'name'
                ? 'Buscar por nombre...'
                : searchField === 'id'
                ? 'Buscar por id...'
                : searchField === 'rol'
                ? 'Buscar por rol...'
                : 'Buscar por correo...'
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ml-2 p-2 border rounded w-60"
          />
          <button
            onClick={() => fetchUsers()}
            className="ml-2 bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600"
          >
            Buscar
          </button>
          <button
            onClick={() => { setSearch(''); setSearchField('all'); }}
            className="ml-2 bg-gray-200 px-3 py-2 rounded hover:bg-gray-300"
          >
            Limpiar
          </button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowCrearUsuario(true)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2 font-medium"
          >
            ➕ Crear Usuario (normal)
          </button>
          <button
            onClick={() => setShowCrearAdmin(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 flex items-center gap-2 font-medium"
          >
            🔐 Crear Administrador
          </button>
          <button
            onClick={() => setFilterActivos(!filterActivos)}
            className={`px-4 py-2 rounded flex items-center gap-2 font-medium transition-colors ${
              filterActivos 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            {filterActivos ? '✅ Solo Activos' : '⚠️ Mostrar Todos'}
          </button>
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
      </div>

      {/* Modal de confirmación de desactivación */}
      {confirmDeactivate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-6 py-4 rounded-t-xl">
              <h3 className="text-xl font-bold">⚠️ Desactivar Usuario</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                ¿Estás seguro de que deseas desactivar a <strong>{confirmDeactivate.correo}</strong>?
              </p>
              <p className="text-sm text-gray-600 mb-6 bg-gray-50 p-3 rounded">
                El usuario podrá iniciar sesión pero <strong>no tendrá acceso al sistema</strong> y <strong>no será incluido en las mallas</strong>.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmDeactivate(null)}
                  className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeactivateUser}
                  className="px-5 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition-colors"
                >
                  Desactivar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4 rounded-t-xl">
              <h3 className="text-xl font-bold">🗑️ Eliminar Usuario</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                ¿Estás seguro de que deseas eliminar a <strong>{confirmDelete.correo}</strong>?
              </p>
              <p className="text-sm text-red-600 mb-6 bg-red-50 p-3 rounded font-medium">
                ⚠️ Esta acción es irreversible y eliminará todos los datos del usuario.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteUser}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edición */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-xl">
              <h3 className="text-xl font-bold">Editar Usuario</h3>
            </div>
            <form onSubmit={handleUpdate} className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Primer Nombre</label>
                  <input
                    type="text"
                    value={editingUser.primerNombre || ''}
                    onChange={(e) => setEditingUser({...editingUser, primerNombre: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Segundo Nombre</label>
                  <input
                    type="text"
                    value={editingUser.segundoNombre || ''}
                    onChange={(e) => setEditingUser({...editingUser, segundoNombre: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Primer Apellido</label>
                  <input
                    type="text"
                    value={editingUser.primerApellido || ''}
                    onChange={(e) => setEditingUser({...editingUser, primerApellido: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Segundo Apellido</label>
                  <input
                    type="text"
                    value={editingUser.segundoApellido || ''}
                    onChange={(e) => setEditingUser({...editingUser, segundoApellido: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Correo</label>
                <input
                  type="email"
                  value={editingUser.correo || ''}
                  onChange={(e) => setEditingUser({...editingUser, correo: e.target.value})}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Rol</label>
                <select
                  value={(editingUser.rol?.rol || editingUser.idRol || '').toString().toUpperCase()}
                  onChange={(e) => {
                    const nuevoRol = e.target.value;
                    setEditingUser({
                      ...editingUser,
                      idRol: nuevoRol,
                      rol: { ...(editingUser.rol || {}), rol: nuevoRol }
                    });
                  }}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {availableRoles.map(r => (
                    <option key={r.id || r.rol} value={(r.rol || '').toUpperCase()}>
                      {(r.rol || '').toUpperCase()}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-600 mt-1">{isAdminUser ? 'Incluye ADMINISTRADOR (solo visible para administradores).' : 'Solo roles estándar.'}</p>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Nueva Contraseña <span className="text-gray-500 font-normal">(opcional)</span></label>
                <input
                  type="password"
                  placeholder="Dejar en blanco para mantener la actual"
                  value={editingUser.contrasena || ''}
                  onChange={(e) => setEditingUser({...editingUser, contrasena: e.target.value})}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  Guardar Cambios
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users
              .filter((user) => {
                // Filtrar por estado activo/desactivado
                if (filterActivos && !user.activo) return false;
                
                if (!search || search.trim() === '') return true;
                const q = search.toLowerCase();
                const fullName = `${user.primerNombre || ''} ${user.segundoNombre || ''} ${user.primerApellido || ''} ${user.segundoApellido || ''}`.toLowerCase();
                switch (searchField) {
                  case 'name':
                    return fullName.includes(q);
                  case 'id':
                    return String(user.idUsuario || '').includes(q);
                  case 'rol':
                    return (String(user.idRol || '')).toLowerCase().includes(q) || (user.rol?.rol || '').toLowerCase().includes(q);
                  case 'correo':
                    return (user.correo || '').toLowerCase().includes(q);
                  case 'usuario':
                    return (String(user.idUsuario || '').includes(q) || (user.correo || '').toLowerCase().includes(q));
                  case 'all':
                  default:
                    return (
                      fullName.includes(q) ||
                      (user.correo || '').toLowerCase().includes(q) ||
                      String(user.idUsuario || '').includes(q) ||
                      String(user.idRol || '').toLowerCase().includes(q)
                    );
                }
              })
              .map((user) => (
              <tr key={user.idUsuario} className={user.activo ? '' : 'bg-gray-100 opacity-60'}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {`${user.primerNombre} ${user.segundoNombre || ''} ${user.primerApellido} ${user.segundoApellido || ''}`}
                </td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.idUsuario}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.correo}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{(user.rol?.rol || user.idRol || '').toString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.activo 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.activo ? '✅ Activo' : '❌ Desactivado'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="inline-flex items-center gap-2 justify-center">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      Editar
                    </button>
                    {user.activo ? (
                      <button
                        onClick={() => handleDeactivate(user)}
                        className="text-orange-600 hover:text-orange-900 text-sm font-medium"
                      >
                        Desactivar
                      </button>
                    ) : (
                      <button
                        onClick={() => confirmActivateUser(user)}
                        className="text-green-600 hover:text-green-900 text-sm font-medium"
                      >
                        Activar
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(user)}
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                    >
                      Eliminar
                    </button>
                  </span>
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
