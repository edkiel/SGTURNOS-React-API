package com.sgturnos.payload;

// Esta clase es un DTO (Data Transfer Object)
// Se utiliza para transferir datos de inicio de sesión desde el cliente al servidor.
public class LoginRequest {

    private String username;
    private String password;

    // Constructor vacío (necesario para la deserialización de JSON)
    public LoginRequest() {
    }

    public LoginRequest(String username, String password) {
        this.username = username;
        this.password = password;
    }

    // Getters y Setters
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
