package com.sgturnos.controller;

import com.sgturnos.model.CambioTurno;
import com.sgturnos.model.Usuario;
import com.sgturnos.service.CambioTurnoService;
import com.sgturnos.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cambios-turno")
@CrossOrigin(origins = "http://localhost:5173")
public class CambioTurnoController {

    @Autowired
    private CambioTurnoService cambioTurnoService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    /**
     * Crear nueva solicitud de cambio de turno
     * POST /api/cambios-turno/crear
     * Body: { idUsuarioSolicitante, idUsuarioCompañero, fechaTurno, fechaTurnoCompañero, descripcion }
     */
    @PostMapping("/crear")
    public ResponseEntity<?> crearSolicitud(@RequestBody Map<String, Object> body) {
        try {
            Long idSolicitante = Long.valueOf(body.get("idUsuarioSolicitante").toString());
            Long idCompañero = Long.valueOf(body.get("idUsuarioCompañero").toString());
            String fechaTurnoStr = body.get("fechaTurno").toString();
            String fechaTurnoCompañeroStr = body.get("fechaTurnoCompañero").toString();
            String descripcion = body.get("descripcion").toString();

            Usuario solicitante = usuarioRepository.findById(idSolicitante)
                    .orElseThrow(() -> new RuntimeException("Usuario solicitante no encontrado"));
            Usuario compañero = usuarioRepository.findById(idCompañero)
                    .orElseThrow(() -> new RuntimeException("Usuario compañero no encontrado"));

            // Verificar que sean del mismo rol
            if (!solicitante.getRol().getIdRol().equals(compañero.getRol().getIdRol())) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Solo se pueden intercambiar turnos entre usuarios del mismo rol"
                ));
            }

            CambioTurno cambio = new CambioTurno();
            cambio.setUsuarioSolicitante(solicitante);
            cambio.setUsuarioCompañero(compañero);
            cambio.setFechaTurno(LocalDate.parse(fechaTurnoStr));
            cambio.setFechaTurnoCompañero(LocalDate.parse(fechaTurnoCompañeroStr));
            cambio.setDescripcion(descripcion);

            CambioTurno creado = cambioTurnoService.crearSolicitud(cambio);

            return ResponseEntity.ok(Map.of(
                    "mensaje", "Solicitud de cambio de turno creada. Pendiente de aprobación del compañero.",
                    "idCambio", creado.getIdCambio(),
                    "estado", creado.getEstado()
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtener solicitudes de un usuario
     * GET /api/cambios-turno/usuario/{idUsuario}
     */
    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<?> obtenerSolicitudesUsuario(@PathVariable Long idUsuario) {
        try {
            List<CambioTurno> solicitudes = cambioTurnoService.obtenerSolicitudesUsuario(idUsuario);
            return ResponseEntity.ok(solicitudes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtener solicitudes pendientes donde el usuario es el compañero
     * GET /api/cambios-turno/pendientes-compañero/{idUsuario}
     */
    @GetMapping("/pendientes-compañero/{idUsuario}")
    public ResponseEntity<?> obtenerPendientesCompañero(@PathVariable Long idUsuario) {
        try {
            List<CambioTurno> pendientes = cambioTurnoService.obtenerSolicitudesPendientesCompañero(idUsuario);
            return ResponseEntity.ok(pendientes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Aprobar solicitud por el compañero
     * POST /api/cambios-turno/aprobar-compañero/{idCambio}
     */
    @PostMapping("/aprobar-compañero/{idCambio}")
    public ResponseEntity<?> aprobarPorCompañero(@PathVariable Long idCambio) {
        try {
            CambioTurno aprobado = cambioTurnoService.aprobarPorCompañero(idCambio);
            
            if (aprobado == null) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "No se pudo aprobar la solicitud"
                ));
            }

            return ResponseEntity.ok(Map.of(
                    "mensaje", "Solicitud aprobada por compañero. Pendiente de aprobación administrativa.",
                    "idCambio", aprobado.getIdCambio(),
                    "estado", aprobado.getEstado()
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Rechazar solicitud por el compañero
     * POST /api/cambios-turno/rechazar-compañero/{idCambio}
     * Body: { motivo }
     */
    @PostMapping("/rechazar-compañero/{idCambio}")
    public ResponseEntity<?> rechazarPorCompañero(
            @PathVariable Long idCambio,
            @RequestBody Map<String, String> body) {
        try {
            String motivo = body.get("motivo");
            CambioTurno rechazado = cambioTurnoService.rechazarPorCompañero(idCambio, motivo);
            
            if (rechazado == null) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "No se pudo rechazar la solicitud"
                ));
            }

            return ResponseEntity.ok(Map.of(
                    "mensaje", "Solicitud rechazada por compañero",
                    "idCambio", rechazado.getIdCambio(),
                    "estado", rechazado.getEstado()
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Aprobar por Jefe Inmediato
     * POST /api/cambios-turno/aprobar-jefe/{idCambio}
     */
    @PostMapping("/aprobar-jefe/{idCambio}")
    public ResponseEntity<?> aprobarPorJefe(@PathVariable Long idCambio) {
        try {
            CambioTurno aprobado = cambioTurnoService.aprobarPorJefe(idCambio);
            
            if (aprobado == null) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "No se pudo aprobar la solicitud"
                ));
            }

            return ResponseEntity.ok(Map.of(
                    "mensaje", "Aprobado por Jefe Inmediato. Pendiente de Operaciones Clínicas.",
                    "idCambio", aprobado.getIdCambio(),
                    "aprobacionJefe", aprobado.getAprobacionJefe()
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Aprobar por Operaciones Clínicas
     * POST /api/cambios-turno/aprobar-operaciones/{idCambio}
     */
    @PostMapping("/aprobar-operaciones/{idCambio}")
    public ResponseEntity<?> aprobarPorOperaciones(@PathVariable Long idCambio) {
        try {
            CambioTurno aprobado = cambioTurnoService.aprobarPorOperaciones(idCambio);
            
            if (aprobado == null) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "No se pudo aprobar la solicitud"
                ));
            }

            return ResponseEntity.ok(Map.of(
                    "mensaje", "Aprobado por Operaciones Clínicas. Pendiente de RRHH.",
                    "idCambio", aprobado.getIdCambio(),
                    "aprobacionOperaciones", aprobado.getAprobacionOperaciones()
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Aprobar por Recursos Humanos (aprobación final)
     * POST /api/cambios-turno/aprobar-rrhh/{idCambio}
     */
    @PostMapping("/aprobar-rrhh/{idCambio}")
    public ResponseEntity<?> aprobarPorRrhh(@PathVariable Long idCambio) {
        try {
            CambioTurno aprobado = cambioTurnoService.aprobarPorRrhh(idCambio);
            
            if (aprobado == null) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "No se pudo aprobar la solicitud"
                ));
            }

            return ResponseEntity.ok(Map.of(
                    "mensaje", "Cambio de turno completamente aprobado. Pendiente de aplicar a la malla.",
                    "idCambio", aprobado.getIdCambio(),
                    "estado", aprobado.getEstado()
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Rechazar por administrador
     * POST /api/cambios-turno/rechazar-admin/{idCambio}
     * Body: { motivo, tipoAdmin }
     */
    @PostMapping("/rechazar-admin/{idCambio}")
    public ResponseEntity<?> rechazarPorAdmin(
            @PathVariable Long idCambio,
            @RequestBody Map<String, String> body) {
        try {
            String motivo = body.get("motivo");
            String tipoAdmin = body.getOrDefault("tipoAdmin", "Administrador");
            
            CambioTurno rechazado = cambioTurnoService.rechazarPorAdmin(idCambio, motivo, tipoAdmin);
            
            if (rechazado == null) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "No se pudo rechazar la solicitud"
                ));
            }

            return ResponseEntity.ok(Map.of(
                    "mensaje", "Solicitud rechazada por " + tipoAdmin,
                    "idCambio", rechazado.getIdCambio(),
                    "estado", rechazado.getEstado()
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtener pendientes según rol administrativo
     * GET /api/cambios-turno/pendientes-admin?rol={rol}
     */
    @GetMapping("/pendientes-admin")
    public ResponseEntity<?> obtenerPendientesAdmin(@RequestParam String rol) {
        try {
            List<CambioTurno> pendientes = cambioTurnoService.obtenerPendientesSegunRol(rol);
            return ResponseEntity.ok(pendientes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtener cambios aprobados pendientes de aplicar
     * GET /api/cambios-turno/pendientes-aplicar
     */
    @GetMapping("/pendientes-aplicar")
    public ResponseEntity<?> obtenerPendientesAplicar() {
        try {
            List<CambioTurno> pendientes = cambioTurnoService.obtenerAprobadosPendientesAplicar();
            return ResponseEntity.ok(pendientes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Marcar cambio como aplicado a la malla
     * POST /api/cambios-turno/marcar-aplicado/{idCambio}
     */
    @PostMapping("/marcar-aplicado/{idCambio}")
    public ResponseEntity<?> marcarComoAplicado(@PathVariable Long idCambio) {
        try {
            CambioTurno aplicado = cambioTurnoService.marcarComoAplicado(idCambio);
            
            if (aplicado == null) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "No se pudo marcar como aplicado"
                ));
            }

            return ResponseEntity.ok(Map.of(
                    "mensaje", "Cambio marcado como aplicado a la malla",
                    "idCambio", aplicado.getIdCambio()
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtener usuarios del mismo rol para intercambio
     * GET /api/cambios-turno/compañeros/{idUsuario}
     */
    @GetMapping("/compañeros/{idUsuario}")
    public ResponseEntity<?> obtenerCompañerosDisponibles(@PathVariable Long idUsuario) {
        try {
            Usuario usuario = usuarioRepository.findById(idUsuario)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
            String idRol = usuario.getRol().getIdRol();
            
            // Obtener todos los usuarios del mismo rol excepto el solicitante
            List<Usuario> compañeros = usuarioRepository.findAll().stream()
                    .filter(u -> u.getRol() != null && 
                                 u.getRol().getIdRol().equals(idRol) && 
                                 !u.getIdUsuario().equals(idUsuario))
                    .toList();

            return ResponseEntity.ok(compañeros);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtener detalle de un cambio
     * GET /api/cambios-turno/{idCambio}
     */
    @GetMapping("/{idCambio}")
    public ResponseEntity<?> obtenerDetalle(@PathVariable Long idCambio) {
        try {
            CambioTurno cambio = cambioTurnoService.obtenerPorId(idCambio);
            
            if (cambio == null) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(cambio);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
