-- Crear tabla para alertas de modificaciones en mallas
CREATE TABLE alerta_malla (
    id_alerta BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_novedad BIGINT NOT NULL,
    tipo_accion VARCHAR(50) NOT NULL COMMENT 'RECALCULO_MES_ACTUAL o EVITAR_PROGRAMACION_FUTURO',
    mes_afectado INT NOT NULL,
    anio_afectado INT NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE' COMMENT 'PENDIENTE, PROCESADA, IGNORADA',
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_procesamiento DATETIME,
    observaciones TEXT,
    id_usuario_procesador BIGINT,
    FOREIGN KEY (id_novedad) REFERENCES novedad(id_novedad) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario_procesador) REFERENCES usuario(id_usuario) ON DELETE SET NULL,
    INDEX idx_estado (estado),
    INDEX idx_mes_anio (mes_afectado, anio_afectado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Alertas de modificaciones en mallas por novedades';
