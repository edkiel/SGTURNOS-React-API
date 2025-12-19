package com.sgturnos.controller;

import com.sgturnos.model.AprobacionNovedad;
import com.sgturnos.model.Novedad;
import com.sgturnos.service.AprobacionVacacionesService;
import com.sgturnos.service.NovedadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controlador para gestionar las aprobaciones de vacaciones
 * Maneja el flujo de 3 aprobaciones: Jefe, Operaciones Clínicas, RRHH
 */
@RestController
@RequestMapping("/api/aprobaciones")
@CrossOrigin(origins = "http://localhost:5173")
public class AprobacionVacacionesController {

    @Autowired
    private AprobacionVacacionesService aprobacionService;

    @Autowired
    private NovedadService novedadService;

    /**
     * Crear aprobaciones pendientes para permisos
     * POST /api/aprobaciones/crear-permisos
     * Body: { idNovedad, idJefeInmediato, idOperacionesClinicas, idRecursosHumanos }
     */
    @PostMapping("/crear-permisos")
    public ResponseEntity<?> crearAprobacionesPermisos(@RequestBody Map<String, Object> body) {
        try {
            Long idNovedad = Long.valueOf(body.get("idNovedad").toString());
            Long idJefeInmediato = Long.valueOf(body.get("idJefeInmediato").toString());
            Long idOperacionesClinicas = Long.valueOf(body.get("idOperacionesClinicas").toString());
            Long idRecursosHumanos = Long.valueOf(body.get("idRecursosHumanos").toString());

            Novedad novedad = novedadService.obtenerNovedadPorId(idNovedad);
            if (novedad == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Novedad no encontrada"));
            }

            aprobacionService.crearAprobacionesPendientes(novedad, idJefeInmediato, idOperacionesClinicas, idRecursosHumanos);

            return ResponseEntity.ok(Map.of(
                "mensaje", "Aprobaciones de permisos creadas exitosamente",
                "idNovedad", idNovedad
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Aprobar una novedad desde un rol específico
     * POST /api/aprobaciones/aprobar
     * Body: { idNovedad, idAprobador, tipoAprobador }
     */
    @PostMapping("/aprobar")
    public ResponseEntity<?> aprobar(@RequestBody Map<String, Object> body) {
        try {
            Long idNovedad = Long.valueOf(body.get("idNovedad").toString());
            Long idAprobador = Long.valueOf(body.get("idAprobador").toString());
            String tipoAprobador = (String) body.get("tipoAprobador");

            Novedad novedad = aprobacionService.aprobarNovedad(idNovedad, idAprobador, tipoAprobador);
            if (novedad == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "No se pudo aprobar"));
            }

            return ResponseEntity.ok(Map.of(
                "mensaje", "Aprobación registrada exitosamente",
                "novedad", novedad
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Rechazar una novedad desde un rol específico
     * POST /api/aprobaciones/rechazar
     * Body: { idNovedad, idAprobador, tipoAprobador, motivo }
     */
    @PostMapping("/rechazar")
    public ResponseEntity<?> rechazar(@RequestBody Map<String, Object> body) {
        try {
            Long idNovedad = Long.valueOf(body.get("idNovedad").toString());
            Long idAprobador = Long.valueOf(body.get("idAprobador").toString());
            String tipoAprobador = (String) body.get("tipoAprobador");
            String motivo = (String) body.get("motivo");

            Novedad novedad = aprobacionService.rechazarNovedad(idNovedad, idAprobador, tipoAprobador, motivo);
            if (novedad == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "No se pudo rechazar"));
            }

            return ResponseEntity.ok(Map.of(
                "mensaje", "Novedad rechazada exitosamente",
                "novedad", novedad
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtener aprobaciones pendientes para un aprobador
     * GET /api/aprobaciones/pendientes/{idAprobador}
     */
    @GetMapping("/pendientes/{idAprobador}")
    public ResponseEntity<?> obtenerPendientes(@PathVariable Long idAprobador) {
        try {
            List<AprobacionNovedad> aprobaciones = aprobacionService.obtenerAprobacionesPendientesPorAprobador(idAprobador);
            return ResponseEntity.ok(aprobaciones);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtener todas las aprobaciones de una novedad
     * GET /api/aprobaciones/novedad/{idNovedad}
     */
    @GetMapping("/novedad/{idNovedad}")
    public ResponseEntity<?> obtenerPorNovedad(@PathVariable Long idNovedad) {
        try {
            List<AprobacionNovedad> aprobaciones = aprobacionService.obtenerAprobacionesPorNovedad(idNovedad);
            return ResponseEntity.ok(aprobaciones);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
