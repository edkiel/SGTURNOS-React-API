# SGTurnos - Sistema de Gestión de Turnos Hospitalarios

## 🏗️ Arquitectura General

**Stack:** Spring Boot 3.2.5 (Java 21) + MySQL 8 + React 19 + Vite 7 + TailwindCSS 3.4  
**Estructura:** Monorepo con backend (`sgturnos/`) y frontend (`sgturnos-react-app/`)  
**Propósito:** Gestión de mallas de turnos médicos con sistema de aprobaciones multinivel y manejo de novedades (vacaciones, incapacidades, cambios de turno)  
**Branch Activo:** LeydiV1 (default: develop)

### Flujos de Datos Principales
1. **Generación de Mallas**: Algoritmo v3.0 (`MallaGeneratorServiceImpl`) → Validación de cobertura → Aprobación dual (Jefe Inmediato + RRHH) → Publicación
2. **Gestión de Novedades**: Triple aprobación (Jefe → Operaciones Clínicas → RRHH) → Generación automática de alertas → Recálculo de mallas
3. **Sistema de Alertas**: Novedades aprobadas → `AlertaMalla` → Badge en Dashboard → Notificación a Operaciones

## 🚀 Workflows de Desarrollo

### Inicio Rápido (Windows PowerShell)
```powershell
# Backend (puerto 8085)
cd sgturnos
.\mvnw.cmd spring-boot:run

# Frontend (puerto 5173)  
cd sgturnos-react-app
npm run dev
```

### Construcción y Testing
```powershell
# Backend: compilar sin tests
cd sgturnos
.\mvnw.cmd -DskipTests package

# Backend: instalación completa (incluye tests)
mvn install

# Frontend: build producción
cd sgturnos-react-app
npm run build

# Limpiar cache npm si hay problemas
npm cache clean --force
```

### Database Migrations
**CRÍTICO:** `spring.flyway.enabled=false` en `application.properties` por compatibilidad MySQL 5.5. Migrations en `src/main/resources/db/migration/` son documentación; ejecutar manualmente si es necesario. Scripts SQL de prueba disponibles: `script_roles_prueba.sql`, `script_usuarios_prueba.sql`.

## 📁 Estructura de Backend (Spring Boot)

```
sgturnos/src/main/java/com/sgturnos/
├── config/          → SecurityConfig.java (JWT + CORS), WebConfig
├── controller/      → 13 REST controllers (@RestController)
├── model/           → 8 entidades JPA (@Entity): Usuario, Rol, Novedad, AlertaMalla, CambioTurno, AprobacionNovedad, TipoNovedad
├── repository/      → Spring Data JPA repositories
├── service/         → Lógica de negocio (NovedadService con triple aprobación)
├── security/        → JwtTokenProvider, JwtAuthenticationFilter
├── dto/             → DTOs para requests/responses
└── malla/           → Generador de mallas (MallaGeneratorServiceImpl, MallaAprobacionController)
```

**Archivos clave:**
- `SecurityConfig.java`: CORS permite `localhost:5173`, endpoints públicos en `/api/usuarios/**` y `/api/mallas/**` (testing local)
- `application.properties`: `jwt.secret` es **Base64-encoded**, `malla.storage.path=./mallas`, `soporte.storage.path=./uploads/soportes`
- `MallaGeneratorServiceImpl.java`: Algoritmo v3.0 de generación de mallas (192 horas exactas/usuario, cobertura 100%, prioriza turnos 12h, incluye CMP de 3h, APOYO solo para completar)
- `SgturnosApplication.java`: Punto de entrada Spring Boot con `@SpringBootApplication`

## 🎨 Estructura de Frontend (React)

```
sgturnos-react-app/src/
├── components/
│   ├── admin/          → CrearAdministrador.jsx
│   ├── mallas/         → JefeInmediatoRevisor, RecursosHumanosRevisor, AlertasMalla, BadgeAlertas
│   ├── novedades/      → 15 módulos (VacacionesModuleV2, PermisosModule, CalamidadModule, CambiosTurnosModule, IncapacidadesModule, etc.)
│   ├── roles/          → Gestión de roles
│   ├── turnos/         → TurnosModule, PersonalMalla, AdminPublishedMallas
│   ├── common/         → PageHeader.jsx (componentes reutilizables)
│   ├── Dashboard.jsx   → Hub principal con navegación basada en roles
│   ├── LoginForm.jsx   → Autenticación JWT
│   ├── MyAccount.jsx   → Perfil de usuario
│   └── UserList.jsx    → Administración de usuarios
├── utils/
│   └── exportUtils.js  → Utilidades para exportación (Excel, PDF)
├── api.js              → Axios instance con interceptor JWT (localStorage.token)
├── App.jsx             → Router + LoginForm + renderizado condicional por rol
└── ErrorBoundary.jsx   → Manejo de errores React
```

**Convenciones de UI:**
- TailwindCSS con gradientes por módulo (Vacaciones: azul, Incapacidades: rojo, Permisos: ámbar, etc.)
- Componente `SelectorNovedades` usa grid interactivo (1 col móvil, 2 tablet, 3 desktop)
- Badges de estado: `PENDIENTE` (amarillo), `APROBADA` (verde), `RECHAZADA` (rojo)

## 🔑 Autenticación y Roles

### Flujo de Auth
```javascript
// Login: POST /api/auth/login → { accessToken }
localStorage.setItem('token', accessToken);
// api.js interceptor automáticamente agrega header: Authorization: Bearer <token>
```

### Sistema de Roles (4 administrativos + usuarios base)
1. **Administrador**: Acceso total
2. **JEFE_INMEDIATO**: Aprueba mallas y novedades (primer nivel)
3. **OPERACIONES_CLINICAS**: Crea/publica mallas, aprueba novedades (segundo nivel), genera alertas
4. **RECURSOS_HUMANOS**: Aprueba mallas/novedades (tercer nivel), verifica impacto nómina

**Verificación de permisos:** `RolPermisosService.java` centraliza lógica de autorización

## ⚙️ Conceptos Core del Dominio

### Algoritmo de Mallas v3.0 (MallaGeneratorServiceImpl)
**Objetivo:** 192 horas exactas/usuario, cobertura 100% (calculada `auxiliares = ceil(pacientes / 6)`)

**Códigos de Turnos:**
- **TD**: Turno Día (12h, 07:00-19:00)
- **TN**: Turno Noche (12h, 19:00-07:00)
- **PT**: Posturno (descanso obligatorio post-noche)
- **CP**: Comité Primario (3h de capacitación)
- **LB**: Libre (descanso regular)
- **AP**: Apoyo (horas variables: 4h, 6h, 8h, 10h o 12h)

**Fases:**
1. **Asignación de Turnos 12h**: Cubrir demanda mensual con turnos TD y TN
2. **Asignación de PT**: Descanso obligatorio de 12h después de cada turno nocturno
3. **Comité Primario (CP)**: 3 horas de capacitación asignadas en días LB (cuenta para las 192h)
4. **Apoyo (AP)**: Solo para completar horas faltantes (`192 - horasActuales`)

**Restricciones:** No 3+ noches/días seguidos, no noche→día directo, máximo 2 LIBRES consecutivos, PT obligatorio post-noche

**Métodos clave:** `selectBestCandidateV3()`, `assignShiftV3()`, `fillMissingCoverageV3()`

### Sistema de Aprobación Triple (Novedades)
**Flujo:** Jefe Inmediato → Operaciones Clínicas → RRHH

**Endpoints:**
```
POST /api/novedades/aprobar-jefe/{id}       → aprobacionJefe = true
POST /api/novedades/aprobar-operaciones/{id}→ aprobacionOperaciones = true + crea AlertaMalla
POST /api/novedades/aprobar-rrhh/{id}       → aprobacionRrhh = true + estado = APROBADA
POST /api/novedades/rechazar-nivel/{id}     → estado = RECHAZADA + motivo
```

### Gestión de Alertas de Malla
**Trigger:** Al aprobar novedad en `NovedadService.aprobarPorOperaciones()` → `alertaMallaService.crearAlertaPorNovedad()`  
**Tipos de acción:**
- `RECALCULO_MES_ACTUAL`: Novedad afecta malla del mes en curso
- `EVITAR_PROGRAMACION_FUTURO`: Usuario no debe ser asignado en mes futuro

**UI:** Componente `AlertasMalla` con colores (rojo = urgente, amarillo = futuro), badge animado con contador en Dashboard

## 🎯 Patrones y Convenciones Específicos

### Backend
- **Lombok intensivo**: `@Data`, `@Entity`, `@NoArgsConstructor` en modelos
- **DTOs explícitos**: Evita exponer entidades JPA directamente en controllers
- **Service layer transaccional**: Métodos críticos usan `@Transactional`
- **Nombres en español**: Variables, métodos, comentarios (ej: `aprobacionJefe`, `mallaGenerada`)

### Frontend
- **Estado local con hooks**: No Redux/Context, usa `useState` + axios directo
- **Renderizado condicional por rol**: `Dashboard` muestra botones según `usuario.rol.nombre`
- **Formato de fechas**: Inputs HTML5 date (`YYYY-MM-DD`)
- **Manejo de errores**: `try/catch` con `setError()` y `setSuccess()` en formularios

### Database
- **IDs auto-incrementales**: `@GeneratedValue(strategy = GenerationType.IDENTITY)`
- **Relaciones lazy**: Usar `fetch = FetchType.LAZY` y DTOs para evitar N+1
- **Timestamps**: `@Column(name = "fecha_creacion")` en auditoría

## 🔧 Puntos de Integración Críticos

### CORS (SecurityConfig.java)
```java
.allowedOrigins("http://localhost:5173") // Vite dev server
.allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
```

### Archivo de Mallas
**Backend genera Excel** (`poi-ooxml`) en `./mallas/`, frontend descarga vía endpoint `/api/mallas/download/{id}`

### Soportes de Novedades
**Upload:** Frontend envía `multipart/form-data` → Backend guarda en `./uploads/soportes/novedad_{id}/`  
**Path relativo:** Configurar `soporte.storage.path` en `application.properties`

## 📚 Documentación de Referencia Rápida

Ver estos archivos en raíz del repo para detalles:
- `ROLES_ADMINISTRATIVOS_README.md`: Diagrama de flujo de aprobaciones
- `ALGORITMO_MALLAS_V3_README.md`: Detalle de fases del generador de mallas v3.0
- `NUEVO_ALGORITMO_README.md`: Documentación histórica del algoritmo v2.0
- `SISTEMA_ALERTAS_MALLAS_README.md`: Fase 1 (alertas) vs Fase 2 (recálculo pendiente)
- `GUIA_APROBACION_TRIPLE_NOVEDADES.md`: Arquitectura de aprobaciones
- `MEJORAS_NOVEDADES.md`: Paleta de colores UI y componentes visuales
- `GUIA_ROLES_ADMIN_COMPLETA.md` y `GUIA_ROLES.md`: Permisos y jerarquía de roles

## ⚠️ Gotchas Importantes

1. **JWT Secret:** Siempre en Base64. Decodificación automática en `JwtTokenProvider`.
2. **Flyway deshabilitado:** Migrations son documentales. Aplicar cambios DB manualmente.
3. **Permisos temporales:** `/api/usuarios/**` y `/api/mallas/**` son públicos en testing (revisar antes de producción).
4. **Path separators:** Código usa `/` en strings de rutas aunque sea Windows.
5. **React 19 + Vite 7:** No usar sintaxis antigua de React (<18).
6. **MySQL charset:** Usar `utf8mb4_unicode_ci` para caracteres especiales españoles.

## 🎯 Próximos Pasos (Pendientes)

- [ ] **Fase 2 de Alertas:** Algoritmo de recálculo automático de mallas al procesar alertas
- [ ] **Tests unitarios:** Cobertura backend (`sgturnos/src/test/`)
- [ ] **Validación de restricciones:** Front-end validar 3+ noches antes de enviar
- [ ] **Producción:** Habilitar Flyway, securizar endpoints públicos, externalizar secrets
