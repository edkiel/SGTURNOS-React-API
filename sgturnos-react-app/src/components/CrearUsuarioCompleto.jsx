import React, { useState, useEffect } from 'react';
import { api } from '../api';

/**
 * Componente para crear usuarios con diferentes tipos de roles
 * Permite a administradores crear usuarios normales y administrativos
 */
const CrearUsuarioCompleto = ({ usuarioActual, onUsuarioCreado, variant = 'normal' }) => {
  const isAdminVariant = variant === 'admin';
  const allowToggle = !variant; // if variant provided, lock the mode
  const [formData, setFormData] = useState({
    idUsuario: '',
    primerNombre: '',
    segundoNombre: '',
    primerApellido: '',
    segundoApellido: '',
    correo: '',
    contrasena: '',
    roleMode: isAdminVariant ? 'admin' : 'usuario'
  });

  const [adminDept, setAdminDept] = useState('');
  const [standardRole, setStandardRole] = useState('AUXILIAR');
  const [availableRoles, setAvailableRoles] = useState([
    { id: 'aux01', rol: 'AUXILIAR' },
    { id: 'med02', rol: 'MEDICO' },
    { id: 'ter04', rol: 'TERAPIA' },
    { id: 'enfer03', rol: 'ENFERMERO' }
  ]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [isAdminUser, setIsAdminUser] = useState(false);

  // Roles administrativos especiales
  const rolesAdministrativos = [
    {
      id: 'JEFE_INMEDIATO',
      nombre: 'Jefe de Departamento / Jefe Inmediato',
      color: 'bg-blue-50 border-blue-200',
      icono: '📋',
      descripcion: 'Revisa y aprueba mallas. NO puede publicarlas.',
      funciones: [
        'Revisar mallas generadas',
        'Aprobar o rechazar mallas',
        'Revisar y aprobar novedades',
        'Ver reportes y estadísticas'
      ]
    },
    {
      id: 'OPERACIONES_CLINICAS',
      nombre: 'Operaciones Clínicas',
      color: 'bg-green-50 border-green-200',
      icono: '🏥',
      descripcion: 'Crea y publica mallas. Busca reemplazos para vacaciones.',
      funciones: [
        'Crear mallas de turnos',
        'Editar mallas existentes',
        'Publicar mallas (post-aprobación)',
        'Asignar turnos extras',
        'Gestionar reemplazos'
      ]
    },
    {
      id: 'RECURSOS_HUMANOS',
      nombre: 'Recursos Humanos',
      color: 'bg-purple-50 border-purple-200',
      icono: '💼',
      descripcion: 'Verifica mallas para nómina. Aprueba novedades.',
      funciones: [
        'Revisar mallas para nómina',
        'Detectar novedades del personal',
        'Aprobar o rechazar mallas',
        'Aprobar novedades',
        'Generar reportes de nómina'
      ]
    }
  ];

  // Obtener el rol del usuario actual al cargar
  useEffect(() => {
    const obtenerRolUsuario = () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const payload = token.split('.')[1];
          const decoded = JSON.parse(atob(payload));
          console.log('JWT decodificado:', decoded);
          
          // Buscar el claim 'rol' que ahora incluimos en el token
          const rolRaw = decoded.rol || decoded.idRol || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'] || '';
          console.log('Rol extraído del JWT:', rolRaw);
          
          setUserRole(rolRaw);
          const rolStr = String(rolRaw);
          const adminDetected = (
            rolStr === 'Administrador' ||
            rolStr.toUpperCase().includes('ADMIN') ||
            rolStr.toLowerCase().includes('adm')
          );
          console.log('¿Es administrador?:', adminDetected);
          setIsAdminUser(adminDetected);
        } else {
          setIsAdminUser(false);
        }
      } catch (err) {
        console.error('Error decodificando token:', err);
        setUserRole(null);
        setIsAdminUser(false);
      }
    };
    obtenerRolUsuario();
    // Cargar roles estándar desde backend
    const cargarRoles = async () => {
      try {
        const resp = await api.get('/roles/estandar');
        const roles = Array.isArray(resp.data?.roles) ? resp.data.roles : [];
        if (roles.length > 0) {
          setAvailableRoles(roles);
          // fijar por defecto AUXILIAR si existe
          const aux = roles.find(r => (r.rol || '').toUpperCase() === 'AUXILIAR');
          if (aux) setStandardRole(aux.rol);
        }
      } catch (e) {
        // mantener valores por defecto si falla
        console.warn('No se pudo cargar roles estándar, usando valores por defecto');
      }
    };
    cargarRoles();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleModeChange = (mode) => {
    if (!allowToggle) return; // locked by variant
    setFormData(prev => ({
      ...prev,
      roleMode: mode
    }));
    setAdminDept('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validaciones básicas
    if (!formData.idUsuario || !formData.correo || !formData.contrasena || 
        !formData.primerNombre || !formData.primerApellido) {
      setError('Por favor completa todos los campos requeridos (*)');
      return;
    }

    // Si es rol administrativo, debe estar seleccionado
    if (formData.roleMode === 'admin' && !adminDept) {
      setError('Por favor selecciona a qué departamento administrativo pertenece');
      return;
    }

    // Solo administradores pueden crear usuarios administrativos
    if (formData.roleMode === 'admin' && !isAdminUser) {
      setError('❌ Solo los administradores pueden crear usuarios con roles especiales');
      return;
    }

    try {
      setLoading(true);

      let idRol = 'AUXILIAR'; // Rol estándar por defecto
      let nombreRolMostrado = 'AUXILIAR';
      if (formData.roleMode === 'admin') {
        const rolSeleccionadoObj = rolesAdministrativos.find(r => r.id === adminDept);
        idRol = rolSeleccionadoObj?.id || adminDept; // Usar ID, no nombre
        nombreRolMostrado = rolSeleccionadoObj?.nombre || adminDept;
      } else {
        // Rol estándar seleccionado en el desplegable
        idRol = standardRole;
        nombreRolMostrado = standardRole;
      }

      await api.post('/auth/register', {
        idUsuario: formData.idUsuario,
        correo: formData.correo,
        contrasena: formData.contrasena,
        primerNombre: formData.primerNombre,
        segundoNombre: formData.segundoNombre || '',
        primerApellido: formData.primerApellido,
        segundoApellido: formData.segundoApellido || '',
        idRol: idRol
      });

      setMessage(`✅ Usuario creado exitosamente. Rol: ${nombreRolMostrado}`);
      
      // Limpiar formulario
      setFormData({
        idUsuario: '',
        primerNombre: '',
        segundoNombre: '',
        primerApellido: '',
        segundoApellido: '',
        correo: '',
        contrasena: '',
        roleMode: 'usuario'
      });
      setAdminDept('');
      setStandardRole('AUXILIAR');

      if (onUsuarioCreado) {
        onUsuarioCreado();
      }
    } catch (err) {
      setError('Error al crear usuario: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // selectedRole no longer used directly; keep adminDept as source of truth

  // Solo mostrar si el usuario actual es Administrador
  if (!isAdminUser) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-800 font-semibold">⚠️ No tienes permisos para crear usuarios</p>
        <p className="text-yellow-700 text-sm mt-2">Solo los administradores pueden acceder a esta función</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-lg">
      {/* Encabezado */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-600 p-4 rounded-lg">
        <h2 className="text-2xl font-bold text-blue-900 mb-1">Crear Nuevo Usuario</h2>
        <p className="text-blue-700 text-sm">Crea usuarios normales o con roles administrativos especiales</p>
      </div>

      {/* Mensajes */}
      {message && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tipo de Rol (solo si se permite toggle) */}
        {allowToggle && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <label className="block text-gray-700 text-sm font-bold mb-3">Tipo de Usuario</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRoleModeChange('usuario')}
                className={`p-3 rounded-lg text-center transition ${
                  formData.roleMode === 'usuario'
                    ? 'bg-blue-600 text-white border-2 border-blue-700'
                    : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-blue-400'
                }`}
              >
                <p className="font-bold">👤 Usuario Normal</p>
                <p className="text-xs mt-1">Personal estándar</p>
              </button>
              <button
                type="button"
                onClick={() => handleRoleModeChange('admin')}
                className={`p-3 rounded-lg text-center transition ${
                  formData.roleMode === 'admin'
                    ? 'bg-purple-600 text-white border-2 border-purple-700'
                    : 'bg-white border-2 border-gray-300 text-gray-700 hover-border-purple-400'
                }`}
              >
                <p className="font-bold">🔐 Administrador</p>
                <p className="text-xs mt-1">Jefe, Operaciones, RRHH</p>
              </button>
            </div>
          </div>
        )}

        {/* Datos Personales */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Datos del Usuario</h3>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Id Usuario / Cédula *
            </label>
            <input
              type="text"
              name="idUsuario"
              value={formData.idUsuario}
              onChange={handleInputChange}
              placeholder="Identificación del usuario"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Primer Nombre *
              </label>
              <input
                type="text"
                name="primerNombre"
                value={formData.primerNombre}
                onChange={handleInputChange}
                placeholder="ej: Carlos"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Segundo Nombre
              </label>
              <input
                type="text"
                name="segundoNombre"
                value={formData.segundoNombre}
                onChange={handleInputChange}
                placeholder="ej: Eduardo"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Primer Apellido *
              </label>
              <input
                type="text"
                name="primerApellido"
                value={formData.primerApellido}
                onChange={handleInputChange}
                placeholder="ej: García"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Segundo Apellido
              </label>
              <input
                type="text"
                name="segundoApellido"
                value={formData.segundoApellido}
                onChange={handleInputChange}
                placeholder="ej: López"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Correo Electrónico *
            </label>
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleInputChange}
              placeholder="usuario@hospital.com"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="mt-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Contraseña *
            </label>
            <input
              type="password"
              name="contrasena"
              value={formData.contrasena}
              onChange={handleInputChange}
              placeholder="Contraseña segura"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
            />
            <p className="text-xs text-gray-600 mt-1">
              Mínimo 8 caracteres, incluir mayúsculas, minúsculas y números
            </p>
          </div>
        </div>

        {/* Selector de rol estándar (solo si es usuario normal) */}
        {formData.roleMode === 'usuario' && (
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Selecciona el rol estándar</h3>
            <div className="space-y-2">
              <label className="block text-gray-700 text-sm font-bold">Rol</label>
              <select
                value={standardRole}
                onChange={(e) => setStandardRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              >
                {availableRoles.map(r => (
                  <option key={r.id || r.rol} value={(r.rol || '').toUpperCase()}>
                    {(r.rol || '').toUpperCase()}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-600">Roles estándar disponibles para personal.</p>
            </div>
          </div>
        )}

        {/* Selector de departamento administrativo (solo si es admin) */}
        {formData.roleMode === 'admin' && (
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Selecciona el departamento administrativo</h3>
            <div className="space-y-4">
              {rolesAdministrativos.map(role => (
                <div
                  key={role.id}
                  onClick={() => setAdminDept(role.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                    adminDept === role.id
                      ? `${role.color} border-b-4 ring-2 ring-offset-2 ring-blue-400`
                      : `${role.color} border-gray-300 hover:border-gray-400`
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{role.icono}</span>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 text-lg">{role.nombre}</h4>
                      <p className="text-sm text-gray-600 mb-3">{role.descripcion}</p>
                    </div>
                    {adminDept === role.id && (
                      <div className="text-2xl">✓</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botón de envío */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition mt-6"
        >
          {loading ? 'Creando usuario...' : '✓ Crear Usuario'}
        </button>
      </form>
    </div>
  );
};

export default CrearUsuarioCompleto;
