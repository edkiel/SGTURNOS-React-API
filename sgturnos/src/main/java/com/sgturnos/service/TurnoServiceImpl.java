package com.sgturnos.service;

import com.sgturnos.model.Turno;
import com.sgturnos.model.Usuario;
import com.sgturnos.repository.TurnoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TurnoServiceImpl implements TurnoService {

    @Autowired
    private TurnoRepository turnoRepository;

    @Override
    public List<Turno> listarTodos() {
        return turnoRepository.findAll();
    }

    @Override
    public Turno guardar(Turno turno) {
        return turnoRepository.save(turno);
    }

    @Override
    public List<Turno> obtenerTurnosPorUsuario(Usuario usuario) {
        return turnoRepository.findByUsuario(usuario);
    }
}