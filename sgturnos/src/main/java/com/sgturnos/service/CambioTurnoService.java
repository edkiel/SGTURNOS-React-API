package com.sgturnos.service;

import com.sgturnos.model.CambioTurno;
import com.sgturnos.model.Usuario;
import com.sgturnos.repository.CambioTurnoRepository;
import com.sgturnos.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CambioTurnoService {

    @Autowired
    private CambioTurnoRepository cambioTurnoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    /**
     * Crear una nueva solicitud de cambio de turno
     */
    @Transactional
    public CambioTurno crearSolicitud(CambioTurno cambioTurno) {
        cambioTurno.setEstado("PENDIENTE_COMPAÑERO");
        cambioTurno.setFechaSolicitud(LocalDateTime.now());
        return cambioTurnoRepository.save(cambioTurno);
    }

    /**
     * Obtener todas las solicitudes de un usuario
     */
    public List<CambioTurno> obtenerSolicitudesUsuario(Long idUsuario) {
        return cambioTurnoRepository.findByUsuario(idUsuario);
    }

    /**
     * Obtener solicitudes pendientes donde el usuario es el compañero
     */
    public List<CambioTurno> obtenerSolicitudesPendientesCompañero(Long idUsuario) {
        return cambioTurnoRepository.findPendientesParaCompañero(idUsuario);
    }

    /**
     * Aprobación del compañero
     */
    @Transactional
    public CambioTurno aprobarPorCompañero(Long idCambio) {
        Optional<CambioTurno> optional = cambioTurnoRepository.findById(idCambio);
        if (!optional.isPresent()) {
            return null;
        }

        CambioTurno cambio = optional.get();
        if (!"PENDIENTE_COMPAÑERO".equals(cambio.getEstado())) {
            return null; // Solo se puede aprobar si está en estado pendiente del compañero
        }

        cambio.setAprobacionCompañero(true);
        cambio.setFechaRespuestaCompañero(LocalDateTime.now());
        cambio.setEstado("PENDIENTE_ADMIN"); // Ahora pasa a aprobación administrativa
        return cambioTurnoRepository.save(cambio);
    }

    /**
     * Rechazo del compañero
     */
    @Transactional
    public CambioTurno rechazarPorCompañero(Long idCambio, String motivo) {
        Optional<CambioTurno> optional = cambioTurnoRepository.findById(idCambio);
        if (!optional.isPresent()) {
            return null;
        }

        CambioTurno cambio = optional.get();
        cambio.setAprobacionCompañero(false);
        cambio.setFechaRespuestaCompañero(LocalDateTime.now());
        cambio.setEstado("RECHAZADA");
        cambio.setMotivoRechazo("Rechazado por compañero: " + motivo);
        return cambioTurnoRepository.save(cambio);
    }

    /**
     * Aprobación por Jefe Inmediato
     */
    @Transactional
    public CambioTurno aprobarPorJefe(Long idCambio) {
        Optional<CambioTurno> optional = cambioTurnoRepository.findById(idCambio);
        if (!optional.isPresent()) {
            return null;
        }

        CambioTurno cambio = optional.get();
        if (!"PENDIENTE_ADMIN".equals(cambio.getEstado()) || !cambio.getAprobacionCompañero()) {
            return null;
        }

        cambio.setAprobacionJefe(true);
        return cambioTurnoRepository.save(cambio);
    }

    /**
     * Aprobación por Operaciones Clínicas
     */
    @Transactional
    public CambioTurno aprobarPorOperaciones(Long idCambio) {
        Optional<CambioTurno> optional = cambioTurnoRepository.findById(idCambio);
        if (!optional.isPresent()) {
            return null;
        }

        CambioTurno cambio = optional.get();
        if (!"PENDIENTE_ADMIN".equals(cambio.getEstado()) || !cambio.getAprobacionJefe()) {
            return null;
        }

        cambio.setAprobacionOperaciones(true);
        return cambioTurnoRepository.save(cambio);
    }

    /**
     * Aprobación por Recursos Humanos (última aprobación)
     */
    @Transactional
    public CambioTurno aprobarPorRrhh(Long idCambio) {
        Optional<CambioTurno> optional = cambioTurnoRepository.findById(idCambio);
        if (!optional.isPresent()) {
            return null;
        }

        CambioTurno cambio = optional.get();
        if (!"PENDIENTE_ADMIN".equals(cambio.getEstado()) || !cambio.getAprobacionOperaciones()) {
            return null;
        }

        cambio.setAprobacionRrhh(true);
        cambio.setEstado("APROBADA");
        cambio.setFechaAprobacionFinal(LocalDateTime.now());
        return cambioTurnoRepository.save(cambio);
    }

    /**
     * Rechazar por administrador
     */
    @Transactional
    public CambioTurno rechazarPorAdmin(Long idCambio, String motivo, String tipoAdmin) {
        Optional<CambioTurno> optional = cambioTurnoRepository.findById(idCambio);
        if (!optional.isPresent()) {
            return null;
        }

        CambioTurno cambio = optional.get();
        cambio.setEstado("RECHAZADA");
        cambio.setMotivoRechazo("Rechazado por " + tipoAdmin + ": " + motivo);
        return cambioTurnoRepository.save(cambio);
    }

    /**
     * Obtener solicitudes pendientes según rol administrativo
     */
    public List<CambioTurno> obtenerPendientesSegunRol(String rol) {
        String rolLower = rol.toLowerCase();
        
        if (rolLower.contains("jefe")) {
            return cambioTurnoRepository.findPendientesJefe();
        } else if (rolLower.contains("operaciones") || rolLower.contains("clinica")) {
            return cambioTurnoRepository.findPendientesOperaciones();
        } else if (rolLower.contains("rrhh") || rolLower.contains("recursos") || rolLower.contains("humanos")) {
            return cambioTurnoRepository.findPendientesRrhh();
        }
        
        return cambioTurnoRepository.findPendientesAdmin();
    }

    /**
     * Marcar cambio como aplicado a la malla
     */
    @Transactional
    public CambioTurno marcarComoAplicado(Long idCambio) {
        Optional<CambioTurno> optional = cambioTurnoRepository.findById(idCambio);
        if (!optional.isPresent()) {
            return null;
        }

        CambioTurno cambio = optional.get();
        cambio.setAplicadaAMalla(true);
        return cambioTurnoRepository.save(cambio);
    }

    /**
     * Obtener cambios aprobados pendientes de aplicar a la malla
     */
    public List<CambioTurno> obtenerAprobadosPendientesAplicar() {
        return cambioTurnoRepository.findAprobadosPendientesAplicar();
    }

    /**
     * Obtener una solicitud por ID
     */
    public CambioTurno obtenerPorId(Long idCambio) {
        return cambioTurnoRepository.findById(idCambio).orElse(null);
    }
}
