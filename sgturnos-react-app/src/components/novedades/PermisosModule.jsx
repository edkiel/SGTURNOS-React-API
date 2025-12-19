import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../api';

/**
 * Componente para gestionar solicitudes de permisos especiales
 * Permite a los usuarios crear solicitudes de permiso con fecha definida
 * Incluye selección de los 3 aprobadores (Jefe, Operaciones, RRHH)
 */
const PermisosModule = ({ usuarioId, userName }) => {
  const [permisos, setPermisos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('todas'); // todas, pendientes, aprobadas, rechazadas

  // Formulario
  const [form, setForm] = useState({
    fechaInicio: '',
    fechaFin: '',
    descripcion: '',
    tipoPermiso: '',
    idJefeInmediato: '',
    idOperacionesClinicas: '',
    idRecursosHumanos: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Cargar permisos y usuarios al montar el componente
  useEffect(() => {
    cargarPermisos();
    cargarUsuarios();
  }, [usuarioId]);

  const cargarUsuarios = async () => {
    try {
      // Cargar solo administradores por idRol
      const response = await axios.get(`${API_BASE_URL}/usuarios/por-rol?idRol=adm05`);
      const lista = Array.isArray(response.data) ? response.data : [];
      setUsuarios(lista);
    } catch (err) {
      console.error('Error cargando usuarios:', err);
    }
  };

  const cargarPermisos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/novedades/usuario/${usuarioId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Filtrar solo permisos (tipo 3, ajustar según tu DB)
      const permisosFiltrados = response.data.filter(n => n.tipo?.nombre === 'Permisos');
      setPermisos(permisosFiltrados);
    } catch (err) {
      console.error('Error cargando permisos:', err);
      setError('Error al cargar los permisos');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
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

    if (!form.idJefeInmediato || !form.idOperacionesClinicas || !form.idRecursosHumanos) {
      setError('Debe seleccionar los 3 aprobadores');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      // Crear la solicitud de permiso
      const response = await axios.post(
        `${API_BASE_URL}/novedades/crear`,
        {
          idUsuario: usuarioId,
          idTipo: 3, // ID para Permisos (ajustar según tu DB)
          fechaInicio: form.fechaInicio,
          fechaFin: form.fechaFin,
          descripcion: form.descripcion
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const idNovedad = response.data.idNovedad;

      // Crear las 3 aprobaciones pendientes
      await axios.post(
        `${API_BASE_URL}/aprobaciones/crear-permisos`,
        {
          idNovedad,
          idJefeInmediato: parseInt(form.idJefeInmediato),
          idOperacionesClinicas: parseInt(form.idOperacionesClinicas),
          idRecursosHumanos: parseInt(form.idRecursosHumanos)
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuccess('Solicitud de permiso creada exitosamente. Pendiente de 3 aprobaciones.');
      setForm({
        fechaInicio: '',
        fechaFin: '',
        descripcion: '',
        tipoPermiso: '',
        idJefeInmediato: '',
        idOperacionesClinicas: '',
        idRecursosHumanos: ''
      });
      setShowForm(false);

      // Recargar permisos
      cargarPermisos();
    } catch (err) {
      console.error('Error creando permiso:', err);
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

  const permisosFiltrados = permisos.filter(p => {
    if (filter === 'todas') return true;
    if (filter === 'pendientes') return p.estado === 'PENDIENTE';
    if (filter === 'aprobadas') return p.estado === 'APROBADA';
    if (filter === 'rechazadas') return p.estado === 'RECHAZADA';
    return true;
  });

  return (
    <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">🔐 Gestión de Permisos</h1>
            <p className="text-gray-600 mt-1">Usuario: {userName}</p>
            <p className="text-sm text-gray-500 mt-1">Requiere aprobación de: Jefe Inmediato → Operaciones Clínicas → Recursos Humanos</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            {showForm ? 'Cancelar' : 'Nuevo Permiso'}
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
          <div className="bg-white shadow-lg rounded-lg p-6 mb-8 border-l-4 border-amber-600">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Nueva Solicitud de Permiso</h2>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fechas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Inicio *
                  </label>
                  <input
                    type="date"
                    name="fechaInicio"
                    value={form.fechaInicio}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Fin *
                  </label>
                  <input
                    type="date"
                    name="fechaFin"
                    value={form.fechaFin}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Selección de aprobadores */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jefe Inmediato *
                  </label>
                  <select
                    name="idJefeInmediato"
                    value={form.idJefeInmediato}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  >
                    <option value="">Seleccione...</option>
                    {usuarios.map(u => (
                      <option key={u.idUsuario} value={u.idUsuario}>
                        {u.primerNombre} {u.primerApellido} ({u.correo})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Operaciones Clínicas *
                  </label>
                  <select
                    name="idOperacionesClinicas"
                    value={form.idOperacionesClinicas}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  >
                    <option value="">Seleccione...</option>
                    {usuarios.map(u => (
                      <option key={u.idUsuario} value={u.idUsuario}>
                        {u.primerNombre} {u.primerApellido} ({u.correo})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recursos Humanos *
                  </label>
                  <select
                    name="idRecursosHumanos"
                    value={form.idRecursosHumanos}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  >
                    <option value="">Seleccione...</option>
                    {usuarios.map(u => (
                      <option key={u.idUsuario} value={u.idUsuario}>
                        {u.primerNombre} {u.primerApellido} ({u.correo})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tipo de Permiso */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Permiso *
                  </label>
                  <input
                    type="text"
                    name="tipoPermiso"
                    value={form.tipoPermiso}
                    onChange={handleInputChange}
                    placeholder="Ej: Permiso de asuntos personales, Cita médica, etc..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                {/* Descripción */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción / Motivo *
                  </label>
                  <textarea
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleInputChange}
                    placeholder="Ingresa detalles de tu solicitud de permiso..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                    rows="4"
                    required
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
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
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Lista de permisos */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
              <p className="text-gray-600 mt-2">Cargando permisos...</p>
            </div>
          ) : permisosFiltrados.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
              <p className="text-gray-500">No hay solicitudes de permiso para mostrar</p>
            </div>
          ) : (
            permisosFiltrados.map(p => (
              <div
                key={p.idNovedad}
                className="bg-white shadow rounded-lg p-6 border-l-4 border-amber-400 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {p.fechaInicio} al {p.fechaFin}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Solicitado: {new Date(p.fechaSolicitud).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${obtenerEstadoColor(p.estado)}`}>
                    {p.estado}
                  </span>
                </div>

                <p className="text-gray-700 mb-4">{p.descripcion}</p>

                {p.estado === 'RECHAZADA' && p.motivoRechazo && (
                  <div className="bg-red-50 border border-red-200 rounded p-3 text-sm">
                    <p className="font-semibold text-red-800">Motivo del rechazo:</p>
                    <p className="text-red-700">{p.motivoRechazo}</p>
                  </div>
                )}

                {p.estado === 'APROBADA' && p.fechaAprobacion && (
                  <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
                    <p className="text-green-700">
                      Aprobado: {new Date(p.fechaAprobacion).toLocaleDateString('es-ES')}
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

export default PermisosModule;
