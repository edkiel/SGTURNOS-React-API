import React, { useState } from 'react';
import TurnosGrid from './TurnosGrid';
import { exportGridToExcel, exportGridToPdf } from '../../utils/exportUtils';

// months list removed (we use input type="month")

const TurnosModule = ({ user }) => {
  // month state stored as YYYY-MM for the <input type="month" /> control
  const now = new Date();
  const initialMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [month, setMonth] = useState(initialMonth);
  const [role, setRole] = useState('ADM');
  const [roles, setRoles] = useState([]);
  const [gridData, setGridData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(true);

  // fetch roles from backend if available, but only keep the allowed ones
  React.useEffect(() => {
    const allowedRoleIds = ['aux01', 'enf02', 'med03', 'ter04'];
    const allowedRoleMap = {
      aux01: { value: 'aux01', label: 'AUXILIAR' },
      enf02: { value: 'enf02', label: 'ENFERMERO' },
      med03: { value: 'med03', label: 'MEDICO' },
      ter04: { value: 'ter04', label: 'TERAPIA' }
    };

    const fetchRoles = async () => {
      try {
        const res = await fetch('/api/usuarios/roles');
        if (!res.ok) throw new Error('no roles');
        const data = await res.json();
        // map backend roles to our allowed list when id matches
        const mapped = (data || [])
          .map(r => ({ id: r.idRol || r.id || r.id_rol || r.idRol, code: (r.idRol || r.id || r.id_rol || '').toString().toLowerCase(), label: r.rol || r.nombre || r.name }))
          .filter(x => allowedRoleIds.includes(x.code))
          .map(x => allowedRoleMap[x.code]);

        if (mapped.length > 0) {
          setRoles(mapped);
          setRole(mapped[0].value);
          return;
        }
      } catch (e) {
        console.warn('roles fetch failed', e);
      }

      // fallback static allowed roles (exclude administrador)
      const fallback = allowedRoleIds.map(id => allowedRoleMap[id]);
      setRoles(fallback);
      setRole(fallback[0].value);
    };
    fetchRoles();
  }, []);

  // detect admin client-side
  const isAdmin = user && ((user.rol && user.rol.rol && String(user.rol.rol).toUpperCase().includes('ADMIN')) || (user.rol && user.rol.idRol && String(user.rol.idRol).toLowerCase().includes('adm')));

  // If not admin, force role to the user's role and try to fetch published malla for the selected month
  React.useEffect(() => {
    if (isAdmin) return;
    if (!user) return;
    const r = user.rol && user.rol.idRol ? user.rol.idRol : (user.rol && user.rol.rol ? user.rol.rol : '');
    setRole(r);

    const fetchPublished = async () => {
      try {
        const pubRes = await fetch(`/api/mallas/published?roleId=${encodeURIComponent(r)}&month=${encodeURIComponent(month)}`);
        if (!pubRes.ok) {
          // no published malla
          setGridData([]);
          return;
        }
        const pubJson = await pubRes.json();
        if (pubJson && pubJson.preview) {
          setGridData(pubJson.preview || []);
        } else {
          setGridData([]);
        }
      } catch (err) {
        console.warn('Error fetching published malla', err);
        setGridData([]);
      }
    };
    fetchPublished();
  }, [user, month, isAdmin]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // Call backend generator to get preview built from DB users
      const qs = `?roleId=${encodeURIComponent(role)}&month=${encodeURIComponent(month)}`;
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`/api/mallas/generate${qs}`, { method: 'POST', headers });
      if (!res.ok) throw new Error('Error generando en servidor: ' + res.statusText);
      const json = await res.json();
      // server returns { file, preview }
      const previewData = json.preview || [];
      // convert preview rows to the same shape expected by TurnosGrid (array of objects with d1..dN)
      setGridData(previewData);
    } catch (err) {
      console.warn('Fallo al generar desde servidor, usando fallback local', err);
      // fallback: create simple mock like before so UI still shows something
      const [y, m] = month.split('-').map(Number);
      const daysInMonth = new Date(y, m, 0).getDate();
      const employees = [
        { id: 1, name: 'Juan Perez' },
        { id: 2, name: 'María Gómez' },
        { id: 3, name: 'Carlos Ruiz' }
      ];
      const grid = employees.map((emp) => {
        const row = { id: emp.id, name: emp.name };
        for (let d = 1; d <= daysInMonth; d++) {
          row[`d${d}`] = (d % 2 === 0) ? 'Día (07-19)' : 'Noche (19-07)';
        }
        return row;
      });
      setGridData(grid);
      alert('No se pudo generar la malla desde el servidor. Revisa la consola para más detalles.');
    } finally {
      setLoading(false);
    }
  };

  // Publish current preview/grid as the official published malla for the selected role and month
  const publishMalla = async () => {
    if (!gridData || gridData.length === 0) return alert('No hay malla para publicar.');
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    try {
      const body = JSON.stringify({ roleId: role, month, preview: gridData });
      const res = await fetch('/api/mallas/publish', { method: 'POST', headers, body });
      if (!res.ok) {
        const txt = await res.text().catch(() => null);
        throw new Error(txt || ('Status ' + res.status));
      }
      const json = await res.json().catch(() => ({}));
      alert('Malla publicada correctamente.');
      // Optionally mark as official
      setGridData(gridData);
    } catch (e) {
      console.error('Error publicando malla', e);
      alert('Error publicando la malla: ' + (e.message || e));
    }
  };

  

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Planificación de Turnos</h2>

      {/* Role buttons moved to Inicio (PersonalMalla) per UX request */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Mes</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
            aria-label="Seleccionar mes"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Rol</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
            {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
        <div className="flex items-end space-x-2">
          <button onClick={handleGenerate} disabled={loading} title="Generar Malla - Solo previsualización para revisión" className="bg-blue-600 disabled:opacity-60 text-white px-4 py-2 rounded-md">Generar (Previsualización)</button>
          <button onClick={() => setPreview(p => !p)} className="bg-gray-200 text-gray-800 px-3 py-2 rounded-md">{preview ? 'Ocultar vista' : 'Vista previa'}</button>
          
        </div>
      </div>

      <div className="mb-4">
        <button
          onClick={() => exportGridToExcel(gridData, `malla_${month}_${role}.xlsx`, {
            excludeColumns: [
              'MED_min','MED_max','MED_avg','MED_std','JEF_min','JEF_max','JEF_avg','JEF_std',
              'AUX_min','AUX_max','AUX_avg','AUX_std','TER_min','TER_max','TER_avg','TER_std',
              'MED_pool','MED_needDay','MED_needNight','MED_shortage','JEF_pool','JEF_needDay','JEF_needNight','JEF_shortage',
              'AUX_pool','AUX_needDay','AUX_needNight','AUX_shortage','TER_pool','TER_needDay','TER_needNight','TER_shortage'
            ]
          }) }
          className="bg-green-600 text-white px-3 py-2 rounded-md mr-2"
          disabled={!gridData || gridData.length === 0}
        >Exportar Excel</button>

        <button
          onClick={() => exportGridToPdf('turnos-grid', `malla_${month}_${role}.pdf`)}
          className="bg-red-600 text-white px-3 py-2 rounded-md mr-2"
          disabled={!gridData || gridData.length === 0}
        >Exportar PDF</button>

        <button
          onClick={async () => {
            // create an xlsx blob in memory, then upload to backend
            try {
              const wbName = `malla_${month}_${role}.xlsx`;
              const workbookBlob = await exportGridToExcel(gridData, wbName, { returnBlob: true, excludeColumns: [
                'MED_min','MED_max','MED_avg','MED_std','JEF_min','JEF_max','JEF_avg','JEF_std',
                'AUX_min','AUX_max','AUX_avg','AUX_std','TER_min','TER_max','TER_avg','TER_std',
                'MED_pool','MED_needDay','MED_needNight','MED_shortage','JEF_pool','JEF_needDay','JEF_needNight','JEF_shortage',
                'AUX_pool','AUX_needDay','AUX_needNight','AUX_shortage','TER_pool','TER_needDay','TER_needNight','TER_shortage'
              ] });
              if (!workbookBlob) return;
              const form = new FormData();
              form.append('file', workbookBlob, wbName);
              const res = await fetch('/api/mallas/upload', { method: 'POST', body: form });
              if (!res.ok) throw new Error('upload failed');
              const text = await res.text();
              alert('Malla guardada: ' + text);
            } catch (e) {
              alert('Error al subir: ' + (e.message || e));
            }
          }}
          className="bg-indigo-600 text-white px-3 py-2 rounded-md"
          disabled={!gridData || gridData.length === 0}
        >Guardar en servidor</button>
        {isAdmin && (
          <button
            onClick={() => publishMalla()}
            title="Publica la malla en el servidor y la marca como oficial"
            className="bg-teal-600 text-white px-3 py-2 rounded-md ml-2"
            disabled={!gridData || gridData.length === 0}
          >Publicar Malla (hacer oficial)</button>
        )}
      </div>

      {preview && (
        <div id="turnos-grid" className="overflow-auto">
          <TurnosGrid data={gridData} month={month} />
        </div>
      )}
    </div>
  );
};

export default TurnosModule;
