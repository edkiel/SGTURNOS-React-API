import React, { useState, useEffect } from 'react';
import { api } from '../../api';

/**
 * Componente para mostrar información del rol y permisos del usuario
 */
const RolInfo = ({ usuarioId }) => {
  const [permisos, setPermisos] = useState(null);
  const [descripcion, setDescripcion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarPermisos = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/roles/permisos/${usuarioId}`);
      setPermisos(response.data);

      // Cargar descripción del rol
      if (response.data.rol) {
        const descResponse = await api.get(`/api/roles/descripcion/${encodeURIComponent(response.data.rol)}`);
        setDescripcion(descResponse.data);
      }
    } catch (err) {
      console.error('Error cargando permisos:', err);
      setError('Error al cargar información de permisos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (usuarioId) {
      cargarPermisos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuarioId]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !permisos) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error || 'No se pudo cargar la información'}</p>
      </div>
    );
  }

  const getRolColor = (rol) => {
    switch (rol) {
      case 'Jefe Inmediato':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Operaciones Clínicas':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Recursos Humanos':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Administrador':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Encabezado con rol */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Tu Rol en el Sistema</h3>
        <div className={`inline-flex items-center px-4 py-2 rounded-full border-2 ${getRolColor(permisos.rol)}`}>
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
          <span className="font-semibold text-lg">{permisos.rol}</span>
        </div>
      </div>

      {/* Descripción del rol */}
      {descripcion && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-700 mb-2">Responsabilidades:</h4>
          <p className="text-gray-600 text-sm mb-3">{descripcion.responsabilidades}</p>
          <h4 className="font-semibold text-gray-700 mb-2">Permisos:</h4>
          <p className="text-gray-600 text-sm">{descripcion.permisos}</p>
        </div>
      )}

      {/* Lista de capacidades específicas */}
      <div className="space-y-2">
        <h4 className="font-semibold text-gray-700 mb-3">Capacidades del Sistema:</h4>
        
        {permisos.puedeGestionarMallas && (
          <div className="flex items-center text-green-600">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">Crear y editar mallas de turnos</span>
          </div>
        )}

        {permisos.puedePublicarMallas && (
          <div className="flex items-center text-green-600">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">Publicar mallas aprobadas</span>
          </div>
        )}

        {permisos.puedeRevisarMallas && (
          <div className="flex items-center text-green-600">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">Revisar y aprobar mallas</span>
          </div>
        )}

        {permisos.puedeRevisarNovedadesNomina && (
          <div className="flex items-center text-green-600">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">Revisar novedades para nómina</span>
          </div>
        )}

        {permisos.esAdministrador && (
          <div className="flex items-center text-red-600 font-semibold">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">Acceso total al sistema (Administrador)</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RolInfo;
