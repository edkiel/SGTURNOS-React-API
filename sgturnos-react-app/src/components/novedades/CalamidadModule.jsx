import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../api';

/**
 * Componente para gestionar reportes de calamidad
 * Permite a los usuarios reportar situaciones de calamidad personal o familiar
 */
const CalamidadModule = ({ usuarioId, userName }) => {
  const [calamidades, setCalamidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('todas'); // todas, pendientes, aprobadas, rechazadas

  const [file, setFile] = useState(null); // soporte PDF (opcional)

  // Formulario
  const [form, setForm] = useState({
    fechaInicio: '',
    fechaFin: '',
    descripcion: '',
    tipoCalamidad: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Cargar calamidades al montar el componente
  useEffect(() => {
    cargarCalamidades();
  }, [usuarioId]);

  const cargarCalamidades = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/novedades/usuario/${usuarioId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Filtrar solo calamidades (tipo 5, ajustar según tu DB)
      const calamidadesFiltradas = response.data.filter(n => n.tipo?.nombre === 'Calamidad');
      setCalamidades(calamidadesFiltradas);
    } catch (err) {
      console.error('Error cargando calamidades:', err);
      setError('Error al cargar los reportes de calamidad');
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

      // Crear el reporte de calamidad
      const response = await axios.post(
        `${API_BASE_URL}/novedades/crear`,
        {
          idUsuario: usuarioId,
          idTipo: 5, // ID para Calamidad (ajustar según tu DB)
          fechaInicio: form.fechaInicio,
          fechaFin: form.fechaFin,
          descripcion: form.descripcion
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Subir soporte si se adjuntó (opcional)
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

      setSuccess('Reporte de calamidad creado exitosamente');
      setForm({ fechaInicio: '', fechaFin: '', descripcion: '', tipoCalamidad: '' });
      setFile(null);
      setShowForm(false);

      // Recargar calamidades
      cargarCalamidades();
    } catch (err) {
      console.error('Error creando calamidad:', err);
      setError(err.response?.data?.error || 'Error al crear el reporte');
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

  const calamidadesFiltradas = calamidades.filter(c => {
    if (filter === 'todas') return true;
    if (filter === 'pendientes') return c.estado === 'PENDIENTE';
    if (filter === 'aprobadas') return c.estado === 'APROBADA';
    if (filter === 'rechazadas') return c.estado === 'RECHAZADA';
    return true;
  });

  return (
    <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Reporte de Calamidad</h1>
            <p className="text-gray-600 mt-1">Usuario: {userName}</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            {showForm ? 'Cancelar' : 'Reportar Calamidad'}
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
          <div className="bg-white shadow-lg rounded-lg p-6 mb-8 border-l-4 border-orange-600">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Nuevo Reporte de Calamidad</h2>

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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Calamidad
                </label>
                <select
                  name="tipoCalamidad"
                  value={form.tipoCalamidad}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Selecciona un tipo...</option>
                  <option value="muerte">Muerte en la familia</option>
                  <option value="accidente">Accidente personal o familiar</option>
                  <option value="desastre">Desastre natural / Evento catastrófico</option>
                  <option value="enfermedad">Enfermedad grave en la familia</option>
                  <option value="otra">Otra situación de calamidad</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción Detallada
                </label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleInputChange}
                  placeholder="Describe la situación de calamidad en detalle. Incluye información relevante que ayude a procesar tu solicitud."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  rows="5"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Archivos de Soporte (Opcional)
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                {file && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ Archivo seleccionado: {file.name}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Solo se aceptan archivos PDF. Máximo 10MB. Este campo es opcional.
                </p>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded p-4">
                <p className="text-sm text-orange-700">
                  <span className="font-semibold">ℹ️ Información:</span> Puedes adjuntar documentos de soporte (opcional) que ayuden a respaldar tu reporte de calamidad. Sin archivos, tu solicitud será procesada normalmente.
                </p>
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
                  className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
                >
                  Enviar Reporte
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
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Lista de calamidades */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              <p className="text-gray-600 mt-2">Cargando reportes...</p>
            </div>
          ) : calamidadesFiltradas.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
              <p className="text-gray-500">No hay reportes de calamidad para mostrar</p>
            </div>
          ) : (
            calamidadesFiltradas.map(c => (
              <div
                key={c.idNovedad}
                className="bg-white shadow rounded-lg p-6 border-l-4 border-orange-400 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {c.fechaInicio} al {c.fechaFin}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Reportado: {new Date(c.fechaSolicitud).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${obtenerEstadoColor(c.estado)}`}>
                    {c.estado}
                  </span>
                </div>

                <p className="text-gray-700 mb-4">{c.descripcion}</p>

                {c.soportePath && (
                  <div className="mb-4">
                    <a 
                      href={`${API_BASE_URL}/novedades/${c.idNovedad}/soporte`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                    >
                      📎 Ver archivo de soporte
                    </a>
                  </div>
                )}

                {c.estado === 'RECHAZADA' && c.motivoRechazo && (
                  <div className="bg-red-50 border border-red-200 rounded p-3 text-sm">
                    <p className="font-semibold text-red-800">Motivo del rechazo:</p>
                    <p className="text-red-700">{c.motivoRechazo}</p>
                  </div>
                )}

                {c.estado === 'APROBADA' && c.fechaAprobacion && (
                  <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
                    <p className="text-green-700">
                      Aprobado: {new Date(c.fechaAprobacion).toLocaleDateString('es-ES')}
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

export default CalamidadModule;
