package com.sgturnos.controller;

import com.sgturnos.model.Usuario;
import com.sgturnos.model.Rol;
import com.sgturnos.repository.UsuarioRepository;
import com.sgturnos.repository.RolRepository;
import com.sgturnos.service.RolPermisosService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controlador para gestión de roles y permisos
 */
@RestController
@RequestMapping("/api/roles")
@CrossOrigin(origins = "http://localhost:5173")
public class RolController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RolPermisosService rolPermisosService;

    @Autowired
    private RolRepository rolRepository;

    /**
     * Obtiene los permisos del usuario actual
     * GET /api/roles/permisos/{idUsuario}
     */
    @GetMapping("/permisos/{idUsuario}")
    public ResponseEntity<?> obtenerPermisos(@PathVariable Long idUsuario) {
        try {
            Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            Map<String, Object> permisos = new HashMap<>();
            permisos.put("rol", rolPermisosService.obtenerNombreRol(usuario));
            permisos.put("puedeRevisarMallas", rolPermisosService.puedeRevisarMallas(usuario));
            permisos.put("puedeGestionarMallas", rolPermisosService.puedeGestionarMallas(usuario));
            permisos.put("puedePublicarMallas", rolPermisosService.puedePublicarMallas(usuario));
            permisos.put("puedeRevisarNovedadesNomina", rolPermisosService.puedeRevisarNovedadesNomina(usuario));
            permisos.put("esJefeInmediato", rolPermisosService.esJefeInmediato(usuario));
            permisos.put("esOperacionesClinicas", rolPermisosService.esOperacionesClinicas(usuario));
            permisos.put("esRecursosHumanos", rolPermisosService.esRecursosHumanos(usuario));
            permisos.put("esAdministrador", rolPermisosService.esAdministrador(usuario));
            permisos.put("tienePermisosAdministrativos", rolPermisosService.tienePermisosAdministrativos(usuario));

            return ResponseEntity.ok(permisos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtiene la descripción de responsabilidades de cada rol
     * GET /api/roles/descripcion/{nombreRol}
     */
    @GetMapping("/descripcion/{nombreRol}")
    public ResponseEntity<?> obtenerDescripcionRol(@PathVariable String nombreRol) {
        Map<String, String> descripcion = new HashMap<>();
        descripcion.put("rol", nombreRol);

        switch (nombreRol) {
            case "Jefe Inmediato":
                descripcion.put("responsabilidades", 
                    "Revisa las mallas generadas, aprueba su contenido, y revisa/aprueba las novedades del personal.");
                descripcion.put("permisos", "Revisar mallas, Aprobar novedades, Ver reportes");
                break;
            case "Operaciones Clínicas":
                descripcion.put("responsabilidades", 
                    "Crea las mallas de turnos, las publica y envía una vez han sido aprobadas por Jefe Inmediato y Recursos Humanos.");
                descripcion.put("permisos", "Crear mallas, Editar mallas, Publicar mallas (post-aprobación)");
                break;
            case "Recursos Humanos":
                descripcion.put("responsabilidades", 
                    "Verifica las mallas en busca de novedades del personal y las tiene en cuenta para la nómina. También revisa y aprueba novedades.");
                descripcion.put("permisos", "Revisar mallas, Revisar novedades para nómina, Aprobar novedades, Generar reportes de nómina");
                break;
            case "Administrador":
                descripcion.put("responsabilidades", 
                    "Acceso total al sistema. Puede realizar todas las funciones de los demás roles.");
                descripcion.put("permisos", "Acceso completo");
                break;
            default:
                descripcion.put("responsabilidades", "Usuario estándar del sistema");
                descripcion.put("permisos", "Solicitar novedades, Ver turnos asignados");
        }

        return ResponseEntity.ok(descripcion);
    }

    /**
     * Lista de roles estándar (no administrativos especiales) desde la BD
     * GET /api/roles/estandar
     */
    @GetMapping("/estandar")
    public ResponseEntity<?> obtenerRolesEstandar() {
        // Roles estándar requeridos
        String[] requeridos = new String[] { "AUXILIAR", "MEDICO", "TERAPIA", "ENFERMERO" };
        Map<String, Object> resultado = new HashMap<>();

        // Buscar por nombre de rol en BD
        Map<String, Map<String, String>> roles = new HashMap<>();
        for (String nombre : requeridos) {
            var maybe = rolRepository.findByRol(nombre);
            if (maybe.isPresent()) {
                Rol r = maybe.get();
                Map<String, String> dto = new HashMap<>();
                dto.put("id", r.getIdRol());
                dto.put("rol", r.getRol());
                roles.put(nombre, dto);
            }
        }

        resultado.put("roles", roles.values());
        return ResponseEntity.ok(resultado);
    }
}
