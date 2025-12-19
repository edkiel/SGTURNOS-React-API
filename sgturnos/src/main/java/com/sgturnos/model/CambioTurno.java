package com.sgturnos.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entidad que representa una solicitud de cambio de turno
 * Requiere aprobación del compañero y de los administradores
 */
@Entity
@Table(name = "cambio_turno")
public class CambioTurno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cambio")
    private Long idCambio;

    @ManyToOne
    @JoinColumn(name = "id_usuario_solicitante", nullable = false)
    private Usuario usuarioSolicitante;

    @ManyToOne
    @JoinColumn(name = "id_usuario_compañero", nullable = false)
    private Usuario usuarioCompañero; // Usuario con quien intercambia el turno

    @Column(name = "fecha_turno")
    private LocalDate fechaTurno; // Día específico de turno a intercambiar

    @Column(name = "fecha_turno_compañero")
    private LocalDate fechaTurnoCompañero; // Día del turno del compañero a intercambiar

    @Column(name = "descripcion", length = 500)
    private String descripcion;

    @Column(name = "estado") // PENDIENTE_COMPAÑERO, PENDIENTE_ADMIN, APROBADA, RECHAZADA
    private String estado;

    @Column(name = "motivo_rechazo", length = 500)
    private String motivoRechazo;

    @Column(name = "fecha_solicitud", nullable = false)
    private LocalDateTime fechaSolicitud;

    // Aprobaciones requeridas
    @Column(name = "aprobacion_compañero")
    private Boolean aprobacionCompañero = false;

    @Column(name = "fecha_respuesta_compañero")
    private LocalDateTime fechaRespuestaCompañero;

    @Column(name = "aprobacion_jefe")
    private Boolean aprobacionJefe = false;

    @Column(name = "aprobacion_operaciones")
    private Boolean aprobacionOperaciones = false;

    @Column(name = "aprobacion_rrhh")
    private Boolean aprobacionRrhh = false;

    @Column(name = "aplicada_a_malla")
    private Boolean aplicadaAMalla = false;

    @Column(name = "fecha_aprobacion_final")
    private LocalDateTime fechaAprobacionFinal;

    // Constructores
    public CambioTurno() {
        this.estado = "PENDIENTE_COMPAÑERO";
        this.fechaSolicitud = LocalDateTime.now();
        this.aprobacionCompañero = false;
        this.aprobacionJefe = false;
        this.aprobacionOperaciones = false;
        this.aprobacionRrhh = false;
        this.aplicadaAMalla = false;
    }

    public CambioTurno(Usuario usuarioSolicitante, Usuario usuarioCompañero, LocalDate fechaTurno, String descripcion) {
        this();
        this.usuarioSolicitante = usuarioSolicitante;
        this.usuarioCompañero = usuarioCompañero;
        this.fechaTurno = fechaTurno;
        this.descripcion = descripcion;
    }

    // Getters y Setters
    public Long getIdCambio() {
        return idCambio;
    }

    public void setIdCambio(Long idCambio) {
        this.idCambio = idCambio;
    }

    public Usuario getUsuarioSolicitante() {
        return usuarioSolicitante;
    }

    public void setUsuarioSolicitante(Usuario usuarioSolicitante) {
        this.usuarioSolicitante = usuarioSolicitante;
    }

    public Usuario getUsuarioCompañero() {
        return usuarioCompañero;
    }

    public void setUsuarioCompañero(Usuario usuarioCompañero) {
        this.usuarioCompañero = usuarioCompañero;
    }

    public LocalDate getFechaTurno() {
        return fechaTurno;
    }

    public void setFechaTurno(LocalDate fechaTurno) {
        this.fechaTurno = fechaTurno;
    }

    public LocalDate getFechaTurnoCompañero() {
        return fechaTurnoCompañero;
    }

    public void setFechaTurnoCompañero(LocalDate fechaTurnoCompañero) {
        this.fechaTurnoCompañero = fechaTurnoCompañero;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getMotivoRechazo() {
        return motivoRechazo;
    }

    public void setMotivoRechazo(String motivoRechazo) {
        this.motivoRechazo = motivoRechazo;
    }

    public LocalDateTime getFechaSolicitud() {
        return fechaSolicitud;
    }

    public void setFechaSolicitud(LocalDateTime fechaSolicitud) {
        this.fechaSolicitud = fechaSolicitud;
    }

    public Boolean getAprobacionCompañero() {
        return aprobacionCompañero;
    }

    public void setAprobacionCompañero(Boolean aprobacionCompañero) {
        this.aprobacionCompañero = aprobacionCompañero;
    }

    public LocalDateTime getFechaRespuestaCompañero() {
        return fechaRespuestaCompañero;
    }

    public void setFechaRespuestaCompañero(LocalDateTime fechaRespuestaCompañero) {
        this.fechaRespuestaCompañero = fechaRespuestaCompañero;
    }

    public Boolean getAprobacionJefe() {
        return aprobacionJefe;
    }

    public void setAprobacionJefe(Boolean aprobacionJefe) {
        this.aprobacionJefe = aprobacionJefe;
    }

    public Boolean getAprobacionOperaciones() {
        return aprobacionOperaciones;
    }

    public void setAprobacionOperaciones(Boolean aprobacionOperaciones) {
        this.aprobacionOperaciones = aprobacionOperaciones;
    }

    public Boolean getAprobacionRrhh() {
        return aprobacionRrhh;
    }

    public void setAprobacionRrhh(Boolean aprobacionRrhh) {
        this.aprobacionRrhh = aprobacionRrhh;
    }

    public Boolean getAplicadaAMalla() {
        return aplicadaAMalla;
    }

    public void setAplicadaAMalla(Boolean aplicadaAMalla) {
        this.aplicadaAMalla = aplicadaAMalla;
    }

    public LocalDateTime getFechaAprobacionFinal() {
        return fechaAprobacionFinal;
    }

    public void setFechaAprobacionFinal(LocalDateTime fechaAprobacionFinal) {
        this.fechaAprobacionFinal = fechaAprobacionFinal;
    }

    @Override
    public String toString() {
        return "CambioTurno{" +
                "idCambio=" + idCambio +
                ", usuarioSolicitante=" + (usuarioSolicitante != null ? usuarioSolicitante.getIdUsuario() : null) +
                ", usuarioCompañero=" + (usuarioCompañero != null ? usuarioCompañero.getIdUsuario() : null) +
                ", fechaTurno=" + fechaTurno +
                ", fechaTurnoCompañero=" + fechaTurnoCompañero +
                ", estado='" + estado + '\'' +
                ", aprobacionCompañero=" + aprobacionCompañero +
                ", aprobacionJefe=" + aprobacionJefe +
                ", aprobacionOperaciones=" + aprobacionOperaciones +
                ", aprobacionRrhh=" + aprobacionRrhh +
                ", aplicadaAMalla=" + aplicadaAMalla +
                '}';
    }
}
