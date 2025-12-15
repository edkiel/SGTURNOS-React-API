import React, { useState, useEffect } from 'react';
import { api } from '../../api';

/**
 * Badge pequeño que muestra el contador de alertas pendientes
 */
const BadgeAlertas = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    cargarContador();
    // Actualizar cada 60 segundos
    const interval = setInterval(cargarContador, 60000);
    return () => clearInterval(interval);
  }, []);

  const cargarContador = async () => {
    try {
      const response = await api.get(`/alertas-malla/contar`);
      setCount(response.data.count || 0);
    } catch (err) {
      console.error('Error cargando contador de alertas:', err);
    }
  };

  if (count === 0) return null;

  return (
    <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full animate-pulse">
      {count}
    </span>
  );
};

export default BadgeAlertas;
