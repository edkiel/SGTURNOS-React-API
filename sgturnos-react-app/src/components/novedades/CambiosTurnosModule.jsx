import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../api';
import Toast from '../common/Toast';

/**
 * Componente para gestionar solicitudes de cambio de turno
 * Permite a los usuarios solicitar cambios de turno con compañeros del mismo rol
 * Requiere aprobación del compañero y administradores (Jefe, Operaciones, RRHH)
 */
const CambiosTurnosModule = ({ usuarioId, userName, userRole = '', openCreateSignal, isAdmin = false }) => {
  const [cambios, setCambios] = useState([]);
  const [compañerosDisponibles, setCompañerosDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedCambio, setSelectedCambio] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [filter, setFilter] = useState('todas');
  const [approvingId, setApprovingId] = useState(null);

  const [form, setForm] = useState({
    fechaTurno: '',
    fechaTurnoCompañero: '',
    descripcion: '',
    idUsuarioCompañero: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [toastData, setToastData] = useState({ visible: false, message: '', type: 'success' });

  useEffect(() => {
    cargarCambios();
    cargarCompañeros();
  }, [usuarioId, isAdmin]);

  // Abrir formulario cuando se solicita crear desde el selector
  useEffect(() => {
    if (openCreateSignal) {
      setShowForm(true);
    }
  }, [openCreateSignal]);

  const showToast = (message, type = 'success') => {
    setToastData({ visible: true, message, type });
  };

  const cargarCambios = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (isAdmin) {
        // Admin: cargar todos los cambios de turno
        const response = await axios.get(
          `${API_BASE_URL}/cambios-turno/todos`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCambios(response.data?.filter(c => c) || []);
      } else {
        // Usuario regular: solo sus cambios
        // Traer cambios donde soy SOLICITANTE
        const responseSolicitante = await axios.get(
          `${API_BASE_URL}/cambios-turno/usuario/${usuarioId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Traer cambios donde soy COMPAÑERO
        const responseCompañero = await axios.get(
          `${API_BASE_URL}/cambios-turno/compañero/${usuarioId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Combinar ambas listas sin duplicados
        const todosCambios = [...(responseSolicitante.data || []), ...(responseCompañero.data || [])];
        
        // Eliminar duplicados por ID si existieran
        const cambiosUnicos = todosCambios.filter((cambio, index, self) =>
          index === self.findIndex((c) => c?.idCambio === cambio?.idCambio)
        );
        
        setCambios(cambiosUnicos);
      }
      setToastData({ visible: false, message: '', type: 'success' });
    } catch (err) {
      console.error('Error cargando cambios:', err);
      showToast(err.response?.data?.message || 'Error al cargar los cambios de turno', 'error');
      setCambios([]);
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
      setCompañerosDisponibles(response.data?.filter(c => c) || []);
    } catch (err) {
      console.error('Error cargando compañeros:', err);
      showToast(err.response?.data?.message || 'Error al cargar compañeros', 'error');
      setCompañerosDisponibles([]);
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

      showToast('✓ Solicitud creada. Pendiente de aprobación del compañero.', 'success');
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

  const handleAprobarCompañero = (idCambio) => {
    const cambio = cambios.find(c => c.idCambio === idCambio);
    setSelectedCambio(cambio);
    setApprovingId(idCambio);
    setShowApproveModal(true);
  };

  const confirmarAprobarCompañero = async () => {
    if (!approvingId) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/cambios-turno/aprobar-compañero/${approvingId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast('✓ Cambio aprobado. Pasa a revisión administrativa.', 'success');
      setShowApproveModal(false);
      setApprovingId(null);
      cargarCambios();
    } catch (err) {
      showToast(err.response?.data?.error || 'Error al aprobar', 'error');
    } finally {
      setLoading(false);
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
    <div className="w-full mx-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-purple-50 to-indigo-50 min-h-screen" style={{ maxWidth: '1400px' }}>
      <div className="w-full">
        <div className="w-full min-h-[150px] sm:min-h-[180px] bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 rounded-2xl shadow-2xl mb-4 sm:mb-6 overflow-hidden">
          <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v6h6M20 20v-6h-6M5 19l14-14" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white">Cambios de Turno</h1>
                  <p className="text-purple-100 text-sm mt-1">Coordinación de intercambios con aprobación multirrol</p>
                  <p className="text-purple-100 text-xs">Flujo: Compañero → Jefe Inmediato → Operaciones Clínicas → Recursos Humanos</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2 shadow-lg">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <div>
                      <p className="text-xs text-purple-200 font-medium">USUARIO</p>
                      <p className="text-sm font-semibold text-white">{userName || 'Usuario'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2 shadow-lg">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    <div>
                      <p className="text-xs text-purple-200 font-medium">ROL</p>
                      <p className="text-sm font-semibold text-white">{userRole || 'Sin rol'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-white/20 pt-3 mt-3">
              <p className="text-purple-100 text-sm">
                Gestiona solicitudes, aprobaciones y aplicación en malla de turnos.
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-white/15 text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/20">
                  Pendientes: {cambios.filter(c => c.estado === 'PENDIENTE_COMPAÑERO' || c.estado === 'PENDIENTE_ADMIN').length}
                </span>
                <span className="bg-white/15 text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/20">
                  Total: {cambios.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {error && <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg text-sm sm:text-base flex items-center gap-2"><span>⚠️</span><span>{error}</span></div>}
        {success && <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg text-sm sm:text-base flex items-center gap-2"><span>✓</span><span>{success}</span></div>}

        {/* Botón Toggle Formulario */}
        <div className="mb-4 sm:mb-6 flex justify-end">
          <button
            onClick={() => setShowForm(!showForm)}
            className={`px-4 sm:px-6 py-2 text-sm sm:text-base rounded-lg font-semibold transition-colors ${
              showForm
                ? 'bg-gray-300 hover:bg-gray-400 text-gray-800'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {showForm ? '✕ Cancelar' : '+ Solicitar Cambio'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white shadow-xl rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 border-l-4 border-purple-600">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">Nueva Solicitud de Cambio de Turno</h2>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Tu fecha de turno (a entregar)</label>
                  <input type="date" name="fechaTurno" value={form.fechaTurno} onChange={handleInputChange} className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" required />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Fecha del compañero (a recibir)</label>
                  <input type="date" name="fechaTurnoCompañero" value={form.fechaTurnoCompañero} onChange={handleInputChange} className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" required />
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Compañero</label>
                <select name="idUsuarioCompañero" value={form.idUsuarioCompañero} onChange={handleInputChange} className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" required>
                  <option value="">Selecciona...</option>
                  {compañerosDisponibles.map(c => <option key={c.idUsuario} value={c.idUsuario}>{c.primerNombre} {c.segundoNombre} {c.primerApellido} {c.segundoApellido} - {c.documento}</option>)}
                </select>
                <p className="text-xs text-gray-500 mt-1">Solo compañeros del mismo rol</p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Motivo</label>
                <textarea name="descripcion" value={form.descripcion} onChange={handleInputChange} className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none" rows="4" required />
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded p-3 sm:p-4 text-xs sm:text-sm text-purple-700">
                <b>Proceso:</b> 1) Compañero aprueba → 2) Jefe → 3) Operaciones → 4) RRHH → 5) Malla se actualiza
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 sm:px-6 py-2 text-sm sm:text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-md">Enviar</button>
              </div>
            </form>
          </div>
        )}

        <div className="flex gap-2 mb-4 sm:mb-6 flex-wrap">
          {['todas', 'pendientes', 'aprobadas', 'rechazadas'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg font-medium ${filter === f ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-gray-700 border hover:bg-gray-50'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="w-full space-y-4">
          {loading ? (
            <div className="text-center py-8"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div><p className="text-gray-600 mt-2">Cargando...</p></div>
          ) : cambiosFiltrados.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center border shadow"><p className="text-gray-500">No hay solicitudes</p></div>
          ) : (
            cambiosFiltrados.map(c => (
              <div key={c.idCambio} className="w-full bg-white shadow-md rounded-lg p-6 border-l-4 border-purple-400 hover:shadow-lg transition">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="md:col-span-2">
                    <div className="mb-3"><p className="text-xs font-medium text-gray-500 uppercase">Solicitante</p><p className="text-sm text-gray-800 font-semibold">{c.usuarioSolicitante?.primerNombre} {c.usuarioSolicitante?.segundoNombre} {c.usuarioSolicitante?.primerApellido} {c.usuarioSolicitante?.segundoApellido}</p></div>
                    <div className="mb-3"><p className="text-xs font-medium text-gray-500 uppercase">Compañero</p><p className="text-sm text-gray-800 font-semibold">{c.usuarioCompañero?.primerNombre} {c.usuarioCompañero?.segundoNombre} {c.usuarioCompañero?.primerApellido} {c.usuarioCompañero?.segundoApellido}</p></div>
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
              <p className="text-gray-700"><span className="font-semibold">Compañero:</span> {compañerosDisponibles.find(c => String(c.idUsuario) === String(form.idUsuarioCompañero))?.primerNombre} {compañerosDisponibles.find(c => String(c.idUsuario) === String(form.idUsuarioCompañero))?.segundoNombre} {compañerosDisponibles.find(c => String(c.idUsuario) === String(form.idUsuarioCompañero))?.primerApellido} {compañerosDisponibles.find(c => String(c.idUsuario) === String(form.idUsuarioCompañero))?.segundoApellido}</p>
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
          <p className="text-gray-600 mb-4">Solicitante: <b>{selectedCambio?.usuarioSolicitante?.primerNombre} {selectedCambio?.usuarioSolicitante?.segundoNombre} {selectedCambio?.usuarioSolicitante?.primerApellido} {selectedCambio?.usuarioSolicitante?.segundoApellido}</b></p>
          <label className="block text-sm font-medium text-gray-700 mb-2">Motivo del rechazo</label>
          <textarea value={motivoRechazo} onChange={(e) => setMotivoRechazo(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-none" rows="4" required placeholder="Explica el motivo del rechazo..." />
          <div className="flex gap-3 justify-end mt-4">
            <button onClick={() => { setShowRejectModal(false); setMotivoRechazo(''); setError(''); }} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancelar</button>
            <button onClick={handleRechazarCompañero} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md">Confirmar Rechazo</button>
          </div>
        </div>
      </div>
    )}

    {showApproveModal && selectedCambio && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">✓</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">Confirmar Aprobación</h3>
          </div>
          
          <div className="space-y-4 mb-6">
            <p className="text-gray-600">¿Confirmas que aceptas este cambio de turno?</p>
            
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Tu Turno</p>
                  <p className="text-lg font-bold text-gray-800">{selectedCambio.fechaTurno}</p>
                  <p className="text-sm text-gray-600 mt-1">{selectedCambio.usuarioSolicitante?.primerNombre} {selectedCambio.usuarioSolicitante?.segundoNombre} {selectedCambio.usuarioSolicitante?.primerApellido} {selectedCambio.usuarioSolicitante?.segundoApellido}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Turno del Compañero</p>
                  <p className="text-lg font-bold text-gray-800">{selectedCambio.fechaTurnoCompañero || '-'}</p>
                  <p className="text-sm text-gray-600 mt-1">{selectedCambio.usuarioCompañero?.primerNombre} {selectedCambio.usuarioCompañero?.segundoNombre} {selectedCambio.usuarioCompañero?.primerApellido} {selectedCambio.usuarioCompañero?.segundoApellido}</p>
                </div>
              </div>
              
              {selectedCambio.descripcion && (
                <div className="bg-white p-3 rounded border border-gray-200">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Motivo</p>
                  <p className="text-sm text-gray-700">{selectedCambio.descripcion}</p>
                </div>
              )}
              
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-xs font-semibold text-blue-800">
                  📋 Después de tu aprobación, se enviará a revisión de administradores (Jefe, Operaciones y RRHH).
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 justify-end">
            <button 
              onClick={() => { setShowApproveModal(false); setApprovingId(null); }} 
              disabled={loading}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button 
              onClick={confirmarAprobarCompañero} 
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg shadow-md font-medium transition disabled:opacity-50"
            >
              {loading ? 'Procesando...' : '✓ Confirmar Aprobación'}
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
      duration={3500}
    />
    </div>
  );
};

export default CambiosTurnosModule;
