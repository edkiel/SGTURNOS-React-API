import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../api';

/**
 * Vista para aprobadores de vacaciones
 * Muestra las solicitudes pendientes según el rol del aprobador
 */
const AprobadorVacaciones = ({ usuarioId, userName, tipoAprobador }) => {
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
        `${API_BASE_URL}/aprobaciones/pendientes/${usuarioId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAprobacionesPendientes(response.data);
    } catch (err) {
      console.error('Error cargando aprobaciones:', err);
      setError('Error al cargar las aprobaciones pendientes');
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

      setSuccess('Vacación aprobada exitosamente');
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

      setSuccess('Vacación rechazada exitosamente');
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
    <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Aprobación de Vacaciones</h1>
          <p className="text-gray-600 mt-1">Aprobador: {userName}</p>
          <p className="text-sm text-purple-600 mt-1">
            Rol: {tipoAprobador ? getTipoAprobadorLabel(tipoAprobador) : 'Múltiple'}
          </p>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg">
            {success}
          </div>
        )}

        {/* Lista de aprobaciones pendientes */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando...</p>
          </div>
        ) : aprobacionesPendientes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">No hay solicitudes pendientes de aprobación</p>
          </div>
        ) : (
          <div className="space-y-4">
            {aprobacionesPendientes.map(aprobacion => (
              <div key={aprobacion.idAprobacion} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-800">
                        Solicitud #{aprobacion.novedad.idNovedad}
                      </h3>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-300">
                        {getTipoAprobadorLabel(aprobacion.tipoAprobador)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mt-4">
                      <div>
                        <span className="font-semibold">Solicitante:</span> {aprobacion.novedad.usuario?.primerNombre} {aprobacion.novedad.usuario?.primerApellido || 'N/A'}
                      </div>
                      <div>
                        <span className="font-semibold">Email:</span> {aprobacion.novedad.usuario?.correo || 'N/A'}
                      </div>
                      <div>
                        <span className="font-semibold">Fecha inicio:</span> {aprobacion.novedad.fechaInicio}
                      </div>
                      <div>
                        <span className="font-semibold">Fecha fin:</span> {aprobacion.novedad.fechaFin}
                      </div>
                      <div className="col-span-2">
                        <span className="font-semibold">Descripción:</span> {aprobacion.novedad.descripcion}
                      </div>
                      <div className="col-span-2">
                        <span className="font-semibold">Fecha de solicitud:</span> {new Date(aprobacion.novedad.fechaSolicitud).toLocaleString()}
                      </div>
                    </div>

                    {/* Estado de otras aprobaciones */}
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-700 mb-2">Estado General de Aprobaciones:</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${aprobacion.novedad.aprobacionJefe ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span>Jefe Inmediato</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${aprobacion.novedad.aprobacionOperaciones ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span>Operaciones</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${aprobacion.novedad.aprobacionRrhh ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span>RRHH</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex flex-col gap-2 ml-6">
                    <button
                      onClick={() => handleAprobar(aprobacion)}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                    >
                      ✓ Aprobar
                    </button>
                    <button
                      onClick={() => abrirModalRechazo(aprobacion)}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
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
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Motivo de Rechazo</h3>
              <textarea
                value={motivoRechazo}
                onChange={(e) => setMotivoRechazo(e.target.value)}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Ingrese el motivo del rechazo..."
              />
              <div className="mt-4 flex justify-end gap-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRechazar}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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

export default AprobadorVacaciones;
