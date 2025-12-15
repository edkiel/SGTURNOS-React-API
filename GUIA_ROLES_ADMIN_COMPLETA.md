# GUÍA COMPLETA: ROLES ADMINISTRATIVOS Y CREACIÓN DE USUARIOS

## 📋 Resumen de Cambios Implementados

Se ha implementado un sistema completo de roles administrativos con distintas responsabilidades:

### 1. **Jefe Inmediato / Jefe de Departamento**
   - 📋 Revisa mallas generadas
   - ✅ Aprueba o rechaza mallas
   - ❌ **NO puede publicar** mallas
   - ✅ Aprueba/rechaza novedades (vacaciones, incapacidades)
   - 📊 Acceso a reportes
   - **Botón en menú:** "📋 Revisar Mallas"

### 2. **Operaciones Clínicas**
   - 🏥 Crea nuevas mallas de turnos
   - ✏️ Edita mallas existentes
   - 📤 Publica mallas (solo después de ambas aprobaciones)
   - 🔄 Busca reemplazos para vacaciones
   - ⭐ Marca turnos como "extras"
   - **Botón en menú:** "🏥 Gestionar Mallas"

### 3. **Recursos Humanos**
   - 👁️ Revisa mallas buscando novedades
   - 💼 Verifica impacto en nómina
   - ✅ Aprueba o rechaza mallas
   - 📋 Aprueba/rechaza novedades
   - 💰 Genera reportes de nómina
   - **Botón en menú:** "💼 Revisar para Nómina"

### 4. **Administrador**
   - 🔐 Acceso total a todas las funciones
   - 👤 Crear nuevos administradores
   - ⚙️ Gestionar todo el sistema
   - **Botón en menú:** "🔐 Crear Administrador"

---

## 🚀 PASOS PARA PROBAR EL SISTEMA

### PASO 1: Ejecutar las Migraciones
1. Inicia la aplicación Spring Boot:
   ```powershell
   cd sgturnos
   .\mvnw.cmd spring-boot:run
   ```
2. Flyway ejecutará automáticamente la migración `V5__create_admin_roles.sql`
3. Se crearán 3 nuevos roles:
   - `JEFE_INMEDIATO`
   - `OPERACIONES_CLINICAS`
   - `RECURSOS_HUMANOS`

### PASO 2: Crear Usuarios de Prueba (Opción A: BD Directa)
Ejecuta en MySQL estas sentencias SQL:

```sql
-- Jefe Inmediato
INSERT INTO usuario (id_usuario, primer_nombre, primer_apellido, correo, contrasena, id_rol) 
VALUES (101, 'Carlos', 'García', 'jefe@hospital.com', '$2a$10$...', 'JEFE_INMEDIATO');

-- Operaciones Clínicas
INSERT INTO usuario (id_usuario, primer_nombre, primer_apellido, correo, contrasena, id_rol) 
VALUES (102, 'María', 'Rodríguez', 'operaciones@hospital.com', '$2a$10$...', 'OPERACIONES_CLINICAS');

-- Recursos Humanos
INSERT INTO usuario (id_usuario, primer_nombre, primer_apellido, correo, contrasena, id_rol) 
VALUES (103, 'Ana', 'Sánchez', 'rrhh@hospital.com', '$2a$10$...', 'RECURSOS_HUMANOS');
```

### PASO 3: Crear Usuarios de Prueba (Opción B: Interfaz)
1. Inicia el frontend:
   ```powershell
   cd sgturnos-react-app
   npm run dev
   ```
2. Login como Administrador
3. Haz clic en **"🔐 Crear Administrador"**
4. Selecciona el rol administrativo (se mostrará descripción detallada)
5. Llena los datos:
   - Correo: `jefe@hospital.com`
   - Contraseña: (segura)
   - Nombres opcionales
6. Haz clic en **"✓ Crear Usuario Administrativo"**

---

## 🧪 FLUJO DE PRUEBA COMPLETO

### Escenario: Aprobación de Malla

#### 1️⃣ Operaciones Clínicas Crea Malla
- Login con usuario de Operaciones Clínicas
- Navega a "🏥 Gestionar Mallas"
- Crea nueva malla
- Estado: `CREADA` → Espera aprobaciones

#### 2️⃣ Jefe Inmediato Revisa y Aprueba
- Login con usuario Jefe Inmediato
- Navega a "📋 Revisar Mallas"
- Selecciona la malla creada
- Lee los detalles
- Escribe comentarios (opcional)
- Haz clic en **"✅ Aprobar Malla"**
- Estado: `CREADA` → `APROBADA_JEFE`
- ⚠️ **NO ve botón de Publicar**

#### 3️⃣ Recursos Humanos Revisa y Aprueba
- Login con usuario Recursos Humanos
- Navega a "💼 Revisar para Nómina"
- Selecciona la malla
- Verifica novedades del personal
- Escribe notas sobre impacto en nómina
- Haz clic en **"✅ Aprobar Malla"**
- Estado: `APROBADA_JEFE` → `APROBADA_RRHH`
- Mensaje: "Operaciones Clínicas puede publicar la malla"

#### 4️⃣ Operaciones Clínicas Publica
- Login con usuario Operaciones Clínicas
- Navega a "🏥 Gestionar Mallas"
- Selecciona la malla
- **Ahora VE el botón de "Publicar"** (antes no lo veía)
- Haz clic en **"📤 Publicar Malla"**
- Estado: `APROBADA_RRHH` → `PUBLICADA`
- ✅ Malla lista para usar

---

## 🔍 VERIFICAR PERMISOS VÍA API

### Endpoint para consultar permisos:
```http
GET /api/roles/permisos/{idUsuario}
```

**Respuesta ejemplo (Jefe Inmediato):**
```json
{
  "rol": "Jefe Inmediato",
  "puedeRevisarMallas": true,
  "puedeGestionarMallas": false,
  "puedePublicarMallas": false,
  "puedeRevisarNovedadesNomina": false,
  "esJefeInmediato": true,
  "esOperacionesClinicas": false,
  "esRecursosHumanos": false,
  "esAdministrador": false,
  "tienePermisosAdministrativos": true
}
```

---

## 📝 COMPONENTES FRONTEND AGREGADOS

### 1. **CrearAdministrador.jsx**
- Ubicación: `src/components/admin/CrearAdministrador.jsx`
- Interfaz visual de creación con selección gráfica de roles
- Muestra funciones específicas de cada rol
- Validación de datos

### 2. **JefeInmediatoRevisor.jsx**
- Ubicación: `src/components/mallas/JefeInmediatoRevisor.jsx`
- Panel para revisar mallas
- Botones: Aprobar / Rechazar (con motivo)
- Campo de comentarios

### 3. **RecursosHumanosRevisor.jsx**
- Ubicación: `src/components/mallas/RecursosHumanosRevisor.jsx`
- Panel para revisar mallas y novedades
- Verifica impacto en nómina
- Botones: Aprobar / Rechazar

### 4. **Dashboard.jsx (Actualizado)**
- Selector mejorado de roles con opciones predefinidas
- Muestra descripción del rol seleccionado
- Campo de roles: Usuario, Jefe Inmediato, Operaciones Clínicas, Recursos Humanos, Administrador

---

## 🔧 BACKEND - SERVICIOS Y CONTROLADORES

### 1. **RolPermisosService.java**
- Verifica permisos según rol
- Métodos útiles:
  - `puedeRevisarMallas(Usuario)` → Jefe Inmediato, RRHH, Admin
  - `puedeGestionarMallas(Usuario)` → Operaciones Clínicas, Admin
  - `puedePublicarMallas(Usuario)` → Operaciones Clínicas, Admin
  - `puedeRevisarNovedadesNomina(Usuario)` → RRHH, Admin

### 2. **MallaAprobacionController.java**
- Endpoints para aprobación de mallas:
  - `POST /api/mallas/aprobaciones/aprobar-jefe/{id}` → Jefe aprueba
  - `POST /api/mallas/aprobaciones/aprobar-rrhh/{id}` → RRHH aprueba
  - `POST /api/mallas/aprobaciones/rechazar/{id}` → Rechazar malla
  - `GET /api/mallas/aprobaciones/estado/{id}` → Ver estado

### 3. **RolController.java**
- Endpoints para gestión de roles:
  - `GET /api/roles/permisos/{idUsuario}` → Obtener permisos
  - `GET /api/roles/descripcion/{nombreRol}` → Descripción del rol

### 4. **Migración V5__create_admin_roles.sql**
- Crea 3 nuevos roles en la tabla `rol`
- Se ejecuta automáticamente al iniciar la app

---

## 📊 MATRIZ DE PERMISOS

| Acción | Jefe Inmediato | Op. Clínicas | RRHH | Admin |
|--------|:---------------:|:-------------:|:----:|:-----:|
| Crear Malla | ❌ | ✅ | ❌ | ✅ |
| Editar Malla | ❌ | ✅ | ❌ | ✅ |
| Revisar Malla | ✅ | ❌ | ✅ | ✅ |
| Aprobar Malla | ✅ | ❌ | ✅ | ✅ |
| **Publicar Malla** | ❌ | ✅* | ❌ | ✅ |
| Revisar Novedades | ✅ | ❌ | ✅ | ✅ |
| Aprobar Novedades | ✅ | ❌ | ✅ | ✅ |
| Crear Usuarios | ❌ | ❌ | ❌ | ✅ |

*\* Solo después de ambas aprobaciones (Jefe + RRHH)*

---

## ⚠️ CONSIDERACIONES IMPORTANTES

1. **Contraseñas encriptadas**: Asegúrate de usar contraseñas seguras
2. **Una malla NO puede publicarse sin ambas aprobaciones**
3. **Una novedad rechazada rechaza todo** (no puede aprobarse parcialmente)
4. **El flujo es secuencial**: No puedes saltarte pasos
5. **Validaciones de backend**: Se valida el rol en cada endpoint

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### "No veo el botón de crear administrador"
- Verifica que estés logueado como Administrador
- Revisa que `user.rol.rol` contenga "Admin"

### "El usuario no tiene el rol correcto"
- Ejecuta: `SELECT * FROM usuario WHERE correo = 'email@hospital.com';`
- Verifica que `id_rol` sea correcto (JEFE_INMEDIATO, OPERACIONES_CLINICAS, etc)

### "No puedo publicar la malla"
- Verifica que sea usuario de Operaciones Clínicas
- Comprueba que la malla tenga AMBAS aprobaciones
- En Panel de Detalles, debe decir: "Aprobada por Jefe Inmediato ✓" y "Aprobada por RRHH ✓"

### "La malla aparece rechazada"
- Si cualquier aprobador la rechaza, se rechaza completamente
- El usuario que la rechazó debe proporcionar motivo
- Operaciones Clínicas debe ajustarla y reenviar

---

## 📞 RESUMEN DE BOTONES POR ROL

### 👤 Usuario Estándar
- Inicio
- Mi Información
- Mis Turnos
- Gestión de Novedades (Vacaciones, Incapacidades)
- Aprobaciones de Vacaciones

### 📋 Jefe Inmediato
- Inicio
- Usuarios (Admin)
- Mis Turnos
- Gestión de Novedades
- Aprobaciones de Vacaciones
- **📋 Revisar Mallas** ← NUEVO

### 🏥 Operaciones Clínicas
- Inicio
- Usuarios (Admin)
- Mis Turnos
- Gestión de Novedades
- Aprobaciones de Vacaciones
- **🏥 Gestionar Mallas** ← NUEVO

### 💼 Recursos Humanos
- Inicio
- Usuarios (Admin)
- Mis Turnos
- Gestión de Novedades
- Aprobaciones de Vacaciones
- **💼 Revisar para Nómina** ← NUEVO

### 🔐 Administrador
- Inicio
- Usuarios (Gestión)
- Mis Turnos
- Gestión de Novedades
- Aprobaciones de Vacaciones
- 📋 Revisar Mallas
- 🏥 Gestionar Mallas
- 💼 Revisar para Nómina
- **🔐 Crear Administrador** ← NUEVO

---

## ✅ CHECKLIST DE VERIFICACIÓN

- [ ] Backend compilado sin errores
- [ ] Frontend sin errores de linting
- [ ] Migraciones SQL ejecutadas (V5)
- [ ] Usuarios de prueba creados
- [ ] Cada usuario logueado ve su menú correcto
- [ ] Jefe Inmediato puede revisar pero NO publicar
- [ ] Operaciones Clínicas NO puede ver Revisar Mallas
- [ ] RRHH puede revisar para nómina
- [ ] Administrador tiene todos los botones
- [ ] Creación de usuarios desde interfaz funciona
- [ ] Permisos se devuelven correctamente por API

---

**Fecha de implementación:** 11 de Diciembre de 2025
**Versión:** 1.0
**Estado:** ✅ Listo para pruebas
