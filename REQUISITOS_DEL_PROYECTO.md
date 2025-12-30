# 📋 REQUISITOS DEL PROYECTO SGTURNOS

**Proyecto:** Sistema de Gestión de Turnos y Novedades de Personal  
**Empresa:** Paliacare (Área Asistencial)  
**Versión:** 1.0  
**Fecha:** Diciembre 2025

---

## 📑 TABLA DE CONTENIDOS

1. [Requisitos Funcionales](#requisitos-funcionales)
2. [Historias de Usuario](#historias-de-usuario)
3. [Requisitos No Funcionales](#requisitos-no-funcionales)

---

## 🎯 REQUISITOS FUNCIONALES

### RF-1: AUTENTICACIÓN Y AUTORIZACIÓN

#### RF-1.1: Autenticación por Email y Contraseña
**Descripción:** El sistema debe permitir que los usuarios se autentiquen usando sus credenciales (email y contraseña).

**Criterios de Aceptación:**
- ✅ La pantalla de login debe validar email y contraseña
- ✅ El sistema debe responder con un token JWT válido al autenticar correctamente
- ✅ El sistema debe rechazar credenciales inválidas con mensaje de error
- ✅ El token debe almacenarse en localStorage del navegador
- ✅ El sistema debe redireccionar al dashboard después de autenticación exitosa

**Endpoints:**
- `POST /api/auth/login` - Autenticar usuario

---

#### RF-1.2: Gestión de Roles y Permisos
**Descripción:** El sistema debe soportar múltiples roles con diferentes permisos de acceso.

**Criterios de Aceptación:**
- ✅ El sistema debe soportar los siguientes roles:
  - **Auxiliar de Enfermería** (asistencial)
  - **Enfermero** (asistencial)
  - **Terapeuta** (asistencial)
  - **Médico** (asistencial)
  - **Jefe Inmediato** (administrativo)
  - **Operaciones Clínicas** (administrativo)
  - **Recursos Humanos** (administrativo)
  - **Administrador** (acceso completo)
- ✅ Cada rol debe tener permisos específicos asignados
- ✅ El sistema debe validar permisos en cada solicitud al backend
- ✅ El frontend debe mostrar/ocultar opciones según los permisos del usuario

**Endpoints:**
- `GET /api/roles/permisos/{idUsuario}` - Obtener permisos del usuario
- `GET /api/roles/descripcion/{nombreRol}` - Obtener descripción del rol

---

#### RF-1.3: Sesión de Usuario
**Descripción:** El sistema debe mantener la sesión del usuario autenticado durante su navegación.

**Criterios de Aceptación:**
- ✅ El token JWT debe validarse en cada solicitud al backend
- ✅ El sistema debe renovar el token si es necesario
- ✅ El sistema debe cerrar sesión y limpiar token al hacer logout
- ✅ El sistema debe redirigir al login si la sesión expira

---

### RF-2: GESTIÓN DE USUARIOS

#### RF-2.1: Crear Nuevo Usuario
**Descripción:** Los administradores deben poder crear nuevos usuarios en el sistema.

**Criterios de Aceptación:**
- ✅ El formulario debe solicitar: nombre(s), apellido(s), email, teléfono, rol
- ✅ El sistema debe validar que el email no esté duplicado
- ✅ El sistema debe validar que el email tenga formato válido
- ✅ El sistema debe crear la contraseña temporal y mostrarla al administrador
- ✅ El usuario debe cambiar la contraseña en su primer login
- ✅ El sistema debe crear un registro de auditoría

**Endpoints:**
- `POST /api/usuarios` - Crear nuevo usuario

---

#### RF-2.2: Consultar Listado de Usuarios
**Descripción:** Los administradores deben poder consultar todos los usuarios del sistema.

**Criterios de Aceptación:**
- ✅ El sistema debe mostrar tabla con datos: nombre, email, rol, estado, fecha creación
- ✅ El sistema debe permitir buscar usuarios por nombre o email
- ✅ El sistema debe permitir filtrar por rol
- ✅ El sistema debe permitir paginar los resultados (10, 25, 50 por página)
- ✅ El sistema debe permitir ordenar por columnas

**Endpoints:**
- `GET /api/usuarios` - Listar usuarios (con paginación y filtros)
- `GET /api/usuarios?search=texto&rol=AUXILIAR` - Búsqueda y filtrado

---

#### RF-2.3: Actualizar Información de Usuario
**Descripción:** Los administradores pueden actualizar datos de usuarios; los usuarios pueden actualizar sus propios datos.

**Criterios de Aceptación:**
- ✅ Se puede actualizar: nombre, apellido, teléfono, email, rol
- ✅ Validar cambios de email (no duplicados)
- ✅ Solo administrador puede cambiar el rol de un usuario
- ✅ Usuario puede cambiar su propia contraseña
- ✅ Se debe crear registro de auditoría de cambios

**Endpoints:**
- `PUT /api/usuarios/{id}` - Actualizar usuario
- `PUT /api/usuarios/{id}/cambiar-password` - Cambiar contraseña

---

#### RF-2.4: Eliminar Usuario
**Descripción:** Los administradores pueden eliminar usuarios del sistema (eliminación lógica).

**Criterios de Aceptación:**
- ✅ El sistema debe marcar el usuario como inactivo (no eliminar físicamente)
- ✅ El usuario inactivo no puede iniciar sesión
- ✅ Se mantienen registros históricos para auditoría
- ✅ Se debe solicitar confirmación antes de eliminar
- ✅ Se crea registro de auditoría

**Endpoints:**
- `DELETE /api/usuarios/{id}` - Eliminar usuario (lógica)

---

#### RF-2.5: Consultar Perfil Personal
**Descripción:** Todo usuario autenticado puede consultar y editar su perfil.

**Criterios de Aceptación:**
- ✅ El usuario puede ver sus datos personales: nombre, email, teléfono, rol, departamento
- ✅ El usuario puede editar su nombre, teléfono y email (si no está duplicado)
- ✅ El usuario puede cambiar su contraseña
- ✅ El sistema valida que la contraseña actual sea correcta antes de permitir cambio
- ✅ Se muestra mensaje de confirmación después de cambios

**Endpoints:**
- `GET /api/usuarios/perfil` - Obtener perfil del usuario actual
- `PUT /api/usuarios/perfil` - Actualizar perfil del usuario

---

### RF-3: GESTIÓN DE MALLAS DE TURNOS

#### RF-3.1: Crear Nueva Malla
**Descripción:** El rol de Operaciones Clínicas puede crear nuevas mallas de turnos.

**Criterios de Aceptación:**
- ✅ El formulario debe solicitar: período (mes/año), descripción, personal disponible
- ✅ El sistema debe validar que no exista malla duplicada para el período
- ✅ El sistema puede generar malla automáticamente o cargar desde archivo
- ✅ El sistema debe asignar turnos según disponibilidad de personal
- ✅ La malla se crea en estado "BORRADOR"
- ✅ Se envía a revisión del Jefe Inmediato automáticamente

**Endpoints:**
- `POST /api/mallas` - Crear malla
- `POST /api/mallas/generar-automatica` - Generar malla automáticamente

---

#### RF-3.2: Consultar Mallas
**Descripción:** Los usuarios pueden consultar las mallas de turnos según su rol.

**Criterios de Aceptación:**
- ✅ Usuarios asistenciales ven solo mallas publicadas
- ✅ Usuarios asistenciales ven solo sus turnos asignados
- ✅ Administradores pueden ver todas las mallas en cualquier estado
- ✅ Se puede filtrar por período (mes/año)
- ✅ Se puede filtrar por estado (BORRADOR, REVISIÓN, APROBADA, PUBLICADA, ARCHIVADA)
- ✅ La malla muestra: período, estado, personal asignado, turnos

**Endpoints:**
- `GET /api/mallas` - Listar mallas
- `GET /api/mallas/{id}` - Obtener detalle de malla
- `GET /api/mallas/mis-mallas` - Obtener mallas del usuario actual

---

#### RF-3.3: Actualizar Malla
**Descripción:** Se pueden realizar ajustes a las mallas en estado BORRADOR.

**Criterios de Aceptación:**
- ✅ Solo se pueden editar mallas en estado BORRADOR o REVISIÓN
- ✅ Se pueden cambiar asignaciones de turnos
- ✅ Se pueden agregar o remover personal
- ✅ Cada cambio genera una versión nueva de la malla
- ✅ Se crea registro de auditoría con cambios realizados
- ✅ Al actualizar se notifica a Jefe Inmediato

**Endpoints:**
- `PUT /api/mallas/{id}` - Actualizar malla
- `POST /api/mallas/{id}/ajuste` - Crear ajuste a malla

---

#### RF-3.4: Exportar Malla
**Descripción:** Las mallas pueden exportarse a Excel o PDF para distribución.

**Criterios de Aceptación:**
- ✅ Se puede exportar en formato Excel (.xlsx)
- ✅ Se puede exportar en formato PDF
- ✅ El documento debe incluir: período, personal, turnos asignados, fechas
- ✅ El documento debe ser legible e imprimible
- ✅ El documento debe incluir marca de agua indicando estado (BORRADOR, PUBLICADA, etc.)

**Endpoints:**
- `POST /api/mallas/{id}/exportar-excel` - Exportar a Excel
- `POST /api/mallas/{id}/exportar-pdf` - Exportar a PDF

---

#### RF-3.5: Aprobar Malla (Jefe Inmediato)
**Descripción:** El Jefe Inmediato revisa y aprueba las mallas.

**Criterios de Aceptación:**
- ✅ El Jefe ve lista de mallas en estado REVISIÓN
- ✅ El Jefe puede ver detalles: asignaciones, cambios realizados
- ✅ El Jefe puede aprobar (marca como APROBADA)
- ✅ El Jefe puede rechazar con motivo
- ✅ Al rechazar, regresa a Operaciones Clínicas
- ✅ Se notifica a Operaciones Clínicas del resultado

**Endpoints:**
- `GET /api/mallas/pendientes-jefe` - Mallas pendientes aprobación Jefe
- `POST /api/mallas/{id}/aprobar-jefe` - Aprobar como Jefe
- `POST /api/mallas/{id}/rechazar-jefe` - Rechazar como Jefe

---

#### RF-3.6: Aprobar Malla (Recursos Humanos)
**Descripción:** Recursos Humanos valida las mallas antes de publicación.

**Criterios de Aceptación:**
- ✅ RRHH ve mallas aprobadas por Jefe Inmediato
- ✅ RRHH puede ver novedades de personal en el período
- ✅ RRHH puede aprobar o rechazar la malla
- ✅ Al rechazar, regresa a Operaciones Clínicas
- ✅ Si aprueba, la malla pasa a estado APROBADA-RRHH

**Endpoints:**
- `GET /api/mallas/pendientes-rrhh` - Mallas pendientes aprobación RRHH
- `POST /api/mallas/{id}/aprobar-rrhh` - Aprobar como RRHH
- `POST /api/mallas/{id}/rechazar-rrhh` - Rechazar como RRHH

---

#### RF-3.7: Publicar Malla
**Descripción:** Operaciones Clínicas publica la malla para que los usuarios la vean.

**Criterios de Aceptación:**
- ✅ Solo se pueden publicar mallas aprobadas por Jefe y RRHH
- ✅ Al publicar, se notifica a todos los usuarios asistenciales
- ✅ La malla se vuelve visible para los usuarios en su rol
- ✅ Los turnos publicados no pueden modificarse (se crean historiales)
- ✅ Se crea registro de auditoría con fecha/hora publicación

**Endpoints:**
- `POST /api/mallas/{id}/publicar` - Publicar malla

---

### RF-4: GESTIÓN DE NOVEDADES

#### RF-4.1: Registrar Novedad
**Descripción:** Los usuarios asistenciales pueden registrar novedades (vacaciones, incapacidades, permisos, cambios de turno, calamidad, otros).

**Criterios de Aceptación:**
- ✅ El usuario selecciona el tipo de novedad:
  - Vacaciones (fecha inicio/fin)
  - Incapacidades (fecha inicio/fin, tipo)
  - Permisos (fecha inicio/fin, tipo permiso)
  - Cambios de Turno (turno actual, turno solicitado, compañero)
  - Calamidad (tipo, descripción, fecha)
  - Otros (descripción libre)
- ✅ El sistema valida fechas (no pasadas, no conflictivas)
- ✅ Para novedades con fecha, se requiere adjuntar documentación soporte
- ✅ La novedad se crea en estado PENDIENTE
- ✅ Se notifica a Jefe Inmediato de la novedad registrada

**Endpoints:**
- `POST /api/novedades` - Crear novedad
- `POST /api/novedades/{id}/adjuntar-documento` - Adjuntar documento soporte

---

#### RF-4.2: Consultar Novedades Personales
**Descripción:** El usuario puede ver todas sus novedades registradas.

**Criterios de Aceptación:**
- ✅ El usuario ve lista de sus novedades con: tipo, período, estado, fecha creación
- ✅ El usuario puede filtrar por estado (PENDIENTE, APROBADA, RECHAZADA)
- ✅ El usuario puede filtrar por tipo de novedad
- ✅ El usuario puede ver detalles de cada novedad
- ✅ El usuario puede ver motivo si fue rechazada
- ✅ El usuario puede cancelar novedades en estado PENDIENTE (si no han sido revisadas)

**Endpoints:**
- `GET /api/novedades/mis-novedades` - Obtener novedades del usuario
- `GET /api/novedades/{id}` - Obtener detalle de novedad
- `DELETE /api/novedades/{id}` - Cancelar novedad (solo si PENDIENTE)

---

#### RF-4.3: Sistema de Aprobación Triple (Jefe → Operaciones → RRHH)
**Descripción:** Las novedades con fecha deben ser aprobadas por tres niveles: Jefe Inmediato, Operaciones Clínicas y Recursos Humanos.

**Criterios de Aceptación:**

**Nivel 1 - Jefe Inmediato:**
- ✅ El Jefe ve novedades pendientes de aprobación
- ✅ El Jefe puede ver detalles: empleado, rol, período, descripción, días
- ✅ El Jefe puede aprobar o rechazar (requiere motivo)
- ✅ Si aprueba, pasa a Operaciones Clínicas
- ✅ Si rechaza, se notifica al empleado con motivo

**Nivel 2 - Operaciones Clínicas:**
- ✅ Operaciones ve novedades aprobadas por Jefe
- ✅ Operaciones evalúa cómo cubrir el espacio en la malla
- ✅ Al aprobar, se genera automáticamente una alerta para recalcular la malla
- ✅ Operaciones puede rechazar si no hay cobertura
- ✅ Si aprueba, pasa a Recursos Humanos

**Nivel 3 - Recursos Humanos:**
- ✅ RRHH ve novedades aprobadas por Jefe y Operaciones
- ✅ RRHH verifica y registra para control de nómina
- ✅ RRHH puede aprobar (finalizando el proceso)
- ✅ RRHH puede rechazar por temas administrativos
- ✅ Si aprueba, estado pasa a APROBADA

**Criterios de Aceptación Generales:**
- ✅ En cada nivel se registra: usuario que aprueba, fecha/hora, comentarios
- ✅ El flujo es secuencial: no se puede pasar un nivel si no fue aprobado
- ✅ El empleado recibe notificaciones en cada cambio de estado
- ✅ Se crea historial completo de aprobaciones

**Endpoints:**
- `GET /api/novedades/pendientes-jefe` - Novedades para Jefe
- `POST /api/novedades/{id}/aprobar-jefe` - Aprobar como Jefe
- `POST /api/novedades/{id}/rechazar-jefe` - Rechazar como Jefe
- `GET /api/novedades/pendientes-operaciones` - Novedades para Operaciones
- `POST /api/novedades/{id}/aprobar-operaciones` - Aprobar como Operaciones
- `POST /api/novedades/{id}/rechazar-operaciones` - Rechazar como Operaciones
- `GET /api/novedades/pendientes-rrhh` - Novedades para RRHH
- `POST /api/novedades/{id}/aprobar-rrhh` - Aprobar como RRHH
- `POST /api/novedades/{id}/rechazar-rrhh` - Rechazar como RRHH

---

#### RF-4.4: Tipos de Novedades Específicos

**RF-4.4.1: Vacaciones**
- Requiere: fecha inicio, fecha fin, total días
- Documentación: comprobante vacaciones
- Cobertura: Operaciones asigna reemplazo

**RF-4.4.2: Incapacidades**
- Requiere: fecha inicio, fecha fin, tipo (enfermedad, accidente, maternidad)
- Documentación: certificado médico
- Cobertura: Operaciones busca reemplazo o ajusta malla

**RF-4.4.3: Permisos**
- Requiere: fecha inicio, fecha fin, tipo (personal, médico, otro)
- Documentación: justificación
- Cobertura: Operaciones coordina cobertura

**RF-4.4.4: Cambios de Turno**
- Requiere: turno actual, turno solicitado, compañero que cubre
- No requiere documentación (acuerdo entre compañeros)
- Solo requiere aprobación de Jefe
- Si se aprueba, se intercambian turnos en la malla

**RF-4.4.5: Calamidad**
- Requiere: tipo (muerte, accidente, desastre, otro), descripción
- Documentación: comprobante de calamidad
- Aprobación: todos los niveles revisan
- Cobertura: Operaciones ajusta malla según severidad

**RF-4.4.6: Otros**
- Libre descripción
- Documentación: según necesidad
- Aprobación: Jefe y RRHH (Operaciones puede omitirse)

---

### RF-5: ALERTAS DE MALLAS

#### RF-5.1: Generar Alertas de Malla
**Descripción:** El sistema genera automáticamente alertas cuando se requiere recalcular una malla.

**Criterios de Aceptación:**
- ✅ Se genera alerta cuando:
  - Una novedad es aprobada por Operaciones Clínicas
  - Se realiza un ajuste a una malla publicada
  - Se rechaza un cambio de turno
- ✅ La alerta incluye: motivo, malla afectada, usuario que debe revisar
- ✅ Se notifica a Operaciones Clínicas de la alerta

**Endpoints:**
- `POST /api/alertas-malla` - Crear alerta
- `POST /api/alertas-malla/{id}/resolver` - Resolver alerta

---

#### RF-5.2: Consultar Alertas
**Descripción:** Los usuarios pueden consultar las alertas de malla.

**Criterios de Aceptación:**
- ✅ Operaciones Clínicas ve todas las alertas pendientes
- ✅ Se puede filtrar por malla, fecha, estado
- ✅ Se puede ver detalle: motivo, cambios necesarios
- ✅ Se puede marcar como resuelta

**Endpoints:**
- `GET /api/alertas-malla` - Listar alertas
- `GET /api/alertas-malla?estado=PENDIENTE` - Alertas pendientes

---

### RF-6: NOTIFICACIONES Y ALERTAS

#### RF-6.1: Notificaciones de Novedades
**Descripción:** El sistema notifica a usuarios sobre cambios en sus novedades.

**Criterios de Aceptación:**
- ✅ Se notifica cuando:
  - Novedad es aprobada en cada nivel
  - Novedad es rechazada
  - Falta documentación
- ✅ Las notificaciones incluyen: tipo novedad, estado, motivo si aplica
- ✅ El usuario puede ver notificaciones en el dashboard
- ✅ Se guardan notificaciones para historial

**Endpoints:**
- `GET /api/notificaciones` - Obtener notificaciones del usuario

---

#### RF-6.2: Notificaciones de Mallas
**Descripción:** El sistema notifica sobre cambios en mallas.

**Criterios de Aceptación:**
- ✅ Se notifica cuando:
  - Malla es publicada
  - Hay alerta de cambios en tu turno
  - Malla que afecta tus novedades es modificada
- ✅ Las notificaciones incluyen: período, cambios, acción requerida
- ✅ Se puede marcar notificación como leída

---

### RF-7: REPORTES E INDICADORES

#### RF-7.1: Reportes de Novedades
**Descripción:** Se pueden generar reportes de novedades para análisis.

**Criterios de Aceptación:**
- ✅ Reporte por período: total novedades, aprobadas, rechazadas
- ✅ Reporte por tipo: desglose de vacaciones, incapacidades, permisos, etc.
- ✅ Reporte por persona: novedades por usuario
- ✅ Se puede filtrar por rol, período, estado
- ✅ Se puede exportar a Excel y PDF

**Endpoints:**
- `GET /api/reportes/novedades` - Generar reporte de novedades
- `POST /api/reportes/novedades/exportar` - Exportar reporte

---

#### RF-7.2: Indicadores de Cobertura
**Descripción:** El sistema muestra indicadores de cobertura de turnos.

**Criterios de Aceptación:**
- ✅ Porcentaje de cobertura por rol
- ✅ Cantidad de novedades aprobadas vs rechazadas
- ✅ Tendencia de novedades por tipo
- ✅ Personal con más ausencias
- ✅ Tiempo promedio de aprobación por nivel

---

#### RF-7.3: Dashboard Operativo
**Descripción:** Dashboard que muestra información relevante según el rol.

**Criterios de Aceptación:**
- ✅ **Usuarios Asistenciales:**
  - Próximos turnos asignados
  - Mis novedades pendientes
  - Estado de aprobación de novedades
  - Alertas de cambios en malla
  
- ✅ **Jefe Inmediato:**
  - Novedades pendientes de aprobación
  - Equipo a su cargo
  - KPI: cobertura, ausencias
  
- ✅ **Operaciones Clínicas:**
  - Mallas en revisión
  - Novedades pendientes
  - Alertas de malla
  - Proyección de cobertura
  
- ✅ **Recursos Humanos:**
  - Novedades pendientes aprobación
  - Mallas aprobadas (para registros de nómina)
  - Historial de aprobaciones
  
- ✅ **Administrador:**
  - Vista completa de todas las operaciones
  - Usuarios activos/inactivos
  - Resumen de todas las áreas

---

## 👤 HISTORIAS DE USUARIO

### Historia de Usuario #1: Login y Autenticación
```
Como:     usuario del sistema
Quiero:   autenticarme con mis credenciales
Para:     acceder a mis funciones personalizadas

Criterios de Aceptación:
- ✅ Puedo ingresar email y contraseña
- ✅ El sistema valida mis credenciales
- ✅ Recibo token JWT al autenticar
- ✅ El token se guarda en localStorage
- ✅ Soy redirigido a mi dashboard
- ✅ Veo mensaje de error si las credenciales son incorrectas
```

---

### Historia de Usuario #2: Consultar Mis Turnos
```
Como:     usuario asistencial (Auxiliar, Enfermero, Terapeuta, Médico)
Quiero:   ver mis turnos asignados en las mallas publicadas
Para:     saber cuándo debo trabajar

Criterios de Aceptación:
- ✅ Veo una lista de mallas publicadas
- ✅ Cada malla muestra el período (mes/año)
- ✅ Puedo ver detalle de cada malla con mis turnos
- ✅ Los turnos muestran fecha, hora inicio, hora fin
- ✅ Puedo filtrar por mes
- ✅ Puedo exportar mis turnos a PDF
- ✅ Veo alertas si hay cambios en mis turnos asignados
```

---

### Historia de Usuario #3: Registrar Vacaciones
```
Como:     usuario asistencial
Quiero:   registrar vacaciones en el sistema
Para:     que mi jefe y recursos humanos lo aprueben

Criterios de Aceptación:
- ✅ Acceso a "Registrar Novedad" → "Vacaciones"
- ✅ Selecciono fecha inicio y fecha fin
- ✅ El sistema calcula automáticamente los días
- ✅ Puedo adjuntar comprobante de vacaciones
- ✅ Se valida que no sean fechas pasadas
- ✅ Se valida que no supere días disponibles
- ✅ Al confirmar, se envía a aprobación de Jefe Inmediato
- ✅ Recibo confirmación de registro
- ✅ Puedo ver estado de la solicitud en "Mis Novedades"
```

---

### Historia de Usuario #4: Registrar Incapacidad
```
Como:     usuario asistencial
Quiero:   registrar una incapacidad cuando no puedo trabajar por salud
Para:     que se cubra mi puesto y se registre para nómina

Criterios de Aceptación:
- ✅ Acceso a "Registrar Novedad" → "Incapacidades"
- ✅ Selecciono tipo de incapacidad (enfermedad, accidente, maternidad)
- ✅ Ingreso fecha inicio y fecha fin
- ✅ Puedo adjuntar certificado médico (archivo PDF/imagen)
- ✅ El sistema valida que la fecha inicio no sea futura
- ✅ Al registrar, se notifica a Jefe Inmediato
- ✅ Operaciones Clínicas busca reemplazo automáticamente
- ✅ Puedo ver historial de mis incapacidades
```

---

### Historia de Usuario #5: Registrar Permiso
```
Como:     usuario asistencial
Quiero:   solicitar un permiso por asuntos personales o médicos
Para:     que sea aprobado y autorizado

Criterios de Aceptación:
- ✅ Acceso a "Registrar Novedad" → "Permisos"
- ✅ Selecciono tipo (personal, médico, otro)
- ✅ Ingreso fecha inicio y fecha fin
- ✅ Puedo agregar descripción del motivo
- ✅ Adjunto justificación (si corresponde)
- ✅ El sistema calcula días solicitados
- ✅ Al confirmar, inicia aprobación por Jefe
- ✅ Recibo notificación cuando es aprobado/rechazado
```

---

### Historia de Usuario #6: Solicitar Cambio de Turno
```
Como:     usuario asistencial
Quiero:   solicitar cambio de turno con un compañero
Para:     ajustar mi disponibilidad

Criterios de Aceptación:
- ✅ Acceso a "Registrar Novedad" → "Cambios de Turno"
- ✅ Veo mi turno actual asignado
- ✅ Selecciono el turno que deseo
- ✅ Busco el compañero que cubriría mi turno
- ✅ Puedo agregar nota explicativa
- ✅ No requiere documentación (es acuerdo entre compañeros)
- ✅ Al confirmar, solo va a aprobación de Jefe Inmediato
- ✅ Si se aprueba, los turnos se intercambian en la malla
- ✅ Si se rechaza, recibo motivo
```

---

### Historia de Usuario #7: Reportar Calamidad
```
Como:     usuario asistencial
Quiero:   reportar una situación de calamidad (muerte, accidente, desastre)
Para:     que sea autorizada mi ausencia y se registre

Criterios de Aceptación:
- ✅ Acceso a "Registrar Novedad" → "Calamidad"
- ✅ Selecciono tipo de calamidad
- ✅ Completo descripción detallada
- ✅ Ingreso fecha del evento
- ✅ Adjunto documentación comprobante
- ✅ El sistema muestra advertencia sobre documentación requerida
- ✅ Al confirmar, se envía a los tres niveles de aprobación
- ✅ Operaciones toma decisión sobre cobertura inmediata
- ✅ Recibo notificaciones de cada aprobación
```

---

### Historia de Usuario #8: Ver Estado de Mis Novedades
```
Como:     usuario asistencial
Quiero:   ver el estado de todas mis novedades registradas
Para:     conocer si fueron aprobadas o rechazadas

Criterios de Aceptación:
- ✅ Acceso a sección "Mis Novedades"
- ✅ Veo lista con todas mis novedades: tipo, período, estado
- ✅ Puedo filtrar por tipo de novedad
- ✅ Puedo filtrar por estado (PENDIENTE, APROBADA, RECHAZADA)
- ✅ Al hacer clic, veo detalles:
  - Fecha creación y cambios de estado
  - Comentarios de cada nivel de aprobación
  - Si fue rechazada, motivo detallado
- ✅ Puedo ver documentación adjunta
- ✅ Si está PENDIENTE y aún no la revisa nadie, puedo cancelarla
```

---

### Historia de Usuario #9: Aprobar Novedad como Jefe Inmediato
```
Como:     usuario con rol Jefe Inmediato
Quiero:   revisar y aprobar novedades de mi equipo
Para:     autorizar vacaciones, incapacidades, permisos, etc.

Criterios de Aceptación:
- ✅ Acceso a "Gestión de Novedades" → "Revisión por Jefe Inmediato"
- ✅ Veo lista de novedades pendientes de mi aprobación
- ✅ Por cada novedad veo: empleado, rol, tipo, período, descripción
- ✅ Puedo hacer clic para ver detalles completos
- ✅ Puedo aprobar (botón verde) o rechazar (botón rojo)
- ✅ Si rechazo, debo proporcionar motivo obligatorio
- ✅ Al aprobar, la novedad pasa a Operaciones Clínicas
- ✅ Al rechazar, el empleado recibe notificación con motivo
- ✅ Se crea historial de mi aprobación (fecha, hora, usuario)
```

---

### Historia de Usuario #10: Aprobar Novedad como Operaciones Clínicas
```
Como:     usuario con rol Operaciones Clínicas
Quiero:   revisar novedades ya aprobadas por Jefe y evaluar cobertura
Para:     decidir cómo cubrir el espacio en la malla

Criterios de Aceptación:
- ✅ Acceso a "Gestión de Novedades" → "Revisión por Operaciones"
- ✅ Veo novedades aprobadas por Jefe (badge verde)
- ✅ Para cada novedad veo:
  - Badge "✓ Aprobado por Jefe"
  - Información del empleado y período
  - Malla actual y disponibilidad de personal
- ✅ Se muestra info: "Al aprobar, se generará automáticamente una alerta para recalcular la malla"
- ✅ Puedo aprobar con botón "Aprobar y Generar Alerta"
- ✅ Al aprobar, automáticamente se genera alerta de malla
- ✅ Puedo rechazar si no hay cobertura disponible
- ✅ Se crea historial de mi decisión
```

---

### Historia de Usuario #11: Aprobar Novedad como Recursos Humanos
```
Como:     usuario con rol Recursos Humanos
Quiero:   revisar novedades aprobadas por Jefe y Operaciones
Para:     registrar en control de nómina y finalizar el proceso

Criterios de Aceptación:
- ✅ Acceso a "Gestión de Novedades" → "Revisión por RRHH"
- ✅ Veo novedades aprobadas por Jefe y Operaciones
- ✅ Veo badges: "✓ Jefe" y "✓ Operaciones"
- ✅ Se muestra info: "Esta es la aprobación final. Control de nómina tendrá la información"
- ✅ Puedo ver:
  - Período de ausencia
  - Impacto en nómina (si aplica)
  - Documento de soporte
- ✅ Puedo aprobar (finalizando proceso) o rechazar
- ✅ Si apruebo, estado pasa a "APROBADA"
- ✅ Si rechazo, vuelve a Operaciones con motivo
- ✅ Se crea historial
```

---

### Historia de Usuario #12: Crear Nueva Malla
```
Como:     usuario con rol Operaciones Clínicas
Quiero:   crear una nueva malla de turnos para un período
Para:     asignar turnos al personal y enviarla a aprobación

Criterios de Aceptación:
- ✅ Acceso a "Gestión de Mallas" → "Crear Malla"
- ✅ Ingreso datos: período (mes/año), descripción
- ✅ Opción de generar automáticamente o cargar desde archivo
- ✅ Si genero automáticamente:
  - El sistema asigna turnos según disponibilidad
  - Valida que no haya conflictos
  - Muestra vista previa antes de guardar
- ✅ La malla se crea en estado "BORRADOR"
- ✅ Puedo ver detalles: personal asignado, turnos
- ✅ Al guardar, se envía automáticamente a revisión de Jefe
- ✅ Recibo confirmación: "Malla creada y enviada a aprobación"
```

---

### Historia de Usuario #13: Actualizar Malla en Borrador
```
Como:     usuario con rol Operaciones Clínicas
Quiero:   hacer ajustes a una malla que está en BORRADOR
Para:     corregir errores o cambiar asignaciones

Criterios de Aceptación:
- ✅ Veo malla en estado BORRADOR
- ✅ Puedo editar: personal, turnos, fechas
- ✅ Se valida no crear conflictos
- ✅ Se muestra historial de cambios
- ✅ Puedo deshacer cambios recientes
- ✅ Al guardar cambios, se notifica a Jefe de la actualización
- ✅ La versión anterior se guarda como historial
- ✅ Puedo enviar a aprobación nuevamente si fue rechazada
```

---

### Historia de Usuario #14: Aprobar Malla como Jefe Inmediato
```
Como:     usuario con rol Jefe Inmediato
Quiero:   revisar y aprobar mallas generadas por Operaciones Clínicas
Para:     asegurar que cumplen con los requisitos operacionales

Criterios de Aceptación:
- ✅ Acceso a "Gestión de Mallas" → "Aprobación por Jefe"
- ✅ Veo lista de mallas en estado REVISIÓN
- ✅ Para cada malla veo:
  - Período, versión, cambios desde última versión
  - Personal asignado
  - Turnos distribuidos
- ✅ Puedo hacer clic para ver detalles completos
- ✅ Puedo aprobar (pasa a RRHH) o rechazar (regresa a Operaciones)
- ✅ Si rechazo, debo indicar motivo
- ✅ Se notifica a Operaciones del resultado
- ✅ Se crea historial de aprobación
```

---

### Historia de Usuario #15: Aprobar Malla como Recursos Humanos
```
Como:     usuario con rol Recursos Humanos
Quiero:   revisar mallas aprobadas por Jefe antes de publicación
Para:     asegurar consistencia con novedades de personal

Criterios de Aceptación:
- ✅ Acceso a "Gestión de Mallas" → "Aprobación por RRHH"
- ✅ Veo mallas aprobadas por Jefe
- ✅ Para cada malla veo:
  - Personal y turnos asignados
  - Novedades registradas en el período
  - Conflictos potenciales (si alguien en novedad está asignado)
- ✅ Puedo aprobar (pasa a estado APROBADA-RRHH) o rechazar
- ✅ Si rechazo, regresa a Operaciones con motivo
- ✅ Se notifica resultado a Operaciones
- ✅ Se crea historial
```

---

### Historia de Usuario #16: Publicar Malla
```
Como:     usuario con rol Operaciones Clínicas
Quiero:   publicar una malla aprobada por Jefe y RRHH
Para:     que los usuarios vean sus turnos asignados

Criterios de Aceptación:
- ✅ Solo puedo publicar mallas en estado APROBADA-RRHH
- ✅ Veo confirmación: "Esta malla será visible para todos"
- ✅ Se establece fecha/hora de publicación
- ✅ Se notifica a todos los usuarios asistenciales
- ✅ La malla pasa a estado PUBLICADA
- ✅ Los turnos publicados no pueden modificarse (se crean registros)
- ✅ Se crea historial de publicación
- ✅ Se genera reporte de publicación
```

---

### Historia de Usuario #17: Exportar Malla a Excel
```
Como:     usuario administrativo (cualquier rol)
Quiero:   exportar una malla a formato Excel
Para:     compartirla por email o imprimirla

Criterios de Aceptación:
- ✅ Acceso a botón "Exportar" en vista de malla
- ✅ Opción de elegir formato Excel
- ✅ El archivo contiene:
  - Período de la malla
  - Nombre de cada personal
  - Turnos asignados (fecha, hora)
  - Estado de la malla
- ✅ El documento es profesional y fácil de leer
- ✅ Se descarga automáticamente con nombre: "Malla_Mes_Año.xlsx"
- ✅ Puedo importar a otros sistemas si lo necesito
```

---

### Historia de Usuario #18: Gestionar Usuarios (Administrador)
```
Como:     usuario con rol Administrador
Quiero:   crear, editar y eliminar usuarios en el sistema
Para:     mantener el directorio de personal actualizado

Criterios de Aceptación:
- ✅ Acceso a "Gestión de Usuarios"
- ✅ Puedo crear usuario nuevo:
  - Ingreso: nombre(s), apellido(s), email, teléfono, rol
  - El sistema genera contraseña temporal
  - Se muestra contraseña para entregar al usuario
  - Usuario debe cambiarla en primer login
- ✅ Puedo ver listado de usuarios:
  - Búsqueda por nombre/email
  - Filtro por rol
  - Paginación
- ✅ Puedo editar usuario:
  - Cambiar datos personales
  - Cambiar rol
  - Activar/desactivar usuario
- ✅ Puedo eliminar usuario:
  - Se marca como inactivo (no elimina datos)
  - No puede iniciar sesión
  - Se mantiene historial
- ✅ Se registran todos los cambios en auditoría
```

---

### Historia de Usuario #19: Ver Mi Perfil Personal
```
Como:     usuario autenticado
Quiero:   ver y editar mi información personal
Para:     mantener mis datos actualizados

Criterios de Aceptación:
- ✅ Acceso a "Mi Perfil" desde menú
- ✅ Veo mis datos: nombre, email, teléfono, rol, departamento
- ✅ Puedo editar:
  - Nombre
  - Teléfono
  - Email (si no está duplicado)
- ✅ Puedo cambiar contraseña:
  - Debo ingresar contraseña actual
  - Debo ingresar nueva contraseña
  - Debo confirmar nueva contraseña
- ✅ Cambios se guardan inmediatamente
- ✅ Se muestra mensaje de confirmación
- ✅ No puedo editar rol (solo administrador puede)
```

---

### Historia de Usuario #20: Ver Dashboard Operativo
```
Como:     usuario autenticado
Quiero:   ver un dashboard con información relevante según mi rol
Para:     tener una vista rápida del estado operacional

Criterios de Aceptación (Por Rol):

**Usuarios Asistenciales:**
- ✅ Próximos 5 turnos asignados
- ✅ Mis novedades pendientes y su estado
- ✅ Alertas de cambios en malla
- ✅ Botón rápido para registrar novedad

**Jefe Inmediato:**
- ✅ Novedades pendientes de mi aprobación (cantidad)
- ✅ Equipo a mi cargo (lista)
- ✅ KPIs: cobertura, ausencias totales
- ✅ Tendencia de novedades este mes

**Operaciones Clínicas:**
- ✅ Mallas en revisión (cantidad)
- ✅ Novedades pendientes de aprobación
- ✅ Alertas de malla sin resolver
- ✅ Proyección de cobertura próximos 7 días

**Recursos Humanos:**
- ✅ Novedades pendientes mi aprobación
- ✅ Mallas aprobadas (listas para publicar)
- ✅ Resumen de novedades este mes
- ✅ Personal con más ausencias

**Administrador:**
- ✅ Usuarios activos/inactivos
- ✅ Resumen operacional de todas las áreas
- ✅ Mallas publicadas/pendientes
- ✅ Alertas del sistema
```

---

## ⚙️ REQUISITOS NO FUNCIONALES

### RNF-1: SEGURIDAD

#### RNF-1.1: Autenticación
- ✅ Usar JWT (JSON Web Tokens) para autenticación
- ✅ Token debe estar en formato Bearer en headers
- ✅ Token debe tener expiración (recomendado 24 horas)
- ✅ Implementar refresh token para renovación sin re-login
- ✅ Hash de contraseña con algoritmo fuerte (BCrypt, argon2)
- ✅ No almacenar contraseñas en texto plano

---

#### RNF-1.2: Autorización
- ✅ Control de acceso basado en roles (RBAC)
- ✅ Validar permisos en cada endpoint del backend
- ✅ Validar permisos en cada ruta del frontend
- ✅ No permitir acceso a datos de otros usuarios sin autorización
- ✅ Implementar validación en nivel de DTO/Entity

---

#### RNF-1.3: CORS
- ✅ Configurar CORS para dev: `http://localhost:5173`
- ✅ Configurar CORS para prod: dominio específico
- ✅ Solo permitir métodos necesarios (GET, POST, PUT, DELETE)
- ✅ Incluir credenciales si es necesario

---

#### RNF-1.4: Protección contra vulnerabilidades
- ✅ Implementar CSRF token si usa cookies
- ✅ Validar y sanitizar inputs
- ✅ Usar prepared statements (evitar SQL injection)
- ✅ Implementar rate limiting en endpoints de login
- ✅ Validar tamaño máximo de archivos subidos
- ✅ Usar HTTPS en producción

---

### RNF-2: RENDIMIENTO

#### RNF-2.1: Tiempo de respuesta
- ✅ Respuesta a operaciones simples (GET lista): < 500ms
- ✅ Respuesta a operaciones complejas (generación malla): < 3s
- ✅ Carga de página frontend: < 2s
- ✅ Exportación Excel/PDF: < 5s

---

#### RNF-2.2: Escalabilidad
- ✅ Soportar hasta 60 usuarios simultáneos
- ✅ Soportar hasta 1000 mallas en base de datos
- ✅ Soportar hasta 10000 novedades históricas
- ✅ Frontend debe funcionar con datasets de este tamaño

---

#### RNF-2.3: Optimización
- ✅ Implementar paginación en listados (máx 50 items por página)
- ✅ Usar lazy loading en frontend
- ✅ Cachear datos que cambian poco (roles, períodos)
- ✅ Implementar índices en columnas frecuentemente filtradas
- ✅ Usar select específico en queries (no select *)

---

### RNF-3: DISPONIBILIDAD Y CONFIABILIDAD

#### RNF-3.1: Disponibilidad
- ✅ Tiempo de disponibilidad (uptime): >= 99%
- ✅ RTO (Recovery Time Objective): <= 1 hora
- ✅ RPO (Recovery Point Objective): <= 1 hora
- ✅ Backup diario de base de datos

---

#### RNF-3.2: Manejo de errores
- ✅ Validar todos los inputs
- ✅ Mostrar mensajes de error claros al usuario
- ✅ Registrar errores en logs (no mostrar en frontend)
- ✅ Implementar fallback para operaciones no críticas
- ✅ Página de error 404 personalizada

---

#### RNF-3.3: Manejo de excepciones
- ✅ Capturar excepciones en nivel de servicio
- ✅ Retornar respuestas HTTP apropiadas:
  - 400: Bad Request (datos inválidos)
  - 401: Unauthorized (no autenticado)
  - 403: Forbidden (sin permisos)
  - 404: Not Found (recurso no existe)
  - 409: Conflict (duplicado, conflicto)
  - 500: Internal Server Error

---

### RNF-4: MANTENIBILIDAD

#### RNF-4.1: Código
- ✅ Seguir convenciones de nomenclatura
- ✅ Código debe ser legible y autodocumentado
- ✅ Máximo complejidad ciclomática por función: 10
- ✅ Métodos máximo 30 líneas
- ✅ Clases máximo 300 líneas
- ✅ Comentarios para lógica compleja

---

#### RNF-4.2: Estructura del proyecto
- ✅ Separación clara de capas: controller → service → repository
- ✅ DTOs para transferencia de datos
- ✅ Entities para persistencia
- ✅ Modelos separados en frontend (components, pages, utils)

---

#### RNF-4.3: Documentación
- ✅ README.md con instrucciones de instalación
- ✅ Documentación de endpoints API (Swagger/OpenAPI)
- ✅ Guía de configuración ambiente
- ✅ Documentación de roles y permisos
- ✅ Guía de desarrollo para nuevas features

---

#### RNF-4.4: Testing
- ✅ Cobertura de tests >= 70%
- ✅ Tests unitarios para servicios críticos
- ✅ Tests de integración para flujos principales
- ✅ Tests e2e para flujos de usuario críticos

---

### RNF-5: USABILIDAD

#### RNF-5.1: Interfaz
- ✅ Diseño responsivo (mobile, tablet, desktop)
- ✅ Interfaz intuitiva, no requiere capacitación
- ✅ Colores accesibles (contraste >= WCAG AA)
- ✅ Fuentes legibles (tamaño >= 14px)

---

#### RNF-5.2: Accesibilidad
- ✅ Compatibilidad con lectores de pantalla
- ✅ Navegación por teclado funcional
- ✅ Labels asociados a inputs
- ✅ Validación de campos clara

---

#### RNF-5.3: Idioma
- ✅ Interfaz completamente en español
- ✅ Mensajes de error en español
- ✅ Ayuda en español

---

### RNF-6: COMPATIBILIDAD

#### RNF-6.1: Navegadores
- ✅ Chrome >= versión 90
- ✅ Firefox >= versión 88
- ✅ Safari >= versión 14
- ✅ Edge >= versión 90

---

#### RNF-6.2: Dispositivos
- ✅ Desktop (Windows, macOS, Linux)
- ✅ Tablet (iPad, Android)
- ✅ Mobile (iOS, Android)

---

### RNF-7: DATOS Y ALMACENAMIENTO

#### RNF-7.1: Base de datos
- ✅ PostgreSQL 12+
- ✅ Relaciones normalizadas (3NF mínimo)
- ✅ Restricciones de integridad (FK, PK, CHECK)
- ✅ Índices en columnas de búsqueda frecuente

---

#### RNF-7.2: Almacenamiento de archivos
- ✅ Máximo tamaño de archivo: 10MB
- ✅ Tipos permitidos: PDF, JPG, PNG, DOCX
- ✅ Almacenar en carpeta /uploads con estructura organizada
- ✅ Validar tipo de archivo antes de guardar
- ✅ Limpiar archivos no referenciados (>30 días)

---

#### RNF-7.3: Auditoría
- ✅ Registrar todas las operaciones CRUD
- ✅ Registrar cambios de estado (novedades, mallas)
- ✅ Registrar cambios de datos sensibles
- ✅ Incluir: usuario, fecha, hora, cambio
- ✅ Logs no pueden ser modificados por usuarios

---

### RNF-8: LOCALIZACIÓN

#### RNF-8.1: Idioma
- ✅ Sistema completamente en español
- ✅ Moneda: colombiana (COP si aplica)
- ✅ Formato de fecha: DD/MM/YYYY
- ✅ Formato de hora: HH:MM (24 horas)

---

### RNF-9: COMPATIBILIDAD TÉCNICA

#### RNF-9.1: Backend
- ✅ Java 21 (LTS)
- ✅ Spring Boot 3.x
- ✅ Maven 3.8.1+
- ✅ API REST con JSON

---

#### RNF-9.2: Frontend
- ✅ React 18+
- ✅ Vite 5+
- ✅ Node.js 18+
- ✅ npm 9+
- ✅ Tailwind CSS 3+

---

#### RNF-9.3: DevOps
- ✅ Control de versiones con Git
- ✅ Rama principal: `develop`
- ✅ Rama de features: `edissonDev`
- ✅ Commits descriptivos en español/inglés
- ✅ Mensajes de commit en formato convencional

---

### RNF-10: NOTIFICACIONES

#### RNF-10.1: Sistema de notificaciones
- ✅ Notificaciones en tiempo real (preferiblemente WebSocket)
- ✅ Notificaciones persisten en base de datos
- ✅ Usuario puede marcar como leídas
- ✅ Notificaciones pueden ser por email (opcional)

---

### RNF-11: MONITOREO Y LOGS

#### RNF-11.1: Logs
- ✅ Nivel INFO para operaciones normales
- ✅ Nivel WARN para comportamientos inesperados
- ✅ Nivel ERROR para errores
- ✅ Logs en archivo y/o consola
- ✅ Rotación de logs (máx 10 archivos de 10MB)

---

#### RNF-11.2: Monitoreo
- ✅ Monitorear CPU y memoria del servidor
- ✅ Monitorear latencia de base de datos
- ✅ Alertas si recursos exceden 80%
- ✅ Dashboard de salud del sistema (opcional)

---

## 📊 MATRIZ DE TRAZABILIDAD

| Requisito | Tipo | Prioridad | Historia de Usuario | Estado |
|-----------|------|-----------|---------------------|--------|
| RF-1.1 | Funcional | ALTA | HU#1 | Implementado |
| RF-1.2 | Funcional | ALTA | HU#1 | Implementado |
| RF-1.3 | Funcional | ALTA | HU#1 | Implementado |
| RF-2.1 | Funcional | MEDIA | HU#18 | Implementado |
| RF-2.2 | Funcional | MEDIA | HU#18 | Implementado |
| RF-2.3 | Funcional | MEDIA | HU#19 | Implementado |
| RF-2.4 | Funcional | MEDIA | HU#18 | Implementado |
| RF-2.5 | Funcional | MEDIA | HU#19 | Implementado |
| RF-3.1 | Funcional | ALTA | HU#12 | Implementado |
| RF-3.2 | Funcional | ALTA | HU#2 | Implementado |
| RF-3.3 | Funcional | MEDIA | HU#13 | Implementado |
| RF-3.4 | Funcional | MEDIA | HU#17 | Implementado |
| RF-3.5 | Funcional | ALTA | HU#14 | Implementado |
| RF-3.6 | Funcional | ALTA | HU#15 | Implementado |
| RF-3.7 | Funcional | ALTA | HU#16 | Implementado |
| RF-4.1 | Funcional | ALTA | HU#3,4,5,6,7 | Implementado |
| RF-4.2 | Funcional | ALTA | HU#8 | Implementado |
| RF-4.3 | Funcional | ALTA | HU#9,10,11 | Implementado |
| RF-4.4 | Funcional | ALTA | HU#3,4,5,6,7 | Implementado |
| RF-5.1 | Funcional | MEDIA | - | Implementado |
| RF-5.2 | Funcional | MEDIA | - | Implementado |
| RF-6.1 | Funcional | MEDIA | - | Implementado |
| RF-6.2 | Funcional | MEDIA | - | Implementado |
| RF-7.1 | Funcional | BAJA | - | Pendiente |
| RF-7.2 | Funcional | BAJA | - | Pendiente |
| RF-7.3 | Funcional | MEDIA | HU#20 | Implementado |
| RNF-1 | No Funcional | ALTA | - | Implementado |
| RNF-2 | No Funcional | ALTA | - | Implementado |
| RNF-3 | No Funcional | ALTA | - | Implementado |
| RNF-4 | No Funcional | MEDIA | - | En Progreso |
| RNF-5 | No Funcional | ALTA | - | Implementado |
| RNF-6 | No Funcional | MEDIA | - | Implementado |
| RNF-7 | No Funcional | ALTA | - | Implementado |
| RNF-8 | No Funcional | MEDIA | - | Implementado |
| RNF-9 | No Funcional | ALTA | - | Implementado |
| RNF-10 | No Funcional | MEDIA | - | Implementado |
| RNF-11 | No Funcional | BAJA | - | Implementado |

---

## 🎯 RESUMEN EJECUTIVO

**Total de Requisitos Funcionales:** 31  
**Total de Historias de Usuario:** 20  
**Total de Requisitos No Funcionales:** 11  

**Prioridad Alta:** 20 requisitos  
**Prioridad Media:** 15 requisitos  
**Prioridad Baja:** 7 requisitos  

**Estado General:**
- ✅ Implementados: 32 requisitos
- 🔄 En Progreso: 4 requisitos
- ⏳ Pendientes: 8 requisitos

---

**Documento generado:** Diciembre 28, 2025  
**Versión:** 1.0  
**Autor:** GitHub Copilot  
**Última actualización:** Diciembre 28, 2025
