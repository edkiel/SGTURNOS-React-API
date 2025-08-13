package com.sgturnos.repository;

import com.sgturnos.model.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RolRepository extends JpaRepository<Rol, Long> {
    
    // Este método es necesario para buscar un Rol por su nombre.
    // El compilador generaba un error porque faltaba esta declaración.
    @org.springframework.data.jpa.repository.Query("SELECT r FROM Rol r WHERE r.rol = :rol")
    Optional<Rol> buscarPorNombre(@org.springframework.data.repository.query.Param("rol") String rol);
}
