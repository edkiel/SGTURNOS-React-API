import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../api';

/**
 * Componente para gestionar solicitudes de incapacidades
 * Permite a los usuarios crear solicitudes de incapacidad (médica o licencia)
 * El rol de administrador valida y aprueba/rechaza
 */
const IncapacidadesModule = ({ usuarioId, userName }) => {
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

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Cargar incapacidades al montar el componente
  useEffect(() => {
    cargarIncapacidades();
  }, [usuarioId]);

  const cargarIncapacidades = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/novedades/usuario/${usuarioId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Filtrar solo incapacidades (tipo 2, ajustar según tu DB)
      const incapacidadesFiltradas = response.data.filter(n => n.tipo?.nombre === 'Incapacidades');
      setIncapacidades(incapacidadesFiltradas);
    } catch (err) {
      console.error('Error cargando incapacidades:', err);
      setError('Error al cargar las incapacidades');
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
    setError('');
    setSuccess('');

    // Validar fechas
    if (!form.fechaInicio || !form.fechaFin) {
      setError('Las fechas de inicio y fin son requeridas');
      return;
    }

    if (new Date(form.fechaInicio) > new Date(form.fechaFin)) {
      setError('La fecha de inicio debe ser anterior a la fecha de fin');
      return;
    }

    if (form.descripcion.trim().length === 0) {
      setError('La descripción es requerida');
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

      setSuccess('Solicitud de incapacidad creada exitosamente');
      setForm({ fechaInicio: '', fechaFin: '', descripcion: '', motivoMedico: '' });
      setFile(null);
      setShowForm(false);

      // Recargar incapacidades
      cargarIncapacidades();
    } catch (err) {
      console.error('Error creando incapacidad:', err);
      setError(err.response?.data?.error || 'Error al crear la solicitud');
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
    <div className="p-6 bg-gradient-to-br from-red-50 to-orange-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gestión de Incapacidades</h1>
            <p className="text-gray-600 mt-1">Usuario: {userName}</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            {showForm ? 'Cancelar' : 'Nueva Incapacidad'}
          </button>
        </div>

        {/* Mensajes de estado */}
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

        {/* Formulario */}
        {showForm && (
          <div className="bg-white shadow-lg rounded-lg p-6 mb-8 border-l-4 border-red-600">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Nueva Solicitud de Incapacidad</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    name="fechaInicio"
                    value={form.fechaInicio}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Fin
                  </label>
                  <input
                    type="date"
                    name="fechaFin"
                    value={form.fechaFin}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Soporte en PDF (opcional)
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="w-full text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Adjunta el certificado o incapacidad en formato PDF.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diagnóstico / Motivo Médico
                </label>
                <input
                  type="text"
                  name="motivoMedico"
                  value={form.motivoMedico}
                  onChange={handleInputChange}
                  placeholder="Ej: Gripe, Cirugía, Recuperación..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción / Observaciones
                </label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleInputChange}
                  placeholder="Ingresa detalles de tu incapacidad..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  rows="4"
                  required
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
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
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              <p className="text-gray-600 mt-2">Cargando incapacidades...</p>
            </div>
          ) : incapacidadesFiltradas.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
              <p className="text-gray-500">No hay solicitudes de incapacidad para mostrar</p>
            </div>
          ) : (
            incapacidadesFiltradas.map(i => (
              <div
                key={i.idNovedad}
                className="bg-white shadow rounded-lg p-6 border-l-4 border-red-400 hover:shadow-lg transition-shadow"
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
    </div>
  );
};

export default IncapacidadesModule;
