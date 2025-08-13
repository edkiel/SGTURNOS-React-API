package com.sgturnos.controller;

import com.sgturnos.dto.RegistroRequest;
import com.sgturnos.model.Usuario;
import com.sgturnos.service.RegistroService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/sgturnos")
public class RegistroController {

    @Autowired
    private RegistroService registroService;

    @PostMapping("/register")
    public ResponseEntity<?> registrarUsuario(@RequestBody RegistroRequest request) {
        try {
            Usuario nuevoUsuario = registroService.registrarNuevoUsuario(request);
            // Retorna una respuesta exitosa con el objeto del nuevo usuario.
            return ResponseEntity.ok(nuevoUsuario);
        } catch (IllegalArgumentException e) {
            // Retorna una respuesta de error si el usuario ya existe o el rol no es válido.
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            // Manejo de cualquier otro error inesperado.
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Ocurrió un error inesperado durante el registro."));
        }
    }
}
