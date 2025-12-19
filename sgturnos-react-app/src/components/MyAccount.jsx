import React, { useState } from 'react';
import { api } from '../api';
import PageHeader from './common/PageHeader';

const MyAccount = ({ user }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const containerStyle = { maxWidth: '1400px', width: '100%' };

  const getRoleLabel = () => {
    const roleId = (user?.rol?.idRol || user?.rol?.rol || '').toString().toLowerCase();
    const map = {
      aux01: 'Auxiliar',
      enf02: 'Enfermero',
      med03: 'Médico',
      ter04: 'Terapeuta',
      adm: 'Administrador'
    };
    if (map[roleId]) return map[roleId];
    if (roleId.includes('admin')) return 'Administrador';
    return user?.rol?.rol || user?.rol?.idRol || '';
  };

  if (!user) {
    return (
      <div className="w-full mx-auto p-4 sm:p-6 lg:p-8 bg-white rounded-xl shadow-lg" style={containerStyle}>
        <div className="p-2">No hay usuario autenticado.</div>
      </div>
    );
  }

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) return alert('Completa ambas contraseñas');
    if (newPassword !== confirmPassword) return alert('La nueva contraseña y la confirmación no coinciden');

    setLoading(true);
    try {
      // Try common endpoint; adapt if backend endpoint differs
      const payload = { idUsuario: user.idUsuario || user.id || user.idUsuario, oldPassword, newPassword };
      // Use api helper if available
      let res;
      try {
        res = await api.post('/usuarios/change-password', payload);
      } catch (err) {
        // fallback to fetch if api helper fails
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;
        res = await fetch('/api/usuarios/change-password', { method: 'POST', headers, body: JSON.stringify(payload) });
        if (res.ok) {
          alert('Contraseña cambiada correctamente');
          setOldPassword(''); setNewPassword(''); setConfirmPassword('');
          setLoading(false);
          return;
        }
        throw new Error('Error cambiando contraseña');
      }

      if (res && res.data) {
        alert('Contraseña cambiada correctamente');
        setOldPassword(''); setNewPassword(''); setConfirmPassword('');
      } else {
        alert('Operación completada');
      }
    } catch (err) {
      console.error(err);
      alert('Error cambiando la contraseña. Revisa la consola.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto p-4 sm:p-6 lg:p-8 bg-white rounded-xl shadow-lg" style={containerStyle}>
      <div className="w-full">
        <PageHeader
          title="Informacion de mi usuario"
          subtitle="Consulta y actualiza tus datos personales"
          userName={`${user.primerNombre || ''} ${user.primerApellido || ''}`.trim()}
          roleLabel={getRoleLabel()}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {/* ID Usuario */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-500 text-white p-2 rounded-full text-lg">👤</div>
              <label className="text-sm font-semibold text-blue-900">ID Usuario</label>
            </div>
            <div className="text-2xl font-bold text-blue-700">{user.idUsuario || user.id || '-'}</div>
          </div>

          {/* Rol */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-purple-500 text-white p-2 rounded-full text-lg">🎯</div>
              <label className="text-sm font-semibold text-purple-900">Rol</label>
            </div>
            <div className="text-lg font-bold text-purple-700">{(user.rol && (user.rol.rol || user.rol.idRol)) || '-'}</div>
          </div>

          {/* Correo */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-5 border border-indigo-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-indigo-500 text-white p-2 rounded-full text-lg">✉️</div>
              <label className="text-sm font-semibold text-indigo-900">Correo</label>
            </div>
            <div className="text-sm font-semibold text-indigo-700 break-all">{user.correo || user.email || '-'}</div>
          </div>
        </div>

        {/* Nombre y Apellidos - Sección más destacada */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📝</span>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">Nombre</label>
            </div>
            <h3 className="text-2xl font-bold">{(user.primerNombre || '') + ' ' + (user.segundoNombre || '')}</h3>
            <div className="mt-3 pt-3 border-t border-slate-600 text-xs text-slate-400">Nombre completo registrado</div>
          </div>

          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">👨‍👩‍👧</span>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">Apellidos</label>
            </div>
            <h3 className="text-2xl font-bold">{(user.primerApellido || '') + ' ' + (user.segundoApellido || '')}</h3>
            <div className="mt-3 pt-3 border-t border-slate-600 text-xs text-slate-400">Apellidos completos</div>
          </div>
        </div>

        {/* Cambiar Contraseña - Sección con estilo */}
        <div className="border-t pt-8">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-2xl">🔐</span>
              Cambiar Contraseña
            </h3>
            <p className="text-gray-600 text-sm mt-2">Por tu seguridad, actualiza tu contraseña regularmente</p>
          </div>

          <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Contraseña Actual</label>
              <input 
                type="password" 
                value={oldPassword} 
                onChange={e => setOldPassword(e.target.value)} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" 
                placeholder="Ingresa tu contraseña actual"
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nueva Contraseña</label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" 
                placeholder="Ingresa tu nueva contraseña"
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Confirmar Nueva Contraseña</label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" 
                placeholder="Confirma tu nueva contraseña"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-md disabled:opacity-60"
            >
              {loading ? 'Actualizando...' : '✓ Cambiar Contraseña'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;
