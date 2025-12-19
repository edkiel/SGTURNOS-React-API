import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../api';

/**
 * Componente para que los compañeros aprueben o rechacen cambios de turno
 */
const CompaneroAprobador = ({ usuarioId, userName }) => {
  const [solicitudesPendientes, setSolicitudesPendientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState('');

  useEffect(() => {
    cargarSolicitudesPendientes();
  }, [usuarioId]);

  const cargarSolicitudesPendientes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/cambios-turno/pendientes-compañero/${usuarioId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSolicitudesPendientes(response.data);
    } catch (err) {
      console.error('Error cargando solicitudes:', err);
      setError('Error al cargar solicitudes pendientes');
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async (idCambio) => {
    if (!confirm('¿Confirmas que aceptas este cambio de turno?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/cambios-turno/aprobar-compañero/${idCambio}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Cambio aprobado. Pasa a revisión administrativa.');
      cargarSolicitudesPendientes();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al aprobar');
    }
  };

  const handleRechazar = async () => {
    if (!selectedSolicitud) return;

    if (!motivoRechazo.trim()) {
      setError('Debes indicar el motivo del rechazo');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/cambios-turno/rechazar-compañero/${selectedSolicitud.idCambio}`,
        { motivo: motivoRechazo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Cambio rechazado');
      setShowModal(false);
      setMotivoRechazo('');
      setSelectedSolicitud(null);
      cargarSolicitudesPendientes();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al rechazar');
    }
  };

  const abrirModalRechazo = (solicitud) => {
    setSelectedSolicitud(solicitud);
    setShowModal(true);
    setError('');
  };

  return (
    <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Solicitudes de Cambio de Turno</h1>
          <p className="text-gray-600 mt-1">Compañero: {userName}</p>
          <p className="text-sm text-orange-700 mt-2">📋 Revisa y aprueba/rechaza cambios solicitados por tus compañeros</p>
        </div>

        {error && <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg flex items-center gap-2"><span>⚠️</span><span>{error}</span><button onClick={() => setError('')} className="ml-auto">✖</button></div>}
        {success && <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg flex items-center gap-2"><span>✓</span><span>{success}</span><button onClick={() => setSuccess('')} className="ml-auto">✖</button></div>}

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div><p className="text-gray-600 mt-2">Cargando...</p></div>
          ) : solicitudesPendientes.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center border shadow"><p className="text-gray-500">✓ No hay solicitudes pendientes de tu aprobación</p></div>
          ) : (
            solicitudesPendientes.map(s => (
              <div key={s.idCambio} className="bg-white shadow-lg rounded-lg p-6 border-l-4 border-orange-500 hover:shadow-xl transition">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="mb-3"><p className="text-xs font-medium text-gray-500 uppercase">Solicitado por</p><p className="text-lg text-gray-800 font-semibold">{s.usuarioSolicitante?.primerNombre} {s.usuarioSolicitante?.primerApellido}</p><p className="text-xs text-gray-600">{s.usuarioSolicitante?.email}</p></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">Fecha solicitante</p>
                        <p className="text-lg text-orange-700 font-bold">{s.fechaTurno}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">Tu fecha</p>
                        <p className="text-lg text-orange-700 font-bold">{s.fechaTurnoCompañero || '-'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-gray-500 uppercase mb-2">Fecha solicitud</p>
                    <p className="text-gray-600 text-sm">{new Date(s.fechaSolicitud).toLocaleString('es-ES')}</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded mb-4"><p className="text-sm font-medium text-gray-700 mb-2">Motivo:</p><p className="text-gray-800">{s.descripcion}</p></div>
                <div className="bg-orange-50 border border-orange-200 rounded p-3 mb-4 text-sm text-orange-800"><b>¡Importante!</b> Si aceptas, el cambio pasará a revisión administrativa (Jefe → Operaciones → RRHH)</div>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => abrirModalRechazo(s)} className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold shadow-md transition">✖ Rechazar</button>
                  <button onClick={() => handleAprobar(s.idCambio)} className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow-md transition">✓ Aprobar</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Rechazar Solicitud</h3>
            <p className="text-gray-600 mb-4">Solicitante: <b>{selectedSolicitud?.usuarioSolicitante?.primerNombre} {selectedSolicitud?.usuarioSolicitante?.primerApellido}</b></p>
            <label className="block text-sm font-medium text-gray-700 mb-2">Motivo del rechazo</label>
            <textarea value={motivoRechazo} onChange={(e) => setMotivoRechazo(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-none" rows="4" required />
            <div className="flex gap-3 justify-end mt-4">
              <button onClick={() => { setShowModal(false); setMotivoRechazo(''); setError(''); }} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={handleRechazar} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md">Confirmar Rechazo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompaneroAprobador;
