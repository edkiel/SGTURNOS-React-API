# PROMPT DE CONTEXTO: Proyecto SGTURNOS

## Descripción General del Proyecto

El proyecto **SGTURNOS** es una aplicación web full-stack diseñada para optimizar y estandarizar la gestión de turnos (mallas) y novedades de personal en el área asistencial de **Paliacare**, una empresa de servicios de salud. La solución integra autenticación JWT, control de acceso por roles, flujos de aprobación multinivel y generación de reportes.

---

## Contexto de la Empresa (Paliacare)

- **Empresa**: Paliacare (área asistencial)
- **Población de usuarios**: 59 personas en total
  - 35 Auxiliares de enfermería
  - 10 Enfermeros
  - 8 Terapeutas
  - 6 Médicos
- **Problema actual**: Gestión manual de turnos (hojas de cálculo) y novedades (por mensajería), generando errores, tiempos muertos y falta de trazabilidad.

---

## Equipo del Proyecto

- **Empresa desarrolladora**: Digikiel
- **Gerente de Proyecto**: Edisson Taborda (también asume rol de Analista Funcional)
- **Desarrolladora Backend/Frontend**: Leydi Godoy
- **Desarrolladora Backend/Frontend**: Yeira Ortiz
- **Stakeholders principales**: Líder de enfermería, Jefe de medicina, RRHH de Paliacare

---

## Stack Tecnológico

### Backend
- **Framework**: Spring Boot 3.x (Java 21)
- **Build Tool**: Maven (con wrapper `mvnw`/`mvnw.cmd`)
- **Seguridad**: JWT (tokens en Base64), SecurityConfig personalizado
- **CORS**: Configurado para dev en `http://localhost:5173`, expandible en prod
- **Base de datos (recomendada)**: PostgreSQL (transacciones, extensiones para reportes)
- **Puerto**: 8085
- **API Base URL (dev)**: `http://localhost:8085/api`

### Frontend
- **Framework**: Vite + React (ESM)
- **Styling**: Tailwind CSS
- **Client HTTP**: Axios (instancia en `src/api.js` con token JWT automático)
- **Almacenamiento de token**: localStorage (key: `token`)
- **Puerto (dev)**: 5173

### Control de Versiones
- **Sistema**: Git
- **Rama principal**: `develop`
- **Rama de trabajo**: `edissonDev` (para features)

---

## Estructura de Módulos y Rutas

### Módulos por Rol de Usuario

#### **Roles Asistenciales** (Auxiliares, Enfermeros, Terapeutas, Médicos)
Flujo después de login:
1. **Login**: `/api/auth/login` (POST)
2. **Dashboard/Inicio**: vista inicial con resumen
3. **Mis Datos Personales**: consulta y edición básica
4. **Consultar Mallas**: visualizar mallas publicadas para su rol (solo lectura)
5. **Registrar Novedades**: crear/ver novedades; seguimiento de aprobaciones
6. **Alertas**: notificaciones de cambios en mallas o estados de novedades

#### **Roles Administradores**
Flujo después de login:
1. **Login**: `/api/auth/login` (POST)
2. **Dashboard/Inicio**: resumen operativo
3. **Gestión de Usuarios**: CRUD de usuarios por rol
4. **Gestión de Mallas**: 
   - Generar mallas (automático o manual)
   - Exportar a Excel/PDF
   - Enviar a aprobación (líder de enfermería o jefe de medicina)
   - Publicar (solo para roles correspondientes)
5. **Gestión/Aprobación de Novedades**: revisar, aprobar o rechazar
6. **Alertas e Indicadores**: KPIs de cobertura, tiempos, incidencias

---

## Endpoints Principales (Conceptual)

### Autenticación (Pública)
- `POST /api/auth/login` → `{ email, password }` ← `{ accessToken }`
- `POST /api/auth/register` (opcional según alcance)

### Usuarios (Protegido - Administrador)
- `GET /api/usuarios/**` → lista, buscar, detalles
- `POST /api/usuarios` → crear
- `PUT /api/usuarios/{id}` → actualizar
- `DELETE /api/usuarios/{id}` → eliminar

### Mallas (Protegido)
- `GET /api/mallas/mis-mallas` → consulta por rol asistencial
- `POST /api/mallas` (Admin) → generar nueva
- `GET /api/mallas/{id}` → detalles
- `POST /api/mallas/{id}/exportar` → Excel/PDF
- `POST /api/mallas/{id}/enviar-aprobacion` (Admin) → a líder
- `POST /api/mallas/{id}/publicar` (Admin/Líderes) → publica solo para rol destino
- `GET /api/mallas/historial` (Admin) → historial y versiones

### Novedades (Protegido)
- `POST /api/novedades` (Asistencial) → crear
- `GET /api/novedades` → mis novedades (filtrado por rol)
- `PUT /api/novedades/{id}` (Asistencial) → editar antes de aprobación
- `POST /api/novedades/{id}/aprobar` (Líderes) → aprobar
- `POST /api/novedades/{id}/rechazar` (Líderes) → rechazar con comentario

### Reportes (Protegido - Administrador)
- `GET /api/reportes/cobertura` → % mallas ejecutadas
- `GET /api/reportes/tiempos-aprobacion` → promedio horas/días
- `GET /api/reportes/incidencias` → tasa de incidentes

### Alertas (Protegido)
- `GET /api/alertas` → mis alertas (segmentadas por rol)
- `POST /api/alertas/{id}/marcar-leida`

---

## Flujos de Negocio Críticos

### Flujo 1: Generación y Publicación de Mallas
1. Administrador genera malla (automáticamente o manual).
2. Sistema exporta a Excel/PDF (`malla.storage.path` = `./mallas`).
3. Malla se envía a aprobación:
   - **Auxiliares/Enfermeros** → Líder de enfermería
   - **Terapeutas/Médicos** → Jefe de medicina
4. Líder/Jefe aprueba o rechaza (auditoría de estados).
5. Si aprobada, administrador publica (visible solo para rol destino).
6. Usuarios del rol pueden consultar malla publicada.

### Flujo 2: Registro y Aprobación de Novedades
1. Usuario asistencial registra novedad (permiso, incapacidad, cambio de turno, etc.).
2. Novedad queda en estado "pendiente".
3. Jefe inmediato recibe notificación y aprueba/rechaza.
4. Si aprueba, aprobador administrativo valida.
5. Auditoría registra cada transición de estado (quién, cuándo, comentario).
6. Usuario y jefes reciben alertas de cambios.

### Flujo 3: Consulta de Indicadores
1. Administrador accede a dashboard.
2. Sistema calcula en tiempo real:
   - Cobertura: (turnos asignados / turnos planificados) × 100
   - Tiempo de aprobación: promedio horas desde solicitud hasta aprobación
   - Incidencias: cambios de último minuto, ausencias no reportadas, etc.
3. Genera gráficos y reportes descargables.

---

## Reglas de Seguridad y Acceso

### Autenticación
- **Método**: JWT (tokens con expiración configurable en `jwt.secret` Base64)
- **Almacenamiento frontend**: `localStorage` con clave `token`
- **Validación**: `JwtAuthenticationFilter` en cada request protegido

### Autorización
- **Segregación por rol**: Cada endpoint verifica rol del usuario antes de exponer datos.
- **Publicación segmentada**: Mallas se filtran por rol antes de retornar a cliente.
- **Auditoría**: Cambios en mallas y novedades registran usuario, timestamp, acción.

### CORS (Desarrollo)
- Origen permitido: `http://localhost:5173`
- Headers: `Authorization`, `Content-Type`
- Métodos: GET, POST, PUT, DELETE

### Endpoints Públicos (sin JWT)
- Solo `/api/auth/login` y `/api/auth/register` (si aplica)

### Endpoints Restringidos por Rol
- `/api/usuarios/**` → Solo administrador
- `/api/mallas` (POST, PUT, publicar) → Solo administrador
- `/api/novedades` (aprobar/rechazar) → Jefe inmediato y aprobadores
- `/api/reportes/**` → Solo administrador
- `/api/mallas/mis-mallas` → Asistencial (ve solo su rol)
- `/api/novedades` (GET) → Asistencial ve sus propias novedades

---

## Configuración Clave (application.properties)

```properties
# Servidor
server.port=8085

# Base de datos
spring.datasource.url=jdbc:postgresql://localhost:5432/sgturnos
spring.datasource.username=postgres
spring.datasource.password=[contraseña]
spring.jpa.hibernate.ddl-auto=update

# JWT
jwt.secret=[Base64-encoded-secret]
jwt.expiration=86400000  # 24 horas en ms

# Almacenamiento de mallas
malla.storage.path=./mallas

# CORS
cors.allowed-origins=http://localhost:5173
```

---

## Cronograma del Proyecto

- **Inicio**: 15/12/2025
- **Fin estimado**: 11/02/2026 (8 semanas)

### Hitos principales
| Fase | Fechas | Duración |
|---|---|---|
| Inicio y Acta | 15–17/12/2025 | 3d |
| Planificación | 18–24/12/2025 | 5d |
| Diseño | 26/12/2025–02/01/2026 | 5d |
| Backend: Auth + Usuarios | 05–14/01/2026 | 8d |
| Backend: Mallas + Novedades + Aprobaciones | 15–26/01/2026 | 8d |
| Frontend: Base | 05–14/01/2026 | 8d (paralelo) |
| Frontend: Módulos + Alertas | 15–28/01/2026 | 10d (paralelo) |
| Integración y Pruebas (QA/UAT) | 29/01–04/02/2026 | 5d |
| Ajustes y Documentación | 05–10/02/2026 | 4d |
| Cierre y Entrega | 11/02/2026 | 1d |

**Camino crítico**: A → B → C → D → E → G → H → I → J

---

## Indicadores de Éxito (KPIs)

1. **Tiempo de aprobación de novedades**: ≤ 24h hábiles
2. **Cobertura de mallas**: ≥ 95% planificadas ejecutadas
3. **Tasa de incidencias**: ≤ 2% de turnos publicados
4. **Tiempo de publicación**: ≤ 8h desde generación
5. **Satisfacción del usuario**: ≥ 4/5 (encuesta breve)

---

## Entorno de Despliegue

### Desarrollo
- Local con perfiles dev
- PostgreSQL en Docker o instancia local
- CORS abierto a `http://localhost:5173`

### Pruebas/UAT
- Entorno aislado con PostgreSQL gestionado
- Backend en contenedor Docker
- Frontend servido como Vite build estático

### Producción (futuro)
- Docker Compose (escalable a Kubernetes)
- PostgreSQL gestionado (AWS RDS, Azure DB, etc.)
- HTTPS obligatorio
- Variables de entorno para `jwt.secret` y credenciales DB
- CDN para frontend estático

---

## Archivos Clave del Proyecto

### Backend
- `sgturnos/pom.xml` → Dependencias Maven
- `sgturnos/src/main/resources/application.properties` → Config
- `sgturnos/src/main/java/com/sgturnos/config/SecurityConfig.java` → JWT, CORS, endpoints públicos
- `sgturnos/src/main/java/com/sgturnos/controller/AuthController.java` → Login, registro
- `sgturnos/src/main/java/com/sgturnos/security/JwtTokenProvider.java` → Generación/validación de tokens
- `sgturnos/src/main/java/com/sgturnos/security/JwtAuthenticationFilter.java` → Filtrado de requests

### Frontend
- `sgturnos-react-app/package.json` → Dependencias npm
- `sgturnos-react-app/vite.config.js` → Configuración de Vite
- `sgturnos-react-app/src/main.jsx` → Punto de entrada
- `sgturnos-react-app/src/App.jsx` → Componente raíz
- `sgturnos-react-app/src/api.js` → Cliente HTTP con JWT automático
- `sgturnos-react-app/src/components/LoginForm.jsx` → Login
- `sgturnos-react-app/src/components/Dashboard.jsx` → Inicio
- `sgturnos-react-app/src/components/UserList.jsx`, `mallas/`, `novedades/`, `admin/` → Módulos

### Control de versiones
- Ramas: `develop` (principal), `edissonDev` (desarrollo)
- Flujo: Feature → `edissonDev` → PR a `develop`

---

## Convenciones del Proyecto

1. **Idioma y comentarios**: Primariamente español (nomenclatura de variables y documentación).
2. **JWT Secret**: Siempre en Base64, nunca texto plano.
3. **Publicación de mallas**: Segmentada por rol antes de exponerla al cliente.
4. **Auditoría**: Todo cambio en mallas y novedades registra usuario, timestamp, acción.
5. **Pruebas**: Ejecutar `mvnw test` recurrentemente; incluir tests mínimos de auth, mallas, novedades.
6. **Documentación**: Mantener actualizada; guías de roles, alertas, generación de mallas.

---

## Estado Actual y Próximos Pasos

### Estado
- Backend: Estructura base con Spring Boot, JWT, SecurityConfig implementados; endpoints de autenticación funcionales; modelos de usuario listos.
- Frontend: Vite + React configurado; LoginForm funcional; API client (`api.js`) con token automático.
- Base de datos: Schema inicial definido; migraciones preparadas.

### Próximos Pasos Inmediatos
1. Finalizar endpoints de mallas (generar, exportar, enviar a aprobación, publicar).
2. Implementar flujo de aprobación de novedades (con auditoría de estados).
3. Desarrollar vistas frontend: Dashboard, Consulta Mallas, Registro Novedades, Aprobaciones, Indicadores.
4. Integración FE/BE con pruebas.
5. UAT con líderes de enfermería y medicina.
6. Ajustes finales y documentación.

---

## Cómo Usar Este Prompt

- **Comparte este documento** con cualquier desarrollador, IA o stakeholder que necesite entender el proyecto rápidamente.
- **Refiérete a él** en conversaciones: "Según el contexto del proyecto SGTURNOS..."
- **Actualízalo** cuando cambien requisitos, roles, cronograma o tecnología.
- **Úsalo como referencia** para validar que todas las soluciones propuestas alinean con objetivos, seguridad, y arquitectura.

---

**Última actualización**: 28/12/2025  
**Responsable**: Edisson Taborda (GP, Digikiel)
