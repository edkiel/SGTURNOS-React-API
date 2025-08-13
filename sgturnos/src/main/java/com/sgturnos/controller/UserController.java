package com.sgturnos.controller;

import com.sgturnos.model.Usuario;
// Se corrige el import de UserRepository a UsuarioRepository.
import com.sgturnos.repository.UsuarioRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UserController {

    // Se cambia el nombre de la variable de UserRepository a UsuarioRepository.
    private final UsuarioRepository usuarioRepository;

    public UserController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping
    public List<Usuario> getAllUsuarios() {
        return usuarioRepository.findAll();
    }
}
