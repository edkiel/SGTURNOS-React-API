import React from 'react';
import { exportGridToExcel, exportGridToPdf } from '../../utils/exportUtils';

// Devuelve un color de texto ('#2C3E50' o '#ffffff') según la luminancia del hex de fondo
const getContrastText = (hex) => {
  if (!hex) return undefined;
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const bigint = parseInt(full, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  // Luminancia aproximada
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 200 ? '#2C3E50' : '#ffffff';
};

// Función para determinar el color según el tipo de turno
const getTurnoColorClasses = (turnoValue) => {
  if (!turnoValue) return { bg: 'bg-white', text: 'text-gray-800', border: 'border-gray-300' };
  
  const val = String(turnoValue).toUpperCase().trim();
  
  // Detectar combinaciones CP+AP (ej: "CP3h+AP8h")
  if (val.includes('CP') && val.includes('AP') && val.includes('+')) {
    return { bg: 'bg-gradient-to-r from-indigo-300 to-teal-600', text: 'text-white', border: 'border-indigo-400', bgHex: '#9B59B6', textHex: '#ffffff', borderHex: '#8e44ad' };
  }
  
  // Detectar AP con horas (ej: "AP8h")
  if (val.startsWith('AP') && /\d+h/i.test(val)) {
    return { bg: 'bg-teal-600', text: 'text-white', border: 'border-teal-700', bgHex: '#2E8B57', textHex: getContrastText('#2E8B57'), borderHex: '#276b47' };
  }
  
  // Mapeo de códigos cortos y palabras clave a colores
  // Turno Día: TD, dia, día, diurno, d, d1
  if (val === 'TD' || val.includes('DIURNO') || val.includes('DIA') || val.includes('DÍA') || val === 'D' || val === 'D1') return { bg: 'bg-amber-400', text: 'text-gray-900', border: 'border-amber-500', bgHex: '#4A90E2', textHex: getContrastText('#4A90E2'), borderHex: '#4A90E2' };
  // Turno Noche: TN, noche, nocturno, n, n1
  if (val === 'TN' || val.includes('NOCTURNO') || val.includes('NOCHE') || val === 'N' || val === 'N1') return { bg: 'bg-purple-700', text: 'text-white', border: 'border-purple-800', bgHex: '#2C3E50', textHex: getContrastText('#2C3E50'), borderHex: '#2C3E50' };
  // Libre: LB, libre
  if (val === 'LB' || val.includes('LIBRE')) return { bg: 'bg-emerald-200', text: 'text-emerald-900', border: 'border-emerald-300', bgHex: '#ECF0F1', textHex: getContrastText('#ECF0F1'), borderHex: '#d0d6d9' };
  // Descanso alternativo
  if (val.includes('DESCANSO') || val === 'DESC' || val === 'X') return { bg: 'bg-gray-300', text: 'text-gray-700', border: 'border-gray-400' };
  // Posturno: PT, posturno
  if (val === 'PT' || val.includes('POSTURNO') || val.includes('POST')) return { bg: 'bg-gray-300', text: 'text-gray-800', border: 'border-gray-400', bgHex: '#D1D5DB', textHex: getContrastText('#D1D5DB'), borderHex: '#9CA3AF' };
  // Comité Primario: CP
  if (val === 'CP' || val.includes('CMP') || val.includes('COMITE')) return { bg: 'bg-indigo-300', text: 'text-indigo-900', border: 'border-indigo-400', bgHex: '#9B59B6', textHex: getContrastText('#9B59B6'), borderHex: '#8e44ad' };
  // Turno Extra
  if (val.includes('EXTRA')) return { bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-600' };
  // Apoyo: AP, apoyo, admin, adm
  if (val === 'AP' || val.includes('APOYO') || val.includes('ADMIN') || val === 'ADM') return { bg: 'bg-teal-600', text: 'text-white', border: 'border-teal-700', bgHex: '#2E8B57', textHex: getContrastText('#2E8B57'), borderHex: '#276b47' };
  
  // Default para valores desconocidos
  return { bg: 'bg-white', text: 'text-gray-800', border: 'border-gray-300' };
};

const TurnosGrid = ({ data, month }) => {
  if (!data || data.length === 0) return <p className="text-gray-500">No hay datos. Genera la malla.</p>;

  // month prop expected as 'YYYY-MM'
  let daysInMonth = 0;
  try {
    if (month && typeof month === 'string') {
      const [y, m] = month.split('-').map(Number);
      daysInMonth = new Date(y, m, 0).getDate();
    } else {
      const now = new Date();
      daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    }
  } catch {
    daysInMonth = 30;
  }

  const containerId = `turnos-grid-${Math.random().toString(36).slice(2,8)}`;

  // Usar vista mensual completa (todos los días en una sola tabla)
  const [year, monthNum] = (month || new Date().toISOString().slice(0,7)).split('-').map(Number);

  // Leyenda de tipos de turno (hex y label)
  const legendItems = [
    { label: 'Turno Día (TD)', hex: '#4A90E2', horario: '07:00-19:00' },
    { label: 'Turno Noche (TN)', hex: '#2C3E50', horario: '19:00-07:00' },
    { label: 'Apoyo (AP)', hex: '#2E8B57' },
    { label: 'Libre (LB)', hex: '#ECF0F1' },
    { label: 'Posturno (PT)', hex: '#D1D5DB' },
    { label: 'Comité Primario (CP)', hex: '#9B59B6' },
  ];

  return (
    <div>
      {/* Leyenda profesional de tipos de turno */}
      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-4">
          {legendItems.map((it) => {
            // Forzamos etiqueta oscura y accesible; aumentamos tamaño del chip
            const forcedTextCol = '#2C3E50';
            return (
              <div key={it.label} className="flex items-center gap-2 text-sm" title={it.label} aria-label={`Leyenda ${it.label}`}>
                <div role="img" aria-hidden="false" title={it.label} style={{ width: 22, height: 22, backgroundColor: it.hex, borderRadius: 6, border: '1px solid rgba(0,0,0,0.08)' }} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ color: forcedTextCol, fontWeight: 600 }}>{it.label}</div>
                  {it.horario && <div style={{ color: '#6B7280', fontSize: '11px', marginTop: '2px' }}>{it.horario}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Vista mensual completa - todos los días en una sola tabla horizontal */}
      <div id={containerId} className="overflow-x-auto bg-white p-2 rounded shadow-sm" style={{ width: '100%' }}>
        <table role="table" aria-label="Malla mensual completa" className="w-full border-collapse" style={{ fontSize: '10px', width: '100%' }}>
          <thead>
            <tr>
              <th className="border p-1 bg-gray-100 sticky left-0 z-10 text-left" style={{ width: '110px', fontSize: '10px' }}>Empleado</th>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const date = new Date(year, monthNum - 1, day);
                const dayName = ['D', 'L', 'M', 'X', 'J', 'V', 'S'][date.getDay()];
                return (
                  <th key={`h-${day}`} className="border p-1 bg-blue-100 text-center" style={{ fontSize: '8px', lineHeight: '1.1', padding: '2px' }}>
                    <div className="font-semibold">{dayName}</div>
                    <div style={{ fontSize: '8px' }}>{day}</div>
                  </th>
                );
              })}
              <th className="border p-1 bg-gray-100" style={{ width: '32px', fontSize: '9px' }}>T</th>
              <th className="border p-1 bg-gray-100" style={{ width: '32px', fontSize: '9px' }}>H</th>
            </tr>
          </thead>
          <tbody>
            {data
              .filter((row) => {
                const name = String(row.name || '').trim().toLowerCase();
                const idNum = Number(row.id);
                if (name === 'equity_stats' || name === 'summary') return false;
                if (!Number.isNaN(idNum) && (idNum === -1 || idNum === -2)) return false;
                return true;
              })
              .map((row) => (
                <tr key={`${row.id}`}> 
                  <td className="border p-1 font-medium bg-white sticky left-0 z-10" style={{ width: '110px', fontSize: '9px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.name}</td>
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                    const turnoValue = row[`d${day}`] || '';
                    const colorClasses = getTurnoColorClasses(turnoValue);
                    return (
                      <td 
                        key={`${row.id}-${day}`} 
                        className={`border text-center align-middle font-bold ${colorClasses.bg} ${colorClasses.text}`}
                        style={{ 
                          backgroundColor: colorClasses.bgHex || undefined, 
                          borderColor: colorClasses.borderHex || undefined, 
                          color: colorClasses.textHex || undefined, 
                          fontSize: '8px',
                          padding: '2px 1px',
                          lineHeight: '1.0',
                          minWidth: '28px'
                        }}
                      >
                        {/* Normalizar valores largos a códigos cortos */}
                        {(() => {
                          const val = String(turnoValue || '').trim();
                          if (!val) return '';
                          const upper = val.toUpperCase();
                          // Detectar y normalizar valores que contengan palabras clave
                          if (upper.includes('TENNESSEE') || upper.includes('TENNESSE')) return 'TN';
                          if (upper.includes('NOCTURNO') || upper.includes('NOCHE')) return 'TN';
                          if (upper.includes('DIURNO') || upper.includes('DIA') || upper.includes('DÍA')) return 'TD';
                          if (upper.includes('LIBRE')) return 'LB';
                          if (upper.includes('POSTURNO') || upper.includes('POST')) return 'PT';
                          if (upper.includes('COMITE') || upper.includes('COMITÉ') || upper.includes('CMP')) return 'CP';
                          if (upper.includes('APOYO') || upper.includes('ADMIN')) return 'AP';
                          if (upper.includes('DESCANSO')) return 'LB';
                          // Retornar el valor original si ya es un código corto
                          return val;
                        })()}
                      </td>
                    );
                  })}
                  <td className="border text-center font-semibold" style={{ width: '32px', fontSize: '9px', padding: '2px' }}>{row.turnos || ''}</td>
                  <td className="border text-center font-semibold" style={{ width: '32px', fontSize: '9px', padding: '2px' }}>{row.horas || ''}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TurnosGrid;
