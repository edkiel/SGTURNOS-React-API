package com.sgturnos.service;

import com.sgturnos.model.Turno;
import com.sgturnos.model.Usuario;

import java.util.List;

public interface TurnoService {
    List<Turno> listarTodos();
    Turno guardar(Turno turno);
    List<Turno> obtenerTurnosPorUsuario(Usuario usuario);
}