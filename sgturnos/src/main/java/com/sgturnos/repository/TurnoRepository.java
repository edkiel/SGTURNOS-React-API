package com.sgturnos.repository;

import com.sgturnos.model.Turno;
import com.sgturnos.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TurnoRepository extends JpaRepository<Turno, Long> {
    List<Turno> findByUsuario(Usuario usuario);
}