package com.sgturnos.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entidad que representa una novedad de un usuario
 * Puede ser vacaciones, incapacidad, permiso, etc.
 */
@Entity
@Table(name = "novedad")
public class Novedad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_novedad")
    private Long idNovedad;

    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "id_tipo", nullable = false)
    private TipoNovedad tipo;

    @Column(name = "fecha_inicio")
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDate fechaFin;

    @Column(name = "descripcion", length = 500)
    private String descripcion;

    @Column(name = "estado") // PENDIENTE, APROBADA, RECHAZADA
    private String estado;

    @Column(name = "motivo_rechazo", length = 500)
    private String motivoRechazo;

    @Column(name = "soporte_path", length = 500)
    private String soportePath; // Ruta del soporte PDF almacenado en el servidor

    @Column(name = "fecha_solicitud", nullable = false)
    private LocalDateTime fechaSolicitud;

    @Column(name = "fecha_aprobacion")
    private LocalDateTime fechaAprobacion;

    @ManyToOne
    @JoinColumn(name = "id_usuario_admin")
    private Usuario usuarioAdmin; // Administrador que aprobó/rechazó

    // Campos para control de aprobaciones múltiples (vacaciones)
    @Column(name = "aprobacion_jefe")
    private Boolean aprobacionJefe = false;

    @Column(name = "aprobacion_operaciones")
    private Boolean aprobacionOperaciones = false;

    @Column(name = "aprobacion_rrhh")
    private Boolean aprobacionRrhh = false;

    @Column(name = "aplicada_a_malla")
    private Boolean aplicadaAMalla = false;

    // Constructores
    public Novedad() {
        this.estado = "PENDIENTE";
        this.fechaSolicitud = LocalDateTime.now();
        this.aprobacionJefe = false;
        this.aprobacionOperaciones = false;
        this.aprobacionRrhh = false;
        this.aplicadaAMalla = false;
    }

    public Novedad(Usuario usuario, TipoNovedad tipo, LocalDate fechaInicio, LocalDate fechaFin, String descripcion) {
        this.usuario = usuario;
        this.tipo = tipo;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.descripcion = descripcion;
        this.estado = "PENDIENTE";
        this.fechaSolicitud = LocalDateTime.now();
    }

    // Getters y Setters
    public Long getIdNovedad() {
        return idNovedad;
    }

    public void setIdNovedad(Long idNovedad) {
        this.idNovedad = idNovedad;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public TipoNovedad getTipo() {
        return tipo;
    }

    public void setTipo(TipoNovedad tipo) {
        this.tipo = tipo;
    }

    public LocalDate getFechaInicio() {
        return fechaInicio;
    }

    public void setFechaInicio(LocalDate fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    public LocalDate getFechaFin() {
        return fechaFin;
    }

    public void setFechaFin(LocalDate fechaFin) {
        this.fechaFin = fechaFin;
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

    public String getSoportePath() {
        return soportePath;
    }

    public void setSoportePath(String soportePath) {
        this.soportePath = soportePath;
    }

    public LocalDateTime getFechaSolicitud() {
        return fechaSolicitud;
    }

    public void setFechaSolicitud(LocalDateTime fechaSolicitud) {
        this.fechaSolicitud = fechaSolicitud;
    }

    public LocalDateTime getFechaAprobacion() {
        return fechaAprobacion;
    }

    public void setFechaAprobacion(LocalDateTime fechaAprobacion) {
        this.fechaAprobacion = fechaAprobacion;
    }

    public Usuario getUsuarioAdmin() {
        return usuarioAdmin;
    }

    public void setUsuarioAdmin(Usuario usuarioAdmin) {
        this.usuarioAdmin = usuarioAdmin;
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

    @Override
    public String toString() {
        return "Novedad{" +
                "idNovedad=" + idNovedad +
                ", usuario=" + usuario +
                ", tipo=" + tipo +
                ", fechaInicio=" + fechaInicio +
                ", fechaFin=" + fechaFin +
                ", estado='" + estado + '\'' +
                ", fechaSolicitud=" + fechaSolicitud +
                '}';
    }
}
