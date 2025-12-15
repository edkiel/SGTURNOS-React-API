# Sistema de Alertas y Gestión de Mallas por Novedades

## Resumen de la Implementación

Se ha implementado la **Fase 1** del sistema de gestión de mallas afectadas por novedades aprobadas (vacaciones, incapacidades, etc.).

---

## ✅ FASE 1 COMPLETADA: Sistema de Alertas

### Backend Implementado

#### 1. Nueva Tabla en Base de Datos
- **Tabla**: `alerta_malla`
- **Migración**: `V6__create_alerta_malla.sql`
- **Campos**:
  - `id_alerta`: Identificador único
  - `id_novedad`: Relación con la novedad que genera la alerta
  - `tipo_accion`: `RECALCULO_MES_ACTUAL` o `EVITAR_PROGRAMACION_FUTURO`
  - `mes_afectado` / `anio_afectado`: Período que requiere modificación
  - `estado`: `PENDIENTE`, `PROCESADA`, `IGNORADA`
  - `fecha_creacion` / `fecha_procesamiento`: Timestamps
  - `observaciones`: Notas sobre la alerta
  - `id_usuario_procesador`: Quién procesó la alerta

#### 2. Nuevos Componentes Java

**Modelo**: `AlertaMalla.java`
- Entidad JPA con relaciones a Novedad y Usuario
- Pre-persist que establece estado PENDIENTE por defecto

**Repositorio**: `AlertaMallaRepository.java`
- `findByEstadoOrderByFechaCreacionDesc()`: Obtener alertas por estado
- `findByMesAfectadoAndAnioAfectadoAndEstado()`: Filtrar por período
- `countByEstado()`: Contar alertas pendientes

**Servicio**: `AlertaMallaService.java`
- `crearAlertaPorNovedad()`: Genera alerta automáticamente al aprobar novedad
- `obtenerAlertasPendientes()`: Lista de alertas sin procesar
- `marcarComoProcessada()`: Marca alerta como atendida
- Lógica para determinar si requiere recalculo o evitar programación

**Controlador**: `AlertaMallaController.java`
- `GET /api/alertas-malla/pendientes`: Obtener alertas pendientes
- `GET /api/alertas-malla/contar`: Contador de alertas
- `POST /api/alertas-malla/{id}/procesar`: Marcar como procesada
- `GET /api/alertas-malla/por-periodo`: Filtrar por mes/año

#### 3. Modificación de NovedadService
- Al aprobar una novedad, automáticamente crea una alerta
- Detecta si la novedad afecta al mes actual o futuro
- Genera observaciones descriptivas

### Frontend Implementado

#### 1. Componente `AlertasMalla.jsx`
- **Ubicación**: `src/components/mallas/AlertasMalla.jsx`
- **Función**: Panel de alertas con colores diferenciados
  - 🔴 Rojo: Requiere recalcular malla actual
  - ⚠️ Amarillo: Evitar programación futura
- **Características**:
  - Muestra detalles de la novedad (usuario, tipo, fechas, período)
  - Botón para marcar como procesada
  - Instrucciones claras sobre el flujo de trabajo
  - Auto-recarga de datos

#### 2. Componente `BadgeAlertas.jsx`
- **Ubicación**: `src/components/mallas/BadgeAlertas.jsx`
- **Función**: Badge animado con contador
- Muestra número de alertas pendientes en el botón "Inicio"
- Actualización automática cada 60 segundos

#### 3. Integración en Dashboard (`App.jsx`)
- Alertas visibles solo para administradores
- Se muestra en la pantalla de inicio (tab 'home')
- Badge con contador en el menú lateral

---

## 🚧 FASE 2 PENDIENTE: Algoritmo de Recálculo de Mallas

### Requisitos de Implementación

#### 1. Modificación de TurnosModule/MallaGeneratorService

**Cuando se genera una nueva malla (mes futuro):**
```java
// Consultar alertas del mes a generar
List<AlertaMalla> alertas = alertaMallaService.obtenerAlertasPorMesAnio(mes, anio);

// Filtrar usuarios con ausencias programadas
List<Long> usuariosExcluidos = alertas.stream()
    .filter(a -> a.getTipoAccion().equals("EVITAR_PROGRAMACION_FUTURO"))
    .map(a -> a.getNovedad().getUsuario().getIdUsuario())
    .collect(Collectors.toList());

// NO programar a estos usuarios
empleadosDisponibles.removeIf(e -> usuariosExcluidos.contains(e.getIdUsuario()));
```

#### 2. Servicio de Recálculo para Malla Actual

**Crear**: `MallaRecalculoService.java`

**Funcionalidad**:
```java
public void recalcularMallaPorNovedad(AlertaMalla alerta) {
    // 1. Obtener malla publicada del mes actual
    // 2. Identificar turnos asignados al usuario afectado
    // 3. Para cada turno:
    //    a. Intentar reasignar a personal con HORAS DE APOYO disponibles
    //    b. NO combinar dos personas en un mismo turno
    //    c. Si no hay nadie disponible → etiquetar como "APOYO DE PERSONAL EXTRA"
    // 4. Guardar malla modificada
    // 5. Notificar a Jefe Directo para revisión
}
```

**Algoritmo de Reasignación**:
```java
private void reasignarTurno(Turno turno, Usuario usuarioAusente) {
    // Buscar empleados con:
    // - Mismo rol o compatible
    // - Horas de apoyo disponibles en su contrato
    // - NO programados en ese horario
    // - NO exceden jornada máxima semanal
    
    List<Usuario> candidatos = buscarCandidatosConApoyo(turno);
    
    if (candidatos.isEmpty()) {
        turno.setEstado("APOYO_EXTRA_REQUERIDO");
        turno.setObservaciones("Requiere contactar profesional externo");
    } else {
        Usuario reemplazo = candidatos.get(0); // Priorizar por criterio definido
        turno.setUsuario(reemplazo);
        turno.setObservaciones("Reasignado por ausencia de " + usuarioAusente.getNombres());
    }
}
```

#### 3. Endpoint para Recálculo Manual

**Controlador**: `POST /api/mallas/recalcular`

```java
@PostMapping("/recalcular")
public ResponseEntity<?> recalcularMalla(
    @RequestParam Integer mes,
    @RequestParam Integer anio,
    @RequestBody Map<String, Long> body) {
    
    Long idUsuarioOperaciones = body.get("idUsuario");
    
    // Verificar que es admin de Operaciones Clínicas
    Usuario usuario = usuarioRepository.findById(idUsuarioOperaciones).orElse(null);
    if (!esOperacionesClinicas(usuario)) {
        return ResponseEntity.status(403).body("No autorizado");
    }
    
    // Ejecutar recálculo
    mallaRecalculoService.recalcularMallaDelMes(mes, anio);
    
    // Marcar alertas como procesadas
    alertaMallaService.marcarAlertasDePerioComoProcessadas(mes, anio, usuario);
    
    return ResponseEntity.ok("Malla recalculada. Requiere aprobación del Jefe Directo");
}
```

#### 4. Notificación a Jefe Directo

**Crear**: Tabla `notificacion_aprobacion`
- Cuando se recalcula una malla, generar notificación
- Jefe Directo debe revisar cambios antes de publicar
- Mostrar diff: turnos originales vs. modificados

#### 5. Interfaz de Recálculo

**Frontend**: Agregar botón en `AlertasMalla.jsx`

```jsx
{alerta.tipoAccion === 'RECALCULO_MES_ACTUAL' && (
  <button 
    onClick={() => ejecutarRecalculo(alerta)}
    className="bg-orange-600 text-white px-4 py-2 rounded">
    🔄 Ejecutar Recálculo Automático
  </button>
)}
```

**Mostrar vista previa**:
- Turnos que serán reasignados
- Personal que cubrirá
- Turnos marcados como "APOYO_EXTRA_REQUERIDO"
- Botón de confirmar cambios

---

## 📋 Flujo de Trabajo Completo

### Cuando se Aprueba una Novedad:

1. **Backend automático**:
   - Se guarda novedad con estado `APROBADA`
   - `AlertaMallaService.crearAlertaPorNovedad()` genera alerta
   - Alerta clasifica: `RECALCULO_MES_ACTUAL` vs `EVITAR_PROGRAMACION_FUTURO`

2. **Dashboard de Administradores**:
   - Badge rojo en "Inicio" muestra contador de alertas
   - Panel de alertas lista todas las pendientes con colores

3. **Operaciones Clínicas**:
   - **Si es mes futuro**: Al generar nueva malla, excluye automáticamente al usuario
   - **Si es mes actual**: Ejecuta recálculo → botón "Ejecutar Recálculo Automático"

4. **Jefe Directo**:
   - Recibe notificación de malla modificada
   - Revisa cambios (turnos reasignados, apoyo extra requerido)
   - Aprueba o solicita ajustes

5. **Publicación**:
   - Una vez aprobada por Jefe Directo, se publica malla modificada
   - Alerta se marca como `PROCESADA`

---

## 🎯 Próximos Pasos (Fase 2)

1. **Crear `MallaRecalculoService.java`**:
   - Implementar lógica de reasignación con horas de apoyo
   - Validar restricciones (no combinar, jornada máxima)
   - Etiquetar turnos sin cobertura

2. **Modificar `MallaGeneratorService.java`**:
   - Integrar consulta de alertas al generar mallas futuras
   - Excluir usuarios con novedades aprobadas

3. **Crear sistema de notificaciones**:
   - Tabla `notificacion_aprobacion`
   - Componente frontend para Jefe Directo

4. **Interfaz de confirmación de recálculo**:
   - Vista previa de cambios
   - Diff visual
   - Confirmación antes de aplicar

5. **Testing**:
   - Probar casos edge: usuario sin reemplazo, múltiples ausencias simultáneas
   - Validar que no se excedan jornadas laborales

---

## 🔧 Comandos para Ejecutar

### Backend:
```bash
cd sgturnos
.\mvnw.cmd spring-boot:run
```

### Frontend:
```bash
cd sgturnos-react-app
npm run dev
```

### Base de Datos:
- La migración `V6__create_alerta_malla.sql` se ejecutará automáticamente con Flyway

---

## 📝 Notas Técnicas

- **Transaccionalidad**: Aprobación de novedad + creación de alerta en misma transacción
- **Actualización automática**: BadgeAlertas se actualiza cada 60 segundos
- **Colores de alerta**:
  - Rojo = Urgente, requiere recálculo inmediato
  - Amarillo = Preventivo, afecta generación futura
- **Permisos**: Solo administradores ven alertas
- **Escalabilidad**: Índices en `estado`, `mes_afectado`, `anio_afectado`

---

## 🐛 Consideraciones de Debugging

1. **Si no aparecen alertas**:
   - Verificar que la novedad fue APROBADA (no PENDIENTE)
   - Revisar logs de `AlertaMallaService.crearAlertaPorNovedad()`
   - Consultar directamente: `SELECT * FROM alerta_malla;`

2. **Si badge no muestra contador**:
   - Abrir consola del navegador
   - Verificar llamada a `/api/alertas-malla/contar`
   - Confirmar que usuario es administrador

3. **Migración de BD**:
   - Si Flyway falla, ejecutar manualmente el script V6
   - Verificar que no hay versiones anteriores mal aplicadas

---

**Documentado por**: GitHub Copilot  
**Fecha**: 14 de Diciembre, 2025  
**Estado**: Fase 1 Completa ✅ | Fase 2 Pendiente 🚧
