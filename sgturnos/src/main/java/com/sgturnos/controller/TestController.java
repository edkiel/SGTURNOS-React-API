package com.sgturnos.controller;

import com.sgturnos.model.Usuario;
import com.sgturnos.repository.UsuarioRepository;
import java.util.List;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/test")
public class TestController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public TestController(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
@GetMapping("/verificar-contrasenas")
public String verificarContrasenas() {
    List<Usuario> usuarios = usuarioRepository.findAll();
    StringBuilder resultado = new StringBuilder();

    for (Usuario usuario : usuarios) {
        String textoPlano = generarContrasenaTextoPlano(usuario);
        boolean coincide = passwordEncoder.matches(textoPlano, usuario.getContrasena());

        resultado.append("Usuario ID: ").append(usuario.getIdUsuario())
                 .append(" | Contraseña generada: ").append(textoPlano)
                 .append(" | Coincide: ").append(coincide ? "✅" : "❌")
                 .append("<br>");
    }

    return resultado.toString();
}

private String generarContrasenaTextoPlano(Usuario usuario) {
    String apellido = usuario.getPrimerApellido() != null ? usuario.getPrimerApellido().toLowerCase() : "";
    String idStr = usuario.getIdUsuario() != null ? String.valueOf(usuario.getIdUsuario()) : "";
    String ultimos4 = idStr.length() >= 4 ? idStr.substring(idStr.length() - 4) : idStr;
    return apellido + ultimos4;
}
}