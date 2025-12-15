import React, { useState, useEffect } from 'react';
import { api } from '../../api';

/**
 * Componente mejorado para solicitudes de vacaciones
 * Incluye selección de aprobadores y visualización del flujo de aprobación
 */
const VacacionesModuleV2 = ({ usuarioId, userName }) => {
  const [vacaciones, setVacaciones] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('todas');

  // Formulario
  const [form, setForm] = useState({
    fechaInicio: '',
    fechaFin: '',
    descripcion: '',
    idJefeInmediato: '',
    idOperacionesClinicas: '',
    idRecursosHumanos: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    cargarVacaciones();
    cargarUsuarios();
  }, [usuarioId]);

  const cargarUsuarios = async () => {
    try {
      // Cargar solo administradores por idRol
      const response = await api.get(`/usuarios/por-rol?idRol=adm05`);
      const lista = Array.isArray(response.data) ? response.data : [];
      setUsuarios(lista);
    } catch (err) {
      console.error('Error cargando usuarios:', err);
    }
  };

  const cargarVacaciones = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/novedades/usuario/${usuarioId}`);

      const vacacionesFiltradas = response.data.filter(n => n.tipo?.nombre === 'Vacaciones');
      setVacaciones(vacacionesFiltradas);
    } catch (err) {
      console.error('Error cargando vacaciones:', err);
      setError('Error al cargar las vacaciones');
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

    if (!form.idJefeInmediato || !form.idOperacionesClinicas || !form.idRecursosHumanos) {
      setError('Debe seleccionar los 3 aprobadores');
      return;
    }

    try {
      // Crear la solicitud de vacaciones
      const response = await api.post(
        `/novedades/crear`,
        {
          idUsuario: usuarioId,
          idTipo: 1, // ID para Vacaciones
          fechaInicio: form.fechaInicio,
          fechaFin: form.fechaFin,
          descripcion: form.descripcion
        }
      );

      const idNovedad = response.data.idNovedad;

      // Crear las 3 aprobaciones pendientes
      await api.post(
        `/vacaciones/crear-aprobaciones`,
        {
          idNovedad,
          idJefeInmediato: parseInt(form.idJefeInmediato),
          idOperacionesClinicas: parseInt(form.idOperacionesClinicas),
          idRecursosHumanos: parseInt(form.idRecursosHumanos)
        }
      );

      setSuccess('Solicitud de vacaciones creada exitosamente. Pendiente de 3 aprobaciones.');
      setForm({
        fechaInicio: '',
        fechaFin: '',
        descripcion: '',
        idJefeInmediato: '',
        idOperacionesClinicas: '',
        idRecursosHumanos: ''
      });
      setShowForm(false);
      cargarVacaciones();
    } catch (err) {
      console.error('Error creando vacaciones:', err);
      setError(err.response?.data?.error || 'Error al crear la solicitud');
    }
  };

  const obtenerEstadoColor = (estado) => {
    switch (estado) {
      case 'APROBADA': return 'bg-green-100 text-green-800 border-green-300';
      case 'RECHAZADA': return 'bg-red-100 text-red-800 border-red-300';
      case 'PENDIENTE': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const vacacionesFiltradas = vacaciones.filter(v => {
    if (filter === 'todas') return true;
    if (filter === 'pendientes') return v.estado === 'PENDIENTE';
    if (filter === 'aprobadas') return v.estado === 'APROBADA';
    if (filter === 'rechazadas') return v.estado === 'RECHAZADA';
    return true;
  });

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gestión de Vacaciones</h1>
            <p className="text-gray-600 mt-1">Usuario: {userName}</p>
            <p className="text-sm text-gray-500 mt-1">Requiere aprobación de: Jefe Inmediato → Operaciones Clínicas → Recursos Humanos</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            {showForm ? 'Cancelar' : 'Nueva Solicitud'}
          </button>
        </div>

        {/* Mensajes */}
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
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Nueva Solicitud de Vacaciones</h2>
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                {/* Descripción */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción / Motivo *
                  </label>
                  <textarea
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describa el motivo de sus vacaciones..."
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
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Enviar Solicitud
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filtros */}
        <div className="mb-6 flex gap-4">
          {['todas', 'pendientes', 'aprobadas', 'rechazadas'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Lista de vacaciones */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando...</p>
          </div>
        ) : vacacionesFiltradas.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">No hay solicitudes de vacaciones</p>
          </div>
        ) : (
          <div className="space-y-4">
            {vacacionesFiltradas.map(v => (
              <div key={v.idNovedad} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-800">
                        Vacaciones #{v.idNovedad}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${obtenerEstadoColor(v.estado)}`}>
                        {v.estado}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mt-4">
                      <div>
                        <span className="font-semibold">Fecha inicio:</span> {v.fechaInicio}
                      </div>
                      <div>
                        <span className="font-semibold">Fecha fin:</span> {v.fechaFin}
                      </div>
                      <div className="col-span-2">
                        <span className="font-semibold">Descripción:</span> {v.descripcion}
                      </div>
                      <div>
                        <span className="font-semibold">Solicitud:</span> {new Date(v.fechaSolicitud).toLocaleString()}
                      </div>
                    </div>

                    {/* Estado de aprobaciones */}
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-700 mb-2">Estado de Aprobaciones:</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${v.aprobacionJefe ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span>Jefe Inmediato</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${v.aprobacionOperaciones ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span>Operaciones Clínicas</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${v.aprobacionRrhh ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span>Recursos Humanos</span>
                        </div>
                      </div>
                    </div>

                    {v.motivoRechazo && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                        <span className="font-semibold">Motivo de rechazo:</span> {v.motivoRechazo}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VacacionesModuleV2;
