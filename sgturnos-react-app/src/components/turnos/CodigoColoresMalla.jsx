import React from 'react';

/**
 * Componente reutilizable para mostrar el código de colores de la malla
 * Se puede usar tanto en la vista como en la exportación PDF
 * 
 * Códigos y Colores utilizados:
 * - Turno Día (TD): Azul (#4A90E2)
 * - Turno Noche (TN): Gris oscuro (#2C3E50)
 * - Libre (LB): Gris claro (#ECF0F1)
 * - Posturno (PT): Lavanda (#9B8ACF)
 * - Comité Primario (CP): Púrpura (#9B59B6)
 * - Apoyo (AP): Verde mar (#2E8B57)
 */
const CodigoColoresMalla = ({ className = '', inline = false, showTitle = true }) => {
  const colores = [
    { label: 'Turno Día (TD)', hex: '#4A90E2', horario: '07:00-19:00' },
    { label: 'Turno Noche (TN)', hex: '#2C3E50', horario: '19:00-07:00' },
    { label: 'Apoyo (AP)', hex: '#2E8B57', horario: 'Variable 4-12h' },
    { label: 'Libre (LB)', hex: '#ECF0F1' },
    { label: 'Posturno (PT)', hex: '#9B8ACF', horario: 'Descanso 12h' },
    { label: 'Comité Primario (CP)', hex: '#9B59B6', horario: '3h' },
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
      <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {colores.map((color) => (
          <div key={color.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
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
                boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                marginTop: '2px'
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="text-xs font-medium" style={{ color: '#2C3E50', whiteSpace: 'nowrap' }}>
                {color.label}
              </span>
              {color.horario && (
                <span className="text-xs text-gray-600" style={{ fontSize: '10px', marginTop: '2px', whiteSpace: 'nowrap' }}>
                  {color.horario}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CodigoColoresMalla;
