package com.sgturnos.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;

/**
 * Entidad que representa los tipos de novedades disponibles
 * Ejemplos: Vacaciones, Incapacidades, Permisos, Cambios de turnos, Imprevistos, Calamidad
 */
@Entity
@Table(name = "tipo_novedad")
public class TipoNovedad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipo")
    private Long idTipo;

    @Column(name = "nombre")
    private String nombre;

    @Column(name = "descripcion")
    private String descripcion;

    @Column(name = "requiere_fechas")
    private Boolean requiereFechas; // true para vacaciones, incapacidades, permisos

    @Column(name = "activo")
    private Boolean activo;

    // Constructores
    public TipoNovedad() {
    }

    public TipoNovedad(Long idTipo, String nombre, String descripcion, Boolean requiereFechas, Boolean activo) {
        this.idTipo = idTipo;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.requiereFechas = requiereFechas;
        this.activo = activo;
    }

    // Getters y Setters
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

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    @Override
    public String toString() {
        return "TipoNovedad{" +
                "idTipo=" + idTipo +
                ", nombre='" + nombre + '\'' +
                ", descripcion='" + descripcion + '\'' +
                ", requiereFechas=" + requiereFechas +
                ", activo=" + activo +
                '}';
    }
}
