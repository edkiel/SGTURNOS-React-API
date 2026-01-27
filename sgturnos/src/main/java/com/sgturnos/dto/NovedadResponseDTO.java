package com.sgturnos.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO para respuestas de novedades
 * Se usa para evitar referencias circulares y serializar solo los datos necesarios
 */
public class NovedadResponseDTO {
    private Long idNovedad;
    private Long idUsuario;
    private String usuarioNombre;
    private Long idTipo;
    private TipoNovedadDTO tipo;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private String descripcion;
    private String estado;
    private String motivoRechazo;
    private String soportePath;
    private LocalDateTime fechaSolicitud;
    private LocalDateTime fechaAprobacion;
    private Boolean aprobacionJefe;
    private Boolean aprobacionOperaciones;
    private Boolean aprobacionRrhh;
    private Boolean aplicadaAMalla;

    // Constructor vacío
    public NovedadResponseDTO() {
    }

    // Getters y Setters
    public Long getIdNovedad() {
        return idNovedad;
    }

    public void setIdNovedad(Long idNovedad) {
        this.idNovedad = idNovedad;
    }

    public Long getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }

    public String getUsuarioNombre() {
        return usuarioNombre;
    }

    public void setUsuarioNombre(String usuarioNombre) {
        this.usuarioNombre = usuarioNombre;
    }

    public Long getIdTipo() {
        return idTipo;
    }

    public void setIdTipo(Long idTipo) {
        this.idTipo = idTipo;
    }

    public TipoNovedadDTO getTipo() {
        return tipo;
    }

    public void setTipo(TipoNovedadDTO tipo) {
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

    /**
     * DTO interno para el tipo de novedad
     */
    public static class TipoNovedadDTO {
        private Long idTipo;
        private String nombre;
        private String descripcion;
        private Boolean requiereFechas;

        public TipoNovedadDTO() {
        }

        public TipoNovedadDTO(Long idTipo, String nombre) {
            this.idTipo = idTipo;
            this.nombre = nombre;
        }

        public Long getIdTipo() {
            return idTipo;
        }

        public void setIdTipo(Long idTipo) {
            this.idTipo = idTipo;
        }

        public String getNombre() {
            return nombre;
        }

        public void setNombre(String nombre) {
            this.nombre = nombre;
        }

        public String getDescripcion() {
            return descripcion;
        }

        public void setDescripcion(String descripcion) {
            this.descripcion = descripcion;
        }

        public Boolean getRequiereFechas() {
            return requiereFechas;
        }

        public void setRequiereFechas(Boolean requiereFechas) {
            this.requiereFechas = requiereFechas;
        }
    }
}
