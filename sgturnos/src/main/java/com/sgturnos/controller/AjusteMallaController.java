package com.sgturnos.controller;

import com.sgturnos.model.Novedad;
import com.sgturnos.service.AjusteMallaVacacionesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controlador para gestionar el ajuste de mallas cuando se aprueban vacaciones
 */
@RestController
@RequestMapping("/api/mallas/ajustes")
@CrossOrigin(origins = "http://localhost:5173")
public class AjusteMallaController {

    @Autowired
    private AjusteMallaVacacionesService ajusteMallaService;

    /**
     * Aplica una vacación aprobada a la malla
     * POST /api/mallas/ajustes/aplicar-vacacion/{idNovedad}
     */
    @PostMapping("/aplicar-vacacion/{idNovedad}")
    public ResponseEntity<?> aplicarVacacion(@PathVariable Long idNovedad) {
        try {
            String resultado = ajusteMallaService.aplicarVacacionesAMalla(idNovedad);
            return ResponseEntity.ok(Map.of("mensaje", resultado));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtiene vacaciones pendientes de aplicar a la malla
     * GET /api/mallas/ajustes/vacaciones-pendientes
     */
    @GetMapping("/vacaciones-pendientes")
    public ResponseEntity<?> obtenerVacacionesPendientes() {
        try {
            List<Novedad> pendientes = ajusteMallaService.obtenerVacacionesPendientesDeAplicar();
            return ResponseEntity.ok(pendientes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
