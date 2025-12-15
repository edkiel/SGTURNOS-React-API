package com.sgturnos.service;

import com.sgturnos.model.Novedad;
import com.sgturnos.model.Usuario;
import com.sgturnos.repository.NovedadRepository;
import com.sgturnos.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Servicio para aplicar vacaciones aprobadas a las mallas de turnos
 * y gestionar reemplazos con personal de horas de apoyo
 */
@Service
public class AjusteMallaVacacionesService {

    @Autowired
    private NovedadRepository novedadRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    /**
     * Aplica las vacaciones aprobadas a la malla de turnos
     * Busca reemplazos con horas de apoyo disponibles
     * 
     * @param novedadId ID de la novedad de vacaciones aprobada
     * @return Mensaje con el resultado del ajuste
     */
    @Transactional
    public String aplicarVacacionesAMalla(Long novedadId) {
        Novedad novedad = novedadRepository.findById(novedadId).orElse(null);
        
        if (novedad == null) {
            return "Novedad no encontrada";
        }

        if (!novedad.getEstado().equals("APROBADA")) {
            return "Solo se pueden aplicar novedades aprobadas";
        }

        if (novedad.getAplicadaAMalla()) {
            return "Esta novedad ya fue aplicada a la malla";
        }

        // Obtener el usuario que está de vacaciones
        Usuario usuarioVacaciones = novedad.getUsuario();
        LocalDate fechaInicio = novedad.getFechaInicio();
        LocalDate fechaFin = novedad.getFechaFin();

        // TODO: Implementar lógica de búsqueda de reemplazos
        // 1. Buscar turnos del usuario en el rango de fechas
        // 2. Para cada turno, buscar personal con horas de apoyo después de la fecha actual
        // 3. Verificar correspondencia horaria
        // 4. Si hay reemplazo compatible, asignar
        // 5. Si no hay reemplazo, marcar como "EXTRAS" para que operaciones clínicas cuadre manualmente

        // Por ahora, marcar como aplicada
        novedad.setAplicadaAMalla(true);
        novedadRepository.save(novedad);

        // Construir nombre completo del usuario
        String nombreCompleto = usuarioVacaciones.getPrimerNombre() + " " + 
                                (usuarioVacaciones.getSegundoNombre() != null ? usuarioVacaciones.getSegundoNombre() + " " : "") +
                                usuarioVacaciones.getPrimerApellido() + " " +
                                (usuarioVacaciones.getSegundoApellido() != null ? usuarioVacaciones.getSegundoApellido() : "");

        return String.format(
            "Vacaciones aplicadas: Usuario %s del %s al %s. Pendiente ajuste manual de turnos por Operaciones Clínicas",
            nombreCompleto.trim(),
            fechaInicio,
            fechaFin
        );
    }

    /**
     * Busca personal con horas de apoyo disponibles para reemplazar turnos
     * 
     * @param fechaTurno Fecha del turno a reemplazar
     * @param horaInicio Hora de inicio del turno
     * @param horaFin Hora de fin del turno
     * @param rolRequerido Rol del personal requerido
     * @return Lista de usuarios disponibles con horas de apoyo
     */
    public List<Usuario> buscarPersonalConHorasApoyo(
            LocalDate fechaTurno,
            String horaInicio,
            String horaFin,
            String rolRequerido) {
        
        // TODO: Implementar query que busque usuarios con:
        // 1. Mismo rol o compatible
        // 2. Horas de apoyo disponibles después de la fecha actual
        // 3. Disponibilidad en el horario específico
        // 4. Sin otros turnos asignados en ese horario
        
        return List.of(); // Retorna vacío por ahora
    }

    /**
     * Verifica si un usuario tiene turnos en conflicto en el rango de fechas
     * 
     * @param usuarioId ID del usuario
     * @param fechaInicio Fecha inicio del rango
     * @param fechaFin Fecha fin del rango
     * @return true si tiene conflictos, false si está disponible
     */
    public boolean tieneConflictosDeTurno(Long usuarioId, LocalDate fechaInicio, LocalDate fechaFin) {
        // TODO: Consultar en la tabla de turnos/mallas si el usuario tiene asignaciones en ese rango
        return false;
    }

    /**
     * Marca un turno como "EXTRAS" cuando no se encuentra reemplazo automático
     * 
     * @param turnoId ID del turno
     * @param motivoExtras Motivo por el cual se marca como extras
     */
    public void marcarTurnoComoExtras(Long turnoId, String motivoExtras) {
        // TODO: Actualizar registro de turno con flag de EXTRAS
        // Este turno deberá ser cubierto manualmente por Operaciones Clínicas
        // y se pagará como horas extras al personal asignado
    }

    /**
     * Obtiene todas las vacaciones aprobadas que aún no han sido aplicadas a la malla
     * 
     * @return Lista de vacaciones pendientes de aplicar
     */
    public List<Novedad> obtenerVacacionesPendientesDeAplicar() {
        return novedadRepository.findAll().stream()
            .filter(n -> 
                n.getEstado().equals("APROBADA") && 
                !n.getAplicadaAMalla() &&
                n.getTipo().getNombre().equals("Vacaciones")
            )
            .toList();
    }
}
