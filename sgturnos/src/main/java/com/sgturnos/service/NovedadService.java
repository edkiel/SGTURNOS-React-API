package com.sgturnos.service;

import com.sgturnos.model.Novedad;
import com.sgturnos.model.Usuario;
import com.sgturnos.repository.NovedadRepository;
import com.sgturnos.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.time.LocalDateTime;

/**
 * Servicio para gestionar novedades
 */
@Service
public class NovedadService {

    @Autowired
    private NovedadRepository novedadRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private AlertaMallaService alertaMallaService;

    /**
     * Crea una nueva novedad
     */
    public Novedad crearNovedad(Novedad novedad) {
        novedad.setEstado("PENDIENTE");
        novedad.setFechaSolicitud(LocalDateTime.now());
        return novedadRepository.save(novedad);
    }

    /**
     * Obtiene todas las novedades de un usuario
     */
    public List<Novedad> obtenerNovedadesPorUsuario(Long idUsuario) {
        Usuario usuario = usuarioRepository.findById(idUsuario).orElse(null);
        if (usuario == null) {
            return List.of();
        }
        return novedadRepository.findByUsuario(usuario);
    }

    /**
     * Obtiene todas las novedades pendientes de aprobación
     */
    public List<Novedad> obtenerNovedadesPendientes() {
        return novedadRepository.findByEstadoOrderByFechaSolicitudAsc("PENDIENTE");
    }

    /**
     * Aprueba una novedad
     */
    public Novedad aprobarNovedad(Long idNovedad, Long idUsuarioAdmin) {
        Novedad novedad = novedadRepository.findById(idNovedad).orElse(null);
        if (novedad == null) {
            return null;
        }

        Usuario admin = usuarioRepository.findById(idUsuarioAdmin).orElse(null);
        if (admin == null) {
            return null;
        }

        novedad.setEstado("APROBADA");
        novedad.setFechaAprobacion(LocalDateTime.now());
        novedad.setUsuarioAdmin(admin);

        Novedad novedadGuardada = novedadRepository.save(novedad);
        
        // Crear alerta de malla cuando se aprueba una novedad
        alertaMallaService.crearAlertaPorNovedad(novedadGuardada);

        return novedadGuardada;
    }

    /**
     * Rechaza una novedad
     */
    public Novedad rechazarNovedad(Long idNovedad, Long idUsuarioAdmin, String motivo) {
        Novedad novedad = novedadRepository.findById(idNovedad).orElse(null);
        if (novedad == null) {
            return null;
        }

        Usuario admin = usuarioRepository.findById(idUsuarioAdmin).orElse(null);
        if (admin == null) {
            return null;
        }

        novedad.setEstado("RECHAZADA");
        novedad.setFechaAprobacion(LocalDateTime.now());
        novedad.setUsuarioAdmin(admin);
        novedad.setMotivoRechazo(motivo);

        return novedadRepository.save(novedad);
    }

    /**
     * Obtiene una novedad por ID
     */
    public Novedad obtenerNovedadPorId(Long idNovedad) {
        return novedadRepository.findById(idNovedad).orElse(null);
    }

    /**
     * Obtiene todas las novedades
     */
    public List<Novedad> obtenerTodasLasNovedades() {
        return novedadRepository.findAll();
    }

    /**
     * Elimina una novedad
     */
    public void eliminarNovedad(Long idNovedad) {
        novedadRepository.deleteById(idNovedad);
    }

    /**
     * Obtiene novedades aprobadas de un usuario
     */
    public List<Novedad> obtenerNovedadesAprobadas(Long idUsuario) {
        Usuario usuario = usuarioRepository.findById(idUsuario).orElse(null);
        if (usuario == null) {
            return List.of();
        }
        return novedadRepository.findByUsuarioAndEstado(usuario, "APROBADA");
    }

    /**
     * Actualiza la ruta del soporte asociado a una novedad
     */
    public Novedad actualizarSoporte(Long idNovedad, String soportePath) {
        Novedad novedad = novedadRepository.findById(idNovedad).orElse(null);
        if (novedad == null) {
            return null;
        }
        novedad.setSoportePath(soportePath);
        return novedadRepository.save(novedad);
    }
}
