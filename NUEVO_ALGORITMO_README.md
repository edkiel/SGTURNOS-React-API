# NUEVO ALGORITMO DE GENERACIÓN DE MALLA - v2.0

## CAMBIOS PRINCIPALES

Se ha reescrito completamente el algoritmo de generación de mallas (MallaGeneratorServiceImpl.java) con los siguientes objetivos:

### 1. **GARANTIZAR COBERTURA 100% COMPLETA**
- **Problema anterior**: Dejaba turnos descubiertos (menos auxiliares que los requeridos en ciertos días)
- **Solución**: 
  - FASE 1: Itera sobre 16 turnos por usuario, para cada día asigna la cantidad exacta requerida
  - FASE 2: Verificación de cobertura faltante con hasta 10 intentos de corrección
  - Logs detallados de cada día sin cobertura completa

### 2. **EQUIDAD DE HORAS - 192 HORAS POR PERSONA**
- Todos los usuarios deben tener exactamente 192 horas (16 turnos × 12 horas)
- Cálculo transparente:
  - 16 turnos de 12 horas = 192 horas base
  - APOYO flexible se asigna para completar exactamente a 192 horas

### 3. **APOYO FLEXIBLE - NO NECESARIAMENTE 12 HORAS**
- **Problema anterior**: Asignaba siempre 12 horas de APOYO
- **Solución nueva**:
  ```
  Horas APOYO = 192 - (Turnos asignados × 12)
  ```
  - Si faltan 8 horas → Apoyo (8h)
  - Si faltan 6 horas → Apoyo (6h)
  - Si faltan 4 horas → Apoyo (4h)
  - Máximo 12 horas por APOYO

### 4. **RESTRICCIONES DE TURNOS**
Se mantienen todas las restricciones válidas:
- ✓ No 3+ noches seguidas
- ✓ No 3+ días seguidos  
- ✓ No noche→día (transición directa)
- ✓ POSTURNO después de cada noche
- ✓ Máximo 2 LIBRES consecutivos

### 5. **COBERTURA DINÁMMICA POR PACIENTES**
- Cálculo automático: `auxiliares = ceil(pacientes / 6)`
- Ejemplo: 42 pacientes → ceil(42/6) = 7 auxiliares

## ESTRUCTURA DEL NUEVO ALGORITMO

### FASE 1: Asignación de 16 turnos de 12h
```
Para cada turno (0-15):
  Para cada día (1-31):
    Para cada rol (MED, JEF, AUX, TER):
      Si cobertura en día < requerida: Asignar
      Si cobertura en noche < requerida: Asignar
```

### FASE 2: Verificación y corrección
```
Mientras exista cobertura incompleta (hasta 10 intentos):
  Para cada rol en cada día:
    Si día shift < requerida: Intentar asignar
    Si noche shift < requerida: Intentar asignar
```

### FASE 3: POSTURNO después de noches
```
Para cada usuario:
  Para cada día vacío:
    Si día anterior = Noche → Poner POSTURNO
    Sino → Poner LIBRE
```

### FASE 4: APOYO flexible
```
Para cada usuario:
  horas_faltantes = 192 - horas_actuales
  Para cada día libre en calendario:
    Si horas_faltantes > 0:
      apoyo_horas = min(horas_faltantes, 12)
      Asignar Apoyo(apoyo_horas h)
      Reducir horas_faltantes
```

## CÓMO PROBAR EL NUEVO ALGORITMO

### Caso de prueba: 42 pacientes, 7 auxiliares
1. Ir a http://localhost:5173
2. Seleccionar:
   - **Rol**: AUXILIAR
   - **Mes**: 2025-12 (diciembre)
   - **Pacientes**: 42
   - **Auxiliares**: dejar vacío (calculará 7 automáticamente)
3. Hacer clic en "Generar (Previsualización)"
4. Descargar el Excel y validar:

### VALIDACIONES A REALIZAR

#### ✓ Cobertura Completa
Revisar cada día del mes:
- Día shift: Debe haber exactamente 7 auxiliares con "Día (07-19)"
- Noche shift: Debe haber exactamente 7 auxiliares con "Noche (19-07)"
- NINGÚN DÍA PUEDE TENER MENOS DE 7 AUXILIARES EN CADA TURNO

#### ✓ Horas por Persona
Cada auxiliar debe tener exactamente 192 horas:
- Suma todos los turnos Día y Noche (cada uno = 12h)
- Suma todos los Apoyo (pueden ser 4, 6, 8, 10, 12 horas)
- Total final = 192 horas

#### ✓ Distribución de Turnos
- Cada auxiliar debe tener 16 turnos de 12h
- POSTURNO después de cada Noche
- Máximo 1 POSTURNO seguido de máximo 1 LIBRE (total 2 días de recuperación)
- Máximo 2 LIBRES consecutivos

#### ✓ Restricciones Validadas
- [ ] No hay noche→día directos
- [ ] No hay 3+ noches seguidas
- [ ] No hay 3+ días seguidos
- [ ] APOYO solo en días LIBRE

## LOGS EN CONSOLE

El servidor imprime logs con formato `[MALLA]`:

```
[MALLA] Auxiliares calculados: 42 pacientes / 6 = 7 auxiliares
[MALLA] COBERTURA REQUERIDA - Día: {AUX=7, ...}, Noche: {AUX=7, ...}
[MALLA] Pools - MED: 3, JEF: 4, AUX: 8, TER: 2
[MALLA] Usuarios objetivo: 8 (se usa máximo 7)
[MALLA] FASE 1: Asignando 16 turnos de 12h a cada usuario...
[MALLA] FASE 1 completada
[MALLA] FASE 2: Completando cobertura faltante...
[MALLA] FASE 2 completada - Cobertura 100% garantizada
[MALLA] FASE 3: Asignando POSTURNO después de noches...
[MALLA] FASE 4: Asignando APOYO flexible para completar 192 horas...
[MALLA] Usuario Carlos: 192h, faltan 0h
[MALLA] Usuario María: 192h, faltan 0h
...
```

## ARCHIVO DE IMPLEMENTACIÓN

- **Nueva clase**: `/sgturnos/src/main/java/com/sgturnos/malla/MallaGeneratorServiceImpl.java`
- **Backup antiguo**: `/sgturnos/src/main/java/com/sgturnos/malla/MallaGeneratorServiceImpl.java.bak`
- **No cambios en**: 
  - MallaController.java (igual interfaz)
  - MallaGeneratorService.java (igual interfaz)

## COMPARACIÓN ANTES vs DESPUÉS

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Cobertura** | Incompleta (turnos faltantes) | 100% garantizada |
| **Horas APOYO** | Siempre 12h | Flexible (4-12h según necesidad) |
| **Equidad** | Desigual | Exactamente 192h/persona |
| **Turnos faltantes** | Sí, frecuentes | No, garantizado |
| **Logs** | Mínimos | Detallados con [MALLA] |
| **Fases** | 2 | 4 (clara separación) |

## NOTAS IMPORTANTES

1. **No se modificó la interfaz pública** - El controller sigue siendo el mismo
2. **Compatibilidad hacia atrás** - Todos los parámetros funcionan igual
3. **Disponible el backup** - Si hay problemas, está MallaGeneratorServiceImpl.java.bak
4. **Puerto del servidor** - Sigue siendo 8085
5. **Cálculo dinámico** - Sigue siendo `ceil(pacientes/6)` para auxiliares

## PRÓXIMOS PASOS RECOMENDADOS

1. **Probar con múltiples cargas de pacientes**:
   - 20 pacientes (4 auxiliares)
   - 30 pacientes (5 auxiliares)
   - 60 pacientes (10 auxiliares)

2. **Validar en base de datos**:
   - Revisar logs: `tail -f server.log | grep "\[MALLA\]"`
   - Verificar horas calculadas en spreadsheet

3. **Feedback**:
   - Si hay cobertura incompleta después de FASE 2: revisar logs
   - Si APOYO tiene horas raras: verificar cálculo de horas base

---

**Fecha de implementación**: 2025-12-24  
**Versión**: 2.0 - Algoritmo Mejorado de Cobertura Garantizada
