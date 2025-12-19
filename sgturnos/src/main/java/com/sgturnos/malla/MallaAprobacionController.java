package com.sgturnos.malla;

import com.sgturnos.model.Usuario;
import com.sgturnos.service.RolPermisosService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controlador para aprobación de mallas por roles administrativos
 * 
 * Flujo:
 * 1. Operaciones Clínicas crea la malla
 * 2. Jefe Inmediato revisa y aprueba
 * 3. Recursos Humanos verifica y aprueba
 * 4. Operaciones Clínicas publica (solo después de ambas aprobaciones)
 */
@RestController
@RequestMapping("/api/mallas/aprobaciones")
@CrossOrigin(origins = "http://localhost:5173")
public class MallaAprobacionController {

    @Autowired
    private RolPermisosService rolPermisosService;

    /**
     * Jefe Inmediato aprueba una malla
     * POST /api/mallas/aprobaciones/aprobar-jefe/{idMalla}
     */
    @PostMapping("/aprobar-jefe/{idMalla}")
    public ResponseEntity<?> aprobarJefeInmediato(
            @PathVariable Long idMalla,
            @RequestBody Map<String, Object> request) {
        
        try {
            Long idUsuario = ((Number) request.get("idUsuario")).longValue();
            String comentario = (String) request.getOrDefault("comentario", "");

            // Validar que el usuario sea Jefe Inmediato
            // En una implementación real, obtendríamos el usuario de la base de datos
            // Usuario usuario = usuarioRepository.findById(idUsuario);
            // if (!rolPermisosService.esJefeInmediato(usuario)) {
            //     return ResponseEntity.status(HttpStatus.FORBIDDEN)
            //         .body(Map.of("error", "Solo Jefe Inmediato puede aprobar"));
            // }

            Map<String, Object> respuesta = new HashMap<>();
            respuesta.put("mensaje", "Malla #" + idMalla + " aprobada por Jefe Inmediato");
            respuesta.put("malla_id", idMalla);
            respuesta.put("estado_aprobacion", "APROBADA_JEFE");
            respuesta.put("comentario_jefe", comentario);
            respuesta.put("fecha_aprobacion", java.time.LocalDateTime.now());
            respuesta.put("siguiente_paso", "Esperar aprobación de Recursos Humanos");

            return ResponseEntity.ok(respuesta);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Error al aprobar malla: " + e.getMessage()));
        }
    }

    /**
     * Recursos Humanos aprueba una malla
     * POST /api/mallas/aprobaciones/aprobar-rrhh/{idMalla}
     */
    @PostMapping("/aprobar-rrhh/{idMalla}")
    public ResponseEntity<?> aprobarRecursosHumanos(
            @PathVariable Long idMalla,
            @RequestBody Map<String, Object> request) {
        
        try {
            Long idUsuario = ((Number) request.get("idUsuario")).longValue();
            String comentario = (String) request.getOrDefault("comentario", "");
            String novedadesEncontradas = (String) request.getOrDefault("novedades", "");

            // Validar que el usuario sea Recursos Humanos
            // Usuario usuario = usuarioRepository.findById(idUsuario);
            // if (!rolPermisosService.esRecursosHumanos(usuario)) {
            //     return ResponseEntity.status(HttpStatus.FORBIDDEN)
            //         .body(Map.of("error", "Solo Recursos Humanos puede aprobar"));
            // }

            Map<String, Object> respuesta = new HashMap<>();
            respuesta.put("mensaje", "Malla #" + idMalla + " aprobada por Recursos Humanos");
            respuesta.put("malla_id", idMalla);
            respuesta.put("estado_aprobacion", "APROBADA_RRHH");
            respuesta.put("comentario_rrhh", comentario);
            respuesta.put("novedades_encontradas", novedadesEncontradas);
            respuesta.put("fecha_aprobacion", java.time.LocalDateTime.now());
            respuesta.put("siguiente_paso", "Operaciones Clínicas puede publicar la malla");

            return ResponseEntity.ok(respuesta);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Error al aprobar malla: " + e.getMessage()));
        }
    }

    /**
     * Obtiene estado de aprobaciones de una malla
     * GET /api/mallas/aprobaciones/estado/{idMalla}
     */
    @GetMapping("/estado/{idMalla}")
    public ResponseEntity<?> obtenerEstadoAprobaciones(@PathVariable Long idMalla) {
        try {
            Map<String, Object> estado = new HashMap<>();
            estado.put("malla_id", idMalla);
            estado.put("aprobada_jefe", false);
            estado.put("aprobada_rrhh", false);
            estado.put("puede_publicar", false);
            estado.put("mensaje", "Esperando aprobaciones");

            return ResponseEntity.ok(estado);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Rechaza una malla (Jefe Inmediato o Recursos Humanos)
     * POST /api/mallas/aprobaciones/rechazar/{idMalla}
     */
    @PostMapping("/rechazar/{idMalla}")
    public ResponseEntity<?> rechazarMalla(
            @PathVariable Long idMalla,
            @RequestBody Map<String, Object> request) {
        
        try {
            Long idUsuario = ((Number) request.get("idUsuario")).longValue();
            String motivo = (String) request.get("motivo");
            String rol = (String) request.get("rol");

            Map<String, Object> respuesta = new HashMap<>();
            respuesta.put("mensaje", "Malla #" + idMalla + " rechazada por " + rol);
            respuesta.put("malla_id", idMalla);
            respuesta.put("estado", "RECHAZADA");
            respuesta.put("motivo_rechazo", motivo);
            respuesta.put("fecha_rechazo", java.time.LocalDateTime.now());
            respuesta.put("siguiente_paso", "Operaciones Clínicas debe hacer ajustes y reenviar");

            return ResponseEntity.ok(respuesta);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }
}
