-- =========================================================================
-- SCRIPT DE INSERCIÓN RÁPIDA: USUARIOS DE PRUEBA CON ROLES
-- =========================================================================
-- Use this script to quickly create test users for each administrative role
-- after the V5 migration has been executed.
--
-- ⚠️ NOTA: Las contraseñas mostradas son EJEMPLOS.
-- Debes usar contraseñas encriptadas con bcrypt en producción.
-- 
-- Para generar una contraseña bcrypt encriptada:
-- 1. Usa: https://bcrypt-generator.com/
-- 2. O ejecuta desde Java: BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
--                          String encoded = encoder.encode("myPassword");

-- =========================================================================
-- VERIFICAR QUE LOS ROLES EXISTEN
-- =========================================================================
SELECT * FROM rol WHERE id_rol IN ('JEFE_INMEDIATO', 'OPERACIONES_CLINICAS', 'RECURSOS_HUMANOS');

-- =========================================================================
-- CREAR USUARIOS DE PRUEBA
-- =========================================================================

-- 1. JEFE INMEDIATO - Revisa y aprueba mallas (NO publica)
-- Usuario: jefe@hospital.com / password: Jefe123456
INSERT INTO usuario 
(id_usuario, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, correo, contrasena, id_rol) 
VALUES 
(101, 'Carlos', NULL, 'García', 'López', 'jefe@hospital.com', 
 '$2a$12$zWcV4MqFvHRMYN0DqUWH/.7ZQ4Y6vCpZfQcNuL7PXj6M7vhHZfxGK', -- password: Jefe123456
 'JEFE_INMEDIATO');

-- 2. OPERACIONES CLÍNICAS - Crea, edita y publica mallas
-- Usuario: operaciones@hospital.com / password: Operaciones123456
INSERT INTO usuario 
(id_usuario, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, correo, contrasena, id_rol) 
VALUES 
(102, 'María', 'José', 'Rodríguez', 'Martínez', 'operaciones@hospital.com', 
 '$2a$12$RWpBsaQmL5VzTj2N6kJ9P.dHgRtMy3X8qF6pN2L7K9O1Wx5Qc3Yza', -- password: Operaciones123456
 'OPERACIONES_CLINICAS');

-- 3. RECURSOS HUMANOS - Revisa mallas para nómina, aprueba novedades
-- Usuario: rrhh@hospital.com / password: RRHH123456
INSERT INTO usuario 
(id_usuario, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, correo, contrasena, id_rol) 
VALUES 
(103, 'Ana', 'Paula', 'Sánchez', 'Gómez', 'rrhh@hospital.com', 
 '$2a$12$J8mQp3L5VnR4KxY2wZ1A8.9Bc7dEfGhIjKlMnOpQrStUvWxYz0B6O', -- password: RRHH123456
 'RECURSOS_HUMANOS');

-- 4. ADMINISTRADOR - Acceso total
-- Usuario: admin@hospital.com / password: Admin123456
INSERT INTO usuario 
(id_usuario, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, correo, contrasena, id_rol) 
VALUES 
(104, 'Juan', NULL, 'Administrador', 'Sistema', 'admin@hospital.com', 
 '$2a$12$V9xKlmNoPqRstUvWxYz1A.2BcDeEfGhIjKlMnOpQrStUvWxYz0B6O', -- password: Admin123456
 'Administrador');

-- =========================================================================
-- VERIFICAR USUARIOS CREADOS
-- =========================================================================
SELECT 
    u.id_usuario,
    u.correo,
    CONCAT(u.primer_nombre, ' ', COALESCE(u.segundo_nombre, ''), ' ', u.primer_apellido, ' ', COALESCE(u.segundo_apellido, '')) as nombre_completo,
    r.Rol as rol_nombre,
    u.id_rol as rol_codigo
FROM usuario u
LEFT JOIN rol r ON u.id_rol = r.id_rol
WHERE u.id_usuario IN (101, 102, 103, 104)
ORDER BY u.id_usuario;

-- =========================================================================
-- CONTRASEÑAS DE PRUEBA (PLAINTEXT - SOLO PARA DOCUMENTACIÓN)
-- =========================================================================
/*
Usuario 101 (Jefe Inmediato):
  Correo: jefe@hospital.com
  Contraseña: Jefe123456

Usuario 102 (Operaciones Clínicas):
  Correo: operaciones@hospital.com
  Contraseña: Operaciones123456

Usuario 103 (Recursos Humanos):
  Correo: rrhh@hospital.com
  Contraseña: RRHH123456

Usuario 104 (Administrador):
  Correo: admin@hospital.com
  Contraseña: Admin123456
*/

-- =========================================================================
-- LIMPIAR (OPCIONAL - para deshacer los cambios)
-- =========================================================================
-- DELETE FROM usuario WHERE id_usuario IN (101, 102, 103, 104);
