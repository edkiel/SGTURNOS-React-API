import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../api';

/**
 * Componente para que administradores aprueben o rechacen novedades
 */
const AdminNovedades = ({ usuarioAdminId }) => {
  const [novedades, setNovedades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('todas'); // todas, pendientes, aprobadas, rechazadas
  const [selectedNovedad, setSelectedNovedad] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterTipo, setFilterTipo] = useState('todos'); // todos, vacaciones, incapacidades, etc.

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
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/novedades/tipos/disponibles`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setTipos(response.data);
    } catch (err) {
      console.error('Error cargando tipos:', err);
    }
  };

  const cargarNovedades = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/novedades/todas`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
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
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/novedades/aprobar/${idNovedad}`,
        { idUsuarioAdmin: usuarioAdminId },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
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
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/novedades/rechazar/${selectedNovedad.idNovedad}`,
        {
          idUsuarioAdmin: usuarioAdminId,
          motivo: motivoRechazo
        },
        {
          headers: { Authorization: `Bearer ${token}` }
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
    <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Novedades</h1>
          <p className="text-gray-600 mt-2">Aprueba o rechaza solicitudes de personal</p>
        </div>

        {/* Mensajes de estado */}
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
                <div className="grid grid-cols-3 gap-4 items-center mb-4">
                  {/* Información principal */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {n.usuario?.nombres} {n.usuario?.apellidos}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {n.usuario?.email}
                    </p>
                  </div>

                  {/* Tipo y fechas */}
                  <div>
                    <p className="text-sm font-medium text-gray-700">Tipo</p>
                    <p className="text-lg text-gray-800">{n.tipo?.nombre}</p>

                    {n.fechaInicio && n.fechaFin && (
                      <p className="text-sm text-gray-600 mt-2">
                        {n.fechaInicio} al {n.fechaFin}
                      </p>
                    )}
                  </div>

                  {/* Estado y fecha */}
                  <div className="text-right">
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold border ${obtenerEstadoColor(n.estado)}`}>
                      {n.estado}
                    </span>
                    <p className="text-gray-600 text-xs mt-2">
                      {new Date(n.fechaSolicitud).toLocaleDateString('es-ES')}
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
      </div>

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
