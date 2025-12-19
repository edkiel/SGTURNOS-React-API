import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../api';

/**
 * Componente para que Operaciones Clínicas apruebe/rechace novedades
 * Evalúa cobertura en la malla y genera alertas para recalcular
 */
const OperacionesNovedadesRevisor = ({ usuarioId, userName }) => {
  const [novedades, setNovedades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedNovedad, setSelectedNovedad] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState(null); // 'aprobar' o 'rechazar'
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    cargarNovedadesPendientes();
  }, []);

  const cargarNovedadesPendientes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/novedades/pendientes-operaciones`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setNovedades(response.data);
    } catch (err) {
      console.error('Error cargando novedades:', err);
      setError('Error al cargar novedades pendientes');
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async () => {
    if (!selectedNovedad) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/novedades/aprobar-operaciones/${selectedNovedad.idNovedad}`,
        { idUsuarioOperaciones: usuarioId },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuccess('✅ Novedad aprobada por Operaciones Clínicas. Se generó alerta para recalcular malla.');
      setShowModal(false);
      setSelectedNovedad(null);
      cargarNovedadesPendientes();
    } catch (err) {
      console.error('Error aprobando novedad:', err);
      setError(err.response?.data?.error || 'Error al aprobar novedad');
    } finally {
      setLoading(false);
    }
  };

  const handleRechazar = async () => {
    if (!selectedNovedad || !motivoRechazo.trim()) {
      setError('Proporciona un motivo de rechazo');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/novedades/rechazar-nivel/${selectedNovedad.idNovedad}`,
        {
          idUsuario: usuarioId,
          motivo: motivoRechazo,
          nivel: 'Operaciones Clínicas'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuccess('Novedad rechazada por Operaciones Clínicas');
      setShowModal(false);
      setSelectedNovedad(null);
      setMotivoRechazo('');
      cargarNovedadesPendientes();
    } catch (err) {
      console.error('Error rechazando novedad:', err);
      setError(err.response?.data?.error || 'Error al rechazar novedad');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (novedad, action) => {
    setSelectedNovedad(novedad);
    setActionType(action);
    setShowModal(true);
    setError('');
    setMotivoRechazo('');
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedNovedad(null);
    setActionType(null);
    setMotivoRechazo('');
  };

  return (
    <div className="w-full mx-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-cyan-50 to-blue-50 min-h-screen" style={{ maxWidth: '1400px' }}>
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🏥 Aprobación de Novedades - Operaciones Clínicas
          </h1>
          <p className="text-gray-600">
            Revisor: {userName} | Evalúa cobertura en malla y genera alertas de recalculación
          </p>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg">
            {error}
            <button onClick={() => setError('')} className="float-right text-red-600 hover:text-red-800 font-bold">✕</button>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg">
            {success}
            <button onClick={() => setSuccess('')} className="float-right text-green-600 hover:text-green-800 font-bold">✕</button>
          </div>
        )}

        {/* Información importante */}
        <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-6">
          <p className="text-blue-800">
            <span className="font-semibold">⚠️ Importante:</span> Al aprobar una novedad, se generará automáticamente una alerta para que el equipo de programación recalcule la malla y cubra el espacio necesario.
          </p>
        </div>

        {/* Lista de novedades */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
            <p className="text-gray-600 mt-4">Cargando novedades...</p>
          </div>
        ) : novedades.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center shadow">
            <p className="text-gray-500 text-lg">No hay novedades pendientes de tu aprobación</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {novedades.map((novedad) => (
              <div
                key={novedad.idNovedad}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-cyan-500"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {novedad.tipo?.nombre || 'Novedad'}
                      </h3>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                        ✓ Aprobado por Jefe
                      </span>
                    </div>
                    <p className="text-gray-600">
                      <span className="font-semibold">Empleado:</span> {novedad.usuario?.primerNombre} {novedad.usuario?.primerApellido}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Rol:</span> {novedad.usuario?.rol?.rol}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Período:</span> {novedad.fechaInicio} al {novedad.fechaFin}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded p-4 mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Descripción:</p>
                  <p className="text-gray-700">{novedad.descripcion}</p>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded p-3 mb-4">
                  <p className="text-sm text-orange-700">
                    <span className="font-semibold">🔔 Acción:</span> Al aprobar, se generará una alerta para recalcular la malla y cubrir este espacio.
                  </p>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => openModal(novedad, 'rechazar')}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    ❌ Rechazar
                  </button>
                  <button
                    onClick={() => openModal(novedad, 'aprobar')}
                    className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    ✅ Aprobar y Generar Alerta
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de confirmación */}
        {showModal && selectedNovedad && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                {actionType === 'aprobar' ? '✅ Aprobar Novedad' : '❌ Rechazar Novedad'}
              </h3>

              <div className="bg-gray-50 rounded p-4 mb-4">
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-semibold">Tipo:</span> {selectedNovedad.tipo?.nombre}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-semibold">Empleado:</span> {selectedNovedad.usuario?.primerNombre} {selectedNovedad.usuario?.primerApellido}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Período:</span> {selectedNovedad.fechaInicio} al {selectedNovedad.fechaFin}
                </p>
              </div>

              {actionType === 'aprobar' && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                  <p className="text-sm text-blue-700">
                    <span className="font-semibold">🔔 Alerta automática:</span> Se generará una alerta para recalcular la malla y cubrir este espacio.
                  </p>
                </div>
              )}

              {actionType === 'rechazar' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motivo del Rechazo *
                  </label>
                  <textarea
                    value={motivoRechazo}
                    onChange={(e) => setMotivoRechazo(e.target.value)}
                    placeholder="Explica por qué no es posible cubrir este espacio en la malla..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    rows="4"
                    required
                  />
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  onClick={actionType === 'aprobar' ? handleAprobar : handleRechazar}
                  className={`px-6 py-2 text-white rounded-lg font-semibold transition-colors ${
                    actionType === 'aprobar'
                      ? 'bg-cyan-600 hover:bg-cyan-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                  disabled={loading}
                >
                  {loading ? 'Procesando...' : actionType === 'aprobar' ? 'Confirmar y Generar Alerta' : 'Confirmar Rechazo'}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default OperacionesNovedadesRevisor;
