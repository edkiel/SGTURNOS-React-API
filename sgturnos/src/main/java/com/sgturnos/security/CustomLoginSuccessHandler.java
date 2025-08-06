package com.sgturnos.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.*;
import org.springframework.security.core.authority.AuthorityUtils;

@Component
public class CustomLoginSuccessHandler implements AuthenticationSuccessHandler {

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException, ServletException {

        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        Set<String> roles = AuthorityUtils.authorityListToSet(authorities);
        
         System.out.println("Login exitoso con roles: " + roles);

        if (roles.contains("ROLE_ADMINISTRADOR")) {
            response.sendRedirect("/sgturnos/dashboard_admin");
        } else if (
            roles.contains("ROLE_AUXILIAR") ||
            roles.contains("ROLE_ENFERMERO") ||
            roles.contains("ROLE_MEDICO") ||
            roles.contains("ROLE_TERAPIA")
        ) {
            response.sendRedirect("/sgturnos/dashboard_usuario");
        } else {
            response.sendRedirect("/sgturnos/error_rol");
        }
    }
}