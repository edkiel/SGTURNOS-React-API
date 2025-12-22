-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 22-12-2025 a las 16:50:58
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `sgturnos`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alerta_malla`
--

CREATE TABLE `alerta_malla` (
  `id_alerta` bigint(20) NOT NULL,
  `anio_afectado` int(11) NOT NULL,
  `estado` varchar(20) NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `fecha_procesamiento` datetime(6) DEFAULT NULL,
  `mes_afectado` int(11) NOT NULL,
  `observaciones` text DEFAULT NULL,
  `tipo_accion` varchar(50) NOT NULL,
  `id_novedad` bigint(20) NOT NULL,
  `id_usuario_procesador` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `aprobacion_novedad`
--

CREATE TABLE `aprobacion_novedad` (
  `id_aprobacion` bigint(20) NOT NULL,
  `id_novedad` bigint(20) NOT NULL,
  `id_usuario_aprobador` bigint(20) NOT NULL,
  `tipo_aprobador` varchar(50) NOT NULL,
  `estado_aprobacion` varchar(50) DEFAULT 'PENDIENTE',
  `motivo_rechazo` varchar(500) DEFAULT NULL,
  `fecha_aprobacion` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `aprobacion_novedad`
--

INSERT INTO `aprobacion_novedad` (`id_aprobacion`, `id_novedad`, `id_usuario_aprobador`, `tipo_aprobador`, `estado_aprobacion`, `motivo_rechazo`, `fecha_aprobacion`) VALUES
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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asignacion_turno`
--

CREATE TABLE `asignacion_turno` (
  `id_turno` bigint(20) NOT NULL,
  `Id_empleado` varchar(20) NOT NULL,
  `fecha` date NOT NULL,
  `id_colaborador` bigint(20) NOT NULL,
  `observaciones` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cambio_turno`
--

CREATE TABLE `cambio_turno` (
  `id_cambio` bigint(20) NOT NULL,
  `aplicada_a_malla` bit(1) DEFAULT NULL,
  `aprobacion_compañero` bit(1) DEFAULT NULL,
  `aprobacion_jefe` bit(1) DEFAULT NULL,
  `aprobacion_operaciones` bit(1) DEFAULT NULL,
  `aprobacion_rrhh` bit(1) DEFAULT NULL,
  `descripcion` varchar(500) DEFAULT NULL,
  `estado` varchar(255) DEFAULT NULL,
  `fecha_aprobacion_final` datetime(6) DEFAULT NULL,
  `fecha_respuesta_compañero` datetime(6) DEFAULT NULL,
  `fecha_solicitud` datetime(6) NOT NULL,
  `fecha_turno` date DEFAULT NULL,
  `fecha_turno_compañero` date DEFAULT NULL,
  `motivo_rechazo` varchar(500) DEFAULT NULL,
  `id_usuario_compañero` bigint(20) NOT NULL,
  `id_usuario_solicitante` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cambio_turno`
--

INSERT INTO `cambio_turno` (`id_cambio`, `aplicada_a_malla`, `aprobacion_compañero`, `aprobacion_jefe`, `aprobacion_operaciones`, `aprobacion_rrhh`, `descripcion`, `estado`, `fecha_aprobacion_final`, `fecha_respuesta_compañero`, `fecha_solicitud`, `fecha_turno`, `fecha_turno_compañero`, `motivo_rechazo`, `id_usuario_compañero`, `id_usuario_solicitante`) VALUES
(1, b'0', b'1', b'1', b'0', b'0', 'fecha de graduación de mi sobrino.', 'PENDIENTE_ADMIN', NULL, '2025-12-18 19:22:26.000000', '2025-12-18 17:20:24.000000', '2025-12-24', '2025-12-27', NULL, 1110110113, 11122);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `capacitacion`
--

CREATE TABLE `capacitacion` (
  `Id_capacitacion` int(11) NOT NULL,
  `Id_tema` varchar(30) NOT NULL,
  `Fecha` date NOT NULL,
  `Id_estado_cap` varchar(30) NOT NULL,
  `Id_empleado` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `colaborador`
--

CREATE TABLE `colaborador` (
  `id_colaborador` bigint(20) NOT NULL,
  `id_rol` varchar(255) DEFAULT NULL,
  `id_usuario` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `departamento`
--

CREATE TABLE `departamento` (
  `Id_departamento` varchar(10) NOT NULL,
  `Departamento` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `departamento`
--

INSERT INTO `departamento` (`Id_departamento`, `Departamento`) VALUES
('D001', 'Recursos Humanos'),
('D002', 'Enfermería'),
('D003', 'Administración'),
('enfer01', NULL),
('eqreh03', NULL),
('medic02', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empleado`
--

CREATE TABLE `empleado` (
  `Id_empleado` varchar(20) NOT NULL,
  `Id_rol` varchar(10) NOT NULL,
  `id_usuario` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estado_capacitacion`
--

CREATE TABLE `estado_capacitacion` (
  `Id_estado_cap` varchar(30) NOT NULL,
  `Estado_de_cap` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estado_capacitacion`
--

INSERT INTO `estado_capacitacion` (`Id_estado_cap`, `Estado_de_cap`) VALUES
('e_cap01', 'Programada'),
('e_cap02', 'Cancelada'),
('e_cap03', 'Realizada');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estado_novedad`
--

CREATE TABLE `estado_novedad` (
  `Id_Estado_nov` varchar(20) NOT NULL,
  `Estado_nov` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estado_novedad`
--

INSERT INTO `estado_novedad` (`Id_Estado_nov`, `Estado_nov`) VALUES
('01_APRO', 'APROBADO'),
('02_RECH', 'RECHAZADO'),
('03_PEND', 'PENDIENTE');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `horario`
--

CREATE TABLE `horario` (
  `id_horario` varchar(10) NOT NULL,
  `hora_inicio` varchar(255) DEFAULT NULL,
  `hora_fin` varchar(255) DEFAULT NULL,
  `tipo` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `horario`
--

INSERT INTO `horario` (`id_horario`, `hora_inicio`, `hora_fin`, `tipo`) VALUES
('h01', '07:00:00', '19:00:00', NULL),
('h02', '19:00:00', '07:00:00', NULL),
('h03', '07:00:00', '11:00:00', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `malla_turnos`
--

CREATE TABLE `malla_turnos` (
  `id_malla` bigint(20) NOT NULL,
  `estado` varchar(20) NOT NULL,
  `id_turno` bigint(20) NOT NULL,
  `id_usuario` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `novedad`
--

CREATE TABLE `novedad` (
  `id_novedad` bigint(20) NOT NULL,
  `id_usuario` bigint(20) NOT NULL,
  `id_tipo` bigint(20) NOT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `descripcion` varchar(500) DEFAULT NULL,
  `estado` varchar(50) DEFAULT 'PENDIENTE',
  `motivo_rechazo` varchar(500) DEFAULT NULL,
  `fecha_solicitud` datetime NOT NULL,
  `fecha_aprobacion` datetime DEFAULT NULL,
  `id_usuario_admin` bigint(20) DEFAULT NULL,
  `soporte_path` varchar(500) DEFAULT NULL,
  `aprobacion_jefe` tinyint(1) DEFAULT 0,
  `aprobacion_operaciones` tinyint(1) DEFAULT 0,
  `aprobacion_rrhh` tinyint(1) DEFAULT 0,
  `aplicada_a_malla` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `novedad`
--

INSERT INTO `novedad` (`id_novedad`, `id_usuario`, `id_tipo`, `fecha_inicio`, `fecha_fin`, `descripcion`, `estado`, `motivo_rechazo`, `fecha_solicitud`, `fecha_aprobacion`, `id_usuario_admin`, `soporte_path`, `aprobacion_jefe`, `aprobacion_operaciones`, `aprobacion_rrhh`, `aplicada_a_malla`) VALUES
(1, 44455566, 2, '2025-12-22', '2025-12-27', 'cirugia programada desde hace 8 meses', 'RECHAZADA', 'No hay soporte que valide esta petición por lo tanto se debe rechazar.', '2025-12-11 02:20:54', '2025-12-11 03:33:20', 80101476, NULL, 0, 0, 0, 0),
(2, 44455566, 2, '2025-12-22', '2025-12-26', 'mi cirugia programada hace 8 meses', 'PENDIENTE', NULL, '2025-12-11 02:25:04', NULL, NULL, 'D:\\00-MEGA\\00  - SENA 2025\\1002-SGTURNOS-React-API\\sgturnos\\uploads\\soportes\\novedad_2\\soporte.pdf', 0, 0, 0, 0),
(3, 10293847, 1, '2025-12-24', '2025-12-31', 'viaje', 'APROBADA', NULL, '2025-12-14 19:59:26', '2025-12-14 22:02:40', 80101476, NULL, 1, 1, 1, 1),
(4, 99887766, 1, '2026-01-15', '2026-01-29', 'Solicito vacaciones,  periodo.  Es importante por que se programo viaje y vuelos y estadia ya estan adquiridos.', 'RECHAZADA', 'Consultando la contrato, para este periodo no se ha cumplido aun el periodo de vacaciones, que estaría  cumplido a partir del 1° de Abril.', '2025-12-14 22:15:38', '2025-12-14 22:18:56', 9686711199, NULL, 1, 1, 0, 0),
(5, 44455566, 1, '2026-02-17', '2026-03-02', 'periodod de vacaciones para el periodo ', 'RECHAZADA', 'no tengo informacion del solicitante.', '2025-12-14 22:31:45', '2025-12-15 03:12:09', 48273377, NULL, 0, 1, 1, 0),
(6, 99887766, 3, '2025-12-25', '2025-12-25', 'hijo pertenece a ejercito de otro pais y ese dia es una licencia unica que les dan para pasar en familia, dia que será repuesto en  la jornada que dispongan.', 'APROBADA', NULL, '2025-12-15 02:59:26', '2025-12-15 03:01:31', 48273377, NULL, 0, 0, 0, 0),
(7, 99887766, 3, '2026-01-07', '2026-01-07', 'Cita medica de especialista', 'APROBADA', NULL, '2025-12-15 03:10:32', '2025-12-15 03:54:00', 95462288, NULL, 0, 0, 0, 0),
(8, 24681357, 3, '2026-01-22', '2026-01-22', 'Agradezco permiso para cita en el consulado por temas de renovación de pasaporte', 'APROBADA', NULL, '2025-12-15 03:38:01', '2025-12-15 03:54:12', 95462288, NULL, 0, 0, 0, 0),
(9, 24681357, 3, '2026-01-17', '2026-01-17', 'la cita de instalacion de gas, es la revision periodica de cada 5 años.  en caso de no cumplirla  es motivo de desconexion de servicio.', 'APROBADA', NULL, '2025-12-15 03:51:45', '2025-12-15 03:59:45', 95462288, NULL, 1, 1, 1, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol`
--

CREATE TABLE `rol` (
  `Id_rol` varchar(10) NOT NULL,
  `rol` varchar(255) DEFAULT NULL,
  `Id_departamento` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `rol`
--

INSERT INTO `rol` (`Id_rol`, `rol`, `Id_departamento`) VALUES
('adm05', 'ADMINISTRADOR', 'D003'),
('aux01', 'AUXILIAR', 'enfer01'),
('enf02', 'ENFERMERO', 'enfer01'),
('med03', 'MEDICO', 'medic02'),
('ter04', 'TERAPIA', 'eqreh03');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tema_capacitacion`
--

CREATE TABLE `tema_capacitacion` (
  `Id_tema` varchar(30) NOT NULL,
  `Tema` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tema_capacitacion`
--

INSERT INTO `tema_capacitacion` (`Id_tema`, `Tema`) VALUES
('tcap01', 'Transferencias'),
('tcap02', 'Baño'),
('tcap03', 'Administración de Medicamentos'),
('tcap04', 'Manejo Cortopunzantes'),
('tcap05', 'Manejo de Residuos');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_novedad`
--

CREATE TABLE `tipo_novedad` (
  `id_tipo` bigint(20) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(500) DEFAULT NULL,
  `requiere_fechas` tinyint(1) DEFAULT 0,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tipo_novedad`
--

INSERT INTO `tipo_novedad` (`id_tipo`, `nombre`, `descripcion`, `requiere_fechas`, `activo`) VALUES
(1, 'Vacaciones', 'Solicitud de vacaciones del personal', 1, 1),
(2, 'Incapacidades', 'Solicitud de incapacidad médica o licencia por enfermedad', 1, 1),
(3, 'Permisos', 'Solicitud de permiso especial con fecha definida', 1, 1),
(4, 'Cambios de turnos', 'Solicitud para cambiar turno asignado con otro personal', 0, 1),
(5, 'Imprevistos', 'Evento imprevisto que afecta la asignación de turno', 0, 1),
(6, 'Calamidad', 'Situación de calamidad personal (muerte en familia, desastre, etc)', 0, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `turno`
--

CREATE TABLE `turno` (
  `id_turno` bigint(20) NOT NULL,
  `Fecha_ini` date NOT NULL,
  `Fecha_fin` date NOT NULL,
  `Id_horario` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `turno`
--

INSERT INTO `turno` (`id_turno`, `Fecha_ini`, `Fecha_fin`, `Id_horario`) VALUES
(1, '2025-04-15', '2025-04-15', 'h01'),
(2, '2025-04-16', '2025-04-17', 'h02'),
(3, '2025-04-17', '2025-04-17', 'h01'),
(4, '2025-04-16', '2025-04-17', 'h02'),
(5, '2025-04-19', '2025-04-19', 'h01'),
(6, '2025-04-16', '2025-04-17', 'h02');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `Id_usuario` bigint(20) NOT NULL,
  `primer_nombre` varchar(255) DEFAULT NULL,
  `segundo_nombre` varchar(255) DEFAULT NULL,
  `primer_apellido` varchar(255) DEFAULT NULL,
  `segundo_apellido` varchar(255) DEFAULT NULL,
  `Id_rol` varchar(20) DEFAULT NULL,
  `correo` varchar(255) DEFAULT NULL,
  `contrasena` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`Id_usuario`, `primer_nombre`, `segundo_nombre`, `primer_apellido`, `segundo_apellido`, `Id_rol`, `correo`, `contrasena`) VALUES
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

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `alerta_malla`
--
ALTER TABLE `alerta_malla`
  ADD PRIMARY KEY (`id_alerta`),
  ADD KEY `FKkxy16wfc5hkl6hto0hcgh7paf` (`id_novedad`),
  ADD KEY `FK64arawwphif8kxd6dwt6s87pk` (`id_usuario_procesador`);

--
-- Indices de la tabla `aprobacion_novedad`
--
ALTER TABLE `aprobacion_novedad`
  ADD PRIMARY KEY (`id_aprobacion`),
  ADD UNIQUE KEY `unique_aprobacion` (`id_novedad`,`tipo_aprobador`),
  ADD KEY `id_usuario_aprobador` (`id_usuario_aprobador`);

--
-- Indices de la tabla `asignacion_turno`
--
ALTER TABLE `asignacion_turno`
  ADD PRIMARY KEY (`id_turno`,`Id_empleado`),
  ADD KEY `Id_empleado` (`Id_empleado`),
  ADD KEY `FKrxd5h3eumfqntp9kyk0brgtgi` (`id_colaborador`);

--
-- Indices de la tabla `cambio_turno`
--
ALTER TABLE `cambio_turno`
  ADD PRIMARY KEY (`id_cambio`),
  ADD KEY `FKexyan2seavh0uqekqxey6vjl7` (`id_usuario_compañero`),
  ADD KEY `FKk810l8ql3i1f6wiguct2j0eq` (`id_usuario_solicitante`);

--
-- Indices de la tabla `capacitacion`
--
ALTER TABLE `capacitacion`
  ADD PRIMARY KEY (`Id_capacitacion`),
  ADD KEY `Id_tema` (`Id_tema`),
  ADD KEY `Id_estado_cap` (`Id_estado_cap`),
  ADD KEY `Id_empleado` (`Id_empleado`);

--
-- Indices de la tabla `colaborador`
--
ALTER TABLE `colaborador`
  ADD PRIMARY KEY (`id_colaborador`),
  ADD UNIQUE KEY `UK8b8hqbc1uoj8xtpr1mxk9ne0e` (`id_usuario`),
  ADD KEY `FKc4w3bu4htc4in4usp8ixw7ya5` (`id_rol`);

--
-- Indices de la tabla `departamento`
--
ALTER TABLE `departamento`
  ADD PRIMARY KEY (`Id_departamento`);

--
-- Indices de la tabla `empleado`
--
ALTER TABLE `empleado`
  ADD PRIMARY KEY (`Id_empleado`),
  ADD KEY `FK_EMPLEADO_ROL` (`Id_rol`),
  ADD KEY `FK_EMPLEADO_USUARIO` (`id_usuario`);

--
-- Indices de la tabla `estado_capacitacion`
--
ALTER TABLE `estado_capacitacion`
  ADD PRIMARY KEY (`Id_estado_cap`);

--
-- Indices de la tabla `estado_novedad`
--
ALTER TABLE `estado_novedad`
  ADD PRIMARY KEY (`Id_Estado_nov`);

--
-- Indices de la tabla `horario`
--
ALTER TABLE `horario`
  ADD PRIMARY KEY (`id_horario`);

--
-- Indices de la tabla `malla_turnos`
--
ALTER TABLE `malla_turnos`
  ADD PRIMARY KEY (`id_malla`),
  ADD KEY `FKhq8i52rhyq74g6cdpa3bj2y6t` (`id_turno`),
  ADD KEY `FKgm2ynvjjstsnbh43gw5hiynag` (`id_usuario`);

--
-- Indices de la tabla `novedad`
--
ALTER TABLE `novedad`
  ADD PRIMARY KEY (`id_novedad`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `id_tipo` (`id_tipo`),
  ADD KEY `id_usuario_admin` (`id_usuario_admin`);

--
-- Indices de la tabla `rol`
--
ALTER TABLE `rol`
  ADD PRIMARY KEY (`Id_rol`),
  ADD KEY `FK_ROL_DEPARTAMENTO` (`Id_departamento`);

--
-- Indices de la tabla `tema_capacitacion`
--
ALTER TABLE `tema_capacitacion`
  ADD PRIMARY KEY (`Id_tema`);

--
-- Indices de la tabla `tipo_novedad`
--
ALTER TABLE `tipo_novedad`
  ADD PRIMARY KEY (`id_tipo`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `turno`
--
ALTER TABLE `turno`
  ADD PRIMARY KEY (`id_turno`),
  ADD KEY `FK_TURNO_HORARIO` (`Id_horario`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`Id_usuario`),
  ADD KEY `fk_usuario_rol` (`Id_rol`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `alerta_malla`
--
ALTER TABLE `alerta_malla`
  MODIFY `id_alerta` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `aprobacion_novedad`
--
ALTER TABLE `aprobacion_novedad`
  MODIFY `id_aprobacion` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `cambio_turno`
--
ALTER TABLE `cambio_turno`
  MODIFY `id_cambio` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `colaborador`
--
ALTER TABLE `colaborador`
  MODIFY `id_colaborador` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `malla_turnos`
--
ALTER TABLE `malla_turnos`
  MODIFY `id_malla` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `novedad`
--
ALTER TABLE `novedad`
  MODIFY `id_novedad` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `tipo_novedad`
--
ALTER TABLE `tipo_novedad`
  MODIFY `id_tipo` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `turno`
--
ALTER TABLE `turno`
  MODIFY `id_turno` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `alerta_malla`
--
ALTER TABLE `alerta_malla`
  ADD CONSTRAINT `FK64arawwphif8kxd6dwt6s87pk` FOREIGN KEY (`id_usuario_procesador`) REFERENCES `usuario` (`Id_usuario`),
  ADD CONSTRAINT `FKkxy16wfc5hkl6hto0hcgh7paf` FOREIGN KEY (`id_novedad`) REFERENCES `novedad` (`id_novedad`);

--
-- Filtros para la tabla `aprobacion_novedad`
--
ALTER TABLE `aprobacion_novedad`
  ADD CONSTRAINT `aprobacion_novedad_ibfk_1` FOREIGN KEY (`id_novedad`) REFERENCES `novedad` (`id_novedad`) ON DELETE CASCADE,
  ADD CONSTRAINT `aprobacion_novedad_ibfk_2` FOREIGN KEY (`id_usuario_aprobador`) REFERENCES `usuario` (`Id_usuario`);

--
-- Filtros para la tabla `asignacion_turno`
--
ALTER TABLE `asignacion_turno`
  ADD CONSTRAINT `FKrxd5h3eumfqntp9kyk0brgtgi` FOREIGN KEY (`id_colaborador`) REFERENCES `colaborador` (`id_colaborador`),
  ADD CONSTRAINT `asignacion_turno_ibfk_1` FOREIGN KEY (`id_turno`) REFERENCES `turno` (`id_turno`),
  ADD CONSTRAINT `asignacion_turno_ibfk_2` FOREIGN KEY (`Id_empleado`) REFERENCES `empleado` (`Id_empleado`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `cambio_turno`
--
ALTER TABLE `cambio_turno`
  ADD CONSTRAINT `FKexyan2seavh0uqekqxey6vjl7` FOREIGN KEY (`id_usuario_compañero`) REFERENCES `usuario` (`Id_usuario`),
  ADD CONSTRAINT `FKk810l8ql3i1f6wiguct2j0eq` FOREIGN KEY (`id_usuario_solicitante`) REFERENCES `usuario` (`Id_usuario`);

--
-- Filtros para la tabla `capacitacion`
--
ALTER TABLE `capacitacion`
  ADD CONSTRAINT `capacitacion_ibfk_1` FOREIGN KEY (`Id_tema`) REFERENCES `tema_capacitacion` (`Id_tema`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `capacitacion_ibfk_2` FOREIGN KEY (`Id_estado_cap`) REFERENCES `estado_capacitacion` (`Id_estado_cap`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `capacitacion_ibfk_3` FOREIGN KEY (`Id_empleado`) REFERENCES `empleado` (`Id_empleado`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `colaborador`
--
ALTER TABLE `colaborador`
  ADD CONSTRAINT `FK4bukd136q8v8dux3r7k7itoq3` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`Id_usuario`),
  ADD CONSTRAINT `FKc4w3bu4htc4in4usp8ixw7ya5` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`Id_rol`);

--
-- Filtros para la tabla `empleado`
--
ALTER TABLE `empleado`
  ADD CONSTRAINT `FK_EMPLEADO_ROL` FOREIGN KEY (`Id_rol`) REFERENCES `rol` (`Id_rol`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_EMPLEADO_USUARIO` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`Id_usuario`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `malla_turnos`
--
ALTER TABLE `malla_turnos`
  ADD CONSTRAINT `FKgm2ynvjjstsnbh43gw5hiynag` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`Id_usuario`),
  ADD CONSTRAINT `FKhq8i52rhyq74g6cdpa3bj2y6t` FOREIGN KEY (`id_turno`) REFERENCES `turno` (`id_turno`);

--
-- Filtros para la tabla `novedad`
--
ALTER TABLE `novedad`
  ADD CONSTRAINT `novedad_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`Id_usuario`),
  ADD CONSTRAINT `novedad_ibfk_2` FOREIGN KEY (`id_tipo`) REFERENCES `tipo_novedad` (`id_tipo`),
  ADD CONSTRAINT `novedad_ibfk_3` FOREIGN KEY (`id_usuario_admin`) REFERENCES `usuario` (`Id_usuario`);

--
-- Filtros para la tabla `rol`
--
ALTER TABLE `rol`
  ADD CONSTRAINT `FK_ROL_DEPARTAMENTO` FOREIGN KEY (`Id_departamento`) REFERENCES `departamento` (`Id_departamento`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `turno`
--
ALTER TABLE `turno`
  ADD CONSTRAINT `FK_TURNO_HORARIO` FOREIGN KEY (`Id_horario`) REFERENCES `horario` (`id_horario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`Id_rol`) REFERENCES `rol` (`Id_rol`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
