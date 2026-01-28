import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../api';
import Toast from '../common/Toast';

/**
 * Componente para gestionar solicitudes de incapacidades
 * Permite a los usuarios crear solicitudes de incapacidad (médica o licencia)
 * El rol de administrador valida y aprueba/rechaza
 */
const IncapacidadesModule = ({ usuarioId, userName, userRole = '', openCreateSignal, isAdmin = false }) => {
  const [incapacidades, setIncapacidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('todas'); // todas, pendientes, aprobadas, rechazadas

  const [file, setFile] = useState(null); // soporte PDF

  // Formulario
  const [form, setForm] = useState({
    fechaInicio: '',
    fechaFin: '',
    descripcion: '',
    motivoMedico: '' // Detalles del motivo médico
  });

  // Estado para toast notifications
  const [toastData, setToastData] = useState({ visible: false, message: '', type: 'success' });

  // Cargar incapacidades al montar el componente
  useEffect(() => {
    cargarIncapacidades();
  }, [usuarioId, isAdmin]);

  // Abrir formulario cuando se solicita crear desde el selector
  useEffect(() => {
    if (openCreateSignal) {
      setShowForm(true);
    }
  }, [openCreateSignal]);

  const cargarIncapacidades = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      let response;
      
      if (isAdmin) {
        // Admin: cargar todas las incapacidades
        response = await axios.get(
          `${API_BASE_URL}/novedades/todas`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const incapacidadesFiltradas = response.data?.filter(n => n.tipo?.nombre === 'Incapacidades') || [];
        setIncapacidades(incapacidadesFiltradas);
      } else {
        // Usuario regular: solo sus incapacidades
        response = await axios.get(
          `${API_BASE_URL}/novedades/usuario/${usuarioId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const incapacidadesFiltradas = response.data?.filter(n => n.tipo?.nombre === 'Incapacidades') || [];
        setIncapacidades(incapacidadesFiltradas);
      }
      setToastData({ visible: false, message: '', type: 'success' });
    } catch (err) {
      console.error('Error cargando incapacidades:', err);
      setToastData({ 
        visible: true, 
        message: err.response?.data?.message || 'Error al cargar las incapacidades', 
        type: 'error' 
      });
      setIncapacidades([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e) => {
    const selected = e.target.files && e.target.files[0];
    setFile(selected || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setToastData({ visible: false, message: '', type: 'success' });

    // Validar fechas
    if (!form.fechaInicio || !form.fechaFin) {
      setToastData({ visible: true, message: 'Las fechas de inicio y fin son requeridas', type: 'error' });
      return;
    }

    if (new Date(form.fechaInicio) > new Date(form.fechaFin)) {
      setToastData({ visible: true, message: 'La fecha de inicio debe ser anterior a la fecha de fin', type: 'error' });
      return;
    }

    if (form.descripcion.trim().length === 0) {
      setToastData({ visible: true, message: 'La descripción es requerida', type: 'error' });
      return;
    }

    // Requerir soporte en PDF
    if (!file) {
      setToastData({ visible: true, message: 'Debes adjuntar el soporte en PDF para crear la incapacidad', type: 'error' });
      return;
    }

    try {
      const token = localStorage.getItem('token');

      // Crear la solicitud de incapacidad
      const response = await axios.post(
        `${API_BASE_URL}/novedades/crear`,
        {
          idUsuario: usuarioId,
          idTipo: 2, // ID para Incapacidades (ajustar según tu DB)
          fechaInicio: form.fechaInicio,
          fechaFin: form.fechaFin,
          descripcion: form.descripcion
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Subir soporte si se adjuntó
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        await axios.post(
          `${API_BASE_URL}/novedades/${response.data.idNovedad}/soporte`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }

      setToastData({ visible: true, message: 'Solicitud de incapacidad creada exitosamente', type: 'success' });
      setForm({ fechaInicio: '', fechaFin: '', descripcion: '', motivoMedico: '' });
      setFile(null);
      setShowForm(false);

      // Recargar incapacidades
      cargarIncapacidades();
    } catch (err) {
      console.error('Error creando incapacidad:', err);
      setToastData({ visible: true, message: err.response?.data?.error || 'Error al crear la solicitud', type: 'error' });
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

  const incapacidadesFiltradas = incapacidades.filter(i => {
    if (filter === 'todas') return true;
    if (filter === 'pendientes') return i.estado === 'PENDIENTE';
    if (filter === 'aprobadas') return i.estado === 'APROBADA';
    if (filter === 'rechazadas') return i.estado === 'RECHAZADA';
    return true;
  });

  return (
    <div className="w-full mx-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-red-50 to-orange-50 min-h-screen" style={{ maxWidth: '1400px' }}>
      <div className="w-full">
        <div className="w-full min-h-[150px] sm:min-h-[180px] bg-gradient-to-r from-rose-600 via-red-600 to-orange-600 rounded-2xl shadow-2xl mb-4 sm:mb-6 overflow-hidden">
          <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 10h10M7 14h10M5 7h14a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white">Incapacidades</h1>
                  <p className="text-rose-100 text-sm mt-1">Administración y validación de incapacidades</p>
                  <p className="text-rose-100 text-xs">Flujo: Jefe Inmediato → Operaciones Clínicas → Recursos Humanos</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2 shadow-lg">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <div>
                      <p className="text-xs text-rose-200 font-medium">USUARIO</p>
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
                      <p className="text-xs text-rose-200 font-medium">ROL</p>
                      <p className="text-sm font-semibold text-white">{userRole || 'Sin rol'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-white/20 pt-3 mt-3">
              <p className="text-rose-100 text-sm">
                Gestiona solicitudes con soporte médico y trazabilidad completa.
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-white/15 text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/20">
                  Pendientes: {incapacidades.filter(i => i.estado === 'PENDIENTE').length}
                </span>
                <span className="bg-white/15 text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/20">
                  Total: {incapacidades.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Botón Toggle Formulario */}
        <div className="mb-4 sm:mb-6 flex justify-end">
          <button
            onClick={() => setShowForm(!showForm)}
            className={`px-4 sm:px-6 py-2 text-sm sm:text-base rounded-lg font-semibold transition-colors ${
              showForm
                ? 'bg-gray-300 hover:bg-gray-400 text-gray-800'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {showForm ? '✕ Cancelar' : '+ Nueva Incapacidad'}
          </button>
        </div>

        {/* Formulario */}
        {showForm && (
          <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 border-l-4 border-red-600">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">Nueva Solicitud de Incapacidad</h2>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    name="fechaInicio"
                    value={form.fechaInicio}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Fecha de Fin
                  </label>
                  <input
                    type="date"
                    name="fechaFin"
                    value={form.fechaFin}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Soporte en PDF (opcional)
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="w-full text-xs sm:text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Adjunta el certificado o incapacidad en formato PDF.</p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Diagnóstico / Motivo Médico
                </label>
                <input
                  type="text"
                  name="motivoMedico"
                  value={form.motivoMedico}
                  onChange={handleInputChange}
                  placeholder="Ej: Gripe, Cirugía, Recuperación..."
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Descripción / Observaciones
                </label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleInputChange}
                  placeholder="Ingresa detalles de tu incapacidad..."
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  rows="4"
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 sm:px-6 py-2 text-sm sm:text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Enviar Solicitud
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filtros */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['todas', 'pendientes', 'aprobadas', 'rechazadas'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === f
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Lista de incapacidades */}
        <div className="w-full space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              <p className="text-gray-600 mt-2">Cargando incapacidades...</p>
            </div>
          ) : incapacidadesFiltradas.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center border">
              <p className="text-gray-500">No hay incapacidades para mostrar</p>
            </div>
          ) : (
            incapacidadesFiltradas.map(i => (
              <div
                key={i.idNovedad}
                className="w-full bg-white shadow-md rounded-lg p-6 border-l-4 border-red-400 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {i.fechaInicio} al {i.fechaFin}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Solicitado: {new Date(i.fechaSolicitud).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${obtenerEstadoColor(i.estado)}`}>
                    {i.estado}
                  </span>
                </div>

                <p className="text-gray-700 mb-4">{i.descripcion}</p>

                {i.soportePath && (
                  <div className="mb-4">
                    <a
                      href={`${API_BASE_URL}/novedades/${i.idNovedad}/soporte`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                    >
                      Ver soporte PDF
                    </a>
                  </div>
                )}

                {i.estado === 'RECHAZADA' && i.motivoRechazo && (
                  <div className="bg-red-50 border border-red-200 rounded p-3 text-sm">
                    <p className="font-semibold text-red-800">Motivo del rechazo:</p>
                    <p className="text-red-700">{i.motivoRechazo}</p>
                  </div>
                )}

                {i.estado === 'APROBADA' && i.fechaAprobacion && (
                  <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
                    <p className="text-green-700">
                      Aprobado: {new Date(i.fechaAprobacion).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Toast notification */}
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

export default IncapacidadesModule;
