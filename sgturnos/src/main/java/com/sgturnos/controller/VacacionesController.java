package com.sgturnos.controller;

import com.sgturnos.model.AprobacionNovedad;
import com.sgturnos.model.Novedad;
import com.sgturnos.repository.AprobacionNovedadRepository;
import com.sgturnos.service.AprobacionVacacionesService;
import com.sgturnos.service.NovedadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Controlador específico para solicitudes de vacaciones con múltiples aprobaciones
 */
@RestController
@RequestMapping("/api/vacaciones")
@CrossOrigin(origins = "http://localhost:5173")
public class VacacionesController {

    @Autowired
    private AprobacionVacacionesService aprobacionService;

    @Autowired
    private NovedadService novedadService;

    @Autowired
    private AprobacionNovedadRepository aprobacionRepository;

    /**
     * Crear aprobaciones pendientes para una solicitud de vacaciones
     * POST /api/vacaciones/crear-aprobaciones
     * Body: { idNovedad, idJefeInmediato, idOperacionesClinicas, idRecursosHumanos }
     */
    @PostMapping("/crear-aprobaciones")
    public ResponseEntity<?> crearAprobaciones(@RequestBody Map<String, Object> body) {
        try {
            Long idNovedad = Long.valueOf(body.get("idNovedad").toString());
            Long idJefeInmediato = Long.valueOf(body.get("idJefeInmediato").toString());
            Long idOperacionesClinicas = Long.valueOf(body.get("idOperacionesClinicas").toString());
            Long idRecursosHumanos = Long.valueOf(body.get("idRecursosHumanos").toString());

            Novedad novedad = novedadService.obtenerNovedadPorId(idNovedad);
            if (novedad == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Novedad no encontrada"));
            }

            aprobacionService.crearAprobacionesPendientes(
                novedad,
                idJefeInmediato,
                idOperacionesClinicas,
                idRecursosHumanos
            );

            return ResponseEntity.ok(Map.of(
                "mensaje", "Aprobaciones creadas exitosamente",
                "idNovedad", idNovedad
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtener aprobadores de una solicitud de vacaciones
     * GET /api/vacaciones/aprobaciones/{idNovedad}
     */
    @GetMapping("/aprobaciones/{idNovedad}")
    public ResponseEntity<?> obtenerAprobadores(@PathVariable Long idNovedad) {
        try {
            List<AprobacionNovedad> aprobaciones = aprobacionRepository.findByNovedad_IdNovedad(idNovedad);
            
            List<Map<String, Object>> resultado = aprobaciones.stream().map(a -> {
                Map<String, Object> map = new HashMap<>();
                map.put("idAprobacion", a.getIdAprobacion());
                map.put("tipoAprobador", a.getTipoAprobador());
                map.put("estadoAprobacion", a.getEstadoAprobacion());
                map.put("nombreAprobador", a.getUsuarioAprobador().getPrimerNombre() + " " + 
                        (a.getUsuarioAprobador().getPrimerApellido() != null ? a.getUsuarioAprobador().getPrimerApellido() : ""));
                map.put("correoAprobador", a.getUsuarioAprobador().getCorreo());
                map.put("motivoRechazo", a.getMotivoRechazo());
                map.put("fechaAprobacion", a.getFechaAprobacion());
                return map;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }    }
}