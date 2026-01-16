package com.sgturnos.controller;

import com.sgturnos.dto.RegistroRequest;
import com.sgturnos.model.Usuario;
import com.sgturnos.model.Rol;
import com.sgturnos.repository.UsuarioRepository;
import com.sgturnos.repository.RolRepository;
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

    public UserController(UsuarioRepository usuarioRepository, RolRepository rolRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
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
}
