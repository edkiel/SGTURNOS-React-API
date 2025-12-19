import React, { useState, useEffect } from 'react';
import { api } from '../../api';

/**
 * Componente para mostrar alertas de mallas que requieren modificación
 * debido a novedades aprobadas
 */
const AlertasMalla = ({ usuarioId }) => {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarAlertas();
  }, []);

  const cargarAlertas = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/alertas-malla/pendientes`);
      setAlertas(response.data);
    } catch (err) {
      console.error('Error cargando alertas:', err);
      setError('Error al cargar las alertas');
    } finally {
      setLoading(false);
    }
  };

  const procesarAlerta = async (idAlerta) => {
    try {
      await api.post(`/alertas-malla/${idAlerta}/procesar`, {
        idUsuario: usuarioId,
        observaciones: 'Procesada desde el dashboard'
      });
      cargarAlertas(); // Recargar alertas
    } catch (err) {
      console.error('Error procesando alerta:', err);
      setError('Error al procesar la alerta');
    }
  };

  const obtenerColorPorTipo = (tipoAccion) => {
    switch (tipoAccion) {
      case 'RECALCULO_MES_ACTUAL':
        return 'bg-red-100 border-red-400 text-red-800';
      case 'EVITAR_PROGRAMACION_FUTURO':
        return 'bg-yellow-100 border-yellow-400 text-yellow-800';
      default:
        return 'bg-gray-100 border-gray-400 text-gray-800';
    }
  };

  const obtenerTextoAccion = (tipoAccion) => {
    switch (tipoAccion) {
      case 'RECALCULO_MES_ACTUAL':
        return '🔴 REQUIERE RECALCULAR MALLA ACTUAL';
      case 'EVITAR_PROGRAMACION_FUTURO':
        return '⚠️ EVITAR PROGRAMACIÓN FUTURA';
      default:
        return tipoAccion;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-md">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Cargando alertas...</span>
        </div>
      </div>
    );
  }

  if (alertas.length === 0) {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
        <div className="flex items-center">
          <span className="text-3xl mr-4">✅</span>
          <div>
            <h3 className="text-lg font-semibold text-green-800">No hay alertas pendientes</h3>
            <p className="text-green-600 text-sm">Todas las mallas están actualizadas</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto p-4 sm:p-6 lg:p-8 bg-white rounded-lg shadow-lg" style={{ maxWidth: '1400px' }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <span className="text-3xl mr-3">🚨</span>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Alertas de Mallas</h2>
            <p className="text-gray-600 text-sm">
              {alertas.length} alerta{alertas.length !== 1 ? 's' : ''} pendiente{alertas.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button
          onClick={cargarAlertas}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          🔄 Actualizar
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {alertas.map((alerta) => (
          <div
            key={alerta.idAlerta}
            className={`border-2 rounded-lg p-4 ${obtenerColorPorTipo(alerta.tipoAccion)}`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <span className="font-bold text-lg">
                    {obtenerTextoAccion(alerta.tipoAccion)}
                  </span>
                </div>
                
                <div className="text-sm space-y-1">
                  <p><span className="font-semibold">Usuario:</span> {alerta.novedad?.usuario?.primerNombre} {alerta.novedad?.usuario?.primerApellido}</p>
                  <p><span className="font-semibold">Tipo:</span> {alerta.novedad?.tipo?.nombre}</p>
                  <p><span className="font-semibold">Período afectado:</span> {alerta.mesAfectado}/{alerta.anioAfectado}</p>
                  <p><span className="font-semibold">Fechas:</span> {alerta.novedad?.fechaInicio} al {alerta.novedad?.fechaFin}</p>
                  {alerta.observaciones && (
                    <p className="mt-2 italic">{alerta.observaciones}</p>
                  )}
                </div>
              </div>
              
              <div className="ml-4 flex flex-col gap-2">
                <button
                  onClick={() => procesarAlerta(alerta.idAlerta)}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                >
                  ✓ Marcar como procesada
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">📋 Instrucciones:</h4>
        <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
          <li><span className="text-red-600 font-semibold">RECALCULAR MALLA ACTUAL:</span> La novedad afecta el mes en curso. Debe recalcular la malla publicada.</li>
          <li><span className="text-yellow-600 font-semibold">EVITAR PROGRAMACIÓN FUTURA:</span> La novedad es para meses futuros. No programar a este usuario.</li>
          <li>El usuario de <strong>Operaciones Clínicas</strong> debe generar/actualizar la malla.</li>
          <li>El <strong>Jefe Directo</strong> debe revisar y aprobar los cambios.</li>
          <li>Finalmente, se debe <strong>publicar</strong> la malla modificada.</li>
        </ol>
      </div>
    </div>
  );
};

export default AlertasMalla;
