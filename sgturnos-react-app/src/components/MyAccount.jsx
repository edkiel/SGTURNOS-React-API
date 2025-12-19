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
          <div className="mb-8 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <h3 className="text-2xl font-bold flex items-center gap-3">
              <span className="text-3xl">🔐</span>
              Cambiar Contraseña
            </h3>
            <p className="text-indigo-100 text-sm mt-3">Mantén tu cuenta segura actualizando tu contraseña regularmente. Asegúrate de usar una contraseña fuerte.</p>
          </div>

          <form onSubmit={handleChangePassword} className="max-w-2xl space-y-5">
            {/* Contraseña Actual */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-blue-500 text-white p-2 rounded-full text-lg">🔒</div>
                <label className="text-sm font-bold text-blue-900 uppercase tracking-wider">Contraseña Actual</label>
              </div>
              <input 
                type="password" 
                value={oldPassword} 
                onChange={e => setOldPassword(e.target.value)} 
                className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white font-medium" 
                placeholder="Ingresa tu contraseña actual"
                required
              />
            </div>

            {/* Nueva Contraseña */}
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200 shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-purple-500 text-white p-2 rounded-full text-lg">✨</div>
                <label className="text-sm font-bold text-purple-900 uppercase tracking-wider">Nueva Contraseña</label>
              </div>
              <input 
                type="password" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition bg-white font-medium" 
                placeholder="Ingresa tu nueva contraseña"
                required
              />
              <p className="text-xs text-purple-700 mt-2 font-semibold">💡 Usa mayúsculas, números y caracteres especiales para mayor seguridad</p>
            </div>

            {/* Confirmar Nueva Contraseña */}
            <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl p-6 border border-indigo-200 shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-indigo-500 text-white p-2 rounded-full text-lg">✔️</div>
                <label className="text-sm font-bold text-indigo-900 uppercase tracking-wider">Confirmar Nueva Contraseña</label>
              </div>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                className="w-full px-4 py-3 border-2 border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white font-medium" 
                placeholder="Confirma tu nueva contraseña"
                required
              />
            </div>

            {/* Botón de Envío */}
            <div className="pt-4">
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition duration-300 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed text-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Actualizando contraseña...
                  </>
                ) : (
                  <>
                    <span>🛡️</span>
                    Actualizar Contraseña de forma Segura
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;
