package com.sgturnos.controller;

import com.sgturnos.model.AlertaMalla;
import com.sgturnos.model.Usuario;
import com.sgturnos.service.AlertaMallaService;
import com.sgturnos.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alertas-malla")
@CrossOrigin(origins = "http://localhost:5173")
public class AlertaMallaController {
    
    @Autowired
    private AlertaMallaService alertaMallaService;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    /**
     * Obtener todas las alertas pendientes
     * GET /api/alertas-malla/pendientes
     */
    @GetMapping("/pendientes")
    public ResponseEntity<?> obtenerAlertasPendientes() {
        try {
            List<AlertaMalla> alertas = alertaMallaService.obtenerAlertasPendientes();
            return ResponseEntity.ok(alertas);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Contar alertas pendientes
     * GET /api/alertas-malla/contar
     */
    @GetMapping("/contar")
    public ResponseEntity<?> contarAlertasPendientes() {
        try {
            Long count = alertaMallaService.contarAlertasPendientes();
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Marcar alerta como procesada
     * POST /api/alertas-malla/{idAlerta}/procesar
     * Body: { idUsuario, observaciones }
     */
    @PostMapping("/{idAlerta}/procesar")
    public ResponseEntity<?> procesarAlerta(
            @PathVariable Long idAlerta,
            @RequestBody Map<String, Object> body) {
        try {
            Long idUsuario = Long.valueOf(body.get("idUsuario").toString());
            String observaciones = (String) body.get("observaciones");
            
            Usuario usuario = usuarioRepository.findById(idUsuario).orElse(null);
            if (usuario == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Usuario no encontrado"));
            }
            
            alertaMallaService.marcarComoProcessada(idAlerta, usuario, observaciones);
            
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Alerta procesada exitosamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Obtener alertas por mes/año
     * GET /api/alertas-malla/por-periodo?mes=1&anio=2025
     */
    @GetMapping("/por-periodo")
    public ResponseEntity<?> obtenerAlertasPorPeriodo(
            @RequestParam Integer mes,
            @RequestParam Integer anio) {
        try {
            List<AlertaMalla> alertas = alertaMallaService.obtenerAlertasPorMesAnio(mes, anio);
            return ResponseEntity.ok(alertas);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Marcar todas las alertas pendientes como vistas
     * POST /api/alertas-malla/marcar-visto
     */
    @PostMapping("/marcar-visto")
    public ResponseEntity<?> marcarTodasComoVistas() {
        try {
            alertaMallaService.marcarTodasComoVistas();
            return ResponseEntity.ok(Map.of("mensaje", "Alertas marcadas como vistas"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Marcar una alerta específica como vista
     * POST /api/alertas-malla/{idAlerta}/marcar-visto
     */
    @PostMapping("/{idAlerta}/marcar-visto")
    public ResponseEntity<?> marcarComoVista(@PathVariable Long idAlerta) {
        try {
            alertaMallaService.marcarComoVista(idAlerta);
            return ResponseEntity.ok(Map.of("mensaje", "Alerta marcada como vista"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
