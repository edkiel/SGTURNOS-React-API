// File: com/sgturnos.config/CustomLoginSuccessHandler.java

package com.sgturnos.config;

import java.io.IOException;

import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

// Este manejador se activa después de que un usuario se autentica con éxito.
// En lugar de redirigir, simplemente envía una respuesta 200 OK,
// lo cual es ideal para una API REST.
@Component
public class CustomLoginSuccessHandler implements AuthenticationSuccessHandler {

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
        // Enviar una respuesta 200 OK y no redirigir.
        response.setStatus(HttpServletResponse.SC_OK);
        response.setContentType("application/json");
        response.getWriter().write("{\"message\": \"Login exitoso\"}");
    }
}
