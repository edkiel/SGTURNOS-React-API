import React, { useState, useEffect } from 'react';
import { api } from '../../api';

/**
 * Badge pequeño que muestra el contador de novedades pendientes
 * según el rol del usuario logueado
 */
const BadgeNovedadesPendientes = ({ rol }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    cargarContador();
    // Actualizar cada 60 segundos
    const interval = setInterval(cargarContador, 60000);
    return () => clearInterval(interval);
  }, [rol]);

  const cargarContador = async () => {
    try {
      let endpoint = '';
      const roleName = rol?.toUpperCase() || '';

      if (roleName.includes('ADMIN')) {
        // Admin: contar todas las pendientes
        endpoint = '/novedades/contar-pendientes-admin';
      } else if (roleName.includes('JEFE')) {
        endpoint = '/novedades/contar-pendientes-jefe';
      } else if (roleName.includes('OPERACIONES')) {
        endpoint = '/novedades/contar-pendientes-operaciones';
      } else if (roleName.includes('RECURSOS') || roleName.includes('RRHH')) {
        endpoint = '/novedades/contar-pendientes-rrhh';
      } else {
        // Usuario regular: no mostrar badge
        setCount(0);
        return;
      }

      const response = await api.get(endpoint);
      setCount(response.data.count || 0);
    } catch (err) {
      console.error('Error cargando contador de novedades:', err);
      setCount(0);
    }
  };

  if (count === 0) return null;

  return (
    <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-orange-500 rounded-full animate-pulse">
      {count}
    </span>
  );
};

export default BadgeNovedadesPendientes;
