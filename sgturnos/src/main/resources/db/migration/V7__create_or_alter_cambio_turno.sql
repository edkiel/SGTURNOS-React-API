-- Crea la tabla cambio_turno si no existe, con ambas fechas de intercambio
CREATE TABLE IF NOT EXISTS cambio_turno (
  id_cambio BIGINT PRIMARY KEY AUTO_INCREMENT,
  id_usuario_solicitante BIGINT NOT NULL,
  id_usuario_compañero BIGINT NOT NULL,
  fecha_turno DATE NULL,
  fecha_turno_compañero DATE NULL,
  descripcion VARCHAR(500),
  estado VARCHAR(255),
  motivo_rechazo VARCHAR(500),
  fecha_solicitud DATETIME NOT NULL,
  aprobacion_compañero BOOLEAN DEFAULT FALSE,
  fecha_respuesta_compañero DATETIME NULL,
  aprobacion_jefe BOOLEAN DEFAULT FALSE,
  aprobacion_operaciones BOOLEAN DEFAULT FALSE,
  aprobacion_rrhh BOOLEAN DEFAULT FALSE,
  aplicada_a_malla BOOLEAN DEFAULT FALSE,
  fecha_aprobacion_final DATETIME NULL,
  CONSTRAINT fk_cambio_turno_solicitante FOREIGN KEY (id_usuario_solicitante) REFERENCES usuario(id_usuario),
  CONSTRAINT fk_cambio_turno_compañero FOREIGN KEY (id_usuario_compañero) REFERENCES usuario(id_usuario)
);

-- Asegura que la nueva columna exista si la tabla ya estaba creada
ALTER TABLE cambio_turno
  ADD COLUMN IF NOT EXISTS fecha_turno_compañero DATE NULL AFTER fecha_turno;

-- Índices para mejorar consultas por estado y aprobaciones
CREATE INDEX IF NOT EXISTS idx_cambio_turno_estado ON cambio_turno (estado);
CREATE INDEX IF NOT EXISTS idx_cambio_turno_solicitante ON cambio_turno (id_usuario_solicitante);
CREATE INDEX IF NOT EXISTS idx_cambio_turno_compañero ON cambio_turno (id_usuario_compañero);
