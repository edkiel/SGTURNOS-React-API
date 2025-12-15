# Guía de Configuración de Roles Administrativos

## 1. Ejecutar Migración SQL

La migración V5 ya está creada en: `sgturnos/src/main/resources/db/migration/V5__create_admin_roles.sql`

Al iniciar la aplicación Spring Boot, Flyway ejecutará automáticamente esta migración y creará los 3 nuevos roles:
- **JEFE_INMEDIATO** - Jefe Inmediato
- **OPERACIONES_CLINICAS** - Operaciones Clínicas  
- **RECURSOS_HUMANOS** - Recursos Humanos

## 2. Asignar Roles a Usuarios Existentes

Después de que la migración se ejecute, puedes asignar estos roles a usuarios existentes con los siguientes comandos SQL:

```sql
-- Asignar rol de Jefe Inmediato a un usuario
UPDATE usuario SET id_rol = 'JEFE_INMEDIATO' WHERE id_usuario = 123;

-- Asignar rol de Operaciones Clínicas a un usuario
UPDATE usuario SET id_rol = 'OPERACIONES_CLINICAS' WHERE id_usuario = 456;

-- Asignar rol de Recursos Humanos a un usuario
UPDATE usuario SET id_rol = 'RECURSOS_HUMANOS' WHERE id_usuario = 789;
```

Reemplaza `123`, `456`, `789` con los IDs reales de tus usuarios.

## 3. Verificar Roles Creados

```sql
-- Ver todos los roles disponibles
SELECT * FROM rol;

-- Ver usuarios con sus roles
SELECT u.id_usuario, u.correo, u.primer_nombre, u.primer_apellido, r.Rol
FROM usuario u
LEFT JOIN rol r ON u.id_rol = r.id_rol
ORDER BY r.Rol;
```

## 4. Responsabilidades por Rol

### Jefe Inmediato
- ✅ Revisar mallas generadas por Operaciones Clínicas
- ✅ Aprobar mallas antes de publicación
- ✅ Revisar y aprobar novedades del personal
- ✅ Ver reportes

### Operaciones Clínicas  
- ✅ Crear nuevas mallas de turnos
- ✅ Editar mallas existentes
- ✅ Publicar mallas (solo después de aprobación de Jefe Inmediato y Recursos Humanos)
- ✅ Asignar turnos extras cuando no hay reemplazo

### Recursos Humanos
- ✅ Revisar mallas en busca de novedades del personal
- ✅ Aprobar novedades
- ✅ Tener en cuenta novedades para nómina
- ✅ Generar reportes de nómina
- ✅ Aprobar mallas antes de publicación

### Administrador
- ✅ Acceso completo a todas las funciones
- ✅ Puede realizar las funciones de todos los demás roles

## 5. Endpoints del API para Permisos

### Obtener permisos de un usuario
```
GET /api/roles/permisos/{idUsuario}
```

Respuesta:
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

### Obtener descripción de un rol
```
GET /api/roles/descripcion/{nombreRol}
```

Ejemplo:
```
GET /api/roles/descripcion/Jefe%20Inmediato
```

## 6. Flujo de Trabajo con los Nuevos Roles

### Flujo de Creación y Publicación de Mallas:
1. **Operaciones Clínicas** crea la malla de turnos
2. **Jefe Inmediato** revisa y aprueba la malla
3. **Recursos Humanos** verifica la malla (novedades, personal disponible) y aprueba
4. **Operaciones Clínicas** publica la malla (solo después de ambas aprobaciones)

### Flujo de Aprobación de Vacaciones:
1. Usuario normal solicita vacaciones
2. **Jefe Inmediato** aprueba (primera aprobación)
3. **Operaciones Clínicas** aprueba (segunda aprobación)
4. **Recursos Humanos** aprueba (tercera aprobación)
5. Sistema ajusta automáticamente la malla y busca reemplazos

## 7. Componentes Frontend Disponibles

### RolInfo Component
Muestra información del rol y permisos del usuario actual.

Uso:
```jsx
import RolInfo from './components/roles/RolInfo';

<RolInfo usuarioId={user.idUsuario} />
```

## 8. Próximos Pasos

- [ ] Ejecutar la aplicación para que Flyway cree los roles
- [ ] Asignar roles a usuarios de prueba
- [ ] Probar los permisos desde el frontend
- [ ] Implementar lógica de aprobación de mallas (pendiente)
- [ ] Agregar notificaciones para aprobaciones pendientes
