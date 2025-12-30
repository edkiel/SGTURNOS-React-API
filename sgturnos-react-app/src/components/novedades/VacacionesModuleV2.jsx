import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import PageHeader from '../common/PageHeader';

/**
 * Componente mejorado para solicitudes de vacaciones
 * Incluye selección de aprobadores y visualización del flujo de aprobación
 */
const VacacionesModuleV2 = ({ usuarioId, userName, userRole = '', openCreateSignal }) => {
  const [vacaciones, setVacaciones] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('todas');

  // Formulario
  const [form, setForm] = useState({
    periodoCumplidoInicio: '',
    periodoCumplidoFin: '',
    periodoVacacionInicio: '',
    periodoVacacionFin: '',
    descripcion: '',
    idJefeInmediato: '',
    idOperacionesClinicas: '',
    idRecursosHumanos: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Calcular fecha máxima para periodo cumplido (año anterior)
  const getMaxFechaPeriodoCumplido = () => {
    const hoy = new Date();
    const anioAnterior = new Date(hoy.getFullYear() - 1, 11, 31); // 31 de diciembre del año anterior
    return anioAnterior.toISOString().split('T')[0];
  };

  // Fecha mínima para periodo vacacional (fecha actual)
  const getMinFechaPeriodoVacacional = () => {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0];
  };

  useEffect(() => {
    cargarVacaciones();
    cargarUsuarios();
  }, [usuarioId]);

  // Abrir formulario cuando se solicita crear desde el selector
  useEffect(() => {
    if (openCreateSignal) {
      setShowForm(true);
    }
  }, [openCreateSignal]);

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
    
    if (name === 'periodoCumplidoInicio') {
      // Calcular 1 año - 1 día para el periodo cumplido
      const fechaFinCalculada = calcularFechaFin(value);
      setForm({ ...form, periodoCumplidoInicio: value, periodoCumplidoFin: fechaFinCalculada });
      return;
    }
    
    if (name === 'periodoVacacionInicio') {
      // Calcular 15 días laborales para el periodo vacacional
      const fechaFinCalculada = calcular15DiasLaborales(value);
      setForm({ ...form, periodoVacacionInicio: value, periodoVacacionFin: fechaFinCalculada });
      return;
    }
    
    setForm({ ...form, [name]: value });
  };

  const calcularFechaFin = (fechaInicio) => {
    if (!fechaInicio) return '';
    const start = new Date(`${fechaInicio}T00:00:00`);
    if (Number.isNaN(start.getTime())) return '';
    const end = new Date(start);
    end.setFullYear(end.getFullYear() + 1);
    end.setDate(end.getDate() - 1);
    return end.toISOString().split('T')[0];
  };

  // Festivos colombianos para 2024-2026 (ajustar según necesidad)
  const festivos = [
    '2024-01-01', '2024-01-08', '2024-03-25', '2024-03-28', '2024-03-29',
    '2024-05-01', '2024-05-13', '2024-06-03', '2024-06-10', '2024-07-01',
    '2024-07-20', '2024-08-07', '2024-08-19', '2024-10-14', '2024-11-04',
    '2024-11-11', '2024-12-08', '2024-12-25',
    '2025-01-01', '2025-01-06', '2025-03-24', '2025-04-17', '2025-04-18',
    '2025-05-01', '2025-06-02', '2025-06-23', '2025-06-30', '2025-07-20',
    '2025-08-07', '2025-08-18', '2025-10-13', '2025-11-03', '2025-11-17',
    '2025-12-08', '2025-12-25',
    '2026-01-01', '2026-01-12', '2026-03-23', '2026-04-02', '2026-04-03',
    '2026-05-01', '2026-05-18', '2026-06-08', '2026-06-15', '2026-06-29',
    '2026-07-20', '2026-08-07', '2026-08-17', '2026-10-12', '2026-11-02',
    '2026-11-16', '2026-12-08', '2026-12-25'
  ];

  const calcularDiasSolicitados = (fechaInicio, fechaFin) => {
    if (!fechaInicio || !fechaFin) return 0;
    const inicio = new Date(`${fechaInicio}T00:00:00`);
    const fin = new Date(`${fechaFin}T00:00:00`);
    if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) return 0;
    if (inicio > fin) return 0;

    let dias = 0;
    const current = new Date(inicio);

    while (current <= fin) {
      const diaSemana = current.getDay(); // 0=Domingo, 1=Lunes, ..., 6=Sábado
      const fechaStr = current.toISOString().split('T')[0];
      
      // Contar si es lunes a sábado (1-6) y no es festivo
      if (diaSemana >= 1 && diaSemana <= 6 && !festivos.includes(fechaStr)) {
        dias++;
      }
      
      current.setDate(current.getDate() + 1);
    }

    return dias;
  };

  const calcular15DiasLaborales = (fechaInicio) => {
    if (!fechaInicio) return '';
    const inicio = new Date(`${fechaInicio}T00:00:00`);
    if (Number.isNaN(inicio.getTime())) return '';

    let diasContados = 0;
    const current = new Date(inicio);

    while (diasContados < 15) {
      current.setDate(current.getDate() + 1);
      const diaSemana = current.getDay();
      const fechaStr = current.toISOString().split('T')[0];
      
      // Contar si es lunes a sábado (1-6) y no es festivo
      if (diaSemana >= 1 && diaSemana <= 6 && !festivos.includes(fechaStr)) {
        diasContados++;
      }
    }

    return current.toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validar fechas
    if (!form.periodoVacacionInicio || !form.periodoVacacionFin) {
      setError('Las fechas de inicio y fin del periodo vacacional son requeridas');
      return;
    }

    if (!form.periodoCumplidoInicio || !form.periodoCumplidoFin) {
      setError('Las fechas del periodo cumplido son requeridas');
      return;
    }

    if (new Date(form.periodoVacacionInicio) > new Date(form.periodoVacacionFin)) {
      setError('La fecha de inicio debe ser anterior a la fecha de fin');
      return;
    }

    const fechaFinEsperada = calcularFechaFin(form.periodoCumplidoInicio);
    if (form.periodoCumplidoFin !== fechaFinEsperada) {
      setError(`La fecha final del periodo cumplido debe ser el día anterior del año siguiente: ${fechaFinEsperada}`);
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
          fechaInicio: form.periodoVacacionInicio,
          fechaFin: form.periodoVacacionFin,
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
        periodoCumplidoInicio: '',
        periodoCumplidoFin: '',
        periodoVacacionInicio: '',
        periodoVacacionFin: '',
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
    <div className="w-full mx-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen" style={{ maxWidth: '1400px' }}>
        <PageHeader
          title="Gestión de Vacaciones"
          subtitle="Requiere aprobación de: Jefe Inmediato → Operaciones Clínicas → Recursos Humanos"
          userName={userName}
          roleLabel={userRole}
        />

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
              {/* Bloque destacado para periodo cumplido */}
              <div className="mb-6 bg-indigo-50 border border-indigo-200 rounded-xl p-4 shadow-sm">
                <h3 className="text-lg font-semibold text-indigo-800 mb-4">Peridodo cumplido</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Periodo cumplido - Inicio
                    </label>
                    <input
                      type="date"
                      name="periodoCumplidoInicio"
                      value={form.periodoCumplidoInicio}
                      onChange={handleInputChange}
                      max={getMaxFechaPeriodoCumplido()}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Periodo cumplido - Fin
                    </label>
                    <input
                      type="date"
                      name="periodoCumplidoFin"
                      value={form.periodoCumplidoFin}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                    {form.periodoCumplidoInicio && (
                      <p className="text-xs text-gray-600 mt-1">
                        Debe ser el día anterior del año siguiente al inicio ({calcularFechaFin(form.periodoCumplidoInicio)}).
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fechas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Inicio *
                  </label>
                  <input
                    type="date"
                    name="periodoVacacionInicio"
                    value={form.periodoVacacionInicio}
                    onChange={handleInputChange}
                    min={getMinFechaPeriodoVacacional()}
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
                    name="periodoVacacionFin"
                    value={form.periodoVacacionFin}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  {form.periodoVacacionInicio && (
                    <p className="text-xs text-gray-500 mt-1">
                      Calculado automáticamente: 15 días laborales desde el inicio.
                    </p>
                  )}
                </div>

                {/* Días solicitados */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Días solicitados
                  </label>
                  <input
                    type="text"
                    value={calcularDiasSolicitados(form.periodoVacacionInicio, form.periodoVacacionFin)}
                    readOnly
                    className="w-full px-4 py-2 bg-blue-50 border border-blue-300 rounded-lg text-lg font-bold text-blue-700 text-center"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Cálculo: Lunes a sábado (sin domingos ni festivos)
                  </p>
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
  );
};

export default VacacionesModuleV2;
