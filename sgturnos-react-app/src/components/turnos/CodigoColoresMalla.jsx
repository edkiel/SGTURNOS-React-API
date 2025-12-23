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
const CodigoColoresMalla = ({ className = '', inline = false, showTitle = true }) => {
  const colores = [
    { label: 'Turno Día', hex: '#4A90E2' },
    { label: 'Turno Noche', hex: '#2C3E50' },
    { label: 'Apoyo', hex: '#2E8B57' },
    { label: 'Libre', hex: '#ECF0F1' },
    { label: 'Posturno', hex: '#9B8ACF' },
  ];

  // Compact inline legend (chip + label) used near headers
  if (inline) {
    return (
      <div className={`flex gap-4 flex-wrap items-center ${className}`} style={{ breakInside: 'avoid' }}>
        {colores.map((color) => (
          <div key={color.label} className="flex items-center gap-2" style={{ whiteSpace: 'nowrap' }}>
            <span
              role="img"
              aria-hidden="false"
              title={color.label}
              style={{
                backgroundColor: color.hex,
                width: 14,
                height: 14,
                borderRadius: 4,
                display: 'inline-block',
                border: '1px solid rgba(0,0,0,0.08)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.06)'
              }}
            />
            <span className="text-xs font-medium" style={{ color: '#2C3E50' }}>{color.label}</span>
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
      {showTitle && (
        <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2" style={{ marginBottom: '12px' }}>
          <span>🎨</span> Código de Colores
        </h5>
      )}
      <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
        {colores.map((color) => (
          <div key={color.label} style={{ display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
            <span
              role="img"
              aria-hidden="false"
              title={color.label}
              style={{
                backgroundColor: color.hex,
                width: 18,
                height: 18,
                borderRadius: 6,
                display: 'inline-block',
                border: '1px solid rgba(0,0,0,0.08)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.06)'
              }}
            />
            <span className="text-xs font-medium" style={{ color: '#2C3E50' }}>{color.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CodigoColoresMalla;
