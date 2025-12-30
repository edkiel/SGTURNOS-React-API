# Proyecto SGTURNOS – Ciclo de Vida del Proyecto

> Documento para entrega en PDF (normas APA 7). Este archivo es una base completa lista para revisión y exportación. Personalice los campos marcados con "[Por definir]" antes de generar el PDF.

---

## 1. Portada

- Título del proyecto: SGTURNOS – Módulo de Gestión de Mallas y Novedades
- Empresa/Entidad: Paliacare
- Área involucrada: Área asistencial (auxiliares, enfermeros, terapeutas, médicos)
- Equipo (empresa: Digikiel): Edisson Taborda (Gerente de proyecto), Leydi Godoy (Desarrolladora), Yeira Ortiz (Desarrolladora)
- Fecha de inicio del proyecto: 15/12/2025

---

## 2. Tabla de contenido

1. Portada  
2. Tabla de contenido  
3. Introducción  
4. Objetivos (general y específicos)  
5. Desarrollo del proyecto (por fases del ciclo de vida)  
   - Inicio  
   - Planificación  
   - Ejecución (conceptual)  
   - Monitoreo y Control  
   - Cierre  
6. Video de presentación  
7. Conclusiones  
8. Referencias  

---

## 3. Introducción

Paliacare cuenta con un equipo asistencial de 35 auxiliares, 10 enfermeros, 8 terapeutas y 6 médicos. La gestión de turnos y novedades se realiza hoy con procesos manuales (hojas de cálculo y mensajería), lo que genera errores, tiempos muertos y poca trazabilidad. El proyecto SGTURNOS (backend Spring Boot Java 21 y frontend Vite + React) integra autenticación JWT, perfiles y flujos de aprobación para optimizar la planificación de mallas (matrices de turnos), registrar novedades y aplicar aprobaciones por roles.

Este documento detalla la mejora/implementación del "Módulo de Gestión de Mallas y Novedades" con alertas, flujos de aprobación y reportes, aplicando las fases del Ciclo de Vida del Proyecto con enfoque práctico para Paliacare.

---

## 4. Objetivos

- Objetivo general: Diseñar e implementar un módulo de software para Paliacare que estandarice la generación de mallas, el registro de novedades y el flujo de aprobación por roles asistenciales, mejorando tiempos, calidad y trazabilidad.

- Objetivos específicos:
  - Automatizar la generación, validación y publicación de mallas por rol (auxiliares, enfermeros, terapeutas, médicos) con exportes a Excel/PDF.
  - Integrar flujos de aprobación de novedades con roles definidos (jefe inmediato, líder de enfermería, jefe de medicina, aprobadores administrativos).
  - Consolidar indicadores de cobertura, tiempos de aprobación, incidencias y cumplimiento de turnos.
  - Asegurar acceso y segregación de funciones mediante JWT, CORS y control por rol.
  - Disponer de un plan de comunicación y evidencias (auditoría y reportes) para equipo y stakeholders.

---

## 5. Desarrollo del proyecto por fases

### 5.1 Fase de Inicio

- Área: Asistencial (planificación de turnos y novedades para auxiliares, enfermeros, terapeutas y médicos).
- Necesidad: Reducir errores y tiempos en la construcción de mallas; formalizar el flujo de registro/validación de novedades; disponer de alertas, reportes y publicación segmentada por rol.

#### Acta de constitución del proyecto
- Nombre del proyecto: SGTURNOS – Módulo de Gestión de Mallas y Novedades
- Objetivo general: Optimizar y estandarizar la gestión de turnos y novedades, habilitando aprobación por roles y trazabilidad.
- Alcance (alto nivel):
  - Backend: Endpoints REST bajo `/api` (Spring Boot, JWT), almacenamiento de mallas y novedades, roles y aprobaciones, exportes y auditoría básica.
  - Frontend: Vite + React, pantallas para login, dashboard, datos personales, consulta de mallas, gestión de novedades, gestión de usuarios (administradores), flujo de aprobación y alertas.
  - Integración: Base URL `http://localhost:8085/api` (desarrollo), CORS para `http://localhost:5173`.
- Equipo de trabajo (Digikiel): Edisson Taborda (Gerente de proyecto), Leydi Godoy (Desarrolladora), Yeira Ortiz (Desarrolladora).
- Roles adicionales: Analista funcional (acompañado por GP), QA/Tester (apoyo del equipo), Stakeholders: líder de enfermería, jefe de medicina, RRHH.

#### Contexto de usuarios y roles
- Población aproximada: 35 auxiliares, 10 enfermeros, 8 terapeutas, 6 médicos.
- Roles asistenciales: Acceso a login, dashboard, datos personales, consulta de mallas, registro y seguimiento de novedades (según rol), visualización de publicaciones oficiales.
- Roles administradores: Acceso a login, dashboard, gestión de usuarios, gestión de mallas (generar/exportar/publicar), gestión de novedades (aprobación), alertas e indicadores.

---

### 5.2 Fase de Planificación

#### Entregables del proyecto
- Documento de requisitos y casos de uso específicos por rol asistencial y administrativo.
- Arquitectura y diseño (JWT, roles, flujos de aprobación, almacenamiento de mallas, exportes).
- Backend funcional con endpoints: autenticación, usuarios, mallas, novedades, aprobaciones, reportes y auditoría básica.
- Frontend con vistas: Login, Dashboard, Datos personales, Consulta de mallas, Gestión de novedades (usuario), Gestión de usuarios (admin), Gestión de mallas (admin: generar/exportar/publicar), Gestión/aprobación de novedades (admin), Alertas e indicadores.
- Pruebas funcionales y de integración.
- Indicadores y reportes operativos.
- Documentación del usuario y guía de video.

#### Cronograma (2 meses estimados, inicio 15/12/2025)

| Fase/Actividad | Inicio | Fin | Duración | Responsable |
|---|---|---|---|---|
| Inicio: levantamiento de necesidad y acta | 15/12/2025 (Lun) | 17/12/2025 (Mié) | 3 días | GP/AF |
| Planificación: requisitos y alcance | 18/12/2025 (Jue) | 24/12/2025 (Mié) | 5 días | AF/GP |
| Diseño: arquitectura y modelo de datos | 26/12/2025 (Vie) | 02/01/2026 (Vie) | 5 días | BE/FE |
| Desarrollo Backend (auth, usuarios) | 05/01/2026 (Lun) | 14/01/2026 (Mié) | 8 días | BE |
| Desarrollo Backend (mallas, novedades, aprobaciones) | 15/01/2026 (Jue) | 26/01/2026 (Lun) | 8 días | BE |
| Desarrollo Frontend (login, dashboard, datos personales) | 05/01/2026 (Lun) | 14/01/2026 (Mié) | 8 días | FE |
| Desarrollo Frontend (mallas, novedades, aprobaciones, alertas) | 15/01/2026 (Jue) | 28/01/2026 (Mié) | 10 días | FE |
| Integración y pruebas (QA y UAT) | 29/01/2026 (Jue) | 04/02/2026 (Mié) | 5 días | QA/Stakeholders |
| Ajustes y documentación | 05/02/2026 (Jue) | 10/02/2026 (Mar) | 4 días | Todos |
| Cierre y entrega | 11/02/2026 (Mié) | 11/02/2026 (Mié) | 1 día | GP |

> Gantt sugerido: Backend base → Backend mallas/novedades → Frontend integra API → QA/UAT → Ajustes → Cierre.

#### Diagrama de Gantt (tabla extendida con dependencias y holguras de referencia)

| Id | Actividad | Inicio | Fin | Duración | Dependencia | Responsable | Holgura ref. |
|---|---|---|---|---|---|---|---|
| A | Inicio y acta | 15/12/2025 | 17/12/2025 | 3d | — | GP/AF | 0d |
| B | Planificación y alcance | 18/12/2025 | 24/12/2025 | 5d | A | AF/GP | 0d |
| C | Diseño (arquitectura/modelo) | 26/12/2025 | 02/01/2026 | 5d | B | BE/FE | 1d |
| D | Backend base (auth, usuarios) | 05/01/2026 | 14/01/2026 | 8d | C | BE | 1d |
| E | Backend mallas/novedades/aprobaciones | 15/01/2026 | 26/01/2026 | 8d | D | BE | 0d |
| F | Frontend base (login, dashboard, datos) | 05/01/2026 | 14/01/2026 | 8d | C | FE | 1d |
| G | Frontend mallas/novedades/aprobaciones/alertas | 15/01/2026 | 28/01/2026 | 10d | F,E | FE | 0d |
| H | Integración y pruebas (QA/UAT) | 29/01/2026 | 04/02/2026 | 5d | G,E | QA/Stakeholders | 0d |
| I | Ajustes y documentación | 05/02/2026 | 10/02/2026 | 4d | H | Todos | 1d |
| J | Cierre y entrega | 11/02/2026 | 11/02/2026 | 1d | I | GP | 0d |

Notas para visualizar el Gantt:
- Camino crítico sugerido: A → B → C → D → E → G → H → I → J.
- Holguras son de referencia para absorber pequeños retrasos; priorizar no consumir holgura de actividades críticas.

#### Recursos
- Humanos: Edisson Taborda (GP/AF), Leydi Godoy (FE/BE), Yeira Ortiz (FE/BE), apoyo QA (equipo Digikiel), Stakeholders (líder enfermería, jefe medicina, RRHH).
- Tecnológicos: Spring Boot (Java 21), Maven; Vite + React; Tailwind; Base de datos recomendada: PostgreSQL (seguridad, transacciones, extensiones para reportes), alternativa MySQL/MariaDB si ya existe soporte; Control de versiones Git (ramas `develop`, `edissonDev`); Exportes Excel/PDF.
- Financieros: Dedicación del equipo (8 horas/día, 6 días/semana), costos de infraestructura dev/test (contenerizable en futuro), licencias: no requeridas (stack OSS).

#### Entorno de despliegue sugerido
- Desarrollo: local con perfiles dev, CORS abierto a `http://localhost:5173`, base de datos PostgreSQL en contenedor (Docker) o instancia local.
- Pruebas/UAT: entorno aislado con PostgreSQL gestionado; despliegue del backend en contenedor (Docker) o servicio tipo App Service/VM; frontend servido por Vite build estático en hosting web o CDN.
- Producción (futuro): contenedores orquestados (Docker Compose inicial, escalable a Kubernetes), PostgreSQL gestionado, HTTPS obligatorio, variables de entorno para `jwt.secret` (Base64) y credenciales DB; CDN para frontend estático.

#### Matriz de riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Cambios en requisitos asistenciales | Media | Alta | Comité de cambios, historias priorizadas y trazables |
| Retrasos por integración FE/BE | Media | Media | Mock API temprana, pruebas de contrato |
| Seguridad JWT mal configurada | Baja | Alta | Revisión de `SecurityConfig`, pruebas de autorización y CORS |
| Datos sensibles en mallas y novedades | Media | Alta | Segregación por rol, publicación segmentada, auditoría |
| Fatiga del equipo (8h x 6d) | Media | Media | Plan de comunicación, rotación de tareas, retrospectivas |
| Disponibilidad de líderes para aprobar | Media | Media | Ventanas de aprobación definidas, recordatorios y alertas |

#### Plan de comunicación
- Canales: Reuniones semanales, tablero de tareas, reportes quincenales, chat.
- Ritmo: Estado semanal; avances por fase; alertas de riesgo.
- Roles: GP consolida reportes; AF gestiona cambios; BE/FE reportan progreso técnico; líderes asistenciales validan entregables funcionales.

---

### 5.3 Fase de Ejecución (conceptual)

#### ¿Cómo se desarrollaría el módulo?
1. Autenticación y seguridad: Revisar `application.properties` (puerto, `jwt.secret` Base64), `SecurityConfig` (CORS y endpoints públicos), `JwtTokenProvider` y `JwtAuthenticationFilter` para asegurar rutas protegidas.
2. Usuarios y roles: Mantener permisos abiertos en dev solo para `/api/usuarios/**` si se requiere prueba; en prod, restringir por rol. Roles: asistenciales (auxiliar/enfermero/terapeuta/médico) y administradores.
3. Mallas: Generar y almacenar (`malla.storage.path`), exportar a Excel/PDF; validación por líder de enfermería (aux/enf) y jefe de medicina (ter/med); sólo se publica al rol correspondiente.
4. Novedades: Registro por usuario; flujo de aprobación por jefe inmediato y aprobadores administrativos; auditoría de estados.
5. Alertas y reportes: Indicadores de cobertura, tiempos de aprobación, incidencias; alertas por retraso en aprobación.
6. Frontend: Integrar vistas existentes (Login, Dashboard, Datos personales, Mallas, Novedades, Aprobadores, Alertas) usando `src/api.js` y token en `localStorage`.

#### Mapa de módulos y endpoints (conceptual)
- Público (login): `/api/auth/login`, `/api/auth/register` (si aplica); CORS para `http://localhost:5173` en dev.
- Administrador: `/api/usuarios/**` (gestión), `/api/mallas/**` (generar, exportar, publicar), `/api/novedades/**` (aprobar/rechazar), `/api/reportes/**` (indicadores), `/api/alertas/**`.
- Rol asistencial: `/api/mallas/mis-mallas` (consulta por rol), `/api/novedades` (crear/ver), `/api/alertas`.
- Todas las rutas protegidas requieren JWT; publicación de mallas es segmentada por rol antes de exponerlas.

#### Gestión del equipo y tareas
- Tablero por historias de usuario; sprint de 1–2 semanas.
- Revisión de código por pares; flujo de ramas `develop` → `edissonDev` para features.
- Ventanas de aprobación con líderes (enfermería y medicina) durante las pruebas.

---

### 5.4 Fase de Monitoreo y Control

#### Indicadores (KPIs) y metas sugeridas
- Tiempo promedio de aprobación de novedades: meta ≤ 24h hábiles.
- Porcentaje de cobertura de mallas planificadas vs ejecutadas: meta ≥ 95%.
- Tasa de incidencias por periodo: meta ≤ 2% de los turnos publicados.
- Tiempo de publicación de malla desde generación: meta ≤ 8h hábiles.
- Satisfacción del usuario (encuesta breve): meta ≥ 4/5.

#### Control de calidad
- Pruebas unitarias y de integración (`mvnw test`).
- Revisión de endpoints protegidos por JWT y de CORS.
- Validación de exportes y vistas críticas (mallas, novedades, aprobación).

#### Control de costos y gestión de cambios
- Seguimiento de horas plan vs reales (8h x 6d por persona); variación aceptable ±10%.
- Comité de cambios: GP + líderes asistenciales; evaluación de impacto en alcance/cronograma.
- Registro de cambios y efectos en cronograma, con replanificación si aplica.

---

### 5.5 Fase de Cierre

- Resultados esperados: Módulo funcionando con publicación segmentada por rol, mallas y novedades trazables, flujo de aprobación validado por líderes de enfermería y medicina, alertas e indicadores operativos.
- Procedimiento de entrega: Demo oficial, documentación, acceso a repositorio, manuales de usuario y administración, enlace al video.
- Criterios de éxito: KPIs dentro de metas; adopción por usuarios asistenciales; reducción de tiempos de aprobación y errores en mallas; satisfacción ≥ 4/5.
- Lecciones aprendidas: Definir roles y ventanas de aprobación desde el inicio; validar JWT/CORS temprano; involucrar a líderes asistenciales en UAT; mantener publicación segmentada para minimizar errores de visibilidad.

---

## 6. Video de presentación (5–7 minutos)

- Participantes: Todo el equipo, en cámara.
- Guion sugerido:
  1. Problema e importancia (30–45s)
  2. Objetivos y alcance (45–60s)
  3. Aplicación de fases del ciclo de vida (2–3 min)
  4. Resultados esperados y KPIs (60–90s)
  5. Lecciones aprendidas y cierre (30–45s)
- Enlace del video: [YouTube/Drive – Por definir]

---

## 7. Conclusiones

El enfoque por fases permitió alinear el desarrollo del módulo con las necesidades reales de RRHH. La integración de autenticación JWT, vistas React y endpoints Spring Boot mejora la trazabilidad y reduce tiempos. Con indicadores claros y un plan de comunicación efectivo, el módulo se vuelve sostenible y medible.

---

## 8. Referencias (APA 7)

- Pressman, R. S., & Maxim, B. R. (2020). Software Engineering: A Practitioner’s Approach (9th ed.). McGraw-Hill.
- Sommerville, I. (2016). Software Engineering (10th ed.). Pearson.
- Spring Team. (2025). Spring Boot Reference Documentation. https://docs.spring.io/spring-boot/
- React Team. (2025). React Docs. https://react.dev/
- Documentación interna del proyecto SGTURNOS: `SecurityConfig.java`, `AuthController.java`, `JwtTokenProvider.java`, `application.properties`, `sgturnos-react-app/src/api.js`.

---

## Instrucciones para exportar a PDF

- Opción rápida (Windows): Abrir en VS Code/Edge → Imprimir → "Guardar como PDF".
- Opción con Pandoc (si lo usa):

```powershell
# Instale Pandoc si no lo tiene y luego:
pandoc "docs/Proyecto_SGTURNOS_Ciclo_Vida.md" -o "Proyecto_SGTURNOS_Ciclo_Vida.pdf" --from markdown --pdf-engine=wkhtmltopdf
```

---

## Campos a personalizar

- Empresa/Entidad, Equipo y Roles, Fechas del cronograma, Base de datos, Presupuesto, Enlace del video.

