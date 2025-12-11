-- Crear tabla novedad si no existe
CREATE TABLE IF NOT EXISTS novedad (
    id_novedad BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_usuario BIGINT NOT NULL,
    id_tipo BIGINT NOT NULL,
    fecha_inicio DATE,
    fecha_fin DATE,
    descripcion VARCHAR(500),
    estado VARCHAR(50) DEFAULT 'PENDIENTE',
    motivo_rechazo VARCHAR(500),
    fecha_solicitud DATETIME NOT NULL,
    fecha_aprobacion DATETIME,
    id_usuario_admin BIGINT,
    soporte_path VARCHAR(500),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    FOREIGN KEY (id_tipo) REFERENCES tipo_novedad(id_tipo),
    FOREIGN KEY (id_usuario_admin) REFERENCES usuario(id_usuario)
);
