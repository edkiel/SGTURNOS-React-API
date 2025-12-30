# Algoritmo de Generación de Mallas v3.0

## 📋 Resumen

Algoritmo optimizado para generar mallas de turnos hospitalarios dinámicas, garantizando 192 horas mensuales exactas por usuario, cobertura completa de servicios y cumplimiento de restricciones laborales.

## 🎯 Objetivos Principales

1. **Prioridad en turnos regulares**: Completar las 192 horas usando principalmente turnos DÍA (TD) y NOCHE (TN)
2. **Comité Primario (CP)**: Asignar 3 horas de capacitación dentro de las 192h totales
3. **Turnos de APOYO (AP)**: Solo para completar horas faltantes (NUNCA exceder 192h), siempre en horario diurno
4. **Dinamismo**: Generar mallas variadas (permitir dupletas, evitar monotonía)
5. **Restricciones laborales**: Cumplir normas de descanso y máximos consecutivos

## 📝 Códigos de Turnos

### Turnos Principales
```
┌──────────────────────────────────────────────┐
│ ☐ Turno Día (TD)                             │
│   07:00 - 19:00  (12 horas)                  │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ ☐ Turno Noche (TN)                           │
│   19:00 - 07:00  (12 horas)                  │
└──────────────────────────────────────────────┘
```

### Turnos Especiales
- **PT**: Posturno (descanso obligatorio post-noche, 12h)
- **CP**: Comité Primario (capacitación, 3h)
- **LB**: Libre (descanso regular)
- **AP**: Apoyo (horas variables: 4h, 6h, 8h, 10h o 12h)

## 📊 Distribución de Cobertura

### Turno DÍA (07:00 - 19:00)
- **Médicos**: 2
- **Enfermeros (JEF)**: 3  
- **Auxiliares (AUX)**: 8-9 (1 por cada 6 pacientes - actualmente 42 pacientes)
- **Terapeutas (TER)**: 2

### Turno NOCHE (19:00 - 07:00)
- **Médicos**: 1
- **Enfermeros (JEF)**: 2
- **Auxiliares (AUX)**: 8-9 (1 por cada 6 pacientes - actualmente 42 pacientes)
- **Terapeutas (TER)**: 2

## 🔧 Fases del Algoritmo

### FASE 1: Asignación de Turnos DÍA y NOCHE
**Objetivo**: Cubrir toda la demanda mensual con turnos de 12 horas

**Proceso**:
1. Para cada día del mes (1-30/31)
2. Asignar turnos DÍA por rol (MED, JEF, AUX, TER) hasta cubrir cobertura requerida
3. Asignar turnos NOCHE por rol hasta cubrir cobertura requerida
4. Seleccionar candidatos basándose en:
   - Menos horas acumuladas (equidad)
   - Sin violar restricciones (ver sección Restricciones)

**Resultado**: Todos los días tienen cobertura completa con turnos de 12 horas

### FASE 2: Asignación de POSTURNO
**Objetivo**: Garantizar descanso mínimo de 12h después de turnos nocturnos

**Proceso**:
1. Revisar todos los días de cada usuario
2. Si día anterior = 12N → día actual vacío = POSTURNO
3. Si día anterior ≠ 12N → día actual vacío = DES (Descanso)

**Códigos**:
- `POSTURNO`: Descanso obligatorio post-noche (12h)
- `DES`: Descanso regular

### FASE 3: Asignación de Comité Primario (CMP)
**Objetivo**: Incluir 3 horas de capacitación en el mes

**Proceso**:
1. Para cada usuario, buscar un día marcado como DES
2. Convertir ese DES en CMP (Comité Primario - 3h)
3. Sumar 3 horas al contador del usuario
4. Marcar que el usuario ya tiene su CMP asignado

**Nota**: CMP cuenta dentro de las 192 horas totales

**Restricción importante**: CMP + APOYO en un mismo día ≤ 12 horas máximo

### FASE 4: Asignación de APOYO (Solo si es necesario)
**Objetivo**: Completar exactamente 192 horas mensuales

**Proceso**:
1. Para cada usuario:
   - Calcular horas faltantes = 192 - horas_actuales
   - Si horas_faltantes > 0:
     - Buscar días marcados como DES
     - Convertir DES → APOYO
     - Asignar horas normalizadas (4h, 6h, 8h, 10h o 12h)
     - **VALIDAR**: Si el día ya tiene CMP (3h), APOYO máximo = 9h (para no exceder 12h/día)
     - Actualizar contador de horas

**Importante**: 
- APOYO solo se usa si con turnos 12D/12N + CMP no se alcanzan las 192h
- NUNCA asignar APOYO de noche
- NO exceder 192 horas totales
- **En un mismo día: CMP (3h) + APOYO ≤ 12 horas**

## ⚠️ Restricciones del Algoritmo

### 1. NO Tripletas
- ❌ **Máximo 2 turnos DÍA consecutivos** (3+ días seguidos está prohibido)
- ❌ **Máximo 2 turnos NOCHE consecutivos** (3+ noches seguidas está prohibido)
- ✅ Dupletas permitidas: DÍA-DÍA, NOCHE-NOCHE, DÍA-NOCHE

### 2. NO Noche → Día directo
- ❌ **Prohibido asignar 12D inmediatamente después de 12N**
- **Razón**: Sería 24 horas continuas (noche 19-07 + día 07-19)

### 3. Descanso Post-Noche
- ✅ **Siempre POSTURNO después de 12N** (mínimo 12h de descanso)
- El usuario puede volver a trabajar después del POSTURNO

### 4. Límite de 192 Horas
- ❌ **NUNCA exceder 192 horas mensuales por usuario**
- Verificación antes de asignar cada turno
- **Ecuación**: Turnos DÍA + Turnos NOCHE + Comité Primario (3h) + APOYO = 192 horas

### 5. Límite Diario de Horas Mixtas
- ❌ **En un mismo día: CMP + APOYO NO puede superar 12 horas**
- ✅ Ejemplo válido: CMP (3h) + APOYO (9h) = 12h
- ❌ Ejemplo inválido: CMP (3h) + APOYO (10h) = 13h

## 📝 Códigos de Turnos

| Código | Nombre | Horas | Descripción |
|--------|--------|-------|-------------|
| `12D` | Turno Día | 12h | Turno diurno 07:00-19:00 |
| `12N` | Turno Noche | 12h | Turno nocturno 19:00-07:00 |
| `CMP` | Comité Primario | 3h | Capacitación/Educación continua |
| `APOYO` | Apoyo | 4-12h | Turno complementario para completar horas |
| `POSTURNO` | Post-turno | 0h | Descanso obligatorio post-noche |
| `DES` | Descanso | 0h | Día libre/descanso regular |

## 🔍 Ejemplo de Malla Generada

```
Usuario: JENNY ANDREA MARTINEZ
Día 1: 12D
Día 2: DES
Día 3: 12D
Día 4: DES
Día 5: 12N
Día 6: POSTURNO
Día 7: CMP
Día 8: 12D
Día 9: 12D (dupleta permitida)
Día 10: DES
Día 11: 12N
Día 12: POSTURNO
...
Total: 16 turnos × 12h + CMP 3h = 195h → -3h ajuste = 192h exactas
```

## 💡 Mejoras v3.0 sobre v2.0

1. **Eliminación de APOYO excesivo**: Solo se asigna cuando es estrictamente necesario
2. **Inclusión de CMP**: Comité Primario integrado como parte del algoritmo
3. **Restricciones más claras**: Dupletas permitidas, tripletas prohibidas
4. **Códigos simplificados**: `12D`, `12N` en lugar de "Día (07-19)", "Noche (19-07)"
5. **Mejor distribución**: Mallas más dinámicas y menos monótonas
6. **Control estricto de 192h**: Verificación en cada fase del algoritmo

## 🚀 Uso

```java
// Generar malla para auxiliares en enero 2025 con 42 pacientes
mallaService.setPatientLoad(42);  // 42 pacientes / 6 = 7 auxiliares por turno
File malla = mallaService.generateAndSave("AUX", "2025-01");
```

## 📌 Notas Importantes

- **DDF (Día de la Familia)**: No implementado por ahora
- **Cálculo de auxiliares**: Automático según pacientes (pacientes / 6, redondeado hacia arriba)
- **Flexibilidad**: APOYO puede ser 4h, 6h, 8h, 10h o 12h según necesidad
- **Equidad**: Algoritmo prioriza usuarios con menos horas acumuladas

## 🐛 Troubleshooting

**Problema**: Usuarios con muchos APOYO  
**Solución**: Verificar que cobertura diaria esté correctamente configurada

**Problema**: No se completan 192 horas  
**Solución**: Aumentar días disponibles o ajustar cobertura por rol

**Problema**: Turnos muy seguidos  
**Solución**: El algoritmo ya distribuye dinámicamente, verificar logs de restricciones

## 🔄 Cambios desde v2.0

### Eliminado
- ❌ Asignación forzada de 16 turnos
- ❌ APOYO siempre de 12 horas
- ❌ Fase de "fill missing coverage" con múltiples intentos

### Agregado
- ✅ Fase de Comité Primario (CMP)
- ✅ APOYO flexible (4h, 6h, 8h, 10h, 12h)
- ✅ Control de dupletas vs tripletas
- ✅ Mejor seguimiento de turnos consecutivos

### Mejorado
- ⚡ Selección de candidatos más equitativa
- ⚡ Códigos de turno más claros
- ⚡ Logs más detallados por fase
