import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Componente Toast - Notificación elegante que aparece y se desvanece
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Duración en ms (por defecto 4000)
 * @param {function} onClose - Callback al cerrar
 * @param {number} index - Índice del toast para apilar múltiples
 */
const Toast = ({ message, type = 'success', duration = 4000, onClose, index = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  console.log('🎨 Toast renderizado:', { message, type, duration, index });

  useEffect(() => {
    // Aparecer con animación
    setTimeout(() => setIsVisible(true), 10);

    // Iniciar desvanecimiento antes de cerrar
    const fadeTimer = setTimeout(() => {
      setIsLeaving(true);
    }, duration - 500);

    // Cerrar completamente
    const closeTimer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(closeTimer);
    };
  }, [duration, onClose]);

  const typeStyles = {
    success: {
      bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
      icon: '✓',
      iconBg: 'bg-white/20',
      shadow: 'shadow-green-500/50'
    },
    error: {
      bg: 'bg-gradient-to-r from-red-500 to-rose-600',
      icon: '✕',
      iconBg: 'bg-white/20',
      shadow: 'shadow-red-500/50'
    },
    warning: {
      bg: 'bg-gradient-to-r from-amber-500 to-orange-600',
      icon: '⚠',
      iconBg: 'bg-white/20',
      shadow: 'shadow-amber-500/50'
    },
    info: {
      bg: 'bg-gradient-to-r from-blue-500 to-indigo-600',
      icon: 'ℹ',
      iconBg: 'bg-white/20',
      shadow: 'shadow-blue-500/50'
    }
  };

  const style = typeStyles[type] || typeStyles.success;

  // Calcular posición Y basada en el índice para apilar toasts
  const bottomPosition = 24 + (index * 90); // 24px inicial + 90px por cada toast

  const toastContent = (
    <div
      className={`fixed right-6 transform transition-all duration-500 ease-out ${
        isVisible && !isLeaving
          ? 'translate-y-0 opacity-100 scale-100'
          : 'translate-y-full opacity-0 scale-95'
      }`}
      style={{ 
        zIndex: 99999,
        bottom: `${bottomPosition}px`
      }}
    >
      <div
        className={`${style.bg} ${style.shadow} shadow-2xl rounded-xl p-4 pr-12 flex items-center gap-3 min-w-[320px] max-w-md relative`}
      >
        {/* Icono */}
        <div className={`${style.iconBg} rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0`}>
          <span className="text-white text-xl font-bold">{style.icon}</span>
        </div>

        {/* Mensaje */}
        <p className="text-white font-medium text-sm leading-tight flex-1">
          {message}
        </p>

        {/* Botón cerrar */}
        <button
          onClick={() => {
            setIsLeaving(true);
            setTimeout(() => {
              if (onClose) onClose();
            }, 300);
          }}
          className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Barra de progreso */}
        <div className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-bl-xl overflow-hidden w-full">
          <div
            className="h-full bg-white transition-all ease-linear animate-progress-bar"
            style={{
              animationDuration: `${duration}ms`
            }}
          />
        </div>
      </div>
    </div>
  );

  return createPortal(toastContent, document.body);
};

export default Toast;
