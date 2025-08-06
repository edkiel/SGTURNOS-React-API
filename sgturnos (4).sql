-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 03-08-2025 a las 05:56:06
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
-- Estructura de tabla para la tabla `asignacion_turno`
--

CREATE TABLE `asignacion_turno` (
  `id_turno` bigint(20) NOT NULL,
  `Id_empleado` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `horario`
--

INSERT INTO `horario` (`id_horario`, `hora_inicio`, `hora_fin`) VALUES
('h01', '07:00:00', '19:00:00'),
('h02', '19:00:00', '07:00:00'),
('h03', '07:00:00', '11:00:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `novedades`
--

CREATE TABLE `novedades` (
  `Id_novedad` varchar(20) NOT NULL,
  `Id_tipo_novedad` varchar(20) NOT NULL,
  `Fecha_de_reporte` varchar(20) NOT NULL,
  `id_estado_nov` varchar(20) NOT NULL,
  `Id_empleado` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol`
--

CREATE TABLE `rol` (
  `Id_rol` varchar(10) NOT NULL,
  `Rol` varchar(50) NOT NULL,
  `Id_departamento` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `rol`
--

INSERT INTO `rol` (`Id_rol`, `Rol`, `Id_departamento`) VALUES
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
  `Id_tipo_novedad` varchar(20) NOT NULL,
  `Novedad` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tipo_novedad`
--

INSERT INTO `tipo_novedad` (`Id_tipo_novedad`, `Novedad`) VALUES
('cal02', ''),
('cam_h08', ''),
('cam_t06', ''),
('cap04', ''),
('ext05', ''),
('inc03', ''),
('per07', ''),
('vac01', '');

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
(80101476, 'Edisson', 'Andrés', 'Taborda', 'Reyes', 'adm05', 'edissontaborda@paliacare.com', '$2a$10$TNNqfKXw.NYc5GwJiJ5pB.k1Sdfam8Jqt95GTyLvd0DfR18HZvcV6'),
(110681104, 'Genny', 'Carolina', 'Murcia', 'Vargas', 'ter04', 'gennymurcia@paliacare.com', '$2a$10$T3O/m/xNp18oXsm4o85QyeX4o5zyhiWrFu7JbLiypLe6mF76h832O'),
(1101101101, 'Yuliy', 'Paola', 'Daza', 'Oviedo', 'aux01', 'yuliydaza@paliacare.com', '$2a$10$kQ/V.vkCHYq..xPW5/a2feZouwN.j5K/8kzgSkDNosVUBTooeQQQC'),
(1102102101, 'Melissa', 'Andrea', 'Solano', 'Patiño', 'med03', 'melissasolano@paliacare.com', '$2a$10$dr/bUSh2EYUeeNbYqNtQuOHD.YXwsJofP5e2Q7GEHONKSUcW8qsVq'),
(1103103101, 'Angelica', 'Milena', 'Prada', 'Cañón', 'ter04', 'angelicaprada@paliacare.com', '$2a$10$21A6rXqQFXZ9gFYX.Wqs9uFbV847yBlRDF0acrOh75Ayh7PhA7pEe'),
(1104104101, 'Jesús', 'Daniel', 'Beltrán', 'Rodríguez', 'aux01', 'jesusbeltran@paliacare.com', '$2a$10$NVlLIr1vOfQqebqW7aZmC.SHOGsUYhUw.yBWaWmVeaxPIyFqALeku'),
(1104774847, 'Leydi', 'Cecilia', 'Godoy', 'Ortiz', 'adm05', 'leydigodoy@paliacare.com', '$2a$10$D3Yu77JIOqBCG6uMz9fdOubRZwAbLSQR0oRSIyeA6t7Jipbqnmxky'),
(1105105104, 'Carlos', 'Andrés', 'Rodríguez', 'Ochoa', 'med03', 'carlosrodriguez@paliacare.com', '$2a$10$aGwJ5dRA.yJVEESep6UJQuJ2idQemauoDK5ZQaZirJZyQXqWYaY/2'),
(1107107107, 'Jenny', 'Andrea', 'Martinez', 'Heredia', 'enf02', 'jennymartinez@paliacare.com', '$2a$10$ItlJPq9yAWRaQVti1z55re/rJQT60oVVRHwL4dQTpXl4W8lt44wYO'),
(1108108104, 'María', 'Camila', 'barajas', 'López', 'enf02', 'mariabarajas@paliacare.com', '$2a$10$lc1T7Qt/tFr0d4wuB2pREOyP4.h7U/wzgaXIKs586Nkym9h6DL/S2'),
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
(1110110120, 'Santiago', 'Jose', 'Cardona', NULL, 'adm05', 'santiagocardona@paliacare.com', '$2a$10$pKbtPq6KyM0EKUbtwmqUROKmAsS3o.b..KDTBbUNkkaVnibu1YWWm'),
(1110110121, 'Marcela', NULL, 'Panqueva', 'Rios', 'ter04', 'marcelapanqueva@paliacare.com', '$2a$10$Ae2/xw/Xoe80POlyxgQ5SuYUdehCditbX.w50rlFSYzgIup3K23Bm'),
(1110110122, 'Erika', 'Amanda', 'Suarez', 'Parra', 'med03', 'amandasuarez@paliacare.com', '$2a$10$62f.794jr3Z2GD.LGK31zOV4TTJuJIV159O8IU1bBjwmwAfzUd4di'),
(1110110142, 'Yajaira', 'Paola', 'Rangel', 'Roa', 'aux01', 'yajairarangel@paliacare.com', '$2a$10$dX5yc0PZGKyLlg1pllcV2ujmEIuJOTErIGmH0c92XBqPJnj/OEVb6'),
(1110110146, 'Sandy', 'Lorena', 'Páez', 'Soto', 'med03', 'sandypaez@paliacare.com', '$2a$10$kAU6OdSpGnFTLhdntDHOt.hVxlX41JpTYp6rnQWovQf5hSqTEM5SO');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `asignacion_turno`
--
ALTER TABLE `asignacion_turno`
  ADD PRIMARY KEY (`id_turno`,`Id_empleado`),
  ADD KEY `Id_empleado` (`Id_empleado`);

--
-- Indices de la tabla `capacitacion`
--
ALTER TABLE `capacitacion`
  ADD PRIMARY KEY (`Id_capacitacion`),
  ADD KEY `Id_tema` (`Id_tema`),
  ADD KEY `Id_estado_cap` (`Id_estado_cap`),
  ADD KEY `Id_empleado` (`Id_empleado`);

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
-- Indices de la tabla `novedades`
--
ALTER TABLE `novedades`
  ADD PRIMARY KEY (`Id_novedad`),
  ADD KEY `FK_NOVEDADES_TIPO_NOVEDAD` (`Id_tipo_novedad`),
  ADD KEY `FK_NOVEDADES_ESTADO_NOV` (`id_estado_nov`),
  ADD KEY `fk_novedades_empleado` (`Id_empleado`);

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
  ADD PRIMARY KEY (`Id_tipo_novedad`);

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
-- AUTO_INCREMENT de la tabla `turno`
--
ALTER TABLE `turno`
  MODIFY `id_turno` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `asignacion_turno`
--
ALTER TABLE `asignacion_turno`
  ADD CONSTRAINT `asignacion_turno_ibfk_1` FOREIGN KEY (`id_turno`) REFERENCES `turno` (`id_turno`),
  ADD CONSTRAINT `asignacion_turno_ibfk_2` FOREIGN KEY (`Id_empleado`) REFERENCES `empleado` (`Id_empleado`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `capacitacion`
--
ALTER TABLE `capacitacion`
  ADD CONSTRAINT `capacitacion_ibfk_1` FOREIGN KEY (`Id_tema`) REFERENCES `tema_capacitacion` (`Id_tema`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `capacitacion_ibfk_2` FOREIGN KEY (`Id_estado_cap`) REFERENCES `estado_capacitacion` (`Id_estado_cap`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `capacitacion_ibfk_3` FOREIGN KEY (`Id_empleado`) REFERENCES `empleado` (`Id_empleado`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `empleado`
--
ALTER TABLE `empleado`
  ADD CONSTRAINT `FK_EMPLEADO_ROL` FOREIGN KEY (`Id_rol`) REFERENCES `rol` (`Id_rol`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_EMPLEADO_USUARIO` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`Id_usuario`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `novedades`
--
ALTER TABLE `novedades`
  ADD CONSTRAINT `FK_NOVEDADES_ESTADO_NOV` FOREIGN KEY (`id_estado_nov`) REFERENCES `estado_novedad` (`Id_Estado_nov`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_NOVEDADES_TIPO_NOVEDAD` FOREIGN KEY (`Id_tipo_novedad`) REFERENCES `tipo_novedad` (`Id_tipo_novedad`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_novedades_empleado` FOREIGN KEY (`Id_empleado`) REFERENCES `empleado` (`Id_empleado`) ON DELETE CASCADE ON UPDATE CASCADE;

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
