package com.sgturnos.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class LoginController {
    
     @GetMapping("/")
    public String redirigirInicio() {
        return "redirect:/login";
    }

    @GetMapping("/login")
    public String mostrarLogin(@RequestParam(value = "error", required = false) String error,
                                         @RequestParam(value = "logout", required = false) String logout,
                                         @RequestParam(value = "sin_permiso", required = false) String sinPermiso,
                                         Model model) {

        if (error != null) {
            model.addAttribute("mensaje", "Usuario o contraseña incorrectos.");
        }

        if (logout != null) {
            model.addAttribute("mensaje", "Has cerrado sesión correctamente.");
        }

        if (sinPermiso != null) {
            model.addAttribute("mensaje", "No tienes permiso para acceder a esa sección.");
        }

        return "comunes/login"; // Carga login.html desde templates
        }
    
    
    @GetMapping("/error_rol")
    public String errorRol() {
        return "comunes/error_rol";
    }
}