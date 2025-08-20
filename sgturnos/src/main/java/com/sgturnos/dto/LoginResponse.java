package com.sgturnos.dto;

import java.util.List;

public class LoginResponse {

    // Cambia 'token' por 'accessToken' para que coincida con el frontend
    private String accessToken;
    private List<String> roles;

    public LoginResponse(String accessToken, List<String> roles) {
        this.accessToken = accessToken;
        this.roles = roles;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }
}
