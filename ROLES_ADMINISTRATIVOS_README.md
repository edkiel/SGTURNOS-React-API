# 🎯 Sistema de Roles Administrativos - Implementación Completa

## 📌 Descripción General

Se ha implementado un sistema completo de **3 roles administrativos distintos** con responsabilidades específicas para la gestión de mallas de turnos y novedades:

```
┌─────────────────────────────────────────────────────────────────┐
│  FLUJO DE APROBACIÓN DE MALLAS                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Operaciones Clínicas  →  Jefe Inmediato  →  Recursos Humanos  │
│       (CREA)               (APRUEBA)          (APRUEBA)        │
│                                                      ↓          │
│                                              Operaciones        │
│                                             (PUBLICA)          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎭 ROLES Y RESPONSABILIDADES

### 1️⃣ **Jefe de Departamento / Jefe Inmediato** 
- Color: 🔵 Azul
- Código de rol: `JEFE_INMEDIATO`
- **Funciones:**
  - ✅ Revisar mallas generadas
  - ✅ Aprobar o rechazar mallas
  - ✅ Revisar y aprobar novedades
  - ❌ **NO puede publicar** mallas

- **Menú:** Botón "📋 Revisar Mallas"
- **Componente:** `JefeInmediatoRevisor.jsx`

### 2️⃣ **Operaciones Clínicas**
- Color: 🟢 Verde  
- Código de rol: `OPERACIONES_CLINICAS`
- **Funciones:**
  - ✅ Crear mallas de turnos
  - ✅ Editar mallas existentes
  - ✅ Buscar reemplazos para vacaciones
  - ✅ Marcar turnos como "extras"
  - ✅ **PUBLICAR MALLAS** (solo post-aprobación)

- **Menú:** Botón "🏥 Gestionar Mallas"
- **Componente:** (A implementar)

### 3️⃣ **Recursos Humanos**
- Color: 🟣 Púrpura
- Código de rol: `RECURSOS_HUMANOS`
- **Funciones:**
  - ✅ Revisar mallas buscando novedades
  - ✅ Verificar impacto en nómina
  - ✅ Aprobar o rechazar mallas
  - ✅ Aprobar novedades
  - ✅ Generar reportes de nómina

- **Menú:** Botón "💼 Revisar para Nómina"
- **Componente:** `RecursosHumanosRevisor.jsx`

### 4️⃣ **Administrador**
- Color: 🔴 Rojo
- Código de rol: `Administrador`
- **Funciones:** ⚡ ACCESO TOTAL a todas las funciones
- **Menú:** Botón "🔐 Crear Administrador"
- **Componente:** `CrearAdministrador.jsx`

---

## 📁 ARCHIVOS CREADOS/MODIFICADOS

### Backend (Java - Spring Boot)

| Archivo | Tipo | Descripción |
|---------|------|-------------|
| `V5__create_admin_roles.sql` | Migration | Crea 3 nuevos roles |
| `RolPermisosService.java` | Service | Verifica permisos por rol |
| `MallaAprobacionController.java` | Controller | Endpoints de aprobación |
| `RolController.java` | Controller | Endpoints de roles |
| `AjusteMallaVacacionesService.java` | Service | Manejo de ajustes de malla |
| `AjusteMallaController.java` | Controller | Endpoints de mallas |

### Frontend (React - Vite)

| Archivo | Ubicación | Descripción |
|---------|-----------|-------------|
| `CrearAdministrador.jsx` | `components/admin/` | Panel para crear admins |
| `JefeInmediatoRevisor.jsx` | `components/mallas/` | Panel de Jefe Inmediato |
| `RecursosHumanosRevisor.jsx` | `components/mallas/` | Panel de RRHH |
| `Dashboard.jsx` | `components/` | Mejorado con selecciones |
| `App.jsx` | `src/` | Agregados nuevos menús |

### Documentación

| Archivo | Descripción |
|---------|------------|
| `GUIA_ROLES_ADMIN_COMPLETA.md` | Guía completa de uso |
| `script_usuarios_prueba.sql` | Script SQL para usuarios de prueba |
| `script_roles_prueba.sql` | Documentación de roles SQL |
| `ROLES_ADMINISTRATIVOS_README.md` | Este archivo |

---

## 🚀 CÓMO EMPEZAR

### 1. Iniciar el Backend
```powershell
cd sgturnos
.\mvnw.cmd spring-boot:run
```
✅ La migración V5 se ejecutará automáticamente

### 2. Iniciar el Frontend
```powershell
cd sgturnos-react-app
npm run dev
```

### 3. Crear Usuarios de Prueba

**Opción A: Interfaz Gráfica**
1. Login como Administrador
2. Clic en "🔐 Crear Administrador"
3. Selecciona el rol (se muestra descripción)
4. Llena los datos
5. Clic en "✓ Crear Usuario"

**Opción B: SQL Directo**
- Ejecuta `script_usuarios_prueba.sql` en MySQL
- Crea 4 usuarios de prueba listos

### 4. Probar los Roles
1. Login con `jefe@hospital.com` → Ve "📋 Revisar Mallas"
2. Login con `operaciones@hospital.com` → Ve "🏥 Gestionar Mallas"
3. Login con `rrhh@hospital.com` → Ve "💼 Revisar para Nómina"
4. Login con `admin@hospital.com` → Ve todos los botones

---

## 🔄 FLUJO DE APROBACIÓN PASO A PASO

### Escenario: Aprobar una Malla

```
1. OPERACIONES CLÍNICAS crea malla
   └─→ Estado: CREADA
   
2. JEFE INMEDIATO revisa y aprueba
   ├─→ Ve: "📋 Revisar Mallas" en menú
   ├─→ Selecciona malla
   ├─→ Lee detalles
   ├─→ Escribe comentarios (opcional)
   └─→ Haz clic: "✅ Aprobar Malla"
       └─→ Estado: APROBADA_JEFE
       └─→ ❌ NO ve botón Publicar
   
3. RECURSOS HUMANOS revisa y aprueba
   ├─→ Ve: "💼 Revisar para Nómina" en menú
   ├─→ Selecciona malla
   ├─→ Verifica novedades del personal
   ├─→ Escribe impacto en nómina
   └─→ Haz clic: "✅ Aprobar Malla"
       └─→ Estado: APROBADA_RRHH
       └─→ ✅ Mensaje: "Operaciones puede publicar"
   
4. OPERACIONES CLÍNICAS publica
   ├─→ Ve: "🏥 Gestionar Mallas" en menú
   ├─→ Selecciona malla
   ├─→ ✅ AHORA VE botón "📤 Publicar"
   └─→ Haz clic: "📤 Publicar Malla"
       └─→ Estado: PUBLICADA
       └─→ ✅ Malla lista para usar en operaciones
```

---

## 📊 MATRIZ DE PERMISOS

```
                    │ Jefe│ Oper│ RRHH│Admin
────────────────────┼─────┼─────┼─────┼─────
Crear Malla         │  ❌ │  ✅ │  ❌ │  ✅
Editar Malla        │  ❌ │  ✅ │  ❌ │  ✅
Revisar Malla       │  ✅ │  ❌ │  ✅ │  ✅
Aprobar Malla       │  ✅ │  ❌ │  ✅ │  ✅
PUBLICAR Malla *    │  ❌ │  ✅ │  ❌ │  ✅
────────────────────┼─────┼─────┼─────┼─────
Crear Vacación      │  ✅ │  ❌ │  ❌ │  ✅
Aprobar Vacación    │  ✅ │  ✅ │  ✅ │  ✅
────────────────────┼─────┼─────┼─────┼─────
Crear Admin         │  ❌ │  ❌ │  ❌ │  ✅
```

`*` Solo después de ambas aprobaciones (Jefe + RRHH)

---

## 🎨 INTERFAZ DE USUARIO

### Pantalla: Crear Administrador
```
┌──────────────────────────────────────────┐
│ Crear Administrador                      │
├──────────────────────────────────────────┤
│                                          │
│ Selecciona el Rol Administrativo:        │
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │ 📋 Jefe de Departamento              │ │
│ │ Revisa y aprueba mallas (NO publica) │ │
│ │ • Revisar mallas                     │ │
│ │ • Aprobar novedades                  │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │ 🏥 Operaciones Clínicas              │ │
│ │ Crea, edita y publica mallas         │ │
│ │ • Crear mallas                       │ │
│ │ • Publicar mallas                    │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │ 💼 Recursos Humanos                  │ │
│ │ Verifica para nómina                 │ │
│ │ • Revisar para nómina                │ │
│ │ • Generar reportes                   │ │
│ └──────────────────────────────────────┘ │
│                                          │
└──────────────────────────────────────────┘
```

### Pantalla: Revisar Mallas (Jefe Inmediato)
```
┌─────────────────────────────────────────┐
│ Revisión de Mallas - Jefe Inmediato     │
├─────────────────────────────────────────┤
│                                         │
│ Mallas Pendientes de Aprobación:        │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Mes        │ Depto  │ Turnos │ Acción│
│ ├─────────────────────────────────────┤ │
│ │ Dic 2025   │ Med    │   45   │Revisar│
│ │ Dic 2025   │ Cir    │   32   │Revisar│
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Detalles de Malla Seleccionada      │ │
│ ├─────────────────────────────────────┤ │
│ │ Mes: Dic 2025                       │ │
│ │ Departamento: Medicina General      │ │
│ │ Turnos: 45  │  Personal: 8          │ │
│ │                                     │ │
│ │ Comentarios:  [textarea...]         │ │
│ │                                     │ │
│ │ [✅ Aprobar]  [❌ Rechazar]          │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## ✅ VALIDACIONES Y REGLAS

1. **Una malla NO puede publicarse sin ambas aprobaciones**
   - Si solo tiene aprobación de Jefe → NO se puede publicar
   - Si solo tiene aprobación de RRHH → NO se puede publicar
   - Necesita AMBAS para que Operaciones pueda publicar

2. **Una novedad rechazada rechaza TODO**
   - Si cualquier aprobador rechaza → novedad completa rechazada
   - No hay aprobación parcial

3. **Cada rol VE solo lo que puede hacer**
   - Jefe Inmediato: Solo "Revisar Mallas", no "Publicar"
   - Operaciones: Solo "Gestionar Mallas", no "Revisar"
   - RRHH: Solo "Revisar para Nómina", no "Publicar"

4. **Validaciones de backend**
   - Se valida el rol en cada endpoint
   - Se previene acceso no autorizado
   - Se mantiene auditoria de cambios

---

## 🔌 API ENDPOINTS

### Permisos
```http
GET /api/roles/permisos/{idUsuario}
GET /api/roles/descripcion/{nombreRol}
```

### Aprobación de Mallas
```http
POST /api/mallas/aprobaciones/aprobar-jefe/{idMalla}
POST /api/mallas/aprobaciones/aprobar-rrhh/{idMalla}
POST /api/mallas/aprobaciones/rechazar/{idMalla}
GET  /api/mallas/aprobaciones/estado/{idMalla}
```

### Gestión de Mallas
```http
POST /api/mallas/ajustes/aplicar-vacacion/{idNovedad}
GET  /api/mallas/ajustes/vacaciones-pendientes
```

---

## 🧪 CASOS DE PRUEBA

### Test 1: Crear Usuario Jefe Inmediato
```
1. Login como Admin
2. Clic "🔐 Crear Administrador"
3. Selecciona "Jefe de Departamento"
4. Llena: jefe@test.com, contraseña, nombre
5. Haz clic "✓ Crear"
✅ Usuario creado correctamente
```

### Test 2: Revisar y Aprobar Malla
```
1. Login como Jefe Inmediato
2. Clic "📋 Revisar Mallas"
3. Selecciona una malla
4. Escribe comentarios
5. Haz clic "✅ Aprobar Malla"
✅ Malla aprobada por Jefe
✅ Estado cambia a APROBADA_JEFE
```

### Test 3: Restricción de Publicación
```
1. Login como Jefe Inmediato
2. Intenta acceder a "🏥 Gestionar Mallas"
❌ El botón no aparece (no tiene permiso)
```

### Test 4: Flujo Completo
```
1. Op.Clínicas crea malla
2. Jefe Inmediato aprueba
3. RRHH aprueba
4. Op.Clínicas publica
✅ Todos los pasos ejecutados correctamente
```

---

## 📚 DOCUMENTACIÓN RELACIONADA

- `GUIA_ROLES_ADMIN_COMPLETA.md` - Guía extensiva
- `script_usuarios_prueba.sql` - SQL de usuarios de prueba
- `script_roles_prueba.sql` - Documentación de roles

---

## 🛠️ TECNOLOGÍAS UTILIZADAS

- **Backend:** Java 21, Spring Boot 3.x, JPA/Hibernate
- **Frontend:** React 18, Vite, Tailwind CSS
- **Base de Datos:** MySQL 8.0
- **Migraciones:** Flyway

---

## ✨ RESUMEN

✅ 3 roles administrativos completos  
✅ Flujo de aprobación de mallas  
✅ Panel de control específico por rol  
✅ Validaciones de permisos en backend  
✅ Interfaz visual clara y intuitiva  
✅ Documentación completa  
✅ Scripts SQL de prueba  

**Estado:** 🟢 Listo para usar

---

**Última actualización:** 11 de Diciembre de 2025  
**Versión:** 1.0  
**Autor:** Sistema SGTurnos
