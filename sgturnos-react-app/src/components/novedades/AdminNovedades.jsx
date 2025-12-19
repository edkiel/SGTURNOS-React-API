import React, { useState, useEffect } from 'react';
import { api, API_BASE_URL } from '../../api';
import AprobadorVacaciones from './AprobadorVacaciones';
import AprobadorPermisos from './AprobadorPermisos';
import AdminAprobadorCambios from './AdminAprobadorCambios';

/**
 * Componente para que administradores aprueben o rechacen novedades
 */
const AdminNovedades = ({ usuarioAdminId, userName, userRol }) => {
  const [activeTab, setActiveTab] = useState('vacaciones'); // vacaciones, permisos, cambios
  const [novedades, setNovedades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('todas'); // todas, pendientes, aprobadas, rechazadas
  const [selectedNovedad, setSelectedNovedad] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterTipo, setFilterTipo] = useState('todos'); // todos, vacaciones, incapacidades, etc.

  // Rol administrativo para aprobar Cambios de Turno
  const [rolCambios, setRolCambios] = useState('jefe'); // 'jefe' | 'operaciones' | 'rrhh'

  const [tipos, setTipos] = useState([]);

  // Cargar tipos disponibles
  useEffect(() => {
    cargarTipos();
  }, []);

  // Cargar todas las novedades
  useEffect(() => {
    cargarNovedades();
  }, []);

  const cargarTipos = async () => {
    try {
      const response = await api.get(`/novedades/tipos/disponibles`);
      setTipos(response.data);
    } catch (err) {
      console.error('Error cargando tipos:', err);
    }
  };

  const cargarNovedades = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/novedades/todas`);
      setNovedades(response.data);
    } catch (err) {
      console.error('Error cargando novedades:', err);
      setError('Error al cargar las novedades');
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async (idNovedad) => {
    try {
      await api.post(
        `/novedades/aprobar/${idNovedad}`,
        { idUsuarioAdmin: usuarioAdminId }
      );
      setSuccess('Novedad aprobada exitosamente');
      cargarNovedades();
      setSelectedNovedad(null);
    } catch (err) {
      console.error('Error aprobando novedad:', err);
      setError(err.response?.data?.error || 'Error al aprobar');
    }
  };

  const handleRechazar = async () => {
    if (!motivoRechazo.trim()) {
      setError('El motivo del rechazo es requerido');
      return;
    }

    try {
      await api.post(
        `/novedades/rechazar/${selectedNovedad.idNovedad}`,
        {
          idUsuarioAdmin: usuarioAdminId,
          motivo: motivoRechazo
        }
      );
      setSuccess('Novedad rechazada exitosamente');
      setMotivoRechazo('');
      setShowRejectModal(false);
      cargarNovedades();
      setSelectedNovedad(null);
    } catch (err) {
      console.error('Error rechazando novedad:', err);
      setError(err.response?.data?.error || 'Error al rechazar');
    }
  };

  const obtenerEstadoColor = (estado) => {
    switch (estado) {
      case 'APROBADA':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'RECHAZADA':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const novedadesFiltradas = novedades.filter(n => {
    let pasa = true;

    // Filtro por estado
    if (filter === 'pendientes') pasa = pasa && n.estado === 'PENDIENTE';
    if (filter === 'aprobadas') pasa = pasa && n.estado === 'APROBADA';
    if (filter === 'rechazadas') pasa = pasa && n.estado === 'RECHAZADA';

    // Filtro por tipo
    if (filterTipo !== 'todos') pasa = pasa && n.tipo?.nombre === filterTipo;

    return pasa;
  });

  return (
    <div className="w-full mx-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-purple-50 to-indigo-50 min-h-screen" style={{ maxWidth: '1400px' }}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">👨‍💼 Gestión de Aprobaciones de Novedades</h1>
          <p className="text-gray-600 mt-2">Revisa y aprueba solicitudes de personal según tu rol administrativo</p>
        </div>

        {/* Tabs de navegación */}
        <div className="mb-8 flex gap-4 bg-white rounded-lg shadow-md p-2">
          <button
            onClick={() => setActiveTab('vacaciones')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'vacaciones'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📅 Aprobación de Vacaciones
          </button>
          <button
            onClick={() => setActiveTab('permisos')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'permisos'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🔐 Aprobación de Permisos
          </button>
          <button
            onClick={() => setActiveTab('cambios')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'cambios'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🕒 Aprobación de Cambios de Turno
          </button>
        </div>

        {/* Contenido según tab activo */}
        {activeTab === 'vacaciones' && (
          <AprobadorVacaciones usuarioId={usuarioAdminId} userName={userName} tipoAprobador={userRol} />
        )}
        {activeTab === 'permisos' && (
          <AprobadorPermisos usuarioId={usuarioAdminId} userName={userName} tipoAprobador={userRol} />
        )}
        {activeTab === 'cambios' && (
          <div className="bg-white rounded-lg p-6 mb-6 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Selecciona tu rol de aprobación</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setRolCambios('jefe')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${rolCambios === 'jefe' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  👔 Jefe Inmediato
                </button>
                <button
                  onClick={() => setRolCambios('operaciones')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${rolCambios === 'operaciones' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  🏥 Operaciones Clínicas
                </button>
                <button
                  onClick={() => setRolCambios('rrhh')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${rolCambios === 'rrhh' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  👥 Recursos Humanos
                </button>
              </div>
            </div>

            <AdminAprobadorCambios usuarioId={usuarioAdminId} userName={userName} rolAdmin={rolCambios} />
          </div>
        )}

        {/* Mensajes de estado - REMOVIDOS porque ahora están en los componentes específicos */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg">
            {error}
            <button
              onClick={() => setError('')}
              className="float-right text-red-600 hover:text-red-800 font-bold"
            >
              ✕
            </button>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg">
            {success}
            <button
              onClick={() => setSuccess('')}
              className="float-right text-green-600 hover:text-green-800 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Filtros</h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Filtro por estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <div className="flex flex-wrap gap-2">
                {['todas', 'pendientes', 'aprobadas', 'rechazadas'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      filter === f
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtro por tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Novedad
              </label>
              <select
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="todos">Todos</option>
                {tipos.map(t => (
                  <option key={t.idTipo} value={t.nombre}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            Total: {novedadesFiltradas.length} solicitud(es)
          </p>
        </div>

        {/* Lista de novedades */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
              <p className="text-gray-600 mt-3">Cargando novedades...</p>
            </div>
          ) : novedadesFiltradas.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
              <p className="text-gray-500 text-lg">No hay novedades para mostrar</p>
            </div>
          ) : (
            novedadesFiltradas.map(n => (
              <div
                key={n.idNovedad}
                className={`bg-white shadow rounded-lg p-6 hover:shadow-lg transition-all border-l-4 ${
                  n.estado === 'PENDIENTE' ? 'border-yellow-500 border-l-4' : 'border-gray-200'
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  {/* Información del usuario */}
                  <div className="col-span-1">
                    <p className="text-xs font-medium text-gray-500 uppercase">Usuario</p>
                    <h3 className="text-lg font-semibold text-gray-800 mt-1">
                      {n.usuario?.primerNombre} {n.usuario?.primerApellido}
                    </h3>
                    <p className="text-gray-600 text-xs mt-1">
                      {n.usuario?.correo}
                    </p>
                    <div className="mt-2">
                      <span className="inline-block text-blue-600 text-xs font-semibold bg-blue-50 px-2 py-1 rounded">
                        {n.usuario?.rol?.rol || 'Sin rol'}
                      </span>
                    </div>
                  </div>

                  {/* Tipo y fechas */}
                  <div className="col-span-1">
                    <p className="text-xs font-medium text-gray-500 uppercase">Tipo de Novedad</p>
                    <p className="text-lg text-gray-800 font-semibold mt-1">{n.tipo?.nombre}</p>

                    {n.fechaInicio && n.fechaFin && (
                      <p className="text-xs text-gray-600 mt-2">
                        📅 {n.fechaInicio} al {n.fechaFin}
                      </p>
                    )}
                  </div>

                  {/* ID Documento e ID Novedad */}
                  <div className="col-span-1">
                    <p className="text-xs font-medium text-gray-500 uppercase">Datos</p>
                    <p className="text-sm text-gray-700 mt-1">
                      <span className="font-semibold">ID Usuario:</span> {n.usuario?.idUsuario}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      <span className="font-semibold">ID Novedad:</span> {n.idNovedad}
                    </p>
                  </div>

                  {/* Estado y fecha */}
                  <div className="col-span-1 text-right">
                    <p className="text-xs font-medium text-gray-500 uppercase mb-2">Estado</p>
                    <span className={`inline-block px-3 py-2 rounded-full text-sm font-semibold border ${obtenerEstadoColor(n.estado)}`}>
                      {n.estado}
                    </span>
                    <p className="text-gray-600 text-xs mt-2">
                      🗓️ {new Date(n.fechaSolicitud).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>

                {/* Descripción */}
                <div className="bg-gray-50 rounded p-3 mb-4">
                  <p className="text-sm text-gray-700">{n.descripcion}</p>
                </div>

                {n.soportePath && (
                  <div className="mb-4">
                    <a
                      href={`${API_BASE_URL}/novedades/${n.idNovedad}/soporte`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                    >
                      Ver soporte PDF
                    </a>
                  </div>
                )}

                {/* Motivo de rechazo si existe */}
                {n.estado === 'RECHAZADA' && n.motivoRechazo && (
                  <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                    <p className="text-sm font-semibold text-red-800">Motivo del rechazo:</p>
                    <p className="text-sm text-red-700">{n.motivoRechazo}</p>
                  </div>
                )}

                {/* Botones de acción - solo si está pendiente */}
                {n.estado === 'PENDIENTE' && (
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => {
                        setSelectedNovedad(n);
                        setShowRejectModal(true);
                      }}
                      className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 font-medium transition-colors"
                    >
                      Rechazar
                    </button>
                    <button
                      onClick={() => handleAprobar(n.idNovedad)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Aprobar
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

      {/* Modal para rechazar */}

        {/* Modal para rechazar */}
      {showRejectModal && selectedNovedad && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Rechazar solicitud
            </h3>

            <p className="text-gray-600 mb-4">
              Solicitud de {selectedNovedad.usuario?.nombres} - {selectedNovedad.tipo?.nombre}
            </p>

            <textarea
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
              placeholder="Ingresa el motivo del rechazo..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              rows="4"
            />

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setMotivoRechazo('');
                  setSelectedNovedad(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleRechazar}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNovedades;
