package com.sgturnos.dto;


/**
 * Objeto DTO para la solicitud de inicio de sesi\u00f3n.
 * Contiene el correo y la contrase\u00f1a del usuario.
 * Las anotaciones de Lombok (@Getter, @Setter) generan autom\u00e1ticamente los m\u00e9todos
 * getter y setter, reduciendo el c\u00f3digo repetitivo.
 */
public class LoginRequest {

    private String email;
    private String password;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
