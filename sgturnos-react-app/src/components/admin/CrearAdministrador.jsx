import React, { useState } from 'react';
import { api } from '../../api';

/**
 * Componente para crear usuarios administrativos con roles específicos
 */
const CrearAdministrador = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    idUsuario: '',
    correo: '',
    contrasena: '',
    primerNombre: '',
    segundoNombre: '',
    primerApellido: '',
    segundoApellido: '',
    rol: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleSelect = (roleId) => {
    setFormData(prev => ({
      ...prev,
      rol: roleId
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!formData.correo || !formData.contrasena || !formData.rol || !formData.idUsuario || !formData.primerNombre || !formData.primerApellido) {
      setError('Por favor completa todos los campos requeridos (*)');
      return;
    }

    try {
      setLoading(true);

      // Obtener el nombre del rol seleccionado
      const rolSeleccionado = rolesAdministrativos.find(r => r.id === formData.rol);
      const nombreRol = rolSeleccionado?.nombre || formData.rol;

      await api.post('/api/auth/register', {
        idUsuario: formData.idUsuario,
        correo: formData.correo,
        contrasena: formData.contrasena,
        primerNombre: formData.primerNombre,
        segundoNombre: formData.segundoNombre || '',
        primerApellido: formData.primerApellido,
        segundoApellido: formData.segundoApellido || '',
        idRol: nombreRol  // Backend espera 'idRol', no 'rol'
      });

      setMessage(`✅ Usuario administrativo creado exitosamente. Rol: ${nombreRol}`);
      setFormData({
        idUsuario: '',
        correo: '',
        contrasena: '',
        primerNombre: '',
        segundoNombre: '',
        primerApellido: '',
        segundoApellido: '',
        rol: ''
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError('Error al crear usuario: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const selectedRole = rolesAdministrativos.find(r => r.id === formData.rol);

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-600 p-6 rounded-lg">
        <h2 className="text-2xl font-bold text-blue-900 mb-2">Crear Administrador</h2>
        <p className="text-blue-700">Crea nuevos usuarios con roles administrativos específicos</p>
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

      {/* Selector de Roles */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Selecciona el Rol Administrativo</h3>
        <div className="grid grid-cols-1 gap-4">
          {rolesAdministrativos.map(role => (
            <div
              key={role.id}
              onClick={() => handleRoleSelect(role.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                formData.rol === role.id
                  ? `${role.color} border-b-4 ring-2 ring-offset-2 ring-blue-400`
                  : `${role.color} border-gray-300 hover:border-gray-400`
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{role.icono}</span>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 text-lg">{role.nombre}</h4>
                  <p className="text-sm text-gray-600 mb-3">{role.descripcion}</p>
                  <div className="text-xs text-gray-700 space-y-1">
                    <p className="font-semibold">Funciones principales:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      {role.funciones.map((func, idx) => (
                        <li key={idx}>{func}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                {formData.rol === role.id && (
                  <div className="text-2xl">✓</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Formulario de Datos */}
      {formData.rol && (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800">Datos del Usuario</h3>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Id Usuario *
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

          <div className="grid grid-cols-2 gap-4">
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

          <div className="grid grid-cols-2 gap-4">
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

          <div>
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

          <div>
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

          {/* Resumen del rol seleccionado */}
          {selectedRole && (
            <div className={`p-4 rounded-lg border-l-4 ${selectedRole.color}`}>
              <p className="text-sm text-gray-700">
                <strong>Rol Seleccionado:</strong> {selectedRole.nombre}
              </p>
              <p className="text-sm text-gray-600 mt-2">{selectedRole.descripcion}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition"
          >
            {loading ? 'Creando usuario...' : '✓ Crear Usuario Administrativo'}
          </button>
        </form>
      )}

      {!formData.rol && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-600">
          <p>Selecciona un rol administrativo para continuar</p>
        </div>
      )}
    </div>
  );
};

export default CrearAdministrador;
