package com.sgturnos.controller;

import com.sgturnos.payload.LoginRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api") // La ruta base del controlador ha sido cambiada a /api
public class LoginController {

    private final AuthenticationManager authenticationManager;

    public LoginController(AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/login") // La ruta completa para el login será /api/login
    public ResponseEntity<String> authenticateUser(@RequestBody LoginRequest loginRequest) {
        // Usa el AuthenticationManager para autenticar al usuario.
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
        );

        // Si la autenticación es exitosa, se establece el contexto de seguridad.
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        // Retorna una respuesta exitosa.
        return new ResponseEntity<>("¡Usuario autenticado con éxito!", HttpStatus.OK);
    }
}
