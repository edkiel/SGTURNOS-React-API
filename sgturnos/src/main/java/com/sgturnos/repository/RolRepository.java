package com.sgturnos.repository;

import com.sgturnos.model.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RolRepository extends JpaRepository<Rol, String> {
    
    Optional<Rol> findByRol(String rol);
}