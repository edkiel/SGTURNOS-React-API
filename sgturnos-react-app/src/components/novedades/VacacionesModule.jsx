import React, { useState, useEffect } from 'react';
import { api, API_BASE_URL } from '../../api';

/**
 * Componente para gestionar solicitudes de vacaciones
 * Permite a los usuarios crear solicitudes y ver su historial
 */
const VacacionesModule = ({ usuarioId, userName }) => {
  const [vacaciones, setVacaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('todas'); // todas, pendientes, aprobadas, rechazadas

  // Formulario
  const [form, setForm] = useState({
    fechaInicio: '',
    fechaFin: '',
    descripcion: '',
    jefeInmediato: '',
    operacionesClinicas: '',
    recursosHumanos: ''
  });
  const [admins, setAdmins] = useState([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [adminsError, setAdminsError] = useState('');
  const [aprobadores, setAprobadores] = useState({}); // { idNovedad: [aprobadores] }

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Cargar vacaciones al montar el componente
  const cargarAdmins = async () => {
    setAdminsLoading(true);
    setAdminsError('');
    try {
      // Cargar administradores por idRol para evitar ambigüedades en el nombre del rol
      const resp = await api.get(`/usuarios/por-rol?idRol=adm05`);
      const lista = Array.isArray(resp.data) ? resp.data : [];
      console.log('Admins via /por-rol:', lista.length, lista);
      setAdmins(lista);
      if (lista.length === 0) {
        // Fallback: cargar todos los usuarios y filtrar por rol desde el cliente
        const allResp = await api.get('/usuarios');
        const todos = Array.isArray(allResp.data) ? allResp.data : [];
        const adminsFiltrados = todos.filter(u => {
          const nombreRol = u?.rol?.rol ? String(u.rol.rol).toUpperCase() : '';
          const idRol = u?.rol?.idRol ? String(u.rol.idRol).toLowerCase() : '';
          return (
            nombreRol === 'ADMINISTRADOR' ||
            nombreRol.includes('ADMIN') ||
            idRol === 'administrador' ||
            idRol.startsWith('adm')
          );
        });
        console.log('Admins via fallback filter:', adminsFiltrados.length, adminsFiltrados);
        setAdmins(adminsFiltrados);
        if (adminsFiltrados.length === 0) {
          setAdminsError('No hay usuarios con rol ADMINISTRADOR disponibles.');
        }
      }
    } catch (e) {
      setAdmins([]);
      setAdminsError('No se pudo cargar administradores. Verifica tu sesión o permisos.');
    } finally {
      setAdminsLoading(false);
    }
  };

  useEffect(() => {
    cargarVacaciones();
    cargarAdmins();
  }, [usuarioId]);

  const cargarVacaciones = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/novedades/usuario/${usuarioId}`
      );

      // Filtrar solo vacaciones (tipo 1, ajustar según tu DB)
      const vacacionesFiltradas = response.data.filter(n => n.tipo?.nombre === 'Vacaciones');
      setVacaciones(vacacionesFiltradas);

      // Cargar aprobadores para cada solicitud
      const aprobadoresMap = {};
      for (const v of vacacionesFiltradas) {
        try {
          const respAprobadores = await api.get(`/vacaciones/aprobaciones/${v.idNovedad}`);
          aprobadoresMap[v.idNovedad] = Array.isArray(respAprobadores.data) ? respAprobadores.data : [];
        } catch (err) {
          console.warn(`No se pudieron cargar aprobadores para novedad ${v.idNovedad}`);
          aprobadoresMap[v.idNovedad] = [];
        }
      }
      setAprobadores(aprobadoresMap);
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

    if (form.descripcion.trim().length === 0) {
      setError('La descripción es requerida');
      return;
    }

    try {
      // Crear la solicitud de vacaciones
      const response = await api.post(
        `/novedades/crear`,
        {
          idUsuario: usuarioId,
          idTipo: 1, // ID para Vacaciones (ajustar según tu DB)
          fechaInicio: form.fechaInicio,
          fechaFin: form.fechaFin,
          descripcion: form.descripcion
        }
      );
      const idNovedad = response.data?.idNovedad || response.data?.novedad?.idNovedad;
      // Crear aprobaciones vinculando los 3 aprobadores seleccionados
      if (idNovedad && form.jefeInmediato && form.operacionesClinicas && form.recursosHumanos) {
        await api.post(
          `/vacaciones/crear-aprobaciones`,
          {
            idNovedad: idNovedad,
            idJefeInmediato: Number(form.jefeInmediato),
            idOperacionesClinicas: Number(form.operacionesClinicas),
            idRecursosHumanos: Number(form.recursosHumanos)
          }
        );
      }
      setSuccess('Solicitud de vacaciones creada exitosamente');
      setForm({ fechaInicio: '', fechaFin: '', descripcion: '' });
      setShowForm(false);

      // Recargar vacaciones
      cargarVacaciones();
    } catch (err) {
      console.error('Error creando vacaciones:', err);
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

  const obtenerColorTipoAprobador = (tipoAprobador) => {
    switch (tipoAprobador) {
      case 'JEFE_INMEDIATO':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'OPERACIONES_CLINICAS':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'RECURSOS_HUMANOS':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const obtenerLabelTipoAprobador = (tipoAprobador) => {
    switch (tipoAprobador) {
      case 'JEFE_INMEDIATO':
        return 'Jefe Inmediato';
      case 'OPERACIONES_CLINICAS':
        return 'Operaciones Clínicas';
      case 'RECURSOS_HUMANOS':
        return 'Recursos Humanos';
      default:
        return tipoAprobador;
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gestión de Vacaciones</h1>
            <p className="text-gray-600 mt-1">Usuario: {userName}</p>
          </div>

              {/* Selección de aprobadores */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jefe Inmediato</label>
                  <select
                    name="jefeInmediato"
                    value={form.jefeInmediato}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="">Seleccione...</option>
                    {admins.map(a => (
                      <option key={a.idUsuario} value={a.idUsuario}>
                        {a.primerNombre} {a.primerApellido} ({a.correo})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Operaciones Clínicas</label>
                  <select
                    name="operacionesClinicas"
                    value={form.operacionesClinicas}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="">Seleccione...</option>
                    {admins.map(a => (
                      <option key={a.idUsuario} value={a.idUsuario}>
                        {a.primerNombre} {a.primerApellido} ({a.correo})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recursos Humanos</label>
                  <select
                    name="recursosHumanos"
                    value={form.recursosHumanos}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="">Seleccione...</option>
                    {admins.map(a => (
                      <option key={a.idUsuario} value={a.idUsuario}>
                        {a.primerNombre} {a.primerApellido} ({a.correo})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {adminsLoading && (
                <p className="text-sm text-gray-600 mt-2">Cargando aprobadores...</p>
              )}
              {adminsError && !adminsLoading && (
                <p className="text-sm text-red-600 mt-2">{adminsError}</p>
              )}
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            {showForm ? 'Cancelar' : 'Nueva Solicitud'}
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
          <div className="bg-white shadow-lg rounded-lg p-6 mb-8 border-l-4 border-blue-600">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Nueva Solicitud de Vacaciones</h2>

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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción / Observaciones
                </label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleInputChange}
                  placeholder="Ingresa detalles de tu solicitud de vacaciones..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
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
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
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
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Lista de vacaciones */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-2">Cargando vacaciones...</p>
            </div>
          ) : vacacionesFiltradas.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
              <p className="text-gray-500">No hay solicitudes de vacaciones para mostrar</p>
            </div>
          ) : (
            vacacionesFiltradas.map(v => (
              <div
              <div className="mt-2 text-xs text-gray-600">
                {adminsLoading ? 'Cargando administradores...' : `Administradores cargados: ${admins.length}`}
                {adminsError && (
                  <span className="text-red-600 ml-2">{adminsError}</span>
                )}
                <button
                  type="button"
                  onClick={cargarAdmins}
                  className="ml-3 px-2 py-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Recargar aprobadores
                </button>
              </div>
                key={v.idNovedad}
                className="bg-white shadow rounded-lg p-6 border-l-4 border-blue-400 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {v.fechaInicio} al {v.fechaFin}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Solicitado: {new Date(v.fechaSolicitud).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${obtenerEstadoColor(v.estado)}`}>
                    {v.estado}
                  </span>
                </div>

                <p className="text-gray-700 mb-4">{v.descripcion}</p>

                {/* Mostrar aprobadores */}
                {aprobadores[v.idNovedad] && aprobadores[v.idNovedad].length > 0 && (
                  <div className="mb-4 bg-gray-50 rounded p-4">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Aprobadores:</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {aprobadores[v.idNovedad].map(aprob => (
                        <div
                          key={aprob.idAprobacion}
                          className={`p-3 rounded border ${obtenerColorTipoAprobador(aprob.tipoAprobador)}`}
                        >
                          <div className="text-xs font-semibold mb-1">
                            {obtenerLabelTipoAprobador(aprob.tipoAprobador)}
                          </div>
                          <div className="text-sm font-medium">{aprob.nombreAprobador}</div>
                          <div className="text-xs text-gray-600 mb-2">{aprob.correoAprobador}</div>
                          <div className="text-xs">
                            Estado: <span className="font-semibold">{aprob.estadoAprobacion}</span>
                          </div>
                          {aprob.motivoRechazo && (
                            <div className="text-xs text-red-700 mt-1">
                              Motivo: {aprob.motivoRechazo}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {v.estado === 'RECHAZADA' && v.motivoRechazo && (
                  <div className="bg-red-50 border border-red-200 rounded p-3 text-sm">
                    <p className="font-semibold text-red-800">Motivo del rechazo:</p>
                    <p className="text-red-700">{v.motivoRechazo}</p>
                  </div>
                )}

                {v.estado === 'APROBADA' && v.fechaAprobacion && (
                  <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
                    <p className="text-green-700">
                      Aprobado: {new Date(v.fechaAprobacion).toLocaleDateString('es-ES')}
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

export default VacacionesModule;
