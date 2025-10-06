import React from 'react';

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

  return (
    <table role="table" aria-label="Cuadrícula de turnos" className="min-w-full border-collapse">
      <thead>
        <tr>
          <th className="border p-2 bg-gray-100">Empleado</th>
          {Array.from({ length: daysInMonth }).map((_, i) => (
            <th key={i} className="border p-2 bg-gray-50">{i+1}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map(row => (
          <tr key={row.id}>
            <td className="border p-2 font-medium">{row.name}</td>
            {Array.from({ length: daysInMonth }).map((_, i) => (
              <td key={i} className="border p-2 text-center">{row[`d${i+1}`]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TurnosGrid;
