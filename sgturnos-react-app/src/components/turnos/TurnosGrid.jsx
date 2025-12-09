import React from 'react';
import { exportGridToExcel, exportGridToPdf } from '../../utils/exportUtils';

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

  return (
    <div>
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
                      {w.map((day, di) => (
                        <td key={`${row.id}-${wi}-${di}`} className="border p-1 text-center align-top text-sm">
                          {day ? row[`d${day}`] : ''}
                        </td>
                      ))}
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
