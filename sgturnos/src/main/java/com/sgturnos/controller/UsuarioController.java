package com.sgturnos.controller;

import com.sgturnos.model.Usuario;
import com.sgturnos.repository.RolRepository;
import com.sgturnos.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/usuarios")
public class UsuarioController {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService, BCryptPasswordEncoder passwordEncoder) {
        this.usuarioService = usuarioService;
        this.passwordEncoder = passwordEncoder;
    }

    @Autowired
private RolRepository rolRepository; // <-- Asegúrate de tenerlo creado

@GetMapping("/nuevo")
public String showForm(Model model) {
    model.addAttribute("usuario", new Usuario());
    model.addAttribute("roles", rolRepository.findAll()); // Enviamos lista real de objetos Rol
    return "admin/form";
}

    @GetMapping
    public String listUsuarios(Model model) {
        model.addAttribute("usuarios", usuarioService.findAll());
        return "admin/lista";
    }

    
    @PostMapping
    public String saveUsuario(@ModelAttribute Usuario usuario,
                              @RequestParam(value = "terminos", required = false) String terminos,
                              RedirectAttributes redirectAttributes) {

        // Validar términos y condiciones solo para nuevos usuarios
        if (usuario.getIdUsuario() == null) {
            if (terminos == null || !terminos.equals("aceptado")) {
                redirectAttributes.addFlashAttribute("error", "Debe aceptar los términos y condiciones");
                return "redirect:/usuarios/nuevo";
            }
        }

        // Encriptar la contraseña solo si no está en formato BCrypt
        if (usuario.getIdUsuario() != null) {
            Usuario usuarioExistente = usuarioService.findById(usuario.getIdUsuario());
            if (usuarioExistente != null) {
                if (!usuario.getContrasena().equals(usuarioExistente.getContrasena())) {
                    if (!esBCrypt(usuario.getContrasena())) {
                        usuario.setContrasena(passwordEncoder.encode(usuario.getContrasena()));
                    }
                } else {
                    usuario.setContrasena(usuarioExistente.getContrasena());
                }
            }
        } else {
            if (!esBCrypt(usuario.getContrasena())) {
                usuario.setContrasena(passwordEncoder.encode(usuario.getContrasena()));
            }
        }

        // Guardar el usuario
        usuarioService.save(usuario);
        redirectAttributes.addFlashAttribute("success", "Usuario guardado exitosamente");
        return "redirect:/usuarios";
    }

    private boolean esBCrypt(String contrasena) {
        return contrasena != null && contrasena.startsWith("$2a$");
    }
    
    @GetMapping("/editar/{id}")
public String editarUsuario(@PathVariable("id") Long id, Model model) {
    Usuario usuario = usuarioService.findById(id);
    if (usuario == null) {
        return "redirect:/usuarios"; // o puedes manejar error con mensaje
    }

    model.addAttribute("usuario", usuario);
    model.addAttribute("roles", rolRepository.findAll());
    return "admin/form"; // reutiliza el formulario
}
}
