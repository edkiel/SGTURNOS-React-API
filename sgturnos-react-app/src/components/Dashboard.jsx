import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useNavigate } from 'react-router-dom';
import AdminPublishedMallas from './turnos/AdminPublishedMallas';
import PageHeader from './common/PageHeader';
import BadgeNovedadesPendientes from './novedades/BadgeNovedadesPendientes';

const Dashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [novedadesPendientes, setNovedadesPendientes] = useState([]);
  const [novedadesResueltas, setNovedadesResueltas] = useState([]);
  const [alertasMalla, setAlertasMalla] = useState([]);
  const [loading, setLoading] = useState(true);

  // Determinar el rol del usuario
  const roleName = user?.rol?.nombre || user?.rol?.rol || '';
  const isAdmin = roleName.toUpperCase().includes('ADMIN');
  const isJefeInmediato = roleName.toUpperCase().includes('JEFE');
  const isOperacionesClinicas = roleName.toUpperCase().includes('OPERACIONES');
  const isRecursosHumanos = roleName.toUpperCase().includes('RECURSOS') || roleName.toUpperCase().includes('RRHH');
  const isUsuarioRegular = !isAdmin && !isJefeInmediato && !isOperacionesClinicas && !isRecursosHumanos;

  useEffect(() => {
    cargarDashboardData();
    
    // Para usuarios regulares: actualizar cada 30 segundos para reflejar cambios de aprobación/rechazo
    let interval;
    if (isUsuarioRegular) {
      interval = setInterval(() => {
        cargarDashboardData();
      }, 30000); // Cada 30 segundos
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user?.idUsuario]);

  const cargarDashboardData = async () => {
    setLoading(true);
    try {
      // Cargar novedades según el rol
      if (isUsuarioRegular && user?.idUsuario) {
        // Usuario regular: sus propias novedades
        const res = await api.get(`/novedades/usuario/${user.idUsuario}`);
        const todasNovedades = res.data || [];
        
        // Filtrar novedades cuya fecha de inicio NO haya llegado aún
        const fechaHoy = new Date();
        fechaHoy.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fechas
        
        const novedadesActivas = todasNovedades.filter(n => {
          if (!n.fechaInicio) return true; // Si no tiene fecha de inicio, mostrarla
          const fechaInicio = new Date(n.fechaInicio);
          return fechaInicio > fechaHoy; // Mostrar solo si la fecha de inicio es futura
        });
        
        // Para usuarios regulares: mostrar solo la novedad más reciente en el panel
        // (sin importar si está pendiente o resuelta)
        if (novedadesActivas.length > 0) {
          const ordenadas = novedadesActivas.sort((a, b) => {
            const fechaA = new Date(a.fechaSolicitud || a.fechaCreacion || 0);
            const fechaB = new Date(b.fechaSolicitud || b.fechaCreacion || 0);
            return fechaB - fechaA;
          });
          setNovedadesPendientes([ordenadas[0]]); // Mostrar la más reciente en el panel
        } else {
          setNovedadesPendientes([]);
        }
        
        // Para el box de notificación: solo las resueltas (aprobadas/rechazadas)
        const resueltas = novedadesActivas.filter(n => n.estado === 'APROBADA' || n.estado === 'RECHAZADA');
        if (resueltas.length > 0) {
          const ordenadasResueltas = resueltas.sort((a, b) => {
            const fechaA = new Date(a.fechaSolicitud || a.fechaCreacion || 0);
            const fechaB = new Date(b.fechaSolicitud || b.fechaCreacion || 0);
            return fechaB - fechaA;
          });
          setNovedadesResueltas([ordenadasResueltas[0]]);
        } else {
          setNovedadesResueltas([]);
        }
      } else if (isJefeInmediato) {
        // Jefe Inmediato: novedades pendientes de aprobación
        const res = await api.get('/novedades/pendientes-jefe');
        setNovedadesPendientes(res.data || []);
      } else if (isOperacionesClinicas) {
        // Operaciones Clínicas: novedades pendientes + alertas de malla
        const resNovedades = await api.get('/novedades/pendientes-operaciones');
        setNovedadesPendientes(resNovedades.data || []);
        
        try {
          const resAlertas = await api.get('/alertas-malla');
          setAlertasMalla(resAlertas.data || []);
        } catch (err) {
          console.log('No hay alertas de malla disponibles');
          setAlertasMalla([]);
        }
      } else if (isRecursosHumanos) {
        // RRHH: novedades pendientes de aprobación final
        const res = await api.get('/novedades/pendientes-rrhh');
        setNovedadesPendientes(res.data || []);
      } else if (isAdmin) {
        // Admin: todas las novedades pendientes en cualquier nivel de aprobación
        const res = await api.get('/novedades/pendientes-admin');
        setNovedadesPendientes(res.data || []);
      }
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
      // No mostrar error al usuario, solo en consola
    } finally {
      setLoading(false);
    }
  };

  const getTipoNovedadColor = (tipo) => {
    const colores = {
      'VACACIONES': 'bg-blue-100 text-blue-800 border-blue-300',
      'INCAPACIDAD': 'bg-red-100 text-red-800 border-red-300',
      'PERMISO': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'CALAMIDAD': 'bg-purple-100 text-purple-800 border-purple-300',
      'CAMBIO_TURNO': 'bg-green-100 text-green-800 border-green-300',
      'LICENCIA': 'bg-indigo-100 text-indigo-800 border-indigo-300'
    };
    return colores[tipo] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getEstadoColor = (estado) => {
    const colores = {
      'PENDIENTE': 'bg-yellow-100 text-yellow-800',
      'APROBADA': 'bg-green-100 text-green-800',
      'RECHAZADA': 'bg-red-100 text-red-800'
    };
    return colores[estado] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header con PageHeader */}
        <PageHeader 
          title="Dashboard"
          subtitle="Visualiza tus mallas de turnos y novedades"
          userName={user?.nombre || user?.correo}
          roleLabel={roleName}
        />

        {/* Box de Notificación - Solo para administradores con novedades pendientes */}
        {(isAdmin || isJefeInmediato || isOperacionesClinicas || isRecursosHumanos) && novedadesPendientes.length > 0 && (
          <div className="mb-6 bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-500 rounded-lg shadow-md p-4 animate-pulse">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-semibold text-orange-800">
                  ⚠️ Hay novedades que deben ser validadas
                </p>
                <p className="text-xs text-orange-700 mt-1">
                  Tienes <span className="font-bold">{novedadesPendientes.length}</span> {novedadesPendientes.length === 1 ? 'novedad pendiente' : 'novedades pendientes'} de aprobación
                </p>
              </div>
              <button
                onClick={() => navigate('/novedades')}
                className="ml-4 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors duration-200 shadow-sm"
              >
                Ver ahora →
              </button>
            </div>
          </div>
        )}

        {/* Box de Notificación - Para usuarios regulares con novedades resueltas */}
        {isUsuarioRegular && novedadesResueltas.length > 0 && (
          <div className={`mb-6 border-l-4 rounded-lg shadow-md p-4 ${
            novedadesResueltas[0].estado === 'RECHAZADA' 
              ? 'bg-gradient-to-r from-red-50 to-orange-50 border-red-500' 
              : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-500'
          }`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {novedadesResueltas[0].estado === 'RECHAZADA' ? (
                  <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l-2-2m0 0l-2-2m2 2l2-2m-2 2l-2 2m2-2l2 2m6-6a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="ml-3 flex-1">
                <p className={`text-sm font-semibold ${
                  novedadesResueltas[0].estado === 'RECHAZADA' ? 'text-red-800' : 'text-blue-800'
                }`}>
                  ℹ️ Tienes actualizaciones en tus solicitudes
                </p>
                <p className={`text-xs mt-1 ${
                  novedadesResueltas[0].estado === 'RECHAZADA' ? 'text-red-700' : 'text-blue-700'
                }`}>
                  {novedadesResueltas.length === 1 ? (
                    <>
                      Tu solicitud ha sido <span className="font-bold">{novedadesResueltas[0].estado === 'APROBADA' ? 'aprobada ✅' : 'rechazada ❌'}</span>
                    </>
                  ) : (
                    <>
                      Tienes <span className="font-bold">{novedadesResueltas.length}</span> solicitudes con respuesta
                    </>
                  )}
                </p>
              </div>
              <button
                onClick={() => navigate('/novedades')}
                className={`ml-4 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors duration-200 shadow-sm ${
                  novedadesResueltas[0].estado === 'RECHAZADA'
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                Ver detalles →
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Componente Mallas Publicadas - Para todos los roles */}
          <div className="lg:col-span-2">
            <AdminPublishedMallas />
          </div>

          {/* Panel de Novedades */}
          <div className="bg-white rounded-2xl shadow-xl p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                📋 Novedades
                <BadgeNovedadesPendientes rol={roleName} />
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={cargarDashboardData}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-sm font-semibold transition"
                  title="Actualizar"
                >
                  🔄
                </button>
                <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {novedadesPendientes.length}
                </span>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Cargando...</p>
              </div>
            ) : novedadesPendientes.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">✅</div>
                <p className="text-gray-600">{isUsuarioRegular ? 'No hay novedades activas' : 'No hay novedades pendientes'}</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {novedadesPendientes.map((novedad) => {
                  // Extraer tipo de novedad de forma segura
                  const tipoNombre = novedad.tipoNovedad?.nombre || novedad.tipo?.nombre || 'Sin tipo';
                  const tipoCodigo = novedad.tipoNovedad?.codigo || novedad.tipo?.codigo || '';
                  const usuarioNombre = novedad.usuario?.nombre || `${novedad.usuario?.primerNombre || ''} ${novedad.usuario?.primerApellido || ''}`.trim() || 'Usuario';
                  
                  return (
                    <div
                      key={novedad.idNovedad}
                      className="border-l-4 border-indigo-500 bg-gray-50 p-4 rounded-r-lg hover:shadow-md transition cursor-pointer"
                      onClick={() => navigate('/novedades')}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getTipoNovedadColor(tipoCodigo)}`}>
                          {tipoNombre}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstadoColor(novedad.estado || 'PENDIENTE')}`}>
                          {novedad.estado || 'PENDIENTE'}
                        </span>
                      </div>
                      <p className="font-semibold text-gray-800">
                        {usuarioNombre}
                      </p>
                      <p className="text-sm text-gray-600">
                        {novedad.fechaInicio || ''} - {novedad.fechaFin || ''}
                      </p>
                      {novedad.observaciones && (
                        <p className="text-xs text-gray-500 mt-1 italic truncate">
                          {novedad.observaciones}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <button
              onClick={() => navigate('/novedades')}
              className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition duration-200"
            >
              Ver todas las novedades →
            </button>
          </div>

          {/* Panel de Alertas de Malla (solo Operaciones Clínicas) */}
          {isOperacionesClinicas && (
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  🔔 Alertas de Malla
                </h2>
                <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {alertasMalla.length}
                </span>
              </div>

              {alertasMalla.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">✅</div>
                  <p className="text-gray-600">No hay alertas de malla</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {alertasMalla.map((alerta) => (
                    <div
                      key={alerta.idAlerta}
                      className={`border-l-4 p-4 rounded-r-lg ${
                        alerta.tipoAccion === 'RECALCULO_MES_ACTUAL' 
                          ? 'border-red-500 bg-red-50' 
                          : 'border-yellow-500 bg-yellow-50'
                      }`}
                    >
                      <p className="font-semibold text-gray-800">
                        {alerta.usuario?.nombre || 'Usuario'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Mes: {alerta.mesAfectado}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {alerta.tipoAccion === 'RECALCULO_MES_ACTUAL' 
                          ? '⚠️ Requiere recálculo urgente' 
                          : '⚡ Evitar programación futura'}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => navigate('/mallas')}
                className="mt-4 w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition duration-200"
              >
                Gestionar alertas →
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
