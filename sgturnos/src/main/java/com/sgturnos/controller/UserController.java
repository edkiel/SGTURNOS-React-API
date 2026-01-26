package com.sgturnos.controller;

import com.sgturnos.dto.RegistroRequest;
import com.sgturnos.model.Usuario;
import com.sgturnos.model.Rol;
import com.sgturnos.repository.UsuarioRepository;
import com.sgturnos.repository.RolRepository;
import com.sgturnos.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/usuarios")
public class UserController {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;
    private final UsuarioService usuarioService;

    public UserController(UsuarioRepository usuarioRepository, RolRepository rolRepository, 
                         PasswordEncoder passwordEncoder, UsuarioService usuarioService) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
        this.usuarioService = usuarioService;
    }

    @GetMapping("/roles")
    public List<Rol> getAllRoles() {
        return rolRepository.findAll();
    }

    @GetMapping
    public List<Usuario> getAllUsuarios() {
        return usuarioRepository.findAll();
    }

    /**
     * Obtener todos los usuarios activos
     * GET /api/usuarios/activos
     */
    @GetMapping("/activos")
    public List<Usuario> getUsuariosActivos() {
        return usuarioService.obtenerUsuariosActivos();
    }

    /**
     * Obtener todos los usuarios desactivados
     * GET /api/usuarios/desactivados
     */
    @GetMapping("/desactivados")
    public List<Usuario> getUsuariosDesactivados() {
        return usuarioService.obtenerUsuariosDesactivados();
    }

    /**
     * Listar usuarios por nombre de rol (columna 'rol' en tabla rol) o por ID de rol
     * GET /api/usuarios/por-rol?rol=ADMINISTRADOR
     * GET /api/usuarios/por-rol?idRol=adm05
     */
    @GetMapping("/por-rol")
    public List<Usuario> getUsuariosPorRol(
            @RequestParam(value = "rol", required = false) String rolNombre,
            @RequestParam(value = "idRol", required = false) String idRol
    ) {
        if (idRol != null && !idRol.isBlank()) {
            return usuarioRepository.findAllByRol_IdRol(idRol);
        }
        String nombre = (rolNombre == null || rolNombre.isBlank()) ? "ADMINISTRADOR" : rolNombre.trim();
        return usuarioRepository.findAllByRol_RolIgnoreCase(nombre);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<String> updateUser(@PathVariable Long id, @RequestBody RegistroRequest registroRequest) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuario.setPrimerNombre(registroRequest.getPrimerNombre());
        usuario.setSegundoNombre(registroRequest.getSegundoNombre());
        usuario.setPrimerApellido(registroRequest.getPrimerApellido());
        usuario.setSegundoApellido(registroRequest.getSegundoApellido());
        usuario.setCorreo(registroRequest.getCorreo());

        if (registroRequest.getContrasena() != null && !registroRequest.getContrasena().isEmpty()) {
            usuario.setContrasena(passwordEncoder.encode(registroRequest.getContrasena()));
        }

        // Resolver rol de forma robusta: aceptar ID (id_rol) o nombre (columna 'rol')
        String solicitado = registroRequest.getIdRol();
        if (solicitado == null || solicitado.trim().isEmpty()) {
            solicitado = usuario.getRol() != null ? usuario.getRol().getRol() : "AUXILIAR";
        }
        String originalSolicitado = solicitado;
        String normalizado = solicitado.trim().toUpperCase();

        switch (normalizado) {
            case "USUARIO":
            case "AUX":
            case "AUXILIAR":
                normalizado = "AUXILIAR"; break;
            case "ADMIN":
            case "ADMINISTRADOR":
                normalizado = "ADMINISTRADOR"; break;
            case "MEDICO":
                normalizado = "MEDICO"; break;
            case "ENFERMERO":
                normalizado = "ENFERMERO"; break;
            case "TERAPEUTA":
            case "TERAPIA":
                normalizado = "TERAPIA"; break;
            default:
                normalizado = solicitado.trim();
        }

        Rol rol = null;
        try {
            rol = rolRepository.findById(normalizado).orElse(null);
        } catch (Exception ignored) {}
        if (rol == null) {
            var maybeRol = rolRepository.findByRol(normalizado);
            if (maybeRol.isEmpty()) {
                return ResponseEntity.badRequest().body("Rol no encontrado: " + originalSolicitado);
            }
            rol = maybeRol.get();
        }
        usuario.setRol(rol);

        usuarioRepository.save(usuario);

        return ResponseEntity.ok("Usuario actualizado exitosamente!");
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        if (!usuarioRepository.existsById(id)) {
            return ResponseEntity.badRequest().body("Usuario no encontrado");
        }
        usuarioRepository.deleteById(id);
        return ResponseEntity.ok("Usuario eliminado exitosamente!");
    }

    // Endpoint REST estándar para eliminar usuario (DELETE /api/usuarios/{id})
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUserStandard(@PathVariable Long id) {
        if (!usuarioRepository.existsById(id)) {
            return ResponseEntity.badRequest().body("Usuario no encontrado");
        }
        usuarioRepository.deleteById(id);
        return ResponseEntity.ok("Usuario eliminado exitosamente!");
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

    /**
     * Endpoint para cambiar la contraseña del usuario actual
     * POST /api/usuarios/change-password
     * Body: { "idUsuario": 1, "oldPassword": "xxx", "newPassword": "yyy" }
     */
    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(@RequestBody ChangePasswordRequest request) {
        try {
            // Obtener el usuario autenticado
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();

            // Buscar el usuario por correo
            Usuario usuario = usuarioRepository.findByCorreo(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            // Verificar que el ID coincida (seguridad adicional)
            if (!usuario.getIdUsuario().equals(request.getIdUsuario())) {
                return ResponseEntity.status(403).body("No tienes permiso para cambiar esta contraseña");
            }

            // Verificar que la contraseña antigua sea correcta
            if (!passwordEncoder.matches(request.getOldPassword(), usuario.getContrasena())) {
                return ResponseEntity.status(400).body("La contraseña actual es incorrecta");
            }

            // Validar nueva contraseña
            if (request.getNewPassword() == null || request.getNewPassword().length() < 4) {
                return ResponseEntity.badRequest().body("La nueva contraseña debe tener al menos 4 caracteres");
            }

            // Actualizar la contraseña
            usuario.setContrasena(passwordEncoder.encode(request.getNewPassword()));
            usuarioRepository.save(usuario);

            return ResponseEntity.ok("Contraseña cambiada exitosamente");

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al cambiar la contraseña: " + e.getMessage());
        }
    }

    // DTO interno para el cambio de contraseña
    public static class ChangePasswordRequest {
        private Long idUsuario;
        private String oldPassword;
        private String newPassword;

        public Long getIdUsuario() { return idUsuario; }
        public void setIdUsuario(Long idUsuario) { this.idUsuario = idUsuario; }
        
        public String getOldPassword() { return oldPassword; }
        public void setOldPassword(String oldPassword) { this.oldPassword = oldPassword; }
        
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }

    /**
     * Desactivar un usuario (el usuario actual debe ser administrador)
     * POST /api/usuarios/{id}/desactivar
     * Impide que el usuario inicie sesión pero conserva sus datos
     */
    @PostMapping("/{id}/desactivar")
    public ResponseEntity<?> desactivarUsuario(@PathVariable Long id) {
        try {
            // Obtener el usuario autenticado actual
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            
            Usuario usuarioActual = usuarioRepository.findByCorreo(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            // Desactivar el usuario
            Usuario usuarioDesactivado = usuarioService.desactivarUsuario(id, usuarioActual.getIdUsuario());

            // Respuesta sin incluir contraseña
            UsuarioDesactivacionResponse response = new UsuarioDesactivacionResponse();
            response.setIdUsuario(usuarioDesactivado.getIdUsuario());
            response.setCorreo(usuarioDesactivado.getCorreo());
            response.setNombreCompleto(usuarioDesactivado.getPrimerNombre() + " " + usuarioDesactivado.getPrimerApellido());
            response.setActivo(usuarioDesactivado.isActivo());
            response.setFechaDesactivacion(usuarioDesactivado.getFechaDesactivacion());
            response.setDesactivadoPor(usuarioDesactivado.getDesactivadoPor());

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al desactivar usuario: " + e.getMessage());
        }
    }

    /**
     * Reactivar un usuario desactivado (el usuario actual debe ser administrador)
     * POST /api/usuarios/{id}/activar
     */
    @PostMapping("/{id}/activar")
    public ResponseEntity<?> activarUsuario(@PathVariable Long id) {
        try {
            // Reactivar el usuario
            Usuario usuarioActivado = usuarioService.activarUsuario(id);

            // Respuesta sin incluir contraseña
            UsuarioDesactivacionResponse response = new UsuarioDesactivacionResponse();
            response.setIdUsuario(usuarioActivado.getIdUsuario());
            response.setCorreo(usuarioActivado.getCorreo());
            response.setNombreCompleto(usuarioActivado.getPrimerNombre() + " " + usuarioActivado.getPrimerApellido());
            response.setActivo(usuarioActivado.isActivo());
            response.setFechaDesactivacion(usuarioActivado.getFechaDesactivacion());
            response.setDesactivadoPor(usuarioActivado.getDesactivadoPor());

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al activar usuario: " + e.getMessage());
        }
    }

    /**
     * DTO de respuesta para desactivación/activación de usuarios
     */
    public static class UsuarioDesactivacionResponse {
        private Long idUsuario;
        private String correo;
        private String nombreCompleto;
        private boolean activo;
        private java.time.LocalDateTime fechaDesactivacion;
        private Long desactivadoPor;

        // Getters y setters
        public Long getIdUsuario() { return idUsuario; }
        public void setIdUsuario(Long idUsuario) { this.idUsuario = idUsuario; }

        public String getCorreo() { return correo; }
        public void setCorreo(String correo) { this.correo = correo; }

        public String getNombreCompleto() { return nombreCompleto; }
        public void setNombreCompleto(String nombreCompleto) { this.nombreCompleto = nombreCompleto; }

        public boolean isActivo() { return activo; }
        public void setActivo(boolean activo) { this.activo = activo; }

        public java.time.LocalDateTime getFechaDesactivacion() { return fechaDesactivacion; }
        public void setFechaDesactivacion(java.time.LocalDateTime fechaDesactivacion) { this.fechaDesactivacion = fechaDesactivacion; }

        public Long getDesactivadoPor() { return desactivadoPor; }
        public void setDesactivadoPor(Long desactivadoPor) { this.desactivadoPor = desactivadoPor; }
    }
}
