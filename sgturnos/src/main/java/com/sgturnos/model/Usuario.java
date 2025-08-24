package com.sgturnos.model;

// Importaciones de JPA (Java Persistence API) para mapeo objeto-relacional
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;

/**
 * Entidad que representa un usuario en el sistema
 * @Entity marca la clase como una entidad JPA
 * @Table especifica el nombre de la tabla en la base de datos
 */
@Entity
@Table(name = "usuario")
public class Usuario {

    /**
     * Identificador único del usuario
     * @Id marca el campo como clave primaria
     * @Column especifica el nombre de la columna en la base de datos
     */
    @Id
    @Column(name = "id_usuario")
    private Long idUsuario;

    /**
     * Primer nombre del usuario
     */
    @Column(name = "primer_nombre")
    private String primerNombre;
    
    /**
     * Segundo nombre del usuario (opcional)
     */
    @Column(name = "segundo_nombre")
    private String segundoNombre;
    
    /**
     * Primer apellido del usuario
     */
    @Column(name = "primer_apellido")
    private String primerApellido;
    
    /**
     * Segundo apellido del usuario (opcional)
     */
    @Column(name = "segundo_apellido")
    private String segundoApellido;
    
    /**
     * Correo electrónico del usuario (usado como nombre de usuario)
     */
    @Column(name = "correo")
    private String correo;
    
    /**
     * Contraseña del usuario (almacenada con hash)
     */
    @Column(name = "contrasena")
    private String contrasena;

    /**
     * Rol del usuario en el sistema
     * @ManyToOne indica una relación muchos a uno con la entidad Rol
     * FetchType.EAGER indica que el rol se carga inmediatamente con el usuario
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_rol")
    private Rol rol;

    /**
     * Constructor por defecto requerido por JPA
     */
    public Usuario() {
    }

    // Getters y Setters para acceder a los atributos
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

    public Rol getRol() {
        return rol;
    }

    public void setRol(Rol rol) {
        this.rol = rol;
    }
}