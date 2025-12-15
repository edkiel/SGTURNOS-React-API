-- =========================================================================
-- GUÍA PARA PROBAR ROLES ADMINISTRATIVOS
-- =========================================================================
-- Este script proporciona comandos SQL para:
-- 1. Crear usuarios de prueba con roles específicos
-- 2. Verificar que los roles están correctamente asignados
-- 3. Consultar permisos de cada usuario

-- =========================================================================
-- 1. CREAR USUARIOS DE PRUEBA CON ROLES ESPECÍFICOS
-- =========================================================================

-- Jefe Inmediato - Puede revisar y aprobar mallas (NO publicar)
INSERT INTO usuario (id_usuario, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, correo, contrasena, id_rol)
VALUES (101, 'Carlos', NULL, 'García', 'López', 'jefe.inmediato@hospital.com', '$2a$10$encrypted_password_here', 'JEFE_INMEDIATO');

-- Operaciones Clínicas - Crea, edita y publica mallas
INSERT INTO usuario (id_usuario, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, correo, contrasena, id_rol)
VALUES (102, 'María', 'José', 'Rodríguez', 'Martínez', 'operaciones@hospital.com', '$2a$10$encrypted_password_here', 'OPERACIONES_CLINICAS');

-- Recursos Humanos - Revisa mallas para nómina, aprueba novedades
INSERT INTO usuario (id_usuario, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, correo, contrasena, id_rol)
VALUES (103, 'Ana', 'Paula', 'Sánchez', 'Gómez', 'rrhh@hospital.com', '$2a$10$encrypted_password_here', 'RECURSOS_HUMANOS');

-- =========================================================================
-- 2. VERIFICAR ROLES CREADOS
-- =========================================================================

-- Ver todos los roles en el sistema
SELECT * FROM rol;

-- Ver todos los usuarios con sus roles
SELECT 
    u.id_usuario,
    u.correo,
    u.primer_nombre,
    u.primer_apellido,
    r.Rol as nombre_rol,
    r.id_rol as id_rol_codigo
FROM usuario u
LEFT JOIN rol r ON u.id_rol = r.id_rol
ORDER BY r.Rol;

-- Ver específicamente los usuarios administrativos
SELECT 
    u.id_usuario,
    u.correo,
    CONCAT(u.primer_nombre, ' ', COALESCE(u.segundo_nombre, ''), ' ', u.primer_apellido, ' ', COALESCE(u.segundo_apellido, '')) as nombre_completo,
    r.Rol as nombre_rol
FROM usuario u
LEFT JOIN rol r ON u.id_rol = r.id_rol
WHERE r.id_rol IN ('JEFE_INMEDIATO', 'OPERACIONES_CLINICAS', 'RECURSOS_HUMANOS', 'Administrador');

-- =========================================================================
-- 3. ACTUALIZAR ROL DE USUARIO EXISTENTE
-- =========================================================================

-- Ejemplo: Cambiar un usuario existente a Jefe Inmediato
-- UPDATE usuario SET id_rol = 'JEFE_INMEDIATO' WHERE id_usuario = 5;

-- Ejemplo: Cambiar a Operaciones Clínicas
-- UPDATE usuario SET id_rol = 'OPERACIONES_CLINICAS' WHERE id_usuario = 6;

-- Ejemplo: Cambiar a Recursos Humanos
-- UPDATE usuario SET id_rol = 'RECURSOS_HUMANOS' WHERE id_usuario = 7;

-- =========================================================================
-- 4. FLUJO DE APROBACIÓN DE MALLAS (SIMULADO)
-- =========================================================================

-- Paso 1: Operaciones Clínicas crea una malla
-- (La malla se crea con estado = 'CREADA' o 'EN_REVISIÓN')

-- Paso 2: Jefe Inmediato la revisa y aprueba
-- - Accede a /api/mallas/aprobaciones/aprobar-jefe/{id}
-- - La malla cambia a estado = 'APROBADA_JEFE'
-- - NO puede publicarla

-- Paso 3: Recursos Humanos verifica para nómina y aprueba
-- - Accede a /api/mallas/aprobaciones/aprobar-rrhh/{id}
-- - Verifica novedades del personal
-- - La malla cambia a estado = 'APROBADA_RRHH'
-- - NO puede publicarla

-- Paso 4: Operaciones Clínicas ahora SÍ puede publicar
-- - Verifica que estado = 'APROBADA_RRHH'
-- - Publica la malla para uso en operaciones
-- - La malla cambia a estado = 'PUBLICADA'

-- =========================================================================
-- 5. FLUJO DE APROBACIÓN DE NOVEDADES (VACACIONES, INCAPACIDADES, ETC)
-- =========================================================================

-- Paso 1: Usuario normal crea una novedad (vacación, incapacidad, etc)
-- - POST /api/novedades/crear
-- - Estado = 'PENDIENTE'

-- Paso 2: Jefe Inmediato aprueba
-- - POST /api/aprobaciones/aprobar
-- - Novedad con aprobacion_jefe = true

-- Paso 3: Operaciones Clínicas aprueba
-- - POST /api/aprobaciones/aprobar
-- - Novedad con aprobacion_operaciones = true

-- Paso 4: Recursos Humanos aprueba
-- - POST /api/aprobaciones/aprobar
-- - Novedad con aprobacion_rrhh = true
-- - Si es VACACIÓN: Se ajusta automáticamente la malla

-- =========================================================================
-- 6. CONSULTAS ÚTILES PARA AUDITORÍA
-- =========================================================================

-- Ver cuántos usuarios tiene cada rol
SELECT 
    r.Rol,
    COUNT(u.id_usuario) as cantidad_usuarios
FROM rol r
LEFT JOIN usuario u ON r.id_rol = u.id_rol
GROUP BY r.Rol;

-- Ver si hay usuarios sin rol asignado
SELECT 
    id_usuario,
    correo,
    primer_nombre,
    primer_apellido,
    id_rol
FROM usuario
WHERE id_rol IS NULL OR id_rol = '';

-- =========================================================================
-- NOTAS IMPORTANTES:
-- =========================================================================
-- 1. Los usuarios de prueba tienen contraseña encriptada.
--    Para cambiar contraseña real, usar el endpoint /api/auth/login
--
-- 2. Cada rol tiene permisos específicos:
--    - JEFE_INMEDIATO: Revisar + Aprobar mallas (NO publicar)
--    - OPERACIONES_CLINICAS: Crear + Editar + Publicar mallas
--    - RECURSOS_HUMANOS: Revisar + Aprobar mallas + Revisar novedades nómina
--    - Administrador: Acceso total
--
-- 3. Una malla NO puede publicarse sin ambas aprobaciones
--    (Jefe Inmediato + Recursos Humanos)
--
-- 4. Una novedad es rechazada completamente si cualquier aprobador la rechaza
--
-- 5. Usar /api/roles/permisos/{idUsuario} para verificar permisos desde el frontend
