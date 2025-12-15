package com.sgturnos.service;

import com.sgturnos.model.AprobacionNovedad;
import com.sgturnos.model.Novedad;
import com.sgturnos.model.Usuario;
import com.sgturnos.repository.AprobacionNovedadRepository;
import com.sgturnos.repository.NovedadRepository;
import com.sgturnos.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Servicio para gestionar las aprobaciones de vacaciones con 3 niveles
 * Jefe Inmediato → Operaciones Clínicas → Recursos Humanos
 */
@Service
public class AprobacionVacacionesService {

    @Autowired
    private AprobacionNovedadRepository aprobacionRepository;

    @Autowired
    private NovedadRepository novedadRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private AjusteMallaVacacionesService ajusteMallaService;

    /**
     * Crea los 3 registros de aprobación pendientes cuando se solicita vacaciones
     */
    @Transactional
    public void crearAprobacionesPendientes(Novedad novedad, Long idJefeInmediato, Long idOperacionesClinicas, Long idRecursosHumanos) {
        Usuario jefeInmediato = usuarioRepository.findById(idJefeInmediato).orElse(null);
        Usuario operaciones = usuarioRepository.findById(idOperacionesClinicas).orElse(null);
        Usuario rrhh = usuarioRepository.findById(idRecursosHumanos).orElse(null);

        if (jefeInmediato != null) {
            AprobacionNovedad aprobJefe = new AprobacionNovedad(novedad, jefeInmediato, "JEFE_INMEDIATO");
            aprobacionRepository.save(aprobJefe);
        }

        if (operaciones != null) {
            AprobacionNovedad aprobOper = new AprobacionNovedad(novedad, operaciones, "OPERACIONES_CLINICAS");
            aprobacionRepository.save(aprobOper);
        }

        if (rrhh != null) {
            AprobacionNovedad aprobRrhh = new AprobacionNovedad(novedad, rrhh, "RECURSOS_HUMANOS");
            aprobacionRepository.save(aprobRrhh);
        }
    }

    /**
     * Procesa una aprobación individual y verifica si ya están las 3 aprobadas
     */
    @Transactional
    public Novedad aprobarNovedad(Long idNovedad, Long idAprobador, String tipoAprobador) {
        Novedad novedad = novedadRepository.findById(idNovedad).orElse(null);
        if (novedad == null) {
            return null;
        }

        Usuario aprobador = usuarioRepository.findById(idAprobador).orElse(null);
        if (aprobador == null) {
            return null;
        }

        // Buscar la aprobación correspondiente
        AprobacionNovedad aprobacion = aprobacionRepository
                .findByNovedadAndTipoAprobador(novedad, tipoAprobador)
                .orElse(null);

        if (aprobacion == null) {
            return null;
        }

        // Marcar como aprobada
        aprobacion.setEstadoAprobacion("APROBADA");
        aprobacion.setFechaAprobacion(LocalDateTime.now());
        aprobacionRepository.save(aprobacion);

        // Actualizar flags en novedad
        switch (tipoAprobador) {
            case "JEFE_INMEDIATO":
                novedad.setAprobacionJefe(true);
                break;
            case "OPERACIONES_CLINICAS":
                novedad.setAprobacionOperaciones(true);
                break;
            case "RECURSOS_HUMANOS":
                novedad.setAprobacionRrhh(true);
                break;
        }

        // Verificar si ya tiene las 3 aprobaciones
        long aprobadas = aprobacionRepository.countByNovedadAndEstadoAprobacion(novedad, "APROBADA");
        if (aprobadas == 3) {
            novedad.setEstado("APROBADA");
            novedad.setFechaAprobacion(LocalDateTime.now());
            
            // Aplicar vacaciones a la malla automáticamente
            try {
                String resultado = ajusteMallaService.aplicarVacacionesAMalla(idNovedad);
                System.out.println("Resultado ajuste malla: " + resultado);
            } catch (Exception e) {
                System.err.println("Error aplicando vacaciones a malla: " + e.getMessage());
                // No fallar la aprobación si hay error en el ajuste de malla
            }
        }

        return novedadRepository.save(novedad);
    }

    /**
     * Rechaza una novedad desde cualquier nivel de aprobación
     */
    @Transactional
    public Novedad rechazarNovedad(Long idNovedad, Long idAprobador, String tipoAprobador, String motivo) {
        Novedad novedad = novedadRepository.findById(idNovedad).orElse(null);
        if (novedad == null) {
            return null;
        }

        Usuario aprobador = usuarioRepository.findById(idAprobador).orElse(null);
        if (aprobador == null) {
            return null;
        }

        // Buscar la aprobación correspondiente
        AprobacionNovedad aprobacion = aprobacionRepository
                .findByNovedadAndTipoAprobador(novedad, tipoAprobador)
                .orElse(null);

        if (aprobacion == null) {
            return null;
        }

        // Marcar como rechazada
        aprobacion.setEstadoAprobacion("RECHAZADA");
        aprobacion.setMotivoRechazo(motivo);
        aprobacion.setFechaAprobacion(LocalDateTime.now());
        aprobacionRepository.save(aprobacion);

        // Rechazar toda la novedad
        novedad.setEstado("RECHAZADA");
        novedad.setMotivoRechazo(motivo);
        novedad.setFechaAprobacion(LocalDateTime.now());
        novedad.setUsuarioAdmin(aprobador);

        return novedadRepository.save(novedad);
    }

    /**
     * Obtiene las aprobaciones pendientes para un aprobador específico
     */
    public List<AprobacionNovedad> obtenerAprobacionesPendientesPorAprobador(Long idAprobador) {
        Usuario aprobador = usuarioRepository.findById(idAprobador).orElse(null);
        if (aprobador == null) {
            return List.of();
        }
        return aprobacionRepository.findByUsuarioAprobadorAndEstadoAprobacion(aprobador, "PENDIENTE");
    }

    /**
     * Obtiene todas las aprobaciones de una novedad específica
     */
    public List<AprobacionNovedad> obtenerAprobacionesPorNovedad(Long idNovedad) {
        Novedad novedad = novedadRepository.findById(idNovedad).orElse(null);
        if (novedad == null) {
            return List.of();
        }
        return aprobacionRepository.findByNovedad(novedad);
    }
}
