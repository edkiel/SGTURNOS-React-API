-- Tabla para registrar las aprobaciones de novedades (múltiples aprobadores)
CREATE TABLE IF NOT EXISTS aprobacion_novedad (
    id_aprobacion BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_novedad BIGINT NOT NULL,
    id_usuario_aprobador BIGINT NOT NULL,
    tipo_aprobador VARCHAR(50) NOT NULL, -- 'JEFE_INMEDIATO', 'OPERACIONES_CLINICAS', 'RECURSOS_HUMANOS'
    estado_aprobacion VARCHAR(50) DEFAULT 'PENDIENTE', -- 'PENDIENTE', 'APROBADA', 'RECHAZADA'
    motivo_rechazo VARCHAR(500),
    fecha_aprobacion DATETIME,
    FOREIGN KEY (id_novedad) REFERENCES novedad(id_novedad) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario_aprobador) REFERENCES usuario(id_usuario),
    UNIQUE KEY unique_aprobacion (id_novedad, tipo_aprobador)
);

-- Modificar tabla novedad para agregar campos de control de aprobaciones
ALTER TABLE novedad 
ADD COLUMN IF NOT EXISTS aprobacion_jefe BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS aprobacion_operaciones BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS aprobacion_rrhh BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS aplicada_a_malla BOOLEAN DEFAULT false;
