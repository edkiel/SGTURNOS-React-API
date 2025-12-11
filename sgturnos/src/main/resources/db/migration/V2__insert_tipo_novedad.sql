-- Script para inicializar tipos de novedades en SGTURNOS
-- Insertar los 6 tipos de novedades: Vacaciones, Incapacidades, Permisos, Cambios de turnos, Imprevistos, Calamidad

INSERT INTO tipo_novedad (nombre, descripcion, requiere_fechas, activo) VALUES 
('Vacaciones', 'Solicitud de vacaciones del personal', true, true);

INSERT INTO tipo_novedad (nombre, descripcion, requiere_fechas, activo) VALUES 
('Incapacidades', 'Solicitud de incapacidad médica o licencia por enfermedad', true, true);

INSERT INTO tipo_novedad (nombre, descripcion, requiere_fechas, activo) VALUES 
('Permisos', 'Solicitud de permiso especial con fecha definida', true, true);

INSERT INTO tipo_novedad (nombre, descripcion, requiere_fechas, activo) VALUES 
('Cambios de turnos', 'Solicitud para cambiar turno asignado con otro personal', false, true);

INSERT INTO tipo_novedad (nombre, descripcion, requiere_fechas, activo) VALUES 
('Imprevistos', 'Evento imprevisto que afecta la asignación de turno', false, true);

INSERT INTO tipo_novedad (nombre, descripcion, requiere_fechas, activo) VALUES 
('Calamidad', 'Situación de calamidad personal (muerte en familia, desastre, etc)', false, true);

-- COMMIT;
