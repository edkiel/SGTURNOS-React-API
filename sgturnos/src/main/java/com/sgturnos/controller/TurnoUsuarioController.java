package com.sgturnos.controller;

import com.sgturnos.model.Turno;
import com.sgturnos.model.Usuario;
import com.sgturnos.service.TurnoService;
import com.sgturnos.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Controller
@RequestMapping("/malla")
@PreAuthorize("hasRole('USER')")
public class TurnoUsuarioController {

    @Autowired
    private TurnoService turnoService;

    @Autowired
    private UsuarioService usuarioService;

    @GetMapping
    public String verMallaUsuario(Model model, Authentication auth) {
        String correo = auth.getName();
        Usuario usuario = usuarioService.findByCorreo(correo);
        List<Turno> turnosUsuario = turnoService.obtenerTurnosPorUsuario(usuario);
        model.addAttribute("turnos", turnosUsuario);
        return "usuario/malla_turnos";
    }
}