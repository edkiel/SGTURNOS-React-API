import React from 'react';

/**
 * Componente reutilizable para mostrar IconCard de cada tipo de novedad
 * @param {string} icon - Emoji del icono
 * @param {string} title - Título del módulo
 * @param {string} description - Descripción
 * @param {string} gradientColors - Clases de gradiente (ej: "from-blue-500 to-indigo-600")
 * @param {number} pendientes - Número de pendientes
 * @param {number} total - Total de items
 */
const NovedadIconCard = ({ icon, title, description, gradientColors, pendientes, total }) => {
  return (
    <div className="mb-8">
      <div className="relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 border border-white/20">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientColors} opacity-90`}></div>
        <div className="absolute inset-0 bg-white/5"></div>
        <div className="relative p-8 text-white flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="text-5xl">{icon}</div>
            <span className="px-4 py-2 text-sm font-semibold bg-white/20 rounded-full">Módulo Activo</span>
          </div>
          <div>
            <h2 className="text-3xl font-bold leading-tight">{title}</h2>
            <p className="text-lg text-white/90 mt-3 leading-relaxed">{description}</p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm mt-2">
            <span className="bg-white/20 px-4 py-2 rounded-full font-medium">Pendientes: {pendientes}</span>
            <span className="bg-white/10 px-4 py-2 rounded-full font-medium">Total: {total}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NovedadIconCard;
