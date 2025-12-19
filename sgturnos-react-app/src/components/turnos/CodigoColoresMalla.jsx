import React from 'react';

/**
 * Componente reutilizable para mostrar el código de colores de la malla
 * Se puede usar tanto en la vista como en la exportación PDF
 * 
 * Colores utilizados:
 * - Diurno: Amarillo (#fbbf24)
 * - Nocturno: Púrpura (#7e22ce)
 * - Libre: Verde suave (#a7f3d0)
 * - Descanso: Gris (#d1d5db)
 * - Posturno: Rojo suave (#f87171)
 * - Extra: Naranja (#f97316)
 * - Apoyo Admin: Cian (#06b6d4)
 */
const CodigoColoresMalla = ({ className = '', inline = false }) => {
  const colores = [
    { label: 'Diurno', bg: 'bg-amber-400', hex: '#fbbf24' },
    { label: 'Nocturno', bg: 'bg-purple-700', hex: '#7e22ce' },
    { label: 'Libre', bg: 'bg-emerald-200', hex: '#a7f3d0' },
    { label: 'Descanso', bg: 'bg-gray-300', hex: '#d1d5db' },
    { label: 'Posturno', bg: 'bg-rose-400', hex: '#f87171' },
    { label: 'Extra', bg: 'bg-orange-500', hex: '#f97316' },
    { label: 'Apoyo Admin', bg: 'bg-teal-600', hex: '#0d9488' },
  ];

  if (inline) {
    return (
      <div className={`flex gap-3 flex-wrap justify-center ${className}`} style={{ breakInside: 'avoid' }}>
        {colores.map((color) => (
          <div key={color.label} className="flex items-center gap-2" style={{ minWidth: '140px' }}>
            <span 
              className={`w-6 h-6 ${color.bg} rounded-md shadow-md`}
              style={{ backgroundColor: color.hex, flexShrink: 0 }}
            ></span>
            <span className="text-sm font-semibold text-gray-700">{color.label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div 
      className={`mb-4 p-4 rounded-xl border border-indigo-100 bg-indigo-50 ${className}`}
      style={{ 
        backgroundColor: '#e0e7ff',
        border: '2px solid #a5b4fc',
        pageBreakInside: 'avoid',
        breakInside: 'avoid'
      }}
    >
      <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2" style={{ marginBottom: '12px' }}>
        <span>🎨</span> Código de Colores
      </h5>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {colores.map((color) => (
          <div 
            key={color.label} 
            className="flex items-center gap-2"
            style={{ minWidth: '110px', pageBreakInside: 'avoid' }}
          >
            <span 
              className={`w-6 h-6 ${color.bg} rounded-md shadow-md`}
              style={{ 
                backgroundColor: color.hex,
                width: '24px',
                height: '24px',
                borderRadius: '4px',
                flexShrink: 0,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            ></span>
            <span className="text-xs text-gray-700 font-semibold">{color.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CodigoColoresMalla;
