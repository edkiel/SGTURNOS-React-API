-- Crear tabla tipo_novedad si no existe
CREATE TABLE IF NOT EXISTS tipo_novedad (
    id_tipo BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(500),
    requiere_fechas BOOLEAN DEFAULT false,
    activo BOOLEAN DEFAULT true
);

-- Insertar los 6 tipos de novedades
INSERT IGNORE INTO tipo_novedad (nombre, descripcion, requiere_fechas, activo) VALUES 
('Vacaciones', 'Solicitud de vacaciones del personal', true, true);

INSERT IGNORE INTO tipo_novedad (nombre, descripcion, requiere_fechas, activo) VALUES 
('Incapacidades', 'Solicitud de incapacidad médica o licencia por enfermedad', true, true);

INSERT IGNORE INTO tipo_novedad (nombre, descripcion, requiere_fechas, activo) VALUES 
('Permisos', 'Solicitud de permiso especial con fecha definida', true, true);

INSERT IGNORE INTO tipo_novedad (nombre, descripcion, requiere_fechas, activo) VALUES 
('Cambios de turnos', 'Solicitud para cambiar turno asignado con otro personal', false, true);

INSERT IGNORE INTO tipo_novedad (nombre, descripcion, requiere_fechas, activo) VALUES 
('Imprevistos', 'Evento imprevisto que afecta la asignación de turno', false, true);

INSERT IGNORE INTO tipo_novedad (nombre, descripcion, requiere_fechas, activo) VALUES 
('Calamidad', 'Situación de calamidad personal (muerte en familia, desastre, etc)', false, true);
