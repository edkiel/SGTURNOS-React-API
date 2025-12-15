import React, { useState, useEffect } from 'react';
import { api } from '../../api';

/**
 * Componente para que Jefe Inmediato revise y apruebe mallas
 */
const JefeInmediatoRevisor = ({ usuarioId }) => {
  const [mallas, setMallas] = useState([]);
  const [selectedMalla, setSelectedMalla] = useState(null);
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState(null); // 'aprobar' o 'rechazar'
  const [motivoRechazo, setMotivoRechazo] = useState('');

  useEffect(() => {
    cargarMallas();
  }, []);

  const cargarMallas = async () => {
    try {
      setLoading(true);
      // En una implementación real, traerías las mallas pendientes de aprobación
      // const response = await api.get('/api/mallas/pendientes-aprobacion-jefe');
      // setMallas(response.data);
      
      // Por ahora, mostrar datos de ejemplo
      setMallas([
        {
          id: 1,
          mes: 'Diciembre 2025',
          departamento: 'Medicina General',
          estado: 'PENDIENTE_APROBACION',
          fechaCreacion: '2025-12-01',
          turnosAsignados: 45,
          personalInvolucrado: 8
        },
        {
          id: 2,
          mes: 'Diciembre 2025',
          departamento: 'Cirugía',
          estado: 'PENDIENTE_APROBACION',
          fechaCreacion: '2025-12-01',
          turnosAsignados: 32,
          personalInvolucrado: 6
        }
      ]);
    } catch (err) {
      setError('Error al cargar mallas: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async () => {
    if (!selectedMalla) {
      setError('Selecciona una malla primero');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post(`/api/mallas/aprobaciones/aprobar-jefe/${selectedMalla.id}`, {
        idUsuario: usuarioId,
        comentario: comentario
      });

      setMessage(`✅ Malla aprobada exitosamente. Estado: ${response.data.estado_aprobacion}`);
      setComentario('');
      setShowModal(false);
      setActionType(null);
      
      // Recargar mallas después de la aprobación
      setTimeout(() => cargarMallas(), 2000);
    } catch (err) {
      setError('Error al aprobar malla: ' + err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRechazar = async () => {
    if (!selectedMalla || !motivoRechazo.trim()) {
      setError('Selecciona una malla y proporciona motivo de rechazo');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post(`/api/mallas/aprobaciones/rechazar/${selectedMalla.id}`, {
        idUsuario: usuarioId,
        motivo: motivoRechazo,
        rol: 'Jefe Inmediato'
      });

      setMessage(`❌ Malla rechazada. Motivo: ${motivoRechazo}`);
      setMotivoRechazo('');
      setShowModal(false);
      setActionType(null);
      
      setTimeout(() => cargarMallas(), 2000);
    } catch (err) {
      setError('Error al rechazar malla: ' + err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'PENDIENTE_APROBACION':
        return 'bg-yellow-100 text-yellow-800';
      case 'APROBADA_JEFE':
        return 'bg-green-100 text-green-800';
      case 'RECHAZADA':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-600 p-6 rounded-lg">
        <h2 className="text-2xl font-bold text-blue-900 mb-2">Revisión de Mallas - Jefe Inmediato</h2>
        <p className="text-blue-700">Revisa y aprueba las mallas creadas por Operaciones Clínicas</p>
        <p className="text-sm text-blue-600 mt-2">⚠️ Nota: Solo puedes revisar y aprobar. La publicación corresponde a Operaciones Clínicas después de ambas aprobaciones.</p>
      </div>

      {/* Mensajes */}
      {message && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Lista de mallas pendientes */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-blue-600 text-white px-6 py-4">
          <h3 className="text-lg font-semibold">Mallas Pendientes de Aprobación</h3>
        </div>

        {loading && !mallas.length ? (
          <div className="p-6 text-center">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
            <p className="mt-2 text-gray-600">Cargando mallas...</p>
          </div>
        ) : mallas.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>No hay mallas pendientes de aprobación</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Mes</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Departamento</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Estado</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Turnos</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Personal</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mallas.map(malla => (
                  <tr key={malla.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{malla.mes}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{malla.departamento}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getEstadoColor(malla.estado)}`}>
                        {malla.estado === 'PENDIENTE_APROBACION' ? 'Pendiente' : malla.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{malla.turnosAsignados}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{malla.personalInvolucrado} personas</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedMalla(malla)}
                        className="text-blue-600 hover:text-blue-900 text-sm font-semibold"
                      >
                        Revisar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Panel de detalles de malla seleccionada */}
      {selectedMalla && (
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800">{selectedMalla.mes} - {selectedMalla.departamento}</h3>
              <p className="text-sm text-gray-600 mt-1">Creada: {selectedMalla.fechaCreacion}</p>
            </div>
            <button
              onClick={() => setSelectedMalla(null)}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Turnos Asignados</p>
              <p className="text-2xl font-bold text-gray-800">{selectedMalla.turnosAsignados}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Personal Involucrado</p>
              <p className="text-2xl font-bold text-gray-800">{selectedMalla.personalInvolucrado}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Estado Actual</p>
              <p className={`text-sm font-semibold ${getEstadoColor(selectedMalla.estado)}`}>
                {selectedMalla.estado}
              </p>
            </div>
          </div>

          {/* Área de comentarios */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Comentarios o Notas de Revisión
            </label>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Agrega tus observaciones sobre la malla..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              rows="4"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setActionType('aprobar');
                setShowModal(true);
              }}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition"
            >
              ✅ Aprobar Malla
            </button>
            <button
              onClick={() => {
                setActionType('rechazar');
                setShowModal(true);
              }}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition"
            >
              ❌ Rechazar Malla
            </button>
          </div>
        </div>
      )}

      {/* Modal de confirmación */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className={`p-6 ${actionType === 'aprobar' ? 'bg-green-50' : 'bg-red-50'}`}>
              <h3 className={`text-xl font-bold mb-4 ${actionType === 'aprobar' ? 'text-green-900' : 'text-red-900'}`}>
                {actionType === 'aprobar' ? '¿Aprobar esta malla?' : '¿Rechazar esta malla?'}
              </h3>

              {actionType === 'rechazar' && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Motivo del rechazo *
                  </label>
                  <textarea
                    value={motivoRechazo}
                    onChange={(e) => setMotivoRechazo(e.target.value)}
                    placeholder="Explica por qué rechazas esta malla..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                    rows="3"
                  />
                </div>
              )}

              {actionType === 'aprobar' && comentario && (
                <div className="mb-4 p-3 bg-white rounded border border-gray-200">
                  <p className="text-sm text-gray-700"><strong>Comentarios:</strong> {comentario}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setComentario('');
                    setMotivoRechazo('');
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={actionType === 'aprobar' ? handleAprobar : handleRechazar}
                  disabled={loading || (actionType === 'rechazar' && !motivoRechazo.trim())}
                  className={`flex-1 text-white font-semibold py-2 px-4 rounded-lg transition ${
                    actionType === 'aprobar'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? 'Procesando...' : (actionType === 'aprobar' ? 'Confirmar Aprobación' : 'Confirmar Rechazo')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JefeInmediatoRevisor;
