package com.sgturnos.controller;

import com.sgturnos.model.Usuario;
import com.sgturnos.model.Rol;
import com.sgturnos.repository.UsuarioRepository;
import com.sgturnos.repository.RolRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UserController {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;

    public UserController(UsuarioRepository usuarioRepository, RolRepository rolRepository) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
    }

    @GetMapping("/roles")
    public List<Rol> getAllRoles() {
        return rolRepository.findAll();
    }

    @GetMapping
    public List<Usuario> getAllUsuarios() {
        return usuarioRepository.findAll();
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile() {
        try {
            // Obtener el usuario autenticado actual
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();

            // Buscar el usuario en la base de datos por su correo
            Usuario usuario = usuarioRepository.findByCorreo(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            // Crear una copia del usuario sin la contraseña
            Usuario usuarioSinContrasena = new Usuario();
            usuarioSinContrasena.setIdUsuario(usuario.getIdUsuario());
            usuarioSinContrasena.setPrimerNombre(usuario.getPrimerNombre());
            usuarioSinContrasena.setSegundoNombre(usuario.getSegundoNombre());
            usuarioSinContrasena.setPrimerApellido(usuario.getPrimerApellido());
            usuarioSinContrasena.setSegundoApellido(usuario.getSegundoApellido());
            usuarioSinContrasena.setCorreo(usuario.getCorreo());
            usuarioSinContrasena.setRol(usuario.getRol());
            
            return ResponseEntity.ok(usuarioSinContrasena);
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Error al obtener el perfil: " + e.getMessage());
        }
    }
}
