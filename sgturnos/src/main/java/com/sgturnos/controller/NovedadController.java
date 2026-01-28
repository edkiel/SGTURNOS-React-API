package com.sgturnos.controller;

import com.sgturnos.dto.NovedadDTO;
import com.sgturnos.dto.NovedadResponseDTO;
import com.sgturnos.model.Novedad;
import com.sgturnos.model.Usuario;
import com.sgturnos.model.TipoNovedad;
import com.sgturnos.service.NovedadService;
import com.sgturnos.repository.UsuarioRepository;
import com.sgturnos.repository.TipoNovedadRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Controlador para gestionar novedades (vacaciones, incapacidades, permisos, etc.)
 */
@RestController
@RequestMapping("/api/novedades")
@CrossOrigin(origins = "http://localhost:5173")
public class NovedadController {

    @Autowired
    private NovedadService novedadService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private TipoNovedadRepository tipoNovedadRepository;

    @Value("${soporte.storage.path:uploads/soportes}")
    private String soporteStoragePath;

    /**
     * Crear una nueva novedad
     * POST /api/novedades/crear
     * Body: { idUsuario, idTipo, fechaInicio, fechaFin, descripcion }
     */
    @PostMapping("/crear")
    public ResponseEntity<?> crearNovedad(@RequestBody NovedadDTO novedadDTO) {
        try {
            Usuario usuario = usuarioRepository.findById(novedadDTO.getIdUsuario()).orElse(null);
            if (usuario == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Usuario no encontrado"));
            }

            TipoNovedad tipo = tipoNovedadRepository.findById(novedadDTO.getIdTipo()).orElse(null);
            if (tipo == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Tipo de novedad no encontrado"));
            }

            Novedad novedad = new Novedad();
            novedad.setUsuario(usuario);
            novedad.setTipo(tipo);
            novedad.setFechaInicio(novedadDTO.getFechaInicio());
            novedad.setFechaFin(novedadDTO.getFechaFin());
            novedad.setDescripcion(novedadDTO.getDescripcion());

            Novedad creada = novedadService.crearNovedad(novedad);

            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Novedad creada exitosamente");
            response.put("idNovedad", creada.getIdNovedad());
            response.put("estado", creada.getEstado());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtener todas las novedades pendientes (para admin)
     * GET /api/novedades/pendientes
     */
    @GetMapping("/pendientes")
    public ResponseEntity<?> obtenerNovedadesPendientes() {
        try {
            List<Novedad> novedades = novedadService.obtenerNovedadesPendientes();
            List<NovedadResponseDTO> dtos = convertirListaNovedadesADTO(novedades);
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtener novedades de un usuario específico
     * GET /api/novedades/usuario/{idUsuario}
     */
    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<?> obtenerNovedadesPorUsuario(@PathVariable Long idUsuario) {
        try {
            List<Novedad> novedades = novedadService.obtenerNovedadesPorUsuario(idUsuario);
            List<NovedadResponseDTO> dtos = convertirListaNovedadesADTO(novedades);
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Obtener todas las novedades relacionadas con un usuario
     * Incluye novedades propias + cambios de turno donde es compañero
     * GET /api/novedades/usuario/{idUsuario}/todas
     */
    @GetMapping("/usuario/{idUsuario}/todas")
    public ResponseEntity<?> obtenerTodasNovedadesRelacionadas(@PathVariable Long idUsuario) {
        try {
            List<Novedad> novedades = novedadService.obtenerTodasNovedadesRelacionadas(idUsuario);
            List<NovedadResponseDTO> dtos = convertirListaNovedadesADTO(novedades);
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Aprobar una novedad
     * POST /api/novedades/aprobar/{idNovedad}
     * Body: { idUsuarioAdmin }
     */
    @PostMapping("/aprobar/{idNovedad}")
    public ResponseEntity<?> aprobarNovedad(
            @PathVariable Long idNovedad,
            @RequestBody Map<String, Long> body) {
        try {
            Long idUsuarioAdmin = body.get("idUsuarioAdmin");

            Novedad aprobada = novedadService.aprobarNovedad(idNovedad, idUsuarioAdmin);
            if (aprobada == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "No se pudo aprobar la novedad"));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Novedad aprobada exitosamente");
            response.put("idNovedad", aprobada.getIdNovedad());
            response.put("estado", aprobada.getEstado());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Rechazar una novedad
     * POST /api/novedades/rechazar/{idNovedad}
     * Body: { idUsuarioAdmin, motivo }
     */
    @PostMapping("/rechazar/{idNovedad}")
    public ResponseEntity<?> rechazarNovedad(
            @PathVariable Long idNovedad,
            @RequestBody Map<String, Object> body) {
        try {
            Long idUsuarioAdmin = Long.valueOf(body.get("idUsuarioAdmin").toString());
            String motivo = (String) body.get("motivo");

            Novedad rechazada = novedadService.rechazarNovedad(idNovedad, idUsuarioAdmin, motivo);
            if (rechazada == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "No se pudo rechazar la novedad"));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Novedad rechazada exitosamente");
            response.put("idNovedad", rechazada.getIdNovedad());
            response.put("estado", rechazada.getEstado());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtener una novedad específica
     * GET /api/novedades/{idNovedad}
     */
    @GetMapping("/{idNovedad}")
    public ResponseEntity<?> obtenerNovedad(@PathVariable Long idNovedad) {
        try {
            Novedad novedad = novedadService.obtenerNovedadPorId(idNovedad);
            if (novedad == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(novedad);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtener todas las novedades
     * GET /api/novedades/todas
     */
    @GetMapping("/todas")
    public ResponseEntity<?> obtenerTodasLasNovedades() {
        try {
            List<Novedad> novedades = novedadService.obtenerTodasLasNovedades();
            List<NovedadResponseDTO> dtos = convertirListaNovedadesADTO(novedades);
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtener tipos de novedades disponibles
     * GET /api/novedades/tipos/disponibles
     */
    @GetMapping("/tipos/disponibles")
    public ResponseEntity<?> obtenerTiposDisponibles() {
        try {
            List<TipoNovedad> tipos = tipoNovedadRepository.findAll();
            return ResponseEntity.ok(tipos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtener novedades aprobadas de un usuario
     * GET /api/novedades/aprobadas/{idUsuario}
     */
    @GetMapping("/aprobadas/{idUsuario}")
    public ResponseEntity<?> obtenerNovedadesAprobadas(@PathVariable Long idUsuario) {
        try {
            List<Novedad> novedades = novedadService.obtenerNovedadesAprobadas(idUsuario);
            return ResponseEntity.ok(novedades);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Cargar soporte en PDF para una novedad (multipart/form-data)
     */
    @PostMapping(value = "/{idNovedad}/soporte", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> subirSoporte(
            @PathVariable Long idNovedad,
            @RequestParam("file") MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "El archivo es requerido"));
            }

            // Validar PDF por contenido y extensión
            String original = file.getOriginalFilename() != null ? file.getOriginalFilename() : "soporte.pdf";
            if (!original.toLowerCase().endsWith(".pdf")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Solo se permiten archivos PDF"));
            }

            Novedad novedad = novedadService.obtenerNovedadPorId(idNovedad);
            if (novedad == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Novedad no encontrada"));
            }

            Path baseDir = resolveSoporteBasePath();
            Path uploadDir = baseDir.resolve("novedad_" + idNovedad);
            Files.createDirectories(uploadDir);

            Path target = uploadDir.resolve("soporte.pdf");
            file.transferTo(target.toFile());

            // Guardar la ruta en la novedad
            novedadService.actualizarSoporte(idNovedad, target.toAbsolutePath().toString());

            return ResponseEntity.ok(Map.of(
                    "mensaje", "Soporte subido correctamente",
                    "path", target.toString()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Descargar/ver soporte PDF asociado a una novedad
     */
    @GetMapping(value = "/{idNovedad}/soporte")
    public ResponseEntity<?> descargarSoporte(@PathVariable Long idNovedad) {
        try {
            Novedad novedad = novedadService.obtenerNovedadPorId(idNovedad);
            if (novedad == null || novedad.getSoportePath() == null) {
                return ResponseEntity.notFound().build();
            }

            Path path = Paths.get(novedad.getSoportePath());
            if (!Files.exists(path)) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new UrlResource(path.toUri());
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header("Content-Disposition", "inline; filename=\"soporte_" + idNovedad + ".pdf\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Resuelve la ruta base para almacenar soportes, usando soporte.storage.path o la raíz del proyecto.
     */
    private Path resolveSoporteBasePath() {
        Path base = Paths.get(soporteStoragePath);
        if (!base.isAbsolute()) {
            base = Paths.get(System.getProperty("user.dir")).resolve(base);
        }
        return base.normalize().toAbsolutePath();
    }

    // ========== ENDPOINTS PARA APROBACIÓN POR NIVELES ==========

    /**
     * Aprobar novedad por Jefe Inmediato/Directo
     * POST /api/novedades/aprobar-jefe/{idNovedad}
     * Body: { idUsuarioJefe }
     */
    @PostMapping("/aprobar-jefe/{idNovedad}")
    public ResponseEntity<?> aprobarPorJefe(
            @PathVariable Long idNovedad,
            @RequestBody Map<String, Long> body) {
        try {
            Long idUsuarioJefe = body.get("idUsuarioJefe");
            Novedad aprobada = novedadService.aprobarPorJefe(idNovedad, idUsuarioJefe);
            
            if (aprobada == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "No se pudo aprobar la novedad"));
            }

            return ResponseEntity.ok(Map.of(
                "mensaje", "Novedad aprobada por Jefe Inmediato",
                "idNovedad", aprobada.getIdNovedad(),
                "aprobacionJefe", aprobada.getAprobacionJefe()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Aprobar novedad por Operaciones Clínicas
     * POST /api/novedades/aprobar-operaciones/{idNovedad}
     * Body: { idUsuarioOperaciones }
     */
    @PostMapping("/aprobar-operaciones/{idNovedad}")
    public ResponseEntity<?> aprobarPorOperaciones(
            @PathVariable Long idNovedad,
            @RequestBody Map<String, Long> body) {
        try {
            Long idUsuarioOperaciones = body.get("idUsuarioOperaciones");
            Novedad aprobada = novedadService.aprobarPorOperaciones(idNovedad, idUsuarioOperaciones);
            
            if (aprobada == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "No se pudo aprobar la novedad"));
            }

            return ResponseEntity.ok(Map.of(
                "mensaje", "Novedad aprobada por Operaciones Clínicas - Alerta de malla generada",
                "idNovedad", aprobada.getIdNovedad(),
                "aprobacionOperaciones", aprobada.getAprobacionOperaciones()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Aprobar novedad por Recursos Humanos
     * POST /api/novedades/aprobar-rrhh/{idNovedad}
     * Body: { idUsuarioRRHH }
     */
    @PostMapping("/aprobar-rrhh/{idNovedad}")
    public ResponseEntity<?> aprobarPorRRHH(
            @PathVariable Long idNovedad,
            @RequestBody Map<String, Long> body) {
        try {
            Long idUsuarioRRHH = body.get("idUsuarioRRHH");
            Novedad aprobada = novedadService.aprobarPorRRHH(idNovedad, idUsuarioRRHH);
            
            if (aprobada == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "No se pudo aprobar la novedad"));
            }

            return ResponseEntity.ok(Map.of(
                "mensaje", "Novedad aprobada por RRHH - Proceso completado",
                "idNovedad", aprobada.getIdNovedad(),
                "estado", aprobada.getEstado(),
                "aprobacionRrhh", aprobada.getAprobacionRrhh()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Rechazar novedad en cualquier nivel
     * POST /api/novedades/rechazar-nivel/{idNovedad}
     * Body: { idUsuario, motivo, nivel }
     */
    @PostMapping("/rechazar-nivel/{idNovedad}")
    public ResponseEntity<?> rechazarEnNivel(
            @PathVariable Long idNovedad,
            @RequestBody Map<String, Object> body) {
        try {
            Long idUsuario = Long.valueOf(body.get("idUsuario").toString());
            String motivo = (String) body.get("motivo");
            String nivel = (String) body.get("nivel");

            Novedad rechazada = novedadService.rechazarEnNivel(idNovedad, idUsuario, motivo, nivel);
            
            if (rechazada == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "No se pudo rechazar la novedad"));
            }

            return ResponseEntity.ok(Map.of(
                "mensaje", "Novedad rechazada por " + nivel,
                "idNovedad", rechazada.getIdNovedad(),
                "estado", rechazada.getEstado()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtener novedades pendientes de aprobación por Jefe
     * GET /api/novedades/pendientes-jefe
     */
    @GetMapping("/pendientes-jefe")
    public ResponseEntity<?> obtenerPendientesJefe() {
        try {
            List<Novedad> novedades = novedadService.obtenerNovedadesPendientesJefe();
            List<NovedadResponseDTO> dtos = convertirListaNovedadesADTO(novedades);
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtener novedades pendientes de aprobación por Operaciones
     * GET /api/novedades/pendientes-operaciones
     */
    @GetMapping("/pendientes-operaciones")
    public ResponseEntity<?> obtenerPendientesOperaciones() {
        try {
            List<Novedad> novedades = novedadService.obtenerNovedadesPendientesOperaciones();
            List<NovedadResponseDTO> dtos = convertirListaNovedadesADTO(novedades);
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtener novedades pendientes de aprobación por RRHH
     * GET /api/novedades/pendientes-rrhh
     */
    @GetMapping("/pendientes-rrhh")
    public ResponseEntity<?> obtenerPendientesRRHH() {
        try {
            List<Novedad> novedades = novedadService.obtenerNovedadesPendientesRRHH();
            List<NovedadResponseDTO> dtos = convertirListaNovedadesADTO(novedades);
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Contar novedades pendientes para Jefe Inmediato
     * GET /api/novedades/contar-pendientes-jefe
     */
    @GetMapping("/contar-pendientes-jefe")
    public ResponseEntity<?> contarPendientesJefe() {
        try {
            List<Novedad> novedades = novedadService.obtenerNovedadesPendientesJefe();
            return ResponseEntity.ok(Map.of("count", novedades.size()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Contar novedades pendientes para Operaciones Clínicas
     * GET /api/novedades/contar-pendientes-operaciones
     */
    @GetMapping("/contar-pendientes-operaciones")
    public ResponseEntity<?> contarPendientesOperaciones() {
        try {
            List<Novedad> novedades = novedadService.obtenerNovedadesPendientesOperaciones();
            return ResponseEntity.ok(Map.of("count", novedades.size()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Contar novedades pendientes para RRHH
     * GET /api/novedades/contar-pendientes-rrhh
     */
    @GetMapping("/contar-pendientes-rrhh")
    public ResponseEntity<?> contarPendientesRRHH() {
        try {
            List<Novedad> novedades = novedadService.obtenerNovedadesPendientesRRHH();
            return ResponseEntity.ok(Map.of("count", novedades.size()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Contar todas las novedades pendientes (para Admin)
     * GET /api/novedades/contar-pendientes-admin
     */
    @GetMapping("/contar-pendientes-admin")
    public ResponseEntity<?> contarPendientesAdmin() {
        try {
            // Admin ve todas las novedades que aún no están completamente aprobadas
            List<Novedad> novedadesJefe = novedadService.obtenerNovedadesPendientesJefe();
            List<Novedad> novedadesOperaciones = novedadService.obtenerNovedadesPendientesOperaciones();
            List<Novedad> novedadesRRHH = novedadService.obtenerNovedadesPendientesRRHH();
            
            // Usar un Set para evitar duplicados
            java.util.Set<Long> idsUnicos = new java.util.HashSet<>();
            novedadesJefe.forEach(n -> idsUnicos.add(n.getIdNovedad()));
            novedadesOperaciones.forEach(n -> idsUnicos.add(n.getIdNovedad()));
            novedadesRRHH.forEach(n -> idsUnicos.add(n.getIdNovedad()));
            
            return ResponseEntity.ok(Map.of("count", idsUnicos.size()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtener todas las novedades pendientes (para Admin)
     * GET /api/novedades/pendientes-admin
     */
    @GetMapping("/pendientes-admin")
    public ResponseEntity<?> obtenerPendientesAdmin() {
        try {
            // Admin ve todas las novedades que aún no están completamente aprobadas
            List<Novedad> novedadesJefe = novedadService.obtenerNovedadesPendientesJefe();
            List<Novedad> novedadesOperaciones = novedadService.obtenerNovedadesPendientesOperaciones();
            List<Novedad> novedadesRRHH = novedadService.obtenerNovedadesPendientesRRHH();
            
            // Usar un Map para evitar duplicados por ID
            java.util.Map<Long, Novedad> novedadesUnicas = new java.util.LinkedHashMap<>();
            novedadesJefe.forEach(n -> novedadesUnicas.put(n.getIdNovedad(), n));
            novedadesOperaciones.forEach(n -> novedadesUnicas.put(n.getIdNovedad(), n));
            novedadesRRHH.forEach(n -> novedadesUnicas.put(n.getIdNovedad(), n));
            
            List<NovedadResponseDTO> dtos = convertirListaNovedadesADTO(new java.util.ArrayList<>(novedadesUnicas.values()));
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Método helper: Convierte una entidad Novedad a NovedadResponseDTO
     * Esto evita problemas de serialización circular y proporciona solo los datos necesarios
     */
    private NovedadResponseDTO convertirNovedadADTO(Novedad novedad) {
        if (novedad == null) {
            return null;
        }

        NovedadResponseDTO dto = new NovedadResponseDTO();
        dto.setIdNovedad(novedad.getIdNovedad());
        dto.setIdUsuario(novedad.getUsuario() != null ? novedad.getUsuario().getIdUsuario() : null);
        dto.setUsuarioNombre(novedad.getUsuario() != null ? 
            novedad.getUsuario().getPrimerNombre() + " " + novedad.getUsuario().getPrimerApellido() : 
            "");
        dto.setIdTipo(novedad.getTipo() != null ? novedad.getTipo().getIdTipo() : null);
        
        // Crear el DTO del tipo con la información esencial
        if (novedad.getTipo() != null) {
            NovedadResponseDTO.TipoNovedadDTO tipoDTO = new NovedadResponseDTO.TipoNovedadDTO();
            tipoDTO.setIdTipo(novedad.getTipo().getIdTipo());
            tipoDTO.setNombre(novedad.getTipo().getNombre());
            tipoDTO.setDescripcion(novedad.getTipo().getDescripcion());
            tipoDTO.setRequiereFechas(novedad.getTipo().getRequiereFechas());
            dto.setTipo(tipoDTO);
        }
        
        dto.setFechaInicio(novedad.getFechaInicio());
        dto.setFechaFin(novedad.getFechaFin());
        dto.setDescripcion(novedad.getDescripcion());
        dto.setEstado(novedad.getEstado());
        dto.setMotivoRechazo(novedad.getMotivoRechazo());
        dto.setSoportePath(novedad.getSoportePath());
        dto.setFechaSolicitud(novedad.getFechaSolicitud());
        dto.setFechaAprobacion(novedad.getFechaAprobacion());
        dto.setAprobacionJefe(novedad.getAprobacionJefe());
        dto.setAprobacionOperaciones(novedad.getAprobacionOperaciones());
        dto.setAprobacionRrhh(novedad.getAprobacionRrhh());
        dto.setAplicadaAMalla(novedad.getAplicadaAMalla());
        
        return dto;
    }

    /**
     * Método helper: Convierte una lista de Novedad a lista de NovedadResponseDTO
     */
    private List<NovedadResponseDTO> convertirListaNovedadesADTO(List<Novedad> novedades) {
        List<NovedadResponseDTO> dtos = new ArrayList<>();
        if (novedades != null) {
            for (Novedad novedad : novedades) {
                dtos.add(convertirNovedadADTO(novedad));
            }
        }
        return dtos;
    }
}

