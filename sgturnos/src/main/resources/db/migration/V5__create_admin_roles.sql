-- Migración V5: Crear roles administrativos específicos
-- Fecha: 2025-12-11
-- Descripción: Agrega 3 roles administrativos con responsabilidades específicas:
--   1. JEFE_INMEDIATO: Revisa y aprueba mallas y novedades
--   2. OPERACIONES_CLINICAS: Crea, publica y envía mallas después de aprobaciones
--   3. RECURSOS_HUMANOS: Verifica mallas y novedades para nómina

-- Insertar los nuevos roles (si no existen)
INSERT INTO rol (id_rol, Rol, id_departamento) 
VALUES 
    ('JEFE_INMEDIATO', 'Jefe Inmediato', 'ADM001'),
    ('OPERACIONES_CLINICAS', 'Operaciones Clínicas', 'ADM002'),
    ('RECURSOS_HUMANOS', 'Recursos Humanos', 'ADM003')
ON DUPLICATE KEY UPDATE Rol = VALUES(Rol);

-- Nota: Los usuarios con estos roles pueden ser asignados manualmente
-- mediante UPDATE usuario SET id_rol = 'JEFE_INMEDIATO' WHERE id_usuario = X;
