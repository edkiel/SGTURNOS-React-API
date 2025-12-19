import React from 'react';

/**
 * Componente elegante y empresarial para seleccionar tipo de novedad
 * Muestra todas las novedades disponibles en un grid profesional
 */
const SelectorNovedades = ({ onSelect, selectedTab }) => {
  const novedades = [
    {
      id: 'vacaciones',
      nombre: 'Vacaciones',
      descripcion: 'Solicitar período de vacaciones',
      icono: '🏖️',
      color: 'from-blue-500 to-blue-600',
      borderColor: 'border-blue-200',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      id: 'incapacidades',
      nombre: 'Incapacidades',
      descripcion: 'Reportar licencia médica o incapacidad',
      icono: '🏥',
      color: 'from-red-500 to-red-600',
      borderColor: 'border-red-200',
      bgLight: 'bg-red-50',
      textColor: 'text-red-700'
    },
    {
      id: 'permisos',
      nombre: 'Permisos',
      descripcion: 'Solicitar permiso especial con fecha definida',
      icono: '📋',
      color: 'from-amber-500 to-amber-600',
      borderColor: 'border-amber-200',
      bgLight: 'bg-amber-50',
      textColor: 'text-amber-700'
    },
    {
      id: 'cambios',
      nombre: 'Cambios de Turno',
      descripcion: 'Solicitar cambio con otro compañero',
      icono: '🔄',
      color: 'from-purple-500 to-purple-600',
      borderColor: 'border-purple-200',
      bgLight: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    {
      id: 'calamidad',
      nombre: 'Calamidad',
      descripcion: 'Situación de calamidad personal o familiar',
      icono: '⚠️',
      color: 'from-orange-500 to-orange-600',
      borderColor: 'border-orange-200',
      bgLight: 'bg-orange-50',
      textColor: 'text-orange-700'
    },
    {
      id: 'otros',
      nombre: 'Otros',
      descripcion: 'Evento no especificado en las opciones anteriores',
      icono: '📌',
      color: 'from-slate-500 to-slate-600',
      borderColor: 'border-slate-200',
      bgLight: 'bg-slate-50',
      textColor: 'text-slate-700'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Encabezado elegante */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Gestión de Novedades</h2>
        <p className="text-gray-600 text-lg">Selecciona el tipo de novedad que deseas solicitar</p>
      </div>

      {/* Grid de opciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {novedades.map((novedad) => (
          <button
            key={novedad.id}
            onClick={() => onSelect(novedad.id)}
            className={`relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer group ${
              selectedTab === novedad.id ? 'ring-2 ring-offset-2 ring-slate-400' : ''
            }`}
          >
            {/* Fondo degradado */}
            <div className={`absolute inset-0 bg-gradient-to-br ${novedad.color} opacity-90 group-hover:opacity-100 transition-opacity`}></div>

            {/* Overlay de luz */}
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity"></div>

            {/* Contenido */}
            <div className="relative p-6 text-white flex flex-col items-center justify-center h-full min-h-[200px]">
              {/* Icono grande */}
              <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                {novedad.icono}
              </div>

              {/* Nombre */}
              <h3 className="text-xl font-bold mb-2 text-center">{novedad.nombre}</h3>

              {/* Descripción */}
              <p className="text-sm text-white/90 text-center leading-relaxed">
                {novedad.descripcion}
              </p>

              {/* Indicador de selección */}
              {selectedTab === novedad.id && (
                <div className="mt-4 flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                  <span className="text-lg">✓</span>
                  <span className="text-xs font-semibold">Seleccionado</span>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Información adicional */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-200">
        <p className="text-sm text-gray-700 text-center">
          <span className="font-semibold">💡 Tip:</span> Haz clic en cualquier opción para comenzar tu solicitud
        </p>
      </div>
    </div>
  );
};

export default SelectorNovedades;
