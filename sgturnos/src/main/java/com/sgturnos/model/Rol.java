package com.sgturnos.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "rol") // el nombre real de la tabla (ajústalo si es diferente)
public class Rol {

    @Id
    @Column(name = "Id_rol")
    private String idRol;

    @Column(name = "Rol")
    private String rol;

    @Column(name = "Id_departamento")
    private String idDepartamento;

    // Relación inversa con Usuario
    @OneToMany(mappedBy = "rol")
    private List<Usuario> usuarios;

    // Getters y Setters
    public String getIdRol() {
        return idRol;
    }

    public void setIdRol(String idRol) {
        this.idRol = idRol;
    }

    public String getRol() {
        return rol;
    }

    public void setRol(String rol) {
        this.rol = rol;
    }

    public String getIdDepartamento() {
        return idDepartamento;
    }

    public void setIdDepartamento(String idDepartamento) {
        this.idDepartamento = idDepartamento;
    }

    public List<Usuario> getUsuarios() {
        return usuarios;
    }

    public void setUsuarios(List<Usuario> usuarios) {
        this.usuarios = usuarios;
    }
}