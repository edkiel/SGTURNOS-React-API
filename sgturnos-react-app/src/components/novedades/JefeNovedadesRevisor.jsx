import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../api';
import Toast from '../common/Toast';

/**
 * Componente para que el Jefe Inmediato apruebe/rechace novedades
 * Evalúa la primacía de la situación (Permisos, Vacaciones, etc.)
 */
const JefeNovedadesRevisor = ({ usuarioId, userName }) => {
  const [novedades, setNovedades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedNovedad, setSelectedNovedad] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState(null); // 'aprobar' o 'rechazar'
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [toastData, setToastData] = useState({ visible: false, message: '', type: 'success' });

  useEffect(() => {
    cargarNovedadesPendientes();
  }, []);

  const cargarNovedadesPendientes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/novedades/pendientes-jefe`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setNovedades(response.data);
    } catch (err) {
      console.error('Error cargando novedades:', err);
      setToastData({ visible: true, message: 'Error al cargar novedades pendientes', type: 'error' });
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
        `${API_BASE_URL}/novedades/aprobar-jefe/${selectedNovedad.idNovedad}`,
        { idUsuarioJefe: usuarioId },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setToastData({ visible: true, message: `Solicitud #${selectedNovedad.idNovedad} aprobada por Jefe Inmediato`, type: 'success' });
      setShowModal(false);
      setSelectedNovedad(null);
      cargarNovedadesPendientes();
    } catch (err) {
      console.error('Error aprobando novedad:', err);
      setToastData({ visible: true, message: err.response?.data?.error || 'Error al aprobar novedad', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRechazar = async () => {
    if (!selectedNovedad || !motivoRechazo.trim()) {
      setToastData({ visible: true, message: 'Proporciona un motivo de rechazo', type: 'error' });
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
          nivel: 'Jefe Inmediato'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setToastData({ visible: true, message: `Solicitud #${selectedNovedad.idNovedad} rechazada por Jefe Inmediato`, type: 'success' });
      setShowModal(false);
      setSelectedNovedad(null);
      setMotivoRechazo('');
      cargarNovedadesPendientes();
    } catch (err) {
      console.error('Error rechazando novedad:', err);
      setToastData({ visible: true, message: err.response?.data?.error || 'Error al rechazar novedad', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const openModal = (novedad, action) => {
    setSelectedNovedad(novedad);
    setActionType(action);
    setShowModal(true);
    setMotivoRechazo('');
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedNovedad(null);
    setActionType(null);
    setMotivoRechazo('');
  };

  return (
    <div className="w-full mx-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-screen" style={{ maxWidth: '1400px' }}>
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            📋 Aprobación de Novedades - Jefe Inmediato
          </h1>
          <p className="text-gray-600">
            Revisor: {userName} | Evalúa la primacía de las situaciones reportadas
          </p>
        </div>

        {/* Lista de novedades */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-indigo-500"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {novedad.tipo?.nombre || 'Novedad'}
                      </h3>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                        Pendiente Aprobación
                      </span>
                    </div>
                    <p className="text-gray-600">
                      <span className="font-semibold">Empleado:</span> {novedad.usuario?.primerNombre} {novedad.usuario?.primerApellido}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Período:</span> {novedad.fechaInicio} al {novedad.fechaFin}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Solicitado:</span> {new Date(novedad.fechaSolicitud).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded p-4 mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Descripción:</p>
                  <p className="text-gray-700">{novedad.descripcion}</p>
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
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    ✅ Aprobar
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

              {actionType === 'rechazar' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motivo del Rechazo *
                  </label>
                  <textarea
                    value={motivoRechazo}
                    onChange={(e) => setMotivoRechazo(e.target.value)}
                    placeholder="Explica por qué rechazas esta novedad..."
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
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                  disabled={loading}
                >
                  {loading ? 'Procesando...' : actionType === 'aprobar' ? 'Confirmar Aprobación' : 'Confirmar Rechazo'}
                </button>
              </div>
            </div>
          </div>
        )}

      <Toast
        message={toastData.message}
        type={toastData.type}
        isVisible={toastData.visible}
        onClose={() => setToastData({ ...toastData, visible: false })}
        centered={true}
      />
    </div>
  );
};

export default JefeNovedadesRevisor;
