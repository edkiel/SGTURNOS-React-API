import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../api';

/**
 * Componente para gestionar solicitudes de cambio de turno
 * Permite a los usuarios solicitar cambios de turno con compañeros del mismo rol
 * Requiere aprobación del compañero y administradores (Jefe, Operaciones, RRHH)
 */
const CambiosTurnosModule = ({ usuarioId, userName }) => {
  const [cambios, setCambios] = useState([]);
  const [compañerosDisponibles, setCompañerosDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedCambio, setSelectedCambio] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [filter, setFilter] = useState('todas');

  const [form, setForm] = useState({
    fechaTurno: '',
    fechaTurnoCompañero: '',
    descripcion: '',
    idUsuarioCompañero: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    cargarCambios();
    cargarCompañeros();
  }, [usuarioId]);

  const cargarCambios = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/cambios-turno/usuario/${usuarioId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCambios(response.data);
    } catch (err) {
      console.error('Error cargando cambios:', err);
      setError('Error al cargar los cambios de turno');
    } finally {
      setLoading(false);
    }
  };

  const cargarCompañeros = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/cambios-turno/compañeros/${usuarioId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCompañerosDisponibles(response.data);
    } catch (err) {
      console.error('Error cargando compañeros:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const doSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/cambios-turno/crear`,
        {
          idUsuarioSolicitante: usuarioId,
          idUsuarioCompañero: parseInt(form.idUsuarioCompañero),
          fechaTurno: form.fechaTurno,
          fechaTurnoCompañero: form.fechaTurnoCompañero,
          descripcion: form.descripcion
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('Solicitud creada. Pendiente de aprobación del compañero.');
      setForm({ fechaTurno: '', fechaTurnoCompañero: '', descripcion: '', idUsuarioCompañero: '' });
      setShowForm(false);
      setShowConfirm(false);
      cargarCambios();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear la solicitud');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.fechaTurno || !form.fechaTurnoCompañero || !form.idUsuarioCompañero || !form.descripcion.trim()) {
      setError('Todos los campos son requeridos');
      return;
    }

    // Validaciones de fechas: no pasado y no iguales
    const toDate = (s) => { const d = new Date(s + 'T00:00:00'); d.setHours(0,0,0,0); return d; };
    const today = new Date(); today.setHours(0,0,0,0);
    const f1 = toDate(form.fechaTurno);
    const f2 = toDate(form.fechaTurnoCompañero);

    if (f1 < today || f2 < today) {
      setError('No se permiten fechas en el pasado');
      return;
    }
    if (f1.getTime() === f2.getTime()) {
      setError('Las dos fechas no pueden ser iguales');
      return;
    }

    // Abrir confirmación resumen del intercambio
    setShowConfirm(true);
  };

  const handleAprobarCompañero = async (idCambio) => {
    if (!confirm('¿Confirmas que aceptas este cambio de turno?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/cambios-turno/aprobar-compañero/${idCambio}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Cambio aprobado. Pasa a revisión administrativa.');
      cargarCambios();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al aprobar');
    }
  };

  const handleRechazarCompañero = async () => {
    if (!selectedCambio) return;

    if (!motivoRechazo.trim()) {
      setError('Debes indicar el motivo del rechazo');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/cambios-turno/rechazar-compañero/${selectedCambio.idCambio}`,
        { motivo: motivoRechazo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Cambio rechazado');
      setShowRejectModal(false);
      setMotivoRechazo('');
      setSelectedCambio(null);
      cargarCambios();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al rechazar');
    }
  };

  const abrirModalRechazo = (cambio) => {
    setSelectedCambio(cambio);
    setShowRejectModal(true);
    setError('');
  };

  const obtenerEstadoColor = (estado) => {
    const colores = {
      'APROBADA': 'bg-green-100 text-green-800 border-green-300',
      'RECHAZADA': 'bg-red-100 text-red-800 border-red-300',
      'PENDIENTE_COMPAÑERO': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'PENDIENTE_ADMIN': 'bg-blue-100 text-blue-800 border-blue-300'
    };
    return colores[estado] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const obtenerEstadoTexto = (cambio) => {
    if (cambio.estado === 'RECHAZADA') return 'RECHAZADA';
    if (cambio.estado === 'APROBADA') {
      return cambio.aplicadaAMalla ? 'APROBADA Y APLICADA' : 'APROBADA - Pendiente aplicar';
    }
    if (cambio.estado === 'PENDIENTE_COMPAÑERO') return 'PENDIENTE COMPAÑERO';
    if (cambio.estado === 'PENDIENTE_ADMIN') {
      if (!cambio.aprobacionJefe) return 'PENDIENTE JEFE';
      if (!cambio.aprobacionOperaciones) return 'PENDIENTE OPERACIONES';
      if (!cambio.aprobacionRrhh) return 'PENDIENTE RRHH';
    }
    return cambio.estado;
  };

  const cambiosFiltrados = cambios.filter(c => {
    if (filter === 'todas') return true;
    if (filter === 'pendientes') return c.estado?.includes('PENDIENTE');
    if (filter === 'aprobadas') return c.estado === 'APROBADA';
    if (filter === 'rechazadas') return c.estado === 'RECHAZADA';
    return true;
  });

  return (
    <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Cambios de Turno</h1>
            <p className="text-gray-600 mt-1">Usuario: {userName}</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-md"
          >
            {showForm ? '✖ Cancelar' : '➕ Solicitar Cambio'}
          </button>
        </div>

        {error && <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg flex items-center gap-2"><span>⚠️</span><span>{error}</span></div>}
        {success && <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg flex items-center gap-2"><span>✓</span><span>{success}</span></div>}

        {showForm && (
          <div className="bg-white shadow-xl rounded-lg p-6 mb-8 border-l-4 border-purple-600">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Nueva Solicitud de Cambio de Turno</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tu fecha de turno (a entregar)</label>
                  <input type="date" name="fechaTurno" value={form.fechaTurno} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha del compañero (a recibir)</label>
                  <input type="date" name="fechaTurnoCompañero" value={form.fechaTurnoCompañero} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Compañero</label>
                <select name="idUsuarioCompañero" value={form.idUsuarioCompañero} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" required>
                  <option value="">Selecciona...</option>
                  {compañerosDisponibles.map(c => <option key={c.idUsuario} value={c.idUsuario}>{c.primerNombre} {c.primerApellido} - {c.documento}</option>)}
                </select>
                <p className="text-xs text-gray-500 mt-1">Solo compañeros del mismo rol</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Motivo</label>
                <textarea name="descripcion" value={form.descripcion} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none" rows="4" required />
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded p-4 text-sm text-purple-700">
                <b>Proceso:</b> 1) Compañero aprueba → 2) Jefe → 3) Operaciones → 4) RRHH → 5) Malla se actualiza
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-md">Enviar</button>
              </div>
            </form>
          </div>
        )}

        <div className="flex gap-2 mb-6 flex-wrap">
          {['todas', 'pendientes', 'aprobadas', 'rechazadas'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg font-medium ${filter === f ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-gray-700 border hover:bg-gray-50'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div><p className="text-gray-600 mt-2">Cargando...</p></div>
          ) : cambiosFiltrados.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center border shadow"><p className="text-gray-500">No hay solicitudes</p></div>
          ) : (
            cambiosFiltrados.map(c => (
              <div key={c.idCambio} className="bg-white shadow-md rounded-lg p-6 border-l-4 border-purple-400 hover:shadow-lg transition">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="md:col-span-2">
                    <div className="mb-3"><p className="text-xs font-medium text-gray-500 uppercase">Solicitante</p><p className="text-sm text-gray-800 font-semibold">{c.usuarioSolicitante?.primerNombre} {c.usuarioSolicitante?.primerApellido}</p></div>
                    <div className="mb-3"><p className="text-xs font-medium text-gray-500 uppercase">Compañero</p><p className="text-sm text-gray-800 font-semibold">{c.usuarioCompañero?.primerNombre} {c.usuarioCompañero?.primerApellido}</p></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">Tu fecha</p>
                        <p className="text-sm text-gray-800 font-semibold">{c.fechaTurno}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">Fecha compañero</p>
                        <p className="text-sm text-gray-800 font-semibold">{c.fechaTurnoCompañero || '-'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-gray-500 uppercase mb-2">Estado</p>
                    <span className={`inline-block px-3 py-2 rounded-full text-xs font-semibold border ${obtenerEstadoColor(c.estado)}`}>{obtenerEstadoTexto(c)}</span>
                    <p className="text-gray-600 text-xs mt-2">{new Date(c.fechaSolicitud).toLocaleDateString('es-ES')}</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4 bg-gray-50 p-3 rounded">{c.descripcion}</p>
                {c.estado === 'PENDIENTE_ADMIN' && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                    <p className="text-xs font-semibold text-blue-800 mb-2">Progreso:</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={c.aprobacionCompañero ? 'text-green-600' : 'text-gray-400'}>{c.aprobacionCompañero ? '✓' : '○'} Compañero</span> →
                      <span className={c.aprobacionJefe ? 'text-green-600' : 'text-gray-400'}>{c.aprobacionJefe ? '✓' : '○'} Jefe</span> →
                      <span className={c.aprobacionOperaciones ? 'text-green-600' : 'text-gray-400'}>{c.aprobacionOperaciones ? '✓' : '○'} Operaciones</span> →
                      <span className={c.aprobacionRrhh ? 'text-green-600' : 'text-gray-400'}>{c.aprobacionRrhh ? '✓' : '○'} RRHH</span>
                    </div>
                  </div>
                )}
                {c.estado === 'RECHAZADA' && c.motivoRechazo && (
                  <div className="bg-red-50 border border-red-200 rounded p-3 text-sm"><p className="font-semibold text-red-800">Motivo:</p><p className="text-red-700">{c.motivoRechazo}</p></div>
                )}
                {c.estado === 'APROBADA' && (
                  <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
                    <p className="text-green-700 font-semibold">{c.aplicadaAMalla ? '✓ Aprobado y aplicado' : '✓ Aprobado - Pendiente aplicar'}</p>
                    {c.fechaAprobacionFinal && <p className="text-green-600 text-xs mt-1">{new Date(c.fechaAprobacionFinal).toLocaleDateString('es-ES')}</p>}
                  </div>
                )}
                {c.estado === 'PENDIENTE_COMPAÑERO' && c.usuarioCompañero?.idUsuario === usuarioId && (
                  <div className="flex gap-3 justify-end mt-4 pt-4 border-t">
                    <button onClick={() => abrirModalRechazo(c)} className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold shadow-md transition">
                      ✖ Rechazar
                    </button>
                    <button onClick={() => handleAprobarCompañero(c.idCambio)} className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow-md transition">
                      ✓ Aprobar
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    
    {showConfirm && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Confirmar intercambio de turno</h3>
          <div className="space-y-3 text-sm">
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-gray-700"><span className="font-semibold">Solicitante:</span> {userName}</p>
              <p className="text-gray-700"><span className="font-semibold">Tu fecha:</span> {form.fechaTurno}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-gray-700"><span className="font-semibold">Compañero:</span> {compañerosDisponibles.find(c => String(c.idUsuario) === String(form.idUsuarioCompañero))?.primerNombre} {compañerosDisponibles.find(c => String(c.idUsuario) === String(form.idUsuarioCompañero))?.primerApellido}</p>
              <p className="text-gray-700"><span className="font-semibold">Fecha compañero:</span> {form.fechaTurnoCompañero}</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded p-3 text-xs text-purple-800">
              Al confirmar, se enviará la solicitud para que tu compañero apruebe y luego al flujo administrativo.
            </div>
          </div>
          <div className="flex gap-3 justify-end mt-5">
            <button type="button" onClick={() => setShowConfirm(false)} className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancelar</button>
            <button type="button" onClick={doSubmit} className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-md">Confirmar envío</button>
          </div>
        </div>
      </div>
    )}
    
    {showRejectModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Rechazar Solicitud</h3>
          <p className="text-gray-600 mb-4">Solicitante: <b>{selectedCambio?.usuarioSolicitante?.primerNombre} {selectedCambio?.usuarioSolicitante?.primerApellido}</b></p>
          <label className="block text-sm font-medium text-gray-700 mb-2">Motivo del rechazo</label>
          <textarea value={motivoRechazo} onChange={(e) => setMotivoRechazo(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-none" rows="4" required placeholder="Explica el motivo del rechazo..." />
          <div className="flex gap-3 justify-end mt-4">
            <button onClick={() => { setShowRejectModal(false); setMotivoRechazo(''); setError(''); }} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancelar</button>
            <button onClick={handleRechazarCompañero} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md">Confirmar Rechazo</button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
};

export default CambiosTurnosModule;
