package com.sgturnos.service;

import com.sgturnos.model.AlertaMalla;
import com.sgturnos.model.Novedad;
import com.sgturnos.model.Usuario;
import com.sgturnos.repository.AlertaMallaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AlertaMallaService {
    
    @Autowired
    private AlertaMallaRepository alertaMallaRepository;
    
    /**
     * Crear alerta cuando se aprueba una novedad
     */
    @Transactional
    public void crearAlertaPorNovedad(Novedad novedad) {
        if (novedad.getFechaInicio() == null) {
            return;
        }
        
        LocalDate fechaInicio = novedad.getFechaInicio();
        LocalDate hoy = LocalDate.now();
        
        int mesAfectado = fechaInicio.getMonthValue();
        int anioAfectado = fechaInicio.getYear();
        
        // Determinar tipo de acción
        String tipoAccion;
        if (fechaInicio.getMonthValue() == hoy.getMonthValue() && 
            fechaInicio.getYear() == hoy.getYear()) {
            tipoAccion = "RECALCULO_MES_ACTUAL";
        } else {
            tipoAccion = "EVITAR_PROGRAMACION_FUTURO";
        }
        
        AlertaMalla alerta = new AlertaMalla();
        alerta.setNovedad(novedad);
        alerta.setTipoAccion(tipoAccion);
        alerta.setMesAfectado(mesAfectado);
        alerta.setAnioAfectado(anioAfectado);
        alerta.setEstado("PENDIENTE");
        alerta.setObservaciones(String.format(
            "Novedad %s aprobada para %s %s. Requiere %s",
            novedad.getTipo().getNombre(),
            novedad.getUsuario().getPrimerNombre(),
            novedad.getUsuario().getPrimerApellido(),
            tipoAccion.equals("RECALCULO_MES_ACTUAL") ? "recalcular malla actual" : "evitar programación futura"
        ));
        
        alertaMallaRepository.save(alerta);
    }
    
    /**
     * Obtener alertas pendientes
     */
    public List<AlertaMalla> obtenerAlertasPendientes() {
        return alertaMallaRepository.findByEstadoOrderByFechaCreacionDesc("PENDIENTE");
    }
    
    /**
     * Contar alertas pendientes
     */
    public Long contarAlertasPendientes() {
        return alertaMallaRepository.countByEstado("PENDIENTE");
    }
    
    /**
     * Marcar alerta como procesada
     */
    @Transactional
    public void marcarComoProcessada(Long idAlerta, Usuario procesador, String observaciones) {
        AlertaMalla alerta = alertaMallaRepository.findById(idAlerta).orElse(null);
        if (alerta != null) {
            alerta.setEstado("PROCESADA");
            alerta.setFechaProcesamiento(LocalDateTime.now());
            alerta.setUsuarioProcesador(procesador);
            if (observaciones != null) {
                alerta.setObservaciones(alerta.getObservaciones() + "\n" + observaciones);
            }
            alertaMallaRepository.save(alerta);
        }
    }
    
    /**
     * Obtener alertas por mes/año
     */
    public List<AlertaMalla> obtenerAlertasPorMesAnio(Integer mes, Integer anio) {
        return alertaMallaRepository.findByMesAfectadoAndAnioAfectadoAndEstado(mes, anio, "PENDIENTE");
    }
}
