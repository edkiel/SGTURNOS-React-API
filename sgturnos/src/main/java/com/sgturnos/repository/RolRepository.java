package com.sgturnos.repository;

import com.sgturnos.model.Rol;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RolRepository extends JpaRepository<Rol, String> {
}