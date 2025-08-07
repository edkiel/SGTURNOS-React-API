package com.sgturnos.config;

import java.io.IOException;

import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

// Este manejador se activa después de que un usuario se autentica con éxito.
@Component
public class CustomLoginSuccessHandler implements AuthenticationSuccessHandler {

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
        // Redirige siempre a la URL raíz de la aplicación.
        // El enrutador de React, en el front-end, se encargará de la navegación
        // interna (por ejemplo, a /admin/dashboard).
        response.sendRedirect("/");
    }
}