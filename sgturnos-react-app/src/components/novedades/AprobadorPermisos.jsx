import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../api';

/**
 * Vista para aprobadores de permisos
 * Muestra las solicitudes pendientes según el rol del aprobador
 * Sistema de triple aprobación: Jefe → Operaciones → RRHH
 */
const AprobadorPermisos = ({ usuarioId, userName, tipoAprobador }) => {
  const [aprobacionesPendientes, setAprobacionesPendientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedAprobacion, setSelectedAprobacion] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    cargarAprobacionesPendientes();
  }, [usuarioId]);

  const cargarAprobacionesPendientes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/aprobaciones/pendientes/${usuarioId}?tipo=PERMISOS`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Filtrar solo permisos
      const permisos = response.data.filter(
        apr => apr.novedad?.tipo?.nombre === 'Permisos'
      );
      setAprobacionesPendientes(permisos);
    } catch (err) {
      console.error('Error cargando aprobaciones:', err);
      setError('Error al cargar los permisos pendientes');
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async (aprobacion) => {
    try {
      setError('');
      setSuccess('');
      const token = localStorage.getItem('token');

      await axios.post(
        `${API_BASE_URL}/aprobaciones/aprobar`,
        {
          idNovedad: aprobacion.novedad.idNovedad,
          idAprobador: usuarioId,
          tipoAprobador: aprobacion.tipoAprobador
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('Permiso aprobado exitosamente');
      cargarAprobacionesPendientes();
    } catch (err) {
      console.error('Error aprobando:', err);
      setError(err.response?.data?.error || 'Error al aprobar');
    }
  };

  const handleRechazar = async () => {
    if (!motivoRechazo.trim()) {
      setError('Debe ingresar un motivo de rechazo');
      return;
    }

    try {
      setError('');
      setSuccess('');
      const token = localStorage.getItem('token');

      await axios.post(
        `${API_BASE_URL}/aprobaciones/rechazar`,
        {
          idNovedad: selectedAprobacion.novedad.idNovedad,
          idAprobador: usuarioId,
          tipoAprobador: selectedAprobacion.tipoAprobador,
          motivo: motivoRechazo
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('Permiso rechazado exitosamente');
      setShowModal(false);
      setMotivoRechazo('');
      setSelectedAprobacion(null);
      cargarAprobacionesPendientes();
    } catch (err) {
      console.error('Error rechazando:', err);
      setError(err.response?.data?.error || 'Error al rechazar');
    }
  };

  const abrirModalRechazo = (aprobacion) => {
    setSelectedAprobacion(aprobacion);
    setShowModal(true);
    setMotivoRechazo('');
  };

  const getTipoAprobadorLabel = (tipo) => {
    switch (tipo) {
      case 'JEFE_INMEDIATO': return 'Jefe Inmediato';
      case 'OPERACIONES_CLINICAS': return 'Operaciones Clínicas';
      case 'RECURSOS_HUMANOS': return 'Recursos Humanos';
      default: return tipo;
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">🔐 Aprobación de Permisos</h1>
          <p className="text-gray-600 mt-1">Aprobador: {userName}</p>
          <p className="text-sm text-blue-600 mt-1">
            Rol: {tipoAprobador ? getTipoAprobadorLabel(tipoAprobador) : 'Múltiple'}
          </p>
          <p className="text-xs text-gray-500 mt-2 italic">
            Sistema de triple aprobación: Jefe Inmediato → Operaciones Clínicas → Recursos Humanos
          </p>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-600 hover:text-red-800 font-bold">✕</button>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg flex justify-between items-center">
            <span>{success}</span>
            <button onClick={() => setSuccess('')} className="text-green-600 hover:text-green-800 font-bold">✕</button>
          </div>
        )}

        {/* Lista de aprobaciones pendientes */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando permisos pendientes...</p>
          </div>
        ) : aprobacionesPendientes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">✓ No hay permisos pendientes de aprobación</p>
          </div>
        ) : (
          <div className="space-y-4">
            {aprobacionesPendientes.map(aprobacion => (
              <div key={aprobacion.idAprobacion} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-bold text-gray-800">
                        Solicitud #{aprobacion.novedad.idNovedad} - Permiso
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                        getTipoAprobadorLabel(aprobacion.tipoAprobador) === 'Jefe Inmediato'
                          ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                          : getTipoAprobadorLabel(aprobacion.tipoAprobador) === 'Operaciones Clínicas'
                          ? 'bg-cyan-100 text-cyan-800 border-cyan-300'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}>
                        {getTipoAprobadorLabel(aprobacion.tipoAprobador)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                      <div>
                        <span className="font-semibold">Solicitante:</span> {aprobacion.novedad.usuario?.primerNombre} {aprobacion.novedad.usuario?.primerApellido}
                      </div>
                      <div>
                        <span className="font-semibold">Rol/Puesto:</span> {aprobacion.novedad.usuario?.rol?.rol || 'N/A'}
                      </div>
                      <div>
                        <span className="font-semibold">Fecha inicio:</span> {new Date(aprobacion.novedad.fechaInicio).toLocaleDateString('es-ES')}
                      </div>
                      <div>
                        <span className="font-semibold">Fecha fin:</span> {new Date(aprobacion.novedad.fechaFin).toLocaleDateString('es-ES')}
                      </div>
                      <div className="col-span-2">
                        <span className="font-semibold">Tipo de permiso:</span> {aprobacion.novedad.descripcion}
                      </div>
                      <div className="col-span-2">
                        <span className="font-semibold">Fecha de solicitud:</span> {new Date(aprobacion.novedad.fechaSolicitud).toLocaleString('es-ES')}
                      </div>
                    </div>

                    {/* Estado de otras aprobaciones */}
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-400">
                      <h4 className="font-semibold text-gray-700 mb-3">Estado General de Aprobaciones:</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex flex-col items-center p-3 bg-white rounded border-l-4 border-indigo-500">
                          <div className={`w-4 h-4 rounded-full mb-2 ${aprobacion.novedad.aprobacionJefe ? 'bg-green-500 shadow-lg' : 'bg-gray-300'}`}></div>
                          <span className="text-xs font-semibold text-gray-700">Jefe Inmediato</span>
                          {aprobacion.novedad.aprobacionJefe && <span className="text-xs text-green-600 mt-1">✓ Aprobado</span>}
                        </div>
                        <div className="flex flex-col items-center p-3 bg-white rounded border-l-4 border-cyan-500">
                          <div className={`w-4 h-4 rounded-full mb-2 ${aprobacion.novedad.aprobacionOperaciones ? 'bg-green-500 shadow-lg' : 'bg-gray-300'}`}></div>
                          <span className="text-xs font-semibold text-gray-700">Operaciones</span>
                          {aprobacion.novedad.aprobacionOperaciones && <span className="text-xs text-green-600 mt-1">✓ Aprobado</span>}
                        </div>
                        <div className="flex flex-col items-center p-3 bg-white rounded border-l-4 border-emerald-500">
                          <div className={`w-4 h-4 rounded-full mb-2 ${aprobacion.novedad.aprobacionRrhh ? 'bg-green-500 shadow-lg' : 'bg-gray-300'}`}></div>
                          <span className="text-xs font-semibold text-gray-700">RRHH</span>
                          {aprobacion.novedad.aprobacionRrhh && <span className="text-xs text-green-600 mt-1">✓ Aprobado</span>}
                        </div>
                      </div>
                      {aprobacion.novedad.aprobacionJefe && aprobacion.novedad.aprobacionOperaciones && aprobacion.novedad.aprobacionRrhh && (
                        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-center">
                          <p className="text-sm font-semibold text-green-700">✓ PERMISO COMPLETAMENTE APROBADO</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex flex-col gap-2 ml-6">
                    <button
                      onClick={() => handleAprobar(aprobacion)}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md hover:shadow-lg"
                    >
                      ✓ Aprobar
                    </button>
                    <button
                      onClick={() => abrirModalRechazo(aprobacion)}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-md hover:shadow-lg"
                    >
                      ✗ Rechazar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de rechazo */}
        {showModal && selectedAprobacion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Rechazar Permiso</h3>
              <p className="text-sm text-gray-600 mb-4">
                Solicitud de {selectedAprobacion.novedad.usuario?.primerNombre} {selectedAprobacion.novedad.usuario?.primerApellido}
              </p>

              <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                <p className="text-sm text-red-700">
                  <span className="font-semibold">Nota:</span> Al rechazar en tu nivel, el permiso será marcado como rechazado y el solicitante será notificado.
                </p>
              </div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo del Rechazo *
              </label>
              <textarea
                value={motivoRechazo}
                onChange={(e) => setMotivoRechazo(e.target.value)}
                placeholder="Explica por qué rechazas este permiso..."
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              />
              <div className="mt-6 flex justify-end gap-4">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setMotivoRechazo('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRechazar}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Confirmar Rechazo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AprobadorPermisos;
