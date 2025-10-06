import React, { useState } from 'react';
import TurnosGrid from './TurnosGrid';
import { exportGridToExcel, exportGridToPdf } from '../../utils/exportUtils';

// months list removed (we use input type="month")

const TurnosModule = () => {
  // month state stored as YYYY-MM for the <input type="month" /> control
  const now = new Date();
  const initialMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [month, setMonth] = useState(initialMonth);
  const [role, setRole] = useState('ADM');
  const [roles, setRoles] = useState([]);
  const [gridData, setGridData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(true);

  // roles that should appear in the dropdown (exclude administrador)
  const allowedRoleIds = ['aux01', 'enf02', 'med03', 'ter04'];
  const allowedRoleMap = {
    aux01: { value: 'aux01', label: 'AUXILIAR' },
    enf02: { value: 'enf02', label: 'ENFERMERO' },
    med03: { value: 'med03', label: 'MÉDICO' },
    ter04: { value: 'ter04', label: 'TERAPIA' }
  };

  // fetch roles from backend if available, but only keep the allowed ones
  React.useEffect(() => {
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

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // Call backend generator to get preview built from DB users
      const qs = `?roleId=${encodeURIComponent(role)}&month=${encodeURIComponent(month)}`;
      const res = await fetch(`/api/mallas/generate${qs}`, { method: 'POST' });
      if (!res.ok) throw new Error('Error generando en servidor: ' + res.statusText);
      const json = await res.json();
      // server returns { file, preview }
      const previewData = json.preview || [];
      // convert preview rows to the same shape expected by TurnosGrid (array of objects with d1..dN)
      setGridData(previewData);
    } catch (err) {
      console.warn('Fallo al generar desde servidor, usando fallback local', err);
      // fallback: create simple mock like before so UI still shows something
      const now = new Date();
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

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Planificación de Turnos</h2>

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
          <button onClick={handleGenerate} disabled={loading} className="bg-blue-600 disabled:opacity-60 text-white px-4 py-2 rounded-md">Generar Malla</button>
          <button onClick={() => setPreview(p => !p)} className="bg-gray-200 text-gray-800 px-3 py-2 rounded-md">{preview ? 'Ocultar vista' : 'Vista previa'}</button>
          <button
            onClick={async () => {
              try {
                const params = new URLSearchParams({ roleId: role, month });
                const res = await fetch('/api/mallas/generate', { method: 'POST', body: params });
                // server expects form params; fallback to query string
                if (!res.ok) {
                  // try with query string
                  const res2 = await fetch(`/api/mallas/generate?roleId=${encodeURIComponent(role)}&month=${encodeURIComponent(month)}`, { method: 'POST' });
                  if (!res2.ok) throw new Error('Error generando en servidor');
                  const json = await res2.json();
                  setGridData(json.preview || []);
                  alert('Malla generada en servidor: ' + json.file);
                } else {
                  const json = await res.json();
                  setGridData(json.preview || []);
                  alert('Malla generada en servidor: ' + json.file);
                }
              } catch (e) {
                alert('Error al generar en servidor: ' + e.message);
              }
            }}
            className="bg-purple-600 text-white px-3 py-2 rounded-md"
          >Generar en servidor</button>
        </div>
      </div>

      <div className="mb-4">
        <button
          onClick={() => exportGridToExcel(gridData, `malla_${month}_${role}.xlsx`)}
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
              const workbookBlob = await exportGridToExcel(gridData, wbName, { returnBlob: true });
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
