package com.sgturnos.dto;

import lombok.Data;
import java.util.List;

@Data
public class LoginResponse {

    private String accessToken;
    private String tokenType = "Bearer ";
    private List<String> roles;

    public LoginResponse(String accessToken, List<String> roles) {
        this.accessToken = accessToken;
        this.roles = roles;
    }
}
