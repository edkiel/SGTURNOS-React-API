import React, { useEffect, useState } from 'react';
import { exportGridToExcel, exportGridToPdf } from '../../utils/exportUtils';

const PersonalMalla = ({ user }) => {
  const [malla, setMalla] = useState(null);
  const [isOfficial, setIsOfficial] = useState(false);
  const month = new Date().toISOString().slice(0,7);

  // Helper: carga solo la malla publicada para un roleId (si existe), no genera si no existe
  const loadPublished = async (roleId) => {
    if (!roleId) return;
    try {
      const res = await fetch(`/api/mallas/published?roleId=${encodeURIComponent(roleId)}&month=${encodeURIComponent(month)}`);
      if (!res.ok) {
        setMalla([]);
        setIsOfficial(false);
        return;
      }
      const json = await res.json();
      if (json && json.preview) {
        setMalla(json.preview || []);
        setIsOfficial(true);
      } else {
        setMalla([]);
        setIsOfficial(false);
      }
    } catch (e) {
      console.warn('Error loading published malla for role', roleId, e);
      setMalla([]);
      setIsOfficial(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const roleId = user.rol && user.rol.idRol ? user.rol.idRol : user.rol && user.rol.rol ? user.rol.rol : '';
        const month = new Date().toISOString().slice(0,7);
        // First try to fetch a published (official) malla
        try {
          const pubRes = await fetch(`/api/mallas/published?roleId=${encodeURIComponent(roleId)}&month=${encodeURIComponent(month)}`);
          if (pubRes.ok) {
            const pubJson = await pubRes.json();
            // published endpoint returns { file, preview }
            if (pubJson && pubJson.preview) {
              setMalla(pubJson.preview);
              setIsOfficial(true);
              return;
            }
          }
        } catch (err) {
          console.debug('No published malla or error fetching published malla', err);
        }

        // Fallback to preview generation (only for the logged-in user's own role)
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`/api/mallas/generate?roleId=${encodeURIComponent(roleId)}&month=${encodeURIComponent(month)}`, { method: 'POST', headers });
        if (!res.ok) return;
        const json = await res.json();
        setMalla(json.preview || []);
        setIsOfficial(false);
      } catch (e) {
        console.warn(e);
      }
    })();
  }, [user]);

  if (!malla || malla.length === 0) return <div className="bg-white p-4 rounded-md shadow">No hay malla generada para tu rol.</div>;

  return (
    <div className="bg-white p-4 rounded-md shadow">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold">Tu malla ({new Date().toLocaleString('default', { month: 'long', year: 'numeric' })})</h3>
        {isOfficial && <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">Oficial</span>}
      </div>
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <button className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1 rounded" onClick={async () => await loadPublished('aux01')}>AUXILIARES</button>
          <button className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-3 py-1 rounded" onClick={async () => await loadPublished('enf02')}>ENFERMEROS</button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded" onClick={async () => await loadPublished('med03')}>MEDICOS</button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-3 py-1 rounded" onClick={async () => await loadPublished('ter04')}>TERAPEUTAS</button>
        </div>
        <div className="flex items-center gap-2">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded"
          onClick={() => exportGridToExcel(malla, 'malla-personal.xlsx', {
            excludeColumns: [
              'MED_min','MED_max','MED_avg','MED_std','JEF_min','JEF_max','JEF_avg','JEF_std',
              'AUX_min','AUX_max','AUX_avg','AUX_std','TER_min','TER_max','TER_avg','TER_std',
              'MED_pool','MED_needDay','MED_needNight','MED_shortage','JEF_pool','JEF_needDay','JEF_needNight','JEF_shortage',
              'AUX_pool','AUX_needDay','AUX_needNight','AUX_shortage','TER_pool','TER_needDay','TER_needNight','TER_shortage'
            ]
          })}
        >
          Exportar XLSX
        </button>
        <button
          className="bg-gray-600 hover:bg-gray-700 text-white text-sm px-3 py-1 rounded"
          onClick={async () => {
            try {
              const blob = await exportGridToPdf('personal-malla-table', 'malla-personal.pdf', { returnBlob: true });
              if (blob) {
                const url = URL.createObjectURL(blob);
                window.open(url, '_blank');
              }
            } catch (err) {
              console.error('Error exportando PDF', err);
            }
          }}
        >
          Previsualizar PDF
        </button>
        </div>
      </div>
      <div className="text-sm" id="personal-malla-table">
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
