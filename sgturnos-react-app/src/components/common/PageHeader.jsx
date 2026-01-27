import React from 'react';

// Header reutilizable para mostrar título, usuario y rol
const PageHeader = ({ 
  title, 
  subtitle, 
  userName, 
  roleLabel,
  icon = '📋',
  description = '',
  pendientes,
  total,
  gradientColors = ''
}) => {
  // Generar un gradiente variado basado en el rol para más dinamismo
  const getGradientByRole = (role) => {
    const roleStr = (role || '').toLowerCase();
    if (roleStr.includes('admin')) return 'from-slate-700 via-slate-600 to-slate-800';
    if (roleStr.includes('jefe')) return 'from-blue-600 via-blue-500 to-indigo-600';
    if (roleStr.includes('operaciones') || roleStr.includes('medico')) return 'from-emerald-600 via-teal-600 to-cyan-600';
    if (roleStr.includes('rrhh') || roleStr.includes('recursos')) return 'from-purple-600 via-purple-500 to-pink-600';
    if (roleStr.includes('enfermero')) return 'from-rose-600 via-orange-500 to-yellow-600';
    if (roleStr.includes('auxiliar')) return 'from-amber-600 via-orange-500 to-red-600';
    if (roleStr.includes('terapeuta')) return 'from-violet-600 via-purple-500 to-indigo-600';
    return 'from-indigo-600 via-purple-600 to-blue-600';
  };

  // Usar gradiente de la novedad si se proporciona, sino usar el del rol
  const gradientClass = gradientColors || getGradientByRole(roleLabel);

  return (
    <div className={`bg-gradient-to-r ${gradientClass} rounded-xl shadow-2xl px-12 md:px-16 py-4 md:py-5 mb-8 relative overflow-hidden`}>
      {/* Efecto de fondo decorativo */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>
      
      <div className="relative z-10 space-y-2">
        {/* Primera fila: Icono + Título | Pendientes/Total */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-3xl md:text-4xl">{icon}</span>
            <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">{title}</h2>
          </div>

          {/* Pendientes y Total */}
          {(pendientes !== undefined || total !== undefined) && (
            <div className="flex gap-2 flex-wrap md:flex-nowrap">
              {pendientes !== undefined && (
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/30 min-w-fit">
                  <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">Pendientes</p>
                  <p className="text-lg font-bold text-white">{pendientes}</p>
                </div>
              )}
              {total !== undefined && (
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/30 min-w-fit">
                  <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">Total</p>
                  <p className="text-lg font-bold text-white">{total}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Segunda fila: Descripción | Usuario/Rol */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Descripción */}
          {description && (
            <p className="text-white/90 text-sm md:text-base font-medium leading-relaxed flex-1">{description}</p>
          )}

          {/* Usuario y Rol */}
          {(userName || roleLabel) && (
            <div className="flex flex-col items-start md:items-end gap-1.5">
              {userName && (
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/30">
                  <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">Usuario</p>
                  <p className="text-sm font-bold text-white">{userName}</p>
                </div>
              )}
              {roleLabel && (
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/30">
                  <span className="text-base">👤</span>
                  <div>
                    <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">Rol</p>
                    <p className="text-xs font-bold text-white">{roleLabel}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tercera fila: Subtítulo (ancho completo, abajo) */}
        {subtitle && (
          <p className="text-white/90 text-xs md:text-sm font-medium pt-1 border-t border-white/20">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default PageHeader;