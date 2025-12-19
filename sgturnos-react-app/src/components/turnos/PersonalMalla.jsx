import React, { useEffect, useState } from 'react';
import { exportGridToExcel, exportGridToPdf } from '../../utils/exportUtils';
import TurnosGrid from './TurnosGrid';

const PersonalMalla = ({ user }) => {
  const [malla, setMalla] = useState(null);
  const [isOfficial, setIsOfficial] = useState(false);
  const month = new Date().toISOString().slice(0,7);
  const isAdmin = user && ((user.rol && user.rol.rol && String(user.rol.rol).toUpperCase().includes('ADMIN')) || (user.rol && user.rol.idRol && String(user.rol.idRol).toLowerCase().includes('adm')));

  // PDF export happens on demand; no embedded preview to avoid blank viewer
  const roleForFilename = (user && ((user.rol && user.rol.idRol) || (user.rol && user.rol.rol))) || 'role';

  // Función para obtener nombre amigable del rol
  const getRoleName = () => {
    if (!user || !user.rol) return '';
    const roleId = (user.rol.idRol || user.rol.rol || '').toLowerCase();
    const roleMap = { 'aux01': 'Auxiliar', 'enf02': 'Enfermero', 'med03': 'Médico', 'ter04': 'Terapeuta', 'adm': 'Administrador' };
    return roleMap[roleId] || roleId;
  };

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
        // try to fetch a published (official) malla preview
        try {
          const pubRes = await fetch(`/api/mallas/published?roleId=${encodeURIComponent(roleId)}&month=${encodeURIComponent(month)}`);
          if (pubRes.ok) {
            const pubJson = await pubRes.json();
            if (pubJson && pubJson.preview) {
              setMalla(pubJson.preview);
              setIsOfficial(true);
              return;
            }
          }
        } catch (err) {
          // ignore network/parse errors for published endpoint and fall back to empty state
        }

        // no published malla found
        setMalla([]);
        setIsOfficial(false);
      } catch (e) {
        console.error('Error loading published malla', e);
        setMalla([]);
        setIsOfficial(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // detect if any row in the malla contains day columns (d1..dN) to decide rendering
  const hasDayColumns = Array.isArray(malla) && malla.length > 0 && malla.some(row => Object.keys(row || {}).some(k => /^d\d+$/.test(k)));
  if (malla && malla.length > 0) {
    // log first few keys for debugging
    const keysSample = Object.keys(malla.find(r => r && Object.keys(r).length > 0) || {});
    console.log('PersonalMalla debug: sample keys:', keysSample, 'hasDayColumns:', hasDayColumns);
  }

  // No automatic embedded PDF preview for users (removed to avoid blank viewer)

  if (!malla || malla.length === 0) return <div className="bg-white p-4 rounded-md shadow">No hay malla generada para tu rol.</div>;

  return (
    <div className="w-full mx-auto p-4 sm:p-6 lg:p-8 bg-white rounded-md shadow" style={{ maxWidth: '1400px' }}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold">
          {isAdmin ? `Tu malla (${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })})` : `Malla de turno - ${getRoleName()}`}
        </h3>
        {isOfficial && <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">Oficial</span>}
      </div>

      <div className="flex items-center justify-between gap-2 mb-3">
        {/* Botones de roles solo visibles para administrador */}
        {isAdmin && (
          <div className="flex items-center gap-2">
            <button className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1 rounded" onClick={async () => await loadPublished('aux01')}>AUXILIARES</button>
            <button className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-3 py-1 rounded" onClick={async () => await loadPublished('enf02')}>ENFERMEROS</button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded" onClick={async () => await loadPublished('med03')}>MEDICOS</button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-3 py-1 rounded" onClick={async () => await loadPublished('ter04')}>TERAPEUTAS</button>
          </div>
        )}
        {/* Espaciador si no es admin */}
        {!isAdmin && <div></div>}

        <div className="flex items-center gap-2">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded"
            onClick={() => exportGridToExcel(malla, `malla_${new Date().toISOString().slice(0,7)}.xlsx`, {
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
                // Export the visible malla (wrap TurnosGrid in container with id 'personal-malla-table')
                const blob = await exportGridToPdf('personal-malla-table', `malla_${new Date().toISOString().slice(0,7)}.pdf`, { returnBlob: true });
                if (blob) {
                  const url = URL.createObjectURL(blob);
                  window.open(url, '_blank');
                }
              } catch (err) {
                console.error('Error exportando PDF', err);
                alert('Error exportando PDF. Revisa la consola.');
              }
            }}
          >
            Exportar PDF
          </button>
        </div>
      </div>

      <div>
        {/* Hidden source for PDF generation (TurnosGrid must be present in DOM for html2canvas) */}
        {hasDayColumns && (
          <div id="personal-malla-table-hidden" style={{ position: 'fixed', left: '-10000px', top: 0, visibility: 'hidden' }}>
            <TurnosGrid data={malla} month={new Date().toISOString().slice(0,7)} />
          </div>
        )}

        {/* Visible grid view (TurnosGrid) for conventional users - always show calendar/week cards */}
        <div id="personal-malla-table" className="mt-3">
          {/* Always render TurnosGrid for day-column data */}
          {hasDayColumns ? (
            <>
              <TurnosGrid data={malla} month={new Date().toISOString().slice(0,7)} />
              
              {/* No embedded PDF preview for users */}
            </>
          ) : (
            /* Fallback: simple summary table if no day columns */
            <div className="text-sm">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2 bg-gray-100">Empleado</th>
                    <th className="border p-2 bg-gray-100">Turnos</th>
                    <th className="border p-2 bg-gray-100">Horas</th>
                  </tr>
                </thead>
                <tbody>
                  {malla.map((r, idx) => (
                    <tr key={idx}>
                      <td className="border p-2">{r.name}</td>
                      <td className="border p-2">{r.turnos ?? ''}</td>
                      <td className="border p-2">{r.horas ?? ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalMalla;
