package com.sgturnos.controller;

import com.sgturnos.model.Turno;
import com.sgturnos.service.TurnoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/turnos")
@PreAuthorize("hasRole('ADMIN')")
public class TurnoAdminController {

    @Autowired
    private TurnoService turnoService;

    @GetMapping
    public String mostrarFormularioPlanificacion(Model model) {
        model.addAttribute("turno", new Turno());
        model.addAttribute("listaTurnos", turnoService.listarTodos());
        return "admin/planificar_turnos";
    }

    @PostMapping("/guardar")
    public String guardarTurno(@ModelAttribute Turno turno) {
        turnoService.guardar(turno);
        return "redirect:/turnos";
    }
}