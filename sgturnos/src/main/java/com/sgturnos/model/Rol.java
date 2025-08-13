package com.sgturnos.model;

import jakarta.persistence.*;

@Entity
@Table(name = "rol")
public class Rol {

  @Id
  @Column(name = "id_rol")
  private String idRol;

  @Column(name = "Rol", nullable = false, unique = true)
  private String rol;

  @Column(name = "id_departamento")
  private String idDepartamento;

  public Rol() {}

  public Rol(String rol) {
    this.rol = rol;
  }

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

  // Añadido
  public String getNombre() {
    return rol;
  }
}