package com.sgturnos.dto;

/**
 * Clase DTO (Data Transfer Object) que representa la solicitud de registro de un nuevo usuario
 * Esta clase se utiliza para transportar los datos del formulario de registro desde el cliente (frontend)
 * hasta el servidor (backend)
 */
public class RegistroRequest {
    // Identificador único del usuario
    private Long idUsuario;
    // Nombres del usuario (primer y segundo nombre)
    private String primerNombre;
    private String segundoNombre;
    // Apellidos del usuario (primer y segundo apellido)
    private String primerApellido;
    private String segundoApellido;
    // Correo electrónico que servirá como nombre de usuario
    private String correo;
    // Contraseña del usuario (debe ser encriptada antes de almacenarse)
    private String contrasena;
    // Identificador del rol asignado al usuario
    private String idRol;

    public Long getIdUsuario() {
        return idUsuario;
    }
    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }
    public String getPrimerNombre() {
        return primerNombre;
    }
    public void setPrimerNombre(String primerNombre) {
        this.primerNombre = primerNombre;
    }
    public String getSegundoNombre() {
        return segundoNombre;
    }
    public void setSegundoNombre(String segundoNombre) {
        this.segundoNombre = segundoNombre;
    }
    public String getPrimerApellido() {
        return primerApellido;
    }
    public void setPrimerApellido(String primerApellido) {
        this.primerApellido = primerApellido;
    }
    public String getSegundoApellido() {
        return segundoApellido;
    }
    public void setSegundoApellido(String segundoApellido) {
        this.segundoApellido = segundoApellido;
    }
    public String getCorreo() {
        return correo;
    }
    public void setCorreo(String correo) {
        this.correo = correo;
    }
    public String getContrasena() {
        return contrasena;
    }
    public void setContrasena(String contrasena) {
        this.contrasena = contrasena;
    }

    public String getIdRol() {
        return idRol;
    }

    public void setIdRol(String idRol) {
        this.idRol = idRol;
    }
}
