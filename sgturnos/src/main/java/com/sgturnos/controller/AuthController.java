package com.sgturnos.controller;

import com.sgturnos.dto.LoginRequest;
import com.sgturnos.dto.LoginResponse;
import com.sgturnos.dto.RegistroRequest;
import com.sgturnos.model.Rol;
import com.sgturnos.model.Usuario;
import com.sgturnos.repository.RolRepository;
import com.sgturnos.repository.UsuarioRepository;
import com.sgturnos.security.JwtTokenProvider;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthController(AuthenticationManager authenticationManager, UsuarioRepository usuarioRepository, RolRepository rolRepository, PasswordEncoder passwordEncoder, JwtTokenProvider jwtTokenProvider) {
        this.authenticationManager = authenticationManager;
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegistroRequest registroRequest) {
        if (usuarioRepository.findByCorreo(registroRequest.getCorreo()).isPresent()) {
            return new ResponseEntity<>("El correo ya esta registrado!", HttpStatus.BAD_REQUEST);
        }
        
        // Agregamos esta validación para evitar duplicidad de documento de identidad
        if (usuarioRepository.existsById(registroRequest.getIdUsuario())) {
            return new ResponseEntity<>("El documento de identidad ya esta registrado!", HttpStatus.BAD_REQUEST);
        }

        Usuario usuario = new Usuario();
        // **Línea corregida:** Asignamos el idUsuario del DTO al objeto Usuario
        usuario.setIdUsuario(registroRequest.getIdUsuario()); 
        usuario.setCorreo(registroRequest.getCorreo());
        usuario.setPrimerNombre(registroRequest.getPrimerNombre());
        usuario.setSegundoNombre(registroRequest.getSegundoNombre());
        usuario.setPrimerApellido(registroRequest.getPrimerApellido());
        usuario.setSegundoApellido(registroRequest.getSegundoApellido());
        usuario.setContrasena(passwordEncoder.encode(registroRequest.getContrasena()));

        // Asignamos el rol por defecto
        Rol rol = rolRepository.findByRol("ADMINISTRADOR").orElseThrow();
        usuario.setRol(rol);

        usuarioRepository.save(usuario);

        return new ResponseEntity<>("Usuario registrado exitosamente!", HttpStatus.OK);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = jwtTokenProvider.generateToken(authentication);

        List<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return new ResponseEntity<>(new LoginResponse(token, roles), HttpStatus.OK);
    }

@GetMapping("/protegido")
    public String recursoProtegido() {
        return "¡Acceso concedido a un recurso protegido!";
    }


}