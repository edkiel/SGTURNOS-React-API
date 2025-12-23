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
  
  const val = String(turnoValue).toLowerCase().trim();
  
  // Mapeo de palabras clave a colores - colores diferenciados para fácil identificación
  // Día: cubrir "dia", "día" y abreviaturas
  if (val.includes('diurno') || val.includes('dia') || val.includes('día') || val === 'd' || val === 'd1') return { bg: 'bg-amber-400', text: 'text-gray-900', border: 'border-amber-500', bgHex: '#4A90E2', textHex: getContrastText('#4A90E2'), borderHex: '#4A90E2' };
  // Noche: cubrir "noche" y abreviaturas
  if (val.includes('nocturno') || val.includes('noche') || val === 'n' || val === 'n1') return { bg: 'bg-purple-700', text: 'text-white', border: 'border-purple-800', bgHex: '#2C3E50', textHex: getContrastText('#2C3E50'), borderHex: '#2C3E50' };
  if (val.includes('libre')) return { bg: 'bg-emerald-200', text: 'text-emerald-900', border: 'border-emerald-300', bgHex: '#ECF0F1', textHex: getContrastText('#ECF0F1'), borderHex: '#d0d6d9' };
  if (val.includes('descanso') || val === 'desc' || val === 'x') return { bg: 'bg-gray-300', text: 'text-gray-700', border: 'border-gray-400' };
  if (val.includes('posturno') || val.includes('post')) return { bg: 'bg-rose-400', text: 'text-white', border: 'border-rose-500', bgHex: '#9B8ACF', textHex: getContrastText('#9B8ACF'), borderHex: '#8f7fbd' };
  if (val.includes('extra')) return { bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-600' };
  if (val.includes('apoyo') || val.includes('admin') || val === 'adm') return { bg: 'bg-teal-600', text: 'text-white', border: 'border-teal-700', bgHex: '#2E8B57', textHex: getContrastText('#2E8B57'), borderHex: '#276b47' };
  
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

  // Construir semanas empezando el lunes
  const [year, monthNum] = (month || new Date().toISOString().slice(0,7)).split('-').map(Number);
  const firstDay = new Date(year, monthNum - 1, 1);
  const totalDays = daysInMonth;
  // JS: 0=Sun..6=Sat -> queremos Monday=0..Sunday=6
  const firstWeekdayMonday = (firstDay.getDay() + 6) % 7;

  const weeks = [];
  let week = new Array(7).fill(null);
  // fill leading nulls until firstMonday position
  let dayCounter = 1;
  for (let i = 0; i < firstWeekdayMonday; i++) {
    week[i] = null;
  }
  for (let i = firstWeekdayMonday; i < 7; i++) {
    week[i] = dayCounter <= totalDays ? dayCounter++ : null;
  }
  weeks.push(week);
  while (dayCounter <= totalDays) {
    const w = new Array(7).fill(null);
    for (let d = 0; d < 7 && dayCounter <= totalDays; d++) {
      w[d] = dayCounter++;
    }
    weeks.push(w);
  }

  // encabezados de días
  const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  // Leyenda de tipos de turno (hex y label)
  const legendItems = [
    { label: 'Turno Día', hex: '#4A90E2' },
    { label: 'Turno Noche', hex: '#2C3E50' },
    { label: 'Apoyo', hex: '#2E8B57' },
    { label: 'Libre', hex: '#ECF0F1' },
    { label: 'Posturno', hex: '#9B8ACF' },
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
                <div style={{ color: forcedTextCol, fontWeight: 600 }}>{it.label}</div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Export buttons removed from the inline grid view per UX request */}

      <div id={containerId} className="space-y-6">
        {weeks.map((w, wi) => (
          <div key={`week-${wi}`} className="bg-white p-3 rounded shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold">Semana {wi + 1}</div>
              <div className="text-xs text-gray-600">{w.filter(Boolean).length > 0 ? `${w.find((d) => d)} - ${w.slice().reverse().find((d) => d) || ''}` : ''}</div>
            </div>
            <table role="table" aria-label={`Semana ${wi + 1}`} className="min-w-full border-collapse table-fixed">
              <thead>
                <tr>
                  <th className="border p-2 bg-gray-100">Empleado</th>
                  {w.map((day, di) => (
                    <th key={`h-${wi}-${di}`} className="border p-1 bg-blue-100 text-xs text-center">
                      <div>{day ? dayNames[di] : ''}</div>
                      <div className="text-[10px] text-gray-600">{day ? `${day}/${String(monthNum).padStart(2,'0')}` : ''}</div>
                    </th>
                  ))}
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
                    <tr key={`${row.id}-w-${wi}`}> 
                      <td className="border p-2 font-medium w-40">{row.name}</td>
                      {w.map((day, di) => {
                        const turnoValue = day ? row[`d${day}`] : '';
                        const colorClasses = getTurnoColorClasses(turnoValue);
                        return (
                          <td 
                            key={`${row.id}-${wi}-${di}`} 
                            className={`border p-1 text-center align-middle text-sm font-semibold ${colorClasses.bg} ${colorClasses.text} border-2 ${colorClasses.border}`}
                            style={{ backgroundColor: colorClasses.bgHex || undefined, borderColor: colorClasses.borderHex || undefined, color: colorClasses.textHex || undefined }}
                          >
                            {turnoValue || ''}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TurnosGrid;
