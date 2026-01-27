# Sistema de Marcado de Alertas como Vistas

## 📋 Resumen del Cambio

Se implementó un sistema para marcar las alertas de malla como "vistas" automáticamente cuando el usuario las visualiza. Esto permite que el contador del badge (chip) junto a "Inicio" solo muestre alertas **no vistas**, reduciendo progresivamente hasta desaparecer cuando el usuario las ha revisado.

## 🎯 Problema Identificado

**Situación anterior:**
- El badge mostraba el contador de todas las alertas con estado "PENDIENTE"
- Al revisar las alertas, el contador no se reducía
- El usuario tenía que hacer clic en "Marcar como procesada" para cada alerta
- Esto generaba confusión: "ya vi las alertas, ¿por qué sigue el número?"

**Solución implementada:**
- Al abrir el componente `AlertasMalla`, todas las alertas pendientes se marcan automáticamente como "vistas"
- El contador del badge ahora solo cuenta alertas **PENDIENTE + NO VISTAS**
- El badge desaparece cuando no hay alertas nuevas por ver

## 🔧 Cambios Técnicos

### 1. Base de Datos
**Tabla:** `alerta_malla`  
**Nueva columna:** `visto BOOLEAN NOT NULL DEFAULT FALSE`

**Script de migración:**
```sql
ALTER TABLE alerta_malla 
ADD COLUMN visto BOOLEAN NOT NULL DEFAULT FALSE;
```

### 2. Backend (Java/Spring Boot)

#### AlertaMalla.java (Entidad)
- Nuevo campo: `private Boolean visto = false;`

#### AlertaMallaRepository.java
Nuevos métodos:
```java
Long countByEstadoAndVisto(String estado, Boolean visto);
List<AlertaMalla> findByEstadoAndVistoOrderByFechaCreacionDesc(String estado, Boolean visto);
```

#### AlertaMallaService.java
Métodos modificados/agregados:
- `contarAlertasPendientes()`: Ahora cuenta solo alertas NO vistas
- `marcarTodasComoVistas()`: Marca todas las alertas pendientes como vistas
- `marcarComoVista(Long idAlerta)`: Marca una alerta específica como vista

#### AlertaMallaController.java
Nuevos endpoints:
- `POST /api/alertas-malla/marcar-visto` - Marca todas como vistas
- `POST /api/alertas-malla/{idAlerta}/marcar-visto` - Marca una específica como vista

### 3. Frontend (React)

#### AlertasMalla.jsx
- `useEffect()`: Llama automáticamente a `marcarComoVistas()` al montar el componente
- Nueva función `marcarComoVistas()`: Hace POST a `/api/alertas-malla/marcar-visto`

#### BadgeAlertas.jsx
- Sin cambios necesarios (sigue usando `/api/alertas-malla/contar`)
- El contador se reduce automáticamente porque el backend ahora filtra por `visto=false`

## 🚀 Flujo de Funcionamiento

```
1. Usuario ve badge con número 5 junto a "Inicio"
   ↓
2. Usuario hace clic en "Inicio" → Se muestra Dashboard
   ↓
3. Usuario hace clic en algún componente que muestra AlertasMalla
   ↓
4. AlertasMalla.jsx se monta:
   - Llama a cargarAlertas() → GET /api/alertas-malla/pendientes
   - Llama a marcarComoVistas() → POST /api/alertas-malla/marcar-visto
   ↓
5. Backend marca todas las alertas pendientes como visto=true
   ↓
6. BadgeAlertas actualiza cada 60 segundos:
   - GET /api/alertas-malla/contar
   - Backend cuenta solo alertas con estado=PENDIENTE AND visto=false
   ↓
7. Badge se reduce o desaparece si count = 0
```

## 📊 Estados de una Alerta

| Campo | Valores | Descripción |
|-------|---------|-------------|
| `estado` | PENDIENTE, PROCESADA, IGNORADA | Estado de procesamiento de la alerta |
| `visto` | true, false | Si el usuario ha visualizado la alerta |

**Combinaciones posibles:**
- `PENDIENTE + visto=false` → **Cuenta para el badge** (nueva/no vista)
- `PENDIENTE + visto=true` → No cuenta para el badge (ya vista, pendiente de procesar)
- `PROCESADA + visto=true` → Alerta completada

## 🔍 Endpoints API

### Contar alertas no vistas
```http
GET /api/alertas-malla/contar
Response: { "count": 2 }
```

### Obtener alertas pendientes (todas, vistas y no vistas)
```http
GET /api/alertas-malla/pendientes
Response: [{ idAlerta, novedad, tipoAccion, visto, ... }, ...]
```

### Marcar todas como vistas
```http
POST /api/alertas-malla/marcar-visto
Response: { "mensaje": "Alertas marcadas como vistas" }
```

### Marcar una específica como vista
```http
POST /api/alertas-malla/{idAlerta}/marcar-visto
Response: { "mensaje": "Alerta marcada como vista" }
```

### Procesar una alerta (marca como PROCESADA)
```http
POST /api/alertas-malla/{idAlerta}/procesar
Body: { "idUsuario": 123, "observaciones": "..." }
Response: { "mensaje": "Alerta procesada exitosamente" }
```

## 🗄️ Pasos para Aplicar en Producción

1. **Ejecutar migración SQL:**
   ```bash
   mysql -u root -p sgturnos < migration_add_visto_column.sql
   ```

2. **Recompilar backend:**
   ```bash
   cd sgturnos
   mvn clean install -DskipTests
   ```

3. **Reiniciar aplicación:**
   ```bash
   .\mvnw.cmd spring-boot:run
   ```

4. **Verificar frontend:**
   ```bash
   cd sgturnos-react-app
   npm run dev
   ```

## ✅ Validación

### Prueba manual:
1. Crear una novedad y aprobarla (genera alerta)
2. Verificar que el badge muestra el número
3. Hacer clic en "Inicio" y abrir el componente de alertas
4. Esperar 60 segundos o refrescar
5. El badge debería reducirse o desaparecer

### Verificación en DB:
```sql
-- Ver alertas y su estado de visto
SELECT id_alerta, tipo_accion, estado, visto, fecha_creacion 
FROM alerta_malla 
ORDER BY fecha_creacion DESC 
LIMIT 10;
```

## 🎨 Experiencia de Usuario

**Antes:**
- Badge siempre mostraba 5 aunque ya hubiera revisado las alertas
- Confusión sobre qué alertas eran nuevas

**Ahora:**
- Badge muestra solo alertas nuevas/no vistas
- Al revisar, el número se reduce automáticamente
- Badge desaparece cuando no hay alertas nuevas
- Comportamiento intuitivo: "lo que veo es lo que hay de nuevo"

## 📝 Notas Importantes

- **El marcado como "visto" es automático:** No requiere acción del usuario
- **Independiente de "procesado":** Ver una alerta ≠ procesarla
- **Actualización del badge:** Se actualiza cada 60 segundos (configurado en BadgeAlertas.jsx)
- **Compatibilidad:** El cambio es retrocompatible, alertas existentes se marcan como visto=false

## 🔮 Mejoras Futuras Posibles

1. Agregar filtro "Ver solo no vistas / Ver todas" en AlertasMalla
2. Agregar fecha_visto (timestamp) para analytics
3. Notificaciones push cuando llega una nueva alerta
4. Marcar individualmente como visto al hacer scroll (no todas a la vez)

---
**Fecha de implementación:** 27 de enero de 2026  
**Versión:** 1.0  
**Autor:** GitHub Copilot  
**Branch:** deploy-render
