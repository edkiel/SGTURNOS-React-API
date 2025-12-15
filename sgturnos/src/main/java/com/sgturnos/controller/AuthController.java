package com.sgturnos.controller;

// Importaciones necesarias para el controlador
import com.sgturnos.dto.LoginRequest;
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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.Collections;
import java.util.Map;

/**
 * Controlador REST que maneja las operaciones de autenticación
 * @RestController indica que es un controlador REST que devuelve datos en formato JSON
 * @RequestMapping especifica la ruta base para todas las operaciones de autenticación
 */
@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/auth")
public class AuthController {

    /**
     * Componentes necesarios para la autenticación y gestión de usuarios
     */
    private final AuthenticationManager authenticationManager; // Maneja el proceso de autenticación
    private final UsuarioRepository usuarioRepository;        // Acceso a la base de datos de usuarios
    private final RolRepository rolRepository;                // Acceso a la base de datos de roles
    private final PasswordEncoder passwordEncoder;            // Codifica las contraseñas
    private final JwtTokenProvider jwtTokenProvider;         // Genera y valida tokens JWT

    /**
     * Constructor que recibe todas las dependencias necesarias mediante inyección
     * Spring Boot inyectará automáticamente las implementaciones correspondientes
     */
    public AuthController(
            AuthenticationManager authenticationManager, 
            UsuarioRepository usuarioRepository, 
            RolRepository rolRepository, 
            PasswordEncoder passwordEncoder, 
            JwtTokenProvider jwtTokenProvider) {
        this.authenticationManager = authenticationManager;
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    /**
     * Endpoint para registrar un nuevo usuario
     * @PostMapping indica que este método maneja las solicitudes POST a /api/auth/register
     * @param registroRequest contiene los datos del nuevo usuario
     * @return ResponseEntity con el mensaje de éxito o error
     */
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegistroRequest registroRequest) {
        // Verifica si el correo ya está registrado
        if (usuarioRepository.findByCorreo(registroRequest.getCorreo()).isPresent()) {
            return new ResponseEntity<>("El correo ya esta registrado!", HttpStatus.BAD_REQUEST);
        }
        
        // Verifica si el ID de usuario ya está registrado
        if (usuarioRepository.existsById(registroRequest.getIdUsuario())) {
            return new ResponseEntity<>("El documento de identidad ya esta registrado!", HttpStatus.BAD_REQUEST);
        }

        // Crea un nuevo usuario con los datos del registro
        Usuario usuario = new Usuario();
        usuario.setIdUsuario(registroRequest.getIdUsuario()); 
        usuario.setCorreo(registroRequest.getCorreo());
        usuario.setPrimerNombre(registroRequest.getPrimerNombre());
        usuario.setSegundoNombre(registroRequest.getSegundoNombre());
        usuario.setPrimerApellido(registroRequest.getPrimerApellido());
        usuario.setSegundoApellido(registroRequest.getSegundoApellido());
        // Codifica la contraseña antes de guardarla
        usuario.setContrasena(passwordEncoder.encode(registroRequest.getContrasena()));

        // Resolución robusta de rol: aceptar IDs (ej: "adm05") o nombres de rol existentes en BD (ej: "ADMINISTRADOR")
        String solicitado = registroRequest.getIdRol();
        if (solicitado == null || solicitado.trim().isEmpty()) {
            // Rol por defecto si el frontend no envía nada
            solicitado = "AUXILIAR";
        }

        String originalSolicitado = solicitado;
        String normalizado = solicitado.trim().toUpperCase();

        // Mapear nombres usados por el frontend a nombres reales en BD
        switch (normalizado) {
            case "USUARIO":
            case "AUX":
            case "AUXILIAR":
                normalizado = "AUXILIAR"; break;
            case "JEFE_INMEDIATO":
            case "OPERACIONES_CLINICAS":
            case "RECURSOS_HUMANOS":
            case "ADMIN":
            case "ADMINISTRADOR":
                normalizado = "ADMINISTRADOR"; break;
            case "MEDICO":
                normalizado = "MEDICO"; break;
            case "ENFERMERO":
                normalizado = "ENFERMERO"; break;
            case "TERAPIA":
                normalizado = "TERAPIA"; break;
            default:
                // Mantener valor tal cual, puede ser un ID como "adm05", "aux01", etc.
                normalizado = solicitado.trim();
        }

        // Intentar primero por ID (id_rol), luego por nombre (columna 'rol')
        Rol rol = null;
        try {
            rol = rolRepository.findById(normalizado).orElse(null);
        } catch (Exception ignored) {}
        if (rol == null) {
            var maybeRol = rolRepository.findByRol(normalizado);
            if (maybeRol.isEmpty()) {
                return new ResponseEntity<>("Rol no encontrado: " + originalSolicitado, HttpStatus.BAD_REQUEST);
            }
            rol = maybeRol.get();
        }
        usuario.setRol(rol);

        // Guarda el usuario en la base de datos
        usuarioRepository.save(usuario);

        return new ResponseEntity<>("Usuario registrado exitosamente!", HttpStatus.OK);
    }

    /**
     * Endpoint para la autenticación de usuarios
     * @PostMapping indica que este método maneja las solicitudes POST a /api/auth/login
     * @param loginRequest contiene el correo y contraseña del usuario
     * @return ResponseEntity con el token JWT si la autenticación es exitosa
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            // Intenta autenticar al usuario con las credenciales proporcionadas
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getEmail(),
                    loginRequest.getPassword()));

            // Establece la autenticación en el contexto de seguridad
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Genera un token JWT para el usuario autenticado
            String token = jwtTokenProvider.generateToken(authentication);

            // Devuelve el token en un objeto JSON con la clave 'accessToken'
            Map<String, String> response = Collections.singletonMap("accessToken", token);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            // En caso de error de autenticación, devuelve un mensaje de error
            return new ResponseEntity<>("Credenciales inválidas.", HttpStatus.UNAUTHORIZED);
        }
    }

    /**
     * Endpoint de prueba para verificar la protección de rutas
     * @GetMapping indica que este método maneja las solicitudes GET a /api/auth/protegido
     * @return Un mensaje simple para confirmar el acceso
     */
    @GetMapping("/protegido")
    public String recursoProtegido() {
        return "¡Acceso concedido a un recurso protegido!";
    }
}
