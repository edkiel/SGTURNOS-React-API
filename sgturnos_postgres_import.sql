-- ========================================================================
-- SCRIPT DE IMPORTACIÓN POSTGRES - CONVERTIDO DESDE MYSQL
-- ========================================================================
-- Eliminar tablas existentes (creadas por Spring Boot)
DROP TABLE IF EXISTS alerta_malla CASCADE;
DROP TABLE IF EXISTS aprobacion_novedad CASCADE;
DROP TABLE IF EXISTS cambio_turno CASCADE;
DROP TABLE IF EXISTS novedad CASCADE;
DROP TABLE IF EXISTS malla_turnos CASCADE;
DROP TABLE IF EXISTS asignacion_turno CASCADE;
DROP TABLE IF EXISTS capacitacion CASCADE;
DROP TABLE IF EXISTS colaborador CASCADE;
DROP TABLE IF EXISTS empleado CASCADE;
DROP TABLE IF EXISTS turno CASCADE;
DROP TABLE IF EXISTS usuario CASCADE;
DROP TABLE IF EXISTS tipo_novedad CASCADE;
DROP TABLE IF EXISTS rol CASCADE;
DROP TABLE IF EXISTS horario CASCADE;
DROP TABLE IF EXISTS estado_capacitacion CASCADE;
DROP TABLE IF EXISTS estado_novedad CASCADE;
DROP TABLE IF EXISTS tema_capacitacion CASCADE;
DROP TABLE IF EXISTS departamento CASCADE;

-- ========================================================================
-- CREAR TABLAS (POSTGRES)
-- ========================================================================

CREATE TABLE departamento (
  id_departamento VARCHAR(10) PRIMARY KEY,
  departamento VARCHAR(50)
);

CREATE TABLE estado_capacitacion (
  id_estado_cap VARCHAR(30) PRIMARY KEY,
  estado_de_cap VARCHAR(50) NOT NULL
);

CREATE TABLE estado_novedad (
  id_estado_nov VARCHAR(20) PRIMARY KEY,
  estado_nov VARCHAR(20) NOT NULL
);

CREATE TABLE horario (
  id_horario VARCHAR(10) PRIMARY KEY,
  hora_inicio VARCHAR(255),
  hora_fin VARCHAR(255),
  tipo VARCHAR(255)
);

CREATE TABLE rol (
  id_rol VARCHAR(10) PRIMARY KEY,
  rol VARCHAR(255),
  id_departamento VARCHAR(10),
  FOREIGN KEY (id_departamento) REFERENCES departamento(id_departamento) ON DELETE CASCADE
);

CREATE TABLE tema_capacitacion (
  id_tema VARCHAR(30) PRIMARY KEY,
  tema VARCHAR(50) NOT NULL
);

CREATE TABLE tipo_novedad (
  id_tipo BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion VARCHAR(500),
  requiere_fechas BOOLEAN DEFAULT false,
  activo BOOLEAN DEFAULT true
);

CREATE TABLE usuario (
  id_usuario BIGINT PRIMARY KEY,
  primer_nombre VARCHAR(255),
  segundo_nombre VARCHAR(255),
  primer_apellido VARCHAR(255),
  segundo_apellido VARCHAR(255),
  id_rol VARCHAR(20),
  correo VARCHAR(255),
  contrasena VARCHAR(255),
  FOREIGN KEY (id_rol) REFERENCES rol(id_rol)
);

CREATE TABLE turno (
  id_turno BIGSERIAL PRIMARY KEY,
  fecha_ini DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  id_horario VARCHAR(20) NOT NULL,
  FOREIGN KEY (id_horario) REFERENCES horario(id_horario) ON DELETE CASCADE
);

CREATE TABLE capacitacion (
  id_capacitacion SERIAL PRIMARY KEY,
  id_tema VARCHAR(30) NOT NULL,
  fecha DATE NOT NULL,
  id_estado_cap VARCHAR(30) NOT NULL,
  id_empleado VARCHAR(20),
  FOREIGN KEY (id_tema) REFERENCES tema_capacitacion(id_tema) ON DELETE CASCADE,
  FOREIGN KEY (id_estado_cap) REFERENCES estado_capacitacion(id_estado_cap) ON DELETE CASCADE
);

CREATE TABLE colaborador (
  id_colaborador BIGSERIAL PRIMARY KEY,
  id_rol VARCHAR(255),
  id_usuario BIGINT UNIQUE,
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
  FOREIGN KEY (id_rol) REFERENCES rol(id_rol)
);

CREATE TABLE empleado (
  id_empleado VARCHAR(20) PRIMARY KEY,
  id_rol VARCHAR(10) NOT NULL,
  id_usuario BIGINT,
  FOREIGN KEY (id_rol) REFERENCES rol(id_rol) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON UPDATE CASCADE
);

CREATE TABLE asignacion_turno (
  id_turno BIGINT NOT NULL,
  id_empleado VARCHAR(20) NOT NULL,
  fecha DATE NOT NULL,
  id_colaborador BIGINT NOT NULL,
  observaciones VARCHAR(255),
  PRIMARY KEY (id_turno, id_empleado),
  FOREIGN KEY (id_turno) REFERENCES turno(id_turno),
  FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (id_colaborador) REFERENCES colaborador(id_colaborador)
);

CREATE TABLE novedad (
  id_novedad BIGSERIAL PRIMARY KEY,
  id_usuario BIGINT NOT NULL,
  id_tipo BIGINT NOT NULL,
  fecha_inicio DATE,
  fecha_fin DATE,
  descripcion VARCHAR(500),
  estado VARCHAR(50) DEFAULT 'PENDIENTE',
  motivo_rechazo VARCHAR(500),
  fecha_solicitud TIMESTAMP NOT NULL,
  fecha_aprobacion TIMESTAMP,
  id_usuario_admin BIGINT,
  soporte_path VARCHAR(500),
  aprobacion_jefe BOOLEAN DEFAULT false,
  aprobacion_operaciones BOOLEAN DEFAULT false,
  aprobacion_rrhh BOOLEAN DEFAULT false,
  aplicada_a_malla BOOLEAN DEFAULT false,
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
  FOREIGN KEY (id_tipo) REFERENCES tipo_novedad(id_tipo),
  FOREIGN KEY (id_usuario_admin) REFERENCES usuario(id_usuario)
);

CREATE TABLE aprobacion_novedad (
  id_aprobacion BIGSERIAL PRIMARY KEY,
  id_novedad BIGINT NOT NULL,
  id_usuario_aprobador BIGINT NOT NULL,
  tipo_aprobador VARCHAR(50) NOT NULL,
  estado_aprobacion VARCHAR(50) DEFAULT 'PENDIENTE',
  motivo_rechazo VARCHAR(500),
  fecha_aprobacion TIMESTAMP,
  UNIQUE (id_novedad, tipo_aprobador),
  FOREIGN KEY (id_novedad) REFERENCES novedad(id_novedad) ON DELETE CASCADE,
  FOREIGN KEY (id_usuario_aprobador) REFERENCES usuario(id_usuario)
);

CREATE TABLE cambio_turno (
  id_cambio BIGSERIAL PRIMARY KEY,
  aplicada_a_malla BOOLEAN,
  aprobacion_compañero BOOLEAN,
  aprobacion_jefe BOOLEAN,
  aprobacion_operaciones BOOLEAN,
  aprobacion_rrhh BOOLEAN,
  descripcion VARCHAR(500),
  estado VARCHAR(255),
  fecha_aprobacion_final TIMESTAMP,
  fecha_respuesta_compañero TIMESTAMP,
  fecha_solicitud TIMESTAMP NOT NULL,
  fecha_turno DATE,
  fecha_turno_compañero DATE,
  motivo_rechazo VARCHAR(500),
  id_usuario_compañero BIGINT NOT NULL,
  id_usuario_solicitante BIGINT NOT NULL,
  FOREIGN KEY (id_usuario_compañero) REFERENCES usuario(id_usuario),
  FOREIGN KEY (id_usuario_solicitante) REFERENCES usuario(id_usuario)
);

CREATE TABLE malla_turnos (
  id_malla BIGSERIAL PRIMARY KEY,
  estado VARCHAR(20) NOT NULL,
  id_turno BIGINT NOT NULL,
  id_usuario BIGINT NOT NULL,
  FOREIGN KEY (id_turno) REFERENCES turno(id_turno),
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

CREATE TABLE alerta_malla (
  id_alerta BIGSERIAL PRIMARY KEY,
  anio_afectado INT NOT NULL,
  estado VARCHAR(20) NOT NULL,
  fecha_creacion TIMESTAMP NOT NULL,
  fecha_procesamiento TIMESTAMP,
  mes_afectado INT NOT NULL,
  observaciones TEXT,
  tipo_accion VARCHAR(50) NOT NULL,
  id_novedad BIGINT NOT NULL,
  id_usuario_procesador BIGINT,
  FOREIGN KEY (id_novedad) REFERENCES novedad(id_novedad),
  FOREIGN KEY (id_usuario_procesador) REFERENCES usuario(id_usuario)
);

-- ========================================================================
-- INSERTAR DATOS
-- ========================================================================

INSERT INTO departamento (id_departamento, departamento) VALUES
('D001', 'Recursos Humanos'),
('D002', 'Enfermería'),
('D003', 'Administración'),
('enfer01', NULL),
('eqreh03', NULL),
('medic02', NULL);

INSERT INTO estado_capacitacion (id_estado_cap, estado_de_cap) VALUES
('e_cap01', 'Programada'),
('e_cap02', 'Cancelada'),
('e_cap03', 'Realizada');

INSERT INTO estado_novedad (id_estado_nov, estado_nov) VALUES
('01_APRO', 'APROBADO'),
('02_RECH', 'RECHAZADO'),
('03_PEND', 'PENDIENTE');

INSERT INTO horario (id_horario, hora_inicio, hora_fin, tipo) VALUES
('h01', '07:00:00', '19:00:00', NULL),
('h02', '19:00:00', '07:00:00', NULL),
('h03', '07:00:00', '11:00:00', NULL);

INSERT INTO rol (id_rol, rol, id_departamento) VALUES
('adm05', 'ADMINISTRADOR', 'D003'),
('aux01', 'AUXILIAR', 'enfer01'),
('enf02', 'ENFERMERO', 'enfer01'),
('med03', 'MEDICO', 'medic02'),
('ter04', 'TERAPIA', 'eqreh03');

INSERT INTO tema_capacitacion (id_tema, tema) VALUES
('tcap01', 'Transferencias'),
('tcap02', 'Baño'),
('tcap03', 'Administración de Medicamentos'),
('tcap04', 'Manejo Cortopunzantes'),
('tcap05', 'Manejo de Residuos');

INSERT INTO tipo_novedad (id_tipo, nombre, descripcion, requiere_fechas, activo) VALUES
(1, 'Vacaciones', 'Solicitud de vacaciones del personal', true, true),
(2, 'Incapacidades', 'Solicitud de incapacidad médica o licencia por enfermedad', true, true),
(3, 'Permisos', 'Solicitud de permiso especial con fecha definida', true, true),
(4, 'Cambios de turnos', 'Solicitud para cambiar turno asignado con otro personal', false, true),
(5, 'Imprevistos', 'Evento imprevisto que afecta la asignación de turno', false, true),
(6, 'Calamidad', 'Situación de calamidad personal (muerte en familia, desastre, etc)', false, true);

INSERT INTO usuario (id_usuario, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, id_rol, correo, contrasena) VALUES
(11122, 'Veronica', 'Luciana', 'Lara', 'Carranza', 'ter04', 'veeronicalara@paliacare.com', '$2a$10$IHM1AjyuK1hUiWk2q5w.IeSEQwNFXZEDUsBiMOYMYPyljSzZJeV4O'),
(10203040, 'Rosa', 'Magnolia', 'Jimenez', 'Tafur', 'aux01', 'rosajimenez@palicare.com', '$2a$10$YAfJTQYrMA7fgq9cgLDHzuEJOUYYuGvuqjB6e2ftjq2lDKn8Yclva'),
(10293847, 'Oscar', 'Santiago', 'Campos', 'Ovalle', 'enf02', 'oscarcampos@paliacare.com', '$2a$10$Meg3MULCvSiZSNd4bzptj.Fowpd266qXJTCv8m1HDmZprmbxHNA9i'),
(10439581, 'Beatriz', 'Ana', 'Mendoza', 'Trump', 'aux01', 'beatrizmendoza@paliacare.com', '$2a$10$kRJI55eFNMGsS.ag4rI6uOKLXt7F/oacvh4Aw4etQGN1suhxNF5YW'),
(12233445, 'Victor', 'Pablo', 'Guerrero', 'Libano', 'aux01', 'victorguerrero@paliacare.com', '$2a$10$3Da9r4DxVgTd/t1US2EXj.EF0aPmLChw0vxn4hYBHZ8cYVJ8JGv9C'),
(13579246, 'Pedro', 'camilo', 'Sanchez', 'tolosa', 'aux01', 'pedrosanchez@paliacare.com', '$2a$10$YD.edb1arvvEjZ8O.ApKCegPsYShbwtmPUeSiCEsEQMNvl9P44MYW'),
(14142135, 'Isabel', 'Alejandra', 'Muñoz', 'Aguilar', 'aux01', 'isabelmunoz@paliacare.com', '$2a$10$5PxOIdz7asNl9W41njt7Cema0XsOS3.XBSErKUTfG0ymWtPIFkdfC'),
(16180339, 'Miguel', 'Camilo', 'Ruiz', 'Treller', 'aux01', 'miguelruiz@paliacare.com', '$2a$10$aiITjeKihgUKdCavsXFKR.HC7K.je/mwCpYz9roPiN9ZayOFYD6Ye'),
(20304050, 'Fernando', 'Luis', 'Luna', 'Rayo', 'enf02', 'fernandoluna@paliacare.com', '$2a$10$dWhc/c9LQDFm7a1MnUoGgu87/ww5hnLzkNchluKKwpNWTFnz3JPIG'),
(24681357, 'Laura', 'andrea', 'Ramirez', 'valles', 'aux01', 'lauraramirez@paliacare.com', '$2a$10$gGDzWVApRqcjHhD4tNxqxemRdFHhSslRiCnjT2DEdireesMrvA8C.'),
(27182818, 'Elena', 'sofia', 'Vargas', 'Fox', 'aux01', 'elenavargas@paliacare.com', '$2a$10$nfrqYk4puP7zT1sCf2KfROCGQcIlUyoDDinpIjsL5ohdrq0K7XI.W'),
(29979245, 'Patricia', 'Nenitza', 'Navarro', 'Palma', 'aux01', 'patricianavarro@paliacare.com', '$2a$10$t9K8h67b7BKi/uRHgJpfye8RPsiVIzaRAv76pTDF6fFnqnEJKf.0e'),
(30405060, 'Eduardo', 'Felipe', 'Soto', 'Cardozo', 'enf02', 'eduardosoto@paliacare.com', '$2a$10$CQSqjiWLvG9HZyxDQ.pSuetdIyVwJRRxaaLUP0LUhUata4nM3.6ay'),
(31415926, 'Diego', 'David', 'Torres', 'Gomez', 'aux01', 'diegotorres@paliacare.com', '$2a$10$CX7R9U13RgiVV26dX/mDj.RpY7yUG.7OBx.rX0OwxUKRByMIvSXl6'),
(40506070, 'Alberto', 'Emiro', 'Cruz', 'Hunt', 'enf02', 'albertocruz@paliacare.com', '$2a$10$Zu31VHcgBANrq8FxXrpYbOV2tDU0mtLMVJXs44RDyj2BkRHG1vY8e'),
(44455566, 'Paula', 'Gabriela', 'Molina', 'Terrence', 'ter04', 'paulamolina@paliacare.com', '$2a$10$nqZO3K1m2o.JLm3gQZ7uhuBt0yUwa..H/8Sx8I7tUIS16P1bIzwAi'),
(48273377, 'Dante', 'jose', 'Gebel', 'Urrutia', 'adm05', 'dantegebel@paliacare.com', '$2a$10$cCJszHYq4bxqP4NpcVTUj.6y3HIy08ytT88xOoeKqLZ2qnHeF3qE6'),
(50288419, 'Teresa', 'Maria', 'Castro', 'Lopez', 'aux01', 'teresacastro@paliacare.com', '$2a$10$sodacilRbB/KKDWlNIr2U.LGwJ6j1cYp.7.gNM9sbUrTc6rcbyb1y'),
(55667788, 'Olga', 'Shakira', 'Espinoza', 'Castrol', 'aux01', 'olgaespinoza@paliacare.com', '$2a$10$iUn2X7gAXow0zGxMNUiLq.8XgZ3qBV3X9EHukvJa8BAOZlPuXP4.G'),
(56473829, 'Lucia', 'Daniela', 'Valdez', 'Florez', 'enf02', 'luciavaldez@paliacare.com', '$2a$10$3mDIpyByKryCXroGt22Dr.hxYAHW81gE3f8f7JBMw4CGYi4JX8bb.'),
(57721566, 'Javier', 'Francisco', 'Moreno', 'Daza', 'aux01', 'javiermoreno@paliacare.com', '$2a$10$wfENnIV/yqAE5jdTnIM01eypOhap7iizV7nSZtlg4vLtk51ONoa7m'),
(60708090, 'Monica', 'Lucia', 'Paredes', 'Camargo', 'enf02', 'monicaparedes@paliacare.com', '$2a$10$ImuS8JAqAcd5DblvFikgI.nRV8mE21z6kxB2X1eYx6kIb8BI0ZZli'),
(66677788, 'Claudia', 'Marcela', 'Quintana', 'Fajardo', 'ter04', 'claudiaquintana@paliacare.com', '$2a$10$SQFtk0oyeyO9rPB8l91oSusFNKj4ftaIQifPN7Jx9miWLVgFcDsoS'),
(66778899, 'Sofia', '', 'Hernandez', '', 'med03', 'sofiahernandez@paliacare.com', '$2a$10$D01M3KS5V0VZOzU1KeEixOWYHIPo1h7jk0Lc88.iJ/hHCP1eCETMq'),
(69314718, 'Francisco', 'Javier', 'Romero', 'Caldas', 'aux01', 'franciscoromero@palicare.com', '$2a$10$DvZSsMSnaSiYrVWKfHXehOuugtlRkXWwznm94fWE2tqkQOmsEjKge'),
(70809010, 'Gabriela', 'Filipa', 'Vega', 'Alarcon', 'aux01', 'gabrielavega@paliacare.com', '$2a$10$QEHZLj/KvQNdFuQ6m4Ki2eHLVqrCd.1veEyKWbR8fVi9O18k9Bzta'),
(71828182, 'Carmen', 'Isabelina', 'Diaz', 'Capera', 'aux01', 'carmendiaz@palicare.com', '$2a$10$s.hPW18IoIK1zPKsH9HVJuiEy6P4vcvB1wGLCcIxzMDEXtne2Ar3q'),
(73205080, 'Antonio', 'Jose', 'Ortega', 'Finch', 'aux01', 'antonioortega@paliacare.com', '$2a$10$brX45l6kCHJ/Xh7QqKIAFOxmF.4h2zg/7nmSc9YXs3HNjKko5Uqk6'),
(77788899, 'Ricardo', 'Hasam', 'Peña', 'Gareca', 'ter04', 'ricardopena@paliacare.com', '$2a$10$PsnH6RWCvtZQET4Oq/t53.03eTuvwW1N0xB5oIIebh7oU5YliEQHq'),
(80101476, 'Edisson', 'Andrés', 'Taborda', 'Reyes', 'adm05', 'edissontaborda@paliacare.com', '$2a$10$TNNqfKXw.NYc5GwJiJ5pB.k1Sdfam8Jqt95GTyLvd0DfR18HZvcV6'),
(80901020, 'Silvia', 'Maria', 'Rios', 'Patarroyo', 'enf02', 'silviarios@paliacare.com', '$2a$10$YmJ8efEggP8Hvpej5iG3c.JwuaPKUYAjEbMmsGxYqH4UBeHZmES0W'),
(82012513, 'Natalia', 'Nikol', 'Flores', 'Catalan', 'aux01', 'nataliaflores@paliacare.com', '$2a$10$7ro72rdd9DJfWcDFfvcUw.PHCtjk2ub3AIRvVaxLxQH3px1JfCGva'),
(83147098, 'Roberto', 'Carlos', 'Silva', 'Clark', 'aux01', 'robertosilva@paliacare.com', '$2a$10$s2uJYDIqq12zxnNaiVOI1.4pw.xx2zAAX5hlP.ZH9xVosoOybnbdq'),
(87654321, 'Maria', '', 'Lopez', '', 'med03', 'marialopez@paliacare.com', '$2a$10$YYlRBL3pXwM8KxM6GN2y8O/Tpmi.vCCGu90oSjDFxnOmGV6fqWk5C'),
(95462288, 'Susana', 'cintia', 'Ruiz', 'Cruz', 'adm05', 'susanaruiz@paliacare.com', '$2a$10$WpWzNV2ulDIxfnRO0LwiGujZ.pkitwDsKYjRJSt7Gf20ULKTHazhO'),
(95957217, 'Sergio', 'Andres', 'Reyes', 'Segura', 'aux01', 'sergioreyes@paliacare.com', '$2a$10$CNxu0OYd0fzgms0Hhxiy7OINV64sPQEfWbzFswCgO1z4yto8CHdCi'),
(99001122, 'Raul', 'Antonio', 'Medina', 'Gutierrez', 'aux01', 'raulmedina@paliacare.com', '$2a$10$Ii/CaDoYxrNKpWBaQdy9WubXzhIOTU61jXOFflMInDjaXz69iFr.K'),
(99887766, 'Ana', '', 'Gomez', '', 'med03', 'anagomez@paliacare.com', '$2a$10$7ehScPjUkObumabNAr3bCOseXXjgXJfKtvN1SgL3CI0kjrq3g6KBW'),
(99900011, 'Esteban', 'Pablo', 'Salinas', 'Morgan', 'ter04', 'estebansalinas@paliacare.com', '$2a$10$.UY4efOQR7.dFPKLE.oTnO8oQeU9Xvcd/6ts8DWG4h.afwVCX4SmS'),
(123456123, 'kenshin', 'goku', 'kido', 'himura', 'aux01', 'kenshinkido@paliacare.com', '$2a$10$6IipnATgZaFQPV0aQrYW0OAbfAMLx1LDjBoHwX9dk8QrNcJZCLkWu'),
(1101101101, 'Yuliy', 'Paola', 'Daza', 'Oviedo', 'aux01', 'yuliydaza@paliacare.com', '$2a$10$kQ/V.vkCHYq..xPW5/a2feZouwN.j5K/8kzgSkDNosVUBTooeQQQC'),
(1101246975, 'Ramon', 'Federico', 'Jirafales', 'Barriga', 'med03', 'ramonjirafales@paliacare.com', '$2a$10$9vt7ko0cSPABvQZ1.Om3Tekmqj37FWjFZ5cQtXPYJFeVzGQuTBWpa'),
(1102102101, 'Melissa', 'Andrea', 'Solano', 'Patiño', 'med03', 'melissasolano@paliacare.com', '$2a$10$dr/bUSh2EYUeeNbYqNtQuOHD.YXwsJofP5e2Q7GEHONKSUcW8qsVq'),
(1103103101, 'Angelica', 'Milena', 'Prada', 'Cañón', 'ter04', 'angelicaprada@paliacare.com', '$2a$10$21A6rXqQFXZ9gFYX.Wqs9uFbV847yBlRDF0acrOh75Ayh7PhA7pEe'),
(1104104101, 'Jesús', 'Daniel', 'Beltrán', 'Rodríguez', 'aux01', 'jesusbeltran@paliacare.com', '$2a$10$NVlLIr1vOfQqebqW7aZmC.SHOGsUYhUw.yBWaWmVeaxPIyFqALeku'),
(1104774847, 'Leydi', 'Cecilia', 'Godoy', 'Ortiz', 'adm05', 'leydigodoy@paliacare.com', '$2a$10$D3Yu77JIOqBCG6uMz9fdOubRZwAbLSQR0oRSIyeA6t7Jipbqnmxky'),
(1105105104, 'Carlos', 'Andrés', 'Rodríguez', 'Ochoa', 'med03', 'carlosrodriguez@paliacare.com', '$2a$10$aGwJ5dRA.yJVEESep6UJQuJ2idQemauoDK5ZQaZirJZyQXqWYaY/2'),
(1107107107, 'Jenny', 'Andrea', 'Martinez', 'Heredia', 'enf02', 'jennymartinez@paliacare.com', '$2a$10$ItlJPq9yAWRaQVti1z55re/rJQT60oVVRHwL4dQTpXl4W8lt44wYO'),
(1108108104, 'María', 'Camila', 'Barajas', 'López', 'enf02', 'mariabarajas@paliacare.com', '$2a$10$lc1T7Qt/tFr0d4wuB2pREOyP4.h7U/wzgaXIKs586Nkym9h6DL/S2'),
(1109109101, 'Armando', 'Stiven', 'Silva', 'Rodríguez', 'enf02', 'armandosilva@paliacare.com', '$2a$10$fM9JpEYEV5v4moKFowlgZu9w1xT26/S6CYhgbuaZ4mE9kP/CrQ0ia'),
(1110101110, 'Mónica', 'Patricia', 'Pinilla', 'Castro', 'aux01', 'monicapinilla@paliacare.com', '$2a$10$YAHt9viHu9Dowld6r0qHye6utBzgYd7z4RkVHIj506DYZNF2btjye'),
(1110110111, 'Camila', 'Andrea', 'Vergara', 'Caro', 'aux01', 'camilavergara@paliacare.com', '$2a$10$7P3iAyrE1d4gwuchyCbyZ.3d279vUqzN43KpqpNA3hfQyAKea86iq'),
(1110110112, 'Andrés', 'Felipe', 'Castro', 'Polo', 'aux01', 'andrescastro@paliacare.com', '$2a$10$yKym7PQ5V3g8Yo3xv8mc8uew5y1BugU3otGujoocLNGtqzMm1IsTi'),
(1110110113, 'Julia', 'Fernanda', 'Araujo', 'Henao', 'ter04', 'juliaaraujo@paliacare.com', '$2a$10$UZG/0uk/oOjv4Ch.lsJfbOr0ucygCFr9v8M74ezKO6DOsHLBDGyKm'),
(1110110114, 'Juana', 'Carolina', 'López', 'Montes', 'aux01', 'juanalopez@paliacare.com', '$2a$10$wwnvmlh6pg5EzKGXE6uEFub5MLousNCWjHAQ74b2eO1DVYhS9stP6'),
(1110110115, 'Daniela', 'Carolina', 'Carvajal', 'Rio', 'aux01', 'danielacarvajal@paliacare.com', '$2a$10$hJP/KUXFzjoukzcS114lP.6WcwZpHlnw.2pPMUa67RNTAXTAxUzuu'),
(1110110116, 'Verónica', 'Sofia', 'Cantor', 'Jiménez', 'aux01', 'veronicacantor@paliacare.com', '$2a$10$crhPEt/e3cIrKyH4dm4FGu4lXFP4pcJrwRtm3sAbsKJc6qr71x.Kq'),
(1110110117, 'Carla', 'Antonia', 'Muñoz', 'Álvarez', 'aux01', 'carlamunoz@paliacare.com', '$2a$10$BjW0NXOa6i5oR0R7s8/hNe7Pf97knUJhixwVnbEdQynhSHk.Cn3NS'),
(1110110118, 'Patricia', NULL, 'Paternina', NULL, 'aux01', 'patriciapaternina@paliacare.com', '$2a$10$u/aKSP6Mx3hroVnsi1Con.OxFjlFwcd./oXbAEl1p.KMWaFxou/jq'),
(1110110142, 'Yajaira', 'Paola', 'Rangel', 'Roa', 'aux01', 'yajairarangel@paliacare.com', '$2a$10$dX5yc0PZGKyLlg1pllcV2ujmEIuJOTErIGmH0c92XBqPJnj/OEVb6'),
(1434389742, 'aioria', 'de', 'leo', 'kido', 'aux01', 'aioriadeleo@paliacare.com', '$2a$10$/IG9ZP8dd07SBlmG51fyiuBmsixQlc62mKQSlO5V7/nq302zDmtoS'),
(6546341122, 'Coni', 'luz', 'Camelo', 'Frias', 'ter04', 'conicamelo@paliacare.com', '$2a$10$iv735ZIxOIGiL86ozIJ0TuN/XmHKToMytAKI03pnM5/nfGOwcxH5m'),
(9686711199, 'miranda', 'catrina', 'fula', 'cortez', 'adm05', 'mirandafula@paliacare.com', '$2a$10$80SSuls.kHWtfcuKHx41guP69.R.uioTETw9Vkxtpd7Q5pfe3Un2O'),
(123123456321, 'saga', 'de', 'geminis', 'kido', 'aux01', 'sagageminis@paliacare.com', '$2a$10$ybtHsLQJkvfSj8kLCzH2g.fAh7lDaw0SMgMimBcAiw9T10qRodM5.');

INSERT INTO turno (id_turno, fecha_ini, fecha_fin, id_horario) VALUES
(1, '2025-04-15', '2025-04-15', 'h01'),
(2, '2025-04-16', '2025-04-17', 'h02'),
(3, '2025-04-17', '2025-04-17', 'h01'),
(4, '2025-04-16', '2025-04-17', 'h02'),
(5, '2025-04-19', '2025-04-19', 'h01'),
(6, '2025-04-16', '2025-04-17', 'h02');

INSERT INTO tipo_novedad (nombre, descripcion, requiere_fechas, activo) VALUES
('Vacaciones', 'Solicitud de vacaciones del personal', true, true),
('Incapacidades', 'Solicitud de incapacidad médica o licencia por enfermedad', true, true),
('Permisos', 'Solicitud de permiso especial con fecha definida', true, true),
('Cambios de turnos', 'Solicitud para cambiar turno asignado con otro personal', false, true),
('Imprevistos', 'Evento imprevisto que afecta la asignación de turno', false, true),
('Calamidad', 'Situación de calamidad personal (muerte en familia, desastre, etc)', false, true);

INSERT INTO novedad (id_novedad, id_usuario, id_tipo, fecha_inicio, fecha_fin, descripcion, estado, motivo_rechazo, fecha_solicitud, fecha_aprobacion, id_usuario_admin, soporte_path, aprobacion_jefe, aprobacion_operaciones, aprobacion_rrhh, aplicada_a_malla) VALUES
(1, 44455566, 2, '2025-12-22', '2025-12-27', 'cirugia programada desde hace 8 meses', 'RECHAZADA', 'No hay soporte que valide esta petición por lo tanto se debe rechazar.', '2025-12-11 02:20:54', '2025-12-11 03:33:20', 80101476, NULL, false, false, false, false),
(2, 44455566, 2, '2025-12-22', '2025-12-26', 'mi cirugia programada hace 8 meses', 'PENDIENTE', NULL, '2025-12-11 02:25:04', NULL, NULL, 'D:\\00-MEGA\\00  - SENA 2025\\1002-SGTURNOS-React-API\\sgturnos\\uploads\\soportes\\novedad_2\\soporte.pdf', false, false, false, false),
(3, 10293847, 1, '2025-12-24', '2025-12-31', 'viaje', 'APROBADA', NULL, '2025-12-14 19:59:26', '2025-12-14 22:02:40', 80101476, NULL, true, true, true, true),
(4, 99887766, 1, '2026-01-15', '2026-01-29', 'Solicito vacaciones,  periodo.  Es importante por que se programo viaje y vuelos y estadia ya estan adquiridos.', 'RECHAZADA', 'Consultando la contrato, para este periodo no se ha cumplido aun el periodo de vacaciones, que estaría  cumplido a partir del 1° de Abril.', '2025-12-14 22:15:38', '2025-12-14 22:18:56', 9686711199, NULL, true, true, false, false),
(5, 44455566, 1, '2026-02-17', '2026-03-02', 'periodod de vacaciones para el periodo ', 'RECHAZADA', 'no tengo informacion del solicitante.', '2025-12-14 22:31:45', '2025-12-15 03:12:09', 48273377, NULL, false, true, true, false),
(6, 99887766, 3, '2025-12-25', '2025-12-25', 'hijo pertenece a ejercito de otro pais y ese dia es una licencia unica que les dan para pasar en familia, dia que será repuesto en  la jornada que dispongan.', 'APROBADA', NULL, '2025-12-15 02:59:26', '2025-12-15 03:01:31', 48273377, NULL, false, false, false, false),
(7, 99887766, 3, '2026-01-07', '2026-01-07', 'Cita medica de especialista', 'APROBADA', NULL, '2025-12-15 03:10:32', '2025-12-15 03:54:00', 95462288, NULL, false, false, false, false),
(8, 24681357, 3, '2026-01-22', '2026-01-22', 'Agradezco permiso para cita en el consulado por temas de renovación de pasaporte', 'APROBADA', NULL, '2025-12-15 03:38:01', '2025-12-15 03:54:12', 95462288, NULL, false, false, false, false),
(9, 24681357, 3, '2026-01-17', '2026-01-17', 'la cita de instalacion de gas, es la revision periodica de cada 5 años.  en caso de no cumplirla  es motivo de desconexion de servicio.', 'APROBADA', NULL, '2025-12-15 03:51:45', '2025-12-15 03:59:45', 95462288, NULL, true, true, true, true);

INSERT INTO aprobacion_novedad (id_aprobacion, id_novedad, id_usuario_aprobador, tipo_aprobador, estado_aprobacion, motivo_rechazo, fecha_aprobacion) VALUES
(1, 3, 48273377, 'JEFE_INMEDIATO', 'APROBADA', NULL, '2025-12-14 20:00:52'),
(2, 3, 95462288, 'OPERACIONES_CLINICAS', 'APROBADA', NULL, '2025-12-14 22:02:40'),
(3, 3, 9686711199, 'RECURSOS_HUMANOS', 'APROBADA', NULL, '2025-12-14 20:02:10'),
(4, 4, 48273377, 'JEFE_INMEDIATO', 'APROBADA', NULL, '2025-12-14 22:16:26'),
(5, 4, 95462288, 'OPERACIONES_CLINICAS', 'APROBADA', NULL, '2025-12-14 22:17:06'),
(6, 4, 9686711199, 'RECURSOS_HUMANOS', 'RECHAZADA', 'Consultando la contrato, para este periodo no se ha cumplido aun el periodo de vacaciones, que estaría  cumplido a partir del 1° de Abril.', '2025-12-14 22:18:56'),
(7, 5, 48273377, 'JEFE_INMEDIATO', 'RECHAZADA', 'no tengo informacion del solicitante.', '2025-12-15 03:12:09'),
(8, 5, 95462288, 'OPERACIONES_CLINICAS', 'APROBADA', NULL, '2025-12-15 03:58:53'),
(9, 5, 9686711199, 'RECURSOS_HUMANOS', 'APROBADA', NULL, '2025-12-15 03:53:04'),
(10, 9, 48273377, 'JEFE_INMEDIATO', 'APROBADA', NULL, '2025-12-15 03:59:45'),
(11, 9, 95462288, 'OPERACIONES_CLINICAS', 'APROBADA', NULL, '2025-12-15 03:59:02'),
(12, 9, 9686711199, 'RECURSOS_HUMANOS', 'APROBADA', NULL, '2025-12-15 03:52:31');

INSERT INTO cambio_turno (id_cambio, aplicada_a_malla, aprobacion_compañero, aprobacion_jefe, aprobacion_operaciones, aprobacion_rrhh, descripcion, estado, fecha_aprobacion_final, fecha_respuesta_compañero, fecha_solicitud, fecha_turno, fecha_turno_compañero, motivo_rechazo, id_usuario_compañero, id_usuario_solicitante) VALUES
(1, false, true, true, false, false, 'fecha de graduación de mi sobrino.', 'PENDIENTE_ADMIN', NULL, '2025-12-18 19:22:26', '2025-12-18 17:20:24', '2025-12-24', '2025-12-27', NULL, 1110110113, 11122);

-- ========================================================================
-- DONE!
-- ========================================================================
