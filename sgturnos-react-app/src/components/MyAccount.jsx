import React, { useState } from 'react';
import { api } from '../api';

const MyAccount = ({ user }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) return <div className="bg-white p-6 rounded-xl shadow-lg">No hay usuario autenticado.</div>;

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
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Informacion de mi usuario</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-600">Id Usuario</label>
          <div className="mt-1 text-gray-800">{user.idUsuario || user.id || '-'}</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600">Rol</label>
          <div className="mt-1 text-gray-800">{(user.rol && (user.rol.rol || user.rol.idRol)) || '-'}</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600">Nombre</label>
          <div className="mt-1 text-gray-800">{(user.primerNombre || '') + ' ' + (user.segundoNombre || '')}</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600">Apellidos</label>
          <div className="mt-1 text-gray-800">{(user.primerApellido || '') + ' ' + (user.segundoApellido || '')}</div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-600">Correo</label>
          <div className="mt-1 text-gray-800">{user.correo || user.email || '-'}</div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-lg font-medium mb-2">Cambiar contraseña</h3>
        <form onSubmit={handleChangePassword} className="space-y-3 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-600">Contraseña actual</label>
            <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Nueva contraseña</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Confirmar nueva contraseña</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 p-2" />
          </div>
          <div>
            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-md">{loading ? 'Guardando...' : 'Cambiar contraseña'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MyAccount;
