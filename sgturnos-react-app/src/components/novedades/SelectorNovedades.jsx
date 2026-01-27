import React from 'react';

/**
 * Componente elegante y empresarial para seleccionar tipo de novedad
 * Muestra todas las novedades disponibles en un grid profesional
 */
const SelectorNovedades = ({ onSelect, onCreate, selectedTab, userName = '', userRole = '' }) => {
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
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Principal de Novedades */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-2xl shadow-2xl mb-6 overflow-hidden">
        {/* Contenedor Principal */}
        <div className="px-8 py-6">
          {/* Fila 1: Título y Usuario/Rol */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
            {/* Título Novedades */}
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">Novedades</h1>
                <p className="text-orange-100 text-sm mt-1">Sistema de Solicitudes y Reportes</p>
              </div>
            </div>

            {/* Usuario y Rol */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Card Usuario */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div>
                    <p className="text-xs text-orange-200 font-medium">Usuario</p>
                    <p className="text-sm font-semibold text-white">{userName || 'Usuario'}</p>
                  </div>
                </div>
              </div>

              {/* Card Rol */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <div>
                    <p className="text-xs text-orange-200 font-medium">Rol</p>
                    <p className="text-sm font-semibold text-white">{userRole || 'Sin rol asignado'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fila 2: Descripción */}
          <div className="border-t border-white/20 pt-3 mt-3">
            <p className="text-orange-100 text-sm">
              Selecciona el tipo de novedad que deseas solicitar: vacaciones, incapacidades, permisos y más
            </p>
          </div>
        </div>
      </div>

      {/* Grid de opciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {novedades.map((novedad) => (
          <div
            key={novedad.id}
            className={`relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 group ${
              selectedTab === novedad.id ? 'ring-2 ring-offset-2 ring-slate-400' : ''
            }`}
            onClick={() => onSelect && onSelect(novedad.id)}
            role="button"
            tabIndex={0}
          >
            {/* Fondo degradado */}
            <div className={`absolute inset-0 bg-gradient-to-br ${novedad.color} opacity-90 group-hover:opacity-100 transition-opacity`}></div>

            {/* Overlay de luz */}
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity"></div>

            {/* Contenido */}
            <div className="relative p-6 text-white flex flex-col items-center justify-center h-full min-h-[220px]">
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

              {/* Acciones */}
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={(e) => { e.stopPropagation(); onCreate && onCreate(novedad.id); }}
                  className="bg-white text-slate-900 hover:bg-slate-100 text-sm font-semibold px-3 py-1 rounded-lg"
                  title="Crear nueva solicitud"
                >
                  Crear nueva solicitud
                </button>
              </div>
            </div>
          </div>
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
