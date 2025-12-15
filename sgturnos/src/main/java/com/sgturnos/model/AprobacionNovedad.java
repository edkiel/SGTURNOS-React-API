package com.sgturnos.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entidad que representa una aprobación de novedad por parte de un aprobador específico
 * Las vacaciones requieren 3 aprobaciones: Jefe Inmediato, Operaciones Clínicas y RRHH
 */
@Entity
@Table(name = "aprobacion_novedad")
public class AprobacionNovedad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_aprobacion")
    private Long idAprobacion;

    @ManyToOne
    @JoinColumn(name = "id_novedad", nullable = false)
    private Novedad novedad;

    @ManyToOne
    @JoinColumn(name = "id_usuario_aprobador", nullable = false)
    private Usuario usuarioAprobador;

    @Column(name = "tipo_aprobador", nullable = false)
    private String tipoAprobador; // JEFE_INMEDIATO, OPERACIONES_CLINICAS, RECURSOS_HUMANOS

    @Column(name = "estado_aprobacion")
    private String estadoAprobacion; // PENDIENTE, APROBADA, RECHAZADA

    @Column(name = "motivo_rechazo", length = 500)
    private String motivoRechazo;

    @Column(name = "fecha_aprobacion")
    private LocalDateTime fechaAprobacion;

    // Constructores
    public AprobacionNovedad() {
        this.estadoAprobacion = "PENDIENTE";
    }

    public AprobacionNovedad(Novedad novedad, Usuario usuarioAprobador, String tipoAprobador) {
        this.novedad = novedad;
        this.usuarioAprobador = usuarioAprobador;
        this.tipoAprobador = tipoAprobador;
        this.estadoAprobacion = "PENDIENTE";
    }

    // Getters y Setters
    public Long getIdAprobacion() {
        return idAprobacion;
    }

    public void setIdAprobacion(Long idAprobacion) {
        this.idAprobacion = idAprobacion;
    }

    public Novedad getNovedad() {
        return novedad;
    }

    public void setNovedad(Novedad novedad) {
        this.novedad = novedad;
    }

    public Usuario getUsuarioAprobador() {
        return usuarioAprobador;
    }

    public void setUsuarioAprobador(Usuario usuarioAprobador) {
        this.usuarioAprobador = usuarioAprobador;
    }

    public String getTipoAprobador() {
        return tipoAprobador;
    }

    public void setTipoAprobador(String tipoAprobador) {
        this.tipoAprobador = tipoAprobador;
    }

    public String getEstadoAprobacion() {
        return estadoAprobacion;
    }

    public void setEstadoAprobacion(String estadoAprobacion) {
        this.estadoAprobacion = estadoAprobacion;
    }

    public String getMotivoRechazo() {
        return motivoRechazo;
    }

    public void setMotivoRechazo(String motivoRechazo) {
        this.motivoRechazo = motivoRechazo;
    }

    public LocalDateTime getFechaAprobacion() {
        return fechaAprobacion;
    }

    public void setFechaAprobacion(LocalDateTime fechaAprobacion) {
        this.fechaAprobacion = fechaAprobacion;
    }
}
