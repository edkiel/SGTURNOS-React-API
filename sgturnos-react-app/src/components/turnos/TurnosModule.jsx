import React, { useState } from 'react';
import TurnosGrid from './TurnosGrid';
import { exportGridToExcel, exportGridToPdf } from '../../utils/exportUtils';
import PageHeader from '../common/PageHeader';
import Toast from '../common/Toast';
import { API_BASE_URL } from '../../api';

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
  const [toastData, setToastData] = useState({ visible: false, message: '', type: 'success' });
  // Parámetros para generación de malla (cantidad de pacientes y auxiliares)
  const [patientsCount, setPatientsCount] = useState(0);
  const [auxiliariesCount, setAuxiliariesCount] = useState(0);

  const getRoleLabel = () => {
    if (!user || !user.rol) return '';
    const roleId = (user.rol.idRol || user.rol.rol || '').toString().toLowerCase();
    const map = { aux01: 'Auxiliar', enf02: 'Enfermero', med03: 'Médico', ter04: 'Terapeuta', adm: 'Administrador' };
    if (map[roleId]) return map[roleId];
    if (roleId.includes('admin')) return 'Administrador';
    return user.rol.rol || user.rol.idRol || '';
  };

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
        const res = await fetch(`${API_BASE_URL}/usuarios/roles`);
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
        const pubRes = await fetch(`${API_BASE_URL}/mallas/published?roleId=${encodeURIComponent(r)}&month=${encodeURIComponent(month)}`);
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
      const qs = `?roleId=${encodeURIComponent(role)}&month=${encodeURIComponent(month)}&patients=${encodeURIComponent(patientsCount)}&auxiliaries=${encodeURIComponent(auxiliariesCount)}`;
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE_URL}/mallas/generate${qs}`, { method: 'POST', headers });
      if (!res.ok) throw new Error('Error generando en servidor: ' + res.statusText);
      const json = await res.json();
      // server returns { file, preview }
      const previewData = json.preview || [];
      // convert preview rows to the same shape expected by TurnosGrid (array of objects with d1..dN)
      setGridData(previewData);
    } catch (err) {
      console.error('Error al generar la malla desde el servidor:', err);
      setGridData([]);
      alert('No se pudo generar la malla desde el servidor. Por favor verifica que el backend esté corriendo y la base de datos conectada.');
    } finally {
      setLoading(false);
    }
  };

  // Publish current preview/grid as the official published malla for the selected role and month
  const publishMalla = async () => {
    if (!gridData || gridData.length === 0) {
      setToastData({ visible: true, message: 'No hay malla para publicar.', type: 'warning' });
      return;
    }
    const token = localStorage.getItem('token');
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    try {
      // backend expects roleId and month as request params (form or query string)
      const qs = `?roleId=${encodeURIComponent(role)}&month=${encodeURIComponent(month)}`;
      const res = await fetch(`${API_BASE_URL}/mallas/publish${qs}`, { method: 'POST', headers });
      if (!res.ok) {
        const txt = await res.text().catch(() => null);
        throw new Error(txt || ('Status ' + res.status));
      }
      const json = await res.json().catch(() => ({}));
      setToastData({ visible: true, message: '✓ Malla publicada correctamente', type: 'success' });
      // keep gridData as-is; published metadata saved on server
      setGridData(gridData);
    } catch (e) {
      console.error('Error publicando malla', e);
      setToastData({ 
        visible: true, 
        message: `Error publicando la malla: ${e.message || e}`, 
        type: 'error' 
      });
    }
  };

  

  return (
    <div className="w-full p-2 sm:p-4 md:p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-lg" style={{ maxWidth: '100%' }}>
      {/* Header Principal de Turnos */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl shadow-2xl mb-4 sm:mb-6 overflow-hidden">
        {/* Contenedor Principal */}
        <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6">
          {/* Fila 1: Título y Usuario/Rol */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 sm:gap-4 mb-2">
            {/* Título Planificación */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-white/20 p-2 sm:p-3 rounded-lg sm:rounded-xl backdrop-blur-sm flex-shrink-0">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white truncate">Planificación de Turnos</h1>
                <p className="text-green-100 text-xs sm:text-sm mt-0.5 sm:mt-1">Sistema de Gestión de Mallas</p>
              </div>
            </div>

            {/* Usuario y Rol */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              {/* Card Usuario */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg sm:rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 shadow-lg flex-shrink-0">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div className="min-w-0">
                    <p className="text-xs text-green-200 font-medium">Usuario</p>
                    <p className="text-xs sm:text-sm font-semibold text-white truncate">{`${user?.primerNombre || ''} ${user?.segundoNombre || ''} ${user?.primerApellido || ''} ${user?.segundoApellido || ''}`.trim() || 'Usuario'}</p>
                  </div>
                </div>
              </div>

              {/* Card Rol */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg sm:rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 shadow-lg flex-shrink-0">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <div>
                    <p className="text-xs text-green-200 font-medium">Rol</p>
                    <p className="text-sm font-semibold text-white">{getRoleLabel() || 'Sin rol asignado'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fila 2: Descripción */}
          <div className="border-t border-white/20 pt-3 mt-3">
            <p className="text-green-100 text-sm">
              Genera, revisa y publica las mallas de turnos para cada rol del personal médico
            </p>
          </div>
        </div>
      </div>

      {/* Role buttons moved to Inicio (PersonalMalla) per UX request */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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
        <div>
          {role && String(role).toLowerCase().includes('aux') ? (
            <>
              <label className="block text-sm font-medium text-gray-700">Pacientes</label>
              <input
                type="number"
                min="0"
                value={patientsCount}
                onChange={(e) => setPatientsCount(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
              />
              <label className="block text-sm font-medium text-gray-700 mt-2">Auxiliares</label>
              <input
                type="number"
                min="0"
                value={auxiliariesCount}
                onChange={(e) => setAuxiliariesCount(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
              />
            </>
          ) : (
            <div className="text-sm text-gray-500">Parámetros opcionales para auxiliares</div>
          )}
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
        >Excel</button>

        <button
          onClick={() => {
            // Extraer mes y año del formato YYYY-MM
            const [year, monthNum] = month.split('-');
            const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
            const monthName = monthNames[parseInt(monthNum) - 1];
            
            exportGridToPdf('turnos-grid', `malla_${month}_${role}.pdf`, {
              headerInfo: {
                rolName: getRoleLabel(),
                month: monthName,
                year: year
              }
            });
          }}
          className="bg-red-600 text-white px-3 py-2 rounded-md mr-2"
          disabled={!gridData || gridData.length === 0}
        >PDF</button>

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
              const token = localStorage.getItem('token');
              const headers = {};
              if (token) headers.Authorization = `Bearer ${token}`;
              const res = await fetch(`${API_BASE_URL}/mallas/upload`, { method: 'POST', headers, body: form });
              if (!res.ok) throw new Error('upload failed');
              const text = await res.text();
              setToastData({ visible: true, message: '✓ Malla guardada en servidor', type: 'success' });
            } catch (e) {
              setToastData({ visible: true, message: `Error al subir: ${e.message || e}`, type: 'error' });
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
        <div id="turnos-grid" className="overflow-x-auto" style={{ maxWidth: '100vw' }}>
          <TurnosGrid data={gridData} month={month} />
        </div>
      )}

      <Toast 
        message={toastData.message}
        type={toastData.type}
        isVisible={toastData.visible}
        onClose={() => setToastData({ ...toastData, visible: false })}
        duration={3500}
      />
    </div>
  );
};

export default TurnosModule;
