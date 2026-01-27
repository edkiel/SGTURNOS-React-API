import React, { useEffect, useState } from 'react';
import { exportGridToExcel, exportGridToPdf } from '../../utils/exportUtils';
import TurnosGrid from './TurnosGrid';
import CodigoColoresMalla from './CodigoColoresMalla';

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
    <div className="w-full p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header elegante como Dashboard */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl shadow-2xl mb-6 overflow-hidden">
        <div className="px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">Consultar mi malla de turno</h1>
                <p className="text-green-100 text-sm mt-1">Visualiza tu malla publicada y descárgala cuando la necesites</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div>
                    <p className="text-xs text-green-200 font-medium">Usuario</p>
                    <p className="text-sm font-semibold text-white">{`${user?.primerNombre || ''} ${user?.segundoNombre || ''} ${user?.primerApellido || ''} ${user?.segundoApellido || ''}`.trim()}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <div>
                    <p className="text-xs text-green-200 font-medium">Rol</p>
                    <p className="text-sm font-semibold text-white">{getRoleName()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/20 pt-3 mt-3">
            <p className="text-green-100 text-sm">
              Descarga tu malla en Excel o PDF para tenerla siempre disponible
            </p>
          </div>
        </div>
      </div>
      <div className="w-full bg-white rounded-md shadow">
      
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📅</span>
            <div>
              <h3 className="font-bold text-xl text-gray-800">
                {isAdmin ? `Tu malla (${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })})` : `Malla de turno - ${getRoleName()}`}
              </h3>
              <p className="text-xs text-gray-500 mt-1">Semana 1 de 7</p>
            </div>
          </div>
          {isOfficial && <span className="bg-gradient-to-r from-green-400 to-emerald-500 text-white font-semibold px-4 py-2 rounded-full shadow-md text-sm flex items-center gap-1"><span>✓</span> Oficial</span>}
        </div>
        {/* Código de colores: centrado inmediatamente debajo del título de la malla */}
        <div className="mb-4 flex justify-center">
          <CodigoColoresMalla inline={true} showTitle={false} />
        </div>

        <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        {/* Botones de roles solo visibles para administrador */}
        {isAdmin && (
          <div className="flex items-center gap-2">
            <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-sm px-4 py-2 rounded-lg font-semibold shadow-md transition" onClick={async () => await loadPublished('aux01')}>🔧 AUXILIARES</button>
            <button className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white text-sm px-4 py-2 rounded-lg font-semibold shadow-md transition" onClick={async () => await loadPublished('enf02')}>💉 ENFERMEROS</button>
            <button className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white text-sm px-4 py-2 rounded-lg font-semibold shadow-md transition" onClick={async () => await loadPublished('med03')}>🏥 MEDICOS</button>
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm px-4 py-2 rounded-lg font-semibold shadow-md transition" onClick={async () => await loadPublished('ter04')}>✨ TERAPEUTAS</button>
          </div>
        )}
        {/* Espaciador si no es admin */}
        {!isAdmin && <div></div>}

        <div className="flex items-center gap-2">
          <button
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm px-4 py-2 rounded-lg font-semibold shadow-md transition flex items-center gap-1"
            onClick={() => exportGridToExcel(malla, `malla_${new Date().toISOString().slice(0,7)}.xlsx`, {
              excludeColumns: [
                'MED_min','MED_max','MED_avg','MED_std','JEF_min','JEF_max','JEF_avg','JEF_std',
                'AUX_min','AUX_max','AUX_avg','AUX_std','TER_min','TER_max','TER_avg','TER_std',
                'MED_pool','MED_needDay','MED_needNight','MED_shortage','JEF_pool','JEF_needDay','JEF_needNight','JEF_shortage',
                'AUX_pool','AUX_needDay','AUX_needNight','AUX_shortage','TER_pool','TER_needDay','TER_needNight','TER_shortage'
              ]
            })}
          >
            <span>📊</span>
            Excel
          </button>

          <button
            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white text-sm px-4 py-2 rounded-lg font-semibold shadow-md transition flex items-center gap-1"
            onClick={async () => {
              try {
                // Crear un contenedor temporal que incluya leyenda + malla
                const tempContainer = document.createElement('div');
                tempContainer.style.position = 'fixed';
                tempContainer.style.left = '-10000px';
                tempContainer.style.top = '0';
                tempContainer.style.visibility = 'hidden';
                tempContainer.style.backgroundColor = 'white';
                tempContainer.style.padding = '20px';
                
                // Clonar la leyenda
                const legendElement = document.querySelector('[class*="mb-4 p-4 rounded-xl border-indigo-100"]');
                if (legendElement) {
                  const legendClone = legendElement.cloneNode(true);
                  tempContainer.appendChild(legendClone);
                }
                
                // Clonar la malla
                const mallaElement = document.getElementById('personal-malla-table');
                if (mallaElement) {
                  const mallaClone = mallaElement.cloneNode(true);
                  mallaClone.id = 'temp-malla-for-pdf';
                  tempContainer.appendChild(mallaClone);
                }
                
                document.body.appendChild(tempContainer);
                
                // Extraer mes y año del formato YYYY-MM
                const [year, monthNum] = month.split('-');
                const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                const monthName = monthNames[parseInt(monthNum) - 1];
                
                // Exportar PDF
                const blob = await exportGridToPdf('temp-malla-for-pdf', `malla_${month}.pdf`, { 
                  returnBlob: true,
                  headerInfo: {
                    rolName: getRoleName(),
                    month: monthName,
                    year: year
                  }
                });
                
                // Limpiar
                document.body.removeChild(tempContainer);
                
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
            <span>📄</span>
            PDF
          </button>
        </div>
      </div>
    </div>

    {/* Marco elegante para la malla */}
    <div className="bg-gradient-to-br from-slate-50 to-indigo-50 rounded-2xl border-2 border-indigo-200 shadow-2xl overflow-hidden">
        {/* Encabezado decorativo del marco */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 px-6 py-4 flex items-center gap-3">
          <span className="text-2xl animate-pulse">📋</span>
          <div className="text-white">
            <h4 className="font-bold text-lg">Visualización de Malla de Turno</h4>
            <p className="text-indigo-100 text-xs mt-1">Calendario de turnos publicado para {getRoleName()}</p>
          </div>
        </div>

        {/* Hidden source for PDF generation (TurnosGrid must be present in DOM for html2canvas) */}
        {hasDayColumns && (
          <div id="personal-malla-table-hidden" style={{ position: 'fixed', left: '-10000px', top: 0, visibility: 'hidden' }}>
            <TurnosGrid data={malla} month={new Date().toISOString().slice(0,7)} />
          </div>
        )}

        {/* Visible grid view (TurnosGrid) for conventional users - always show calendar/week cards */}
        <div id="personal-malla-table" className="p-6 bg-white">
          {/* código de colores mostrado arriba, eliminado aquí para evitar duplicados */}

          {/* Grid de turnos */}
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

        {/* Pie de página con estadísticas */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-t border-indigo-200 flex justify-between items-center">
          <div className="text-xs text-gray-600">
            <span className="font-semibold text-indigo-600">Total de días:</span> {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()} días
          </div>
          <div className="text-xs text-gray-500">
            Última actualización: {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalMalla;
