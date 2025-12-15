package com.sgturnos.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * Entidad para gestionar alertas de modificaciones en mallas
 * debido a novedades aprobadas
 */
@Data
@Entity
@Table(name = "alerta_malla")
public class AlertaMalla {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_alerta")
    private Long idAlerta;
    
    @ManyToOne
    @JoinColumn(name = "id_novedad", nullable = false)
    private Novedad novedad;
    
    @Column(name = "tipo_accion", nullable = false, length = 50)
    private String tipoAccion; // RECALCULO_MES_ACTUAL, EVITAR_PROGRAMACION_FUTURO
    
    @Column(name = "mes_afectado", nullable = false)
    private Integer mesAfectado;
    
    @Column(name = "anio_afectado", nullable = false)
    private Integer anioAfectado;
    
    @Column(name = "estado", nullable = false, length = 20)
    private String estado; // PENDIENTE, PROCESADA, IGNORADA
    
    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;
    
    @Column(name = "fecha_procesamiento")
    private LocalDateTime fechaProcesamiento;
    
    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;
    
    @ManyToOne
    @JoinColumn(name = "id_usuario_procesador")
    private Usuario usuarioProcesador;
    
    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        if (estado == null) {
            estado = "PENDIENTE";
        }
    }
}
