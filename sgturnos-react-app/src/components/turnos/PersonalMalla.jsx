import React, { useEffect, useState } from 'react';

const PersonalMalla = ({ user }) => {
  const [malla, setMalla] = useState(null);
  useEffect(() => {
    if (!user) return;
    // request preview for the role of the logged user
    (async () => {
      try {
        const roleId = user.rol && user.rol.idRol ? user.rol.idRol : user.rol && user.rol.rol ? user.rol.rol : '';
        const month = new Date().toISOString().slice(0,7);
        const res = await fetch(`/api/mallas/generate?roleId=${encodeURIComponent(roleId)}&month=${encodeURIComponent(month)}`, { method: 'POST' });
        if (!res.ok) return;
        const json = await res.json();
        setMalla(json.preview || []);
      } catch (e) {
        console.warn(e);
      }
    })();
  }, [user]);

  if (!malla || malla.length === 0) return <div className="bg-white p-4 rounded-md shadow">No hay malla generada para tu rol.</div>;

  return (
    <div className="bg-white p-4 rounded-md shadow">
      <h3 className="font-bold mb-2">Tu malla ({new Date().toLocaleString('default', { month: 'long', year: 'numeric' })})</h3>
      <div className="text-sm">
        <table className="min-w-full text-left">
          <thead><tr><th>Empleado</th><th>Turnos</th><th>Horas</th></tr></thead>
          <tbody>
            {malla.map((r, idx) => (
              <tr key={idx} className={`${r.id === -1 ? 'font-bold' : ''}`}>
                <td>{r.name}</td>
                <td>{r.turnos ?? ''}</td>
                <td>{r.horas ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PersonalMalla;
