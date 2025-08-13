package com.sgturnos.service;

import com.sgturnos.dto.RegistroRequest;
import com.sgturnos.model.Rol;
import com.sgturnos.model.Usuario;
import com.sgturnos.repository.RolRepository;
import com.sgturnos.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections; // Se utiliza para crear un conjunto inmutable con un solo rol

@Service
public class RegistroService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public RegistroService(UsuarioRepository usuarioRepository, RolRepository rolRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Usuario registrarNuevoUsuario(RegistroRequest request) {
        // Verifica si ya existe un usuario con el mismo correo.
        if (usuarioRepository.findByCorreo(request.getCorreo()).isPresent()) {
            throw new IllegalArgumentException("Ya existe un usuario con este correo electr\u00f3nico.");
        }

        // Busca el rol por su nombre.
    Rol rol = rolRepository.buscarPorNombre("USER") // Asignamos el rol por defecto
                .orElseThrow(() -> new IllegalArgumentException("Rol no v\u00e1lido."));

        // Crea el nuevo usuario.
    Usuario nuevoUsuario = new Usuario();
    nuevoUsuario.setIdUsuario(request.getIdUsuario());
    nuevoUsuario.setPrimerNombre(request.getPrimerNombre());
    nuevoUsuario.setSegundoNombre(request.getSegundoNombre());
    nuevoUsuario.setPrimerApellido(request.getPrimerApellido());
    nuevoUsuario.setSegundoApellido(request.getSegundoApellido());
    nuevoUsuario.setCorreo(request.getCorreo());
    nuevoUsuario.setContrasena(passwordEncoder.encode(request.getContrasena()));
    nuevoUsuario.setRol(rol);

        return usuarioRepository.save(nuevoUsuario);
    }
}
